import { useState } from 'react';
import { getStoredToken } from '@/shared/auth';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Get token from auth utilities (useAppStore does not have accessToken)
  const token = getStoredToken();
  
  const uploadFile = async (file: File, entityType: string, entityId?: string, oldMediaUrl?: string): Promise<{ url: string, id?: string } | null> => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entity_type', entityType);
      if (entityId) {
        formData.append('entity_id', entityId);
      }
      if (oldMediaUrl) {
        formData.append('old_media_url', oldMediaUrl);
      }
      
      const baseUrl = import.meta.env.VITE_GRAPHQL_ENDPOINT.replace('/graphql', '');
      const response = await fetch(`${baseUrl}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: formData,
      });
      
      if (!response.ok) {
        let errorDetail = 'Upload failed. Please try again.';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorDetail;
        } catch (e) {
          // Fallback to text if not JSON
          const text = await response.text();
          if (text) errorDetail = text;
        }
        throw new Error(errorDetail);
      }
      
      const data = await response.json();
      
      if (!data.url || !data.url.startsWith('http')) {
        throw new Error(`Invalid URL returned from server: ${data.url}`);
      }
      
      return { url: data.url, id: data.id }; 
      
    } catch (err: any) {
      setUploadError(err.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  return { uploadFile, isUploading, uploadError };
};
