import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import SchoolClassSelect from "@/components/sure-success-point-school/selectors/SchoolClassSelect";
import SchoolBranchSelect from "@/components/sure-success-point-school/selectors/SchoolBranchSelect";

const drawerWidth = 280;
const appBarHeight = 64;

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00c853" },
  backgroundColor: "#333",
  borderRadius: "4px",
};

const AdmissionTestDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchTests,
}) => {
  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...editFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setEditFields(updatedFields);
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    if (
      !editFields[0].name ||
      !editFields[0].testDate ||
      !editFields[0].maxMarks ||
      !editFields[0].classId ||
      !editFields[0].schoolId ||
      !editFields[0].branchId
    ) {
      toast.error(
        "Please fill all required fields (Name, Test Date, Max Marks, Class, School, Branch).",
      );
      return;
    }

    try {
      const payloads = editFields.map((field) => ({
        name: field.name,
        testDate: new Date(field.testDate).toISOString(),
        maxMarks: parseFloat(field.maxMarks),
        venue: field.venue || null,
        classId: parseInt(field.classId),
        schoolId: parseInt(field.schoolId),
        branchId: parseInt(field.branchId),
        academicYear: parseInt(field.academicYear),
        ...(field.id && { id: field.id }),
      }));

      const updates = payloads.filter((p) => p.id);
      const creates = payloads.filter((p) => !p.id);

      for (const update of updates) {
        const { id, ...data } = update;
        await axios.put(`/api/admission-tests/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (creates.length > 0) {
        await axios.post("/api/admission-tests", creates, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success("🎉 Admission test saved successfully!");
      handleSaveAndCloseModal();
      fetchTests();
      setEditFields([
        {
          name: "",
          testDate: "",
          maxMarks: "",
          venue: "",
          classId: "",
          schoolId: "",
          branchId: "",
          academicYear: 2025,
        },
      ]);
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      toast.error("❌ Error saving admission test.");
    }
  };

  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
      open={openInsertion}
      onClose={handleCloseModal}
      fullWidth
      maxWidth="sm"
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
          backgroundColor: "#212121",
          color: "#fff",
          "&:hover": { backgroundColor: "#212121" },
        }}
      >
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText sx={{ color: "#fff" }} primary="Manage Admission Test" />
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <DialogContent sx={{ backgroundColor: "#000", color: "#fff" }}>
        {editFields.map((field, index) => (
          <Box key={index}>
            <TextField
              sx={textFieldStyles}
              label="Test Name"
              fullWidth
              margin="normal"
              value={field.name ?? ""}
              onChange={(e) => handleFieldChange(index, "name", e.target.value)}
              required
            />
            <TextField
              sx={textFieldStyles}
              label="Test Date"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={field.testDate ?? ""}
              onChange={(e) =>
                handleFieldChange(index, "testDate", e.target.value)
              }
              required
            />
            <TextField
              sx={textFieldStyles}
              label="Max Marks"
              type="number"
              fullWidth
              margin="normal"
              value={field.maxMarks ?? ""}
              onChange={(e) =>
                handleFieldChange(index, "maxMarks", e.target.value)
              }
              required
            />
            <TextField
              sx={textFieldStyles}
              label="Venue"
              fullWidth
              margin="normal"
              value={field.venue ?? ""}
              onChange={(e) =>
                handleFieldChange(index, "venue", e.target.value)
              }
            />
            <SchoolClassSelect
              selectedClass={field.classId}
              setSelectedClass={(value) =>
                handleFieldChange(index, "classId", value)
              }
            />
            <TextField
              sx={textFieldStyles}
              label="School ID"
              type="number"
              fullWidth
              margin="normal"
              value={field.schoolId ?? ""}
              onChange={(e) =>
                handleFieldChange(index, "schoolId", e.target.value)
              }
              required
            />
            <SchoolBranchSelect
              selectedBranch={field.branchId}
              setSelectedBranch={(value) =>
                handleFieldChange(index, "branchId", value)
              }
            />
            <TextField
              sx={textFieldStyles}
              label="Academic Year"
              type="number"
              fullWidth
              margin="normal"
              value={field.academicYear ?? 2025}
              onChange={(e) =>
                handleFieldChange(index, "academicYear", e.target.value)
              }
              required
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal} variant="contained" color="error">
          Cancel
        </Button>
        <Button onClick={handleSaveChanges} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdmissionTestDialog;
