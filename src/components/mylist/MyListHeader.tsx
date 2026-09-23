import React from 'react';
import { Library, Bookmark, Film, Tv, Sparkles, Heart, Clock, Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './MyListHeader.css';

interface Props {
  counts: { all: number; continue: number; movie: number; tv: number; anime: number; likes: number; };
  activeTab: string;
  onTabChange: (tab: any) => void;
  search: string;
  onSearchChange: (v: string) => void;
  sortBy: string;
  onSortChange: (v: any) => void;
}

const MyListHeader: React.FC<Props> = ({ counts, activeTab, onTabChange, search, onSearchChange, sortBy, onSortChange }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'all', label: t('myList.all') !== 'myList.all' ? t('myList.all') : 'All', icon: Library, count: counts.all },
    { id: 'continue', label: t('myList.resumePlayback'), icon: Clock, count: counts.continue },
    { id: 'movie', label: t('myList.savedMovies'), icon: Film, count: counts.movie },
    { id: 'tv', label: t('myList.tvSeries'), icon: Tv, count: counts.tv },
    { id: 'anime', label: t('myList.animeCollection'), icon: Sparkles, count: counts.anime },
    { id: 'likes', label: t('myList.favoritePicks'), icon: Heart, count: counts.likes },
  ] as const;

  return (
    <div className="mylist-header-card">
      <div className="mylist-header-top">
        <div className="mylist-title-group">
          <div className="mylist-icon-wrap">
            <Library size={20} />
          </div>
          <div>
            <h1 className="mylist-title">{t('myList.title')}</h1>
            <p className="mylist-subtitle">{t('myList.subtitle')}</p>
          </div>
        </div>
        <div className="mylist-stats-mini">
          <span className="stat"><strong>{counts.all}</strong> {t('category.titles')}</span>
          <span className="dot">•</span>
          <span className="stat muted"><Bookmark size={12} /> {counts.continue} {t('myList.resumePlayback')}</span>
        </div>
      </div>

      <div className="mylist-controls">
        <div className="mylist-tabs" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`mylist-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="mylist-actions">
          <div className="mylist-search">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder={t('myList.searchPlaceholder') !== 'myList.searchPlaceholder' ? t('myList.searchPlaceholder') : 'Search in your list...'}
              value={search}
              onChange={e => onSearchChange(e.target.value)}
            />
            {search && <button className="clear-btn" onClick={() => onSearchChange('')}>×</button>}
          </div>

          <div className="mylist-sort">
            <SlidersHorizontal size={14} />
            <select value={sortBy} onChange={e => onSortChange(e.target.value)} aria-label="Sort">
              <option value="recent">{t('myList.sortRecent') !== 'myList.sortRecent' ? t('myList.sortRecent') : 'Recent'}</option>
              <option value="rating">{t('myList.sortRating') !== 'myList.sortRating' ? t('myList.sortRating') : 'Rating'}</option>
              <option value="title">{t('myList.sortTitle') !== 'myList.sortTitle' ? t('myList.sortTitle') : 'A-Z'}</option>
              <option value="year">{t('myList.sortYear') !== 'myList.sortYear' ? t('myList.sortYear') : 'Year'}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyListHeader;
