// components/FeeSchemes.js
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
import FeeSchemeDialog from './dialogs/FeeSchemeDialog';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

const FeeSchemes = () => {
  const [feeSchemes, setFeeSchemes] = useState([]);
  const [filteredFeeSchemes, setFilteredFeeSchemes] = useState([]);
  const [searchQuerySchemes, setSearchQuerySchemes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFeeSchemeDialog, setOpenFeeSchemeDialog] = useState(false);
  const [feeSchemeEditFields, setFeeSchemeEditFields] = useState([]);
  const [pageSchemes, setPageSchemes] = useState(1);
  const [totalPagesSchemes, setTotalPagesSchemes] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPageSchemes = parseInt(searchParams.get('pageSchemes') || '1', 10);

  useEffect(() => {
    setPageSchemes(currentPageSchemes);
  }, [currentPageSchemes]);

  const fetchFeeSchemes = async (pageNum = 1) => {
    const token = Cookies.get('faculties_token');
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/fee-schemes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize },
      });
      if (!response.data.feeSchemes || !Array.isArray(response.data.feeSchemes)) {
        throw new Error('Invalid response format: fee schemes array missing');
      }
      setFeeSchemes(response.data.feeSchemes);
      setFilteredFeeSchemes(response.data.feeSchemes);
      setTotalPagesSchemes(response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching fee schemes:', err);
      setError(err.response?.data?.error || 'Failed to fetch fee schemes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeSchemes(pageSchemes);
  }, [pageSchemes]);

  const handleSearchSchemes = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuerySchemes(query);
    const filtered = feeSchemes.filter(
      (feeScheme) =>
        feeScheme.class?.name?.toLowerCase().includes(query) ||
        feeScheme.class?.section?.toLowerCase().includes(query)
    );
    setFilteredFeeSchemes(filtered);
    setTotalPagesSchemes(Math.ceil(filtered.length / pageSize) || 1);
  };

  const handleOpenFeeSchemeDialog = () => {
    handleDeleteFeeScheme();
  };

  const handleDeleteFeeScheme = async () => {
      toast.success('✅ Authenticating Permissions...!');
      toast.error('❌ Permission Denied.');
  };

  const handlePageChangeSchemes = (event, value) => {
    setPageSchemes(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('pageSchemes', value.toString());
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
      <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
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
        <ListItemIcon sx={{ fontSize: 30, color: 'orange', fontWeight: 'bold' }}>💰</ListItemIcon>
        <ListItemText primary="Fee Schemes Control Panel" />
           <Box sx={{ display: 'flex', justifyContent: 'flex-end', }}>
          <TextField
            placeholder="Search by Class Name"
            value={searchQuerySchemes}
            onChange={handleSearchSchemes}
            size="small"
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
        </Box>
        <Button
          onClick={() => fetchFeeSchemes(pageSchemes)}
          variant="outlined"
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleOpenFeeSchemeDialog()}>
          <Add /> Add New Fee Scheme
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
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: 'bold', color: '#fff' }}>
            ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Class
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Category
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Monthly Fee
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Admission Fee
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Readmission Fee
          </Typography>
          <Box sx={{ flex: 0.8 }}></Box>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 250}px)`, overflowY: 'auto', bgcolor: '#121212', borderRadius: 1 }}>
          <List>
            {filteredFeeSchemes.length > 0 ? (
              filteredFeeSchemes
                .slice((pageSchemes - 1) * pageSize, pageSchemes * pageSize)
                .map((feeScheme) => (
                  <ListItem
                    key={feeScheme.id}
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
                    <Typography variant="body2" sx={{ flex: 0.5, color: '#fff' }}>
                      {feeScheme.id}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: '#fff' }}>
                      {feeScheme.class?.name
                        ? `${feeScheme.class.name}${feeScheme.class.section ? ` - ${feeScheme.class.section}` : ''}`
                        : 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: '#fff' }}>
                      {feeScheme.category}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: '#fff' }}>
                      {feeScheme.monthlyFee}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: '#fff' }}>
                      {feeScheme.admissionFee}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: '#fff' }}>
                      {feeScheme.readmissionFee}
                    </Typography>
                    <Box sx={{ flex: 0.8, display: 'flex', gap: 1 }}>
                      <Button variant="outlined" color="primary" onClick={() => handleOpenFeeSchemeDialog()}>
                        <Edit /> Edit
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => handleDeleteFeeScheme()}>
                        <Delete /> Delete
                      </Button>
                    </Box>
                  </ListItem>
                ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>No fee schemes found.</Typography>
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
            count={totalPagesSchemes}
            page={pageSchemes}
            onChange={handlePageChangeSchemes}
            color="primary"
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
            renderItem={(item) => <PaginationItem components={{ previous: ChevronLeft, next: ChevronRight }} {...item} />}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default FeeSchemes;