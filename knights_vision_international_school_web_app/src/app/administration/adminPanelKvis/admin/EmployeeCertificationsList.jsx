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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  InputAdornment,
  Pagination,
  PaginationItem,
} from '@mui/material';
import { Inventory, Edit, Close, EmojiPeople, Shop, Sell, RotateRight, Search as SearchIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import EmployeeListDialog from './adminDialog/EmployeeListDialog';

const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

const EmployeeManageList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Sync page state with URL
  useEffect(() => {
    console.log('[EmployeeManageList] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchEmployees = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get('administration_token');
      console.log('[fetchEmployees] Token present:', !!token);
      if (!token) {
        throw new Error('Authentication token is missing!');
      }

      const response = await axios.get('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { page: pageNum, pageSize },
      });

      // Log response for debugging
      console.log('[fetchEmployees] Response:', response.data);

      // Validate response structure
      if (!response.data || !Array.isArray(response.data.users)) {
        throw new Error('Invalid response format: users array missing');
      }

      // Map users with robust field access
      const formattedEmployees = response.data.users.map((item, index) => {
        try {
          return {
            id: item.id ?? index,
            username: item.username ?? 'Unknown',
            email: item.email ?? 'N/A',
            department: item.department ?? 'N/A',
            role: item.role ?? 'N/A',
            uidAadhar: item.userProfile && item.userProfile.uid_aadhar ? item.userProfile.uid_aadhar.toString() : 'N/A',
            is_active: item.is_active ?? true,
          };
        } catch (e) {
          console.error(`[fetchEmployees] Error mapping user at index ${index}:`, e);
          return null; // Skip malformed user
        }
      }).filter(user => user !== null);

      if (formattedEmployees.length === 0 && response.data.users.length > 0) {
        throw new Error('Failed to format employee data');
      }

      setEmployees(formattedEmployees);
      setFilteredEmployees(formattedEmployees);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchEmployees] totalPages set to:', response.data.totalPages || 1);
    } catch (error) {
      console.error('[fetchEmployees] Error:', error.message, error.stack);
      setError(error.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees when page changes
  useEffect(() => {
    console.log('[EmployeeManageList] Fetching employees for page:', page);
    fetchEmployees(page);
  }, [page]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = employees.filter((employee) =>
      [
        employee.username,
        employee.email,
        employee.department,
        employee.role,
        employee.uidAadhar,
      ].some((field) => field?.toLowerCase().includes(query))
    );

    setFilteredEmployees(filtered);
  };

  const handlePageChange = (event, value) => {
    console.log('[EmployeeManageList] Page changed to:', value);
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm('Are you sure you want to close without saving?');
    if (userConfirmed) {
      setOpen(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpen(false);
    setEditFields({});
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = Cookies.get('administration_token');
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const response = await axios.delete('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { id: userId },
      });

      console.log(response.data.message);
      alert('User deleted successfully!');
      fetchEmployees(page);
    } catch (error) {
      console.error('Error deleting user:', error.response?.data?.error || error.message);
      alert('Failed to delete user!');
    }
  };

  const handleUpdateModal = (userId) => {
    setEditFields(userId);
    setOpen(true);
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
    <Box sx={{ position: 'fixed', minWidth: '82vw', backgroundColor: '#212121', height: `calc(100vh - ${appBarHeight}px)`, color: '#fff' }}>
      <ListItemButton
        sx={{
          backgroundColor: '#b71c1c',
          color: '#fff',
          '&:hover': { backgroundColor: '#b71c1c' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
            <Inventory />
          </ListItemIcon>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#fff' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: '#333',
              borderRadius: 1,
              '& .MuiInputBase-input': { color: '#fff', padding: '6px' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#555' },
                '&:hover fieldset': { borderColor: '#777' },
                '&.Mui-focused fieldset': { borderColor: greenAccent },
              },
              width: 200,
              mr: 2,
            }}
          />
          <ListItemText sx={{ color: '#fff' }} primary="Global Employee Attendance Management Panel" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            onClick={() => fetchEmployees(page)}
            variant="outlined"
            sx={{ color: greenAccent, bgcolor: '#212121', minWidth: 40, padding: '6px' }}
          >
            <RotateRight />
          </Button>
          <Button variant="contained" color="primary">
            <Sell /> All Employee Info
          </Button>
        </Box>
      </ListItemButton>

      <Box sx={{ bgcolor: '#181818', borderRadius: 2 }}>
        {/* Header Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: '#333', borderRadius: 1, position: 'sticky', top: 0, zIndex: 1 }}>
          <Typography variant="body2" sx={{ flex: 2, fontWeight: 'bold', color: '#fff' }}>Employee Name & Email</Typography>
          <Typography variant="body2" sx={{ flex: 1.2, fontWeight: 'bold', color: '#fff' }}>Department</Typography>
          <Typography variant="body2" sx={{ flex: 1.2, fontWeight: 'bold', color: '#fff' }}>Status</Typography>
          <Box sx={{ flex: 1 }}></Box>
        </Box>

        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 150}px)`, overflowY: 'auto', bgcolor: '#000', borderRadius: 1, paddingBottom: 10 }}>
          <List>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <ListItem
                  key={employee.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1,
                    bgcolor: '#181818',
                    mb: 0.3,
                  }}
                >
                  <Typography sx={{ flex: 2, color: '#fff' }}>
                    {employee.username}<br />
                    {employee.email}<br />
                    {employee.role}<br />
                    {employee.uidAadhar}
                  </Typography>
                  <Typography sx={{ flex: 1.2, color: '#fff' }}>{employee.department}</Typography>
                  <Typography sx={{ flex: 1.2, color: '#fff' }}>{employee.is_active ? 'Active' : 'Inactive'}</Typography>
                  <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                    <Button variant="contained" color="success">Explore</Button>
                    <Button variant="contained" color="error" onClick={() => handleDelete(employee.id)}>Delete</Button>
                    <Button variant="contained" color="secondary" onClick={() => handleUpdateModal(employee)}>Update</Button>
                    <Button variant="contained" color="info">Suspend</Button>
                    <Button variant="contained" color="error">Ban</Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No employees found.
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
            renderItem={(item) => (
              <PaginationItem
                components={{ previous: ChevronLeft, next: ChevronRight }}
                {...item}
              />
            )}
          />
        </Box>
      </Box>

      <EmployeeListDialog
        openInsertion={open}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
      />
    </Box>
  );
};

export default EmployeeManageList;