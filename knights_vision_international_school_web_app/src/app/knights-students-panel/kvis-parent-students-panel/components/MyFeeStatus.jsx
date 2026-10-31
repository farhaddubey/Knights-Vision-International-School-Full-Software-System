"use client";

import React, { useState, useEffect } from "react";
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
  Dialog,
} from "@mui/material";
import { AccountBalanceWallet, Close, Download } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: greenAccent },
  },
};

const MyFeeStatus = () => {
  const [className, setClassName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [academicYear, setAcademicYear] = useState(2025);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeeStatus();
  }, [academicYear]);

  const fetchFeeStatus = async () => {
    const token = Cookies.get("student_token");
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/a1-knights-students-panel/students/myfeestatus", {
        headers: { Authorization: `Bearer ${token}` },
        params: { academicYear },
      });
      setFees(response.data.fees);
      setClassName(response.data.className || "Unknown");
      setSchoolName(response.data.schoolName || "Sure Success Point School");
      setBranchAddress(response.data.branchAddress || "Unknown Address");
    } catch (err) {
      console.error("Fetch Fee Status Error:", err.response?.data || err.message);
      setError("Failed to fetch fee status.");
      toast.error("Failed to fetch fee status.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (monthlyFeeId) => {
    const token = Cookies.get("student_token");
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/a1-knights-students-panel/students/myfeestatus", {
        headers: { Authorization: `Bearer ${token}` },
        params: { monthlyFeeId },
      });
      setPayments(response.data.payments);
      setClassName(response.data.className || "Unknown");
      setSchoolName(response.data.schoolName || "Sure Success Point School");
      setBranchAddress(response.data.branchAddress || "Unknown Address");
    } catch (err) {
      console.error("Fetch Payments Error:", err.response?.data || err.message);
      setError("Failed to fetch payment details.");
      toast.error("Failed to fetch payment details.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (fee) => {
    setSelectedMonth(fee);
    if (fee.id) {
      fetchPayments(fee.id);
    } else {
      setPayments([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMonth(null);
    setPayments([]);
  };

  const handleYearChange = (e) => {
    setAcademicYear(parseInt(e.target.value));
  };

const handleDownloadPDF = async () => {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imgSize = 28;
    const imgY = 28;
    const margin = 10;
    const tableWidth = pageWidth - 2 * margin; // 190mm for A4
    const columnCount = 7; // Month, Status, Total Due, Paid Amount, Fine Amount, Due Date, Transaction ID/Method
    const columnWidth = tableWidth / columnCount; // Equal width for each column

    // === School Logo (Left) ===
    try {
      doc.addImage("/knights.png", "PNG", 10, imgY, imgSize, imgSize);
    } catch (imgError) {
      console.warn("DEBUG: Logo image loading failed:", imgError.message);
      toast.warn("Failed to load logo image");
    }

    // === Right Logo ===
    try {
      doc.addImage("/knights.png", "PNG", pageWidth - imgSize - margin, imgY, imgSize, imgSize);
    } catch (imgError) {
      console.warn("DEBUG: Right logo image loading failed:", imgError.message);
      toast.warn("Failed to load right logo image");
    }

    // === School Name ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor("#003087");
    doc.text("Sure Success Point School", pageWidth / 2, 19, { align: "center" });

    // === School Motto ===
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#333");
    doc.setFontSize(12);
    doc.text(
      "Institution of Humanism, Hardwork, Discipline, Technology & Excellence",
      pageWidth / 2,
      28,
      { align: "center" }
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `www.sspointschool.in | ${branchAddress}`,
      pageWidth / 2,
      36,
      { align: "center" }
    );

    // === Report Title ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#000");
    doc.text("FEE PAYMENT RECEIPT", pageWidth / 2, 44, { align: "center" });

    // === Class and Academic Year ===
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(
      `Class: ${className.toUpperCase()} | Academic Year: ${academicYear}`,
      pageWidth / 2,
      52,
      { align: "center" }
    );

    // === Divider Line ===
    doc.setDrawColor("#6a1b9a");
    doc.setLineWidth(0.5);
    doc.line(margin, 56, pageWidth - margin, 56);

    // Fetch payment details for all months with existing records
    const token = Cookies.get("student_token");
    const paymentData = {};
    for (const fee of fees.filter(f => f.id)) {
      try {
        const response = await axios.get("/api/a1-knights-students-panel/students/myfeestatus", {
          headers: { Authorization: `Bearer ${token}` },
          params: { monthlyFeeId: fee.id },
        });
        const latestPayment = response.data.payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0];
        paymentData[fee.id] = latestPayment ? `${latestPayment.transactionId || "N/A"} (${latestPayment.method})` : "N/A";
      } catch (err) {
        console.warn(`DEBUG: Failed to fetch payments for fee ID ${fee.id}:`, err.message);
        paymentData[fee.id] = "N/A";
      }
    }

    // Prepare table data
    const tableData = fees.map((fee) => [
      monthNames[fee.month - 1],
      fee.status,
      `₹${fee.totalDue.toFixed(2)}`,
      `₹${fee.paidAmount.toFixed(2)}`,
      `₹${(fee.fineAmount || 0).toFixed(2)}`,
      new Date(fee.dueDate).toLocaleDateString("en-IN"),
      fee.id ? paymentData[fee.id] || "N/A" : "N/A",
    ]);

    // Calculate totals
    const totalPaid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
    const totalRemaining = fees.reduce((sum, fee) => sum + (fee.status === "PAID" ? 0 : fee.totalDue - fee.paidAmount), 0);

    // Fee status table
    if (tableData.length > 0) {
      doc.autoTable({
        head: [["Month", "Status", "Total Due", "Paid Amount", "Fine Amount", "Due Date", "Transaction ID/Method"]],
        body: tableData,
        startY: 62,
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
        columnStyles: {
          0: { cellWidth: columnWidth },
          1: {
            cellWidth: columnWidth,
            textColor: (row, data) => (data[row][1] === "PAID" ? [0, 200, 83] : [244, 67, 54]),
            fontStyle: (row, data) => (data[row][1] === "PAID" ? "bold" : "normal"),
          },
          2: { cellWidth: columnWidth },
          3: { cellWidth: columnWidth },
          4: { cellWidth: columnWidth },
          5: { cellWidth: columnWidth },
          6: { cellWidth: columnWidth },
        },
      });

      // Add totals
      const finalY = doc.lastAutoTable.finalY || 62;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor("#000");
      doc.text(`Total Paid: ₹${totalPaid.toFixed(2)}`, margin, finalY + 10);
      doc.text(`Total Remaining: ₹${totalRemaining.toFixed(2)}`, margin, finalY + 18);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#000");
      doc.text("No fee records found.", margin, 62);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor("#000");
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      margin,
      pageHeight - 10
    );

    doc.save(`FeeReceipt_${className}_${academicYear}.pdf`);
    toast.success("📄 Fee receipt downloaded successfully.");
  } catch (err) {
    console.error("DEBUG: Error generating PDF:", err.message);
    toast.error("Failed to generate fee receipt.");
  }
};

  return (
    <Box
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        right: 0,
        bottom: 0,
        bgcolor: "#212121",
        color: "#fff",
        overflowY: "auto",
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
        }}
      >
        <ListItemIcon sx={{ color: greenAccent }}>
          <AccountBalanceWallet />
        </ListItemIcon>
        <ListItemText primary={`My Fee Status - ${className}`} />
        <TextField
          label="Academic Year"
          type="number"
          value={academicYear}
          onChange={handleYearChange}
          size="small"
          sx={{ width: "150px", ...textFieldStyles }}
        />
        <Button
          variant="contained"
          startIcon={<Download />}
          sx={{ bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
          onClick={handleDownloadPDF}
        >
          Download Receipt
        </Button>
      </ListItemButton>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress sx={{ color: greenAccent }} />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ textAlign: "center", mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Fee Status List */}
      <Box sx={{ mb: 4, p: 2, bgcolor: "#181818", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ color: greenAccent, mb: 2 }}>
          Fee Status for {academicYear}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Month
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Status
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Total Due
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Paid Amount
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Fine Amount
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Due Date
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Action
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {fees.length > 0 ? (
              fees.map((fee) => (
                <ListItem
                  key={fee.id || `month-${fee.month}`}
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
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {monthNames[fee.month - 1]}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      color:
                        fee.status === "PAID" ? greenAccent :
                        fee.status === "WAIVED" ? "#ffca28" : "#f44336",
                    }}
                  >
                    {fee.status}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    ₹{fee.totalDue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    ₹{fee.paidAmount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    ₹{(fee.fineAmount || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {new Date(fee.dueDate).toLocaleDateString("en-IN")}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ flex: 1, bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
                    onClick={() => handleOpenDialog(fee)}
                  >
                    View Payments
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No fee records found for {className} in {academicYear}.
              </Typography>
            )}
          </List>
        </Box>
      </Box>

      {/* Payments Dialog */}
      <Dialog
        sx={{
          position: "fixed",
          top: `${appBarHeight}px`,
          left: `calc(${drawerWidth}px)`,
          transform: "translate(0, 0)",
        }}
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullScreen
      >
        <ListItemButton
          sx={{
            backgroundColor: "#181818",
            color: "#fff",
            "&:hover": { backgroundColor: "#181818" },
          }}
        >
          <ListItemIcon sx={{ color: greenAccent }}>
            <AccountBalanceWallet />
          </ListItemIcon>
          <ListItemText primary={`Payment Details for ${selectedMonth ? monthNames[selectedMonth.month - 1] : "Unknown"} ${academicYear} - ${className}`} />
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
          >
            <Close />
          </Button>
        </ListItemButton>
        <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#212121", color: "#fff", p: 2 }}>
          <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
            <Box sx={{ mb: 2 }}>
              {selectedMonth && (
                <>
                  <Typography variant="body2"><strong>Status:</strong> {selectedMonth.status}</Typography>
                  <Typography variant="body2"><strong>Total Due:</strong> ₹{selectedMonth.totalDue.toFixed(2)}</Typography>
                  <Typography variant="body2"><strong>Paid Amount:</strong> ₹{selectedMonth.paidAmount.toFixed(2)}</Typography>
                  <Typography variant="body2"><strong>Fine Amount:</strong> ₹{(selectedMonth.fineAmount || 0).toFixed(2)}</Typography>
                  <Typography variant="body2"><strong>Waived:</strong> {selectedMonth.isWaived ? "Yes" : "No"}</Typography>
                  {selectedMonth.isWaived && (
                    <Typography variant="body2"><strong>Waived Amount:</strong> ₹{(selectedMonth.waivedAmount || 0).toFixed(2)}</Typography>
                  )}
                  <Typography variant="body2"><strong>Remarks:</strong> {selectedMonth.remarks || "N/A"}</Typography>
                  <Typography variant="body2"><strong>Total Payments:</strong> {payments.length}</Typography>
                </>
              )}
            </Box>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress sx={{ color: greenAccent }} />
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto", whiteSpace: "nowrap", pb: 2 }}>
                <List sx={{ display: "inline-flex", gap: 2 }}>
                  {payments.length === 0 ? (
                    <Typography>No payment records found for this month.</Typography>
                  ) : (
                    payments.map((payment) => (
                      <ListItem
                        key={payment.id}
                        sx={{
                          bgcolor: "rgba(0, 200, 83, 0.1)",
                          borderRadius: 1,
                          width: "400px",
                          display: "inline-block",
                          "&:hover": { bgcolor: "rgba(0, 200, 83, 0.2)" },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1">
                              <strong>Amount:</strong> ₹{payment.amount.toFixed(2)}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                <strong>Payment Date:</strong> {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                              </Typography>
                              <Typography variant="body2"><strong>Method:</strong> {payment.method}</Typography>
                              <Typography variant="body2"><strong>Transaction ID:</strong> {payment.transactionId || "N/A"}</Typography>
                              <Typography variant="body2"><strong>Received By:</strong> {payment.receivedBy || "N/A"}</Typography>
                              <Typography variant="body2"><strong>Remarks:</strong> {payment.remarks || "N/A"}</Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Box>
            )}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default MyFeeStatus;
