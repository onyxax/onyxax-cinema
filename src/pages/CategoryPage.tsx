import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Film, Tv, Sparkles, SlidersHorizontal, X, Grid3X3, List, Play, Plus, Info } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { fetchMoviesPage, fetchTVShowsPage, fetchAnimePage, searchContentPage } from '../services/tmdb';
import type { TMDBMovie } from '../types/tmdb';
import { useTranslation } from 'react-i18next';
import useDiscordRPC from '../hooks/useDiscordRPC';
import { IMAGE_BASE_URL } from '../services/tmdb';
import './CategoryPage.css';

interface SortTab { key: string; labelKey: string; label?: string }
interface GenrePill { id: number; labelKey: string; label?: string }

const MAX_PAGES = 100;

const SORT_TABS: SortTab[] = [
  { key: 'popularity.desc', labelKey: 'filters.popularity' },
  { key: 'vote_average.desc', labelKey: 'filters.highestRated' },
  { key: 'primary_release_date.desc', labelKey: 'filters.latest' },
  { key: 'original_title.asc', labelKey: 'category.sortAZ' },
];

const GENRE_PILLS_MOVIE: GenrePill[] = [
  { id: 0, labelKey: 'filters.allGenres' },
  { id: 28, labelKey: 'filters.action' },
  { id: 35, labelKey: 'filters.comedy' },
  { id: 18, labelKey: 'filters.drama' },
  { id: 27, labelKey: 'filters.horror' },
  { id: 878, labelKey: 'filters.scienceFiction' },
  { id: 12, labelKey: 'filters.adventure' },
  { id: 10749, labelKey: 'filters.romance' },
  { id: 53, labelKey: 'filters.thriller' },
  { id: 80, labelKey: 'filters.crime' },
  { id: 14, labelKey: 'filters.fantasy' },
  { id: 16, labelKey: 'filters.animation' },
];

const GENRE_PILLS_TV: GenrePill[] = [
  { id: 0, labelKey: 'filters.allGenres' },
  { id: 10759, labelKey: 'filters.action' },
  { id: 35, labelKey: 'filters.comedy' },
  { id: 18, labelKey: 'filters.drama' },
  { id: 10765, labelKey: 'filters.scienceFiction' },
  { id: 80, labelKey: 'filters.crime' },
  { id: 10751, labelKey: 'filters.family' },
  { id: 9648, labelKey: 'filters.mystery' },
];

const CATEGORY_CONFIG = {
  movie: {
    icon: Film,
    titleKey: 'dock.movies',
    title: 'Movies',
    fetchPage: fetchMoviesPage,
    genrePills: GENRE_PILLS_MOVIE,
  },
  tv: {
    icon: Tv,
    titleKey: 'dock.tvShows',
    title: 'TV Shows',
    fetchPage: fetchTVShowsPage,
    genrePills: GENRE_PILLS_TV,
  },
  anime: {
    icon: Sparkles,
    titleKey: 'dock.anime',
    title: 'Anime',
    fetchPage: fetchAnimePage,
    genrePills: GENRE_PILLS_TV,
  },
};

interface CategoryPageProps {
  category: 'movie' | 'tv' | 'anime';
}

const CategoryPage: React.FC<CategoryPageProps> = ({ category }) => {
  const { t } = useTranslation();
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  useDiscordRPC({ details: 'Exploring OnyxaxCinema', state: `Browsing ${config.title}` }, [category]);

  const [items, setItems] = useState<TMDBMovie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [genre, setGenre] = useState<number>(0);
  const [sort, setSort] = useState<string>('popularity.desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [ratingMin, setRatingMin] = useState('');
  const [quickViewItem, setQuickViewItem] = useState<{ item: TMDBMovie; rect: DOMRect } | null>(null);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingRef = useRef(false);
  const fetchIdRef = useRef(0);
  const scrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtersKey = `${category}-${genre}-${sort}-${yearFrom}-${yearTo}-${ratingMin}-${searchQuery}`;

  const goToPage = useCallback(async (page: number) => {
    if (isFetchingRef.current) return;
    const fetchId = ++fetchIdRef.current;
    isFetchingRef.current = true;
    setIsLoading(true);
    const startTime = Date.now();
    try {
      const params: Record<string, string> = {};
      if (yearFrom) params['primary_release_date.gte'] = `${yearFrom}-01-01`;
      if (yearTo) params['primary_release_date.lte'] = `${yearTo}-12-31`;
      if (ratingMin) params['vote_average.gte'] = ratingMin;

      const firstTmdbPage = Math.floor((page - 1) * 24 / 20) + 1;
      const offset = ((page - 1) * 24) % 20;

      const fetchFn = searchQuery.trim()
        ? (p: number) => searchContentPage(searchQuery.trim(), p)
        : (p: number) => config.fetchPage(genre || undefined, sort, p, params);

      const result1 = await fetchFn(firstTmdbPage);
      if (fetchId !== fetchIdRef.current) return;

      let combined = [...result1.results];
      if (offset + 24 > result1.results.length && firstTmdbPage < result1.total_pages) {
        const result2 = await fetchFn(firstTmdbPage + 1);
        if (fetchId !== fetchIdRef.current) return;
        combined = [...combined, ...result2.results];
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < 300) await new Promise(resolve => setTimeout(resolve, 300 - elapsed));
      if (fetchId !== fetchIdRef.current) return;

      setItems(combined.slice(offset, offset + 24));
      setCurrentPage(page);
      const uiTotalPages = Math.min(Math.ceil(result1.total_results / 24), MAX_PAGES);
      setTotalPages(uiTotalPages);
      setTotalResults(result1.total_results);
    } catch (error) {
      console.error('Error loading page:', error);
      if (fetchId !== fetchIdRef.current) return;
      if (page === 1) {
        setItems([]);
        setCurrentPage(1);
        setTotalPages(0);
        setTotalResults(0);
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    }
  }, [genre, sort, yearFrom, yearTo, ratingMin, searchQuery, config]);

  useEffect(() => {
    isFetchingRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    goToPage(1);
  }, [filtersKey, goToPage]);

  // --- pagination range ---
  const getPageRange = useCallback((cur: number, total: number): (number | null)[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const range: (number | null)[] = [1];
    if (cur > 3) range.push(null);
    const start = Math.max(2, cur - 1);
    const end = Math.min(total - 1, cur + 1);
    for (let i = start; i <= end; i++) range.push(i);
    if (cur < total - 2) range.push(null);
    if (total > 1) range.push(total);
    return range;
  }, []);

  const handleScroll = useCallback(() => {
    scrollingRef.current = true;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => { scrollingRef.current = false; }, 600);
  }, []);

  useEffect(() => {
    window.addEventListener('wheel', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [handleScroll]);

  const handlePillClick = (genreId: number) => setGenre(genreId);
  const handleTabClick = (sortKey: string) => setSort(sortKey);

  const handleMouseEnter = useCallback((item: TMDBMovie, rect: DOMRect) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (scrollingRef.current) return;
    hoverTimerRef.current = setTimeout(() => {
      setQuickViewItem({ item, rect });
    }, 500);
  }, []);

  const handleMouseLeaveCard = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setQuickViewItem(null);
  }, []);

  return (
    <div className="category-page">
      <div className="category-header">
        <div className="category-title-area">
          <h1><Icon size={22} /> {t(config.titleKey)}</h1>
          {totalResults > 0 && (
            <span className="category-result-count">{totalResults} {t('category.titles')}</span>
          )}
        </div>
      </div>

      <div className="category-controls">{/* ... same controls ... */}
        <div className="sort-tabs">
          {SORT_TABS.map(tab => (
            <button key={tab.key} className={`sort-tab ${sort === tab.key ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.key)}>
              {tab.label || t(tab.labelKey || '')}
            </button>
          ))}
        </div>
        <div className="category-actions">
          <div className="genre-pills">
            {config.genrePills.map(g => (
              <button key={g.id} className={`genre-pill ${genre === g.id ? 'active' : ''}`}
                onClick={() => handlePillClick(g.id)}>
                {g.label || t(g.labelKey || '')}
              </button>
            ))}
          </div>
          <div className="category-actions-right">
            <div className="search-box">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input className="search-input" type="text" placeholder={t('category.search')} value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}><X size={14} /></button>
              )}
            </div>
            <button className={`advanced-filter-toggle ${showAdvancedFilters ? 'active' : ''}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} title={t('category.advancedFilters')}>
              <SlidersHorizontal size={16} />
            </button>
            <div className="view-toggle">
              <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')} title={t('category.gridView')}><Grid3X3 size={16} /></button>
              <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')} title={t('category.listView')}><List size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="advanced-filters glass">{/* ... */}
          <div className="advanced-filters-header">
            <SlidersHorizontal size={14} /><span>{t('category.advancedFilters')}</span>
            <button className="advanced-filters-close" onClick={() => setShowAdvancedFilters(false)}><X size={16} /></button>
          </div>
          <div className="advanced-filters-grid">
            <div className="filter-field"><label>{t('category.yearFrom')}</label>
              <input type="number" placeholder={t('category.yearPlaceholder')} value={yearFrom}
                onChange={e => setYearFrom(e.target.value)} min="1900" max="2026" /></div>
            <div className="filter-field"><label>{t('category.yearTo')}</label>
              <input type="number" placeholder={t('category.yearPlaceholder')} value={yearTo}
                onChange={e => setYearTo(e.target.value)} min="1900" max="2026" /></div>
            <div className="filter-field"><label>{t('category.minRating')}</label>
              <input type="number" placeholder={t('category.ratingPlaceholder')} value={ratingMin}
                onChange={e => setRatingMin(e.target.value)} min="0" max="10" step="0.5" /></div>
          </div>
          {(yearFrom || yearTo || ratingMin) && (
            <button className="advanced-filters-clear"
              onClick={() => { setYearFrom(''); setYearTo(''); setRatingMin(''); }}>{t('category.clearFilters')}</button>
          )}
        </div>
      )}

      <div className="category-content">
        {isLoading ? (
          <div className="skeleton-grid">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="skeleton-poster skeleton" />
                <div className="skeleton-title-bar skeleton" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="no-results glass"><p>{t('search.noResults')}</p></div>
        ) : (
          <>
            <div className={`items-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {items.map((item, i) => (
                <div key={item.id} className="movie-card-wrapper"
                  onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); handleMouseEnter(item, rect); }}
                  onMouseLeave={handleMouseLeaveCard}>
                  <MovieCard item={item} type={item.media_type || category} index={i} />
                  {quickViewItem?.item.id === item.id && (
                    <div className="card-preview">
                      <div className="card-preview-backdrop"
                        style={{ backgroundImage: `url(${IMAGE_BASE_URL}${item.backdrop_path || item.poster_path})` }} />
                      <div className="card-preview-info">
                        <div className="card-preview-title">{item.title || item.name}</div>
                        <div className="card-preview-meta">
                          <span className="preview-match">{Math.round((item.vote_average || 0) * 10)}% {t('category.match')}</span>
                          <span className="preview-year">{item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4)}</span>
                        </div>
                        <div className="card-preview-actions">
                          <button className="preview-btn primary"><Play size={14} fill="currentColor" /></button>
                          <button className="preview-btn"><Plus size={14} /></button>
                          <button className="preview-btn"><Info size={14} /></button>
                        </div>
                        <div className="card-preview-overview">{item.overview}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-nav-btn" disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}>‹</button>
                {getPageRange(currentPage, totalPages).map((p, i) =>
                  p === null ? <span key={`e${i}`} className="page-ellipsis">…</span>
                    : <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`}
                      onClick={() => goToPage(p)}>{p}</button>
                )}
                <button className="page-nav-btn" disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default CategoryPage;
