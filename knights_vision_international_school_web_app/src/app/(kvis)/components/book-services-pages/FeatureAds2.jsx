"use client";

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';

const DocumentationPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch legal services from API
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get('/api/legal-services/documentation');
        setProblems(response.data); // Correctly set to response.data
        console.log('Fetched services:', response.data); // Log after state update
      } catch (err) {
        console.error('Error fetching legal services:', err);
        setError('Failed to load legal services.');
        toast.error('Failed to load legal services.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20vh', bgcolor: '#121212' }}>
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
  if (problems.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, bgcolor: '#121212', color: '#fff' }}>
        <Typography variant="h6">
          No legal services found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: '#000',
        minHeight: '20vh',
        color: '#fff',
        px: 2,
        py: 0.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#fff',
            textAlign: 'left',
            mb: 1,
          }}
        >
          Legal Documentation → Services
        </Typography>
      </Box>

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
        {problems.map((problem) => (
          <Link key={problem.id} href={`/book-service/${problem.slug}`} passHref>
            <Paper
              elevation={3}
              sx={{
                bgcolor: '#1c1c1c',
                borderRadius: '16px',
                width: '200px',
                height: '200px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
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
                  src={problem.image || '/placeholder-legal.jpg'}
                  alt={problem.name}
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
                {problem.name}
              </Typography>
              <Typography
  variant="body1"
  sx={{
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    px: 2,
    color: '#00e676', // ✅ changed from '#fff' to 'green'
    fontSize: '0.9rem',
  }}
>
  ₹{problem?.price}
</Typography>

            </Paper>
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default DocumentationPage;