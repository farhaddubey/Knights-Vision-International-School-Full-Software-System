import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  TextField,
  CircularProgress,
  Pagination,
  PaginationItem,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import { RotateRight, Search, ChevronLeft, ChevronRight, Add, Payment, Info } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { jsPDF } from 'jspdf';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';
const yellowAccent = '#ffca28';

const schoolInfo = {
  name: 'Sure Success Point School',
  site: 'www.sspointschool.in',
  address: 'Najirpur, Alinagar, Kaliachak, Malda',
  company: 'Powered by Knights International Group for Research, Education & Academic Development',
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AdmissionManagement = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [academicYear, setAcademicYear] = useState(2025);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [openAdmissionDialog, setOpenAdmissionDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [feeSchemes, setFeeSchemes] = useState([]);
  const [selectedFeeScheme, setSelectedFeeScheme] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('1st admission');
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [paidMonths, setPaidMonths] = useState([]);
  const [feeSchemeError, setFeeSchemeError] = useState(null);
  const [totalPayable, setTotalPayable] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchApplications = async (pageNum = 1) => {
    const token = Cookies.get('administration_token');
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/admission-test-applications/fetch-qualifieds-for-admission', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize, academicYear },
      });
      if (!response.data || !Array.isArray(response.data.applications)) {
        throw new Error('Invalid response format');
      }
      setApplications(response.data.applications);
      setFilteredApplications(response.data.applications);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch qualified applications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeSchemes = async (classId, category) => {
    const token = Cookies.get('administration_token');
    try {
      setFeeSchemeError(null);
      const response = await axios.get('/api/fee-schemes/fetch_by_class_id_category', {
        headers: { Authorization: `Bearer ${token}` },
        params: { classId, category },
      });
      const schemes = response.data.feeSchemes || [];
      if (schemes.length === 0) {
        setFeeSchemeError(`No fee schemes found for classId: ${classId}, category: ${category}`);
      }
      setFeeSchemes(schemes);
      setSelectedFeeScheme(schemes.length > 0 ? schemes[0].id : '');
    } catch (err) {
      setFeeSchemeError('Failed to fetch fee schemes.');
      toast.error('Failed to fetch fee schemes.');
    }
  };

  const fetchPaidMonths = async (studentId, admissionId) => {
    const token = Cookies.get('administration_token');
    try {
      const response = await axios.get('/api/monthly-fees/status', {
        headers: { Authorization: `Bearer ${token}` },
        params: { studentId, admissionId, academicYear },
      });
      setPaidMonths(response.data.paidMonths.map(m => m.month) || []);
    } catch (err) {
      toast.error('Failed to fetch paid months.');
    }
  };

  useEffect(() => {
    fetchApplications(page);
  }, [page, academicYear]);

  useEffect(() => {
    if (selectedApp) {
      fetchFeeSchemes(selectedApp.classId, selectedApp.category);
      if (selectedApp.studentId && selectedApp.admissionId) {
        fetchPaidMonths(selectedApp.studentId, selectedApp.admissionId);
      }
    }
  }, [selectedApp]);

  useEffect(() => {
    const selectedScheme = feeSchemes.find(scheme => scheme.id === selectedFeeScheme);
    if (selectedScheme) {
      const monthlyTotal = selectedMonths.length * selectedScheme.monthlyFee;
      const admissionTotal = isFeePaid ? selectedScheme.admissionFee : 0;
      setTotalPayable(monthlyTotal + admissionTotal);
    } else {
      setTotalPayable(0);
    }
  }, [selectedMonths, selectedFeeScheme, isFeePaid]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = applications.filter((app) =>
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(query) ||
      app.studentUid.toLowerCase().includes(query)
    );
    setFilteredApplications(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
  };

  const handleOpenStudentDialog = (app) => {
    setSelectedApp(app);
    setOpenStudentDialog(true);
  };

  const handleCloseStudentDialog = () => {
    setOpenStudentDialog(false);
    setSelectedApp(null);
  };

  const handleOpenAdmissionDialog = (app) => {
    setSelectedApp(app);
    setOpenAdmissionDialog(true);
  };

  const handleCloseAdmissionDialog = () => {
    if (window.confirm('Close without saving?')) {
      setOpenAdmissionDialog(false);
      setSelectedApp(null);
      setSelectedFeeScheme('');
      setPaymentMethod('');
      setIsFeePaid(false);
      setTransactionId('');
      setRemarks('1st admission');
      setSelectedMonths([]);
      setPaidMonths([]);
      setFeeSchemeError(null);
      setTotalPayable(0);
    }
  };

  const handleMonthToggle = (monthIndex) => {
    if (selectedMonths.includes(monthIndex)) {
      setSelectedMonths(selectedMonths.filter((m) => m !== monthIndex));
    } else {
      setSelectedMonths([...selectedMonths, monthIndex]);
    }
  };

  const handleConfirmAdmissionAndFees = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }
    if (!selectedFeeScheme) {
      toast.error('Please select a fee scheme.');
      return;
    }
    if (!isFeePaid || !paymentMethod) {
      toast.error('Admission fee payment and method are required.');
      return;
    }
    if (selectedMonths.length > 0 && !paymentMethod) {
      toast.error('Please select a payment method for fees.');
      return;
    }
    try {
      let studentId = selectedApp.studentId;
      if (!studentId) {
        const studentResponse = await axios.post(
          '/api/students',
          {
            studentUid: selectedApp.studentUid,
            firstName: selectedApp.firstName,
            middleName: selectedApp.middleName,
            lastName: selectedApp.lastName,
            gender: selectedApp.gender,
            dateOfBirth: selectedApp.dateOfBirth,
            bloodGroup: selectedApp.bloodGroup,
            nationality: selectedApp.nationality,
            religion: selectedApp.religion,
            casteCategory: selectedApp.casteCategory,
            profileImageUrl: selectedApp.profileImageUrl,
            schoolId: selectedApp.schoolId || 1,
            branchId: selectedApp.branchId || 1,
            classId: selectedApp.classId || 1,
            admissionDate: new Date().toISOString(),
            academicYear,
            rollNumber: selectedApp.studentUid,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        studentId = studentResponse.data.student.id;
      }

      const selectedScheme = feeSchemes.find((scheme) => scheme.id === selectedFeeScheme);
      const admissionResponse = await axios.post(
        '/api/admissions',
        {
          studentId,
          branchId: selectedApp.branchId || 1,
          schoolId: selectedApp.schoolId || 1,
          classId: selectedApp.classId || 1,
          admissionType: selectedApp.category.includes('DIRECT') ? 'MIGRATION' : 'FRESH',
          admissionDate: new Date().toISOString(),
          status: isFeePaid ? 'CONFIRMED' : 'PENDING',
          applicationId: selectedApp.id,
          feeSchemeId: selectedFeeScheme,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Handle admission fee payment
      let admissionFeeReceipt = null;
      if (isFeePaid) {
        const admissionFeeResponse = await axios.post(
          '/api/admission-fee-transactions',
          {
            admissionId: admissionResponse.data.admission.id,
            studentId,
            schoolId: selectedApp.schoolId || 1,
            branchId: selectedApp.branchId || 1,
            classId: selectedApp.classId || 1,
            academicYear,
            amount: selectedScheme.admissionFee,
            feeType: selectedApp.category.includes('DIRECT') ? 'MIGRATION' : 'FRESH',
            paymentDate: new Date().toISOString(),
            paymentMethod,
            transactionId,
            remarks,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        admissionFeeReceipt = admissionFeeResponse.data;
      }

      // Update application status
      await axios.patch(
        `/api/admission-test-applications/${selectedApp.id}`,
        { status: 'ADMITTED', finalAdmissionNumber: admissionResponse.data.admission.finalAdmissionNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Handle monthly fee payments sequentially
      const monthlyFees = [];
      for (const monthIndex of selectedMonths) {
        const year = monthIndex < 4 ? academicYear + 1 : academicYear;
        const dueDate = new Date(year, monthIndex - 1, 1);

        const monthlyFee = await axios.post(
          '/api/monthly-fees',
          {
            studentId,
            admissionId: admissionResponse.data.admission.id,
            schoolId: selectedApp.schoolId || 1,
            branchId: selectedApp.branchId || 1,
            classId: selectedApp.classId || 1,
            academicYear,
            month: monthIndex,
            year,
            dueDate: dueDate.toISOString(),
            totalDue: selectedScheme.monthlyFee,
            paidAmount: selectedScheme.monthlyFee,
            status: 'PAID',
            isWaived: false,
            waivedAmount: 0,
            remarks,
            fineAmount: 0,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.post(
          '/api/monthly-fee-payments',
          {
            monthlyFeeId: monthlyFee.data.monthlyFee.id,
            amount: monthlyFee.data.monthlyFee.totalDue,
            paymentDate: new Date().toISOString(),
            method: paymentMethod,
            transactionId,
            remarks,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        monthlyFees.push({
          ...monthlyFee.data.monthlyFee,
          payment: {
            amount: monthlyFee.data.monthlyFee.totalDue,
            method: paymentMethod,
            transactionId,
            remarks,
          },
        });
      }

      // Generate PDFs
      if (admissionFeeReceipt) {
        handleGenerateAdmissionFeePDF(admissionResponse.data.admission);
      }
      monthlyFees.forEach((fee) => handleGenerateMonthlyFeePDF(fee));

      toast.success(`🎉 Admission confirmed${selectedMonths.length > 0 ? ` and monthly fees recorded for ${selectedMonths.length} month(s)` : ''}!`);
      fetchApplications(page);
      handleCloseAdmissionDialog();
    } catch (err) {
      console.error('Error processing admission and fees:', err);
      toast.error(`❌ Failed to process: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleGenerateAdmissionFeePDF = (admission) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const margin = 10;
    let y = margin;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolInfo.name, pageWidth / 2, y + 5, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(schoolInfo.address, pageWidth / 2, y + 10, { align: 'center' });
    y += 20;

    doc.setFontSize(12);
    doc.text('Admission Fee Receipt', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(10);
    doc.text(`Admission No.: ${admission.finalAdmissionNumber || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Student: ${selectedApp.firstName} ${selectedApp.lastName}`, margin, y);
    y += 7;
    doc.text(`Class: ${selectedApp.class?.name || 'N/A'} ${selectedApp.class?.section || ''}`, margin, y);
    y += 7;
    doc.text(`Category: ${selectedApp.category}`, margin, y);
    y += 7;
    const selectedScheme = feeSchemes.find((scheme) => scheme.id === selectedFeeScheme);
    doc.text(`Admission Fee: ₹${selectedScheme?.admissionFee || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Status: ${isFeePaid ? 'PAID' : 'UNPAID'}`, margin, y);
    if (isFeePaid) {
      y += 7;
      doc.text(`Payment Method: ${paymentMethod}`, margin, y);
      y += 7;
      doc.text(`Transaction ID: ${transactionId || 'N/A'}`, margin, y);
      y += 7;
      doc.text(`Remarks: ${remarks || 'N/A'}`, margin, y);
      y += 7;
      doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, margin, y);
    }

    doc.save(`admission_fee_receipt_${admission.finalAdmissionNumber}.pdf`);
  };

  const handleGenerateMonthlyFeePDF = (monthlyFee) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const margin = 10;
    let y = margin;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolInfo.name, pageWidth / 2, y + 5, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(schoolInfo.address, pageWidth / 2, y + 10, { align: 'center' });
    y += 20;

    doc.setFontSize(12);
    doc.text('Monthly Fee Receipt', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(10);
    doc.text(`Admission No.: ${selectedApp.admission?.finalAdmissionNumber || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Student: ${selectedApp.firstName} ${selectedApp.lastName}`, margin, y);
    y += 7;
    doc.text(`Class: ${selectedApp.class?.name || 'N/A'} ${selectedApp.class?.section || ''}`, margin, y);
    y += 7;
    doc.text(`Month: ${monthNames[monthlyFee.month - 1]} ${monthlyFee.year}`, margin, y);
    y += 7;
    doc.text(`Amount: ₹${monthlyFee.totalDue}`, margin, y);
    y += 7;
    doc.text(`Status: PAID`, margin, y);
    y += 7;
    doc.text(`Payment Method: ${monthlyFee.payment.method}`, margin, y);
    y += 7;
    doc.text(`Transaction ID: ${monthlyFee.payment.transactionId || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Remarks: ${monthlyFee.payment.remarks || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Payment Date: ${new Date(monthlyFee.payment.paymentDate).toLocaleDateString()}`, margin, y);

    doc.save(`monthly_fee_receipt_${selectedApp.admission?.finalAdmissionNumber}_${monthNames[monthlyFee.month - 1]}_${monthlyFee.year}.pdf`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={120} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color='error' sx={{ textAlign: 'center', mt: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        width: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: '#212121',
        height: `calc(100vh - ${appBarHeight}px)`,
        color: '#fff',
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
      <ListItemButton
        sx={{
          backgroundColor: '#181818',
          color: '#fff',
          '&:hover': { backgroundColor: '#181818' },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '8px 16px',
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ fontSize: 30, color: 'orange', fontWeight: 'bold' }}>
          🎓
        </ListItemIcon>
        <ListItemText primary='Admission Management Control Panel' />
        <TextField
          placeholder='Search by Name or UID'
          value={searchQuery}
          onChange={handleSearch}
          size='small'
          sx={{
            width: '250px',
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
          InputProps={{
            startAdornment: <Search sx={{ color: '#fff', mr: 1 }} />,
          }}
        />
        <TextField
          label="Academic Year"
          type="number"
          value={academicYear}
          onChange={(e) => setAcademicYear(parseInt(e.target.value))}
          size='small'
          sx={{
            width: '150px',
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiInputLabel-root': { color: '#aaa' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
        />
        <Button
          onClick={() => fetchApplications(page)}
          variant='outlined'
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: '#181818', borderRadius: 2, overflow: 'hidden', mt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
            bgcolor: '#333',
            borderRadius: 1,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Typography variant='body2' sx={{ flex: 0.5, fontWeight: 'bold', color: '#fff' }}>
            App No.
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Name
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Class
          </Typography>
          <Typography variant='body2' sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Category
          </Typography>
          <Typography variant='body2' sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Form No.
          </Typography>
          <Typography variant='body2' sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Status
          </Typography>
          <Typography variant='body2' sx={{ flex: 0.5, fontWeight: 'bold', color: '#fff' }}>
            Action
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: 'auto', bgcolor: '#121212', borderRadius: 1 }}>
          <List>
            {filteredApplications.length > 0 ? (
              filteredApplications.slice((page - 1) * pageSize, page * pageSize).map((app) => (
                <ListItem
                  key={app.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1,
                    bgcolor: '#181818',
                    mb: 1,
                    borderRadius: 1,
                    borderBottom: '2px solid #333',
                  }}
                >
                  <Typography variant='body2' sx={{ flex: 0.5, color: '#fff' }}>
                    {app.id}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ flex: 1, color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => handleOpenStudentDialog(app)}
                  >
                    {`${app.firstName} ${app.lastName}`}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {`${app.class?.name || 'N/A'} ${app.class?.section || ''}`.trim()}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 0.8, color: '#fff' }}>
                    {app.category}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 0.8, color: '#fff' }}>
                    {app.admitCardNumber || 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 0.8, color: '#fff' }}>
                    {app.status}
                  </Typography>
                  <Button
                    variant='contained'
                    color='primary'
                    disabled={app.status === 'ADMITTED'}
                    onClick={() => handleOpenAdmissionDialog(app)}
                    sx={{ flex: 0.5 }}
                  >
                    Admit
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No qualified applications found for academic year {academicYear}.
              </Typography>
            )}
          </List>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 1,
            bgcolor: '#181818',
            borderRadius: 2,
            mt: 2,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color='primary'
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#fff',
                '&:hover': { bgcolor: '#333' },
                '&.Mui-selected': {
                  bgcolor: greenAccent,
                  color: '#000',
                  '&:hover': { bgcolor: greenAccent },
                },
              },
            }}
            renderItem={(item) => (
              <PaginationItem
                components={{ previous: ChevronLeft, next: ChevronRight }}
                {...item}
              />
            )}
          />
        </Box>
      </Box>

      {/* Student Details Dialog */}
      <Dialog
        open={openStudentDialog}
        onClose={handleCloseStudentDialog}
        fullScreen
        sx={{
          position: 'fixed',
          top: `${appBarHeight}px`,
          left: `calc(${drawerWidth}px)`,
          transform: 'translate(0, 0)',
          '& .MuiDialog-paper': { backgroundColor: '#000', color: '#fff' },
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
        <ListItemButton
          sx={{
            backgroundColor: '#212121',
            color: '#fff',
            '&:hover': { backgroundColor: '#212121' },
          }}
        >
          <ListItemIcon>
            <Info sx={{ color: greenAccent }} />
          </ListItemIcon>
          <ListItemText
            primary={`Student Details: ${selectedApp?.firstName || ''} ${selectedApp?.lastName || ''}`}
            secondary={`Application No.: ${selectedApp?.id || 'N/A'} | Class: ${selectedApp?.class?.name || 'N/A'} ${selectedApp?.class?.section || ''} | Category: ${selectedApp?.category || 'N/A'}`}
          />
        </ListItemButton>
        <DialogContent>
          {selectedApp && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <List>
                  <ListItem>
                    <ListItemText primary="Application No." secondary={selectedApp.id} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Student UID" secondary={selectedApp.studentUid} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="First Name" secondary={selectedApp.firstName} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Middle Name" secondary={selectedApp.middleName || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Last Name" secondary={selectedApp.lastName} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Gender" secondary={selectedApp.gender} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Date of Birth" secondary={new Date(selectedApp.dateOfBirth).toLocaleDateString()} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Blood Group" secondary={selectedApp.bloodGroup || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Nationality" secondary={selectedApp.nationality || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Religion" secondary={selectedApp.religion || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Caste Category" secondary={selectedApp.casteCategory || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Category" secondary={selectedApp.category} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Status" secondary={selectedApp.status} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Admit Card Number" secondary={selectedApp.admitCardNumber || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Final Admission Number" secondary={selectedApp.finalAdmissionNumber || 'N/A'} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={6}>
                <List>
                  <ListItem>
                    <ListItemText primary="Father Name" secondary={selectedApp.fatherName || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Father Contact" secondary={selectedApp.fatherContact || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Father Email" secondary={selectedApp.fatherEmail || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Mother Name" secondary={selectedApp.motherName || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Mother Contact" secondary={selectedApp.motherContact || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Mother Email" secondary={selectedApp.motherEmail || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Guardian Name" secondary={selectedApp.guardianName || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Guardian Contact" secondary={selectedApp.guardianContact || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Guardian Relation" secondary={selectedApp.guardianRelation || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Residential Address" secondary={selectedApp.residentialAddress || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="City" secondary={selectedApp.city || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="State" secondary={selectedApp.state || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Pin Code" secondary={selectedApp.pinCode || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Previous School" secondary={selectedApp.previousSchoolName || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Last Exam Passed" secondary={selectedApp.lastExamPassed || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Last Exam Result" secondary={selectedApp.lastExamResult || 'N/A'} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStudentDialog} variant="contained" color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Admission and Fee Payment Dialog */}
      <Dialog
        open={openAdmissionDialog}
        onClose={handleCloseAdmissionDialog}
        fullScreen
        sx={{
          position: 'fixed',
          top: `${appBarHeight}px`,
          left: `calc(${drawerWidth}px)`,
          transform: 'translate(0, 0)',
          '& .MuiDialog-paper': { backgroundColor: '#000', color: '#fff' },
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
        <ListItemButton
          sx={{
            backgroundColor: '#212121',
            color: '#fff',
            '&:hover': { backgroundColor: '#212121' },
          }}
        >
          <ListItemIcon>
            <Add sx={{ color: greenAccent }} />
          </ListItemIcon>
          <ListItemText
            primary={`Confirm Admission and Fees: ${selectedApp?.firstName || ''} ${selectedApp?.lastName || ''}`}
            // secondary={`Application No.: ${selectedApp?.id || 'N/A'} | Class: ${selectedApp?.class?.name || 'N/A'} ${selectedApp?.class?.section || ''} | Category: ${selectedApp?.category || 'N/A'}`}
          />
        </ListItemButton>
              <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
        <DialogContent>
          {feeSchemeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {feeSchemeError}
            </Alert>
          )}
          <ListItemText
                    primary={`Application No.: ${selectedApp?.id || 'N/A'} | Class: ${selectedApp?.class?.name || 'N/A'} ${selectedApp?.class?.section || ''} | Category: ${selectedApp?.category || 'N/A'}`}
                  />
          <FormControl fullWidth sx={{ mt: 2, backgroundColor: '#333', borderRadius: '4px' }}>
            <InputLabel sx={{ color: '#aaa' }}>Fee Scheme</InputLabel>
            <Select
              value={selectedFeeScheme}
              onChange={(e) => setSelectedFeeScheme(e.target.value)}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
              }}
              disabled={feeSchemes.length === 0}
            >
              {feeSchemes.map((scheme) => (
                <MenuItem key={scheme.id} value={scheme.id}>
                  {`₹${scheme.admissionFee} (Admission), ₹${scheme.monthlyFee} (Monthly) (${scheme.category})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Admission Fee Section */}
          <Typography variant="h6" sx={{ mt: 4, color: '#fff' }}>
            Admission Fee
          </Typography>
          {selectedFeeScheme && (
            <Typography sx={{ mt: 1, color: '#fff' }}>
              Amount: ₹{feeSchemes.find(scheme => scheme.id === selectedFeeScheme)?.admissionFee || 'N/A'}
            </Typography>
          )}

          {/* Monthly Fee Section */}
          <Typography variant="h6" sx={{ mt: 4, color: '#fff' }}>
            Monthly Fee (Academic Year: April {academicYear} - March {academicYear + 1})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {monthNames.map((month, index) => {
              const monthIndex = index + 1;
              const isPaid = paidMonths.includes(monthIndex);
              const isSelected = selectedMonths.includes(monthIndex);
              return (
                <Chip
                  key={monthIndex}
                  label={month}
                  onClick={() => !isPaid && handleMonthToggle(monthIndex)}
                  sx={{
                    backgroundColor: isPaid ? greenAccent : isSelected ? yellowAccent : '#555',
                    color: isPaid || isSelected ? '#000' : '#fff',
                    '&:hover': { backgroundColor: isPaid ? greenAccent : isSelected ? yellowAccent : '#777' },
                    cursor: isPaid ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isPaid}
                />
              );
            })}
          </Box>
          {selectedMonths.length > 0 && selectedFeeScheme && (
            <Box sx={{ mt: 2 }}>
              {selectedMonths.map((monthIndex) => (
                <Box
                  key={monthIndex}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#fff',
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ textAlign: 'left' }}>
                    {monthNames[monthIndex - 1]}
                  </Typography>
                  <Typography sx={{ textAlign: 'right' }}>
                    ₹{feeSchemes.find(scheme => scheme.id === selectedFeeScheme)?.monthlyFee || 'N/A'}
                  </Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', mt: 1 }}>
                <Typography>Total Monthly Fees:</Typography>
                <Typography>
                  ₹{selectedMonths.length * (feeSchemes.find(scheme => scheme.id === selectedFeeScheme)?.monthlyFee || 0)}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Payment Details Section */}
          <Typography variant="h6" sx={{ mt: 4, color: '#fff' }}>
            Payment Details
          </Typography>
          <FormControl fullWidth sx={{ mt: 2, backgroundColor: '#333', borderRadius: '4px' }}>
            <InputLabel sx={{ color: '#aaa' }}>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
              }}
            >
              {['CASH', 'UPI', 'BANK_TRANSFER', 'ONLINE_GATEWAY', 'CHEQUE'].map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {paymentMethod === 'UPI' && (
            <>
              <TextField
                label="Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                fullWidth
                margin="normal"
                sx={{
                  backgroundColor: '#333',
                  borderRadius: '4px',
                  '& .MuiInputBase-input': { color: '#fff' },
                  '& .MuiInputLabel-root': { color: '#aaa' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
                }}
              />
              <TextField
                label="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="1st admission"
                sx={{
                  backgroundColor: '#333',
                  borderRadius: '4px',
                  '& .MuiInputBase-input': { color: '#fff' },
                  '& .MuiInputLabel-root': { color: '#aaa' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
                }}
              />
            </>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={isFeePaid}
                onChange={(e) => setIsFeePaid(e.target.checked)}
                sx={{ color: greenAccent, '&.Mui-checked': { color: greenAccent } }}
              />
            }
            label="Fees Paid"
            sx={{ color: '#fff', mt: 2 }}
          />
          {totalPayable > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 2,
                color: greenAccent,
                fontWeight: 'bold',
                fontSize: '1.2rem',
              }}
            >
              <Typography>Total Payable Right Now:</Typography>
              <Typography>₹{totalPayable}</Typography>
            </Box>
          )}
        </DialogContent>
        </Box></Box>
        <DialogActions>
          <Button onClick={handleCloseAdmissionDialog} variant="contained" color="error">Cancel</Button>
          <Button
            onClick={handleConfirmAdmissionAndFees}
            variant="contained"
            color="primary"
            disabled={feeSchemes.length === 0}
          >
            Confirm Admission and Fees
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdmissionManagement;
