import { useState, useEffect, useCallback } from 'react';
import { getMyList, setMyList, getLikes, setLikes } from '../lib/storage';

export function useMyList() {
  const [myList, setMyListState] = useState<any[]>(() => getMyList());
  const [likes, setLikesState] = useState<any[]>(() => getLikes());

  const refresh = useCallback(() => {
    setMyListState(getMyList());
    setLikesState(getLikes());
  }, []);

  useEffect(() => {
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [refresh]);

  const toggleMyList = useCallback((item: any) => {
    const current = getMyList();
    const exists = current.some((m: any) => String(m.id) === String(item.id));
    const next = exists ? current.filter((m: any) => String(m.id) !== String(item.id)) : [...current, item];
    setMyList(next);
    setMyListState(next);
    return !exists;
  }, []);

  const toggleLike = useCallback((item: any) => {
    const current = getLikes();
    const exists = current.some((m: any) => String(m.id) === String(item.id));
    const next = exists ? current.filter((m: any) => String(m.id) !== String(item.id)) : [...current, item];
    setLikes(next);
    setLikesState(next);
    return !exists;
  }, []);

  return {
    myList, likes,
    isInMyList: (id: string | number) => myList.some((m: any) => String(m.id) === String(id)),
    isLiked: (id: string | number) => likes.some((m: any) => String(m.id) === String(id)),
    toggleMyList, toggleLike, refresh
  };
}
