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
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import { RotateRight, Search, ChevronLeft, ChevronRight, Add, Payment } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { jsPDF } from 'jspdf';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

const schoolInfo = {
  name: 'Sure Success Point School',
  site: 'www.sspointschool.in',
  address: 'Najirpur, Alinagar, Kaliachak, Malda',
  company: 'Powered by Knights International Group for Research, Education & Academic Development',
};

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
  const [remarks, setRemarks] = useState('');
  const [isFeeWaived, setIsFeeWaived] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0: Admission Fee, 1: Monthly Fee
  const [numMonths, setNumMonths] = useState(1);
  const [monthlyPaymentMethod, setMonthlyPaymentMethod] = useState('');
  const [monthlyTransactionId, setMonthlyTransactionId] = useState('');
  const [monthlyRemarks, setMonthlyRemarks] = useState('');
  const [isMonthlyFeeWaived, setIsMonthlyFeeWaived] = useState(false);

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
      const response = await axios.get('/api/fee-schemes/fetch_by_class_id_category', {
        headers: { Authorization: `Bearer ${token}` },
        params: { classId, category },
      });
      setFeeSchemes(response.data.feeSchemes || []);
    } catch (err) {
      toast.error('Failed to fetch fee schemes.');
    }
  };

  useEffect(() => {
    fetchApplications(page);
  }, [page, academicYear]);

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
    fetchFeeSchemes(app.classId, app.category);
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
      setRemarks('');
      setIsFeeWaived(false);
      setTabValue(0);
      setNumMonths(1);
      setMonthlyPaymentMethod('');
      setMonthlyTransactionId('');
      setMonthlyRemarks('');
      setIsMonthlyFeeWaived(false);
    }
  };

  const handleConfirmAdmission = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }
    if (!selectedFeeScheme) {
      toast.error('Please select a fee scheme.');
      return;
    }
    try {
      // Step 1: Create or retrieve Student record
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
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        studentId = studentResponse.data.student.id;
      }

      // Step 2: Create Admission record
      const admissionResponse = await axios.post(
        '/api/admissions',
        {
          studentId,
          branchId: selectedApp.branchId,
          schoolId: selectedApp.schoolId,
          classId: selectedApp.classId,
          admissionType: selectedApp.category.includes('DIRECT') ? 'MIGRATION' : 'FRESH',
          admissionDate: new Date().toISOString(),
          status: isFeePaid || isFeeWaived ? 'CONFIRMED' : 'PENDING',
          applicationId: selectedApp.id,
          feeSchemeId: selectedFeeScheme,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Step 3: Create AdmissionFeeTransaction if fee is paid or waived
      if (isFeePaid || isFeeWaived) {
        const selectedScheme = feeSchemes.find((scheme) => scheme.id === selectedFeeScheme);
        await axios.post(
          '/api/admission-fee-transactions',
          {
            admissionId: admissionResponse.data.admission.id,
            studentId,
            schoolId: selectedApp.schoolId,
            branchId: selectedApp.branchId,
            classId: selectedApp.classId,
            academicYear,
            amount: isFeeWaived ? 0 : selectedScheme.admissionFee,
            feeType: selectedApp.category.includes('DIRECT') ? 'MIGRATION' : 'FRESH',
            paymentDate: new Date().toISOString(),
            paymentMethod: isFeeWaived ? null : paymentMethod,
            transactionId: isFeeWaived ? null : transactionId,
            remarks: isFeeWaived ? `Waived: ${remarks}` : remarks,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Step 4: Update AdmissionTestApplication status to ADMITTED
      await axios.patch(
        `/api/admission-test-applications/${selectedApp.id}`,
        { status: 'ADMITTED', finalAdmissionNumber: admissionResponse.data.admission.finalAdmissionNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Step 5: Generate PDF for admission fee
      if (isFeePaid || isFeeWaived) {
        handleGenerateAdmissionFeePDF(admissionResponse.data.admission);
      }

      toast.success('🎉 Admission confirmed!');
      fetchApplications(page);
      handleCloseAdmissionDialog();
    } catch (err) {
      console.error('Error confirming admission:', err);
      toast.error(`❌ Failed to confirm admission: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleRecordMonthlyFees = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }
    if (!selectedFeeScheme) {
      toast.error('Please select a fee scheme.');
      return;
    }
    if (!isMonthlyFeeWaived && (!monthlyPaymentMethod || numMonths < 1)) {
      toast.error('Please select a payment method and number of months.');
      return;
    }
    try {
      const selectedScheme = feeSchemes.find((scheme) => scheme.id === selectedFeeScheme);
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentYear = new Date().getFullYear();
      const monthlyFees = [];

      for (let i = 0; i < numMonths; i++) {
        const month = (currentMonth + i - 1) % 12 + 1;
        const year = currentYear + Math.floor((currentMonth + i - 1) / 12);
        const dueDate = new Date(year, month, 1); // First of next month

        const monthlyFee = await axios.post(
          '/api/monthly-fees',
          {
            studentId: selectedApp.studentId,
            admissionId: selectedApp.admissionId,
            schoolId: selectedApp.schoolId,
            branchId: selectedApp.branchId,
            classId: selectedApp.classId,
            academicYear,
            month,
            year,
            dueDate: dueDate.toISOString(),
            totalDue: selectedScheme.monthlyFee,
            status: isMonthlyFeeWaived ? 'WAIVED' : 'PAID',
            isWaived: isMonthlyFeeWaived,
            waivedAmount: isMonthlyFeeWaived ? selectedScheme.monthlyFee : 0,
            remarks: isMonthlyFeeWaived ? `Waived: ${monthlyRemarks}` : monthlyRemarks,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!isMonthlyFeeWaived) {
          await axios.post(
            '/api/monthly-fee-payments',
            {
              monthlyFeeId: monthlyFee.data.monthlyFee.id,
              amount: monthlyFee.data.monthlyFee.totalDue,
              paymentDate: new Date().toISOString(),
              method: monthlyPaymentMethod,
              transactionId: monthlyTransactionId,
              remarks: monthlyRemarks,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        monthlyFees.push({ ...monthlyFee.data.monthlyFee, payment: { amount: monthlyFee.data.monthlyFee.totalDue, method: monthlyPaymentMethod, transactionId: monthlyTransactionId, remarks: monthlyRemarks } });
      }

      // Generate PDF for monthly fees
      monthlyFees.forEach((fee) => handleGenerateMonthlyFeePDF(fee));

      toast.success(`🎉 Recorded monthly fees for ${numMonths} month(s)!`);
      fetchApplications(page);
      handleCloseAdmissionDialog();
    } catch (err) {
      console.error('Error recording monthly fees:', err);
      toast.error(`❌ Failed to record monthly fees: ${err.response?.data?.error || err.message}`);
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
    doc.text(`Admission Fee: ₹${isFeeWaived ? 0 : selectedScheme?.admissionFee || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Status: ${isFeeWaived ? 'WAIVED' : isFeePaid ? 'PAID' : 'UNPAID'}`, margin, y);
    if (isFeePaid && !isFeeWaived) {
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
    doc.text(`Month: ${monthlyFee.month}/${monthlyFee.year}`, margin, y);
    y += 7;
    doc.text(`Amount: ₹${isMonthlyFeeWaived ? 0 : monthlyFee.totalDue}`, margin, y);
    y += 7;
    doc.text(`Status: ${isMonthlyFeeWaived ? 'WAIVED' : 'PAID'}`, margin, y);
    if (!isMonthlyFeeWaived) {
      y += 7;
      doc.text(`Payment Method: ${monthlyFee.payment.method}`, margin, y);
      y += 7;
      doc.text(`Transaction ID: ${monthlyFee.payment.transactionId || 'N/A'}`, margin, y);
      y += 7;
      doc.text(`Remarks: ${monthlyFee.payment.remarks || 'N/A'}`, margin, y);
      y += 7;
      doc.text(`Payment Date: ${new Date(monthlyFee.payment.paymentDate).toLocaleDateString()}`, margin, y);
    }

    doc.save(`monthly_fee_receipt_${selectedApp.admission?.finalAdmissionNumber}_${monthlyFee.month}_${monthlyFee.year}.pdf`);
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
        minWidth: `calc(100vw - ${drawerWidth}px)`,
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
        <Typography variant='h6' sx={{ p: 2, color: '#fff' }}>Qualified Applications</Typography>
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
        fullWidth
        maxWidth="md"
        sx={{ '& .MuiDialog-paper': { backgroundColor: '#000', color: '#fff' } }}
      >
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          {selectedApp && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography><strong>Application No:</strong> {selectedApp.id}</Typography>
                <Typography><strong>Student UID:</strong> {selectedApp.studentUid}</Typography>
                <Typography><strong>First Name:</strong> {selectedApp.firstName}</Typography>
                <Typography><strong>Middle Name:</strong> {selectedApp.middleName || 'N/A'}</Typography>
                <Typography><strong>Last Name:</strong> {selectedApp.lastName}</Typography>
                <Typography><strong>Gender:</strong> {selectedApp.gender}</Typography>
                <Typography><strong>Date of Birth:</strong> {new Date(selectedApp.dateOfBirth).toLocaleDateString()}</Typography>
                <Typography><strong>Blood Group:</strong> {selectedApp.bloodGroup || 'N/A'}</Typography>
                <Typography><strong>Nationality:</strong> {selectedApp.nationality || 'N/A'}</Typography>
                <Typography><strong>Religion:</strong> {selectedApp.religion || 'N/A'}</Typography>
                <Typography><strong>Caste Category:</strong> {selectedApp.casteCategory || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography><strong>Father Name:</strong> {selectedApp.fatherName || 'N/A'}</Typography>
                <Typography><strong>Father Contact:</strong> {selectedApp.fatherContact || 'N/A'}</Typography>
                <Typography><strong>Father Email:</strong> {selectedApp.fatherEmail || 'N/A'}</Typography>
                <Typography><strong>Mother Name:</strong> {selectedApp.motherName || 'N/A'}</Typography>
                <Typography><strong>Mother Contact:</strong> {selectedApp.motherContact || 'N/A'}</Typography>
                <Typography><strong>Mother Email:</strong> {selectedApp.motherEmail || 'N/A'}</Typography>
                <Typography><strong>Guardian Name:</strong> {selectedApp.guardianName || 'N/A'}</Typography>
                <Typography><strong>Guardian Contact:</strong> {selectedApp.guardianContact || 'N/A'}</Typography>
                <Typography><strong>Guardian Relation:</strong> {selectedApp.guardianRelation || 'N/A'}</Typography>
                <Typography><strong>Residential Address:</strong> {selectedApp.residentialAddress || 'N/A'}</Typography>
                <Typography><strong>City:</strong> {selectedApp.city || 'N/A'}</Typography>
                <Typography><strong>State:</strong> {selectedApp.state || 'N/A'}</Typography>
                <Typography><strong>Pin Code:</strong> {selectedApp.pinCode || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Previous School:</strong> {selectedApp.previousSchoolName || 'N/A'}</Typography>
                <Typography><strong>Last Exam Passed:</strong> {selectedApp.lastExamPassed || 'N/A'}</Typography>
                <Typography><strong>Last Exam Result:</strong> {selectedApp.lastExamResult || 'N/A'}</Typography>
                <Typography><strong>Category:</strong> {selectedApp.category}</Typography>
                <Typography><strong>Status:</strong> {selectedApp.status}</Typography>
                <Typography><strong>Admit Card Number:</strong> {selectedApp.admitCardNumber || 'N/A'}</Typography>
                <Typography><strong>Final Admission Number:</strong> {selectedApp.finalAdmissionNumber || 'N/A'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStudentDialog} variant="contained" color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Admission Confirmation and Fee Payment Dialog */}
      <Dialog
        open={openAdmissionDialog}
        onClose={handleCloseAdmissionDialog}
        fullWidth
        maxWidth="sm"
        sx={{ '& .MuiDialog-paper': { backgroundColor: '#000', color: '#fff' } }}
      >
        <ListItemButton
          sx={{
            backgroundColor: '#212121',
            color: '#fff',
            '&:hover': { backgroundColor: '#212121' },
          }}
        >
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="Confirm Admission and Fees" />
        </ListItemButton>
        <DialogContent>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ bgcolor: '#181818', color: '#fff', mb: 2 }}
          >
            <Tab label="Admission Fee" sx={{ color: '#fff', '&.Mui-selected': { color: greenAccent } }} />
            <Tab label="Monthly Fee" sx={{ color: '#fff', '&.Mui-selected': { color: greenAccent } }} />
          </Tabs>

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
            >
              {feeSchemes.map((scheme) => (
                <MenuItem key={scheme.id} value={scheme.id}>
                  {`₹${scheme.admissionFee} (Admission), ₹${scheme.monthlyFee} (Monthly)`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {tabValue === 0 && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isFeeWaived}
                    onChange={(e) => setIsFeeWaived(e.target.checked)}
                    sx={{ color: greenAccent, '&.Mui-checked': { color: greenAccent } }}
                  />
                }
                label="Waive Admission Fee"
                sx={{ color: '#fff', mt: 2 }}
              />
              {!isFeeWaived && (
                <>
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
                    label="Admission Fee Paid"
                    sx={{ color: '#fff', mt: 2 }}
                  />
                </>
              )}
            </>
          )}

          {tabValue === 1 && (
            <>
              <TextField
                label="Number of Months"
                type="number"
                value={numMonths}
                onChange={(e) => setNumMonths(Math.max(1, parseInt(e.target.value) || 1))}
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isMonthlyFeeWaived}
                    onChange={(e) => setIsMonthlyFeeWaived(e.target.checked)}
                    sx={{ color: greenAccent, '&.Mui-checked': { color: greenAccent } }}
                  />
                }
                label="Waive Monthly Fee"
                sx={{ color: '#fff', mt: 2 }}
              />
              {!isMonthlyFeeWaived && (
                <>
                  <FormControl fullWidth sx={{ mt: 2, backgroundColor: '#333', borderRadius: '4px' }}>
                    <InputLabel sx={{ color: '#aaa' }}>Payment Method</InputLabel>
                    <Select
                      value={monthlyPaymentMethod}
                      onChange={(e) => setMonthlyPaymentMethod(e.target.value)}
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
                  {monthlyPaymentMethod === 'UPI' && (
                    <>
                      <TextField
                        label="Transaction ID"
                        value={monthlyTransactionId}
                        onChange={(e) => setMonthlyTransactionId(e.target.value)}
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
                        value={monthlyRemarks}
                        onChange={(e) => setMonthlyRemarks(e.target.value)}
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
                    </>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdmissionDialog} variant="contained" color="error">Cancel</Button>
          {tabValue === 0 && <Button onClick={handleConfirmAdmission} variant="contained" color="primary">Confirm Admission</Button>}
          {tabValue === 1 && <Button onClick={handleRecordMonthlyFees} variant="contained" color="primary">Record Monthly Fees</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdmissionManagement;
