// Centralized, safe Electron IPC access
// Works in both Electron (nodeIntegration) and plain browser (vite dev)

export const isElectron = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const w = window as any;
    // electronAPI via preload contextBridge
    if (w.electronAPI?.invoke) return true;
    // fallback: nodeIntegration true -> window.require('electron') exists
    if (typeof w.require === 'function') {
      try { w.require('electron'); return true; } catch { return false; }
    }
    return false;
  } catch { return false; }
};

export const getElectronAPI = (): any | undefined => {
  try { return (window as any).electronAPI; } catch { return undefined; }
};

export const getIpcRenderer = (): any | undefined => {
  try {
    const api = getElectronAPI();
    if (api) return null; // use electronAPI.invoke instead when contextIsolated
    const w = window as any;
    if (typeof w.require === 'function') return w.require('electron').ipcRenderer;
    return undefined;
  } catch { return undefined; }
};

export const electronInvoke = async (channel: string, data?: unknown): Promise<any> => {
  try {
    const api = getElectronAPI();
    if (api?.invoke) return await api.invoke(channel, data);
    const ipc = getIpcRenderer();
    if (ipc?.invoke) return await ipc.invoke(channel, data);
    return null;
  } catch { return null; }
};

export const electronSend = (channel: string, data?: unknown): void => {
  try {
    const api = getElectronAPI();
    if (api?.send) { api.send(channel, data); return; }
    const ipc = getIpcRenderer();
    if (ipc?.send) ipc.send(channel, data);
  } catch { /* best-effort */ }
};

export const electronOn = (channel: string, fn: (...args: any[]) => void): (() => void) | void => {
  try {
    const api = getElectronAPI();
    if (api?.on) { api.on(channel, fn); return; }
    const ipc = getIpcRenderer();
    if (ipc?.on) ipc.on(channel, fn);
  } catch { /* ignore */ }
};
