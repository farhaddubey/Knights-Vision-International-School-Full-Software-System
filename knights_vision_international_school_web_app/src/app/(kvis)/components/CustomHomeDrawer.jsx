"use client"
// CustomDrawer.js
import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemText, Collapse, Box, Button } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
const CustomDrawer = ({ drawerOpen, handleDrawerToggle }) => {
  const router = useRouter();
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [routerReady, setRouterReady] = useState(false);
  useEffect(() => {
    setRouterReady(true);
  }, []);
  // Define menu structure with main titles and subtitles
  const menuItems = [
    {
      mainTitle: 'Courses & FEE',
      subTitles: ['Class KGI', 'Class KGII', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
      url:['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
    },
    {
      mainTitle: 'Generate Assignments',
      subTitles: ['Class KGI Format', 'Class KGII Format', 'Class 1 Format', 'Class 2', 'Class 3 Format', 'Class 4 Format', 'Class 5 Format', 'Class 6 Format', 'Class 7 Format', 'Class 8 Format', 'Class 9 Format', 'Class 10 Format', 'Class 11 Format', 'Class 12 Format'],
      url:['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
    },
    {
      mainTitle: 'Exam Admits',
      subTitles: ['Class KGI Admit', 'Class KGII Admit', 'Class 1 Admit', 'Class 2 Admit', 'Class 3 Admit', 'Class 4 Admit', 'Class 5 Admit', 'Class 6 Admit', 'Class 7 Admit', 'Class 8 Admit', 'Class 9 Admit', 'Class 10 Admit', 'Class 11 Admitt', 'Class 12 Admit'],
      url:['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
    },
    {
      mainTitle: 'Exam Results',
      subTitles: ['Class KGI Result', 'Class KGII Result', 'Class 1 Result', 'Class 2 Result', 'Class 3 Result', 'Class 4 Result', 'Class 5 Result', 'Class 6 Result', 'Class 7 Result', 'Class 8 Result', 'Class 9 Result', 'Class 10 Result','Class S10 Result', 'Class 11 Result', 'Class 12 Result'],
      url:['/classKGI/checkResult', '/classKGII/checkResult', '/classI/checkResult', '/classII/checkResult', '/classIII/checkResult', '/classIV/checkResult', '/classV/checkResult', '/classVI/checkResult', '/classVII/checkResult','/classVIII/checkResult', '/classIX/checkResult', '/classX/checkResult', '/classXS/checkResult', '#', '#']
    },
    {
      mainTitle: 'Admissions',
      subTitles: ['Apply for Admission Test', 'Download Admit Card', 'Admission Test Result', 'Apply for Admission'],
      url: ['/admission/applyForAdmissionTest', '/admission/admitCard', '/admission/checkResult', '/admission/applyForAdmission']
    },
    {
      mainTitle: 'Knights Edu System',
      subTitles: ['About US', 'Contact US', 'Multiboard Afflictions', 'Academic Programs', 'Faculty & Leadership Team', 'Curriculum & Syllabus', 'Our Students Success', 'Recognitions', 'Admission Process', 'Events & Arcticles', 'Student Life & Experience', 'Tech Integrated Edu', 'Newsroom'],
      url:['#', '#', '#', '#', '#', '#','#','#','#','#','#','#','#']
    },
    {
      mainTitle: 'Knights Success',
      subTitles: ['Our Students Success'],
      url:['#']
    },
    {
      mainTitle: 'Knights Prayers',
      subTitles: ['Knights Bengali', 'Knights English', 'Knights Hindi'],
      url:['https://www.wikigalaxy.in/explore/knights-prayers/knights-prayer-1/knights-prayer-bengali', 'https://www.wikigalaxy.in/explore/knights-prayers/knights-prayer-1/knights-prayer-english', 'https://www.wikigalaxy.in/explore/knights-prayers/knights-prayer-1/knights-prayer-hindi']
    },
  ];

  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  return (
    <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
      <Box sx={{backgroundColor:"#212121",color:"#ffffff", width: 250, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Main List of Items with a scrollable area */}
        <List sx={{ flexGrow: 1, overflowY: 'auto', 
          scrollbarWidth: 'none',  // For Firefox
          '&::-webkit-scrollbar': { display: 'none' } // For Chrome, Safari, Edge
         }}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => toggleSubMenu(index)}>
                  <ListItemText primary={item.mainTitle} />
                  {openSubMenu === index ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse in={openSubMenu === index} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subTitles.map((subTitle, subIndex) => (
                        <Link href={item.url[subIndex]} key={subIndex}>
                    <ListItem key={subIndex} disablePadding sx={{ pl: 2 }}>
                      <ListItemButton sx={{color:"#ffffff", borderBottom:"#ffffff", borderBottomWidth:"2px"}} onClick={handleDrawerToggle}>
                        <ListItemText sx={{color:"#ffffff", borderBottom:"#ffffff", borderBottomWidth:"2px"}} primary={subTitle} />
                      </ListItemButton>
                    </ListItem>
                        </Link>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
        {/* Fixed Buttons at the bottom */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <Button variant="contained" color="success" fullWidth sx={{ mb: 1 }}
           onClick={()=>router.push("/admission/applyForAdmissionTest")}
           >
            Admission Test Form
          </Button>
          <Button variant="contained" color="#f9a825" backgroundColor="#f9a825" fullWidth sx={{ mb: 1, backgroundColor:"#f9a825" }}
           onClick={()=>router.push("/admission/admitCard")}
           >
            Download Admit Card
          </Button>
          <Button variant="contained" color="primary" fullWidth sx={{ mb: 1, backgroundColor:"#e91e63" }}
           onClick={()=>router.push("/admission/checkResult")}
           >
           Admission Test Result 
          </Button>
          <Button variant="contained" color="primary" fullWidth sx={{ mb: 1, backgroundColor:"#4a148c" }}
           onClick={()=>router.push("/admission/applyForAdmission")}
           >
           Apply for Admission
          </Button>
        </Box>
        {/* Fixed Buttons at the bottom */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid #e0e0e0',
          }}
        >
           <Button variant="contained" color="primary" fullWidth sx={{ mb: 1, backgroundColor:"#004d40" }}
           onClick={()=>router.push("https://www.wikigalaxy.in/explore/knights-prayers/knights-prayer-1/knights-prayer-bengali")}
           >
            Institutional Prayer
          </Button>
          <Button variant="contained" color="primary" fullWidth
          //  onClick={()=>router.push("/parentsAdmin")}
            sx={{ mb: 1 }}>
            Parents Login
          </Button>
          <Button variant="contained" color="secondary" fullWidth
          //  onClick={()=>router.push("/parentsAdmin")}
            sx={{ mb: 1 }}>
            Students Login
          </Button>
          <Button variant="outlined" color="#000000" fullWidth sx={{backgroundColor:"#000000"}}
           onClick={()=>router.push("/admin")}
           >
            Teachers Login
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CustomDrawer;
