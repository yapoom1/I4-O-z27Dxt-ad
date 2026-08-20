import React, { useState } from 'react';
import { uploadMedia } from '../utils/upload';

interface ImageUploadWidgetProps {
  userToken: string;
  onImageUploaded: (url: string) => void;
}

const ImageUploadWidget: React.FC<ImageUploadWidgetProps> = ({ userToken, onImageUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      
      // 1. Send file to the FastAPI backend
      // We pass "logo" here. If uploading a product image, pass "product" instead.
      const publicUrl = await uploadMedia(file, "logo", userToken);
      
      // 2. Display preview in UI
      setPreviewUrl(publicUrl);
      
      // 3. Pass URL up to parent form component to include in the GraphQL mutation
      onImageUploaded(publicUrl);

    } catch (err: any) {
      setError(err.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={{ fontWeight: 'bold' }}>Upload Logo Image</label>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        disabled={isUploading}
      />
      
      {isUploading && <p style={{ color: '#007bff' }}>Uploading to cloud...</p>}
      
      {previewUrl && (
        <div style={{ marginTop: '10px' }}>
          <p>Uploaded Successfully:</p>
          <img src={previewUrl} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
        </div>
      )}
    </div>
  );
}

export default ImageUploadWidget;
