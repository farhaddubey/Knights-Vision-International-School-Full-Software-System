"use client";
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Alert, Box, Button, Card, CardActionArea, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Typography, LinearProgress } from '@mui/material';
import { LockReset, Visibility, VisibilityOff } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import textDisabledFieldStyles from '../mui_styles/TextDisableFieldStyles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Animation for glowing text
const glow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled components for glowing text with responsive size adjustments
const GlowingText = styled(Typography)`
  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00e0);
  background-size: 400% 400%;
  animation: ${glow} 12s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5rem;
  
  @media (max-width: 1200px) { font-size: 1.8rem; }
  @media (max-width: 900px) { font-size: 1.6rem; }
  @media (max-width: 600px) { font-size: 1.8rem; }
`;

const GlowingText2 = styled(Typography)`
  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00e0);
  background-size: 400% 400%;
  animation: ${glow} 12s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5rem;
  
  @media (max-width: 1200px) { font-size: 3rem; }
  @media (max-width: 900px) { font-size: 2rem; }
  @media (max-width: 600px) { font-size: 0.9rem; }
`;

const FacultiesAuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // New state for login button click
  const [activationOpen, setActivationOpen] = useState(false);
  const [activationEmail, setActivationEmail] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [activationPassword, setActivationPassword] = useState("");
  const [activationConfirmPassword, setActivationConfirmPassword] = useState("");
  const [activationLoading, setActivationLoading] = useState(false);
  const [showActivationPassword, setShowActivationPassword] = useState(false);
  const router = useRouter();

  // Login handler using Next.js API
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      toast.error("Enter your registered email and password.");
      return;
    }
    setIsLoggingIn(true); // Show full-screen loading bar
    try {
      const response = await axios.post(`/api-schools-panel/auth/login`, { email, password });
      const facultiesToken = response.data?.faculties_token || response.data?.token;
      if (facultiesToken) {
        Cookies.remove("faculties_token");
        Cookies.set("faculties_token", facultiesToken, { expires: 7, secure: window.location.protocol === "https:", sameSite: "strict" });
        setIsLoggingIn(false); // Hide loading bar before redirection
        router.push("/knights-faculties-panel/sure-success-point-school-management-panel");
      } else {
        console.error("Failed to authenticate. No token received.");
        toast.error("The school server did not return a faculty session.");
      }
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Unable to sign in. Check your credentials and try again.";
      console.error("Authentication error:", message);
      const redirectTo = error?.response?.status === 403 ? error.response?.data?.redirectTo : null;
      if (redirectTo) {
        toast.error(message);
        router.replace(redirectTo);
        return;
      }
      toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openActivation = () => {
    setActivationEmail(email.trim());
    setActivationCode("");
    setActivationPassword("");
    setActivationConfirmPassword("");
    setShowActivationPassword(false);
    setActivationOpen(true);
  };

  const completeActivation = async () => {
    if (!activationEmail.trim() || !activationCode.trim() || !activationPassword) {
      toast.error("Enter your login ID, one-time code, and new password.");
      return;
    }
    if (activationPassword.length < 12) {
      toast.error("Your new password must contain at least 12 characters.");
      return;
    }
    if (activationPassword !== activationConfirmPassword) {
      toast.error("The new-password confirmation does not match.");
      return;
    }
    setActivationLoading(true);
    try {
      const response = await axios.post("/api/faculties_auth/activate", {
        email: activationEmail.trim(),
        activationCode: activationCode.trim(),
        newPassword: activationPassword,
      });
      setEmail(activationEmail.trim());
      setPassword("");
      setActivationOpen(false);
      toast.success(response.data?.message || "Password updated. You can sign in now.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to use this account code. Check it and try again.");
    } finally {
      setActivationLoading(false);
    }
  };

  // Validate session using Next.js API
  useEffect(() => {
    const validateSession = async () => {
      const token = Cookies.get("faculties_token");

      if (!token) {
        router.push("/knights-faculties-panel"); // Redirect if no token
        return;
      }

      try {
        const response = await axios.get(`/api-schools-panel/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setUser(response.data);
          setLoading(false);
        } else {
          throw new Error("Invalid user data");
        }
      } catch (error) {
        console.error("Session validation error:", error);
        const redirectTo = error?.response?.status === 403 ? error.response?.data?.redirectTo : null;
        if (redirectTo) {
          router.replace(redirectTo);
          return;
        }
        if (error?.response?.status === 401) {
          Cookies.remove("faculties_token");
        }
        router.replace("/knights-faculties-panel");
      }
    };

    validateSession();
  }, [router]);

  return (
    <Box
      sx={{
        backgroundColor: "#000000",
        paddingX: { xs: 2, md: 4 },
        overflowY: "hidden",
        paddingTop: { xs: 20, md: 10 },
        minHeight: "100vh",
      }}
    >
      <ToastContainer position="top-right" autoClose={4500} newestOnTop theme="dark" />
      {/* Full-screen loading bar shown only during login */}
      {isLoggingIn && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
            display: 'flex',
            alignItems: 'flex-start', // Align progress bar at the top
          }}
        >
          <LinearProgress
            color="primary"
            sx={{ width: '100%', height: '6px' }} // Full-width, slightly thicker bar
          />
        </Box>
      )}
      
      <Grid container spacing={2}>
        {/* Left Section */}
        <Grid item xs={12} md={8} sx={{ paddingY: { xs: 0, md: 1.4 }, width:'60vw' }}>
          <Card sx={{ maxWidth: { xs: 300, md: 400 }, backgroundColor: "black" }}>
            <CardActionArea>
                          <a href="https://www.sspointschool.in/"  rel="noopener noreferrer">

              <CardMedia
                component="img"
                
                sx={{ maxWidth: { xs: 380, md: 545 }, paddingLeft: { xs: 16, md: 0 }, backgroundColor: "black" }}
                image="/knights.png"
                alt="Sure Success Point School Logo"
              />
              </a>
            </CardActionArea>
          </Card>
          <GlowingText2 variant="h6" sx={{ fontSize: '30px' }}>
            Welcome to the Institutional Portal of
          </GlowingText2>
          <GlowingText variant="h3" sx={{ display: { xs: 'block', sm: 'block', md: 'block' } }}>
              Sure Success Point School
          </GlowingText>
        </Grid>

        {/* Right Section */}
        <Grid item xs={12} md={4} sx={{ paddingY: { xs: 0, md: 0 }, width: '28vw' }}>
          <Paper variant="outlined" elevation={5} sx={{ backgroundColor: "#222", border: "2px solid #444" }}>
            <Box component="form" sx={{ padding: 2, bgcolor: "#000" }}>
              <Box sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
                <Button variant="outlined" color="error">
                  Institutional Admin Login
                </Button>
              </Box>
              <Typography sx={{ marginBottom: 2, color: "#bdc3c7" }}>Enter your registered email.</Typography>
              <TextField
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                label="Email"
                variant="outlined"
                InputLabelProps={{ style: { color: "#bdc3c7" } }}
                sx={textDisabledFieldStyles}
              />
              <Typography sx={{ marginTop: 2, marginBottom: 1, color: "#bdc3c7" }}>Enter your Password</Typography>
              <TextField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end"><IconButton aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)} edge="end" sx={{ color: "#74d99f" }}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                }}
                InputLabelProps={{ style: { color: "#bdc3c7" } }}
                sx={textDisabledFieldStyles}
              />
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button onClick={handleLogin} variant="outlined" sx={{ color: "#3498db", borderColor: "#3498db" }}>
                  Log In
                </Button>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <Button onClick={openActivation} startIcon={<LockReset />} size="small" sx={{ color: "#bda8ff", textTransform: "none" }}>
                  Activate / reset faculty password
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Footer Section */}
        <Grid item xs={12} md={12}>
          <GlowingText2 variant="h6">
            A unit of the Knights (KiREAD) Group
          </GlowingText2>
          <GlowingText2 variant="h6">
            Knights International Group for Research, Education & Academic Development
          </GlowingText2>
        </Grid>
      </Grid>

      <Dialog open={activationOpen} onClose={() => !activationLoading && setActivationOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: "#171717", color: "#fff", border: "1px solid #654e94" } }}>
        <DialogTitle>Activate Faculty Account</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity="info">Use the one-time code issued privately by Administration. It works once, expires after seven days, and can set a first password or replace a forgotten one.</Alert>
            <TextField required value={activationEmail} onChange={(event) => setActivationEmail(event.target.value)} label="Registered email / login ID" fullWidth InputLabelProps={{ style: { color: "#bdc3c7" } }} sx={textDisabledFieldStyles} />
            <TextField required value={activationCode} onChange={(event) => setActivationCode(event.target.value)} label="One-time account code" fullWidth InputLabelProps={{ style: { color: "#bdc3c7" } }} sx={textDisabledFieldStyles} />
            <TextField required value={activationPassword} onChange={(event) => setActivationPassword(event.target.value)} type={showActivationPassword ? "text" : "password"} label="New password (minimum 12 characters)" fullWidth InputLabelProps={{ style: { color: "#bdc3c7" } }} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowActivationPassword((current) => !current)} edge="end" sx={{ color: "#74d99f" }}>{showActivationPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} sx={textDisabledFieldStyles} />
            <TextField required value={activationConfirmPassword} onChange={(event) => setActivationConfirmPassword(event.target.value)} type={showActivationPassword ? "text" : "password"} label="Confirm new password" fullWidth InputLabelProps={{ style: { color: "#bdc3c7" } }} sx={textDisabledFieldStyles} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setActivationOpen(false)} disabled={activationLoading} sx={{ color: "#ddd" }}>Cancel</Button><Button variant="contained" onClick={completeActivation} disabled={activationLoading} sx={{ bgcolor: "#68439a", "&:hover": { bgcolor: "#513277" } }}>{activationLoading ? "Updating…" : "Set password"}</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacultiesAuthPage;
