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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';

const DocumentationPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; // Items per page

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('consultant_page') || '1', 10); // Unique query param

  // Update URL query parameters
  const updateUrlParams = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('consultant_page', pageNum.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync page state with URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  // Fetch legal services with pagination
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/api_next_app/legal-services/consultant', {
          params: {
            page,
            pageSize,
          },
        });
        setProblems(response.data.services || []);
        setTotalPages(Math.ceil((response.data.total || 0) / pageSize));
        console.log('Fetched services:', response.data); // Debug log
      } catch (err) {
        console.error('Error fetching legal services:', err);
        setError('Failed to load legal services.');
        toast.error('Failed to load legal services.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
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
            Legal Consultant → Services
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            pb: 4,
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
            {[...Array(12)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                sx={{
                  bgcolor: '#1c1c1c',
                  borderRadius: '16px',
                  width: '200px',
                  height: '200px',
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
         Legal Consultant → Services
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
          position: 'relative',
          width: '100%',
          pb: 4,
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            width: '100%',
            // 
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
            <Link key={problem.id} href={`/book-services/${problem.slug}`} passHref>
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
                <Box
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    px: 2,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#fff',
                      fontSize: '0.9rem',
                      mb: 1,
                    }}
                  >
                    {problem.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#00e676',
                      fontSize: '0.9rem',
                    }}
                  >
                    ₹{problem?.price}
                  </Typography>
                </Box>
              </Paper>
            </Link>
          ))}
        </Box>
        {/* Pagination Controls */}
        {totalPages > 1 && (
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
        )}
      </Box>
    </Box>
  );
};

import { Suspense } from 'react';

export default function ConsultantPage() {
  return (
    <Suspense fallback={   <Box
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
            Legal Consultant → Services
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            pb: 4,
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
            {[...Array(12)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                sx={{
                  bgcolor: '#1c1c1c',
                  borderRadius: '16px',
                  width: '200px',
                  height: '200px',
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>}>
      <DocumentationPage/>
    </Suspense>
  );
}