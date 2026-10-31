
"use client";
import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import Collapse from "@mui/material/Collapse";
import Image from "next/image";
import TDILIcon from "@/components/sure-success-point-school/brand/SureSuccessPointSchoolBrandIcon";
import { filterPanelGroups } from "@/src/lib/rbac/panelNavigation";

/**
 * Institution-level authority mapping (Sure Success Point School)
 * ----------------------------------------------------------------
 * SYSTEM_ADMIN  → Full merge of every panel (oversight)
 * PRINCIPAL     → LEADERSHIP  → All school operations EXCLUDING pure finance
 * COEF          → FINANCE     → All finance, fee verification, exam conduct & Examination
 * GCI           → GCI         → Guardian communication, fee-check, attendance calls,
 *                               payments they have taken/processed (pending COEF)
 * CLASS_TEACHER / SUBJECT_TEACHER → TEACHER
 * DRIVER / SECURITY / GATEMAN / other employees → STAFF
 *   (own attendance + salary + fee visibility; Drivers also get transport ops)
 *
 * GCI/HOD records guardian collections → COEF verifies custody and records the
 * school-bank submission. Central Administration settlement is Phase 2.
 * One shared Payments Proceeded register keeps GCI and COEF in sync.
 */

function resolvePanelRole(jobRole, authorization) {
  const roles = new Set((authorization?.roles ?? []).map((role) => role.code));

  if (roles.has("SYSTEM_ADMIN")) return "SYSTEM_ADMIN";
  if (roles.has("PRINCIPAL")) return "LEADERSHIP";
  if (roles.has("COEF")) return "FINANCE";
  if (roles.has("GCI")) return "GCI";
  if (roles.has("HOD") || roles.has("HEAD_OF_DEPARTMENTS")) return "GCI";

  if (roles.has("CLASS_TEACHER") || roles.has("SUBJECT_TEACHER")) {
    return "TEACHER";
  }

  // Explicit non-teaching employee roles
  const staffRoles = [
    "DRIVER",
    "SECURITY",
    "GATEMAN",
    "GATE_MAN",
    "PEON",
    "CLERK",
    "OFFICE_STAFF",
    "SUPPORT_STAFF",
    "EMPLOYEE",
    "STAFF",
  ];
  if (staffRoles.some((r) => roles.has(r))) {
    return "STAFF";
  }

  // Also respect jobRole string when authorization roles are missing/legacy
  const jr = (jobRole || "").toString().toUpperCase();
  if (
    jr.includes("DRIVER") ||
    jr.includes("SECURITY") ||
    jr.includes("GATE") ||
    jr.includes("PEON") ||
    jr.includes("CLERK") ||
    jr.includes("STAFF") ||
    jr.includes("EMPLOYEE")
  ) {
    return "STAFF";
  }

  // Remaining legacy / unknown → STAFF (attendance + fee + salary only)
  return "STAFF";
}

function DrawerComponent({
  mobileOpen,
  handleDrawerToggle,
  appBarHeight,
  activeSection,
  handleDrawerItemClick,
  drawerWidth,
  jobRole,
  authorization,
}) {
  const getDrawerItemStyles = (activeSection, itemLabel, theme) => ({
    backgroundColor:
      activeSection === itemLabel ? theme.palette.primary.main : "transparent",
    color: activeSection === itemLabel ? "#fff" : "#bdbdbd",
    "&:hover": {
      backgroundColor: "#4a148c",
    },
  });

  // ---------------------------------------------------------------------------
  // Shared / reusable item arrays (no value lost)
  // ---------------------------------------------------------------------------

  const teachersPanel = [
    { label: "Insert & View Attendance" },
    { label: "Leave Requests & Approvals" },
    { label: "View Lecture & Homework Syllabus" },
    { label: "Update Daily Homework Status" },
    { label: "View Institution Assignments" },
    { label: "Add Weekly Progress Test Marks" },
    { label: "Knights Wb Test Preparation Series" },
    { label: "Insert Students Examination Marks" },
    { label: "View Instructed Books" },
    { label: "View Punishment to Use" },
    { label: "Student Behaviour Logs" },
    { label: "View Students Marks" },
    { label: "📝 Check Examination Results" },
    { label: "🙏 My School Oath & Prayer" },
  ];

  const checkResultsOnline = [
    { label: "📝 Check Examination Results" },
    { label: "🙏 My School Oath & Prayer" },
    { label: "Institution Holiday Calendar" },
  ];

  const myBasicPages = [
    { label: "My Attendance" },
    { label: "My Current Month Salary" },
    { label: "My Received Salary History" },
  ];

  const teachersPanelAttendance = [
    { label: "Insert & View Attendance" },
    { label: "Leave Requests & Approvals" },
    { label: "Update Daily Homework Status" },
  ];

  const teachersPanelStudyMaterials = [
    { label: "View Lecture & Homework Syllabus" },
    { label: "View Institution Assignments" },
    { label: "Add Weekly Progress Test Marks" },
    { label: "Knights Wb Test Preparation Series" },
    { label: "Insert Students Examination Marks" },
    { label: "View Students Marks" },
    { label: "View Instructed Books" },
    { label: "📝 Check Examination Results" },
    { label: "🙏 My School Oath & Prayer" },
    { label: "🧾 View Fee Schemes" },
  ];

  const teachersStudentBehaviour = [
    { label: "View Punishment to Use" },
    { label: "Student Behaviour Logs" },
    { label: "🙏 My School Oath & Prayer" },
  ];

  const schoolFaculties = [
    { label: "Faculties List" },
    { label: "Insert Faculty Entrance" },
    { label: "Insert Faculty Exit" },
    { label: "Faculty Attendance" },
    { label: "View Faculty Attendance & Salary" },
    { label: "Faculty Monthly Salary" },
    { label: "Faculty Payment Panel" },
  ];

  // A deliberately narrow shared panel for contingency coverage. GCI and COEF
  // may record faculty movement/attendance when the assigned operator is away,
  // but payroll and the wider faculty-management tools stay restricted.
  const facultyAttendanceControlItems = schoolFaculties.filter((item) => (
    ["Insert Faculty Entrance", "Insert Faculty Exit", "Faculty Attendance"].includes(item.label)
  ));

  const adminPanelPages = [
    { label: "Employee List" },
    { label: "Employee Manage List" },
    // Faculty movement and attendance are deliberately kept only in
    // Faculties Control Panel, so leadership does not see duplicate tiles.
    { label: "View Institution Classes" },
    { label: "Preview Class to Subjects" },
    { label: "🧾 View Fee Schemes" },
  ];

  const fleetsManagement = [
    { label: "Fleets" },
    { label: "Depots" },
    { label: "Vehicle Documents" },
    { label: "Vehicle Maintenance Logs" },
    { label: "All Bus Tracking" },
    { label: "Bus Tracking No.Wise" },
  ];

  const operationalApprovals = [
    { label: "Service Requests & Approvals" },
    { label: "Complaints & Resolutions" },
  ];

  const transportOperations = [
    { label: "Fleets" },
    { label: "Depots" },
    { label: "Vehicle Documents" },
    { label: "Vehicle Maintenance Logs" },
  ];

  const admissionTestDepartment = [
    { label: "🧾 View Fee Schemes" },
    { label: "🧾 Admission Test Applications" },
    { label: "📝 Fill Admission Form" },
    { label: "📥 Download Admit Card" },
    { label: "📚 Admission Test Schedule" },
    { label: "📚 Print Application & Room No" },
    { label: "🧠 Syllabus & Subject Info" },
    { label: "🧪 Test Evaluation & Mark Entry" },
    { label: "📊 View Result & Rank List" },
    { label: "📋 KSAT Qualifieds Registration" },
    { label: "📋 General Direct Registration" },
    { label: "📄 Form ID & Fee Receipt" },
    { label: "✅ Total Admitted Students" },
  ];

  // ---- Class operational drawers (Principal / HOD) ----
  const drawerItemsLKG = [
    { label: "Insert & View Attendance LKG" },
    { label: "Leave Requests & Approvals LKG" },
    { label: "View Lecture & Homework Syl. LKG" },
    { label: "Update Daily Homework Status LKG" },
    { label: "View Institution Assignments LKG" },
    { label: "Add Weekly Progress Test Marks LKG" },
    { label: "Insert Students Marks LKG" },
    { label: "View Students Marks LKG" },
    { label: "View Instructed Books LKG" },
    { label: "View Punishments to Use LKG" },
    { label: "Student Behaviour Log LKG" },
    { label: "Guardian Communication Log LKG" },
    { label: "Parent-Teacher Meeting Notes LKG" },
    { label: "Examination Exams TimeTable LKG" },
    { label: "Exam Seating Cheats LKG" },
  ];

  const drawerItemsUKG = [
    { label: "Insert & View Attendance UKG" },
    { label: "Leave Requests & Approvals UKG" },
    { label: "View Lecture & Homework Syl. UKG" },
    { label: "Update Daily Homework Status UKG" },
    { label: "View Institution Assignments UKG" },
    { label: "Add Weekly Progress Test Marks UKG" },
    { label: "Insert Students Marks UKG" },
    { label: "View Students Marks UKG" },
    { label: "View Instructed Books UKG" },
    { label: "View Punishments to Use UKG" },
    { label: "Student Behaviour Log UKG" },
    { label: "Guardian Communication Log UKG" },
    { label: "Parent-Teacher Meeting Notes UKG" },
    { label: "Examination Exams TimeTable UKG" },
    { label: "Exam Seating Cheats UKG" },
  ];

  const drawerItemsI = [
    { label: "Insert & View Attendance I" },
    { label: "Leave Requests & Approvals I" },
    { label: "View Lecture & Homework Syl. I" },
    { label: "Update Daily Homework Status I" },
    { label: "View Institution Assignments I" },
    { label: "Add Weekly Progress Test Marks I" },
    { label: "Insert Students Marks I" },
    { label: "View Students Marks I" },
    { label: "View Instructed Books I" },
    { label: "View Punishments to Use I" },
    { label: "Student Behaviour Log I" },
    { label: "Guardian Communication Log I" },
    { label: "Parent-Teacher Meeting Notes I" },
    { label: "Examination Exams TimeTable I" },
    { label: "Exam Seating Cheats I" },
  ];

  const drawerItemsII = [
    { label: "Insert & View Attendance II" },
    { label: "Leave Requests & Approvals II" },
    { label: "View Lecture & Homework Syl. II" },
    { label: "Update Daily Homework Status II" },
    { label: "View Institution Assignments II" },
    { label: "Add Weekly Progress Test Marks II" },
    { label: "Insert Students Marks II" },
    { label: "View Students Marks II" },
    { label: "View Instructed Books II" },
    { label: "View Punishments to Use II" },
    { label: "Student Behaviour Log II" },
    { label: "Guardian Communication Log II" },
    { label: "Parent-Teacher Meeting Notes II" },
    { label: "Examination Exams TimeTable II" },
    { label: "Exam Seating Cheats II" },
  ];

  const drawerItemsIII = [
    { label: "Insert & View Attendance III" },
    { label: "Leave Requests & Approvals III" },
    { label: "View Lecture & Homework Syl. III" },
    { label: "Update Daily Homework Status III" },
    { label: "View Institution Assignments III" },
    { label: "Add Weekly Progress Test Marks III" },
    { label: "Insert Students Marks III" },
    { label: "View Students Marks III" },
    { label: "View Instructed Books III" },
    { label: "View Punishments to Use III" },
    { label: "Student Behaviour Log III" },
    { label: "Guardian Communication Log III" },
    { label: "Parent-Teacher Meeting Notes III" },
    { label: "Examination Exams TimeTable III" },
    { label: "Exam Seating Cheats III" },
  ];

  const drawerItemsIV = [
    { label: "Insert & View Attendance IV" },
    { label: "Leave Requests & Approvals IV" },
    { label: "View Lecture & Homework Syl. IV" },
    { label: "Update Daily Homework Status IV" },
    { label: "View Institution Assignments IV" },
    { label: "Add Weekly Progress Test Marks IV" },
    { label: "Insert Students Marks IV" },
    { label: "View Students Marks IV" },
    { label: "View Instructed Books IV" },
    { label: "View Punishments to Use IV" },
    { label: "Student Behaviour Log IV" },
    { label: "Guardian Communication Log IV" },
    { label: "Parent-Teacher Meeting Notes IV" },
    { label: "Examination Exams TimeTable IV" },
    { label: "Exam Seating Cheats IV" },
  ];

  const drawerItemsV = [
    { label: "Insert & View Attendance V" },
    { label: "Leave Requests & Approvals V" },
    { label: "View Lecture & Homework Syl. V" },
    { label: "Update Daily Homework Status V" },
    { label: "View Institution Assignments V" },
    { label: "Add Weekly Progress Test Marks V" },
    { label: "Insert Students Marks V" },
    { label: "View Students Marks V" },
    { label: "View Instructed Books V" },
    { label: "View Punishments to Use V" },
    { label: "Student Behaviour Log V" },
    { label: "Guardian Communication Log V" },
    { label: "Parent-Teacher Meeting Notes V" },
    { label: "Examination Exams TimeTable V" },
    { label: "Exam Seating Cheats V" },
  ];

  const drawerItemsVI = [
    { label: "Insert & View Attendance VI" },
    { label: "Leave Requests & Approvals VI" },
    { label: "View Lecture & Homework Syl. VI" },
    { label: "Update Daily Homework Status VI" },
    { label: "View Institution Assignments VI" },
    { label: "Add Weekly Progress Test Marks VI" },
    { label: "Insert Students Marks VI" },
    { label: "View Students Marks VI" },
    { label: "View Instructed Books VI" },
    { label: "View Punishments to Use VI" },
    { label: "Student Behaviour Log VI" },
    { label: "Guardian Communication Log VI" },
    { label: "Parent-Teacher Meeting Notes VI" },
    { label: "Examination Exams TimeTable VI" },
    { label: "Exam Seating Cheats VI" },
  ];

  const drawerItemsVII = [
    { label: "Insert & View Attendance VII" },
    { label: "Leave Requests & Approvals VII" },
    { label: "View Lecture & Homework Syl. VII" },
    { label: "Update Daily Homework Status VII" },
    { label: "View Institution Assignments VII" },
    { label: "Add Weekly Progress Test Marks VII" },
    { label: "Insert Students Marks VII" },
    { label: "View Students Marks VII" },
    { label: "View Instructed Books VII" },
    { label: "View Punishments to Use VII" },
    { label: "Student Behaviour Log VII" },
    { label: "Guardian Communication Log VII" },
    { label: "Parent-Teacher Meeting Notes VII" },
    { label: "Examination Exams TimeTable VII" },
    { label: "Exam Seating Cheats VII" },
  ];

  const drawerItemsVIII = [
    { label: "Insert & View Attendance VIII" },
    { label: "Leave Requests & Approvals VIII" },
    { label: "View Lecture & Homework Syl. VIII" },
    { label: "Update Daily Homework Status VIII" },
    { label: "View Institution Assignments VIII" },
    { label: "Add Weekly Progress Test Marks VIII" },
    { label: "Insert Students Marks VIII" },
    { label: "View Students Marks VIII" },
    { label: "View Instructed Books VIII" },
    { label: "View Punishments to Use VIII" },
    { label: "Student Behaviour Log VIII" },
    { label: "Guardian Communication Log VIII" },
    { label: "Parent-Teacher Meeting Notes VIII" },
    { label: "Examination Exams TimeTable VIII" },
    { label: "Exam Seating Cheats VIII" },
  ];

  const drawerItemsIX = [
    { label: "Insert & View Attendance IX" },
    { label: "Leave Requests & Approvals IX" },
    { label: "View Lecture & Homework Syl. IX" },
    { label: "Update Daily Homework Status IX" },
    { label: "View Institution Assignments IX" },
    { label: "Add Weekly Progress Test Marks IX" },
    { label: "Insert Students Marks IX" },
    { label: "View Students Marks IX" },
    { label: "View Instructed Books IX" },
    { label: "View Punishments to Use IX" },
    { label: "Student Behaviour Log IX" },
    { label: "Guardian Communication Log IX" },
    { label: "Parent-Teacher Meeting Notes IX" },
    { label: "Examination Exams TimeTable IX" },
    { label: "Exam Seating Cheats IX" },
  ];

  const drawerItemsX = [
    { label: "Insert & View Attendance X" },
    { label: "Leave Requests & Approvals X" },
    { label: "View Lecture & Homework Syl. X" },
    { label: "Update Daily Homework Status X" },
    { label: "View Institution Assignments X" },
    { label: "Add Weekly Progress Test Marks X" },
    { label: "Knights WB Test Preparation Series X" },
    { label: "Insert Students Marks X" },
    { label: "View Students Marks X" },
    { label: "View Instructed Books X" },
    { label: "View Punishments to Use X" },
    { label: "Student Behaviour Log X" },
    { label: "Guardian Communication Log X" },
    { label: "Parent-Teacher Meeting Notes X" },
    { label: "Examination Exams TimeTable X" },
    { label: "Exam Seating Cheats X" },
  ];

  const drawerItemsXS = [
    { label: "Insert & View Attendance XS" },
    { label: "Leave Requests & Approvals XS" },
    { label: "View Lecture & Homework Syl. XS" },
    { label: "Update Daily Homework Status XS" },
    { label: "View Institution Assignments XS" },
    { label: "Add Weekly Progress Test Marks XS" },
    { label: "Knights WB Test Preparation Series XS" },
    { label: "Insert Students Marks XS" },
    { label: "View Students Marks XS" },
    { label: "View Instructed Books XS" },
    { label: "View Punishments to Use XS" },
    { label: "Student Behaviour Log XS" },
    { label: "Guardian Communication Log XS" },
    { label: "Parent-Teacher Meeting Notes XS" },
    { label: "Examination Exams TimeTable XS" },
    { label: "Exam Seating Cheats XS" },
  ];

  const drawerItemsXI = [
    { label: "Insert & View Attendance Class XI" },
    { label: "Leave Requests & Approvals Class XI" },
    { label: "View Lecture & Homework Syl. Class XI" },
    { label: "Update Daily Homework Status XI" },
    { label: "View Institution Assignments Class XI" },
    { label: "Add Weekly Progress Test Marks Class XI" },
    { label: "Insert Students Marks Class XI" },
    { label: "View Students Marks Class XI" },
    { label: "View Instructed Books Class XI" },
    { label: "View Punishments to Use Class XI" },
    { label: "Student Behaviour Log Class XI" },
  ];

  const drawerItemsXII = [
    { label: "Insert & View Attendance Class XII" },
    { label: "Leave Requests & Approvals Class XII" },
    { label: "View Lecture & Homework Syl. Class XII" },
    { label: "Update Daily Homework Status XII" },
    { label: "View Institution Assignments Class XII" },
    { label: "Add Weekly Progress Test Marks Class XII" },
    { label: "Insert Students Marks Class XII" },
    { label: "View Students Marks Class XII" },
    { label: "View Instructed Books XII" },
    { label: "View Punishments to Use XII" },
    { label: "Student Behaviour Log XII" },
    { label: "Guardian Communication Log XII" },
    { label: "Parent-Teacher Meeting Notes XII" },
    { label: "Examination Exams TimeTable XII" },
    { label: "Exam Seating Cheats XII" },
  ];

  const drawerItemsXIIS = [
    { label: "Insert & View Attendance XIIS" },
    { label: "Leave Requests & Approvals XIIS" },
    { label: "View Lecture & Homework Syl. XIIS" },
    { label: "Update Daily Homework Status XIIS" },
    { label: "View Institution Assignments XIIS" },
    { label: "Add Weekly Progress Test Marks XIIS" },
    { label: "Insert Students Marks XIIS" },
    { label: "View Students Marks XIIS" },
    { label: "View Instructed Books XIIS" },
    { label: "View Punishments to Use XIIS" },
    { label: "Student Behaviour Log XIIS" },
    { label: "Guardian Communication Log XIIS" },
    { label: "Parent-Teacher Meeting Notes XIIS" },
    { label: "Examination Exams TimeTable XIIS" },
    { label: "Exam Seating Cheats XIIS" },
  ];

  const drawerItemsXIIIJ = [
    { label: "Insert & View Attendance XIIIJ" },
    { label: "Leave Requests & Approvals XIIIJ" },
    { label: "View Lecture & Homework Syl. XIIIJ" },
    { label: "Update Daily Homework Status XIIIJ" },
    { label: "View Institution Assignments XIIIJ" },
    { label: "Add Weekly Progress Test Marks XIIIJ" },
    { label: "Insert Students Marks XIIIJ" },
    { label: "View Students Marks XIIIJ" },
    { label: "View Instructed Books XIIIJ" },
    { label: "View Punishments to Use XIIIJ" },
    { label: "Student Behaviour Log XIIIJ" },
    { label: "Guardian Communication Log XIIIJ" },
    { label: "Parent-Teacher Meeting Notes XIIIJ" },
    { label: "Examination Exams TimeTable XIIIJ" },
    { label: "Exam Seating Cheats XIIIJ" },
  ];

  const examControlPanel = [
    { label: "Print Exam Seating Management" },
    { label: "Schduled Exam Dates & Times" },
    { label: "View Punishments to Use" },
    { label: "🙏 My School Oath & Prayer" },
  ];

  // ---- Wellbeing & Fees/GC (GCI primary, COEF also sees for oversight) ----
  const behavioralAndHealthLKG = [
    { label: "Preview Students LKG" },
    { label: "Preview Daily Homework Status LKG" },
    { label: "Preview Assignments LKG" },
    { label: "Preview Progress Test Marks LKG" },
    { label: "Healthy Foods Suggestion LKG" },
    { label: "Yoga & WorkOuts Suggestion LKG" },
    { label: "Recommended LifeStyles LKG" },
    { label: "Student Behaviour Log LKG" },
  ];
  const behavioralAndHealthUKG = [
    { label: "Preview Students UKG" },
    { label: "Preview Daily Homework Status UKG" },
    { label: "Preview Assignments UKG" },
    { label: "Preview Progress Test Marks UKG" },
    { label: "Healthy Foods Suggestion UKG" },
    { label: "Yoga & WorkOuts Suggestion UKG" },
    { label: "Recommended LifeStyles UKG" },
    { label: "Student Behaviour Log UKG" },
  ];
  const behavioralAndHealthI = [
    { label: "Preview Students I" },
    { label: "Preview Daily Homework Status I" },
    { label: "Preview Assignments I" },
    { label: "Preview Progress Test Marks I" },
    { label: "Healthy Foods Suggestion I" },
    { label: "Yoga & WorkOuts Suggestion I" },
    { label: "Recommended LifeStyles I" },
    { label: "Student Behaviour Log I" },
  ];
  const behavioralAndHealthII = [
    { label: "Preview Students II" },
    { label: "Preview Daily Homework Status II" },
    { label: "Preview Assignments II" },
    { label: "Preview Progress Test Marks II" },
    { label: "Healthy Foods Suggestion II" },
    { label: "Yoga & WorkOuts Suggestion II" },
    { label: "Recommended LifeStyles II" },
    { label: "Student Behaviour Log II" },
  ];
  const behavioralAndHealthIII = [
    { label: "Preview Students III" },
    { label: "Preview Daily Homework Status III" },
    { label: "Preview Assignments III" },
    { label: "Preview Progress Test Marks III" },
    { label: "Healthy Foods Suggestion III" },
    { label: "Yoga & WorkOuts Suggestion III" },
    { label: "Recommended LifeStyles III" },
    { label: "Student Behaviour Log III" },
  ];
  const behavioralAndHealthIV = [
    { label: "Preview Students IV" },
    { label: "Preview Daily Homework Status IV" },
    { label: "Preview Assignments IV" },
    { label: "Preview Progress Test Marks IV" },
    { label: "Healthy Foods Suggestion IV" },
    { label: "Yoga & WorkOuts Suggestion IV" },
    { label: "Recommended LifeStyles IV" },
    { label: "Student Behaviour Log IV" },
  ];
  const behavioralAndHealthV = [
    { label: "Preview Students V" },
    { label: "Preview Daily Homework Status V" },
    { label: "Preview Assignments V" },
    { label: "Preview Progress Test Marks V" },
    { label: "Healthy Foods Suggestion V" },
    { label: "Yoga & WorkOuts Suggestion V" },
    { label: "Recommended LifeStyles V" },
    { label: "Student Behaviour Log V" },
  ];
  const behavioralAndHealthVI = [
    { label: "Preview Students VI" },
    { label: "Preview Daily Homework Status VI" },
    { label: "Preview Assignments VI" },
    { label: "Preview Progress Test Marks VI" },
    { label: "Healthy Foods Suggestion VI" },
    { label: "Yoga & WorkOuts Suggestion VI" },
    { label: "Recommended LifeStyles VI" },
    { label: "Student Behaviour Log VI" },
  ];
  const behavioralAndHealthVII = [
    { label: "Preview Students VII" },
    { label: "Preview Daily Homework Status VII" },
    { label: "Preview Assignments VII" },
    { label: "Preview Progress Test Marks VII" },
    { label: "Healthy Foods Suggestion VII" },
    { label: "Yoga & WorkOuts Suggestion VII" },
    { label: "Recommended LifeStyles VII" },
    { label: "Student Behaviour Log VII" },
  ];
  const behavioralAndHealthVIII = [
    { label: "Preview Students VIII" },
    { label: "Preview Daily Homework Status VIII" },
    { label: "Preview Assignments VIII" },
    { label: "Preview Progress Test Marks VIII" },
    { label: "Healthy Foods Suggestion VIII" },
    { label: "Yoga & WorkOuts Suggestion VIII" },
    { label: "Recommended LifeStyles VIII" },
    { label: "Student Behaviour Log VIII" },
  ];
  const behavioralAndHealthIX = [
    { label: "Preview Students IX" },
    { label: "Preview Daily Homework Status IX" },
    { label: "Preview Assignments IX" },
    { label: "Preview Progress Test Marks IX" },
    { label: "Healthy Foods Suggestion IX" },
    { label: "Yoga & WorkOuts Suggestion IX" },
    { label: "Recommended LifeStyles IX" },
    { label: "Student Behaviour Log IX" },
  ];
  const behavioralAndHealthX = [
    { label: "Preview Students X" },
    { label: "Preview Daily Homework Status X" },
    { label: "Preview Assignments X" },
    { label: "Preview Progress Test Marks X" },
    { label: "Healthy Foods Suggestion X" },
    { label: "Yoga & WorkOuts Suggestion X" },
    { label: "Recommended LifeStyles X" },
    { label: "Student Behaviour Log X" },
  ];
  const behavioralAndHealthXS = [
    { label: "Preview Students XS" },
    { label: "Preview Daily Homework Status XS" },
    { label: "Preview Assignments XS" },
    { label: "Preview Progress Test Marks XS" },
    { label: "Healthy Foods Suggestion XS" },
    { label: "Yoga & WorkOuts Suggestion XS" },
    { label: "Recommended LifeStyles XS" },
    { label: "Student Behaviour Log XS" },
  ];
  const behavioralAndHealthXI = [
    { label: "Preview Students XI" },
    { label: "Preview Daily Homework Status XI" },
    { label: "Preview Assignments XI" },
    { label: "Preview Progress Test Marks XI" },
    { label: "Healthy Foods Suggestion XI" },
    { label: "Yoga & WorkOuts Suggestion XI" },
    { label: "Recommended LifeStyles XI" },
    { label: "Student Behaviour Log XI" },
  ];
  const behavioralAndHealthXII = [
    { label: "Preview Students XII" },
    { label: "Preview Daily Homework Status XII" },
    { label: "Preview Assignments XII" },
    { label: "Preview Progress Test Marks XII" },
    { label: "Healthy Foods Suggestion XII" },
    { label: "Yoga & WorkOuts Suggestion XII" },
    { label: "Recommended LifeStyles XII" },
    { label: "Student Behaviour Log XII" },
  ];
  const behavioralAndHealthXIIS = [
    { label: "Preview Students XIIS" },
    { label: "Preview Daily Homework Status XIIS" },
    { label: "Preview Assignments XIIS" },
    { label: "Preview Progress Test Marks XIIS" },
    { label: "Healthy Foods Suggestion XIIS" },
    { label: "Yoga & WorkOuts Suggestion XIIS" },
    { label: "Recommended LifeStyles XIIS" },
    { label: "Student Behaviour Log XIIS" },
  ];
  const behavioralAndHealthXIIIJ = [
    { label: "Preview Students XIIIJ" },
    { label: "Preview Daily Homework Status XIIIJ" },
    { label: "Preview Assignments XIIIJ" },
    { label: "Preview Progress Test Marks XIIIJ" },
    { label: "Healthy Foods Suggestion XIIIJ" },
    { label: "Yoga & WorkOuts Suggestion XIIIJ" },
    { label: "Recommended LifeStyles XIIIJ" },
    { label: "Student Behaviour Log XIIIJ" },
  ];

  const parentGuardianCommunicationLKG = [
    { label: "Insert & View Attendance LKG" },
    { label: "Monthly Fees LKG" },
    { label: "Guardian Communication Log Class LKG" },
    { label: "Parent-Teacher Meeting Notes Class LKG" },
  ];
  const parentGuardianCommunicationUKG = [
    { label: "Insert & View Attendance UKG" },
    { label: "Monthly Fees UKG" },
    { label: "Guardian Communication Log Class UKG" },
    { label: "Parent-Teacher Meeting Notes Class UKG" },
  ];
  const parentGuardianCommunicationI = [
    { label: "Insert & View Attendance I" },
    { label: "Monthly Fees I" },
    { label: "Guardian Communication Log Class I" },
    { label: "Parent-Teacher Meeting Notes Class I" },
  ];
  const parentGuardianCommunicationII = [
    { label: "Insert & View Attendance II" },
    { label: "Monthly Fees II" },
    { label: "Guardian Communication Log Class II" },
    { label: "Parent-Teacher Meeting Notes Class II" },
  ];
  const parentGuardianCommunicationIII = [
    { label: "Insert & View Attendance III" },
    { label: "Monthly Fees III" },
    { label: "Guardian Communication Log Class III" },
    { label: "Parent-Teacher Meeting Notes Class III" },
  ];
  const parentGuardianCommunicationIV = [
    { label: "Insert & View Attendance IV" },
    { label: "Monthly Fees IV" },
    { label: "Guardian Communication Log Class IV" },
    { label: "Parent-Teacher Meeting Notes Class IV" },
  ];
  const parentGuardianCommunicationV = [
    { label: "Insert & View Attendance V" },
    { label: "Monthly Fees V" },
    { label: "Guardian Communication Log Class V" },
    { label: "Parent-Teacher Meeting Notes Class V" },
  ];
  const parentGuardianCommunicationVI = [
    { label: "Insert & View Attendance VI" },
    { label: "Monthly Fees VI" },
    { label: "Guardian Communication Log Class VI" },
    { label: "Parent-Teacher Meeting Notes Class VI" },
  ];
  const parentGuardianCommunicationVII = [
    { label: "Insert & View Attendance VII" },
    { label: "Monthly Fees VII" },
    { label: "Guardian Communication Log Class VII" },
    { label: "Parent-Teacher Meeting Notes Class VII" },
  ];
  const parentGuardianCommunicationVIII = [
    { label: "Insert & View Attendance VIII" },
    { label: "Monthly Fees VIII" },
    { label: "Guardian Communication Log Class VIII" },
    { label: "Parent-Teacher Meeting Notes Class VIII" },
  ];
  const parentGuardianCommunicationIX = [
    { label: "Insert & View Attendance IX" },
    { label: "Monthly Fees IX" },
    { label: "Guardian Communication Log Class IX" },
    { label: "Parent-Teacher Meeting Notes Class IX" },
  ];
  const parentGuardianCommunicationX = [
    { label: "Insert & View Attendance X" },
    { label: "Monthly Fees X" },
    { label: "Guardian Communication Log Class X" },
    { label: "Parent-Teacher Meeting Notes Class X" },
  ];
  const parentGuardianCommunicationXS = [
    { label: "Insert & View Attendance XS" },
    { label: "Monthly Fees XS" },
    { label: "Guardian Communication Log Class XS" },
    { label: "Parent-Teacher Meeting Notes Class XS" },
  ];
  const parentGuardianCommunicationXI = [
    { label: "Insert & View Attendance XI" },
    { label: "Monthly Fees XI" },
    { label: "Guardian Communication Log Class XI" },
    { label: "Parent-Teacher Meeting Notes Class XI" },
  ];
  const parentGuardianCommunicationXII = [
    { label: "Insert & View Attendance XII" },
    { label: "Monthly Fees XII" },
    { label: "Guardian Communication Log Class XII" },
    { label: "Parent-Teacher Meeting Notes Class XII" },
  ];
  const parentGuardianCommunicationXIIS = [
    { label: "Insert & View Attendance XIIS" },
    { label: "Monthly Fees XIIS" },
    { label: "Guardian Communication Log Class XIIS" },
    { label: "Parent-Teacher Meeting Notes Class XIIS" },
  ];
  const parentGuardianCommunicationXIIIJ = [
    { label: "Insert & View Attendance XIIIJ" },
    { label: "Monthly Fees XIIIJ" },
    { label: "Guardian Communication Log Class XIIIJ" },
    { label: "Parent-Teacher Meeting Notes Class XIIIJ" },
  ];

  // ---- Admission / Finance management sections (COEF primary) ----
  const AdmissionManagementSection = [
    { label: "Manage Students LKG" },
    { label: "Manage Students UKG" },
    { label: "Manage Students I" },
    { label: "Manage Students II" },
    { label: "Manage Students III" },
    { label: "Manage Students IV" },
    { label: "Manage Students V" },
    { label: "Manage Students VI" },
    { label: "Manage Students VII" },
    { label: "Manage Students VIII" },
    { label: "Manage Students IX" },
    { label: "Manage Students X" },
    { label: "Manage Students XS" },
    { label: "Manage Students XI" },
    { label: "Manage Students XII" },
    { label: "Manage Students XIIS" },
    { label: "Manage Students XIIIJ" },
    { label: "📝 Check Examination Results" },
  ];

  // Front-desk direct admissions are separate from class student management.
  // Annual readmission remains inside each class's Manage Students workspace.
  const NewAdmissionSection = [
    { label: "New Admission LKG" },
    { label: "New Admission UKG" },
    { label: "New Admission I" },
    { label: "New Admission II" },
    { label: "New Admission III" },
    { label: "New Admission IV" },
    { label: "New Admission V" },
    { label: "New Admission VI" },
    { label: "New Admission VII" },
    { label: "New Admission VIII" },
    { label: "New Admission IX" },
    { label: "New Admission X" },
    { label: "New Admission XI" },
    { label: "New Admission XII" },
  ];

  const FinanceManagementSection = [
    { label: "Monthly Fees Class LKG" },
    { label: "Monthly Fees Class UKG" },
    { label: "Monthly Fees Class I" },
    { label: "Monthly Fees Class II" },
    { label: "Monthly Fees Class III" },
    { label: "Monthly Fees Class IV" },
    { label: "Monthly Fees Class V" },
    { label: "Monthly Fees Class VI" },
    { label: "Monthly Fees Class VII" },
    { label: "Monthly Fees Class VIII" },
    { label: "Monthly Fees Class IX" },
    { label: "Monthly Fees Class X" },
    { label: "Monthly Fees Class XS" },
    { label: "Monthly Fees Class XI" },
    { label: "Monthly Fees Class XII" },
    { label: "Monthly Fees Class XIIS" },
    { label: "Monthly Fees Class XIIIJ" },
  ];

  const AdmitCardManagementSection = [
    { label: "Admit Cards Class LKG" },
    { label: "Admit Cards Class UKG" },
    { label: "Admit Cards Class I" },
    { label: "Admit Cards Class II" },
    { label: "Admit Cards Class III" },
    { label: "Admit Cards Class IV" },
    { label: "Admit Cards Class V" },
    { label: "Admit Cards Class VI" },
    { label: "Admit Cards Class VII" },
    { label: "Admit Cards Class VIII" },
    { label: "Admit Cards Class IX" },
    { label: "Admit Cards Class X" },
    { label: "Admit Cards Class XS" },
    { label: "Admit Cards Class XI" },
    { label: "Admit Cards Class XII" },
    { label: "Admit Cards Class XIIS" },
    { label: "Admit Cards Class XIIIJ" },
  ];

  const GuardianRecordManagementSection = [
    { label: "Guardian Communication Log Class LKG" },
    { label: "Guardian Communication Log Class UKG" },
    { label: "Guardian Communication Log Class I" },
    { label: "Guardian Communication Log Class II" },
    { label: "Guardian Communication Log Class III" },
    { label: "Guardian Communication Log Class IV" },
    { label: "Guardian Communication Log Class V" },
    { label: "Guardian Communication Log Class VI" },
    { label: "Guardian Communication Log Class VII" },
    { label: "Guardian Communication Log Class VIII" },
    { label: "Guardian Communication Log Class IX" },
    { label: "Guardian Communication Log Class X" },
    { label: "Guardian Communication Log Class XS" },
    { label: "Guardian Communication Log Class XI" },
    { label: "Guardian Communication Log Class XII" },
    { label: "Guardian Communication Log Class XIIS" },
    { label: "Guardian Communication Log Class XIIIJ" },
  ];

  const ParentTeacherMeetingSection = [
    { label: "Parent-Teacher Meeting Notes Class LKG" },
    { label: "Parent-Teacher Meeting Notes Class UKG" },
    { label: "Parent-Teacher Meeting Notes Class I" },
    { label: "Parent-Teacher Meeting Notes Class II" },
    { label: "Parent-Teacher Meeting Notes Class III" },
    { label: "Parent-Teacher Meeting Notes Class IV" },
    { label: "Parent-Teacher Meeting Notes Class V" },
    { label: "Parent-Teacher Meeting Notes Class VI" },
    { label: "Parent-Teacher Meeting Notes Class VII" },
    { label: "Parent-Teacher Meeting Notes Class VIII" },
    { label: "Parent-Teacher Meeting Notes Class IX" },
    { label: "Parent-Teacher Meeting Notes Class X" },
    { label: "Parent-Teacher Meeting Notes Class XS" },
    { label: "Parent-Teacher Meeting Notes Class XI" },
    { label: "Parent-Teacher Meeting Notes Class XII" },
    { label: "Parent-Teacher Meeting Notes Class XIIS" },
    { label: "Parent-Teacher Meeting Notes Class XIIIJ" },
  ];

  const CDTPSection = [
    { label: "Knights CDTP Sessions Class LKG" },
    { label: "Knights CDTP Sessions Class UKG" },
    { label: "Knights CDTP Sessions Class I" },
    { label: "Knights CDTP Sessions Class II" },
    { label: "Knights CDTP Sessions Class III" },
    { label: "Knights CDTP Sessions Class IV" },
    { label: "Knights CDTP Sessions Class V" },
    { label: "Knights CDTP Sessions Class VI" },
    { label: "Knights CDTP Sessions Class VII" },
    { label: "Knights CDTP Sessions Class VIII" },
    { label: "Knights CDTP Sessions Class IX" },
    { label: "Knights CDTP Sessions Class X" },
    { label: "Knights CDTP Sessions Class XS" },
    { label: "Knights CDTP Sessions Class XI" },
    { label: "Knights CDTP Sessions Class XII" },
    { label: "Knights CDTP Sessions Class XIIS" },
    { label: "Knights CDTP Sessions Class XIIIJ" },
  ];

  // Previously empty – now populated so menus are useful
  const FeeReportingSection = [
    { label: "Fee Defaulters Report" },
    { label: "Class-wise Fee Collection Summary" },
    { label: "Outstanding Dues Export" },
    { label: "Fee Concession / Waiver Log" },
  ];

  const ReceiptHistorySection = [
    { label: "All Issued Receipts" },
    { label: "Filter Receipts by Date" },
    { label: "Filter Receipts by Class" },
    { label: "Download Receipt Archive" },
  ];

  /**
   * NEW – Payments proceeded by GCI that require COEF verification
   * & final take / submission. Visible to both GCI and COEF.
   */
  const paymentsProceededSection = [
    { label: "Payments Proceeded" },
  ];

  // ---------------------------------------------------------------------------
  // ROLE GROUP DEFINITIONS (clean mapping)
  // ---------------------------------------------------------------------------

  const schoolClassNames = ["LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XS", "XI", "XII", "XIIS", "XIIIJ"];
  const sharedStudentAttendanceItems = schoolClassNames.map((className) => ({ label: `Insert & View Attendance ${className}` }));
  // Attendance is deliberately listed once in the class-scoped attendance
  // group. The shared class-teacher panel below retains every other teaching
  // tool for Principal, COEF and GCI without duplicating that entry.
  const classTeacherSupportItems = teachersPanel
    .filter((item) => item.label !== "Insert & View Attendance")
    .flatMap((item) => (
      item.label.includes("Check Examination Results")
        ? [item, { label: "Institution Holiday Calendar" }]
        : [item]
    ));
  const principalClassOperationalSections = [
    ["Class LKG", "LKG", drawerItemsLKG], ["Class UKG", "UKG", drawerItemsUKG], ["Class I", "I", drawerItemsI], ["Class II", "II", drawerItemsII],
    ["Class III", "III", drawerItemsIII], ["Class IV", "IV", drawerItemsIV], ["Class V", "V", drawerItemsV], ["Class VI", "VI", drawerItemsVI],
    ["Class VII", "VII", drawerItemsVII], ["Class VIII", "VIII", drawerItemsVIII], ["Class IX", "IX", drawerItemsIX], ["Class X", "X", drawerItemsX],
    ["Class XS", "XS", drawerItemsXS], ["Class XI", "XI", drawerItemsXI], ["Class XII", "XII", drawerItemsXII], ["Class XIIS", "XIIS", drawerItemsXIIS],
    ["Class Joint Leader", "XIIIJ", drawerItemsXIIIJ],
  ].map(([title, className, items]) => ({
    title,
    items: [
      { label: `Preview Students ${className}` },
      ...items.filter((item) => !/^Insert & View Attendance\b/.test(item.label) && item.label !== `Preview Students ${className}`),
    ],
  }));

  /**
   * PRINCIPAL (LEADERSHIP)
   * Head of all school operations EXCLUDING pure finance (admission fees, monthly
   * fee collection, receipt finalisation, staff payment disbursement).
   * Owns: staff/faculty ops, transport, operational approvals, exam structure,
   * class-level academic & behavioural control, admissions of students (not fee),
   * re-admissions, guardian/PTM visibility, results overview.
   */
  const sectionGroupsForPrincipal = [
    { title: "Admin Employee Panel", items: adminPanelPages },
    { title: "Faculties Control Panel", items: schoolFaculties },
    { title: "Transport Management Panel", items: fleetsManagement },
    { title: "Operations & Approvals", items: operationalApprovals },
    { title: "School Evidence", items: [{ label: "School Evidence Submission" }] },
    { title: "Students Attendance Panel", items: sharedStudentAttendanceItems },
    { title: "Examination Exam Control Panel", items: examControlPanel },
    { title: "New Admissions", items: NewAdmissionSection },
    { title: "Class Admissions", items: AdmissionManagementSection },
    { title: "Admit Card Management", items: AdmitCardManagementSection },
    { title: "Knights CDTPs", items: CDTPSection },
    { title: "Guardian Communication Records", items: GuardianRecordManagementSection },
    { title: "Parent Teacher Meeting Notes", items: ParentTeacherMeetingSection },
    ...principalClassOperationalSections,
    { title: "Class Teachers Panel", items: classTeacherSupportItems },
    { title: "My Attendance & Salary", items: myBasicPages },
  ];

  /**
   * COEF (FINANCE)
   * All finance-related information, fee verification, exam conduct & Examination.
   * Final authority on money taken by GCI → verifies & submits.
   */
  const financeClassNames = schoolClassNames;
  const coefFeeSchemeItems = adminPanelPages.filter((item) => item.label.includes("View Fee Schemes"));
  const coefClassFeeMonitoringItems = financeClassNames.map((className) => ({ label: `Monthly Fees ${className}` }));
  const coefGuardianFeeFollowupItems = financeClassNames.map((className) => (
    { label: `Guardian Communication Log Class ${className}` }
  ));
  const coefAdmissionTestItems = admissionTestDepartment.filter((item) => !item.label.includes("View Fee Schemes"));
  const coefExamAndResultsItems = [
    ...examControlPanel.filter((item) => item.label.includes("Print Exam Seating") || item.label.includes("Schduled Exam Dates")),
  ];
  const coefGroupRank = (title) => {
    if (title.startsWith("Payments Proceeded")) return 4;
    return {
      "Fee Scheme Reference": 1,
      "Monthly Fee Collection": 2,
      "Class Fee Monitoring": 3,
      "Students Attendance Panel": 5,
      "Collections, Receipts & Dues": 6,
      "Guardian Fee Follow-up": 7,
      "Admission Test Department": 8,
      "New Admissions": 9,
      "Class Admissions": 10,
      "Admission Fee Verification": 11,
      "Admit Card Management": 12,
      "Examination Control & Results": 13,
      "Class Teachers Panel": 14,
      "Faculty Attendance Panel": 15,
      "My Attendance & Salary": 16,
    }[title] || 99;
  };

  const sectionGroupForCOEF = [
    { title: "Fee Scheme Reference", items: coefFeeSchemeItems },
    { title: "Monthly Fee Collection", items: FinanceManagementSection },
    { title: "Class Fee Monitoring", items: coefClassFeeMonitoringItems },
    { title: "Students Attendance Panel", items: sharedStudentAttendanceItems },
    {
      title: "Collections, Receipts & Dues",
      items: [...FeeReportingSection, ...ReceiptHistorySection],
    },
    { title: "Guardian Fee Follow-up", items: coefGuardianFeeFollowupItems },
    { title: "Admission Test Department", items: coefAdmissionTestItems },
    { title: "New Admissions", items: NewAdmissionSection },
    { title: "Class Admissions", items: AdmissionManagementSection },
    { title: "Admission Fee Verification", items: [{ label: "Admission Fee Verification" }] },
    { title: "Admit Card Management", items: AdmitCardManagementSection },
    {
      title: "Payments Proceeded (GCI → COEF)",
      items: paymentsProceededSection,
    },
    { title: "Examination Control & Results", items: coefExamAndResultsItems },
    { title: "Class Teachers Panel", items: classTeacherSupportItems },
    { title: "Faculty Attendance Panel", items: facultyAttendanceControlItems },
    { title: "My Attendance & Salary", items: myBasicPages },
  ].sort((left, right) => coefGroupRank(left.title) - coefGroupRank(right.title));

  /**
   * FIC (Fee In Charge) owns fee checking and guardian follow-up. The Monthly
   * Fees workspace already contains the complete guardian-care dialog and the
   * permanent numbered call tracker, so it gets one focused group per class.
   */
  const ficCheckAndCallSection = {
    title: "FIC Department",
    items: schoolClassNames.map((className) => ({ label: `Monthly Fees ${className}` })),
  };

  /**
   * The former GCI class-information group is academic information, not fee
   * collection. It is therefore presented as AIC Department class monitoring.
   */
  const aicClassInformationSections = schoolClassNames.map((className) => ({
    title: `AIC Department — Class ${className}`,
    items: [
      { label: `Preview Students ${className}` },
      { label: `Preview Daily Homework Status ${className}` },
      { label: `Preview Assignments ${className}` },
      { label: `Preview Progress Test Marks ${className}` },
    ],
  }));

  // The exam result and school-oath entries already belong to the teaching
  // tools. Keep the holiday calendar immediately after them instead of a
  // duplicate standalone examination-results group.
  const gciClassTeacherPanelItems = classTeacherSupportItems.flatMap((item) => (
    item.label === "ðŸ“ Check Examination Results"
      ? [item, { label: "Institution Holiday Calendar" }]
      : [item]
  ));

  const sectionGroupforGCI = [
    { title: "New Admissions", items: NewAdmissionSection },
    { title: "Admission Fee Custody", items: [{ label: "Admission Fee Custody" }] },
    ficCheckAndCallSection,
    // GCI may record a collection acknowledgement; COEF/Administration retain
    // the bank and final-receipt stages in the protected collection workflow.
    { title: "Pay Monthly Fee", items: FinanceManagementSection },
    // GCI/HOD records and hands over guardian collections here. COEF alone
    // verifies custody and records the school-bank transaction.
    { title: "Payments Proceeded (GCI → COEF)", items: paymentsProceededSection },
    { title: "Students Attendance Panel", items: sharedStudentAttendanceItems },
    ...aicClassInformationSections,
    { title: "Class Teachers Panel", items: classTeacherSupportItems },
    { title: "Faculty Attendance Panel", items: facultyAttendanceControlItems },
    { title: "My Attendance & Salary", items: myBasicPages },
  ];

  /**
   * TEACHER – pure teaching duties + personal salary/attendance
   */
  const sectionGroupForTeachers = [
    { title: "Students Attendance Panel", items: teachersPanelAttendance },
    { title: "System Study Materials", items: teachersPanelStudyMaterials },
    { title: "Punishments & Report Behaviours", items: teachersStudentBehaviour },
    { title: "Check Examination Results", items: checkResultsOnline },
    { title: "My Attendance & Salary", items: myBasicPages },
  ];

  /**
   * STAFF – Driver, Security, Gateman, Peon, Clerk, other non-teaching employees
   * Always get: own Attendance + Salary + Fee visibility
   * Drivers also get Transport Operations so they can work with fleets/buses.
   */
  const staffFeeAndAttendance = [
    { label: "My Attendance" },
    { label: "My Current Month Salary" },
    { label: "My Received Salary History" },
    { label: "🧾 View Fee Schemes" },
    { label: "Institution Holiday Calendar" },
  ];

  const sectionGroupForStaff = [
    { title: "My Attendance, Salary & Fees", items: staffFeeAndAttendance },
    { title: "Transport Operations", items: transportOperations },
    { title: "Check Examination Results", items: checkResultsOnline },
  ];

  // ---------------------------------------------------------------------------
  // Role → groups resolver
  // ---------------------------------------------------------------------------
  const renderSectionsForRole = (role) => {
    switch (role) {
      case "SYSTEM_ADMIN": {
        // Full institutional oversight – merge everything, dedupe by title + label
        const groups = [
          ...sectionGroupsForPrincipal,
          ...sectionGroupForCOEF,
          ...sectionGroupforGCI,
          ...sectionGroupForTeachers,
          ...sectionGroupForStaff,
        ];
        const merged = new Map();
        for (const group of groups) {
          const items = merged.get(group.title) ?? [];
          const seen = new Set(items.map((i) => i.label));
          for (const item of group.items ?? []) {
            if (!seen.has(item.label)) {
              items.push(item);
              seen.add(item.label);
            }
          }
          merged.set(group.title, items);
        }
        return [...merged].map(([title, items]) => ({ title, items }));
      }
      case "LEADERSHIP":
        return sectionGroupsForPrincipal;
      case "FINANCE":
        return sectionGroupForCOEF;
      case "GCI":
        return sectionGroupforGCI;
      case "TEACHER":
        return sectionGroupForTeachers;
      case "STAFF":
        return sectionGroupForStaff;
      default:
        return sectionGroupForStaff; // safe fallback: attendance + fee + salary
    }
  };

  const [openGroups, setOpenGroups] = useState({});

  const panelRole = resolvePanelRole(jobRole, authorization);
  const roleGroups = renderSectionsForRole(panelRole);

  // COEF receives its dedicated finance/examination structure only. Teaching
  // workspaces remain limited to teaching and leadership roles; staff keep
  // only their own groups.
  const combinedGroups =
    panelRole === "STAFF" || panelRole === "FINANCE" || panelRole === "GCI"
      ? roleGroups
      : [...roleGroups, ...sectionGroupForTeachers];

  // Dedupe identical group titles (keep first occurrence)
  const uniqueGroups = combinedGroups.filter(
    (group, index, groups) =>
      groups.findIndex((g) => g.title === group.title) === index
  );

  // Final RBAC permission filter
  const visibleGroups = filterPanelGroups(
    uniqueGroups,
    authorization?.permissions
  );

  const toggleGroup = (groupTitle) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

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
      <Box sx={{ display: "flex", flexDirection: "row", py: 0.5 }}>
        <Image
          width={56}
          height={56}
          src={"/knights.png"}
          alt="Sure Success Point School"
        />
        <TDILIcon sx={{ pt: 2 }} />
      </Box>

      <ListItem disablePadding sx={{ backgroundColor: "#e91e63", color: "#000000" }}>
        <ListItemButton>
          <ListItemText
            primary={
              `${panelRole.charAt(0).toUpperCase()}${panelRole
                .slice(1)
                .toLowerCase()}`.padEnd(22).slice(0, 24) + " Panel"
            }
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

      {/* Fixed bottom profile */}
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
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Temporary Drawer – Mobile */}
      <Drawer
        container={typeof window !== "undefined" ? window.document.body : undefined}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            mt: `${appBarHeight}px`,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Permanent Drawer – Desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
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
