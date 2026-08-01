import React, { useState, useEffect, useCallback } from 'react';
import { Bookmark, Heart, Clock, Film, Tv, Sparkles, Library } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import type { WatchProgress, TMDBMovie } from '../types/tmdb';
import { useTranslation } from 'react-i18next';
import { fetchDetails } from '../services/tmdb';
import useDiscordRPC from '../hooks/useDiscordRPC';
import './MyList.css';

const MyList: React.FC = () => {
  const { t, i18n } = useTranslation();
  useDiscordRPC({ details: 'Exploring OnyxaxCinema', state: 'My List' }, []);
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [tvShows, setTvShows] = useState<TMDBMovie[]>([]);
  const [anime, setAnime] = useState<TMDBMovie[]>([]);
  const [likes, setLikes] = useState<TMDBMovie[]>([]);

  const localizeItems = useCallback(async (items: any[]): Promise<any[]> => {
    if (!items.length) return items;
    return Promise.all(
      items.map(async (item) => {
        try {
          const details = await fetchDetails(String(item.id), item.type || 'movie');
          const localizedTitle = details?.title || details?.name || item.title || item.name;
          return { ...item, title: localizedTitle || item.title, name: localizedTitle || item.name };
        } catch {
          return item;
        }
      })
    );
  }, [i18n.language]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const progress = JSON.parse(localStorage.getItem('onyxax_progress') || '{}');
        const rawProgress = (Object.values(progress) as WatchProgress[])
          .filter((item: any) => item && (item.title || item.name) && item.poster_path)
          .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0))
          .slice(0, 15);
        const localizedProgress = await localizeItems(rawProgress);
        setContinueWatching(localizedProgress as WatchProgress[]);

        const savedItems = JSON.parse(localStorage.getItem('onyxax_mylist') || '[]');
        const rawMovies = savedItems.filter((m: any) => m.type === 'movie' || !m.type);
        const rawTv = savedItems.filter((m: any) => m.type === 'tv');
        const rawAnime = savedItems.filter((m: any) => m.type === 'anime');

        const [localMovies, localTv, localAnime] = await Promise.all([
          localizeItems(rawMovies),
          localizeItems(rawTv),
          localizeItems(rawAnime),
        ]);
        setMovies(localMovies as TMDBMovie[]);
        setTvShows(localTv as TMDBMovie[]);
        setAnime(localAnime as TMDBMovie[]);

        const likedItems = JSON.parse(localStorage.getItem('onyxax_likes') || '[]');
        const localLikes = await localizeItems(likedItems);
        setLikes(localLikes as TMDBMovie[]);
      } catch (e) {
        console.error('Error loading list data', e);
      }
    };

    loadData();
    window.addEventListener('progress_changed', loadData);
    return () => window.removeEventListener('progress_changed', loadData);
  }, [i18n.language, localizeItems]);

  const hasContent = continueWatching.length > 0 || movies.length > 0 || tvShows.length > 0 || anime.length > 0 || likes.length > 0;

  return (
    <div className="category-page mylist-page">
      <div className="category-header mylist-header">
        <h1><Library size={22} /> {t('myList.title')}</h1>
      </div>

      {!hasContent ? (
        <div className="mylist-empty">
          <div className="mylist-empty-icon"><Bookmark size={36} /></div>
          <h2>{t('myList.emptyTitle')}</h2>
          <p>{t('myList.emptySubtitle')}</p>
          <button className="mylist-explore-btn" onClick={() => window.location.href = '/'}>
            {t('myList.explore')}
          </button>
        </div>
      ) : (
        <div className="mylist-sections">
          {continueWatching.length > 0 && (
            <section className="mylist-panel">
              <div className="mylist-panel-header">
                <Clock size={16} />
                <span>{t('myList.resumePlayback')}</span>
                <span className="mylist-panel-count">{continueWatching.length}</span>
              </div>
              <div className="mylist-grid-wide">
                {continueWatching.map((item, i) => (
                  <MovieCard
                    key={item.id}
                    item={item}
                    type={item.type || 'movie'}
                    isWide={true}
                    progress={{ watched: item.watched, duration: item.duration }}
                    isContinueWatching={true}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )}

          {movies.length > 0 && (
            <section className="mylist-panel">
              <div className="mylist-panel-header">
                <Film size={16} />
                <span>{t('myList.savedMovies')}</span>
                <span className="mylist-panel-count">{movies.length}</span>
              </div>
              <div className="mylist-grid">
                {movies.map((item, i) => (
                  <MovieCard key={item.id} item={item} type="movie" index={i} />
                ))}
              </div>
            </section>
          )}

          <div className="mylist-panel-row">
            {tvShows.length > 0 && (
              <section className="mylist-panel mylist-panel-half">
                <div className="mylist-panel-header">
                  <Tv size={16} />
                  <span>{t('myList.tvSeries')}</span>
                  <span className="mylist-panel-count">{tvShows.length}</span>
                </div>
                <div className="mylist-grid">
                  {tvShows.map((item, i) => (
                    <MovieCard key={item.id} item={item} type="tv" index={i} />
                  ))}
                </div>
              </section>
            )}

            {anime.length > 0 && (
              <section className="mylist-panel mylist-panel-half">
                <div className="mylist-panel-header">
                  <Sparkles size={16} />
                  <span>{t('myList.animeCollection')}</span>
                  <span className="mylist-panel-count">{anime.length}</span>
                </div>
                <div className="mylist-grid">
                  {anime.map((item, i) => (
                    <MovieCard key={item.id} item={item} type="anime" index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {likes.length > 0 && (
            <section className="mylist-panel">
              <div className="mylist-panel-header">
                <Heart size={16} />
                <span>{t('myList.favoritePicks')}</span>
                <span className="mylist-panel-count">{likes.length}</span>
              </div>
              <div className="mylist-grid">
                {likes.map((item, i) => (
                  <MovieCard key={item.id} item={item} type={item.type || 'movie'} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default MyList;
