import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  TextField,
  InputAdornment,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { Add, RotateRight, Search, ChevronLeft, ChevronRight } from "@mui/icons-material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import LegalProblemDialog from "./dialogs/BrowseLegalProblemsDialog";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 20;
const greenAccent = '#00c853';

const BrowseLegalProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Sync page state with URL
  useEffect(() => {
    console.log('[BrowseLegalProblemsPage] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchProblems = async (pageNum = 1) => {
    setApiLoading(true);
    try {
      const response = await axios.get("/api/legal-problems", {
        params: { page: pageNum, pageSize },
      });

      // Log response for debugging
      console.log('[fetchProblems] Response:', response.data);

      // Validate response structure
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format: data array missing');
      }

      setProblems(response.data.data);
      setFilteredProblems(response.data.data);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchProblems] totalPages set to:', response.data.totalPages || 1);
      toast.success("Problems fetched successfully!");
    } catch (error) {
      console.error("Error fetching legal problems:", error);
      toast.error("Failed to fetch legal problems.");
    } finally {
      setApiLoading(false);
    }
  };

  // Fetch problems when page changes
  useEffect(() => {
    console.log('[BrowseLegalProblemsPage] Fetching problems for page:', page);
    fetchProblems(page);
  }, [page]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = problems.filter((problem) =>
      [problem.title, problem.description, problem.category?.name, problem.department?.name, problem.keywords?.join(', ')].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
    setFilteredProblems(filtered);
  };

  const handleInsertionOpenModal = (problem = null) => {
    setEditFields(
      problem || {
        title: "",
        description: "",
        departmentId: "",
        categoryId: "",
        brandId: "",
        serviceId: "",
        iconUrl: "",
        keywords: [],
        translations: { en: "", hi: "" },
      }
    );
    setOpenInsertion(true);
  };

  const handleCloseModal = () => {
    setOpenInsertion(false);
    setEditFields(null);
  };

  const handleSaveAndCloseModal = () => {
    fetchProblems(page);
    handleCloseModal();
  };

  const handlePageChange = (event, value) => {
    console.log('[BrowseLegalProblemsPage] Page changed to:', value);
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        height: `calc(100% - ${appBarHeight}px)`,
        bgcolor: "#000",
        color: "#fff",
      }}
    >
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0, backgroundColor: "#1e1e1e" }} />}
      <ListItem sx={{ bgcolor: "#1a237e", color: "#fff" }}>
        <ListItemText primary="Browse Legal Problems" />
        <TextField
          placeholder='Search by Title, Description, Category, Department, or Keywords'
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
          sx={{ mr: 1, backgroundColor: "#555", "&:hover": { backgroundColor: "#777" } }}
          startIcon={<Add sx={{ color: "#fff" }} />}
        >
          Add Problem
        </Button>
        <Button
          onClick={() => fetchProblems(page)}
          variant="outlined"
          sx={{ color: "#fff", borderColor: "#555", "&:hover": { borderColor: "#777", backgroundColor: "#1e1e1e" } }}
          startIcon={<RotateRight sx={{ color: "#fff" }} />}
        >
          Refresh
        </Button>
      </ListItem>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, m: 1, position: 'relative' }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            color: "#fff",
            bgcolor: "#212121",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 0.6, fontWeight: "bold" }}>
            Img
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold" }}>
            Title
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold" }}>
            Category
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold" }}>
            Department
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold" }}>
            Keywords
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.3, fontWeight: "bold" }}>
            Actions
          </Typography>
        </Box>

        <Box
          sx={{
            maxHeight: `calc(100vh - ${appBarHeight + 100}px)`,
            overflowY: "auto",
            bgcolor: "#000",
            color: "#fff",
            borderRadius: 1,
            pb: 8, // Padding to ensure content isn't hidden under pagination
          }}
        >
          <List>
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem) => (
                <ListItem
                  key={problem.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                    bgcolor: "#000",
                    color: "#fff",
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ flex: 0.6 }}>
                    <Image width={60} height={60} src={problem?.iconUrl} alt="Icon" />
                  </Box>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {problem.title}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {problem.category?.name ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {problem.department?.name ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {Array.isArray(problem.keywords) && problem.keywords.length ? problem.keywords.join(", ") : "None"}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#555", "&:hover": { backgroundColor: "#777" }, flex: 0.3 }}
                    onClick={() => handleInsertionOpenModal(problem)}
                  >
                    Edit
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No problems found.
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

      <LegalProblemDialog
        open={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchProblems={fetchProblems}
      />
    </Box>
  );
};

export default BrowseLegalProblemsPage;