"use client";

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Modal,
  Fade,
} from '@mui/material';

const TutorialVideoScroller = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get('/api/knowledge-topics/tutorial');
        setTopics(response.data);
      } catch (error) {
        console.error('Error fetching tutorial topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  // Drag functionality for scrolling
  useEffect(() => {
    const ref = scrollRef.current;
    if (!ref) return;

    let isDragging = false;
    let startX;
    let scrollLeft;

    const startDragging = (e) => {
      isDragging = true;
      startX = e.pageX || e.touches[0].pageX;
      scrollLeft = ref.scrollLeft;
      ref.style.cursor = 'grabbing';
    };

    const stopDragging = () => {
      isDragging = false;
      ref.style.cursor = 'grab';
    };

    const move = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX || e.touches[0].pageX;
      const walk = (x - startX) * 1.5;
      ref.scrollLeft = scrollLeft - walk;
    };

    ref.addEventListener('mousedown', startDragging);
    ref.addEventListener('touchstart', startDragging);
    ref.addEventListener('mousemove', move);
    ref.addEventListener('touchmove', move);
    ref.addEventListener('mouseup', stopDragging);
    ref.addEventListener('touchend', stopDragging);
    ref.addEventListener('mouseleave', stopDragging);

    return () => {
      ref.removeEventListener('mousedown', startDragging);
      ref.removeEventListener('touchstart', startDragging);
      ref.removeEventListener('mousemove', move);
      ref.removeEventListener('touchmove', move);
      ref.removeEventListener('mouseup', stopDragging);
      ref.removeEventListener('touchend', stopDragging);
      ref.removeEventListener('mouseleave', stopDragging);
    };
  }, []);

  const handleVideoClick = (youtubeLink) => {
    setSelectedVideo(youtubeLink);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <style jsx global>{`
        .carousel {
          overflow-x: auto;
          display: flex;
          scroll-behavior: smooth;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
          cursor: grab;
          user-select: none;
        }
        .carousel::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .carousel-slide {
          min-width: 280px;
          max-width: 320px;
        }
      `}</style>

      <Box className="carousel" ref={scrollRef}>
        {topics.map((topic) => (
          <Box className="carousel-slide" key={topic.id}>
            <Paper
              elevation={6}
              sx={{
                background: '#111',
                borderRadius: '12px',
                p: 2,
                color: 'white',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.03)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  borderRadius: '8px',
                  overflow: 'hidden',
                  mb: 2,
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
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#111',
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
              <Typography
                variant="subtitle1"
                component="a"
                href={topic.wikigalaxy_link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'block',
                  color: '#90caf9',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {topic.title}
              </Typography>
            </Paper>
          </Box>
        ))}
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
              width: '70vw',
              maxWidth: '90%',
              height: '70vh',
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

export default TutorialVideoScroller;