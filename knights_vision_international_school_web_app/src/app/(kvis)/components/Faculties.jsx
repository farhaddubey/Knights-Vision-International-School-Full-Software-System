"use client";
import React, { useEffect, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';

const FacultyShowcase = () => {
    // State to hold faculty data
    const [facultyData, setFacultyData] = useState([]);
    const [loading, setLoading] = useState(true); // Track loading state

    // Fetching facultyData from Firebase Firestore
    useEffect(() => {
        const fetchFacultyData = async () => {
            try {
                console.log("Starting to fetch faculty data...");
                const facultyImageCollection = collection(db, 'faculty');
                const querySnapshot = await getDocs(facultyImageCollection);
                // Map the data as you did before
                const fetchedData = querySnapshot.docs.map(doc => ({
                    url: doc.data().url,
                    title: doc.data().title,
                    subtitle: doc.data().subtitle,
                    id: doc.id,
                }));
        
                setFacultyData(fetchedData);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        };
        
        fetchFacultyData();
    }, []);

    if (loading) {
        return <Typography align="center">Loading faculty data...</Typography>;
    }

    if (facultyData.length === 0) {
        return <Typography align="center">No faculty data found.</Typography>;
    }

    return (
        <Container sx={{ py: 4, overflow: 'hidden' }}>
            <Typography variant="h4" align="center" fontWeight="bold" sx={{fontSize:{xs:20, md:28}}} gutterBottom>
                Meet Our Faculties
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 2,
                    whiteSpace: 'nowrap',
                    animation: 'scroll 20s linear infinite',
                    '@keyframes scroll': {
                        '0%': { transform: 'translateX(0)' },
                        '100%': { transform: `translateX(calc(-200px * ${facultyData.length}))` },
                    },
                }}
            >
                {/* Duplicate items to create an infinite loop effect */}
                {facultyData.map((faculty, index) => (
                    <Box
                        key={faculty.id || index} // Use unique ID from Firebase or index as fallback
                        sx={{
                            flex: '0 0 auto',
                            minWidth: 200,
                            maxWidth: 200,
                            height: 280,
                            borderRadius: 2,
                            overflow: 'hidden',
                            position: 'relative',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'scale(1.05)' },
                        }}
                    >
                        <Box
                            component="img"
                            src={faculty.url}
                            alt={faculty.title}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 'inherit',
                            }}
                        />

                        {/* Overlay with Name and Qualification */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                width: '100%',
                                bgcolor: 'rgba(0, 0, 0, 0.6)',
                                color: '#fff',
                                p: 1,
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold">
                                {faculty.title}
                            </Typography>
                            <Typography variant="body2">
                                {faculty.subtitle}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Container>
    );
};

export default FacultyShowcase;
