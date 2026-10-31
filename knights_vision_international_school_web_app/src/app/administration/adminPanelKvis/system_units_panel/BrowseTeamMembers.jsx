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
  LinearProgress,
} from "@mui/material";
import { Group, Add, RotateRight, Delete } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import BrowseTeamMembersDialog from "./dialogs/BrowseTeamMembersDialog";

const drawerWidth = 280;
const appBarHeight = 80;

const BrowseTeamMembers = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});

  const fetchTeamMembers = async () => {
    setApiLoading(true);
    try {
      const response = await axios.get("/api/team-members");
      setTeamMembers(response.data);
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError("Failed to fetch team members.");
      toast.error("Failed to fetch team members.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleCloseModal = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to close the modal? Unsaved changes will be lost."
    );
    if (userConfirmed) {
      setOpenInsertion(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpenInsertion(false);
    fetchTeamMembers();
    setEditFields({});
  };

  const handleInsertionOpenModal = (teamMember = {}) => {
    setEditFields({
      id: teamMember.id || null,
      userId: teamMember.userId || "",
      departmentId: teamMember.departmentId || "",
      role: teamMember.role || "",
    });
    setOpenInsertion(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      setApiLoading(true);
      try {
        await axios.delete(`/api/team-members/${id}`);
        toast.success("Team member deleted successfully!");
        fetchTeamMembers();
      } catch (err) {
        console.error("Delete Error:", err.response?.data || err.message);
        toast.error("Failed to delete team member.");
      } finally {
        setApiLoading(false);
      }
    }
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
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
      <ListItem sx={{ backgroundColor: "#b71c1c", color: "#fff" }}>
        <Group sx={{ mr: 1 }} />
        <ListItemText primary={<Typography variant="h6">Browse Team Members</Typography>} />
        <Button
          onClick={() => handleInsertionOpenModal()}
          variant="contained"
          color="success"
          startIcon={<Add />}
          sx={{ mr: 1 }}
        >
          Add Team Member
        </Button>
        <Button
          onClick={fetchTeamMembers}
          variant="outlined"
          sx={{ color: "#00c853", borderColor: "#00c853" }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
      </ListItem>

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
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 2, fontWeight: "bold", color: "#fff" }}>
            User
          </Typography>
          <Typography variant="body2" sx={{ flex: 2, fontWeight: "bold", color: "#fff" }}>
            Department
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Role
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>

        <Box
          sx={{
            maxHeight: "700px",
            overflowY: "auto",
            bgcolor: "#121212",
            borderRadius: 1,
            paddingBottom: 10,
          }}
        >
          <List>
            {teamMembers.map((teamMember) => (
              <ListItem
                key={teamMember.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  bgcolor: "#181818",
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ flex: 2, color: "#fff" }}>
                  {teamMember.user?.name || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 2, color: "#fff" }}>
                  {teamMember.department?.name || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {teamMember.role}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleInsertionOpenModal(teamMember)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(teamMember.id)}
                    startIcon={<Delete />}
                  >
                    Delete
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <BrowseTeamMembersDialog
        openInsertion={openInsertion}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchTeamMembers={fetchTeamMembers}
      />
    </Box>
  );
};

export default BrowseTeamMembers;