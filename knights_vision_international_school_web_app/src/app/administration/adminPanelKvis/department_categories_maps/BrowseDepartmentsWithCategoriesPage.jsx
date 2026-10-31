import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  LinearProgress,
  Divider,
} from "@mui/material";
import { Add, RotateRight } from "@mui/icons-material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import DepartmentCategoryDialog from "./dialogs/DepartmentCategoryDialog";

const drawerWidth = 280;
const appBarHeight = 64;

const BrowseDepartmentsWithCategoriesPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/departments/id_name", {
        params: { take: 10 }, // Limit to top 10
      });
      const departmentsData = response.data;
      const departmentsWithCategories = await Promise.all(
        departmentsData.map(async (department) => {
          const categoriesResponse = await axios.get("/api/department-categories", {
            params: { departmentId: department.id },
          });
          return {
            ...department,
            categories: categoriesResponse.data.data.slice(0, 3), // Top 3 categories
          };
        })
      );
      setDepartments(departmentsWithCategories);
      setError(null);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to fetch departments.");
      toast.error("Failed to fetch departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenDialog = (department) => {
    setSelectedDepartment(department);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDepartment(null);
  };

  const handleSaveAndCloseDialog = () => {
    fetchDepartments();
    handleCloseDialog();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `${drawerWidth}px`,
        width: `calc(100vw - ${drawerWidth}px)`,
        height: `calc(100vh - ${appBarHeight}px)`,
        backgroundColor: "#000",
        color: "#fff",
        p: 1,
        overflowY: "auto",
      }}
    >
      <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
      {loading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0, backgroundColor: "#1e1e1e" }} />}
      <Box sx={{ bgcolor: "#1a237e", color: "#fff", p: 1, display: "flex", alignItems: "center" }}>
        <Typography variant="h6">Departments with Categories</Typography>
        <Button
          onClick={fetchDepartments}
          variant="outlined"
          sx={{
            position: "absolute",
            top: 8,
            color: "#fff",
            borderColor: "#555",
            "&:hover": { borderColor: "#777", backgroundColor: "#1e1e1e" },
          }}
          startIcon={<RotateRight sx={{ color: "#fff" }} />}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "row", p: 1 }}>
        <Box sx={{ flex: 1, pr: 1, maxHeight: "80vh", overflowY: "auto" }}>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Top 10 Departments</Typography>
          <Divider sx={{ mb: 2, bgcolor: "#fff" }} />
          {error && <Typography sx={{ mt: 2, color: "#ff5252" }}>{error}</Typography>}
          {departments.length > 0 ? (
            <Grid container spacing={3}>
              {departments.map((department) => (
                <Grid item xs={12} sm={6} lg={3} key={department.id}>
                  <Paper
                    elevation={3}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      backgroundColor: "#000",
                      borderRadius: 2,
                      overflow: "hidden",
                      maxWidth: "285px",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        backgroundColor: "#333",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="#bbb">No Image</Typography>
                    </Box>
                    <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
                        {department.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#00c853", fontWeight: 500 }}>
                        Categories:
                      </Typography>
                      {department.categories.length > 0 ? (
                        department.categories.map((map) => (
                          <Typography key={map.categoryId} variant="caption" sx={{ color: "#888" }}>
                            - {map.category.name}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="caption" sx={{ color: "#888" }}>
                          No categories mapped
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        sx={{ mt: 1, backgroundColor: "#555", "&:hover": { backgroundColor: "#777" } }}
                        onClick={() => handleOpenDialog(department)}
                        startIcon={<Add sx={{ color: "#fff" }} />}
                      >
                        Manage Categories
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No departments found.</Typography>
          )}
        </Box>
      </Box>

      <DepartmentCategoryDialog
        open={openDialog}
        setOpen={setOpenDialog}
        department={selectedDepartment}
        handleCloseDialog={handleCloseDialog}
      />
    </Box>
  );
};

export default BrowseDepartmentsWithCategoriesPage;