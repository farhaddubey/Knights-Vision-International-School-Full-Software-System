import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  TextField,
  CircularProgress,
  Pagination,
  PaginationItem,
} from '@mui/material';
import { Image, Edit, Delete, Add, RotateRight, Search, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteFeaturePlatformsDialog from './dialogs/SiteFeaturePlatformsDialog';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

const SiteFeaturePlatforms = () => {
  const [platforms, setPlatforms] = useState([]);
  const [filteredPlatforms, setFilteredPlatforms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editFields, setEditFields] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Sync page state with URL
  useEffect(() => {
    console.log('[SiteFeaturePlatforms] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchPlatforms = async (pageNum = 1) => {
    const token = Cookies.get('faculties_token');
    console.log('[fetchPlatforms] Token present:', !!token);
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/site-feature-platforms/get-for-admin`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize },
      });

      console.log('[fetchPlatforms] Response:', response.data);

      if (!response.data || !Array.isArray(response.data.platforms)) {
        throw new Error('Invalid response format: platforms array missing');
      }

      setPlatforms(response.data.platforms);
      setFilteredPlatforms(response.data.platforms);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchPlatforms] totalPages set to:', response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching platforms:', err);
      setError(err.response?.data?.error || 'Failed to fetch platforms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[SiteFeaturePlatforms] Fetching platforms for page:', page);
    fetchPlatforms(page);
  }, [page]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = platforms.filter((platform) =>
      platform.title?.toLowerCase().includes(query) || 
      platform.description?.toLowerCase().includes(query)
    );
    setFilteredPlatforms(filtered);
  };

  const handleOpenDialog = (platform = null) => {
    if (platform) {
      setEditFields([{
        id: platform.id,
        title: platform.title || '',
        description: platform.description || '',
        page_link: platform.page_link || '',
        img_url: platform.img_url || ''
      }]);
    } else {
      setEditFields([{ title: '', description: '', page_link: '', img_url: '' }]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (window.confirm('Are you sure you want to close the modal, unsaved?')) {
      setOpenDialog(false);
      setEditFields([]);
    }
  };

  const handleSaveAndCloseDialog = () => {
    setOpenDialog(false);
    setEditFields([]);
  };

  const handleDeletePlatform = async (id) => {
    if (!window.confirm('Are you sure you want to delete this platform?')) return;
    const token = Cookies.get('faculties_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }
    try {
      await axios.delete(`/api/site-feature-platforms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ Platform deleted successfully!');
      fetchPlatforms(page);
    } catch (err) {
      console.error('Delete Error:', err.response?.data || err.message);
      toast.error('❌ Error deleting platform.');
    }
  };

  const handlePageChange = (event, value) => {
    console.log('[SiteFeaturePlatforms] Page changed to:', value);
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={120} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color='error' sx={{ textAlign: 'center', mt: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: '#212121',
        height: `calc(100vh - ${appBarHeight}px)`,
        color: '#fff',
      }}
    >
      <ListItemButton
        sx={{
          backgroundColor: '#181818',
          color: '#fff',
          '&:hover': { backgroundColor: '#181818' },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '8px 16px',
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ fontSize: 30, color: 'orange', fontWeight: 'bold' }}>
          🖥️
        </ListItemIcon>
        <ListItemText primary='Feature Platforms Control Panel' />
        <TextField
          placeholder='Search by Title or Description'
          value={searchQuery}
          onChange={handleSearch}
          size='small'
          sx={{
            width: '250px',
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
          InputProps={{
            startAdornment: <Search sx={{ color: '#fff', mr: 1 }} />,
          }}
        />
        <Button
          onClick={() => fetchPlatforms(page)}
          variant='outlined'
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button variant='contained' color='primary' onClick={() => handleOpenDialog()}>
          <Add /> Add New Platform
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: '#181818', borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
            bgcolor: '#333',
            borderRadius: 1,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Typography variant='body2' sx={{ flex: 0.5, fontWeight: 'bold', color: '#fff' }}>
            ID
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Title
          </Typography>
          <Typography variant='body2' sx={{ flex: 2, fontWeight: 'bold', color: '#fff' }}>
            Description
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Page Link
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Image Preview
          </Typography>
          <Box sx={{ flex: 0.8 }}></Box>
        </Box>

        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 150}px)`, overflowY: 'auto', bgcolor: '#121212', borderRadius: 1, paddingBottom: 10 }}>
          <List>
            {filteredPlatforms.length > 0 ? (
              filteredPlatforms.map((platform) => (
                <ListItem
                  key={platform.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1,
                    bgcolor: '#181818',
                    mb: 1,
                    borderRadius: 1,
                    borderBottom: '2px solid #333',
                  }}
                >
                  <Typography variant='body2' sx={{ flex: 0.5, color: '#fff' }}>
                    {platform.id}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {platform.title ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 2, color: '#fff' }}>
                    {platform.description ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {platform.page_link ?? 'N/A'}
                  </Typography>
                  <Box
                    component='img'
                    src={platform.img_url ?? '/placeholder.png'}
                    alt='Platform Image'
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, flex: 1 }}
                  />
                  <Box sx={{ flex: 0.8, display: 'flex', gap: 1 }}>
                    <Button variant='outlined' color='primary' onClick={() => handleOpenDialog(platform)}>
                      <Edit /> Edit
                    </Button>
                    <Button variant='outlined' color='error' onClick={() => handleDeletePlatform(platform.id)}>
                      <Delete /> Delete
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No platforms found.
              </Typography>
            )}
          </List>
        </Box>

        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: `calc(${drawerWidth}px + 50%)`,
            transform: 'translateX(-50%)',
            bgcolor: '#181818',
            borderRadius: 2,
            p: 1,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 1000,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color='primary'
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#fff',
                '&:hover': { bgcolor: '#333' },
                '&.Mui-selected': {
                  bgcolor: greenAccent,
                  color: '#000',
                  '&:hover': { bgcolor: greenAccent },
                },
              },
            }}
            renderItem={(item) => (
              <PaginationItem
                components={{ previous: ChevronLeft, next: ChevronRight }}
                {...item}
              />
            )}
          />
        </Box>
      </Box>

      <SiteFeaturePlatformsDialog
        openInsertion={openDialog}
        handleCloseModal={handleCloseDialog}
        handleSaveAndCloseModal={handleSaveAndCloseDialog}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchPlatforms={fetchPlatforms}
      />
    </Box>
  );
};

export default SiteFeaturePlatforms;