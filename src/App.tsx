import React, { useEffect, useRef, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dock from './components/Dock';
import TitleBar from './components/TitleBar';
import Home from './pages/Home';
import Watch from './pages/Watch';
import CategoryPage from './pages/CategoryPage';
import Search from './pages/Search';
import MyList from './pages/MyList';
import Details from './pages/Details';
import Auth from './pages/Auth';
import Legal from './pages/Legal';
import Loading from './components/Loading';
import UpdateModal from './components/UpdateModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { i18n } = useTranslation();
  const location = useLocation();
  const [updateInfo, setUpdateInfo] = useState<{ version: string, url: string, isBeta?: boolean } | null>(null);
  const [langSwitching, setLangSwitching] = useState(false);
  const langTimer = useRef<number | null>(null);

  useEffect(() => {
    const onLangChanged = () => {
      setLangSwitching(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setLangSwitching(true)));
      if (langTimer.current) clearTimeout(langTimer.current);
      langTimer.current = window.setTimeout(() => setLangSwitching(false), 700);
    };
    i18n.on('languageChanged', onLangChanged);
    return () => {
      i18n.off('languageChanged', onLangChanged);
      if (langTimer.current) clearTimeout(langTimer.current);
    };
  }, [i18n]);

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable dragging
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Disable sensitive keys
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11' || e.key === 'F12') e.preventDefault();
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) e.preventDefault();
      if (e.ctrlKey && e.key === 'u') e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const api = window.electronAPI;
    if (api) {
      // Small delay to let the app settle
      setTimeout(() => {
        api.invoke('CHECK_FOR_UPDATES').then((result: any) => {
          if (result?.updateAvailable) {
            // If it's a beta, check if the user has already dismissed this specific beta version
            if (result.isBeta) {
              const dismissedBetas = JSON.parse(localStorage.getItem('onyxax_dismissed_betas') || '[]');
              if (dismissedBetas.includes(result.version)) {
                return; // Don't show if already dismissed
              }
            }
            setUpdateInfo({ version: result.version, url: result.url, isBeta: result.isBeta });
          }
        });
      }, 5000);
    }
  }, []);

  const handleDismissUpdate = () => {
    if (updateInfo?.isBeta) {
      const dismissedBetas = JSON.parse(localStorage.getItem('onyxax_dismissed_betas') || '[]');
      if (!dismissedBetas.includes(updateInfo.version)) {
        dismissedBetas.push(updateInfo.version);
        localStorage.setItem('onyxax_dismissed_betas', JSON.stringify(dismissedBetas));
      }
    }
    setUpdateInfo(null);
  };


  if (loading) return <Loading />;

  return (
    <div className={`app ${langSwitching ? 'lang-switching' : ''}`}>
      <TitleBar />
      
      {!user ? (
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/watch/:type/:id" element={<Watch />} />
          <Route path="/watch/:type/:id/:season/:episode" element={<Watch />} />
          
          <Route path="*" element={
            <div className="app-container">
              <Dock />
              <main className="main-content">
                <div key={location.pathname} className="page-transition">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/movies" element={<CategoryPage category="movie" />} />
                    <Route path="/tv" element={<CategoryPage category="tv" />} />
                    <Route path="/anime" element={<CategoryPage category="anime" />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/mylist" element={<MyList />} />
                    <Route path="/details/:type/:id" element={<Details />} />
                    <Route path="/legal" element={<Legal />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
          } />
        </Routes>
      )}

      {updateInfo && (
        <UpdateModal 
          version={updateInfo.version} 
          url={updateInfo.url}
          isBeta={updateInfo.isBeta}
          onClose={handleDismissUpdate} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
