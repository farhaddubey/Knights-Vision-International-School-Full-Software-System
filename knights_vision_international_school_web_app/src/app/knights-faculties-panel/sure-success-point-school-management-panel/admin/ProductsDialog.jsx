import { useEffect, useState } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, RotateRight, Close } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import ReusableMeasureUnitSelect from "../reuse_components/UnitSelect";
import textDisabledFieldStyles from "../../../mui_styles/TextDisableFieldStyles";
import textFieldStyles from "../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64;

const ProductsDialog = ({ openInsertion, handleCloseModal, handleSaveAndCloseModal, editFields, setEditFields, fetchProducts }) => {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // Set measure unit
    if (editFields?.measure_unit) {
      setSelectedUnit(editFields.measure_unit);
    }
    if (!openInsertion) {
      setSelectedUnit("");
    }

    // Fetch product departments
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("/api/product-departments", {
          headers: { Authorization: `Bearer ${Cookies.get("faculties_token")}` },
        });
        setDepartments(response.data);
      } catch (err) {
        console.error("Error fetching departments:", err);
        toast.error("Failed to fetch product departments.");
      }
    };

    // Fetch product categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/product-categories", {
          headers: { Authorization: `Bearer ${Cookies.get("faculties_token")}` },
        });
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error("Failed to fetch product categories.");
      }
    };

    fetchDepartments();
    fetchCategories();
  }, [openInsertion, editFields]);

  const handleSaveChanges = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    const isUpdating = !!editFields?.id;
    const apiUrl = isUpdating ? `/api/products/${editFields.id}` : `/api/products`;

    const payload = {
      product_id: editFields?.product_id || null,
      product_name: editFields?.product_name || null,
      product_model: editFields?.product_model || null,
      product_price: parseFloat(editFields?.product_price) || null,
      img_url: editFields?.img_url || null,
      measure_unit: selectedUnit || null,
      unit_weight: parseFloat(editFields?.unit_weight) || null,
      unit_cost: parseFloat(editFields?.unit_cost) || null,
      package_unit: editFields?.package_unit || null,
      package_unit_weight: parseFloat(editFields?.package_unit_weight) || null,
      package_unit_cost: parseFloat(editFields?.package_unit_cost) || null,
      item_qty_in_package_unit: parseFloat(editFields?.item_qty_in_package_unit) || null,
      selling_price_per_package_unit: parseFloat(editFields?.selling_price_per_package_unit) || null,
      target_unit_qty: parseFloat(editFields?.target_unit_qty) || null,
      target_cross_bonus_per_qty: parseFloat(editFields?.target_cross_bonus_per_qty) || null,
      total_target_cross_bonus: parseFloat(editFields?.total_target_cross_bonus) || null,
      product_department_id: parseInt(editFields?.product_department_id) || null,
      product_category_id: parseInt(editFields?.product_category_id) || null,
      product_brand_name: editFields?.product_brand_name || null,
      product_customer_mrp_price: parseFloat(editFields?.product_customer_mrp_price) || null,
      product_discount_rate: parseFloat(editFields?.product_discount_rate) || null,
      product_dis_price_sroom_e_sale: parseFloat(editFields?.product_dis_price_sroom_e_sale) || null,
    };

    try {
      const response = isUpdating
        ? await axios.put(apiUrl, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.post(apiUrl, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

      if (response.status === 200 || response.status === 201) {
        toast.success(isUpdating ? "✅ Product Updated!" : "🎉 New Product Added!");
        handleSaveAndCloseModal();
        fetchProducts();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      toast.error(isUpdating ? "❌ Error updating product." : "❌ Error adding new product.");
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
      fullScreen
    >
      <ListItemButton
        sx={{
          backgroundColor: "#263238",
          color: "#fff",
          "&:hover": { backgroundColor: "#263238" },
        }}
      >
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary="Insert Product" />
        <Button
          onClick={fetchProducts}
          variant="outlined"
          sx={{ position: "absolute", right: 90, top: 8, color: "#00c853", borderColor: "#00c853" }}
        >
          <RotateRight />
        </Button>
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          backgroundColor: "#000",
          color: "#fff",
          overflow: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                height: "100%",
                backgroundColor: "#000",
                color: "#fff",
                overflowY: "auto",
              }}
            >
              <Box sx={{ flex: 1, pr: 1, maxHeight: "80vh" }}>
                <TextField
                  label="Product Name"
                  name="product_name"
                  fullWidth
                  margin="normal"
                  value={editFields?.product_name ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, product_name: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Product ID"
                  name="product_id"
                  fullWidth
                  margin="normal"
                  value={editFields?.product_id ?? "TDIL_"}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, product_id: e.target.value }))}
                  sx={textDisabledFieldStyles}
                />
                <TextField
                  label="Product Model"
                  name="product_model"
                  fullWidth
                  margin="normal"
                  value={editFields?.product_model ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, product_model: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Product Price"
                  name="product_price"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.product_price ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, product_price: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Image URL"
                  name="img_url"
                  fullWidth
                  margin="normal"
                  value={editFields?.img_url ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, img_url: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Brand Name"
                  name="product_brand_name"
                  fullWidth
                  margin="normal"
                  value={editFields?.product_brand_name ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, product_brand_name: e.target.value }))}
                  sx={textFieldStyles}
                />
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={editFields?.product_department_id ?? ""}
                    onChange={(e) => setEditFields((prev) => ({ ...prev, product_department_id: e.target.value }))}
                    label="Department"
                  >
                    <MenuItem value="">Select Department</MenuItem>
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editFields?.product_category_id ?? ""}
                    onChange={(e) => setEditFields((prev) => ({ ...prev, product_category_id: e.target.value }))}
                    label="Category"
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <ReusableMeasureUnitSelect selectedUnit={selectedUnit} setSelectedUnit={setSelectedUnit} />
                <TextField
                  label="Unit Weight"
                  name="unit_weight"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.unit_weight ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, unit_weight: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Unit Cost"
                  name="unit_cost"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.unit_cost ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, unit_cost: e.target.value }))}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ flex: 1, pl: 1, maxHeight: "80vh" }}>
                <TextField
                  label="Package Unit"
                  name="package_unit"
                  fullWidth
                  margin="normal"
                  value={editFields?.package_unit ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, package_unit: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Package Unit Weight"
                  name="package_unit_weight"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.product_package_unit_weight ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, package_unit_weight: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Package Unit Cost"
                  name="package_unit_cost"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.package_unit_cost ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, package_unit_cost: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Items in Package Unit"
                  name="item_qty_in_package_unit"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.item_qty_in_package_unit ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, item_qty_in_package_unit: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Selling Price (Per Package)"
                  name="selling_price_per_package_unit"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.selling_price_per_package_unit ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, selling_price_per_package_unit: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Customer MRP Price"
                  name="product_customer_mrp_price"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.product_customer_mrp_price ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, product_customer_mrp_price: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Discount Rate (%)"
                  name="product_discount_rate"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.product_discount_rate ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, product_discount_rate: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Discounted Price (Showroom/E-Sale)"
                  name="product_dis_price_sroom_e_sale"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.product_dis_price_sroom_e_sale ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, product_dis_price_sroom_e_sale: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Target Unit Quantity"
                  name="target_unit_qty"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.target_unit_qty ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, target_unit_qty: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Target Cross Bonus Per Quantity"
                  name="target_cross_bonus_per_qty"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.target_cross_bonus_per_qty ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, target_cross_bonus_per_qty: e.target.value }))}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Total Target Cross Bonus"
                  name="total_target_cross_bonus"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editFields?.total_target_cross_bonus ?? ""}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, total_target_cross_bonus: e.target.value }))}
                  sx={textFieldStyles}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} variant="contained" color="error">
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ProductsDialog;