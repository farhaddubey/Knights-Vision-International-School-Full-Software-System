import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  DialogActions,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import StudentSelect from "@/components/sure-success-point-school/selectors/StudentSelect";
import SchoolBranchSelect from "@/components/sure-success-point-school/selectors/SchoolBranchSelect";
import SchoolClassSelect from "@/components/sure-success-point-school/selectors/SchoolClassSelect";
import SchoolSelect from "@/components/sure-success-point-school/selectors/SchoolSelect";

const drawerWidth = 280;
const appBarHeight = 64;

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00c853" },
  backgroundColor: "#333",
  borderRadius: "4px",
};

const genderOptions = ["Male", "Female", "Other"];
const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const nationalityOptions = [
  "Indian",
  "American",
  "British",
  "Canadian",
  "Australian",
  "Chinese",
  "Japanese",
  "German",
  "French",
  "Russian",
  "Brazilian",
  "Mexican",
  "Italian",
  "Spanish",
  "South African",
  "Nigerian",
  "Egyptian",
  "Pakistani",
  "Bangladeshi",
  "Indonesian",
  "Malaysian",
  "Singaporean",
  "Thai",
  "Vietnamese",
  "Korean",
  "Philippine",
  "Turkish",
  "Saudi Arabian",
  "Emirati",
  "Argentinian",
];
const religionOptions = [
  "Hinduism",
  "Islam",
  "Christianity",
  "Sikhism",
  "Buddhism",
  "Jainism",
  "Zoroastrianism",
  "Judaism",
  "Baha'i",
  "Atheism",
  "Agnosticism",
  "Other",
];
const casteCategoryOptions = ["General", "OBC", "SC", "ST", "EWS", "Other"];
const languageOptions = [
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Malayalam",
  "Kannada",
  "Oriya",
  "Punjabi",
  "Assamese",
  "Maithili",
  "Santhali",
  "Kashmiri",
  "Nepali",
  "Konkani",
  "Sindhi",
  "Dogri",
  "Manipuri",
  "Bodo",
  "Sanskrit",
  "Urdu",
  "French",
  "Spanish",
  "German",
  "Chinese",
  "Arabic",
  "Russian",
  "Other",
];
const professionOptions = [
  "Teacher",
  "Doctor",
  "Engineer",
  "Lawyer",
  "Business Owner",
  "Government Employee",
  "Private Sector Employee",
  "Farmer",
  "Accountant",
  "Software Developer",
  "Nurse",
  "Police Officer",
  "Military Personnel",
  "Scientist",
  "Journalist",
  "Artist",
  "Musician",
  "Architect",
  "Chef",
  "Pilot",
  "Banker",
  "Consultant",
  "Sales Manager",
  "Marketing Professional",
  "Entrepreneur",
  "Social Worker",
  "Civil Servant",
  "Shopkeeper",
  "Driver",
  "Homemaker",
  "Other",
];
const qualificationOptions = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "MBBS",
  "B.Tech",
  "M.Tech",
  "B.Com",
  "M.Com",
  "BBA",
  "MBA",
  "BCA",
  "MCA",
  "B.Sc",
  "M.Sc",
  "BA",
  "MA",
  "LLB",
  "LLM",
  "B.Ed",
  "M.Ed",
  "ITI",
  "Polytechnic",
  "CA",
  "CS",
  "ICWA",
  "No Formal Education",
  "Other",
];
const dreamOptions = [
  "Doctor",
  "Engineer",
  "Scientist",
  "Teacher",
  "Lawyer",
  "IAS Officer",
  "IPS Officer",
  "Software Developer",
  "Entrepreneur",
  "Pilot",
  "Astronaut",
  "Artist",
  "Musician",
  "Actor",
  "Journalist",
  "Athlete",
  "Civil Servant",
  "Chartered Accountant",
  "Architect",
  "Chef",
  "Fashion Designer",
  "Social Worker",
  "Environmentalist",
  "Researcher",
  "Banker",
  "Politician",
  "Writer",
  "Filmmaker",
  "Military Officer",
  "Other",
];
const schoolMediumOptions = [
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Malayalam",
  "Kannada",
  "Other",
];
const schoolBoardOptions = [
  "CBSE",
  "ICSE",
  "State Board",
  "IB",
  "IGCSE",
  "N/A",
  "Other",
];
const admissionCategoryOptions = [
  "Fees",
  "Economical+",
  "Economical",
  "General KSAT",
  "General Direct",
];
const statusOptions = ["PENDING", "APPROVED", "REJECTED"];

const AdmissionTestApplicationFormPanel = () => {
  const [customFields, setCustomFields] = useState({
    fatherProfession: "",
    motherProfession: "",
    fatherQualification: "",
    motherQualification: "",
    dreamOrAim: "",
    religion: "",
    nationality: "",
    casteCategory: "",
    preferredLanguage: "",
    previousSchoolMedium: "",
    previousSchoolBoard: "",
  });

  const [editFields, setEditFields] = useState([
    {
      studentUid: "",
      guardian_uid: "",
      studentId: "",
      firstName: "",
      lastName: "",
      middleName: "",
      gender: "",
      dateOfBirth: "",
      bloodGroup: "",
      nationality: "",
      religion: "",
      casteCategory: "",
      profileImageUrl: "",
      dreamOrAim: "",
      hobbies: "",
      specialTalents: "",
      previousSchoolName: "",
      lastExamPassed: "",
      lastExamResult: "",
      previousAdmissionFee: "",
      previousMonthlyFee: "",
      reasonOfTransfer: "",
      previousSchoolMedium: "",
      previousSchoolBoard: "",
      previousSchoolCity: "",
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
      guardianContact: "",
      guardianRelation: "",
      guardianAddress: "",
      emergencyContact: "",
      residentialAddress: "",
      city: "",
      state: "",
      pinCode: "",
      isTransportRequired: false,
      preferredLanguage: "",
      branchId: "",
      schoolId: "",
      classId: "",
      academicYear: 2025,
      status: "PENDING",
      category: "",
      admitCardNumber: "",
      qualified: false,
      totalMarks: "",
      rank: "",
      selectionRemarks: "",
      phaseSelected: "",
      admissionAllotmentDate: "",
      seatRoomId: "",
      seatRollNumber: "",
      finalAdmissionNumber: "",
      admissionConfirmedBy: "",
      remarksInternal: "",
    },
  ]);

  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...editFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setEditFields(updatedFields);
  };

  const handleCustomFieldChange = (field, value) => {
    setCustomFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleCloseModal = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Unsaved changes will be lost.",
      )
    ) {
      setEditFields([
        {
          studentUid: "",
          guardian_uid: "",
          studentId: "",
          firstName: "",
          lastName: "",
          middleName: "",
          gender: "",
          dateOfBirth: "",
          bloodGroup: "",
          nationality: "",
          religion: "",
          casteCategory: "",
          profileImageUrl: "",
          dreamOrAim: "",
          hobbies: "",
          specialTalents: "",
          previousSchoolName: "",
          lastExamPassed: "",
          lastExamResult: "",
          previousAdmissionFee: "",
          previousMonthlyFee: "",
          reasonOfTransfer: "",
          previousSchoolMedium: "",
          previousSchoolBoard: "",
          previousSchoolCity: "",
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
          guardianContact: "",
          guardianRelation: "",
          guardianAddress: "",
          emergencyContact: "",
          residentialAddress: "",
          city: "",
          state: "",
          pinCode: "",
          isTransportRequired: false,
          preferredLanguage: "",
          branchId: "",
          schoolId: "",
          classId: "",
          academicYear: 2025,
          status: "PENDING",
          category: "",
          admitCardNumber: "",
          qualified: false,
          totalMarks: "",
          rank: "",
          selectionRemarks: "",
          phaseSelected: "",
          admissionAllotmentDate: "",
          seatRoomId: "",
          seatRollNumber: "",
          finalAdmissionNumber: "",
          admissionConfirmedBy: "",
          remarksInternal: "",
        },
      ]);
      setCustomFields({
        fatherProfession: "",
        motherProfession: "",
        fatherQualification: "",
        motherQualification: "",
        dreamOrAim: "",
        religion: "",
        nationality: "",
        casteCategory: "",
        preferredLanguage: "",
        previousSchoolMedium: "",
        previousSchoolBoard: "",
      });
    }
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    if (
      !editFields[0].firstName ||
      !editFields[0].lastName ||
      !editFields[0].gender ||
      !editFields[0].dateOfBirth ||
      !editFields[0].category
    ) {
      toast.error(
        "Please fill all required fields (First Name, Last Name, Gender, Date of Birth, Category).",
      );
      return;
    }

    try {
      const payload = {
        studentUid: editFields[0].studentUid || null,
        guardian_uid: editFields[0].guardian_uid || null,
        studentId: editFields[0].studentId || null,
        firstName: editFields[0].firstName || null,
        middleName: editFields[0].middleName || null,
        lastName: editFields[0].lastName || null,
        gender: editFields[0].gender || null,
        dateOfBirth: editFields[0].dateOfBirth
          ? new Date(editFields[0].dateOfBirth).toISOString()
          : null,
        bloodGroup: editFields[0].bloodGroup || null,
        nationality:
          editFields[0].nationality === "Other"
            ? customFields.nationality
            : editFields[0].nationality || null,
        religion:
          editFields[0].religion === "Other"
            ? customFields.religion
            : editFields[0].religion || null,
        casteCategory:
          editFields[0].casteCategory === "Other"
            ? customFields.casteCategory
            : editFields[0].casteCategory || null,
        profileImageUrl: editFields[0].profileImageUrl || null,
        dreamOrAim:
          editFields[0].dreamOrAim === "Other"
            ? customFields.dreamOrAim
            : editFields[0].dreamOrAim || null,
        hobbies: editFields[0].hobbies || null,
        specialTalents: editFields[0].specialTalents || null,
        previousSchoolName: editFields[0].previousSchoolName || null,
        lastExamPassed: editFields[0].lastExamPassed || null,
        lastExamResult: editFields[0].lastExamResult
          ? parseFloat(editFields[0].lastExamResult)
          : null,
        previousAdmissionFee: editFields[0].previousAdmissionFee
          ? parseFloat(editFields[0].previousAdmissionFee)
          : null,
        previousMonthlyFee: editFields[0].previousMonthlyFee
          ? parseFloat(editFields[0].previousMonthlyFee)
          : null,
        reasonOfTransfer: editFields[0].reasonOfTransfer || null,
        previousSchoolMedium:
          editFields[0].previousSchoolMedium === "Other"
            ? customFields.previousSchoolMedium
            : editFields[0].previousSchoolMedium || null,
        previousSchoolBoard:
          editFields[0].previousSchoolBoard === "Other"
            ? customFields.previousSchoolBoard
            : editFields[0].previousSchoolBoard || null,
        previousSchoolCity: editFields[0].previousSchoolCity || null,
        fatherName: editFields[0].fatherName || null,
        fatherContact: editFields[0].fatherContact || null,
        fatherEmail: editFields[0].fatherEmail || null,
        fatherProfession:
          editFields[0].fatherProfession === "Other"
            ? customFields.fatherProfession
            : editFields[0].fatherProfession || null,
        fatherQualification:
          editFields[0].fatherQualification === "Other"
            ? customFields.fatherQualification
            : editFields[0].fatherQualification || null,
        fatherIncome: editFields[0].fatherIncome
          ? parseFloat(editFields[0].fatherIncome)
          : null,
        motherName: editFields[0].motherName || null,
        motherContact: editFields[0].motherContact || null,
        motherEmail: editFields[0].motherEmail || null,
        motherProfession:
          editFields[0].motherProfession === "Other"
            ? customFields.motherProfession
            : editFields[0].motherProfession || null,
        motherQualification:
          editFields[0].motherQualification === "Other"
            ? customFields.motherQualification
            : editFields[0].motherQualification || null,
        motherIncome: editFields[0].motherIncome
          ? parseFloat(editFields[0].motherIncome)
          : null,
        guardianName: editFields[0].guardianName || null,
        guardianContact: editFields[0].guardianContact || null,
        guardianRelation: editFields[0].guardianRelation || null,
        guardianAddress: editFields[0].guardianAddress || null,
        emergencyContact: editFields[0].emergencyContact || null,
        residentialAddress: editFields[0].residentialAddress || null,
        city: editFields[0].city || null,
        state: editFields[0].state || null,
        pinCode: editFields[0].pinCode || null,
        isTransportRequired: editFields[0].isTransportRequired || false,
        preferredLanguage:
          editFields[0].preferredLanguage === "Other"
            ? customFields.preferredLanguage
            : editFields[0].preferredLanguage || null,
        branchId: editFields[0].branchId || null,
        schoolId: editFields[0].schoolId
          ? parseInt(editFields[0].schoolId)
          : null,
        classId: editFields[0].classId || null,
        academicYear: editFields[0].academicYear
          ? parseInt(editFields[0].academicYear)
          : 2025,
        status: editFields[0].status || "PENDING",
        category: editFields[0].category || null,
        admitCardNumber: editFields[0].admitCardNumber || null,
        qualified: editFields[0].qualified || false,
        totalMarks: editFields[0].totalMarks
          ? parseFloat(editFields[0].totalMarks)
          : null,
        rank: editFields[0].rank ? parseInt(editFields[0].rank) : null,
        selectionRemarks: editFields[0].selectionRemarks || null,
        phaseSelected: editFields[0].phaseSelected || null,
        admissionAllotmentDate: editFields[0].admissionAllotmentDate
          ? new Date(editFields[0].admissionAllotmentDate).toISOString()
          : null,
        seatRoomId: editFields[0].seatRoomId
          ? parseInt(editFields[0].seatRoomId)
          : null,
        seatRollNumber: editFields[0].seatRollNumber || null,
        finalAdmissionNumber: editFields[0].finalAdmissionNumber || null,
        admissionConfirmedBy: editFields[0].admissionConfirmedBy || null,
        remarksInternal: editFields[0].remarksInternal || null,
      };

      await axios.post("/api/admission-test-applications", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("🎉 Application saved successfully!");
      setEditFields([
        {
          studentUid: "",
          guardian_uid: "",
          studentId: "",
          firstName: "",
          lastName: "",
          middleName: "",
          gender: "",
          dateOfBirth: "",
          bloodGroup: "",
          nationality: "",
          religion: "",
          casteCategory: "",
          profileImageUrl: "",
          dreamOrAim: "",
          hobbies: "",
          specialTalents: "",
          previousSchoolName: "",
          lastExamPassed: "",
          lastExamResult: "",
          previousAdmissionFee: "",
          previousMonthlyFee: "",
          reasonOfTransfer: "",
          previousSchoolMedium: "",
          previousSchoolBoard: "",
          previousSchoolCity: "",
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
          guardianContact: "",
          guardianRelation: "",
          guardianAddress: "",
          emergencyContact: "",
          residentialAddress: "",
          city: "",
          state: "",
          pinCode: "",
          isTransportRequired: false,
          preferredLanguage: "",
          branchId: "",
          schoolId: "",
          classId: "",
          academicYear: 2025,
          status: "PENDING",
          category: "",
          admitCardNumber: "",
          qualified: false,
          totalMarks: "",
          rank: "",
          selectionRemarks: "",
          phaseSelected: "",
          admissionAllotmentDate: "",
          seatRoomId: "",
          seatRollNumber: "",
          finalAdmissionNumber: "",
          admissionConfirmedBy: "",
          remarksInternal: "",
        },
      ]);
      setCustomFields({
        fatherProfession: "",
        motherProfession: "",
        fatherQualification: "",
        motherQualification: "",
        dreamOrAim: "",
        religion: "",
        nationality: "",
        casteCategory: "",
        preferredLanguage: "",
        previousSchoolMedium: "",
        previousSchoolBoard: "",
      });
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      toast.error("❌ Error saving application.");
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: "#212121",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
        overflow: "auto",
        bgcolor: "#000",
      }}
    >
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
          backgroundColor: "#212121",
          color: "#fff",
          "&:hover": { backgroundColor: "#212121" },
        }}
      >
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary="New Admission Test Application"
        />
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
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
          p: 2,
        }}
      >
        <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
          {editFields.map((field, index) => (
            <Box key={index}>
              <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
                Personal Details
              </Typography>
              <TextField
                sx={textFieldStyles}
                label="Student UID"
                fullWidth
                margin="normal"
                value={field.studentUid ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "studentUid", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Guardian UID"
                fullWidth
                margin="normal"
                value={field.guardian_uid ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "guardian_uid", e.target.value)
                }
              />
              <StudentSelect
                selectedStudent={field.studentId}
                setSelectedStudent={(value) =>
                  handleFieldChange(index, "studentId", value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="First Name"
                fullWidth
                margin="normal"
                value={field.firstName ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "firstName", e.target.value)
                }
                required
              />
              <TextField
                sx={textFieldStyles}
                label="Middle Name"
                fullWidth
                margin="normal"
                value={field.middleName ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "middleName", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Last Name"
                fullWidth
                margin="normal"
                value={field.lastName ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "lastName", e.target.value)
                }
                required
              />
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={field.gender ?? ""}
                  onChange={(e) =>
                    handleFieldChange(index, "gender", e.target.value)
                  }
                  required
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  {genderOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                sx={textFieldStyles}
                label="Date of Birth"
                type="date"
                fullWidth
                margin="normal"
                value={field.dateOfBirth ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "dateOfBirth", e.target.value)
                }
                required
              />
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Blood Group</InputLabel>
                <Select
                  value={field.bloodGroup ?? ""}
                  onChange={(e) =>
                    handleFieldChange(index, "bloodGroup", e.target.value)
                  }
                >
                  <MenuItem value="">Select Blood Group</MenuItem>
                  {bloodGroupOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Nationality</InputLabel>
                <Select
                  value={field.nationality ?? ""}
                  onChange={(e) =>
                    handleFieldChange(index, "nationality", e.target.value)
                  }
                >
                  <MenuItem value="">Select Nationality</MenuItem>
                  {nationalityOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field.nationality === "Other" && (
                <TextField
                  sx={textFieldStyles}
                  label="Custom Nationality"
                  fullWidth
                  margin="normal"
                  value={customFields.nationality}
                  onChange={(e) =>
                    handleCustomFieldChange("nationality", e.target.value)
                  }
                />
              )}
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Religion</InputLabel>
                <Select
                  value={field.religion ?? ""}
                  onChange={(e) =>
                    handleFieldChange(index, "religion", e.target.value)
                  }
                >
                  <MenuItem value="">Select Religion</MenuItem>
                  {religionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field.religion === "Other" && (
                <TextField
                  sx={textFieldStyles}
                  label="Custom Religion"
                  fullWidth
                  margin="normal"
                  value={customFields.religion}
                  onChange={(e) =>
                    handleCustomFieldChange("religion", e.target.value)
                  }
                />
              )}
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Caste Category</InputLabel>
                <Select
                  value={field.casteCategory ?? ""}
                  onChange={(e) =>
                    handleFieldChange(index, "casteCategory", e.target.value)
                  }
                >
                  <MenuItem value="">Select Caste Category</MenuItem>
                  {casteCategoryOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field.casteCategory === "Other" && (
                <TextField
                  sx={textFieldStyles}
                  label="Custom Caste Category"
                  fullWidth
                  margin="normal"
                  value={customFields.casteCategory}
                  onChange={(e) =>
                    handleCustomFieldChange("casteCategory", e.target.value)
                  }
                />
              )}
              <TextField
                sx={textFieldStyles}
                label="Profile Image URL"
                fullWidth
                margin="normal"
                value={field.profileImageUrl ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "profileImageUrl", e.target.value)
                }
              />
              <Divider sx={{ my: 2, bgcolor: "#555" }} />
              <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
                Aspirational Details
              </Typography>
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Dream or Aim</InputLabel>
                <Select
                  value={field.dreamOrAim ?? ""}
                  onChange={(e) =>
                    handleFieldChange(index, "dreamOrAim", e.target.value)
                  }
                >
                  <MenuItem value="">Select Dream or Aim</MenuItem>
                  {dreamOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field.dreamOrAim === "Other" && (
                <TextField
                  sx={textFieldStyles}
                  label="Custom Dream or Aim"
                  fullWidth
                  margin="normal"
                  value={customFields.dreamOrAim}
                  onChange={(e) =>
                    handleCustomFieldChange("dreamOrAim", e.target.value)
                  }
                />
              )}
              <TextField
                sx={textFieldStyles}
                label="Hobbies"
                fullWidth
                margin="normal"
                value={field.hobbies ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "hobbies", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Special Talents"
                fullWidth
                margin="normal"
                value={field.specialTalents ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "specialTalents", e.target.value)
                }
              />
              <Divider sx={{ my: 2, bgcolor: "#555" }} />
              <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
                Previous School Details
              </Typography>
              <TextField
                sx={textFieldStyles}
                label="Previous School Name"
                fullWidth
                margin="normal"
                value={field.previousSchoolName ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "previousSchoolName", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Last Exam Passed"
                fullWidth
                margin="normal"
                value={field.lastExamPassed ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "lastExamPassed", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Last Exam Result"
                type="number"
                fullWidth
                margin="normal"
                value={field.lastExamResult ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "lastExamResult", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Previous Admission Fee"
                type="number"
                fullWidth
                margin="normal"
                value={field.previousAdmissionFee ?? ""}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    "previousAdmissionFee",
                    e.target.value,
                  )
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Previous Monthly Fee"
                type="number"
                fullWidth
                margin="normal"
                value={field.previousMonthlyFee ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "previousMonthlyFee", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Reason of Transfer"
                fullWidth
                margin="normal"
                value={field.reasonOfTransfer ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "reasonOfTransfer", e.target.value)
                }
              />
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Previous School Medium</InputLabel>
                <Select
                  value={field.previousSchoolMedium ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      "previousSchoolMedium",
                      e.target.value,
                    )
                  }
                >
                  <MenuItem value="">Select Medium</MenuItem>
                  {schoolMediumOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field.previousSchoolMedium === "Other" && (
                <TextField
                  sx={textFieldStyles}
                  label="Custom School Medium"
                  fullWidth
                  margin="normal"
                  value={customFields.previousSchoolMedium}
                  onChange={(e) =>
                    handleCustomFieldChange(
                      "previousSchoolMedium",
                      e.target.value,
                    )
                  }
                />
              )}
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Previous School Board</InputLabel>
                <Select
                  value={field.previousSchoolBoard ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      "previousSchoolBoard",
                      e.target.value,
                    )
                  }
                >
                  <MenuItem value="">Select Board</MenuItem>
                  {schoolBoardOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field.previousSchoolBoard === "Other" && (
                <TextField
                  sx={textFieldStyles}
                  label="Custom School Board"
                  fullWidth
                  margin="normal"
                  value={customFields.previousSchoolBoard}
                  onChange={(e) =>
                    handleCustomFieldChange(
                      "previousSchoolBoard",
                      e.target.value,
                    )
                  }
                />
              )}
              <TextField
                sx={textFieldStyles}
                label="Previous School City"
                fullWidth
                margin="normal"
                value={field.previousSchoolCity ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "previousSchoolCity", e.target.value)
                }
              />
              <Divider sx={{ my: 2, bgcolor: "#555" }} />
              <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
                Admission Test Details
              </Typography>
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={field.category ?? ""}
                  onChange={(e) =>
                    handleFieldChange(index, "category", e.target.value)
                  }
                  required
                >
                  <MenuItem value="">Select Category</MenuItem>
                  {admissionCategoryOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Qualified</InputLabel>
                <Select
                  value={field.qualified ? "Yes" : "No"}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      "qualified",
                      e.target.value === "Yes",
                    )
                  }
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
              <TextField
                sx={textFieldStyles}
                label="Total Marks"
                type="number"
                fullWidth
                margin="normal"
                value={field.totalMarks ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "totalMarks", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Rank"
                type="number"
                fullWidth
                margin="normal"
                value={field.rank ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "rank", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Selection Remarks"
                fullWidth
                margin="normal"
                value={field.selectionRemarks ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "selectionRemarks", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Phase Selected"
                fullWidth
                margin="normal"
                value={field.phaseSelected ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "phaseSelected", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Admit Card Number"
                fullWidth
                margin="normal"
                value={field.admitCardNumber ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "admitCardNumber", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Admission Allotment Date"
                type="date"
                fullWidth
                margin="normal"
                value={field.admissionAllotmentDate ?? ""}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    "admissionAllotmentDate",
                    e.target.value,
                  )
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Seat Room ID"
                type="number"
                fullWidth
                margin="normal"
                value={field.seatRoomId ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "seatRoomId", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Seat Roll Number"
                fullWidth
                margin="normal"
                value={field.seatRollNumber ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "seatRollNumber", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Final Admission Number"
                fullWidth
                margin="normal"
                value={field.finalAdmissionNumber ?? ""}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    "finalAdmissionNumber",
                    e.target.value,
                  )
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Admission Confirmed By"
                fullWidth
                margin="normal"
                value={field.admissionConfirmedBy ?? ""}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    "admissionConfirmedBy",
                    e.target.value,
                  )
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Internal Remarks"
                fullWidth
                margin="normal"
                value={field.remarksInternal ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "remarksInternal", e.target.value)
                }
              />
            </Box>
          ))}
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
          {editFields.map((field, index) => (
            <Box key={index}>
              <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
                Parent/Guardian Details
              </Typography>
              <TextField
                sx={textFieldStyles}
                label="Father's Name"
                fullWidth
                margin="normal"
                value={field.fatherName ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "fatherName", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Father's Contact"
                fullWidth
                margin="normal"
                value={field.fatherContact ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "fatherContact", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Father's Email"
                fullWidth
                margin="normal"
                value={field.fatherEmail ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "fatherEmail", e.target.value)
                }
              />
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Father's Profession</InputLabel>
                <Select
                  value={field.fatherProfession ?? ""}
                  onChange={(e) =>
                    handleFieldChange(index, "fatherProfession", e.target.value)
                  }
                >
                  <MenuItem value="">Select Profession</MenuItem>
                  {professionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field.fatherProfession === "Other" && (
                <TextField
                  sx={textFieldStyles}
                  label="Custom Father's Profession"
                  fullWidth
                  margin="normal"
                  value={customFields.fatherProfession}
                  onChange={(e) =>
                    handleCustomFieldChange("fatherProfession", e.target.value)
                  }
                />
              )}
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Father's Qualification</InputLabel>
                <Select
                  value={field.fatherQualification ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      "fatherQualification",
                      e.target.value,
                    )
                  }
                >
                  <MenuItem value="">Select Qualification</MenuItem>
                  {qualificationOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field.fatherQualification === "Other" && (
                <TextField
                  sx={textFieldStyles}
                  label="Custom Father's Qualification"
                  fullWidth
                  margin="normal"
                  value={customFields.fatherQualification}
                  onChange={(e) =>
                    handleCustomFieldChange(
                      "fatherQualification",
                      e.target.value,
                    )
                  }
                />
              )}
              <TextField
                sx={textFieldStyles}
                label="Father's Income"
                type="number"
                fullWidth
                margin="normal"
                value={field.fatherIncome ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "fatherIncome", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Mother's Name"
                fullWidth
                margin="normal"
                value={field.motherName ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "motherName", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Mother's Contact"
                fullWidth
                margin="normal"
                value={field.motherContact ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "motherContact", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Mother's Email"
                fullWidth
                margin="normal"
                value={field.motherEmail ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "motherEmail", e.target.value)
                }
              />
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Mother's Profession</InputLabel>
                <Select
                  value={field.motherProfession ?? ""}
                  onChange={(e) =>
                    handleFieldChange(index, "motherProfession", e.target.value)
                  }
                >
                  <MenuItem value="">Select Profession</MenuItem>
                  {professionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field.motherProfession === "Other" && (
                <TextField
                  sx={textFieldStyles}
                  label="Custom Mother's Profession"
                  fullWidth
                  margin="normal"
                  value={customFields.motherProfession}
                  onChange={(e) =>
                    handleCustomFieldChange("motherProfession", e.target.value)
                  }
                />
              )}
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Mother's Qualification</InputLabel>
                <Select
                  value={field.motherQualification ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      "motherQualification",
                      e.target.value,
                    )
                  }
                >
                  <MenuItem value="">Select Qualification</MenuItem>
                  {qualificationOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field.motherQualification === "Other" && (
                <TextField
                  sx={textFieldStyles}
                  label="Custom Mother's Qualification"
                  fullWidth
                  margin="normal"
                  value={customFields.motherQualification}
                  onChange={(e) =>
                    handleCustomFieldChange(
                      "motherQualification",
                      e.target.value,
                    )
                  }
                />
              )}
              <TextField
                sx={textFieldStyles}
                label="Mother's Income"
                type="number"
                fullWidth
                margin="normal"
                value={field.motherIncome ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "motherIncome", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Guardian's Name"
                fullWidth
                margin="normal"
                value={field.guardianName ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "guardianName", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Guardian's Contact"
                fullWidth
                margin="normal"
                value={field.guardianContact ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "guardianContact", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Guardian's Relation"
                fullWidth
                margin="normal"
                value={field.guardianRelation ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "guardianRelation", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Guardian's Address"
                fullWidth
                margin="normal"
                value={field.guardianAddress ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "guardianAddress", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Emergency Contact"
                fullWidth
                margin="normal"
                value={field.emergencyContact ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "emergencyContact", e.target.value)
                }
              />
              <Divider sx={{ my: 2, bgcolor: "#555" }} />
              <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
                Address Details
              </Typography>
              <TextField
                sx={textFieldStyles}
                label="Residential Address"
                fullWidth
                margin="normal"
                value={field.residentialAddress ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "residentialAddress", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="City"
                fullWidth
                margin="normal"
                value={field.city ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "city", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="State"
                fullWidth
                margin="normal"
                value={field.state ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "state", e.target.value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Pin Code"
                fullWidth
                margin="normal"
                value={field.pinCode ?? ""}
                onChange={(e) =>
                  handleFieldChange(index, "pinCode", e.target.value)
                }
              />
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Transport Required</InputLabel>
                <Select
                  value={field.isTransportRequired ? "Yes" : "No"}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      "isTransportRequired",
                      e.target.value === "Yes",
                    )
                  }
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Preferred Language</InputLabel>
                <Select
                  value={field.preferredLanguage ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      "preferredLanguage",
                      e.target.value,
                    )
                  }
                >
                  <MenuItem value="">Select Language</MenuItem>
                  {languageOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field.preferredLanguage === "Other" && (
                <TextField
                  sx={textFieldStyles}
                  label="Custom Preferred Language"
                  fullWidth
                  margin="normal"
                  value={customFields.preferredLanguage}
                  onChange={(e) =>
                    handleCustomFieldChange("preferredLanguage", e.target.value)
                  }
                />
              )}
              <Divider sx={{ my: 2, bgcolor: "#555" }} />
              <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
                School Details
              </Typography>
              <SchoolSelect
                selectedSchool={field.schoolId}
                setSelectedSchool={(value) =>
                  handleFieldChange(index, "schoolId", value)
                }
              />
              <SchoolBranchSelect
                selectedBranch={field.branchId}
                setSelectedBranch={(value) =>
                  handleFieldChange(index, "branchId", e.target.value)
                }
              />
              <SchoolClassSelect
                selectedClass={field.classId}
                setSelectedClass={(value) =>
                  handleFieldChange(index, "classId", value)
                }
              />
              <TextField
                sx={textFieldStyles}
                label="Academic Year"
                type="number"
                fullWidth
                margin="normal"
                value={field.academicYear ?? 2025}
                onChange={(e) =>
                  handleFieldChange(index, "academicYear", e.target.value)
                }
              />
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={field.status ?? "PENDING"}
                  onChange={(e) =>
                    handleFieldChange(index, "status", e.target.value)
                  }
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ))}
        </Box>
      </Box>
      <DialogActions>
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            color="error"
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Box>
  );
};

export default AdmissionTestApplicationFormPanel;
