"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Drawer,
  Grid,
  Pagination,
  PaginationItem,
} from '@mui/material';
import { Search as SearchIcon, ChevronLeft, ChevronRight, Menu as MenuIcon } from '@mui/icons-material';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

const placeholderImage = "https://img.freepik.com/premium-photo/wooden-court-gavel-wood-table-courtroom-judge-trial-auction-law-justice-legality-concept-judge_43157-2348.jpg";

const DepartmentCategoriesPage = () => {
  const [departmentData, setDepartmentData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayMode, setDisplayMode] = useState('problems');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;
  const [paginatedItems, setPaginatedItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isManualCategorySelection, setIsManualCategorySelection] = useState(false);
  const loadedImages = useRef(new Set());

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const departmentSlug = pathname.split('/').pop();
  const exploreCategorySlug = searchParams.get('explore_category');
  const exploreFlag = searchParams.get('explore_flag');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const greenAccent = '#00c853';

  // Sync page state with URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const updateUrlParams = (newDisplayMode, categorySlug, pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('explore_flag', newDisplayMode);
    params.set('explore_category', categorySlug);
    params.set('page', pageNum.toString());
    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams.toString()}`) {
      router.push(newUrl, { scroll: false });
    }
  };

  const fetchDepartmentData = async (pageNum = 1) => {
    if (!departmentSlug) {
      setError('No department slug provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const apiEndpoint =
        displayMode === 'services'
          ? `/api/api_next_app/department/${departmentSlug}`
          : `/api/api_next_app/department/problems/${departmentSlug}`;
      const response = await axios.get(apiEndpoint, {
        params: { page: pageNum, pageSize },
      });

      if (!response.data || !response.data.department) {
        throw new Error('No department data found.');
      }

      const normalizedData = {
        department: response.data.department,
        categories: response.data.categories.map((category) => ({
          ...category,
          services: category.services || [],
          problems: category.problems || [],
        })),
        total: response.data.total || 0,
      };

      setDepartmentData(normalizedData);
      setTotalPages(Math.max(1, Math.ceil(normalizedData.total / pageSize)));
      setPaginatedItems(
        displayMode === 'services'
          ? normalizedData.categories.find(
              (cat) => cat.categorySlug === selectedCategory?.categorySlug
            )?.services || []
          : normalizedData.categories.find(
              (cat) => cat.categorySlug === selectedCategory?.categorySlug
            )?.problems || []
      );

      if (!isManualCategorySelection && normalizedData.categories && normalizedData.categories.length > 0) {
        let targetCategory;
        if (exploreCategorySlug) {
          targetCategory = normalizedData.categories.find(
            (category) => category.categorySlug === exploreCategorySlug
          );
        }
        if (!targetCategory) {
          targetCategory = normalizedData.categories.find(
            (category) =>
              (displayMode === 'services' && category.services.length > 0) ||
              (displayMode === 'problems' && category.problems.length > 0)
          ) || normalizedData.categories[0];
        }
        if (targetCategory && targetCategory.categorySlug !== selectedCategory?.categorySlug) {
          setSelectedCategory(targetCategory);
          updateUrlParams(displayMode, targetCategory.categorySlug, pageNum);
        }
      }
    } catch (err) {
      console.error(`Error fetching department ${departmentSlug}:`, err);
      setError('Failed to load department data. Please check your database connection.');
      toast.error('Failed to load department data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setPaginatedItems([]);
    setIsManualCategorySelection(false);
    fetchDepartmentData(1);
  }, [departmentSlug, displayMode]);

  useEffect(() => {
    fetchDepartmentData(page);
  }, [page]);

  useEffect(() => {
    if (exploreFlag && exploreFlag !== displayMode) {
      setDisplayMode(exploreFlag === 'services' ? 'services' : 'problems');
    }
  }, [exploreFlag]);

  useEffect(() => {
    setSearchQuery('');
  }, [selectedCategory]);

  const handleCategoryClick = (category) => {
    if (category.categorySlug !== selectedCategory?.categorySlug) {
      setSelectedCategory(category);
      setIsManualCategorySelection(true);
      setPage(1);
      setPaginatedItems(
        displayMode === 'services'
          ? departmentData?.categories.find(
              (cat) => cat.categorySlug === category.categorySlug
            )?.services || []
          : departmentData?.categories.find(
              (cat) => cat.categorySlug === category.categorySlug
            )?.problems || []
      );
      updateUrlParams(displayMode, category.categorySlug, 1);
      setDrawerOpen(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setDisplayMode(newValue);
    setPage(1);
    setPaginatedItems([]);
    updateUrlParams(newValue, selectedCategory?.categorySlug || exploreCategorySlug || 'default', 1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    updateUrlParams(displayMode, selectedCategory?.categorySlug || exploreCategorySlug || 'default', newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageError = (e, id) => {
    if (!loadedImages.current.has(id)) {
      loadedImages.current.add(id);
      e.target.src = placeholderImage;
    }
  };

  const filteredItems = paginatedItems.filter((item) =>
    displayMode === 'services'
      ? [item.name, item.description]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
      : [item.title, item.description]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  if (!departmentData || !departmentData.department) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, bgcolor: '#121212', color: '#fff' }}>
        <Typography variant="h6">
          Department not found.
        </Typography>
      </Box>
    );
  }

  const { department, categories } = departmentData;

  const CategoriesContent = () => (
    <Box
      sx={{
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pr: 2,
        borderRight: { xs: 'none', md: '1px solid #333' },
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { width: '0px' },
        bgcolor: '#000',
      }}
    >

      <Button
        variant="outlined"
        size="small"
        sx={{ fontSize: '14px', textAlign: 'left', color: '#fff', borderColor: '#333' }}
      >
        {department.name} Categories
      </Button>
      {categories.map((category) => (
        <Paper
          key={category.categoryId}
          elevation={3}
          sx={{
            bgcolor: selectedCategory?.categoryId === category.categoryId ? '#333' : '#1c1c1c',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            p: 1,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: '#333' },
          }}
          onClick={() => handleCategoryClick(category)}
        >
          <Box
            sx={{
              width: '40px',
              height: '40px',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              mr: 1,
            }}
          >
            <Image
              src={category.image || placeholderImage}
              alt={category.categoryName}
              fill
              style={{ objectFit: 'cover' }}
              sizes="40px"
              onError={(e) => handleImageError(e, category.categoryId)}
            />
          </Box>
          <Typography
            variant="body1"
            sx={{
              flexGrow: 1,
              color: '#fff',
              fontSize: '0.9rem',
            }}
          >
            {category.categoryName}
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
      <Box sx={{maxHeight:'10vh', display:{xs:'block', md:'none'}}}>
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
            position: 'sticky',
            top: 0,
          }}
        >
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ color: '#fff' }}
            aria-label="Open categories menu"
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Tabs
              value={displayMode}
              onChange={handleTabChange}
              centered
              sx={{
                minHeight: 'auto',
                '& .MuiTab-root': {
                  fontSize: 14,
                  padding: '6px 12px',
                  minHeight: 'auto',
                  color: '#fff',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: displayMode === 'services' ? greenAccent : '#f44336',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: displayMode === 'services' ? greenAccent : '#f44336',
                },
              }}
            >
              <Tab label="Services" value="services" />
              <Tab label="Problems" value="problems" />
            </Tabs>
          </Box>
        </Box>
</Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', px: 2, py: 1 }}>
    




        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width:'90vw',
              bgcolor: '#000',
              color: '#fff',
              height: '100%',
              overflowY: 'auto',
            },
          }}
        >
          {CategoriesContent()}
        </Drawer>
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: '18vw',
            maxWidth: '18vw',
            height: '90vh',
            flexDirection: 'column',
            gap: 1,
            borderRight: '1px solid #333',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { width: '0px' },
          }}
        >
          {CategoriesContent()}
        </Box>
        <Box
          sx={{
            width: { xs: '95vw', md: '82vw' },
            // flexGrow: 1,
            pl: { xs: 0, md: 2 },
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { width: '0px' },
          }}
        >
          {selectedCategory && (
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
                  px: { xs: 1, md: 0 },
                }}
              >
                <Typography variant="h6" sx={{ textAlign: 'left',  display: { xs: 'none', md: 'flex' }, }}>
                  {selectedCategory.categoryName} {displayMode === 'services' ? 'Services' : 'Problems'}
                </Typography>
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
                  <Tabs
                    value={displayMode}
                    onChange={handleTabChange}
                    sx={{
                      '& .MuiTab-root': {
                        color: '#fff',
                        fontWeight: 500,
                        textTransform: 'none',
                        '&.Mui-selected': {
                          color: displayMode === 'services' ? greenAccent : '#f44336',
                        },
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: displayMode === 'services' ? greenAccent : '#f44336',
                      },
                    }}
                  >
                    <Tab label="Services" value="services" />
                    <Tab label="Problems" value="problems" />
                  </Tabs>
                </Box>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder={`Search ${displayMode === 'services' ? 'services' : 'problems'}...`}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  sx={{
                     display: { xs: 'none', md: 'flex' },
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
              <Box sx={{ px: { xs: 1, md: 0 } }}>
                {filteredItems.length > 0 ? (
                  <Grid container spacing={3}>
                    {filteredItems.map((item) => (
                      <Grid
                        
                        key={displayMode === 'services' ? item.id : item.id}
                      >
                        <Paper
                          elevation={6}
                          sx={{
                            width: 270,
                            height: displayMode === 'services' ? 380 : 370,
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
                        >
                          <Link
                            href={
                              displayMode === 'services'
                                ? `/book-services/${item.slug}`
                                : `/explore-the-problem-and-book-services/${item.slug}`
                            }
                            style={{ textDecoration: 'none' }}
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
                                src={displayMode === 'services' ? (item.image || placeholderImage) : (item.iconUrl || placeholderImage)}
                                alt={displayMode === 'services' ? item.name : item.title}
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
                                mb: 1,
                                fontSize: '16px',
                              }}
                            >
                              {(displayMode === 'services' ? item.name : item.title)?.substring(0, 30)}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#bbb',
                                mb: 2,
                                lineHeight: 1.6,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {(displayMode === 'services' ? item.description : item.description) || 'No description available'}...
                            </Typography>
                            <Divider sx={{ my: 1, borderColor: '#333' }} />
                            {displayMode === 'services' ? (
                              <>
                                <Typography variant="body2" sx={{ color: greenAccent, mb: 1 }}>
                                  Price: {item.currency} {item.price?.toLocaleString() || 'N/A'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                                  Rating: {item.averageRating || 0} ({item.ratingCount || 0} reviews)
                                </Typography>
                                {item.isFeatured && (
                                  <Chip
                                    label="Featured"
                                    size="small"
                                    color="primary"
                                    sx={{ mb: 1 }}
                                  />
                                )}
                              </>
                            ) : (
                              <>
                                <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                                  Service: {item.service?.name || 'Not specified'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                                  Keywords: {item.keywords?.join(', ') || 'None'}
                                </Typography>
                              </>
                            )}
                          </Link>
                          <Button
                            variant="outlined"
                            color="success"
                            fullWidth
                            sx={{
                              color: greenAccent,
                              borderColor: greenAccent,
                              '&:hover': { bgcolor: 'rgba(0,200,83,0.1)' },
                            }}
                            onClick={() => {
                              toast.info(
                                `Selected ${
                                  displayMode === 'services' ? 'service' : 'problem'
                                }: ${displayMode === 'services' ? item.name : item.title}`
                              );
                            }}
                          >
                            Select {displayMode === 'services' ? 'Service' : 'Problem'}
                          </Button>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body1" sx={{ color: '#bbb', textAlign: 'center', mt: 4 }}>
                    No {displayMode === 'services' ? 'Services' : 'Problems'} found.
                  </Typography>
                )}
              </Box>
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

export default DepartmentCategoriesPage;