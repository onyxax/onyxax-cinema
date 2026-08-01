import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Film, TrendingUp, X } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { searchMovies } from '../services/tmdb';
import type { TMDBMovie } from '../types/tmdb';
import './CategoryPage.css';

import { useTranslation } from 'react-i18next';

const Search: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchMovies(query);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [query]);

  const [localQuery, setLocalQuery] = useState(query);
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setLocalQuery(query);
  }
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  return (
    <div className="category-page search-results-page">
      <div className="search-page-header">
        <form onSubmit={handleSubmit} className="search-page-form glass">
          <SearchIcon size={24} className="search-page-icon" />
          <input 
            type="text" 
            value={localQuery} 
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={t('dock.searchMovies')}
            autoFocus
          />
          {localQuery && (
            <button type="button" className="search-page-clear" onClick={() => { setLocalQuery(''); navigate('/search'); }}>
              <X size={16} />
            </button>
          )}
        </form>
        {query && results.length > 0 && (
          <h2 className="search-title-sub">
            {t('search.showingResults')} <span>{query}</span>
            <span className="search-count">{results.length}</span>
          </h2>
        )}
      </div>

      {!query ? (
        <div className="search-empty-state">
          <div className="search-empty-icon"><TrendingUp size={40} /></div>
          <h3>{t('search.startSearch')}</h3>
          <p>{t('search.startSearchHint')}</p>
        </div>
      ) : loading ? (
        <div className="search-loading">
          <div className="spinner"></div>
          <p>{t('search.loading')}</p>
        </div>
      ) : results.length > 0 ? (
        <div className="items-grid">
          {results.map((item, i) => (
            <MovieCard key={item.id} item={item} type={(item.media_type as 'movie' | 'tv') || 'movie'} index={i} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <Film size={36} opacity={0.4} />
          <p>{t('search.noResultsFor')} "<span>{query}</span>"</p>
        </div>
      )}
    </div>
  );
};

export default Search;
