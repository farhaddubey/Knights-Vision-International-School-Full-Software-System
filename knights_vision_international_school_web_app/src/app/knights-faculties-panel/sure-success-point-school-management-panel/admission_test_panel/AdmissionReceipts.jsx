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
  Alert,
} from '@mui/material';
import { Search, ChevronLeft, ChevronRight, Receipt } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { jsPDF } from 'jspdf';
import { RotateRight } from '@mui/icons-material';
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

const AdmissionReceipts = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [academicYear, setAcademicYear] = useState(2025);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchReceipts = async (pageNum = 1, formId = '') => {
    const token = Cookies.get('faculties_token');
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api-schools-panel/admissions/receipts', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize, academicYear, formId },
      });
      if (!response.data || !Array.isArray(response.data.applications)) {
        throw new Error('Invalid response format');
      }
      setApplications(response.data.applications);
      setFilteredApplications(response.data.applications);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch admission receipts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts(page, searchQuery);
  }, [page, academicYear]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    fetchReceipts(1, query);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchReceipts(value, searchQuery);
  };

  const handleGenerateAdmissionFeePDF = (app) => {
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
    doc.text(`Admission No.: ${app.admission.finalAdmissionNumber || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Student: ${app.firstName} ${app.lastName}`, margin, y);
    y += 7;
    doc.text(`Class: ${app.class?.name || 'N/A'} ${app.class?.section || ''}`, margin, y);
    y += 7;
    doc.text(`Category: ${app.category}`, margin, y);
    y += 7;
    doc.text(`Admission Fee: ₹${app.admission.feeScheme?.admissionFee || 'N/A'}`, margin, y);
    y += 7;
    const isPaid = app.admission.admissionFeeTransaction !== null;
    doc.text(`Status: ${isPaid ? 'PAID' : 'UNPAID'}`, margin, y);
    if (isPaid) {
      y += 7;
      doc.text(`Payment Method: ${app.admission.admissionFeeTransaction.paymentMethod || 'N/A'}`, margin, y);
      y += 7;
      doc.text(`Transaction ID: ${app.admission.admissionFeeTransaction.transactionId || 'N/A'}`, margin, y);
      y += 7;
      doc.text(`Remarks: ${app.admission.admissionFeeTransaction.remarks || 'N/A'}`, margin, y);
      y += 7;
      doc.text(`Payment Date: ${app.admission.admissionFeeTransaction.paymentDate ? new Date(app.admission.admissionFeeTransaction.paymentDate).toLocaleDateString() : 'N/A'}`, margin, y);
    }

    doc.save(`admission_fee_receipt_${app.admission.finalAdmissionNumber}.pdf`);
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
          🧾
        </ListItemIcon>
        <ListItemText primary="Admission Fee Receipt Generator" />
        <TextField
          placeholder="Search by Form ID or Admission Number"
          value={searchQuery}
          onChange={handleSearch}
          size="small"
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
          size="small"
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
          onClick={() => fetchReceipts(page, searchQuery)}
          variant="outlined"
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
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: 'bold', color: '#fff' }}>
            App No.
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Class
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Category
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Form No.
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Admission No.
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Fee Status
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: 'bold', color: '#fff' }}>
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
                  <Typography variant="body2" sx={{ flex: 0.5, color: '#fff' }}>
                    {app.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: '#fff' }}>
                    {`${app.firstName} ${app.lastName}`}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: '#fff' }}>
                    {`${app.class?.name || 'N/A'} ${app.class?.section || ''}`.trim()}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: '#fff' }}>
                    {app.category}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: '#fff' }}>
                    {app.admitCardNumber || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: '#fff' }}>
                    {app.finalAdmissionNumber || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: '#fff' }}>
                    {app.admission.admissionFeeTransaction ? 'PAID' : 'UNPAID'}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!app.admission.admissionFeeTransaction}
                    onClick={() => handleGenerateAdmissionFeePDF(app)}
                    sx={{ flex: 0.5 }}
                  >
                    Generate Receipt
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No admitted applicants found for academic year {academicYear}.
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
            color="primary"
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
    </Box>
  );
};

export default AdmissionReceipts;