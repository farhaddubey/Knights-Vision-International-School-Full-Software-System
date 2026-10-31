'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AddPhotoAlternate, ContentCopy, DeleteOutline, Image as ImageIcon, Refresh, Search } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileDialog from './FileDialog';

const pageSize = 24;

function imageName(file) {
  return file?.name || 'Untitled image';
}

export default function UploadImagesPanel() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFiles = async (nextPage = page, nextQuery = query, nextVisibility = visibility) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(nextPage), pageSize: String(pageSize), visibility: nextVisibility });
      if (nextQuery.trim()) params.set('q', nextQuery.trim());
      const response = await fetch(`/api/r2/files?${params.toString()}`, { credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to load images.');
      setFiles(payload.files || []);
      setTotalPages(payload.totalPages || 1);
      setPage(payload.currentPage || nextPage);
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(1, '', 'all'); }, []); // Initial library load.

  const emptyText = useMemo(() => query || visibility !== 'all' ? 'No images match this filter.' : 'No images have been uploaded yet.', [query, visibility]);

  const copyUrl = async (file) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${file.url}`);
      toast.success('Image URL copied.');
    } catch {
      toast.error('The URL could not be copied.');
    }
  };

  const deleteFile = async (file) => {
    if (file.visibility === 'legacy') {
      toast.info('This is a legacy R2 record. Keep it available until its source is migrated.');
      return;
    }
    if (!window.confirm(`Delete “${imageName(file)}”? This cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/r2/files/${file.id}`, { method: 'DELETE', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to delete image.');
      toast.success('Image deleted.');
      fetchFiles(files.length === 1 && page > 1 ? page - 1 : page);
    } catch (deleteError) {
      toast.error(deleteError.message || 'Unable to delete image.');
    }
  };

  const applyQuery = () => fetchFiles(1, query, visibility);

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#212121', color: '#fff', p: { xs: 1.5, md: 2.5 } }}>
      <ToastContainer position="bottom-center" theme="dark" />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25, mb: 2, p: 1.5, bgcolor: '#181818', borderRadius: 2 }}>
        <ImageIcon sx={{ color: '#00c853' }} />
        <Box sx={{ mr: 'auto' }}>
          <Typography fontWeight={800}>Image Library</Typography>
          <Typography variant="caption" sx={{ color: '#aaa' }}>Secure Backblaze storage · direct carousel-ready uploads</Typography>
        </Box>
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && applyQuery()}
          placeholder="Search image name"
          size="small"
          InputProps={{ startAdornment: <Search fontSize="small" sx={{ color: '#aaa', mr: .8 }} /> }}
          sx={{ minWidth: 205, '& .MuiInputBase-input': { color: '#fff' }, '& .MuiOutlinedInput-root': { bgcolor: '#292929', '& fieldset': { borderColor: '#555' } } }}
        />
        <FormControl size="small" sx={{ minWidth: 145 }}>
          <InputLabel sx={{ color: '#bbb' }}>Show</InputLabel>
          <Select label="Show" value={visibility} onChange={(event) => { setVisibility(event.target.value); fetchFiles(1, query, event.target.value); }} sx={{ color: '#fff', bgcolor: '#292929', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '& .MuiSvgIcon-root': { color: '#fff' } }}>
            <MenuItem value="all">All images</MenuItem>
            <MenuItem value="private">Private</MenuItem>
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="legacy">Legacy R2</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="Refresh library"><IconButton onClick={() => fetchFiles()} sx={{ color: '#00c853' }}><Refresh /></IconButton></Tooltip>
        <Button variant="contained" startIcon={<AddPhotoAlternate />} onClick={() => setOpen(true)} sx={{ bgcolor: '#00a844', '&:hover': { bgcolor: '#00c853' } }}>Upload image</Button>
      </Box>

      {error ? <Typography color="error" sx={{ p: 3, textAlign: 'center' }}>{error}</Typography> : loading ? (
        <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}><CircularProgress size={64} sx={{ color: '#00c853' }} /></Box>
      ) : files.length === 0 ? (
        <Typography sx={{ p: 5, textAlign: 'center', color: '#aaa' }}>{emptyText}</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 1.5 }}>
          {files.map((file) => (
            <Card key={file.id} sx={{ bgcolor: '#181818', color: '#fff', border: '1px solid #363636', overflow: 'hidden' }}>
              <Box component="img" src={file.url} alt={imageName(file)} sx={{ height: 156, width: '100%', objectFit: 'cover', bgcolor: '#0d0d0d' }} />
              <CardContent sx={{ pb: .5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: .75, mb: .5 }}>
                  <Typography noWrap title={imageName(file)} fontWeight={700} sx={{ flex: 1 }}>{imageName(file)}</Typography>
                  <Chip size="small" label={file.visibility} color={file.visibility === 'public' ? 'success' : file.visibility === 'legacy' ? 'warning' : 'default'} />
                </Box>
                <Typography variant="caption" sx={{ color: '#aaa', display: 'block' }}>{file.mime} · {Number(file.size || 0).toFixed(1)} KB</Typography>
                <Typography variant="caption" sx={{ color: '#777', display: 'block', mt: .25 }}>{file.createdBy?.email || 'Legacy upload'}</Typography>
              </CardContent>
              <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                <Button size="small" startIcon={<ContentCopy />} onClick={() => copyUrl(file)} sx={{ color: '#90caf9' }}>Copy URL</Button>
                <Tooltip title={file.visibility === 'legacy' ? 'Legacy storage is read-only here' : 'Delete image'}>
                  <span><IconButton disabled={file.visibility === 'legacy'} onClick={() => deleteFile(file)} sx={{ color: '#ef5350' }}><DeleteOutline /></IconButton></span>
                </Tooltip>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5 }}>
        <Pagination count={totalPages} page={page} onChange={(_, next) => fetchFiles(next)} sx={{ '& .MuiPaginationItem-root': { color: '#fff' }, '& .Mui-selected': { bgcolor: '#00a844 !important' } }} />
      </Box>
      <FileDialog open={open} handleCloseModal={() => setOpen(false)} handleSaveAndCloseModal={() => { setOpen(false); fetchFiles(1, query, visibility); }} />
    </Box>
  );
}
