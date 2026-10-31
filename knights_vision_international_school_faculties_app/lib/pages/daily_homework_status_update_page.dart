import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';
import 'class_monthly_homework_report_page.dart';

class DailyHomeworkStatusUpdatePage extends StatefulWidget {
  final dynamic selectedClassSubject;
  final String className;

  const DailyHomeworkStatusUpdatePage({
    super.key,
    required this.selectedClassSubject,
    required this.className, required List students,
  });

  @override
  _DailyHomeworkStatusUpdatePageState createState() => _DailyHomeworkStatusUpdatePageState();
}

class _DailyHomeworkStatusUpdatePageState extends State<DailyHomeworkStatusUpdatePage> {
  final ApiService _apiService = ApiService();
  Map<int, String> homeworkStatuses = {};
  List<dynamic> students = [];
  List<dynamic> filteredStudents = [];
  String searchQuery = '';
  bool loading = false;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  Future<void> _fetchStudents() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final studentsData = await _apiService.fetchStudents(widget.selectedClassSubject['classId']);
      setState(() {
        students = studentsData ?? [];
        filteredStudents = students;
        if (students.isNotEmpty) {
          _fetchHomeworkStatuses();
        } else {
          loading = false;
        }
      });
    } catch (e) {
      setState(() {
        error = 'Failed to fetch students: $e';
        loading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to fetch students')));
    }
  }

  Future<void> _fetchHomeworkStatuses() async {
    setState(() {
      loading = true;
    });
    try {
      final today = DateTime.now().toIso8601String().substring(0, 10);
      final statuses = await _apiService.fetchHomeworkStatuses(widget.selectedClassSubject['id'], students, today);
      setState(() {
        homeworkStatuses = statuses ?? {};
        loading = false;
      });
    } catch (e) {
      setState(() {
        loading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to fetch homework statuses: $e')));
    }
  }

  Future<void> _handleStatusChange(dynamic student, String status) async {
    try {
      final today = DateTime.now().toIso8601String().substring(0, 10);
      final success = await _apiService.updateHomeworkStatus(widget.selectedClassSubject['id'], student['id'], status, today);
      if (success) {
        setState(() {
          homeworkStatuses[student['id']] = status;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Homework status updated to $status for ${student['firstName']} ${student['lastName']}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update homework status: $e')));
    }
  }

  void _navigateToReportPage(dynamic student) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ClassMonthlyHomeworkReportPage(
          classSubjectId: widget.selectedClassSubject['id'],
          className: widget.className,
          subjectName: widget.selectedClassSubject['subject']['name'],
          studentId: student['id'],
          studentName: '${student['firstName']} ${student['lastName']}',
        ),
      ),
    );
  }

  void _filterStudents(String query) {
    setState(() {
      searchQuery = query;
      filteredStudents = students.where((student) {
        final fullName = '${student['firstName']} ${student['lastName']}'.toLowerCase();
        final rollNumber = student['rollNumber']?.toString().toLowerCase() ?? '';
        return fullName.contains(query.toLowerCase()) || rollNumber.contains(query.toLowerCase());
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    final statusStyles = {
      'PENDING': {'variant': 'outlined', 'color': Colors.red},
      'SUBMITTED': {'variant': 'contained', 'color': Colors.green},
      'LATE': {'variant': 'contained', 'color': Colors.red},
      'NEEDS_IMPROVEMENT': {'variant': 'contained', 'color': Colors.yellow},
      'EXCELLENT': {'variant': 'contained', 'color': Colors.green},
    };

    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFFb71c1c),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                'Daily Homework Status - ${widget.className} - ${widget.selectedClassSubject?['subject']['name']}',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
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
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Card(
                    color: const Color(0xFF111111),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.0),
                      child: TextField(
                        onChanged: _filterStudents,
                        decoration: InputDecoration(
                          hintText: 'Search Students...',
                          hintStyle: GoogleFonts.poppins(color: Colors.white70),
                          filled: true,
                          fillColor: const Color(0xFF333333),
                          border: const OutlineInputBorder(borderSide: BorderSide.none),
                          prefixIcon: const Icon(Icons.search, color: Colors.white70),
                        ),
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  if (loading)
                    const Center(child: SpinKitCircle(color: Color(0xFF00c757)))
                  else if (error != null)
                    Center(child: Text(error!, style: GoogleFonts.poppins(color: Colors.red, fontSize: 16)))
                  else if (filteredStudents.isEmpty)
                      Center(
                        child: Text(
                          'No students found for ${widget.className}.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                    else
                      Container(
                        color: const Color(0xFF333333),
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 3,
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
                              flex: 10,
                              child: Text(
                                'Name',
                                style: GoogleFonts.poppins(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            Expanded(
                              flex: 8,
                              child: Text(
                                'Roll No.',
                                style: GoogleFonts.poppins(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            Expanded(
                              flex: 15,
                              child: Text(
                                'Status',
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
                  if (!loading && filteredStudents.isNotEmpty)
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: filteredStudents.length,
                      itemBuilder: (context, index) {
                        final student = filteredStudents[index];
                        final studentId = student['id'];
                        return Card(
                          color: const Color(0xFF1e1e1e),
                          margin: const EdgeInsets.symmetric(vertical: 2),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      flex: 3,
                                      child: Text(
                                        '${student['id']}',
                                        style: GoogleFonts.poppins(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w500,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 10,
                                      child: Text(
                                        '${student['firstName']} ${student['lastName']}',
                                        style: GoogleFonts.poppins(
                                          color: Colors.white,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 8,
                                      child: Text(
                                        student['rollNumber'] ?? 'N/A',
                                        style: GoogleFonts.poppins(
                                          color: Colors.white,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 15,
                                      child: Text(
                                        homeworkStatuses[studentId]?.replaceAll('_', ' ') ?? 'PENDING',
                                        style: GoogleFonts.poppins(
                                          color: homeworkStatuses[studentId] == 'PENDING'
                                              ? Colors.red
                                              : homeworkStatuses[studentId] == 'SUBMITTED'
                                              ? Colors.green
                                              : homeworkStatuses[studentId] == 'LATE'
                                              ? Colors.red
                                              : homeworkStatuses[studentId] == 'NEEDS_IMPROVEMENT'
                                              ? Colors.yellow
                                              : Colors.green,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Expanded(
                                      flex: 15,
                                      child: Wrap(
                                        spacing: 8,
                                        children: ['PENDING', 'SUBMITTED', 'LATE', 'NEEDS_IMPROVEMENT', 'EXCELLENT'].map((status) {
                                          return ElevatedButton(
                                            onPressed: () => _handleStatusChange(student, status),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: homeworkStatuses[studentId] == status
                                                  ? statusStyles[status]!['color'] as Color
                                                  : const Color(0xFF333333),
                                              minimumSize: const Size(80, 36),
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(5),
                                              ),
                                            ),
                                            child: Text(
                                              status.replaceAll('_', ' '),
                                              style: GoogleFonts.poppins(
                                                color: homeworkStatuses[studentId] == status ? Colors.white : Colors.white70,
                                                fontSize: 12,
                                              ),
                                            ),
                                          );
                                        }).toList(),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 3,
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          Container(
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF333333),
                                              borderRadius: BorderRadius.circular(5),
                                            ),
                                            child: IconButton(
                                              onPressed: () => _navigateToReportPage(student),
                                              icon: const Icon(Icons.report, color: Color(0xFFffeb3b)),
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
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}