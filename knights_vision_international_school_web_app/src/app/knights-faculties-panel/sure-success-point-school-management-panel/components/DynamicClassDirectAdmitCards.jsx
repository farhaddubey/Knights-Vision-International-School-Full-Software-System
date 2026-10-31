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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight, EmojiPeople } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;

const extractClassLabel = (className) => {
  return `Class: ${className.replace("Class_", "")}`;
};

const getSemester = () => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 1 && month <= 4) return "SEMESTER_I";
  if (month >= 5 && month <= 8) return "SEMESTER_II";
  return "SEMESTER_III";
};

const formatExamTime = (examDate, durationMinutes) => {
  if (!examDate || !durationMinutes) return "N/A";
  const start = new Date(examDate);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  return `${formatTime(start)} - ${formatTime(end)}`;
};

const DynamicClassDirectAdmitCards = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(getSemester());
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Validate className against ClassName enum
  const validClassNames = [
    "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII",
    "IX", "X", "XS", "XI", "XII", "XIIS", "XIII", "XIIIJ"
  ];
  const isValidClass = validClassNames.includes(className.toUpperCase());
  const classInfo = { name: isValidClass ? `Class ${className}` : "Invalid Class" };
  const displayClassName = className.startsWith("Class_") ? className.replace("Class_", "") : className;

  useEffect(() => {
    if (!isValidClass) {
      setError("Invalid class name provided.");
      setLoading(false);
      return;
    }
    setPage(currentPage);
    fetchStudents(currentPage, searchQuery);
    fetchSchedules();
  }, [currentPage, className]);

  const fetchStudents = async (pageNum = 1, search = "") => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      toast.error("User not authenticated.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api-schools-panel/MonthlyAdmitCards/${className.toLowerCase()}/admit-cards`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { className, page: pageNum, pageSize, searchQuery: search },
      });

      if (!response.data || !Array.isArray(response.data.students)) {
        throw new Error("Invalid response format");
      }

      setStudents(response.data.students);
      setFilteredStudents(response.data.students);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students.");
      toast.error("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      toast.error("User not authenticated.");
      return;
    }
    try {
      const response = await axios.get(`/api-schools-panel/semester-exam-schedules/${className.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, pageSize: 100 }, // Fetch all schedules
      });

      if (!response.data || !Array.isArray(response.data.schedules)) {
        throw new Error("Invalid response format from schedules API");
      }

      // Sort schedules by examDate and filter by selected semester
      const sortedSchedules = response.data.schedules
        .filter((schedule) => schedule.semester === selectedSemester)
        .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
      setSchedules(sortedSchedules);

      if (sortedSchedules.length === 0) {
        toast.warn(`No schedules found for ${selectedSemester.replace("_", " ")}.`);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError("Failed to fetch exam schedules.");
      toast.error("Failed to fetch exam schedules.");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedSemester]);

  const handleSemesterChange = (event, newSemester) => {
    if (newSemester) {
      setSelectedSemester(newSemester);
    }
  };

  async function loadImageFromURL(imageURL, token = null) {
    const response = await fetch(imageURL, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Image request failed (${response.status}).`);
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) throw new Error("Image response was not an image.");

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); // base64 string
      reader.onerror = () => reject(new Error("Unable to read image data."));
      reader.readAsDataURL(blob);
    });
  }

  const handleGeneratePdf = async (studentId) => {
    setPdfLoading(true);
    try {
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("User not authenticated.");
      toast.info("Checking Info");
      const response = await axios.get(`/api-schools-panel/MonthlyAdmitCards/${className.toLowerCase()}/admit-cards/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { studentData } = response.data;

      if (!studentData || !studentData.basicInfo) {
        throw new Error("Invalid student data received from API");
      }
      toast.info("Checking Passed");

      const currentYear = new Date().getFullYear();
      const doc = new jsPDF({ format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const schoolLogoX = 11;
      const schoolLogoY = 32;
      const schoolLogoSize = 16;
      // 4:5 passport photo: it fits beside the registration details and ends
      // immediately above the admit-card heading.
      const photoW = 16;
      const photoH = 20;
      const photoX = pageWidth - photoW - 12;
      const photoY = 29;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(49);
      doc.setTextColor("#4CAF50");
      doc.setFont("times", "bold");
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.2);
      doc.text("Sure Success Point School", pageWidth / 2, 20, { align: "center", renderingMode: "stroke" });
      doc.setDrawColor("#d50000");
      doc.setLineWidth(1);
      doc.text("Sure Success Point School", pageWidth / 2, 20, { align: "center", renderingMode: "stroke" });
      doc.setTextColor("#4CAF50");
      doc.text("Sure Success Point School", pageWidth / 2, 20, { align: "center", renderingMode: "fill" });

      doc.setFont("helvetica", "bold");
      doc.setTextColor("#00bfa5");
      doc.setFontSize(12.8);
      doc.text("Institution of Humanism, Hardwork, Discipline, Technology & Excellence", 18, 28);
      doc.setFontSize(12);
      doc.setTextColor("#333");
      doc.setFont("helvetica", "normal");
      doc.setDrawColor(0);       // Black border color
      doc.setLineWidth(0.2);     // Thin border stroke
      doc.rect(11, 32, 16, 16);  // x, y, width, height — passport-style
      const studentPhoto = studentData.basicInfo?.profileImageUrl || null;

      try {
        const base64Image = await loadImageFromURL("/knights.png");
        doc.addImage(base64Image, undefined, schoolLogoX, schoolLogoY, schoolLogoSize, schoolLogoSize);
      } catch (error) {
        console.warn("Failed to load school logo:", error.message);
      }

      // Student photos are private. The detail API provides the controlled
      // same-origin route and the active faculty token authorizes this read.
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(photoX - 0.5, photoY - 0.5, photoW + 1, photoH + 1);
      let photoRendered = false;
      if (studentPhoto) {
        try {
          const photoData = await loadImageFromURL(studentPhoto, token);
          doc.addImage(photoData, undefined, photoX, photoY, photoW, photoH);
          photoRendered = true;
        } catch (photoError) {
          console.warn("Failed to load student photo for admit card:", photoError.message);
        }
      }
      if (!photoRendered) {
        doc.setFontSize(8);
        doc.setTextColor("#666");
        doc.text("STUDENT PHOTO", photoX + photoW / 2, photoY + photoH / 2, { align: "center" });
        doc.setTextColor("#333");
      }
      doc.setFontSize(12);

      doc.text("Regd No.: S/1L 60976", 29, 35);
      doc.text("Institution ID.: KNIGHTS0000001", 29, 41);
      doc.text("Najirpur, Alinagar, Kaliachak, Malda -India", 29, 47);
      doc.text("UDISE: 19060419693", 128, 35);
      doc.text("Branch.: Najirpur", 128, 41);
      doc.text("www.sspointschool.in", 128, 47);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.autoTable({
        head: [[`${selectedSemester.replace("_", " ")} - ADMIT CARD - ${currentYear}`]],
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 1, halign: "center" },
        startY: 49,
        margin: { left: 10, right: 10 },
        tableWidth: 190,
        showHead: "everyPage",
      });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Student Name: ${studentData.basicInfo?.fullName || "N/A"}`, 10, 59);
      doc.text(extractClassLabel(studentData.classInfo?.collectionName || displayClassName), 80, 59);
      doc.text(`Roll No.: ${studentData.basicInfo?.rollNo || "N/A"}`, 110, 59);
      doc.text(`C/O.: ${studentData.contactInfo?.guardianName || "N/A"}`, 140, 59);
      doc.text(`UID.: ${studentData.basicInfo?.uidNo || "N/A"}`, 10, 64);
      doc.text(`Reg No.: ${studentData.basicInfo?.uidNo || "N/A"}`, 80, 64);
      doc.text(`Student Code.: ${studentData.basicInfo?.uidNo || "N/A"}`, 140, 64);
      doc.setTextColor("#000");

      const tableData = schedules.map((schedule) => [
        schedule.subjectName || "N/A",
        new Date(schedule.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        formatExamTime(schedule.examDate, schedule.durationMinutes),
        "",
        "",
      ]);

      doc.autoTable({
        head: [["Subject", "Exam Date", "Exam Time", "Student's Sign", "Invigilator Signature"]],
        body: tableData,
        startY: 66,
        theme: "grid",
        styles: { fontSize: 11, cellPadding: 2.4, halign: "left" },
        headStyles: { fillColor: "#4CAF50" },
        margin: { left: 10, right: 10 },
      });

      doc.autoTable({
        head: [["Important Instructions:"]],
        body: [
          ["CARRY ADMIT CARD & UID. NO ELECTRONIC DEVICES (PHONES, SMARTWATCHES, ETC.) ALLOWED."],
          ["REPORT 30 MINS EARLY. WRITE NAME & FORM NO TO AVOID DISQUALIFICATION."],
        ],
        theme: "grid",
        styles: {
          fillColor: "#eceff1",
          fontSize: 10,
          cellPadding: 2,
          textColor: "#4caf50",
          lineColor: ["#4a148c"],
          lineWidth: 0.3,
          fontStyle: "normal",
        },
        headStyles: {
          fillColor: "#cfd8dc",
          lineColor: ["#c51162"],
          lineWidth: 0.5,
          textColor: 0,
        },
        startY: doc.lastAutoTable.finalY + 10,
        margin: { left: 10, right: 10 },
        tableWidth: 190,
      });

      doc.autoTable({
        head: [["Signed with Date", "Signature of the FMO", "Seal & Signature of the HOD"]],
        body: [["Admit Card Authenticity", "", ""], ["Date", "", ""]],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2, fontStyle: "bold" },
        startY: doc.lastAutoTable.finalY + 10,
        margin: { left: 10 },
        tableWidth: 190,
      });

      doc.autoTable({
        head: [["Check result online using our official site- www.sspointschool.in"]],
        theme: "grid",
        styles: { fontSize: 12, cellPadding: 2, halign: "center" },
        startY: doc.lastAutoTable.finalY + 10,
        margin: { left: 10, right: 10 },
        tableWidth: 190,
        showHead: "everyPage",
      });

      doc.autoTable({
        head: [["N.B: Student Must Reach the Examination Venue prior to 1 Hour."]],
        body: [["No student will be permitted to sit for exam without Authentic (Properly Sealed & Signed) Admit Card."]],
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: "#d50000",
          lineColor: [255, 0, 0],
          lineWidth: 0.3,
          fontStyle: "bold",
        },
        headStyles: {
          fillColor: "#cfd8dc",
          lineColor: [255, 0, 0],
          lineWidth: 0.3,
          textColor: 0,
        },
        startY: doc.lastAutoTable.finalY + 10,
        margin: { left: 10, right: 10 },
        tableWidth: 190,
      });

      doc.autoTable({
        head: [["N.B: Academic Excellence Award is granted to Knights students securing AA Grade in current Academic Year."]],
        body: [["It's recognized under the Knights Career Development Program of Sure Success Point School – an advanced, software-integrated, joint-orient, career-centric education system, aimed at ensuring holistic development and assured career success. All Systems powered by Knights Group's Researched Strong Education System."]],
        theme: "grid",
        styles: {
          fillColor: "#cfd8dc",
          fontSize: 10,
          cellPadding: 2,
          textColor: 0,
          lineColor: [255, 0, 0],
          lineWidth: 0.7,
          fontStyle: "bold",
        },
        headStyles: {
          fillColor: "#757575",
          fontStyle: "bold",
          lineColor: [255, 0, 0],
          lineWidth: 0.7,
          textColor: "#ffc107",
        },
        startY: doc.lastAutoTable.finalY + 10,
        margin: { left: 10, right: 10 },
        tableWidth: 190,
      });

      const safeFileName = (studentData.basicInfo?.fullName || studentId).replace(/[^a-zA-Z0-9-_]/g, "_");
      doc.save(`Admit_${safeFileName}_${selectedSemester}.pdf`);
      toast.success("Admit card generated successfully.");
    } catch (err) {
      console.error("Generate PDF Error:", err.message, err.stack);
      toast.error(`Failed to generate admit card: ${err.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    fetchStudents(1, query);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchStudents(value, searchQuery);
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
          backgroundColor: "#b71c1c",
          color: "#fff",
          "&:hover": { backgroundColor: "#b71c1c" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ color: "#fff" }}>
          <EmojiPeople />
        </ListItemIcon>
        <ListItemText primary={`${displayClassName} Direct Admission Admit Cards`} />
        <ToggleButtonGroup
          value={selectedSemester}
          exclusive
          onChange={handleSemesterChange}
          sx={{
            "& .MuiToggleButton-root": {
              color: "#fff",
              borderColor: "#fff",
              "&.Mui-selected": {
                backgroundColor: "#00c853",
                color: "#000",
                "&:hover": { backgroundColor: "#00c853" },
              },
            },
          }}
        >
          <ToggleButton value="SEMESTER_I">SEM I</ToggleButton>
          <ToggleButton value="SEMESTER_II">SEM II</ToggleButton>
          <ToggleButton value="SEMESTER_III">SEM III</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          variant="outlined"
          placeholder="Search Students..."
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
              "&.Mui-focused fieldset": { borderColor: "#00c853" },
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
            ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Admission No.
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Roll No.
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Category
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <ListItem
                  key={student.id}
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
                    {student.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {`${student.firstName} ${student.lastName}`}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: "#fff" }}>
                    {student.admissionNumber || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: "#fff" }}>
                    {student.rollNumber || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: "#fff" }}>
                    {student.studentCategory || "N/A"}
                  </Typography>
                  <Box sx={{ flex: 0.8, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleGeneratePdf(student.id)}
                      disabled={pdfLoading || schedules.length === 0}
                      sx={{ color: "#00c853", borderColor: "#00c853" }}
                    >
                      {pdfLoading ? "Generating..." : "Admit Card"}
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No students found for {displayClassName} (Direct Admission).
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
    </Box>
  );
};

export default DynamicClassDirectAdmitCards;
