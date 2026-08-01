import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X, Rocket, Check, ExternalLink, Shield } from 'lucide-react';
import './UpdateModal.css';

interface UpdateModalProps {
  version: string;
  url: string;
  isBeta?: boolean;
  onClose: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ version, url, isBeta, onClose }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'downloading' | 'finished' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadedPath, setDownloadedPath] = useState('');

  useEffect(() => {
    if (window.electronAPI?.on) {
      const handleProgress = (p: number) => setProgress(p);
      window.electronAPI.on('UPDATE_PROGRESS', handleProgress);
      return () => {
        if (window.electronAPI?.off) {
          window.electronAPI.off('UPDATE_PROGRESS', handleProgress);
        }
      };
    }
  }, []);

  const startDownload = async () => {
    if (!window.electronAPI) return;
    setStatus('downloading');
    try {
      const result = await window.electronAPI.invoke('START_UPDATE', url);
      if (result.success) {
        setDownloadedPath(result.path);
        setStatus('finished');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const install = async (mode: 'silent' | 'manual') => {
    if (!window.electronAPI || !downloadedPath) return;
    await window.electronAPI.invoke('INSTALL_UPDATE', { path: downloadedPath, mode });
  };

  return (
    <div className="update-overlay">
      <div className="update-modal glass">
        <div className="update-header">
          <div className="update-icon-wrapper">
            {status === 'finished' ? <Check className="update-icon success" size={32} /> : <Rocket className="update-icon" size={32} />}
          </div>
          {status !== 'downloading' && (
            <button className="update-close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className="update-content">
          <div className="update-title-row">
            <h2>{status === 'finished' ? t('update.downloadComplete') : t('update.newUpdateAvailable')}</h2>
            {isBeta && <span className="beta-badge">BETA</span>}
          </div>
          <p>
            {status === 'finished' 
              ? t('update.readyToInstall', { version })
              : t('update.readyForYou', { version })}
          </p>
          
          {status === 'idle' && (
            <div className="update-features">
              <div className="feature-item">
                <div className="feature-dot" />
                <span>{t('update.performanceOptimizations')}</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot" />
                <span>{t('update.enhancedExperience')}</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot" />
                <span>{t('update.securityStabilityFixes')}</span>
              </div>
            </div>
          )}

          {status === 'downloading' && (
            <div className="download-progress-container">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-stats">
                <span>{t('update.downloading')}</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="update-error-box">
              {t('update.downloadFailed')}
            </div>
          )}
        </div>

        <div className="update-footer">
          {status === 'idle' && (
            <>
              <button className="btn-secondary" onClick={onClose}>{t('update.later')}</button>
              <button className="btn-primary" onClick={startDownload}>
                <Download size={18} />
                <span>{t('update.updateNow')}</span>
              </button>
            </>
          )}

          {status === 'finished' && (
            <div className="install-options">
              <button className="btn-install manual" onClick={() => install('manual')}>
                <ExternalLink size={18} />
                <div className="btn-text">
                  <span className="main">{t('update.updateManually')}</span>
                  <span className="sub">{t('update.visibleProgress')}</span>
                </div>
              </button>
              <button className="btn-install silent" onClick={() => install('silent')}>
                <Shield size={18} />
                <div className="btn-text">
                  <span className="main">{t('update.updateSilent')}</span>
                  <span className="sub">{t('update.fastBackground')}</span>
                </div>
              </button>
            </div>
          )}

          {status === 'error' && (
            <button className="btn-primary" onClick={startDownload}>{t('update.retryDownload')}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
