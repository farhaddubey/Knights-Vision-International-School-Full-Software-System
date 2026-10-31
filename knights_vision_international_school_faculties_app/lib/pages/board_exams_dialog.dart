import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'board_exam_results_dialog.dart';
import '../constants.dart';

class BoardExamsDialog extends StatefulWidget {
  final dynamic classSubject;
  final String className;
  final int academicYear;
  final String month;
  final VoidCallback onClose;

  const BoardExamsDialog({
    super.key,
    required this.classSubject,
    required this.className,
    required this.academicYear,
    required this.month,
    required this.onClose,
  });

  @override
  _BoardExamsDialogState createState() => _BoardExamsDialogState();
}

class _BoardExamsDialogState extends State<BoardExamsDialog> {
  final storage = const FlutterSecureStorage();
  List<dynamic> boardExams = [];
  List<dynamic> students = [];
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.classSubject != null) {
      fetchBoardExams(widget.classSubject['id']);
      fetchStudents(widget.classSubject['classId']);
    }
  }

  Future<void> fetchBoardExams(int classSubjectId) async {
    setState(() => isLoading = true);
    try {
      final token = await storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated.');
      }
      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/BoardExams/${widget.className.toLowerCase()}/board-exams?classSubjectId=$classSubjectId&academicYear=${widget.academicYear}&month=${monthNames.indexOf(widget.month) + 1}'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          boardExams = data['boardExams'] ?? [];
          isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch board exams: ${response.statusCode}');
      }
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch board exams: $e')),
      );
    }
  }

  Future<void> fetchStudents(int classId) async {
    try {
      final token = await storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated.');
      }
      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/BoardExams/${widget.className.toLowerCase()}/students/$classId'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() => students = data['students'] ?? []);
      } else {
        throw Exception('Failed to fetch students: ${response.statusCode}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch students: $e')),
      );
    }
  }

  final List<String> monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      appBar: AppBar(
        backgroundColor: const Color(0xFF009688),
        title: Row(
          children: [
            const Icon(Icons.calendar_today, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Board Exams for ${widget.classSubject?['subject']['name'] ?? 'Unknown'} - ${widget.className}',
                style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            IconButton(
              onPressed: widget.onClose,
              icon: const Icon(Icons.close, color: Colors.red),
            ),
          ],
        ),
      ),
      body: isLoading
          ? const Center(child: SpinKitCircle(color: Color(0xFF00c757), size: 120))
          : Column(
        children: [
          Container(
            color: const Color(0xFF333333),
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(flex: 2, child: Text('Title', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                Expanded(flex: 2, child: Text('Syllabus', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                Expanded(flex: 2, child: Text('Exam Date', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                Expanded(flex: 2, child: Text('Total Marks', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                Expanded(flex: 2, child: Text('Actions', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
              ],
            ),
          ),
          Expanded(
            child: boardExams.isEmpty
                ? Center(child: Text('No board exams found.', style: GoogleFonts.poppins(color: Colors.white)))
                : ListView.builder(
              itemCount: boardExams.length,
              itemBuilder: (context, index) {
                final exam = boardExams[index];
                return Container(
                  margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                  color: const Color(0xFF181818),
                  child: Row(
                    children: [
                      Expanded(flex: 2, child: Padding(padding: const EdgeInsets.all(8), child: Text(exam['title'] ?? 'N/A', style: GoogleFonts.poppins(color: Colors.white)))),
                      Expanded(flex: 2, child: Padding(padding: const EdgeInsets.all(8), child: Text(exam['syllabus'] ?? 'N/A', style: GoogleFonts.poppins(color: Colors.white)))),
                      Expanded(flex: 2, child: Padding(padding: const EdgeInsets.all(8), child: Text(DateTime.parse(exam['examDate']).toString().split(' ')[0], style: GoogleFonts.poppins(color: Colors.white)))),
                      Expanded(flex: 2, child: Padding(padding: const EdgeInsets.all(8), child: Text(exam['totalMarks'].toString(), style: GoogleFonts.poppins(color: Colors.white)))),
                      Expanded(
                        flex: 2,
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => BoardExamResultsDialog(
                                    boardExam: exam,
                                    students: students,
                                    className: widget.className,
                                    fetchBoardExams: () => fetchBoardExams(widget.classSubject['id']),
                                    onClose: () => Navigator.pop(context),
                                  ),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00c757)),
                            child: Text('Update Results', style: GoogleFonts.poppins(color: Colors.black)),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: ElevatedButton(
              onPressed: widget.onClose,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: Text('Close', style: GoogleFonts.poppins(color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}
