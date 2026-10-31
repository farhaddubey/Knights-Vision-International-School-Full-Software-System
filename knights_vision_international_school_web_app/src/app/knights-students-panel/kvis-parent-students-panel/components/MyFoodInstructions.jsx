"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  TextField,
  CircularProgress,
  Pagination,
  PaginationItem,
  Avatar,
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight, Restaurant as RestaurantIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import ViewFoodInstructionDialog from "./dialogs/ViewFoodInstructionDialog";
import Cookies from "js-cookie";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 50;
const greenAccent = "#00c853";

const MyFoodInstructions = () => {
  const [className, setClassName] = useState("");
  const [allInstructions, setAllInstructions] = useState([]); // Store all fetched instructions
  const [filteredInstructions, setFilteredInstructions] = useState([]); // Store filtered instructions
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    setPage(currentPage);
    fetchInstructions();
  }, []);

  useEffect(() => {
    // Filter instructions locally when searchQuery changes
    const filtered = allInstructions.filter(
      (instruction) =>
        instruction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (instruction.description && instruction.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredInstructions(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setPage(1); // Reset to page 1 on search
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  }, [searchQuery, allInstructions]);

  const fetchInstructions = async () => {
    const token = Cookies.get("student_token");
    if (!token) {
      setError("User not authenticated. Please log in.");
      toast.error("User not authenticated. Please log in.");
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch all instructions without searchQuery
      const response = await axios.get("/api/a1-knights-students-panel/students/myfoodinstructions", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, pageSize }, // Fetch all (adjust pageSize as needed)
      });

      if (!response.data || !Array.isArray(response.data.instructions)) {
        throw new Error("Invalid response format");
      }

      setAllInstructions(response.data.instructions);
      setFilteredInstructions(response.data.instructions);
      setTotalPages(Math.ceil(response.data.instructions.length / pageSize));
      setClassName(response.data.className || "Unknown");
    } catch (err) {
      console.error("Fetch Instructions Error:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || "Failed to fetch food instructions.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleOpenViewDialog = (instruction) => {
    setSelectedInstruction(instruction);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedInstruction(null);
  };

  // Slice data for current page
  const paginatedInstructions = filteredInstructions.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#181818" }}>
        <CircularProgress size={120} sx={{ color: greenAccent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="#fff" sx={{ textAlign: "center", mt: 4, bgcolor: "#181818" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        backgroundColor: "#181818",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
        overflowY: "auto",
      }}
    >
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <ListItemButton
        sx={{
          backgroundColor: "#181818",
          color: "#fff",
          "&:hover": { backgroundColor: "#181818" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
          mb: 2,
        }}
      >
        <ListItemIcon sx={{ color: greenAccent }}>
          <RestaurantIcon />
        </ListItemIcon>
        <ListItemText primary={`My Food Instructions - ${className}`} />
        <TextField
          variant="outlined"
          placeholder="Search Instructions..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#fff", mr: 1 }} />,
            style: { color: "#fff", backgroundColor: "#333", borderRadius: 4 },
          }}
          sx={{
            width: "300px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#fff" },
              "&:hover fieldset": { borderColor: "#fff" },
              "&.Mui-focused fieldset": { borderColor: greenAccent },
            },
          }}
        />
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            Image
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Title
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Food Type
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Frequency
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {paginatedInstructions.length > 0 ? (
              paginatedInstructions.map((instruction) => (
                <ListItem
                  key={instruction.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1,
                    bgcolor: "#181818",
                    mb: 1,
                    borderRadius: 1,
                    borderBottom: "2px solid #333",
                    "&:hover": { bgcolor: "#222" },
                  }}
                >
                  <Box sx={{ flex: 0.5, display: "flex", alignItems: "center" }}>
                    {instruction.mediaUrl && /\.(png|jpg|jpeg)$/i.test(instruction.mediaUrl) ? (
                      <Avatar
                        src={instruction.mediaUrl}
                        alt={instruction.title}
                        variant="square"
                        sx={{ width: 100, height: 100, objectFit: "cover" }}
                      />
                    ) : (
                      <Avatar
                        variant="square"
                        sx={{ width: 100, height: 100, bgcolor: "#333", color: "#fff" }}
                      >
                        N/A
                      </Avatar>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ flex: 0.5, color: "#fff" }}>
                    {instruction.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {instruction.title}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {instruction.foodType}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: "#fff" }}>
                    {instruction.frequency}
                  </Typography>
                  <Box sx={{ flex: 0.8 }}>
                    <Button
                      variant="outlined"
                      sx={{ color: greenAccent, borderColor: greenAccent }}
                      onClick={() => handleOpenViewDialog(instruction)}
                    >
                      View
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No food instructions found for {className}.
              </Typography>
            )}
          </List>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 1,
            bgcolor: "#181818",
            borderRadius: 2,
            mt: 2,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#fff",
                "&:hover": { bgcolor: "#333" },
                "&.Mui-selected": {
                  bgcolor: greenAccent,
                  color: "#000",
                  "&:hover": { bgcolor: greenAccent },
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

      <ViewFoodInstructionDialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        instruction={selectedInstruction}
        className={className}
      />
    </Box>
  );
};

export default MyFoodInstructions;