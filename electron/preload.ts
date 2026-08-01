import { contextBridge, ipcRenderer } from 'electron'

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    on: (channel: string, func: any) => ipcRenderer.on(channel, (_event: any, ...args) => func(...args)),
    invoke: (channel: string, data: any) => ipcRenderer.invoke(channel, data)
  })
} else {
  (window as any).ipcRenderer = ipcRenderer;
  (window as any).electronAPI = {
    send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    on: (channel: string, func: any) => ipcRenderer.on(channel, (_event: any, ...args) => func(...args)),
    invoke: (channel: string, data: any) => ipcRenderer.invoke(channel, data)
  }
}

// EXTREME PROTECTION FOR ALL FRAMES (INCLUDING IFRAMES)
const protectFrame = () => {
  // 1. Inject CSS for no-selection and no-drag
  const style = document.createElement('style');
  style.innerHTML = `
    * {
      -webkit-user-select: none !important;
      user-select: none !important;
      -webkit-user-drag: none !important;
      outline: none !important;
    }
    ::selection {
      background: transparent !important;
      color: inherit !important;
    }
    ::-moz-selection {
      background: transparent !important;
      color: inherit !important;
    }
  `;
  document.documentElement.appendChild(style);

  // 2. Disable Context Menu
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
  }, true);

  // 3. Disable Dragging for all elements
  window.addEventListener('dragstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
  }, true);

  // 4. Disable Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F11' || e.key === 'F12' || 
       (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
       (e.ctrlKey && e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // 5. Observer to catch dynamic elements (like "Next Episode" buttons)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          node.setAttribute('draggable', 'false');
          node.style.webkitUserSelect = 'none';
          node.style.userSelect = 'none';
          (node.style as any).webkitUserDrag = 'none';
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Apply to existing
  document.querySelectorAll('*').forEach(el => {
    if (el instanceof HTMLElement) {
      el.setAttribute('draggable', 'false');
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', protectFrame);
} else {
  protectFrame();
}
