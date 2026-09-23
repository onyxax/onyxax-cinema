import { useState, useEffect, useCallback } from 'react';
import { getPinned, setPinned, StorageEvents } from '../lib/storage';
import { PIN_LIMIT } from '../lib/constants';

export function usePinned() {
  const [pinned, setPinnedState] = useState<any[]>(() => getPinned());

  const refresh = useCallback(() => setPinnedState(getPinned()), []);

  useEffect(() => {
    window.addEventListener(StorageEvents.pinnedChanged, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(StorageEvents.pinnedChanged, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const toggle = useCallback((item: any) => {
    const current = getPinned();
    const exists = current.some((p: any) => String(p.id) === String(item.id));
    let next: any[];
    if (exists) {
      next = current.filter((p: any) => String(p.id) !== String(item.id));
    } else {
      if (current.length >= PIN_LIMIT) return { ok: false, reason: 'limit' as const };
      next = [...current, item];
    }
    setPinned(next);
    return { ok: true };
  }, []);

  const isPinned = useCallback((id: string | number) => pinned.some((p: any) => String(p.id) === String(id)), [pinned]);

  return { pinned, toggle, isPinned, refresh, count: pinned.length };
}
