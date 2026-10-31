'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Close, CloudUpload, Image as ImageIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const maxBytes = 12 * 1024 * 1024;

export default function FileDialog({ open, handleCloseModal, handleSaveAndCloseModal }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [folder, setFolder] = useState('library');
  const [uploading, setUploading] = useState(false);
  const [uploadSeconds, setUploadSeconds] = useState(0);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (!uploading) {
      setUploadSeconds(0);
      return undefined;
    }
    const startedAt = Date.now();
    const timer = window.setInterval(() => setUploadSeconds(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => window.clearInterval(timer);
  }, [uploading]);

  const reset = () => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview('');
    setVisibility('private');
    setFolder('library');
    setError('');
    setDragging(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const selectFile = (selected) => {
    if (!selected) return;
    if (!acceptedTypes.includes(selected.type)) {
      setError('Use a JPEG, PNG, WebP, or GIF image.');
      return;
    }
    if (selected.size <= 0 || selected.size > maxBytes) {
      setError('Choose an image smaller than 12 MB.');
      return;
    }
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError('');
  };

  const close = () => {
    if (!uploading) {
      reset();
      handleCloseModal();
    }
  };

  const upload = async () => {
    if (!file) {
      setError('Choose an image before uploading.');
      return;
    }
    setUploading(true);
    setError('');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 90_000);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('visibility', visibility);
      data.append('folder', folder || 'library');
      const response = await fetch('/api/r2/files', {
        method: 'POST',
        body: data,
        credentials: 'include',
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Image upload failed.');
      toast.success(visibility === 'public' ? 'Public image uploaded.' : 'Private image uploaded.');
      reset();
      handleSaveAndCloseModal(payload);
    } catch (uploadError) {
      const message = uploadError?.name === 'AbortError'
        ? 'Upload timed out after 90 seconds. Please try again.'
        : uploadError.message || 'Image upload failed.';
      setError(message);
      toast.error(message);
    } finally {
      window.clearTimeout(timeout);
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#181818', color: '#fff', border: '1px solid #3d3d3d', borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#242424' }}>
        <ImageIcon sx={{ color: '#00c853' }} /> Upload Image
        <IconButton onClick={close} disabled={uploading} sx={{ ml: 'auto', color: '#fff' }} aria-label="Close upload dialog">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important' }}>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files?.[0]); }}
          sx={{
            minHeight: 190,
            border: `2px dashed ${dragging ? '#00c853' : '#666'}`,
            bgcolor: dragging ? 'rgba(0, 200, 83, .08)' : '#101010',
            borderRadius: 2,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            transition: 'all .15s ease',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={acceptedTypes.join(',')}
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
          {preview ? (
            <Box component="img" src={preview} alt="Selected image preview" sx={{ width: '100%', height: 260, objectFit: 'contain', bgcolor: '#000' }} />
          ) : (
            <Box sx={{ textAlign: 'center', px: 3 }}>
              <CloudUpload sx={{ fontSize: 44, color: '#00c853', mb: 1 }} />
              <Typography fontWeight={700}>Drag an image here or click to choose one</Typography>
              <Typography variant="body2" sx={{ color: '#aaa', mt: .5 }}>JPEG, PNG, WebP, or GIF · maximum 12 MB</Typography>
            </Box>
          )}
        </Box>
        {file && <Typography variant="body2" sx={{ mt: 1.2, color: '#bdbdbd' }}>{file.name} · {(file.size / 1024).toFixed(1)} KB</Typography>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="media-visibility-label" sx={{ color: '#bbb' }}>Visibility</InputLabel>
            <Select
              labelId="media-visibility-label"
              label="Visibility"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
              sx={{ color: '#fff', bgcolor: '#282828', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '& .MuiSvgIcon-root': { color: '#fff' } }}
            >
              <MenuItem value="private">Private library</MenuItem>
              <MenuItem value="public">Public website / carousel</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Folder"
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            helperText="Example: admissions, homepage, campaigns"
            sx={{ '& .MuiInputBase-input': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' }, '& .MuiFormHelperText-root': { color: '#999' }, '& .MuiOutlinedInput-root': { bgcolor: '#282828', '& fieldset': { borderColor: '#555' } } }}
          />
        </Box>
        {visibility === 'private' && <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#ffcc80' }}>Private images can be viewed by authorized staff only. Select public only for website-safe content.</Typography>}
        {uploading && <Typography variant="body2" sx={{ mt: 1.5, color: '#90caf9' }}>Preparing and storing the optimized image securely… {uploadSeconds}s</Typography>}
        {error && <Typography color="error" variant="body2" sx={{ mt: 1.5 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={close} disabled={uploading} color="inherit">Cancel</Button>
        <Button onClick={() => inputRef.current?.click()} disabled={uploading} variant="outlined" sx={{ color: '#00c853', borderColor: '#00c853' }}>Choose image</Button>
        <Button onClick={upload} disabled={uploading || !file} variant="contained" sx={{ bgcolor: '#00a844', '&:hover': { bgcolor: '#00c853' } }}>
          {uploading ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />Uploading… {uploadSeconds}s</> : 'Upload image'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
