"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import axios from 'axios';

const defaultImages = [
  {
    id: 1,
    url: "https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/images%2F1734523590926.avif?alt=media&token=74216be2-3c50-4a36-8e54-b5670076e440",
    title: "Welcome to Sure Success Point School",
    subtitle: "Where Bright Minds Begin & Leaders are Born."
  },
  {
    id: 2,
    url: "https://scontent.frdp1-2.fna.fbcdn.net/v/t39.30808-6/532021505_122149172360755318_455918996616477059_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_ohc=7cN0G2OoFZIQ7kNvwGnHKkX&_nc_oc=Adl8RSIe72jjouJFv3rrXz967TQgD5nWVi0zRjNAcUI6IRMQLxDnJCg-pdK_9Ia78xGdsUsWIkfhHBvk_q43-bGp&_nc_zt=23&_nc_ht=scontent.frdp1-2.fna&_nc_gid=-NKklpkgDEvBT-qf6Z_eqA&oh=00_AfWjzPYrba4kueWwdTsqiVRazQI1OQKzwkMxzgofBuz0tw&oe=68B073AD",
    title: "Interactive Classrooms",
    subtitle: "Engaging lessons that make learning fun and effective."
  },
  {
    id: 3,
    url: "https://scontent.frdp1-2.fna.fbcdn.net/v/t39.30808-6/532560731_122149172960755318_8617022751955325699_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_ohc=ASeDvewNDWwQ7kNvwH9wGHm&_nc_oc=AdkgJVG7Q8aAUfB8SCBC_fNS5mOXh4VoRYKRMPo_cN4TZN1C8vE4Qgnfmh11gl-N5WvMA-Bkk_ub5Ff7Dmmm2wjV&_nc_zt=23&_nc_ht=scontent.frdp1-2.fna&_nc_gid=3MVqH0rEfMZs2tTGMQq6xg&oh=00_AfXGnFqVcoj6MFQwmepp0pZCQ9K44kbo3QVbJnsJEo3N-A&oe=68B05902",
    title: "Modern Science Labs",
    subtitle: "Hands-on experiments to ignite curiosity and innovation."
  },
  {
    id: 4,
    url: "https://scontent.frdp1-1.fna.fbcdn.net/v/t39.30808-6/520025424_122149172450755318_957671451337400915_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_ohc=evWOwz-bgIkQ7kNvwHpJFQ1&_nc_oc=AdlCQ83VkDR82A6V3LDr8tv10k43p9AWmmQg5SfQezeL3GHxzULnUHfyFjEw1hjGS8kiileGhd7bWZ4qI_NWEpVt&_nc_zt=23&_nc_ht=scontent.frdp1-1.fna&_nc_gid=3MVqH0rEfMZs2tTGMQq6xg&oh=00_AfWP_UG8RAyRFcAs62POSEj2FBNclLvlG_yTzZla_4JIbw&oe=68B05F0E",
    title: "Sports & Fitness",
    subtitle: "Building strong bodies and disciplined minds through sports."
  },
  {
    id: 5,
    url: "https://scontent.fixb5-1.fna.fbcdn.net/v/t39.30808-6/481996029_609373462002828_2648147309745529592_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=105&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=roDUPJtFEi8Q7kNvwEE4E6d&_nc_oc=AdkYJf9WmcWIb9O_F1pbGb5ctJ8wVIv_cZO8Wnu_4h0CUA4tV-ugn7OFTyN0jaFgqU3hEks0TTKYcMdq14hk-53X&_nc_zt=23&_nc_ht=scontent.fixb5-1.fna&_nc_gid=a-I5rutjwvb4vuRd04_gPQ&oh=00_AfWiDYVakdeYeMS_H2xL2qnsR5iAd_01aY7QzRjAtFylTw&oe=68B07360",
    title: "Digital Learning Hub",
    subtitle: "Equipping students with essential 21st-century skills."
  },
  {
    id: 6,
    url: "https://scontent.frdp1-2.fna.fbcdn.net/v/t39.30808-6/532021505_122149172360755318_455918996616477059_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_ohc=7cN0G2OoFZIQ7kNvwGnHKkX&_nc_oc=Adl8RSIe72jjouJFv3rrXz967TQgD5nWVi0zRjNAcUI6IRMQLxDnJCg-pdK_9Ia78xGdsUsWIkfhHBvk_q43-bGp&_nc_zt=23&_nc_ht=scontent.frdp1-2.fna&_nc_gid=-NKklpkgDEvBT-qf6Z_eqA&oh=00_AfWjzPYrba4kueWwdTsqiVRazQI1OQKzwkMxzgofBuz0tw&oe=68B073AD",
    title: "Cultural Activities",
    subtitle: "Celebrating creativity, diversity, and expression."
  }
];

const ImageSlider = () => {
    const [images, setImages] = useState(defaultImages);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get('/api/site-homepage-carousel-web/get');
                const imagesData = response.data.images.map((img) => ({
                    id: img.id,
                    url: img.img_url,
                    title: img.title || 'Sure Success Point School',
                    subtitle: img.subtitle || 'A Unit of KiREAD Group'
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
            }, 8000);
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
            <Box sx={{ width: '100%', height: '700px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Skeleton variant='rectangular' width="100%" height="100%" />
            </Box>
        );
    }

    if (error && images.length === 0) {
        return <Typography color='error'>{error}</Typography>;
    }

    return (
        <Box
            sx={{
                position: 'relative',
                marginTop: '52px',
                width: '100%',
                maxWidth: '1920px',
                height: { xs: '250px', sm: '350px', md: '500px' },
                overflow: 'hidden',
                borderRadius: '8px',
                '&:hover .text-overlay': {
                    opacity: 1,
                },
            }}
        >
            {images.map((image, index) => (
                <Box
                    key={image.id}
                    component="img"
                    src={image.url}
                    alt={image.title}
                    sx={{
                        display: index === currentIndex ? 'block' : 'none',
                        width: '100%',
                        height: { xs: '250px', sm: '350px', md: '500px' },
                        objectFit: 'cover',
                        position: 'absolute',
                    }}
                />
            ))}
            <Box
                className="text-overlay"
                sx={{
                    position: 'absolute',
                    bottom: { xs: 4, md: 20 },
                    left: { xs: 12, md: 20 },
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                    zIndex: 100,
                }}
            >
                <Box
                    sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '8px',
                        padding: { xs: '8px 12px', md: '12px 16px' },
                        display: 'inline-block',
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: { xs: '1.4rem', sm: '2rem', md: '3.5rem' },
                            textShadow: `
                                5px 5px 0px #000000,
                                -3px -3px 0px #000000,
                                3px -3px 0px #000000,
                                -3px 3px 0px #000000
                            `,
                        }}
                    >
                        {images[currentIndex]?.title}
                    </Typography>
                    <Typography
                        sx={{
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' },
                            textShadow: `
                                5px 5px 0px #000000,
                                -3px -3px 0px #000000,
                                3px -3px 0px #000000,
                                -3px 3px 0px #000000
                            `,
                        }}
                    >
                        {images[currentIndex]?.subtitle.slice(0, 150)}
                    </Typography>
                </Box>
            </Box>
            <Button
                onClick={goToPreviousSlide}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: { xs: 4, md: 10 },
                    color: '#fff',
                    transform: 'translateY(-50%)',
                    minWidth: { xs: '30px', md: '40px' },
                }}
            >
                <ArrowBackIos fontSize="small" />
            </Button>
            <Button
                onClick={goToNextSlide}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    right: { xs: 4, md: 10 },
                    color: '#fff',
                    transform: 'translateY(-50%)',
                    minWidth: { xs: '30px', md: '40px' },
                }}
            >
                <ArrowForwardIos fontSize="small" />
            </Button>
        </Box>
    );
};

export default ImageSlider;