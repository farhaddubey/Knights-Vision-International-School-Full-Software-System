"use client";
import React, { useEffect, useState } from 'react';
import { Box, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { AccountCircle, People, School } from '@mui/icons-material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Collapse from '@mui/material/Collapse';
import Image from 'next/image';
import TDILIcon from "@/components/sure-success-point-school/brand/SureSuccessPointSchoolBrandIcon";
import { filterPanelGroups } from '@/src/lib/rbac/panelNavigation';
import { centralAdministrationGroups } from '@/src/lib/rbac/centralAdministrationNavigation';

function DrawerComponent({ mobileOpen, handleDrawerToggle, appBarHeight, activeSection, handleDrawerItemClick, drawerWidth, jobRole, permissions, roleCodes = [], temporaryFullAdministrationNavigation = false }) {
  const getDrawerItemStyles = (activeSection, itemLabel, theme) => ({
    backgroundColor: activeSection === itemLabel ? theme.palette.primary.main : "transparent",
    color: activeSection === itemLabel ? "#fff" : "#bdbdbd",
    "&:hover": {
      backgroundColor: "#4a148c",
    },
  });
  // Define sections for different roles
const myBasicPages = [
    { label: 'My Attendance'}, 
    { label: 'My Production Logs'}, 
    { label: 'My Salary History'}, 
    { label: 'My Current Month Salary'}
  ]
const schoolFaculties = [
    { label: 'Faculties List' },
    { label: 'Insert Faculty Entrance' },
    { label: 'Insert Faculty Exit' },
    { label: 'Faculty Attendance' },
    { label: 'Faculty Monthly Salary' },
    { label: 'Faculty Payment Panel'},
]

const adminPanelPages = [
    { label: 'Add School Teachers'}, 
    { label: 'Employee List' },
    { label: 'Employee Documents' },
    { label: 'Employee Manage List'},
    { label: 'Add Institution Profile'}, 
    { label: 'Add Institution Branches'},
    { label: 'Add Institution Classes'},
    { label: 'Add Institution Subjects'},
    { label: 'Map Class to Subjects'},  
    { label: 'Access Control'},
    { label: 'Assign Class Teachers'},
    { label: 'Assign Subject Teachers'}, 
    { label: 'Add Class Rooms'},
    { label: 'Semester Exams Panel'}, 
    { label: '🧾 View Fee Schemes' },  
    { label: 'Manage Holiday Calendar'},
    { label: 'Student Holiday Calendar'}                   // FeeScheme

];

const systemUnitsPages=[
    { label: 'AdminPanel Carousel'}, 
    { label: 'Explore Countries'},
    { label: 'Explore States'}, 
    { label: 'Explore Districts'}, 
    { label: 'Explore Cities'},  
  ]
  const facultiesTraining = [
    { label: 'Employee Directory' },
    { label: 'Attendance Tracking' },
    { label: 'Payroll Processing' },
    { label: 'Leave Management' },
    { label: 'Shift Scheduling' },
    { label: 'Performance Evaluation' },
    { label: 'Recruitment & Onboarding' },
    { label: 'Training & Development' },
    { label: 'HR Reports' },
  ];
const fleetsManagement = [
    { label: 'Fleets'}, 
    { label: 'Depots'}, 
    { label: 'Vehicle Documents'}, 
    { label: 'Vehicle Maintenance Logs'}, 
    { label: 'All Bus Tracking'}, 
    { label: 'Bus Tracking No.Wise'}, 
]; 
const Images= [
    { label: 'Upload & View Images'},
]
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
const siteLandingPageControlPanel = [
  { label: 'Modify Feature Galaxies', roles: ['Admin', 'Marketing Manager'] },
  { label: 'Modify Site Navbar', roles: ['Admin', 'Marketing Manager'] },
  { label: 'Modify Site Carousel', roles: ['Admin', 'Marketing Manager'] },
  { label: 'Modify Achievements Carousel', roles: ['Admin', 'Operations Head'] },
  { label: 'Explore Enquaries', roles: ['Admin', 'Operations Head'] },
  { label: 'Modify Feature Technologies', roles: ['Admin', 'Operations Head'] },
  { label: 'Modify School in Cities', roles: ['Admin', 'Support Staff'] },
  { label: 'Modify Feature Students', roles: ['Admin', 'Marketing Manager'] },
  { label: 'Modify Feature YT Videos', roles: ['Admin', 'Marketing Manager'] },
  { label: 'Modify Featured Programs', roles: ['Admin', 'Translator'] },
  { label: 'Modify WikiGalaxy Articles', roles: ['Admin', 'District Manager'] },
];


const paymentManagementPages=[
    { label: 'Explore Payments'},
]
const noticeBoardCirculars=[
    { label: 'School-wide notices'},
    { label: 'Class-specific updates'}, 
    { label: 'Holiday announcements'},
]
const eventAndProgramRegistration=[
  { label: 'Cultural Function'}, 
  { label: 'Debate Function'}, 
  { label: 'Annual Function'}
]
const admissionTestDepartment = [
  { label: '🧾 View Fee Schemes' },                     // FeeScheme
  { label: '🧾 Admission Test Applications'},
  { label: '📝 Fill Admission Form' },                 // AdmissionTestApplication
  { label: '📥 Download Admit Card' },                 // Application + AdmissionTest
  { label: '📚 Admission Test Schedule' },             // AdmissionTest
  { label: '📚 Print Application & Room No'}, 
  { label: '🧠 Syllabus & Subject Info' },             // ClassSubject
  { label: '🧪 Test Evaluation & Mark Entry' },        // TestMark
  { label: '📊 View Result & Rank List' },             // Application + rank
  { label: '📋 KSAT Qualifieds Registration' },// Application.phaseSelected
  { label: '📋 General Direct Registration' },// Application.phaseSelected
  // { label: '📋 KSAT+ Qualifieds Registration' },// Application.phaseSelected
  { label: '📄 Form ID & Fee Receipt' },               // Admission receipt
  { label: '✅ Total Admitted Students' },         // Final Student creation
];
const schoolMarketing = [   // 🎯 Phase 1: Planning & Targeting
  { label: 'Marketing Campaign Planning 🧠 ' },   //(Goal, Audience, Budget Setup)
  { label: 'Area & Region Targeting📍' },   // (Choose Places, Pin Codes, Schools Nearby)   // 📰 Phase 2: Strategy & Materials
  { label: 'Offline Advertising Strategy 📜' },   // (Posters, Hoardings, Leaflets, Events)
  { label: 'Online Advertising Plan 🌐' },   //  (Google, FB, Insta, YouTube, WhatsApp)
  { label: 'Content Creation 🎥' },   //  (Photoshoots, Video Ads, Testimonials, Flyers)
  { label: 'Marketing Material Printing 🖨️' },   // (Banners, Forms, Brochures)
   // 📢 Phase 3: Field Execution
  { label: 'Outdoor Promo Activities 📣' },   // (School Rallies, Van Miking, Public Talks)
  { label: 'Door-to-Door Campaign 🚪' },   //  (Field Staff Tracking, Coverage Logs)
  { label: 'Digital Campaign Launch 🚀' },   //  (Social Media Ads, Email, WhatsApp Push)
   // 📬 Phase 4: Lead Handling
  { label: 'Lead Collection Panel 📝' },   //  (Online + Offline Form Submissions)
    // 💸 Phase 5: Budget Tracking & Team
  { label: 'Cost & ROI Analysis 💰' },   //  (Track Spend per Channel & Conversion)
  { label: 'Team Assignment & Reporting 👥' },   //  (Staff Assigned, Daily Summary)
    // 📈 Phase 6: Review & Optimization
  { label: 'Performance Review & Optimization 📊' }   //  (What Worked, What Didn’t)
];

// const drawerItemsV = [
//   { label: 'Manage Students V' },
//   { label: 'Insert & View Attendance V' },
//   { label: 'Leave Requests & Approvals V' },
//   { label: 'View Lecture & Homework Syl. V' },
//   { label: 'Confirm Weekly HomeWork V' },
//   { label: 'View Institution Assignments V' },
//   { label: 'Add Weekly Progress Test Marks V' },
//   { label: 'Insert Students Marks V' },
//   { label: 'View Students Marks V' },
//   { label: 'View Instructed Books V' },
//   { label: 'Healthy Foods Suggestion V' },
//   { label: 'View Punishments to Use V' },
//   { label: 'Student Behaviour Log V' },
//   { label: 'Guardian Communication Log V'}, 
//   { label: 'Guardian Call FBW Report V' },
//   { label: 'Parent-Teacher Meeting Notes V' },
//   { label: 'Admit Cards V' },
//   { label: 'Knights CDTP Sessions V' },
//   { label: 'Public Speaking Occasion'}, 
//   { label: 'Annual Public Competition V' },
//   { label: 'Monthly Fees V' },
//   { label: 'ReAdmission from Class V -> VI' },
// ];

const drawerItemsVI = [
  { label: 'Manage Students VI' },
  { label: 'Insert & View Attendance VI' },
  { label: 'Leave Requests & Approvals VI' },
  { label: 'View Lecture & Homework Syl. VI' },
  { label: 'Confirm Weekly HomeWork VI' },
  { label: 'View Institution Assignments VI' },
  { label: 'Add Weekly Progress Test Marks VI' },
  { label: 'Insert Students Marks VI' },
  { label: 'View Students Marks VI' },
  { label: 'View Instructed Books VI' },
  { label: 'Healthy Foods Suggestion VI' },
  { label: 'View Punishments to Use VI' },
  { label: 'Student Behaviour Log VI' },
  { label: 'Guardian Communication Log VI'}, 
  { label: 'Guardian Call FBW Report VI' },
  { label: 'Parent-Teacher Meeting Notes VI' },
  { label: 'Semester Exams TimeTable VI'}, 
  { label: 'Admit Cards VI' },
  { label: 'Knights CDTP Sessions VI' },
  { label: 'Public Speaking Occasion'}, 
  { label: 'Annual Public Competition VI' },
  { label: 'Monthly Fees VI' },
  { label: 'ReAdmission from Class VI -> VII' },
];
const drawerItemsLKG = [
  { label: 'Manage Students LKG' },
  { label: 'Insert & View Attendance LKG' },
  { label: 'Leave Requests & Approvals LKG' },
  { label: 'View Lecture & Homework Syl. LKG' },
  { label: 'Confirm Weekly HomeWork LKG' },
  { label: 'View Institution Assignments LKG' },
  { label: 'Add Weekly Progress Test Marks LKG' },
  { label: 'Insert Students Marks LKG' },
  { label: 'View Students Marks LKG' },
  { label: 'View Instructed Books LKG' },
  { label: 'Healthy Foods Suggestion LKG' },
  { label: 'View Punishments to Use LKG' },
  { label: 'Student Behaviour Log LKG' },
  { label: 'Guardian Communication Log LKG' },
  { label: 'Guardian Call FBW Report LKG' },
  { label: 'Parent-Teacher Meeting Notes LKG' },
  { label: 'Semester Exams TimeTable LKG'}, 
  { label: 'Admit Cards LKG' },
  { label: 'Knights CDTP Sessions LKG' },
  { label: 'Public Speaking Occasion LKG' },
  { label: 'Annual Public Competition LKG' },
  { label: 'Monthly Fees LKG' },
  { label: 'ReAdmission from Class LKG -> UKG' },
];

const drawerItemsUKG = [
  { label: 'Manage Students UKG' },
  { label: 'Insert & View Attendance UKG' },
  { label: 'Leave Requests & Approvals UKG' },
  { label: 'View Lecture & Homework Syl. UKG' },
  { label: 'Confirm Weekly HomeWork UKG' },
  { label: 'View Institution Assignments UKG' },
  { label: 'Add Weekly Progress Test Marks UKG' },
  { label: 'Insert Students Marks UKG' },
  { label: 'View Students Marks UKG' },
  { label: 'View Instructed Books UKG' },
  { label: 'Healthy Foods Suggestion UKG' },
  { label: 'View Punishments to Use UKG' },
  { label: 'Student Behaviour Log UKG' },
  { label: 'Guardian Communication Log UKG' },
  { label: 'Guardian Call FBW Report UKG' },
  { label: 'Parent-Teacher Meeting Notes UKG' },
  { label: 'Semester Exams TimeTable UKG'}, 
  { label: 'Admit Cards UKG' },
  { label: 'Knights CDTP Sessions UKG' },
  { label: 'Public Speaking Occasion UKG' },
  { label: 'Annual Public Competition UKG' },
  { label: 'Monthly Fees UKG' },
  { label: 'ReAdmission from Class UKG -> I' },
];

const drawerItemsI = [
  { label: 'Manage Students I' },
  { label: 'Insert & View Attendance I' },
  { label: 'Leave Requests & Approvals I' },
  { label: 'View Lecture & Homework Syl. I' },
  { label: 'Confirm Weekly HomeWork I' },
  { label: 'View Institution Assignments I' },
  { label: 'Add Weekly Progress Test Marks I' },
  { label: 'Insert Students Marks I' },
  { label: 'View Students Marks I' },
  { label: 'View Instructed Books I' },
  { label: 'Healthy Foods Suggestion I' },
  { label: 'View Punishments to Use I' },
  { label: 'Student Behaviour Log I' },
  { label: 'Guardian Communication Log I' },
  { label: 'Guardian Call FBW Report I' },
  { label: 'Parent-Teacher Meeting Notes I' },
    { label: 'Semester Exams TimeTable I'}, 
  { label: 'Admit Cards I' },
  { label: 'Knights CDTP Sessions I' },
  { label: 'Public Speaking Occasion I' },
  { label: 'Annual Public Competition I' },
  { label: 'Monthly Fees I' },
  { label: 'ReAdmission from Class I -> II' },
];

const drawerItemsII = [
  { label: 'Manage Students II' },
  { label: 'Insert & View Attendance II' },
  { label: 'Leave Requests & Approvals II' },
  { label: 'View Lecture & Homework Syl. II' },
  { label: 'Confirm Weekly HomeWork II' },
  { label: 'View Institution Assignments II' },
  { label: 'Add Weekly Progress Test Marks II' },
  { label: 'Insert Students Marks II' },
  { label: 'View Students Marks II' },
  { label: 'View Instructed Books II' },
  { label: 'Healthy Foods Suggestion II' },
  { label: 'View Punishments to Use II' },
  { label: 'Student Behaviour Log II' },
  { label: 'Guardian Communication Log II' },
  { label: 'Guardian Call FBW Report II' },
  { label: 'Parent-Teacher Meeting Notes II' },
  { label: 'Semester Exams TimeTable II'}, 
  { label: 'Admit Cards II' },
  { label: 'Knights CDTP Sessions II' },
  { label: 'Public Speaking Occasion II' },
  { label: 'Annual Public Competition II' },
  { label: 'Monthly Fees II' },
  { label: 'ReAdmission from Class II -> III' },
];

const drawerItemsIII = [
  { label: 'Manage Students III' },
  { label: 'Insert & View Attendance III' },
  { label: 'Leave Requests & Approvals III' },
  { label: 'View Lecture & Homework Syl. III' },
  { label: 'Confirm Weekly HomeWork III' },
  { label: 'View Institution Assignments III' },
  { label: 'Add Weekly Progress Test Marks III' },
  { label: 'Insert Students Marks III' },
  { label: 'View Students Marks III' },
  { label: 'View Instructed Books III' },
  { label: 'Healthy Foods Suggestion III' },
  { label: 'View Punishments to Use III' },
  { label: 'Student Behaviour Log III' },
  { label: 'Guardian Communication Log III' },
  { label: 'Guardian Call FBW Report III' },
  { label: 'Parent-Teacher Meeting Notes III' },
    { label: 'Semester Exams TimeTable III'}, 
  { label: 'Admit Cards III' },
  { label: 'Knights CDTP Sessions III' },
  { label: 'Public Speaking Occasion III' },
  { label: 'Annual Public Competition III' },
  { label: 'Monthly Fees III' },
  { label: 'ReAdmission from Class III -> IV' },
];

const drawerItemsIV = [
  { label: 'Manage Students IV' },
  { label: 'Insert & View Attendance IV' },
  { label: 'Leave Requests & Approvals IV' },
  { label: 'View Lecture & Homework Syl. IV' },
  { label: 'Confirm Weekly HomeWork IV' },
  { label: 'View Institution Assignments IV' },
  { label: 'Add Weekly Progress Test Marks IV' },
  { label: 'Insert Students Marks IV' },
  { label: 'View Students Marks IV' },
  { label: 'View Instructed Books IV' },
  { label: 'Healthy Foods Suggestion IV' },
  { label: 'View Punishments to Use IV' },
  { label: 'Student Behaviour Log IV' },
  { label: 'Guardian Communication Log IV' },
  { label: 'Guardian Call FBW Report IV' },
  { label: 'Parent-Teacher Meeting Notes IV' },
  { label: 'Semester Exams TimeTable IV'}, 
  { label: 'Admit Cards IV' },
  { label: 'Knights CDTP Sessions IV' },
  { label: 'Public Speaking Occasion IV' },
  { label: 'Annual Public Competition IV' },
  { label: 'Monthly Fees IV' },
  { label: 'ReAdmission from Class IV -> V' },
];

const drawerItemsV = [
  { label: 'Manage Students V' },
  { label: 'Insert & View Attendance V' },
  { label: 'Leave Requests & Approvals V' },
  { label: 'View Lecture & Homework Syl. V' },
  { label: 'Confirm Weekly HomeWork V' },
  { label: 'View Institution Assignments V' },
  { label: 'Add Weekly Progress Test Marks V' },
  { label: 'Insert Students Marks V' },
  { label: 'View Students Marks V' },
  { label: 'View Instructed Books V' },
  { label: 'Healthy Foods Suggestion V' },
  { label: 'View Punishments to Use V' },
  { label: 'Student Behaviour Log V' },
  { label: 'Guardian Communication Log V' },
  { label: 'Guardian Call FBW Report V' },
  { label: 'Parent-Teacher Meeting Notes V' },
  { label: 'Semester Exams TimeTable V'}, 
  { label: 'Admit Cards V' },
  { label: 'Knights CDTP Sessions V' },
  { label: 'Public Speaking Occasion V' },
  { label: 'Annual Public Competition V' },
  { label: 'Monthly Fees V' },
  { label: 'ReAdmission from Class V -> VI' },
];

const drawerItemsVII = [
  { label: 'Manage Students VII' },
  { label: 'Insert & View Attendance VII' },
  { label: 'Leave Requests & Approvals VII' },
  { label: 'View Lecture & Homework Syl. VII' },
  { label: 'Confirm Weekly HomeWork VII' },
  { label: 'View Institution Assignments VII' },
  { label: 'Add Weekly Progress Test Marks VII' },
  { label: 'Insert Students Marks VII' },
  { label: 'View Students Marks VII' },
  { label: 'View Instructed Books VII' },
  { label: 'Healthy Foods Suggestion VII' },
  { label: 'View Punishments to Use VII' },
  { label: 'Student Behaviour Log VII' },
  { label: 'Guardian Communication Log VII' },
  { label: 'Guardian Call FBW Report VII' },
  { label: 'Parent-Teacher Meeting Notes VII' },
    { label: 'Semester Exams TimeTable VII'}, 
  { label: 'Admit Cards VII' },
  { label: 'Knights CDTP Sessions VII' },
  { label: 'Public Speaking Occasion VII' },
  { label: 'Annual Public Competition VII' },
  { label: 'Monthly Fees VII' },
  { label: 'ReAdmission from Class VII -> VIII' },
];

const drawerItemsVIII = [
  { label: 'Manage Students VIII' },
  { label: 'Insert & View Attendance VIII' },
  { label: 'Leave Requests & Approvals VIII' },
  { label: 'View Lecture & Homework Syl. VIII' },
  { label: 'Confirm Weekly HomeWork VIII' },
  { label: 'View Institution Assignments VIII' },
  { label: 'Add Weekly Progress Test Marks VIII' },
  { label: 'Insert Students Marks VIII' },
  { label: 'View Students Marks VIII' },
  { label: 'View Instructed Books VIII' },
  { label: 'Healthy Foods Suggestion VIII' },
  { label: 'View Punishments to Use VIII' },
  { label: 'Student Behaviour Log VIII' },
  { label: 'Guardian Communication Log VIII' },
  { label: 'Guardian Call FBW Report VIII' },
  { label: 'Parent-Teacher Meeting Notes VIII' },
  { label: 'Semester Exams TimeTable VIII'}, 
  { label: 'Admit Cards VIII' },
  { label: 'Knights CDTP Sessions VIII' },
  { label: 'Public Speaking Occasion VIII' },
  { label: 'Annual Public Competition VIII' },
  { label: 'Monthly Fees VIII' },
  { label: 'ReAdmission from Class VIII -> IX' },
];

const drawerItemsIX = [
  { label: 'Manage Students IX' },
  { label: 'Insert & View Attendance IX' },
  { label: 'Leave Requests & Approvals IX' },
  { label: 'View Lecture & Homework Syl. IX' },
  { label: 'Confirm Weekly HomeWork IX' },
  { label: 'View Institution Assignments IX' },
  { label: 'Add Weekly Progress Test Marks IX' },
  { label: 'Insert Students Marks IX' },
  { label: 'View Students Marks IX' },
  { label: 'View Instructed Books IX' },
  { label: 'Healthy Foods Suggestion IX' },
  { label: 'View Punishments to Use IX' },
  { label: 'Student Behaviour Log IX' },
  { label: 'Guardian Communication Log IX' },
  { label: 'Guardian Call FBW Report IX' },
  { label: 'Parent-Teacher Meeting Notes IX' },
  { label: 'Semester Exams TimeTable IX'}, 
  { label: 'Admit Cards IX' },
  { label: 'Knights CDTP Sessions IX' },
  { label: 'Public Speaking Occasion IX' },
  { label: 'Annual Public Competition IX' },
  { label: 'Monthly Fees IX' },
  { label: 'ReAdmission from Class IX -> X' },
];

const drawerItemsX = [
  { label: 'Manage Students X' },
  { label: 'Insert & View Attendance X' },
  { label: 'Leave Requests & Approvals X' },
  { label: 'View Lecture & Homework Syl. X' },
  { label: 'Confirm Weekly HomeWork X' },
  { label: 'View Institution Assignments X' },
  { label: 'Add Weekly Progress Test Marks X' },
  { label: 'Knights WB Test Preparation Series X'}, 
  { label: 'Insert Students Marks X' },
  { label: 'View Students Marks X' },
  { label: 'View Instructed Books X' },
  { label: 'Healthy Foods Suggestion X' },
  { label: 'View Punishments to Use X' },
  { label: 'Student Behaviour Log X' },
  { label: 'Guardian Communication Log X' },
  { label: 'Guardian Call FBW Report X' },
  { label: 'Parent-Teacher Meeting Notes X' },
  { label: 'Semester Exams TimeTable X'}, 
  { label: 'Admit Cards X' },
  { label: 'Knights CDTP Sessions X' },
  { label: 'Public Speaking Occasion X' },
  { label: 'Annual Public Competition X' },
  { label: 'Monthly Fees X' },
  { label: 'ReAdmission from Class X -> XS' },
];

const drawerItemsXS = [
  { label: 'Manage Students XS' },
  { label: 'Insert & View Attendance XS' },
  { label: 'Leave Requests & Approvals XS' },
  { label: 'View Lecture & Homework Syl. XS' },
  { label: 'Confirm Weekly HomeWork XS' },
  { label: 'View Institution Assignments XS' },
  { label: 'Add Weekly Progress Test Marks XS' },
  { label: 'Insert Students Marks XS' },
  { label: 'View Students Marks XS' },
  { label: 'View Instructed Books XS' },
  { label: 'Healthy Foods Suggestion XS' },
  { label: 'View Punishments to Use XS' },
  { label: 'Student Behaviour Log XS' },
  { label: 'Guardian Communication Log XS' },
  { label: 'Guardian Call FBW Report XS' },
  { label: 'Parent-Teacher Meeting Notes XS' },
  { label: 'Semester Exams TimeTable XS'}, 
  { label: 'Admit Cards XS' },
  { label: 'Knights CDTP Sessions XS' },
  { label: 'Public Speaking Occasion XS' },
  { label: 'Annual Public Competition XS' },
  { label: 'Monthly Fees XS' },
  { label: 'ReAdmission from Class XS -> XI' },
  { label: 'Knights WB Test Preparation Series XS'},
];

const drawerItemsXI = [
  { label: 'Manage Students XI' },
  { label: 'Insert & View Attendance XI' },
  { label: 'Leave Requests & Approvals XI' },
  { label: 'View Lecture & Homework Syl. XI' },
  { label: 'Confirm Weekly HomeWork XI' },
  { label: 'View Institution Assignments XI' },
  { label: 'Add Weekly Progress Test Marks XI' },
  { label: 'Insert Students Marks XI' },
  { label: 'View Students Marks XI' },
  { label: 'View Instructed Books XI' },
  { label: 'Healthy Foods Suggestion XI' },
  { label: 'View Punishments to Use XI' },
  { label: 'Student Behaviour Log XI' },
  { label: 'Guardian Communication Log XI' },
  { label: 'Guardian Call FBW Report XI' },
  { label: 'Parent-Teacher Meeting Notes XI' },
  { label: 'Semester Exams TimeTable XI'}, 
  { label: 'Admit Cards XI' },
  { label: 'Knights CDTP Sessions XI' },
  { label: 'Public Speaking Occasion XI' },
  { label: 'Annual Public Competition XI' },
  { label: 'Monthly Fees XI' },
  { label: 'ReAdmission from Class XI -> XII' },
];

const drawerItemsXII = [
  { label: 'Manage Students XII' },
  { label: 'Insert & View Attendance XII' },
  { label: 'Leave Requests & Approvals XII' },
  { label: 'View Lecture & Homework Syl. XII' },
  { label: 'Confirm Weekly HomeWork XII' },
  { label: 'View Institution Assignments XII' },
  { label: 'Add Weekly Progress Test Marks XII' },
  { label: 'Insert Students Marks XII' },
  { label: 'View Students Marks XII' },
  { label: 'View Instructed Books XII' },
  { label: 'Healthy Foods Suggestion XII' },
  { label: 'View Punishments to Use XII' },
  { label: 'Student Behaviour Log XII' },
  { label: 'Guardian Communication Log XII' },
  { label: 'Guardian Call FBW Report XII' },
  { label: 'Parent-Teacher Meeting Notes XII' },
  { label: 'Semester Exams TimeTable XII'}, 
  { label: 'Admit Cards XII' },
  { label: 'Knights CDTP Sessions XII' },
  { label: 'Public Speaking Occasion XII' },
  { label: 'Annual Public Competition XII' },
  { label: 'Monthly Fees XII' },
  { label: 'ReAdmission from Class XII -> XIIS' },
];

const drawerItemsXIIS = [
  { label: 'Manage Students XIIS' },
  { label: 'Insert & View Attendance XIIS' },
  { label: 'Leave Requests & Approvals XIIS' },
  { label: 'View Lecture & Homework Syl. XIIS' },
  { label: 'Confirm Weekly HomeWork XIIS' },
  { label: 'View Institution Assignments XIIS' },
  { label: 'Add Weekly Progress Test Marks XIIS' },
  { label: 'Insert Students Marks XIIS' },
  { label: 'View Students Marks XIIS' },
  { label: 'View Instructed Books XIIS' },
  { label: 'Healthy Foods Suggestion XIIS' },
  { label: 'View Punishments to Use XIIS' },
  { label: 'Student Behaviour Log XIIS' },
  { label: 'Guardian Communication Log XIIS' },
  { label: 'Guardian Call FBW Report XIIS' },
  { label: 'Parent-Teacher Meeting Notes XIIS' },
  { label: 'Semester Exams TimeTable XIIS'}, 
  { label: 'Admit Cards XIIS' },
  { label: 'Knights CDTP Sessions XIIS' },
  { label: 'Public Speaking Occasion XIIS' },
  { label: 'Annual Public Competition XIIS' },
  { label: 'Monthly Fees XIIS' },
  { label: 'ReAdmission from Class XIIS -> XIIIJ' },
];

const drawerItemsXIIIJ = [
  { label: 'Manage Students XIIIJ' },
  { label: 'Insert & View Attendance XIIIJ' },
  { label: 'Leave Requests & Approvals XIIIJ' },
  { label: 'View Lecture & Homework Syl. XIIIJ' },
  { label: 'Confirm Weekly HomeWork XIIIJ' },
  { label: 'View Institution Assignments XIIIJ' },
  { label: 'Add Weekly Progress Test Marks XIIIJ' },
  { label: 'Insert Students Marks XIIIJ' },
  { label: 'View Students Marks XIIIJ' },
  { label: 'View Instructed Books XIIIJ' },
  { label: 'Healthy Foods Suggestion XIIIJ' },
  { label: 'View Punishments to Use XIIIJ' },
  { label: 'Student Behaviour Log XIIIJ' },
  { label: 'Guardian Communication Log XIIIJ' },
  { label: 'Guardian Call FBW Report XIIIJ' },
  { label: 'Parent-Teacher Meeting Notes XIIIJ' },
  { label: 'Semester Exams TimeTable XIIIJ'}, 
  { label: 'Admit Cards XIIIJ' },
  { label: 'Knights CDTP Sessions XIIIJ' },
  { label: 'Public Speaking Occasion XIIIJ' },
  { label: 'Annual Public Competition XIIIJ' },
  { label: 'Monthly Fees XIIIJ' },
  { label: 'ReAdmission from Class XIIIJ -> Next' },
];

const examControlPanel=[
  { label: 'Print Exam Seating Management'}, 
  { label: 'Prayer & Oaths Selecteds'}, 
  { label: 'Schduled Exam Dates & Times'}, 
  { label: 'View Punishments to Use'}
]

// Central Administration owns governance, configuration, finance, admissions,
// operations, and cross-branch oversight. Daily class work belongs in the
// Faculty panel, where class and subject scope is applied.
const administrationGovernance = [
  { label: 'Access Control' },
  { label: 'Add Institution Profile' },
  { label: 'Add Institution Branches' },
  { label: 'Add Institution Classes' },
  { label: 'Add Institution Subjects' },
  { label: 'Map Class to Subjects' },
  { label: 'Assign Class Teachers' },
  { label: 'Assign Subject Teachers' },
  { label: 'Add Class Rooms' },
  { label: 'Manage Holiday Calendar' },
  { label: 'Student Holiday Calendar' },
];

const administrationPeople = [
  { label: 'Add School Teachers' },
  { label: 'Employee List' },
  { label: 'Employee Documents' },
  { label: 'Employee Manage List' },
  { label: 'Faculties List' },
  { label: 'Insert Faculty Entrance' },
  { label: 'Insert Faculty Exit' },
  { label: 'Faculty Attendance' },
  { label: 'View Faculty Attendance & Salary' },
  { label: 'Faculty Monthly Salary' },
  { label: 'Faculty Payment Panel' },
];

const administrationAcademics = [
  { label: 'Semester Exams Panel' },
  { label: 'Print Exam Seating Management' },
  { label: 'Prayer & Oaths Selecteds' },
];

const administrationFinance = [
  { label: '🧾 View Fee Schemes' },
];

const administrationTransport = [
  { label: 'Fleets' },
  { label: 'Depots' },
  { label: 'Vehicle Documents' },
  { label: 'Vehicle Maintenance Logs' },
];

const administrationOperations = [
  { label: 'Service Requests & Approvals' },
  { label: 'Complaints & Resolutions' },
];

const administrationCommunications = [
  { label: 'Explore Notifications' },
];

const administrationPublicPresence = [
  { label: 'Modify Feature Galaxies' },
  { label: 'Modify Site Navbar' },
  { label: 'Modify Site Carousel' },
  { label: 'Modify Achievements Carousel' },
  { label: 'Explore Enquaries' },
  { label: 'Modify Feature Technologies' },
  { label: 'Modify School in Cities' },
  { label: 'Modify Feature Students' },
  { label: 'Modify Feature YT Videos' },
  { label: 'Modify Featured Programs' },
  { label: 'Modify WikiGalaxy Articles' },
  { label: 'Upload & View Images' },
];

const administrationPersonal = [
  { label: 'My Attendance' },
  { label: 'My Received Salary History' },
  { label: 'My Current Month Salary' },
];

const roleAwareAdministrationGroups = [
  { title: 'Governance, Access & School Structure', items: administrationGovernance },
  { title: 'People, Faculty & Payroll', items: administrationPeople },
  { title: 'Academic & Examination Governance', items: administrationAcademics },
  { title: 'Admissions', items: admissionTestDepartment },
  { title: 'Fees & Finance', items: administrationFinance },
  { title: 'Operations & Approvals', items: administrationOperations },
  { title: 'Transport Operations', items: administrationTransport },
  { title: 'Central Communications', items: administrationCommunications },
  { title: 'Public Presence & Admissions Strategy', items: administrationPublicPresence },
  { title: 'My Work', items: administrationPersonal },
];

// TEMPORARY full-administration menu. System Admin, CEO, COO, and CFO see the
// complete existing Administration drawer while the panel is being consolidated.
// Remove this override and continue with role-specific groups when the system is
// large enough to require strict menu-level separation for COO and CFO.
const sectionGroupsForCEO = [
  { title: "Admin Employee Panel", items: adminPanelPages },
  { title: "System Units Panel", items: systemUnitsPages}, 
  { title: 'Website Control Panel', items: siteLandingPageControlPanel}, 
  { title: 'Faculties Control Panel', items: schoolFaculties}, 
  { title: "Notice Board & Circulars", items: noticeBoardCirculars}, 
  { title: 'Event & Program Registration', items: eventAndProgramRegistration},
  { title: 'School Marketing Panel', items: schoolMarketing}, 
  { title: 'Payment Panel', items: paymentManagementPages}, 
  { title: "Images Management Panel", items: Images}, 
  { title: "My Attendance & Salary", items: myBasicPages},
  { title: "Transport Managment Panel", items: fleetsManagement}, 
  { title: "Faculties Trianing", items: facultiesTraining},
  { title: 'Admission Test Department', items: admissionTestDepartment}, 
  { title: 'Semester Exam Control Panel', items: examControlPanel}, 
  { title: 'Class LKG', items: drawerItemsLKG},
  { title: 'Class UKG', items: drawerItemsUKG},
  { title: 'Class I', items: drawerItemsI},
  { title: 'Class II', items: drawerItemsII},
  { title: 'Class III', items: drawerItemsIII},
  { title: 'Class IV', items: drawerItemsIV},
  { title: 'Class V', items: drawerItemsV},
  { title: 'Class VI', items: drawerItemsVI},
  { title: 'Class VII', items: drawerItemsVII},
  { title: 'Class VIII', items: drawerItemsVIII},
  { title: 'Class IX', items: drawerItemsIX},
  { title: 'Class X', items: drawerItemsX},
  { title: 'Class XS', items: drawerItemsXS},
  { title: 'Class XI', items: drawerItemsXI}, 
  { title: 'Class XII', items: drawerItemsXII}, 
  { title: 'Class XIIS', items: drawerItemsXIIS}, 
  { title: 'Class Joint Leader', items: drawerItemsXIIIJ}, 
];

// The complete, proven legacy library remains useful while the central panel
// is being consolidated. It is intentionally exposed only to the two
// owner-authorised executive accounts below, and only through the existing
// non-production temporary-navigation flag.
const executiveLegacyGroups = [
  { title: "Staff & Workforce", items: adminPanelPages },
  { title: "System Operations", items: systemUnitsPages },
  { title: "Website Control", items: siteLandingPageControlPanel },
  { title: "Faculty Operations", items: schoolFaculties },
  { title: "Notices & Circulars", items: noticeBoardCirculars },
  { title: "Events & Programmes", items: eventAndProgramRegistration },
  { title: "School Marketing", items: schoolMarketing },
  { title: "Payments", items: paymentManagementPages },
  { title: "Media Management", items: Images },
  { title: "My Attendance & Salary", items: myBasicPages },
  { title: "Transport Management", items: fleetsManagement },
  { title: "Faculty Training", items: facultiesTraining },
  { title: "Admission Test Department", items: admissionTestDepartment },
  { title: "Semester Exam Control", items: examControlPanel },
  { title: "Class LKG", items: drawerItemsLKG },
  { title: "Class UKG", items: drawerItemsUKG },
  { title: "Class I", items: drawerItemsI },
  { title: "Class II", items: drawerItemsII },
  { title: "Class III", items: drawerItemsIII },
  { title: "Class IV", items: drawerItemsIV },
  { title: "Class V", items: drawerItemsV },
  { title: "Class VI", items: drawerItemsVI },
  { title: "Class VII", items: drawerItemsVII },
  { title: "Class VIII", items: drawerItemsVIII },
  { title: "Class IX", items: drawerItemsIX },
  { title: "Class X", items: drawerItemsX },
  { title: "Class XS", items: drawerItemsXS },
  { title: "Class XI", items: drawerItemsXI },
  { title: "Class XII", items: drawerItemsXII },
  { title: "Class XIIS", items: drawerItemsXIIS },
  { title: "Class Joint Leadership", items: drawerItemsXIIIJ },
];

function addOnlyNewNavigationItems(baseGroups, extraGroups) {
  const knownLabels = new Set(baseGroups.flatMap((group) => group.items.map((item) => item.label)));
  const additions = extraGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => !knownLabels.has(item.label)) }))
    .filter((group) => group.items.length > 0);
  return [...baseGroups, ...additions];
}

// Menu visibility mirrors the server's final-authority rule. The temporary
// COO broad-navigation flag must never imply CEO/CTO evidence authority.
function hideEvidenceReviewFromNonFinalAdministrators(groups, roleCodes) {
  const canReviewEvidence = Array.isArray(roleCodes)
    && roleCodes.some((roleCode) => ["CEO", "CTO"].includes(String(roleCode).toUpperCase()));
  if (canReviewEvidence) return groups;
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.label !== "School Evidence Review") }))
    .filter((group) => group.items.length > 0);
}


const renderSectionsForRawMaterialsRole = (role) => {
const sections = [];
  if (
    role === "CEO" ||
    role === "CHIEF EXECUTIVE OFFICER" ||
    role === "ADMIN" ||
    role === "GROUP_CEO" ||
    role === "FINANCE MANAGEMENT OFFICER"
  ) {
    return sectionGroupsForCEO; // 🚨 Return grouped format
  } else {
    return [];
  }
 return [{ title: "Knights International Panel", items: sections }]; // 📦 Wrap in a group for consistent rendering
};
  const [openGroups, setOpenGroups] = useState({});
  // TODO: Remove this development-only migration aid after central roles are
  // narrowed. Its value comes from the server and is hard-disabled in production.
  const hasExpandedExecutiveAccess = temporaryFullAdministrationNavigation
    && Array.isArray(roleCodes)
    && roleCodes.some((roleCode) => ["CEO", "COO"].includes(String(roleCode).toUpperCase()));
  const visibleGroupsBeforeEvidenceRoleFilter = !Array.isArray(permissions)
    ? []
    : (hasExpandedExecutiveAccess
      ? addOnlyNewNavigationItems(centralAdministrationGroups, executiveLegacyGroups)
      : (temporaryFullAdministrationNavigation
        ? centralAdministrationGroups
        : filterPanelGroups(centralAdministrationGroups, permissions)));
  const visibleGroups = hideEvidenceReviewFromNonFinalAdministrators(
    visibleGroupsBeforeEvidenceRoleFilter,
    roleCodes,
  );

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
