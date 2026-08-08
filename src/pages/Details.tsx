import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, ThumbsUp, Check, Search as SearchIcon, ChevronDown, ArrowLeft, Pin, PinOff, Info } from 'lucide-react';
import { fetchDetails, fetchRecommendations, fetchImages, fetchCredits, fetchEpisodes, LOGO_BASE_URL } from '../services/tmdb';
import type { TMDBDetails, TMDBMovie, TMDBCast, TMDBEpisode } from '../types/tmdb';
import { useTranslation } from 'react-i18next';
import ContentRow from '../components/ContentRow';
import Loading from '../components/Loading';
import LogoImage from '../components/LogoImage';
import './Details.css';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type: 'movie' | 'tv' | 'anime'; id: string }>();
  const { t, i18n } = useTranslation();
  const [item, setItem] = useState<TMDBDetails | null>(null);
  const [recommendations, setRecommendations] = useState<TMDBMovie[]>([]);
  const [cast, setCast] = useState<TMDBCast[]>([]);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [isInMyList, setIsInMyList] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showFallbackTitle, setShowFallbackTitle] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showPinLimitToast, setShowPinLimitToast] = useState(false);
  const englishDataRef = useRef({ title: '', poster: '' });
  const [error, setError] = useState(false);
  
  const castRowRef = useRef<HTMLDivElement>(null);
  
  // Episode State
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(16);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [loadedEpisodes, setLoadedEpisodes] = useState<Record<number, boolean>>({});
  
  const navigate = useNavigate();

  // Handle horizontal scroll with mouse wheel
  useEffect(() => {
    const el = castRowRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + e.deltaY * 3,
          behavior: 'smooth'
        });
      };
      el.addEventListener('wheel', onWheel);
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, [cast]);

  // Filter seasons to exclude 'Specials' (season_number: 0)
  const regularSeasons = item?.seasons?.filter(s => s.season_number > 0) || [];

  const seasonKey = item ? `${item.id}:${selectedSeason}` : '';
  const [prevSeasonKey, setPrevSeasonKey] = useState(seasonKey);
  if (item && (type === 'tv' || type === 'anime') && prevSeasonKey !== seasonKey) {
    setPrevSeasonKey(seasonKey);
    setLoadedEpisodes({}); // Clear loaded state for new season
    setVisibleCount(16);
  }

  useEffect(() => {
    if (item && (type === 'tv' || type === 'anime')) {
      fetchEpisodes(item.id, selectedSeason).then(setEpisodes);
    }
  }, [item, selectedSeason, type]);

  const filteredEpisodes = episodes.filter(ep => 
    ep.name.toLowerCase().includes(episodeSearch.toLowerCase())
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
      if (!id || !type) return;
      
      setIsPageLoaded(false);
      setItem(null);
      setLogoPath(null);
      setError(false);
      
      try {
        // 1. Fetch all data in parallel
        const detailsData = await fetchDetails(id, type);
        const [recsData, creditsData, imagesData] = await Promise.all([
          fetchRecommendations(id, type),
          fetchCredits(id, type),
          fetchImages(id, type)
        ]);

        // Pick logo: prefer current app language → English → any
        const uiLang = i18n.language?.split('-')[0] || 'en';
        const logo = imagesData.logos.find((l) => l.iso_639_1 === uiLang)
                  || imagesData.logos.find((l) => l.iso_639_1 === 'en')
                  || imagesData.logos[0];

        // 2. Preload all images before touching state
        const imagePreloads: Promise<void>[] = [];

        if (detailsData?.backdrop_path) {
          imagePreloads.push(new Promise<void>((res) => {
            const img = new Image();
            img.src = `https://image.tmdb.org/t/p/w1280${detailsData.backdrop_path}`;
            img.onload = () => res(); img.onerror = () => res();
          }));
        }

        if (logo?.file_path) {
          imagePreloads.push(new Promise<void>((res) => {
            const img = new Image();
            img.src = `https://image.tmdb.org/t/p/w500${logo.file_path}`;
            img.onload = () => res(); img.onerror = () => res();
          }));
        }

        await Promise.all(imagePreloads);

        // Extract English/Original title and poster to save them consistently to localStorage
        const enTitle = detailsData?.translations?.translations?.find((t: any) => t.iso_639_1 === 'en')?.data?.title || 
                        detailsData?.original_title || detailsData?.original_name || detailsData?.title || detailsData?.name;
        
        const enPoster = imagesData?.posters?.find((p: any) => p.iso_639_1 === 'en')?.file_path || detailsData?.poster_path;

        englishDataRef.current = { title: enTitle || '', poster: enPoster || '' };

        // 3. Read localStorage values
        const myList = JSON.parse(localStorage.getItem('onyxax_mylist') || '[]');
        const likes   = JSON.parse(localStorage.getItem('onyxax_likes')  || '[]');
        const pinned  = JSON.parse(localStorage.getItem('onyxax_pinned') || '[]');

        // 4. Commit ALL state in one synchronous block → single React paint
        setItem(detailsData);
        setRecommendations(recsData);
        setCast(creditsData.cast.slice(0, 13));
        setLogoPath(logo?.file_path || null);
        if (!logo?.file_path) setShowFallbackTitle(true);
        setIsInMyList(myList.some((m: TMDBMovie) => m.id.toString() === id));
        setIsLiked(likes.some((l: TMDBMovie) => l.id.toString() === id));
        setIsPinned(pinned.some((p: any) => p.id.toString() === id));
        setIsPageLoaded(true);

      } catch (error) {
        console.error('Error loading details:', error);
        setError(true);
        setIsPageLoaded(true);
      }
    };

    loadData();
  }, [id, type]);

  useEffect(() => {
    if (item && isPageLoaded) {
      try {
        const englishTitle = item.translations?.translations?.find((t: any) => t.iso_639_1 === 'en')?.data?.title || 
                             item.original_title || item.original_name || item.title || item.name;
        
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('UPDATE_RPC', {
          details: `Viewing: ${englishTitle}`,
          state: 'Exploring details',
          largeImageKey: item.backdrop_path ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}` : 'onyxaxcinema',
          largeImageText: englishTitle
        });
      } catch {
        /* Discord RPC is best-effort; ignore failures */
      }
    }
  }, [item, isPageLoaded]);

  if (error) {
    return (
      <div className="details-error-container">
        <button className="back-btn-fixed" onClick={() => navigate(-1)}>
          <ArrowLeft size={32} />
        </button>
        <div className="error-message-overlay">
          <p>{t('details.contentNotAvailable')}</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="details-loading">
        <Loading inline />
      </div>
    );
  }


  const handlePlay = () => {
    navigate(`/watch/${type}/${id}`);
  };

  const toggleMyList = () => {
    const myList = JSON.parse(localStorage.getItem('onyxax_mylist') || '[]');
    let newList;
    if (isInMyList) {
      newList = myList.filter((m: TMDBMovie) => m.id.toString() !== id);
    } else {
      newList = [...myList, { 
        id: item.id, 
        title: englishDataRef.current.title, 
        poster_path: englishDataRef.current.poster, 
        type, 
        vote_average: item.vote_average 
      }];
    }
    localStorage.setItem('onyxax_mylist', JSON.stringify(newList));
    setIsInMyList(!isInMyList);
  };

  const toggleLike = () => {
    const likes = JSON.parse(localStorage.getItem('onyxax_likes') || '[]');
    let newLikes;
    if (isLiked) {
      newLikes = likes.filter((l: TMDBMovie) => l.id.toString() !== id);
    } else {
      newLikes = [...likes, { 
        id: item.id, 
        title: englishDataRef.current.title, 
        poster_path: englishDataRef.current.poster, 
        type 
      }];
    }
    localStorage.setItem('onyxax_likes', JSON.stringify(newLikes));
    setIsLiked(!isLiked);
  };

  const togglePin = () => {
    const pinned = JSON.parse(localStorage.getItem('onyxax_pinned') || '[]');
    let newPinned;
    if (isPinned) {
      newPinned = pinned.filter((p: any) => p.id.toString() !== id);
    } else {
      if (pinned.length >= 15) {
        setShowPinLimitToast(true);
        setTimeout(() => setShowPinLimitToast(false), 3000);
        return;
      }
      newPinned = [...pinned, { 
        id: item.id, 
        title: englishDataRef.current.title, 
        poster_path: englishDataRef.current.poster, 
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
        rating: type === 'movie' 
          ? (item.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates?.[0]?.certification || '')
          : (item.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating || ''),
        logo_path: logoPath,
        type 
      }];
    }
    localStorage.setItem('onyxax_pinned', JSON.stringify(newPinned));
    setIsPinned(!isPinned);
    // Dispatch custom event to notify Dock
    window.dispatchEvent(new Event('pinned_changed'));
  };

  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : t('details.na');

  return (
    <div className="details-page">
      <Loading isLoading={!isPageLoaded} inline />
      <div className="details-hero">
        <div className="details-hero-bg">
          {item.backdrop_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w1280${item.backdrop_path}`} 
              alt={item.title || item.name} 
              className="ken-burns-backdrop"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.classList.add('no-image');
              }}
            />
          ) : (
            <div className="details-no-image" />
          )}
          <div className="details-hero-vignette" />
        </div>
        
        <div className="details-hero-content">
          {logoPath ? (
            <LogoImage
              src={`${LOGO_BASE_URL}${logoPath}`}
              alt={item.title || item.name}
              className="details-logo"
              fallback={showFallbackTitle && <h1 className="details-title">{item.title || item.name}</h1>}
            />
          ) : (
            showFallbackTitle && <h1 className="details-title">{item.title || item.name}</h1>
          )}
          
          <div className="details-meta">

            {item.vote_average > 0 && (
              <span className="match">{Math.min(99, Math.round((item.vote_average || 0) * 10))}% {t('content.match')}</span>
            )}
            <span className="year">{year}</span>
            {item.vote_average > 0 && (
              <span className="rating">{item.vote_average.toFixed(1)} ★</span>
            )}
            <span className="duration">
              {item.runtime ? `${Math.floor(item.runtime / 60)}${t('details.hours')} ${item.runtime % 60}${t('details.minutes')}` : `${item.number_of_seasons} ${t('details.seasons')}`}
            </span>
          </div>
          
          <div className="details-buttons">
            <button className="btn btn-play" onClick={handlePlay}>
              <Play fill="currentColor" size={24} />
              <span>{t('details.play')}</span>
            </button>
            <button 
              className={`btn-circle ${isInMyList ? 'active' : ''}`} 
              onClick={toggleMyList}
              title={isInMyList ? t('details.removeFromMyList') : t('details.addToMyList')}
            >
              {isInMyList ? <Check size={24} /> : <Plus size={24} />}
            </button>
            <button 
              className={`btn-circle ${isLiked ? 'liked' : ''}`} 
              onClick={toggleLike}
              title={isLiked ? t('details.unlike') : t('details.like')}
            >
              <ThumbsUp size={24} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button 
              className={`btn-circle ${isPinned ? 'active' : ''}`} 
              onClick={togglePin}
              title={isPinned ? t('details.unpinFromDock') : t('details.pinToDock')}
            >
              {isPinned ? <PinOff size={24} /> : <Pin size={24} />}
            </button>
          </div>
          <p className="details-overview">{item.overview}</p>
        </div>
      </div>
      
      <div className="details-container">
        <div className="details-section-panel">
          <div className="section-header">
            <div className="accent-bar" />
            <h3>{t('details.cast')}</h3>
          </div>
          {cast.length > 0 ? (
            <div className="cast-row-container">
              <div className="cast-row" ref={castRowRef}>
                {cast.map((person) => (
                  <div key={person.id} className="cast-card-mini">
                    <div className="cast-image-mini">
                      {person.profile_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} 
                          alt={person.name} 
                        />
                      ) : (
                        <div className="cast-placeholder-mini">{person.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="cast-info-mini">
                      <span className="cast-name-mini">{person.name}</span>
                      <span className="cast-character-mini">{person.character}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="section-empty">{t('details.noCast')}</p>
          )}
        </div>

        <div className="details-section-panel">
          <div className="details-metadata-horizontal">
            {item.genres && item.genres.length > 0 && (
              <div className="meta-block">
                <span className="meta-label">{t('details.genres')}</span>
                <span className="meta-value">{item.genres.map(g => g.name).join(', ')}</span>
              </div>
            )}
            {item.status && (
              <div className="meta-block">
                <span className="meta-label">{t('details.status')}</span>
                <span className="meta-value">{item.status}</span>
              </div>
            )}
            {type === 'movie' && !!item.budget && item.budget > 0 && (
              <div className="meta-block">
                <span className="meta-label">{t('details.budget')}</span>
                <span className="meta-value">${(item.budget / 1000000).toFixed(0)}M</span>
              </div>
            )}
            {(type === 'tv' || type === 'anime') && item.networks && item.networks.length > 0 && (
              <div className="meta-block">
                <span className="meta-label">{t('details.network')}</span>
                <span className="meta-value">{item.networks[0].name}</span>
              </div>
            )}
            {item.spoken_languages && item.spoken_languages.length > 0 && (
              <div className="meta-block">
                <span className="meta-label">{t('details.languages')}</span>
                <span className="meta-value">
                  {item.spoken_languages.map(l => l.english_name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {(type === 'tv' || type === 'anime') && regularSeasons.length > 0 && (
          <div className="details-section-panel">
            <div className="episodes-header">
              <div className="episodes-title-group">
                <div className="accent-bar" />
                <h3>{t('details.episodes')}</h3>
                <div className="season-select-wrapper" onClick={() => setIsSeasonOpen(!isSeasonOpen)}>
                  <div className="selected-season-display">
                    {regularSeasons.find(s => s.season_number === selectedSeason)?.name || `${t('details.season')} ${selectedSeason}`}
                    <ChevronDown className={`select-icon ${isSeasonOpen ? 'open' : ''}`} size={18} />
                  </div>
                  {isSeasonOpen && (
                    <div className="season-dropdown-menu">
                      {regularSeasons.map((s) => (
                        <div 
                          key={s.id} 
                          className={`season-option ${selectedSeason === s.season_number ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setSelectedSeason(s.season_number); setIsSeasonOpen(false); }}
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="episode-search-wrapper">
                <SearchIcon size={16} />
                <input 
                  type="text" 
                  placeholder={t('details.searchEpisode')} 
                  value={episodeSearch}
                  onChange={(e) => setEpisodeSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="episodes-list-container">
              <div className="episodes-list">
                {filteredEpisodes.length === 0 ? (
                  <div className="no-episodes-found">
                    <p>{t('details.noEpisodesFound')}</p>
                  </div>
                ) : (
                  filteredEpisodes.slice(0, visibleCount).map((ep) => (
                    <div 
                      key={ep.id} 
                      className="episode-card"
                      onClick={() => navigate(`/watch/${type}/${id}/${selectedSeason}/${ep.episode_number}`)}
                    >
                      <div className="episode-thumbnail">
                        <div className="episode-number">{ep.episode_number}</div>
                        {ep.still_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w342${ep.still_path}`} 
                            alt={ep.name} 
                            className={`${loadedEpisodes[ep.id] ? 'img-loaded' : ''}`}
                            onLoad={() => setLoadedEpisodes(prev => ({ ...prev, [ep.id]: true }))}
                          />
                        ) : (
                          <div className="episode-placeholder" />
                        )}
                      </div>
                      <div className="episode-content">
                        <div className="episode-top">
                          <h4 className="episode-title">{ep.name}</h4>
                          <span className="episode-runtime">{ep.runtime || '24'} {t('details.min')}</span>
                        </div>
                        <p className="episode-overview">{ep.overview || t('details.noDescription')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {visibleCount < filteredEpisodes.length && (
                <div className="load-more-container">
                  <button className="load-more-btn" onClick={() => setVisibleCount(prev => prev + 16)}>{t('details.loadMore')}</button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="details-section-panel">
          <ContentRow title={t('details.similar')} items={recommendations} type={type as 'movie' | 'tv'} />
        </div>
      </div>

      {showPinLimitToast && (
        <div className="pin-limit-toast glass">
          <Info size={18} />
          <span>{t('dock.pinLimitReached')}</span>
        </div>
      )}
    </div>
  );
};

export default Details;
