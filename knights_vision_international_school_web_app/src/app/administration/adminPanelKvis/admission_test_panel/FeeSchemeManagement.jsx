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
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, RotateRight, Search, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

const FeeSchemeManagement = () => {
  const [feeSchemes, setFeeSchemes] = useState([]);
  const [filteredFeeSchemes, setFilteredFeeSchemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [formData, setFormData] = useState({ classId: '', category: '', admissionFee: '', monthlyFee: '' });
  const [classes, setClasses] = useState([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchFeeSchemes = async (pageNum = 1) => {
    const token = Cookies.get('administration_token');
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/fee-schemes', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize },
      });
      setFeeSchemes(response.data.feeSchemes || []);
      setFilteredFeeSchemes(response.data.feeSchemes || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch fee schemes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    const token = Cookies.get('administration_token');
    try {
      const response = await axios.get('/api/school-classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response.data.classes || []);
    } catch (err) {
      toast.error('Failed to fetch classes.');
    }
  };

  useEffect(() => {
    fetchFeeSchemes(page);
    fetchClasses();
  }, [page]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = feeSchemes.filter((scheme) =>
      scheme.class?.name.toLowerCase().includes(query) ||
      scheme.category.toLowerCase().includes(query)
    );
    setFilteredFeeSchemes(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
  };

  const handleOpenDialog = (scheme = null) => {
    setSelectedScheme(scheme);
    setFormData(scheme ? {
      classId: scheme.classId,
      category: scheme.category,
      admissionFee: scheme.admissionFee,
      monthlyFee: scheme.monthlyFee,
    } : { classId: '', category: '', admissionFee: '', monthlyFee: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (window.confirm('Close without saving?')) {
      setOpenDialog(false);
      setSelectedScheme(null);
      setFormData({ classId: '', category: '', admissionFee: '', monthlyFee: '' });
    }
  };

  const handleSaveScheme = async () => {
    const token = Cookies.get('administration_token');
    if (!formData.classId || !formData.category || !formData.admissionFee || !formData.monthlyFee) {
      toast.error('All fields are required.');
      return;
    }
    try {
      if (selectedScheme) {
        await axios.put(`/api/fee-schemes/${selectedScheme.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/fee-schemes', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      toast.success('🎉 Fee scheme saved!');
      fetchFeeSchemes(page);
      handleCloseDialog();
    } catch (err) {
      toast.error('❌ Failed to save fee scheme.');
    }
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
          💰
        </ListItemIcon>
        <ListItemText primary='Fee Scheme Management Control Panel' />
        <TextField
          placeholder='Search by Class or Category'
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
          onClick={() => fetchFeeSchemes(page)}
          variant='outlined'
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button variant='contained' color='primary' onClick={() => handleOpenDialog()}>
          <Add /> Add Scheme
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: '#181818', borderRadius: 2, overflow: 'hidden', mt: 2 }}>
        <Typography variant='h6' sx={{ p: 2, color: '#fff' }}>Fee Schemes</Typography>
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
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Class
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Category
          </Typography>
          <Typography variant='body2' sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Admission Fee
          </Typography>
          <Typography variant='body2' sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Monthly Fee
          </Typography>
          <Typography variant='body2' sx={{ flex: 0.5, fontWeight: 'bold', color: '#fff' }}>
            Action
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: 'auto', bgcolor: '#121212', borderRadius: 1 }}>
          <List>
            {filteredFeeSchemes.length > 0 ? (
              filteredFeeSchemes.slice((page - 1) * pageSize, page * pageSize).map((scheme) => (
                <ListItem
                  key={scheme.id}
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
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {`${scheme.class?.name || 'N/A'} ${scheme.class?.section || ''}`.trim()}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {scheme.category}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 0.8, color: '#fff' }}>
                    ₹{scheme.admissionFee}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 0.8, color: '#fff' }}>
                    ₹{scheme.monthlyFee}
                  </Typography>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => handleOpenDialog(scheme)}
                    sx={{ flex: 0.5 }}
                  >
                    <Edit />
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No fee schemes found.
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

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        sx={{ '& .MuiDialog-paper': { backgroundColor: '#000', color: '#fff' } }}
      >
        <ListItemButton
          sx={{
            backgroundColor: '#212121',
            color: '#fff',
            '&:hover': { backgroundColor: '#212121' },
          }}
        >
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary={selectedScheme ? 'Edit Fee Scheme' : 'Add Fee Scheme'} />
        </ListItemButton>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, backgroundColor: '#333', borderRadius: '4px' }}>
            <InputLabel sx={{ color: '#aaa' }}>Class</InputLabel>
            <Select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
              }}
            >
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {`${cls.name} ${cls.section || ''}`.trim()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2, backgroundColor: '#333', borderRadius: '4px' }}>
            <InputLabel sx={{ color: '#aaa' }}>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
              }}
            >
              {['ECONOMICAL_PLUS_KSAT', 'ECONOMICAL_KSAT', 'STANDARD_KSAT', 'GENERAL_KSAT', 'GENERAL_DIRECT'].map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Admission Fee"
            type="number"
            value={formData.admissionFee}
            onChange={(e) => setFormData({ ...formData, admissionFee: e.target.value })}
            fullWidth
            margin="normal"
            sx={{
              backgroundColor: '#333',
              borderRadius: '4px',
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiInputLabel-root': { color: '#aaa' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
            }}
          />
          <TextField
            label="Monthly Fee"
            type="number"
            value={formData.monthlyFee}
            onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
            fullWidth
            margin="normal"
            sx={{
              backgroundColor: '#333',
              borderRadius: '4px',
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiInputLabel-root': { color: '#aaa' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">Cancel</Button>
          <Button onClick={handleSaveScheme} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeeSchemeManagement;