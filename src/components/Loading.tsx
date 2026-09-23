import React, { useState, useEffect } from 'react';
import './Loading.css';

interface LoadingProps {
  /** When provided: true = show, false = play fade-out then unmount */
  isLoading?: boolean;
  /** Cover only the content area, leaving the sidebar visible */
  inline?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading, inline }) => {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // If isLoading is not provided, behave like the old always-visible spinner
    if (isLoading === undefined) return;

    if (!isLoading) {
      // Trigger the CSS fade-out, then hide
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fade-out is animation-driven
      setFadingOut(true);
      const timer = setTimeout(() => setVisible(false), 350); // matches CSS duration
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      setFadingOut(false);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className={`loading-screen${fadingOut ? ' loading-fade-out' : ''}${inline ? ' loading-inline' : ''}`} role="status" aria-label="Loading">
      <div className="loading-brand">
        <img src="/AppIcon64.png" alt="" className="loading-icon" width={56} height={56} decoding="async" />
        <span className="loading-ring" aria-hidden />
        <span className="loading-ring loading-ring--2" aria-hidden />
      </div>
      <span className="loading-label">ONYXAX CINEMA</span>
    </div>
  );
};

export default Loading;
