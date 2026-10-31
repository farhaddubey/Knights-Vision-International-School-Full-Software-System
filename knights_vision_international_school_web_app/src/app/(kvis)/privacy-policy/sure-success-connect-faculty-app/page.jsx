"use client";
import { Box, Typography, Container, Divider, List, ListItem, ListItemText } from "@mui/material";
import Image from "next/image";

export default function PrivacyPolicyStudent() {
  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
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
   

      <Typography paragraph>
        At <strong>Sure Success Point School</strong>, we value your trust and are committed to protecting your personal information. 
        This Privacy Policy describes how your data is collected, used, and protected when using the <strong>Sure Success Connect – Student App</strong>.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        📘 1. Information We Collect
      </Typography>
      <List>
        <ListItem><ListItemText primary="Student Name, Roll Number, and Class Details" /></ListItem>
        <ListItem><ListItemText primary="Academic Data such as Results, Assignments, Attendance, and Routine" /></ListItem>
        <ListItem><ListItemText primary="Parent/Guardian Contact for Communication" /></ListItem>
        <ListItem><ListItemText primary="Device ID (for secure login and verification)" /></ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        🔒 2. How We Use the Information
      </Typography>
      <List>
        <ListItem><ListItemText primary="To display student results and performance updates" /></ListItem>
        <ListItem><ListItemText primary="To show assignment and homework progress" /></ListItem>
        <ListItem><ListItemText primary="To maintain class and semester-wise educational tracking" /></ListItem>
        <ListItem><ListItemText primary="To ensure authenticated access for registered students only" /></ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        🧠 3. Data Privacy & Security
      </Typography>
      <List>
        <ListItem><ListItemText primary="All student data is securely stored on school-managed servers or authorized education databases." /></ListItem>
        <ListItem><ListItemText primary="We do not sell, trade, or share personal data with any third parties." /></ListItem>
        <ListItem><ListItemText primary="Access to data is strictly limited to school administrators and authorized personnel." /></ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        ⚙️ 4. Permissions Used
      </Typography>
      <List>
        <ListItem><ListItemText primary="Internet Access – to fetch school updates and data from the server." /></ListItem>
        <ListItem><ListItemText primary="Storage (optional) – to cache academic files or reports." /></ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        🧾 5. User Rights
      </Typography>
      <List>
        <ListItem><ListItemText primary="Students can request data corrections through school authorities." /></ListItem>
        <ListItem><ListItemText primary="Users can request account removal upon leaving the institution." /></ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        📅 6. Policy Updates
      </Typography>
      <Typography paragraph>
        The school reserves the right to update this policy at any time. Updates will be communicated via the app or school notice board.
      </Typography>

      <Typography variant="h6" gutterBottom>
        📞 7. Contact Information
      </Typography>
      <Typography paragraph>
        For questions about this policy, please contact us:  
        <br />
        <strong>Sure Success Point School</strong><br />
        Email: support@suresuccesspointschool.in  
        <br />
        Address: Sure Success Point School, [Insert Location]
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Typography textAlign="center" color="text.secondary" fontSize="0.9rem">
        © {new Date().getFullYear()} Sure Success Point School. All rights reserved.
      </Typography>
    </Container>
  );
}
