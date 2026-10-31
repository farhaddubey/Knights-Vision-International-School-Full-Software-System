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
  InputAdornment,
} from "@mui/material";
import { Inventory, RotateRight, AddBusiness, Search as SearchIcon } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BrandsDialog from "./BrandsDialog";
import TextField from "@mui/material/TextField";

const appBarHeight = 64; // Example AppBar height

interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
}

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editFields, setEditFields] = useState<Partial<Brand>>({});

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/brands");
      setBrands(response.data);
      setFilteredBrands(response.data); // Initialize filtered data
    } catch (err) {
      console.error("Error fetching brands:", err);
      setError("Failed to fetch brands.");
      toast.error("Failed to fetch brands.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = brands.filter((brand) =>
      [
        brand.name,
        brand.slug,
        brand.logoUrl,
        brand.description,
      ].some((field) => field?.toLowerCase().includes(query))
    );

    setFilteredBrands(filtered);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenModal = (item: Partial<Brand> = {}) => {
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
    fetchBrands(); // Refresh brands after save
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
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingRight: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
            <Inventory />
          </ListItemIcon>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#fff" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "#333",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#fff", padding: "6px" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#777" },
                "&.Mui-focused fieldset": { borderColor: "#00c853" },
              },
              width: 200,
              mr: 2,
            }}
          />
          <ListItemText primary="BRANDS MANAGEMENT PANEL" />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            onClick={fetchBrands}
            variant="outlined"
            sx={{
              color: "#00c853",
              borderColor: "#00c853",
              bgcolor: "#212121",
              minWidth: 40,
              padding: "6px",
            }}
          >
            <RotateRight />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenModal()}
            startIcon={<AddBusiness />}
          >
            ADD BRAND
          </Button>
        </Box>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
        {/* Header Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1.2,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
            flex:.3
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Logo URL
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Slug
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Description
          </Typography>
          <Box sx={{ flex: 1 }} />
        </Box>

        {/* Data Rows */}
        <Box sx={{ maxHeight: "600px", overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredBrands.map((brand) => (
              <ListItem
                key={brand.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  bgcolor: "#181818",
                  mb: 1,
                  borderRadius: 1,
                }}
              >
    <Box
    component="img"
    src={brand?.logoUrl ?? "/placeholder.png"} // fallback to placeholder if image is null
    alt={"Image"}
    sx={{
      width: 70,
      borderRadius: 1,
      mb: 1,
      pr:.5, 
      flex:1
    }}
  />
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {brand.name}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {brand.slug}
                  
                </Typography>

                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {brand.description || "N/A"}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenModal(brand)}
                  >
                    EDIT
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <BrandsDialog
        open={open}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
      />
    </Box>
  );
};

export default Brands;