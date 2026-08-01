import { Cloudinary } from '@cloudinary/url-gen';

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME
  }
});

/**
 * Uploads a file or a remote URL to Cloudinary.
 * For production, it's better to use a signed upload preset.
 * We'll use a fetch-based approach to the Cloudinary Upload API.
 */
export const uploadImage = async (fileOrUrl: File | string): Promise<string> => {
  const formData = new FormData();
  
  formData.append('file', fileOrUrl);
  // Using 'onyxax_preset' as a custom preset name, or 'ml_default' as fallback.
  // IMPORTANT: The user must create an unsigned upload preset in Cloudinary dashboard.
  formData.append('upload_preset', 'ml_default'); 
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Cloudinary Upload Error:', data);
      throw new Error(data.error?.message || 'Failed to upload image to Cloudinary');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Fetch Error:', error);
    throw error;
  }
};
