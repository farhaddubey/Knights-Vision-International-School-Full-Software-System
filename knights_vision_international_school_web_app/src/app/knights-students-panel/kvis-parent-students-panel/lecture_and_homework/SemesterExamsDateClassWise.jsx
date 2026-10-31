"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Search, ChevronLeft, ChevronRight, PictureAsPdf, RotateRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 30;
const greenAccent = "#00c853";

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
  backgroundColor: "#333",
  borderRadius: "4px",
};

const SemesterExamScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState("SEMESTER_I");
  const [schoolName, setSchoolName] = useState("");
  const [className, setClassName] = useState("");
  const [classId, setClassId] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  // Fetch classId and className from class-subjects endpoint
  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        const studentToken = Cookies.get("student_token");
        if (!studentToken) {
          throw new Error("No student token found. Please log in.");
        }

        const response = await axios.get("/api/a1-knights-students-panel/class-subjects", {
          params: { page: 1, pageSize: 1 },
          headers: { Authorization: `Bearer ${studentToken}` },
        });

        if (!response.data || !Array.isArray(response.data.classSubjects) || response.data.classSubjects.length === 0) {
          throw new Error("Invalid response format or no class subjects found.");
        }

        const classSubject = response.data.classSubjects[0];
        const classId = classSubject.classId;
        const className = classSubject.className;

        if (!classId || !className) {
          throw new Error("Class information not found in response.");
        }

        setClassId(classId);
        setClassName(className);
      } catch (err) {
        console.error("Error fetching class info:", err.message);
        setError("Failed to fetch class information: " + (err.response?.data?.error || err.message));
        toast.error("Failed to fetch class information.");
        setLoading(false);
      }
    };

    fetchClassInfo();
  }, []);

  // Fetch schedules based on classId
  const fetchSchedules = async (pageNum = 1) => {
    if (!classId) {
      setError("No class ID available.");
      setLoading(false);
      toast.error("No class ID available.");
      return;
    }

    console.log("DEBUG: Fetching schedules for classId:", classId, "page:", pageNum);
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/a1-knights-students-panel/semester-exam-schedules", {
        params: { page: pageNum, pageSize },
        headers: { Authorization: `Bearer ${Cookies.get("student_token")}` },
      });

      console.log("DEBUG: API response:", response.data);

      if (!response.data || !Array.isArray(response.data.schedules)) {
        throw new Error("Invalid response format: schedules array missing");
      }

      setSchedules(response.data.schedules);
      const filtered = response.data.schedules.filter(
        (schedule) => schedule.semester === selectedSemester
      );
      setFilteredSchedules(filtered);
      setTotalPages(Math.ceil(filtered.length / pageSize));
      setSchoolName(response.data.schoolName || "Sure Success Point School");
    } catch (err) {
      console.error("DEBUG: Error fetching schedules:", err);
      setError(err.response?.data?.error || "Failed to fetch schedules.");
      toast.error("Failed to fetch schedules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchSchedules(page);
    }
  }, [page, classId]);

  useEffect(() => {
    const filtered = schedules.filter((schedule) => schedule.semester === selectedSemester);
    setFilteredSchedules(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setPage(1);
  }, [selectedSemester, schedules]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    console.log("DEBUG: Search query:", query);
    const filtered = schedules
      .filter((schedule) => schedule.semester === selectedSemester)
      .filter(
        (schedule) =>
          schedule.subjectName?.toLowerCase().includes(query) ||
          schedule.semester?.toLowerCase().includes(query)
      );
    setFilteredSchedules(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    console.log("DEBUG: Filtered schedules:", filtered);
  };

  const handlePageChange = (event, value) => {
    console.log("DEBUG: Changing page to:", value);
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  const generatePDF = () => {
    console.log("DEBUG: Generating PDF for semester:", selectedSemester);
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgSize = 28;
      const imgY = 28;
      const margin = 10;

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
      pdf.text("SEMESTER EXAM SCHEDULE", pageWidth / 2, 44, { align: "center" });

      // === Class, Semester, Month ===
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(
        `Class: ${className} | Semester: ${selectedSemester.replace("_", " ")} | Month: ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`,
        pageWidth / 2,
        52,
        { align: "center" }
      );

      // 📄 Prepare table data
      const tableData = filteredSchedules.map((schedule) => [
        schedule.subjectName || "N/A",
        new Date(schedule.examDate).toLocaleString(),
        schedule.durationMinutes ? `${schedule.durationMinutes} min` : "N/A",
        schedule.examHall || "N/A",
      ]);

      // 📊 Create autoTable with red accent
      pdf.autoTable({
        head: [["Subject", "Exam Date & Time", "Duration", "Exam Hall"]],
        body: tableData,
        startY: 58,
        margin: { left: 10, right: 10 },
        styles: {
          font: "helvetica",
          fontSize: 10,
          textColor: [0, 0, 0],
          lineColor: [180, 0, 0], // Red border
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [220, 38, 38], // 🔴 Red
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [255, 228, 225], // Light red-pinkish alt rows
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 50 },
        },
      });

      // 💾 Save PDF
      pdf.save(`Exam_Schedule_Class_${className}_${selectedSemester}.pdf`);
      console.log("DEBUG: PDF generated and downloaded");
      toast.success("PDF generated successfully!");
    } catch (err) {
      console.error("Error generating PDF:", err.message);
      toast.error("Failed to generate PDF: " + err.message);
    }
  };


  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4 }}>
        {error}
      </Typography>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={120} sx={{ color: greenAccent }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: "#212121",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
      }}
    >
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
        }}
      >
        <ListItemIcon sx={{ fontSize: 30, color: "orange", fontWeight: "bold" }}>
          📅
        </ListItemIcon>
        <ListItemText primary={`Semester Exam Schedule Management - Class ${className}`} />
        <FormControl size="small" sx={{ ...textFieldStyles, width: "200px" }}>
          <InputLabel sx={{ color: "#aaa" }}>Select Semester</InputLabel>
          <Select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            sx={{ color: "#fff", "& .MuiSvgIcon-root": { color: "#fff" } }}
          >
            <MenuItem value="SEMESTER_I">Semester I</MenuItem>
            <MenuItem value="SEMESTER_II">Semester II</MenuItem>
            <MenuItem value="SEMESTER_III">Semester III</MenuItem>
          </Select>
        </FormControl>
        <TextField
          placeholder="Search by Subject"
          value={searchQuery}
          onChange={handleSearch}
          size="small"
          sx={{
            width: "250px",
            backgroundColor: "#333",
            borderRadius: "4px",
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
          }}
          InputProps={{
            startAdornment: <Search sx={{ color: "#fff", mr: 1 }} />,
          }}
        />
        <Button
          onClick={() => fetchSchedules(page)}
          variant="outlined"
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={generatePDF}
          disabled={filteredSchedules.length === 0}
          startIcon={<PictureAsPdf />}
        >
          Download PDF
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, overflow: "hidden", height: "80vh" }}>
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
            ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Subject
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Semester
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Exam Date
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Duration
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Exam Hall
          </Typography>
        </Box>

        <Box
          sx={{
            maxHeight: `calc(100vh - ${appBarHeight + 150}px)`,
            overflowY: "auto",
            bgcolor: "#121212",
            borderRadius: 1,
            paddingBottom: 10,
          }}
        >
          <List>
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule) => (
                <ListItem
                  key={schedule.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1,
                    bgcolor: "#181818",
                    mb: 1,
                    borderRadius: 1,
                    borderBottom: "2px solid #333",
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 0.5, color: "#fff" }}>
                    {schedule.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {schedule.subjectName ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {schedule.semester?.replace("_", " ") ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {new Date(schedule.examDate).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {schedule.durationMinutes} min
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {schedule.examHall ?? "N/A"}
                  </Typography>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No exam schedules found for Class {className} - {selectedSemester.replace("_", " ")}.
              </Typography>
            )}
          </List>
        </Box>

        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: `calc(${drawerWidth}px + 50%)`,
            transform: "translateX(-50%)",
            bgcolor: "#181818",
            borderRadius: 2,
            p: 1,
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            zIndex: 1000,
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
    </Box>
  );
};

export default SemesterExamScheduleManagement;
