import { useState, useEffect } from "react";
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
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  Divider,
  Input,
  IconButton,
} from "@mui/material";
import { Add, Close, Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import imageCompression from "browser-image-compression";
import textDisabledFieldStyles from "../../../../mui_styles/TextDisableFieldStyles";
const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: greenAccent },
  },
  backgroundColor: "#333",
  borderRadius: "4px",
};

const DirectStudentDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchStudents,
  className,
  classId,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentCategory: "GENERAL_DIRECT",
    enrollmentMode: "DIRECT",
    feeSchemeId: "",
    admissionDate: "2025-04-01",
    middleName: "",
    aadhaarNumber: "",
    fatherAadhaarNumber: "",
    motherAadhaarNumber: "",
    loginEmail: "",
    loginPassword: "",
    biometricId: "",
    govt_studentId: "",
    rollNumber: "",
    admissionNumber: "",
    gender: "",
    dateOfBirth: "",
    admittedViaTest: false,
    isScholarshipHolder: false,
    isTransportRequired: false,
    guardianContact: "",
    bloodGroup: "",
    nationality: "",
    religion: "",
    casteCategory: "",
    profileImageUrl: "",
    dreamOrAim: "",
    hobbies: "",
    specialTalents: "",
    fatherName: "",
    fatherContact: "",
    fatherEmail: "",
    fatherProfession: "",
    fatherQualification: "",
    fatherIncome: "",
    motherName: "",
    motherContact: "",
    motherEmail: "",
    motherProfession: "",
    motherQualification: "",
    motherIncome: "",
    guardianName: "",
    guardianRelation: "",
    guardianAddress: "",
    emergencyContact: "",
    residentialAddress: "",
    city: "",
    state: "",
    pinCode: "",
    preferredLanguage: "",
    previousSchoolName: "",
    lastExamPassed: "",
    lastExamResult: "",
    previousAdmissionFee: "",
    previousMonthlyFee: "",
    reasonOfTransfer: "",
    previousSchoolMedium: "",
    previousSchoolBoard: "",
    previousSchoolCity: "",
    healthImmunization: "",
  });
  const [loading, setLoading] = useState(false);
  const [feeSchemes, setFeeSchemes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(classId || "");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/api/school-classes/select", {
          headers: { Authorization: `Bearer ${Cookies.get("administration_token")}` },
        });
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Failed to load classes.");
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchFeeSchemes = async () => {
      if (selectedClassId) {
        try {
          const response = await axios.get(`/api-schools-panel/fee-schemes/fetch_by_class_id_category?classId=${selectedClassId}`, {
            headers: { Authorization: `Bearer ${Cookies.get("administration_token")}` },
          });
          setFeeSchemes(response.data.feeSchemes || []);
          setFormData((prev) => ({ ...prev, feeSchemeId: "" }));
        } catch (error) {
          console.error("Error fetching fee schemes:", error);
          toast.error("Failed to load fee schemes.");
        }
      }
    };
    fetchFeeSchemes();
  }, [selectedClassId]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (editFields?.id) {
        setLoading(true);
        try {
          const response = await axios.get(`/api-schools-panel/students/direct/${className}/${editFields.id}`, {
            headers: { Authorization: `Bearer ${Cookies.get("administration_token")}` },
          });
          const student = response.data;
          setFormData({
            firstName: student.firstName || "",
            lastName: student.lastName || "",
            studentCategory: student.studentCategory || "GENERAL_DIRECT",
            enrollmentMode: student.enrollmentMode || "DIRECT",
            feeSchemeId: student.feeSchemeId?.toString() || "",
            admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split("T")[0] : "2025-04-01",
            middleName: student.middleName || "",
            aadhaarNumber: student.aadhaarNumber || "",
            fatherAadhaarNumber: student.fatherAadhaarNumber || "",
            motherAadhaarNumber: student.motherAadhaarNumber || "",
            loginEmail: student.loginEmail || "",
            loginPassword: "", // Password not fetched for security
            biometricId: student.biometricId || "",
            govt_studentId: student.govt_studentId || "",
            rollNumber: student.rollNumber || "",
            admissionNumber: student.admissionNumber || "",
            gender: student.gender || "",
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : "",
            admittedViaTest: student.admittedViaTest || false,
            isScholarshipHolder: student.isScholarshipHolder || false,
            isTransportRequired: student.isTransportRequired || false,
            guardianContact: student.guardianContact || "",
            bloodGroup: student.bloodGroup || "",
            nationality: student.nationality || "",
            religion: student.religion || "",
            casteCategory: student.casteCategory || "",
            profileImageUrl: student.profileImageUrl || "",
            dreamOrAim: student.dreamOrAim || "",
            hobbies: student.hobbies || "",
            specialTalents: student.specialTalents || "",
            fatherName: student.fatherName || "",
            fatherContact: student.fatherContact || "",
            fatherEmail: student.fatherEmail || "",
            fatherProfession: student.fatherProfession || "",
            fatherQualification: student.fatherQualification || "",
            fatherIncome: student.fatherIncome?.toString() || "",
            motherName: student.motherName || "",
            motherContact: student.motherContact || "",
            motherEmail: student.motherEmail || "",
            motherProfession: student.motherProfession || "",
            motherQualification: student.motherQualification || "",
            motherIncome: student.motherIncome?.toString() || "",
            guardianName: student.guardianName || "",
            guardianRelation: student.guardianRelation || "",
            guardianAddress: student.guardianAddress || "",
            emergencyContact: student.emergencyContact || "",
            residentialAddress: student.residentialAddress || "",
            city: student.city || "",
            state: student.state || "",
            pinCode: student.pinCode || "",
            preferredLanguage: student.preferredLanguage || "",
            previousSchoolName: student.previousSchoolName || "",
            lastExamPassed: student.lastExamPassed || "",
            lastExamResult: student.lastExamResult?.toString() || "",
            previousAdmissionFee: student.previousAdmissionFee?.toString() || "",
            previousMonthlyFee: student.previousMonthlyFee?.toString() || "",
            reasonOfTransfer: student.reasonOfTransfer || "",
            previousSchoolMedium: student.previousSchoolMedium || "",
            previousSchoolBoard: student.previousSchoolBoard || "",
            previousSchoolCity: student.previousSchoolCity || "",
            healthImmunization: student.healthImmunization ? JSON.stringify(student.healthImmunization) : "",
          });
          setSelectedClassId(student.classId?.toString() || "");
          if (student.profileImageUrl) {
            setImagePreview(student.profileImageUrl);
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
          toast.error("Failed to load student data.");
        } finally {
          setLoading(false);
        }
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          studentCategory: "GENERAL_DIRECT",
          enrollmentMode: "DIRECT",
          feeSchemeId: "",
          admissionDate: "2025-04-01",
          middleName: "",
          aadhaarNumber: "",
          fatherAadhaarNumber: "",
          motherAadhaarNumber: "",
          loginEmail: "",
          loginPassword: "",
          biometricId: "",
          govt_studentId: "",
          rollNumber: "",
          admissionNumber: "",
          gender: "",
          dateOfBirth: "",
          admittedViaTest: false,
          isScholarshipHolder: false,
          isTransportRequired: false,
          guardianContact: "",
          bloodGroup: "",
          nationality: "",
          religion: "",
          casteCategory: "",
          profileImageUrl: "",
          dreamOrAim: "",
          hobbies: "",
          specialTalents: "",
          fatherName: "",
          fatherContact: "",
          fatherEmail: "",
          fatherProfession: "",
          fatherQualification: "",
          fatherIncome: "",
          motherName: "",
          motherContact: "",
          motherEmail: "",
          motherProfession: "",
          motherQualification: "",
          motherIncome: "",
          guardianName: "",
          guardianRelation: "",
          guardianAddress: "",
          emergencyContact: "",
          residentialAddress: "",
          city: "",
          state: "",
          pinCode: "",
          preferredLanguage: "",
          previousSchoolName: "",
          lastExamPassed: "",
          lastExamResult: "",
          previousAdmissionFee: "",
          previousMonthlyFee: "",
          reasonOfTransfer: "",
          previousSchoolMedium: "",
          previousSchoolBoard: "",
          previousSchoolCity: "",
          healthImmunization: "",
        });
        setSelectedClassId(classId || "");
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setSelectedImage(null);
      }
    };
    fetchStudentData();
    return () => {
      if (imagePreview && !editFields?.profileImageUrl) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [editFields, classId, className]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
  };

  const cropToSquare = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
        canvas.toBlob(
          (blob) => {
            const squareFile = new File([blob], file.name, { type: "image/jpeg" });
            URL.revokeObjectURL(img.src);
            resolve(squareFile);
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image."));
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG or PNG images are allowed.");
      return;
    }

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = () => {
          if (img.width !== img.height) {
            URL.revokeObjectURL(img.src);
            reject(new Error("Image must be square (1:1 aspect ratio)."));
          } else {
            resolve();
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          reject(new Error("Failed to load image."));
        };
      });

      const squareFile = await cropToSquare(file);
      const previewUrl = URL.createObjectURL(squareFile);
      setImagePreview(previewUrl);
      setSelectedImage(squareFile);
      setFormData((prev) => ({ ...prev, profileImageUrl: "" }));
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error(error.message || "Failed to process image.");
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && !formData.profileImageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedImage(null);
    setFormData((prev) => ({ ...prev, profileImageUrl: "" }));
  };

  const uploadImage = async (file) => {
    try {
      const options = {
        maxWidthOrHeight: 50,
        useWebWorker: true,
        fileType: "image/jpeg",
        maxSizeMB: 0.2,
      };
      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append("file", compressedFile, compressedFile.name);

      const response = await axios.post("/api-schools-panel/r2/files", formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("administration_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        return response.data.url;
      } else {
        throw new Error("Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.studentCategory ||
      !formData.enrollmentMode ||
      !formData.feeSchemeId ||
      !formData.admissionDate ||
      !selectedClassId
    ) {
      toast.error(
        "All required fields (First Name, Last Name, Student Category, Enrollment Mode, Fee Scheme, Admission Date, Class) must be filled."
      );
      return;
    }

    setLoading(true);
    try {
      let profileImageUrl = formData.profileImageUrl;
      if (selectedImage) {
        profileImageUrl = await uploadImage(selectedImage);
      }

      const admissionNumber = editFields?.id ? formData.admissionNumber : null;

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentCategory: formData.studentCategory,
        enrollmentMode: formData.enrollmentMode,
        feeSchemeId: parseInt(formData.feeSchemeId),
        admissionDate: formData.admissionDate,
        middleName: formData.middleName || null,
        aadhaarNumber: formData.aadhaarNumber || null,
        fatherAadhaarNumber: formData.fatherAadhaarNumber || null,
        motherAadhaarNumber: formData.motherAadhaarNumber || null,
        loginEmail: formData.loginEmail || null,
        biometricId: formData.biometricId || null,
        govt_studentId: formData.govt_studentId || null,
        rollNumber: formData.rollNumber || null,
        ...(admissionNumber ? { admissionNumber } : {}),
        gender: formData.gender || null,
        dateOfBirth: formData.dateOfBirth || null,
        admittedViaTest: formData.admittedViaTest,
        isScholarshipHolder: formData.isScholarshipHolder,
        isTransportRequired: formData.isTransportRequired,
        guardianContact: formData.guardianContact || null,
        bloodGroup: formData.bloodGroup || null,
        nationality: formData.nationality || null,
        religion: formData.religion || null,
        casteCategory: formData.casteCategory || null,
        profileImageUrl: profileImageUrl || null,
        dreamOrAim: formData.dreamOrAim || null,
        hobbies: formData.hobbies || null,
        specialTalents: formData.specialTalents || null,
        fatherName: formData.fatherName || null,
        fatherContact: formData.fatherContact || null,
        fatherEmail: formData.fatherEmail || null,
        fatherProfession: formData.fatherProfession || null,
        fatherQualification: formData.fatherQualification || null,
        fatherIncome: formData.fatherIncome ? parseFloat(formData.fatherIncome) : null,
        motherName: formData.motherName || null,
        motherContact: formData.motherContact || null,
        motherEmail: formData.motherEmail || null,
        motherProfession: formData.motherProfession || null,
        motherQualification: formData.motherQualification || null,
        motherIncome: formData.motherIncome ? parseFloat(formData.motherIncome) : null,
        guardianName: formData.guardianName || null,
        guardianRelation: formData.guardianRelation || null,
        guardianAddress: formData.guardianAddress || null,
        emergencyContact: formData.emergencyContact || null,
        residentialAddress: formData.residentialAddress || null,
        city: formData.city || null,
        state: formData.state || null,
        pinCode: formData.pinCode || null,
        preferredLanguage: formData.preferredLanguage || null,
        previousSchoolName: formData.previousSchoolName || null,
        lastExamPassed: formData.lastExamPassed || null,
        lastExamResult: formData.lastExamResult ? parseFloat(formData.lastExamResult) : null,
        previousAdmissionFee: formData.previousAdmissionFee ? parseFloat(formData.previousAdmissionFee) : null,
        previousMonthlyFee: formData.previousMonthlyFee ? parseFloat(formData.previousMonthlyFee) : null,
        reasonOfTransfer: formData.reasonOfTransfer || null,
        previousSchoolMedium: formData.previousSchoolMedium || null,
        previousSchoolBoard: formData.previousSchoolBoard || null,
        previousSchoolCity: formData.previousSchoolCity || null,
        healthImmunization: formData.healthImmunization ? JSON.parse(formData.healthImmunization) : null,
        classId: parseInt(selectedClassId),
        branchId: 1,
        schoolId: 1,
        academicYear: 2025,
        status: "ACTIVE",
      };

      const apiUrl = editFields?.id
        ? `/api-schools-panel/students/direct/${className}/${editFields.id}`
        : `/api-schools-panel/students/direct/${className}`;
      const method = editFields?.id ? "put" : "post";
      const response = await axios[method](apiUrl, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(editFields?.id ? "Student updated successfully." : "Student created successfully.");
        fetchStudents();
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to save student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
        "& .MuiDialog-paper": { backgroundColor: "#000", color: "#fff" },
      }}
      open={openInsertion}
      onClose={handleCloseModal}
      fullScreen
    >
      <Box sx={{ bgcolor: "#000" }}>
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
          sx={{
            backgroundColor: "#009688",
            color: "#fff",
            "&:hover": { backgroundColor: "#009688" },
          }}
        >
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary={editFields?.id ? `Edit Student - ${className}` : `Add Student - ${className}`} />
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            color="error"
            sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
          >
            <Close />
          </Button>
        </ListItemButton>
        <DialogContent sx={{ backgroundColor: "#000", height: "80vh", overflowY: "scroll" }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <CircularProgress sx={{ color: greenAccent }} />
            </Box>
          )}
          <Box sx={{ p: 2, width: "80vw" }}>
            {/* Essential Information */}
            <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>Essential Information</Typography>
            <Box sx={{ display: "flex", flexDirection: "row", width: "80vw", mb: 4 }} columnGap={2}>
              {/* Personal Info */}
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>Personal Info</Typography>
                <TextField
                  label="First Name *"
                  name="firstName"
                  fullWidth
                  margin="normal"
                  value={formData.firstName}
                  onChange={handleChange}
                  sx={textFieldStyles}
                  required
                />
                <TextField
                  label="Last Name *"
                  name="lastName"
                  fullWidth
                  margin="normal"
                  value={formData.lastName}
                  onChange={handleChange}
                  sx={textFieldStyles}
                  required
                />
                <TextField
                  label="Middle Name"
                  name="middleName"
                  fullWidth
                  margin="normal"
                  value={formData.middleName}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              {/* Enrollment Details */}
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>Enrollment Details</Typography>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel sx={{ color: "#aaa" }}>Class *</InputLabel>
                  <Select
                    name="classId"
                    value={selectedClassId}
                    onChange={handleClassChange}
                    sx={textFieldStyles}
                  >
                    <MenuItem value=""><em>Select Class</em></MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {`${cls.name}-${cls.section}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                      <FormControl fullWidth margin="normal" required>
                  <InputLabel sx={{ color: "#aaa" }}>Fee Scheme *</InputLabel>
                  <Select
                    name="feeSchemeId"
                    value={formData.feeSchemeId}
                    onChange={handleChange}
                    sx={textFieldStyles}
                  >
                    <MenuItem value=""><em>Select Fee Scheme</em></MenuItem>
                    {feeSchemes.map((scheme) => (
                      <MenuItem key={scheme.id} value={scheme.id}>
                        {`${scheme.category} (Admission: ₹${scheme.admissionFee}, Monthly: ₹${scheme.monthlyFee}, Readmission: ₹${scheme.readmissionFee})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel sx={{ color: "#aaa" }}>Student Category *</InputLabel>
                  <Select
                    name="studentCategory"
                    value={formData.studentCategory}
                    onChange={handleChange}
                    sx={textFieldStyles}
                  >
                    <MenuItem value="KSAT_SUPPORT_PLUS">KSAT Support+ (Not for any business/service man, for High Economical)</MenuItem>
                    <MenuItem value="KSAT_SUPPORT">KSAT Support (Small Businessman)</MenuItem>
                    <MenuItem value="KSAT_STANDARD">KSAT Standard (Serviceman)</MenuItem>
                    <MenuItem value="KSAT_GENERAL">KSAT General (For all)</MenuItem>
                    <MenuItem value="DIRECT_GENERAL">Direct General (No textExam)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel sx={{ color: "#aaa" }}>Enrollment Mode *</InputLabel>
                  <Select
                    name="enrollmentMode"
                    value={formData.enrollmentMode}
                    onChange={handleChange}
                    sx={textFieldStyles}
                  >
                    <MenuItem value="DIRECT">Direct</MenuItem>
                    <MenuItem value="TEST">Test</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {/* System-Generated */}
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>System-Generated</Typography>
                <TextField
                  label="Admission Number"
                  name="admissionNumber"
                  fullWidth
                  margin="normal"
                  value={formData.admissionNumber}
                  sx={textDisabledFieldStyles}
                  disabled
                  helperText={editFields?.id ? "Permanent system-generated ID" : "Generated automatically after the admission is saved"}
                />
                <TextField
                  label="Roll Number"
                  name="rollNumber"
                  fullWidth
                  margin="normal"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Admission Date *"
                  name="admissionDate"
                  type="date"
                  fullWidth
                  margin="normal"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldStyles}
                  required
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="admittedViaTest"
                      checked={formData.admittedViaTest}
                      onChange={handleChange}
                      sx={{ color: "#fff" }}
                    />
                  }
                  label="Admitted Via Test"
                  sx={{ color: "#fff" }}
                />
              </Box>
              {/* Additional Info */}
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>Additional Info</Typography>
                <TextField
                  label="Aadhaar Number"
                  name="aadhaarNumber"
                  fullWidth
                  margin="normal"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Govt Student ID"
                  name="govt_studentId"
                  fullWidth
                  margin="normal"
                  value={formData.govt_studentId}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: "#fff", mb: 1 }}>
                    Profile Image (PNG or JPEG, will be resized to 50x50)
                  </Typography>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageChange}
                    sx={{ color: "#fff" }}
                    inputProps={{ style: { color: "#fff" } }}
                  />
                  <Typography variant="caption" sx={{ color: "#aaa", mt: 1, display: "block" }}>
                    Image must be of 1:1 square size
                  </Typography>
                  {imagePreview && (
                    <Box sx={{ mt: 2, position: "relative", display: "inline-block" }}>
                      <img
                        src={imagePreview}
                        alt="Profile Preview"
                        style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px" }}
                      />
                      <IconButton
                        onClick={handleRemoveImage}
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bgcolor: "#f44336",
                          color: "#fff",
                          "&:hover": { bgcolor: "#d32f2f" },
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3, bgcolor: "#555" }} />

            {/* Additional Information */}
            <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>Additional Information</Typography>
            {/* Personal Details */}
            <Box sx={{ display: "flex", flexDirection: "row", width: "80vw", mb: 4 }} columnGap={2}>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>Personal Details</Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: "#aaa" }}>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    sx={textFieldStyles}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  fullWidth
                  margin="normal"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Personal Details</Typography>
                <TextField
                  label="Blood Group"
                  name="bloodGroup"
                  fullWidth
                  margin="normal"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Nationality"
                  name="nationality"
                  fullWidth
                  margin="normal"
                  value={formData.nationality}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Personal Details</Typography>
                <TextField
                  label="Religion"
                  name="religion"
                  fullWidth
                  margin="normal"
                  value={formData.religion}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Caste Category"
                  name="casteCategory"
                  fullWidth
                  margin="normal"
                  value={formData.casteCategory}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Personal Details</Typography>
                <TextField
                  label="Login Email"
                  name="loginEmail"
                  fullWidth
                  margin="normal"
                  value={formData.loginEmail}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Biometric ID"
                  name="biometricId"
                  fullWidth
                  margin="normal"
                  value={formData.biometricId}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
            </Box>
            {/* Contact Info */}
            <Box sx={{ display: "flex", flexDirection: "row", width: "80vw", mb: 4 }} columnGap={2}>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>Contact Info</Typography>
                <TextField
                  label="Guardian Name"
                  name="guardianName"
                  fullWidth
                  margin="normal"
                  value={formData.guardianName}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Guardian Contact"
                  name="guardianContact"
                  fullWidth
                  margin="normal"
                  value={formData.guardianContact}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Contact Info</Typography>
                <TextField
                  label="Guardian Relation"
                  name="guardianRelation"
                  fullWidth
                  margin="normal"
                  value={formData.guardianRelation}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Emergency Contact"
                  name="emergencyContact"
                  fullWidth
                  margin="normal"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>Address Info</Typography>
                <TextField
                  label="Residential Address"
                  name="residentialAddress"
                  fullWidth
                  margin="normal"
                  value={formData.residentialAddress}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="City"
                  name="city"
                  fullWidth
                  margin="normal"
                  value={formData.city}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Address Info</Typography>
                <TextField
                  label="State"
                  name="state"
                  fullWidth
                  margin="normal"
                  value={formData.state}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Pin Code"
                  name="pinCode"
                  fullWidth
                  margin="normal"
                  value={formData.pinCode}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
            </Box>
            {/* Father's Info */}
            <Box sx={{ display: "flex", flexDirection: "row", width: "80vw", mb: 4 }} columnGap={2}>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>Father's Info</Typography>
                <TextField
                  label="Father's Name"
                  name="fatherName"
                  fullWidth
                  margin="normal"
                  value={formData.fatherName}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Father's Aadhaar Number"
                  name="fatherAadhaarNumber"
                  fullWidth
                  margin="normal"
                  value={formData.fatherAadhaarNumber}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Father's Contact"
                  name="fatherContact"
                  fullWidth
                  margin="normal"
                  value={formData.fatherContact}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Father's Info</Typography>
                <TextField
                  label="Father's Email"
                  name="fatherEmail"
                  fullWidth
                  margin="normal"
                  value={formData.fatherEmail}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Father's Profession"
                  name="fatherProfession"
                  fullWidth
                  margin="normal"
                  value={formData.fatherProfession}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Father's Qualification"
                  name="fatherQualification"
                  fullWidth
                  margin="normal"
                  value={formData.fatherQualification}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Father's Info</Typography>
                <TextField
                  label="Father's Income"
                  name="fatherIncome"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.fatherIncome}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }} />
            </Box>
            {/* Mother's Info */}
            <Box sx={{ display: "flex", flexDirection: "row", width: "80vw", mb: 4 }} columnGap={2}>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>Mother's Info</Typography>
                <TextField
                  label="Mother's Name"
                  name="motherName"
                  fullWidth
                  margin="normal"
                  value={formData.motherName}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Mother's Aadhaar Number"
                  name="motherAadhaarNumber"
                  fullWidth
                  margin="normal"
                  value={formData.motherAadhaarNumber}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Mother's Contact"
                  name="motherContact"
                  fullWidth
                  margin="normal"
                  value={formData.motherContact}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Mother's Info</Typography>
                <TextField
                  label="Mother's Email"
                  name="motherEmail"
                  fullWidth
                  margin="normal"
                  value={formData.motherEmail}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Mother's Profession"
                  name="motherProfession"
                  fullWidth
                  margin="normal"
                  value={formData.motherProfession}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Mother's Qualification"
                  name="motherQualification"
                  fullWidth
                  margin="normal"
                  value={formData.motherQualification}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Mother's Info</Typography>
                <TextField
                  label="Mother's Income"
                  name="motherIncome"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.motherIncome}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }} />
            </Box>
            {/* Academic History */}
            <Box sx={{ display: "flex", flexDirection: "row", width: "80vw", mb: 4 }} columnGap={2}>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>Academic History</Typography>
                <TextField
                  label="Previous School Name"
                  name="previousSchoolName"
                  fullWidth
                  margin="normal"
                  value={formData.previousSchoolName}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Last Exam Passed"
                  name="lastExamPassed"
                  fullWidth
                  margin="normal"
                  value={formData.lastExamPassed}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Last Exam Result"
                  name="lastExamResult"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.lastExamResult}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Academic History</Typography>
                <TextField
                  label="Previous Admission Fee"
                  name="previousAdmissionFee"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.previousAdmissionFee}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Previous Monthly Fee"
                  name="previousMonthlyFee"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.previousMonthlyFee}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Reason of Transfer"
                  name="reasonOfTransfer"
                  fullWidth
                  margin="normal"
                  value={formData.reasonOfTransfer}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Academic History</Typography>
                <TextField
                  label="Previous School Medium"
                  name="previousSchoolMedium"
                  fullWidth
                  margin="normal"
                  value={formData.previousSchoolMedium}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Previous School Board"
                  name="previousSchoolBoard"
                  fullWidth
                  margin="normal"
                  value={formData.previousSchoolBoard}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Previous School City"
                  name="previousSchoolCity"
                  fullWidth
                  margin="normal"
                  value={formData.previousSchoolCity}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Academic History</Typography>
          
              </Box>
            </Box>
            {/* Miscellaneous */}
            <Box sx={{ display: "flex", flexDirection: "row", width: "80vw", mb: 4 }} columnGap={2}>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>Miscellaneous</Typography>
                <TextField
                  label="Health Immunization (JSON)"
                  name="healthImmunization"
                  fullWidth
                  margin="normal"
                  value={formData.healthImmunization}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Preferred Language"
                  name="preferredLanguage"
                  fullWidth
                  margin="normal"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Miscellaneous</Typography>
                <TextField
                  label="Dream or Aim"
                  name="dreamOrAim"
                  fullWidth
                  margin="normal"
                  value={formData.dreamOrAim}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Hobbies"
                  name="hobbies"
                  fullWidth
                  margin="normal"
                  value={formData.hobbies}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Miscellaneous</Typography>
                <TextField
                  label="Special Talents"
                  name="specialTalents"
                  fullWidth
                  margin="normal"
                  value={formData.specialTalents}
                  onChange={handleChange}
                  sx={textFieldStyles}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isScholarshipHolder"
                      checked={formData.isScholarshipHolder}
                      onChange={handleChange}
                      sx={{ color: "#fff" }}
                    />
                  }
                  label="Scholarship Holder"
                  sx={{ color: "#fff" }}
                />
              </Box>
              <Box sx={{ width: "19vw" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1, visibility: "hidden" }}>Miscellaneous</Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isTransportRequired"
                      checked={formData.isTransportRequired}
                      onChange={handleChange}
                      sx={{ color: "#fff" }}
                    />
                  }
                  label="Transport Required"
                  sx={{ color: "#fff" }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#000" }}>
          <Button onClick={handleCloseModal} variant="contained" color="error" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ backgroundColor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default DirectStudentDialog;
