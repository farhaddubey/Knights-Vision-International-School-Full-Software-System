"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Pagination,
  PaginationItem,
  Drawer,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { Search as SearchIcon, LocationOn, ChevronLeft, ChevronRight, Menu as MenuIcon } from '@mui/icons-material';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

const placeholderImage =
  "https://img.freepik.com/premium-photo/wooden-court-gavel-wood-table-courtroom-judge-trial-auction-law-justice-legality-concept-judge_43157-2348.jpg?uid=R66968796&ga=GA1.1.2024053517.1740751536&semt=ais_hybrid&w=740";

const LegalUnitsAndLawyersFeaturingPage = () => {
  const [data, setData] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayMode, setDisplayMode] = useState('tdilcs-legal-units');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pageSize = 12;
  const loadedImages = useRef(new Set());
  const hasFetched = useRef(false); // Track if fetch has occurred

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:900px)');
  const countrySlug = pathname.split('/').pop();
  const exploreState = searchParams.get('explore_state');
  const exploreFlag = searchParams.get('explore_flag');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const greenAccent = '#00c853';

  const updateUrlParams = (mode, stateSlug, pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode) params.set('explore_flag', mode);
    if (stateSlug) params.set('explore_state', stateSlug);
    if (pageNum) params.set('page', pageNum.toString());
    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams.toString()}`) {
      router.push(newUrl, { scroll: false });
    }
  };

  useEffect(() => {
    setPage(currentPage);
    if (exploreFlag && ['tdilcs-legal-units', 'tdilcs-expert-lawyers'].includes(exploreFlag)) {
      setDisplayMode(exploreFlag);
    } else {
      setDisplayMode('tdilcs-legal-units');
      if (data?.states?.[0]?.slug) {
        updateUrlParams('tdilcs-legal-units', exploreState || data.states[0].slug, 1);
      }
    }
  }, []); // Run only on mount

  useEffect(() => {
    const fetchData = async () => {
      if (!countrySlug || hasFetched.current) return;
      hasFetched.current = true;
      setLoading(true);

      try {
        const legalUnitsResponse = await axios.get(
          `http://localhost:3000/api/api_next_app/legal-service-centers/by_country_slug`,
          { params: { slug: countrySlug, page: displayMode === 'tdilcs-legal-units' ? page : 1, pageSize } }
        );
        const legalUnitsData = legalUnitsResponse.data.data[0] || {};
        const legalUnitsTotal = legalUnitsResponse.data.total || 0;

        const lawyersResponse = await axios.get(
          `http://localhost:3000/api/api_next_app/users/by_country_slug`,
          { params: { slug: countrySlug, page: displayMode === 'tdilcs-expert-lawyers' ? page : 1, pageSize } }
        );
        const lawyersData = lawyersResponse.data.data[0] || {};
        const lawyersTotal = lawyersResponse.data.total || 0;

        if (!legalUnitsData.states && !lawyersData.states) {
          throw new Error('No states found in response data.');
        }

        const mergedData = {
          name: legalUnitsData.name || lawyersData.name || countrySlug,
          states: (legalUnitsData.states || []).map((state) => {
            const lawyerState = lawyersData?.states?.find((ls) => ls.slug === state.slug) || {};
            return {
              ...state,
              serviceCenters: state.serviceCenters || [],
              lawyerProfiles: lawyerState.lawyerProfiles || [],
            };
          }),
        };

        if (!mergedData.states.length && lawyersData.states) {
          mergedData.states = lawyersData.states.map((state) => ({
            ...state,
            serviceCenters: [],
            lawyerProfiles: state.lawyerProfiles || [],
          }));
        }

        setData(mergedData);
        setTotalPages(
          displayMode === 'tdilcs-legal-units'
            ? Math.ceil(legalUnitsTotal / pageSize)
            : Math.ceil(lawyersTotal / pageSize)
        );

        if (mergedData?.states?.length > 0) {
          const targetState = exploreState
            ? mergedData.states.find((state) => state.slug === exploreState)
            : mergedData.states.find(
                (state) =>
                  (displayMode === 'tdilcs-legal-units' && state.serviceCenters?.length > 0) ||
                  (displayMode === 'tdilcs-expert-lawyers' && state.lawyerProfiles?.length > 0)
              ) || mergedData.states[0];
          setSelectedState(targetState);
          if (targetState && (targetState.slug !== exploreState || !searchParams.get('explore_flag'))) {
            updateUrlParams(displayMode, targetState.slug, page);
          }
        } else {
          setError('No states available for this country.');
        }
      } catch (err) {
        console.error(`Error fetching data for ${countrySlug}:`, err);
        setError(err.message || 'Failed to load data.');
        toast.error(err.message || 'Failed to load data.');
      } finally {
        setLoading(false);
        hasFetched.current = false;
      }
    };
    fetchData();
  }, [countrySlug, displayMode, page, pageSize, exploreState]);

  useEffect(() => {
    setSearchQuery('');
    setPage(1);
    if (selectedState?.slug || exploreState || data?.states[0]?.slug) {
      updateUrlParams(displayMode, selectedState?.slug || exploreState || data?.states[0]?.slug, 1);
    }
  }, [selectedState, displayMode]);
  const handleStateClick = (state) => {
    setSelectedState(state);
    setPage(1);
    updateUrlParams(displayMode, state.slug, 1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
    updateUrlParams(displayMode, selectedState?.slug || exploreState, 1);
  };

  const handleTabChange = (event, newValue) => {
    setDisplayMode(newValue);
    setPage(1);
    updateUrlParams(newValue, selectedState?.slug || exploreState || data?.states[0]?.slug, 1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    updateUrlParams(displayMode, selectedState?.slug || exploreState, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatUsername = (username) =>
    username
      ? username
          .replace("adv_", "")
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "Unknown Lawyer";

  const handleImageError = (e, id) => {
    if (!loadedImages.current.has(id)) {
      loadedImages.current.add(id);
      e.target.src = placeholderImage;
    }
  };

  const filteredItems = selectedState
    ? (displayMode === 'tdilcs-legal-units'
        ? selectedState.serviceCenters || []
        : selectedState.lawyerProfiles || []
      ).filter((item) =>
        [displayMode === 'tdilcs-legal-units' ? item.name : formatUsername(item.user?.username), item.description, item.specialization, item.bio]
          .filter(Boolean)
          .some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh', bgcolor: '#121212' }}>
        <CircularProgress size={60} sx={{ color: '#fff' }} />
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

  if (!data || !data.states) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, bgcolor: '#121212', color: '#fff' }}>
        <Typography variant="h6">
          No data found.
        </Typography>
      </Box>
    );
  }

  const statesList = (
    <Box
      sx={{
        width: isMobile ? 250 : '18vw',
        maxWidth: isMobile ? 250 : '18vw',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pr: 2,
        borderRight: isMobile ? 'none' : '1px solid #333',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { width: '0px' },
        bgcolor: '#000',
      }}
    >
      <Button variant="outlined" size="small" sx={{ fontSize: '14px', textAlign: 'left', color: '#fff', borderColor: '#333' }}>
        {data.name} States
      </Button>
      {data.states.map((state) => (
        <Paper
          key={state.slug}
          elevation={3}
          sx={{
            bgcolor: selectedState?.slug === state.slug ? '#333' : '#1c1c1c',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            p: 1,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: '#333' },
          }}
          onClick={() => {
            handleStateClick(state);
            if (isMobile) setDrawerOpen(false);
          }}
        >
          <Typography
            variant="body1"
            sx={{
              flexGrow: 1,
              color: '#fff',
              fontSize: '0.9rem',
            }}
          >
            {state.name}
          </Typography>
        </Paper>
      ))}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', color: '#fff' }}>
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
                  display: { xs: 'flex', sm: 'flex', md: 'none' },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: 30,
                  bgcolor: '#121212',
                  minWidth: '100vw',
                  maxWidth: '100vw',
                  borderBottom: '1px solid #222',
                  top: 0,
                  zIndex: 100,
                }}
              >
                <IconButton
              onClick={toggleDrawer(true)}
                  sx={{ color: '#fff' }}
                  aria-label="Open categories menu"
                >
                  <MenuIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                      <Tabs
                    value={displayMode}
                    onChange={handleTabChange}
                    sx={{
                      '& .MuiTab-root': {
                        color: '#fff',
                        fontWeight: 500,
                        textTransform: 'none',
                        '&.Mui-selected': {
                          color: displayMode === 'tdilcs-legal-units' ? '#00c853' : '#f44336',
                        },
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: displayMode === 'tdilcs-legal-units' ? '#00c853' : '#f44336',
                      },
                    }}
                  >
                    <Tab label="Legal Units" value="tdilcs-legal-units" />
                    <Tab label="Lawyers" value="tdilcs-expert-lawyers" />
                  </Tabs>
                </Box>
              </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', px: 2, py: 1 }}>
        {isMobile ? (
          <>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              sx={{
                '& .MuiDrawer-paper': {
                  bgcolor: '#000',
                  color: '#fff',
                  width: 250,
                },
              }}
            >
              {statesList}
            </Drawer>
          </>
        ) : (
          statesList
        )}
        <Box
          sx={{
            width: isMobile ? '100%' : '82vw',
            flexGrow: 1,
            pl: isMobile ? 0 : 2,
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { width: '0px' },
          }}
        >
          {selectedState && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Typography variant="h6" sx={{ textAlign: 'left' }}>
                  {selectedState.name} {displayMode === 'tdilcs-legal-units' ? 'Legal Units' : 'Lawyers'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, display:{xs:'none', sm:'none', md:'block'} }}>
                  <Tabs
                    value={displayMode}
                    onChange={handleTabChange}
                    sx={{
                      '& .MuiTab-root': {
                        color: '#fff',
                        fontWeight: 500,
                        textTransform: 'none',
                        '&.Mui-selected': {
                          color: displayMode === 'tdilcs-legal-units' ? '#00c853' : '#f44336',
                        },
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: displayMode === 'tdilcs-legal-units' ? '#00c853' : '#f44336',
                      },
                    }}
                  >
                    <Tab label="Legal Units" value="tdilcs-legal-units" />
                    <Tab label="Lawyers" value="tdilcs-expert-lawyers" />
                  </Tabs>
                </Box>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder={`Search ${displayMode === 'tdilcs-legal-units' ? 'legal units' : 'lawyers'}...`}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  sx={{
                    width: '100%',
                    maxWidth: '400px',
                    bgcolor: '#1c1c1c',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': { borderColor: '#333' },
                      '&:hover fieldset': { borderColor: '#555' },
                      '&.Mui-focused fieldset': { borderColor: greenAccent },
                    },
                    '& .MuiInputAdornment-root': { color: '#bbb' },
                    '& .MuiInputBase-input': { color: '#fff' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              {filteredItems.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredItems.map((item) =>
                    displayMode === 'tdilcs-legal-units' ? (
                      <Grid item xs={12} sm={6} lg={3} key={item.id}>
                        <Paper
                          elevation={6}
                          sx={{
                            height: 350,
                            width: 270,
                            background: '#000',
                            borderRadius: 3,
                            border: '1px solid #444',
                            p: 3,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                              borderColor: greenAccent,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              height: 90,
                              borderRadius: 2,
                              overflow: 'hidden',
                              mb: 2,
                            }}
                          >
                            <Image
                              src={item.coverImageUrl || placeholderImage}
                              alt={item.name}
                              width={270}
                              height={90}
                              style={{ objectFit: 'cover' }}
                              onError={(e) => handleImageError(e, item.id)}
                            />
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#fff',
                              fontWeight: 700,
                              mb: 2,
                              fontSize: '16px',
                            }}
                          >
                            {item.name?.substring(0, 30)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocationOn sx={{ color: '#ff0000', fontSize: 18, mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: '#bbb' }}>
                              {[item.address, item.state?.name, item.country?.name]
                                .filter(Boolean)
                                .join(', ')}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#bbb', mb: 2, lineHeight: 1.6 }}>
                            {item.description?.substring(0, 120)}...
                          </Typography>
                          <Button
                            component={Link}
                            href={`/explore-both-tdilcs-legal-units-and-lawyers/legal-unit/${item.slug}`}
                            variant="outlined"
                            sx={{
                              color: greenAccent,
                              borderColor: greenAccent,
                              '&:hover': { bgcolor: 'rgba(0,200,83,0.1)' },
                              width: '100%',
                            }}
                          >
                            View Details
                          </Button>
                        </Paper>
                      </Grid>
                    ) : (
                      <Grid item xs={12} sm={6} lg={3} key={item.id}>
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
                          aria-label={`Lawyer ${formatUsername(item.user?.username)}`}
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
                            <Image
                              src={item.img_url || placeholderImage}
                              alt={formatUsername(item.user?.username)}
                              width={100}
                              height={100}
                              style={{ objectFit: 'cover' }}
                              onError={(e) => handleImageError(e, item.id)}
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
                            {formatUsername(item.user?.username)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              textAlign: 'center',
                              color: '#FFD700',
                              fontWeight: 500,
                            }}
                          >
                            ★ {item.rating || '4.7'} / 5.0
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#bbb', textAlign: 'center', mt: 0.5 }}
                          >
                            🎓 {item.highest_degree || 'LL.B'}, {item.specialization || 'Law'}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#bbb', textAlign: 'center', mt: 0.5 }}
                          >
                            💼 {item.years_experience || 0} years experience
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
                              {item.district || 'Unknown'}, {item.state || ''}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ color: '#888', textAlign: 'center', fontSize: '0.75rem' }}
                          >
                            {data.name}
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
                            href={`/explore-both-tdilcs-legal-units-and-lawyers/tdilcs-expert-lawyer/${item.user?.username}?lawyer_id=${item.id}`}
                          >
                            <Button
                              fullWidth
                              variant="outlined"
                              sx={{
                                mt: 2,
                                color: greenAccent,
                                borderColor: greenAccent,
                                '&:hover': { borderColor: '#00c853', color: '#00c853' },
                              }}
                              aria-label={`Book consultation with ${formatUsername(item.user?.username)}`}
                            >
                              Book Consultation
                            </Button>
                          </Link>
                        </Paper>
                      </Grid>
                    )
                  )}
                </Grid>
              ) : (
                <Typography variant="body1" sx={{ color: '#bbb', textAlign: 'center', mt: 4 }}>
                  No {displayMode === 'tdilcs-legal-units' ? 'Legal Units' : 'Lawyers'} found for the search query.
                </Typography>
              )}
              <Box sx={{ flexGrow: 1 }} />
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#fff',
                        '&:hover': { bgcolor: '#333' },
                        '&.Mui-selected': {
                          bgcolor: greenAccent,
                          color: '#000',
                          '&:hover': { bgcolor: greenAccent },
                        },
                      },
                    }}
                    renderItem={(item) => (
                      <PaginationItem
                        components={{ previous: ChevronLeft, next: ChevronRight }}
                        {...item}
                      />
                    )}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LegalUnitsAndLawyersFeaturingPage;