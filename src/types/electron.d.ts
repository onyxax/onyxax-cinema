/// <reference types="node" />

interface ElectronAPI {
  send: (channel: string, data?: unknown) => void;
  on: (channel: string, func: (...args: any[]) => void) => void;
  off: (channel: string, func: (...args: any[]) => void) => void;
  invoke: (channel: string, data?: unknown) => Promise<any>;
}

interface Window {
  electronAPI?: ElectronAPI;
  require?: NodeRequire;
}
