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
import { toast, ToastContainer } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import SchoolClassDialog from './dialogs/SchoolClassDialog';
import SchoolClassEditDialog from './dialogs/SchoolClassEditDialog';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 30;
const greenAccent = '#00c853';

const SchoolClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editClassId, setEditClassId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchClasses = async (pageNum = 1) => {
    const token = Cookies.get('administration_token');
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/school-classes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize },
      });

      if (!response.data || !Array.isArray(response.data.classes)) {
        throw new Error('Invalid response format: classes array missing');
      }

      setClasses(response.data.classes);
      setFilteredClasses(response.data.classes);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError(err.response?.data?.error || 'Failed to fetch classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses(page);
  }, [page]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = classes.filter(
      (classItem) =>
        classItem.name?.toLowerCase().includes(query) ||
        classItem.section?.toLowerCase().includes(query) ||
        classItem.classTeacher?.username?.toLowerCase().includes(query) ||
        classItem.roomNumber?.toLowerCase().includes(query)
    );
    setFilteredClasses(filtered);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (classItem) => {
    setEditClassId(classItem.id);
    setOpenEditDialog(true);
  };

  const handleCloseCreateDialog = () => {
    if (window.confirm('Are you sure you want to close the modal, unsaved?')) {
      setOpenCreateDialog(false);
    }
  };

  const handleCloseEditDialog = () => {
    if (window.confirm('Are you sure you want to close the modal, unsaved?')) {
      setOpenEditDialog(false);
      setEditClassId(null);
    }
  };

  const handleSaveAndCloseDialog = () => {
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
    setEditClassId(null);
    fetchClasses(page);
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }
    try {
      await axios.delete(`/api/school-classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ Class deleted successfully!');
      fetchClasses(page);
    } catch (err) {
      console.error('Delete Error:', err.response?.data || err.message);
      toast.error('❌ Error deleting class.');
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
          📚
        </ListItemIcon>
        <ListItemText primary='School Class Management Control Panel' />
        <TextField
          placeholder='Search by Name, Section, Room, or Teacher'
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
          onClick={() => fetchClasses(page)}
          variant='outlined'
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button variant='contained' color='primary' onClick={handleOpenCreateDialog}>
          <Add /> Add New Class
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
            Section
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Room Number
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Branch
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Class Teacher
          </Typography>
          <Box sx={{ flex: 0.8 }}></Box>
        </Box>

        <Box sx={{ height: `90vh`, overflowY: 'auto', bgcolor: '#121212', borderRadius: 1, paddingBottom: 10 }}>
          <List>
            {filteredClasses.length > 0 ? (
              filteredClasses.map((classItem) => (
                <ListItem
                  key={classItem.id}
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
                    {classItem.id}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {classItem.name ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {classItem.section ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {classItem.roomNumber ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {classItem.branch?.name ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {classItem.classTeacher?.username ?? 'Not Assigned'}
                  </Typography>
                  <Box sx={{ flex: 0.8, display: 'flex', gap: 1 }}>
                    <Button variant='outlined' color='primary' onClick={() => handleOpenEditDialog(classItem)}>
                      <Edit /> Edit
                    </Button>
                    <Button variant='outlined' color='error' onClick={() => handleDeleteClass(classItem.id)}>
                      <Delete /> Delete
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No classes found.
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

      <SchoolClassDialog
        openInsertion={openCreateDialog}
        handleCloseModal={handleCloseCreateDialog}
        handleSaveAndCloseModal={handleSaveAndCloseDialog}
        editFields={[]}
        setEditFields={() => {}}
        fetchClasses={fetchClasses}
      />
      <SchoolClassEditDialog
        open={openEditDialog}
        handleCloseModal={handleCloseEditDialog}
        handleSaveAndCloseModal={handleSaveAndCloseDialog}
        classId={editClassId}
        fetchClasses={fetchClasses}
      />
    </Box>
  );
};

export default SchoolClassManagement;
