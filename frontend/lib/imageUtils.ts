/**
 * Utility functions for handling property images
 */

/**
 * Convert relative image URLs to full URLs for local uploads
 * Handles both Cloudinary URLs and local /uploads/ URLs
 */
export const getFullImageUrl = (url?: string): string => {
  if (!url) {
    return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';
  }
  
  // Already a full URL (http or https)
  if (url.startsWith('http')) {
    return url;
  }
  
  // Local upload - convert relative to full URL
  if (url.startsWith('/uploads/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${url}`;
  }
  
  return url;
};

/**
 * Check if an image should use Next.js optimization
 * Returns true for localhost URLs (unoptimized), false for external URLs (optimized)
 */
export const shouldUnoptimizeImage = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('localhost') || url.includes('127.0.0.1');
};
