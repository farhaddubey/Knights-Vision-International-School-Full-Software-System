'use client';
import React, { useState } from 'react';
import {
  Container, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Checkbox, FormControlLabel, Typography, Button,
  Snackbar, Alert, createTheme, ThemeProvider, Box
} from '@mui/material';
import { green, yellow } from '@mui/material/colors';
import axios from 'axios';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#0D47A1' },
    secondary: { main: green[500] },
    text: { primary: yellow[500], secondary: '#FFFFFF' },
    background: { default: '#121212', paper: '#1E1E1E' },
  },
});

const enquiryRoles = ['STUDENT', 'GUARDIAN', 'TEACHER', 'OTHER'];
const enquiryTypes = [
  'ADMISSION', 'FEE', 'HOMEWORK', 'TEST_RESULT', 'SYLLABUS',
  'TRANSFER', 'DISCIPLINE', 'COMPLAINT', 'FEEDBACK', 'TECHNICAL_SUPPORT', 'GENERAL_QUERY'
];
const contactMethods = ['EMAIL', 'PHONE', 'WHATSAPP'];

function EnquiryForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    enquiryType: '',
    subject: '',
    message: '',
    classOrGrade: '',
    identification: '',
    preferredContactMethod: 'EMAIL',
  });
  const [agreement, setAgreement] = useState(false);
  const [captcha, setCaptcha] = useState('AB123');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const refreshCaptcha = () => setCaptcha(Math.random().toString(36).substring(2, 8).toUpperCase());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!agreement) {
      setSnackbarMessage("Please agree to the terms before submitting.");
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await axios.post('/api/school-enquiry', {
        ...formData,
        email: formData.email || null,
        phone: formData.phone || null,
        classOrGrade: formData.classOrGrade || null,
        identification: formData.identification || null,
      });

      setSnackbarMessage('Enquiry submitted successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: '',
        enquiryType: '',
        subject: '',
        message: '',
        classOrGrade: '',
        identification: '',
        preferredContactMethod: 'EMAIL',
      });
      setAgreement(false);
      refreshCaptcha();
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      setSnackbarMessage('Failed to submit enquiry.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container sx={{ width: '27vw', backgroundColor: 'background.paper', padding: 2, borderRadius: 2 }}>
        <Typography variant="h5" textAlign="center" color="text.primary" gutterBottom>
          Sure Success Point School Enquiry
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid spacing={2}>
            <Grid item xs={12}>
              <TextField
                sx={{paddingY:"2px"}}
                fullWidth
                required
                label="Full Name"
                name="fullName"
                variant="outlined"
                value={formData.fullName}
                onChange={handleInputChange}
                color="primary"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{paddingY:"2px"}}
                fullWidth
                label="Email Address"
                name="email"
                variant="outlined"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                color="primary"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{paddingY:"2px"}}
                fullWidth
                label="Mobile Number"
                name="phone"
                variant="outlined"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                color="primary"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required color="primary">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Role"
                >
                  {enquiryRoles.map((role) => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required color="primary">
                <InputLabel>Enquiry Type</InputLabel>
                <Select
                  name="enquiryType"
                  value={formData.enquiryType}
                  onChange={handleInputChange}
                  label="Enquiry Type"
                >
                  {enquiryTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type.replace('_', ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{paddingY:"2px"}}
                fullWidth
                required
                label="Subject"
                name="subject"
                variant="outlined"
                value={formData.subject}
                onChange={handleInputChange}
                color="primary"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Message"
                name="message"
                variant="outlined"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                color="primary"
                sx={{ width: '100%', paddingY:"2px" }} // Ensure message field takes full row width
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{paddingY:"2px"}}
                fullWidth
                label="Class or Grade (Optional)"
                name="classOrGrade"
                variant="outlined"
                value={formData.classOrGrade}
                onChange={handleInputChange}
                color="primary"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{paddingY:"2px"}}
                fullWidth
                label="Identification (Optional)"
                name="identification"
                variant="outlined"
                value={formData.identification}
                onChange={handleInputChange}
                color="primary"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required color="primary">
                <InputLabel>Preferred Contact Method</InputLabel>
                <Select
                  name="preferredContactMethod"
                  value={formData.preferredContactMethod}
                  onChange={handleInputChange}
                  label="Preferred Contact Method"
                >
                  {contactMethods.map((method) => (
                    <MenuItem key={method} value={method}>{method}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between">
                <Button disabled variant='outlined' size='large' sx={{ padding: 2, paddingX: 4 }}>
                  <Typography variant="body2" color="text.secondary">{captcha}</Typography>
                </Button>
                <TextField
                  fullWidth
                  label="Enter text as shown"
                  variant="outlined"
                  color="primary"
                  InputProps={{ endAdornment: <Button onClick={refreshCaptcha} color="secondary">Refresh</Button> }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={agreement} onChange={(e) => setAgreement(e.target.checked)} color="secondary" />}
                label="I agree to receive information regarding my submitted enquiry."
                sx={{ color: 'text.primary', paddingY:"2px" }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                sx={{ fontWeight: 'bold', color: 'text.secondary' }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
        <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default EnquiryForm;