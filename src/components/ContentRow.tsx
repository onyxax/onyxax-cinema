import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import type { TMDBMovie, WatchProgress } from '../types/tmdb';
import './ContentRow.css';

interface ContentRowProps {
  title: string;
  items: (TMDBMovie | WatchProgress)[];
  type: 'movie' | 'tv' | 'anime';
  isWide?: boolean;
  showRank?: boolean;
  isContinueWatching?: boolean;
  sectionId?: string;
  isLoading?: boolean;
}

const ContentRow: React.FC<ContentRowProps> = ({ title, items, type, isWide, showRank, isContinueWatching, sectionId, isLoading }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = React.useState(false);
  const [showRight, setShowRight] = React.useState(true);

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const container = rowRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      const target = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      const start = container.scrollLeft;
      const change = target - start;
      let startTime: number | null = null;
      const duration = 600; // Duration in ms for a cinematic feel

      const animateScroll = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percent = Math.min(progress / duration, 1);
        
        // Easing function (easeOutQuart) for a premium feel
        const easing = 1 - Math.pow(1 - percent, 4);
        
        container.scrollLeft = start + change * easing;
        
        if (progress < duration) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  };

  React.useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [items]);

  if (!isLoading && (!items || items.length === 0)) return null;

  return (
    <div 
      key={title + (items[0]?.id || '')} 
      className={`content-row-container row-fade-in ${showRank ? 'has-ranks' : ''}`}
      data-section={sectionId}
    >
      <h2 className="row-title">{title}</h2>
      
      <div className="row-wrapper">
        {showLeft && (
          <button className="scroll-btn left" onClick={() => scroll('left')}>
            <ChevronLeft size={30} />
          </button>
        )}
        
        <div className="row-items" ref={rowRef} onScroll={handleScroll}>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="movie-card skeleton" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="card-image-container">
                  <div className="skeleton-img" />
                </div>
              </div>
            ))
          ) : (
            items.map((item, index) => (
              <MovieCard 
                key={item.id} 
                item={item} 
                type={type} 
                isWide={isWide} 
                rank={showRank ? index + 1 : undefined}
                progress={(item as WatchProgress).watched !== undefined ? { watched: (item as WatchProgress).watched, duration: (item as WatchProgress).duration } : undefined}
                isContinueWatching={isContinueWatching}
                index={index}
              />
            ))
          )}
        </div>
        
        {showRight && (
          <button className="scroll-btn right" onClick={() => scroll('right')}>
            <ChevronRight size={30} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContentRow;
