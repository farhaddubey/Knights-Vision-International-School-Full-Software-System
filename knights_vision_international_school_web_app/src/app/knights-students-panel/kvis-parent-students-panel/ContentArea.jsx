import React from 'react';
import { Box } from '@mui/material';
import MyInfo from './components/MyInfo';
import MyAttendance from './components/MyAttendance'; 
import MyLeaves from './components/MyLeaves'; 
import HolidayCalendar from "@/components/sure-success-point-school/calendar/StudentHolidayCalendar";
import MyFeeStatus from './components/MyFeeStatus'; 
import MyFoodInstruction from './components/MyFoodInstructions'; 
import MyParentTeacherMettingNote from './components/MyParentTeacherMeetingNotes'; 
import MyImprovementSuggestions from './components/MyImprovementSuggestions'; 
import FetchClassesForLecturesView from './lecture_and_homework/FetchClassesForLecturesView'; 
import FetchClassesforDailyHomeworkReport from './lecture_and_homework/FetchClassesForHomworkSubmission'; 
import FetchClassesForAssignments from './lecture_and_homework/FetchClassesForAssignments'; 
import FetchClassesForWeeklyTests from './lecture_and_homework/FetchClassesForBiweeklyTestMarks'; 
import FetchClassForBoardPreaparationExams from './lecture_and_homework/FetchClassesForWBTPS'; 
import SemesterExamsTimeTable from './lecture_and_homework/SemesterExamsDateClassWise'; 
import ClassSubjectsBookPage from './lecture_and_homework/ClassSubjectBooksPage'; 
import CheckResult from './checkResult/CheckResultsPublic';
import SchoolPrayerAndOath from './lecture_and_homework/SchoolPrayerAndOath'; 

function ContentArea({ activeSection }) {
  const renderContent = () => {
    switch (activeSection) {
////////////////////////////////////////////////////////////////
  case '👤 My Info':
    return <MyInfo/>; 
  case '📆 My Attendance':
    return <MyAttendance/>;
  case '✋ My Requested Leaves': 
    return <MyLeaves/>; 
////////////////////////////////////////////////////////////////
  case '📖 My School Syllabus': 
    return <FetchClassesForLecturesView/>
  case '📚 View Homework Status':
    return <FetchClassesforDailyHomeworkReport/>; 
  case '🧾 My Assignments':
    return <FetchClassesForAssignments/>; 
  case '📝 My Daily Homework Report': 
    return <FetchClassesforDailyHomeworkReport/>; 
  case '🧾 My Weekly Assignment Marks':
    return <FetchClassesForAssignments/>; 

////////////////////////////////////////////////////////////////
  case '🧪 My Class Tests':
    return <FetchClassesForWeeklyTests/>; 
  case '🏆 My KWBMTPS Tests':
    return <FetchClassForBoardPreaparationExams/>; 

      
  case '🧪 My Weekly Test Marks':
    return <FetchClassesForWeeklyTests/>; 
  case '🏆 My KWBMTPS Results':
    return <FetchClassForBoardPreaparationExams/>; 
  case '📖 Semester Exam Dates':
    return <SemesterExamsTimeTable/>; 
////////////////////////////////////////////////////////////////      

  case '📘 Class Books Assigned': 
      return <ClassSubjectsBookPage/>; 
  case '🧠 Foods to Boost Brain Power': 
      return <MyFoodInstruction/>; 
    case '📚 My Due Fees': 
    return <MyFeeStatus/>; 
  case '🙏 My School Oath & Prayer': 
      return <SchoolPrayerAndOath/>; 
  case '📝 Check Semester Results': 
      return <CheckResult/>; 
  case '📝 Notes During Parent-Teacher Meetings': 
      return <MyParentTeacherMettingNote/>; 
  case '💡 How Can We Improve Better?':
      return <MyImprovementSuggestions/>

  case '📝 Holiday Calendar': 
    return <HolidayCalendar/>

  default:
    return "<DashboardPage/>";
  
    }
  };

  return (
    <Box sx={{backgroundColor:"#000"}}>
      {renderContent()}
    </Box>
  );
}
import MyHolidays from './components/HolidayCalendar';

export default ContentArea;
