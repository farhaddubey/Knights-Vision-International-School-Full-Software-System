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
import { Public, Add, RotateRight, Delete } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import BrowseCountriesDialog from "./dialogs/BrowseCountriesDialog";

const drawerWidth = 280;
const appBarHeight = 64;

const BrowseCountries = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState([]);
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});

  const fetchCountries = async () => {
    setApiLoading(true);
    try {
      const response = await axios.get("/api/countries");
      setCountries(response.data);
    } catch (err) {
      console.error("Error fetching countries:", err);
      setError("Failed to fetch countries.");
      toast.error("Failed to fetch countries.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
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
    fetchCountries();
    setEditFields({});
  };

  const handleInsertionOpenModal = (country = {}) => {
    setEditFields({
      id: country.id ?? null,
      name: country.name ?? "",
      code: country.code ?? "",
      currencyId: country.currencyId ?? "",
      timezoneId: country.timezoneId ?? "",
    });
    setOpenInsertion(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this country?")) {
      setApiLoading(true);
      try {
        await axios.delete(`/api/countries/${id}`);
        toast.success("Country deleted successfully!");
        fetchCountries();
      } catch (err) {
        console.error("Delete Error:", err);
        toast.error("Failed to delete country.");
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
        <Public sx={{ mr: 1 }} />
        <ListItemText primary="Browse Countries" />
        <Button
          onClick={() => handleInsertionOpenModal()}
          variant="contained"
          color="primary"
          startIcon={<Add />}
          sx={{ mr: 1 }}
        >
          Add Country
        </Button>
        <Button
          onClick={fetchCountries}
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
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Code
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Currency
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
            {countries.map((country) => (
              <ListItem
                key={country.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  bgcolor: "#181818",
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {country.name}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {country.code}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {country.currency?.name ?? "N/A"}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleInsertionOpenModal(country)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(country.id)}
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

      <BrowseCountriesDialog
        openInsertion={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchCountries={fetchCountries}
      />
    </Box>
  );
};

export default BrowseCountries;