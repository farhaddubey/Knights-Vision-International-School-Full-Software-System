"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';

// Keep the established drawer and every existing panel intact, but only load a
// panel when an administrator opens it. The former static import graph compiled
// every legacy screen before the image library could respond.
const PanelLoading = () => (
  <Box sx={{ minHeight: 240, display: 'grid', placeItems: 'center' }}>
    <CircularProgress />
  </Box>
);
const panel = (loader) => dynamic(loader, { ssr: false, loading: PanelLoading });

const FactoryEmployeeSalary = panel(() => import('./attendance_and_salary/EmployeeSalary'));
const EmployeeWiseAttendance = panel(() => import('./attendance_and_salary/EmployeeWiseAttendance'));
const InsertEmployeeEntrance = panel(() => import('./attendance_and_salary/InsertEmployeeEntrance'));
const InsertEmployeeExit = panel(() => import('./attendance_and_salary/InsertEmployeeExit'));
const EmployeeInfoList = panel(() => import('./admin/EmployeeInfoList'));
const EmployeeManageList = panel(() => import('./admin/EmployeeManageList'));
const MyAttendance = panel(() => import('./school_teachers/MyAttendance'));
const MyProductionLogs = panel(() => import('./school_teachers/MyDailyProductions'));
const MyCurrentMonthSalary = panel(() => import('./school_teachers/MyCurrentMonthSalary'));
const MySalaryHistory = panel(() => import('./school_teachers/MySalaryHistroy'));
const FactoryEmployeePaymentPanel = panel(() => import('./attendance_and_salary/EmployeePaymentPanel'));
const InsertFactoryEmployeeEntrance = panel(() => import('./attendance_and_salary/InsertEmployeeEntrance'));
const InsertFactoryEmployeeExit = panel(() => import('./attendance_and_salary/InsertEmployeeExit'));
const FactoryEmployeeWiseAttendance = panel(() => import('./attendance_and_salary/EmployeeAttendanceLogs'));
const FactoryEmployeeSalaryPanel = panel(() => import('./attendance_and_salary/EmployeeSalary'));
const Brands = panel(() => import('./admin/Brands'));
const Fleets = panel(() => import('./fleets_management/Fleets'));
const Depots = panel(() => import('./fleets_management/Depots'));
const VehicleDocuments = panel(() => import('./fleets_management/VehicleDocuments'));
const VehicleMaintenanceLogs = panel(() => import('./fleets_management/VehicleMaintenanceLogs'));
const UploadImagesPanel = panel(() => import('./images/UploadImagesPanel'));
const AddTeachingEmployee = panel(() => import('./admin/AddTeachingEmployee'));
const SiteHomepageCarousel = panel(() => import('./carousel/SiteHomepageCarousel'));
const BrowseCustomers = panel(() => import('./system_units_panel/BrowseCustomers'));
const BrowseDepartments = panel(() => import('./system_units_panel/BrowseDepartments'));
const BrowseDistricts = panel(() => import('./system_units_panel/BrowseDistricts'));
const BrowseNotifications = panel(() => import('./system_units_panel/BrowseNotifications'));
const BrowsePayments = panel(() => import('./system_units_panel/BrowsePayments'));
const BrowseStates = panel(() => import('./system_units_panel/BrowseStates'));
const BrowseTaxes = panel(() => import('./system_units_panel/BrowseTaxes'));
const BrowseServiceRequests = panel(() => import('./system_units_panel/BrowseServiceRequests'));
const SiteHomePageNavbar = panel(() => import('./website-control-panel/SiteHomePageNavbar'));
const SiteFeaturePlatforms = panel(() => import('./website-control-panel/SiteFeaturePlatforms'));
const WebSiteHomepageCarousel = panel(() => import('./website-control-panel/SiteHomepageCarousel'));
const SiteCarouselTwo = panel(() => import('./website-control-panel/SiteCarouselTwo'));
const SchoolEnquary = panel(() => import('./website-control-panel/SchoolEnquiry'));
const FeatureTechnology = panel(() => import('./website-control-panel/FeatureTechnology'));
const FeatureSchoolCenterCities = panel(() => import('./website-control-panel/FeatureSchoolCenterCities'));
const FeatureStudentsResults = panel(() => import('./website-control-panel/FeatureStudentsResults'));
const FeatureSchoolPrograms = panel(() => import('./website-control-panel/FeatureSchoolsPrograms'));
const KnowledgeTopics = panel(() => import('./website-control-panel/KnowledgeTopic'));
const SchoolManagement = panel(() => import('./school_and_branches_panel/SchoolManagement'));
const AddInstitutionBranches = panel(() => import('./school_and_branches_panel/SchoolBranchManagement'));
const AddInstitutionClasses = panel(() => import('./school_and_branches_panel/SchoolClassManagement'));
const SubjectsManagement = panel(() => import('./school_and_branches_panel/SubjectManagement'));
const ClassSubjectsManagement = panel(() => import('./school_and_branches_panel/ClassSubjectManagement'));
const FeeManagement = panel(() => import('./admission_test_panel/FeeSchemes'));
const AdmissionTestApplicationsFormPanel = panel(() => import('./admission_test_panel/AdmissionTestApplicationsFormPanel'));
const ExploreAdmitCards = panel(() => import('./admission_test_panel/ExploreAdmitCards'));
const AdmissionTestManagement = panel(() => import('./admission_test_panel/AdmissionTestManagement'));
const TestSubjectSyllabusManagement = panel(() => import('./admission_test_panel/TestSubjectSyllabusManagement'));
const TestEvaluationManagement = panel(() => import('./admission_test_panel/TestEvaluationManagement'));
const TestSeatingManagement = panel(() => import('./admission_test_panel/TestSeatingManagement'));
const TestResultManagement = panel(() => import('./admission_test_panel/TestResultManagement'));
const QualifiedsAdmissionManagement = panel(() => import('./admission_test_panel/QualifiedsAdmissionManagement'));
const AddClassRoom = panel(() => import('./school_and_branches_panel/RoomManagement'));
const AdmissionTestApplicationsManagement = panel(() => import('./admission_test_panel/AdmissionTestApplicationManagement'));
const UnQualifiedsGeneralDirectAdmissionManagement = panel(() => import('./admission_test_panel/UnQualifiedsAdmissionManagement'));
const AdmissionRecipts = panel(() => import('./admission_test_panel/AdmissionReceipts'));
const AdmittedStudents = panel(() => import('./admission_test_panel/AdmittedStudents'));
const SemesterExamSeating = panel(() => import('./class_main_others/SemesterExamSeating'));
const DisplayPrayerAndOath = panel(() => import('./class_main_others/DisplayPrayerAndOath'));
const DirectStudents = panel(() => import('./components/DirectStudents'));
const Attendance = panel(() => import('./components/Attendance'));
const LeaveRequestManagements = panel(() => import('./components/AttendanceLeaveManagement'));
const SyllabusDailyPlan = panel(() => import('./components/SyllabusDailyPlan'));
const BiWeeklyClassHomwWork = panel(() => import('./components/ClassBiWeeklyReviewPage'));
const ClassBiWeeklyAssignmentsPage = panel(() => import('./components/ClassBiWeeklyAssignmentsPage'));
const ClassBiWeeklyTestPage = panel(() => import('./components/ClassBiWeeklyTestsPage'));
const ClassSemesterResult = panel(() => import('./components/ClassSemesterResultsPage'));
const DownloadSemesterResultCard = panel(() => import('./components/DownloadSemesterResultCards'));
const ClassSubjectBooks = panel(() => import('./components/ClassSubjectBooksPage'));
const DynamicFoodsInstructions = panel(() => import('./components/DynamicClassFoodInstructionsPage'));
const ClassPunishment = panel(() => import('./components/DynamicClassPunishmentsPage'));
const DynamicClassGuardianCommunication = panel(() => import('./components/DynamicClassGuardianCommunicationLogPage'));
const GuardianCallLogsPage = panel(() => import('./components/DynamicClassGuardianCallLogPage'));
const DynamicClassParentTeacherMeetingNotes = panel(() => import('./components/DynamicClassParentTeacherMeetingNotesPage'));
const DynamicMonthlyFeeManagement = panel(() => import('./components/DynamicClassMonthlyFeeManagementSystem'));
const ClassAdmitCards = panel(() => import('./components/DynamicClassDirectAdmitCards'));
const DynamicClassKnightsCDTPPage = panel(() => import('./components/DynamicClassKnightsCdtpSessionPage'));
const DynamicClassPublicSpeechOccassion = panel(() => import('./components/DynamicClassPublicSpeakingOccasionPage'));
const DynamicClassPublicSpeakingOccasionPage = panel(() => import('./components/DynamicClassPublicSpeakingOccasionPage'));
const DynamicStudentBehaviourLogDialog = panel(() => import('./components/DynamicClassStudentBehaviourLogPage'));
const DynamicReadmissionManagement = panel(() => import('./components/DynamicClassReadmissionPanel'));
const GenerateTransferCertificate = panel(() => import('./components/TransferCertificatePanel'));
const DynamicExamSeatingCheats = panel(() => import('./components/ExamSeatingManagement'));
const BoardExamsResultManagement = panel(() => import('./components/BoardExamResultManagement'));
const SemesterExamScheduleManagement = panel(() => import('./school_and_branches_panel/SemesterExamScheduleManagement'));
const SemesterExamsDateClassWise = panel(() => import('./components/SemesterExamsDateClassWise'));
const AssignClassTeachers = panel(() => import('./school_and_branches_panel/AssignClassTeachers'));
const HolidayCalendarPage = panel(() => import('./holiday/HolidayCalendarPage'));
const StudentHolidayCalendar = panel(() => import('./holiday/StudentHolidayCalendar'));
const ClassSubjectTeacherAssignment = panel(() => import('./school_and_branches_panel/ClassSubjectTeacherAssignment'));
const RbacControlPanel = panel(() => import('./access_control/RbacControlPanel'));
const CentralCommandCenter = panel(() => import('./command_center/CentralCommandCenter'));
const PolicyExceptionWorkspace = panel(() => import('@/components/sure-success-point-school/approvals/PolicyExceptionWorkspace'));
const CentralBankConfirmationWorkspace = panel(() => import('@/components/sure-success-point-school/finance/CentralBankConfirmationWorkspace'));
const OperationalRequestsWorkspace = panel(() => import('@/components/sure-success-point-school/operations/OperationalRequestsWorkspace'));
const SchoolConcernsWorkspace = panel(() => import('@/components/sure-success-point-school/operations/SchoolConcernsWorkspace'));
const WorkforceDirectoryWorkspace = panel(() => import('@/components/sure-success-point-school/hr/WorkforceDirectoryWorkspace'));
const EmployeeDocumentsWorkspace = panel(() => import('@/components/sure-success-point-school/hr/EmployeeDocumentsWorkspace'));
const FacultyPayrollWorkspace = panel(() => import('@/components/sure-success-point-school/hr/FacultyPayrollWorkspace'));
const SchoolEvidenceReviewWorkspace = panel(() => import('@/components/sure-success-point-school/media/SchoolEvidenceReviewWorkspace'));

function ContentArea({ activeSection }) {
  const renderContent = () => {
    switch (activeSection) {
/////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'Access Control':
        return <RbacControlPanel />;
      case 'Executive Command Center':
        return <CentralCommandCenter />;
      case 'Policy Exceptions':
        return <PolicyExceptionWorkspace panel="ADMINISTRATION" />;
      case 'Monthly Fee - Daily Bank Settlement':
        return <CentralBankConfirmationWorkspace kind="MONTHLY" />;
      case 'Admission Fee - Bank Credit Confirmation':
        return <CentralBankConfirmationWorkspace kind="ADMISSION" />;
      case 'Operational Requests':
        return <OperationalRequestsWorkspace/>;
      case 'Workforce Directory':
        return <WorkforceDirectoryWorkspace/>;
      case 'Employee Documents':
        return <EmployeeDocumentsWorkspace/>;
      case 'Faculty Payroll':
        return <FacultyPayrollWorkspace/>;
      case 'School Evidence Review':
        return <SchoolEvidenceReviewWorkspace/>;
      case 'Manage Holiday Calendar': 
        return <HolidayCalendarPage/>;
      case 'Student Holiday Calendar': 
        return <StudentHolidayCalendar/>; 
      case 'Service Requests & Approvals':
        return <BrowseServiceRequests/>;
      case 'Complaints & Resolutions':
        return <SchoolConcernsWorkspace/>;
      case 'View Punishments to Use LKG':
        return <ClassPunishment className="LKG"/>
      case 'Manage Students LKG':
        return <DirectStudents className='LKG'/>; 
      case 'Insert & View Attendance LKG': 
        return <Attendance className="LKG" />
      case 'Leave Requests & Approvals LKG':
        return <LeaveRequestManagements className="LKG"/>;
      case 'View Lecture & Homework Syl. LKG':
        return <SyllabusDailyPlan className="LKG"/>;
      case 'Confirm Weekly HomeWork LKG':
        return <BiWeeklyClassHomwWork className="LKG"/>;
      case 'View Institution Assignments LKG':
        return <ClassBiWeeklyAssignmentsPage className="LKG"/>;
      case 'Add Weekly Progress Test Marks LKG':
        return <ClassBiWeeklyTestPage className="LKG"/>;
      case 'Insert Students Marks LKG':
        return <ClassSemesterResult className="LKG"/>;
      case 'View Students Marks LKG':
        return <DownloadSemesterResultCard className="LKG"/>;
      case 'View Instructed Books LKG':
        return <ClassSubjectBooks className="LKG"/>;
      case 'Student Behaviour Log LKG':
        return <DynamicStudentBehaviourLogDialog className="LKG"/>; 
      case 'Healthy Foods Suggestion LKG':
        return <DynamicFoodsInstructions className="LKG"/>;
      case 'Guardian Communication Log LKG': 
        return <DynamicClassGuardianCommunication className="LKG"/>;
      case 'Guardian Call FBW Report LKG':
        return <GuardianCallLogsPage className="LKG"/>;
      case 'Parent-Teacher Meeting Notes LKG':
        return <DynamicClassParentTeacherMeetingNotes className='LKG'/>; 
      case 'Monthly Fees LKG':
        return <DynamicMonthlyFeeManagement className="LKG"/>;
      case "Semester Exams TimeTable LKG": 
        return <SemesterExamsDateClassWise className="LKG"/>; 
      case 'Admit Cards LKG':
        return <ClassAdmitCards className="LKG"/>;
      case 'ReAdmission from Class LKG -> UKG': 
        return <DynamicReadmissionManagement className="LKG"/>; 
      case 'Knights CDTP Sessions LKG':
        return <DynamicClassKnightsCDTPPage className="LKG"/>;
      case 'Public Speaking Occasion LKG':
        return <DynamicClassPublicSpeechOccassion className="LKG"/>;
      case 'Annual Public Competition LKG':
        return <DynamicClassPublicSpeakingOccasionPage className="LKG"/>; 
      case 'Generate Transfer Certificate LKG':
        return <GenerateTransferCertificate className="LKG"/>;
      case 'Exam Seating Cheats LKG':
        return <DynamicExamSeatingCheats className="LKG"/>;
//////////////////////////////////////////////////////////////////////////////////////////
      case 'View Punishments to Use UKG':
        return <ClassPunishment className="UKG"/>
      case 'Manage Students UKG':
        return <DirectStudents className='UKG'/>; 
      case 'Insert & View Attendance UKG': 
        return <Attendance className="UKG" />
      case 'Leave Requests & Approvals UKG':
        return <LeaveRequestManagements className="UKG"/>;
      case 'View Lecture & Homework Syl. UKG':
        return <SyllabusDailyPlan className="UKG"/>;
      case 'Confirm Weekly HomeWork UKG':
        return <BiWeeklyClassHomwWork className="UKG"/>;
      case 'View Institution Assignments UKG':
        return <ClassBiWeeklyAssignmentsPage className="UKG"/>;
      case 'Student Behaviour Log UKG':
        return <DynamicStudentBehaviourLogDialog className="UKG"/>; 
      case 'Add Weekly Progress Test Marks UKG':
        return <ClassBiWeeklyTestPage className="UKG"/>;
      case 'Insert Students Marks UKG':
        return <ClassSemesterResult className="UKG"/>;
      case 'View Students Marks UKG':
        return <DownloadSemesterResultCard className="UKG"/>;
      case 'View Instructed Books UKG':
        return <ClassSubjectBooks className="UKG"/>;
      case 'Healthy Foods Suggestion UKG':
        return <DynamicFoodsInstructions className="UKG"/>;
      case 'Guardian Communication Log UKG': 
        return <DynamicClassGuardianCommunication className="UKG"/>;
      case 'Guardian Call FBW Report UKG':
        return <GuardianCallLogsPage className="UKG"/>;
      case 'Parent-Teacher Meeting Notes UKG':
        return <DynamicClassParentTeacherMeetingNotes className='UKG'/>; 
      case 'Monthly Fees UKG':
        return <DynamicMonthlyFeeManagement className="UKG"/>;
      case "Semester Exams TimeTable UKG": 
        return <SemesterExamsDateClassWise className="UKG"/>; 
      case 'Admit Cards UKG':
        return <ClassAdmitCards className="UKG"/>;
      case 'ReAdmission from Class UKG -> I': 
        return <DynamicReadmissionManagement className="UKG"/>; 
      case 'Knights CDTP Sessions UKG':
        return <DynamicClassKnightsCDTPPage className="UKG"/>;
      case 'Public Speaking Occasion UKG':
        return <DynamicClassPublicSpeechOccassion className="UKG"/>;
      case 'Annual Public Competition UKG':
        return <DynamicClassPublicSpeakingOccasionPage className="UKG"/>; 
      case 'Generate Transfer Certificate UKG':
        return <GenerateTransferCertificate className="UKG"/>;
      case 'Exam Seating Cheats UKG':
        return <DynamicExamSeatingCheats className="UKG"/>;
//////////////////////////////////////////////////////////////////////////////////////////////
      case 'View Punishments to Use I':
        return <ClassPunishment className="I"/>
      case 'Manage Students I':
        return <DirectStudents className='I'/>; 
      case 'Insert & View Attendance I': 
        return <Attendance className="I" />
      case 'Leave Requests & Approvals I':
        return <LeaveRequestManagements className="I"/>;
      case 'View Lecture & Homework Syl. I':
        return <SyllabusDailyPlan className="I"/>;
      case 'Confirm Weekly HomeWork I':
        return <BiWeeklyClassHomwWork className="I"/>;
      case 'View Institution Assignments I':
        return <ClassBiWeeklyAssignmentsPage className="I"/>;
      case 'Student Behaviour Log I':
        return <DynamicStudentBehaviourLogDialog className="I"/>; 
      case 'Add Weekly Progress Test Marks I':
        return <ClassBiWeeklyTestPage className="I"/>;
      case 'Insert Students Marks I':
        return <ClassSemesterResult className="I"/>;
      case 'View Students Marks I':
        return <DownloadSemesterResultCard className="I"/>;
      case 'View Instructed Books I':
        return <ClassSubjectBooks className="I"/>;
      case 'Healthy Foods Suggestion I':
        return <DynamicFoodsInstructions className="I"/>;
      case 'Guardian Communication Log I': 
        return <DynamicClassGuardianCommunication className="I"/>;
      case 'Guardian Call FBW Report I':
        return <GuardianCallLogsPage className="I"/>;
      case 'Parent-Teacher Meeting Notes I':
        return <DynamicClassParentTeacherMeetingNotes className='I'/>; 
      case 'Monthly Fees I':
        return <DynamicMonthlyFeeManagement className="I"/>;
       case "Semester Exams TimeTable I": 
        return <SemesterExamsDateClassWise className="I"/>; 
      case 'Admit Cards I':
        return <ClassAdmitCards className="I"/>;
      case 'ReAdmission from Class I -> II': 
        return <DynamicReadmissionManagement className="I"/>; 
      case 'Knights CDTP Sessions I':
        return <DynamicClassKnightsCDTPPage className="I"/>;
      case 'Public Speaking Occasion I':
        return <DynamicClassPublicSpeechOccassion className="I"/>;
      case 'Annual Public Competition I':
        return <DynamicClassPublicSpeakingOccasionPage className="I"/>; 
      case 'Generate Transfer Certificate I':
        return <GenerateTransferCertificate className="I"/>;
      case 'Exam Seating Cheats I':
        return <DynamicExamSeatingCheats className="I"/>;
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
      case 'View Punishments to Use II':
        return <ClassPunishment className="II"/>
      case 'Manage Students II':
        return <DirectStudents className='II'/>; 
      case 'Insert & View Attendance II': 
        return <Attendance className="II" />
      case 'Leave Requests & Approvals II':
        return <LeaveRequestManagements className="II"/>;
      case 'View Lecture & Homework Syl. II':
        return <SyllabusDailyPlan className="II"/>;
      case 'Confirm Weekly HomeWork II':
        return <BiWeeklyClassHomwWork className="II"/>;
      case 'View Institution Assignments II':
        return <ClassBiWeeklyAssignmentsPage className="II"/>;
      case 'Student Behaviour Log II':
        return <DynamicStudentBehaviourLogDialog className="II"/>; 
      case 'Add Weekly Progress Test Marks II':
        return <ClassBiWeeklyTestPage className="II"/>;
      case 'Insert Students Marks II':
        return <ClassSemesterResult className="II"/>;
      case 'View Students Marks II':
        return <DownloadSemesterResultCard className="II"/>;
      case 'View Instructed Books II':
        return <ClassSubjectBooks className="II"/>;
      case 'Healthy Foods Suggestion II':
        return <DynamicFoodsInstructions className="II"/>;
      case 'Guardian Communication Log II': 
        return <DynamicClassGuardianCommunication className="II"/>;
      case 'Guardian Call FBW Report II':
        return <GuardianCallLogsPage className="II"/>;
      case 'Parent-Teacher Meeting Notes II':
        return <DynamicClassParentTeacherMeetingNotes className='II'/>; 
      case 'Monthly Fees II':
        return <DynamicMonthlyFeeManagement className="II"/>;
      case "Semester Exams TimeTable II": 
        return <SemesterExamsDateClassWise className="II"/>; 
      case 'Admit Cards II':
        return <ClassAdmitCards className="II"/>;
      case 'ReAdmission from Class II -> III': 
        return <DynamicReadmissionManagement className="II"/>; 
      case 'Knights CDTP Sessions II':
        return <DynamicClassKnightsCDTPPage className="II"/>;
      case 'Public Speaking Occasion II':
        return <DynamicClassPublicSpeechOccassion className="II"/>;
      case 'Annual Public Competition II':
        return <DynamicClassPublicSpeakingOccasionPage className="II"/>; 
      case 'Generate Transfer Certificate II':
        return <GenerateTransferCertificate className="II"/>;
      case 'Exam Seating Cheats II':
        return <DynamicExamSeatingCheats className="II"/>;
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
      case 'View Punishments to Use III':
        return <ClassPunishment className="III" />;
      case 'Manage Students III':
        return <DirectStudents className="III" />;
      case 'Insert & View Attendance III': 
        return <Attendance className="III" />;
      case 'Leave Requests & Approvals III':
        return <LeaveRequestManagements className="III" />;
      case 'View Lecture & Homework Syl. III':
        return <SyllabusDailyPlan className="III" />;
      case 'Confirm Weekly HomeWork III':
        return <BiWeeklyClassHomwWork className="III" />;
      case 'View Institution Assignments III':
        return <ClassBiWeeklyAssignmentsPage className="III" />;
      case 'Student Behaviour Log III':
        return <DynamicStudentBehaviourLogDialog className="III" />;
      case 'Add Weekly Progress Test Marks III':
        return <ClassBiWeeklyTestPage className="III" />;
      case 'Insert Students Marks III':
        return <ClassSemesterResult className="III" />;
      case 'View Students Marks III':
        return <DownloadSemesterResultCard className="III" />;
      case 'View Instructed Books III':
        return <ClassSubjectBooks className="III" />;
      case 'Healthy Foods Suggestion III':
        return <DynamicFoodsInstructions className="III" />;
      case 'Guardian Communication Log III': 
        return <DynamicClassGuardianCommunication className="III" />;
      case 'Guardian Call FBW Report III':
        return <GuardianCallLogsPage className="III" />;
      case 'Parent-Teacher Meeting Notes III':
        return <DynamicClassParentTeacherMeetingNotes className="III" />;
      case 'Monthly Fees III':
        return <DynamicMonthlyFeeManagement className="III" />;
      case "Semester Exams TimeTable III": 
        return <SemesterExamsDateClassWise className="III"/>; 
      case 'Admit Cards III':
        return <ClassAdmitCards className="III" />;
      case 'ReAdmission from Class III -> IV': 
        return <DynamicReadmissionManagement className="III" />;
      case 'Knights CDTP Sessions III':
        return <DynamicClassKnightsCDTPPage className="III" />;
      case 'Public Speaking Occasion III':
        return <DynamicClassPublicSpeechOccassion className="III" />;
      case 'Annual Public Competition III':
        return <DynamicClassPublicSpeakingOccasionPage className="III" />;
      case 'Generate Transfer Certificate III':
        return <GenerateTransferCertificate className="III" />;
      case 'Exam Seating Cheats III':
        return <DynamicExamSeatingCheats className="III" />;
//////////////////////////////////////////////////////////////////////////////////////////////
      case 'Manage Students IV':
        return <DirectStudents className="IV" />;
      case 'Insert & View Attendance IV': 
        return <Attendance className="IV" />;
      case 'Leave Requests & Approvals IV':
        return <LeaveRequestManagements className="IV" />;
      case 'View Lecture & Homework Syl. IV':
        return <SyllabusDailyPlan className="IV" />;
      case 'Confirm Weekly HomeWork IV':
        return <BiWeeklyClassHomwWork className="IV" />;
      case 'View Institution Assignments IV':
        return <ClassBiWeeklyAssignmentsPage className="IV" />;
      case 'Add Weekly Progress Test Marks IV':
        return <ClassBiWeeklyTestPage className="IV" />;
      case 'View Punishments to Use IV':
        return <ClassPunishment className="IV" />;
      case 'Student Behaviour Log IV':
        return <DynamicStudentBehaviourLogDialog className="IV" />;
      case 'Insert Students Marks IV':
        return <ClassSemesterResult className="IV" />;
      case 'View Students Marks IV':
        return <DownloadSemesterResultCard className="IV" />;
      case 'View Instructed Books IV':
        return <ClassSubjectBooks className="IV" />;
      case 'Healthy Foods Suggestion IV':
        return <DynamicFoodsInstructions className="IV" />;
      case 'Guardian Communication Log IV': 
        return <DynamicClassGuardianCommunication className="IV" />;
      case 'Guardian Call FBW Report IV':
        return <GuardianCallLogsPage className="IV" />;
      case 'Parent-Teacher Meeting Notes IV':
        return <DynamicClassParentTeacherMeetingNotes className="IV" />;
      case 'Monthly Fees IV':
        return <DynamicMonthlyFeeManagement className="IV" />;
      case "Semester Exams TimeTable IV": 
        return <SemesterExamsDateClassWise className="IV"/>; 
      case 'Admit Cards IV':
        return <ClassAdmitCards className="IV" />;
      case 'ReAdmission from Class IV -> V': 
        return <DynamicReadmissionManagement className="IV" />;
      case 'Knights CDTP Sessions IV':
        return <DynamicClassKnightsCDTPPage className="IV" />;
      case 'Public Speaking Occasion IV':
        return <DynamicClassPublicSpeechOccassion className="IV" />;
      case 'Annual Public Competition IV':
        return <DynamicClassPublicSpeakingOccasionPage className="IV" />;
      case 'Generate Transfer Certificate IV':
        return <GenerateTransferCertificate className="IV" />;
      case 'Exam Seating Cheats IV':
        return <DynamicExamSeatingCheats className="IV" />;
///////////////////////////////////////////////////////////////////////////////////////////////
      case 'View Punishments to Use V':
        return <ClassPunishment className="V" />;
      case 'Manage Students V':
        return <DirectStudents className="V" />;
      case 'Insert & View Attendance V': 
        return <Attendance className="V" />;
      case 'Leave Requests & Approvals V':
        return <LeaveRequestManagements className="V" />;
      case 'View Lecture & Homework Syl. V':
        return <SyllabusDailyPlan className="V" />;
      case 'Confirm Weekly HomeWork V':
        return <BiWeeklyClassHomwWork className="V" />;
      case 'View Institution Assignments V':
        return <ClassBiWeeklyAssignmentsPage className="V" />;
      case 'Student Behaviour Log V':
        return <DynamicStudentBehaviourLogDialog className="V" />;
      case 'Add Weekly Progress Test Marks V':
        return <ClassBiWeeklyTestPage className="V" />;
      case 'Insert Students Marks V':
        return <ClassSemesterResult className="V" />;
      case 'View Students Marks V':
        return <DownloadSemesterResultCard className="V" />;
      case 'View Instructed Books V':
        return <ClassSubjectBooks className="V" />;
      case 'Healthy Foods Suggestion V':
        return <DynamicFoodsInstructions className="V" />;
      case 'Guardian Communication Log V': 
        return <DynamicClassGuardianCommunication className="V" />;
      case 'Guardian Call FBW Report V':
        return <GuardianCallLogsPage className="V" />;
      case 'Parent-Teacher Meeting Notes V':
        return <DynamicClassParentTeacherMeetingNotes className="V" />;
      case 'Monthly Fees V':
        return <DynamicMonthlyFeeManagement className="V" />;
      case "Semester Exams TimeTable V": 
        return <SemesterExamsDateClassWise className="V"/>; 
      case 'Admit Cards V':
        return <ClassAdmitCards className="V" />;
      case 'ReAdmission from Class V -> VI': 
        return <DynamicReadmissionManagement className="V" />;
      case 'Knights CDTP Sessions V':
        return <DynamicClassKnightsCDTPPage className="V" />;
      case 'Public Speaking Occasion V':
        return <DynamicClassPublicSpeechOccassion className="V" />;
      case 'Annual Public Competition V':
        return <DynamicClassPublicSpeakingOccasionPage className="V" />;
      case 'Generate Transfer Certificate V':
        return <GenerateTransferCertificate className="V" />;
      case 'Exam Seating Cheats V':
        return <DynamicExamSeatingCheats className="V" />;
///////////////////////////////////////////////////////////////////////////
      case 'View Punishments to Use VI':
        return <ClassPunishment className="VI"/>
      case 'Manage Students VI':
        return <DirectStudents className={'VI'}/>; 
      case 'Insert & View Attendance VI': 
        return <Attendance className="VI" />
      case 'Leave Requests & Approvals VI':
        return <LeaveRequestManagements className="VI"/>;
      case 'View Lecture & Homework Syl. VI':
        return <SyllabusDailyPlan className="VI"/>;
      case 'Confirm Weekly HomeWork VI':
        return <BiWeeklyClassHomwWork className="VI"/>;
      case 'View Institution Assignments VI':
        return <ClassBiWeeklyAssignmentsPage className="VI"/>;
      case 'Student Behaviour Log VI':
        return <DynamicStudentBehaviourLogDialog className="VI"/>; 
      case 'Add Weekly Progress Test Marks VI':
        return <ClassBiWeeklyTestPage className="VI"/>;
      case 'Insert Students Marks VI':
        return <ClassSemesterResult className="VI"/>;
      case 'View Students Marks VI':
        return <DownloadSemesterResultCard className="VI"/>;
      case 'View Instructed Books VI':
        return <ClassSubjectBooks className="VI"/>;
      case 'Healthy Foods Suggestion VI':
        return <DynamicFoodsInstructions className="VI"/>;
      case 'Guardian Communication Log VI': 
        return <DynamicClassGuardianCommunication className="VI"/>;
      case 'Guardian Call FBW Report VI':
        return <GuardianCallLogsPage className="VI"/>;
      case 'Parent-Teacher Meeting Notes VI':
        return <DynamicClassParentTeacherMeetingNotes className='VI'/>; 
      case 'Monthly Fees VI':
        return <DynamicMonthlyFeeManagement className="VI"/>;
      case "Semester Exams TimeTable VI": 
        return <SemesterExamsDateClassWise className="VI"/>; 
      case 'Admit Cards VI':
        return <ClassAdmitCards className="VI"/>;
      case 'ReAdmission from Class VI -> VII': 
        return <DynamicReadmissionManagement className="VI"/>; 
      case 'Knights CDTP Sessions VI':
        return <DynamicClassKnightsCDTPPage className="VI"/>;
      case 'Public Speaking Occasion VI':
        return <DynamicClassPublicSpeechOccassion className="VI"/>;
      case 'Annual Public Competition VI':
        return <DynamicClassPublicSpeakingOccasionPage className={"VI"}/>; 
      case 'Generate Transfer Certificate VI':
        return <GenerateTransferCertificate className="VI"/>;
      case 'Exam Seating Cheats VI':
        return <DynamicExamSeatingCheats className="VI"/>; 
///////////////////////////////////////////////////////////////////////////
// Class VII
      case 'View Punishments to Use VII':
        return <ClassPunishment className="VII" />;
      case 'Manage Students VII':
        return <DirectStudents className="VII" />;
      case 'Insert & View Attendance VII': 
        return <Attendance className="VII" />;
      case 'Leave Requests & Approvals VII':
        return <LeaveRequestManagements className="VII" />;
      case 'View Lecture & Homework Syl. VII':
        return <SyllabusDailyPlan className="VII" />;
      case 'Confirm Weekly HomeWork VII':
        return <BiWeeklyClassHomwWork className="VII" />;
      case 'View Institution Assignments VII':
        return <ClassBiWeeklyAssignmentsPage className="VII" />;
      case 'Student Behaviour Log VII':
        return <DynamicStudentBehaviourLogDialog className="VII" />;
      case 'Add Weekly Progress Test Marks VII':
        return <ClassBiWeeklyTestPage className="VII" />;
      case 'Insert Students Marks VII':
        return <ClassSemesterResult className="VII" />;
      case 'View Students Marks VII':
        return <DownloadSemesterResultCard className="VII" />;
      case 'View Instructed Books VII':
        return <ClassSubjectBooks className="VII" />;
      case 'Healthy Foods Suggestion VII':
        return <DynamicFoodsInstructions className="VII" />;
      case 'Guardian Communication Log VII': 
        return <DynamicClassGuardianCommunication className="VII" />;
      case 'Guardian Call FBW Report VII':
        return <GuardianCallLogsPage className="VII" />;
      case 'Parent-Teacher Meeting Notes VII':
        return <DynamicClassParentTeacherMeetingNotes className="VII" />;
      case 'Monthly Fees VII':
        return <DynamicMonthlyFeeManagement className="VII" />;
      case "Semester Exams TimeTable VII": 
        return <SemesterExamsDateClassWise className="VII"/>; 
      case 'Admit Cards VII':
        return <ClassAdmitCards className="VII" />;
      case 'ReAdmission from Class VII -> VIII': 
        return <DynamicReadmissionManagement className="VII" />;
      case 'Knights CDTP Sessions VII':
        return <DynamicClassKnightsCDTPPage className="VII" />;
      case 'Public Speaking Occasion VII':
        return <DynamicClassPublicSpeechOccassion className="VII" />;
      case 'Annual Public Competition VII':
        return <DynamicClassPublicSpeakingOccasionPage className="VII" />;
      case 'Generate Transfer Certificate VII':
        return <GenerateTransferCertificate className="VII" />;
      case 'Exam Seating Cheats VII':
        return <DynamicExamSeatingCheats className="VII" />;

      // Class VIII
      case 'View Punishments to Use VIII':
        return <ClassPunishment className="VIII" />;
      case 'Manage Students VIII':
        return <DirectStudents className="VIII" />;
      case 'Insert & View Attendance VIII': 
        return <Attendance className="VIII" />;
      case 'Leave Requests & Approvals VIII':
        return <LeaveRequestManagements className="VIII" />;
      case 'View Lecture & Homework Syl. VIII':
        return <SyllabusDailyPlan className="VIII" />;
      case 'Confirm Weekly HomeWork VIII':
        return <BiWeeklyClassHomwWork className="VIII" />;
      case 'View Institution Assignments VIII':
        return <ClassBiWeeklyAssignmentsPage className="VIII" />;
      case 'Student Behaviour Log VIII':
        return <DynamicStudentBehaviourLogDialog className="VIII" />;
      case 'Add Weekly Progress Test Marks VIII':
        return <ClassBiWeeklyTestPage className="VIII" />;
      case 'Insert Students Marks VIII':
        return <ClassSemesterResult className="VIII" />;
      case 'View Students Marks VIII':
        return <DownloadSemesterResultCard className="VIII" />;
      case 'View Instructed Books VIII':
        return <ClassSubjectBooks className="VIII" />;
      case 'Healthy Foods Suggestion VIII':
        return <DynamicFoodsInstructions className="VIII" />;
      case 'Guardian Communication Log VIII': 
        return <DynamicClassGuardianCommunication className="VIII" />;
      case 'Guardian Call FBW Report VIII':
        return <GuardianCallLogsPage className="VIII" />;
      case 'Parent-Teacher Meeting Notes VIII':
        return <DynamicClassParentTeacherMeetingNotes className="VIII" />;
      case 'Monthly Fees VIII':
        return <DynamicMonthlyFeeManagement className="VIII" />;
      case "Semester Exams TimeTable VIII": 
        return <SemesterExamsDateClassWise className="VIII"/>; 
      case 'Admit Cards VIII':
        return <ClassAdmitCards className="VIII" />;
      case 'ReAdmission from Class VIII -> IX': 
        return <DynamicReadmissionManagement className="VIII" />;
      case 'Knights CDTP Sessions VIII':
        return <DynamicClassKnightsCDTPPage className="VIII" />;
      case 'Public Speaking Occasion VIII':
        return <DynamicClassPublicSpeechOccassion className="VIII" />;
      case 'Annual Public Competition VIII':
        return <DynamicClassPublicSpeakingOccasionPage className="VIII" />;
      case 'Generate Transfer Certificate VIII':
        return <GenerateTransferCertificate className="VIII" />;
      case 'Exam Seating Cheats VIII':
        return <DynamicExamSeatingCheats className="VIII" />;

      // Class IX
      case 'View Punishments to Use IX':
        return <ClassPunishment className="IX" />;
      case 'Manage Students IX':
        return <DirectStudents className="IX" />;
      case 'Insert & View Attendance IX': 
        return <Attendance className="IX" />;
      case 'Leave Requests & Approvals IX':
        return <LeaveRequestManagements className="IX" />;
      case 'View Lecture & Homework Syl. IX':
        return <SyllabusDailyPlan className="IX" />;
      case 'Confirm Weekly HomeWork IX':
        return <BiWeeklyClassHomwWork className="IX" />;
      case 'View Institution Assignments IX':
        return <ClassBiWeeklyAssignmentsPage className="IX" />;
      case 'Student Behaviour Log IX':
        return <DynamicStudentBehaviourLogDialog className="IX" />;
      case 'Add Weekly Progress Test Marks IX':
        return <ClassBiWeeklyTestPage className="IX" />;
      case 'Insert Students Marks IX':
        return <ClassSemesterResult className="IX" />;
      case 'View Students Marks IX':
        return <DownloadSemesterResultCard className="IX" />;
      case 'View Instructed Books IX':
        return <ClassSubjectBooks className="IX" />;
      case 'Healthy Foods Suggestion IX':
        return <DynamicFoodsInstructions className="IX" />;
      case 'Guardian Communication Log IX': 
        return <DynamicClassGuardianCommunication className="IX" />;
      case 'Guardian Call FBW Report IX':
        return <GuardianCallLogsPage className="IX" />;
      case 'Parent-Teacher Meeting Notes IX':
        return <DynamicClassParentTeacherMeetingNotes className="IX" />;
      case 'Monthly Fees IX':
        return <DynamicMonthlyFeeManagement className="IX" />;
      case "Semester Exams TimeTable IX": 
        return <SemesterExamsDateClassWise className="IX"/>; 
      case 'Admit Cards IX':
        return <ClassAdmitCards className="IX" />;
      case 'ReAdmission from Class IX -> X': 
        return <DynamicReadmissionManagement className="IX" />;
      case 'Knights CDTP Sessions IX':
        return <DynamicClassKnightsCDTPPage className="IX" />;
      case 'Public Speaking Occasion IX':
        return <DynamicClassPublicSpeechOccassion className="IX" />;
      case 'Annual Public Competition IX':
        return <DynamicClassPublicSpeakingOccasionPage className="IX" />;
      case 'Generate Transfer Certificate IX':
        return <GenerateTransferCertificate className="IX" />;
      case 'Exam Seating Cheats IX':
        return <DynamicExamSeatingCheats className="IX" />;

      // Class X
      case 'View Punishments to Use X':
        return <ClassPunishment className="X" />;
      case 'Manage Students X':
        return <DirectStudents className="X" />;
      case 'Insert & View Attendance X': 
        return <Attendance className="X" />;
      case 'Leave Requests & Approvals X':
        return <LeaveRequestManagements className="X" />;
      case 'View Lecture & Homework Syl. X':
        return <SyllabusDailyPlan className="X" />;
      case 'Confirm Weekly HomeWork X':
        return <BiWeeklyClassHomwWork className="X" />;
      case 'View Institution Assignments X':
        return <ClassBiWeeklyAssignmentsPage className="X" />;
      case 'Student Behaviour Log X':
        return <DynamicStudentBehaviourLogDialog className="X" />;
      case 'Add Weekly Progress Test Marks X':
        return <ClassBiWeeklyTestPage className="X" />;
      case 'Insert Students Marks X':
        return <ClassSemesterResult className="X" />;
      case 'View Students Marks X':
        return <DownloadSemesterResultCard className="X" />;
      case 'View Instructed Books X':
        return <ClassSubjectBooks className="X" />;
      case 'Healthy Foods Suggestion X':
        return <DynamicFoodsInstructions className="X" />;
      case 'Guardian Communication Log X': 
        return <DynamicClassGuardianCommunication className="X" />;
      case 'Guardian Call FBW Report X':
        return <GuardianCallLogsPage className="X" />;
      case 'Parent-Teacher Meeting Notes X':
        return <DynamicClassParentTeacherMeetingNotes className="X" />;
      case 'Monthly Fees X':
        return <DynamicMonthlyFeeManagement className="X" />;
      case "Semester Exams TimeTable X": 
        return <SemesterExamsDateClassWise className="X"/>; 
      case 'Admit Cards X':
        return <ClassAdmitCards className="X" />;
      case 'ReAdmission from Class X -> XS': 
        return <DynamicReadmissionManagement className="X" />;
      case 'Knights CDTP Sessions X':
        return <DynamicClassKnightsCDTPPage className="X" />;
      case 'Public Speaking Occasion X':
        return <DynamicClassPublicSpeechOccassion className="X" />;
      case 'Annual Public Competition X':
        return <DynamicClassPublicSpeakingOccasionPage className="X" />;
      case 'Generate Transfer Certificate X':
        return <GenerateTransferCertificate className="X" />;
      case 'Exam Seating Cheats X':
        return <DynamicExamSeatingCheats className="X" />;
      case 'Knights WB Test Preparation Series X':
        return <BoardExamsResultManagement className="X"/>
      case 'Insert Students Marks XS':
        return <ClassSemesterResult className="XS" />;

      // Class XS
      case 'View Punishments to Use XS':
        return <ClassPunishment className="XS" />;
      case 'Manage Students XS':
        return <DirectStudents className="XS" />;
      case 'Insert & View Attendance XS': 
        return <Attendance className="XS" />;
      case 'Leave Requests & Approvals XS':
        return <LeaveRequestManagements className="XS" />;
      case 'View Lecture & Homework Syl. XS':
        return <SyllabusDailyPlan className="XS" />;
      case 'Confirm Weekly HomeWork XS':
        return <BiWeeklyClassHomwWork className="XS" />;
      case 'View Institution Assignments XS':
        return <ClassBiWeeklyAssignmentsPage className="XS" />;
      case 'Student Behaviour Log XS':
        return <DynamicStudentBehaviourLogDialog className="XS" />;
      case 'Add Weekly Progress Test Marks XS':
        return <ClassBiWeeklyTestPage className="XS" />;
      case 'View Students Marks XS':
        return <DownloadSemesterResultCard className="XS" />;
      case 'View Instructed Books XS':
        return <ClassSubjectBooks className="XS" />;
      case 'Healthy Foods Suggestion XS':
        return <DynamicFoodsInstructions className="XS" />;
      case 'Guardian Communication Log XS': 
        return <DynamicClassGuardianCommunication className="XS" />;
      case 'Guardian Call FBW Report XS':
        return <GuardianCallLogsPage className="XS" />;
      case 'Parent-Teacher Meeting Notes XS':
        return <DynamicClassParentTeacherMeetingNotes className="XS" />;
      case 'Monthly Fees XS':
        return <DynamicMonthlyFeeManagement className="XS" />;
      case "Semester Exams TimeTable XS": 
        return <SemesterExamsDateClassWise className="XS"/>; 
      case 'Admit Cards XS':
        return <ClassAdmitCards className="XS" />;
      case 'ReAdmission from Class XS -> XI': 
        return <DynamicReadmissionManagement className="XS" />;
      case 'Knights CDTP Sessions XS':
        return <DynamicClassKnightsCDTPPage className="XS" />;
      case 'Public Speaking Occasion XS':
        return <DynamicClassPublicSpeechOccassion className="XS" />;
      case 'Annual Public Competition XS':
        return <DynamicClassPublicSpeakingOccasionPage className="XS" />;
      case 'Generate Transfer Certificate XS':
        return <GenerateTransferCertificate className="XS" />;
      case 'Exam Seating Cheats XS':
        return <DynamicExamSeatingCheats className="XS" />;
      case 'Knights WB Test Preparation Series XS':
        return <BoardExamsResultManagement className="XS"/>

      // Class XI
      case 'View Punishments to Use XI':
        return <ClassPunishment className="XI" />;
      case 'Manage Students XI':
        return <DirectStudents className="XI" />;
      case 'Insert & View Attendance XI': 
        return <Attendance className="XI" />;
      case 'Leave Requests & Approvals XI':
        return <LeaveRequestManagements className="XI" />;
      case 'View Lecture & Homework Syl. XI':
        return <SyllabusDailyPlan className="XI" />;
      case 'Confirm Weekly HomeWork XI':
        return <BiWeeklyClassHomwWork className="XI" />;
      case 'View Institution Assignments XI':
        return <ClassBiWeeklyAssignmentsPage className="XI" />;
      case 'Student Behaviour Log XI':
        return <DynamicStudentBehaviourLogDialog className="XI" />;
      case 'Add Weekly Progress Test Marks XI':
        return <ClassBiWeeklyTestPage className="XI" />;
      case 'Insert Students Marks XI':
        return <ClassSemesterResult className="XI" />;
      case 'View Students Marks XI':
        return <DownloadSemesterResultCard className="XI" />;
      case 'View Instructed Books XI':
        return <ClassSubjectBooks className="XI" />;
      case 'Healthy Foods Suggestion XI':
        return <DynamicFoodsInstructions className="XI" />;
      case 'Guardian Communication Log XI': 
        return <DynamicClassGuardianCommunication className="XI" />;
      case 'Guardian Call FBW Report XI':
        return <GuardianCallLogsPage className="XI" />;
      case 'Parent-Teacher Meeting Notes XI':
        return <DynamicClassParentTeacherMeetingNotes className="XI" />;
      case 'Monthly Fees XI':
        return <DynamicMonthlyFeeManagement className="XI" />;
      case "Semester Exams TimeTable XI": 
        return <SemesterExamsDateClassWise className="XI"/>; 
      case 'Admit Cards XI':
        return <ClassAdmitCards className="XI" />;
      case 'ReAdmission from Class XI -> XII': 
        return <DynamicReadmissionManagement className="XI" />;
      case 'Knights CDTP Sessions XI':
        return <DynamicClassKnightsCDTPPage className="XI" />;
      case 'Public Speaking Occasion XI':
        return <DynamicClassPublicSpeechOccassion className="XI" />;
      case 'Annual Public Competition XI':
        return <DynamicClassPublicSpeakingOccasionPage className="XI" />;
      case 'Generate Transfer Certificate XI':
        return <GenerateTransferCertificate className="XI" />;
      case 'Exam Seating Cheats XI':
        return <DynamicExamSeatingCheats className="XI" />;
      case 'Knights WB Test Preparation Series XI':
        return <BoardExamsResultManagement className="XI"/>

      // Class XII
      case 'View Punishments to Use XII':
        return <ClassPunishment className="XII" />;
      case 'Manage Students XII':
        return <DirectStudents className="XII" />;
      case 'Insert & View Attendance XII': 
        return <Attendance className="XII" />;
      case 'Leave Requests & Approvals XII':
        return <LeaveRequestManagements className="XII" />;
      case 'View Lecture & Homework Syl. XII':
        return <SyllabusDailyPlan className="XII" />;
      case 'Confirm Weekly HomeWork XII':
        return <BiWeeklyClassHomwWork className="XII" />;
      case 'View Institution Assignments XII':
        return <ClassBiWeeklyAssignmentsPage className="XII" />;
      case 'Student Behaviour Log XII':
        return <DynamicStudentBehaviourLogDialog className="XII" />;
      case 'Add Weekly Progress Test Marks XII':
        return <ClassBiWeeklyTestPage className="XII" />;
      case 'Insert Students Marks XII':
        return <ClassSemesterResult className="XII" />;
      case 'View Students Marks XII':
        return <DownloadSemesterResultCard className="XII" />;
      case 'View Instructed Books XII':
        return <ClassSubjectBooks className="XII" />;
      case 'Healthy Foods Suggestion XII':
        return <DynamicFoodsInstructions className="XII" />;
      case 'Guardian Communication Log XII': 
        return <DynamicClassGuardianCommunication className="XII" />;
      case 'Guardian Call FBW Report XII':
        return <GuardianCallLogsPage className="XII" />;
      case 'Parent-Teacher Meeting Notes XII':
        return <DynamicClassParentTeacherMeetingNotes className="XII" />;
      case 'Monthly Fees XII':
        return <DynamicMonthlyFeeManagement className="XII" />;
      case "Semester Exams TimeTable XII": 
        return <SemesterExamsDateClassWise className="XII"/>; 
      case 'Admit Cards XII':
        return <ClassAdmitCards className="XII" />;
      case 'ReAdmission from Class XII -> XIIS': 
        return <DynamicReadmissionManagement className="XII" />;
      case 'Knights CDTP Sessions XII':
        return <DynamicClassKnightsCDTPPage className="XII" />;
      case 'Public Speaking Occasion XII':
        return <DynamicClassPublicSpeechOccassion className="XII" />;
      case 'Annual Public Competition XII':
        return <DynamicClassPublicSpeakingOccasionPage className="XII" />;
      case 'Generate Transfer Certificate XII':
        return <GenerateTransferCertificate className="XII" />;
      case 'Exam Seating Cheats XII':
        return <DynamicExamSeatingCheats className="XII" />;
      case 'Knights WB Test Preparation Series XII':
        return <BoardExamsResultManagement className="XII"/>

      // Class XIIS
      case 'View Punishments to Use XIIS':
        return <ClassPunishment className="XIIS" />;
      case 'Manage Students XIIS':
        return <DirectStudents className="XIIS" />;
      case 'Insert & View Attendance XIIS': 
        return <Attendance className="XIIS" />;
      case 'Leave Requests & Approvals XIIS':
        return <LeaveRequestManagements className="XIIS" />;
      case 'View Lecture & Homework Syl. XIIS':
        return <SyllabusDailyPlan className="XIIS" />;
      case 'Confirm Weekly HomeWork XIIS':
        return <BiWeeklyClassHomwWork className="XIIS" />;
      case 'View Institution Assignments XIIS':
        return <ClassBiWeeklyAssignmentsPage className="XIIS" />;
      case 'Student Behaviour Log XIIS':
        return <DynamicStudentBehaviourLogDialog className="XIIS" />;
      case 'Add Weekly Progress Test Marks XIIS':
        return <ClassBiWeeklyTestPage className="XIIS" />;
      case 'Insert Students Marks XIIS':
        return <ClassSemesterResult className="XIIS" />;
      case 'View Students Marks XIIS':
        return <DownloadSemesterResultCard className="XIIS" />;
      case 'View Instructed Books XIIS':
        return <ClassSubjectBooks className="XIIS" />;
      case 'Healthy Foods Suggestion XIIS':
        return <DynamicFoodsInstructions className="XIIS" />;
      case 'GuardianGt;Communication Log XIIS': 
        return <DynamicClassGuardianCommunication className="XIIS" />;
      case 'Guardian Call FBW Report XIIS':
        return <GuardianCallLogsPage className="XIIS" />;
      case 'Parent-Teacher Meeting Notes XIIS':
        return <DynamicClassParentTeacherMeetingNotes className="XIIS" />;
      case 'Monthly Fees XIIS':
        return <DynamicMonthlyFeeManagement className="XIIS" />;
      case "Semester Exams TimeTable XIIS": 
        return <SemesterExamsDateClassWise className="XIIS"/>; 
      case 'Admit Cards XIIS':
        return <ClassAdmitCards className="XIIS" />;
      case 'ReAdmission from Class XIIS -> XIIIJ': 
        return <DynamicReadmissionManagement className="XIIS" />;
      case 'Knights CDTP Sessions XIIS':
        return <DynamicClassKnightsCDTPPage className="XIIS" />;
      case 'Public Speaking Occasion XIIS':
        return <DynamicClassPublicSpeechOccassion className="XIIS" />;
      case 'Annual Public Competition XIIS':
        return <DynamicClassPublicSpeakingOccasionPage className="XIIS" />;
      case 'Generate Transfer Certificate XIIS':
        return <GenerateTransferCertificate className="XIIS" />;
      case 'Exam Seating Cheats XIIS':
        return <DynamicExamSeatingCheats className="XIIS" />;
      case 'Knights WB Test Preparation Series XIIS':
        return <BoardExamsResultManagement className="XIIS"/>

      // Class XIIIJ
      case 'View Punishments to Use XIIIJ':
        return <ClassPunishment className="XIIIJ" />;
      case 'Manage Students XIIIJ':
        return <DirectStudents className="XIIIJ" />;
      case 'Insert & View Attendance XIIIJ': 
        return <Attendance className="XIIIJ" />;
      case 'Leave Requests & Approvals XIIIJ':
        return <LeaveRequestManagements className="XIIIJ" />;
      case 'View Lecture & Homework Syl. XIIIJ':
        return <SyllabusDailyPlan className="XIIIJ" />;
      case 'Confirm Weekly HomeWork XIIIJ':
        return <BiWeeklyClassHomwWork className="XIIIJ" />;
      case 'View Institution Assignments XIIIJ':
        return <ClassBiWeeklyAssignmentsPage className="XIIIJ" />;
      case 'Student Behaviour Log XIIIJ':
        return <DynamicStudentBehaviourLogDialog className="XIIIJ" />;
      case 'Add Weekly Progress Test Marks XIIIJ':
        return <ClassBiWeeklyTestPage className="XIIIJ" />;
      case 'Insert Students Marks XIIIJ':
        return <ClassSemesterResult className="XIIIJ" />;
      case 'View Students Marks XIIIJ':
        return <DownloadSemesterResultCard className="XIIIJ" />;
      case 'View Instructed Books XIIIJ':
        return <ClassSubjectBooks className="XIIIJ" />;
      case 'Healthy Foods Suggestion XIIIJ':
        return <DynamicFoodsInstructions className="XIIIJ" />;
      case 'Guardian Communication Log XIIIJ': 
        return <DynamicClassGuardianCommunication className="XIIIJ" />;
      case 'Guardian Call FBW Report XIIIJ':
        return <GuardianCallLogsPage className="XIIIJ" />;
      case 'Parent-Teacher Meeting Notes XIIIJ':
        return <DynamicClassParentTeacherMeetingNotes className="XIIIJ" />;
      case 'Monthly Fees XIIIJ':
        return <DynamicMonthlyFeeManagement className="XIIIJ" />;
      case 'Admit Cards XIIIJ':
        return <ClassAdmitCards className="XIIIJ" />;
      case 'ReAdmission from Class XIIIJ -> Next': 
        return <DynamicReadmissionManagement className="XIIIJ" />;
      case 'Knights CDTP Sessions XIIIJ':
        return <DynamicClassKnightsCDTPPage className="XIIIJ" />;
      case 'Public Speaking Occasion XIIIJ':
        return <DynamicClassPublicSpeechOccassion className="XIIIJ" />;
      case 'Annual Public Competition XIIIJ':
        return <DynamicClassPublicSpeakingOccasionPage className="XIIIJ" />;
      case 'Generate Transfer Certificate XIIIJ':
        return <GenerateTransferCertificate className="XIIIJ" />;
      case 'Exam Seating Cheats XIIIJ':
        return <DynamicExamSeatingCheats className="XIIIJ" />;
//////////////////////////////////////////////////////////////////////////////////////////
      // Canonical Administration navigation labels. Legacy encoded labels
      // remain below only so an already-open drawer state stays compatible.
      case 'Manage Fee Schemes':
        return <FeeManagement/>;
      case 'Admission Applications':
        return <AdmissionTestApplicationsManagement/>;
      case 'Create Admission Application':
        return <AdmissionTestApplicationsFormPanel/>;
      case 'Admission Test Admit Cards':
        return <ExploreAdmitCards/>;
      case 'Admission Test Schedule':
        return <AdmissionTestManagement/>;
      case 'Admission Test Subjects & Syllabus':
        return <TestSubjectSyllabusManagement/>;
      case 'Admission Test Seating':
        return <TestSeatingManagement/>;
      case 'Admission Test Evaluation':
        return <TestEvaluationManagement/>;
      case 'Admission Test Results & Rank':
        return <TestResultManagement/>;
      case 'Register Qualified Applicants':
        return <QualifiedsAdmissionManagement/>;
      case 'Direct Admission Registration':
        return <UnQualifiedsGeneralDirectAdmissionManagement/>;
      case 'Admission Forms & Receipts':
        return <AdmissionRecipts/>;
      case 'Admitted Students':
        return <AdmittedStudents/>;
      case 'Print Exam Seating Management': 
        return <SemesterExamSeating/>; 
      case 'Prayer & Oaths Selecteds':
        return <DisplayPrayerAndOath/>
///////////////////////////////////////////////////////////////////////////
      case '🧾 View Fee Schemes': 
        return <FeeManagement/>;
      case '🧾 Admission Test Applications': 
        return <AdmissionTestApplicationsManagement/>
      case '📝 Fill Admission Form': 
        return <AdmissionTestApplicationsFormPanel/>; 
      case '📥 Download Admit Card':
        return <ExploreAdmitCards/>; 
      case '📚 Admission Test Schedule': 
      return <AdmissionTestManagement/>; 
      case '🧠 Syllabus & Subject Info':
        return <TestSubjectSyllabusManagement/>; 
      case '📚 Print Application & Room No': 
        return <TestSeatingManagement/>; 
      case '🧪 Test Evaluation & Mark Entry':
        return <TestEvaluationManagement/>; 
      case '📊 View Result & Rank List':
        return <TestResultManagement/>; 
      case '📋 KSAT Qualifieds Registration': 
        return <QualifiedsAdmissionManagement/>; 
      case '📋 General Direct Registration': 
        return <UnQualifiedsGeneralDirectAdmissionManagement/>
      case '📄 Form ID & Fee Receipt': 
        return <AdmissionRecipts/>; 
      case '✅ Total Admitted Students': 
        return <AdmittedStudents/>; 
///////////////////////////////////////////////////////////////////////////      
      case 'Add School Teachers': 
        return <AddTeachingEmployee/>; 
      case 'Employee List':
        return <WorkforceDirectoryWorkspace/>;
      case 'Faculties List':
        return <WorkforceDirectoryWorkspace/>;
      case 'Employee Manage List':
        return <WorkforceDirectoryWorkspace/>;
      case 'Add Institution Profile':
        return <SchoolManagement/>; 
      case 'Add Institution Branches': 
        return <AddInstitutionBranches/>
      case 'Manage Classes & Class Teachers':
        return <AddInstitutionClasses/>;
      case 'Add Institution Classes':
        return <AddInstitutionClasses/>;
      case 'Assign Class Teachers':
        return <AddInstitutionClasses/>; 
      case 'Add Institution Subjects': 
        return <SubjectsManagement/>; 
      case 'Map Class to Subjects': 
        return <ClassSubjectsManagement/>; 
      case 'Assign Subject Teachers':
        return <ClassSubjectTeacherAssignment/>;
      case 'Add Class Rooms': 
        return <AddClassRoom/>; 
      case 'Semester Exams Panel':
        return <SemesterExamScheduleManagement/>; 
//////////////////////////////////////////////////////////////////////////
      case 'AdminPanel Carousel':
          return <SiteHomepageCarousel/>
      case 'Global Factory Employees':
          return <GlobalFactoryEmployees />;
      case 'Employee Attendance':
          return <EmployeeWiseAttendance/>;
      case 'Employee Monthly Salary':
          return <FactoryEmployeeSalary/>;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'Employee Attendance Logs':
         return <EmployeeWiseAttendance/>
      case 'Insert Employee Entrance':
        return <InsertEmployeeEntrance/>
      case 'Insert Employee Exit':
        return <InsertEmployeeExit/>
      case 'Work Types':
        return <WorkTypes/>
      case 'My Attendance':
        return <MyAttendance/>;
      case 'My Production Logs': 
        return <MyProductionLogs/>
      case 'My Received Salary History': 
        return <MySalaryHistory/>; 
      case 'My Current Month Salary': 
        return <MyCurrentMonthSalary/>; 
      case 'My Daily Net Sales Bonus': 
        return <MyDailyNetSalesBonus/>; 
      case 'My Daily Sales Bonus Analysis':
        return <MyDailyDetailedSalesBonus/>
      case 'My Mothly Net Salary & Bonus': 
        return <MonthlyTotalSalesSalaryAndBonus/>
////////////////////////////////////////////////////////////////////////////
      case 'Insert Faculty Entrance': 
        return <InsertFactoryEmployeeEntrance/>;
      case 'Insert Faculty Exit': 
        return <InsertFactoryEmployeeExit/>
      case 'Faculty Attendance': 
        return <FactoryEmployeeWiseAttendance/>;
      case 'View Faculty Attendance & Salary':
        return <FactoryEmployeeWiseAttendance/>;
      case 'Faculty Monthly Salary': 
        return <FacultyPayrollWorkspace/>;
      case 'Faculty Payment Panel': 
        return <FacultyPayrollWorkspace/>;
////////////////////////////////////////////////////////////////////////////
      case "Brands": 
        return <Brands/>; 
      case "Fleets": 
        return <Fleets/>; 
      case "Depots":
        return <Depots/>; 
      case "Vehicle Documents":
        return <VehicleDocuments/>; 
      case "Vehicle Maintenance Logs": 
        return <VehicleMaintenanceLogs/>; 
////////////////////////////////////////////////////////////////////////////
      case "Upload & View Images": 
        return <UploadImagesPanel/>; 
////////////////////////////////////////////////////////////////////////////
      case 'Explore Customers':
        return <BrowseCustomers />;
      case 'Explore Departments':
        return <BrowseDepartments />;
      case 'Explore Districts':
        return <BrowseDistricts />;
      case 'Explore Notifications':
        return <BrowseNotifications />;
      case 'Explore Payments':
        return <BrowsePayments />;
      case 'Explore States':
        return <BrowseStates />;
      case 'Explore Taxes':
        return <BrowseTaxes />;
////////////////////////////////////////////////////////////////////////////////
      case "Manage Feature Platforms":
        return <SiteFeaturePlatforms/>;
      case "Modify Feature Galaxies": 
        return <SiteFeaturePlatforms/>;
      case "Modify Site Navbar":
        return <SiteHomePageNavbar/>;
      case "Modify Site Carousel":
        return <WebSiteHomepageCarousel/>; 
      case "Modify Achievements Carousel":
        return <SiteCarouselTwo/>;
      case "Explore Enquiries":
        return <SchoolEnquary/>;
      case "Explore Enquaries":
        return <SchoolEnquary/>;
      case "Modify Feature Technologies":
        return <FeatureTechnology/>;
      case "Modify School in Cities":
        return <FeatureSchoolCenterCities/>;
      case "Modify Feature Students":
        return <FeatureStudentsResults/>;
      case "Modify Feature YT Videos":
        return <KnowledgeTopics/>;
      case "Manage Featured Programs":
        return <FeatureSchoolPrograms/>;
      case "Modify Featured Programs":
        return <FeatureSchoolPrograms/>;
      case "Modify WikiGalaxy Articles":
        return <KnowledgeTopics/>;  
//////////////////////////////////////////////////////////////////////////////
      default:
        return <CentralCommandCenter />;
  
    }
  };

  return (
    <Box sx={{backgroundColor:"#000"}}>
      {renderContent()}
    </Box>
  );
}

export default ContentArea;
