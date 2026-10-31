import 'package:flutter/material.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';
import 'package:sure_success_point_school_faculties_app/models/attendance_model.dart';
import 'package:sure_success_point_school_faculties_app/models/leave_request_model.dart';
import 'package:intl/intl.dart';

import '../widgets/attendance_widgets.dart';

class AttendanceViewModel extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<Student> students = [];
  List<Student> filteredStudents = [];
  List<LeaveRequest> leaveRequests = [];
  List<AttendanceRecord> attendanceRecords = [];
  Map<int, String> attendanceStatus = {};
  String className = 'Class';
  int page = 1;
  int totalPages = 1;
  String? error;
  bool isLoading = false;
  bool isLoadingHistory = false;
  String selectedMonth = DateFormat('yyyy-MM').format(DateTime.now());

  void fetchAttendanceData(int pageNum) async {
    isLoading = true;
    error = null;
    notifyListeners();

    final data = await _apiService.fetchAttendanceData(pageNum, 30);
    if (data != null) {
      students = (data['students'] as List).map((e) => Student.fromJson(e)).toList();
      filteredStudents = students;
      className = data['className'] ?? 'Class';
      totalPages = data['totalPages'] ?? 1;
      page = pageNum;
      attendanceStatus = {
        for (var student in students) student.id: student.status ?? 'ABSENT',
      };
    } else {
      error = 'Failed to fetch attendance data.';
    }

    isLoading = false;
    notifyListeners();
  }

  void filterStudents(String query) {
    filteredStudents = students
        .where((student) =>
    student.firstName.toLowerCase().contains(query.toLowerCase()) ||
        student.lastName.toLowerCase().contains(query.toLowerCase()) ||
        student.rollNumber.toLowerCase().contains(query.toLowerCase()))
        .toList();
    notifyListeners();
  }

  void updateAttendance(Student student, String status) async {
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final payload = {
      'studentId': student.id,
      'schoolId': student.schoolId,
      'branchId': student.branchId,
      'classId': student.classId,
      'status': status,
      'date': today,
    };
    final success = await _apiService.updateAttendance(payload);
    if (success) {
      attendanceStatus[student.id] = status;
      notifyListeners();
      // Show snackbar
      // Note: This requires a BuildContext, handled in the widget
    }
  }

  void openHistoryDialog(BuildContext context, Student student) {
    showDialog(
      context: context,
      builder: (context) => AttendanceHistoryDialog(
        studentId: student.id,
        studentName: '${student.firstName} ${student.lastName}',
        className: className,
      ),
    );
    fetchAttendanceHistory(student.id);
  }

  void openReportDialog(BuildContext context, Student student) {
    showDialog(
      context: context,
      builder: (context) => AttendanceReportDialog(
        studentId: student.id,
        studentName: '${student.firstName} ${student.lastName}',
        className: className,
      ),
    );
    fetchAttendanceHistory(student.id);
  }

  void fetchAttendanceHistory(int studentId) async {
    isLoadingHistory = true;
    notifyListeners();

    final records = await _apiService.fetchAttendanceHistory(className.toLowerCase(), studentId, selectedMonth);
    if (records != null) {
      attendanceRecords = records.map((e) => AttendanceRecord.fromJson(e)).toList();
    } else {
      attendanceRecords = [];
    }

    isLoadingHistory = false;
    notifyListeners();
  }

  void setSelectedMonth(String month) {
    selectedMonth = month;
    notifyListeners();
  }

  void fetchLeaveRequests(int pageNum) async {
    isLoading = true;
    error = null;
    notifyListeners();

    final data = await _apiService.fetchLeaveRequests(pageNum, 30, 'ALL');
    if (data != null) {
      leaveRequests = (data['leaveRequests'] as List).map((e) => LeaveRequest.fromJson(e)).toList();
      className = data['className'] ?? 'Class';
      totalPages = data['totalPages'] ?? 1;
      page = pageNum;
    } else {
      error = 'Failed to fetch leave requests.';
    }

    isLoading = false;
    notifyListeners();
  }

  void openLeaveRequestsDialog(BuildContext context) {
    // Placeholder for future implementation
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Approve Leave Requests functionality not implemented yet.')),
    );
  }

  void openLeaveRequestDetailsDialog(BuildContext context, LeaveRequest request) {
    showDialog(
      context: context,
      builder: (context) => ApproveLeaveRequestDialog(request: request),
    );
  }

  void openApproveDialog(BuildContext context, LeaveRequest request) {
    showDialog(
      context: context,
      builder: (context) => ApproveLeaveRequestDialog(request: request),
    );
  }

  void openStudentAttendanceDialog(BuildContext context, LeaveRequest request) {
    showDialog(
      context: context,
      builder: (context) => AttendanceHistoryDialog(
        studentId: request.studentId,
        studentName: request.studentName,
        className: className,
      ),
    );
    fetchAttendanceHistory(request.studentId);
  }

  void openStudentLeaveHistoryDialog(BuildContext context, LeaveRequest request) {
    // Placeholder for future implementation
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Student Leave History functionality not implemented yet.')),
    );
  }

  void approveLeaveRequest(int requestId, bool approved) async {
    final success = await _apiService.updateLeaveRequest(requestId, approved);
    if (success) {
      leaveRequests = leaveRequests.map((r) {
        if (r.id == requestId) {
          return LeaveRequest(
            id: r.id,
            studentId: r.studentId,
            studentName: r.studentName,
            fromDate: r.fromDate,
            toDate: r.toDate,
            reason: r.reason,
            approved: approved,
          );
        }
        return r;
      }).toList();
      notifyListeners();
    }
  }
}