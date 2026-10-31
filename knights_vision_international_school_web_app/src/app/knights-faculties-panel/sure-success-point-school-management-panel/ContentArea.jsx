import React from "react";
import { Box } from "@mui/material";
import FactoryEmployeeSalary from "./attendance_and_salary/EmployeeSalary";
import EmployeeWiseAttendance from "./attendance_and_salary/EmployeeWiseAttendance";

import InsertEmployeeEntrance from "./attendance_and_salary/InsertEmployeeEntrance";
import InsertEmployeeExit from "./attendance_and_salary/InsertEmployeeExit";
import EmployeeInfoList from "./admin/EmployeeInfoList";
import EmployeeManageList from "./admin/EmployeeManageList";
import MyAttendance from "./school_teachers/MyAttendance";
import MyCurrentMonthSalary from "./school_teachers/MyCurrentMonthSalary";
import MySalaryHistory from "./school_teachers/MySalaryHistroy";
import FactoryEmployeePaymentPanel from "./attendance_and_salary/EmployeePaymentPanel";

import InsertFactoryEmployeeEntrance from "./attendance_and_salary/InsertEmployeeEntrance";
import InsertFactoryEmployeeExit from "./attendance_and_salary/InsertEmployeeExit";
import FactoryEmployeeWiseAttendance from "./attendance_and_salary/EmployeeAttendanceLogs";
import FactoryEmployeeSalaryPanel from "./attendance_and_salary/EmployeeSalary";
import Brands from "./admin/Brands";

import Fleets from "./fleets_management/Fleets";
import Depots from "./fleets_management/Depots";
import VehicleDocuments from "./fleets_management/VehicleDocuments";
import VehicleMaintenanceLogs from "./fleets_management/VehicleMaintenanceLogs";
import UploadImagesPanel from "./images/UploadImagesPanel";

import SiteHomepageCarousel from "./carousel/SiteHomepageCarousel";
import BrowseCustomers from "./system_units_panel/BrowseCustomers";
import BrowseDepartments from "./system_units_panel/BrowseDepartments";
import BrowseDistricts from "./system_units_panel/BrowseDistricts";
import BrowseNotifications from "./system_units_panel/BrowseNotifications";
import BrowsePayments from "./system_units_panel/BrowsePayments";
import BrowseServiceRequests from "./system_units_panel/BrowseServiceRequests";
import BrowseComplaints from "./system_units_panel/BrowseComplaints";
import AddInstitutionClasses from "./school_and_branches_panel/SchoolClassManagement";
import SubjectsManagement from "./school_and_branches_panel/SubjectManagement";
import ClassSubjectsManagement from "./school_and_branches_panel/ClassSubjectManagement";
import FeeManagement from "./admission_test_panel/FeeSchemes";
import AdmissionTestApplicationsFormPanel from "./admission_test_panel/AdmissionTestApplicationsFormPanel";
import ExploreAdmitCards from "./admission_test_panel/ExploreAdmitCards";
import AdmissionTestManagement from "./admission_test_panel/AdmissionTestManagement";
import TestSubjectSyllabusManagement from "./admission_test_panel/TestSubjectSyllabusManagement";
import TestEvaluationManagement from "./admission_test_panel/TestEvaluationManagement";
import TestSeatingManagement from "./admission_test_panel/TestSeatingManagement";
import TestResultManagement from "./admission_test_panel/TestResultManagement";
import QualifiedsAdmissionManagement from "./admission_test_panel/QualifiedsAdmissionManagement";
import AdmissionTestApplicationsManagement from "./admission_test_panel/AdmissionTestApplicationManagement";
import UnQualifiedsGeneralDirectAdmissionManagement from "./admission_test_panel/UnQualifiedsAdmissionManagement";
import AdmissionRecipts from "./admission_test_panel/AdmissionReceipts";
import AdmittedStudents from "./admission_test_panel/AdmittedStudents";
import ExaminationExamSeating from "./class_main_others/ExaminationExamSeating";

import DirectStudents from "./components/DirectStudents";
import Attendance from "./components/Attendance";
import LeaveRequestManagements from "./components/AttendanceLeaveManagement";
import SyllabusDailyPlan from "./components/SyllabusDailyPlan";
import BiWeeklyClassHomwWork from "./components/ClassBiWeeklyReviewPage";
import ClassBiWeeklyAssignmentsPage from "./components/ClassBiWeeklyAssignmentsPage";
import ClassBiWeeklyTestPage from "./components/ClassBiWeeklyTestsPage";
import ClassExaminationResult from "./components/ClassExaminationResultsPage";
import DownloadExaminationResultCard from "./components/DownloadExaminationResultCards";
import ClassSubjectBooks from "./components/ClassSubjectBooksPage";
import DynamicFoodsInstructions from "./components/DynamicClassFoodInstructionsPage";
import ClassPunishment from "./components/DynamicClassPunishmentsPage";
import DynamicClassGuardianCommunication from "./components/DynamicClassGuardianCommunicationLogPage";
import DynamicClassParentTeacherMeetingNotes from "./components/DynamicClassParentTeacherMeetingNotesPage";
import DynamicMonthlyFeeManagement from "./components/DynamicClassMonthlyFeeManagementSystem";
import ClassAdmitCards from "./components/DynamicClassDirectAdmitCards";
import DynamicClassKnightsCDTPPage from "./components/DynamicClassKnightsCdtpSessionPage";
import DynamicClassPublicSpeechOccassion from "./components/DynamicClassPublicSpeakingOccasionPage";
import DynamicClassPublicSpeakingOccasionPage from "./components/DynamicClassPublicSpeakingOccasionPage";
import DynamicStudentBehaviourLogDialog from "./components/DynamicClassStudentBehaviourLogPage";
import DynamicReadmissionManagement from "./components/DynamicClassReadmissionPanel";
import GenerateTransferCertificate from "./components/TransferCertificatePanel";
import DynamicExamSeatingCheats from "./components/ExamSeatingManagement";
import BoardExamsResultManagement from "./components/BoardExamResultManagement";
import ExaminationExamScheduleManagement from "./school_and_branches_panel/ExaminationExamScheduleManagement";
import ExaminationExamsDateClassWise from "./components/ExaminationExamsDateClassWise";
import AssignClassTeachers from "./school_and_branches_panel/AssignClassTeachers";
import ClassDailyHomeworkUpdateStatusPage from "./components/ClassDailyHomeworkStatusViewPage";

import FetchClassesForAttendance from "./class_teachers_panel/FetchClassesForAttendance";
import FetchClassesForLeaveRequests from "./class_teachers_panel/FetchClassesForLeaveRequests";
import FetchClassessForLecturesView from "./class_teachers_panel/FetchClassesForLecturesView";
import FetchClassesForAssignments from "./class_teachers_panel/FetchClassesForAssignments";
import FetchClassesForBiweeklyTestMarks from "./class_teachers_panel/FetchClassesForBiweeklyTestMarks";
import FetchClassesForWBTPS from "./class_teachers_panel/FetchClassesForWBTPS";
import FetchClassesForExamination from "./class_teachers_panel/FetchClassesForExaminationMarks";
import FetchClassForStudentsMarks from "./class_teachers_panel/FetchClassesForStudentsMarks";
import FetchClassForInstructedBooks from "./class_teachers_panel/FetchClassesForInstructedBooks";
import FetchClassesForPunishment from "./class_teachers_panel/FetchClassesForPunishments";
import FetchClassesForStudentsBehaviour from "./class_teachers_panel/FetchClassesForStudentsBehaviourLogs";
import FetchClassesUpdateHomeworkSubmissionStatus from "./class_teachers_panel/FetchClassesForHomworkSubmission";

import PreviewStudents from "./components/PreviewStudents";
import FetchCLassForHomeworkGCI from "./components/FetchClassesForHomworkGCI";
import ClassBiWeeklyAssignmentsPageGCI from "./components/ClassBiWeeklyAssignmentsPageGCI";
import ClassBiWeeklyTestPageGCI from "./components/ClassBiWeeklyTestsPageGCI";
import CheckResult from "./checkResult/CheckResultsPublic";
import MySchoolOathAndPrayer from "./checkResult/SchoolPrayerAndOath";
import HolidayCalendar from "@/components/sure-success-point-school/calendar/StudentHolidayCalendar";
import FacultyMonthlySalary from "./attendance_and_salary/FacultyMonthlySalary";
import PolicyExceptionWorkspace from "@/components/sure-success-point-school/approvals/PolicyExceptionWorkspace";
import ProvisionalFeeCollectionWorkspace from "@/components/sure-success-point-school/finance/ProvisionalFeeCollectionWorkspace";
import ClassMonthlyFeeFollowupWorkspace from "@/components/sure-success-point-school/finance/ClassMonthlyFeeFollowupWorkspace";
import StudentLifecycleWorkspace from "@/components/sure-success-point-school/students/StudentLifecycleWorkspace";
import NewAdmissionWorkspace from "@/components/sure-success-point-school/students/NewAdmissionWorkspace";
import ClassStudentPreviewWorkspace from "@/components/sure-success-point-school/students/ClassStudentPreviewWorkspace";

function ContentArea({ activeSection, authorization }) {
  const renderContent = () => {
    const canCollectFees = authorization?.permissions?.includes("fee.collect.provisional");
    const guardianCareMatch = /^GCI Class Information (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XS|XI|XII|XIIS|XIIIJ)$/.exec(activeSection || "");
    // Legacy selections now open the unified monthly-fee and guardian-care
    // workspace. The old drawer item is removed, but an already-open tab never
    // becomes a broken screen.
    if (guardianCareMatch) return <ClassMonthlyFeeFollowupWorkspace className={guardianCareMatch[1]} authorization={authorization} />;

    // Principal class leadership and GCI AIC groups use this secure preview.
    // It supersedes the legacy drawer preview that depended on an old token
    // and exposed government-ID data in the browser.
    const studentPreviewMatch = /^Preview Students (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XS|XI|XII|XIIS|XIIIJ)$/.exec(activeSection || "");
    if (studentPreviewMatch) return <ClassStudentPreviewWorkspace className={studentPreviewMatch[1]} authorization={authorization} />;

    const monthlyFeeOverviewMatch = /^Monthly Fees (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XS|XI|XII|XIIS|XIIIJ)$/.exec(activeSection || "");
    if (monthlyFeeOverviewMatch) return <ClassMonthlyFeeFollowupWorkspace className={monthlyFeeOverviewMatch[1]} authorization={authorization} />;

    const monthlyFeeManagementMatch = /^Monthly Fees Class (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XS|XI|XII|XIIS|XIIIJ)$/.exec(activeSection || "");
    if (monthlyFeeManagementMatch) return <DynamicMonthlyFeeManagement className={monthlyFeeManagementMatch[1]} readOnly={!canCollectFees} />;

    const newAdmissionMatch = /^New Admission (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/.exec(activeSection || "");
    if (newAdmissionMatch) return <NewAdmissionWorkspace className={newAdmissionMatch[1]} authorization={authorization} />;

    // The legacy class-specific entries now share one student 360° workspace.
    // Existing labels and drawer structure stay intact while all mutations use
    // the audited lifecycle APIs instead of direct Student DELETE/create calls.
    const lifecycleStudentsMatch = /^Manage Students (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XS|XI|XII|XIIS|XIIIJ)$/.exec(activeSection || "");
    if (lifecycleStudentsMatch) return <StudentLifecycleWorkspace className={lifecycleStudentsMatch[1]} authorization={authorization} />;
    const lifecycleReadmissionMatch = /^ReAdmission from Class (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XS|XI|XII|XIIS|XIIIJ) ->/.exec(activeSection || "");
    if (lifecycleReadmissionMatch) return <StudentLifecycleWorkspace className={lifecycleReadmissionMatch[1]} authorization={authorization} initialView="readmission" />;
    const lifecycleTcMatch = /^Generate Transfer Certificate (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XS|XI|XII|XIIS|XIIIJ)$/.exec(activeSection || "");
    if (lifecycleTcMatch) return <StudentLifecycleWorkspace className={lifecycleTcMatch[1]} authorization={authorization} initialView="tc" />;

    // The new Admit Card Management group uses "Admit Cards Class X", while
    // the original class drawers use "Admit Cards X". Both open the same
    // proven class admit-card generator.
    const admitCardMatch = /^Admit Cards(?: Class)? (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XS|XI|XII|XIIS|XIIIJ)$/.exec(activeSection || "");
    if (admitCardMatch) return <ClassAdmitCards className={admitCardMatch[1]} />;

    switch (activeSection) {
      case "Submit Policy Exception":
        return <PolicyExceptionWorkspace panel="FACULTIES" />;
      case "Service Requests & Approvals":
        return <BrowseServiceRequests />;
      case "Complaints & Resolutions":
        return <BrowseComplaints />;
      case "Payments Proceeded":
      // Backward-compatible aliases for an already-open legacy drawer state.
      case "Payments Proceeded Today":
      case "Payments Proceeded This Week":
      case "Payments Proceeded Full Month":
      case "Pending COEF Verification":
      case "Verified & Submitted to Accounts":
        return <ProvisionalFeeCollectionWorkspace paymentKinds={["MONTHLY_TUITION"]} />;
      case "Admission Fee Custody":
      case "Admission Fee Verification":
        return <ProvisionalFeeCollectionWorkspace paymentKinds={["NEW_ADMISSION", "READMISSION"]} title="Admission Fee Custody & Verification" admissionRegister />;
      case "📝 Check Examination Results":
        return <CheckResult />;
      case "🙏 My School Oath & Prayer":
        return <MySchoolOathAndPrayer />;
      case "Preview Students LKG":
        return <PreviewStudents className="LKG" />;
      case "Preview Daily Homework Status LKG":
        return <FetchCLassForHomeworkGCI className="LKG" />;
      case "Preview Assignments LKG":
        return <ClassBiWeeklyAssignmentsPageGCI className="LKG" />;
      case "Preview Progress Test Marks LKG":
        return <ClassBiWeeklyTestPageGCI className="LKG" />;

      case "Institution Holiday Calendar":
        return <HolidayCalendar />;

      case "Preview Students UKG":
        return <PreviewStudents className="UKG" />;
      case "Preview Daily Homework Status UKG":
        return <FetchCLassForHomeworkGCI className="UKG" />;
      case "Preview Assignments UKG":
        return <ClassBiWeeklyAssignmentsPageGCI className="UKG" />;
      case "Preview Progress Test Marks UKG":
        return <ClassBiWeeklyTestPageGCI className="UKG" />;

      case "Preview Students I":
        return <PreviewStudents className="I" />;
      case "Preview Daily Homework Status I":
        return <FetchCLassForHomeworkGCI className="I" />;
      case "Preview Assignments I":
        return <ClassBiWeeklyAssignmentsPageGCI className="I" />;
      case "Preview Progress Test Marks I":
        return <ClassBiWeeklyTestPageGCI className="I" />;

      case "Preview Students II":
        return <PreviewStudents className="II" />;
      case "Preview Daily Homework Status II":
        return <FetchCLassForHomeworkGCI className="II" />;
      case "Preview Assignments II":
        return <ClassBiWeeklyAssignmentsPageGCI className="II" />;
      case "Preview Progress Test Marks II":
        return <ClassBiWeeklyTestPageGCI className="II" />;

      case "Preview Students III":
        return <PreviewStudents className="III" />;
      case "Preview Daily Homework Status III":
        return <FetchCLassForHomeworkGCI className="III" />;
      case "Preview Assignments III":
        return <ClassBiWeeklyAssignmentsPageGCI className="III" />;
      case "Preview Progress Test Marks III":
        return <ClassBiWeeklyTestPageGCI className="III" />;

      case "Preview Students IV":
        return <PreviewStudents className="IV" />;
      case "Preview Daily Homework Status IV":
        return <FetchCLassForHomeworkGCI className="IV" />;
      case "Preview Assignments IV":
        return <ClassBiWeeklyAssignmentsPageGCI className="IV" />;
      case "Preview Progress Test Marks IV":
        return <ClassBiWeeklyTestPageGCI className="IV" />;

      case "Preview Students V":
        return <PreviewStudents className="V" />;
      case "Preview Daily Homework Status V":
        return <FetchCLassForHomeworkGCI className="V" />;
      case "Preview Assignments V":
        return <ClassBiWeeklyAssignmentsPageGCI className="V" />;
      case "Preview Progress Test Marks V":
        return <ClassBiWeeklyTestPageGCI className="V" />;

      case "Preview Students VI":
        return <PreviewStudents className="VI" />;
      case "Preview Daily Homework Status VI":
        return <FetchCLassForHomeworkGCI className="VI" />;
      case "Preview Assignments VI":
        return <ClassBiWeeklyAssignmentsPageGCI className="VI" />;
      case "Preview Progress Test Marks VI":
        return <ClassBiWeeklyTestPageGCI className="VI" />;

      case "Preview Students VII":
        return <PreviewStudents className="VII" />;
      case "Preview Daily Homework Status VII":
        return <FetchCLassForHomeworkGCI className="VII" />;
      case "Preview Assignments VII":
        return <ClassBiWeeklyAssignmentsPageGCI className="VII" />;
      case "Preview Progress Test Marks VII":
        return <ClassBiWeeklyTestPageGCI className="VII" />;

      case "Preview Students VIII":
        return <PreviewStudents className="VIII" />;
      case "Preview Daily Homework Status VIII":
        return <FetchCLassForHomeworkGCI className="VIII" />;
      case "Preview Assignments VIII":
        return <ClassBiWeeklyAssignmentsPageGCI className="VIII" />;
      case "Preview Progress Test Marks VIII":
        return <ClassBiWeeklyTestPageGCI className="VIII" />;

      case "Preview Students IX":
        return <PreviewStudents className="IX" />;
      case "Preview Daily Homework Status IX":
        return <FetchCLassForHomeworkGCI className="IX" />;
      case "Preview Assignments IX":
        return <ClassBiWeeklyAssignmentsPageGCI className="IX" />;
      case "Preview Progress Test Marks IX":
        return <ClassBiWeeklyTestPageGCI className="IX" />;

      case "Preview Students X":
        return <PreviewStudents className="X" />;
      case "Preview Daily Homework Status X":
        return <FetchCLassForHomeworkGCI className="X" />;
      case "Preview Assignments X":
        return <ClassBiWeeklyAssignmentsPageGCI className="X" />;
      case "Preview Progress Test Marks X":
        return <ClassBiWeeklyTestPageGCI className="X" />;

      case "Preview Students XS":
        return <PreviewStudents className="XS" />;
      case "Preview Daily Homework Status XS":
        return <FetchCLassForHomeworkGCI className="XS" />;
      case "Preview Assignments XS":
        return <ClassBiWeeklyAssignmentsPageGCI className="XS" />;
      case "Preview Progress Test Marks XS":
        return <ClassBiWeeklyTestPageGCI className="XS" />;

      case "Preview Students XI":
        return <PreviewStudents className="XI" />;
      case "Preview Daily Homework Status XI":
        return <FetchCLassForHomeworkGCI className="XI" />;
      case "Preview Assignments XI":
        return <ClassBiWeeklyAssignmentsPageGCI className="XI" />;
      case "Preview Progress Test Marks XI":
        return <ClassBiWeeklyTestPageGCI className="XI" />;

      case "Preview Students XII":
        return <PreviewStudents className="XII" />;
      case "Preview Daily Homework Status XII":
        return <FetchCLassForHomeworkGCI className="XII" />;
      case "Preview Assignments XII":
        return <ClassBiWeeklyAssignmentsPageGCI className="XII" />;
      case "Preview Progress Test Marks XII":
        return <ClassBiWeeklyTestPageGCI className="XII" />;

      case "Preview Students XIIJ":
        return <PreviewStudents className="XIIJ" />;
      case "Preview Daily Homework Status XIIJ":
        return <FetchCLassForHomeworkGCI className="XIIJ" />;
      case "Preview Assignments XIIJ":
        return <ClassBiWeeklyAssignmentsPageGCI className="XIIJ" />;
      case "Preview Progress Test Marks XIIJ":
        return <ClassBiWeeklyTestPageGCI className="XIIJ" />;

      case "Preview Students XIIIJ":
        return <PreviewStudents className="XIIIJ" />;
      case "Preview Daily Homework Status XIIIJ":
        return <FetchCLassForHomeworkGCI className="XIIIJ" />;
      case "Preview Assignments XIIIJ":
        return <ClassBiWeeklyAssignmentsPageGCI className="XIIIJ" />;
      case "Preview Progress Test Marks XIIIJ":
        return <ClassBiWeeklyTestPageGCI className="XIIIJ" />;

      case "Preview Students XIIS":
        return <PreviewStudents className="XIIS" />;
      case "Preview Daily Homework Status XIIS":
        return <FetchCLassForHomeworkGCI className="XIIS" />;
      case "Preview Assignments XIIS":
        return <ClassBiWeeklyAssignmentsPageGCI className="XIIS" />;
      case "Preview Progress Test Marks XIIS":
        return <ClassBiWeeklyTestPageGCI className="XIIS" />;

      case "Insert & View Attendance":
        return <FetchClassesForAttendance />;
      case "Leave Requests & Approvals":
        return <FetchClassesForLeaveRequests />;
      case "View Lecture & Homework Syllabus":
        return <FetchClassessForLecturesView />;
      case "Update Daily Homework Status":
        return <FetchClassesUpdateHomeworkSubmissionStatus />;
      case "View Institution Assignments":
        return <FetchClassesForAssignments />;
      case "Add Weekly Progress Test Marks":
        return <FetchClassesForBiweeklyTestMarks />;
      case "Knights Wb Test Preparation Series":
        return <FetchClassesForWBTPS />;

      case "Insert Students Examination Marks":
        return <FetchClassesForExamination />;
      case "View Students Marks":
        return <FetchClassForStudentsMarks />;
      case "View Instructed Books":
        return <FetchClassForInstructedBooks />;
      case "View Punishment to Use":
        return <FetchClassesForPunishment />;
      case "Student Behaviour Logs":
        return <FetchClassesForStudentsBehaviour />;
      /////////////////////////////////////////////////////////////////////////////////////////////////////
      case "View Punishments to Use LKG":
        return <ClassPunishment className="LKG" />;
      case "Manage Students LKG":
        return <DirectStudents className="LKG" />;
      case "Insert & View Attendance LKG":
        return <Attendance className="LKG" />;
      case "Leave Requests & Approvals LKG":
        return <LeaveRequestManagements className="LKG" />;
      case "View Lecture & Homework Syl. LKG":
        return <SyllabusDailyPlan className="LKG" />;
      case "Confirm Weekly HomeWork LKG":
        return <BiWeeklyClassHomwWork className="LKG" />;
      case "View Institution Assignments LKG":
        return <ClassBiWeeklyAssignmentsPage className="LKG" />;
      case "Add Weekly Progress Test Marks LKG":
        return <ClassBiWeeklyTestPage className="LKG" />;
      case "Insert Students Marks LKG":
        return <ClassExaminationResult className="LKG" />;
      case "View Students Marks LKG":
        return <DownloadExaminationResultCard className="LKG" />;
      case "View Instructed Books LKG":
        return <ClassSubjectBooks className="LKG" />;
      case "Student Behaviour Log LKG":
        return <DynamicStudentBehaviourLogDialog className="LKG" />;
      case "Healthy Foods Suggestion LKG":
        return <DynamicFoodsInstructions className="LKG" />;
      case "Guardian Communication Log LKG":
        return <DynamicClassGuardianCommunication className="LKG" />;
      case "Parent-Teacher Meeting Notes LKG":
        return <DynamicClassParentTeacherMeetingNotes className="LKG" />;
      case "Monthly Fees LKG":
        return <DynamicMonthlyFeeManagement className="LKG" />;
      case "Examination Exams TimeTable LKG":
        return <ExaminationExamsDateClassWise className="LKG" />;
      case "Admit Cards LKG":
        return <ClassAdmitCards className="LKG" />;
      case "ReAdmission from Class LKG -> UKG":
        return <DynamicReadmissionManagement className="LKG" />;
      case "Knights CDTP Sessions LKG":
        return <DynamicClassKnightsCDTPPage className="LKG" />;
      case "Public Speaking Occasion LKG":
        return <DynamicClassPublicSpeechOccassion className="LKG" />;
      case "Annual Public Competition LKG":
        return <DynamicClassPublicSpeakingOccasionPage className="LKG" />;
      case "Generate Transfer Certificate LKG":
        return <GenerateTransferCertificate className="LKG" />;
      case "Exam Seating Cheats LKG":
        return <DynamicExamSeatingCheats className="LKG" />;
      //////////////////////////////////////////////////////////////////////////////////////////
      case "View Punishments to Use UKG":
        return <ClassPunishment className="UKG" />;
      case "Manage Students UKG":
        return <DirectStudents className="UKG" />;
      case "Insert & View Attendance UKG":
        return <Attendance className="UKG" />;
      case "Leave Requests & Approvals UKG":
        return <LeaveRequestManagements className="UKG" />;
      case "View Lecture & Homework Syl. UKG":
        return <SyllabusDailyPlan className="UKG" />;
      case "Confirm Weekly HomeWork UKG":
        return <BiWeeklyClassHomwWork className="UKG" />;
      case "View Institution Assignments UKG":
        return <ClassBiWeeklyAssignmentsPage className="UKG" />;
      case "Student Behaviour Log UKG":
        return <DynamicStudentBehaviourLogDialog className="UKG" />;
      case "Add Weekly Progress Test Marks UKG":
        return <ClassBiWeeklyTestPage className="UKG" />;
      case "Insert Students Marks UKG":
        return <ClassExaminationResult className="UKG" />;
      case "View Students Marks UKG":
        return <DownloadExaminationResultCard className="UKG" />;
      case "View Instructed Books UKG":
        return <ClassSubjectBooks className="UKG" />;
      case "Healthy Foods Suggestion UKG":
        return <DynamicFoodsInstructions className="UKG" />;
      case "Guardian Communication Log UKG":
        return <DynamicClassGuardianCommunication className="UKG" />;
      case "Parent-Teacher Meeting Notes UKG":
        return <DynamicClassParentTeacherMeetingNotes className="UKG" />;
      case "Monthly Fees UKG":
        return <DynamicMonthlyFeeManagement className="UKG" />;
      case "Examination Exams TimeTable UKG":
        return <ExaminationExamsDateClassWise className="UKG" />;
      case "Admit Cards UKG":
        return <ClassAdmitCards className="UKG" />;
      case "ReAdmission from Class UKG -> I":
        return <DynamicReadmissionManagement className="UKG" />;
      case "Knights CDTP Sessions UKG":
        return <DynamicClassKnightsCDTPPage className="UKG" />;
      case "Public Speaking Occasion UKG":
        return <DynamicClassPublicSpeechOccassion className="UKG" />;
      case "Annual Public Competition UKG":
        return <DynamicClassPublicSpeakingOccasionPage className="UKG" />;
      case "Generate Transfer Certificate UKG":
        return <GenerateTransferCertificate className="UKG" />;
      case "Exam Seating Cheats UKG":
        return <DynamicExamSeatingCheats className="UKG" />;
      //////////////////////////////////////////////////////////////////////////////////////////////
      case "View Punishments to Use I":
        return <ClassPunishment className="I" />;
      case "Manage Students I":
        return <DirectStudents className="I" />;
      case "Insert & View Attendance I":
        return <Attendance className="I" />;
      case "Leave Requests & Approvals I":
        return <LeaveRequestManagements className="I" />;
      case "View Lecture & Homework Syl. I":
        return <SyllabusDailyPlan className="I" />;
      case "Confirm Weekly HomeWork I":
        return <BiWeeklyClassHomwWork className="I" />;
      case "View Institution Assignments I":
        return <ClassBiWeeklyAssignmentsPage className="I" />;
      case "Student Behaviour Log I":
        return <DynamicStudentBehaviourLogDialog className="I" />;
      case "Add Weekly Progress Test Marks I":
        return <ClassBiWeeklyTestPage className="I" />;
      case "Insert Students Marks I":
        return <ClassExaminationResult className="I" />;
      case "View Students Marks I":
        return <DownloadExaminationResultCard className="I" />;
      case "View Instructed Books I":
        return <ClassSubjectBooks className="I" />;
      case "Healthy Foods Suggestion I":
        return <DynamicFoodsInstructions className="I" />;
      case "Guardian Communication Log I":
        return <DynamicClassGuardianCommunication className="I" />;
      case "Parent-Teacher Meeting Notes I":
        return <DynamicClassParentTeacherMeetingNotes className="I" />;
      case "Monthly Fees I":
        return <DynamicMonthlyFeeManagement className="I" />;
      case "Examination Exams TimeTable I":
        return <ExaminationExamsDateClassWise className="I" />;
      case "Admit Cards I":
        return <ClassAdmitCards className="I" />;
      case "ReAdmission from Class I -> II":
        return <DynamicReadmissionManagement className="I" />;
      case "Knights CDTP Sessions I":
        return <DynamicClassKnightsCDTPPage className="I" />;
      case "Public Speaking Occasion I":
        return <DynamicClassPublicSpeechOccassion className="I" />;
      case "Annual Public Competition I":
        return <DynamicClassPublicSpeakingOccasionPage className="I" />;
      case "Generate Transfer Certificate I":
        return <GenerateTransferCertificate className="I" />;
      case "Exam Seating Cheats I":
        return <DynamicExamSeatingCheats className="I" />;
      //////////////////////////////////////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////////////////////////////////////
      case "View Punishments to Use II":
        return <ClassPunishment className="II" />;
      case "Manage Students II":
        return <DirectStudents className="II" />;
      case "Insert & View Attendance II":
        return <Attendance className="II" />;
      case "Leave Requests & Approvals II":
        return <LeaveRequestManagements className="II" />;
      case "View Lecture & Homework Syl. II":
        return <SyllabusDailyPlan className="II" />;
      case "Confirm Weekly HomeWork II":
        return <BiWeeklyClassHomwWork className="II" />;
      case "View Institution Assignments II":
        return <ClassBiWeeklyAssignmentsPage className="II" />;
      case "Student Behaviour Log II":
        return <DynamicStudentBehaviourLogDialog className="II" />;
      case "Add Weekly Progress Test Marks II":
        return <ClassBiWeeklyTestPage className="II" />;
      case "Insert Students Marks II":
        return <ClassExaminationResult className="II" />;
      case "View Students Marks II":
        return <DownloadExaminationResultCard className="II" />;
      case "View Instructed Books II":
        return <ClassSubjectBooks className="II" />;
      case "Healthy Foods Suggestion II":
        return <DynamicFoodsInstructions className="II" />;
      case "Guardian Communication Log II":
        return <DynamicClassGuardianCommunication className="II" />;
      case "Parent-Teacher Meeting Notes II":
        return <DynamicClassParentTeacherMeetingNotes className="II" />;
      case "Monthly Fees II":
        return <DynamicMonthlyFeeManagement className="II" />;
      case "Examination Exams TimeTable II":
        return <ExaminationExamsDateClassWise className="II" />;
      case "Admit Cards II":
        return <ClassAdmitCards className="II" />;
      case "ReAdmission from Class II -> III":
        return <DynamicReadmissionManagement className="II" />;
      case "Knights CDTP Sessions II":
        return <DynamicClassKnightsCDTPPage className="II" />;
      case "Public Speaking Occasion II":
        return <DynamicClassPublicSpeechOccassion className="II" />;
      case "Annual Public Competition II":
        return <DynamicClassPublicSpeakingOccasionPage className="II" />;
      case "Generate Transfer Certificate II":
        return <GenerateTransferCertificate className="II" />;
      case "Exam Seating Cheats II":
        return <DynamicExamSeatingCheats className="II" />;
      //////////////////////////////////////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////////////////////////////////////
      case "View Punishments to Use III":
        return <ClassPunishment className="III" />;
      case "Manage Students III":
        return <DirectStudents className="III" />;
      case "Insert & View Attendance III":
        return <Attendance className="III" />;
      case "Leave Requests & Approvals III":
        return <LeaveRequestManagements className="III" />;
      case "View Lecture & Homework Syl. III":
        return <SyllabusDailyPlan className="III" />;
      case "Confirm Weekly HomeWork III":
        return <BiWeeklyClassHomwWork className="III" />;
      case "View Institution Assignments III":
        return <ClassBiWeeklyAssignmentsPage className="III" />;
      case "Student Behaviour Log III":
        return <DynamicStudentBehaviourLogDialog className="III" />;
      case "Add Weekly Progress Test Marks III":
        return <ClassBiWeeklyTestPage className="III" />;
      case "Insert Students Marks III":
        return <ClassExaminationResult className="III" />;
      case "View Students Marks III":
        return <DownloadExaminationResultCard className="III" />;
      case "View Instructed Books III":
        return <ClassSubjectBooks className="III" />;
      case "Healthy Foods Suggestion III":
        return <DynamicFoodsInstructions className="III" />;
      case "Guardian Communication Log III":
        return <DynamicClassGuardianCommunication className="III" />;
      case "Parent-Teacher Meeting Notes III":
        return <DynamicClassParentTeacherMeetingNotes className="III" />;
      case "Monthly Fees III":
        return <DynamicMonthlyFeeManagement className="III" />;
      case "Examination Exams TimeTable III":
        return <ExaminationExamsDateClassWise className="III" />;
      case "Admit Cards III":
        return <ClassAdmitCards className="III" />;
      case "ReAdmission from Class III -> IV":
        return <DynamicReadmissionManagement className="III" />;
      case "Knights CDTP Sessions III":
        return <DynamicClassKnightsCDTPPage className="III" />;
      case "Public Speaking Occasion III":
        return <DynamicClassPublicSpeechOccassion className="III" />;
      case "Annual Public Competition III":
        return <DynamicClassPublicSpeakingOccasionPage className="III" />;
      case "Generate Transfer Certificate III":
        return <GenerateTransferCertificate className="III" />;
      case "Exam Seating Cheats III":
        return <DynamicExamSeatingCheats className="III" />;
      //////////////////////////////////////////////////////////////////////////////////////////////
      case "Manage Students IV":
        return <DirectStudents className="IV" />;
      case "Insert & View Attendance IV":
        return <Attendance className="IV" />;
      case "Leave Requests & Approvals IV":
        return <LeaveRequestManagements className="IV" />;
      case "View Lecture & Homework Syl. IV":
        return <SyllabusDailyPlan className="IV" />;
      case "Confirm Weekly HomeWork IV":
        return <BiWeeklyClassHomwWork className="IV" />;
      case "View Institution Assignments IV":
        return <ClassBiWeeklyAssignmentsPage className="IV" />;
      case "Add Weekly Progress Test Marks IV":
        return <ClassBiWeeklyTestPage className="IV" />;
      case "View Punishments to Use IV":
        return <ClassPunishment className="IV" />;
      case "Student Behaviour Log IV":
        return <DynamicStudentBehaviourLogDialog className="IV" />;
      case "Insert Students Marks IV":
        return <ClassExaminationResult className="IV" />;
      case "View Students Marks IV":
        return <DownloadExaminationResultCard className="IV" />;
      case "View Instructed Books IV":
        return <ClassSubjectBooks className="IV" />;
      case "Healthy Foods Suggestion IV":
        return <DynamicFoodsInstructions className="IV" />;
      case "Guardian Communication Log IV":
        return <DynamicClassGuardianCommunication className="IV" />;
      case "Parent-Teacher Meeting Notes IV":
        return <DynamicClassParentTeacherMeetingNotes className="IV" />;
      case "Monthly Fees IV":
        return <DynamicMonthlyFeeManagement className="IV" />;
      case "Examination Exams TimeTable IV":
        return <ExaminationExamsDateClassWise className="IV" />;
      case "Admit Cards IV":
        return <ClassAdmitCards className="IV" />;
      case "ReAdmission from Class IV -> V":
        return <DynamicReadmissionManagement className="IV" />;
      case "Knights CDTP Sessions IV":
        return <DynamicClassKnightsCDTPPage className="IV" />;
      case "Public Speaking Occasion IV":
        return <DynamicClassPublicSpeechOccassion className="IV" />;
      case "Annual Public Competition IV":
        return <DynamicClassPublicSpeakingOccasionPage className="IV" />;
      case "Generate Transfer Certificate IV":
        return <GenerateTransferCertificate className="IV" />;
      case "Exam Seating Cheats IV":
        return <DynamicExamSeatingCheats className="IV" />;
      ///////////////////////////////////////////////////////////////////////////////////////////////
      case "View Punishments to Use V":
        return <ClassPunishment className="V" />;
      case "Manage Students V":
        return <DirectStudents className="V" />;
      case "Insert & View Attendance V":
        return <Attendance className="V" />;
      case "Leave Requests & Approvals V":
        return <LeaveRequestManagements className="V" />;
      case "View Lecture & Homework Syl. V":
        return <SyllabusDailyPlan className="V" />;
      case "Confirm Weekly HomeWork V":
        return <BiWeeklyClassHomwWork className="V" />;
      case "View Institution Assignments V":
        return <ClassBiWeeklyAssignmentsPage className="V" />;
      case "Student Behaviour Log V":
        return <DynamicStudentBehaviourLogDialog className="V" />;
      case "Add Weekly Progress Test Marks V":
        return <ClassBiWeeklyTestPage className="V" />;
      case "Insert Students Marks V":
        return <ClassExaminationResult className="V" />;
      case "View Students Marks V":
        return <DownloadExaminationResultCard className="V" />;
      case "View Instructed Books V":
        return <ClassSubjectBooks className="V" />;
      case "Healthy Foods Suggestion V":
        return <DynamicFoodsInstructions className="V" />;
      case "Guardian Communication Log V":
        return <DynamicClassGuardianCommunication className="V" />;
      case "Parent-Teacher Meeting Notes V":
        return <DynamicClassParentTeacherMeetingNotes className="V" />;
      case "Monthly Fees V":
        return <DynamicMonthlyFeeManagement className="V" />;
      case "Examination Exams TimeTable V":
        return <ExaminationExamsDateClassWise className="V" />;
      case "Admit Cards V":
        return <ClassAdmitCards className="V" />;
      case "ReAdmission from Class V -> VI":
        return <DynamicReadmissionManagement className="V" />;
      case "Knights CDTP Sessions V":
        return <DynamicClassKnightsCDTPPage className="V" />;
      case "Public Speaking Occasion V":
        return <DynamicClassPublicSpeechOccassion className="V" />;
      case "Annual Public Competition V":
        return <DynamicClassPublicSpeakingOccasionPage className="V" />;
      case "Generate Transfer Certificate V":
        return <GenerateTransferCertificate className="V" />;
      case "Exam Seating Cheats V":
        return <DynamicExamSeatingCheats className="V" />;
      ///////////////////////////////////////////////////////////////////////////
      case "View Punishments to Use VI":
        return <ClassPunishment className="VI" />;
      case "Manage Students VI":
        return <DirectStudents className={"VI"} />;
      case "Insert & View Attendance VI":
        return <Attendance className="VI" />;
      case "Leave Requests & Approvals VI":
        return <LeaveRequestManagements className="VI" />;
      case "View Lecture & Homework Syl. VI":
        return <SyllabusDailyPlan className="VI" />;
      case "Confirm Weekly HomeWork VI":
        return <BiWeeklyClassHomwWork className="VI" />;
      case "View Institution Assignments VI":
        return <ClassBiWeeklyAssignmentsPage className="VI" />;
      case "Student Behaviour Log VI":
        return <DynamicStudentBehaviourLogDialog className="VI" />;
      case "Add Weekly Progress Test Marks VI":
        return <ClassBiWeeklyTestPage className="VI" />;
      case "Insert Students Marks VI":
        return <ClassExaminationResult className="VI" />;
      case "View Students Marks VI":
        return <DownloadExaminationResultCard className="VI" />;
      case "View Instructed Books VI":
        return <ClassSubjectBooks className="VI" />;
      case "Healthy Foods Suggestion VI":
        return <DynamicFoodsInstructions className="VI" />;
      case "Guardian Communication Log VI":
        return <DynamicClassGuardianCommunication className="VI" />;
      case "Parent-Teacher Meeting Notes VI":
        return <DynamicClassParentTeacherMeetingNotes className="VI" />;
      case "Monthly Fees VI":
        return <DynamicMonthlyFeeManagement className="VI" />;
      case "Examination Exams TimeTable VI":
        return <ExaminationExamsDateClassWise className="VI" />;
      case "Admit Cards VI":
        return <ClassAdmitCards className="VI" />;
      case "ReAdmission from Class VI -> VII":
        return <DynamicReadmissionManagement className="VI" />;
      case "Knights CDTP Sessions VI":
        return <DynamicClassKnightsCDTPPage className="VI" />;
      case "Public Speaking Occasion VI":
        return <DynamicClassPublicSpeechOccassion className="VI" />;
      case "Annual Public Competition VI":
        return <DynamicClassPublicSpeakingOccasionPage className={"VI"} />;
      case "Generate Transfer Certificate VI":
        return <GenerateTransferCertificate className="VI" />;
      case "Exam Seating Cheats VI":
        return <DynamicExamSeatingCheats className="VI" />;
      ///////////////////////////////////////////////////////////////////////////
      // Class VII
      case "View Punishments to Use VII":
        return <ClassPunishment className="VII" />;
      case "Manage Students VII":
        return <DirectStudents className="VII" />;
      case "Insert & View Attendance VII":
        return <Attendance className="VII" />;
      case "Leave Requests & Approvals VII":
        return <LeaveRequestManagements className="VII" />;
      case "View Lecture & Homework Syl. VII":
        return <SyllabusDailyPlan className="VII" />;
      case "Confirm Weekly HomeWork VII":
        return <BiWeeklyClassHomwWork className="VII" />;
      case "View Institution Assignments VII":
        return <ClassBiWeeklyAssignmentsPage className="VII" />;
      case "Student Behaviour Log VII":
        return <DynamicStudentBehaviourLogDialog className="VII" />;
      case "Add Weekly Progress Test Marks VII":
        return <ClassBiWeeklyTestPage className="VII" />;
      case "Insert Students Marks VII":
        return <ClassExaminationResult className="VII" />;
      case "View Students Marks VII":
        return <DownloadExaminationResultCard className="VII" />;
      case "View Instructed Books VII":
        return <ClassSubjectBooks className="VII" />;
      case "Healthy Foods Suggestion VII":
        return <DynamicFoodsInstructions className="VII" />;
      case "Guardian Communication Log VII":
        return <DynamicClassGuardianCommunication className="VII" />;
      case "Parent-Teacher Meeting Notes VII":
        return <DynamicClassParentTeacherMeetingNotes className="VII" />;
      case "Monthly Fees VII":
        return <DynamicMonthlyFeeManagement className="VII" />;
      case "Examination Exams TimeTable VII":
        return <ExaminationExamsDateClassWise className="VII" />;
      case "Admit Cards VII":
        return <ClassAdmitCards className="VII" />;
      case "ReAdmission from Class VII -> VIII":
        return <DynamicReadmissionManagement className="VII" />;
      case "Knights CDTP Sessions VII":
        return <DynamicClassKnightsCDTPPage className="VII" />;
      case "Public Speaking Occasion VII":
        return <DynamicClassPublicSpeechOccassion className="VII" />;
      case "Annual Public Competition VII":
        return <DynamicClassPublicSpeakingOccasionPage className="VII" />;
      case "Generate Transfer Certificate VII":
        return <GenerateTransferCertificate className="VII" />;
      case "Exam Seating Cheats VII":
        return <DynamicExamSeatingCheats className="VII" />;

      // Class VIII
      case "View Punishments to Use VIII":
        return <ClassPunishment className="VIII" />;
      case "Manage Students VIII":
        return <DirectStudents className="VIII" />;
      case "Insert & View Attendance VIII":
        return <Attendance className="VIII" />;
      case "Leave Requests & Approvals VIII":
        return <LeaveRequestManagements className="VIII" />;
      case "View Lecture & Homework Syl. VIII":
        return <SyllabusDailyPlan className="VIII" />;
      case "Confirm Weekly HomeWork VIII":
        return <BiWeeklyClassHomwWork className="VIII" />;
      case "View Institution Assignments VIII":
        return <ClassBiWeeklyAssignmentsPage className="VIII" />;
      case "Student Behaviour Log VIII":
        return <DynamicStudentBehaviourLogDialog className="VIII" />;
      case "Add Weekly Progress Test Marks VIII":
        return <ClassBiWeeklyTestPage className="VIII" />;
      case "Insert Students Marks VIII":
        return <ClassExaminationResult className="VIII" />;
      case "View Students Marks VIII":
        return <DownloadExaminationResultCard className="VIII" />;
      case "View Instructed Books VIII":
        return <ClassSubjectBooks className="VIII" />;
      case "Healthy Foods Suggestion VIII":
        return <DynamicFoodsInstructions className="VIII" />;
      case "Guardian Communication Log VIII":
        return <DynamicClassGuardianCommunication className="VIII" />;
      case "Parent-Teacher Meeting Notes VIII":
        return <DynamicClassParentTeacherMeetingNotes className="VIII" />;
      case "Monthly Fees VIII":
        return <DynamicMonthlyFeeManagement className="VIII" />;
      case "Examination Exams TimeTable VIII":
        return <ExaminationExamsDateClassWise className="VIII" />;
      case "Admit Cards VIII":
        return <ClassAdmitCards className="VIII" />;
      case "ReAdmission from Class VIII -> IX":
        return <DynamicReadmissionManagement className="VIII" />;
      case "Knights CDTP Sessions VIII":
        return <DynamicClassKnightsCDTPPage className="VIII" />;
      case "Public Speaking Occasion VIII":
        return <DynamicClassPublicSpeechOccassion className="VIII" />;
      case "Annual Public Competition VIII":
        return <DynamicClassPublicSpeakingOccasionPage className="VIII" />;
      case "Generate Transfer Certificate VIII":
        return <GenerateTransferCertificate className="VIII" />;
      case "Exam Seating Cheats VIII":
        return <DynamicExamSeatingCheats className="VIII" />;

      // Class IX
      case "View Punishments to Use IX":
        return <ClassPunishment className="IX" />;
      case "Manage Students IX":
        return <DirectStudents className="IX" />;
      case "Insert & View Attendance IX":
        return <Attendance className="IX" />;
      case "Leave Requests & Approvals IX":
        return <LeaveRequestManagements className="IX" />;
      case "View Lecture & Homework Syl. IX":
        return <SyllabusDailyPlan className="IX" />;
      case "Confirm Weekly HomeWork IX":
        return <BiWeeklyClassHomwWork className="IX" />;
      case "View Institution Assignments IX":
        return <ClassBiWeeklyAssignmentsPage className="IX" />;
      case "Student Behaviour Log IX":
        return <DynamicStudentBehaviourLogDialog className="IX" />;
      case "Add Weekly Progress Test Marks IX":
        return <ClassBiWeeklyTestPage className="IX" />;
      case "Insert Students Marks IX":
        return <ClassExaminationResult className="IX" />;
      case "View Students Marks IX":
        return <DownloadExaminationResultCard className="IX" />;
      case "View Instructed Books IX":
        return <ClassSubjectBooks className="IX" />;
      case "Healthy Foods Suggestion IX":
        return <DynamicFoodsInstructions className="IX" />;
      case "Guardian Communication Log IX":
        return <DynamicClassGuardianCommunication className="IX" />;
      case "Parent-Teacher Meeting Notes IX":
        return <DynamicClassParentTeacherMeetingNotes className="IX" />;
      case "Monthly Fees IX":
        return <DynamicMonthlyFeeManagement className="IX" />;
      case "Examination Exams TimeTable IX":
        return <ExaminationExamsDateClassWise className="IX" />;
      case "Admit Cards IX":
        return <ClassAdmitCards className="IX" />;
      case "ReAdmission from Class IX -> X":
        return <DynamicReadmissionManagement className="IX" />;
      case "Knights CDTP Sessions IX":
        return <DynamicClassKnightsCDTPPage className="IX" />;
      case "Public Speaking Occasion IX":
        return <DynamicClassPublicSpeechOccassion className="IX" />;
      case "Annual Public Competition IX":
        return <DynamicClassPublicSpeakingOccasionPage className="IX" />;
      case "Generate Transfer Certificate IX":
        return <GenerateTransferCertificate className="IX" />;
      case "Exam Seating Cheats IX":
        return <DynamicExamSeatingCheats className="IX" />;

      // Class X
      case "View Punishments to Use X":
        return <ClassPunishment className="X" />;
      case "Manage Students X":
        return <DirectStudents className="X" />;
      case "Insert & View Attendance X":
        return <Attendance className="X" />;
      case "Leave Requests & Approvals X":
        return <LeaveRequestManagements className="X" />;
      case "View Lecture & Homework Syl. X":
        return <SyllabusDailyPlan className="X" />;
      case "Confirm Weekly HomeWork X":
        return <BiWeeklyClassHomwWork className="X" />;
      case "View Institution Assignments X":
        return <ClassBiWeeklyAssignmentsPage className="X" />;
      case "Student Behaviour Log X":
        return <DynamicStudentBehaviourLogDialog className="X" />;
      case "Add Weekly Progress Test Marks X":
        return <ClassBiWeeklyTestPage className="X" />;
      case "Insert Students Marks X":
        return <ClassExaminationResult className="X" />;
      case "View Students Marks X":
        return <DownloadExaminationResultCard className="X" />;
      case "View Instructed Books X":
        return <ClassSubjectBooks className="X" />;
      case "Healthy Foods Suggestion X":
        return <DynamicFoodsInstructions className="X" />;
      case "Guardian Communication Log X":
        return <DynamicClassGuardianCommunication className="X" />;
      case "Parent-Teacher Meeting Notes X":
        return <DynamicClassParentTeacherMeetingNotes className="X" />;
      case "Monthly Fees X":
        return <DynamicMonthlyFeeManagement className="X" />;
      case "Examination Exams TimeTable X":
        return <ExaminationExamsDateClassWise className="X" />;
      case "Admit Cards X":
        return <ClassAdmitCards className="X" />;
      case "ReAdmission from Class X -> XS":
        return <DynamicReadmissionManagement className="X" />;
      case "Knights CDTP Sessions X":
        return <DynamicClassKnightsCDTPPage className="X" />;
      case "Public Speaking Occasion X":
        return <DynamicClassPublicSpeechOccassion className="X" />;
      case "Annual Public Competition X":
        return <DynamicClassPublicSpeakingOccasionPage className="X" />;
      case "Generate Transfer Certificate X":
        return <GenerateTransferCertificate className="X" />;
      case "Exam Seating Cheats X":
        return <DynamicExamSeatingCheats className="X" />;
      case "Update Daily Homework Status X":
        return <ClassDailyHomeworkUpdateStatusPage className="X" />;

      case "Knights WB Test Preparation Series X":
        return <BoardExamsResultManagement className="X" />;
      case "Insert Students Marks XS":
        return <ClassExaminationResult className="XS" />;

      // Class XS
      case "View Punishments to Use XS":
        return <ClassPunishment className="XS" />;
      case "Manage Students XS":
        return <DirectStudents className="XS" />;
      case "Insert & View Attendance XS":
        return <Attendance className="XS" />;
      case "Leave Requests & Approvals XS":
        return <LeaveRequestManagements className="XS" />;
      case "View Lecture & Homework Syl. XS":
        return <SyllabusDailyPlan className="XS" />;
      case "Confirm Weekly HomeWork XS":
        return <BiWeeklyClassHomwWork className="XS" />;
      case "View Institution Assignments XS":
        return <ClassBiWeeklyAssignmentsPage className="XS" />;
      case "Student Behaviour Log XS":
        return <DynamicStudentBehaviourLogDialog className="XS" />;
      case "Add Weekly Progress Test Marks XS":
        return <ClassBiWeeklyTestPage className="XS" />;
      case "View Students Marks XS":
        return <DownloadExaminationResultCard className="XS" />;
      case "View Instructed Books XS":
        return <ClassSubjectBooks className="XS" />;
      case "Healthy Foods Suggestion XS":
        return <DynamicFoodsInstructions className="XS" />;
      case "Guardian Communication Log XS":
        return <DynamicClassGuardianCommunication className="XS" />;
      case "Parent-Teacher Meeting Notes XS":
        return <DynamicClassParentTeacherMeetingNotes className="XS" />;
      case "Monthly Fees XS":
        return <DynamicMonthlyFeeManagement className="XS" />;
      case "Examination Exams TimeTable XS":
        return <ExaminationExamsDateClassWise className="XS" />;
      case "Admit Cards XS":
        return <ClassAdmitCards className="XS" />;
      case "ReAdmission from Class XS -> XI":
        return <DynamicReadmissionManagement className="XS" />;
      case "Knights CDTP Sessions XS":
        return <DynamicClassKnightsCDTPPage className="XS" />;
      case "Public Speaking Occasion XS":
        return <DynamicClassPublicSpeechOccassion className="XS" />;
      case "Annual Public Competition XS":
        return <DynamicClassPublicSpeakingOccasionPage className="XS" />;
      case "Generate Transfer Certificate XS":
        return <GenerateTransferCertificate className="XS" />;
      case "Exam Seating Cheats XS":
        return <DynamicExamSeatingCheats className="XS" />;
      case "Knights WB Test Preparation Series XS":
        return <BoardExamsResultManagement className="XS" />;

      // Class XI
      case "View Punishments to Use XI":
        return <ClassPunishment className="XI" />;
      case "Manage Students XI":
        return <DirectStudents className="XI" />;
      case "Insert & View Attendance XI":
        return <Attendance className="XI" />;
      case "Leave Requests & Approvals XI":
        return <LeaveRequestManagements className="XI" />;
      case "View Lecture & Homework Syl. XI":
        return <SyllabusDailyPlan className="XI" />;
      case "Confirm Weekly HomeWork XI":
        return <BiWeeklyClassHomwWork className="XI" />;
      case "View Institution Assignments XI":
        return <ClassBiWeeklyAssignmentsPage className="XI" />;
      case "Student Behaviour Log XI":
        return <DynamicStudentBehaviourLogDialog className="XI" />;
      case "Add Weekly Progress Test Marks XI":
        return <ClassBiWeeklyTestPage className="XI" />;
      case "Insert Students Marks XI":
        return <ClassExaminationResult className="XI" />;
      case "View Students Marks XI":
        return <DownloadExaminationResultCard className="XI" />;
      case "View Instructed Books XI":
        return <ClassSubjectBooks className="XI" />;
      case "Healthy Foods Suggestion XI":
        return <DynamicFoodsInstructions className="XI" />;
      case "Guardian Communication Log XI":
        return <DynamicClassGuardianCommunication className="XI" />;
      case "Parent-Teacher Meeting Notes XI":
        return <DynamicClassParentTeacherMeetingNotes className="XI" />;
      case "Monthly Fees XI":
        return <DynamicMonthlyFeeManagement className="XI" />;
      case "Examination Exams TimeTable XI":
        return <ExaminationExamsDateClassWise className="XI" />;
      case "Admit Cards XI":
        return <ClassAdmitCards className="XI" />;
      case "ReAdmission from Class XI -> XII":
        return <DynamicReadmissionManagement className="XI" />;
      case "Knights CDTP Sessions XI":
        return <DynamicClassKnightsCDTPPage className="XI" />;
      case "Public Speaking Occasion XI":
        return <DynamicClassPublicSpeechOccassion className="XI" />;
      case "Annual Public Competition XI":
        return <DynamicClassPublicSpeakingOccasionPage className="XI" />;
      case "Generate Transfer Certificate XI":
        return <GenerateTransferCertificate className="XI" />;
      case "Exam Seating Cheats XI":
        return <DynamicExamSeatingCheats className="XI" />;
      case "Knights WB Test Preparation Series XI":
        return <BoardExamsResultManagement className="XI" />;

      // Class XII
      case "View Punishments to Use XII":
        return <ClassPunishment className="XII" />;
      case "Manage Students XII":
        return <DirectStudents className="XII" />;
      case "Insert & View Attendance XII":
        return <Attendance className="XII" />;
      case "Leave Requests & Approvals XII":
        return <LeaveRequestManagements className="XII" />;
      case "View Lecture & Homework Syl. XII":
        return <SyllabusDailyPlan className="XII" />;
      case "Confirm Weekly HomeWork XII":
        return <BiWeeklyClassHomwWork className="XII" />;
      case "View Institution Assignments XII":
        return <ClassBiWeeklyAssignmentsPage className="XII" />;
      case "Student Behaviour Log XII":
        return <DynamicStudentBehaviourLogDialog className="XII" />;
      case "Add Weekly Progress Test Marks XII":
        return <ClassBiWeeklyTestPage className="XII" />;
      case "Insert Students Marks XII":
        return <ClassExaminationResult className="XII" />;
      case "View Students Marks XII":
        return <DownloadExaminationResultCard className="XII" />;
      case "View Instructed Books XII":
        return <ClassSubjectBooks className="XII" />;
      case "Healthy Foods Suggestion XII":
        return <DynamicFoodsInstructions className="XII" />;
      case "Guardian Communication Log XII":
        return <DynamicClassGuardianCommunication className="XII" />;
      case "Parent-Teacher Meeting Notes XII":
        return <DynamicClassParentTeacherMeetingNotes className="XII" />;
      case "Monthly Fees XII":
        return <DynamicMonthlyFeeManagement className="XII" />;
      case "Examination Exams TimeTable XII":
        return <ExaminationExamsDateClassWise className="XII" />;
      case "Admit Cards XII":
        return <ClassAdmitCards className="XII" />;
      case "ReAdmission from Class XII -> XIIS":
        return <DynamicReadmissionManagement className="XII" />;
      case "Knights CDTP Sessions XII":
        return <DynamicClassKnightsCDTPPage className="XII" />;
      case "Public Speaking Occasion XII":
        return <DynamicClassPublicSpeechOccassion className="XII" />;
      case "Annual Public Competition XII":
        return <DynamicClassPublicSpeakingOccasionPage className="XII" />;
      case "Generate Transfer Certificate XII":
        return <GenerateTransferCertificate className="XII" />;
      case "Exam Seating Cheats XII":
        return <DynamicExamSeatingCheats className="XII" />;
      case "Knights WB Test Preparation Series XII":
        return <BoardExamsResultManagement className="XII" />;

      // Class XIIS
      case "View Punishments to Use XIIS":
        return <ClassPunishment className="XIIS" />;
      case "Manage Students XIIS":
        return <DirectStudents className="XIIS" />;
      case "Insert & View Attendance XIIS":
        return <Attendance className="XIIS" />;
      case "Leave Requests & Approvals XIIS":
        return <LeaveRequestManagements className="XIIS" />;
      case "View Lecture & Homework Syl. XIIS":
        return <SyllabusDailyPlan className="XIIS" />;
      case "Confirm Weekly HomeWork XIIS":
        return <BiWeeklyClassHomwWork className="XIIS" />;
      case "View Institution Assignments XIIS":
        return <ClassBiWeeklyAssignmentsPage className="XIIS" />;
      case "Student Behaviour Log XIIS":
        return <DynamicStudentBehaviourLogDialog className="XIIS" />;
      case "Add Weekly Progress Test Marks XIIS":
        return <ClassBiWeeklyTestPage className="XIIS" />;
      case "Insert Students Marks XIIS":
        return <ClassExaminationResult className="XIIS" />;
      case "View Students Marks XIIS":
        return <DownloadExaminationResultCard className="XIIS" />;
      case "View Instructed Books XIIS":
        return <ClassSubjectBooks className="XIIS" />;
      case "Healthy Foods Suggestion XIIS":
        return <DynamicFoodsInstructions className="XIIS" />;
      case "GuardianGt;Communication Log XIIS":
        return <DynamicClassGuardianCommunication className="XIIS" />;
      case "Parent-Teacher Meeting Notes XIIS":
        return <DynamicClassParentTeacherMeetingNotes className="XIIS" />;
      case "Monthly Fees XIIS":
        return <DynamicMonthlyFeeManagement className="XIIS" />;
      case "Examination Exams TimeTable XIIS":
        return <ExaminationExamsDateClassWise className="XIIS" />;
      case "Admit Cards XIIS":
        return <ClassAdmitCards className="XIIS" />;
      case "ReAdmission from Class XIIS -> XIIIJ":
        return <DynamicReadmissionManagement className="XIIS" />;
      case "Knights CDTP Sessions XIIS":
        return <DynamicClassKnightsCDTPPage className="XIIS" />;
      case "Public Speaking Occasion XIIS":
        return <DynamicClassPublicSpeechOccassion className="XIIS" />;
      case "Annual Public Competition XIIS":
        return <DynamicClassPublicSpeakingOccasionPage className="XIIS" />;
      case "Generate Transfer Certificate XIIS":
        return <GenerateTransferCertificate className="XIIS" />;
      case "Exam Seating Cheats XIIS":
        return <DynamicExamSeatingCheats className="XIIS" />;
      case "Knights WB Test Preparation Series XIIS":
        return <BoardExamsResultManagement className="XIIS" />;

      // Class XIIIJ
      case "View Punishments to Use XIIIJ":
        return <ClassPunishment className="XIIIJ" />;
      case "Manage Students XIIIJ":
        return <DirectStudents className="XIIIJ" />;
      case "Insert & View Attendance XIIIJ":
        return <Attendance className="XIIIJ" />;
      case "Leave Requests & Approvals XIIIJ":
        return <LeaveRequestManagements className="XIIIJ" />;
      case "View Lecture & Homework Syl. XIIIJ":
        return <SyllabusDailyPlan className="XIIIJ" />;
      case "Confirm Weekly HomeWork XIIIJ":
        return <BiWeeklyClassHomwWork className="XIIIJ" />;
      case "View Institution Assignments XIIIJ":
        return <ClassBiWeeklyAssignmentsPage className="XIIIJ" />;
      case "Student Behaviour Log XIIIJ":
        return <DynamicStudentBehaviourLogDialog className="XIIIJ" />;
      case "Add Weekly Progress Test Marks XIIIJ":
        return <ClassBiWeeklyTestPage className="XIIIJ" />;
      case "Insert Students Marks XIIIJ":
        return <ClassExaminationResult className="XIIIJ" />;
      case "View Students Marks XIIIJ":
        return <DownloadExaminationResultCard className="XIIIJ" />;
      case "View Instructed Books XIIIJ":
        return <ClassSubjectBooks className="XIIIJ" />;
      case "Healthy Foods Suggestion XIIIJ":
        return <DynamicFoodsInstructions className="XIIIJ" />;
      case "Guardian Communication Log XIIIJ":
        return <DynamicClassGuardianCommunication className="XIIIJ" />;
      case "Parent-Teacher Meeting Notes XIIIJ":
        return <DynamicClassParentTeacherMeetingNotes className="XIIIJ" />;
      case "Monthly Fees XIIIJ":
        return <DynamicMonthlyFeeManagement className="XIIIJ" />;
      case "Admit Cards XIIIJ":
        return <ClassAdmitCards className="XIIIJ" />;
      case "ReAdmission from Class XIIIJ -> Next":
        return <DynamicReadmissionManagement className="XIIIJ" />;
      case "Knights CDTP Sessions XIIIJ":
        return <DynamicClassKnightsCDTPPage className="XIIIJ" />;
      case "Public Speaking Occasion XIIIJ":
        return <DynamicClassPublicSpeechOccassion className="XIIIJ" />;
      case "Annual Public Competition XIIIJ":
        return <DynamicClassPublicSpeakingOccasionPage className="XIIIJ" />;
      case "Generate Transfer Certificate XIIIJ":
        return <GenerateTransferCertificate className="XIIIJ" />;
      case "Exam Seating Cheats XIIIJ":
        return <DynamicExamSeatingCheats className="XIIIJ" />;
      //////////////////////////////////////////////////////////////////////////////////////////
      case "Print Exam Seating Management":
        return <ExaminationExamSeating />;
      ///////////////////////////////////////////////////////////////////////////
      case "🧾 View Fee Schemes":
        return <FeeManagement />;
      case "🧾 Admission Test Applications":
        return <AdmissionTestApplicationsManagement />;
      case "📝 Fill Admission Form":
        return <AdmissionTestApplicationsFormPanel />;
      case "📥 Download Admit Card":
        return <ExploreAdmitCards />;
      case "📚 Admission Test Schedule":
        return <AdmissionTestManagement />;
      case "🧠 Syllabus & Subject Info":
        return <TestSubjectSyllabusManagement />;
      case "📚 Print Application & Room No":
        return <TestSeatingManagement />;
      case "🧪 Test Evaluation & Mark Entry":
        return <TestEvaluationManagement />;
      case "📊 View Result & Rank List":
        return <TestResultManagement />;
      case "📋 KSAT Qualifieds Registration":
        return <QualifiedsAdmissionManagement />;
      case "📋 General Direct Registration":
        return <UnQualifiedsGeneralDirectAdmissionManagement />;
      case "📄 Form ID & Fee Receipt":
        return <AdmissionRecipts />;
      case "✅ Total Admitted Students":
        return <AdmittedStudents />;
      ///////////////////////////////////////////////////////////////////////////
      case "Employee List":
        return <EmployeeInfoList />;
      case "Faculties List":
        return <EmployeeInfoList />;
      case "Employee Manage List":
        return <EmployeeManageList />;
      case "View Institution Classes":
        return <AddInstitutionClasses />;
      case "Assign Class Teachers":
        return <AssignClassTeachers />;
      case "Add Institution Subjects":
        return <SubjectsManagement />;
      case "Preview Class to Subjects":
        return <ClassSubjectsManagement />;
      case "Examination Exams Panel":
        return <ExaminationExamScheduleManagement />;
      //////////////////////////////////////////////////////////////////////////
      case "AdminPanel Carousel":
        return <SiteHomepageCarousel />;
      case "Global Factory Employees":
        return <GlobalFactoryEmployees />;
      case "Employee Attendance":
        return <EmployeeWiseAttendance />;
      case "Employee Monthly Salary":
        return <FactoryEmployeeSalary />;
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case "Employee Attendance Logs":
        return <EmployeeWiseAttendance />;
      case "Insert Employee Entrance":
        return <InsertEmployeeEntrance />;
      case "Insert Employee Exit":
        return <InsertEmployeeExit />;
      case "Work Types":
        return <WorkTypes />;
      case "My Attendance":
        return <MyAttendance />;
      case "My Received Salary History":
        return <MySalaryHistory />;
      case "My Current Month Salary":
        return <MyCurrentMonthSalary />;
      case "My Daily Net Sales Bonus":
        return <MyDailyNetSalesBonus />;
      case "My Daily Sales Bonus Analysis":
        return <MyDailyDetailedSalesBonus />;
      case "My Mothly Net Salary & Bonus":
        return <MonthlyTotalSalesSalaryAndBonus />;
      ////////////////////////////////////////////////////////////////////////////
      case "Insert Faculty Entrance":
        return <InsertFactoryEmployeeEntrance />;
      case "Insert Faculty Exit":
        return <InsertFactoryEmployeeExit />;
      case "Faculty Attendance":
        return <FactoryEmployeeWiseAttendance />;
      case "View Faculty Attendance & Salary":
        return <FactoryEmployeeSalaryPanel />;
      case "Faculty Monthly Salary":
        return <FacultyMonthlySalary />;
      case "Faculty Payment Panel":
        return <FactoryEmployeePaymentPanel />;
      ////////////////////////////////////////////////////////////////////////////
      case "Brands":
        return <Brands />;
      case "Fleets":
        return <Fleets />;
      case "Depots":
        return <Depots />;
      case "Vehicle Documents":
        return <VehicleDocuments />;
      case "Vehicle Maintenance Logs":
        return <VehicleMaintenanceLogs />;
      ////////////////////////////////////////////////////////////////////////////
      case "School Evidence Submission":
      case "Upload & View Images":
        return <UploadImagesPanel />;
      ////////////////////////////////////////////////////////////////////////////
      case "Explore Customers":
        return <BrowseCustomers />;
      case "Explore Departments":
        return <BrowseDepartments />;
      case "Explore Districts":
        return <BrowseDistricts />;
      case "Explore Notifications":
        return <BrowseNotifications />;
      case "Explore Payments":
        return <BrowsePayments />;
      default:
        return <Box sx={{ color: "#fff", p: 3 }}>Select an available Faculty Panel workspace.</Box>;
    }
  };

  return <Box sx={{ backgroundColor: "#000" }}>{renderContent()}</Box>;
}

export default ContentArea;
