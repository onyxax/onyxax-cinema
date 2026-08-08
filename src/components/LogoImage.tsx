import React, { useState } from 'react';
import { analyzeImageTone, isDarkLogo } from '../utils/logo';

interface LogoImageProps {
  src: string;
  alt?: string;
  className: string;
  fallback?: React.ReactNode;
}

const LogoImage: React.FC<LogoImageProps> = ({ src, alt = '', className, fallback = null }) => {
  const [failed, setFailed] = useState(false);
  const [dark, setDark] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      crossOrigin="anonymous"
      decoding="async"
      className={dark ? `${className} dark` : className}
      onLoad={(e) => {
        analyzeImageTone(e.currentTarget).then((tone) => setDark(isDarkLogo(tone)));
      }}
      onError={() => setFailed(true)}
    />
  );
};

export default LogoImage;
