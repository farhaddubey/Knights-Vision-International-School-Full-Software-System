"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Chip, Skeleton, Typography, IconButton, Grid } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import YouTubeIcon from '@mui/icons-material/YouTube';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';

const LegalKnowledgeBasePage=()=> {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('legal_terms_page') || '1', 10);

  // Update URL query parameters
  const updateUrlParams = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('legal_terms_page', pageNum.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync page state with URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  // Fetch legal term topics
  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/api_next_app/knowledge-topics', {
          params: { page, pageSize },
        });
        const fetchedTopics = response.data.topics || [];
        const total = response.data.total || 0;
        setTopics(fetchedTopics);
        setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
        setError(null);
        console.log('Fetched legal term topics:', {
          topics: fetchedTopics,
          total,
          totalPages: Math.ceil(total / pageSize),
          page,
          responseData: response.data,
        });
      } catch (err) {
        console.error('Failed to fetch legal term topics:', {
          message: err.message,
          response: err.response?.data,
        });
        setError('Failed to load legal term topics.');
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [page]);

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    updateUrlParams(newPage);
  };

  // Generate random width between 150px and 300px
  const getRandomWidth = () => Math.floor(Math.random() * (300 - 150 + 1)) + 150;

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ p: 4, bgcolor: '#121212' }}>
        <Skeleton
          variant="text"
          sx={{ width: '300px', height: '40px', mb: 2, bgcolor: '#1c1c1c' }}
        />
        <Skeleton
          variant="text"
          sx={{ width: '80%', height: '20px', mb: 3, bgcolor: '#1c1c1c' }}
        />
        <Box sx={{ position: 'relative', py: 1, overflow: 'visible' }}>
          <Grid container spacing={2}>
            {[...Array(30)].map((_, index) => (
              <Grid item key={`skeleton-${index}`}>
                <Skeleton
                  variant="rectangular"
                  sx={{
                    width: `${getRandomWidth()}px`,
                    height: '40px',
                    borderRadius: '20px',
                    bgcolor: '#1c1c1c',
                    border: '1px solid #333',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Box sx={{ p: 4, bgcolor: '#121212', textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#121212' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#fff' }}
      >
        📚 Academics & Career Knowledge Base
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#ccc' }}>
        Learn the most important exams, scholarship & jobs opportunities. 🧠
      </Typography>

      <Box sx={{ position: 'relative', py: 1, overflow: 'visible' }}>
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
        {topics.length === 0 ? (
          <Typography
            variant="h6"
            sx={{ color: '#888', textAlign: 'center', mt: 6 }}
          >
            No legal terms found.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {topics.map((topic) => (
              <Grid item key={topic.slug || topic.id}>
                <a
                  href={topic.wikigalaxy_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Chip
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px:1 }}>
                        <GavelIcon sx={{ color: '#00e676' }} />
                        <Typography sx={{ color: 'white' }}>
                          {topic.title || 'Untitled'}
                        </Typography>
                        {topic.youtube_link && (
                          <a
                            href={topic.youtube_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <YouTubeIcon sx={{ color: '#ff1744' }} fontSize="small" />
                          </a>
                        )}
                        <OpenInNewIcon fontSize="small" sx={{ color: '#999' }} />
                      </Box>
                    }
                    variant="outlined"
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: '20px',
                      background: '#1c1c1c',
                      borderColor: '#333',
                      color: 'white',
                      '&:hover': {
                        background: '#333',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.7)',
                      },
                      cursor: 'pointer',
                    }}
                  />
                </a>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

import { Suspense } from 'react';

export default function LegalKnowledgePage() {
  return (
    <Suspense fallback={      <Box sx={{ p: 4, bgcolor: '#121212' }}>
        <Skeleton
          variant="text"
          sx={{ width: '300px', height: '40px', mb: 2, bgcolor: '#1c1c1c' }}
        />
        <Skeleton
          variant="text"
          sx={{ width: '80%', height: '20px', mb: 3, bgcolor: '#1c1c1c' }}
        />
        <Box sx={{ position: 'relative', py: 1, overflow: 'visible' }}>
          <Grid container spacing={2}>
            {[...Array(30)].map((_, index) => (
              <Grid item key={`skeleton-${index}`}>
                <Skeleton
                  variant="rectangular"
                  sx={{
                    width: `50px`,
                    height: '40px',
                    borderRadius: '20px',
                    bgcolor: '#1c1c1c',
                    border: '1px solid #333',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>}>
      <LegalKnowledgeBasePage/>
    </Suspense>
  );
}