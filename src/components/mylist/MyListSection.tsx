import React from 'react';
import type { LucideIcon } from 'lucide-react';
import MovieCard from '../MovieCard';
import type { TMDBMovie, WatchProgress } from '../../types/tmdb';
import './MyListSection.css';

interface Props {
  icon: LucideIcon;
  title: string;
  count: number;
  items: (TMDBMovie | WatchProgress)[];
  type: 'movie' | 'tv' | 'anime';
  isWide?: boolean;
  variant?: string;
}

const MyListSection: React.FC<Props> = ({ icon: Icon, title, count, items, type, isWide }) => {
  if (!items.length) return null;

  return (
    <section className="mylist-minimal">
      <div className="mylist-minimal-head">
        <h3 className="mylist-minimal-title">
          <Icon size={13} />
          {title}
        </h3>
        <span className="mylist-minimal-count">{count} titles</span>
      </div>
      <div className={isWide ? 'mylist-grid-wide' : 'mylist-grid'}>
        {items.map((item, i) => (
          <MovieCard
            key={`${type}-${item.id}-${i}`}
            item={item as any}
            type={type}
            isWide={isWide}
            progress={(item as WatchProgress).watched !== undefined ? { watched: (item as WatchProgress).watched, duration: (item as WatchProgress).duration } : undefined}
            isContinueWatching={isWide}
            index={i}
          />
        ))}
      </div>
    </section>
  );
};

export default MyListSection;
