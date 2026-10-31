import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  LinearProgress,
  TextField,
  InputAdornment,
  Pagination,
  PaginationItem,
} from '@mui/material';
import { AccessTime, Add, RotateRight, Delete, Search, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import BrowseTimezonesDialog from './dialogs/BrowseTimezonesDialog';

const drawerWidth = 280;
const appBarHeight = 80;
const pageSize = 10;
const greenAccent = '#00c853';

const BrowseTimezones = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timezones, setTimezones] = useState([]);
  const [filteredTimezones, setFilteredTimezones] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Sync page state with URL
  useEffect(() => {
    console.log('[BrowseTimezones] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchTimezones = async (pageNum = 1) => {
    setApiLoading(true);
    try {
      setError(null);
      const response = await axios.get('/api/timezones', {
        params: { page: pageNum, pageSize },
      });

      // Log response for debugging
      console.log('[fetchTimezones] Response:', response.data);

      // Validate response structure
      if (!response.data || !Array.isArray(response.data.timezones)) {
        throw new Error('Invalid response format: timezones array missing');
      }

      setTimezones(response.data.timezones);
      setFilteredTimezones(response.data.timezones);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchTimezones] totalPages set to:', response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching timezones:', err);
      setError(err.response?.data?.error || 'Failed to fetch timezones.');
      toast.error('Failed to fetch timezones.');
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  // Fetch timezones when page changes
  useEffect(() => {
    console.log('[BrowseTimezones] Fetching timezones for page:', page);
    fetchTimezones(page);
  }, [page]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = timezones.filter((timezone) =>
      [timezone.name, timezone.offset].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
    setFilteredTimezones(filtered);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm(
      'Are you sure you want to close the modal? Unsaved changes will be lost.'
    );
    if (userConfirmed) {
      setOpenInsertion(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpenInsertion(false);
    fetchTimezones(page);
    setEditFields({});
  };

  const handleInsertionOpenModal = (timezone = {}) => {
    setEditFields({
      id: timezone.id ?? null,
      name: timezone.name ?? '',
      offset: timezone.offset ?? '',
    });
    setOpenInsertion(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timezone?')) {
      setApiLoading(true);
      try {
        await axios.delete(`/api/timezones/${id}`);
        toast.success('Timezone deleted successfully!');
        fetchTimezones(page);
      } catch (err) {
        console.error('Delete Error:', err);
        toast.error('Failed to delete timezone.');
      } finally {
        setApiLoading(false);
      }
    }
  };

  const handlePageChange = (event, value) => {
    console.log('[BrowseTimezones] Page changed to:', value);
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
        minWidth: `82vw`,
        backgroundColor: '#212121',
        height: `calc(100vh - ${appBarHeight}px)`,
        color: '#fff',
      }}
    >
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />
      {apiLoading && <LinearProgress sx={{ width: '100%', position: 'absolute', top: 0 }} />}
      <ListItem
        sx={{
          backgroundColor: '#b71c1c',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '8px 16px',
        }}
      >
        <AccessTime sx={{ mr: 1 }} />
        <ListItemText primary='Browse Timezones' />
        <TextField
          placeholder='Search by Name or Offset'
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
          onClick={() => handleInsertionOpenModal()}
          variant='contained'
          color='primary'
          startIcon={<Add />}
          sx={{ mr: 1 }}
        >
          Add Timezone
        </Button>
        <Button
          onClick={() => fetchTimezones(page)}
          variant='outlined'
          sx={{ color: greenAccent, borderColor: greenAccent }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
      </ListItem>

      <Box sx={{ bgcolor: '#181818', borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
            bgcolor: '#333',
            borderRadius: 1,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Name
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Offset
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Actions
          </Typography>
        </Box>

        <Box
          sx={{
            maxHeight: `calc(100vh - ${appBarHeight + 150}px)`,
            overflowY: 'auto',
            bgcolor: '#121212',
            borderRadius: 1,
            paddingBottom: 10,
          }}
        >
          <List>
            {filteredTimezones.length > 0 ? (
              filteredTimezones.map((timezone) => (
                <ListItem
                  key={timezone.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1,
                    bgcolor: '#181818',
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {timezone.name}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {timezone.offset}
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                    <Button
                      variant='contained'
                      color='success'
                      onClick={() => handleInsertionOpenModal(timezone)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant='contained'
                      color='error'
                      onClick={() => handleDelete(timezone.id)}
                      startIcon={<Delete />}
                    >
                      Delete
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No timezones found.
              </Typography>
            )}
          </List>
        </Box>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, bgcolor: '#181818' }}>
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

      <BrowseTimezonesDialog
        openInsertion={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchTimezones={fetchTimezones}
      />
    </Box>
  );
};

export default BrowseTimezones;