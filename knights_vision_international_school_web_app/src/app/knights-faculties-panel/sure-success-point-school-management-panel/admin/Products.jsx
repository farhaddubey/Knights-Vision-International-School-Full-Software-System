import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Inventory, Edit, AddBusiness, RotateRight, Search } from "@mui/icons-material";
import { toast } from "react-toastify";
import ProductsDialog from "./ProductsDialog";

const drawerWidth = 280;
const appBarHeight = 64;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchProducts = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formattedProducts = response.data.map((data) => ({
        id: data.id,
        product_id: data.product_id,
        product_name: data.product_name,
        product_model: data.product_model,
        product_price: parseFloat(data.product_price ?? 0),
        img_url: data.img_url,
        measure_unit: data.measure_unit,
        unit_weight: parseFloat(data.unit_weight ?? 0),
        unit_cost: parseFloat(data.unit_cost ?? 0),
        package_unit: data.package_unit,
        package_unit_weight: parseFloat(data.package_unit_weight ?? 0),
        package_unit_cost: parseFloat(data.package_unit_cost ?? 0),
        item_qty_in_package_unit: parseFloat(data.item_qty_in_package_unit ?? 0),
        selling_price_per_package_unit: parseFloat(data.selling_price_per_package_unit ?? 0),
        target_unit_qty: parseFloat(data.target_unit_qty ?? 0),
        target_cross_bonus_per_qty: parseFloat(data.target_cross_bonus_per_qty ?? 0),
        total_target_cross_bonus: parseFloat(data.total_target_cross_bonus ?? 0),
        product_department: data.product_department,
        product_category_id: data.product_category_id,
        product_brand_name: data.product_brand_name,
        product_customer_mrp_price: parseFloat(data.product_customer_mrp_price ?? 0),
        product_discount_rate: parseFloat(data.product_discount_rate ?? 0),
        product_dis_price_sroom_e_sale: parseFloat(data.product_dis_price_sroom_e_sale ?? 0),
        created_at: data.created_at,
        updated_at: data.updated_at,
        published_at: data.published_at,
        created_by_id: data.created_by_id,
        updated_by_id: data.updated_by_id,
      }));
      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = products.filter(
      (product) =>
        product.product_name?.toLowerCase().includes(query) ||
        product.product_model?.toLowerCase().includes(query) ||
        product.product_brand_name?.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const handleOpenModal = (item = {}) => {
    setIsEditing(!!item?.id);
    setEditFields(item);
    setOpen(true);
  };

  const handleCloseModal = () => {
    if (window.confirm("Are you sure you want to close the modal, unsaved?")) {
      setOpen(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpen(false);
    setEditFields({});
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
    <Box sx={{ position: "fixed", minWidth: `calc(100vw - ${drawerWidth}px)`, backgroundColor: "#212121", height: `calc(100vh - ${appBarHeight}px)`, color: "#fff"}}>
      <ListItemButton
        sx={{
          backgroundColor: "#181818",
          color: "#fff",
          "&:hover": { backgroundColor: "#181818" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ fontSize: 30, color: 'orange', fontWeight: 'bold' }}>
          📦📦📦
        </ListItemIcon>
        <ListItemText primary="Products Control Panel" />
        <TextField
          placeholder="Search by Product, Model, or Brand"
          value={searchQuery}
          onChange={handleSearch}
          size="small"
          sx={{
            width: "250px",
            backgroundColor: "#333",
            borderRadius: "4px",
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
          }}
          InputProps={{
            startAdornment: <Search sx={{ color: "#fff", mr: 1 }} />,
          }}
        />
        <Button
          onClick={fetchProducts}
          variant="outlined"
          sx={{ color: "#00c853", borderColor: "#00c853" }}
        >
          <RotateRight />
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleOpenModal({})}>
          <AddBusiness /> Add New Product
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, overflow: "hidden" }}>
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
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Image
          </Typography>
          <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>
            Product Name<br />Model
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Brand<br />Department
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Unit & Weight
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Unit Cost
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Package Unit
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Pkg Weight
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Pkg Cost
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            MRP Price
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Discounted Price
          </Typography>
          <Box sx={{ flex: 0.6 }}></Box>
        </Box>

        <Box sx={{ maxHeight: "700px", overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredProducts.map((data) => (
              <ListItem
                key={data.id}
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
                <Box
                  component="img"
                  src={data?.img_url ?? "/placeholder.png"}
                  alt={data?.product_name ?? "Product Image"}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 1,
                    flex: 0.8,
                    paddingRight:.5,
                  }}
                />
                <Typography variant="body2" sx={{ flex: 1.2, color: "#fff" }}>
                  {data.product_name ?? "N/A"}
                  <br />
                  <Typography sx={{ color: "#ffc107" }}>{data.product_model ?? "N/A"}</Typography>
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {data.product_brand_name ?? "N/A"}
                  <br />
                  <Typography sx={{ color: "#ffc107" }}>{data.product_department ?? "N/A"}</Typography>
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {data.unit_weight?.toFixed(2) ?? "N/A"} {data.measure_unit ?? "N/A"}
                </Typography>
                <Box sx={{ flex: 0.8 }}>
                  <Button color="warning" sx={{ color: "#ffeb3b" }} variant="outlined">
                    ₹{data.unit_cost?.toFixed(2) ?? "N/A"}
                  </Button>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Button color="primary" size="small">
                    {data.package_unit ?? "N/A"}
                  </Button>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Button color="warning" sx={{ color: "#1de9b6" }} variant="outlined">
                    {data.package_unit_weight?.toFixed(2) ?? "N/A"} {data.measure_unit ?? "N/A"}
                  </Button>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Button color="warning" sx={{ color: "#00e5ff" }} variant="outlined">
                    ₹{data.package_unit_cost?.toFixed(2) ?? "N/A"}
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  ₹{data.product_customer_mrp_price?.toFixed(2) ?? "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  ₹{data.product_dis_price_sroom_e_sale?.toFixed(2) ?? "N/A"}
                </Typography>
                <Box sx={{ flex: 0.6 }}>
                  <Button variant="outlined" color="primary" onClick={() => handleOpenModal(data)}>
                    <Edit /> Edit
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <ProductsDialog
        openInsertion={open}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchProducts={fetchProducts}
      />
    </Box>
  );
};

export default Products;