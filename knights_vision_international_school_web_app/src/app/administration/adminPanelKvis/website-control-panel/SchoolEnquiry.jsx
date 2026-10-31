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
import { Edit, Delete, Add, RotateRight, Search, ChevronLeft, ChevronRight, QuestionAnswer } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import SchoolEnquiryDialog from './dialogs/SchoolEnquiryDialog';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

const SchoolEnquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
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
    console.log('[SchoolEnquiry] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchEnquiries = async (pageNum = 1) => {
    const token = Cookies.get('administration_token');
    console.log('[fetchEnquiries] Token present:', !!token);
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/school-enquiry/get-for-admin`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize },
      });

      console.log('[fetchEnquiries] Response:', response.data);

      if (!response.data || !Array.isArray(response.data.enquiries)) {
        throw new Error('Invalid response format: enquiries array missing');
      }

      setEnquiries(response.data.enquiries);
      setFilteredEnquiries(response.data.enquiries);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchEnquiries] totalPages set to:', response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError(err.response?.data?.error || 'Failed to fetch enquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[SchoolEnquiry] Fetching enquiries for page:', page);
    fetchEnquiries(page);
  }, [page]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = enquiries.filter((enquiry) =>
      enquiry.fullName?.toLowerCase().includes(query) ||
      enquiry.subject?.toLowerCase().includes(query) ||
      enquiry.email?.toLowerCase().includes(query) ||
      enquiry.phone?.toLowerCase().includes(query)
    );
    setFilteredEnquiries(filtered);
  };

  const handleOpenDialog = (enquiry = null) => {
    if (enquiry) {
      setEditFields([{
        id: enquiry.id,
        fullName: enquiry.fullName || '',
        email: enquiry.email || '',
        phone: enquiry.phone || '',
        role: enquiry.role || 'STUDENT',
        enquiryType: enquiry.enquiryType || 'GENERAL_QUERY',
        subject: enquiry.subject || '',
        message: enquiry.message || '',
        attachmentUrl: enquiry.attachmentUrl || '',
        schoolId: enquiry.schoolId || '',
        classOrGrade: enquiry.classOrGrade || '',
        identification: enquiry.identification || '',
        preferredContactMethod: enquiry.preferredContactMethod || 'EMAIL',
        status: enquiry.status || 'PENDING',
        adminNotes: enquiry.adminNotes || ''
      }]);
    } else {
      setEditFields([{
        fullName: '',
        email: '',
        phone: '',
        role: 'STUDENT',
        enquiryType: 'GENERAL_QUERY',
        subject: '',
        message: '',
        attachmentUrl: '',
        schoolId: '',
        classOrGrade: '',
        identification: '',
        preferredContactMethod: 'EMAIL',
        status: 'PENDING',
        adminNotes: ''
      }]);
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

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }
    try {
      await axios.delete(`/api/school-enquiry/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ Enquiry deleted successfully!');
      fetchEnquiries(page);
    } catch (err) {
      console.error('Delete Error:', err.response?.data || err.message);
      toast.error('❌ Error deleting enquiry.');
    }
  };

  const handlePageChange = (event, value) => {
    console.log('[SchoolEnquiry] Page changed to:', value);
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
          <QuestionAnswer />
        </ListItemIcon>
        <ListItemText primary='School Enquiries Control Panel' />
        <TextField
          placeholder='Search by Name, Subject, Email, or Phone'
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
          onClick={() => fetchEnquiries(page)}
          variant='outlined'
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button variant='contained' color='primary' onClick={() => handleOpenDialog()}>
          <Add /> Add New Enquiry
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
            Full Name
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Role
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Enquiry Type
          </Typography>
          <Typography variant='body2' sx={{ flex: 1.5, fontWeight: 'bold', color: '#fff' }}>
            Subject
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Status
          </Typography>
          <Box sx={{ flex: 0.8 }}></Box>
        </Box>

        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 150}px)`, overflowY: 'auto', bgcolor: '#121212', borderRadius: 1, paddingBottom: 10 }}>
          <List>
            {filteredEnquiries.length > 0 ? (
              filteredEnquiries.map((enquiry) => (
                <ListItem
                  key={enquiry.id}
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
                    {enquiry.id}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {enquiry.fullName ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {enquiry.role ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {enquiry.enquiryType ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1.5, color: '#fff' }}>
                    {enquiry.subject ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {enquiry.status ?? 'N/A'}
                  </Typography>
                  <Box sx={{ flex: 0.8, display: 'flex', gap: 1 }}>
                    <Button variant='outlined' color='primary' onClick={() => handleOpenDialog(enquiry)}>
                      <Edit /> Edit
                    </Button>
                    <Button variant='outlined' color='error' onClick={() => handleDeleteEnquiry(enquiry.id)}>
                      <Delete /> Delete
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No enquiries found.
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

      <SchoolEnquiryDialog
        openInsertion={openDialog}
        handleCloseModal={handleCloseDialog}
        handleSaveAndCloseModal={handleSaveAndCloseDialog}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchEnquiries={fetchEnquiries}
      />
    </Box>
  );
};

export default SchoolEnquiry;