"use client";
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppBarComponent from './AppBarComponent';
import DrawerComponent from './DrawerComponent';
import ContentArea from './ContentArea';
import { Alert, Box, Button, CssBaseline, CircularProgress, LinearProgress, Typography } from '@mui/material';
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
  const [user, setUser] = useState(null);
  const [authorization, setAuthorization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionIssue, setSessionIssue] = useState(null);
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

  // Fetch logged-in user session
  useEffect(() => {
    const validateSession = async () => {
      const token = Cookies.get("administration_token");

      if (!token) {
        router.push("/administration");
        return;
      }
      try {
        const response = await axios.get(`/api/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.user) {
          setUser(response.data.user);
          setSessionIssue(null);

          try {
            const authorizationResponse = await axios.get(
              "/api-schools-panel/rbac/authorization",
              { headers: { Authorization: `Bearer ${token}`, "x-ssps-panel": "ADMINISTRATION" } },
            );

            if (authorizationResponse.data?.success) {
              setAuthorization(authorizationResponse.data.data);
            }
          } catch {
            // Preserve the existing navigation while an older deployment or client
            // has not yet received the RBAC endpoint.
            setAuthorization(null);
          }
        } else {
          throw new Error("Invalid user data");
        }
      } catch (error) {
        console.error("Session validation error:", error);
        const status = error?.response?.status;
        const redirectTo = status === 403 ? error.response?.data?.redirectTo : null;
        if (redirectTo) {
          router.replace(redirectTo);
          return;
        }
        if (status === 401 || status === 403) {
          Cookies.remove("administration_token");
          router.replace("/administration");
          return;
        }
        setSessionIssue("Your seven-day administration session is still saved. The server could not be reached to verify it. Check the connection and retry.");
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

  if (sessionIssue && !user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3, bgcolor: "#000" }}>
        <Box sx={{ width: "min(100%, 520px)" }}>
          <Alert severity="warning" sx={{ mb: 2 }}>{sessionIssue}</Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>Retry verification</Button>
        </Box>
      </Box>
    );
  }

  if (!user) {
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

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch {
      // The browser token is still cleared below if the network is unavailable.
    }
    Cookies.remove('administration_token');
    router.push('/administration');
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
          jobRole={user?.role || "CEO"}
          permissions={authorization?.permissions ?? null}
          roleCodes={authorization?.roles?.map((role) => role.code) ?? []}
          temporaryFullAdministrationNavigation={authorization?.features?.temporaryFullAdministrationNavigation === true}
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
          <ContentArea key={reloadKey} activeSection={activeSection}/>
        </Box>
      </Box>
    </>
  );
}

AdminResponsiveDrawer.propTypes = {
  window: PropTypes.func,
};

export default AdminResponsiveDrawer;
