import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../constants.dart';
import 'class_bi_weekly_assignments_page.dart';
import 'my_school_syllabus_page.dart';
import 'assignments_dialog.dart';
import 'student_assignments_dialog.dart';

class UpdateStudentAssignmentsDialog extends StatefulWidget {
  final dynamic selectedAssignment;
  final List<dynamic> students;
  final String className;
  final VoidCallback onClose;
  final Function fetchAssignments;

  const UpdateStudentAssignmentsDialog({
    super.key,
    required this.selectedAssignment,
    required this.students,
    required this.className,
    required this.onClose,
    required this.fetchAssignments,
  });

  @override
  _UpdateStudentAssignmentsDialogState createState() => _UpdateStudentAssignmentsDialogState();
}

class _UpdateStudentAssignmentsDialogState extends State<UpdateStudentAssignmentsDialog> {
  List<dynamic> studentAssignments = [];
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    fetchStudentAssignments();
  }

  Future<void> fetchStudentAssignments() async {
    setState(() {
      isLoading = true;
    });
    try {
      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/Assignments/student-assignments?assignmentId=${widget.selectedAssignment['id']}'),
      );
      if (response.statusCode == 200) {
        final existingAssignments = jsonDecode(response.body)['studentAssignments'] ?? [];
        setState(() {
          studentAssignments = widget.students.map((student) {
            final existing = existingAssignments.firstWhere(
                  (sa) => sa['studentId'] == student['id'],
              orElse: () => null,
            );
            return existing != null
                ? {
              'studentId': existing['studentId'],
              'isSubmitted': existing['isSubmitted'],
              'marksObtained': existing['marksObtained']?.toString() ?? '',
              'remarks': existing['remarks'] ?? '',
              'qualityTag': existing['qualityTag'] ?? '',
            }
                : {
              'studentId': student['id'],
              'isSubmitted': false,
              'marksObtained': '',
              'remarks': '',
              'qualityTag': '',
            };
          }).toList();
          isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch student assignments');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        studentAssignments = widget.students.map((student) => {
          'studentId': student['id'],
          'isSubmitted': false,
          'marksObtained': '',
          'remarks': '',
          'qualityTag': '',
        }).toList();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch student assignments: $e')),
      );
    }
  }

  void handleStudentAssignmentChange(int index, String field, dynamic value) {
    setState(() {
      if (field == 'marksObtained') {
        final parsedValue = value.isEmpty ? null : double.tryParse(value);
        if (parsedValue == null || parsedValue.isNaN || parsedValue < 0 || parsedValue > 3) {
          studentAssignments[index][field] = '';
        } else {
          studentAssignments[index][field] = parsedValue.toString();
        }
      } else {
        studentAssignments[index][field] = value;
      }
    });
  }

  Future<void> handleSave() async {
    final invalidAssignments = studentAssignments.where((sa) =>
    sa['isSubmitted'] &&
        (sa['marksObtained'].isEmpty || double.parse(sa['marksObtained']) < 0 || double.parse(sa['marksObtained']) > 3)).toList();
    if (invalidAssignments.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid marks: Must be between 0 and 3 for submitted assignments.')),
      );
      return;
    }

    try {
      setState(() {
        isLoading = true;
      });
      final payload = {
        'assignmentId': widget.selectedAssignment['id'],
        'studentAssignments': studentAssignments.map((sa) => {
          'studentId': sa['studentId'],
          'isSubmitted': sa['isSubmitted'],
          'marksObtained': sa['isSubmitted'] && sa['marksObtained'].isNotEmpty ? double.parse(sa['marksObtained']) : null,
          'remarks': sa['remarks'].isNotEmpty ? sa['remarks'] : null,
          'qualityTag': sa['qualityTag'].isNotEmpty ? sa['qualityTag'] : null,
        }).toList(),
      };

      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/Assignments/student-assignments/batch'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Student assignments updated successfully.')),
        );
        widget.fetchAssignments();
        widget.onClose();
      } else {
        throw Exception('Failed to update student assignments');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update student assignments: $e')),
      );
    } finally {
      setState(() {
        isLoading = false;
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
                'Update Student Assignments for ${widget.selectedAssignment?['title'] ?? 'Unknown'} - ${widget.className}',
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
                  Text(
                    'Student Assignment Updates',
                    style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  if (isLoading)
                    const Center(child: SpinKitCircle(color: Color(0xFF00c757), size: 120))
                  else if (studentAssignments.isEmpty)
                    Center(
                      child: Text(
                        'No students found for this assignment.',
                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                      ),
                    )
                  else ...[
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: studentAssignments.length,
                        itemBuilder: (context, index) {
                          final sa = studentAssignments[index];
                          final student = widget.students[index];
                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                children: [
                                  TextField(
                                    enabled: false,
                                    decoration: InputDecoration(
                                      labelText: 'Student',
                                      labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                      border: const OutlineInputBorder(),
                                      enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                                      disabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                                    ),
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    controller: TextEditingController(text: '${student['firstName']} ${student['lastName'] ?? ''}'),
                                  ),
                                  const SizedBox(height: 8),
                                  DropdownButtonFormField<bool>(
                                    value: sa['isSubmitted'],
                                    onChanged: (value) => handleStudentAssignmentChange(index, 'isSubmitted', value),
                                    items: const [
                                      DropdownMenuItem(value: true, child: Text('Yes')),
                                      DropdownMenuItem(value: false, child: Text('No')),
                                    ],
                                    decoration: InputDecoration(
                                      labelText: 'Submitted',
                                      labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                      border: const OutlineInputBorder(),
                                      enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                                    ),
                                    style: GoogleFonts.poppins(color: Colors.white),
                                  ),
                                  const SizedBox(height: 8),
                                  TextField(
                                    enabled: sa['isSubmitted'],
                                    decoration: InputDecoration(
                                      labelText: 'Marks Obtained (0-3)',
                                      labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                      border: const OutlineInputBorder(),
                                      enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                                      disabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                                    ),
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    keyboardType: TextInputType.number,
                                    controller: TextEditingController(text: sa['marksObtained']),
                                    onChanged: (value) => handleStudentAssignmentChange(index, 'marksObtained', value),
                                  ),
                                  const SizedBox(height: 8),
                                  TextField(
                                    decoration: InputDecoration(
                                      labelText: 'Remarks',
                                      labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                      border: const OutlineInputBorder(),
                                      enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                                    ),
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    maxLines: 2,
                                    controller: TextEditingController(text: sa['remarks']),
                                    onChanged: (value) => handleStudentAssignmentChange(index, 'remarks', value),
                                  ),
                                  const SizedBox(height: 8),
                                  DropdownButtonFormField<String>(
                                    value: sa['qualityTag'].isEmpty ? null : sa['qualityTag'],
                                    onChanged: sa['isSubmitted'] ? (value) => handleStudentAssignmentChange(index, 'qualityTag', value) : null,
                                    items: const [
                                      DropdownMenuItem(value: '', child: Text('None')),
                                      DropdownMenuItem(value: 'EXCELLENT', child: Text('Excellent')),
                                      DropdownMenuItem(value: 'GOOD', child: Text('Good')),
                                      DropdownMenuItem(value: 'NEEDS_IMPROVEMENT', child: Text('Needs Improvement')),
                                      DropdownMenuItem(value: 'PLAGIARIZED', child: Text('Plagiarized')),
                                      DropdownMenuItem(value: 'ILLEGIBLE_HANDWRITING', child: Text('Illegible Handwriting')),
                                      DropdownMenuItem(value: 'NO_STRUCTURE_OR_FORMAT', child: Text('No Structure or Format')),
                                      DropdownMenuItem(value: 'LACKS_VISUAL_ELEMENTS', child: Text('Lacks Visual Elements')),
                                      DropdownMenuItem(value: 'COPY_PASTE_FROM_BOOK', child: Text('Copy-Paste from Book')),
                                      DropdownMenuItem(value: 'VERY_SHORT_OR_INCOMPLETE', child: Text('Very Short or Incomplete')),
                                      DropdownMenuItem(value: 'CREATIVELY_PRESENTED', child: Text('Creatively Presented')),
                                      DropdownMenuItem(value: 'TOO_MUCH_DECORATION', child: Text('Too Much Decoration')),
                                      DropdownMenuItem(value: 'MISALIGNED_CONTENT', child: Text('Misaligned Content')),
                                      DropdownMenuItem(value: 'CLARITY_LACKING', child: Text('Clarity Lacking')),
                                      DropdownMenuItem(value: 'IMPROPER_LANGUAGE', child: Text('Improper Language')),
                                    ],
                                    decoration: InputDecoration(
                                      labelText: 'Quality Tag',
                                      labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                      border: const OutlineInputBorder(),
                                      enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                                    ),
                                    style: GoogleFonts.poppins(color: Colors.white),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          ElevatedButton(
                            onPressed: widget.onClose,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(5),
                              ),
                            ),
                            child: Text(
                              'Cancel',
                              style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: isLoading ? null : handleSave,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF00c757),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(5),
                              ),
                            ),
                            child: Text(
                              'Save',
                              style: GoogleFonts.poppins(color: Colors.black, fontSize: 12),
                            ),
                          ),
                        ],
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