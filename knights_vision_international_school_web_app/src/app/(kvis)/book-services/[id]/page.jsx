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
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { ExpandMore, Fullscreen, WhatsApp, Favorite } from '@mui/icons-material';
import axios from 'axios';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCartAndWishlist } from '../../../../lib/useCartAndWishlist';
import YouTube from 'react-youtube';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ServicePage = () => {
  const pathname = usePathname();
  const slug = pathname.split('/').pop();
  const [service, setService] = useState(null);
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

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`/api/legal-services/by_slug?slug=${slug}`);
        setService(response.data);
        const mediaItems = getMediaItems(response.data);
        setSelectedMedia(mediaItems[0] || { type: 'image', url: 'https://img.freepik.com/premium-photo/young-multi-ethnic-business-people-group-walking-standing-top-view_530697-10446.jpg?uid=R66968796&ga=GA1.1.2024053517.1740751536&semt=ais_hybrid&w=740', label: 'Placeholder' });
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Failed to load service.');
        toast.error('Failed to load service.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug]);

  const getMediaItems = (serviceData) => {
    const defaultImages = [
      { type: 'image', url: 'https://img.freepik.com/premium-photo/young-multi-ethnic-business-people-group-walking-standing-top-view_530697-10446.jpg?uid=R66968796&ga=GA1.1.2024053517.1740751536&semt=ais_hybrid&w=740', label: 'Placeholder 1' },
      { type: 'image', url: 'https://img.freepik.com/premium-photo/successful-business-team-top-managers-office_274234-7482.jpg?uid=R66968796&ga=GA1.1.2024053517.1740751536&semt=ais_hybrid&w=740', label: 'Placeholder 2' },
    ];
    const defaultVideo = { type: 'video', url: 'https://www.youtube.com/watch?v=9p738WotKL0&t=2s', label: 'Placeholder Video' };

    const mediaItems = [
      ...(serviceData?.image
        ? [{ type: 'image', url: serviceData.image, label: 'Service Image' }]
        : [defaultImages[0]]),
      ...(serviceData?.introVideoUrl
        ? [{ type: 'video', url: serviceData.introVideoUrl, label: 'Intro Video' }]
        : [defaultVideo]),
      ...(serviceData?.documents?.brochure
        ? [{ type: 'image', url: '/brochure-thumbnail.jpg', label: 'Brochure Preview' }]
        : []),
      { type: 'image', url: '/sample-certificate.jpg', label: 'Sample Certificate' },
    ];

    if (mediaItems.filter((item) => item.type === 'image').length < 2) {
      mediaItems.push(defaultImages[1]);
    }

    return mediaItems;
  };

  const mediaItems = service ? getMediaItems(service) : [];

  useEffect(() => {
    if (autoChange && mediaItems.length > 1) {
      autoChangeIntervalRef.current = setInterval(() => {
        setSelectedMedia((prev) => {
          const currentIndex = mediaItems.findIndex((item) => item.url === prev.url);
          const nextIndex = (currentIndex + 1) % mediaItems.length;
          return mediaItems[nextIndex];
        });
      }, 10000);
    }
    return () => clearInterval(autoChangeIntervalRef.current);
  }, [autoChange, mediaItems]);

  const handleAddToCart = (buttonId) => {
    if (service) {
      addToCart(service.id, {
        id: service.id,
        name: service.name,
        price: service.price,
        slug: service.slug,
        image: service.image,
      });
      setDisabledButtons((prev) => ({ ...prev, [buttonId]: true }));
    }
  };

  const handleAddToWishlist = () => {
    if (service) {
      addToWishlist(service.id, {
        id: service.id,
        name: service.name,
        price: service.price,
        slug: service.slug,
        image: service.image,
      });
    }
  };

  const handleBookNow = (buttonId) => {
    router.push(`/book-service/${slug}/slot`);
    setDisabledButtons((prev) => ({ ...prev, [buttonId]: true }));
  };

  const handleAskExpert = () => {
    window.open(`https://wa.me/1234567890?text=Query%20about%20${encodeURIComponent(service?.name || '')}`, '_blank');
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
    }, 20000);
  };

  const handleYouTubeStateChange = (event) => {
    if (event.data === 1) {
      setAutoChange(false);
      clearInterval(autoChangeIntervalRef.current);
    } else if (event.data === 0 || event.data === 2) {
      setAutoChange(true);
    }
  };

  const youtubeOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      fs: 1,
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

  const isInCart = cart?.items.some((item) => item.serviceId === service.id);
  const isInWishlist = wishlist?.items.some((item) => item.serviceId === service.id);

  return (
    <>
      <Box sx={{ bgcolor: '#121212', minHeight: '100vh', color: '#fff', p: { xs: 1, sm: 2, md: 4 } }}>
        <ToastContainer theme="dark" />
        <Grid container spacing={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Thumbnail List (1st grid box on mobile) */}
          <Grid
            item
            xs={12}
            md={1}
            order={{ xs: 2, md: 1 }}
            sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' },
                overflowX: { xs: 'auto', md: 'hidden' },
                height: { md: '60vh' }, // Changed from maxHeight: '100vh' to auto for content-based height
                minWidth: { xs: '100%', md: '120px' },
                width: { md: '10vw' },
                overflowY:{md:'auto', xs:'hidden'},

                bgcolor: '#1c1c1c',
                borderRadius: '8px',
                p: 1,
                position: { md: 'sticky' },
                top: { md: '16px' },
                gap: 1,
                whiteSpace: { xs: 'nowrap', md: 'normal' },
                '&::-webkit-scrollbar': { display: { xs: 'none', md: 'block' } },
              }}
            >
              {mediaItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: { md: 1 },
                    mr: { xs: 1, md: 0 },
                    cursor: 'pointer',
                    border: selectedMedia?.url === item.url ? '2px solid #1976d2' : '2px solid transparent',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' },
                    flexShrink: 0,
                    width: { xs: '60px', sm: '70px', md: '100%' }, // Reduced size for mobile
                    height: { xs: '60px', sm: '70px' }, // Maintain square thumbnails on mobile
                  }}
                  onClick={() => handleMediaSelect(item)}
                >
                  {item.type === 'image' ? (
                    <Image
                      src={item.url}
                      alt={item.label}
                      width={70}
                      height={70}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
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
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      color: '#b9b9b9',
                      textAlign: 'center',
                      display: { xs: 'none', md: 'block' },
                      fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.875rem' }, // Reduced font size
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Media Preview (2nd grid box on mobile) */}
          <Grid
            item
            xs={12}
            md={4}
            order={{ xs: 1, md: 2 }}
            sx={{ display: 'flex', justifyContent: { md: 'center' } }}
          >
            <Box
              sx={{
                width: { xs: '96vw', md: '35vw' },
                position: { md: 'sticky' },
                top: { md: '16px' },
                bgcolor: '#1c1c1c',
                borderRadius: '8px',
                p: .5,
                height: 'fit-content',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  width: '100%',
                  paddingTop: { xs: '56.25%', md: '56.25%' }, // 16:9 aspect ratio
                  height: 'auto',
                }}
              >
                {selectedMedia?.type === 'image' ? (
                  <Image
                    src={selectedMedia.url}
                    alt={service.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 600px) 100vw, 400px"
                  />
                ) : (
                  <YouTube
                    videoId={selectedMedia?.url.includes('watch?v=') ? selectedMedia.url.split('v=')[1].split('&')[0] : selectedMedia.url.split('/').pop()}
                    opts={youtubeOpts}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
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
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.875rem' } }}>
                    LegalGalaxy
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 2, width: '100%', flexWrap: 'wrap' }}>
                <IconButton
                  onClick={handleAddToWishlist}
                  disabled={cartWishlistLoading}
                  sx={{
                    bgcolor: isInWishlist ? '#4caf50' : '#ff6f61',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: isInWishlist ? '#43a047' : '#e65a50',
                    },
                  }}
                >
                  <Favorite />
                </IconButton>
         <Button
  variant="contained"
  color={isInCart ? 'success' : 'primary'}
  onClick={() => handleAddToCart('top')}
  sx={{
    flex: 1,
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
    transition: 'all 0.3s ease-in-out',
  }}
  disabled={isInCart || cartWishlistLoading || disabledButtons['top']}
>
  {isInCart ? '✔ In Cart' : '🛒 Add to Cart'}
</Button>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleBookNow('top')}
                  sx={{ flex: 1, fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, display:{xs:'none', md:'block'} }}
                  disabled={disabledButtons['top']}
                >
                  Book Service Slot
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Service Details (3rd grid box on mobile) */}
          <Grid
            item
            xs={12}
            md={7}
            order={{ xs: 3, md: 3 }}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box
              sx={{
                width: {xs:'95vw', sm:'95vw', md:'48vw'},
                maxHeight: { md: 'calc(100vh - 32px)' },
                overflowY: { md: 'auto' },
                bgcolor: '#1c1c1c',
                borderRadius: '8px',
                p: { xs: 2, md: 3 },
              }}
            >
              <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                {service.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ mr: 1, fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                  Category: Business Registrations
                </Typography>
                <Rating value={service.averageRating || 0} precision={0.1} readOnly />
                <Typography variant="body2" sx={{ ml: 1, fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                  ({service.ratingCount || 0} reviews)
                </Typography>
              </Box>
              <Typography variant="h5" color="primary" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
                ₹{service.price?.toLocaleString() || 'N/A'} {service.currencyCode}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                Processing Time: {service.estimatedProcessingTime || 'N/A'}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                Available In: {service.availability === 'BOTH' ? 'PAN India (Online & Offline)' : service.availability || 'N/A'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {(service.tags || []).map((item) => (
                  <Chip key={item} label={item} size="small" className="chip" sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.875rem' } }} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Image src="/iso-badge.png" alt="ISO Certified" width={30} height={30} />
                <Image src="/msme-badge.png" alt="MSME Registered" width={30} height={30} />
                <Image src="/gov-compliant.png" alt="Government Compliant" width={30} height={30} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <IconButton
                  onClick={handleAddToWishlist}
                  disabled={cartWishlistLoading}
                  sx={{
                    bgcolor: isInWishlist ? '#4caf50' : '#ff6f61',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: isInWishlist ? '#43a047' : '#e65a50',
                    },
                  }}
                >
                  <Favorite />
                </IconButton>
               <Button
  variant="contained"
  color={isInCart ? 'success' : 'primary'}
  onClick={() => handleAddToCart('top')}
  sx={{
    flex: 1,
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
    transition: 'all 0.3s ease-in-out',
  }}
  disabled={isInCart || cartWishlistLoading || disabledButtons['top']}
>
  {isInCart ? '✔ In Cart' : '🛒 Add to Cart'}
</Button>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleBookNow('bottom')}
                  disabled={disabledButtons['bottom']}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
                >
                  Book Service Slot
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<WhatsApp />}
                  onClick={handleAskExpert}
                  className="cta-button"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
                >
                  Ask a Legal Expert
                </Button>
              </Box>
              <Box sx={{ bgcolor: '#2c2c2c', p: 2, borderRadius: '8px', mb: 3 }}>
                <Typography variant="h6" color="primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                  Special Offer
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                  Get ₹500 off if booked this week! Use code: LEGAL500
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                  Combo Offer: Add Trademark Registration for ₹2999
                </Typography>
              </Box>
              <Typography variant="body2" color="primary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                5,432 people purchased this service in the last 30 days
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                Currently Available in 10+ Districts
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: '#1c1c1c',
                borderRadius: '8px',
                p: { xs: 2, md: 3 },
                maxHeight: { md: 'calc(100vh - 32px)' },
                overflowY: { md: 'auto' },
               width: {xs:'95vw', sm:'95vw', md:'48vw'},

              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  mb: 3,
                  '& .MuiTab-root': { color: '#fff', fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } },
                  '& .Mui-selected': { color: '#1976d2' },
                }}
                className="tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Description" />
                <Tab label="Documents Required" />
                <Tab label="FAQ" />
                <Tab label="Reviews" />
              </Tabs>
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    Service Description
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                    {service.description || 'No description available'}
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    Process Workflow
                  </Typography>
                  <ol style={{ paddingLeft: '20px' }}>
                    <li><Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>Submit required documents</Typography></li>
                    <li><Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>Get name approval from MCA</Typography></li>
                    <li><Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>Receive incorporation certificate</Typography></li>
                  </ol>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    Why This Service?
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                    Ensures legal compliance, limited liability, and business credibility.
                  </Typography>
                </Box>
              )}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    Documents Required
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                    {service.faqJson?.a1 || 'PAN, Aadhar, Address Proof, Utility Bill'}
                  </Typography>
                  {service.documents?.brochure && (
                    <Button
                      variant="outlined"
                      href={service.documents.brochure}
                      target="_blank"
                      sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
                      className="download-button"
                    >
                      Download Brochure
                    </Button>
                  )}
                </Box>
              )}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    Frequently Asked Questions
                  </Typography>
                  {service.faqJson && (
                    <Accordion className="accordion">
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>{service.faqJson.q1}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>{service.faqJson.a1}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              )}
              {tabValue === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    Customer Reviews
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                    No reviews yet. Be the first to review!
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    className="cta-button"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
                  >
                    Submit Review
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ bgcolor: '#1c1c1c', borderRadius: '8px', p: { xs: 2, md: 3 }, mt: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
            Service Highlights
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#2c2c2c', color: '#fff', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    {service.popularityScore || 0}/10
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                    Popularity Score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#2c2c2c', color: '#fff', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    {service.ratingCount || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                    Total Reviews
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#2c2c2c', color: '#fff', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    {service.estimatedProcessingTime || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                    Processing Time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default ServicePage;