"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Tabs, Tab, Box, Typography, Skeleton } from '@mui/material';
import axios from 'axios';

const DepartmentTabs = () => {
  const [departments, setDepartments] = useState([]);
  const [value, setValue] = useState(false); // Use false as per MUI Tabs default
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Fetch departments (countries)
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/api/countries/id_name_slug');
        setDepartments(res.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  // Sync Tabs value with URL country slug
  useEffect(() => {
    if (departments.length === 0 || loading) return;

    // Extract country slug from URL (e.g., /explore-both-tdilcs-legal-units-and-lawyers/india)
    const currentSlug = pathname.split('/explore-both-tdilcs-legal-units-and-lawyers/')[1]?.split('?')[0] || '';
    const deptIndex = departments.findIndex((dept) => dept.slug === currentSlug);

    // Set value to matching index or 0 if no match
    setValue(deptIndex !== -1 ? deptIndex : 0);
  }, [pathname, departments, loading]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const selectedSlug = departments[newValue].slug;
    // Preserve query parameters if any
    const currentQuery = new URLSearchParams(window.location.search);
    router.push(`/explore-both-tdilcs-legal-units-and-lawyers/${selectedSlug}?${currentQuery.toString()}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: '#121212',
          color: '#fff',
          width: '100%',
          borderBottom: '1px solid #333',
          px: { xs: 1, md: 2 },
          py: 1,
        }}
        className="department-tabs"
      >
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none',
          }}
        >
          {[...Array(20)].map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              sx={{
                minWidth: { xs: '100px', md: '120px' },
                height: { xs: 36, md: 48 }, // Match Tab height
                mx: 0.5,
                borderRadius: '4px',
                bgcolor: '#2c2c2c',
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (departments.length === 0) {
    return (
      <Box sx={{ p: 2, bgcolor: '#121212', color: '#fff' }}>
        <Typography variant="body2">No countries available.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: '#121212',
        color: '#fff',
        width: '100%',
        borderBottom: '1px solid #333',
        px: { xs: 1, md: 2 },
      }}
      className="department-tabs"
    >
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Country Tabs"
        sx={{
          '& .MuiTab-root': {
            color: '#aaa',
            fontWeight: 500,
            textTransform: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: '#fff',
              bgcolor: '#2c2c2c',
            },
          },
          '& .Mui-selected': {
            color: '#fff',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#00bcd4',
            height: '3px',
          },
          '& .MuiTabs-scroller': {
            overflowX: 'auto !important',
          },
        }}
      >
        {departments.map((dept, index) => (
          <Tab
            key={dept.id}
            label={dept.name} // Display country name (e.g., "India")
            sx={{
              minWidth: { xs: '100px', md: '120px' },
              borderRadius: '4px',
              mx: 0.5,
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default DepartmentTabs;