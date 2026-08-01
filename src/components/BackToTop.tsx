import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const el = document.querySelector('.main-content');
    if (!el) return;

    const onScroll = () => {
      setVisible(el.scrollTop > 400);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    const el = document.querySelector('.main-content');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`back-to-top${visible ? ' visible' : ''}`}
      aria-label={t('common.backToTop')}
    >
      <ChevronUp size={20} />
    </button>
  );
};

export default BackToTop;
