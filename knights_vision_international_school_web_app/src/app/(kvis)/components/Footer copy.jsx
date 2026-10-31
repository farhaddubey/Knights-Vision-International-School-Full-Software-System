import React from 'react';
import { Container, Grid2, Typography, Link, Box, Divider, List, ListItem } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: '#212121', padding: '20px 0', marginTop: 'auto' }}>
      {/* Motto Section */}
      <Container maxWidth="lg">
        <Typography
          variant="h6"
          color="#2962ff"
          align="center"
          sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', md: '1.2rem' }, mb: 2 }}
        >
          Empowering Every Student&apos;s Potential with a Unique Curriculum
        </Typography>

        <Grid2 container spacing={4} justifyContent="space-between">
          {/* About Section */}
          <Grid2 item xs={12} sm={6} md={4}>
            <Typography variant="h6">Sure Success Point School</Typography>
            <Typography variant="body2" color="#1a237e" sx={{ mt: 1 }}>
              Established in 2008, powered by KIBCSET (Knights International Board & Council of Skills Excellence & Talent), founded by Farhad Dubey in 2024. We create a curriculum that&apos;s the best fit for every student, tailored to meet each individual&apos;s unique potential.
            </Typography>
          </Grid2>

          {/* Download Links */}
          <Grid2 item xs={12} sm={6} md={2}>
            <Typography variant="h6">Download App</Typography>
            <List>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">Playstore</Link>
              </ListItem>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">Appstore</Link>
              </ListItem>
            </List>
          </Grid2>

          {/* Social Links */}
          <Grid2 item xs={12} sm={6} md={2}>
            <Typography variant="h6">Let&apos;s Get Social</Typography>
            <List>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">Facebook</Link>
              </ListItem>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">Twitter</Link>
              </ListItem>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">Instagram</Link>
              </ListItem>
            </List>
          </Grid2>

          {/* Company Info */}
          <Grid2 item xs={12} sm={6} md={4}>
            <Typography variant="h6">Company</Typography>
            <List>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">About Us</Link>
              </ListItem>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">Contact Us</Link>
              </ListItem>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">Careers</Link>
              </ListItem>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">Updates</Link>
              </ListItem>
            </List>
          </Grid2>

          {/* Popular Exams */}
          <Grid2 item xs={12} sm={6} md={4}>
            <Typography variant="h6">Popular Exams</Typography>
            <List>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">IIT JEE</Link>
              </ListItem>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">NEET</Link>
              </ListItem>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">NDA</Link>
              </ListItem>
              <ListItem disablePadding>
                <Link href="#" color="inherit" underline="none">UPSC</Link>
              </ListItem>
            </List>
          </Grid2>
        </Grid2>

        {/* Divider */}
        <Divider sx={{ my: 3 }} />

        {/* Footer Bottom */}
        <Grid2 container justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="#1a237e">
            © 2024 Sure Success Point School. All rights reserved.
          </Typography>
          <Box>
            <Link href="#" color="inherit" underline="none" sx={{ mr: 2 }}>Privacy Policy</Link>
            <Link href="#" color="inherit" underline="none">Terms of Use</Link>
          </Box>
        </Grid2>
      </Container>
    </Box>
  );
};

export default Footer;
