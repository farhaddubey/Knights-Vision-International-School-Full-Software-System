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
import { Report, Add, RotateRight, Search, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from 'next/navigation';
import BrowseComplaintsDialog from "./dialogs/BrowseComplaintsDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 20;
const greenAccent = '#00c853';

const BrowseComplaints = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
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
    console.log('[BrowseComplaints] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchComplaints = async (pageNum = 1) => {
    setApiLoading(true);
    try {
      setError(null);
      const response = await axios.get("/api/complaints", {
        params: { page: pageNum, pageSize },
      });

      // Log response for debugging
      console.log('[fetchComplaints] Response:', response.data);

      // Validate response structure
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format: data array missing');
      }

      setComplaints(response.data.data);
      setFilteredComplaints(response.data.data);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchComplaints] totalPages set to:', response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError(err.response?.data?.error || "Failed to fetch complaints.");
      toast.error("Failed to fetch complaints.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  // Fetch complaints when page changes
  useEffect(() => {
    console.log('[BrowseComplaints] Fetching complaints for page:', page);
    fetchComplaints(page);
  }, [page]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = complaints.filter((complaint) =>
      [complaint.student?.firstName, complaint.student?.lastName, complaint.category, complaint.description, complaint.status].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
    setFilteredComplaints(filtered);
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
    fetchComplaints(page);
    setEditFields({});
  };

  const handleInsertionOpenModal = (complaint = {}) => {
    setEditFields({
      id: complaint.id ?? null,
      studentId: complaint.studentId ?? "",
      category: complaint.category ?? "OTHER",
      description: complaint.description ?? "",
      status: complaint.status ?? "OPEN",
      resolution: complaint.resolution ?? "",
    });
    setOpenInsertion(true);
  };

  const handlePageChange = (event, value) => {
    console.log('[BrowseComplaints] Page changed to:', value);
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
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
      <ListItem sx={{ backgroundColor: "#b71c1c", color: "#fff" }}>
        <Report sx={{ mr: 1 }} />
        <ListItemText primary="Browse Complaints" />
        <TextField
          placeholder='Search by student, category, description, or status'
          value={searchQuery}
          onChange={handleSearch}
          size='small'
          sx={{
            width: '250px',
            backgroundColor: '#333',
            borderRadius: '4px',
            marginRight: 2,
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
          Add Complaint
        </Button>
        <Button
          onClick={() => fetchComplaints(page)}
          variant="outlined"
          sx={{ color: "#00c853", borderColor: "#00c853" }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
      </ListItem>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, position: 'relative' }}>
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
            Student
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Category
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Status
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>

        <Box
          sx={{
            maxHeight: `calc(100vh - ${appBarHeight + 100}px)`,
            overflowY: "auto",
            bgcolor: "#121212",
            borderRadius: 1,
            pb: 8, // Padding to ensure content isn't hidden under pagination
          }}
        >
          <List>
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <ListItem
                  key={complaint.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1,
                    bgcolor: "#181818",
                    mb: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: '#222',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {[complaint.student?.firstName, complaint.student?.middleName, complaint.student?.lastName].filter(Boolean).join(" ") || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {complaint.category ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {complaint.status}
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleInsertionOpenModal(complaint)}
                    >
                      Edit
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No complaints found.
              </Typography>
            )}
          </List>
        </Box>

        {/* Floating Pagination */}
     <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: `calc(${drawerWidth}px + 50%)`,
            transform: 'translateX(-50%)',
            bgcolor: '#181818',
            borderRadius: 2,
            p: 1,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 1000,
          }}
        >
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

      <BrowseComplaintsDialog
        openInsertion={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchComplaints={fetchComplaints}
      />
    </Box>
  );
};

export default BrowseComplaints;
