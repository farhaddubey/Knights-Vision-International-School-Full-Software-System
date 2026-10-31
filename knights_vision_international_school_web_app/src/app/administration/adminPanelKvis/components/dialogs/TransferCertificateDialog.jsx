"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { jsPDF } from "jspdf";
import { Assignment } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const schoolInfo = {
  name: "Sure Success Point School",
  site: "www.sspointschool.in",
  address: "Najirpur, Alinagar, Kaliachak, Malda",
  company: "Powered by Knights International Group for Research, Education & Academic Development",
};

const TransferCertificateDialog = ({ open, onClose, student, academicYear, className }) => {
  const [reason, setReason] = useState("");
  const [dateOfLeaving, setDateOfLeaving] = useState(new Date().toISOString().split("T")[0]);
  const [conduct, setConduct] = useState("Good");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const classMap = {
    v: { id: 4, name: "Class V" },
    vi: { id: 5, name: "Class VI" },
    vii: { id: 6, name: "Class VII" },
    viii: { id: 7, name: "Class VIII" },
    ix: { id: 8, name: "Class IX" },
    x: { id: 9, name: "Class X" },
  };

  const classInfo = classMap[className.toLowerCase()] || { id: 4, name: "Class V" };

  const handleGenerateTC = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    if (!reason || !dateOfLeaving || !conduct) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `/api/classes/${className.toLowerCase()}/transfer-certificate`,
        {
          studentId: student.id,
          branchId: student.branchId,
          schoolId: student.schoolId,
          classId: student.classId,
          academicYear,
          reason,
          dateOfLeaving,
          conduct,
          remarks,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { transferCertificateId } = response.data;

      // Generate TC PDF
      handleGenerateTCPDF(transferCertificateId);

      toast.success("Transfer Certificate generated successfully!");
      onClose();
    } catch (err) {
      toast.error(`Failed to generate TC: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTCPDF = (transferCertificateId) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const margin = 10;
    let y = margin;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(schoolInfo.name, pageWidth / 2, y + 5, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(schoolInfo.address, pageWidth / 2, y + 10, { align: "center" });
    doc.text(schoolInfo.site, pageWidth / 2, y + 15, { align: "center" });
    y += 25;

    doc.setFontSize(12);
    doc.text("TRANSFER CERTIFICATE", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(10);
    doc.text(`TC No.: ${transferCertificateId}`, margin, y);
    y += 7;
    doc.text(`Admission No.: ${student?.admissionNumber || "N/A"}`, margin, y);
    y += 7;
    doc.text(`Student: ${student?.firstName} ${student?.lastName}`, margin, y);
    y += 7;
    doc.text(`Class: ${student?.class?.name || "N/A"} ${student?.class?.section || ""}`, margin, y);
    y += 7;
    doc.text(`Date of Birth: ${student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "N/A"}`, margin, y);
    y += 7;
    doc.text(`Date of Leaving: ${dateOfLeaving}`, margin, y);
    y += 7;
    doc.text(`Reason for Leaving: ${reason}`, margin, y);
    y += 7;
    doc.text(`Conduct: ${conduct}`, margin, y);
    y += 7;
    doc.text(`Remarks: ${remarks || "N/A"}`, margin, y);
    y += 7;
    doc.text(`Academic Year: ${academicYear}`, margin, y);
    y += 20;

    doc.setFontSize(10);
    doc.text("Principal's Signature: ____________________", margin, y);
    y += 7;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 7;
    doc.text(schoolInfo.company, pageWidth / 2, y + 20, { align: "center" });

    doc.save(`transfer_certificate_${transferCertificateId}.pdf`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
        "& .MuiDialog-paper": { backgroundColor: "#000", color: "#fff" },
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
      <DialogTitle
        sx={{
          backgroundColor: "#212121",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Assignment sx={{ color: greenAccent }} />
        <Typography variant="h6">
          Generate Transfer Certificate: {student?.firstName} {student?.lastName}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#000" }}>
        <Typography sx={{ color: "#fff", mb: 2 }}>
          Admission No.: {student?.admissionNumber || "N/A"} | Class: {student?.class?.name || "N/A"} {student?.class?.section || ""}
        </Typography>

        <TextField
          label="Reason for Leaving"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          margin="normal"
          required
          sx={{
            backgroundColor: "#333",
            borderRadius: "4px",
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiInputLabel-root": { color: "#aaa" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
          }}
        />
        <TextField
          label="Date of Leaving"
          type="date"
          value={dateOfLeaving}
          onChange={(e) => setDateOfLeaving(e.target.value)}
          fullWidth
          margin="normal"
          required
          sx={{
            backgroundColor: "#333",
            borderRadius: "4px",
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiInputLabel-root": { color: "#aaa" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
          }}
        />
        <TextField
          label="Conduct"
          value={conduct}
          onChange={(e) => setConduct(e.target.value)}
          fullWidth
          margin="normal"
          required
          sx={{
            backgroundColor: "#333",
            borderRadius: "4px",
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiInputLabel-root": { color: "#aaa" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
          }}
        />
        <TextField
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          fullWidth
          margin="normal"
          sx={{
            backgroundColor: "#333",
            borderRadius: "4px",
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiInputLabel-root": { color: "#aaa" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#000" }}>
        <Button onClick={onClose} variant="contained" color="error" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerateTC}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
        >
          Generate TC
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferCertificateDialog;