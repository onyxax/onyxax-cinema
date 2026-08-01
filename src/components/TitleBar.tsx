import React, { useEffect, useState } from 'react';
import './TitleBar.css';

const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    if (window.electronAPI) {
      window.electronAPI.on('fullscreen-change', (val: boolean) => {
        setIsFullscreen(val);
      });
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleClose = () => {
    console.log('Close clicked');
    window.electronAPI?.send('APP_CLOSE');
  };
  const handleMinimize = () => {
    console.log('Minimize clicked');
    window.electronAPI?.send('APP_MINIMIZE');
  };
  const handleMaximize = () => {
    console.log('Maximize clicked');
    window.electronAPI?.send('APP_MAXIMIZE');
    setIsMaximized(!isMaximized);
  };

  if (isFullscreen) return null;

  return (
    <div className="title-bar">
      <div className="title-bar-drag">
        <div className="title-bar-brand">
          <span>ONYXAX CINEMA</span>
        </div>
      </div>
      <div className="title-bar-controls mac-style">
        <button onClick={handleMinimize} className="control-btn-mac minimize" title="Minimize" />
        <button onClick={handleMaximize} className="control-btn-mac maximize" title="Maximize" />
        <button onClick={handleClose} className="control-btn-mac close" title="Close" />
      </div>
    </div>
  );
};

export default TitleBar;
