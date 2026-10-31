"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  CardMedia,
  Divider,
  Chip,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CategoryServicesPage = () => {
  const [categoryData, setCategoryData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pathname = usePathname();
  const categorySlug = pathname.split('/').pop(); // Extract last part (e.g., 'family-matrimonial')

  // Fetch services for the category slug
  useEffect(() => {
    const fetchCategoryServices = async () => {
      if (!categorySlug) {
        setError('Invalid category slug.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/categories/services_by_category_slug?slug=${categorySlug}`);
        // API returns an array, take the first element
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setCategoryData(response.data[0]);
        } else {
          setError('No category data found.');
        }
      } catch (err) {
        console.error(`Error fetching category ${categorySlug}:`, err);
        setError('Failed to load category services.');
        toast.error('Failed to load category services.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryServices();
  }, [categorySlug]);

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter services based on search query
  const filteredServices = categoryData?.services?.filter((service) =>
    [service.name, service.description]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh', bgcolor: '#121212' }}>
        <CircularProgress size={60} sx={{ color: '#fff' }} />
      </Box>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, bgcolor: '#121212', color: '#fff' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  // Handle no data state
  if (!categoryData || !categoryData.services) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, bgcolor: '#121212', color: '#fff' }}>
        <Typography variant="h6">
          Category or services not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: '#000',
        minHeight: '90vh',
        color: '#fff',
        px: 2,
        py: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {/* Main content: Services for the category */}
      <Box
        sx={{
          flexGrow: 1,
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': {
            width: '0px', // Chrome, Safari
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="h5" sx={{ textAlign: 'left' }}>
            {categoryData.name} Services
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              width: '100%',
              maxWidth: '400px',
              bgcolor: '#1c1c1c',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#555' },
                '&.Mui-focused fieldset': { borderColor: '#00c853' },
              },
              '& .MuiInputAdornment-root': { color: '#bbb' },
              '& .MuiInputBase-input': { color: '#fff' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {filteredServices.length > 0 ? (
          <Grid container spacing={1} sx={{ overflowY: 'scroll', maxHeight: 'calc(90vh - 120px)' }}>
            {filteredServices.map((service) => (
              <Grid item xs={12} sm={6} lg={3} key={service.id}>
                <Paper
                  elevation={3}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    backgroundColor: '#000',
                    borderRadius: 2,
                    overflow: 'hidden',
                    width: '294px',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  {service.image || service.thumbnailUrl ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={service.image || service.thumbnailUrl}
                      alt={service.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 140,
                        backgroundColor: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="#bbb">No Image</Typography>
                    </Box>
                  )}
                  <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                      {service.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bbb' }}>
                      {service.description || 'No description available'}
                    </Typography>
                    <Divider sx={{ my: 1, borderColor: '#333' }} />
                    <Typography variant="caption" sx={{ color: '#00c853', fontWeight: 500 }}>
                      Price: {service.currencyCode || 'INR'} {service.price?.toLocaleString() || 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      SLA: {service.slaDays ? `${service.slaDays} days` : 'Not specified'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      Availability: {service.availability || 'Not specified'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      Upload Mode: {service.uploadMode || 'Not specified'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      AI Support: {service.aiSupportLevel || 'None'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      Visibility: {service.visibilityScope || 'Not specified'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      Created: {new Date(service.createdAt).toLocaleDateString() || 'N/A'}
                    </Typography>
                    {service.isFeatured && (
                      <Chip label="Featured" size="small" color="primary" sx={{ mt: 1, width: 'fit-content' }} />
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {service.isOnlinePayEnabled && (
                        <Chip label="Online Payment" size="small" color="success" variant="outlined" />
                      )}
                      {service.isWhatsAppEnabled && (
                        <Chip label="WhatsApp Enabled" size="small" color="success" variant="outlined" />
                      )}
                      {service.isD2DEnabled && (
                        <Chip label="Door-to-Door" size="small" color="success" variant="outlined" />
                      )}
                    </Box>
                    {service.tags && service.tags.length > 0 && (
                      <Typography variant="caption" sx={{ color: '#bbb', mt: 1 }}>
                        Tags: {service.tags.join(', ') || 'None'}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      Rating: {service.averageRating || 0} ({service.ratingCount || 0} reviews)
                    </Typography>
                    {service.introVideoUrl && (
                      <Typography variant="caption" sx={{ color: '#bbb' }}>
                        <a href={service.introVideoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00c853' }}>
                          Watch Intro Video
                        </a>
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => {
                        toast.info(`Selected service: ${service.name}`);
                      }}
                    >
                      Select Service
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" sx={{ color: '#bbb', textAlign: 'center', mt: 4 }}>
            No services found for the search query.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CategoryServicesPage;