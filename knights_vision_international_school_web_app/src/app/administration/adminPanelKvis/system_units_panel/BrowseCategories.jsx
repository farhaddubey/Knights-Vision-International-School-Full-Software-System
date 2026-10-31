import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  LinearProgress,
  TextField,
  InputAdornment,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { Category, Add, RotateRight, Delete, Search, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from 'next/navigation';
import BrowseCategoriesDialog from "./dialogs/BrowseCategoriesDialog";

const drawerWidth = 280;
const appBarHeight = 80;
const pageSize = 10;
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
      [category.name, category.description, category.department?.name].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
    setFilteredCategories(filtered);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to close the modal? Unsaved changes will be lost."
    );
    if (userConfirmed) {
      setOpenInsertion(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpenInsertion(false);
    fetchCategories(page);
    setEditFields({});
  };

  const handleInsertionOpenModal = (category = {}) => {
    setEditFields({
      id: category.id ?? null,
      name: category.name ?? "",
      description: category.description ?? "",
      departmentId: category.departmentId ?? "",
    });
    setOpenInsertion(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setApiLoading(true);
      try {
        await axios.delete(`/api/categories/${id}`);
        toast.success("Category deleted successfully!");
        fetchCategories(page);
      } catch (err) {
        console.error("Delete Error:", err);
        toast.error("Failed to delete category.");
      } finally {
        setApiLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={120} />
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
        minWidth: `82vw`,
        backgroundColor: "#212121",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {apiLoading && (
        <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />
      )}

      <ListItem
        sx={{
          backgroundColor: "#b71c1c",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 1,
          padding: "8px 16px",
        }}
      >
        <Category sx={{ mr: 1 }} />
        <ListItemText primary="Browse Categories" />
        <TextField
          placeholder='Search by Name, Description, or Department'
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
          onClick={() => handleInsertionOpenModal()}
          variant="contained"
          color="primary"
          startIcon={<Add />}
          sx={{ mr: 1 }}
        >
          Add Category
        </Button>
        <Button
          onClick={() => fetchCategories(page)}
          variant="outlined"
          sx={{ color: greenAccent, borderColor: greenAccent }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
      </ListItem>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Description
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Department
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>

        <Box
          sx={{
            maxHeight: `calc(100vh - ${appBarHeight + 150}px)`,
            overflow: "auto",
            bgcolor: "#121212",
            borderRadius: 1,
            p: 1,
          }}
        >
          <List>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <ListItem
                  key={category.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    bgcolor: "#181818",
                    mb: 1,
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {category.description}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {category.department?.name ?? "N/A"}
                  </Typography>
                  <Box sx={{ flex: 1, display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleInsertionOpenModal(category)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(category.id)}
                      startIcon={<Delete />}
                    >
                      Delete
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No categories found.
              </Typography>
            )}
          </List>
        </Box>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, bgcolor: '#181818' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => {
              console.log('[BrowseCategories] Page changed to:', value);
              setPage(value);
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set('page', value.toString());
              router.push(`?${newSearchParams.toString()}`);
            }}
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
      </Box>

      <BrowseCategoriesDialog
        openInsertion={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchCategories={fetchCategories}
      />
    </Box>
  );
};

export default BrowseCategories;