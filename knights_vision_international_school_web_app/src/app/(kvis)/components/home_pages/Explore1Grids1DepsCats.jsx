"use client";

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Skeleton, Tabs, Tab } from '@mui/material';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { Block, Gavel } from '@mui/icons-material';

const DepartmentCategoriesPage = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0); // Track selected tab for mobile

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments/with_categories');
        setDepartments(response.data);
        if (response.data.length > 0) {
          setSelectedDepartment(response.data[0]);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments.');
        toast.error('Failed to load departments.');
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  // Handle department selection
  const handleDepartmentClick = (department, index) => {
    setSelectedDepartment(department);
    setTabValue(index); // Update tab value for mobile
  };

  // Handle tab change for mobile
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedDepartment(departments[newValue]);
  };

  // Handle loading state
  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: '#000',
          minHeight: '70vh',
          color: '#fff',
          display: { xs: 'block', md: 'flex' },
          px: 2,
          py: 2,
        }}
      >
        {/* Mobile: Horizontal skeleton tabs */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            overflowX: 'auto',
            gap: 1,
            pb: 2,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#333',
              borderRadius: '4px',
            },
          }}
        >
          {[...Array(5)].map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              sx={{
                bgcolor: '#1c1c1c',
                borderRadius: '8px',
                width: '120px',
                height: '40px',
                flexShrink: 0,
              }}
            />
          ))}
        </Box>

        {/* Desktop: Vertical department skeletons */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: '25vw',
            maxWidth: '200px',
            height: '70vh',
            flexDirection: 'column',
            gap: 1,
            pr: 2,
            borderRight: '1px solid #333',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              width: '0px',
            },
          }}
        >
          {[...Array(10)].map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              sx={{
                bgcolor: '#1c1c1c',
                borderRadius: '8px',
                height: '60px',
                width: '100%',
              }}
            />
          ))}
        </Box>

        {/* Category grid skeletons */}
        <Box
          sx={{
            flexGrow: 1,
            pl: { md: 2 },
            pt: { xs: 2, md: 0 },
            height: { xs: 'auto', md: '70vh' },
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#333',
              borderRadius: '4px',
            },
          }}
        >
          <Skeleton variant="text" sx={{ width: '200px', height: '32px', mb: 2 }} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(auto-fill, minmax(120px, 1fr))',
                md: 'repeat(auto-fill, minmax(130px, 1fr))',
              },
              gap: 2,
              width: '100%',
              maxWidth: { xs: '100%', md: '1200px' },
              justifyContent: 'start',
            }}
          >
            {[...Array(20)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                sx={{
                  bgcolor: '#1c1c1c',
                  borderRadius: '16px',
                  width: { xs: '120px', md: '130px' },
                  height: { xs: '120px', md: '130px' },
                }}
              />
            ))}
          </Box>
        </Box>
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

  return (
    <Box
      sx={{
        bgcolor: '#000',
        minHeight: '70vh',
        color: '#fff',
        display: { xs: 'block', md: 'flex' },
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
      {/* Mobile: Horizontal tab bar */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          overflowX: 'auto',
          pb: 2,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#333',
            borderRadius: '4px',
          },
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#fff',
            },
            '& .MuiTab-root': {
              color: '#fff',
              bgcolor: '#1c1c1c',
              borderRadius: '8px',
              mx: 0.5,
              minHeight: '40px',
              textTransform: 'none',
              fontSize: '0.85rem',
              '&.Mui-selected': {
                bgcolor: '#333',
                color: '#fff',
              },
            },
          }}
        >
          {departments.map((department, index) => (
            <Tab
              key={department.id}
              label={department.name}
              onClick={() => handleDepartmentClick(department, index)}
            />
          ))}
        </Tabs>
      </Box>

      {/* Desktop: Vertical department list */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '25vw',
          maxWidth: '200px',
          height: '70vh',
          flexDirection: 'column',
          gap: 1,
          pr: 2,
          borderRight: '1px solid #333',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            width: '0px',
          },
        }}
      >
        {departments.map((department, index) => (
          <Paper
            key={department.id}
            elevation={3}
            sx={{
              bgcolor: selectedDepartment?.id === department.id ? '#333' : '#1c1c1c',
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
            onClick={() => handleDepartmentClick(department, index)}
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
                src={department.image || '/placeholder-legal.jpg'}
                alt={department.name}
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
              {department.name}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Categories for selected department */}
      <Box
        sx={{
          flexGrow: 1,
          pl: { md: 2 },
          pt: { xs: 2, md: 0 },
          height: { xs: 'auto', md: '70vh' },
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#333',
            borderRadius: '4px',
          },
        }}
      >
        {selectedDepartment && (
          <>
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                textAlign: 'left',
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              {selectedDepartment.name} Categories
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(auto-fill, minmax(160px, 1fr))',
                  md: 'repeat(auto-fill, minmax(220px, 1fr))',
                },
                gap: 2,
                width: '100%',
                maxWidth: { xs: '100%', md: '80vw' },
                justifyContent: 'start',
              }}
            >
              {selectedDepartment.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/explore-both-problems-and-services/${selectedDepartment.slug}?explore_category=${category.slug}&explore_flag=services`}
                  passHref
                >
                  <Paper
                    elevation={3}
                    sx={{
                      bgcolor: '#1c1c1c',
                      borderRadius: '16px',
                      width: { xs: '160px', md: '220px' },
                      height: { xs: '140px', md: '180px' },
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                      cursor: 'pointer',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {/* Top Image + Vertical Label */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexGrow: 1,
                      }}
                    >
                      {/* Inner Paper with Image */}
                      <Paper
                        elevation={0}
                        sx={{
                          width: { xs: '110px', md: '150px' },
                          height: { xs: '100px', md: '130px' },
                          position: 'relative',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: { xs: 'none', md: 'block' }, // Hide image on mobile
                        }}
                      >
                        <Image
                          src={category.image || '/placeholder-legal.jpg'}
                          alt={category.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="150px"
                        />
                      </Paper>
                      <Link
                        href={`/explore-both-problems-and-services/${selectedDepartment.slug}?explore_category=${category.slug}&explore_flag=problems`}
                        passHref
                      >
                        {/* Vertical "Problem" Label */}
                        <Box
                          sx={{
                            bgcolor: '#000',
                            width: { xs: '50px', md: '70px' },
                            height: { xs: '100px', md: '130px' },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            borderTopRightRadius: '16px',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              writingMode: 'vertical-lr',
                              transform: 'rotate(180deg)',
                              color: 'red',
                              fontSize: { xs: '0.85rem', md: '1rem' },
                              fontWeight: 'bold',
                              userSelect: 'none',
                            }}
                          >
                            <Block /> Problem
                          </Typography>
                        </Box>
                      </Link>
                    </Box>

                    {/* Bottom Green Label */}
                    <Box
                      sx={{
                        bgcolor: '#000',
                        height: { xs: '40px', md: '50px' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'left',
                        px: 1,
                        borderBottomLeftRadius: '16px',
                        borderBottomRightRadius: '16px',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'lightgreen',
                          fontSize: { xs: '0.85rem', md: '1rem' },
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Gavel sx={{ mr: 1 }} /> {category.name}
                      </Typography>
                    </Box>
                  </Paper>
                </Link>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default DepartmentCategoriesPage;