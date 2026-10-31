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
import FeatureTechnologyDialog from './dialogs/FeatureTechnologyDialog';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

const FeatureTechnology = () => {
  const [technologies, setTechnologies] = useState([]);
  const [filteredTechnologies, setFilteredTechnologies] = useState([]);
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
    console.log('[FeatureTechnology] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchTechnologies = async (pageNum = 1) => {
    const token = Cookies.get('faculties_token');
    console.log('[fetchTechnologies] Token present:', !!token);
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/feature-technology/get-for-admin`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize },
      });

      console.log('[fetchTechnologies] Response:', response.data);

      if (!response.data || !Array.isArray(response.data.technologies)) {
        throw new Error('Invalid response format: technologies array missing');
      }

      setTechnologies(response.data.technologies);
      setFilteredTechnologies(response.data.technologies);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchTechnologies] totalPages set to:', response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching technologies:', err);
      setError(err.response?.data?.error || 'Failed to fetch technologies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[FeatureTechnology] Fetching technologies for page:', page);
    fetchTechnologies(page);
  }, [page]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = technologies.filter((tech) =>
      tech.title_1?.toLowerCase().includes(query) ||
      tech.title_2?.toLowerCase().includes(query) ||
      tech.img_url?.toLowerCase().includes(query)
    );
    setFilteredTechnologies(filtered);
  };

  const handleOpenDialog = (tech = null) => {
    if (tech) {
      setEditFields([{
        id: tech.id,
        img_url: tech.img_url || '',
        page_link: tech.page_link || '',
        title_1: tech.title_1 || '',
        title_2: tech.title_2 || ''
      }]);
    } else {
      setEditFields([{ img_url: '', page_link: '', title_1: '', title_2: '' }]);
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

  const handleDeleteTechnology = async (id) => {
    if (!window.confirm('Are you sure you want to delete this technology?')) return;
    const token = Cookies.get('faculties_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }
    try {
      await axios.delete(`/api/feature-technology/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ Technology deleted successfully!');
      fetchTechnologies(page);
    } catch (err) {
      console.error('Delete Error:', err.response?.data || err.message);
      toast.error('❌ Error deleting technology.');
    }
  };

  const handlePageChange = (event, value) => {
    console.log('[FeatureTechnology] Page changed to:', value);
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
          ⚙️
        </ListItemIcon>
        <ListItemText primary='Feature Technologies Control Panel' />
        <TextField
          placeholder='Search by Title or Image URL'
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
          onClick={() => fetchTechnologies(page)}
          variant='outlined'
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button variant='contained' color='primary' onClick={() => handleOpenDialog()}>
          <Add /> Add New Technology
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
            Image Preview
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Title 1
          </Typography>
          <Typography variant='body2' sx={{ flex: 2, fontWeight: 'bold', color: '#fff' }}>
            Title 2
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Page Link
          </Typography>
          <Box sx={{ flex: 0.8 }}></Box>
        </Box>

        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 150}px)`, overflowY: 'auto', bgcolor: '#121212', borderRadius: 1, paddingBottom: 10 }}>
          <List>
            {filteredTechnologies.length > 0 ? (
              filteredTechnologies.map((tech) => (
                <ListItem
                  key={tech.id}
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
                    {tech.id}
                  </Typography>
                  <Box
                    component='img'
                    src={tech.img_url ?? '/placeholder.png'}
                    alt='Technology Image'
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, flex: 1 }}
                  />
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {tech.title_1 ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 2, color: '#fff' }}>
                    {tech.title_2 ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {tech.page_link ?? 'N/A'}
                  </Typography>
                  <Box sx={{ flex: 0.8, display: 'flex', gap: 1 }}>
                    <Button variant='outlined' color='primary' onClick={() => handleOpenDialog(tech)}>
                      <Edit /> Edit
                    </Button>
                    <Button variant='outlined' color='error' onClick={() => handleDeleteTechnology(tech.id)}>
                      <Delete /> Delete
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No technologies found.
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

      <FeatureTechnologyDialog
        openInsertion={openDialog}
        handleCloseModal={handleCloseDialog}
        handleSaveAndCloseModal={handleSaveAndCloseDialog}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchTechnologies={fetchTechnologies}
      />
    </Box>
  );
};

export default FeatureTechnology;