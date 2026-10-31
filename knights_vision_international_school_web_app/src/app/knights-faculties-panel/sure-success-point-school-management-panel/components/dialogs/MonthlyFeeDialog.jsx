"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Payment, Close } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { jsPDF } from "jspdf";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c757";
const yellowAccent = "#ffca28";

const schoolInfo = {
  name: "Sure Success Point School",
  site: "www.sspointschool.in",
  address: "Najirpur, Alinagar, Kaliachak, Malda",
  company: "Powered by Knights International Group for Research, Education & Academic Development",
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MonthlyFeeDialog = ({ open, onClose, student, academicYear }) => {
  const [feeScheme, setFeeScheme] = useState(null);
  const [feeSchemeError, setFeeSchemeError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("Monthly fee payment");
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [paidMonths, setPaidMonths] = useState([]);
  const [totalPayable, setTotalPayable] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!student) {
      setFeeScheme(null);
      setFeeSchemeError(null);
      setPaidMonths([]);
      return;
    }
    if (!student.feeScheme) {
      setFeeScheme(null);
      setFeeSchemeError("No fee scheme assigned to this student.");
      setPaidMonths([]);
      return;
    }
    setFeeScheme(student.feeScheme);
    setFeeSchemeError(null);
    fetchPaidMonths(student.id, student.finalAdmissionId);
  }, [student, academicYear]);

  useEffect(() => {
    if (feeScheme) {
      setTotalPayable(selectedMonths.length * feeScheme.monthlyFee);
    } else {
      setTotalPayable(0);
    }
  }, [selectedMonths, feeScheme]);

  const fetchPaidMonths = async (studentId, admissionId) => {
    const token = Cookies.get("faculties_token");
    try {
      const response = await axios.get("/api/monthly-fees/status", {
        headers: { Authorization: `Bearer ${token}` },
        params: { studentId, admissionId, academicYear },
      });
      setPaidMonths(response.data.paidMonths.map((m) => m.month) || []);
    } catch (err) {
      toast.error("Failed to fetch paid months.");
    }
  };

  const handleMonthToggle = (monthIndex) => {
    if (selectedMonths.includes(monthIndex)) {
      setSelectedMonths(selectedMonths.filter((m) => m !== monthIndex));
    } else {
      setSelectedMonths([...selectedMonths, monthIndex]);
    }
  };

  const handleConfirmFees = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    if (!feeScheme) {
      toast.error("No fee scheme available.");
      return;
    }
    if (selectedMonths.length === 0) {
      toast.error("Please select at least one month.");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "/api/monthly-fees/collect",
        {
          studentId: student.id,
          academicYear,
          months: selectedMonths,
          paymentMethod,
          transactionId: transactionId || null,
          remarks,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const collections = response.data.collections || [];
      collections.forEach((entry) => handleGenerateCollectionAcknowledgement(entry.collection, entry.fee));
      toast.success(collections.length
        ? `Guardian collection acknowledgement generated for ${collections.length} month(s). Submit the cash/documents to COEF for verification.`
        : "No collection was recorded because the selected months are already settled or awaiting verification.");
      fetchPaidMonths(student.id, student.finalAdmissionId);
      setSelectedMonths([]);
      setPaymentMethod("");
      setTransactionId("");
      setRemarks("Monthly fee payment");
    } catch (err) {
      console.error("Error processing monthly fees:", err);
      toast.error(`Failed to process: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCollectionAcknowledgement = (collection, fee) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const margin = 12;
    let y = margin;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(schoolInfo.name, 105, y, { align: "center" });
    y += 8;
    doc.setFontSize(11);
    doc.text("Guardian Fee Collection Acknowledgement", 105, y, { align: "center" });
    y += 11;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    [
      `Acknowledgement ID: ${collection.publicId}`,
      `Student: ${student?.firstName || ""} ${student?.lastName || ""}`,
      `Admission No.: ${student?.admissionNumber || "N/A"}`,
      `Class: ${student?.class?.name || "N/A"} ${student?.class?.section || ""}`,
      `Fee month: ${monthNames[(fee?.month || 1) - 1]} ${fee?.year || academicYear}`,
      `Amount collected: Rs. ${collection.amount}`,
      `Method / reference: ${collection.method}${collection.transactionId ? ` / ${collection.transactionId}` : ""}`,
      "Status: Collected and awaiting COEF handover, bank submission, and Administration received confirmation.",
    ].forEach((line) => { doc.text(line, margin, y, { maxWidth: 185 }); y += 8; });
    doc.save(`fee_collection_acknowledgement_${student?.admissionNumber || "student"}_${collection.publicId}.pdf`);
  };

  const handleGenerateMonthlyFeePDF = (monthlyFee) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const margin = 10;
    let y = margin;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(schoolInfo.name, pageWidth / 2, y + 5, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(schoolInfo.address, pageWidth / 2, y + 10, { align: "center" });
    y += 20;

    doc.setFontSize(12);
    doc.text("Monthly Fee Receipt", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(10);
    doc.text(`Admission No.: ${student?.admissionNumber || "N/A"}`, margin, y);
    y += 7;
    doc.text(`Student: ${student?.firstName} ${student?.lastName}`, margin, y);
    y += 7;
    doc.text(`Class: ${student?.class?.name || "N/A"} ${student?.class?.section || ""}`, margin, y);
    y += 7;
    doc.text(`Month: ${monthNames[monthlyFee.month - 1]} ${monthlyFee.year}`, margin, y);
    y += 7;
    doc.text(`Amount: ₹${monthlyFee.totalDue}`, margin, y);
    y += 7;
    doc.text(`Status: PAID`, margin, y);
    y += 7;
    doc.text(`Payment Method: ${monthlyFee.payment.method}`, margin, y);
    y += 7;
    doc.text(`Transaction ID: ${monthlyFee.payment.transactionId || "N/A"}`, margin, y);
    y += 7;
    doc.text(`Remarks: ${monthlyFee.payment.remarks || "N/A"}`, margin, y);
    y += 7;
    doc.text(`Payment Date: ${new Date(monthlyFee.payment.paymentDate).toLocaleDateString()}`, margin, y);

    doc.save(`monthly_fee_receipt_${student?.admissionNumber}_${monthNames[monthlyFee.month - 1]}_${monthlyFee.year}.pdf`);
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
          backgroundColor: "#009688",
          color: "#fff",
          "&:hover": { backgroundColor: "#009688" },
          paddingY:'8px'
        }}
      >
        <ListItemIcon>
          <Payment sx={{ color: "#fff" }} />
        </ListItemIcon>
        <ListItemText
          primary={`Manage Monthly Fees: ${student?.firstName} ${student?.middleName} ${student?.lastName}`}
        />
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff", p: 2 }}>
        <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
          <DialogContent sx={{ bgcolor: "#000", color: "#fff", pb:'10px' }}>
            {feeSchemeError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {feeSchemeError}
              </Alert>
            ) : feeScheme ? (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                  Fee Scheme: ₹{feeScheme.monthlyFee} (Monthly, {feeScheme.category})
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ color: "#fff" }}>Loading fee scheme...</Typography>
            )}
            <Typography sx={{ color: "#fff", py: 2 }}>
              Admission No.: {student?.admissionNumber || "N/A"} | Class: {student?.class?.name || "N/A"} {student?.class?.section || ""}
            </Typography>

            <Typography variant="h6" sx={{ mt: 4, color: "#fff" }}>
              Paid Months (Academic Year: April {academicYear} - March {academicYear + 1})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              {paidMonths.length > 0 ? (
                paidMonths.map((monthIndex) => (
                  <Chip
                    key={monthIndex}
                    label={monthNames[monthIndex - 1]}
                    sx={{
                      backgroundColor: greenAccent,
                      color: "#000",
                      "&:hover": { backgroundColor: greenAccent },
                    }}
                  />
                ))
              ) : (
                <Typography sx={{ color: "#fff" }}>No months paid.</Typography>
              )}
            </Box>

            <Typography variant="h6" sx={{ mt: 4, color: "#fff" }}>
              Select Months to Pay (Academic Year: April {academicYear} - March {academicYear + 1})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              {monthNames.map((month, index) => {
                const monthIndex = index + 1;
                const isPaid = paidMonths.includes(monthIndex);
                const isSelected = selectedMonths.includes(monthIndex);
                return (
                  <Chip
                    key={monthIndex}
                    label={month}
                    onClick={() => !isPaid && handleMonthToggle(monthIndex)}
                    sx={{
                      backgroundColor: isPaid ? greenAccent : isSelected ? yellowAccent : "#555",
                      color: isPaid || isSelected ? "#000" : "#fff",
                      "&:hover": { backgroundColor: isPaid ? greenAccent : isSelected ? yellowAccent : "#777" },
                      cursor: isPaid ? "not-allowed" : "pointer",
                    }}
                    disabled={isPaid}
                  />
                );
              })}
            </Box>

            {selectedMonths.length > 0 && feeScheme && (
              <Box sx={{ mt: 2 }}>
                {selectedMonths.map((monthIndex) => (
                  <Box
                    key={monthIndex}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#fff",
                      py: 0.5,
                    }}
                  >
                    <Typography sx={{ textAlign: "left" }}>{monthNames[monthIndex - 1]}</Typography>
                    <Typography sx={{ textAlign: "right" }}>
                      ₹{feeScheme.monthlyFee}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ display: "flex", justifyContent: "space-between", color: "#fff", fontWeight: "bold", mt: 1 }}>
                  <Typography>Total Monthly Fees:</Typography>
                  <Typography>₹{totalPayable}</Typography>
                </Box>
              </Box>
            )}

            <Typography variant="h6" sx={{ mt: 4, color: "#fff" }}>
              Payment Details
            </Typography>
            <FormControl fullWidth sx={{ mt: 2, backgroundColor: "#333", borderRadius: "4px" }}>
              <InputLabel sx={{ color: "#aaa" }}>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{
                  color: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
                }}
              >
                {["CASH", "UPI", "NET_BANKING", "ONLINE_GATEWAY"].map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {["UPI", "NET_BANKING", "ONLINE_GATEWAY"].includes(paymentMethod) && (
              <>
                <TextField
                  label="Transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
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
                <TextField
                  label="Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="Monthly fee payment"
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
              </>
            )}
            {totalPayable > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2,
                  color: greenAccent,
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                <Typography>Total Payable Right Now:</Typography>
                <Typography>₹{totalPayable}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error" disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmFees}
              variant="contained"
              color="primary"
              disabled={feeSchemeError || !feeScheme || loading}
              sx={{ bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
            >
              Confirm Payment
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default MonthlyFeeDialog;
