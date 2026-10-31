import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  TextField,
} from "@mui/material";
import { Inventory, RotateRight, AddBusiness } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VehicleDocumentDialog from "./VehicleDocumentDialog";

const appBarHeight = 64; // Example AppBar height

interface VehicleDocument {
  id: number;
  vehicleId: number;
  type: string;
  documentUrl: string;
  fileName?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

const VehicleDocuments = () => {
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<VehicleDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editFields, setEditFields] = useState<Partial<VehicleDocument>>({});

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/vehicle-documents");
      setDocuments(response.data);
      setFilteredDocuments(response.data); // Initialize filteredDocuments with all documents
    } catch (err) {
      console.error("Error fetching vehicle documents:", err);
      setError("Failed to fetch vehicle documents.");
      toast.error("Failed to fetch vehicle documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle search filtering
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = documents.filter(
      (doc) =>
        doc.vehicleId?.toString().toLowerCase().includes(lowerCaseQuery) ||
        doc.type?.toLowerCase().includes(lowerCaseQuery) ||
        doc.fileName?.toLowerCase().includes(lowerCaseQuery) ||
        doc.uploadedBy?.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredDocuments(filtered);
  }, [searchQuery, documents]);

  const handleOpenModal = (item: Partial<VehicleDocument> = {}) => {
    setEditFields(item);
    setOpen(true);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to close the modal? Unsaved changes will be lost."
    );
    if (userConfirmed) {
      setOpen(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpen(false);
    setEditFields({});
    fetchDocuments(); // Refresh documents after save
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: `calc(100vh - ${appBarHeight}px)`,
          bgcolor: "#212121",
        }}
      >
        <CircularProgress size={120} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4, color: "#fff" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `82vw`,
        backgroundColor: "#212121",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
      }}
    >
      <ToastContainer
        position="top-right"
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
          mb: 2,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <ListItemIcon>
          <Inventory sx={{ color: "#fff" }} />
        </ListItemIcon>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search Documents"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: "200px",
            bgcolor: "#333",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              "& fieldset": { borderColor: "#555" },
              "&:hover fieldset": { borderColor: "#777" },
              "&.Mui-focused fieldset": { borderColor: "#00c853" },
            },
            "& .MuiInputBase-input": { padding: "6px 12px" },
          }}
        />
        <ListItemText primary="VEHICLE DOCUMENTS MANAGEMENT PANEL" />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal()}
          startIcon={<AddBusiness />}
        >
          ADD DOCUMENT
        </Button>
        <Button
          onClick={fetchDocuments}
          variant="outlined"
          sx={{
            position: "absolute",
            right: 196,
            color: "#00c853",
            borderColor: "#00c853",
            bgcolor: "#212121",
          }}
        >
          <RotateRight />
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
        {/* Header Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#fff" }}>
            Vehicle ID
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#fff" }}>
            Type
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#fff" }}>
            Document URL
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#fff" }}>
            File Name
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#fff" }}>
            Uploaded By
          </Typography>
          <Box />
        </Box>

        {/* Data Rows */}
        <Box sx={{ maxHeight: "700px", overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredDocuments.map((document) => (
              <ListItem
                key={document.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                  p: 1,
                  bgcolor: "#181818",
                  mb: 1,
                  borderRadius: 1,
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  {document.vehicleId}
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  {document.type}
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <a href={document.documentUrl} target="_blank" rel="noopener noreferrer">
                    {document.documentUrl}
                  </a>
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  {document.fileName || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  {document.uploadedBy || "N/A"}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenModal(document)}
                  >
                    EDIT
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <VehicleDocumentDialog
        open={open}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
      />
    </Box>
  );
};

export default VehicleDocuments;