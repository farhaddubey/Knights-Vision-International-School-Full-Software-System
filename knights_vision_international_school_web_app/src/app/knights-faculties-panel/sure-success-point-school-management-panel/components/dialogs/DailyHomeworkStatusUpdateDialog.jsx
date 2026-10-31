"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { Assessment } from "@mui/icons-material";
import DailyHomeworkReportDialog from "./DailyHomeworkReportDialog";

const drawerWidth = 280;
const appBarHeight = 64;

const statusColors = {
  PENDING: { variant: "outlined", color: "error" },
  SUBMITTED: { variant: "contained", color: "success" },
  LATE: { variant: "contained", color: "warning" },
  NEEDS_IMPROVEMENT: { variant: "contained", color: "warning" },
  EXCELLENT: { variant: "contained", color: "success" },
};

const DailyHomeworkStatusUpdateDialog = ({ open, onClose, selectedClassSubject, students, className }) => {
  const [loading, setLoading] = useState(false);
  const [homeworkStatuses, setHomeworkStatuses] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    if (open && selectedClassSubject && students.length > 0) {
      fetchHomeworkStatuses();
    }
  }, [open, selectedClassSubject, students]);

  const fetchHomeworkStatuses = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("User not authenticated");

      const today = new Date().toISOString().slice(0, 10);
      const promises = students.map((student) =>
        axios.get(`/api-schools-panel/class_teachers_panel/homework/status/${selectedClassSubject?.id}/${student.id}`, {
          params: { date: today },
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      const responses = await Promise.all(promises);
      const initialStatuses = {};
      responses.forEach((response, index) => {
        const student = students[index];
        const record = response.data.homeworkRecords[0];
        initialStatuses[student.id] = record ? record.status : "PENDING";
      });
      setHomeworkStatuses(initialStatuses);
    } catch (err) {
      console.error("Error fetching homework statuses:", err.message);
      toast.error("Failed to fetch homework statuses.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (student, status) => {
    try {
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("User not authenticated");

      const today = new Date().toISOString().slice(0, 10);
      const payload = { status, date: today };

      const response = await axios.post(
        `/api-schools-panel/class_teachers_panel/homework/status/${selectedClassSubject.id}/${student.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setHomeworkStatuses((prev) => ({ ...prev, [student.id]: status }));
        toast.success(`Homework status updated to ${status} for ${student.firstName} ${student.lastName}`);
      }
    } catch (err) {
      console.error("Error updating homework status:", err.message);
      toast.error(err.response?.data?.error || "Failed to update homework status.");
    }
  };

  const handleOpenReportDialog = (student) => {
    setSelectedStudent({ id: student.id, name: `${student.firstName} ${student.lastName}` });
    setReportDialogOpen(true);
  };

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
    setSelectedStudent(null);
  };

  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
      open={open}
      onClose={onClose}
      fullScreen
    >
      <Box
        sx={{
          backgroundColor: "#212121",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          p: 1,
        }}
      >
        <Assessment sx={{ mr: 1 }} />
        <Typography variant="h6">
          Daily Homework Status - {className} - {selectedClassSubject?.subject?.name}
        </Typography>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          Close
        </Button>
      </Box>
      <DialogContent sx={{ bgcolor: "#181818", p: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress size={60} sx={{ color: "#00c757" }} />
          </Box>
        ) : (
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
              <Typography variant="body2" sx={{ flex: 0.3, fontWeight: "bold", color: "#fff" }}>
                ID
              </Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
                Name
              </Typography>
              <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
                Roll No.
              </Typography>
              <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff" }}>
                Status
              </Typography>
              <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
                Actions
              </Typography>
            </Box>
            <Box sx={{ height: `82vh`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
              <List>
                {students.length > 0 ? (
                  students.map((student) => (
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
                      <Typography variant="body2" sx={{ flex: 0.3, color: "#fff" }}>
                        {student.id}
                      </Typography>
                      <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                        {`${student.firstName} ${student.lastName}`}
                      </Typography>
                      <Typography variant="body2" sx={{ flex: 0.8, color: "#fff" }}>
                        {student.rollNumber || "N/A"}
                      </Typography>
                      <Box sx={{ flex: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {["PENDING", "SUBMITTED", "LATE", "NEEDS_IMPROVEMENT", "EXCELLENT"].map((status) => (
                          <Button
                            key={status}
                            variant={homeworkStatuses[student.id] === status ? statusColors[status].variant : "outlined"}
                            color={statusColors[status].color}
                            onClick={() => handleStatusChange(student, status)}
                            sx={{ minWidth: "80px" }}
                          >
                            {status.replace("_", " ")}
                          </Button>
                        ))}
                      </Box>
                      <Box sx={{ flex: 0.8 }}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleOpenReportDialog(student)}
                          sx={{ color: "#ffeb3b" }}
                        >
                          Monthly Report
                        </Button>
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                    No students found for {className}.
                  </Typography>
                )}
              </List>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DailyHomeworkReportDialog
        open={reportDialogOpen}
        onClose={handleCloseReportDialog}
        classSubjectId={selectedClassSubject?.id}
        className={className}
        subjectName={selectedClassSubject?.subject?.name}
        studentId={selectedStudent?.id}
        studentName={selectedStudent?.name}
      />
    </Dialog>
  );
};

export default DailyHomeworkStatusUpdateDialog;