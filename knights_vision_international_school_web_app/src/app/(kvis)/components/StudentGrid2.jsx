"use client";
import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import StudentCard from './StudentCard';

const StudentGrid2 = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentCollection = collection(db, 'ourStudentsSuccess'); // Replace 'students' with your collection name
        const querySnapshot = await getDocs(studentCollection);
        const students = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudentsData(students);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <Typography align="center">Loading...</Typography>;
  if (error) return <Typography align="center">Error: {error}</Typography>;

  return (
    <Box sx={{ paddingTop: 4, px: 4, overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          overflowX: 'hidden',
          width: '200%',
          animation: 'scrollRightToLeft 10s linear infinite',
          '@keyframes scrollRightToLeft': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-50%)' },
          },
        }}
      >
        {[...studentsData, ...studentsData].map((student, index) => (
          <Box key={student.id || index} sx={{ flex: '0 0 auto', width: 260 }}>
            <StudentCard student={student} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default StudentGrid2;
