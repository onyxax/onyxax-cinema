export interface ImageTone {
  luminance: number;
  saturation: number;
}

export const analyzeImageTone = (img: HTMLImageElement, size = 48): Promise<ImageTone> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve({ luminance: 1, saturation: 0 });
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      let luminance = 0;
      let saturation = 0;
      let seen = 0;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3] / 255;
        if (alpha < 0.08) continue;
        const r = data[i] / alpha;
        const g = data[i + 1] / alpha;
        const b = data[i + 2] / alpha;
        luminance += 0.299 * r + 0.587 * g + 0.114 * b;
        saturation += Math.max(r, g, b) - Math.min(r, g, b);
        seen++;
      }

      if (seen === 0) {
        resolve({ luminance: 1, saturation: 0 });
        return;
      }

      resolve({
        luminance: luminance / seen / 255,
        saturation: saturation / seen / 255
      });
    } catch {
      resolve({ luminance: 1, saturation: 0 });
    }
  });
};

export const isDarkLogo = (tone: ImageTone): boolean =>
  tone.luminance < 0.6 && tone.saturation < 0.22;
