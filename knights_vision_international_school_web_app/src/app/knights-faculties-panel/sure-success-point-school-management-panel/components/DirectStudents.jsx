  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import Cookies from "js-cookie";
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
  } from "@mui/material";
  import { Search as SearchIcon, ChevronLeft, ChevronRight, EmojiPeople, AppRegistrationRounded } from "@mui/icons-material";
  import { toast, ToastContainer } from "react-toastify";
  import { useRouter, useSearchParams } from "next/navigation";
  import DirectStudentDialog from './dialogs/DirectStudentDialog';
  import jsPDF from "jspdf";
  import "jspdf-autotable";

  const drawerWidth = 280;
  const appBarHeight = 64;
  const pageSize = 200;

  const DirectStudents = ({ className }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editFields, setEditFields] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
      setPage(currentPage);
    }, [currentPage]);
     const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imgSize = 20;
      const imgY = 27;
      const margin = 10;
      const logoX = pageWidth / 2 - 95;

      // === School Logo ===
      try {
        doc.addImage("/knights.png", "PNG", logoX, imgY, imgSize, imgSize);
      } catch (imgError) {
        console.warn("DEBUG: Logo image loading failed:", imgError.message);
        toast.warn("Failed to load logo image");
      }

      // === Right Logo ===
      try {
        doc.addImage("/knights.png", "PNG", pageWidth - imgSize - margin, imgY, imgSize, imgSize);
      } catch (imgError) {
        console.warn("DEBUG: Right logo image loading failed:", imgError.message);
        toast.warn("Failed to load right logo image");
      }

      // === School Name ===
      doc.setFont("helvetica", "bold");
      doc.setFontSize(40);
      doc.setTextColor("#003087");
      doc.text("Sure Success Point School", pageWidth / 2, 26, { align: "center" });

      // === School Motto ===
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#333");
      doc.setFontSize(12);
      doc.text("Institution of Humanism, Hardwork, Discipline, Technology & Excellence", pageWidth / 2, 33, { align: "center" });

      // === Report Title ===
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor("#000");
      doc.text("STUDENTS LIST", pageWidth / 2, 41, { align: "center" });

      // === Class Info ===
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(
        `Class: ${className.toUpperCase()} | Branch: ${students[0].class?.branchName} | www.sspointschool.in | Powered by Knights (KiREAD) Group`,
        pageWidth / 2,
        49,
        { align: "center" }
      );
            doc.setFont("helvetica", "bold");
      doc.text(
        `Download Sure Success - Learn & Grow App: "https://play.google.com/store/apps/details?id=`,  pageWidth / 2,
        57,
        { align: "center" }
      )
 doc.text(
        `in.sspointschool.students.sure_success_point_school_students"`,  pageWidth / 2,
        65,
        { align: "center" }
      )
// === Calculate Dynamic Cell Widths ===
const totalWidth = pageWidth - 2 * margin;

// Fixed-width small columns (in points, roughly 3 digits ≈ 15–20 units)
const rollNoWidth = 20;
const sectionWidth = 20;
const passwordWidth = 40; // enough for the activation instruction

// Remaining space for longer columns
const remainingWidth = totalWidth - (rollNoWidth + sectionWidth + passwordWidth);
const longColumns = 3; // Admission No., Student Name, Fee Scheme
const longColWidth = remainingWidth / longColumns;

// === Prepare Table Data ===
const head = [
  [
    { content: "Roll No.", styles: { halign: "center" } },
    { content: "Admission No.(Login ID)", styles: { halign: "center" } },
    { content: "Section", styles: { halign: "center" } },
    { content: "Student Name", styles: { halign: "left" } },
    { content: "Account", styles: { halign: "center" } },
    { content: "Fee Scheme", styles: { halign: "center" } },
  ],
];

const body = filteredStudents.map((student) => [
  student.rollNumber || "N/A",
  student.admissionNumber || "N/A",
  student.class?.section || "N/A",
  `${student.firstName} ${student.lastName}`,
  "Activate securely",
  student.feeSchemeCategory || "N/A",
]);

// === Students Table ===
doc.autoTable({
  head,
  body,
  startY: 70,
  theme: "grid",
  margin: { left: margin, right: margin },
  styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
  headStyles: { fillColor: [33, 33, 33], textColor: [255, 255, 255] },
  columnStyles: {
    0: { cellWidth: rollNoWidth, halign: "center" }, // Roll No.
    1: { cellWidth: longColWidth, halign: "center" }, // Admission No.
    2: { cellWidth: sectionWidth, halign: "center" }, // Section
    3: { cellWidth: longColWidth, halign: "left" }, // Student Name
    4: { cellWidth: passwordWidth, halign: "center" }, // Password
    5: { cellWidth: longColWidth, halign: "center" }, // Fee Scheme
  },
  didDrawPage: (data) => {
    // === Footer ===
    doc.setFontSize(10);
    const footerY = pageHeight - 10;
    const footerY2 = pageHeight - 5;
    doc.setTextColor(0, 0, 0);
    doc.text(`App: https://play.google.com/store/apps/details?id=in.sspointschool.students.sure_success_point_school_students`, margin, footerY);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Student sign-in requires a secure activation code from the school.`, margin, footerY2);
  },
});


      doc.save(`Direct_Admission_Students_${className}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
      toast.success("📄 PDF downloaded successfully.");
    } catch (err) {
      console.error("Error generating PDF:", err.message);
      toast.error("Failed to generate PDF.");
    }
  };
    const fetchStudents = async (pageNum = 1, search = '') => {
      const token = Cookies.get('faculties_token');
      if (!token) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api-schools-panel/students/direct/${className}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: pageNum, pageSize, searchQuery: search },
        });

        if (!response.data || !Array.isArray(response.data.students)) {
          throw new Error('Invalid response format');
        }

        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to fetch students.');
        toast.error('Failed to fetch students.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchStudents(page, searchQuery);
    }, [page, className]);

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter((student) =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
        student.admissionNumber?.toLowerCase().includes(query) ||
        student.rollNumber?.toLowerCase().includes(query) ||
        student.studentCategory?.toLowerCase().includes(query) ||
        student.class?.branchName?.toLowerCase().includes(query) ||
        student.class?.section?.toLowerCase().includes(query) ||
        student.feeSchemeCategory?.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  };


    const handlePageChange = (event, value) => {
      setPage(value);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('page', value.toString());
      router.push(`?${newSearchParams.toString()}`);
      fetchStudents(value, searchQuery);
    };

    const handleOpenModal = (student = {}) => {
      toast.success('Opening Modal');
      setEditFields(student);
      setOpen(true);
    };

    const handleCloseModal = () => {
      const userConfirmed = window.confirm('Are you sure you want to close the modal, unsaved?');
      if (userConfirmed) {
        setOpen(false);
        setEditFields({});
      }
    };

    const handleSaveAndCloseModal = () => {
      setOpen(false);
      setEditFields({});
      fetchStudents(page, searchQuery);
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
            backgroundColor: '#b71c1c',
            color: '#fff',
            '&:hover': { backgroundColor: '#b71c1c' },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '4px 16px',
            borderRadius: 1,
          }}
        >
          <ListItemIcon sx={{ color: '#fff' }}>
            <EmojiPeople />
          </ListItemIcon>
          <ListItemText primary={`${className} Direct Admission Students`} />
          <TextField
            variant="outlined"
            placeholder="Search Students..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#fff', mr: 1 }} />,
              style: { color: '#fff', backgroundColor: '#333', borderRadius: 4 },
            }}
            sx={{
              width: '300px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#fff' },
                '&:hover fieldset': { borderColor: '#fff' },
                '&.Mui-focused fieldset': { borderColor: '#00c853' },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenModal({})}
            sx={{ backgroundColor: '#00c853', color: '#000' }}
          >
            <AppRegistrationRounded /> Add Student
          </Button>
           <Button
          variant="contained"
          color="primary"
          onClick={handleDownloadPDF}
          sx={{ backgroundColor: '#00c853', color: '#000' }}
        >
          Download PDF
        </Button>
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
              zIndex: 10,
            }}
          >
            <Typography variant="body2" sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
              Roll No.
            </Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
              Name
            </Typography>
            <Typography variant="body2" sx={{ flex: 1.2, fontWeight: 'bold', color: '#fff' }}>
              Admission No.
            </Typography>
            <Typography variant="body2" sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
              Category
            </Typography>
            <Typography variant="body2" sx={{ flex: 0.8, fontWeight: 'bold', color: '#fff' }}>
              Branch
            </Typography>
            <Typography variant="body2" sx={{ flex: 0.5, fontWeight: 'bold', color: '#fff' }}>
              Section
            </Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: '#fff' }}>
              Fee Scheme
            </Typography>
            <Typography variant="body2" sx={{ flex: .4, fontWeight: 'bold', color: '#fff' }}>
              Actions
            </Typography>
          </Box>
          <Box sx={{ maxHeight: "82vh", overflowY: 'auto', bgcolor: '#121212', borderRadius: 1 }}>
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
      <Typography variant="body2" sx={{ flex: 0.8, color: '#fff' }}>
                   <Button variant="outlined" size="small"> {student.rollNumber || 'N/A'}</Button>
                  </Typography>                    <Typography variant="body2" sx={{ flex: 1, color: '#fff' }}>
                      {`${student.firstName} ${student.lastName}`}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1.2, color: '#fff' }}>
                      {student.admissionNumber || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1.2, color: '#fff' }}>
                      {student.studentCategory || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 0.8, color: '#fff' }}>
                      {student.class?.branchName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 0.5, color: '#fff' }}>
                      {student.class?.section || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: '#fff' }}>
                      {student.feeSchemeCategory || 'N/A'}
                    </Typography>
                    <Box sx={{ flex: 0.5, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleOpenModal(student)}
                        sx={{ color: '#00c853', borderColor: '#00c853' }}
                      >
                        Edit
                      </Button>
    <Button
                      variant="outlined"
                      color="error"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this student?')) {
                          try {
                            await axios.delete(`/api/students/direct/${className}/${student.id}`, {
                              headers: { Authorization: `Bearer ${Cookies.get('faculties_token')}` },
                            });
                            toast.success('Student deleted successfully.');
                            fetchStudents(page, searchQuery);
                          } catch (err) {
                            toast.error('Failed to delete student.');
                          }
                        }
                      }}
                      sx={{ color: '#f44336', borderColor: '#f44336' }}
                    >
                      Delete
                    </Button>
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                  No students found for {className} (Direct Admission).
                </Typography>
              )}
            </List>
          </Box>
          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              left: '56%',
              transform: 'translateX(-50%)',
              zIndex: 1300,
              display: 'flex',
              justifyContent: 'center',
              p: 1,
              bgcolor: '#181818',
              borderRadius: 2,
              boxShadow: 4,
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
                    bgcolor: '#00c853',
                    color: '#000',
                    '&:hover': { bgcolor: '#00c853' },
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
        <DirectStudentDialog
          openInsertion={open}
          handleCloseModal={handleCloseModal}
          handleSaveAndCloseModal={handleSaveAndCloseModal}
          editFields={editFields}
          setEditFields={setEditFields}
          fetchStudents={fetchStudents}
          className={className}
        />
      </Box>
    );
  };

  export default DirectStudents;
