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
import { toast, ToastContainer } from "react-toastify";
import AdmissionTestSelect from "@/components/sure-success-point-school/selectors/AdmissionTestSelect";

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

const TestSubjectSyllabusDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchSyllabi,
}) => {
  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...editFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setEditFields(updatedFields);
  };

  const handleSaveChanges = async () => {
    if (
      !editFields[0].subjectName ||
      !editFields[0].syllabus ||
      !editFields[0].weightage ||
      !editFields[0].testId
    ) {
      toast.error(
        "Please fill all required fields (Subject Name, Syllabus, Weightage, Test).",
      );
      return;
    }

    try {
      const payloads = editFields.map((field) => ({
        subjectName: field.subjectName,
        syllabus: field.syllabus,
        weightage: parseFloat(field.weightage),
        testId: parseInt(field.testId),
        ...(field.id && { id: field.id }),
      }));

      const updates = payloads.filter((p) => p.id);
      const creates = payloads.filter((p) => !p.id);

      for (const update of updates) {
        const { id, ...data } = update;
        await axios.put(`/api/test-subject-syllabi/${id}`, data);
      }

      if (creates.length > 0) {
        await axios.post("/api/test-subject-syllabi", creates);
      }

      toast.success("🎉 Test subject syllabus saved successfully!");
      handleSaveAndCloseModal();
      fetchSyllabi();
      setEditFields([
        {
          subjectName: "",
          syllabus: "",
          weightage: "",
          testId: "",
        },
      ]);
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      toast.error("❌ Error saving test subject syllabus.");
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
        <ListItemText
          sx={{ color: "#fff" }}
          primary="Manage Test Subject Syllabus"
        />
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
              label="Subject Name"
              fullWidth
              margin="normal"
              value={field.subjectName ?? ""}
              onChange={(e) =>
                handleFieldChange(index, "subjectName", e.target.value)
              }
              required
            />
            <TextField
              sx={textFieldStyles}
              label="Syllabus"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={field.syllabus ?? ""}
              onChange={(e) =>
                handleFieldChange(index, "syllabus", e.target.value)
              }
              required
            />
            <TextField
              sx={textFieldStyles}
              label="Weightage"
              type="number"
              fullWidth
              margin="normal"
              value={field.weightage ?? ""}
              onChange={(e) =>
                handleFieldChange(index, "weightage", e.target.value)
              }
              required
            />
            <AdmissionTestSelect
              selectedTest={field.testId}
              setSelectedTest={(value) =>
                handleFieldChange(index, "testId", value)
              }
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

export default TestSubjectSyllabusDialog;
