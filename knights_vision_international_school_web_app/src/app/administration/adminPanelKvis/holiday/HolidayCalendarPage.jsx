"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Pagination,
  PaginationItem,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight, Add } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import HolidayDialog from "./HolidayDialog";
import jsPDF from "jspdf";
import "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;

const HolidayCalendarPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [filteredHolidays, setFilteredHolidays] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setPage(currentPage);
    fetchHolidays(currentPage);
  }, [currentPage]);

  const fetchHolidays = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/holidays`, {
        params: { page: pageNum, pageSize },
      });

      if (!response.data || !Array.isArray(response.data.holidays)) {
        throw new Error("Invalid response format");
      }

      setHolidays(response.data.holidays);
      setFilteredHolidays(response.data.holidays);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching holidays:", err.message);
      setError("Failed to fetch holidays.");
      toast.error("Failed to fetch holidays.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredHolidays(
      holidays.filter((holiday) => holiday.title.toLowerCase().includes(query))
    );
    setPage(1);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchHolidays(value);
  };

  const handleOpenDialog = (holiday = null) => {
    setSelectedHoliday(holiday);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedHoliday(null);
    fetchHolidays(page);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor("#000");
      doc.text("Holiday Calendar", pageWidth / 2, 20, { align: "center" });

      // Table
      const tableData = holidays.map((holiday) => [
        holiday.id.toString(),
        new Date(holiday.date).toLocaleDateString(),
        holiday.title,
        new Date(holiday.createdAt).toLocaleDateString(),
      ]);

      doc.autoTable({
        head: [["ID", "Date", "Title", "Created At"]],
        body: tableData,
        startY: 30,
        margin: { left: margin, right: margin },
        styles: {
          font: "helvetica",
          fontSize: 10,
          textColor: [0, 0, 0],
          lineColor: [123, 31, 162],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [106, 27, 154],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [243, 229, 245],
        },
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor("#000");
      doc.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        margin,
        doc.internal.pageSize.getHeight() - 10
      );

      doc.save("Holiday_Calendar.pdf");
      toast.success("📄 PDF downloaded successfully.");
    } catch (err) {
      console.error("Error generating PDF:", err.message);
      toast.error("Failed to generate PDF.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#181818" }}>
        <CircularProgress size={120} sx={{ color: "#00c757" }} />
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
        backgroundColor: "#181818",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
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
      <Box
        sx={{
          backgroundColor: "#333",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
        }}
      >
        <SearchIcon sx={{ color: "#fff" }} />
        <Typography variant="h6" sx={{ color: "#fff" }}>Holiday Calendar</Typography>
        <TextField
          variant="outlined"
          placeholder="Search Holidays..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#fff", mr: 1 }} />,
            style: { color: "#fff", backgroundColor: "#222", borderRadius: 4 },
          }}
          sx={{
            width: "300px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#555" },
              "&:hover fieldset": { borderColor: "#777" },
              "&.Mui-focused fieldset": { borderColor: "#00c757" },
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: "#00c757", color: "#000" }}
        >
          Add Holiday
        </Button>
        <Button
          variant="contained"
          onClick={handleDownloadPDF}
          sx={{ backgroundColor: "#00c757", color: "#000" }}
        >
          Download PDF
        </Button>
      </Box>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, p: 1, maxHeight: "83vh", overflowY: "auto" }}>
        <List>
          <ListItem sx={{ bgcolor: "#333", borderRadius: 1, mb: 1 }}>
            <Box sx={{ display: "flex", width: "100%", color: "#fff", fontWeight: "bold" }}>
              <Box sx={{ flex: 1 }}>ID</Box>
              <Box sx={{ flex: 2 }}>Date</Box>
              <Box sx={{ flex: 2 }}>Title</Box>
              <Box sx={{ flex: 2 }}>Created At</Box>
              <Box sx={{ flex: 2 }}>Actions</Box>
            </Box>
          </ListItem>

          {filteredHolidays.length > 0 ? (
            filteredHolidays.map((holiday) => (
              <ListItem
                key={holiday.id}
                sx={{
                  bgcolor: "#1e1e1e",
                  mb: 1,
                  borderRadius: 1,
                  "&:hover": { bgcolor: "#222" },
                }}
              >
                <Box sx={{ display: "flex", width: "100%", alignItems: "center", color: "#fff" }}>
                  <Box sx={{ flex: 1 }}>{holiday.id}</Box>
                  <Box sx={{ flex: 2 }}>{new Date(holiday.date).toLocaleDateString()}</Box>
                  <Box sx={{ flex: 2 }}>{holiday.title}</Box>
                  <Box sx={{ flex: 2 }}>{new Date(holiday.createdAt).toLocaleDateString()}</Box>
                  <Box sx={{ flex: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenDialog(holiday)}
                      sx={{
                        color: "#00c757",
                        borderColor: "#00c757",
                        textTransform: "none",
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                </Box>
              </ListItem>
            ))
          ) : (
            <ListItem sx={{ color: "#fff", justifyContent: "center" }}>
              No holidays found.
            </ListItem>
          )}
        </List>

        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1300,
            display: "flex",
            justifyContent: "center",
            p: 1,
            bgcolor: "#181818",
            borderRadius: 2,
            boxShadow: 4,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#fff",
                "&:hover": { bgcolor: "#333" },
                "&.Mui-selected": {
                  bgcolor: "#00c853",
                  color: "#000",
                  "&:hover": { bgcolor: "#00c853" },
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

      <HolidayDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        holiday={selectedHoliday}
      />
    </Box>
  );
};

export default HolidayCalendarPage;