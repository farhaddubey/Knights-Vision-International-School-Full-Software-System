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
} from '@mui/material';
import { Print, RotateRight, Search, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { jsPDF } from 'jspdf';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

// School information for PDF header
const schoolInfo = {
  name: 'Sure Success Point School',
  address: '123 Education Lane, Springfield, SP 12345',
  logo: 'https://example.com/logo.png', // Placeholder; replace with actual logo URL or remove if not used
};

const TestResultManagement = () => {
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

  const fetchApplications = async (pageNum = 1, forPdf = false) => {
    const token = Cookies.get('administration_token');
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return [];
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/admission-test-applications/results', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: forPdf ? 1 : pageNum, pageSize: forPdf ? 9999 : pageSize, academicYear },
      });
      if (!response.data || !Array.isArray(response.data.applications)) {
        throw new Error('Invalid response format: applications array missing');
      }
      if (!forPdf) {
        setApplications(response.data.applications);
        setFilteredApplications(response.data.applications);
        setTotalPages(response.data.totalPages || 1);
      }
      return response.data.applications;
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.error || 'Failed to fetch applications.');
      return [];
    } finally {
      setLoading(false);
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

  const handleGeneratePDF = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }
    try {
      const applications = await fetchApplications(1, true); // Fetch all applications
      if (applications.length === 0) {
        toast.error('No applications found for the selected academic year.');
        return;
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10;
      const rowHeight = 10;
      const colWidths = [20, 50, 30, 30, 30, 30]; // App No, Name, Class, Qualified, Form No, Marks
      const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);
      let y = margin;

      // School Info Header (First Row)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(schoolInfo.name, pageWidth / 2, y + 5, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(schoolInfo.address, pageWidth / 2, y + 10, { align: 'center' });
      y += 20;

      // Table Header
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setLineWidth(0.5);
      const headers = ['App No.', 'Name', 'Applied Class', 'Qualified', 'Form No.', 'Test Result'];
      let x = margin;
      headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], rowHeight);
        doc.text(header, x + 2, y + 7);
        x += colWidths[i];
      });
      y += rowHeight;

      // Table Rows
      applications.forEach((app, index) => {
        if (y > pageHeight - margin - rowHeight) {
          doc.addPage();
          y = margin;
          // Redraw headers on new page
          x = margin;
          doc.setFont('helvetica', 'bold');
          headers.forEach((header, i) => {
            doc.rect(x, y, colWidths[i], rowHeight);
            doc.text(header, x + 2, y + 7);
            x += colWidths[i];
          });
          y += rowHeight;
        }

        x = margin;
        doc.setFont('helvetica', 'normal');
        const rowData = [
          app.id.toString(),
          `${app.firstName} ${app.lastName}`,
          `${app.class?.name || 'N/A'} ${app.class?.section || ''}`.trim(),
          app.qualified ? 'Yes' : 'No',
          app.admitCardNumber || 'N/A',
          app.totalMarks ? app.totalMarks.toString() : 'N/A',
        ];
        rowData.forEach((data, i) => {
          doc.rect(x, y, colWidths[i], rowHeight);
          doc.text(data, x + 2, y + 7);
          x += colWidths[i];
        });
        y += rowHeight;
      });

      doc.save(`result_list_${academicYear}.pdf`);
      toast.success('🎉 PDF generated successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('❌ Failed to generate PDF.');
    }
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
          📊
        </ListItemIcon>
        <ListItemText primary='Test Result Management Control Panel' />
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
        <Button variant='contained' color='primary' onClick={handleGeneratePDF}>
          <Print /> Download PDF
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: '#181818', borderRadius: 2, overflow: 'hidden'}}>
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
            Applied Class
          </Typography>
          <Typography variant='body2' sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Qualified
          </Typography>
          <Typography variant='body2' sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Form No.
          </Typography>
          <Typography variant='body2' sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
            Test Result
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
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {`${app.firstName} ${app.lastName}`}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {`${app.class?.name || 'N/A'} ${app.class?.section || ''}`.trim()}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 0.8, color: '#fff' }}>
                    {app.qualified ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 0.8, color: '#fff' }}>
                    {app.admitCardNumber || 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 0.8, color: '#fff' }}>
                    {app.totalMarks ? app.totalMarks.toString() : 'N/A'}
                  </Typography>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No applications found for academic year {academicYear}.
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
    </Box>
  );
};

export default TestResultManagement;
