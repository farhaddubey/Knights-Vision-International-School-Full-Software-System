"use client";

// Shared calendar for administration, faculty, and student panels.

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import { Download, Close } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer, Bounce } from "react-toastify";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: greenAccent },
  },
};

const calendarStyles = `
  .custom-calendar {
    width: 100%;
    height: 60vh;
    background-color: #181818;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 16px;
  }
  .custom-calendar .react-calendar__tile {
    color: #fff;
    position: relative;
    height: 60px;
  }
  .custom-calendar .react-calendar__tile:hover {
    background-color: #333;
  }
  .custom-calendar .react-calendar__month-view__days__day--weekend {
    color: #f44336;
  }
  .custom-calendar .react-calendar__navigation button {
    color: #fff;
    background-color: #333;
    border-radius: 4px;
  }
  .custom-calendar .react-calendar__navigation button:hover {
    background-color: #555;
  }
  .custom-calendar .react-calendar__tile--active {
    background-color: ${greenAccent};
    color: #000;
  }
`;

const StudentHolidayCalendar = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      const token = Cookies.get("student_token");
        if (!token) {
        token = Cookies.get("token");
        }
      if (!token) {       
        toast.error("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get("/api/holidays", {
          headers: { Authorization: `Bearer ${token}` },
          params: { month },
        });
        setHolidays(response.data.holidays);
      } catch (error) {
        console.error("Fetch Holidays Error:", error.response?.data || error.message);
        toast.error(error.response?.data?.error || "Failed to fetch holidays.");
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [month]);

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const getTileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().slice(0, 10);
    const holiday = holidays.find((h) => h.date.slice(0, 10) === dateStr);
    const isSunday = date.getDay() === 0;

    if (isSunday) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mt: 1,
          }}
          title="Weekly Holiday (Sunday)"
        >
          <Box
            sx={{
              backgroundColor: "#ffeb3b",
              color: "#000",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            W
          </Box>
          <Typography
            sx={{
              fontSize: "10px",
              color: "#fff",
              textAlign: "center",
              mt: 0.5,
              maxWidth: "80%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Sunday
          </Typography>
        </Box>
      );
    }

    if (holiday) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mt: 1,
          }}
          title={holiday.title}
        >
          <Box
            sx={{
              backgroundColor: "#9c27b0",
              color: "#fff",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            H
          </Box>
          <Typography
            sx={{
              fontSize: "10px",
              color: "#fff",
              textAlign: "center",
              mt: 0.5,
              maxWidth: "80%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {holiday.title}
          </Typography>
        </Box>
      );
    }

    return null;
  };

  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const imgSize = 28;
      const imgY = 28;
      const numColumns = 3; // ID, Date, Title
      const tableWidth = pageWidth - 2 * margin;
      const columnWidth = tableWidth / numColumns; // Dynamic width

      // === School Logo (Left) ===
      try {
        pdf.addImage("/knights.png", "PNG", 10, imgY, imgSize, imgSize);
      } catch (imgError) {
        console.warn("DEBUG: Logo image loading failed:", imgError.message);
        toast.warn("Failed to load logo image");
      }

      // === Right Logo ===
      try {
        pdf.addImage("/knights.png", "PNG", pageWidth - imgSize - margin, imgY, imgSize, imgSize);
      } catch (imgError) {
        console.warn("DEBUG: Right logo image loading failed:", imgError.message);
        toast.warn("Failed to load right logo image");
      }

      // === School Name ===
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(40);
      pdf.setTextColor("#003087");
      pdf.text("Sure Success Point School", pageWidth / 2, 19, { align: "center" });

      // === School Motto ===
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor("#333");
      pdf.setFontSize(12);
      pdf.text(
        "Institution of Humanism, Hardwork, Discipline, Technology & Excellence",
        pageWidth / 2,
        28,
        { align: "center" }
      );
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `www.sspointschool.in | Powered by Knights (KiREAD) Group`,
        pageWidth / 2,
        36,
        { align: "center" }
      );

      // === Report Title ===
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor("#000");
      pdf.text("HOLIDAY CALENDAR", pageWidth / 2, 44, { align: "center" });

      // === Month ===
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(
        `Month: ${new Date(month + "-01").toLocaleString("default", { month: "long", year: "numeric" })}`,
        pageWidth / 2,
        52,
        { align: "center" }
      );

      // 📄 Prepare table data
      const tableData = holidays.map((holiday) => [
        holiday.id.toString(),
        new Date(holiday.date).toLocaleDateString(),
        holiday.title,
      ]);

      // 📊 Create autoTable with dynamic column widths
      pdf.autoTable({
        head: [["ID", "Date", "Title"]],
        body: tableData,
        startY: 58,
        margin: { left: margin, right: margin },
        styles: {
          font: "helvetica",
          fontSize: 10,
          textColor: [0, 0, 0],
          lineColor: [123, 31, 162], // Purple border
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [106, 27, 154], // Deep purple
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [237, 231, 246], // Light purple-blue
        },
        columnStyles: {
          0: { cellWidth: columnWidth },
          1: { cellWidth: columnWidth },
          2: { cellWidth: columnWidth },
        },
      });

      // 💾 Save PDF
      pdf.save(`Holiday_Calendar_${month}.pdf`);
      toast.success("PDF generated successfully!");
    } catch (err) {
      console.error("Error generating PDF:", err.message);
      toast.error("Failed to generate PDF: " + err.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#000",
        color: "#fff",
        p: 3,
      }}
    >
      <style>{calendarStyles}</style>
      <Typography variant="h5" sx={{ color: greenAccent, mb: 2 }}>
        Student Holiday Calendar
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="body2">Legend:</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: "#9c27b0", borderRadius: "50%" }} />
            <Typography variant="body2">Holiday</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: "#ffeb3b", borderRadius: "50%" }} />
            <Typography variant="body2">Weekly Holiday (Sunday)</Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleOpenDialog}
            sx={{ backgroundColor: "#00c757", color: "#000" }}
          >
            View Holidays List
          </Button>
        </Box>
        <FormControl sx={{ minWidth: 200, ...textFieldStyles }}>
          <InputLabel sx={{ color: "#aaa" }}>Select Month</InputLabel>
          <Select value={month} onChange={handleMonthChange}>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const monthStr = date.toISOString().slice(0, 7);
              return (
                <MenuItem key={monthStr} value={monthStr}>
                  {date.toLocaleString("default", { month: "long", year: "numeric" })}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ flexGrow: 1, my: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress sx={{ color: greenAccent }} />
          </Box>
        ) : (
          <Calendar
            value={new Date(month + "-01")}
            tileContent={getTileContent}
            className="custom-calendar"
          />
        )}
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "#181818",
            color: "#fff",
            minWidth: "600px",
            maxHeight: "80vh",
          },
        }}
      >
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ color: "#fff" }}>
              Holiday List for {new Date(month + "-01").toLocaleString("default", { month: "long", year: "numeric" })}
            </Typography>
            <Box>
              <IconButton onClick={handleDownloadPDF} sx={{ color: "#00c757" }}>
                <Download />
              </IconButton>
              <IconButton onClick={handleCloseDialog} sx={{ color: "#f44336" }}>
                <Close />
              </IconButton>
            </Box>
          </Box>
          <List>
            <ListItem sx={{ bgcolor: "#333", borderRadius: 1, mb: 1 }}>
              <Box sx={{ display: "flex", width: "100%", color: "#fff", fontWeight: "bold" }}>
                <Box sx={{ flex: 1 }}>ID</Box>
                <Box sx={{ flex: 2 }}>Date</Box>
                <Box sx={{ flex: 3 }}>Title</Box>
              </Box>
            </ListItem>
            {holidays.length > 0 ? (
              holidays.map((holiday) => (
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
                    <Box sx={{ flex: 3 }}>{holiday.title}</Box>
                  </Box>
                </ListItem>
              ))
            ) : (
              <ListItem sx={{ color: "#fff", justifyContent: "center" }}>
                No holidays found for this year.
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#181818" }}>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </Box>
  );
};

export default StudentHolidayCalendar;
