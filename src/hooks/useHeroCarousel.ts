/* eslint-disable react-hooks/set-state-in-effect -- bounded index sync is intentional */
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Deep module for carousel behavior.
 * Encapsulates autoplay, pause, keyboard, and touch so the UI stays shallow
 * and purely presentational.
 */
export interface UseHeroCarouselOptions {
  length: number;
  autoPlayMs?: number;
  enabled?: boolean;
}

export interface UseHeroCarouselReturn {
  index: number;
  isPaused: boolean;
  setPaused: (v: boolean) => void;
  go: (dir: number) => void;
  goTo: (i: number) => void;
  next: () => void;
  prev: () => void;
  bind: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

export function useHeroCarousel({
  length,
  autoPlayMs = 5200,
  enabled = true,
}: UseHeroCarouselOptions): UseHeroCarouselReturn {
  const [index, setIndex] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStart = useRef<number | null>(null);

  // Keep index in bounds when length changes (e.g. data reload)
  useEffect(() => {
    if (length === 0) setIndex(0);
    else setIndex((i) => (i >= length ? 0 : i));
  }, [length]);

  const go = useCallback(
    (dir: number) => {
      if (length === 0) return;
      setIndex((i) => (i + dir + length) % length);
    },
    [length]
  );

  const goTo = useCallback(
    (i: number) => {
      if (length === 0) return;
      const clamped = ((i % length) + length) % length;
      setIndex(clamped);
    },
    [length]
  );

  const next = useCallback(() => go(1), [go]);
  const prev = useCallback(() => go(-1), [go]);

  // Autoplay — respects pause and single-item
  useEffect(() => {
    if (!enabled || length <= 1 || isPaused) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % length), autoPlayMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [length, isPaused, autoPlayMs, enabled]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    []
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    },
    [prev, next]
  );

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStart.current;
      if (Math.abs(dx) > 42) go(dx > 0 ? -1 : 1);
      touchStart.current = null;
    },
    [go]
  );

  return {
    index,
    isPaused,
    setPaused,
    go,
    goTo,
    next,
    prev,
    bind: {
      onMouseEnter: () => setPaused(true),
      onMouseLeave: () => setPaused(false),
      onFocus: () => setPaused(true),
      onBlur: () => setPaused(false),
      onKeyDown,
      onTouchStart,
      onTouchEnd,
    },
  };
}
