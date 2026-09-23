import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Check, Loader, Globe, Trash2, ChevronRight, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../services/cloudinary';
import './ProfileModal.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, isRPCEnabled, toggleRPC } = useAuth();
  const { t, i18n } = useTranslation();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Uploading file to Cloudinary:', file.name);
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      console.log('Upload success:', url);
      setAvatarUrl(url);
      
      // Auto-save the new avatar URL to profile
      await updateProfile(displayName, url);
    } catch (err: any) {
      console.error('File upload failed:', err);
      setError(t('profile.uploadFailedWithMessage', { message: err.message }));
    } finally {
      setUploading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateProfile(displayName, avatarUrl);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        handleClose();
      }, 1000);
    } catch (err: any) {
      console.error('Update failed:', err);
      setError(err.message || t('profile.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className={`profile-modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`profile-modal-card ${isClosing ? 'closing' : ''}`}>
        <button className="modal-close-btn" onClick={handleClose}><X /></button>
        
        <div className="modal-header">
          <h2>{t('profile.editProfile')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="profile-avatar-edit">
            <div className="avatar-large-preview">
              <img src={avatarUrl || `https://ui-avatars.com/api/?name=${displayName}&background=222&color=fff`} alt={t('profile.preview')} />
              {uploading && (
                <div className="avatar-upload-overlay">
                  <Loader className="spinner" size={24} />
                </div>
              )}
            </div>
            
            <div className="avatar-controls">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
                accept="image/*"
              />
              
              <button 
                type="button" 
                className="avatar-action-btn upload" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={16} />
                <span>{t(uploading ? 'profile.uploading' : 'profile.uploadPhoto')}</span>
              </button>
            </div>
          </div>

          <div className="profile-field">
            <label>{t('profile.displayName')}</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('profile.namePlaceholder')}
              required
            />
          </div>

          <div className="modal-divider" />

          <div className="app-settings-section">
            <h3 className="settings-title">{t('profile.settings')}</h3>


            <div className="settings-item rpc-toggle" onClick={() => toggleRPC()}>
              <div className="settings-info">
                <div className="settings-label">
                  <Globe size={18} />
                  <span>{t('profile.discordActivity')}</span>
                </div>
                <p className="settings-desc">{t('profile.discordActivityDesc')}</p>
              </div>
              <div className={`modal-toggle-switch ${isRPCEnabled ? 'active' : ''}`}>
                <div className="modal-toggle-knob" />
              </div>
            </div>

            <div className="settings-item cache-clear" onClick={async () => {
              if (window.confirm(t('profile.clearCacheConfirm'))) {
                if (window.electronAPI) {
                  await window.electronAPI.invoke('CLEAR_CACHE');
                }
              }
            }}>
              <div className="settings-info">
                <div className="settings-label">
                  <Trash2 size={18} />
                  <span>{t('profile.clearCache')}</span>
                </div>
                <p className="settings-desc">{t('profile.clearCacheDesc')}</p>
              </div>
              <div className="cache-action-icon">
                <ChevronRight size={18} />
              </div>
            </div>

            <div className="language-section">
              <div className="settings-title" style={{ marginTop: '10px' }}>
                <Globe size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                {t('profile.language')}
              </div>
              <div className="language-grid">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'ar', label: 'العربية' },
                  { code: 'fr', label: 'Français' },
                  { code: 'es', label: 'Español' },
                  { code: 'de', label: 'Deutsch' },
                  { code: 'it', label: 'Italiano' },
                  { code: 'pt', label: 'Português' },
                  { code: 'ru', label: 'Русский' },
                  { code: 'zh', label: '中文' },
                  { code: 'ja', label: '日本語' }
                ].map((lang) => (
                  <div 
                    key={lang.code}
                    className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
                    onClick={() => i18n.changeLanguage(lang.code)}
                  >
                    <span>{lang.label}</span>
                    {i18n.language === lang.code && <Check size={16} className="lang-check" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="modal-error-msg">{error}</p>}

          <button type="submit" className="save-profile-btn" disabled={loading || success}>
            {loading ? <Loader className="spinner" size={20} /> : (success ? <Check size={20} /> : t('profile.saveChanges'))}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ProfileModal;
