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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { jsPDF } from "jspdf";
import { Payment } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";
const yellowAccent = "#ffca28";

const schoolInfo = {
  name: "Sure Success Point School",
  site: "www.sspointschool.in",
  address: "Najirpur, Alinagar, Kaliachak, Malda",
  company: "Powered by Knights International Group for Research, Education & Academic Development",
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ReadmissionDialog = ({ open, onClose, student, academicYear, className }) => {
  const [feeSchemes, setFeeSchemes] = useState([]);
  const [selectedFeeScheme, setSelectedFeeScheme] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("Readmission payment");
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [dueMonths, setDueMonths] = useState([]);
  const [paidMonths, setPaidMonths] = useState([]);
  const [nextClassId, setNextClassId] = useState(null);
  const [nextClassName, setNextClassName] = useState(null);
  const [feeSchemeError, setFeeSchemeError] = useState(null);
  const [totalPayable, setTotalPayable] = useState(0);
  const [loading, setLoading] = useState(false);

  const classMap = {
    'v': { id: 4, name: 'Class V', next: { id: 5, name: 'Class VI' } },
    'vi': { id: 5, name: 'Class VI', next: { id: 6, name: 'Class VII' } },
    'vii': { id: 6, name: 'Class VII', next: { id: 7, name: 'Class VIII' } },
    'viii': { id: 7, name: 'Class VIII', next: { id: 8, name: 'Class IX' } },
    'ix': { id: 8, name: 'Class IX', next: { id: 9, name: 'Class X' } },
    'x': { id: 9, name: 'Class X', next: null },
  };

  useEffect(() => {
    if (student && className) {
      const classInfo = classMap[className.toLowerCase()];
      if (classInfo?.next) {
        setNextClassId(classInfo.next.id);
        setNextClassName(classInfo.next.name);
        fetchFeeSchemes(classInfo.next.id, student.studentCategory);
        fetchFeeStatus(student.id, student.finalAdmissionId);
      } else {
        setFeeSchemeError("No next class available for readmission.");
      }
    }
  }, [student, className]);

  useEffect(() => {
    const selectedScheme = feeSchemes.find((scheme) => scheme.id === selectedFeeScheme);
    if (selectedScheme) {
      const monthlyTotal = (dueMonths.length + selectedMonths.length) * selectedScheme.monthlyFee;
      const readmissionTotal = selectedScheme.readmissionFee;
      setTotalPayable(monthlyTotal + readmissionTotal);
    } else {
      setTotalPayable(0);
    }
  }, [dueMonths, selectedMonths, selectedFeeScheme]);

  const fetchFeeSchemes = async (classId, category) => {
    const token = Cookies.get("administration_token");
    try {
      setFeeSchemeError(null);
      const response = await axios.get(`/api/classes/${className.toLowerCase()}/fee-schemes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { classId, category },
      });
      const schemes = response.data.feeSchemes || [];
      if (schemes.length === 0) {
        setFeeSchemeError(`No fee schemes found for classId: ${classId}, category: ${category}`);
      }
      setFeeSchemes(schemes);
      setSelectedFeeScheme(schemes.length > 0 ? schemes[0].id : "");
    } catch (err) {
      setFeeSchemeError("Failed to fetch fee schemes.");
      toast.error("Failed to fetch fee schemes.");
    }
  };

  const fetchFeeStatus = async (studentId, admissionId) => {
    const token = Cookies.get("administration_token");
    try {
      const response = await axios.get("/api/monthly-fees/status", {
        headers: { Authorization: `Bearer ${token}` },
        params: { studentId, admissionId, academicYear: academicYear },
      });
      const paid = response.data.paidMonths.map((m) => m.month) || [];
      const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
      const currentMonth = new Date().getMonth() + 1; // Current month (1-12)
      const remainingMonths = allMonths.filter((m) => m >= currentMonth && !paid.includes(m));
      setDueMonths(remainingMonths);
      setPaidMonths(paid);
    } catch (err) {
      toast.error("Failed to fetch fee status.");
    }
  };

  const handleMonthToggle = (monthIndex) => {
    if (selectedMonths.includes(monthIndex)) {
      setSelectedMonths(selectedMonths.filter((m) => m !== monthIndex));
    } else {
      setSelectedMonths([...selectedMonths, monthIndex]);
    }
  };

  const handleConfirmReadmission = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    if (!selectedFeeScheme) {
      toast.error("Please select a fee scheme.");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    try {
      setLoading(true);
      const selectedScheme = feeSchemes.find((scheme) => scheme.id === selectedFeeScheme);

      const response = await axios.post(
        `/api/classes/${className.toLowerCase()}/readmission`,
        {
          studentId: student.id,
          branchId: student.branchId,
          schoolId: student.schoolId,
          classId: nextClassId,
          academicYear,
          feeSchemeId: selectedFeeScheme,
          paymentMethod,
          transactionId,
          remarks,
          dueMonths,
          selectedMonths,
          readmissionFee: selectedScheme.readmissionFee,
          monthlyFee: selectedScheme.monthlyFee,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { admission, admissionFeeTransaction, monthlyFees } = response.data;

      // Generate PDFs
      handleGenerateAdmissionFeePDF(admission, selectedScheme.readmissionFee);
      monthlyFees.forEach((fee) => handleGenerateMonthlyFeePDF(fee));

      toast.success("Readmission completed successfully!");
      onClose();
    } catch (err) {
      console.error("Error processing readmission:", err);
      toast.error(`Failed to process: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAdmissionFeePDF = (admission, readmissionFee) => {
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
    doc.text(`Readmission Fee Receipt - ${nextClassName}`, pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(10);
    doc.text(`Admission No.: ${admission.finalAdmissionNumber || "N/A"}`, margin, y);
    y += 7;
    doc.text(`Student: ${student?.firstName} ${student?.lastName}`, margin, y);
    y += 7;
    doc.text(`Class: ${nextClassName || "N/A"} ${admission.class?.section || ""}`, margin, y);
    y += 7;
    doc.text(`Academic Year: ${academicYear}`, margin, y);
    y += 7;
    doc.text(`Readmission Fee: ₹${readmissionFee}`, margin, y);
    y += 7;
    doc.text(`Status: PAID`, margin, y);
    y += 7;
    doc.text(`Payment Method: ${paymentMethod}`, margin, y);
    y += 7;
    doc.text(`Transaction ID: ${transactionId || "N/A"}`, margin, y);
    y += 7;
    doc.text(`Remarks: ${remarks || "N/A"}`, margin, y);
    y += 7;
    doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, margin, y);

    doc.save(`readmission_fee_receipt_${admission.finalAdmissionNumber}.pdf`);
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
    doc.text(`Monthly Fee Receipt - ${nextClassName}`, pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(10);
    doc.text(`Admission No.: ${student?.admissionNumber || "N/A"}`, margin, y);
    y += 7;
    doc.text(`Student: ${student?.firstName} ${student?.lastName}`, margin, y);
    y += 7;
    doc.text(`Class: ${monthlyFee.classId === nextClassId ? (nextClassName || "N/A") : (student?.class?.name || "N/A")}`, margin, y);
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
        <Payment sx={{ color: greenAccent }} />
        <Typography variant="h6">
          Process Readmission: {student?.firstName} {student?.lastName} ({nextClassName})
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#000" }}>
        {feeSchemeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {feeSchemeError}
          </Alert>
        )}
        <Typography sx={{ color: "#fff", mb: 2 }}>
          Admission No.: {student?.admissionNumber || "N/A"} | Current Class: {student?.class?.name || "N/A"} {student?.class?.section || ""} | Next Class: {nextClassName || "N/A"}
        </Typography>

        <FormControl fullWidth sx={{ mt: 2, backgroundColor: "#333", borderRadius: "4px" }}>
          <InputLabel sx={{ color: "#aaa" }}>Fee Scheme</InputLabel>
          <Select
            value={selectedFeeScheme}
            onChange={(e) => setSelectedFeeScheme(e.target.value)}
            sx={{
              color: "#fff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
            }}
            disabled={feeSchemes.length === 0}
          >
            {feeSchemes.map((scheme) => (
              <MenuItem key={scheme.id} value={scheme.id}>
                {`₹${scheme.readmissionFee} (Readmission), ₹${scheme.monthlyFee} (Monthly) (${scheme.category})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" sx={{ mt: 4, color: "#fff" }}>
          Current Year Dues (Academic Year: April {academicYear} - March {academicYear + 1})
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {dueMonths.length > 0 ? (
            dueMonths.map((monthIndex) => (
              <Chip
                key={monthIndex}
                label={monthNames[monthIndex - 1]}
                sx={{
                  backgroundColor: "#f44336",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#d32f2f" },
                }}
              />
            ))
          ) : (
            <Typography sx={{ color: "#fff" }}>No dues pending.</Typography>
          )}
        </Box>

        <Typography variant="h6" sx={{ mt: 4, color: "#fff" }}>
          Readmission Fee for {nextClassName} (Academic Year: {academicYear})
        </Typography>
        {selectedFeeScheme && (
          <Typography sx={{ mt: 1, color: "#fff" }}>
            Amount: ₹{feeSchemes.find((scheme) => scheme.id === selectedFeeScheme)?.readmissionFee || "N/A"}
          </Typography>
        )}

        <Typography variant="h6" sx={{ mt: 4, color: "#fff" }}>
          Select Monthly Fees for Next Year (Academic Year: April {academicYear + 1} - March {academicYear + 2})
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {monthNames.map((month, index) => {
            const monthIndex = index + 1;
            const isSelected = selectedMonths.includes(monthIndex);
            return (
              <Chip
                key={monthIndex}
                label={month}
                onClick={() => handleMonthToggle(monthIndex)}
                sx={{
                  backgroundColor: isSelected ? yellowAccent : "#555",
                  color: isSelected ? "#000" : "#fff",
                  "&:hover": { backgroundColor: isSelected ? yellowAccent : "#777" },
                  cursor: "pointer",
                }}
              />
            );
          })}
        </Box>

        {(dueMonths.length > 0 || selectedMonths.length > 0) && selectedFeeScheme && (
          <Box sx={{ mt: 2 }}>
            {dueMonths.map((monthIndex) => (
              <Box
                key={monthIndex}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#fff",
                  py: 0.5,
                }}
              >
                <Typography sx={{ textAlign: "left" }}>{monthNames[monthIndex - 1]} (Current Year)</Typography>
                <Typography sx={{ textAlign: "right" }}>
                  ₹{feeSchemes.find((scheme) => scheme.id === selectedFeeScheme)?.monthlyFee || "N/A"}
                </Typography>
              </Box>
            ))}
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
                <Typography sx={{ textAlign: "left" }}>{monthNames[monthIndex - 1]} (Next Year)</Typography>
                <Typography sx={{ textAlign: "right" }}>
                  ₹{feeSchemes.find((scheme) => scheme.id === selectedFeeScheme)?.monthlyFee || "N/A"}
                </Typography>
              </Box>
            ))}
            <Box sx={{ display: "flex", justifyContent: "space-between", color: "#fff", fontWeight: "bold", mt: 1 }}>
              <Typography>Total Monthly Fees:</Typography>
              <Typography>
                ₹{(dueMonths.length + selectedMonths.length) * (feeSchemes.find((scheme) => scheme.id === selectedFeeScheme)?.monthlyFee || 0)}
              </Typography>
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
              placeholder="Readmission payment"
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
          onClick={handleConfirmReadmission}
          variant="contained"
          color="primary"
          disabled={feeSchemes.length === 0 || loading}
          sx={{ bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
        >
          Confirm Readmission
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReadmissionDialog;