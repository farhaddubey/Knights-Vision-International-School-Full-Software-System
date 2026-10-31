import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'attendance_history_dialog.dart';
import 'attendance_report_dialog.dart';
import '../constants.dart';

class AttendancePage extends StatefulWidget {
  const AttendancePage({super.key});

  @override
  _AttendancePageState createState() => _AttendancePageState();
}

class _AttendancePageState extends State<AttendancePage> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _students = [];
  List<dynamic> _filteredStudents = [];
  String _className = 'Class';
  int _page = 1;
  int _totalPages = 1;
  bool _isLoading = false;
  String? _error;
  String _searchQuery = '';
  Map<int, String> _attendanceStatus = {};

  @override
  void initState() {
    super.initState();
    _fetchAttendanceData();
  }

  Future<void> _fetchAttendanceData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/attendance/fetch-attendance?page=$_page&pageSize=100'),
        headers: {'Authorization': 'Bearer $token'},
      );

      print('Fetching attendance');
      print('Fetch URL: $BASE_URL/api-schools-panel/class_teachers_panel/attendance/fetch-attendance?page=$_page&pageSize=30');
      print('Fetch response status: ${response.statusCode}');
      print('Fetch response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['students'] == null || data['students'] is! List) {
          throw Exception('Invalid response format');
        }

        setState(() {
          _students = data['students'];
          _filteredStudents = _searchQuery.isEmpty ? _students : _filterStudents(_searchQuery);
          _className = data['className'] ?? 'Class';
          _totalPages = data['totalPages'] ?? 1;
          _attendanceStatus = {
            for (var student in _students)
              student['id']: student['status'] ?? ''
          };
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch attendance: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching attendance: $e');
      print(stackTrace);
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
      Fluttertoast.showToast(
        msg: _error ?? 'Failed to fetch attendance',
        backgroundColor: Colors.red,
      );
    }
  }

  List<dynamic> _filterStudents(String query) {
    return _students.where((student) {
      final firstName = student['firstName']?.toLowerCase() ?? '';
      final lastName = student['lastName']?.toLowerCase() ?? '';
      final rollNumber = student['rollNumber']?.toLowerCase() ?? '';
      return firstName.contains(query.toLowerCase()) ||
          lastName.contains(query.toLowerCase()) ||
          rollNumber.contains(query.toLowerCase());
    }).toList();
  }

  void _handleSearchChange(String query) {
    setState(() {
      _searchQuery = query;
      _filteredStudents = _filterStudents(query);
      _page = 1;
    });
  }

  void _handlePageChange(int newPage) {
    setState(() {
      _page = newPage;
    });
    _fetchAttendanceData();
  }

  Future<void> _updateAttendance(int studentId, Map<String, dynamic> student, String status) async {
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final payload = {
        'studentId': studentId,
        'schoolId': student['schoolId'],
        'branchId': student['branchId'],
        'classId': student['classId'],
        'status': status,
        'date': DateTime.now().toIso8601String().substring(0, 10),
      };

      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/attendance?studentId=$studentId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        setState(() {
          _attendanceStatus[studentId] = status;
        });
        Fluttertoast.showToast(
          msg: 'Attendance updated to $status for student ID $studentId',
          backgroundColor: Colors.green,
        );
      } else {
        throw Exception('Failed to update attendance: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error updating attendance: $e');
      print(stackTrace);
      Fluttertoast.showToast(
        msg: 'Failed to update attendance',
        backgroundColor: Colors.red,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFFb71c1c),
            flexibleSpace: FlexibleSpaceBar(
              title: Row(
                children: [
                  const Icon(Icons.people, color: Colors.white),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '$_className Attendance',
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
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                children: [
                  // Search bar with vertical margin
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 4.0),
                    child: SizedBox(
                      width: double.infinity,
                      child: TextField(
                        onChanged: _handleSearchChange,
                        style: GoogleFonts.poppins(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Search Students...',
                          hintStyle: GoogleFonts.poppins(color: Colors.white70),
                          prefixIcon: const Icon(Icons.search, color: Colors.white),
                          filled: true,
                          fillColor: const Color(0xFF333333),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(4),
                            borderSide: const BorderSide(color: Colors.white),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(4),
                            borderSide: const BorderSide(color: Color(0xFF00c757)),
                          ),
                        ),
                      ),
                    ),
                  ),
                  // Header row
                  Container(
                    color: const Color(0xFF333333),
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      children: [
                        Expanded(
                          flex: 15,
                          child: Text(
                            'Roll No.',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 25,
                          child: Text(
                            'Name',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 10,
                          child: Text(
                            'Status',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),

                      ],
                    ),
                  ),
                  // Reduced space after header row
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator(color: Color(0xFF00c757)))
                  else if (_error != null)
                    Center(
                      child: Card(
                        color: const Color(0xFF181818),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _error!,
                                style: GoogleFonts.poppins(color: Colors.red),
                              ),
                              const SizedBox(height: 10),
                              ElevatedButton(
                                onPressed: _fetchAttendanceData,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF00c757),
                                ),
                                child: Text('Retry', style: GoogleFonts.poppins()),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  else if (_filteredStudents.isEmpty)
                      Center(
                        child: Text(
                          'No students found for $_className.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _filteredStudents.length,
                        itemBuilder: (context, index) {
                          final student = _filteredStudents[index];
                          final studentId = student['id'];
                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 2),
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // First row: Roll No., Name, Status
                                  Row(
                                    children: [
                                      Expanded(
                                        flex: 15,
                                        child: Text(
                                          student['rollNumber'] ?? 'N/A',
                                          style: GoogleFonts.poppins(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        flex: 25,
                                        child: Text(
                                          '${student['firstName']} ${student['middleName'] ?? ''} ${student['lastName']}',
                                          style: GoogleFonts.poppins(color: Colors.white),
                                        ),
                                      ),
                                      Expanded(
                                        flex: 10,
                                        child: Text(
                                          _attendanceStatus[studentId] ?? '',
                                          style: GoogleFonts.poppins(
                                            color: _attendanceStatus[studentId] == 'PRESENT'
                                                ? Colors.green
                                                : _attendanceStatus[studentId] == 'ABSENT'
                                                ? Colors.red
                                                : _attendanceStatus[studentId] == 'HOLIDAY'
                                                ? Colors.purple
                                                : Colors.blueAccent,
                                          ),
                                        ),
                                      ),
                                      const Expanded(flex: 3, child: SizedBox()),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  // Second row: Attendance buttons and action buttons
                                  Row(
                                    children: [
                                      Expanded(
                                        flex: 10,
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                          children: [
                                            ElevatedButton(
                                              onPressed: () => _updateAttendance(studentId, student, 'PRESENT'),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: _attendanceStatus[studentId] == 'PRESENT'
                                                    ? Colors.green
                                                    : const Color(0xFF000000),
                                                minimumSize: const Size(70, 36),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(5),
                                                ),
                                              ),
                                              child: Text(
                                                'Pre',
                                                style: GoogleFonts.poppins(
                                                  color: _attendanceStatus[studentId] == 'PRESENT'
                                                      ? Colors.white
                                                      : Colors.white,
                                                ),
                                              ),
                                            ),
                                            ElevatedButton(
                                              onPressed: () => _updateAttendance(studentId, student, 'ABSENT'),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: _attendanceStatus[studentId] == 'ABSENT'
                                                    ? Colors.red
                                                    : const Color(0xFF000000),
                                                minimumSize: const Size(70, 36),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(5),
                                                ),
                                              ),
                                              child: Text(
                                                'Ab',
                                                style: GoogleFonts.poppins(
                                                  color: _attendanceStatus[studentId] == 'ABSENT'
                                                      ? Colors.white
                                                      : Colors.white,
                                                ),
                                              ),
                                            ),
                                            ElevatedButton(
                                              onPressed: () => _updateAttendance(studentId, student, 'HOLIDAY'),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: _attendanceStatus[studentId] == 'HOLIDAY'
                                                    ? Colors.purple
                                                    : const Color(0xFF000000),
                                                minimumSize: const Size(70, 36),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(5),
                                                ),
                                              ),
                                              child: Text(
                                                'Ho',
                                                style: GoogleFonts.poppins(
                                                  color: _attendanceStatus[studentId] == 'HOLIDAY'
                                                      ? Colors.white
                                                      : Colors.white,
                                                ),
                                              ),
                                            ),
                                            ElevatedButton(
                                              onPressed: () => _updateAttendance(studentId, student, 'WEEKLY_HOLIDAY'),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: _attendanceStatus[studentId] == 'WEEKLY_HOLIDAY'
                                                    ? Colors.blueAccent
                                                    : const Color(0xFF000000),
                                                minimumSize: const Size(70, 36),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(5),
                                                ),
                                              ),
                                              child: Text(
                                                'SU',
                                                style: GoogleFonts.poppins(
                                                  color: _attendanceStatus[studentId] == 'WEEKLY_HOLIDAY'
                                                      ? Colors.white
                                                      : Colors.white,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Expanded(
                                        flex: 4,
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                          children: [
                                            Container(
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF000000),
                                                borderRadius: BorderRadius.circular(5),
                                              ),
                                              child: IconButton(
                                                onPressed: () {
                                                  Navigator.push(
                                                    context,
                                                    MaterialPageRoute(
                                                      builder: (context) => AttendanceHistoryDialog(
                                                        studentId: studentId,
                                                        studentName:
                                                        '${student['firstName']} ${student['lastName']}',
                                                        className: _className,
                                                      ),
                                                    ),
                                                  );
                                                },
                                                icon: const Icon(Icons.history, color: Colors.yellow),
                                                padding: const EdgeInsets.all(8),
                                              ),
                                            ),
                                            Container(
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF000000),
                                                borderRadius: BorderRadius.circular(5),
                                              ),
                                              child: IconButton(
                                                onPressed: () {
                                                  Navigator.push(
                                                    context,
                                                    MaterialPageRoute(
                                                      builder: (context) => AttendanceReportDialog(
                                                        studentId: studentId,
                                                        studentName:
                                                        '${student['firstName']} ${student['lastName']}',
                                                        className: _className,
                                                      ),
                                                    ),
                                                  );
                                                },
                                                icon: const Icon(Icons.report, color: Colors.orange),
                                                padding: const EdgeInsets.all(8),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                  Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF181818),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          onPressed: _page > 1 ? () => _handlePageChange(_page - 1) : null,
                          icon: const Icon(Icons.chevron_left, color: Colors.white),
                        ),
                        Text(
                          'Page $_page of $_totalPages',
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        IconButton(
                          onPressed: _page < _totalPages ? () => _handlePageChange(_page + 1) : null,
                          icon: const Icon(Icons.chevron_right, color: Colors.white),
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
  }
}