import React from 'react';
import { useMyListData } from '../hooks/useMyListData';
import MovieCard from '../components/MovieCard';
import MyListSection from '../components/mylist/MyListSection';
import MyListHero from '../components/mylist/MyListHero';
import { Library, Clock, Film, Tv, Sparkles, Heart, Search, Bookmark, Trash2 } from 'lucide-react';
import Dropdown from '../components/ui/Dropdown';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useDiscordRPC from '../hooks/useDiscordRPC';
import './MyList.css';

const MyListRadical: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, filtered, counts, hasAny, isLoading, activeTab, setActiveTab, search, setSearch, sortBy, setSortBy } = useMyListData();
  useDiscordRPC({
    details: 'Onyxax Cinema',
    state: `My List • ${counts.all} titles • ${counts.continue} watching`,
    largeImageKey: 'onyxaxcinema',
    largeImageText: `My List • ${counts.all} titles • Movies ${counts.movie} • Series ${counts.tv} • Anime ${counts.anime}`,
    smallImageKey: 'onyxaxcinema',
    smallImageText: `Onyxax Cinema • Library • ${counts.all} titles`,
    startTimestamp: Math.floor(Date.now() / 1000),
    buttons: [{ label: 'Download App', url: 'https://github.com/onyxax/onyxax-cinema/releases/latest' }],
  }, [counts.all, counts.continue]);

  const heroItems = data.continueWatching.length ? (data.continueWatching as any) : [...data.movies, ...data.tvShows, ...data.anime, ...data.likes] as any;

  const tabs = [
    { id: 'all', label: t('myList.all'), icon: Library, count: counts.all },
    { id: 'continue', label: t('myList.resumePlayback'), icon: Clock, count: counts.continue },
    { id: 'movie', label: t('myList.savedMovies'), icon: Film, count: counts.movie },
    { id: 'tv', label: t('myList.tvSeries'), icon: Tv, count: counts.tv },
    { id: 'anime', label: t('myList.animeCollection'), icon: Sparkles, count: counts.anime },
    { id: 'likes', label: t('myList.favoritePicks'), icon: Heart, count: counts.likes },
  ] as const;

  if (isLoading) {
    return (
      <div className="mylist-radical">
        <div className="mylist-hero-skeleton" />
        <div className="mylist-tabs-skeleton" />
        <div className="mylist-grid-skeleton">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      </div>
    );
  }

  if (!hasAny && !isLoading) {
    return (
      <div className="mylist-radical">
        <div className="mylist-empty-hero">
          <div className="empty-orb">
            <Bookmark size={32} />
          </div>
          <h1>{t('myList.emptyTitle')}</h1>
          <p>{t('myList.emptySubtitle')}</p>
          <div className="empty-actions">
            <button className="btn-primary" onClick={() => navigate('/')}><Library size={16} /> {t('myList.explore')}</button>
            <button className="btn-ghost" onClick={() => navigate('/movies')}><Film size={14} /> {t('dock.movies')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mylist-radical">
      <MyListHero items={heroItems} counts={counts} title={t('myList.title')} subtitle={t('myList.subtitle')} />

      {/* STICKY TABS — احترافي: أسهم + نقاط + سحب + لوحة مفاتيح + انتقال متزامن */}
      <div className="mylist-sticky-bar">
        <div className="mylist-tabs-radical" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`mylist-tab-radical ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="mylist-toolbar">
          <div className="mylist-search-radical">
            <Search size={14} />
            <input placeholder={t('myList.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="clear">×</button>}
          </div>
          <Dropdown
            value={sortBy}
            onChange={v => setSortBy(v as any)}
            options={[
              { value: 'recent', label: t('myList.sortRecent') },
              { value: 'rating', label: t('myList.sortRating') },
              { value: 'title', label: t('myList.sortTitle') },
              { value: 'year', label: t('myList.sortYear') },
            ]}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="mylist-content-radical">
        {(() => {
          const isAllNoSearch = activeTab === 'all' && !search;
          if (isAllNoSearch) {
            return (
              <div className="mylist-sections-radical">
                <MyListSection icon={Clock} title={t('myList.resumePlayback')} count={data.continueWatching.length} items={data.continueWatching} type="movie" isWide variant="continue" />
                <MyListSection icon={Film} title={t('myList.savedMovies')} count={data.movies.length} items={data.movies} type="movie" variant="movie" />
                <div className="mylist-panel-row">
                  <MyListSection icon={Tv} title={t('myList.tvSeries')} count={data.tvShows.length} items={data.tvShows} type="tv" variant="tv" />
                  <MyListSection icon={Sparkles} title={t('myList.animeCollection')} count={data.anime.length} items={data.anime} type="anime" variant="anime" />
                </div>
                <MyListSection icon={Heart} title={t('myList.favoritePicks')} count={data.likes.length} items={data.likes} type="movie" variant="likes" />
              </div>
            );
          }
          if (filtered.length === 0) {
            return (
              <div className="mylist-no-results">
                <p>{t('search.noResults')}</p>
                <button onClick={() => { setSearch(''); setActiveTab('all'); }}>Clear filters</button>
              </div>
            );
          }
          return (
            <div className={activeTab === 'continue' ? 'mylist-grid-wide' : 'mylist-grid'}>
              {filtered.map((item: any, i: number) => {
                const type = item.type || item.media_type || (activeTab === 'movie' ? 'movie' : activeTab === 'tv' ? 'tv' : activeTab === 'anime' ? 'anime' : 'movie');
                return <MovieCard key={`${item.id}-${i}`} item={item} type={type} isWide={activeTab === 'continue'} index={i} />;
              })}
            </div>
          );
        })()}
      </div>

      <div className="mylist-footnote">
        <span><Bookmark size={12} /> {t('myList.personalLibrary')}</span>
        <button className="mylist-clear-all" onClick={() => {
          if (confirm('Clear all lists?')) {
            localStorage.removeItem('onyxax_mylist');
            localStorage.removeItem('onyxax_likes');
            localStorage.removeItem('onyxax_progress');
            window.dispatchEvent(new Event('storage'));
            window.location.reload();
          }
        }}>
          <Trash2 size={12} /> Clear all
        </button>
      </div>
    </div>
  );
};

export default MyListRadical;
