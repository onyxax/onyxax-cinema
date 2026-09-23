import { app, BrowserWindow, ipcMain, shell, session } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { exec } from 'node:child_process'
import DiscordRPC from 'discord-rpc'
import https from 'node:https'
import { createHash, createCipheriv, randomBytes } from 'node:crypto'

// Suppress SSL/Certificate errors from embedded video players
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('ignore-ssl-errors');

app.on('certificate-error', (event, _webContents, _url, _error, _certificate, callback) => {
  event.preventDefault();
  callback(true);
});

app.whenReady().then(createWindow);

// Initialize Discord RPC
const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
DiscordRPC.register(clientId);
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
let isRpcReady = false;
const startTimestamp = new Date();

// discord-rpc ships typings without `request`; keep a typed escape hatch
const rpcRequest = (method: string, args: any) => (rpc as any).request(method, args);

rpc.on('ready', () => {
  isRpcReady = true;
  updateInitialActivity();
});

// Handle errors and disconnections gracefully
rpc.on('error', (err) => {
  console.error('Discord RPC Error:', err);
  isRpcReady = false;
});

rpc.on('disconnected', () => {
  isRpcReady = false;
  setTimeout(loginRPC, 5000); // Try to reconnect after 5 seconds
});

function updateInitialActivity() {
  if (!isRpcReady) return;
  rpcRequest('SET_ACTIVITY', {
    pid: process.pid,
    activity: {
      type: 3,
      details: 'Onyxax Cinema',
      state: 'Browsing Home • Discover',
      assets: {
        large_image: 'onyxaxcinema',
        large_text: 'Onyxax Cinema • Movies • Series • Anime',
        small_image: 'onyxaxcinema',
        small_text: 'Onyxax Cinema',
      },
      timestamps: {
        start: Math.floor(startTimestamp.getTime() / 1000),
      },
      buttons: [
        { label: 'Download The App', url: 'https://github.com/onyxax/onyxax-cinema/releases/latest' }
      ],
      instance: false,
    }
  }).catch(() => { isRpcReady = false; });
}

function loginRPC() {
  rpc.login({ clientId }).catch(err => {
    console.error('Discord RPC Login Failed:', err.message);
    isRpcReady = false;
    // Retry login after 10 seconds if it fails initially
    setTimeout(loginRPC, 10000);
  });
}

loginRPC();

ipcMain.handle('OPEN_EXTERNAL', async (_event, url: string) => {
  await shell.openExternal(url);
});

ipcMain.handle('CHECK_FOR_UPDATES', async () => {
  try {
    const currentVersion = app.getVersion();
    const parts = currentVersion.split('.');
    // Try to find the next patch version
    const nextPatch = parseInt(parts[2]) + 1;
    const nextVersion = `${parts[0]}.${parts[1]}.${nextPatch}`;

    const repo = import.meta.env.VITE_UPDATE_GITHUB_REPO;
    if (!repo) return { updateAvailable: false };

    const baseUrl = `https://github.com/${repo}/releases/download/OnyxaxCinemaSetup${nextVersion}`;
    const stableUrl = `${baseUrl}/OnyxaxCinemaSetup${nextVersion}.exe`;
    const betaUrl = `${baseUrl}/OnyxaxCinemaSetup${nextVersion}-Beta.exe`;

    // Check Stable first
    const stableRes = await fetch(stableUrl, { method: 'HEAD' });
    if (stableRes.ok) {
      return { updateAvailable: true, version: nextVersion, url: stableUrl, isBeta: false };
    }

    // Then check Beta
    const betaRes = await fetch(betaUrl, { method: 'HEAD' });
    if (betaRes.ok) {
      return { updateAvailable: true, version: `${nextVersion}-Beta`, url: betaUrl, isBeta: true };
    }

    return { updateAvailable: false };
  } catch {
    return { updateAvailable: false };
  }
});

ipcMain.handle('START_UPDATE', async (event, url: string) => {
  return new Promise((resolve, reject) => {
    try {
      const tempPath = path.join(app.getPath('temp'), 'OnyxaxUpdate.exe');
      const file = fs.createWriteStream(tempPath);

      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect (e.g. from GitHub)
          https.get(response.headers.location!, (res) => {
            handleDownload(res);
          });
        } else {
          handleDownload(response);
        }
      }).on('error', (err) => {
        fs.unlinkSync(tempPath);
        reject(err);
      });

      function handleDownload(res: any) {
        const totalLength = parseInt(res.headers['content-length'], 10);
        let downloadedLength = 0;

        res.on('data', (chunk: any) => {
          downloadedLength += chunk.length;
          const progress = Math.round((downloadedLength / totalLength) * 100);
          event.sender.send('UPDATE_PROGRESS', progress);
        });

        res.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve({ success: true, path: tempPath });
        });

        file.on('error', (err) => {
          fs.unlinkSync(tempPath);
          reject(err);
        });
      }
    } catch (error: any) {
      console.error('Update failed:', error);
      resolve({ success: false, error: error.message });
    }
  });
});

ipcMain.handle('INSTALL_UPDATE', (_event, { path, mode }: { path: string, mode: 'silent' | 'manual' }) => {
  if (mode === 'silent') {
    exec(`"${path}" /S`);
  } else {
    exec(`"${path}"`);
  }
  setTimeout(() => app.quit(), 1500);
  return { success: true };
});

// ============================================================
// SECURE PLAYER URL GENERATION (Main Process Only)
// The real URL never appears in renderer source code.
// Uses multi-layer obfuscation: split segments + runtime XOR.
// ============================================================
const _S = [
  Buffer.from('aHR0cHM6Ly9j', 'base64').toString(),     // https://c
  Buffer.from('aW5lcGxheS51', 'base64').toString(),      // ineplay.u
  Buffer.from('cC5yYWlsd2F5', 'base64').toString(),      // p.railway
  Buffer.from('LmFwcA==', 'base64').toString(),           // .app
];
const _V = [
  Buffer.from('aHR0cHM6Ly9w', 'base64').toString(),      // https://p
  Buffer.from('bGF5ZXIudmlk', 'base64').toString(),      // layer.vid
  Buffer.from('ZWFzeS5uZXQ=', 'base64').toString(),      // easy.net
];

function _resolveBase(server: 'cineplay' | 'videasy'): string {
  return server === 'cineplay' ? _S.join('') : _V.join('');
}

// AES-256-CBC encrypt (mirrors the renderer's _dec in Player.tsx)
const _KEY = createHash('sha256').update('Onyxax_Cinema_Secure_Key_2026').digest();

function encrypt(plain: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', _KEY, iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${ct.toString('hex')}`;
}

// Obfuscated IPC channel name (not "GET_PLAYER_URL" to avoid detection)
const _CH = Buffer.from('X19yZXNvbHZlX18=', 'base64').toString(); // __resolve__

ipcMain.handle(_CH, (_event, payload: string) => {
  try {
    // Payload is base64-encoded JSON: { server, type, id, season?, episode? }
    const { server, type, id, season, episode } = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf8')
    );

    const base = _resolveBase(server);

    let url: string;
    if (server === 'cineplay') {
      if (type === 'movie') {
        url = `${base}/movie/${id}`;
      } else {
        url = `${base}/tv/${id}/${season || '1'}/${episode || '1'}`;
      }
    } else {
      const accent = 'd97757';
      const params = `nextEpisode=true&autoplayNextEpisode=true&overlay=true&color=${accent}`;
      if (type === 'movie') {
        url = `${base}/movie/${id}?${params}`;
      } else {
        url = `${base}/tv/${id}/${season || '1'}/${episode || '1'}?${params}`;
      }
    }

    // Return the URL encrypted so the renderer can't log it in plaintext
    return encrypt(url);
  } catch {
    return null;
  }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null = null

ipcMain.on('APP_CLOSE', () => BrowserWindow.getFocusedWindow()?.close());
ipcMain.on('APP_MINIMIZE', () => BrowserWindow.getFocusedWindow()?.minimize());
ipcMain.on('APP_MAXIMIZE', () => {
  const currentWin = BrowserWindow.getFocusedWindow();
  if (currentWin?.isMaximized()) currentWin.unmaximize();
  else currentWin?.maximize();
});

ipcMain.on('UPDATE_RPC', (_event, data) => {
  if (!isRpcReady) return;
  // احترافي: عند الإيقاف نوقف العداد تماماً (لا timestamps)، عند التشغيل نعرض شريط الوقت
  const hasStart = typeof data.startTimestamp === 'number' && !isNaN(data.startTimestamp);
  const hasEnd = typeof data.endTimestamp === 'number' && !isNaN(data.endTimestamp);
  const timestamps = hasStart ? (hasEnd ? { start: data.startTimestamp, end: data.endTimestamp } : { start: data.startTimestamp }) : undefined;
  const activity: any = {
    type: 3,
    details: data.details,
    state: data.state,
    assets: {
      large_image: data.largeImageKey || 'onyxaxcinema',
      large_text: data.largeImageText || 'Onyxax Cinema',
      small_image: data.smallImageKey,
      small_text: data.smallImageText,
    },
    buttons: data.buttons || [
      { label: 'Download The App', url: 'https://github.com/onyxax/onyxax-cinema/releases/latest' }
    ],
    instance: false,
  };
  if (timestamps) activity.timestamps = timestamps;
  rpcRequest('SET_ACTIVITY', {
    pid: process.pid,
    activity,
  }).catch(console.error);
});

ipcMain.on('CLEAR_RPC', () => {
  if (!isRpcReady) return;
  rpc.clearActivity().catch(console.error);
});

ipcMain.handle('CLEAR_CACHE', async () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    // Only clear cache (images/temp files), keep storage (auth/likes)
    await win.webContents.session.clearCache();
    win.reload();
    return true;
  }
  return false;
});

function createWindow() {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 600,
    frame: false,
    backgroundColor: '#000000',
    show: false,
    icon: path.join(process.env.VITE_PUBLIC as string, 'AppIcon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: false,
      devTools: !app.isPackaged, // allow DevTools in dev for debugging
    },
  })

  win.once('ready-to-show', () => {
    win?.show()
    win?.center()
  })

  win.on('enter-full-screen', () => win?.webContents.send('fullscreen-change', true));
  win.on('leave-full-screen', () => win?.webContents.send('fullscreen-change', false));

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = Object.keys(details.responseHeaders || {}).reduce((acc: any, key) => {
      const lowerKey = key.toLowerCase();
      if (!['x-frame-options', 'content-security-policy', 'access-control-allow-origin', 'access-control-allow-headers'].includes(lowerKey)) {
        acc[key] = details.responseHeaders![key];
      }
      return acc;
    }, {});
    responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    responseHeaders['Access-Control-Allow-Headers'] = ['*'];
    callback({ cancel: false, responseHeaders });
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  win.webContents.on('before-input-event', (event, input) => {
    // Block ALL DevTools shortcuts
    if (input.key === 'F11' || input.key === 'F12') {
      event.preventDefault();
    }
    if (input.control && input.shift && ['i', 'I', 'c', 'C', 'j', 'J'].includes(input.key)) {
      event.preventDefault();
    }
    if (input.control && input.key === 'u') {
      event.preventDefault();
    }
  });

  // Global Context Menu Disable (Applies to all frames/iframes)
  win.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  // Hide the URL preview in the status bar when hovering over links
  win.webContents.on('update-target-url', (e) => {
    e.preventDefault();
  });

  // Inject protection CSS into every frame
  win.webContents.on('did-finish-load', () => {
    win?.webContents.insertCSS(`
      * { 
        -webkit-user-select: none !important; 
        user-select: none !important; 
        -webkit-user-drag: none !important; 
      }
      a, button {
        -webkit-user-drag: none !important;
      }
    `);
  });

  win.webContents.on('dom-ready', () => {
    win?.webContents.executeJavaScript(`
      (() => {
        // 4. Disable Shortcuts
        window.addEventListener('keydown', (e) => {
          if (e.key === 'F11' || e.key === 'F12' || 
             (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
             (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            e.stopPropagation();
          }
        }, true);
        window.addEventListener('contextmenu', e => e.preventDefault(), true);
        window.addEventListener('dragstart', e => e.preventDefault(), true);

        if (!window.__onyxax_progress_listener__) {
          window.__onyxax_progress_listener__ = true;
          window.addEventListener('message', function(event) {
            try {
              var trusted = ['https://cineplay.railway.app', 'https://player.videasy.net', window.location.origin];
              if (event.origin && trusted.indexOf(event.origin) === -1 && !trusted.some(function(o){ return event.origin.indexOf(o) === 0; })) {
                // allow if origin is empty (postMessage from same window) or trusted prefix
                if (event.origin !== '' && event.origin !== 'null') return;
              }
              var data = event.data;
              if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch(e) { return; }
              }
              if (!data || typeof data !== 'object') return;
              function parseSec(v) {
                if (v === undefined || v === null || v === '') return null;
                if (typeof v === 'number' && !isNaN(v)) return v;
                var s = String(v).trim();
                if (/^\d+:\d+:\d+$/.test(s)) { var p = s.split(':').map(Number); return p[0]*3600 + p[1]*60 + p[2]; }
                if (/^\d+:\d+$/.test(s)) { var p2 = s.split(':').map(Number); return p2[0]*60 + p2[1]; }
                var n = Number(s);
                return isNaN(n) ? null : n;
              }
              var rawTime = (data.timestamp !== undefined ? data.timestamp : (data.currentTime !== undefined ? data.currentTime : (data.current_time !== undefined ? data.current_time : (data.time !== undefined ? data.time : (data.seconds !== undefined ? data.seconds : data.position)))));
              var rawProgress = (data.progress !== undefined ? data.progress : (data.percent !== undefined ? data.percent : (data.percentage !== undefined ? data.percentage : data.played)));
              var rawDuration = (data.duration !== undefined ? data.duration : (data.totalDuration !== undefined ? data.totalDuration : data.maxDuration));
              var tSec = parseSec(rawTime);
              var pSec = parseSec(rawProgress);
              var dSec = parseSec(rawDuration);
              var hasTime = tSec !== null;
              var hasProgress = pSec !== null;
              if (!hasTime && !hasProgress) return;
              var contentId = data.id ? String(data.id) : null;
              if (!contentId) {
                try {
                  var m = window.location.hash.match(/\/watch\/[^\/]+\/([^\/]+)/) || window.location.pathname.match(/\/watch\/[^\/]+\/([^\/]+)/);
                  if (m) contentId = m[1];
                } catch(e) {}
              }
              if (!contentId) return;
              var progressStore = JSON.parse(localStorage.getItem('onyxax_progress') || '{}');
              var existing = progressStore[contentId] || {};
              var duration = (dSec !== null ? dSec : (Number(existing.duration) || 3600));
              if (isNaN(duration) || duration <= 0) duration = 3600;
              var watched;
              if (hasTime) {
                watched = tSec;
                if (watched > duration * 10) watched = watched / 1000;
              } else {
                var pct = pSec;
                var pctNorm = pct > 1 ? pct / 100 : pct;
                watched = pctNorm * duration;
              }
              progressStore[contentId] = {
                watched: watched,
                duration: duration,
                last_updated: Date.now(),
                season: data.season ? String(data.season) : existing.season,
                episode: data.episode ? String(data.episode) : existing.episode,
              };
              // keep existing meta (title etc) if present
              for (var k in existing) { if (!(k in progressStore[contentId])) progressStore[contentId][k] = existing[k]; }
              localStorage.setItem('onyxax_progress', JSON.stringify(progressStore));
              window.dispatchEvent(new Event('progress_changed'));
            } catch(e) { }
          });
        }
      })();
    `);
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL as string)
  } else {
    win.loadFile(path.join(process.env.DIST as string, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
  win = null
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

