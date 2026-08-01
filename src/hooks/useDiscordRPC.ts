import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface RPCOptions {
  details: string;
  state?: string;
  largeImageKey?: string;
  largeImageText?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  buttons?: { label: string, url: string }[];
}

const useDiscordRPC = (options: RPCOptions, deps: any[] = []) => {
  const { isRPCEnabled } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending update to prevent rapid toggle flickering
    if (timerRef.current) clearTimeout(timerRef.current);

    // Small delay (debounce) to ensure we don't spam Discord/Electron IPC
    timerRef.current = setTimeout(() => {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        
        if (isRPCEnabled) {
          ipcRenderer.send('UPDATE_RPC', {
            details: options.details,
            state: options.state,
            largeImageKey: options.largeImageKey || 'onyxaxcinema',
            largeImageText: options.largeImageText || 'Onyxax Cinema',
            startTimestamp: options.startTimestamp,
            endTimestamp: options.endTimestamp,
            buttons: options.buttons,
          });
        } else {
          ipcRenderer.send('CLEAR_RPC');
        }
      } catch {
        /* Discord RPC is best-effort; ignore failures */
      }
    }, 150); // 150ms debounce for ultra-smooth responsiveness

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRPCEnabled, ...deps]);
};

export default useDiscordRPC;
