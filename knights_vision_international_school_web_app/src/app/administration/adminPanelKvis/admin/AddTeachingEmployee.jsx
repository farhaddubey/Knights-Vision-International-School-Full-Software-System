import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  Slider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CloudUpload, EmojiEmotions, AddAlert, OpenWith, RestartAlt } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import countryPhoneCodes from "@/components/sure-success-point-school/selectors/CountryPhoneCode";
import DepartmentSelect from "@/components/sure-success-point-school/selectors/DepartmentSelect";
import SchoolSelect from "@/components/sure-success-point-school/selectors/SchoolSelect";
import SchoolBranchSelect from "@/components/sure-success-point-school/selectors/SchoolBranchSelect";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1e1e1e",
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

const salarySystems = ["DayWise", "Monthly"];
const languages = ["English", "Hindi", "Spanish", "French", "German", "Other"];
const maxFileSize = 12 * 1024 * 1024;
const maxPassportPhotoBytes = 100 * 1024;
const passportWidth = 400;
const passportHeight = 500;
const previewWidth = 144;
const previewHeight = 180;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function loadBrowserImage(sourceUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected photo could not be opened."));
    image.src = sourceUrl;
  });
}

function cropGeometry({ sourceWidth, sourceHeight, targetWidth, targetHeight, zoom = 1, position = { x: 0, y: 0 } }) {
  const baseScale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const scale = baseScale * Math.max(1, Number(zoom) || 1);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const overflowX = Math.max(0, (width - targetWidth) / 2);
  const overflowY = Math.max(0, (height - targetHeight) / 2);
  return {
    width,
    height,
    left: (targetWidth - width) / 2 + clamp(Number(position?.x) || 0, -1, 1) * overflowX,
    top: (targetHeight - height) / 2 + clamp(Number(position?.y) || 0, -1, 1) * overflowY,
    overflowX,
    overflowY,
  };
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The faculty photo could not be prepared."));
    }, "image/webp", quality);
  });
}

async function createPassportPhotoFile(file, zoom, position) {
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await loadBrowserImage(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = passportWidth;
    canvas.height = passportHeight;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("The faculty photo editor is not available in this browser.");

    const crop = cropGeometry({
      sourceWidth: image.naturalWidth,
      sourceHeight: image.naturalHeight,
      targetWidth: passportWidth,
      targetHeight: passportHeight,
      zoom,
      position,
    });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, passportWidth, passportHeight);
    context.drawImage(image, crop.left, crop.top, crop.width, crop.height);

    let optimized = null;
    for (const quality of [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42]) {
      const candidate = await canvasToBlob(canvas, quality);
      if (candidate.size <= maxPassportPhotoBytes) {
        optimized = candidate;
        break;
      }
    }
    if (!optimized) throw new Error("This photo cannot be reduced below 100 KB. Choose a clearer, smaller source photo.");

    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-") || "faculty-photo";
    return new File([optimized], `${baseName}-passport.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
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

const AddEmployeeSystem = () => {
  const initialFormData = {
    username: "",
    email: "",
    password: "",
    is_active: true,
    blocked: false,
    prefered_language: "",
    department: "",
    confirmation_token: "",
    confirmed: false,
    rfid_card_no: "",
    biometric_id: "",
    aggrement_work_hours_per_day: "7.00",
    base_salary: "",
    extra_per_half_hour_salary: "",
    regular_entry_time: "9:00",
    regular_leave_time: "4:00",
    salary_system: "",
    per_day_bonus_salary: "",
    per_day_salary: "",
    address: "",
    village: "",
    district: "",
    state: "",
    country: "",
    pincode: "",
    phone_prefix: "",
    phone1: "",
    fatherName: "",
    motherName: "",
    uid_aadhar: "",
    clg_name: "",
    highest_degree: "",
    highest_marks: "",
    years_experience: "",
    specialization: "",
    bio: "",
    languages_known: "",
    stateId: "",
    countryId: "",
    city_or_block: "",
    phone_display: "",
    whatsapp: "",
    aadhar_verified: false,
    img_url: "",
    bucket: "sure-success-point-school",
    schoolId: "",
    branchId: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSalary, setSelectedSalary] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageDimensions, setImageDimensions] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [draggingImage, setDraggingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageDragStartRef = useRef(null);

  const previewCrop = useMemo(() => {
    if (!imagePreview || !imageDimensions) return null;
    return cropGeometry({
      sourceWidth: imageDimensions.width,
      sourceHeight: imageDimensions.height,
      targetWidth: previewWidth,
      targetHeight: previewHeight,
      zoom: imageZoom,
      position: imagePosition,
    });
  }, [imageDimensions, imagePosition, imagePreview, imageZoom]);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const mandatoryFields = [
    "username",
    "email",
    "password",
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

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      setImageDimensions(null);
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setFormData({ ...formData, img_url: "" });
      setErrors((prev) => ({ ...prev, img_url: "" }));
      return;
    }

    if (!allowedImageTypes.has(file.type)) {
      setErrors((prev) => ({
        ...prev,
        img_url: "Use a JPEG, PNG, WebP, or GIF photo.",
      }));
      toast.error("Use a JPEG, PNG, WebP, or GIF photo.");
      return;
    }

    if (file.size > maxFileSize) {
      setErrors((prev) => ({
        ...prev,
        img_url: "The source photo must be 12 MB or smaller.",
      }));
      toast.error("The source photo must be 12 MB or smaller.");
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    try {
      const image = await loadBrowserImage(nextPreview);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(nextPreview);
      setImageDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setErrors((prev) => ({ ...prev, img_url: "" }));
    } catch (error) {
      URL.revokeObjectURL(nextPreview);
      setErrors((prev) => ({ ...prev, img_url: error.message || "The selected photo could not be opened." }));
      toast.error(error.message || "The selected photo could not be opened.");
    }
  };

  const beginImageDrag = (event) => {
    if (!previewCrop) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    imageDragStartRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      position: imagePosition,
      overflowX: previewCrop.overflowX,
      overflowY: previewCrop.overflowY,
    };
    setDraggingImage(true);
  };

  const moveImage = (event) => {
    const drag = imageDragStartRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setImagePosition({
      x: drag.overflowX > 0 ? clamp(drag.position.x + (event.clientX - drag.clientX) / drag.overflowX, -1, 1) : 0,
      y: drag.overflowY > 0 ? clamp(drag.position.y + (event.clientY - drag.clientY) / drag.overflowY, -1, 1) : 0,
    });
  };

  const endImageDrag = (event) => {
    if (imageDragStartRef.current?.pointerId !== event.pointerId) return;
    imageDragStartRef.current = null;
    setDraggingImage(false);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("Authentication token is missing for image upload!");
      return null;
    }

    try {
      const preparedPhoto = await createPassportPhotoFile(imageFile, imageZoom, imagePosition);
      const formData = new FormData();
      formData.append("file", preparedPhoto, preparedPhoto.name);

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

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedRole("");
    setSelectedDepartment("");
    setSelectedSalary("");
    setSelectedCode("");
    setSelectedSchool("");
    setSelectedBranch("");
    setErrors({});
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    setImageDimensions(null);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
    setDraggingImage(false);
    toast.info("Form reset successfully.");
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

    const numericFields = [
      "base_salary",
      "extra_per_half_hour_salary",
      "per_day_bonus_salary",
      "per_day_salary",
      "aggrement_work_hours_per_day",
      "years_experience",
      "stateId",
      "countryId",
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

    if (selectedSalary === "DayWise" && !formData.per_day_salary) {
      newErrors.per_day_salary =
        "Per Day Salary is required for DayWise system";
      toastErrors.push("Per Day Salary is required for DayWise system");
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
        password: toNullable(formData.password),
        is_active: formData.is_active,
        blocked: formData.blocked,
        prefered_language: toNullable(formData.prefered_language),
        department: toNullable(selectedDepartment),
        confirmation_token: toNullable(formData.confirmation_token),
        confirmed: formData.confirmed,
        rfid_card_no: toNullable(formData.rfid_card_no),
        biometric_id: toNullable(formData.biometric_id),
        aggrement_work_hours_per_day: toNullable(
          formData.aggrement_work_hours_per_day,
        )
          ? parseFloat(formData.aggrement_work_hours_per_day)
          : null,
        base_salary: toNullable(formData.base_salary)
          ? parseFloat(formData.base_salary)
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
        clg_name: toNullable(formData.clg_name),
        highest_degree: toNullable(formData.highest_degree),
        highest_marks: toNullable(formData.highest_marks),
        years_experience: toNullable(formData.years_experience)
          ? parseInt(formData.years_experience)
          : null,
        specialization: toNullable(formData.specialization),
        bio: toNullable(formData.bio),
        languages_known: toNullable(formData.languages_known),
        stateId: toNullable(formData.stateId)
          ? parseInt(formData.stateId)
          : null,
        countryId: toNullable(formData.countryId)
          ? parseInt(formData.countryId)
          : null,
        district: toNullable(formData.district),
        city_or_block: toNullable(formData.city_or_block),
        village: toNullable(formData.village),
        pincode: toNullable(formData.pincode),
        phone_display: toNullable(formData.phone_display),
        whatsapp: toNullable(formData.whatsapp),
        aadhar_verified: formData.aadhar_verified,
        address: toNullable(formData.address),
        state: toNullable(formData.state),
        country: toNullable(formData.country),
        phone_prefix: toNullable(selectedCode),
        phone1: toNullable(formData.phone1),
        fatherName: toNullable(formData.fatherName),
        motherName: toNullable(formData.motherName),
        uid_aadhar: toNullable(formData.uid_aadhar),
        img_url: imgUrl || null,
        schoolId: toNullable(selectedSchool) ? parseInt(selectedSchool) : null,
        branchId: toNullable(selectedBranch) ? parseInt(selectedBranch) : null,
      };

      console.log("Data to Send:", dataToSend);

      const response = await axios.post("/api/users", dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Employee created successfully");
      resetForm();
    } catch (error) {
      console.error(
        "Error Creating Employee:",
        error.response?.data || error.message,
      );
      const errorMsg =
        error.response?.data?.error || "Failed to create employee.";
      toast.error(errorMsg);
      if (errorMsg.includes("Email already exists")) {
        setErrors((prev) => ({ ...prev, email: "Email already exists" }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "#000", minHeight: "80vh", p: 0.4 }}>
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
        <ListItemButton
          elevation={3}
          sx={{
            bgcolor: "#212121",
            px: 1,
            py: 0.4,
            mb: 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 1,
            ":hover": {
              backgroundColor: "#212121",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ListItemIcon>
              <EmojiEmotions sx={{ color: "text.primary" }} />
            </ListItemIcon>
            <Typography variant="h6">Add Employee</Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={<AddAlert />}
          >
            Employee Recruitment Panel
          </Button>
        </ListItemButton>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 0.5,
            overflowY: "auto",
          }}
        >
          <Paper
            elevation={2}
            sx={{
              flex: 1,
              p: 2,
              bgcolor: "#000",
              borderRadius: 2,
              maxHeight: "80vh",
            }}
          >
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
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              fullWidth
              margin="normal"
              onChange={handleChange}
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
            <Box sx={{ mt: 2, mb: 2, p: 1.5, border: "1px solid #395061", borderRadius: 1.5, bgcolor: "#151a20" }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: "#81e6b2", fontWeight: 700 }}>
                Faculty Profile Photo
              </Typography>
              <Typography variant="caption" sx={{ color: "#b9c4cc", display: "block", mb: 1.25 }}>
                Use the same passport-quality crop used for student result cards, admit cards, and ID cards. A faculty photo is optional for legacy compatibility, but recommended for the Faculty ID card.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, alignItems: { xs: "flex-start", sm: "center" } }}>
                <Box
                  onPointerDown={beginImageDrag}
                  onPointerMove={moveImage}
                  onPointerUp={endImageDrag}
                  onPointerCancel={endImageDrag}
                  sx={{ width: previewWidth, height: previewHeight, border: "1px dashed #4f8b63", borderRadius: 1.5, overflow: "hidden", bgcolor: "#101417", display: "grid", placeItems: "center", flexShrink: 0, position: "relative", cursor: previewCrop ? (draggingImage ? "grabbing" : "grab") : "default", touchAction: "none", userSelect: "none" }}
                >
                  {previewCrop ? <Box component="img" draggable={false} src={imagePreview} alt="Faculty passport crop preview" sx={{ position: "absolute", width: previewCrop.width, height: previewCrop.height, left: previewCrop.left, top: previewCrop.top, pointerEvents: "none" }} /> : <Typography variant="caption" align="center" sx={{ color: "#9aacb8", px: 1 }}>No faculty photo selected</Typography>}
                  {previewCrop && <Box sx={{ position: "absolute", inset: 0, border: "1px solid rgba(129, 230, 178, .75)", pointerEvents: "none" }} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Button component="label" variant="outlined" startIcon={<CloudUpload />} sx={{ color: "#81e6b2", borderColor: "#4a8a60", mb: .75 }}>
                    {imagePreview ? "Replace faculty photo" : "Upload faculty photo"}
                    <input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
                  </Button>
                  {imagePreview && <Box sx={{ px: .5, pt: .25 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: .75, mb: .25 }}>
                      <OpenWith fontSize="small" sx={{ color: "#81e6b2" }} />
                      <Typography variant="caption" sx={{ color: "#81e6b2", flex: 1 }}>Drag to position the face — 4:5 passport format</Typography>
                      <Button size="small" startIcon={<RestartAlt fontSize="small" />} onClick={() => setImagePosition({ x: 0, y: 0 })} sx={{ color: "#c4c9cc", minWidth: 0 }}>Centre</Button>
                    </Box>
                    <Slider value={imageZoom} min={1} max={3} step={0.01} valueLabelDisplay="auto" valueLabelFormat={(value) => `${Number(value).toFixed(2)}×`} onChange={(_, value) => setImageZoom(Array.isArray(value) ? value[0] : value)} sx={{ color: "#63de91" }} />
                  </Box>}
                  <Typography variant="caption" sx={{ color: imagePreview ? "#a9b8c2" : "#ffd36b", display: "block", mt: .5 }}>
                    {imagePreview ? "The edited 400 × 500 WebP portrait is compressed below 100 KB before secure upload." : "The generated Faculty ID card will show a neutral placeholder until a photo is added."}
                  </Typography>
                  {errors.img_url && <Typography variant="caption" color="error">{errors.img_url}</Typography>}
                </Box>
              </Box>
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
              label="WhatsApp Number"
              name="whatsapp"
              type="text"
              value={formData.whatsapp}
              fullWidth
              margin="normal"
              onChange={handleChange}
            />
            <TextField
              label="Display Phone Number"
              name="phone_display"
              type="text"
              value={formData.phone_display}
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
              label="City/Block"
              name="city_or_block"
              value={formData.city_or_block}
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
          </Paper>

          <Paper
            elevation={2}
            sx={{
              flex: 1,
              p: 2,
              bgcolor: "#000",
              borderRadius: 2,
              maxHeight: "80vh",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, color: "text.primary" }}
            >
              Employment Details
            </Typography>
            <FormControl fullWidth margin="normal" error={!!errors.department}>
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
            <FormControl fullWidth margin="normal" error={!!errors.schoolId}>
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
            <FormControl fullWidth margin="normal" error={!!errors.branchId}>
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
              label="Per Day Salary"
              name="per_day_salary"
              type="number"
              value={formData.per_day_salary}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.per_day_salary}
              helperText={errors.per_day_salary}
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
                <TextField
                  label="State ID"
                  name="stateId"
                  type="number"
                  value={formData.stateId}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Country ID"
                  name="countryId"
                  type="number"
                  value={formData.countryId}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
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
                  sx={{ color: "#fff", "&.Mui-checked": { color: "#3f51b5" } }}
                />
              }
              label="Aadhar Verified"
              sx={{ mt: 1, color: "text.primary" }}
            />
          </Paper>
        </Box>

        <Paper
          elevation={3}
          sx={{
            bgcolor: "#000",
            display: "flex",
            justifyContent: "flex-end",
            position: "sticky",
            bottom: 0,
            zIndex: 1,
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{ minWidth: 150 }}
          >
            {isSubmitting ? "Creating..." : "Create Employee"}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={resetForm}
            sx={{ minWidth: 150 }}
          >
            Reset Form
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default AddEmployeeSystem;
