import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
} from "@mui/material";
import { Add, RotateRight } from "@mui/icons-material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import LegalProblemDialog from "./dialogs/BrowseLegalProblemsDialog";
import Image from "next/image";

const drawerWidth = 280;
const appBarHeight = 64;

const BrowseLegalProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState(null);

  const fetchProblems = async () => {
    setApiLoading(true);
    try {
      const response = await axios.get("/api/legal-problems");
      setProblems(response.data.data);
      toast.success("Problems fetched successfully!");
    } catch (error) {
      console.error("Error fetching legal problems:", error);
      toast.error("Failed to fetch legal problems.");
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleInsertionOpenModal = (problem = null) => {
    setEditFields(
      problem || {
        title: "",
        description: "",
        departmentId: "",
        categoryId: "",
        brandId: "",
        serviceId: "",
        iconUrl: "",
        keywords: [],
        translations: { en: "", hi: "" },
      }
    );
    setOpenInsertion(true);
  };

  const handleCloseModal = () => {
    setOpenInsertion(false);
    setEditFields(null);
  };

  const handleSaveAndCloseModal = () => {
    fetchProblems();
    handleCloseModal();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        height: `calc(100% - ${appBarHeight}px)`,
        bgcolor: "#000",
        color: "#fff",
      }}
    >
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0, backgroundColor: "#1e1e1e" }} />}
      <ListItem sx={{ bgcolor: "#1a237e", color: "#fff" }}>
        <ListItemText primary="Browse Legal Problems" />
        <Button
          onClick={() => handleInsertionOpenModal()}
          variant="contained"
          sx={{ mr: 1, backgroundColor: "#555", "&:hover": { backgroundColor: "#777" } }}
          startIcon={<Add sx={{ color: "#fff" }} />}
        >
          Add Problem
        </Button>
        <Button
          onClick={fetchProblems}
          variant="outlined"
          sx={{ color: "#fff", borderColor: "#555", "&:hover": { borderColor: "#777", backgroundColor: "#1e1e1e" } }}
          startIcon={<RotateRight sx={{ color: "#fff" }} />}
        >
          Refresh
        </Button>
      </ListItem>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, m: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            color: "#fff",
            bgcolor: "#212121",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
            <Typography variant="body2" sx={{ flex: .6, fontWeight: "bold" }}>
            Img
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold" }}>
            Title
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold" }}>
            Category
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold" }}>
            Department
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold" }}>
            Keywords
          </Typography>
          <Typography variant="body2" sx={{ flex: .3, fontWeight: "bold" }}>
            Actions
          </Typography>
        </Box>

        <Box
          sx={{
            maxHeight: "calc(100vh - 160px)",
            overflowY: "auto",
            bgcolor: "#000",
            color: "#fff",
            borderRadius: 1,
          }}
        >
          <List>
            {problems.map((problem) => (
              <ListItem
                key={problem.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1,
                  bgcolor: "#000",
                  color: "#fff",
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <Box sx={{flex:.6}}><Image width={60} height={60} src={problem?.iconUrl}/></Box>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {problem.title}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {problem.category?.name ?? "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {problem.department?.name ?? "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {Array.isArray(problem.keywords) && problem.keywords.length ? problem.keywords.join(", ") : "None"}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#555", "&:hover": { backgroundColor: "#777" }, flex:.3 }}
                  onClick={() => handleInsertionOpenModal(problem)}
                >
                  Explore
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <LegalProblemDialog
        open={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchProblems={fetchProblems}
      />
    </Box>
  );
};

export default BrowseLegalProblemsPage;