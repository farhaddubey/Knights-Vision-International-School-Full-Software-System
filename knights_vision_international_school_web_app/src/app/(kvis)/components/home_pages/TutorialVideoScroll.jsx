"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Skeleton,
  Paper,
  Modal,
  Fade,
  IconButton,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';

const TutorialVideoScroller = () => {
  const [topics, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  const scrollRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('video_page') || '1', 10);

  // Update URL query parameters
  const updateUrlParams = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('video_page', pageNum.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync page state with URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/api_next_app/knowledge-topics/tutorial', {
          params: {
            page,
            pageSize,
          },
        });
        setVideos(response.data.topics || []);
        setTotalPages(Math.ceil(response.data.total / pageSize));
        console.log('Fetched videos:', response.data, { total: response.data.total, totalPages: Math.ceil(response.data.total / pageSize) });
      } catch (error) {
        console.error('Error fetching tutorial videos:', error);
        setError('Failed to load tutorial videos.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [page]);

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    updateUrlParams(newPage);
  };

  const handleVideoClick = (youtubeLink) => {
    setSelectedVideo(youtubeLink);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ py: 2, my: 2, bgcolor: '#121212' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            px: 2,
          }}
        >
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
            Tutorial Videos
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'relative',
            py: 1,
            overflow: 'visible',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 2,
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {[...Array(12)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                sx={{
                  width: '300px',
                  height: '220px',
                  borderRadius: '12px',
                  bgcolor: '#1c1c1c',
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
      <Box sx={{ py: 4, bgcolor: '#121212', textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, my: 2, bgcolor: '#121212' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          px: 2,
        }}
      >
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
          Tutorial Videos
        </Typography>
      </Box>
      <Box
        ref={scrollRef}
        sx={{
          position: 'relative',
          py: 1,
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {topics.map((topic) => (
            <Paper
              key={topic.id}
              elevation={4}
              sx={{
                width: '300px',
                height: '220px',
                bgcolor: '#1c1c1c',
                borderRadius: '12px',
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  height: '160px', // 2:3 aspect ratio
                  cursor: 'pointer',
                }}
                onClick={() => handleVideoClick(topic.youtube_link)}
              >
                {topic.youtube_link ? (
                  <iframe
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                    src={topic.youtube_link.replace('watch?v=', 'embed/')}
                    title={topic.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      bgcolor: '#111',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                    }}
                  >
                    No video available
                  </Box>
                )}
              </Box>
              <Box
                sx={{
                  bgcolor: 'rgba(0,0,0,0.7)',
                  p: 1.5,
                  textAlign: 'center',
                  backdropFilter: 'blur(4px)',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="subtitle2"
                  component="a"
                  href={topic.wikigalaxy_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#90caf9',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {topic.title}
                </Typography>
              </Box>
            </Paper>
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
      <Modal
        open={!!selectedVideo}
        onClose={handleCloseModal}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)',
        }}
      >
        <Fade in={!!selectedVideo}>
          <Box
            sx={{
              width: '80vw',
              maxWidth: '90%',
              height: '60vh',
              bgcolor: '#111',
              borderRadius: '12px',
              p: 2,
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                paddingTop: '56.25%', // 16:9 aspect ratio
              }}
            >
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                src={selectedVideo ? selectedVideo.replace('watch?v=', 'embed/') : ''}
                title="Selected Tutorial Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

import { Suspense } from 'react';

export default function TutorialVideoScrollerPage() {
  return (
    <Suspense fallback={   <Box sx={{ py: 2, my: 2, bgcolor: '#121212' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            px: 2,
          }}
        >
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
            Tutorial Videos
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'relative',
            py: 1,
            overflow: 'visible',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 2,
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {[...Array(12)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                sx={{
                  width: '300px',
                  height: '220px',
                  borderRadius: '12px',
                  bgcolor: '#1c1c1c',
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>}>
      <TutorialVideoScroller/>
    </Suspense>
  );
}