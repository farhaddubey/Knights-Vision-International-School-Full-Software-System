import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import './attendance_history_dialog.dart';
import './attendance_report_dialog.dart';
import './approve_leave_request_dialog.dart';
import '../constants.dart';
class LeaveRequest {
  final int id;
  final int studentId;
  final String studentName;
  final String fromDate;
  final String toDate;
  final String reason;
  final bool? approved;

  LeaveRequest({
    required this.id,
    required this.studentId,
    required this.studentName,
    required this.fromDate,
    required this.toDate,
    required this.reason,
    this.approved,
  });

  factory LeaveRequest.fromJson(Map<String, dynamic> json) {
    return LeaveRequest(
      id: json['id'] ?? 0,
      studentId: json['studentId'] ?? 0,
      studentName: json['studentName'] ?? 'Unknown',
      fromDate: json['fromDate'] ?? '',
      toDate: json['toDate'] ?? '',
      reason: json['reason'] ?? '',
      approved: json['approved'],
    );
  }
}

class LeaveRequestViewModel extends ChangeNotifier {
  List<LeaveRequest> leaveRequests = [];
  String className = 'Class';
  int page = 1;
  int totalPages = 1;
  bool isLoading = false;
  String? error;
  final _storage = const FlutterSecureStorage();

  Future<void> fetchLeaveRequests(int pageNum) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/leave-requests?page=$pageNum&pageSize=30&status=ALL'),
        headers: {'Authorization': 'Bearer $token'},
      );

      print('Fetching leave requests');
      print('Fetch URL: $BASE_URL/api-schools-panel/class_teachers_panel/leave-requests?page=$pageNum&pageSize=30&status=ALL');
      print('Fetch response status: ${response.statusCode}');
      print('Fetch response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        leaveRequests = (data['leaveRequests'] as List<dynamic>)
            .map((item) => LeaveRequest.fromJson(item))
            .toList();
        className = data['className'] ?? 'Class';
        page = pageNum;
        totalPages = data['totalPages'] ?? 1;
      } else {
        throw Exception('Failed to fetch leave requests: ${response.statusCode}');
      }
    } catch (e) {
      error = 'Failed to fetch leave requests: $e';
      Fluttertoast.showToast(
        msg: error!,
        backgroundColor: Colors.red,
      );
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void openLeaveRequestDetailsDialog(BuildContext context, LeaveRequest request) {
    showDialog(
      context: context,
      builder: (context) => ApproveLeaveRequestDialog(
        request: request,
        onUpdate: () => fetchLeaveRequests(page),
      ),
    );
  }

  void openApproveDialog(BuildContext context, LeaveRequest request) {
    showDialog(
      context: context,
      builder: (context) => ApproveLeaveRequestDialog(
        request: request,
        onUpdate: () => fetchLeaveRequests(page),
      ),
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
  }

  void openStudentLeaveHistoryDialog(BuildContext context, LeaveRequest request) {
    showDialog(
      context: context,
      builder: (context) => AttendanceReportDialog(
        studentId: request.studentId,
        studentName: request.studentName,
        className: className,
      ),
    );
  }
}

class LeaveRequestListItem extends StatelessWidget {
  final LeaveRequest request;
  final VoidCallback onDetailsTap;
  final VoidCallback onApproveTap;
  final VoidCallback onAttendanceTap;
  final VoidCallback onLeaveHistoryTap;

  const LeaveRequestListItem({
    super.key,
    required this.request,
    required this.onDetailsTap,
    required this.onApproveTap,
    required this.onAttendanceTap,
    required this.onLeaveHistoryTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFF1e1e1e),
      margin: const EdgeInsets.symmetric(vertical: 2, horizontal: 8),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          children: [
            Expanded(
              flex: 1,
              child: Text(
                '${request.id}',
                style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                request.studentName,
                style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                '${request.fromDate.substring(0, 10)} to ${request.toDate.substring(0, 10)}',
                style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                request.reason,
                style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
              ),
            ),
            Expanded(
              flex: 1,
              child: Text(
                request.approved == null
                    ? 'Pending'
                    : request.approved!
                    ? 'Approved'
                    : 'Rejected',
                style: GoogleFonts.poppins(
                  color: request.approved == null
                      ? Colors.yellow
                      : request.approved!
                      ? Colors.green
                      : Colors.red,
                  fontSize: 12,
                ),
              ),
            ),
            Expanded(
              flex: 3,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: request.approved == null ? onApproveTap : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00c757),
                      minimumSize: const Size(80, 32),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ),
                    child: Text(
                      'Approve/Reject',
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 10),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: onAttendanceTap,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      minimumSize: const Size(80, 32),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ),
                    child: Text(
                      'Attendance',
                      style: GoogleFonts.poppins(color: Colors.black, fontSize: 10),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: onLeaveHistoryTap,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF03a9f4),
                      minimumSize: const Size(80, 32),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ),
                    child: Text(
                      'Leave History',
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 10),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class LeaveRequestsPage extends StatefulWidget {
  const LeaveRequestsPage({super.key});

  @override
  _LeaveRequestsPageState createState() => _LeaveRequestsPageState();
}

class _LeaveRequestsPageState extends State<LeaveRequestsPage> {
  final _viewModel = LeaveRequestViewModel();

  @override
  void initState() {
    super.initState();
    _viewModel.fetchLeaveRequests(1);
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: _viewModel,
      child: Consumer<LeaveRequestViewModel>(
        builder: (context, viewModel, child) {
          return Scaffold(
            backgroundColor: const Color(0xFF000000),
            body: CustomScrollView(
              slivers: [
                SliverAppBar(
                  pinned: true,
                  backgroundColor: const Color(0xFFb71c1c),
                  flexibleSpace: FlexibleSpaceBar(
                    title: Row(
                      children: [
                        const Icon(Icons.event, color: Colors.white),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${viewModel.className} Leave Requests',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    background: Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Color(0xFFb71c1c), Color(0xFFd32f2f)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                    ),
                  ),
                  toolbarHeight: 56.0,
                  automaticallyImplyLeading: true,
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        // Header row
                        Container(
                          color: const Color(0xFF333333),
                          padding: const EdgeInsets.all(8.0),
                          child: Row(
                            children: [
                              Expanded(
                                flex: 1,
                                child: Text(
                                  'ID',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              Expanded(
                                flex: 2,
                                child: Text(
                                  'Student',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              Expanded(
                                flex: 2,
                                child: Text(
                                  'Date Range',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              Expanded(
                                flex: 2,
                                child: Text(
                                  'Reason',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              Expanded(
                                flex: 1,
                                child: Text(
                                  'Status',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              Expanded(
                                flex: 3,
                                child: Text(
                                  'Actions',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 4.0),
                        viewModel.isLoading
                            ? const Center(child: CircularProgressIndicator(color: Color(0xFF00c757)))
                            : viewModel.error != null
                            ? Center(
                          child: Text(
                            viewModel.error!,
                            style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
                          ),
                        )
                            : viewModel.leaveRequests.isEmpty
                            ? Center(
                          child: Text(
                            'No leave requests found for ${viewModel.className}.',
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                          ),
                        )
                            : ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: viewModel.leaveRequests.length,
                          itemBuilder: (context, index) {
                            final request = viewModel.leaveRequests[index];
                            return LeaveRequestListItem(
                              request: request,
                              onDetailsTap: () => viewModel.openLeaveRequestDetailsDialog(context, request),
                              onApproveTap: () => viewModel.openApproveDialog(context, request),
                              onAttendanceTap: () => viewModel.openStudentAttendanceDialog(context, request),
                              onLeaveHistoryTap: () => viewModel.openStudentLeaveHistoryDialog(context, request),
                            );
                          },
                        ),
                        if (viewModel.totalPages > 1)
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.chevron_left, color: Colors.white),
                                  onPressed: viewModel.page > 1
                                      ? () => viewModel.fetchLeaveRequests(viewModel.page - 1)
                                      : null,
                                ),
                                Text(
                                  'Page ${viewModel.page} of ${viewModel.totalPages}',
                                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.chevron_right, color: Colors.white),
                                  onPressed: viewModel.page < viewModel.totalPages
                                      ? () => viewModel.fetchLeaveRequests(viewModel.page + 1)
                                      : null,
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}