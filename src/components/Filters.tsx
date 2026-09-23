import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Filters.css';

interface FiltersProps {
  onGenreChange: (genre: number) => void;
  onSortChange: (sort: string) => void;
  type?: 'movie' | 'tv' | 'anime';
  hideSort?: boolean;
}

const CustomSelect: React.FC<{
  label: string;
  options: { id: any; name: string }[];
  onChange: (val: any) => void;
}> = ({ label, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(options[0]?.id);
  const selected = options.find((o) => o.id === selectedId) ?? options[0];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selected) return null;

  return (
    <div className="custom-filter-select" ref={dropdownRef}>
      <span className="filter-label">{label}</span>
      <div className={`select-trigger glass ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span>{selected.name}</span>
        <ChevronDown size={14} className={`arrow ${isOpen ? 'rotated' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="select-options glass fade-in">
          {options.map((opt) => (
            <div 
              key={opt.id} 
              className={`option-item ${selected.id === opt.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedId(opt.id);
                onChange(opt.id);
                setIsOpen(false);
              }}
            >
              {opt.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Filters: React.FC<FiltersProps> = ({ onGenreChange, onSortChange, type, hideSort }) => {
  const { t } = useTranslation();

  const movieGenres = [
    { id: 0, name: t('filters.allGenres') },
    { id: 28, name: t('filters.action') },
    { id: 12, name: t('filters.adventure') },
    { id: 16, name: t('filters.animation') },
    { id: 35, name: t('filters.comedy') },
    { id: 80, name: t('filters.crime') },
    { id: 18, name: t('filters.drama') },
    { id: 14, name: t('filters.fantasy') },
    { id: 27, name: t('filters.horror') },
    { id: 878, name: t('filters.scienceFiction') },
    { id: 53, name: t('filters.thriller') },
  ];

  const tvGenres = [
    { id: 0, name: t('filters.allGenres') },
    { id: 10759, name: t('filters.action') }, // Action & Adventure combined in TV
    { id: 35, name: t('filters.comedy') },
    { id: 80, name: t('filters.crime') },
    { id: 18, name: t('filters.drama') },
    { id: 10751, name: t('filters.family') },
    { id: 9648, name: t('filters.mystery') },
    { id: 10765, name: t('filters.scienceFiction') }, // Sci-Fi & Fantasy
  ];

  const animeGenres = [
    { id: 0, name: t('filters.allGenres') },
    { id: 10759, name: t('filters.action') },
    { id: 35, name: t('filters.comedy') },
    { id: 80, name: t('filters.crime') },
    { id: 18, name: t('filters.drama') },
    { id: 10751, name: t('filters.family') },
    { id: 9648, name: t('filters.mystery') },
    { id: 10765, name: t('filters.scienceFiction') },
  ];

  const sortOptions = [
    { id: 'popularity.desc', name: t('filters.popularity') },
    { id: 'vote_average.desc', name: t('filters.highestRated') },
    { id: 'original_title.asc', name: t('category.sortAZ') },
  ];

  const genres = React.useMemo(() => 
    type === 'movie' ? movieGenres : (type === 'anime' ? animeGenres : tvGenres),
  [type, t]);

  const memoSortOptions = React.useMemo(() => sortOptions, [t]);

  return (
    <div className="filters-container">
      <CustomSelect 
        key={`genre-${type}`} 
        label={t('filters.allGenres').split(' ')[1] || 'Genre'} 
        options={genres} 
        onChange={onGenreChange} 
      />
      {!hideSort && (
        <CustomSelect 
          key={`sort-${type}`}
          label={t('filters.sortBy')} 
          options={memoSortOptions} 
          onChange={onSortChange} 
        />
      )}
    </div>
  );
};

export default Filters;
