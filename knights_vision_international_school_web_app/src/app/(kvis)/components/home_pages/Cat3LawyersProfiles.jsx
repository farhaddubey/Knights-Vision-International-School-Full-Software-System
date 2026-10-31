"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  LinearProgress,
  IconButton,
  Skeleton,
} from '@mui/material';
import { LocationOn, Refresh, ChevronLeft, ChevronRight } from '@mui/icons-material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = '#00c853';
const animationSpeed = '40s';

// Base64-encoded placeholder image
const placeholderImage =
  'https://img.freepik.com/premium-photo/looking-camera-young-attractive-asian-female-lawyer-working-office-with-contract-law-books-when-sitting-desk-law-legal-services-advice-justice-real-estate-concept_35675-2098.jpg?uid=R66968796&ga=GA1.1.2024053517.1740751536&semt=ais_hybrid&w=740';

const LawyersCarouselPage = () => {
  const [lawyersRow1, setLawyersRow1] = useState([]);
  const [lawyersRow2, setLawyersRow2] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const loadedImages = useRef(new Set());
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('lawyers_page') || '1', 10);

  // Update URL query parameters
  const updateUrlParams = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lawyers_page', pageNum.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync page state with URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  // Fisher-Yates shuffle
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Fetch lawyers
  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/api_next_app/users/lawyers_site_page', {
        params: { page, pageSize },
      });
      const lawyers = (response.data.users || []).map((lawyer) => ({
        ...lawyer,
        country: lawyer.country || 'India',
        img_url: lawyer.img_url || placeholderImage,
        rating: lawyer.rating || (4.5 + Math.random() * 0.5).toFixed(1),
      }));
      const shuffled = shuffleArray(lawyers);
      const half = Math.ceil(shuffled.length / 2);
      setLawyersRow1(shuffled.slice(0, half));
      setLawyersRow2(shuffled.slice(half));
      setTotalPages(Math.max(1, Math.ceil(response.data.total / pageSize)));
      setError(null);
      loadedImages.current.clear();
      console.log('Fetched lawyers:', {
        lawyers,
        total: response.data.total,
        totalPages: Math.ceil(response.data.total / pageSize),
        page,
        responseData: response.data,
      });
    } catch (err) {
      console.error('Error fetching lawyers:', {
        message: err.message,
        response: err.response?.data,
      });
      setError('Failed to fetch lawyers.');
      toast.error('Failed to fetch lawyers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, [page]);

  // Capitalize username
  const formatUsername = (username) =>
    username
      ? username
          .replace('adv_', '')
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : 'Unknown Lawyer';

  // Handle image error
  const handleImageError = (e, lawyerId) => {
    if (!loadedImages.current.has(lawyerId)) {
      loadedImages.current.add(lawyerId);
      e.target.src = placeholderImage;
    }
  };

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
          background: '#121212',
          color: '#fff',
          p: 3,
          minHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              width: '30vw',
              height: '48px',
              bgcolor: '#000',
              borderRadius: 3,
            }}
          />
          <Skeleton variant="rectangular" sx={{ width: '100px', height: '36px' }} />
        </Box>
        <Box sx={{ position: 'relative', py: 1, overflow: 'visible' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box className="carousel">
                <Box className="carousel-track" sx={{ display: 'flex' }}>
                  {[...Array(10)].map((_, index) => (
                    <Box className="carousel-slide" key={`row1-${index}`}>
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          width: 270,
                          height: 380,
                          bgcolor: '#000',
                          borderRadius: 3,
                          border: '1px solid #333',
                          m: '0 2px',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box className="carousel">
                <Box className="carousel-track" sx={{ display: 'flex' }}>
                  {[...Array(10)].map((_, index) => (
                    <Box className="carousel-slide" key={`row2-${index}`}>
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          width: 270,
                          height: 380,
                          bgcolor: '#000',
                          borderRadius: 3,
                          border: '1px solid #333',
                          m: '0 2px',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: '#121212',
        color: '#fff',
        p: 3,
        minHeight: '100vh',
        overflowY: 'auto',
      }}
    >
      <style jsx global>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-270px * ${Math.max(lawyersRow1.length, lawyersRow2.length)}));
          }
        }
        .carousel {
          overflow: hidden;
          position: relative;
          width: 100%;
        }
        .carousel-track {
          display: flex;
          ${totalPages > 1 ? '' : `animation: slide ${animationSpeed} linear infinite;`}
        }
        .carousel-track:hover {
          animation-play-state: paused;
        }
        .carousel-slide {
          flex: 0 0 270px;
          margin-right: 2px;
        }
        .carousel::before,
        .carousel::after {
          content: '';
          position: absolute;
          top: 0;
          height: 100%;
          width: 80px;
          z-index: 2;
          pointer-events: none;
        }
        .carousel::before {
          left: 0;
          background: linear-gradient(to right, #121212, transparent);
        }
        .carousel::after {
          right: 0;
          background: linear-gradient(to left, #121212, transparent);
        }
      `}</style>

      <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
      {loading && (
        <LinearProgress
          sx={{
            width: '100%',
            position: 'fixed',
            top: 0,
            bgcolor: '#1e1e1e',
            '& .MuiLinearProgress-bar': { bgcolor: greenAccent },
          }}
        />
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: '30vw',
            bgcolor: '#000',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            p: 1,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid #444',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              pl: 3,
              fontWeight: 500,
              letterSpacing: 0.5,
              color: '#fff',
            }}
          >
            Our Expert Lawyers
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            onClick={() =>
              router.push(
                '/explore-both-tdilcs-legal-units-and-lawyers/user_country?explore_state=user_state?explore_flag=tdilcs-expert-lawyers'
              )
            }
            sx={{
              color: '#00e676',
              borderColor: '#00e676',
              '&:hover': { borderColor: '#00c853', color: '#00c853' },
            }}
          >
            View All
          </Button>
        </Box>
      </Box>

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
        {error && (
          <Typography
            sx={{ mt: 2, color: '#ff5252', fontWeight: 600, textAlign: 'center' }}
          >
            {error}
          </Typography>
        )}
        {lawyersRow1.length > 0 || lawyersRow2.length > 0 ? (
          <Grid container spacing={2}>
            {/* Row 1 */}
            <Grid item xs={12}>
              <Box className="carousel">
                <Box className="carousel-track">
                  {[...lawyersRow1, ...lawyersRow1].map((lawyer, index) => (
                    <Box className="carousel-slide" key={`${lawyer.id}-${index}`}>
                      <Link
                        href={`/explore-both-tdilcs-legal-units-and-lawyers/${lawyer.country}?explore_state=${lawyer.state}?explore_flag=tdilcs-expert-lawyers`}
                      >
                        <Paper
                          elevation={6}
                          sx={{
                            width: 270,
                            height: 380,
                            background: '#000',
                            borderRadius: 3,
                            border: '1px solid #444',
                            p: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                              borderColor: greenAccent,
                            },
                          }}
                          role="region"
                          aria-label={`Lawyer ${formatUsername(lawyer.user?.username)}`}
                          tabIndex={0}
                        >
                          <Box
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              mb: 2,
                              mx: 'auto',
                              border: '2px solid #666',
                            }}
                          >
                            <img
                              src={lawyer.img_url}
                              alt={formatUsername(lawyer.user?.username)}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => handleImageError(e, lawyer.id)}
                              loading="lazy"
                            />
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#fff',
                              fontWeight: 700,
                              mb: 1,
                              textAlign: 'center',
                            }}
                          >
                            {formatUsername(lawyer.user?.username)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              textAlign: 'center',
                              color: '#ffc107',
                              fontWeight: 500,
                            }}
                          >
                            ⭐ {lawyer.rating || '4.7'} / 5.0
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#bbb', textAlign: 'center', mt: 0.5 }}
                          >
                            🎓 {lawyer.highest_degree || 'LL.B'}, {lawyer.department || 'Law'}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#bbb', textAlign: 'center', mt: 0.5 }}
                          >
                            💼 {lawyer.years_experience || 0} years experience
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mt: 1,
                            }}
                          >
                            <LocationOn sx={{ color: '#bbb', fontSize: 18, mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: '#bbb' }}>
                              {lawyer.district || 'Unknown'}, {lawyer.state || 'Unknown'}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ color: '#888', textAlign: 'center', fontSize: '0.75rem' }}
                          >
                            {lawyer.country}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#4caf50',
                              fontSize: '0.8rem',
                              textAlign: 'center',
                              mt: 1,
                              fontStyle: 'italic',
                            }}
                          >
                            🕒 Available Today: 2:00 PM – 5:30 PM
                          </Typography>
                          <Link
                            href={`/explore-both-tdilcs-legal-units-and-lawyers/tdilcs-expert-lawyer/${lawyer.user?.username}?lawyer_id=${lawyer.id}`}
                          >
                            <Button
                              fullWidth
                              variant="outlined"
                              sx={{
                                mt: 2,
                                color: '#00e676',
                                borderColor: '#00e676',
                                '&:hover': { borderColor: '#00c853', color: '#00c853' },
                              }}
                              aria-label={`Book consultation with ${formatUsername(lawyer.user?.username)}`}
                            >
                              Book Consultation
                            </Button>
                          </Link>
                        </Paper>
                      </Link>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
            {/* Row 2 */}
            <Grid item xs={12}>
              <Box className="carousel">
                <Box className="carousel-track">
                  {[...lawyersRow2, ...lawyersRow2].map((lawyer, index) => (
                    <Box className="carousel-slide" key={`${lawyer.id}-${index}`}>
                      <Link
                        href={`/explore-both-tdilcs-legal-units-and-lawyers/${lawyer.country}?explore_state=${lawyer.state}?explore_flag=tdilcs-expert-lawyers`}
                      >
                        <Paper
                          elevation={6}
                          sx={{
                            width: 270,
                            height: 380,
                            background: '#000',
                            borderRadius: 3,
                            border: '1px solid #444',
                            p: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                              borderColor: greenAccent,
                            },
                          }}
                          role="region"
                          aria-label={`Lawyer ${formatUsername(lawyer.user?.username)}`}
                          tabIndex={0}
                        >
                          <Box
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              mb: 2,
                              mx: 'auto',
                              border: '2px solid #666',
                            }}
                          >
                            <img
                              src={lawyer.img_url}
                              alt={formatUsername(lawyer.user?.username)}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => handleImageError(e, lawyer.id)}
                              loading="lazy"
                            />
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#fff',
                              fontWeight: 700,
                              mb: 1,
                              textAlign: 'center',
                            }}
                          >
                            {formatUsername(lawyer.user?.username)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              textAlign: 'center',
                              color: '#ffc107',
                              fontWeight: 500,
                            }}
                          >
                            ⭐ {lawyer.rating || '4.7'} / 5.0
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#bbb', textAlign: 'center', mt: 0.5 }}
                          >
                            🎓 {lawyer.highest_degree || 'LL.B'}, {lawyer.department || 'Law'}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#bbb', textAlign: 'center', mt: 0.5 }}
                          >
                            💼 {lawyer.years_experience || 0} years experience
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mt: 1,
                            }}
                          >
                            <LocationOn sx={{ color: '#bbb', fontSize: 18, mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: '#bbb' }}>
                              {lawyer.district || 'Unknown'}, {lawyer.state || 'Unknown'}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ color: '#888', textAlign: 'center', fontSize: '0.75rem' }}
                          >
                            {lawyer.country}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#4caf50',
                              fontSize: '0.8rem',
                              textAlign: 'center',
                              mt: 1,
                              fontStyle: 'italic',
                            }}
                          >
                            🕒 Available Today: 2:00 PM – 5:30 PM
                          </Typography>
                          <Link
                            href={`/explore-both-tdilcs-legal-units-and-lawyers/tdilcs-expert-lawyer/${lawyer.user?.username}?lawyer_id=${lawyer.id}`}
                          >
                            <Button
                              fullWidth
                              variant="outlined"
                              sx={{
                                mt: 2,
                                color: '#00e676',
                                borderColor: '#00e676',
                                '&:hover': { borderColor: '#00c853', color: '#00c853' },
                              }}
                              aria-label={`Book consultation with ${formatUsername(lawyer.user?.username)}`}
                            >
                              Book Consultation
                            </Button>
                          </Link>
                        </Paper>
                      </Link>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography
            variant="h6"
            sx={{ color: '#888', textAlign: 'center', mt: 6, fontWeight: 500 }}
          >
            No lawyers found.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

import { Suspense } from 'react';

export default function LawyersCaroselPageUpdated() {
  return (
    <Suspense fallback={ <Box
        sx={{
          background: '#121212',
          color: '#fff',
          p: 3,
          minHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              width: '30vw',
              height: '48px',
              bgcolor: '#000',
              borderRadius: 3,
            }}
          />
          <Skeleton variant="rectangular" sx={{ width: '100px', height: '36px' }} />
        </Box>
        <Box sx={{ position: 'relative', py: 1, overflow: 'visible' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box className="carousel">
                <Box className="carousel-track" sx={{ display: 'flex' }}>
                  {[...Array(10)].map((_, index) => (
                    <Box className="carousel-slide" key={`row1-${index}`}>
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          width: 270,
                          height: 380,
                          bgcolor: '#000',
                          borderRadius: 3,
                          border: '1px solid #333',
                          m: '0 2px',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box className="carousel">
                <Box className="carousel-track" sx={{ display: 'flex' }}>
                  {[...Array(10)].map((_, index) => (
                    <Box className="carousel-slide" key={`row2-${index}`}>
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          width: 270,
                          height: 380,
                          bgcolor: '#000',
                          borderRadius: 3,
                          border: '1px solid #333',
                          m: '0 2px',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>}>
      <LawyersCarouselPage/>
    </Suspense>
  );
}