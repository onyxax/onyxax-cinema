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
    <div className={`loading-screen${fadingOut ? ' loading-fade-out' : ''}${inline ? ' loading-inline' : ''}`}>
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <div className="loading-glow"></div>
      </div>
    </div>
  );
};

export default Loading;
