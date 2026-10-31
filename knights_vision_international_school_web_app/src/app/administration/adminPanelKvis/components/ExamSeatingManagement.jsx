"use client";

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

const schoolInfo = {
  name: "Sure Success Point School",
  site: "www.sspointschool.in",
  address: "Najirpur, Alinagar, Kaliachak, Malda",
  company: "Powered by Knights International Group for Research, Education & Academic Development",
};

const ExamSeatingManagement = ({ className = "VI" }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [academicYear, setAcademicYear] = useState(2025);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const classMap = {
    vi: { id: 5, name: 'Class VI' },
  };

  const classInfo = classMap[className.toLowerCase()] || { id: 5, name: 'Class VI' };

  useEffect(() => {
    setPage(currentPage);
    fetchStudents(currentPage);
  }, [currentPage, academicYear, className]);

  const fetchStudents = async (pageNum = 1, forPdf = false) => {
    const token = Cookies.get('administration_token');
    if (!token) {
      setError('User not authenticated.');
      setLoading(false);
      return [];
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/classes/${className.toLowerCase()}/students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { classId: classInfo.id, page: forPdf ? 1 : pageNum, pageSize: forPdf ? 9999 : pageSize, academicYear },
      });
      if (!response.data || !Array.isArray(response.data.students)) {
        throw new Error('Invalid response format: students array missing');
      }
      if (!forPdf) {
        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
        setTotalPages(response.data.totalPages || 1);
      }
      return response.data.students;
    } catch (err) {
      console.error(`Error fetching students for ${classInfo.name}:`, err);
      setError(err.response?.data?.error || `Failed to fetch students for ${classInfo.name}.`);
      toast.error(`Failed to fetch students for ${classInfo.name}.`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = students.filter((student) =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
      student.admissionNumber?.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
    setPage(1);
  };

  const loadImageAsBase64 = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load image');
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

  const handleGeneratePDF = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    try {
      const students = await fetchStudents(1, true);
      if (students.length === 0) {
        toast.error(`No students found for ${classInfo.name} in academic year ${academicYear}.`);
        return;
      }

      const imgUrl = '/knights.png';
      const logoBase64 = await loadImageAsBase64(imgUrl);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const boxWidth = 92;
      const boxHeight = 42;
      const boxesPerRow = 2;
      const boxesPerCol = 6;
      const boxesPerPage = boxesPerRow * boxesPerCol;
      const gap = 5;

      const admissionNumbers = new Set();
      students.forEach((student) => {
        const admissionNumber = student.admissionNumber || 'N/A';
        if (admissionNumber !== 'N/A' && admissionNumbers.has(admissionNumber)) {
          console.warn(`Duplicate admission number detected: ${admissionNumber}`);
        } else {
          admissionNumbers.add(admissionNumber);
        }
      });

      for (let i = 0; i < students.length; i += boxesPerPage) {
        if (i > 0) doc.addPage();

        for (let j = 0; j < boxesPerPage && i + j < students.length; j++) {
          const student = students[i + j];
          const name = `${student.firstName} ${student.lastName.charAt(0)}`;
          const admissionNumber = student.admissionNumber || 'N/A';
          const room = student.class?.roomNumber || 'N/A';

          const row = Math.floor(j / boxesPerRow);
          const col = j % boxesPerRow;
          const x = margin + col * (boxWidth + gap);
          const y = margin + row * (boxHeight + gap);

          doc.setLineWidth(0.5);
          doc.rect(x, y, boxWidth, boxHeight);

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(schoolInfo.name, x + 2, y + 6);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(schoolInfo.site, x + 2, y + 10);
          doc.setFontSize(12);
          doc.text(`Name: ${name}`, x + 2, y + 17);
          doc.text(`Adm No.: ${admissionNumber}`, x + 2, y + 23);
          doc.text(`Room: ${room}`, x + 2, y + 29);
          doc.setFontSize(10);
          doc.text(schoolInfo.company, x + 2, y + 37);
          doc.text(`for Research, Education & Academic Development`, x + 2, y + 41);

          if (logoBase64) {
            const imgWidth = 30;
            const imgHeight = 30;
            const imgX = x + boxWidth - imgWidth - 2;
            const imgY = y + (boxHeight - imgHeight) / 2;
            doc.addImage(logoBase64, 'PNG', imgX, imgY, imgWidth, imgHeight);
          }
        }
      }

      doc.save(`seating_chart_${classInfo.name}_${academicYear}.pdf`);
      toast.success(`🎉 Seating chart PDF generated successfully for ${classInfo.name}!`);
    } catch (err) {
      console.error(`Error generating seating chart PDF for ${classInfo.name}:`, err);
      toast.error(`❌ Failed to generate seating chart PDF for ${classInfo.name}.`);
    }
  };

  const handleGenerateStudentListPDF = async (students = null) => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return false;
    }

    try {
      const data = students || (await fetchStudents(1, true));
      if (data.length === 0) {
        toast.error(`No students found for ${classInfo.name} in academic year ${academicYear}.`);
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
      const columnWidths = { name: 90, admissionNumber: 40, room: 60 };
      const rowHeight = 8;
      const rowsPerPage = 50;

      const drawTableHeader = (y) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(schoolInfo.name, pageWidth / 2, y, { align: 'center' });
        doc.setFontSize(10);
        doc.text(schoolInfo.site, pageWidth / 2, y + 5, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Student List - ${classInfo.name} ${academicYear}`, pageWidth / 2, y + 15, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Name', margin + 2, y + 25);
        doc.text('Adm No.', margin + columnWidths.name + 2, y + 25);
        doc.text('Room Number', margin + columnWidths.name + columnWidths.admissionNumber + 2, y + 25);
        doc.setLineWidth(0.5);
        doc.line(margin, y + 27, margin + tableWidth, y + 27);
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', pageWidth - 40, y, 30, 30);
        }
      };

      for (let i = 0; i < data.length; i += rowsPerPage) {
        if (i > 0) doc.addPage();
        drawTableHeader(margin);

        const pageStudents = data.slice(i, i + rowsPerPage);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        pageStudents.forEach((student, index) => {
          const y = margin + 30 + index * rowHeight;
          const name = `${student.firstName} ${student.lastName}`.substring(0, 40);
          const admissionNumber = student.admissionNumber || 'N/A';
          const room = student.class?.roomNumber || 'N/A';
          
          doc.text(name, margin + 2, y);
          doc.text(admissionNumber, margin + columnWidths.name + 2, y);
          doc.text(room, margin + columnWidths.name + columnWidths.admissionNumber + 2, y);
          doc.line(margin, y + 2, margin + tableWidth, y + 2);
        });
      }

      doc.save(`student_list_${classInfo.name}_${academicYear}.pdf`);
      toast.success(`🎉 Student list PDF generated successfully for ${classInfo.name}!`);
      return true;
    } catch (err) {
      console.error(`Error generating student list PDF for ${classInfo.name}:`, err);
      toast.error(`❌ Failed to generate student list PDF for ${classInfo.name}.`);
      return false;
    }
  };

  const handleGenerateRoomWiseSeatingPDF = async (students = null) => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return false;
    }

    try {
      const data = students || (await fetchStudents(1, true));
      if (data.length === 0) {
        toast.error(`No students found for ${classInfo.name} in academic year ${academicYear}.`);
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
      data.forEach((student) => {
        const room = student.class?.roomNumber || 'Unassigned';
        const admissionNumber = student.admissionNumber || 'N/A';
        if (!rooms[room]) rooms[room] = [];
        rooms[room].push(admissionNumber);
      });

      const roomKeys = Object.keys(rooms).sort();
      let rowCount = 0;

      const drawHeader = (y) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(schoolInfo.name, pageWidth / 2, y, { align: 'center' });
        doc.setFontSize(10);
        doc.text(schoolInfo.site, pageWidth / 2, y + 5, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Room-Wise Seating - ${classInfo.name} ${学术Year}`, pageWidth / 2, y + 15, { align: 'center' });
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', pageWidth - 40, y, 30, 30);
        }
      };

      const drawRoom = (room, admissionNumbers, yStart) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Room ${room}`, margin, yStart + 5);
        doc.setLineWidth(0.5);
        doc.line(margin, yStart + 7, margin + tableWidth, yStart + 7);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let y = yStart + 12;
        let cellIndex = 0;

        admissionNumbers.sort().forEach((admissionNumber, index) => {
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
          doc.text(admissionNumber, x, y);
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

      doc.save(`room_wise_seating_${classInfo.name}_${academicYear}.pdf`);
      toast.success(`🎉 Room-wise seating PDF generated successfully for ${classInfo.name}!`);
      return true;
    } catch (err) {
      console.error(`Error generating room-wise seating PDF for ${classInfo.name}:`, err);
      toast.error(`❌ Failed to generate room-wise seating PDF for ${classInfo.name}.`);
      return false;
    }
  };

  const handleGenerateCombinedPDF = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    try {
      const students = await fetchStudents(1, true);
      if (students.length === 0) {
        toast.error(`No students found for ${classInfo.name} in academic year ${academicYear}.`);
        return;
      }

      const studentListSuccess = await handleGenerateStudentListPDF(students);
      const roomWiseSuccess = await handleGenerateRoomWiseSeatingPDF(students);

      if (studentListSuccess && roomWiseSuccess) {
        toast.success(`🎉 Both student list and room-wise seating PDFs generated successfully for ${classInfo.name}!`);
      } else if (studentListSuccess || roomWiseSuccess) {
        toast.warn(`⚠️ One of the PDFs failed to generate for ${classInfo.name}. Check individual outputs.`);
      } else {
        toast.error(`❌ Failed to generate both PDFs for ${classInfo.name}.`);
      }
    } catch (err) {
      console.error(`Error generating combined PDFs for ${classInfo.name}:`, err);
      toast.error(`❌ Failed to generate combined PDFs for ${classInfo.name}.`);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchStudents(value);
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
        <ListItemText primary={`Exam Seating Management - ${classInfo.name}`} />
        <TextField
          placeholder='Search by Name or Admission No.'
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
          onClick={() => fetchStudents(page)}
          variant='outlined'
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={handleGeneratePDF}
          sx={{ bgcolor: greenAccent, color: '#000', '&:hover': { bgcolor: '#00a548' } }}
        >
          <Print /> Seating Chart
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={handleGenerateStudentListPDF}
          sx={{ bgcolor: greenAccent, color: '#000', '&:hover': { bgcolor: '#00a548' } }}
        >
          <Print /> Student List
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={handleGenerateRoomWiseSeatingPDF}
          sx={{ bgcolor: greenAccent, color: '#000', '&:hover': { bgcolor: '#00a548' } }}
        >
          <Print /> Room-Wise Seating
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={handleGenerateCombinedPDF}
          sx={{ bgcolor: greenAccent, color: '#000', '&:hover': { bgcolor: '#00a548' } }}
        >
          <Print /> Combined PDFs
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: '#181818', borderRadius: 2, overflow: 'hidden', mt: 2 }}>
        <Typography variant='h6' sx={{ p: 2, color: '#fff' }}>{classInfo.name} Students</Typography>
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
            Adm No.
          </Typography>
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
            Room No.
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: 'auto', bgcolor: '#121212', borderRadius: 1 }}>
          <List>
            {filteredStudents.length > 0 ? (
              filteredStudents.slice((page - 1) * pageSize, page * pageSize).map((student) => (
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
                    {student.admissionNumber || 'N/A'}
                  </Typography>
                  <Typography variant='body2' sx={{ flex: 1, color: '#fff' }}>
                    {student.class?.roomNumber || 'N/A'}
                  </Typography>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No students found for {classInfo.name} in academic year {academicYear}.
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

export default ExamSeatingManagement;
