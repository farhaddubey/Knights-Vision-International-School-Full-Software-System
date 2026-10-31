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
import { Business, Add, RotateRight, Delete, Search, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import BrowseLegalServicesDialog from './dialogs/BrowseLegalServicesDialog';

const drawerWidth = 280;
const appBarHeight = 80;
const pageSize = 10;
const greenAccent = '#00c853';

const BrowseLegalServices = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
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
    console.log('[BrowseLegalServices] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchServices = async (pageNum = 1) => {
    setApiLoading(true);
    try {
      setError(null);
      const response = await axios.get('/api/legal-services', {
        params: { page: pageNum, pageSize },
      });

      // Log response for debugging
      console.log('[fetchServices] Response:', response.data);

      // Validate response structure
      if (!response.data || !Array.isArray(response.data.services)) {
        throw new Error('Invalid response format: services array missing');
      }

      setServices(response.data.services);
      setFilteredServices(response.data.services);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchServices] totalPages set to:', response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.response?.data?.error || 'Failed to fetch services.');
      toast.error('Failed to fetch services.');
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  // Fetch services when page changes
  useEffect(() => {
    console.log('[BrowseLegalServices] Fetching services for page:', page);
    fetchServices(page);
  }, [page]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = services.filter((service) =>
      [
        service.name,
        service.brand?.name,
        service.category?.name,
        service.description,
        service.availability,
        service.uploadMode,
        service.slaDays?.toString(),
      ].some((field) => field?.toLowerCase().includes(query))
    );
    setFilteredServices(filtered);
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
    fetchServices(page);
    setEditFields({});
  };

  const handleInsertionOpenModal = (service = {}) => {
    toast.info('Opening the Service');
    setEditFields({
      id: service.id ?? null,
      name: service.name ?? '',
      brandId: service.brandId ?? '',
      categoryId: service.categoryId ?? '',
      description: service.description ?? '',
      price: service.price ?? '',
      hasSlot: service.hasSlot ?? false,
      availability: service.availability ?? 'BOTH',
      uploadMode: service.uploadMode ?? 'DIRECT_UPLOAD',
      isWhatsAppEnabled: service.isWhatsAppEnabled ?? false,
      isOnlinePayEnabled: service.isOnlinePayEnabled ?? true,
      isD2DEnabled: service.isD2DEnabled ?? true,
      prerequisiteServiceId: service.prerequisiteServiceId ?? '',
      slaDays: service.slaDays ?? '',
    });
    setOpenInsertion(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setApiLoading(true);
      try {
        await axios.delete(`/api/legal-services/${id}`);
        toast.success('Service deleted successfully!');
        fetchServices(page);
      } catch (err) {
        console.error('Delete Error:', err);
        toast.error('Failed to delete service.');
      } finally {
        setApiLoading(false);
      }
    }
  };

  const handlePageChange = (event, value) => {
    console.log('[BrowseLegalServices] Page changed to:', value);
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
        <Business sx={{ mr: 1 }} />
        <ListItemText primary='Browse Legal Services' />
        <TextField
          placeholder='Search by Name, Brand, Category, etc.'
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
          Add Service
        </Button>
        <Button
          onClick={() => fetchServices(page)}
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
            Brand
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Category
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Description
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Price
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Slot
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Availability
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Upload Mode
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            WhatsApp
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Online Pay
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            D2D
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Pre-req Service
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            SLA Days
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Created At
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
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <ListItem
                  key={service.id}
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
                    {service.name}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.brand?.name ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.category?.name ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.description ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.price ? `$${service.price.toFixed(2)}` : 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.hasSlot ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.availability}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.uploadMode}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.isWhatsAppEnabled ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.isOnlinePayEnabled ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.isD2DEnabled ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.prerequisiteService?.name ?? 'None'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {service.slaDays ?? 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {new Date(service.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                    <Button
                      variant='contained'
                      color='success'
                      onClick={() => handleInsertionOpenModal(service)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant='contained'
                      color='error'
                      onClick={() => handleDelete(service.id)}
                      startIcon={<Delete />}
                    >
                      Delete
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No services found.
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

      <BrowseLegalServicesDialog
        open={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchServices={fetchServices}
      />
    </Box>
  );
};

export default BrowseLegalServices;