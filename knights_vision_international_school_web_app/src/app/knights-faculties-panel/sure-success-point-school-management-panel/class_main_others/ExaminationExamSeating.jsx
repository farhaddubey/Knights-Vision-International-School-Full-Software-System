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
import { Print, RotateRight, Search, ChevronLeft, ChevronRight, School, Apartment, Person } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { jsPDF } from 'jspdf';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = '#00c853';

const MainPage = () => {
  const [schools, setSchools] = useState([]);
  const [branches, setBranches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [academicYear, setAcademicYear] = useState(2025);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/get-info', { params: { type: 'schools' } });
      setSchools(response.data.schools || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to fetch schools: ' + err.message);
      toast.error('Failed to fetch schools.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async (schoolId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/get-info', { params: { type: 'branches', schoolId } });
      setBranches(response.data.branches || []);
      setStudents([]);
      setFilteredStudents([]);
      setSelectedBranchId(null);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError('Failed to fetch branches: ' + err.message);
      toast.error('Failed to fetch branches.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (branchId, pageNum = 1, forPdf = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/get-info', {
        params: { type: 'students', branchId, academicYear, page: forPdf ? 1 : pageNum, pageSize: forPdf ? 9999 : pageSize },
      });
      if (!forPdf) {
        setStudents(response.data.students || []);
        setFilteredStudents(response.data.students || []);
        setTotalPages(response.data.totalPages || 1);
      }
      return response.data.students || [];
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students: ' + err.message);
      toast.error('Failed to fetch students.');
      return [];
    } finally {
      if (!forPdf) setLoading(false);
    }
  };

  const fetchRooms = async (branchId) => {
    try {
      const response = await axios.get('/api/get-info', { params: { type: 'rooms', branchId } });
      return response.data.rooms || [];
    } catch (err) {
      console.error('Error fetching rooms:', err);
      toast.error('Failed to fetch rooms: ' + err.message);
      return [];
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchStudents(selectedBranchId, page);
    }
  }, [selectedBranchId, page, academicYear]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = students.filter(
      (student) =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
        (student.rollNumber || '').toLowerCase().includes(query) ||
        (student.admissionNumber || '').toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const assignSeats = async (branchId) => {
    const students = await fetchStudents(branchId, 1, true);
    const rooms = await fetchRooms(branchId);
    if (students.length === 0 || rooms.length === 0) {
      toast.error('No students or rooms found for the selected branch.');
      return [];
    }

    const shuffledStudents = shuffleArray([...students]);
    const capacityPerRoom = 20;
    const seatAssignments = [];
    let roomIndex = 0;
    let seatCounter = 1;

    for (const student of shuffledStudents) {
      if (roomIndex >= rooms.length) break;
      const currentRoom = rooms[roomIndex];
      const assignedSeats = seatAssignments.filter((s) => s.roomId === currentRoom.id).length;
      if (assignedSeats >= (currentRoom.capacity || capacityPerRoom)) {
        roomIndex++;
        seatCounter = 1;
        continue;
      }

      seatAssignments.push({
        student: {
          ...student,
          class: {
            name: student.class?.name || 'N/A',
            section: student.class?.section || '',
            roomNumber: student.class?.roomNumber || 'N/A',
          },
          rollNumber: student.rollNumber || 'N/A',
          admissionNumber: student.admissionNumber || 'N/A',
        },
        roomId: currentRoom.id,
        roomNumber: currentRoom.roomNumber,
        seatRollNumber: `R${seatCounter.toString().padStart(3, '0')}`,
      });

      seatCounter++;
      if (seatCounter > (currentRoom.capacity || capacityPerRoom)) {
        roomIndex++;
        seatCounter = 1;
      }
    }

    return seatAssignments;
  };

  const loadImageAsBase64 = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load image: ${response.statusText}`);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Error loading image:', err);
      return null;
    }
  };

  const handleGenerateSeatingChartPDF = async (branchId, assignments = null) => {
    // const token = Cookies.get('faculties_token');
    // if (!token) {
    //   toast.error('User not authenticated.');
    //   return false;
    // }

    try {
      const seatAssignments = assignments || (await assignSeats(branchId));
      if (seatAssignments.length === 0) {
        toast.error('No students or rooms found for the selected branch.');
        return false;
      }

      const imgUrl = '/knights.png';
      const logoBase64 = await loadImageAsBase64(imgUrl);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const margin = 10;
      const boxWidth = 92;
      const boxHeight = 42;
      const boxesPerRow = 2;
      const boxesPerCol = 6;
      const boxesPerPage = boxesPerRow * boxesPerCol;
      const gap = 5;

      for (let i = 0; i < seatAssignments.length; i += boxesPerPage) {
        if (i > 0) doc.addPage();

        for (let j = 0; j < boxesPerPage && i + j < seatAssignments.length; j++) {
          const { student, roomNumber, seatRollNumber } = seatAssignments[i + j];
          const name = `${student.firstName} ${student.lastName.charAt(0)}`;
          const className = `${student.class.name}${student.class.section ? '-' + student.class.section : ''}`;
          const roll = student.rollNumber || 'N/A';
          const admission = student.admissionNumber || 'N/A';

          const row = Math.floor(j / boxesPerRow);
          const col = j % boxesPerRow;
          const x = margin + col * (boxWidth + gap);
          const y = margin + row * (boxHeight + gap);

          doc.setLineWidth(0.5);
          doc.rect(x, y, boxWidth, boxHeight);

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`Sure Success Point School`, x + 2, y + 6);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`www.sspointschool.in`, x + 2, y + 10);
          doc.setFontSize(12);
          doc.text(`Name: ${name}`, x + 2, y + 17);
          doc.text(`Class: ${className}`, x + 2, y + 23);
          doc.text(`Roll: ${roll}`, x + 2, y + 29);
          doc.text(`Adm No: ${admission}`, x + 2, y + 35);
          doc.text(`Room: ${roomNumber}`, x + 2, y + 41);
          if (logoBase64) {
            const imgWidth = 30;
            const imgHeight = 30;
            const imgX = x + boxWidth - imgWidth - 2;
            const imgY = y + (boxHeight - imgHeight) / 2;
            doc.addImage(logoBase64, 'PNG', imgX, imgY, imgWidth, imgHeight);
          }
        }
      }

      doc.save(`seating_chart_branch_${branchId}_${academicYear}.pdf`);
      toast.success('🎉 Seating chart PDF generated successfully!');
      return true;
    } catch (err) {
      console.error('Error generating seating chart PDF:', err);
      toast.error(`❌ Failed to generate seating chart PDF: ${err.message}`);
      return false;
    }
  };

  const handleGenerateStudentListPDF = async (branchId, assignments = null) => {
    const token = Cookies.get('faculties_token');
    if (!token) {
      toast.error('User not authenticated.');
      return false;
    }

    try {
      const seatAssignments = assignments || (await assignSeats(branchId));
      if (seatAssignments.length === 0) {
        toast.error('No students or rooms found for the selected branch.');
        return false;
      }

      const imgUrl = '/knights.png';
      const logoBase64 = await loadImageAsBase64(imgUrl);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const margin = 10;
      const tableWidth = pageWidth - 2 * margin;
      const columnWidths = { name: 60, class: 30, roll: 30, admission: 30, room: 30 };
      const rowHeight = 8;
      const rowsPerPage = 50;

      const drawTableHeader = (y) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Sure Success Point School', pageWidth / 2, y, { align: 'center' });
        doc.setFontSize(10);
        doc.text('www.sspointschool.in', pageWidth / 2, y + 5, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Student List - Academic Year ${academicYear}`, pageWidth / 2, y + 15, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Name', margin + 2, y + 25);
        doc.text('Class', margin + columnWidths.name + 2, y + 25);
        doc.text('Roll', margin + columnWidths.name + columnWidths.class + 2, y + 25);
        doc.text('Adm No', margin + columnWidths.name + columnWidths.class + columnWidths.roll + 2, y + 25);
        doc.text('Room', margin + columnWidths.name + columnWidths.class + columnWidths.roll + columnWidths.admission + 2, y + 25);
        doc.setLineWidth(0.5);
        doc.line(margin, y + 27, margin + tableWidth, y + 27);
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', pageWidth - 40, y, 30, 30);
        }
      };

      for (let i = 0; i < seatAssignments.length; i += rowsPerPage) {
        if (i > 0) doc.addPage();
        drawTableHeader(margin);

        const pageAssignments = seatAssignments.slice(i, i + rowsPerPage);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        pageAssignments.forEach((assignment, index) => {
          const { student, roomNumber, seatRollNumber } = assignment;
          const name = `${student.firstName} ${student.lastName}`.substring(0, 30);
          const className = `${student.class.name}${student.class.section ? '-' + student.class.section : ''}`;
          const roll = student.rollNumber || 'N/A';
          const admission = student.admissionNumber || 'N/A';

          const y = margin + 30 + index * rowHeight;
          doc.text(name, margin + 2, y);
          doc.text(className, margin + columnWidths.name + 2, y);
          doc.text(roll, margin + columnWidths.name + columnWidths.class + 2, y);
          doc.text(admission, margin + columnWidths.name + columnWidths.class + columnWidths.roll + 2, y);
          doc.text(roomNumber, margin + columnWidths.name + columnWidths.class + columnWidths.roll + columnWidths.admission + 2, y);
          doc.line(margin, y + 2, margin + tableWidth, y + 2);
        });
      }

      doc.save(`student_list_branch_${branchId}_${academicYear}.pdf`);
      toast.success('🎉 Student list PDF generated successfully!');
      return true;
    } catch (err) {
      console.error('Error generating student list PDF:', err);
      toast.error(`❌ Failed to generate student list PDF: ${err.message}`);
      return false;
    }
  };

  const handleGenerateRoomWiseSeatingPDF = async (branchId, assignments = null) => {
    // const token = Cookies.get('faculties_token');
    // if (!token) {
    //   toast.error('User not authenticated.');
    //   return false;
    // }

    try {
      const seatAssignments = assignments || (await assignSeats(branchId));
      if (seatAssignments.length === 0) {
        toast.error('No students or rooms found for the selected branch.');
        return false;
      }

      const imgUrl = '/knights.png';
      const logoBase64 = await loadImageAsBase64(imgUrl);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const margin = 10;
      const tableWidth = pageWidth - 2 * margin;
      const cellWidth = 40;
      const cellHeight = 10;
      const cellsPerRow = 5;
      const rowsPerPage = 20;

      const rooms = {};
      seatAssignments.forEach(({ seatRollNumber, roomNumber }) => {
        if (!rooms[roomNumber]) rooms[roomNumber] = [];
        rooms[roomNumber].push(seatRollNumber);
      });

      const roomKeys = Object.keys(rooms).sort();
      let rowCount = 0;

      const drawHeader = (y) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Sure Success Point School', pageWidth / 2, y, { align: 'center' });
        doc.setFontSize(10);
        doc.text('www.sspointschool.in', pageWidth / 2, y + 5, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Room-Wise Seating - Academic Year ${academicYear}`, pageWidth / 2, y + 15, { align: 'center' });
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', pageWidth - 40, y, 30, 30);
        }
      };

      const drawRoom = (room, rolls, yStart) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Room ${room}`, margin, yStart + 5);
        doc.setLineWidth(0.5);
        doc.line(margin, yStart + 7, margin + tableWidth, yStart + 7);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let y = yStart + 12;
        let cellIndex = 0;

        rolls.sort().forEach((roll) => {
          if (cellIndex === cellsPerRow) {
            cellIndex = 0;
            y += cellHeight;
            rowCount++;
            if (rowCount >= rowsPerPage) {
              doc.addPage();
              rowCount = 0;
              y = margin + 30;
              drawHeader(margin);
            }
          }
          const x = margin + cellIndex * cellWidth;
          doc.text(roll, x, y);
          doc.rect(x - 5, y - 5, cellWidth - 10, cellHeight);
          cellIndex++;
        });

        return y + (cellIndex > 0 ? cellHeight : 0) + 10;
      };

      drawHeader(margin);
      let yPosition = margin + 30;

      for (const room of roomKeys) {
        const rowsNeeded = Math.ceil(rooms[room].length / cellsPerRow) + 2;
        if (rowCount + rowsNeeded > rowsPerPage) {
          doc.addPage();
          rowCount = 0;
          yPosition = margin + 30;
          drawHeader(margin);
        }
        yPosition = drawRoom(room, rooms[room], yPosition);
        rowCount += rowsNeeded;
      }

      doc.save(`room_wise_seating_branch_${branchId}_${academicYear}.pdf`);
      toast.success('🎉 Room-wise seating PDF generated successfully!');
      return true;
    } catch (err) {
      console.error('Error generating room-wise seating PDF:', err);
      toast.error(`❌ Failed to generate room-wise seating PDF: ${err.message}`);
      return false;
    }
  };

  const handleGenerateCombinedPDF = async (branchId) => {
    // const token = Cookies.get('faculties_token');
    // if (!token) {
    //   toast.error('User not authenticated.');
    //   return;
    // }

    try {
      const seatAssignments = await assignSeats(branchId);
      if (seatAssignments.length === 0) {
        toast.error('No students or rooms found for the selected branch.');
        return;
      }

      const seatingChartSuccess = await handleGenerateSeatingChartPDF(branchId, seatAssignments);
      const studentListSuccess = await handleGenerateStudentListPDF(branchId, seatAssignments);
      const roomWiseSuccess = await handleGenerateRoomWiseSeatingPDF(branchId, seatAssignments);

      if (seatingChartSuccess && studentListSuccess && roomWiseSuccess) {
        toast.success('🎉 All PDFs generated successfully!');
      } else {
        toast.warn('⚠️ Some PDFs failed to generate. Check individual outputs.');
      }
    } catch (err) {
      console.error('Error generating combined PDFs:', err);
      toast.error(`❌ Failed to generate combined PDFs: ${err.message}`);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
    if (selectedBranchId) {
      fetchStudents(selectedBranchId, value);
    }
  };

  const handleSchoolClick = (schoolId) => {
    setSelectedSchoolId(schoolId);
    setSelectedBranchId(null);
    setBranches([]);
    setStudents([]);
    setFilteredStudents([]);
    fetchBranches(schoolId);
  };

  const handleBranchClick = (branchId) => {
    setSelectedBranchId(branchId);
    fetchStudents(branchId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#212121' }}>
        <CircularProgress size={120} sx={{ color: greenAccent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color='error' sx={{ textAlign: 'center', mt: 4, bgcolor: '#212121' }}>
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
          📚
        </ListItemIcon>
        <ListItemText primary='Semester Exam Seating Management' />
        {selectedBranchId && (
          <>
            <TextField
              placeholder='Search by Name, Roll, or Admission No'
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
              onClick={() => fetchStudents(selectedBranchId, page)}
              variant='outlined'
              sx={{ color: greenAccent, borderColor: greenAccent }}
            >
              <RotateRight />
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => handleGenerateSeatingChartPDF(selectedBranchId)}
              sx={{ bgcolor: greenAccent, color: '#000', '&:hover': { bgcolor: '#00a548' } }}
            >
              <Print /> Seating Chart
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => handleGenerateStudentListPDF(selectedBranchId)}
              sx={{ bgcolor: greenAccent, color: '#000', '&:hover': { bgcolor: '#00a548' } }}
            >
              <Print /> Student List
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => handleGenerateRoomWiseSeatingPDF(selectedBranchId)}
              sx={{ bgcolor: greenAccent, color: '#000', '&:hover': { bgcolor: '#00a548' } }}
            >
              <Print /> Room-Wise Seating
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => handleGenerateCombinedPDF(selectedBranchId)}
              sx={{ bgcolor: greenAccent, color: '#000', '&:hover': { bgcolor: '#00a548' } }}
            >
              <Print /> Combined PDFs
            </Button>
          </>
        )}
      </ListItemButton>

      <Box sx={{ bgcolor: '#181818', borderRadius: 2, overflow: 'hidden', mt: 2 }}>
        {!selectedSchoolId && (
          <>
            <Typography variant='h6' sx={{ p: 2, color: '#fff' }}>Schools</Typography>
            <List>
              {schools.map((school) => (
                <ListItemButton
                  key={school.id}
                  onClick={() => handleSchoolClick(school.id)}
                  sx={{ bgcolor: '#121212', mb: 1, borderRadius: 1 }}
                >
                  <ListItemIcon>
                    <School sx={{ color: greenAccent }} />
                  </ListItemIcon>
                  <ListItemText primary={school.name} secondary={school.address} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
        {selectedSchoolId && !selectedBranchId && (
          <>
            <Typography variant='h6' sx={{ p: 2, color: '#fff' }}>Branches</Typography>
            <List>
              {branches.map((branch) => (
                <ListItemButton
                  key={branch.id}
                  onClick={() => handleBranchClick(branch.id)}
                  sx={{ bgcolor: '#121212', mb: 1, borderRadius: 1 }}
                >
                  <ListItemIcon>
                    <Apartment sx={{ color: greenAccent }} />
                  </ListItemIcon>
                  <ListItemText primary={`${branch.name} (${branch.code})`} secondary={branch.address} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
        {selectedBranchId && (
          <>
            <Typography variant='h6' sx={{ p: 2, color: '#fff' }}>Students</Typography>
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
                Name
              </Typography>
              <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
                Class
              </Typography>
              <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
                Roll No.
              </Typography>
              <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
                Admission No.
              </Typography>
            </Box>
            <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: 'auto', bgcolor: '#121212', borderRadius: 1 }}>
              <List>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <ListItem
                      key={student.id}
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
                        {student.id}
                      </Typography>
                      <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                        {`${student.firstName} ${student.lastName}`}
                      </Typography>
                      <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                        {`${student.class.name}${student.class.section ? '-' + student.class.section : ''}`}
                      </Typography>
                      <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                        {student.rollNumber || 'N/A'}
                      </Typography>
                      <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                        {student.admissionNumber || 'N/A'}
                      </Typography>
                    </ListItem>
                  ))
                ) : (
                  <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                    No students found for branch in academic year {academicYear}.
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default MainPage;
