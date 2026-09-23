import React from 'react';
import { Bookmark, Compass, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './MyListEmpty.css';

const MyListEmpty: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="mylist-empty-pro">
      <div className="mylist-empty-orb">
        <div className="orb-ring outer" />
        <div className="orb-ring inner" />
        <div className="orb-core">
          <Bookmark size={28} />
        </div>
      </div>

      <h2 className="mylist-empty-title">{t('myList.emptyTitle')}</h2>
      <p className="mylist-empty-desc">{t('myList.emptySubtitle')}</p>

      <div className="mylist-empty-actions">
        <button className="mylist-empty-primary" onClick={() => navigate('/')}>
          <Compass size={16} /> {t('myList.explore')}
        </button>
        <button className="mylist-empty-secondary" onClick={() => navigate('/movies')}>
          <Sparkles size={14} /> {t('myList.animeCollection')}
        </button>
      </div>

      <div className="mylist-empty-hints">
        <span><Bookmark size={12} /> {t('myList.savedMovies')}</span>
        <span className="dot">•</span>
        <span><Compass size={12} /> {t('myList.tvSeries')}</span>
        <span className="dot">•</span>
        <span><Sparkles size={12} /> Anime</span>
      </div>
    </div>
  );
};

export default MyListEmpty;
