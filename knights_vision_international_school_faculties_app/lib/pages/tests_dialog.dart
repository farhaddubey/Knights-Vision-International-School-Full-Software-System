// tests_dialog.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../constants.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'test_marks_dialog.dart';
import 'test_marks_view_dialog.dart';

class TestsDialog extends StatefulWidget {
  final dynamic classSubject;
  final String className;
  final VoidCallback onClose;

  const TestsDialog({
    super.key,
    required this.classSubject,
    required this.className,
    required this.onClose,
  });

  @override
  _TestsDialogState createState() => _TestsDialogState();
}

class _TestsDialogState extends State<TestsDialog> {
  List<dynamic> tests = [];
  List<dynamic> students = [];
  bool testsLoading = false;
  String? errorMessage;
  final _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    if (widget.classSubject != null) {
      fetchTests(widget.classSubject['id']);
      fetchStudents(widget.classSubject['classId']);
    }
  }

  Future<void> fetchTests(int classSubjectId) async {
    setState(() {
      testsLoading = true;
      errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/Tests/${widget.className.toLowerCase()}/tests?classSubjectId=$classSubjectId'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Tests Response: $data'); // Debug log
        setState(() {
          tests = data['tests'] ?? [];
          testsLoading = false;
        });
      } else {
        throw Exception('Failed to fetch tests: ${response.statusCode}');
      }
    } catch (e) {
      print('Fetch Tests Error: $e'); // Debug log
      setState(() {
        testsLoading = false;
        errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage ?? 'Failed to fetch tests')),
      );
    }
  }

  Future<void> fetchStudents(int classId) async {
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/Tests/${widget.className.toLowerCase()}/students/$classId'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Students Response: $data'); // Debug log
        setState(() {
          students = data['students'] ?? [];
        });
      } else {
        throw Exception('Failed to fetch students: ${response.statusCode}');
      }
    } catch (e) {
      print('Fetch Students Error: $e'); // Debug log
      setState(() {
        errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage ?? 'Failed to fetch students')),
      );
    }
  }

  double calculateAverageMarks(List<dynamic> testMarks) {
    if (testMarks.isEmpty) return 0;
    final sum = testMarks.fold<double>(0, (sum, tm) => sum + (tm['marks'] ?? 0));
    return (sum / testMarks.length).toDouble();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFF009688),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                'Tests for ${widget.classSubject?['subject']['name'] ?? 'Unknown'} - ${widget.className}',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            toolbarHeight: 56.0,
            elevation: 0,
            forceElevated: false,
            actions: [
              IconButton(
                onPressed: widget.onClose,
                icon: const Icon(Icons.close, color: Color(0xFFf44336)),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  if (errorMessage != null)
                    Center(
                      child: Text(
                        errorMessage!,
                        style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
                      ),
                    )
                  else if (testsLoading)
                    const Center(
                      child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
                    )
                  else ...[
                      tests.isEmpty
                          ? Center(
                        child: Text(
                          'No tests found.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                          : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: tests.length,
                        itemBuilder: (context, index) {
                          final t = tests[index];
                          final averageMarks = calculateAverageMarks(t['TestMark'] ?? []);
                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          t['title'] ?? 'Test ${t['id']}',
                                          style: GoogleFonts.poppins(
                                            color: Colors.white,
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        '${averageMarks.toStringAsFixed(2)}/30',
                                        style: GoogleFonts.poppins(
                                          color: averageMarks >= 15 ? Colors.green : Colors.yellow,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Syllabus: ${t['syllabus'] != null ? jsonEncode(t['syllabus']) : 'N/A'}',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Bi-Weekly: ${DateTime.parse(t['biWeeklySlotStart']).toLocal().toString().substring(0, 10)} - ${DateTime.parse(t['biWeeklySlotEnd']).toLocal().toString().substring(0, 10)}',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      OutlinedButton(
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) => TestMarksDialog(
                                                open: true,
                                                onClose: () => Navigator.pop(context),
                                                test: t,
                                                students: students,
                                                className: widget.className,
                                                fetchTests: fetchTests,
                                              ),
                                            ),
                                          );
                                        },
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: const Color(0xFF00c757),
                                          side: const BorderSide(color: Color(0xFF00c757)),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(5),
                                          ),
                                        ),
                                        child: Text(
                                          'Update Marks',
                                          style: GoogleFonts.poppins(fontSize: 12),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      OutlinedButton(
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) => TestMarksViewDialog(
                                                onClose: () => Navigator.pop(context),
                                                test: t,
                                                students: students,
                                                className: widget.className,
                                              ),
                                            ),
                                          );
                                        },
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: Colors.white,
                                          side: const BorderSide(color: Colors.white),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(5),
                                          ),
                                        ),
                                        child: Text(
                                          'View Marks',
                                          style: GoogleFonts.poppins(fontSize: 12),
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
                      const SizedBox(height: 8),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: ElevatedButton(
                          onPressed: widget.onClose,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5),
                            ),
                          ),
                          child: Text(
                            'Close',
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                          ),
                        ),
                      ),
                    ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}