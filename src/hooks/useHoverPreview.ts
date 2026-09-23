import { useCallback, useEffect, useRef, useState } from 'react';
import type { TMDBMovie } from '../types/tmdb';

interface HoverState {
  item: TMDBMovie;
  rect: DOMRect;
  type: 'movie' | 'tv' | 'anime';
}

/**
 * Centralizes hover-preview lifecycle that was previously scattered
 * between CategoryPage (hoverTimerRef, scrollingRef) and MovieCard.
 * - 500ms enter delay (premium feel, avoids flicker)
 * - suppresses while scrolling (CategoryPage had 600ms window)
 * - cancels on leave
 * - exposes anchor rect for portal positioning
 */
export function useHoverPreview(delayMs = 480) {
  const [active, setActive] = useState<HoverState | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollingRef = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onScroll = useCallback(() => {
    scrollingRef.current = true;
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setActive(null);
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => { scrollingRef.current = false; }, 450);
  }, []);

  useEffect(() => {
    window.addEventListener('wheel', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', onScroll);
      window.removeEventListener('touchmove', onScroll);
      window.removeEventListener('scroll', onScroll);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [onScroll]);

  const handleEnter = useCallback((item: TMDBMovie, type: 'movie'|'tv'|'anime', rect: DOMRect) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (scrollingRef.current) return;
    // don't show on touch/coarse pointer
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
    hoverTimer.current = setTimeout(() => {
      setActive({ item, rect, type });
    }, delayMs);
  }, [delayMs]);

  const handleLeave = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    // small grace to allow moving into the preview itself
    setTimeout(() => {
      // if preview itself is hovered, it will cancel via onCancelClose
      // we keep active for now; the preview component owns its close timer
    }, 80);
  }, []);

  const clear = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setActive(null);
  }, []);

  // expose a direct setter for the preview to keep itself open
  const keepAlive = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  return { active, handleEnter, handleLeave, clear, keepAlive, onScroll };
}
