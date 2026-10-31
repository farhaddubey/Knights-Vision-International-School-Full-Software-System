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
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import DepartmentTabs from '../../components/home_pages/department_tabs';

const DepartmentCategoriesPage = () => {
  const [departmentData, setDepartmentData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pathname = usePathname();
  const departmentSlug = pathname.split('/').pop(); // Extract last part (e.g., 'legal-notices')

  // Fetch department categories and services
  useEffect(() => {
    const fetchDepartmentData = async () => {
      if (!departmentSlug) {
        setError('Invalid department slug.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/department/${departmentSlug}`);
        setDepartmentData(response.data);
        // Set the first category as selected by default
        if (response.data.categories && response.data.categories.length > 0) {
          setSelectedCategory(response.data.categories[0]);
        }
      } catch (err) {
        console.error(`Error fetching department ${departmentSlug}:`, err);
        setError('Failed to load department data.');
        toast.error('Failed to load department data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDepartmentData();
  }, [departmentSlug]);

  // Clear search query when category changes
  useEffect(() => {
    setSearchQuery('');
  }, [selectedCategory]);

  // Handle category selection
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter services based on search query
  const filteredServices = selectedCategory?.services.filter((service) =>
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
  if (!departmentData || !departmentData.department) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, bgcolor: '#121212', color: '#fff' }}>
        <Typography variant="h6">
          Department not found.
        </Typography>
      </Box>
    );
  }

  const { department, categories } = departmentData;

  return (
    <Box>
      <DepartmentTabs/>
    <Box
      sx={{
        bgcolor: '#000',
        minHeight: '90vh',
        color: '#fff',
        display: 'flex',
        flexDirection: 'row',
        px: 2,
        py: 2,
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
      {/* Left side: Categories */}
      <Box
        sx={{
          width: '18vw',
          maxWidth:'18vw',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pr: 2,
          borderRight: '1px solid #333',
          overflowY: 'auto',
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': {
            width: '0px', // Chrome, Safari
          },
        }}
      > 
      <Button variant='outlined' size='small' sx={{fontSize:'14px', textAlign:'left'}}>
          {department.name} Categories
        </Button>
        {categories.map((category) => (
          <Paper
            key={category.categoryId}
            elevation={3}
            sx={{
              bgcolor: selectedCategory?.categoryId === category.categoryId ? '#333' : '#1c1c1c',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              p: 1,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: '#333',
              },
            }}
            onClick={() => handleCategoryClick(category)}
          >
            <Box
              sx={{
                width: '40px',
                height: '40px',
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                mr: 1,
              }}
            >
              <Image
                src={category.image || '/placeholder-legal.jpg'}
                alt={category.categoryName}
                fill
                style={{ objectFit: 'cover' }}
                sizes="40px"
              />
            </Box>

            <Typography
              variant="body1"
              sx={{
                flexGrow: 1,
                color: '#fff',
                fontSize: '0.9rem',
              }}
            >
              {category.categoryName}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Right side: Services for selected category */}
      <Box
        sx={{
          width: '82vw',
          flexGrow: 1,
          pl: 2,
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
        {selectedCategory && (
          <>
         <Box
  sx={{
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between", // ✅ this is what you need
    alignItems: "center",
    mb: 2, // apply margin bottom to the container
    flexWrap: "wrap", // optional, for responsiveness
    gap: 2 // optional, better spacing on small screens
  }}
>
  <Button variant='outlined'>
  <Typography variant="h6" sx={{ textAlign: 'left' }}>
    {selectedCategory.categoryName} Services
  </Typography>
  </Button>

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
              <Grid container spacing={3} sx={{ overflowY: 'scroll', maxHeight: '90vh' }}>
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
                        width: '285px',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        },
                      }}
                    >
                      <Link href={`/book-services/${service?.slug}`}>

                      {service.image ? (
                        <CardMedia
                          component="img"
                          height="140"
                          image={service.image}
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
                          Price: {service.currency} {service.price?.toLocaleString() || 'N/A'}
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
                        {service.tags && (
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
                      </Link>
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
          </>
        )}
      </Box>
    </Box>
    </Box>
  );
};

export default DepartmentCategoriesPage;