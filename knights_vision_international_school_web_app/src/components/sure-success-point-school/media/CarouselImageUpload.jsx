'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { CloudUpload, Image as ImageIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const maxBytes = 12 * 1024 * 1024;

/** A compact, reusable public-image uploader for carousel dialogs. */
export default function CarouselImageUpload({ value, onChange, folder = 'homepage' }) {
  const inputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => {
    if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const uploadFile = async (file) => {
    if (!file) return;
    if (!acceptedTypes.includes(file.type) || file.size <= 0 || file.size > maxBytes) {
      setError('Use a JPEG, PNG, WebP, or GIF image smaller than 12 MB.');
      return;
    }
    if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(file));
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('visibility', 'public');
      formData.append('folder', folder);
      const response = await fetch('/api/r2/files', { method: 'POST', body: formData, credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Image upload failed.');
      onChange(payload.url);
      setLocalPreview('');
      toast.success('Carousel image uploaded and selected.');
    } catch (uploadError) {
      setError(uploadError.message || 'Image upload failed.');
      toast.error(uploadError.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const preview = localPreview || value;
  return (
    <Box sx={{ border: '1px dashed #5b5b5b', borderRadius: 1.5, p: 1.25, bgcolor: '#111' }}>
      <input ref={inputRef} hidden type="file" accept={acceptedTypes.join(',')} onChange={(event) => uploadFile(event.target.files?.[0])} />
      <Box
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); uploadFile(event.dataTransfer.files?.[0]); }}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 1, bgcolor: dragging ? 'rgba(0,200,83,.12)' : 'transparent' }}
      >
        {preview ? <Box component="img" src={preview} alt="Carousel preview" sx={{ width: 94, height: 62, objectFit: 'cover', borderRadius: 1, bgcolor: '#000' }} /> : <ImageIcon sx={{ color: '#00c853', fontSize: 38 }} />}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700}>Upload carousel image</Typography>
          <Typography variant="caption" sx={{ color: '#aaa' }}>Drag here or choose a public image. It is optimized and linked automatically.</Typography>
        </Box>
        <Button onClick={() => inputRef.current?.click()} disabled={uploading} size="small" variant="outlined" startIcon={uploading ? <CircularProgress size={15} color="inherit" /> : <CloudUpload />} sx={{ color: '#00c853', borderColor: '#00c853', whiteSpace: 'nowrap' }}>
          {uploading ? 'Uploading' : 'Choose'}
        </Button>
      </Box>
      {error && <Typography color="error" variant="caption" sx={{ display: 'block', mt: .5 }}>{error}</Typography>}
    </Box>
  );
}
