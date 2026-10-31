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
import { Edit, Delete, Add, RotateRight, Search, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
// import AdmissionTestDialog from './dialogs/AdmissionTestDialog';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

const AdmissionTestManagement = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchTests = async (pageNum = 1) => {
    const token = Cookies.get('faculties_token');
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/admission-tests', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize },
      });
      if (!response.data || !Array.isArray(response.data.tests)) {
        throw new Error('Invalid response format: tests array missing');
      }
      setTests(response.data.tests);
      setFilteredTests(response.data.tests);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching admission tests:', err);
      setError(err.response?.data?.error || 'Failed to fetch admission tests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests(page);
  }, [page]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = tests.filter((test) =>
      test.name.toLowerCase().includes(query) ||
      test.class?.name?.toLowerCase().includes(query) ||
      test.class?.section?.toLowerCase().includes(query)
    );
    setFilteredTests(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
  };

  const handleOpenDialog = (test = null) => {
    handleDeleteTest(); 
  };

  const handleDeleteTest = async () => {
      toast.success('✅ Authenticating Permissions...');
      toast.error('❌ Permission Denied !');
  };

  const handlePageChange = (event, value) => {
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
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
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
          📋
        </ListItemIcon>
        <ListItemText primary='Admission Test Management Control Panel' />
        <TextField
          placeholder='Search by Test Name or Class'
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
          onClick={() => fetchTests(page)}
          variant='outlined'
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button variant='contained' color='primary' onClick={() => handleOpenDialog()}>
          <Add /> Add New Test
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
            Name
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Class
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Test Date
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Max Marks
          </Typography>
          <Box sx={{ flex: 0.8 }}></Box>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: 'auto', bgcolor: '#121212', borderRadius: 1 }}>
          <List>
            {filteredTests.length > 0 ? (
              filteredTests.slice((page - 1) * pageSize, page * pageSize).map((test) => (
                <ListItem
                  key={test.id}
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
                    {test.id}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {test.name}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {test.class?.name ? `${test.class.name}${test.class.section ? ` - ${test.class.section}` : ''}` : 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {test.testDate ? new Date(test.testDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {test.maxMarks}
                  </Typography>
                  <Box sx={{ flex: 0.8, display: 'flex', gap: 1 }}>
                    <Button variant='outlined' color='primary' onClick={() => handleOpenDialog()}>
                      <Edit /> Edit
                    </Button>
                    <Button variant='outlined' color='error' onClick={() => handleDeleteTest()}>
                      <Delete /> Delete
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No admission tests found.
              </Typography>
            )}
          </List>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 1,
            bgcolor: '#181818',
            borderRadius: 2,
            mt: 2,
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
    </Box>
  );
};

export default AdmissionTestManagement;