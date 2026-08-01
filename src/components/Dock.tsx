import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Film,
  Tv,
  Sparkles,
  Heart,
  Search,
  Settings,
  LogOut,
  ChevronDown,
  Pin,
  User,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import { THUMBNAIL_BASE_URL } from '../services/tmdb';
import './Dock.css';

interface PinnedItem {
  id: number;
  type: string;
  title: string;
  poster_path: string;
}

const Dock: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('onyxax_pinned') || '[]');
    } catch {
      return [];
    }
  });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: PinnedItem } | null>(null);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('onyax_sidebar_collapsed') === 'true');
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('onyax_sidebar_collapsed', String(collapsed));
  }, [collapsed]);
  const location = useLocation();
  const navigate = useNavigate();

  const loadPinned = () => {
    try {
      const saved = localStorage.getItem('onyxax_pinned');
      setPinnedItems(saved ? JSON.parse(saved) : []);
    } catch {
      setPinnedItems([]);
    }
  };

  useEffect(() => {
    window.addEventListener('pinned_changed', loadPinned);
    window.addEventListener('storage', loadPinned);
    return () => {
      window.removeEventListener('pinned_changed', loadPinned);
      window.removeEventListener('storage', loadPinned);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleUnpin = (itemId: number) => {
    const saved: PinnedItem[] = JSON.parse(localStorage.getItem('onyxax_pinned') || '[]');
    const newPinned = saved.filter((p) => p.id !== itemId);
    localStorage.setItem('onyxax_pinned', JSON.stringify(newPinned));
    window.dispatchEvent(new Event('pinned_changed'));
    setContextMenu(null);
  };

  const spaces = [
    { name: t('dock.home'), path: '/', icon: <Home size={18} /> },
    { name: t('dock.movies'), path: '/movies', icon: <Film size={18} /> },
    { name: t('dock.tvShows'), path: '/tv', icon: <Tv size={18} /> },
    { name: t('dock.anime'), path: '/anime', icon: <Sparkles size={18} /> },
    { name: t('dock.myList'), path: '/mylist', icon: <Heart size={18} /> },
  ];

  return (
    <>
      <aside className={`dock${collapsed ? ' collapsed' : ''}`}>
        <div className="dock-inner">
          <div className="dock-top">
            <div className="dock-header">
              <button
                className="dock-collapse-btn"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? t('dock.expand') : t('dock.collapse')}
              >
                {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </div>

            <div className="dock-spaces">
              {spaces.map((space) => {
                const isActive = location.pathname === space.path ||
                  (space.path !== '/' && location.pathname.startsWith(space.path));
                return (
                  <Link
                    key={space.path}
                    to={space.path}
                    className={`dock-space${isActive ? ' active' : ''}`}
                    title={space.name}
                  >
                    {space.icon}
                    {!collapsed && <span className="dock-space-label">{space.name}</span>}
                    <span className="dock-tooltip">{space.name}</span>
                  </Link>
                );
              })}
            </div>

            {!collapsed && (
              <>
                <div className="dock-divider" />

                <form className="dock-search" onSubmit={handleSearch}>
                  <Search size={14} className="dock-search-icon" />
                  <input
                    type="text"
                    placeholder={t('dock.searchMovies')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                {pinnedItems.length > 0 && (
                  <div className="dock-pinned-section">
                    <div className="dock-pinned-header">
                      <Pin size={12} />
                      <span>{t('dock.pinned')}</span>
                      <span className="dock-pinned-count">{pinnedItems.length}</span>
                    </div>
                    <div className="dock-pinned-grid">
                      {pinnedItems.map((item) => (
                        <Link
                          key={item.id}
                          to={`/details/${item.type}/${item.id}`}
                          className="dock-pinned-card"
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({ x: e.clientX, y: e.clientY, item });
                          }}
                        >
                          <div className="dock-pinned-card-thumb">
                            <img
                              src={`${THUMBNAIL_BASE_URL}${item.poster_path}`}
                              alt=""
                            />
                          </div>
                          <span className="dock-pinned-card-title">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="dock-bottom">
            <div className="dock-divider" />

            {user ? (
              <div className="dock-user" ref={userMenuRef}>
                <button
                  className="dock-user-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="dock-user-avatar">
                    <img
                      src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.user_metadata?.display_name || 'U'}&background=d97757&color=fff&size=36`}
                      alt=""
                    />
                  </div>
                  {!collapsed && (
                    <>
                      <div className="dock-user-info">
                        <span className="dock-user-name">{user?.user_metadata?.display_name || t('common.user')}</span>
                      </div>
                      <ChevronDown size={12} className={`dock-user-chevron${isUserMenuOpen ? ' open' : ''}`} />
                    </>
                  )}
                </button>

                {isUserMenuOpen && !collapsed && (
                  <div className="dock-user-dropdown">
                    <button className="dock-dropdown-item" onClick={() => { setIsProfileModalOpen(true); setIsUserMenuOpen(false); }}>
                      <Settings size={14} />
                      <span>{t('dock.settings')}</span>
                    </button>
                    <button className="dock-dropdown-item danger" onClick={() => { signOut(); setIsUserMenuOpen(false); }}>
                      <LogOut size={14} />
                      <span>{t('dock.signOut')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="dock-login-btn" onClick={() => navigate('/auth')}>
                <User size={16} />
                {!collapsed && <span>{t('dock.signIn')}</span>}
              </button>
            )}
          </div>
        </div>
      </aside>

      {contextMenu && (
        <div
          className="dock-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => {
            e.stopPropagation();
            handleUnpin(contextMenu.item.id);
          }}
        >
          {t('dock.unpin')}
        </div>
      )}

      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </>
  );
};

export default Dock;
