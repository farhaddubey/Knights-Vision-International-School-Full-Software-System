"use client";
import React, { useEffect, useState } from 'react';
import { Box, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { AccountCircle, People, School } from '@mui/icons-material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Collapse from '@mui/material/Collapse';
import { title } from 'process';
import Image from 'next/image';
import TDILIcon from "@/components/sure-success-point-school/brand/SureSuccessPointSchoolBrandIcon";
function DrawerComponent({ mobileOpen, handleDrawerToggle, appBarHeight, activeSection, handleDrawerItemClick, drawerWidth, jobRole }) {
  const getDrawerItemStyles = (activeSection, itemLabel, theme) => ({
    backgroundColor: activeSection === itemLabel ? theme.palette.primary.main : "transparent",
    color: activeSection === itemLabel ? "#fff" : "#bdbdbd",
    "&:hover": {
      backgroundColor: "#4a148c",
    },
  });
  // Define sections for different roles
const attendancePanel=[
  { label: '👤 My Info' },
  { label: '📆 My Attendance' },
  { label: '✋ My Requested Leaves' },
  { label: '📝 Holiday Calendar'},
]
const studentsHomeWorkPanel = [
  { label: '📖 My School Syllabus' },
  { label: '📚 View Homework Status' },
  { label: '🧾 My Assignments' },
  { label: '🧪 My Class Tests'},
  { label: '🏆 My KWBMTPS Tests'}
];
const studentsMarksPanel=[
  { label: '📝 My Daily Homework Report' },
  { label: '🧪 My Weekly Test Marks' },
  { label: '🧾 My Weekly Assignment Marks' },
  { label: '🏆 My KWBMTPS Results' }, // Knights West Bengal Board Test Series
  { label: '📖 Semester Exam Dates'}, 
]
const monthlyFeesAndDue=[
  { label: '📚 My Due Fees' },
]
const studentsTalentPanel=[
  { label: '📘 Class Books Assigned' },
  { label: '🧠 Foods to Boost Brain Power' },
  // { label: '🗣️ My Speech Competition Status' },
  // { label: '📊 My Behaviour Report' },
]
const studentsPanelSpecial=[
  { label: '🙏 My School Oath & Prayer' },
  { label: '📝 Check Semester Results'},
]
const guardiansPanel = [
  { label: '📝 Notes During Parent-Teacher Meetings' },
  { label: '💡 How Can We Improve Better?'}
];
const noticeBoardCirculars=[

]
const sectionGroupsForStudent = [
  { title: "My Attendance Panel", items: attendancePanel },
  { title: "My Homework Panel", items: studentsHomeWorkPanel}, 
  { title: 'My Score Cards Panel', items: studentsMarksPanel}, 
  { title: 'My Talent Health Panel', items: studentsTalentPanel}, 
  { title: 'My Schools Curriculam Panel', items: studentsPanelSpecial},
  { title: 'My Schools Fees Panel', items: monthlyFeesAndDue}, 
  { title: 'My Guardians Communication', items: guardiansPanel}, 
  { title: "Notice Board & Circulars", items: noticeBoardCirculars}, 
];


const renderSectionsForRawMaterialsRole = (role) => {
const sections = [];
  if (role === "STUDENT") {
    return sectionGroupsForStudent; // 🚨 Return grouped format
  } else if (role === "GUARDIAN") {
    return sectionGroupsForStudent; 
  } else {
    return sectionGroupsForStudent;
  }
    return [{ title: "Knights Students Panel", items: sections }]; // 📦 Wrap in a group for consistent rendering
};

const [openGroups, setOpenGroups] = useState({});
const visibleGroups = renderSectionsForRawMaterialsRole(jobRole);

  const toggleGroup = (groupTitle) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };


  // Get the appropriate sections based on the role
  // const visibleRawMaterialsSections=renderSectionsForRawMaterialsRole(jobRole);
  const drawer = (
     <Box
      sx={{
        backgroundColor: "#000",
        color: "#bdbdbd",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* <Toolbar> */}
             <Box sx={{display:"flex", flexDirection:"row", py:.5}}>
                      <Image width={56} height={56}
                        src={"/knights.png"}
                        alt="TDIL | The Dubey Industries Limited"
                      />
                <TDILIcon sx={{pt:2}}/>
                    </Box>
      {/* </Toolbar> */}
      <ListItem disablePadding sx={{ backgroundColor: "#e91e63", color: "#000000" }}>
        <ListItemButton>
          <ListItemText
            primary={`${jobRole.charAt(0).toUpperCase()}${jobRole.slice(1).toLowerCase()} Panel`}
            sx={{
              fontWeight: "bold",
              color: "#212121",
              fontFamily: "serif",
              textTransform: "capitalize",
              fontSize: "1.3rem",
            }}
          />
        </ListItemButton>
      </ListItem>

      <List sx={{ backgroundColor: "#000", flex: 1, overflowY: "auto" }}>
        {visibleGroups.map((group) => (
          <React.Fragment key={group.title}>
            <ListItemButton onClick={() => toggleGroup(group.title)}>
              <ListItemText primary={group.title} />
              {openGroups[group.title] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openGroups[group.title]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {group.items.map((item) => (
                  <ListItemButton
                    key={item.label}
                    sx={(theme) => ({
                      ...getDrawerItemStyles(activeSection, item.label, theme),
                    })}
                    onClick={() => handleDrawerItemClick(item.label)}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>

      {/* Fixed Button at the Bottom */}
      <Box
        sx={{
          backgroundColor: "#4a148c",
          color: "#ffffff",
          textAlign: "center",
          p: 0.2,
          position: "sticky",
          bottom: 0,
        }}
      >
        <ListItemButton
          style={{
            backgroundColor: "#181818",
            color: "#ffffff",
            border: "none",
            borderRadius: "2px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
          onClick={() => handleDrawerItemClick("My Profile")}
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary={"My Profile"} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Temporary Drawer for Mobile */}
      <Drawer
        container={window.document.body} //window avail on client modde always Use window only if running on the client-side
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            mt: `${appBarHeight}px`,
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Permanent Drawer for Desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default DrawerComponent;
