import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Pagination,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;

const textFieldStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#aaa' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c853' },
  backgroundColor: '#333',
  borderRadius: '4px',
};

const ViewAdmissionApplications = () => {
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApplications = async (currentPage) => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    try {
      const response = await axios.get(`/api/admission-test-applications/get-for-admit?page=${currentPage}&pageSize=${pageSize}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(response.data.applications);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Fetch Error:', err.response?.data || err.message);
      toast.error('❌ Error fetching applications.');
    }
  };

  useEffect(() => {
    fetchApplications(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const generateAdmitCardPDF = (application) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [210, 148.5], // A4 half-size (A5 landscape)
    });

    // Header
    doc.setFontSize(16);
    doc.text('Admission Test Admit Card', 105, 20, { align: 'center' });

    // Applicant Details Table
    autoTable(doc, {
      startY: 30,
      head: [['Field', 'Details']],
      body: [
        ['Name', `${application.firstName} ${application.middleName || ''} ${application.lastName}`.trim()],
        ['Admit Card Number', application.admitCardNumber || 'Not Assigned'],
        ['Category', application.category || 'N/A'],
        ['Venue', `School ID: ${application.schoolId || 'N/A'}, Branch: ${application.branchId || 'N/A'}`],
        ['Class', application.classId || 'N/A'],
        ['Academic Year', application.academicYear || 'N/A'],
        ['Status', application.status || 'Pending'],
      ],
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [33, 33, 33], textColor: [255, 255, 255] },
      bodyStyles: { fillColor: [51, 51, 51], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [66, 66, 66] },
      theme: 'grid',
      margin: { left: 10, right: 10 },
    });

    // Footer Instructions
    doc.setFontSize(8);
    doc.text(
      'Instructions: Please bring this admit card to the test venue. Ensure all details are correct.',
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );

    // Download PDF
    doc.save(`AdmitCard_${application.admitCardNumber || application.studentUid || 'application'}.pdf`);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: '#212121',
        height: `calc(100vh - ${appBarHeight}px)`,
        color: '#fff',
        overflow: 'auto',
        p: 2,
      }}
    >
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Typography variant="h5" sx={{ mb: 2, color: '#fff' }}>
        Admission Test Applications
      </Typography>
      <TableContainer component={Paper} sx={{ backgroundColor: '#333' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>First Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>Last Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>Student UID</TableCell>
              <TableCell sx={{ color: '#fff' }}>Admit Card Number</TableCell>
              <TableCell sx={{ color: '#fff' }}>Category</TableCell>
              <TableCell sx={{ color: '#fff' }}>Status</TableCell>
              <TableCell sx={{ color: '#fff' }}>School ID</TableCell>
              <TableCell sx={{ color: '#fff' }}>Branch ID</TableCell>
              <TableCell sx={{ color: '#fff' }}>Class ID</TableCell>
              <TableCell sx={{ color: '#fff' }}>Academic Year</TableCell>
              <TableCell sx={{ color: '#fff' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell sx={{ color: '#fff' }}>{app.firstName}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{app.lastName}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{app.studentUid || 'N/A'}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{app.admitCardNumber || 'Not Assigned'}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{app.category}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{app.status}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{app.schoolId || 'N/A'}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{app.branchId || 'N/A'}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{app.classId || 'N/A'}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{app.academicYear}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => generateAdmitCardPDF(app)}
                    sx={{ ...textFieldStyles, color: '#fff' }}
                  >
                    Download Admit Card
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          sx={{
            '& .MuiPaginationItem-root': { color: '#fff' },
            '& .Mui-selected': { backgroundColor: '#00c853 !important', color: '#fff' },
          }}
        />
      </Box>
    </Box>
  );
};

export default ViewAdmissionApplications;