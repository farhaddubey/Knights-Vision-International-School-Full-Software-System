"use client";
import { Box, Typography, Container, Divider, List, ListItem, ListItemText, Grid } from "@mui/material";
import Image from "next/image";

export default function PrivacyPolicyStudent() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={6}>
        <Image
          src="/sure-success-apps/2.png"
          alt="Sure Success Point School Logo"
          width={500}
          height={500}
          style={{ borderRadius: "12px" }}
        />
        <Typography variant="h4" fontWeight="bold" mt={2} color="primary">
          Sure Success Connect – Student App
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Privacy Policy
        </Typography>
      </Box>


      {/* Description */}
      <Typography paragraph>
        The <strong>Sure Success Connect – Student App</strong> by <strong>Sure Success Point School</strong> is designed to
        enhance students’ learning experience by offering seamless access to academic performance, assignments, and
        daily routines in a secure environment. We are fully committed to maintaining transparency, protecting student
        data, and ensuring responsible digital usage in compliance with Google Play Privacy and Indian Education Data
        Protection Standards.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Policy Sections */}
      <Typography variant="h6" gutterBottom>
        🔹 1. Information We Collect
      </Typography>
      <List>
        <ListItem><ListItemText primary="Student Name, Roll Number, and Class Details" /></ListItem>
        <ListItem><ListItemText primary="Academic Records including Assignments, Results, Tests, and Attendance" /></ListItem>
        <ListItem><ListItemText primary="Parent/Guardian contact details for verified communication" /></ListItem>
        <ListItem><ListItemText primary="Device information (for login verification and session security)" /></ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        🔹 2. Purpose of Data Collection
      </Typography>
      <List>
        <ListItem><ListItemText primary="To provide a personalized dashboard for students with marks, assignments, and results" /></ListItem>
        <ListItem><ListItemText primary="To enable class, semester, and subject-based academic tracking" /></ListItem>
        <ListItem><ListItemText primary="To send verified notices and academic updates directly from the school" /></ListItem>
        <ListItem><ListItemText primary="To improve the overall digital learning experience while ensuring privacy" /></ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        🔹 3. Data Protection & Security
      </Typography>
      <List>
        <ListItem><ListItemText primary="All data is encrypted and stored securely on the school's private cloud servers." /></ListItem>
        <ListItem><ListItemText primary="No data is shared or sold to any third-party organization or advertiser." /></ListItem>
        <ListItem><ListItemText primary="Access to academic information is restricted to authorized students and school admins only." /></ListItem>
        <ListItem><ListItemText primary="Regular audits ensure compliance with child safety and digital privacy guidelines." /></ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        🔹 4. Permissions We Use
      </Typography>
      <List>
        <ListItem><ListItemText primary="Internet Access – Required for syncing data like results, assignments, and school updates." /></ListItem>
        <ListItem><ListItemText primary="Storage Access (optional) – To download or view academic files securely." /></ListItem>
        <ListItem><ListItemText primary="Notification Permission – To receive academic alerts and school notices in real-time." /></ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        🔹 5. User Control & Transparency
      </Typography>
      <List>
        <ListItem><ListItemText primary="Students can request correction of academic data through their respective teachers or admin." /></ListItem>
        <ListItem><ListItemText primary="Users can request data deletion in case of school transfer or withdrawal." /></ListItem>
        <ListItem><ListItemText primary="We maintain full transparency regarding data visibility and access rights." /></ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        🔹 6. Data Retention Policy
      </Typography>
      <Typography paragraph>
        Student data is retained only for the duration of active enrollment. Upon graduation, transfer, or withdrawal,
        the data is archived securely for institutional records and then permanently deleted after a defined retention period.
      </Typography>
    {/* Image Layout */}
      <Grid container spacing={2} justifyContent="center" mb={4}>
        <Grid item xs={12} sm={4} textAlign="center">
          <Image src="/sure-success-apps/1.png" alt="Student Dashboard" width={500} height={500} />
        </Grid>
      </Grid>
      <Typography variant="h6" gutterBottom>
        🔹 7. Third-Party Integrations
      </Typography>
      <Typography paragraph>
        The app does not use external analytics or advertising SDKs. Only school-authorized systems are used for authentication
        and communication. This ensures complete protection of student identity and academic records.
      </Typography>

      <Typography variant="h6" gutterBottom>
        🔹 8. Updates to Policy
      </Typography>
      <Typography paragraph>
        The school administration reserves the right to revise this policy as necessary. Any significant changes will
        be communicated through official channels or the app itself.
      </Typography>

      <Typography variant="h6" gutterBottom>
        🔹 9. Contact Information
      </Typography>
      <Typography paragraph>
        For privacy-related concerns or support, please contact:  
        <br />
        <strong>Sure Success Point School</strong><br />
        Email: support@suresuccesspointschool.in  
        <br />
        Address: Sure Success Point School, [Insert Location]  
        <br />
        Office Hours: Mon–Sat, 9 AM – 4 PM
      </Typography>

      <Divider sx={{ my: 4 }} />
   {/* Image Layout */}
       <Box textAlign="center" mb={6}>
        <Image
          src="/sure-success-apps/3.png"
          alt="Sure Success Point School Logo"
          width={800}
          height={450}
          style={{ borderRadius: "12px" }}
        />
        <Typography variant="h4" fontWeight="bold" mt={2} color="primary">
          Sure Success Connect – Web Assistance Login Panel
        </Typography>
      </Box>

      <Typography textAlign="center" color="text.secondary" fontSize="0.9rem">
        © {new Date().getFullYear()} Sure Success Point School. All rights reserved.  
        <br />
        Committed to Safe, Smart, and Ethical Education.
      </Typography>
    </Container>
  );
}
