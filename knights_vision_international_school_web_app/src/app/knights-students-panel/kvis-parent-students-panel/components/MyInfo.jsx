"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const MyInfo = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      const token = Cookies.get("student_token");
      if (!token) {
        toast.error("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("/api/a1-knights-students-panel/students/myinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudentData(response.data.student);
      } catch (error) {
        console.error("Fetch Error:", error.response?.data || error.message);
        toast.error(error.response?.data?.error || "Failed to fetch student information.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || "";
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#000" }}>
        <CircularProgress size={120} sx={{ color: greenAccent }} />
      </Box>
    );
  }

  if (!studentData) {
    return (
      <Box sx={{ p: 3, bgcolor: "#000", color: "#fff", height: "100vh" }}>
        <Typography variant="h6">No student data available.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        bgcolor: "#000",
        color: "#fff",
        p: 3,
      }}
    >
      {/* Left Column: Avatar */}
      <Box sx={{ width: "25%", pr: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Avatar
          src={studentData.profileImageUrl || ""}
          alt={`${studentData.firstName} ${studentData.lastName}`}
          sx={{
            width: 150,
            height: 150,
            bgcolor: studentData.profileImageUrl ? "transparent" : "#555",
            fontSize: "3rem",
            mb: 2,
          }}
        >
          {!studentData.profileImageUrl && getInitials(studentData.firstName, studentData.lastName)}
        </Avatar>
        <Typography variant="h5" sx={{ mb: 1 }}>
          {studentData.firstName} {studentData.middleName || ""} {studentData.lastName}
        </Typography>
        <Typography variant="body2" sx={{ color: "#aaa" }}>
          {studentData.admissionNumber}
        </Typography>
        <img
          src="/knights.png"
          alt="Sure Success Point School"
          style={{ width: 300, height: 300, marginTop: 16 }}
        />
        <Typography variant="h3" sx={{ mt: 1, color: "#aaa" }}>
          Sure Success Point School
        </Typography>
         <Typography variant="body2" sx={{ mt: 1, color: "#fff" }}>
          A unit of Knights International Group for Research, Education & Acadmic Development | Knights (KiREAD Group).
        </Typography>
      </Box>

      {/* Right Column: Student Details */}
      <Box sx={{ width: "75%", pl: 2, overflowY: "auto", maxHeight: `calc(100vh - ${appBarHeight}px - 24px)` }}>
        <Paper sx={{ p: 3, bgcolor: "#111", color: "#fff", borderRadius: 2 }}>
          {/* Personal Details */}
          <Typography variant="h6" sx={{ mb: 2, color: greenAccent }}>
            Personal Details
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Typography><strong>ID:</strong> {studentData.id}</Typography>
            <Typography><strong>Login Email:</strong> {studentData.loginEmail || "N/A"}</Typography>
            <Typography><strong>Admission Number:</strong> {studentData.admissionNumber || "N/A"}</Typography>
            <Typography><strong>Roll Number:</strong> {studentData.rollNumber || "N/A"}</Typography>
            <Typography><strong>Aadhaar Number:</strong> {studentData.aadhaarNumber || "N/A"}</Typography>
            <Typography><strong>Academic Year:</strong> {studentData.academicYear || "N/A"}</Typography>
            <Typography><strong>Admitted Via Test:</strong> {studentData.admittedViaTest ? "Yes" : "No"}</Typography>
            <Typography><strong>Student Category:</strong> {studentData.studentCategory || "N/A"}</Typography>
            <Typography><strong>Enrollment Mode:</strong> {studentData.enrollmentMode || "N/A"}</Typography>
            <Typography><strong>Scholarship Holder:</strong> {studentData.isScholarshipHolder ? "Yes" : "No"}</Typography>
            <Typography><strong>Transport Required:</strong> {studentData.isTransportRequired ? "Yes" : "No"}</Typography>
            <Typography><strong>Class:</strong> {studentData.class?.name || "N/A"}</Typography>
            <Typography><strong>Branch:</strong> {studentData.branch?.name || "N/A"}</Typography>
            <Typography><strong>Gender:</strong> {studentData.gender || "N/A"}</Typography>
            <Typography><strong>Date of Birth:</strong> {studentData.dateOfBirth ? new Date(studentData.dateOfBirth).toLocaleDateString("en-IN") : "N/A"}</Typography>
            <Typography><strong>Admission Date:</strong> {studentData.admissionDate ? new Date(studentData.admissionDate).toLocaleDateString("en-IN") : "N/A"}</Typography>
            <Typography><strong>Status:</strong> {studentData.status || "N/A"}</Typography>
            <Typography><strong>Blood Group:</strong> {studentData.bloodGroup || "N/A"}</Typography>
            <Typography><strong>Nationality:</strong> {studentData.nationality || "N/A"}</Typography>
            <Typography><strong>Religion:</strong> {studentData.religion || "N/A"}</Typography>
            <Typography><strong>Caste Category:</strong> {studentData.casteCategory || "N/A"}</Typography>
            <Typography><strong>Dream/Aim:</strong> {studentData.dreamOrAim || "N/A"}</Typography>
            <Typography><strong>Hobbies:</strong> {studentData.hobbies || "N/A"}</Typography>
            <Typography><strong>Special Talents:</strong> {studentData.specialTalents || "N/A"}</Typography>
            <Typography><strong>Created At:</strong> {studentData.createdAt ? new Date(studentData.createdAt).toLocaleString("en-IN") : "N/A"}</Typography>
            <Typography><strong>Updated At:</strong> {studentData.updatedAt ? new Date(studentData.updatedAt).toLocaleString("en-IN") : "N/A"}</Typography>
          </Box>

          <Divider sx={{ my: 3, bgcolor: "#555" }} />

          {/* Parent/Guardian Details */}
          <Typography variant="h6" sx={{ mb: 2, color: greenAccent }}>
            Parent/Guardian Details
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Typography><strong>Father's Name:</strong> {studentData.fatherName || "N/A"}</Typography>
            <Typography><strong>Father's Contact:</strong> {studentData.fatherContact || "N/A"}</Typography>
            <Typography><strong>Father's Email:</strong> {studentData.fatherEmail || "N/A"}</Typography>
            <Typography><strong>Father's Profession:</strong> {studentData.fatherProfession || "N/A"}</Typography>
            <Typography><strong>Father's Qualification:</strong> {studentData.fatherQualification || "N/A"}</Typography>
            <Typography><strong>Father's Income:</strong> {studentData.fatherIncome || "N/A"}</Typography>
            <Typography><strong>Mother's Name:</strong> {studentData.motherName || "N/A"}</Typography>
            <Typography><strong>Mother's Contact:</strong> {studentData.motherContact || "N/A"}</Typography>
            <Typography><strong>Mother's Email:</strong> {studentData.motherEmail || "N/A"}</Typography>
            <Typography><strong>Mother's Profession:</strong> {studentData.motherProfession || "N/A"}</Typography>
            <Typography><strong>Mother's Qualification:</strong> {studentData.motherQualification || "N/A"}</Typography>
            <Typography><strong>Mother's Income:</strong> {studentData.motherIncome || "N/A"}</Typography>
            <Typography><strong>Guardian's Name:</strong> {studentData.guardianName || "N/A"}</Typography>
            <Typography><strong>Guardian's Relation:</strong> {studentData.guardianRelation || "N/A"}</Typography>
            <Typography><strong>Guardian's Contact:</strong> {studentData.guardianContact || "N/A"}</Typography>
            <Typography><strong>Guardian's Address:</strong> {studentData.guardianAddress || "N/A"}</Typography>
            <Typography><strong>Emergency Contact:</strong> {studentData.emergencyContact || "N/A"}</Typography>
          </Box>

          <Divider sx={{ my: 3, bgcolor: "#555" }} />

          {/* Address Details */}
          <Typography variant="h6" sx={{ mb: 2, color: greenAccent }}>
            Address Details
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Typography><strong>Residential Address:</strong> {studentData.residentialAddress || "N/A"}</Typography>
            <Typography><strong>City:</strong> {studentData.city || "N/A"}</Typography>
            <Typography><strong>State:</strong> {studentData.state || "N/A"}</Typography>
            <Typography><strong>Pin Code:</strong> {studentData.pinCode || "N/A"}</Typography>
          </Box>

          <Divider sx={{ my: 3, bgcolor: "#555" }} />

          {/* Previous School Details */}
          <Typography variant="h6" sx={{ mb: 2, color: greenAccent }}>
            Previous School Details
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Typography><strong>Previous School Name:</strong> {studentData.previousSchoolName || "N/A"}</Typography>
            <Typography><strong>Last Exam Passed:</strong> {studentData.lastExamPassed || "N/A"}</Typography>
            <Typography><strong>Last Exam Result:</strong> {studentData.lastExamResult || "N/A"}</Typography>
            <Typography><strong>Previous Admission Fee:</strong> {studentData.previousAdmissionFee || "N/A"}</Typography>
            <Typography><strong>Previous Monthly Fee:</strong> {studentData.previousMonthlyFee || "N/A"}</Typography>
            <Typography><strong>Reason for Transfer:</strong> {studentData.reasonOfTransfer || "N/A"}</Typography>
            <Typography><strong>Previous School Medium:</strong> {studentData.previousSchoolMedium || "N/A"}</Typography>
            <Typography><strong>Previous School Board:</strong> {studentData.previousSchoolBoard || "N/A"}</Typography>
            <Typography><strong>Previous School City:</strong> {studentData.previousSchoolCity || "N/A"}</Typography>
          </Box>

          <Divider sx={{ my: 3, bgcolor: "#555" }} />

          {/* Health Details */}
          <Typography variant="h6" sx={{ mb: 2, color: greenAccent }}>
            Health Details
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Typography><strong>Health Immunization:</strong> {studentData.healthImmunization ? JSON.stringify(studentData.healthImmunization) : "N/A"}</Typography>
            <Typography><strong>Preferred Language:</strong> {studentData.preferredLanguage || "N/A"}</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default MyInfo;
