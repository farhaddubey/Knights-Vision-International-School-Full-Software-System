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
import { Apartment, Add, RotateRight, Delete, Search, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from 'next/navigation';
import BrowseDepartmentsDialog from "./dialogs/BrowseDepartmentsDialog";

const appBarHeight = 80;
const pageSize = 10;
const greenAccent = '#00c853';

const BrowseDepartments = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
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
    console.log('[BrowseDepartments] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchDepartments = async (pageNum = 1) => {
    setApiLoading(true);
    try {
      setError(null);
      const response = await axios.get("/api/departments", {
        params: { page: pageNum, pageSize },
      });

      // Log response for debugging
      console.log('[fetchDepartments] Response:', response.data);

      // Validate response structure
      if (!response.data || !Array.isArray(response.data.departments)) {
        throw new Error('Invalid response format: departments array missing');
      }

      setDepartments(response.data.departments);
      setFilteredDepartments(response.data.departments);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchDepartments] totalPages set to:', response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError(err.response?.data?.error || "Failed to fetch departments.");
      toast.error("Failed to fetch departments.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  // Fetch departments when page changes
  useEffect(() => {
    console.log('[BrowseDepartments] Fetching departments for page:', page);
    fetchDepartments(page);
  }, [page]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = departments.filter((department) =>
      [department.name, department.slug, department.description].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
    setFilteredDepartments(filtered);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm("Are you sure you want to close the modal?");
    if (userConfirmed) {
      setOpenInsertion(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpenInsertion(false);
    fetchDepartments(page);
    setEditFields({});
  };

  const handleInsertionOpenModal = (department = {}) => {
    setEditFields({
      id: department.id ?? null,
      name: department.name ?? "",
      description: department.description ?? "",
      slug: department.slug ?? "",
      translations: department.translations ? JSON.stringify(department.translations, null, 2) : "",
    });
    setOpenInsertion(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      setApiLoading(true);
      try {
        await axios.delete(`/api/departments/${id}`);
        toast.success("Department deleted successfully!");
        fetchDepartments(page);
      } catch (err) {
        console.error("Delete Error:", err);
        toast.error("Failed to delete department.");
      } finally {
        setApiLoading(false);
      }
    }
  };

  const handlePageChange = (event, value) => {
    console.log('[BrowseDepartments] Page changed to:', value);
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
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
    <Box sx={{ position: "fixed", 
      minWidth: `82vw`,
      backgroundColor: "#212121", 
      height: `calc(100vh - ${appBarHeight}px)`,
      color: "#fff" }}>
      <ToastContainer theme="dark" />
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
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
        <Apartment sx={{ mr: 1 }} />
        <ListItemText primary="Browse Departments" />
        <TextField
          placeholder='Search by Name, Slug, or Description'
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
          Add Department
        </Button>
        <Button
          onClick={() => fetchDepartments(page)}
          variant="outlined"
          sx={{ color: greenAccent, borderColor: greenAccent }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
      </ListItem>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 1, bgcolor: "#333", borderRadius: 1, position: "sticky", top: 0, zIndex: 1 }}>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Name</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Slug</Typography>
          <Typography variant="body2" sx={{ flex: 2, fontWeight: "bold", color: "#fff" }}>Description</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Actions</Typography>
        </Box>

        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 150}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1, paddingBottom: 10 }}>
          <List>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((department) => (
                <ListItem key={department.id} sx={{ display: "flex", justifyContent: "space-between", p: 1, bgcolor: "#181818", mb: 1, borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{department.name}</Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{department.slug}</Typography>
                  <Typography variant="body2" sx={{ flex: 2, color: "#fff" }}>{department.description}</Typography>
                  <Box sx={{ flex: 1, display: "flex", gap: 1 }}>
                    <Button variant="contained" color="success" onClick={() => handleInsertionOpenModal(department)} sx={{ mr: 1 }}>Edit</Button>
                    <Button variant="contained" color="error" onClick={() => handleDelete(department.id)} startIcon={<Delete />}>Delete</Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No departments found.
              </Typography>
            )}
          </List>
        </Box>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, bgcolor: '#181818' }}>
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
      </Box>

      <BrowseDepartmentsDialog
        openInsertion={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchDepartments={fetchDepartments}
      />
    </Box>
  );
};

export default BrowseDepartments;