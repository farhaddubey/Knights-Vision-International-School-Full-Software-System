import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { AddAlert, EmojiEmotions } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
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

// Constants
const salarySystems = ["DayWise", "Monthly"];
const languages = ["English", "Spanish", "French", "German", "Hindi", "Other"];

// Dark theme styles
const darkFieldStyles = {
  "& .MuiInputBase-root": {
    backgroundColor: "#212121",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2c2c2c",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#aaa",
    "&.Mui-focused": {
      color: "#00c853",
    },
    "&.Mui-error": {
      color: "#f44336",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#555",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#777",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#00c853",
  },
  "& .Mui-error .MuiOutlinedInput-notchedOutline": {
    borderColor: "#f44336",
  },
  "& .MuiInputBase-input": {
    color: "#fff",
  },
  "& .MuiFormHelperText-root": {
    color: "#aaa",
    "&.Mui-error": {
      color: "#f44336",
    },
  },
};

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
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper Functions
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear validation error for the field
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

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

      if (!isNaN(startHour) && !isNaN(endHour)) {
        const startTotal = startHour * 60 + startMinute;
        const endTotal = endHour * 60 + endMinute;

        let workMinutes = endTotal - startTotal - breakMins;
        workMinutes = Math.max(0, workMinutes); // Never negative

        updatedData.aggrementWorkHoursPerDay = (workMinutes / 60).toFixed(2);
      }
    }

    setFormData(updatedData);
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const resetForm = () => {
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
    setValidationErrors({});
    toast.info("Form reset successfully.");
  };

  // Validation Logic
  const validateForm = () => {
    const errors = {};
    const toastErrors = [];

    // Username
    if (!formData.username.trim()) {
      errors.username = "Full Name is required";
      toastErrors.push("Full Name is required");
    }

    // Email
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      toastErrors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
      toastErrors.push("Invalid email format");
    }

    // Aadhar UID
    if (!formData.uid_aadhar.trim()) {
      errors.uid_aadhar = "Aadhar UID is required";
      toastErrors.push("Aadhar UID is required");
    } else if (!/^\d{12}$/.test(formData.uid_aadhar)) {
      errors.uid_aadhar = "Aadhar UID must be a 12-digit number";
      toastErrors.push("Aadhar UID must be a 12-digit number");
    }

    // Phone Prefix and Phone1
    if (formData.phone1 && !selectedCode) {
      errors.phone_prefix = "Phone prefix is required if phone number is provided";
      errors.phone1 = "Phone prefix is required";
      toastErrors.push("Phone prefix is required if phone number is provided");
    }
    if (selectedCode && !formData.phone1) {
      errors.phone1 = "Phone number is required if prefix is selected";
      toastErrors.push("Phone number is required if prefix is selected");
    }

    // Regular Entry and Leave Time
    if (!formData.regularEntryTime) {
      errors.regularEntryTime = "Regular Entry Time is required";
      toastErrors.push("Regular Entry Time is required");
    } else if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.regularEntryTime)) {
      errors.regularEntryTime = "Regular Entry Time must be in HH:mm format";
      toastErrors.push("Regular Entry Time must be in HH:mm format");
    }

    if (!formData.regularLeaveTime) {
      errors.regularLeaveTime = "Regular Leave Time is required";
      toastErrors.push("Regular Leave Time is required");
    } else if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.regularLeaveTime)) {
      errors.regularLeaveTime = "Regular Leave Time must be in HH:mm format";
      toastErrors.push("Regular Leave Time must be in HH:mm format");
    }

    // Salary System
    if (!selectedSalary) {
      errors.salary_system = "Salary System is required";
      toastErrors.push("Salary System is required");
    }

    // Salary Fields
    if (selectedSalary === "DayWise" && !formData.per_day_salary) {
      errors.per_day_salary = "Per Day Salary is required for DayWise system";
      toastErrors.push("Per Day Salary is required for DayWise system");
    } else if (formData.per_day_salary && isNaN(parseFloat(formData.per_day_salary))) {
      errors.per_day_salary = "Per Day Salary must be a valid number";
      toastErrors.push("Per Day Salary must be a valid number");
    }

    if (selectedSalary === "Monthly" && !formData.base_salary) {
      errors.base_salary = "Monthly Base Salary is required for Monthly system";
      toastErrors.push("Monthly Base Salary is required for Monthly system");
    } else if (formData.base_salary && isNaN(parseFloat(formData.base_salary))) {
      errors.base_salary = "Monthly Base Salary must be a valid number";
      toastErrors.push("Monthly Base Salary must be a valid number");
    }

    // Role and Department
    if (!selectedRole) {
      errors.role = "Role is required";
      toastErrors.push("Role is required");
    }
    if (!selectedDepartment) {
      errors.department = "Department is required";
      toastErrors.push("Department is required");
    }

    // Factory ID
    if (!selectedFactory) {
      errors.factory_id = "Factory is required";
      toastErrors.push("Factory is required");
    }

    // Additional validations
    if (formData.extra_per_half_hour_salary && isNaN(parseFloat(formData.extra_per_half_hour_salary))) {
      errors.extra_per_half_hour_salary = "Extra Salary Per Half Hour must be a valid number";
      toastErrors.push("Extra Salary Per Half Hour must be a valid number");
    }
    if (formData.per_day_bonus_salary && isNaN(parseFloat(formData.per_day_bonus_salary))) {
      errors.per_day_bonus_salary = "Per Day Bonus Salary must be a valid number";
      toastErrors.push("Per Day Bonus Salary must be a valid number");
    }
    if (formData.prefered_language && formData.prefered_language.length > 255) {
      errors.prefered_language = "Preferred language must be 255 characters or less";
      toastErrors.push("Preferred language must be 255 characters or less");
    }
    if (formData.confirmation_token && formData.confirmation_token.length > 255) {
      errors.confirmation_token = "Confirmation token must be 255 characters or less";
      toastErrors.push("Confirmation token must be 255 characters or less");
    }
    if (formData.products_inventory_id && isNaN(parseInt(formData.products_inventory_id))) {
      errors.products_inventory_id = "Products Inventory ID must be a valid integer";
      toastErrors.push("Products Inventory ID must be a valid integer");
    }
    if (formData.published_at && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(formData.published_at)) {
      errors.published_at = "Published At must be in ISO-8601 format";
      toastErrors.push("Published At must be in ISO-8601 format");
    }

    setValidationErrors(errors);
    toastErrors.forEach((error) => toast.error(error));
    return Object.keys(errors).length === 0;
  };

  // Form Submission
  const handleSubmit = async () => {
    setIsSubmitting(true);

    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("Authentication token is missing!");
      setIsSubmitting(false);
      return;
    }

    // Validate form
    if (!validateForm()) {
      setIsSubmitting(false);
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
      resetForm();
    } catch (error) {
      console.error("Error Creating User:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to create user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI Rendering
  return (
    <Box sx={{ backgroundColor: "#121212", minHeight: "100vh" }}>
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
      {/* Header */}
      <ListItemButton
        sx={{
          backgroundColor: "#1a237e",
          color: "#fff",
          "&:hover": { backgroundColor: "#1a237e" },
          mb: 2,
        }}
      >
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
          gap: 2,
          maxWidth: "1200px",
          mx: "auto",
          backgroundColor: "#121212",
          color: "#fff",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Left Side: Personal, Contact, Address */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 1, color: "#fff" }}>
            Personal Details
          </Typography>
          <TextField
            label="Full Name"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            error={!!validationErrors.username}
            helperText={validationErrors.username}
            required
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            required
          />
          <TextField
            label="Aadhar UID"
            name="uid_aadhar"
            value={formData.uid_aadhar}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            error={!!validationErrors.uid_aadhar}
            helperText={validationErrors.uid_aadhar}
            required
          />
          <TextField
            label="Father Name"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />
          <TextField
            label="Mother Name"
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />

          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: "#fff" }}>
            Contact Information
          </Typography>
          <FormControl fullWidth margin="normal" sx={darkFieldStyles} error={!!validationErrors.phone_prefix}>
            <InputLabel>Phone No. Extension</InputLabel>
            <Select
              value={selectedCode}
              onChange={(e) => {
                setSelectedCode(e.target.value);
                setValidationErrors((prev) => ({ ...prev, phone_prefix: "", phone1: "" }));
              }}
            >
              {countryPhoneCodes.map((country) => (
                <MenuItem key={country.code} value={country.phone}>
                  {country.label} ({country.phone})
                </MenuItem>
              ))}
            </Select>
            {validationErrors.phone_prefix && (
              <Typography variant="caption" color="error">
                {validationErrors.phone_prefix}
              </Typography>
            )}
          </FormControl>
          <TextField
            label="Phone Number 1"
            name="phone1"
            type="number"
            value={formData.phone1}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            error={!!validationErrors.phone1}
            helperText={validationErrors.phone1}
          />
          <TextField
            label="Phone Number 2"
            name="phone2"
            type="number"
            value={formData.phone2}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />
          <TextField
            label="Phone Number 3"
            name="phone3"
            type="number"
            value={formData.phone3}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />

          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: "#fff" }}>
            Address
          </Typography>
          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />
          <TextField
            label="District"
            name="district"
            value={formData.district}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />
          <TextField
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />
          <TextField
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />
          <TextField
            label="Pincode"
            name="pincode"
            type="number"
            value={formData.pincode}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />
          <Typography variant="h6" sx={{ mb: 1, color: "#fff" }}>
            Employment Details
          </Typography>
          <TextField
            label="Regular Entry Time"
            name="regularEntryTime"
            type="time"
            value={formData.regularEntryTime}
            onChange={handleTimeChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            InputLabelProps={{ shrink: true }}
            error={!!validationErrors.regularEntryTime}
            helperText={validationErrors.regularEntryTime}
            required
          />
          <TextField
            label="Regular Leave Time"
            name="regularLeaveTime"
            type="time"
            value={formData.regularLeaveTime}
            onChange={handleTimeChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            InputLabelProps={{ shrink: true }}
            error={!!validationErrors.regularLeaveTime}
            helperText={validationErrors.regularLeaveTime}
            required
          />
          <TextField
            label="Break Time (in minutes)"
            name="regularBreakTime"
            type="number"
            value={formData.regularBreakTime}
            onChange={handleTimeChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />
          <TextField
            label="Work Hours Per Day"
            name="aggrementWorkHoursPerDay"
            type="number"
            value={formData.aggrementWorkHoursPerDay}
            disabled
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />
        </Box>

        {/* Right Side: Employment, Salary, System */}
        <Box sx={{ flex: 1 }}>
          <FormControl
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            error={!!validationErrors.department}
          >
            <DepartmentSelect
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={(value) => {
                setSelectedDepartment(value);
                setValidationErrors((prev) => ({ ...prev, department: "" }));
              }}
              setSelectedRole={setSelectedRole}
            />
            {validationErrors.department && (
              <Typography variant="caption" color="error">
                {validationErrors.department}
              </Typography>
            )}
          </FormControl>
          <FormControl fullWidth margin="normal" sx={darkFieldStyles} error={!!validationErrors.role}>
            <RoleSelect
              selectedDepartment={selectedDepartment}
              selectedRole={selectedRole}
              setSelectedRole={(value) => {
                setSelectedRole(value);
                setValidationErrors((prev) => ({ ...prev, role: "" }));
              }}
            />
            {validationErrors.role && (
              <Typography variant="caption" color="error">
                {validationErrors.role}
              </Typography>
            )}
          </FormControl>
          <FormControl fullWidth margin="normal" sx={darkFieldStyles} error={!!validationErrors.factory_id}>
            <ReusableFactorySelect
              value={selectedFactory}
              selectedFactory={selectedFactory}
              setSelectedFactory={(selectedFactory) => {
                setSelectedFactory(selectedFactory);
                setValidationErrors((prev) => ({ ...prev, factory_id: "" }));
              }}
            />
            {validationErrors.factory_id && (
              <Typography variant="caption" color="error">
                {validationErrors.factory_id}
              </Typography>
            )}
          </FormControl>

          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: "#fff" }}>
            Salary Details
          </Typography>
          <FormControl
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            error={!!validationErrors.salary_system}
          >
            <InputLabel>Salary System</InputLabel>
            <Select
              value={selectedSalary}
              onChange={(e) => {
                setSelectedSalary(e.target.value);
                setValidationErrors((prev) => ({ ...prev, salary_system: "" }));
              }}
            >
              {salarySystems.map((salary) => (
                <MenuItem key={salary} value={salary}>
                  {salary}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.salary_system && (
              <Typography variant="caption" color="error">
                {validationErrors.salary_system}
              </Typography>
            )}
          </FormControl>
          <TextField
            label="Monthly Base Salary"
            name="base_salary"
            type="number"
            value={formData.base_salary}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            error={!!validationErrors.base_salary}
            helperText={validationErrors.base_salary}
            required={selectedSalary === "Monthly"}
          />
          <TextField
            label="Per Day Salary"
            name="per_day_salary"
            type="number"
            value={formData.per_day_salary}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            error={!!validationErrors.per_day_salary}
            helperText={validationErrors.per_day_salary}
            required={selectedSalary === "DayWise"}
          />
          <TextField
            label="Extra Salary Per Half Hour"
            name="extra_per_half_hour_salary"
            type="number"
            value={formData.extra_per_half_hour_salary}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            error={!!validationErrors.extra_per_half_hour_salary}
            helperText={validationErrors.extra_per_half_hour_salary}
          />
          <TextField
            label="Per Day Bonus Salary"
            name="per_day_bonus_salary"
            type="number"
            value={formData.per_day_bonus_salary}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
            error={!!validationErrors.per_day_bonus_salary}
            helperText={validationErrors.per_day_bonus_salary}
          />

          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: "#fff" }}>
            System Details
          </Typography>
          <TextField
            label="RFID Card Number"
            name="rfid_card_no"
            value={formData.rfid_card_no}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />
          <TextField
            label="Biometric ID"
            name="biometric_id"
            value={formData.biometric_id}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={darkFieldStyles}
          />
          <FormControl fullWidth margin="normal" sx={darkFieldStyles}>
            <InputLabel>Preferred Language</InputLabel>
            <Select
              name="prefered_language"
              value={formData.prefered_language}
              onChange={handleChange}
            >
              {languages.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {lang}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.prefered_language && (
              <Typography variant="caption" color="error">
                {validationErrors.prefered_language}
              </Typography>
            )}
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                sx={{ color: "#fff", "&.Mui-checked": { color: "#00c853" } }}
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
                sx={{ color: "#fff", "&.Mui-checked": { color: "#00c853" } }}
              />
            }
            label="Email Confirmed"
            sx={{ mt: 1, color: "#fff" }}
          />

          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: "#fff" }}>
            Additional Assignments
          </Typography>
          <BrandSelect
            selectedFactory={selectedBrand}
            setSelectedFactory={setSelectedBrand}
          />
          <InventorySelect
            selectedFactory={selectedInventory}
            setSelectedFactory={setSelectedInventory}
          />
          <MachineSelect
            value={selectedMachine}
            selectedFactory={selectedMachine}
            setSelectedFactory={setSelectedMachine}
          />
          <ProductSelect
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

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{ backgroundColor: "#00c853", "&:hover": { backgroundColor: "#00a843" } }}
        >
          {isSubmitting ? "Creating..." : "Create User"}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={resetForm}
          sx={{ borderColor: "#fff", color: "#fff", "&:hover": { borderColor: "#ccc", color: "#ccc" } }}
        >
          Reset Form
        </Button>
      </Box>
    </Box>
  );
};

export default AddEmployeeSystem;