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
import { History, RotateRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";

const drawerWidth = 280;
const appBarHeight = 80;

const BrowseAuditLogs = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchAuditLogs = async () => {
    setApiLoading(true);
    try {
      const response = await axios.get("/api/audit-logs");
      setAuditLogs(response.data);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Failed to fetch audit logs.");
      toast.error("Failed to fetch audit logs.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

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
        <History sx={{ mr: 1 }} />
        <ListItemText primary={<Typography variant="h6">Browse Audit Logs</Typography>} />
        <Button
          onClick={fetchAuditLogs}
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
            Action
          </Typography>
          <Typography variant="body2" sx={{ flex: 2, fontWeight: "bold", color: "#fff" }}>
            Entity
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Timestamp
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
            {auditLogs.map((log) => (
              <ListItem
                key={log.id}
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
                  {log.user?.name || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 2, color: "#fff" }}>
                  {log.action}
                </Typography>
                <Typography variant="body2" sx={{ flex: 2, color: "#fff" }}>
                  {log.entityType} ({log.entityId})
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {new Date(log.createdAt).toLocaleString()}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default BrowseAuditLogs;