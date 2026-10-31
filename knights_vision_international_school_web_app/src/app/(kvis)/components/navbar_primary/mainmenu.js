import React from 'react';
import { Box } from '@mui/material';
import Sustainability from './WishlistPage';
import WikiUniverse from './wikiuniverse';
import './dropdown.css';
import Careers from './career';
import LogInAndSelfProfile from './LogInAndSelfProfile';
import MyCart from './MyCart';
import ContactUS from './contactus'; 
const MainMenu = () => {
  return (
    <Box
        sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    position: 'relative', // anchor for absolute dropdowns
    alignItems: 'center', // consistent vertical align
  }}
    >
      <MyCart/>
      <Careers/>
      <WikiUniverse/>
      <LogInAndSelfProfile/>
    </Box>
  );
};

export default MainMenu;
