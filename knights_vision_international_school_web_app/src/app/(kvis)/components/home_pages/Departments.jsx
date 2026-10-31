"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  IconButton,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12; // Items per page

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('dept_page') || '1', 10); // Unique query param

  // Update URL query parameters
  const updateUrlParams = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('dept_page', pageNum.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync page state with URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  // Fetch departments with pagination
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/api_next_app/departments/with_categories', {
          params: {
            page,
            pageSize,
          },
        });
        setDepartments(response.data.departments);
        setTotalPages(Math.ceil(response.data.total / pageSize));
        console.log('Departments Response:', response.data); // Debug log
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments.');
        toast.error('Failed to load departments.');
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, [page, pageSize]);

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    updateUrlParams(newPage);
  };

  // Handle loading state
  if (loading) {
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
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            py: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 2,
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
            {[...Array(12)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                sx={{
                  bgcolor: '#1c1c1c',
                  borderRadius: '16px',
                  width: '130px',
                  height: '130px',
                  flexShrink: 0,
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
        minHeight: '20vh',
        color: '#fff',
        px: 2,
        py: 0.5,
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
          position: 'relative',
          width: '100%',
          py: 1,
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
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
          {departments.length > 0 ? (
            departments.map((department) => (
              <Link key={department.id} href={`/explore-both-problems-and-services/${department?.slug}`}>
                <Paper
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
                      overflow: 'clip',
                    }}
                  >
                    <Image
                      src={department.image || '/placeholder-legal.jpg'}
                      alt={department.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="130px"
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
                </Paper>
              </Link>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: '#bbb', textAlign: 'center', width: '100%' }}>
              No departments found.
            </Typography>
          )}
        </Box>
        {/* Pagination Controls */}
          <>
            <IconButton
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              sx={{
                position: 'absolute',
                left: '0px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#fff',
                bgcolor: page === 1 ? 'rgba(51,51,51,0.5)' : 'rgba(28,28,28,0.7)',
                '&:hover': {
                  bgcolor: 'rgba(85,85,85,0.7)',
                },
                borderRadius: '50%',
                width: 40,
                height: 40,
                zIndex: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
              aria-label="Previous page"
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              sx={{
                position: 'absolute',
                right: '0px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#fff',
                bgcolor: page === totalPages ? 'rgba(51,51,51,0.5)' : 'rgba(28,28,28,0.7)',
                '&:hover': {
                  bgcolor: 'rgba(85,85,85,0.7)',
                },
                borderRadius: '50%',
                width: 40,
                height: 40,
                zIndex: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
              aria-label="Next page"
            >
              <ChevronRight />
            </IconButton>
          </>
      </Box>
    </Box>
  );
};

import { Suspense } from 'react';

export default function DocumentationPageUpdated() {
  return (
    <Suspense fallback={      <Box
        sx={{
          bgcolor: '#000',
          minHeight: '20vh',
          color: '#fff',
          px: 2,
          py: 0.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            py: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 2,
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
            {[...Array(12)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                sx={{
                  bgcolor: '#1c1c1c',
                  borderRadius: '16px',
                  width: '130px',
                  height: '130px',
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>}>
      <DepartmentsPage/>
    </Suspense>
  );
}