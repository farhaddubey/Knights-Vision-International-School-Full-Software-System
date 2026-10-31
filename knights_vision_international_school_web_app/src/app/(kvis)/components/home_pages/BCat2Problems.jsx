"use client"; 

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import './Departments.css';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments/with_categories');
        setDepartments(response.data);
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

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh', bgcolor: '#121212' }}>
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

  return (
    <Box
      sx={{
        bgcolor: '#000',
        minHeight: '10vh',
        color: '#fff',
        px: 2,
        py:.5, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          pb: 2,
          width: '100%',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1c1c1c',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#555',
            borderRadius: '4px',
          },
        }}
      >
        {departments.map((department) => (
          <Paper
            key={department.id}
            elevation={3}
            sx={{
              bgcolor: '#1c1c1c',
              borderRadius: '16px',
              width: '130px',
              height: '130px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
            className="dropdown"
          >
            <Box
              sx={{
                width: '100%',
                height: '120px',
                position: 'relative',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <Image
                src={department.image || '/placeholder-legal.jpg'}
                alt={department.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="200px"
              />
            </Box>
            <Typography
              variant="body1"
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                px: 2,
                color: '#fff',
                fontSize: '0.9rem',
              }}
            >
              {department.name}
            </Typography>
            {/* Dropdown for categories */}
            <Box className="dropdown-content">
              {department.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  passHref
                  legacyBehavior
                >
                  <a className="dropdown-item">{category.name}</a>
                </Link>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default DepartmentsPage;