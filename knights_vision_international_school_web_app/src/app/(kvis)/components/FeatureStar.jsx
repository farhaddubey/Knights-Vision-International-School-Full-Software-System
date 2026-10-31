'use client';
import React, { useState, useEffect } from 'react';
import { Alert, Box, Button, Container, Grid, Skeleton, Typography } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import EnquiryForm from './EnquiaryForm';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import Link from 'next/link';

const defaultImages = [
  {
    id: 1,
    img_url: "https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/images%2Fstar-student-01.avif?alt=media",
    page_link: "/students/star/simran-kumari",
    title_1: "Star of the Month",
    title_2: "Simran Kumari - Class X Topper"
  },
  {
    id: 2,
    img_url: "https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/images%2Fsci-fair-winner.avif?alt=media",
    page_link: "/events/science-fair-2025",
    title_1: "National Science Fair Winner",
    title_2: "Ravi Raj - Class IX Innovator"
  }
];

const FeatureStar = () => {
    const [images, setImages] = useState(defaultImages);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get('/api/site-homepage-carousel-web-two');
                const imagesData = response.data.map((img) => ({
                    id: img.id,
                    url: img.img_url,
                    page_link: img.page_link,
                    title_1: img.title_1 || 'Sure Success Point School',
                    title_2: img.title_2 || 'A Unit of KiREAD Group'
                }));
                setImages(imagesData.length > 0 ? imagesData : defaultImages);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching images: ", err);
                setError('Could not load images from server. Using default images.');
                setImages(defaultImages);
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    useEffect(() => {
        if (images.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [images]);

    const goToPreviousSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    const goToNextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    if (loading) {
        return (
            <Box sx={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Skeleton variant='rectangular' width="100%" height="100%" />
            </Box>
        );
    }

    if (error && images.length === 0) {
        return <Typography color='error'>{error}</Typography>;
    }

    return (
        <Box sx={{ marginTop: 2, padding: 1 }}>
            <Box sx={{ textAlign: 'center', paddingBottom: 4 }}>
                <Button variant="outlined" color="primary" size="large">
                    <Typography sx={{fontSize:{sm:12, md:24}}}>Celebrating Our Achievements</Typography>
                </Button>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            minWidth:'70vw',
                            height: isMobile ? '250px' : '500px',
                            overflow: 'hidden',
                            borderRadius: '8px',
                        }}
                    >
                        {images.map((image, index) => (
                            <Link key={image.id} href={image.page_link} passHref>
                                <Box
                                    component="img"
                                    src={image.url}
                                    alt={image.title_1}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        position: 'absolute',
                                        transition: 'transform 0.5s ease',
                                        transform: `translateX(${100 * (index - currentIndex)}%)`,
                                        cursor: 'pointer'
                                    }}
                                />
                            </Link>
                        ))}
                        <Typography
                            variant='h6'
                            sx={{
                                position: 'absolute',
                                bottom: 40,
                                left: 20,
                                color: '#fff',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                zIndex: 10
                            }}
                        >
                            {images[currentIndex]?.title_1}
                        </Typography>
                        <Typography
                            variant='body1'
                            sx={{
                                position: 'absolute',
                                bottom: 20,
                                left: 20,
                                color: '#fff',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                zIndex: 10
                            }}
                        >
                            {images[currentIndex]?.title_2}
                        </Typography>
                        <Button
                            onClick={goToPreviousSlide}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: 10,
                                color: '#fff',
                                transform: 'translateY(-50%)'
                            }}
                        >
                            <ArrowBackIos />
                        </Button>
                        <Button
                            onClick={goToNextSlide}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                right: 10,
                                color: '#fff',
                                transform: 'translateY(-50%)'
                            }}
                        >
                            <ArrowForwardIos />
                        </Button>
                    </Box>
                    <Box sx={{ paddingY: 2 }}>
                        <Alert variant='outlined'>
                            <Typography variant="subtitle">Celebrating Our Achievements</Typography>
                        </Alert>
                        <Typography variant="subtitle2">
                            {images[currentIndex]?.title_2 || "Discover the achievements of our students at Sure Success Point School."}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <EnquiryForm />
                </Grid>
            </Grid>
        </Box>
    );
};

export default FeatureStar;
