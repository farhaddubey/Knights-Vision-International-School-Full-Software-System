import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer, Bounce } from "react-toastify";
import countryPhoneCodes from "@/components/sure-success-point-school/selectors/CountryPhoneCode";
import DepartmentSelect from "@/components/sure-success-point-school/selectors/DepartmentSelect";
import SchoolSelect from "@/components/sure-success-point-school/selectors/SchoolSelect";
import SchoolBranchSelect from "@/components/sure-success-point-school/selectors/SchoolBranchSelect";
import { Settings } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#000",
    },
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      color: "#ffffff",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#444",
            },
            "&:hover fieldset": {
              borderColor: "#666",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3f51b5",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#b0b0b0",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#3f51b5",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          padding: "10px 20px",
        },
      },
    },
  },
});

const salarySystems = ["Weekly", "Monthly", "Daily"];
const languages = ["English", "Hindi", "Spanish", "French", "German", "Other"];
const maxFileSize = 2 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png"];
const userRoles = [
  "ADMIN",
  "MANAGER",
  "GROUP_CEO",
  "BOARD_OF_DIRECTORS",
  "REGIONAL_DIRECTOR",
  "DISTRICT_MANAGER",
  "TRANSPORT_MANAGER",
  "INFRASTRUCTURE_MANAGER",
  "EVENT_COORDINATOR",
  "MEDIA_COORDINATOR",
  "LEGAL_COMPLIANCE_OFFICER",
  "STATE_EXPANSION_HEAD",
  "BRANCH_DEVELOPMENT_OFFICER",
  "FRANCHISE_SUPPORT_MANAGER",
  "STUDENT_WELFARE_OFFICER",
  "SCHOOL_MARKETING_MANAGER",
  "INTERN",
  "TEACHER",
  "STAFF",
  "SYSTEM_IN_CHARGE",
  "ACADEMICS_IN_CHARGE",
  "TEACHER_IN_CHARGE",
  "GUARDIAN_COMMUNICATION_IN_CHARGE",
  "FINANCE_MANAGEMENT_OFFICER",
  "PRINCIPAL_HEAD",
  "ASSISTANT_TEACHER",
  "LIBRARIAN",
  "EXAM_CONTROLLER",
  "ACADEMIC_RESEARCHER",
  "HR_OFFICER",
  "SECURITY_HEAD",
];

const UpdateEmployeeDialog = ({
  open,
  onClose,
  employee,
  onUpdateSuccess,
  onDeleteSuccess,
}) => {
  const [formData, setFormData] = useState({
    username: employee?.username || "",
    email: employee?.email || "",
    is_active: employee?.is_active === "Active" || employee?.is_active === true,
    blocked: employee?.blocked || false,
    prefered_language: employee?.prefered_language || "",
    department: employee?.department || "",
    rfid_card_no: employee?.rfid_card_no || "",
    confirmed: employee?.confirmed === "Yes" || employee?.confirmed === true,
    biometric_id: employee?.biometric_id || "",
    aggrement_work_hours_per_day:
      employee?.aggrement_work_hours_per_day || "7.00",
    base_salary: employee?.base_salary || "",
    base_salary_per_day: employee?.base_salary_per_day || "",
    extra_per_half_hour_salary: employee?.extra_per_half_hour_salary || "",
    regular_entry_time: employee?.regular_entry_time || "9:00",
    regular_leave_time: employee?.regular_leave_time || "4:00",
    salary_system: employee?.salary_system || "",
    per_day_bonus_salary: employee?.per_day_bonus_salary || "",
    per_day_salary: employee?.per_day_salary || "",
    address: employee?.address || "",
    village: employee?.village || "",
    block: employee?.block || "",
    municiple: employee?.municiple || "",
    police_station: employee?.police_station || "",
    district: employee?.district || "",
    state: employee?.state || "",
    country: employee?.country || "",
    pincode: employee?.pincode || "",
    phone_prefix: employee?.phone_prefix || "",
    phone1: employee?.phone1 || "",
    phone2: employee?.phone2 || "",
    phone3: employee?.phone3 || "",
    fatherName: employee?.fatherName || "",
    motherName: employee?.motherName || "",
    uid_aadhar: employee?.uid_aadhar || "",
    bar_registration_no: employee?.bar_registration_no || "",
    clg_name: employee?.clg_name || "",
    highest_degree: employee?.highest_degree || "",
    highest_marks: employee?.highest_marks || "",
    years_experience: employee?.years_experience || "",
    specialization: employee?.specialization || "",
    bio: employee?.bio || "",
    languages_known: employee?.languages_known || "",
    whatsapp: employee?.whatsapp || "",
    aadhar_verified:
      employee?.aadhar_verified === "Yes" || employee?.aadhar_verified === true,
    schoolId: employee?.schoolId || "",
    branchId: employee?.branchId || "",
    img_url: employee?.img_url || "",
    role_teacher: employee?.role_teacher || "",
  });
  const [selectedRole, setSelectedRole] = useState(employee?.role || "");
  const [selectedTeacherRole, setSelectedTeacherRole] = useState(
    employee?.role_teacher || "",
  );
  const [selectedDepartment, setSelectedDepartment] = useState(
    employee?.department || "",
  );
  const [selectedSalary, setSelectedSalary] = useState(
    employee?.salary_system || "",
  );
  const [selectedCode, setSelectedCode] = useState(
    employee?.phone_prefix || "",
  );
  const [selectedSchool, setSelectedSchool] = useState(
    employee?.schoolId || "",
  );
  const [selectedBranch, setSelectedBranch] = useState(
    employee?.branchId || "",
  );
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(employee?.img_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const mandatoryFields = [
    "username",
    "email",
    "uid_aadhar",
    "phone1",
    "address",
    "district",
    "state",
    "country",
    "pincode",
    "fatherName",
    "motherName",
    "regular_entry_time",
    "regular_leave_time",
    "salary_system",
    "prefered_language",
    "department",
    "schoolId",
    "branchId",
  ];
  const teacherFields = [
    "highest_degree",
    "years_experience",
    "specialization",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value,
    };

    const { regular_entry_time, regular_leave_time } = updatedData;
    if (regular_entry_time && regular_leave_time) {
      const [startHour, startMinute] = regular_entry_time
        .split(":")
        .map(Number);
      const [endHour, endMinute] = regular_leave_time.split(":").map(Number);

      if (!isNaN(startHour) && !isNaN(endHour)) {
        const startTotal = startHour * 60 + startMinute;
        const endTotal = endHour * 60 + endMinute;

        let workMinutes = endTotal - startTotal;
        workMinutes = Math.max(0, workMinutes);

        updatedData.aggrement_work_hours_per_day = (workMinutes / 60).toFixed(
          2,
        );
      }
    }

    setFormData(updatedData);
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(formData.img_url || "");
      setFormData({ ...formData, img_url: formData.img_url || "" });
      setErrors((prev) => ({ ...prev, img_url: "" }));
      return;
    }

    if (!allowedImageTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        img_url: "Only JPEG or PNG images are allowed",
      }));
      toast.error("Only JPEG or PNG images are allowed");
      return;
    }

    if (file.size > maxFileSize) {
      setErrors((prev) => ({
        ...prev,
        img_url: "Image size exceeds 2MB limit",
      }));
      toast.error("Image size exceeds 2MB limit");
      return;
    }

    setImageFile(file);
    setErrors((prev) => ({ ...prev, img_url: "" }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.img_url || null;

    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("Authentication token is missing for image upload!");
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await axios.post("/api/files", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.url;
    } catch (error) {
      console.error(
        "Error uploading image:",
        error.response?.data || error.message,
      );
      toast.error(error.response?.data?.error || "Failed to upload image.");
      return null;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const toastErrors = [];

    mandatoryFields.forEach((field) => {
      if (
        !formData[field] &&
        !["department", "salary_system", "schoolId", "branchId"].includes(field)
      ) {
        newErrors[field] =
          `${field.replace(/([A-Z])/g, " $1").trim()} is required`;
        toastErrors.push(
          `${field.replace(/([A-Z])/g, " $1").trim()} is required`,
        );
      }
    });

    if (!selectedRole) {
      newErrors.role = "Role is required";
      toastErrors.push("Role is required");
    }

    if (!selectedDepartment) {
      newErrors.department = "Department is required";
      toastErrors.push("Department is required");
    }

    if (!selectedSalary) {
      newErrors.salary_system = "Salary system is required";
      toastErrors.push("Salary system is required");
    }

    if (!selectedSchool) {
      newErrors.schoolId = "School is required";
      toastErrors.push("School is required");
    }

    if (!selectedBranch) {
      newErrors.branchId = "Branch is required";
      toastErrors.push("Branch is required");
    }

    if (
      selectedRole.includes("TEACHER") ||
      selectedRole === "ASSISTANT_TEACHER"
    ) {
      teacherFields.forEach((field) => {
        if (!formData[field]) {
          newErrors[field] =
            `${field.replace(/([A-Z])/g, " $1").trim()} is required for teachers`;
          toastErrors.push(
            `${field.replace(/([A-Z])/g, " $1").trim()} is required for teachers`,
          );
        }
      });
    }

    if (formData.uid_aadhar && !/^\d{12}$/.test(formData.uid_aadhar)) {
      newErrors.uid_aadhar = "Aadhar UID must be exactly 12 digits";
      toastErrors.push("Aadhar UID must be exactly 12 digits");
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      toastErrors.push("Invalid email format");
    }

    if (
      formData.regular_entry_time &&
      !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.regular_entry_time)
    ) {
      newErrors.regular_entry_time =
        "Regular Entry Time must be in HH:mm format";
      toastErrors.push("Regular Entry Time must be in HH:mm format");
    }
    if (
      formData.regular_leave_time &&
      !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.regular_leave_time)
    ) {
      newErrors.regular_leave_time =
        "Regular Leave Time must be in HH:mm format";
      toastErrors.push("Regular Leave Time must be in HH:mm format");
    }

    if (formData.phone1 && !selectedCode) {
      newErrors.phone_prefix =
        "Phone prefix is required if phone number is provided";
      newErrors.phone1 = "Phone prefix is required";
      toastErrors.push("Phone prefix is required if phone number is provided");
    }
    if (selectedCode && !formData.phone1) {
      newErrors.phone1 = "Phone number is required if prefix is selected";
      toastErrors.push("Phone number is required if prefix is selected");
    }

    if (formData.phone1 && !/^\d{10}$/.test(formData.phone1)) {
      newErrors.phone1 = "Phone number must be exactly 10 digits";
      toastErrors.push("Phone number must be exactly 10 digits");
    }
    if (formData.phone2 && !/^\d{10}$/.test(formData.phone2)) {
      newErrors.phone2 = "Secondary phone number must be exactly 10 digits";
      toastErrors.push("Secondary phone number must be exactly 10 digits");
    }
    if (formData.phone3 && !/^\d{10}$/.test(formData.phone3)) {
      newErrors.phone3 = "Tertiary phone number must be exactly 10 digits";
      toastErrors.push("Tertiary phone number must be exactly 10 digits");
    }

    const numericFields = [
      "base_salary",
      "base_salary_per_day",
      "extra_per_half_hour_salary",
      "per_day_bonus_salary",
      "per_day_salary",
      "aggrement_work_hours_per_day",
      "years_experience",
      "schoolId",
      "branchId",
    ];
    numericFields.forEach((field) => {
      if (formData[field] && isNaN(parseFloat(formData[field]))) {
        newErrors[field] =
          `${field.replace(/([A-Z])/g, " $1").trim()} must be a valid number`;
        toastErrors.push(
          `${field.replace(/([A-Z])/g, " $1").trim()} must be a valid number`,
        );
      }
    });

    if (selectedSalary === "Daily" && !formData.per_day_salary) {
      newErrors.per_day_salary = "Per Day Salary is required for Daily system";
      toastErrors.push("Per Day Salary is required for Daily system");
    }
    if (selectedSalary === "Monthly" && !formData.base_salary) {
      newErrors.base_salary =
        "Monthly Base Salary is required for Monthly system";
      toastErrors.push("Monthly Base Salary is required for Monthly system");
    }

    setErrors(newErrors);
    toastErrors.forEach((error) => toast.error(error));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("Authentication token is missing!");
      setIsSubmitting(false);
      return;
    }

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      let imgUrl = formData.img_url;
      if (imageFile) {
        imgUrl = await uploadImage();
        if (!imgUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      const toNullable = (val) =>
        val === "" || val === undefined ? null : val;

      const dataToSend = {
        username: toNullable(formData.username),
        email: formData.email,
        is_active: formData.is_active,
        blocked: formData.blocked,
        prefered_language: toNullable(formData.prefered_language),
        department: toNullable(selectedDepartment),
        rfid_card_no: toNullable(formData.rfid_card_no),
        confirmed: formData.confirmed,
        biometric_id: toNullable(formData.biometric_id),
        aggrement_work_hours_per_day: toNullable(
          formData.aggrement_work_hours_per_day,
        )
          ? parseFloat(formData.aggrement_work_hours_per_day)
          : null,
        base_salary: toNullable(formData.base_salary)
          ? parseFloat(formData.base_salary)
          : null,
        base_salary_per_day: toNullable(formData.base_salary_per_day)
          ? parseFloat(formData.base_salary_per_day)
          : null,
        extra_per_half_hour_salary: toNullable(
          formData.extra_per_half_hour_salary,
        )
          ? parseFloat(formData.extra_per_half_hour_salary)
          : null,
        regular_entry_time: toNullable(formData.regular_entry_time),
        regular_leave_time: toNullable(formData.regular_leave_time),
        salary_system: toNullable(selectedSalary),
        per_day_bonus_salary: toNullable(formData.per_day_bonus_salary)
          ? parseFloat(formData.per_day_bonus_salary)
          : null,
        per_day_salary: toNullable(formData.per_day_salary)
          ? parseFloat(formData.per_day_salary)
          : null,
        role: toNullable(selectedRole),
        role_teacher: toNullable(selectedTeacherRole),
        clg_name: toNullable(formData.clg_name),
        highest_degree: toNullable(formData.highest_degree),
        highest_marks: toNullable(formData.highest_marks),
        years_experience: toNullable(formData.years_experience)
          ? parseInt(formData.years_experience)
          : null,
        specialization: toNullable(formData.specialization),
        bio: toNullable(formData.bio),
        languages_known: toNullable(formData.languages_known),
        bar_registration_no: toNullable(formData.bar_registration_no),
        address: toNullable(formData.address),
        village: toNullable(formData.village),
        block: toNullable(formData.block),
        municiple: toNullable(formData.municiple),
        police_station: toNullable(formData.police_station),
        district: toNullable(formData.district),
        state: toNullable(formData.state),
        country: toNullable(formData.country),
        pincode: toNullable(formData.pincode),
        phone_prefix: toNullable(selectedCode),
        phone1: toNullable(formData.phone1),
        phone2: toNullable(formData.phone2),
        phone3: toNullable(formData.phone3),
        fatherName: toNullable(formData.fatherName),
        motherName: toNullable(formData.motherName),
        uid_aadhar: toNullable(formData.uid_aadhar),
        whatsapp: toNullable(formData.whatsapp),
        aadhar_verified: formData.aadhar_verified,
        schoolId: toNullable(selectedSchool) ? parseInt(selectedSchool) : null,
        branchId: toNullable(selectedBranch) ? parseInt(selectedBranch) : null,
        img_url: imgUrl || null,
      };

      await axios.put(`/api/users/${employee.id}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Employee updated successfully");
      onUpdateSuccess();
    } catch (error) {
      console.error(
        "Error updating employee:",
        error.response?.data || error.message,
      );
      const errorMsg =
        error.response?.data?.error || "Failed to update employee.";
      toast.error(errorMsg);
      if (errorMsg.includes("Email already exists")) {
        setErrors((prev) => ({ ...prev, email: "Email already exists" }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    setIsDeleting(true);
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("Authentication token is missing!");
      setIsDeleting(false);
      return;
    }

    try {
      await axios.delete(`/api/users/${employee.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Employee deleted successfully");
      onDeleteSuccess();
    } catch (error) {
      console.error(
        "Error deleting employee:",
        error.response?.data || error.message,
      );
      toast.error(error.response?.data?.error || "Failed to delete employee.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: "82vw",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
        bgcolor: "#181818",
      }}
    >
      <ThemeProvider theme={theme}>
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
          transition={Bounce}
        />

        <Dialog
          open={open}
          onClose={onClose}
          fullScreen
          sx={{
            position: "fixed",
            top: `${appBarHeight}px`,
            left: `calc(${drawerWidth}px)`,
            transform: "translate(0, 0)",
          }}
        >
          <DialogTitle>Update Employee</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, color: "text.primary" }}
                >
                  Personal Information
                </Typography>
                <TextField
                  label="Full Name"
                  name="username"
                  value={formData.username}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  required
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
                <TextField
                  label="Aadhar UID"
                  name="uid_aadhar"
                  value={formData.uid_aadhar}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.uid_aadhar}
                  helperText={errors.uid_aadhar}
                  required
                />
                <TextField
                  label="Father Name"
                  name="fatherName"
                  value={formData.fatherName}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.fatherName}
                  helperText={errors.fatherName}
                  required
                />
                <TextField
                  label="Mother Name"
                  name="motherName"
                  value={formData.motherName}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.motherName}
                  helperText={errors.motherName}
                  required
                />
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, color: "text.primary" }}
                  >
                    Profile Image
                  </Typography>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{
                        borderColor: "#444",
                        color: "text.primary",
                        "&:hover": { borderColor: "#666" },
                        mb: 1,
                      }}
                    >
                      {imageFile || imagePreview
                        ? "Change Image"
                        : "Upload Image"}
                    </Button>
                  </label>
                  {imagePreview && (
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "150px",
                          borderRadius: "4px",
                        }}
                      />
                    </Box>
                  )}
                  {errors.img_url && (
                    <Typography variant="caption" color="error">
                      {errors.img_url}
                    </Typography>
                  )}
                </Box>
                <TextField
                  label="Biometric ID"
                  name="biometric_id"
                  value={formData.biometric_id}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                />
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors.phone_prefix}
                >
                  <InputLabel>Phone No. Extension</InputLabel>
                  <Select
                    value={selectedCode}
                    onChange={(e) => {
                      setSelectedCode(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        phone_prefix: "",
                        phone1: "",
                      }));
                    }}
                  >
                    {countryPhoneCodes.map((country) => (
                      <MenuItem key={country.code} value={country.phone}>
                        {country.label} ({country.phone})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.phone_prefix && (
                    <Typography variant="caption" color="error">
                      {errors.phone_prefix}
                    </Typography>
                  )}
                </FormControl>
                <TextField
                  label="Phone Number"
                  name="phone1"
                  type="text"
                  value={formData.phone1}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.phone1}
                  helperText={errors.phone1}
                  required
                />
                <TextField
                  label="Secondary Phone Number"
                  name="phone2"
                  type="text"
                  value={formData.phone2}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.phone2}
                  helperText={errors.phone2}
                />
                <TextField
                  label="Tertiary Phone Number"
                  name="phone3"
                  type="text"
                  value={formData.phone3}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.phone3}
                  helperText={errors.phone3}
                />
                <TextField
                  label="WhatsApp Number"
                  name="whatsapp"
                  type="text"
                  value={formData.whatsapp}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                />
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 2, mb: 2, color: "text.primary" }}
                >
                  Address Details
                </Typography>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                />
                <TextField
                  label="Village"
                  name="village"
                  value={formData.village}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                />
                <TextField
                  label="Block"
                  name="block"
                  value={formData.block}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                />
                <TextField
                  label="Municipality"
                  name="municiple"
                  value={formData.municiple}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                />
                <TextField
                  label="Police Station"
                  name="police_station"
                  value={formData.police_station}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                />
                <TextField
                  label="District"
                  name="district"
                  value={formData.district}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.district}
                  helperText={errors.district}
                  required
                />
                <TextField
                  label="State"
                  name="state"
                  value={formData.state}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.state}
                  helperText={errors.state}
                  required
                />
                <TextField
                  label="Country"
                  name="country"
                  value={formData.country}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.country}
                  helperText={errors.country}
                  required
                />
                <TextField
                  label="Pincode"
                  name="pincode"
                  type="text"
                  value={formData.pincode}
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  error={!!errors.pincode}
                  helperText={errors.pincode}
                  required
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, color: "text.primary" }}
                >
                  Employment Details
                </Typography>
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors.department}
                >
                  <DepartmentSelect
                    selectedDepartment={selectedDepartment}
                    setSelectedDepartment={(value) => {
                      setSelectedDepartment(value);
                      setErrors((prev) => ({ ...prev, department: "" }));
                    }}
                  />
                  {errors.department && (
                    <Typography variant="caption" color="error">
                      {errors.department}
                    </Typography>
                  )}
                </FormControl>
                <FormControl fullWidth margin="normal" error={!!errors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setErrors((prev) => ({ ...prev, role: "" }));
                    }}
                  >
                    {userRoles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role.replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.role && (
                    <Typography variant="caption" color="error">
                      {errors.role}
                    </Typography>
                  )}
                </FormControl>
                {(selectedRole.includes("TEACHER") ||
                  selectedRole === "ASSISTANT_TEACHER") && (
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={!!errors.role_teacher}
                  >
                    <InputLabel>Teacher Role</InputLabel>
                    <Select
                      value={selectedTeacherRole}
                      onChange={(e) => {
                        setSelectedTeacherRole(e.target.value);
                        setErrors((prev) => ({ ...prev, role_teacher: "" }));
                      }}
                    >
                      {userRoles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role.replace(/_/g, " ")}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.role_teacher && (
                      <Typography variant="caption" color="error">
                        {errors.role_teacher}
                      </Typography>
                    )}
                  </FormControl>
                )}
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors.schoolId}
                >
                  <SchoolSelect
                    selectedSchool={selectedSchool}
                    setSelectedSchool={(value) => {
                      setSelectedSchool(value);
                      setFormData((prev) => ({ ...prev, schoolId: value }));
                      setErrors((prev) => ({ ...prev, schoolId: "" }));
                    }}
                  />
                  {errors.schoolId && (
                    <Typography variant="caption" color="error">
                      {errors.schoolId}
                    </Typography>
                  )}
                </FormControl>
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors.branchId}
                >
                  <SchoolBranchSelect
                    selectedBranch={selectedBranch}
                    setSelectedBranch={(value) => {
                      setSelectedBranch(value);
                      setFormData((prev) => ({ ...prev, branchId: value }));
                      setErrors((prev) => ({ ...prev, branchId: "" }));
                    }}
                  />
                  {errors.branchId && (
                    <Typography variant="caption" color="error">
                      {errors.branchId}
                    </Typography>
                  )}
                </FormControl>
                <TextField
                  label="Regular Entry Time"
                  name="regular_entry_time"
                  type="time"
                  value={formData.regular_entry_time}
                  onChange={handleTimeChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.regular_entry_time}
                  helperText={errors.regular_entry_time}
                  required
                />
                <TextField
                  label="Regular Leave Time"
                  name="regular_leave_time"
                  type="time"
                  value={formData.regular_leave_time}
                  onChange={handleTimeChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.regular_leave_time}
                  helperText={errors.regular_leave_time}
                  required
                />
                <TextField
                  label="Work Hours Per Day"
                  name="aggrement_work_hours_per_day"
                  type="number"
                  value={formData.aggrement_work_hours_per_day}
                  disabled
                  fullWidth
                  margin="normal"
                />
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors.salary_system}
                >
                  <InputLabel>Salary System</InputLabel>
                  <Select
                    value={selectedSalary}
                    onChange={(e) => {
                      setSelectedSalary(e.target.value);
                      setErrors((prev) => ({ ...prev, salary_system: "" }));
                    }}
                  >
                    {salarySystems.map((salary) => (
                      <MenuItem key={salary} value={salary}>
                        {salary}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.salary_system && (
                    <Typography variant="caption" color="error">
                      {errors.salary_system}
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
                  error={!!errors.base_salary}
                  helperText={errors.base_salary}
                  required={selectedSalary === "Monthly"}
                />
                <TextField
                  label="Daily Base Salary"
                  name="base_salary_per_day"
                  type="number"
                  value={formData.base_salary_per_day}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  error={!!errors.base_salary_per_day}
                  helperText={errors.base_salary_per_day}
                />
                <TextField
                  label="Per Day Salary"
                  name="per_day_salary"
                  type="number"
                  value={formData.per_day_salary}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  error={!!errors.per_day_salary}
                  helperText={errors.per_day_salary}
                  required={selectedSalary === "Daily"}
                />
                <TextField
                  label="Extra Salary Per Half Hour"
                  name="extra_per_half_hour_salary"
                  type="number"
                  value={formData.extra_per_half_hour_salary}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  error={!!errors.extra_per_half_hour_salary}
                  helperText={errors.extra_per_half_hour_salary}
                />
                <TextField
                  label="Per Day Bonus Salary"
                  name="per_day_bonus_salary"
                  type="number"
                  value={formData.per_day_bonus_salary}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  error={!!errors.per_day_bonus_salary}
                  helperText={errors.per_day_bonus_salary}
                />
                <TextField
                  label="RFID Card Number"
                  name="rfid_card_no"
                  type="text"
                  value={formData.rfid_card_no}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Bar Registration Number"
                  name="bar_registration_no"
                  type="text"
                  value={formData.bar_registration_no}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                {(selectedRole.includes("TEACHER") ||
                  selectedRole === "ASSISTANT_TEACHER") && (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{ mt: 2, mb: 2, color: "text.primary" }}
                    >
                      Teacher Profile
                    </Typography>
                    <TextField
                      label="College Name"
                      name="clg_name"
                      value={formData.clg_name}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Highest Degree"
                      name="highest_degree"
                      value={formData.highest_degree}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      error={!!errors.highest_degree}
                      helperText={errors.highest_degree}
                      required
                    />
                    <TextField
                      label="Highest Marks"
                      name="highest_marks"
                      value={formData.highest_marks}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Years of Experience"
                      name="years_experience"
                      type="number"
                      value={formData.years_experience}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      error={!!errors.years_experience}
                      helperText={errors.years_experience}
                      required
                    />
                    <TextField
                      label="Specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      error={!!errors.specialization}
                      helperText={errors.specialization}
                      required
                    />
                    <TextField
                      label="Bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      multiline
                      rows={4}
                    />
                    <TextField
                      label="Languages Known"
                      name="languages_known"
                      value={formData.languages_known}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      helperText="Comma-separated list (e.g., English,Hindi)"
                    />
                  </>
                )}
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors.prefered_language}
                >
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
                  {errors.prefered_language && (
                    <Typography variant="caption" color="error">
                      {errors.prefered_language}
                    </Typography>
                  )}
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="aadhar_verified"
                      checked={formData.aadhar_verified}
                      onChange={handleChange}
                      sx={{
                        color: "#fff",
                        "&.Mui-checked": { color: "#3f51b5" },
                      }}
                    />
                  }
                  label="Aadhar Verified"
                  sx={{ mt: 1, color: "text.primary" }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      sx={{
                        color: "#fff",
                        "&.Mui-checked": { color: "#3f51b5" },
                      }}
                    />
                  }
                  label="Active"
                  sx={{ mt: 1, color: "text.primary" }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="blocked"
                      checked={formData.blocked}
                      onChange={handleChange}
                      sx={{
                        color: "#fff",
                        "&.Mui-checked": { color: "#3f51b5" },
                      }}
                    />
                  }
                  label="Blocked"
                  sx={{ mt: 1, color: "text.primary" }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="confirmed"
                      checked={formData.confirmed}
                      onChange={handleChange}
                      sx={{
                        color: "#fff",
                        "&.Mui-checked": { color: "#3f51b5" },
                      }}
                    />
                  }
                  label="Confirmed"
                  sx={{ mt: 1, color: "text.primary" }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <CircularProgress size={24} /> : "Delete"}
            </Button>
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} />
              ) : (
                "Update Employee"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </Box>
  );
};

export default UpdateEmployeeDialog;
