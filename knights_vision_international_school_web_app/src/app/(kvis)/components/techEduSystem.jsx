'use client';
import React, { useEffect, useState } from 'react';
import { Box, Grid2, Container, Typography, Link, Button, Divider, useMediaQuery, useTheme } from '@mui/material';
import axios from 'axios';

const defaultData = [
  {
    id: 1,
    img_url: 'https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/images%2Ftech-classroom.avif?alt=media',
    page_link: '/technology/smart-classroom',
    title_1: 'Smart Classrooms',
    title_2: 'Interactive digital boards for engaging learning',
  },
  {
    id: 2,
    img_url: 'https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/images%2Fvr-lab.avif?alt=media',
    page_link: '/technology/vr-lab',
    title_1: 'Virtual Reality Labs',
    title_2: 'Immersive learning experiences for students',
  },
];

const InfoGrid2 = () => {
  const [infoData, setInfoData] = useState(defaultData);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchInfoData = async () => {
      try {
        const response = await axios.get('/api/feature-technology');
        const data = response.data.map((item) => ({
          id: item.id,
          url: item.img_url,
          page_link: item.page_link,
          title: item.title_1 || 'Sure Success Point School',
          subtitle: item.title_2 || 'A Unit of KiREAD Group',
        }));
        setInfoData(data.length > 0 ? data : defaultData);
      } catch (error) {
        console.error('Error fetching info data:', error);
        setInfoData(defaultData);
      }
    };

    fetchInfoData();
  }, []);

  return (
    <Box sx={{ my: 0, p: 2 }}>
      <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
        <Button variant="outlined" color="inherit" size="large">
          <Typography variant="h5" sx={{ fontSize: { xs: 12, md: 20 } }}>
            Technology Integrated Education System
          </Typography>
        </Button>
      </Box>
      <Box
        sx={{
          display: 'flex',
          overflowX: 'scroll',
          gap: 1,
          padding: 2,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {infoData.map((info) => (
          <Link key={info.id} href={info.page_link} style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                flex: '0 0 auto',
                width: '400px',
                height: { xs: '600px', md: '600px' },
                borderRadius: 5,
                overflow: 'visible',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  paddingY: '120px',
                  position: 'relative',
                  width: '80%',
                  height: '400px',
                  backgroundImage: `url(${info.url})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  borderRadius: 5,
                  transition: 'transform 0.5s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.5)',
                    zIndex: 10,
                  },
                }}
              ></Box>
              <Box
                sx={{
                  padding: '10px 0',
                  color: '#fff',
                }}
              >
                <Typography variant="h6">{info.title}</Typography>
                <Typography variant="body2">{info.subtitle}</Typography>
              </Box>
            </Box>
          </Link>
        ))}
      </Box>
      <Divider sx={{ my: 4 }} />
    </Box>
  );
};

export default InfoGrid2;
