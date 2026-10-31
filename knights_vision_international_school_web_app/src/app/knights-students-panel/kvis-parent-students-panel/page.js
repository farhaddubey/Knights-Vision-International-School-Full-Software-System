"use client";
import {
  Avatar,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  Button,
  List,
  ListItem,
  Divider,
} from "@mui/material";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import TDILLogo from "@/components/sure-success-point-school/brand/SureSuccessPointSchoolIdentityMark";
import TDILCSIcon from "@/components/sure-success-point-school/brand/SureSuccessPointSchoolIdentityMark";

const drawerWidth = 280;
const defaultImage = "https://via.placeholder.com/1920x1080?text=Default+Background";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [carouselImages, setCarouselImages] = useState([]);
  const router = useRouter();
  const [appBarHeight, setAppBarHeight] = useState(64);

  useEffect(() => {
    const toolbar = document.querySelector('.MuiToolbar-root');
    if (toolbar) setAppBarHeight(toolbar.clientHeight);
  }, []);

  // Generate keyframes dynamically based on the number of images
  const generateKeyframes = (images) => {
    const validImages = Array.isArray(images) && images.length > 0 ? images : [defaultImage];
    const totalImages = validImages.length;
    const percentageStep = 100 / totalImages;
    const keyframes = {};

    validImages.forEach((image, index) => {
      const percentage = (index * percentageStep).toFixed(2);
      keyframes[`${percentage}%`] = {
        background: `url("${image}") center/cover no-repeat`,
      };
    });
    keyframes["100%"] = {
      background: `url("${validImages[0]}") center/cover no-repeat`,
    };

    return keyframes;
  };

  // Function to fetch and store images
  const fetchAndStoreImages = async (token) => {
    try {
      const carouselResponse = await axios.get(`/api/site-homepage-carousel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const images = Array.isArray(carouselResponse.data)
        ? carouselResponse.data
            .filter(item => item?.img_url)
            .map(item => item.img_url)
        : [defaultImage];
      const validImages = images.length > 0 ? images : [defaultImage];
      localStorage.setItem("carouselImages", JSON.stringify(validImages));
      setCarouselImages(validImages);
    } catch (error) {
      console.error("Error fetching carousel images:", error);
      setCarouselImages([defaultImage]);
      localStorage.setItem("carouselImages", JSON.stringify([defaultImage]));
    }
  };

  // Function to clear and refetch images
  const handleClearAndRefetch = async () => {
    setLoading(true);
    localStorage.removeItem("carouselImages");
    const token = Cookies.get("student_token");
    if (token) {
      await fetchAndStoreImages(token);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("student_token");

      if (!token) {
        router.push("/knights-students-panel");
        setLoading(false);
        return;
      }

      try {
        // Fetch student data
        const decoded = jwtDecode(token);
        const studentId = decoded?.id;
        if (!studentId) throw new Error("Invalid token structure");

        const response = await axios.get(`/api/students_auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(response.data.student);

        // Check if images are in localStorage
        const storedImages = localStorage.getItem("carouselImages");
        let parsedImages = [];
        if (storedImages) {
          try {
            parsedImages = JSON.parse(storedImages);
            if (!Array.isArray(parsedImages)) {
              parsedImages = [defaultImage];
              localStorage.setItem("carouselImages", JSON.stringify(parsedImages));
            }
          } catch (parseError) {
            console.error("Error parsing stored images:", parseError);
            parsedImages = [defaultImage];
            localStorage.setItem("carouselImages", JSON.stringify(parsedImages));
          }
        }
        if (parsedImages.length > 0) {
          setCarouselImages(parsedImages);
        } else {
          await fetchAndStoreImages(token);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Cookies.remove("student_token");
        router.push("/knights-students-panel");
        setCarouselImages([defaultImage]);
        localStorage.setItem("carouselImages", JSON.stringify([defaultImage]));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#121212",
        }}
      >
        <CircularProgress size={100} color="primary" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
        mt: -8,
        pb: 8,
      }}
    >
      <Box
        sx={{
          py: 5,
          px: 4,
          background: `url("${carouselImages[0] || defaultImage}") center/cover no-repeat`,
          animation: `slide ${carouselImages.length * 30}s infinite`,
          "@keyframes slide": generateKeyframes(carouselImages),
        }}
      >
        <Box sx={{ mt: 8 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: 8,
              flexWrap: 'nowrap',
              width: '100%',
            }}
          >
            {/* Profile Pic Section */}
            <Box sx={{ flex: '0 0 50%'}}>
              <Box sx={{ pr: 30 }}>
                <TDILLogo />
              </Box>
              <Box sx={{ pl: '0px', pt: 8 }}>
                <TDILCSIcon />
              </Box>
            </Box>
            {/* Info Box Section */}
            <Box sx={{ flex: '0 0 50%', maxWidth: 490 }}>
              <Paper
                elevation={6}
                sx={{
                  padding: 2,
                  background: "#000000a6",
                  borderRadius: 4,
                  overflowY: 'scroll',
                  maxHeight: '86vh',
                }}
              >
                <Paper
                  elevation={6}
                  sx={{
                    paddingY: 2,
                    background: "#000000a6",
                    borderRadius: 4,
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    paddingRight: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 140,
                      height: 140,
                      backgroundColor: "#424242",
                      fontSize: 50,
                      border: "4px solid #00BFA5",
                    }}
                  >
                    {student?.firstName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography mt={2} color="#fff" variant="h6">
                    {`${student?.firstName} ${student?.lastName}`}
                  </Typography>
                  <Typography variant="body2" color="#90CAF9">
                    Student
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: "18px" }} variant="body2" color="#90CAF9">
                    Sure Success Point School
                  </Typography>
                </Paper>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h5" color="#00E676">
                    Student Information
                  </Typography>
                  <Box>
                    <Tooltip title="Edit Info (Coming Soon)">
                      <IconButton color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear and Refetch Images">
                      <IconButton color="primary" onClick={handleClearAndRefetch}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <List sx={{ width: '100%' }}>
                  {[
                    ["Email", student?.loginEmail],
                    ["Admission Number", student?.admissionNumber],
                    ["Father's Name", student?.fatherName],
                    ["Mother's Name", student?.motherName],
                    ["Address", student?.residentialAddress],
                    ["City", student?.city],
                    ["State", student?.state],
                    ["Pincode", student?.pinCode],
                    ["Class ID", student?.classId],
                    ["Branch ID", student?.branchId],
                  ].map(([label, value], index) => (
                    <Box key={index}>
                      <ListItem
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          px: 0,
                        }}
                      >
                        <Typography variant="body2" color="#90CAF9">
                          {label}
                        </Typography>
                        <Typography variant="body1" color="#fff">
                          {value || "N/A"}
                        </Typography>
                      </ListItem>
                      <Divider sx={{ borderColor: "#555" }} />
                    </Box>
                  ))}
                </List>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
