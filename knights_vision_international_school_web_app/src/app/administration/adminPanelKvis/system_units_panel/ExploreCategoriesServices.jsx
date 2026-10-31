import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  LinearProgress,
  Paper,
  CardMedia,
  ListItemIcon,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { Apartment, Add, RotateRight, Delete, Close, Search, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from 'next/navigation';
import ServicesByCategoryDialog from "./dialogs/ExploreServicesByCategoryIdDialog";

const appBarHeight = 80;
const pageSize = 8;
const greenAccent = '#00c853';

const BrowseCategories = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Sync page state with URL
  useEffect(() => {
    console.log('[BrowseCategories] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchCategories = async (pageNum = 1) => {
    setApiLoading(true);
    try {
      setError(null);
      const response = await axios.get("/api/categories", {
        params: { page: pageNum, pageSize },
      });

      // Log response for debugging
      console.log('[fetchCategories] Response:', response.data);

      // Validate response structure
      if (!response.data || !Array.isArray(response.data.categories)) {
        throw new Error('Invalid response format: categories array missing');
      }

      setCategories(response.data.categories);
      setFilteredCategories(response.data.categories);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchCategories] totalPages set to:', response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.response?.data?.error || "Failed to fetch categories.");
      toast.error("Failed to fetch categories.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  // Fetch categories when page changes
  useEffect(() => {
    console.log('[BrowseCategories] Fetching categories for page:', page);
    fetchCategories(page);
  }, [page]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = categories.filter((category) =>
      [category.name, category.description, category.type].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
    setFilteredCategories(filtered);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm("Are you sure you want to close the modal?");
    if (userConfirmed) {
      setOpenInsertion(false);
      setEditFields({});
      setSelectedCategory(null);
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpenInsertion(false);
    fetchCategories(page);
    setEditFields({});
    setSelectedCategory(null);
  };

  const handleInsertionOpenModal = (category = {}) => {
    setSelectedCategory(category);
    setEditFields(category);
    setOpenInsertion(true);
  };

  const handlePageChange = (event, value) => {
    console.log('[BrowseCategories] Page changed to:', value);
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={180} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: "82vw",
        backgroundColor: "#111111",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
      }}
    >
      <ToastContainer theme="dark" />
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
      <ListItem sx={{ backgroundColor: "#009688", color: "#fff", p:1 }}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary="Browse Categories" />
        <TextField
          placeholder='Search by Name, Description, or Type'
          value={searchQuery}
          onChange={handleSearch}
          size='small'
          sx={{
            width: '250px',
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
          InputProps={{
            startAdornment: <Search sx={{ color: '#fff', mr: 1 }} />,
          }}
        />
        <Button
          onClick={() => fetchCategories(page)}
          variant="outlined"
          sx={{ position: "absolute", right: 80, top: 8, color: "#00c853", borderColor: "#00c853" }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336", borderColor: "#f44336" }}
          startIcon={<Close />}
        >
          Close
        </Button>
      </ListItem>

      <Grid container spacing={3} sx={{p:1, px:2, overflowY:"scroll", maxHeight:`calc(100vh - ${appBarHeight + 100}px)`}}>
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <Grid item xs={12} sm={6} lg={3} key={category.id}>
              <Paper
                elevation={3}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  backgroundColor: "#000",
                  borderRadius: 2,
                  overflow: "hidden",
                  maxWidth:"285px",
                  minWidth:"285px",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  },
                }}
              >
                {category.image ? (
                  <CardMedia
                    component="img"
                    height="140"
                    image={category.image}
                    alt={category.name}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 140,
                      backgroundColor: "#333",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography color="#bbb">No Image</Typography>
                  </Box>
                )}
                <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#bbb" }}>
                    {category.description || "No description available"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#00c853", fontWeight: 500 }}>
                    {category.type || "No type specified"}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleInsertionOpenModal(category)}
                  >
                    Explore Services
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))
        ) : (
          <Typography sx={{ color: '#fff', textAlign: 'center', p: 2, width: '100%' }}>
            No categories found.
          </Typography>
        )}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, bgcolor: '#111111' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color='primary'
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

      {selectedCategory && (
        <ServicesByCategoryDialog
          openInsertion={openInsertion}
          handleCloseModal={handleCloseModal}
          category={selectedCategory}
        />
      )}
    </Box>
  );
};

export default BrowseCategories;