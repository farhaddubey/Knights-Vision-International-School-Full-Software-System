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
  Avatar, // Added for profile image
} from '@mui/material';
import { Inventory, Search as SearchIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 80;
const greenAccent = '#00c853';

const EmployeeInfoList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Sync page state with URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchEmployees = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get('faculties_token');
      if (!token) {
        throw new Error('Authentication token is missing!');
      }

      const response = await axios.get('/api-schools-panel/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { page: pageNum, pageSize },
      });

      if (!response.data || !Array.isArray(response.data.users)) {
        throw new Error('Invalid response format: users array missing');
      }

      // Map users with all relevant fields
      const formattedEmployees = response.data.users.map((item, index) => {
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
            aggrement_work_hours_per_day: item.aggrement_work_hours_per_day ?? 'N/A',
            rfid_card_no: item.rfid_card_no ?? 'N/A',
            biometric_id: item.biometric_id ?? 'N/A',
            base_salary: item.base_salary ?? 'N/A',
            extra_per_half_hour_salary: item.extra_per_half_hour_salary ?? 'N/A',
            per_day_bonus_salary: item.per_day_bonus_salary ?? 'N/A',
            per_day_salary: item.per_day_salary ?? 'N/A',
            salary_system: item.salary_system ?? 'N/A',
            img_url: item.img_url ?? null, // Added for profile image
            // UserProfile fields
            address: item.address ?? 'N/A', // Adjusted to use direct fields
            village: item.village ?? 'N/A',
            district: item.district ?? 'N/A',
            state: item.state ?? 'N/A',
            country: item.country ?? 'N/A',
            pincode: item.pincode ?? 'N/A',
            phone_prefix: item.phone_prefix ?? 'N/A',
            phone1: item.phone1 ?? 'N/A',
            phone2: item.phone2 ?? 'N/A',
            fatherName: item.fatherName ?? 'N/A',
            motherName: item.motherName ?? 'N/A',
            uid_aadhar: item.uid_aadhar ?? 'N/A',
            // TeacherProfile fields
            clg_name: item.clg_name ?? 'N/A',
            highest_degree: item.highest_degree ?? 'N/A',
            highest_marks: item.highest_marks ?? 'N/A',
            years_experience: item.years_experience ?? 'N/A',
            specialization: item.specialization ?? 'N/A',
            bio: item.bio ?? 'N/A',
            languages_known: item.languages_known ?? 'N/A',
            whatsapp: item.whatsapp ?? 'N/A',
            aadhar_verified: item.aadhar_verified ? 'Yes' : 'No',
          };
        } catch (e) {
          console.error(`[fetchEmployees] Error mapping user at index ${index}:`, e);
          return null;
        }
      }).filter(user => user !== null);

      if (formattedEmployees.length === 0 && response.data.users.length > 0) {
        throw new Error('Failed to format employee data');
      }

      setEmployees(formattedEmployees);
      setFilteredEmployees(formattedEmployees);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('[fetchEmployees] Error:', error.message, error.stack);
      setError(error.message || 'Failed to fetch employees');
      toast.error(error.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees when page changes
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
        employee.aggrement_work_hours_per_day.toString(),
        employee.base_salary,
        employee.extra_per_half_hour_salary,
        employee.per_day_bonus_salary,
        employee.per_day_salary,
        employee.salary_system,
        employee.address,
        employee.phone_prefix,
        employee.phone1,
        employee.phone2,
        employee.uid_aadhar,
        employee.clg_name,
        employee.highest_degree,
        employee.highest_marks,
        employee.years_experience.toString(),
        employee.specialization,
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
        {/* Header Row */}
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
          <Typography variant="body2" sx={{ flex: .55, fontWeight: 'bold', color: '#fff' }}>Image</Typography>
          <Typography variant="body2" sx={{ flex: 2, fontWeight: 'bold', color: '#fff' }}>Info</Typography>
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
                    alignItems: 'center',
                  }}
                >
          <Avatar
  src={employee.img_url || undefined}
  alt={employee.username}
  sx={{ width: 80, height: 80, mr: 1, borderRadius: "50%" }}
>
  {!employee.img_url && employee.username?.charAt(0)?.toUpperCase()}
</Avatar>

                  <Typography sx={{ flex: 2, color: '#fff' }}>
                    {employee.username}<br />
                    {employee.email}<br />
                    {employee.department}<br />
                    {employee.role}<br />
                    <span style={{ color: 'lightgreen' }}>{employee.role_teacher}</span>
                  </Typography>
              
                  <Typography sx={{ flex: 1, color: '#fff' }}>
                    {employee.phone_prefix}<br/> {employee.phone1}<br />
                    {employee.phone2}<br/> {employee.uid_aadhar}
                  </Typography>
                  <Typography sx={{ flex: 1, color: '#fff' }}>
                    {employee.aggrement_work_hours_per_day} Hours Working<br />
                    <span style={{ color: 'lightgreen' }}>Entrance - {employee.regular_entry_time}</span><br />
                    <span style={{ color: 'salmon' }}>Exit - {employee.regular_leave_time}</span>
                  </Typography>
                  <Typography sx={{ flex: 1, color: '#fff' }}>
                    {employee.salary_system !== 'N/A' ? `${employee.base_salary} (${employee.salary_system})` : 'N/A'}
                  </Typography>
                  <Typography sx={{ flex: 1.3, color: '#fff' }}>
                    {employee.role === 'TEACHER' ? (
                      <>
                        {employee.highest_degree} ({employee.years_experience} yrs)
                        <br />
                        {employee.specialization}
                      </>
                    ) : 'N/A'}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Button variant="contained" color="success">
                      Explore
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

        {/* Pagination (Floating Bottom-Center) */}
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
    </Box>
  );
};

export default EmployeeInfoList;