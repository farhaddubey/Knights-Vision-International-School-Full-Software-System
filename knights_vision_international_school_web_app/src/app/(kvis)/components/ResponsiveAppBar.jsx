"use client";
import * as React from 'react';
import {
  AppBar, Toolbar, Container, Box, Button, IconButton, Tooltip, Avatar,
  Drawer, List, ListItem, ListItemButton, ListItemText, Tabs, Tab
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import SSPSIcon from './SSPSIcon';
import IconImage from './IconImage';
import FooterScrollableTabsButtonAuto from './ScrollableHomePageTab';
import { AccountCircleOutlined, Info } from '@mui/icons-material';
import Link from 'next/link';
import CoursesDropDown from './autoDropDownIcons/ResultsDropDown';
import FeeStructuresDropDown from './autoDropDownIcons/FeeStructuresDropDown';
import KIBCSETDropDown from './autoDropDownIcons/KIBCSETDropDown';
import CustomDrawer from './CustomHomeDrawer';

const settings = ['Profile', 'Account', 'Logout'];

function ResponsiveAppBar() {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [value, setValue] = useState(0);

  // Toggle drawer state
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="xl" sx={{ backgroundColor: '#000000' }}>
          <Toolbar disableGutters>
            {/* Logo and Icon */}
            <IconImage sx={{ paddingY: 2 }} />
            <SSPSIcon />

            {/* Course Buttons - visible only on medium and larger screens */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <FeeStructuresDropDown/>
              <CoursesDropDown/>
              <KIBCSETDropDown/>
            </Box>

            {/* Spacer to push elements to the right */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Buttons aligned to the right - visible only on larger screens */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Link href={"/admission/applyForAdmissionTest"}>
              <Button variant="outlined" sx={{borderWidth:1, borderColor:"#ffd600", color:"#ffffff"}}>Admission Test</Button>
              </Link>
              <Link href={"/admission/admitCard"}>
              <Button color="#ffea00" variant="outlined" sx={{borderWidth:1,color:"#ff6f00", borderColor:"#ff6f00", marginLeft:.3}}>Admit</Button>
              </Link>
              <Link href={"/admission/checkResult"}>
              <Button color="#f50057" sx={{borderWidth:1,color:"#f50057", borderColor:"#f50057", marginLeft:.3}} variant="outlined">Result</Button>
              </Link>
              <Link href={"/admission/applyForAdmission"}>
              <Button variant="contained" color="success" sx={{marginLeft:.3}}>Apply 4 Admission</Button>
              </Link>
              <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: 1 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="Remy Sharp">
                      <AccountCircleOutlined/>
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Mobile Menu Icon - visible only on smaller screens */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="open drawer"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>

        {/* Drawer Component - mobile menu with hidden buttons */}
        <CustomDrawer drawerOpen={drawerOpen} handleDrawerToggle={handleDrawerToggle} />
      </AppBar>

      {/* Bottom Tab section (Tabs component) */}
      <Box sx={{
        paddingX: '2px',
        marginTop: '64px',
        bgcolor: '#212121',
        color: '#fafafa',
        position: 'fixed',
        zIndex: 90
      }}>
        <FooterScrollableTabsButtonAuto/>
      </Box>
    </>
  );
}
export default ResponsiveAppBar;
