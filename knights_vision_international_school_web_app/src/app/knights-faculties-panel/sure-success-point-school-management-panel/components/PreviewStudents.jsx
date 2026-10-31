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
  Pagination,
  PaginationItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  EmojiPeople,
  AppRegistrationRounded,
} from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 100;

const DirectStudents = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editFields, setEditFields] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchStudents = async (pageNum = 1, search = "") => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `/api-schools-panel/students/direct_view_gci/${className}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: pageNum, pageSize, searchQuery: search },
        }
      );

      if (!response.data || !Array.isArray(response.data.students)) {
        throw new Error("Invalid response format");
      }

      setStudents(response.data.students);
      setFilteredStudents(response.data.students);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students.");
      toast.error("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(page, searchQuery);
  }, [page, className]);

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          `${student.firstName} ${student.lastName}`
            .toLowerCase()
            .includes(query) ||
          student.admissionNumber?.toLowerCase().includes(query) ||
          student.rollNumber?.toLowerCase().includes(query) ||
          student.studentCategory?.toLowerCase().includes(query) ||
          student.class?.branchName?.toLowerCase().includes(query) ||
          student.class?.section?.toLowerCase().includes(query) ||
          student.feeSchemeCategory?.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchStudents(value, searchQuery);
  };

  const handleOpenModal = (student = {}) => {
    toast.success("Opening Modal");
    setEditFields(student);
    setOpen(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
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
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: "#212121",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
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
          backgroundColor: "#b71c1c",
          color: "#fff",
          "&:hover": { backgroundColor: "#b71c1c" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "4px 16px",
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ color: "#fff" }}>
          <EmojiPeople />
        </ListItemIcon>
        <ListItemText primary={`${className} Direct Admission Students`} />
        <TextField
          variant="outlined"
          placeholder="Search Students..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#fff", mr: 1 }} />,
            style: { color: "#fff", backgroundColor: "#333", borderRadius: 4 },
          }}
          sx={{
            width: "300px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#fff" },
              "&:hover fieldset": { borderColor: "#fff" },
              "&.Mui-focused fieldset": { borderColor: "#00c853" },
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal({})}
          sx={{ backgroundColor: "#00c853", color: "#000" }}
        >
          <AppRegistrationRounded /> Add Student
        </Button>
      </ListItemButton>

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
            zIndex: 10,
          }}
        >
          <Typography
            variant="body1"
            sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}
          >
            ID
          </Typography>
          <Typography
            variant="body1"
            sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}
          >
            Student Info
          </Typography>
          <Typography
            variant="body1"
            sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}
          >
            Admission & Class
          </Typography>
          <Typography
            variant="body1"
            sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}
          >
            Guardian Info
          </Typography>
          <Typography
            variant="body1"
            sx={{ flex: 1.4, fontWeight: "bold", color: "#fff" }}
          >
            Parents Info
          </Typography>
          <Typography
            variant="body1"
            sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}
          >
            Fee Scheme
          </Typography>
        </Box>
        <Box
          sx={{
            maxHeight: "82vh",
            overflowY: "auto",
            bgcolor: "#121212",
            borderRadius: 1,
          }}
        >
          <List>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <ListItem
                  key={student.id}
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
                  <Typography variant="body1" sx={{ flex: 0.3, color: "#b0b0b0" }}>
                    {student.id}
                  </Typography>
                  <Typography variant="body1" sx={{ flex: 1, color: "#b0b0b0" }}>
                    <span style={{ color: "#00c853" }}>
                      {`${student.firstName} ${student.middleName || ""} ${
                        student.lastName
                      }`}
                    </span>
                    <br />
                    Gender: {student.gender || "N/A"}
                    <br />
DOB: {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric"
}) : "N/A"}
                    <br />
                    Category: {student.studentCategory || "N/A"}
                    <br />
                    Aadhaar: {student.aadhaarNumber || "N/A"}
                    <br />
                    Address: {student.residentialAddress || "N/A"}
                    <br />
                    City: {student.city || "N/A"}
                    <br />
                    Pin: {student.pinCode || "N/A"}
                  </Typography>
                  <Typography variant="body1" sx={{ flex: 1.2, color: "#b0b0b0" }}>
                    Roll No: {student.rollNumber || "N/A"}
                    <br />
                    Adm Date: {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric"
}) : "N/A"}
                    <br />
                    Status: {student.status || "N/A"}
                    <br />
                    Scholarship: {student.isScholarshipHolder ? "Yes" : "No"}
                    <br />
                    Transport: {student.isTransportRequired ? "Yes" : "No"}
                    <br />
                    <span style={{ color: "#2196f3" }}>
                      Class: {student.class?.name || "N/A"}-{student.class?.section || "N/A"}
                    </span>
                    <br />
                    <span style={{ color: "#2196f3" }}>
                      Branch: {student.class?.branchName || "N/A"}
                    </span>
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ flex: 1.2, color: "#b0b0b0" }}
                  >
                    <span style={{ color: "#ffca28" }}>
                      {student.guardianName || "N/A"}
                    </span>
                    <br />
                    <span style={{ color: "#ffca28" }}>
                      Phone: {student.guardianContact || "N/A"}
                    </span>
                    <br />
                    Relation: {student.guardianRelation || "N/A"}
                    <br />
                    Address: {student.guardianAddress || "N/A"}
                    <br/>
                                        <span style={{ color: "#ff5722" }}>
                      Father: {student.fatherName || "N/A"}
                    </span>
                    <br />
                    <span style={{ color: "#ff5722" }}>
                      Phone: {student.fatherContact || "N/A"}
                    </span>
                    <br />
                    Profession: {student.fatherProfession || "N/A"}
                    <br />
                    Income: {student.fatherIncome || "N/A"}
                    <br />
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ flex: 1.4, color: "#b0b0b0" }}
                  >
                   Father Qualification: {student.fatherQualification || "N/A"}
                    <br />
                    <span style={{ color: "#ab47bc" }}>
                      Mother: {student.motherName || "N/A"}
                    </span>
                    <br />
                    <span style={{ color: "#ab47bc" }}>
                      Phone: {student.motherContact || "N/A"}
                    </span>
                    <br />
                    Email: {student.motherEmail || "N/A"}
                    <br />
                    Profession: {student.motherProfession || "N/A"}
                    <br />
                    Income: {student.motherIncome || "N/A"}
                    <br />
                    Address: {student.residentialAddress || "N/A"}
                  </Typography>
                  <Typography variant="body1" sx={{ flex: 1, color: "#b0b0b0" }}>
                    Category: {student.feeSchemeCategory || "N/A"}
                    <br />
                    <span style={{ color: "#21f321ff" }}>
                      Monthly: {student.feeMonthly || "N/A"}
                    </span>
                    <br />
                    Admission: {student.admissionFee || "N/A"}
                    <br />
                    Readmission: {student.readmissionFee || "N/A"}
                  </Typography>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#b0b0b0", textAlign: "center", p: 2 }}>
                No students found for {className} (Direct Admission).
              </Typography>
            )}
          </List>
        </Box>
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: "56%",
            transform: "translateX(-50%)",
            zIndex: 1300,
            display: "flex",
            justifyContent: "center",
            p: 1,
            bgcolor: "#181818",
            borderRadius: 2,
            boxShadow: 4,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#fff",
                "&:hover": { bgcolor: "#333" },
                "&.Mui-selected": {
                  bgcolor: "#00c853",
                  color: "#000",
                  "&:hover": { bgcolor: "#00c853" },
                },
              },
            }}
            renderItem={(item) => (
              <PaginationItem
                components={{ previous: ChevronLeft, next: ChevronRight }}
                {...item}
              />
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DirectStudents;