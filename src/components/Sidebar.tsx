/**
 * @deprecated — replaced by `src/components/Dock.tsx` (unified dock with collapsed state in localStorage)
 * Kept for reference only. Do not import in new code. Will be removed in v2.0.
 */
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
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse }) => {
  const { user, signOut } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={22} /> },
    { name: 'Movies', path: '/movies', icon: <Film size={22} /> },
    { name: 'TV Shows', path: '/tv', icon: <Tv size={22} /> },
    { name: 'Anime', path: '/anime', icon: <Sparkles size={22} /> },
    { name: 'My List', path: '/mylist', icon: <Heart size={22} /> },
  ];

  return (
    <aside className={`sidebar glass ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <div className="logo-icon">C</div>
          {!isCollapsed && <span className="logo-text">CINE<span>BY</span></span>}
        </Link>
        <button className="toggle-btn" onClick={toggleCollapse}>
          <ChevronRight size={18} className={`toggle-icon ${isCollapsed ? '' : 'rotated'}`} />
        </button>
      </div>

      <div className="sidebar-search">
        <form onSubmit={handleSearch} className="sidebar-search-form">
          <Search size={20} className="search-icon" />
          {!isCollapsed && (
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
        </form>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {!isCollapsed && <p className="nav-label">Menu</p>}
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
              title={isCollapsed ? link.name : ''}
            >
              <span className="link-icon">{link.icon}</span>
              {!isCollapsed && <span className="link-text">{link.name}</span>}
              {location.pathname === link.path && <div className="active-indicator" />}
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <div className="sidebar-user" ref={dropdownRef}>
            <div className="user-info-wrapper" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="user-avatar">
                <img 
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata?.display_name || 'User'}&background=random&color=fff`} 
                  alt="Profile" 
                />
              </div>
              <div className="user-details">
                <p className="user-name">{user.user_metadata?.display_name || 'User'}</p>
                <p className="user-status">Premium</p>
              </div>
              <ChevronRight size={16} className={`dropdown-chevron ${isDropdownOpen ? 'open' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="sidebar-user-dropdown glass">
                <button className="dropdown-item" onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}>
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                <button className="dropdown-item logout" onClick={() => { signOut(); setIsDropdownOpen(false); }}>
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="sidebar-login-btn" onClick={() => navigate('/auth')}>
            <User size={20} />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {isProfileModalOpen && (
        <ProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      )}
    </aside>
  );
};

export default Sidebar;
