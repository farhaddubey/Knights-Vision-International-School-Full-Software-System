"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Grid,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
  Card,
  CardMedia,
  Divider,
  CardContent
} from '@mui/material';
import { ExpandMore, Fullscreen, WhatsApp, Favorite } from '@mui/icons-material';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCartAndWishlist } from '../../../../lib/useCartAndWishlist';
import YouTube from 'react-youtube';
// import FeatureCalendar from './FeatureCalendar';
import FeatureBySameCategory from '../../components/book-services-pages/FeatureBySameCategory';
import FeatureBySameType from '../../components/book-services-pages/FeatureBySameType';
import FeatureLegalKnowledgeBases from '../../components/book-services-pages/FeatureLegalKnowledgeBases';
import FeatureYouTubeVideoBySameCategory from '../../components/book-services-pages/FeatureYouTubeVideoBySameCategory';
import FeatureAds1 from '../../components/book-services-pages/FeatureAds1';
import FeatureAds2 from '../../components/book-services-pages/FeatureAds2';
import FeatureAds3 from '../../components/book-services-pages/FeatureAds3';
import FeatureAds4 from '../../components/book-services-pages/FeatureAds4';
import FeatureAds5 from '../../components/book-services-pages/FeatureAds5';

const ProblemPage = () => {
  const pathname = usePathname();
  const slug = pathname.split('/').pop();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [disabledButtons, setDisabledButtons] = useState({});
  const [autoChange, setAutoChange] = useState(true);
  const autoChangeTimeoutRef = useRef(null);
  const autoChangeIntervalRef = useRef(null);
  const { cart, wishlist, addToCart, addToWishlist, loading: cartWishlistLoading } = useCartAndWishlist();
  const router = useRouter();

  const getMediaItems = (problemData) => {
    const defaultImages = [
      { type: 'image', url: 'https://img.freepik.com/premium-photo/young-multi-ethnic-business-people-group-walking-standing-top-view_530697-10446.jpg?uid=R66968796&ga=GA1.1.2024053517.1740751536&semt=ais_hybrid&w=740', label: 'Placeholder 1' },
      { type: 'image', url: 'https://img.freepik.com/premium-photo/successful-business-team-top-managers-office_274234-7482.jpg?uid=R66968796&ga=GA1.1.2024053517.1740751536&semt=ais_hybrid&w=740', label: 'Placeholder 2' },
    ];
    const defaultVideo = { type: 'video', url: 'https://www.youtube.com/watch?v=9p738WotKL0&t=2s', label: 'Placeholder Video' };

    const mediaItems = [
      ...(problemData?.iconUrl
        ? [{ type: 'image', url: problemData.iconUrl, label: 'Problem Image' }]
        : [defaultImages[0]]),
      ...(problemData?.introVideoUrl
        ? [{ type: 'video', url: problemData.introVideoUrl, label: 'Intro Video' }]
        : [defaultVideo]),
    ];

    if (mediaItems.filter((item) => item.type === 'image').length < 2) {
      mediaItems.push(defaultImages[1]);
    }

    return mediaItems;
  };

  const mediaItems = problem ? getMediaItems(problem) : [];

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`/api/legal-problems/and_problems_services?slug=${slug}`);
        setProblem(response.data.data);
        const items = getMediaItems(response.data.data);
        setSelectedMedia(items[0] || { type: 'image', url: 'https://img.freepik.com/premium-photo/young-multi-ethnic-business-people-group-walking-standing-top-view_530697-10446.jpg?uid=R66968796&ga=GA1.1.2024053517.1740751536&semt=ais_hybrid&w=740', label: 'Placeholder' });
      } catch (err) {
        console.error('Error fetching problem:', err);
        setError('Failed to load problem.');
        toast.error('Failed to load problem.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  useEffect(() => {
    if (autoChange && mediaItems.length > 1) {
      autoChangeIntervalRef.current = setInterval(() => {
        setSelectedMedia((prev) => {
          const currentIndex = mediaItems.findIndex((item) => item.url === prev.url);
          const nextIndex = (currentIndex + 1) % mediaItems.length;
          return mediaItems[nextIndex];
        });
      }, 10000); // Change every 10 seconds
    }
    return () => clearInterval(autoChangeIntervalRef.current);
  }, [autoChange, mediaItems]);

  const handleAddToCart = (service, buttonId) => {
    addToCart(service.id, {
      id: service.id,
      name: service.name,
      price: service.price,
      slug: service.slug,
      image: service.image,
    });
    setDisabledButtons((prev) => ({ ...prev, [`${service.id}-${buttonId}`]: true }));
  };

  const handleAddToWishlist = (service) => {
    addToWishlist(service.id, {
      id: service.id,
      name: service.name,
      price: service.price,
      slug: service.slug,
      image: service.image,
    });
  };

  const handleBookNow = (serviceSlug, serviceId, buttonId) => {
    router.push(`/book-service/${serviceSlug}/slot`);
    setDisabledButtons((prev) => ({ ...prev, [`${serviceId}-${buttonId}`]: true }));
  };

  const handleAskExpert = () => {
    window.open(
      `https://wa.me/1234567890?text=Query%20about%20${encodeURIComponent(problem?.title || '')}`,
      '_blank'
    );
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMediaSelect = (item) => {
    setSelectedMedia(item);
    setAutoChange(false);
    clearTimeout(autoChangeTimeoutRef.current);
    autoChangeTimeoutRef.current = setTimeout(() => {
      setAutoChange(true);
    }, 20000); // Resume auto-change after 20 seconds
  };

  const handleYouTubeStateChange = (event) => {
    if (event.data === 1) { // Playing
      setAutoChange(false);
      clearInterval(autoChangeIntervalRef.current);
    } else if (event.data === 0 || event.data === 2) { // Ended or Paused
      setAutoChange(true);
    }
  };

  const youtubeOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      fs: 1, // Enable fullscreen
      rel: 0,
      modestbranding: 1,
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#121212' }}>
        <Typography variant="h6" color="#fff">
          Loading...
        </Typography>
      </Box>
    );
  }

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
    <>
      <Box sx={{ bgcolor: '#121212', minHeight: '100vh', color: '#fff', p: { xs: 2, md: 4 } }}>
        <ToastContainer theme="dark" />
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <Box
              sx={{
                maxHeight: '100vh',
                minWidth: '120px',
                width: '10vw',
                bgcolor: '#1c1c1c',
                borderRadius: '8px',
                p: 1,
                position: 'sticky',
                top: '16px',
              }}
            >
              {mediaItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    border: selectedMedia?.url === item.url ? '2px solid #1976d2' : '2px solid transparent',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                  onClick={() => handleMediaSelect(item)}
                >
                  {item.type === 'image' ? (
                    <Image
                      src={item.url}
                      alt={item.label}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', width: '100%' }}
                    />
                  ) : (
                    <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                      <YouTube
                        videoId={item.url.includes('watch?v=') ? item.url.split('v=')[1].split('&')[0] : item.url.split('/').pop()}
                        opts={{ ...youtubeOpts, height: '100%', width: '100%' }}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                      />
                    </Box>
                  )}
                  <Typography variant="caption" sx={{ mt: 0.5, color: '#b9b9b9', textAlign: 'center' }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                width: '35vw',
                position: 'sticky',
                top: '16px',
                bgcolor: '#1c1c1c',
                borderRadius: '8px',
                p: 2,
                height: 'fit-content',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  height: { xs: '200px', md: '300px' },
                }}
              >
                {selectedMedia?.type === 'image' ? (
                  <Image
                    src={selectedMedia.url}
                    alt={problem.title}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 600px) 100vw, 400px"
                  />
                ) : (
                  <YouTube
                    videoId={selectedMedia?.url.includes('watch?v=') ? selectedMedia.url.split('v=')[1].split('&')[0] : selectedMedia.url.split('/').pop()}
                    opts={youtubeOpts}
                    style={{ height: '100%' }}
                    onStateChange={handleYouTubeStateChange}
                  />
                )}
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}
                  onClick={() => window.open(selectedMedia.url, '_blank')}
                >
                  <Fullscreen />
                </IconButton>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    px: 1,
                    borderRadius: '4px',
                  }}
                >
                  <Typography variant="caption">LegalGalaxy</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h4" gutterBottom>
                  {problem.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Department: {problem.department?.name || 'Not specified'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Category: {problem.category?.name || 'Not specified'}
                </Typography>
                <Typography variant="body1" paragraph>
                  {problem.description || 'No description available'}
                </Typography>
                {problem.keywords && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {problem.keywords.map((keyword) => (
                      <Chip key={keyword} label={keyword} size="small" className="chip" />
                    ))}
                  </Box>
                )}
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Created: {new Date(problem.createdAt).toLocaleDateString() || 'N/A'}
                </Typography>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<WhatsApp />}
                  onClick={handleAskExpert}
                  className="cta-button"
                  sx={{ mb: 2 }}
                >
                  Ask a Legal Expert
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '48vw',
                maxHeight: 'calc(100vh - 32px)',
                overflowY: 'auto',
                bgcolor: '#1c1c1c',
                borderRadius: '8px',
                p: 3,
                mb: 3,
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{ mb: 3, '& .MuiTab-root': { color: '#fff' }, '& .Mui-selected': { color: '#1976d2' } }}
                className="tabs"
              >
                <Tab label="Description" />
                <Tab label="FAQ" />
              </Tabs>

              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Problem Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {problem.description || 'No description available'}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Why Address This Problem?
                  </Typography>
                  <Typography variant="body1">
                    Addressing {problem.title} ensures legal compliance and protects your rights. Our expert services provide tailored solutions to resolve this issue efficiently.
                  </Typography>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Frequently Asked Questions
                  </Typography>
                  {problem.faqJson ? (
                    <Accordion className="accordion">
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>{problem.faqJson.q1}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{problem.faqJson.a1}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ) : (
                    <Typography variant="body1">
                      No FAQs available for this problem.
                    </Typography>
                  )}
                </Box>
              )}
              <Divider sx={{ my: 3, borderColor: '#333' }} />

              <Typography variant="h5" gutterBottom>
                Solutions
              </Typography>
              {problem.LegalProblemServiceMap?.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {problem.LegalProblemServiceMap.map(({ service }) => {
                    const isInCart = cart?.items.some((item) => item.serviceId === service.id);
                    const isInWishlist = wishlist?.items.some((item) => item.serviceId === service.id);
                    return (
                      <Card
                        key={service.id}
                        sx={{
                          bgcolor: '#2c2c2c',
                          borderRadius: '8px',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                          },
                        }}
                      >
                        <Link href={`/book-services/${service.slug}`}>
                          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {service.image ? (
                              <CardMedia
                                component="img"
                                height="140"
                                image={service.image}
                                alt={service.name}
                                sx={{ objectFit: 'cover', borderRadius: '4px' }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  height: 140,
                                  backgroundColor: '#333',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '4px',
                                }}
                              >
                                <Typography color="#bbb">No Image</Typography>
                              </Box>
                            )}
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                              {service.name}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              ₹{service.price?.toLocaleString() || 'N/A'} {service.currencyCode}
                            </Typography>
                          </CardContent>
                        </Link>
                        <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton
                            onClick={() => handleAddToWishlist(service)}
                            disabled={isInWishlist || cartWishlistLoading}
                            sx={{
                              bgcolor: isInWishlist ? 'success' : '#ff6f61',
                              color: '#fff',
                              '&:hover': {
                                bgcolor: isInWishlist ? 'success' : '#e65a50',
                              },
                            }}
                          >
                            <Favorite />
                          </IconButton>
                          <Button
                            variant="contained"
                            color={isInCart ? 'success' : 'primary'}
                            size="small"
                            onClick={() => handleAddToCart(service, service.id)}
                            disabled={isInCart || cartWishlistLoading || disabledButtons[`${service.id}-${service.id}`]}
                          >
                            {isInCart ? 'In Cart' : 'Add to Cart'}
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={() => handleBookNow(service.slug, service.id, service.id)}
                            disabled={disabledButtons[`${service.id}-${service.id}`]}
                          >
                            Book Now
                          </Button>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: '#bbb' }}>
                  No solutions available for this problem.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ bgcolor: '#1c1c1c', borderRadius: '8px', p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Problem Highlights
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#2c2c2c', color: '#fff', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6">{problem.LegalProblemServiceMap?.length || 0}</Typography>
                  <Typography variant="body2">Available Solutions</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#2c2c2c', color: '#fff', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6">{problem.department?.name || 'N/A'}</Typography>
                  <Typography variant="body2">Department</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#2c2c2c', color: '#fff', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6">{problem.category?.name || 'N/A'}</Typography>
                  <Typography variant="body2">Category</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default ProblemPage;