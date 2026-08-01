import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu, X, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'TV Shows', path: '/tv' },
    { name: 'Anime', path: '/anime' },
    { name: 'My List', path: '/mylist' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo-compact">
          ONYXAX <span className="logo-accent">CINEMA</span>
        </Link>
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="navbar-right">
        <form className={`search-container ${isSearchOpen ? 'open' : ''}`} onSubmit={handleSearch}>
          <button type="button" className="search-icon-btn" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search size={20} />
          </button>
          <input
            type="text"
            placeholder="Titles, people, genres"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>
        <button className="nav-icon"><Bell size={20} /></button>
        
        {user ? (
          <div className="user-menu-wrapper" ref={dropdownRef}>
            <div className="user-profile-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="user-profile-avatar">
                <img 
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata?.display_name || 'User'}&background=random&color=fff`} 
                  alt="Profile" 
                />
              </div>
              <ChevronDown size={14} className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="user-dropdown-menu glass">
                <div className="dropdown-user-info">
                  <p className="dropdown-name">{user.user_metadata?.display_name || 'User'}</p>
                  <p className="dropdown-email">{user.email}</p>
                </div>
                <div className="dropdown-divider" />

                <button className="dropdown-item" onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}>
                  <Settings size={18} />
                  <span>Edit Profile</span>
                </button>
                <button className="dropdown-item logout" onClick={() => { signOut(); setIsDropdownOpen(false); }}>
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn-nav" onClick={() => navigate('/auth')}>
            <User size={18} />
            <span>Sign In</span>
          </button>
        )}

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
      {isProfileModalOpen && (
        <ProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      )}
    </nav>
  );
};

export default Navbar;
