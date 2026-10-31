// assignments_dialog.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../constants.dart';
import 'class_bi_weekly_assignments_page.dart';
import 'update_student_assignments_dialog.dart';
import 'student_assignments_dialog.dart';
import 'my_school_syllabus_page.dart';

// Model for StudentAssignment to match database schema
class StudentAssignment {
  final int id;
  final int assignmentId;
  final int studentId;
  final bool isSubmitted;
  final double? marksObtained;
  final String? remarks;
  final String? qualityTag;
  final DateTime? submittedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  StudentAssignment({
    required this.id,
    required this.assignmentId,
    required this.studentId,
    required this.isSubmitted,
    this.marksObtained,
    this.remarks,
    this.qualityTag,
    this.submittedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory StudentAssignment.fromJson(Map<String, dynamic> json) {
    return StudentAssignment(
      id: json['id'] ?? 0,
      assignmentId: json['assignmentId'] ?? 0,
      studentId: json['studentId'] ?? 0,
      isSubmitted: json['isSubmitted'] is bool ? json['isSubmitted'] : false,
      marksObtained: json['marksObtained'] != null ? (json['marksObtained'] as num).toDouble() : null,
      remarks: json['remarks'] as String?,
      qualityTag: json['qualityTag'] as String?,
      submittedAt: json['submittedAt'] != null ? DateTime.parse(json['submittedAt']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class AssignmentsDialog extends StatefulWidget {
  final dynamic selectedClassSubject;
  final String className;
  final VoidCallback onClose;

  const AssignmentsDialog({
    super.key,
    required this.selectedClassSubject,
    required this.className,
    required this.onClose,
  });

  @override
  _AssignmentsDialogState createState() => _AssignmentsDialogState();
}

class _AssignmentsDialogState extends State<AssignmentsDialog> {
  List<Map<String, dynamic>> assignments = [];
  List<dynamic> students = [];
  bool assignmentsLoading = false;
  String? errorMessage;
  final _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    final classSubjectId = widget.selectedClassSubject['id'];
    final classId = widget.selectedClassSubject['classId'];
    print('Selected ClassSubject: ${widget.selectedClassSubject}'); // Debug log
    if (classSubjectId is int && classId is int && classSubjectId > 0 && classId > 0) {
      fetchAssignments(classSubjectId);
      fetchStudents(classId);
    } else {
      setState(() {
        errorMessage = 'Invalid class subject ID or class ID';
      });
    }
  }

  Future<void> fetchAssignments(int classSubjectId) async {
    setState(() {
      assignmentsLoading = true;
      errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/Assignments/assignments?classSubjectId=$classSubjectId'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Assignments Response: $data'); // Debug log
        if (data is! List) throw Exception('Expected a list of assignments');
        setState(() {
          assignments = data.map((a) {
            final studentAssignments = (a['StudentAssignment'] as List<dynamic>? ?? [])
                .map((sa) => StudentAssignment.fromJson(sa as Map<String, dynamic>))
                .toList();
            return {
              'id': a['id'] ?? 0,
              'classSubjectId': a['classSubjectId'] ?? 0,
              'title': a['title'] ?? 'Untitled',
              'description': a['description'] ?? '',
              'dueDate': a['dueDate'] ?? DateTime.now().toIso8601String(),
              'biWeeklySlotStart': a['biWeeklySlotStart'] ?? DateTime.now().toIso8601String(),
              'biWeeklySlotEnd': a['biWeeklySlotEnd'] ?? DateTime.now().toIso8601String(),
              'marks': a['marks'],
              'StudentAssignment': studentAssignments,
              'createdAt': a['createdAt'] ?? DateTime.now().toIso8601String(),
              'updatedAt': a['updatedAt'] ?? DateTime.now().toIso8601String(),
            };
          }).toList();
          assignmentsLoading = false;
        });
      } else {
        throw Exception('Failed to fetch assignments: ${response.statusCode}');
      }
    } catch (e) {
      print('Fetch Assignments Error: $e'); // Debug log
      setState(() {
        assignmentsLoading = false;
        errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  Future<void> fetchStudents(int classId) async {
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/Assignments/students/$classId'),
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
              centerTitle: true,
              title: Text(
                'Assignments for ${widget.selectedClassSubject?['subject']['name'] ?? 'Unknown'} - ${widget.className}',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 20,
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
            forceElevated: false,
            actions: [
              IconButton(
                onPressed: widget.onClose,
                icon: const Icon(Icons.close, color: Colors.red),
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
                  else if (assignmentsLoading)
                    const Center(
                      child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
                    )
                  else ...[
                      assignments.isEmpty
                          ? Center(
                        child: Text(
                          'No assignments found.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                          : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: assignments.length,
                        itemBuilder: (context, index) {
                          final a = assignments[index];
                          final studentAssignments = a['StudentAssignment'] as List<StudentAssignment>;
                          final submissionCount = studentAssignments.where((sa) => sa.isSubmitted).length;
                          final totalSubmissions = studentAssignments.length;
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
                                          a['title'],
                                          style: GoogleFonts.poppins(
                                            color: Colors.white,
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        '$submissionCount/$totalSubmissions Submitted',
                                        style: GoogleFonts.poppins(
                                          color: submissionCount == totalSubmissions && totalSubmissions > 0
                                              ? Colors.green
                                              : Colors.yellow,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    a['description'],
                                    style: GoogleFonts.poppins(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Due: ${DateTime.parse(a['dueDate']).toLocal().toString().substring(0, 10)} | Bi-Weekly: ${DateTime.parse(a['biWeeklySlotStart']).toLocal().toString().substring(0, 10)} - ${DateTime.parse(a['biWeeklySlotEnd']).toLocal().toString().substring(0, 10)}',
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
                                              builder: (context) => UpdateStudentAssignmentsDialog(
                                                selectedAssignment: a,
                                                students: students,
                                                className: widget.className,
                                                fetchAssignments: () => fetchAssignments(widget.selectedClassSubject['id']),
                                                onClose: () => Navigator.pop(context),
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
                                          'Update',
                                          style: GoogleFonts.poppins(fontSize: 12),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      OutlinedButton(
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) => StudentAssignmentsDialog(
                                                selectedAssignment: a,
                                                className: widget.className,
                                                onClose: () => Navigator.pop(context),
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
                                          'View',
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