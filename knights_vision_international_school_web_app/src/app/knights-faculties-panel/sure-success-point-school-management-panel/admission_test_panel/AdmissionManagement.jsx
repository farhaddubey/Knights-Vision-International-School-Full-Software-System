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
import { Edit, Delete, Add, RotateRight, Search, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import AdmissionDialog from './dialogs/AdmissionDialog';
import AdmissionTestApplicationDialog from './dialogs/AdmissionTestApplicationDialog';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

const AdmissionManagement = () => {
  const [admissions, setAdmissions] = useState([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openApplicationDialog, setOpenApplicationDialog] = useState(false);
  const [editFields, setEditFields] = useState([]);
  const [applicationEditFields, setApplicationEditFields] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchAdmissions = async (pageNum = 1) => {
    const token = Cookies.get('faculties_token');
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize },
      });
      if (!response.data || !Array.isArray(response.data.admissions)) {
        throw new Error('Invalid response format: admissions array missing');
      }
      setAdmissions(response.data.admissions);
      setFilteredAdmissions(response.data.admissions);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching admissions:', err);
      setError(err.response?.data?.error || 'Failed to fetch admissions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    const token = Cookies.get('faculties_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }
    try {
      const response = await axios.get(`/api/admission-test-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast.error('Failed to fetch applications.');
    }
  };

  useEffect(() => {
    fetchAdmissions(page);
  }, [page]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = admissions.filter((admission) =>
      admission.student?.firstName?.toLowerCase().includes(query) ||
      admission.student?.lastName?.toLowerCase().includes(query)
    );
    setFilteredAdmissions(filtered);
  };

  const handleOpenDialog = (admission = null) => {
    if (admission) {
      setEditFields([{
        id: admission.id,
        studentId: admission.studentId || '',
        branchId: admission.branchId || '',
        schoolId: admission.schoolId || '',
        classId: admission.classId || '',
        admissionType: admission.admissionType || 'NEW',
        admissionDate: admission.admissionDate ? new Date(admission.admissionDate).toISOString().split('T')[0] : '',
        previousClassId: admission.previousClassId || '',
        transferCertificateId: admission.transferCertificateId || '',
        status: admission.status || 'pending',
        applicationId: admission.applicationId || '',
      }]);
    } else {
      setEditFields([{
        studentId: '',
        branchId: '',
        schoolId: '',
        classId: '',
        admissionType: 'NEW',
        admissionDate: '',
        previousClassId: '',
        transferCertificateId: '',
        status: 'pending',
        applicationId: '',
      }]);
    }
    setOpenDialog(true);
  };

  const handleOpenApplicationDialog = (application = null) => {
    if (application) {
      setApplicationEditFields([{
        id: application.id,
        studentUid: application.studentUid || '',
        guardian_uid: application.guardian_uid || '',
        studentId: application.studentId || '',
        firstName: application.firstName || '',
        middleName: application.middleName || '',
        lastName: application.lastName || '',
        gender: application.gender || '',
        dateOfBirth: application.dateOfBirth ? new Date(application.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: application.bloodGroup || '',
        nationality: application.nationality || '',
        religion: application.religion || '',
        casteCategory: application.casteCategory || '',
        profileImageUrl: application.profileImageUrl || '',
        dreamOrAim: application.dreamOrAim || '',
        hobbies: application.hobbies || '',
        specialTalents: application.specialTalents || '',
        previousSchoolName: application.previousSchoolName || '',
        lastExamPassed: application.lastExamPassed || '',
        lastExamResult: application.lastExamResult || '',
        previousAdmissionFee: application.previousAdmissionFee || '',
        previousMonthlyFee: application.previousMonthlyFee || '',
        reasonOfTransfer: application.reasonOfTransfer || '',
        previousSchoolMedium: application.previousSchoolMedium || '',
        previousSchoolBoard: application.previousSchoolBoard || '',
        previousSchoolCity: application.previousSchoolCity || '',
        fatherName: application.fatherName || '',
        fatherContact: application.fatherContact || '',
        fatherEmail: application.fatherEmail || '',
        fatherProfession: application.fatherProfession || '',
        fatherQualification: application.fatherQualification || '',
        fatherIncome: application.fatherIncome || '',
        motherName: application.motherName || '',
        motherContact: application.motherContact || '',
        motherEmail: application.motherEmail || '',
        motherProfession: application.motherProfession || '',
        motherQualification: application.motherQualification || '',
        motherIncome: application.motherIncome || '',
        guardianName: application.guardianName || '',
        guardianContact: application.guardianContact || '',
        guardianRelation: application.guardianRelation || '',
        guardianAddress: application.guardianAddress || '',
        emergencyContact: application.emergencyContact || '',
        residentialAddress: application.residentialAddress || '',
        city: application.city || '',
        state: application.state || '',
        pinCode: application.pinCode || '',
        isTransportRequired: application.isTransportRequired || false,
        preferredLanguage: application.preferredLanguage || '',
        branchId: application.branchId || '',
        schoolId: application.schoolId || '',
        classId: application.classId || '',
        academicYear: application.academicYear || 2025,
        status: application.status || 'pending',
        admissionId: application.admissionId || '',
      }]);
    } else {
      setApplicationEditFields([{
        studentUid: '',
        guardian_uid: '',
        studentId: '',
        firstName: '',
        lastName: '',
        middleName: '',
        gender: '',
        dateOfBirth: '',
        bloodGroup: '',
        nationality: '',
        religion: '',
        casteCategory: '',
        profileImageUrl: '',
        dreamOrAim: '',
        hobbies: '',
        specialTalents: '',
        previousSchoolName: '',
        lastExamPassed: '',
        lastExamResult: '',
        previousAdmissionFee: '',
        previousMonthlyFee: '',
        reasonOfTransfer: '',
        previousSchoolMedium: '',
        previousSchoolBoard: '',
        previousSchoolCity: '',
        fatherName: '',
        fatherContact: '',
        fatherEmail: '',
        fatherProfession: '',
        fatherQualification: '',
        fatherIncome: '',
        motherName: '',
        motherContact: '',
        motherEmail: '',
        motherProfession: '',
        motherQualification: '',
        motherIncome: '',
        guardianName: '',
        guardianContact: '',
        guardianRelation: '',
        guardianAddress: '',
        emergencyContact: '',
        residentialAddress: '',
        city: '',
        state: '',
        pinCode: '',
        isTransportRequired: false,
        preferredLanguage: '',
        branchId: '',
        schoolId: '',
        classId: '',
        academicYear: 2025,
        status: 'pending',
        admissionId: '',
      }]);
    }
    setOpenApplicationDialog(true);
  };

  const handleCloseDialog = () => {
    if (window.confirm('Are you sure you want to close the modal, unsaved?')) {
      setOpenDialog(false);
      setEditFields([]);
    }
  };

  const handleCloseApplicationDialog = () => {
    if (window.confirm('Are you sure you want to close the modal, unsaved?')) {
      setOpenApplicationDialog(false);
      setApplicationEditFields([]);
    }
  };

  const handleSaveAndCloseDialog = () => {
    setOpenDialog(false);
    setEditFields([]);
  };

  const handleSaveAndCloseApplicationDialog = () => {
    setOpenApplicationDialog(false);
    setApplicationEditFields([]);
  };

  const handleDeleteAdmission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admission?')) return;
    const token = Cookies.get('faculties_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }
    try {
      await axios.delete(`/api/admissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ Admission deleted successfully!');
      fetchAdmissions(page);
    } catch (err) {
      console.error('Delete Error:', err.response?.data || err.message);
      toast.error('❌ Error deleting admission.');
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
          📝
        </ListItemIcon>
        <ListItemText primary='Admission Management Control Panel' />
        <TextField
          placeholder='Search by Student Name'
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
        <Button
          onClick={() => fetchAdmissions(page)}
          variant='outlined'
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button variant='contained' color='primary' onClick={() => handleOpenDialog()}>
          <Add /> Add New Admission
        </Button>
        <Button variant='contained' color='primary' onClick={() => handleOpenApplicationDialog()}>
          <Add /> Add New Application
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: '#181818', borderRadius: 2, overflow: 'hidden' }}>
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
            ID
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Student
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Class
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Status
          </Typography>
          <Box sx={{ flex: 0.8 }}></Box>
        </Box>

        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 150}px)`, overflowY: 'auto', bgcolor: '#121212', borderRadius: 1, paddingBottom: 10 }}>
          <List>
            {filteredAdmissions.length > 0 ? (
              filteredAdmissions.map((admission) => (
                <ListItem
                  key={admission.id}
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
                    {admission.id}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {admission.student ? `${admission.student.firstName} ${admission.student.lastName}` : 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {admission.class?.name ? `${admission.class.name}${admission.class.section ? ` - ${admission.class.section}` : ''}` : 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {admission.status ?? 'N/A'}
                  </Typography>
                  <Box sx={{ flex: 0.8, display: 'flex', gap: 1 }}>
                    <Button variant='outlined' color='primary' onClick={() => handleOpenDialog(admission)}>
                      <Edit /> Edit
                    </Button>
                    <Button variant='outlined' color='error' onClick={() => handleDeleteAdmission(admission.id)}>
                      <Delete /> Delete
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No admissions found.
              </Typography>
            )}
          </List>
        </Box>

        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: `calc(${drawerWidth}px + 50%)`,
            transform: 'translateX(-50%)',
            bgcolor: '#181818',
            borderRadius: 2,
            p: 1,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 1000,
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

      <AdmissionDialog
        openInsertion={openDialog}
        handleCloseModal={handleCloseDialog}
        handleSaveAndCloseModal={handleSaveAndCloseDialog}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchAdmissions={fetchAdmissions}
      />
      <AdmissionTestApplicationDialog
        openInsertion={openApplicationDialog}
        handleCloseModal={handleCloseApplicationDialog}
        handleSaveAndCloseModal={handleSaveAndCloseApplicationDialog}
        editFields={applicationEditFields}
        setEditFields={setApplicationEditFields}
        fetchApplications={fetchApplications}
      />
    </Box>
  );
};

export default AdmissionManagement;