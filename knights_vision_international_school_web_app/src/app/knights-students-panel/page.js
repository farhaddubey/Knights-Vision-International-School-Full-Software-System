"use client";
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Alert, Box, Button, Card, CardActionArea, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Paper, TextField, Typography, LinearProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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

const StudentAuthPage = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showActivationPasswords, setShowActivationPasswords] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // New state for login button click
  const [loginMessage, setLoginMessage] = useState(null);
  const [activationOpen, setActivationOpen] = useState(false);
  const [activationSubmitting, setActivationSubmitting] = useState(false);
  const [activationMessage, setActivationMessage] = useState(null);
  const [activation, setActivation] = useState({ admissionNumber: "", activationCode: "", newPassword: "", confirmPassword: "" });
  const router = useRouter();

  // Login handler using Next.js API
  const handleLogin = async () => {
    if (!loginId.trim() || !password) {
      const text = "Enter your admission number or school email and password.";
      setLoginMessage({ severity: "error", text });
      toast.error(text);
      return;
    }
    setIsLoggingIn(true); // Show full-screen loading bar
    setLoginMessage(null);
    try {
      const response = await axios.post(`/api/students_auth/login`, { loginId, password });

      if (response.data && response.data.student_token) {
        Cookies.set("student_token", response.data.student_token, { expires: 7, secure: window.location.protocol === "https:", sameSite: "strict" });
        setIsLoggingIn(false); // Hide loading bar before redirection
        router.push("/knights-students-panel/kvis-parent-students-panel");
      } else {
        console.error("Failed to authenticate. No token received.");
        setIsLoggingIn(false); // Hide loading bar on error
        const text = "The school server did not return a student session.";
        setLoginMessage({ severity: "error", text });
        toast.error(text);
      }
    } catch (error) {
      console.error("Authentication error:", error.response?.data?.error || error.message);
      setIsLoggingIn(false); // Hide loading bar on error
      const text = error.response?.data?.error || "Please check your credentials and try again.";
      setLoginMessage({ severity: "error", text });
      toast.error(text);
    }
  };

  const openActivation = () => {
    setActivation({ admissionNumber: loginId.trim(), activationCode: "", newPassword: "", confirmPassword: "" });
    setActivationMessage(null);
    setActivationOpen(true);
  };

  const activateAccount = async (event) => {
    event.preventDefault();
    const admissionNumber = activation.admissionNumber.trim();
    const activationCode = activation.activationCode.trim();
    if (!admissionNumber || !activationCode || !activation.newPassword || !activation.confirmPassword) {
      setActivationMessage({ severity: "error", text: "Complete every field to activate the account." });
      toast.error("Complete every field to activate the account.");
      return;
    }
    if (activation.newPassword.length < 12) {
      setActivationMessage({ severity: "error", text: "Choose a password with at least 12 characters." });
      toast.error("Choose a password with at least 12 characters.");
      return;
    }
    if (activation.newPassword !== activation.confirmPassword) {
      setActivationMessage({ severity: "error", text: "The two password entries do not match." });
      toast.error("The two password entries do not match.");
      return;
    }

    setActivationSubmitting(true);
    setActivationMessage(null);
    try {
      await axios.post('/api/students_auth/activate', {
        admissionNumber,
        activationCode,
        newPassword: activation.newPassword,
      });
      setLoginId(admissionNumber);
      setPassword(activation.newPassword);
      setActivationOpen(false);
      setLoginMessage({ severity: "success", text: "Account activated. Your admission number and new password are ready to sign in." });
      toast.success("Account activated. You can now sign in.");
    } catch (error) {
      const text = error.response?.data?.error || "Unable to activate this account right now. Please try again.";
      setActivationMessage({ severity: "error", text });
      toast.error(text);
    } finally {
      setActivationSubmitting(false);
    }
  };

  // Validate session using Next.js API
  useEffect(() => {
    const validateSession = async () => {
      const token = Cookies.get("student_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/students_auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.student) {
          setUser(response.data.student);
          router.push("/knights-students-panel/kvis-parent-students-panel");
        } else {
          throw new Error("Invalid user data");
        }
      } catch (error) {
        console.error("Session validation error:", error);
        // A transient outage must not erase a still-valid seven-day session.
        // Only the server can conclusively reject it with 401/403.
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          Cookies.remove("student_token");
        }
        setLoading(false);
      }
    };

    validateSession();
  }, [router]);

  if (loading) {
    return (
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
    );
  }

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
        <Grid item xs={12} md={8} sx={{ paddingY: { xs: 0, md: 1.4 }, width: '60vw' }}>
          <Card sx={{ maxWidth: { xs: 300, md: 400 }, backgroundColor: "black" }}>
            <CardActionArea>
              <CardMedia
                component="img"
                sx={{ maxWidth: { xs: 380, md: 545 }, paddingLeft: { xs: 16, md: 0 }, backgroundColor: "black" }}
                image="/knights.png"
                alt="Sure Success Point School Logo"
              />
            </CardActionArea>
          </Card>
          <GlowingText2 variant="h6" sx={{ fontSize: '30px' }}>
            Welcome to the Student Portal of
          </GlowingText2>
          <GlowingText variant="h3" sx={{ display: { xs: 'block', sm: 'block', md: 'block' } }}>
            <a href="https://www.sspointschool.in/" target="_blank" rel="noopener noreferrer">
              Sure Success Point School
            </a>
          </GlowingText>
        </Grid>

        {/* Right Section */}
        <Grid item xs={12} md={4} sx={{ paddingY: { xs: 0, md: 0 }, width: '28vw' }}>
          <Paper variant="outlined" elevation={5} sx={{ backgroundColor: "#222", border: "2px solid #444" }}>
              <Box component="form" sx={{ padding: 2, bgcolor: "#000" }}>
              <Box sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
                <Button variant="outlined" color="error">
                  Student Login
                </Button>
              </Box>
              {loginMessage && <Alert severity={loginMessage.severity} sx={{ mb: 2 }} onClose={() => setLoginMessage(null)}>{loginMessage.text}</Alert>}
              <Typography sx={{ marginBottom: 2, color: "#bdc3c7" }}>Enter your Email or Admission Number</Typography>
              <TextField
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                fullWidth
                label="Email or Admission Number"
                variant="outlined"
                InputLabelProps={{ style: { color: "#bdc3c7" } }}
                sx={textDisabledFieldStyles}
              />
              <Typography sx={{ marginTop: 2, marginBottom: 1, color: "#bdc3c7" }}>
                Enter your password. New users and students who forgot a password use the one-time code issued by the school.
              </Typography>
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
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 1.25 }}>
                <Button onClick={openActivation} disabled={isLoggingIn} sx={{ color: "#74d99f", textTransform: "none" }}>
                  Activate or reset account
                </Button>
                <Typography variant="caption" sx={{ color: "#9e9e9e", textAlign: "center" }}>
                  Use the one-time account code issued privately by the school.
                </Typography>
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
      <Dialog open={activationOpen} onClose={activationSubmitting ? undefined : () => setActivationOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: "#212121", color: "#fff", border: "1px solid #555" } }}>
        <Box component="form" onSubmit={activateAccount}>
          <DialogTitle>Activate or Reset Student Account</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: "#c7c7c7", mb: 2 }}>
              Enter the one-time code issued by the school. It is used once to choose a first or replacement password.
            </Typography>
            {activationMessage && <Alert severity={activationMessage.severity} sx={{ mb: 2 }}>{activationMessage.text}</Alert>}
            <TextField required autoFocus value={activation.admissionNumber} onChange={(event) => setActivation((current) => ({ ...current, admissionNumber: event.target.value }))} fullWidth label="Admission Number" variant="outlined" InputLabelProps={{ style: { color: "#bdc3c7" } }} sx={{ ...textDisabledFieldStyles, mb: 1.5 }} />
            <TextField required value={activation.activationCode} onChange={(event) => setActivation((current) => ({ ...current, activationCode: event.target.value }))} fullWidth label="One-time Account Code" variant="outlined" InputLabelProps={{ style: { color: "#bdc3c7" } }} sx={{ ...textDisabledFieldStyles, mb: 1.5 }} />
            <TextField required type={showActivationPasswords ? "text" : "password"} value={activation.newPassword} onChange={(event) => setActivation((current) => ({ ...current, newPassword: event.target.value }))} fullWidth label="New Password (minimum 12 characters)" variant="outlined" InputLabelProps={{ style: { color: "#bdc3c7" } }} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton aria-label={showActivationPasswords ? "Hide password" : "Show password"} onClick={() => setShowActivationPasswords((current) => !current)} edge="end" sx={{ color: "#74d99f" }}>{showActivationPasswords ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} sx={{ ...textDisabledFieldStyles, mb: 1.5 }} />
            <TextField required type={showActivationPasswords ? "text" : "password"} value={activation.confirmPassword} onChange={(event) => setActivation((current) => ({ ...current, confirmPassword: event.target.value }))} fullWidth label="Confirm New Password" variant="outlined" InputLabelProps={{ style: { color: "#bdc3c7" } }} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton aria-label={showActivationPasswords ? "Hide password" : "Show password"} onClick={() => setShowActivationPasswords((current) => !current)} edge="end" sx={{ color: "#74d99f" }}>{showActivationPasswords ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} sx={textDisabledFieldStyles} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button disabled={activationSubmitting} onClick={() => setActivationOpen(false)} sx={{ color: "#c7c7c7" }}>Cancel</Button>
            <Button type="submit" disabled={activationSubmitting} variant="contained" sx={{ bgcolor: "#218c4c", "&:hover": { bgcolor: "#176f3d" } }}>{activationSubmitting ? "Activating…" : "Activate"}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default StudentAuthPage;
