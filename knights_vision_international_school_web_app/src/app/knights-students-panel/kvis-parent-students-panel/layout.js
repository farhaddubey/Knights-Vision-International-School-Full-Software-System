"use client";
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppBarComponent from './AppBarComponent';
import DrawerComponent from './DrawerComponent';
import ContentArea from './ContentArea';
import { Box, CssBaseline, CircularProgress, LinearProgress, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import useForceFullScreen from "@/components/sure-success-point-school/hooks/usePanelFullscreen";
import { keyframes } from "@mui/system";

const drawerWidth = 280;

// Define gradient glow animation for CircularProgress
const glowAnimation = keyframes`
  0% { 
    background-position: 0% 50%;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5), 0 0 20px rgba(0, 212, 255, 0.3);
  }
  50% { 
    background-position: 100% 50%;
    box-shadow: 0 0 20px rgba(0, 123, 255, 0.8), 0 0 30px rgba(0, 212, 255, 0.5);
  }
  100% { 
    background-position: 0% 50%;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5), 0 0 20px rgba(0, 212, 255, 0.3);
  }
`;

// Define fill animation for LinearProgress
const fillAnimation = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
`;

// Define pulse animation for text
const pulseAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
`;

function AdminResponsiveDrawer(props) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appBarHeight, setAppBarHeight] = useState(64);
  const [activeSection, setActiveSection] = useState('Default');
  const [reloadKey, setReloadKey] = useState(0);

  const { window } = props;
  const router = useRouter();
  useForceFullScreen(reloadKey);

  // Capture app bar height dynamically
  useEffect(() => {
    const toolbar = document.querySelector('.MuiToolbar-root');
    if (toolbar) setAppBarHeight(toolbar.clientHeight);
  }, []);

  // Fetch logged-in student session
  useEffect(() => {
    const validateSession = async () => {
      const token = Cookies.get("student_token");

      if (!token) {
        router.push("/knights-students-panel");
        return;
      }

      try {
        const response = await axios.get(`/api/students_auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.student) {
          setStudent(response.data.student);
        } else {
          throw new Error("Invalid student data");
        }
      } catch (error) {
        console.error("Session validation error:", error);
        // Keep a valid browser session through a short server/network outage.
        // Expiry, deactivation, or a deliberately invalid token returns 401/403
        // and is the only condition that forces a sign-in again.
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          Cookies.remove("student_token");
          router.push("/knights-students-panel");
        }
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#000",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 4,
          }}
        >
          <CircularProgress
            size={180}
            thickness={4}
            sx={{
              color: "transparent",
              background: "linear-gradient(90deg, #007bff, #00d4ff, #007bff)",
              backgroundSize: "200% 200%",
              animation: `${glowAnimation} 3s ease-in-out infinite`,
              borderRadius: "50%",
              "& .MuiCircularProgress-circle": {
                stroke: "url(#gradient)",
              },
            }}
          />
          <svg style={{ position: "absolute", width: 0, height: 0 }}>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#007bff", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: "#00d4ff", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#007bff", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
          <Typography
            variant="h6"
            sx={{
              position: "absolute",
              color: "#fff",
              fontWeight: 500,
              animation: `${pulseAnimation} 2s ease-in-out infinite`,
            }}
          >
            Loading
          </Typography>
        </Box>
        <Box sx={{ width: "50%", maxWidth: 400 }}>
          <LinearProgress
            variant="determinate"
            value={100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "#1e1e1e",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#00ff00",
                animation: `${fillAnimation} 2s ease-in-out forwards`,
              },
            }}
          />
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              textAlign: "center",
              color: "#bbb",
              animation: `${pulseAnimation} 2s ease-in-out infinite`,
            }}
          >
            Initializing Software System...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#000",
          color: "#fff",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            background: "linear-gradient(90deg, #007bff, #00d4ff, #007bff)",
            backgroundSize: "200% 200%",
            animation: `${glowAnimation} 3s ease-in-out infinite`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 600,
            textAlign: "center",
            mb: 2,
            textShadow: "0 0 10px rgba(0, 212, 255, 0.5)",
          }}
        >
          Verifying... Authenticating...
        </Typography>
        <LinearProgress
          variant="determinate"
          value={100}
          sx={{
            width: "50%",
            maxWidth: 400,
            height: 6,
            borderRadius: 4,
            backgroundColor: "#1e1e1e",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#00ff00",
              animation: `${fillAnimation} 2s ease-in-out forwards`,
            },
          }}
        />
      </Box>
    );
  }

  const handleLogout = () => {
    Cookies.remove('student_token');
    router.push('/knights-students-panel');
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleDrawerItemClick = (section) => {
    console.log("Active section:", section);
    setActiveSection(section);
    setMobileOpen(false);
  };

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
  };

  return (
    <>
      <Box sx={{ display: 'flex', backgroundColor: "#000000" }}>
        <AppBarComponent handleReload={handleReload} handleLogout={handleLogout} handleDrawerToggle={handleDrawerToggle} />
        <CssBaseline />
        <DrawerComponent
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          appBarHeight={appBarHeight}
          activeSection={activeSection}
          handleDrawerItemClick={handleDrawerItemClick}
          drawerWidth={drawerWidth}
          jobRole={"Student"}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: '#000',
            padding: 0.3,
            marginTop: `${appBarHeight}px`,
            minHeight: '100vh',
          }}
        >
          <ContentArea key={reloadKey} activeSection={activeSection} />
        </Box>
      </Box>
    </>
  );
}

AdminResponsiveDrawer.propTypes = {
  window: PropTypes.func,
};

export default AdminResponsiveDrawer;
