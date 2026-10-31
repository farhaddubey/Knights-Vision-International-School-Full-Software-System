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
  InputAdornment,
  CircularProgress,
  Pagination,
  PaginationItem,
} from '@mui/material';
import { Inventory, Search as SearchIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import UpdateEmployeeDialog from './UpdateEmployeeDialog';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 30;
const greenAccent = '#00c853';

const EmployeeInfoList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchEmployees = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get('administration_token');
      if (!token) {
        throw new Error('Authentication token is missing!');
      }

      // Fetch users
      const userResponse = await axios.get('/api/users/manage-users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { page: pageNum, pageSize },
      });

      if (!userResponse.data || !Array.isArray(userResponse.data.users)) {
        throw new Error('Invalid response format: users array missing');
      }

      // Fetch schools and branches for mapping IDs to names
      const [schoolResponse, branchResponse] = await Promise.all([
        axios.get('/api/schools/select', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/school-branches/select', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const schools = schoolResponse.data.map(item => ({ id: item.id, name: item.name }));
      const branches = branchResponse.data.map(item => ({ id: item.id, name: item.name }));

      const formattedEmployees = userResponse.data.users.map((item, index) => {
        try {
          return {
            id: item.id ?? index,
            username: item.username ?? 'Unknown',
            email: item.email ?? 'N/A',
            role: item.role ?? 'N/A',
            department: item.department ?? 'N/A',
            is_active: item.is_active ? 'Active' : 'Inactive',
            confirmed: item.confirmed ? 'Yes' : 'No',
            prefered_language: item.prefered_language ?? 'N/A',
            regular_entry_time: item.regular_entry_time ?? 'N/A',
            regular_leave_time: item.regular_leave_time ?? 'N/A',
            aggrement_work_hours_per_day: item.aggrement_work_hours_per_day?.toString() ?? 'N/A',
            rfid_card_no: item.rfid_card_no ?? 'N/A',
            biometric_id: item.biometric_id ?? 'N/A',
            base_salary: item.base_salary?.toString() ?? 'N/A',
            extra_per_half_hour_salary: item.extra_per_half_hour_salary?.toString() ?? 'N/A',
            per_day_bonus_salary: item.per_day_bonus_salary?.toString() ?? 'N/A',
            per_day_salary: item.per_day_salary?.toString() ?? 'N/A',
            salary_system: item.salary_system ?? 'N/A',
            address: item.address ?? 'N/A',
            village: item.village ?? 'N/A',
            district: item.district ?? 'N/A',
            state: item.state ?? 'N/A',
            country: item.country ?? 'N/A',
            pincode: item.pincode ?? 'N/A',
            phone_prefix: item.phone_prefix ?? 'N/A',
            phone1: item.phone1?.toString() ?? 'N/A',
            fatherName: item.fatherName ?? 'N/A',
            motherName: item.motherName ?? 'N/A',
            uid_aadhar: item.uid_aadhar?.toString() ?? 'N/A',
            clg_name: item.clg_name ?? 'N/A',
            highest_degree: item.highest_degree ?? 'N/A',
            highest_marks: item.highest_marks ?? 'N/A',
            years_experience: item.years_experience?.toString() ?? 'N/A',
            specialization: item.specialization ?? 'N/A',
            bio: item.bio ?? 'N/A',
            languages_known: item.languages_known ?? 'N/A',
            phone_display: item.phone_display ?? 'N/A',
            whatsapp: item.whatsapp ?? 'N/A',
            aadhar_verified: item.aadhar_verified ? 'Yes' : 'No',
            schoolId: item.schoolId?.toString() ?? 'N/A',
            branchId: item.branchId?.toString() ?? 'N/A',
            schoolName: schools.find(s => s.id === item.schoolId)?.name ?? 'N/A',
            branchName: branches.find(b => b.id === item.branchId)?.name ?? 'N/A',
          };
        } catch (e) {
          console.error(`[fetchEmployees] Error mapping user at index ${index}:`, e);
          return null;
        }
      }).filter(user => user !== null);

      if (formattedEmployees.length === 0 && userResponse.data.users.length > 0) {
        throw new Error('Failed to format employee data');
      }

      setEmployees(formattedEmployees);
      setFilteredEmployees(formattedEmployees);
      setTotalPages(userResponse.data.totalPages || 1);
    } catch (error) {
      console.error('[fetchEmployees] Error:', error.message, error.stack);
      setError(error.message || 'Failed to fetch employees');
      toast.error(error.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(page);
  }, [page]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = employees.filter((employee) =>
      [
        employee.username,
        employee.email,
        employee.role,
        employee.department,
        employee.regular_entry_time,
        employee.regular_leave_time,
        employee.aggrement_work_hours_per_day,
        employee.base_salary,
        employee.extra_per_half_hour_salary,
        employee.per_day_bonus_salary,
        employee.per_day_salary,
        employee.salary_system,
        employee.address,
        employee.phone_prefix,
        employee.phone1,
        employee.uid_aadhar,
        employee.clg_name,
        employee.highest_degree,
        employee.highest_marks,
        employee.years_experience,
        employee.specialization,
        employee.schoolId,
        employee.branchId,
        employee.schoolName,
        employee.branchName,
      ].some((field) => field?.toString().toLowerCase().includes(query))
    );

    setFilteredEmployees(filtered);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleOpenDialog = (employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedEmployee(null);
    setDialogOpen(false);
  };

  const handleUpdateSuccess = () => {
    fetchEmployees(page);
    handleCloseDialog();
  };

  const handleDeleteSuccess = () => {
    fetchEmployees(page);
    handleCloseDialog();
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
      <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ position: 'fixed', minWidth: '82vw', height: `calc(100vh - ${appBarHeight}px)`, color: '#fff', bgcolor: '#181818' }}>
      <ListItemButton
        sx={{
          backgroundColor: '#b71c1c',
          color: '#fff',
          '&:hover': { backgroundColor: '#b71c1c' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
            <Inventory />
          </ListItemIcon>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#fff' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: '#333',
              borderRadius: 1,
              '& .MuiInputBase-input': { color: '#fff', padding: '6px' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#555' },
                '&:hover fieldset': { borderColor: '#777' },
                '&.Mui-focused fieldset': { borderColor: greenAccent },
              },
              width: 200,
              mr: 2,
            }}
          />
          <ListItemText sx={{ color: '#fff' }} primary="Employee Attendance Management Panel" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            onClick={() => fetchEmployees(page)}
            variant="outlined"
            sx={{ color: greenAccent, bgcolor: '#212121', minWidth: 40, padding: '6px' }}
          >
            <Inventory />
          </Button>
          <Button variant="contained" color="primary">
            All Employee Info
          </Button>
        </Box>
      </ListItemButton>

      <Box sx={{ bgcolor: '#181818', borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
            bgcolor: '#333',
            borderRadius: 1,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 2, fontWeight: 'bold', color: '#fff' }}>Info</Typography>
          <Typography variant="body2" sx={{ flex: 1.2, fontWeight: 'bold', color: '#fff' }}>Department & School</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>UID & Phone</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>Work Hours</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>Salary</Typography>
          <Typography variant="body2" sx={{ flex: 1.3, fontWeight: 'bold', color: '#fff' }}>Teacher Profile</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>Action</Typography>
        </Box>

        <Box sx={{ maxHeight: '80vh', overflowY: 'auto', bgcolor: '#000', borderRadius: 1, paddingBottom: 0 }}>
          <List>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <ListItem
                  key={employee.id}
                  sx={{
                    bgcolor: '#181818',
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.3,
                    px: 1,
                  }}
                >
                  <Typography sx={{ flex: 2, color: '#fff' }}>
                    {employee.username}<br/>
                    {employee.email}<br/>
                    {employee.role}
                  </Typography>
                  <Typography sx={{ flex: 1.2, color: '#fff' }}>
                    {employee.department}<br/>
                    {employee.schoolName} ({employee.branchName})
                  </Typography>
                  <Typography sx={{ flex: 1, color: '#fff' }}>
                    {employee.uid_aadhar}<br/>
                    {employee.phone_prefix} {employee.phone1}
                  </Typography>
                  <Typography sx={{ flex: 1, color: '#fff' }}>
                    {employee.aggrement_work_hours_per_day} Hours<br/>
                    <span style={{ color: 'lightgreen' }}>Entry: {employee.regular_entry_time}</span><br/>
                    <span style={{ color: 'salmon' }}>Exit: {employee.regular_leave_time}</span>
                  </Typography>
                  <Typography sx={{ flex: 1, color: '#fff' }}>
                    {employee.salary_system !== 'N/A' ? `${employee.base_salary} (${employee.salary_system})` : 'N/A'}
                  </Typography>
                  <Typography sx={{ flex: 1.3, color: '#fff' }}>
                    {employee.role === 'TEACHER' || employee.role === 'ASSISTANT_TEACHER' ? (
                      <>
                        {employee.highest_degree} ({employee.years_experience} yrs)<br/>
                        {employee.specialization}
                      </>
                    ) : 'N/A'}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog(employee)}
                    >
                      Update
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No employees found.
              </Typography>
            )}
          </List>
        </Box>

        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '65%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            bgcolor: '#010101',
            borderRadius: 2,
            boxShadow: 4,
            px: 2,
            py: 1,
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

      {selectedEmployee && (
        <UpdateEmployeeDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          employee={selectedEmployee}
          onUpdateSuccess={handleUpdateSuccess}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </Box>
  );
};

export default EmployeeInfoList;