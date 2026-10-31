import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import { AddAlert, EmojiEmotions, RotateRight } from "@mui/icons-material";
import textDisabledFieldStyles from "../../../mui_styles/TextDisableFieldStyles";
import countryPhoneCodes from "../reuse_components/CountryPhoneCode";
import ReusableFactorySelect from "../reuse_components/FactorySelect";
import InventorySelect from "../reuse_components/InventorySelect";
import MachineSelect from "../reuse_components/MachineSelect";
import ProductSelect from "../reuse_components/ProductSelect";
import SellsCenterSelect from "../reuse_components/SellsCenterSelect";
import FactoryInventory from "../reuse_components/FactoryInventoriesSelect";
import ProductionMaterial from "../reuse_components/ProductionMaterialSelect";
import WorkTypes from "../reuse_components/WorkTypeSelect";
import DepartmentSelect from "../reuse_components/DepartmentSelect";
import RoleSelect from "../reuse_components/RoleSelect";
import BrandSelect from "../reuse_components/BrandsSelect";

const salarySystems = ["DayWise", "Monthly"];
const languages = ["English", "Spanish", "French", "German", "Hindi", "Other"];

const AddEmployeeSystem = () => {
  // Initial form state
  const initialFormData = {
    regularEntryTime: "",
    regularLeaveTime: "",
    regularBreakTime: "",
    aggrementWorkHoursPerDay: "",
    username: "",
    email: "",
    password: "ilovetdil",
    reset_password_token: "",
    registration_token: "",
    is_active: false,
    blocked: false,
    prefered_language: "",
    created_by_id: "",
    updated_by_id: "",
    address: "",
    clg_name: "",
    highest_degree: "",
    highest_marks_in_degree: "",
    village: "",
    block: "",
    municiple: "",
    police_station: "",
    district: "",
    state: "",
    country: "",
    pincode: "",
    phone_prefix: "",
    phone1: "",
    phone2: "",
    phone3: "",
    fatherName: "",
    motherName: "",
    uid_aadhar: "",
    roleId: "",
    role: "",
    department: "",
    confirmation_token: "",
    confirmed: false,
    rfid_card_no: "",
    biometric_id: "",
    base_salary: "",
    extra_per_half_hour_salary: "",
    per_day_bonus_salary: "",
    per_day_salary: "",
    salary_system: "",
    published_at: "",
    products_inventory_id: "",
  };

  // State Management
  const [formData, setFormData] = useState(initialFormData);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSalary, setSelectedSalary] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedFactory, setSelectedFactory] = useState("");
  const [selectedInventory, setSelectedInventory] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSellsCenter, setSelectedSellsCenter] = useState("");
  const [selectedFactoryInventory, setSelectedFactoryInventory] = useState("");
  const [selectedWorkTypes, setSelectedWorkTypes] = useState("");
  const [selectedProductionMaterial, setSelectedProductionMaterial] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // Handle Text Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle Time Input Change and Calculate Work Hours
  const handleTimeChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    const { regularEntryTime, regularLeaveTime, regularBreakTime } = updatedData;

    if (regularEntryTime && regularLeaveTime) {
      const [startHour, startMinute] = regularEntryTime.split(":").map(Number);
      const [endHour, endMinute] = regularLeaveTime.split(":").map(Number);
      const breakMins = parseInt(regularBreakTime || "0", 10);

      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;

      let workMinutes = endTotal - startTotal - breakMins;
      workMinutes = Math.max(0, workMinutes); // Never negative

      const workHours = (workMinutes / 60).toFixed(2);
      updatedData.aggrementWorkHoursPerDay = workHours;
    }

    setFormData(updatedData);
  };

  // Validate Form Data
  const validateForm = () => {
    const errors = [];

    if (!formData.email) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Invalid email format");
    }

    if (formData.base_salary && isNaN(parseFloat(formData.base_salary))) {
      errors.push("Base Salary must be a valid number");
    }
    if (formData.extra_per_half_hour_salary && isNaN(parseFloat(formData.extra_per_half_hour_salary))) {
      errors.push("Extra Salary Per Half Hour must be a valid number");
    }
    if (formData.per_day_bonus_salary && isNaN(parseFloat(formData.per_day_bonus_salary))) {
      errors.push("Per Day Bonus Salary must be a valid number");
    }
    if (formData.per_day_salary && isNaN(parseFloat(formData.per_day_salary))) {
      errors.push("Per Day Salary must be a valid number");
    }

    if (formData.regularEntryTime && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.regularEntryTime)) {
      errors.push("Regular Entry Time must be in HH:mm format");
    }
    if (formData.regularLeaveTime && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.regularLeaveTime)) {
      errors.push("Regular Leave Time must be in HH:mm format");
    }

    if (formData.prefered_language && formData.prefered_language.length > 255) {
      errors.push("Preferred language must be 255 characters or less");
    }
    if (formData.confirmation_token && formData.confirmation_token.length > 255) {
      errors.push("Confirmation token must be 255 characters or less");
    }

    if (formData.products_inventory_id && isNaN(parseInt(formData.products_inventory_id))) {
      errors.push("Products Inventory ID must be a valid integer");
    }

    if (formData.published_at && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(formData.published_at)) {
      errors.push("Published At must be in ISO-8601 format (e.g., 2025-05-12T12:00:00.000Z)");
    }

    return errors;
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("Authentication token is missing!");
      return;
    }

    // Validate form
    const errors = validateForm();
    if (errors.length) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    try {
      // Format time to ISO-8601 DateTime
      const formatTime = (time) => (time ? new Date(`1970-01-01T${time}:00Z`).toISOString() : null);

      const dataToSend = {
        factory_id: selectedFactory ? Number(selectedFactory) : null,
        product_id: selectedProduct ? Number(selectedProduct) : null,
        sales_id: selectedSellsCenter ? Number(selectedSellsCenter) : null,
        inventory_id: selectedInventory ? Number(selectedInventory) : null,
        machine_id: selectedMachine ? Number(selectedMachine) : null,
        produced_material_id: selectedProductionMaterial ? Number(selectedProductionMaterial) : null,
        work_type_id: selectedWorkTypes ? Number(selectedWorkTypes) : null,
        brandId: selectedBrand ? Number(selectedBrand) : null,
        products_inventory_id: formData.products_inventory_id ? parseInt(formData.products_inventory_id) : null,
        ...formData,
        role: selectedRole || null,
        department: selectedDepartment || null,
        salary_system: selectedSalary || null,
        phone_prefix: selectedCode || null,
        regular_entry_time: formatTime(formData.regularEntryTime),
        regular_leave_time: formatTime(formData.regularLeaveTime),
        base_salary: formData.base_salary ? parseFloat(formData.base_salary) : null,
        extra_per_half_hour_salary: formData.extra_per_half_hour_salary
          ? parseFloat(formData.extra_per_half_hour_salary)
          : null,
        per_day_bonus_salary: formData.per_day_bonus_salary ? parseFloat(formData.per_day_bonus_salary) : null,
        per_day_salary: formData.per_day_salary ? parseFloat(formData.per_day_salary) : null,
        aggrement_work_hours_per_day: formData.aggrement_work_hours_per_day
          ? parseFloat(formData.aggrement_work_hours_per_day)
          : null,
        created_by_id: formData.created_by_id ? parseInt(formData.created_by_id) : null,
        updated_by_id: formData.updated_by_id ? parseInt(formData.updated_by_id) : null,
        phone1: formData.phone1 || null,
        phone2: formData.phone2 || null,
        phone3: formData.phone3 || null,
        uid_aadhar: formData.uid_aadhar || null,
      };

      console.log("Data to Send:", dataToSend);

      const response = await axios.post("/api/users", dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("User created successfully");

      // Reset all form states
      setFormData(initialFormData);
      setSelectedRole("");
      setSelectedDepartment("");
      setSelectedSalary("");
      setSelectedCode("");
      setSelectedFactory("");
      setSelectedInventory("");
      setSelectedMachine("");
      setSelectedProduct("");
      setSelectedSellsCenter("");
      setSelectedFactoryInventory("");
      setSelectedWorkTypes("");
      setSelectedProductionMaterial("");
      setSelectedBrand("");
    } catch (error) {
      console.error("Error Creating User:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to create user.");
    }
  };

  return (
    <Box>
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
      {/* Assign Sells Button */}
      <ListItemButton sx={{ backgroundColor: "#1a237e", color: "#fff", "&:hover": { backgroundColor: "#1a237e" } }}>
        <ListItemIcon>
          <EmojiEmotions sx={{ color: "#fff" }} />
        </ListItemIcon>
        <ListItemText sx={{ color: "#fff" }} primary="Add Employee" />
        <Button variant="contained" color="success">
          <AddAlert /> Employee Recruitment Panel
        </Button>
      </ListItemButton>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          backgroundColor: "#000",
          color: "#fff",
          p: 1,
          overflowY: "auto",
        }}
      >
        {/* Left Side */}
        <Box sx={{ flex: 1, pr: 1, maxHeight: "80vh" }}>
          <TextField
            sx={textDisabledFieldStyles}
            label="Full Name"
            name="username"
            value={formData.username}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Email"
            name="email"
            value={formData.email}
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Aadhar UID"
            name="uid_aadhar"
            value={formData.uid_aadhar}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Father Name"
            name="fatherName"
            value={formData.fatherName}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Mother Name"
            name="motherName"
            value={formData.motherName}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Biometric ID"
            name="biometric_id"
            value={formData.biometric_id}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <FormControl sx={textDisabledFieldStyles} fullWidth margin="normal">
            <InputLabel>Phone No. Extension</InputLabel>
            <Select value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)}>
              {countryPhoneCodes.map((country) => (
                <MenuItem key={country.code} value={country.phone}>
                  {country.label} ({country.phone})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            sx={textDisabledFieldStyles}
            label="Phone Number 1"
            name="phone1"
            type="number"
            value={formData.phone1}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Phone Number 2"
            name="phone2"
            type="number"
            value={formData.phone2}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Phone Number 3"
            name="phone3"
            type="number"
            value={formData.phone3}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Address"
            name="address"
            value={formData.address}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="College Name"
            name="clg_name"
            value={formData.clg_name}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Highest Degree"
            name="highest_degree"
            value={formData.highest_degree}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Highest Marks in Degree"
            name="highest_marks_in_degree"
            type="number"
            value={formData.highest_marks_in_degree}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="District"
            name="district"
            value={formData.district}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="State"
            name="state"
            value={formData.state}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Country"
            name="country"
            value={formData.country}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Pincode"
            name="pincode"
            type="number"
            value={formData.pincode}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Approved by (User ID)"
            name="created_by_id"
            type="number"
            value={formData.created_by_id}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Updated by (User ID)"
            name="updated_by_id"
            type="number"
            value={formData.updated_by_id}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Confirmation Token"
            name="confirmation_token"
            value={formData.confirmation_token}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <FormControl sx={textDisabledFieldStyles} fullWidth margin="normal">
            <InputLabel>Preferred Language</InputLabel>
            <Select
              name="prefered_language"
              value={formData.prefered_language}
              onChange={handleChange}
            >
              {languages.map((lang) => (
                <MenuItem key={lang} value={lang}>{lang}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Is Active"
            sx={{ mt: 1, color: "#fff" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="confirmed"
                checked={formData.confirmed}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Email Confirmed"
            sx={{ mt: 1, color: "#fff" }}
          />
        </Box>

        {/* Right Side */}
        <Box sx={{ flex: 1, pl: 1, maxHeight: "80vh" }}>
          <TextField
            label="Regular Entry Time"
            name="regularEntryTime"
            type="time"
            value={formData.regularEntryTime}
            onChange={handleTimeChange}
            fullWidth
            margin="normal"
            sx={textDisabledFieldStyles}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Regular Leave Time"
            name="regularLeaveTime"
            type="time"
            value={formData.regularLeaveTime}
            onChange={handleTimeChange}
            fullWidth
            margin="normal"
            sx={textDisabledFieldStyles}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Break Time (in minutes)"
            name="regularBreakTime"
            type="number"
            value={formData.regularBreakTime}
            onChange={handleTimeChange}
            fullWidth
            margin="normal"
            sx={textDisabledFieldStyles}
          />
          <TextField
            label="Work Hours Per Day"
            name="aggrementWorkHoursPerDay"
            type="number"
            value={formData.aggrementWorkHoursPerDay}
            disabled
            fullWidth
            margin="normal"
            sx={textDisabledFieldStyles}
          />
          <FormControl sx={textDisabledFieldStyles} fullWidth margin="normal">
            <InputLabel>Salary System</InputLabel>
            <Select value={selectedSalary} onChange={(e) => setSelectedSalary(e.target.value)}>
              {salarySystems.map((salary) => (
                <MenuItem key={salary} value={salary}>{salary}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            sx={textDisabledFieldStyles}
            label="Monthly Base Salary"
            name="base_salary"
            type="number"
            value={formData.base_salary}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Extra Salary Per Half Hour"
            name="extra_per_half_hour_salary"
            type="number"
            value={formData.extra_per_half_hour_salary}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Per Day Bonus Salary"
            name="per_day_bonus_salary"
            type="number"
            value={formData.per_day_bonus_salary}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Per Day Salary"
            name="per_day_salary"
            type="number"
            value={formData.per_day_salary}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="RFID Card Number"
            name="rfid_card_no"
            type="text"
            value={formData.rfid_card_no}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Published At (ISO-8601)"
            name="published_at"
            type="datetime-local"
            value={formData.published_at}
            onChange={(e) => {
              const isoDate = e.target.value ? new Date(e.target.value).toISOString() : "";
              setFormData({ ...formData, published_at: isoDate });
            }}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Products Inventory ID"
            name="products_inventory_id"
            type="number"
            value={formData.products_inventory_id}
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <BrandSelect selectedFactory={selectedBrand} setSelectedFactory={setSelectedBrand} />
          <DepartmentSelect
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            setSelectedRole={setSelectedRole}
          />
          <RoleSelect
            selectedDepartment={selectedDepartment}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
          <ReusableFactorySelect
            value={selectedFactory}
            selectedFactory={selectedFactory}
            setSelectedFactory={setSelectedFactory}
          />
          <InventorySelect
            value={selectedInventory}
            selectedFactory={selectedInventory}
            setSelectedFactory={setSelectedInventory}
          />
          <MachineSelect
            value={selectedMachine}
            selectedFactory={selectedMachine}
            setSelectedFactory={setSelectedMachine}
          />
          <ProductSelect
            value={selectedProduct}
            selectedFactory={selectedProduct}
            setSelectedFactory={setSelectedProduct}
          />
          <SellsCenterSelect
            value={selectedSellsCenter}
            selectedFactory={selectedSellsCenter}
            setSelectedFactory={setSelectedSellsCenter}
          />
          <FactoryInventory
            value={selectedFactoryInventory}
            selectedFactory={selectedFactoryInventory}
            setSelectedFactory={setSelectedFactoryInventory}
          />
          <WorkTypes
            value={selectedWorkTypes}
            selectedFactory={selectedWorkTypes}
            setSelectedFactory={setSelectedWorkTypes}
          />
          <ProductionMaterial
            value={selectedProductionMaterial}
            selectedFactory={selectedProductionMaterial}
            setSelectedFactory={setSelectedProductionMaterial}
          />
        </Box>
      </Box>

      {/* Submit Button */}
      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
        Create User
      </Button>
    </Box>
  );
};

export default AddEmployeeSystem;