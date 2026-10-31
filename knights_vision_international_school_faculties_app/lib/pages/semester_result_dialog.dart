import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants.dart';

class SemesterResultDialog extends StatefulWidget {
  final dynamic classSubject;
  final String className;
  final VoidCallback onClose;

  const SemesterResultDialog({
    super.key,
    required this.classSubject,
    required this.className,
    required this.onClose,
  });

  @override
  _SemesterResultDialogState createState() => _SemesterResultDialogState();
}

class _SemesterResultDialogState extends State<SemesterResultDialog> {
  final storage = const FlutterSecureStorage();
  List<dynamic> students = [];
  Map<String, List<dynamic>> semesterResults = {
    'SEMESTER_I': [],
    'SEMESTER_II': [],
    'SEMESTER_III': [],
  };
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.classSubject != null) {
      fetchStudentsAndResults();
    }
  }

  Future<void> fetchStudentsAndResults() async {
    setState(() => isLoading = true);
    try {
      final token = await storage.read(key: 'token');
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final studentResponse = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SemesterResults/${widget.className.toLowerCase()}/students/${widget.classSubject['classId']}'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (studentResponse.statusCode == 200) {
        students = jsonDecode(studentResponse.body)['students'] ?? [];

        final semesters = ['SEMESTER_I', 'SEMESTER_II', 'SEMESTER_III'];
        for (var semester in semesters) {
          final response = await http.get(
            Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SemesterResults/${widget.className.toLowerCase()}/semester-results?classSubjectId=${widget.classSubject['id']}&semester=$semester'),
            headers: {'Authorization': 'Bearer $token'},
          );

          if (response.statusCode == 200) {
            final existingResults = jsonDecode(response.body)['results'] ?? [];
            final results = await Future.wait(students.map((student) async {
              final existingResult = existingResults.firstWhere(
                    (r) => r['studentId'] == student['id'] && r['semester'] == semester,
                orElse: () => null,
              );
              if (existingResult != null) {
                return {
                  ...existingResult,
                  'totalMarks': (double.tryParse(existingResult['semesterExamMarks']?.toString() ?? '0') ?? 0) +
                      (double.tryParse(existingResult['vivaMarks']?.toString() ?? '0') ?? 0) +
                      (double.tryParse(existingResult['internalMarks']?.toString() ?? '0') ?? 0),
                  'student': {'firstName': student['firstName'], 'lastName': student['lastName']},
                };
              }
              final avgResponse = await http.get(
                Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SemesterResults/${widget.className.toLowerCase()}/student-assignments/sum-of-internal-assigns?studentId=${student['id']}&classSubjectId=${widget.classSubject['id']}&semester=$semester'),
                headers: {'Authorization': 'Bearer $token'},
              );
              final sumMarks = jsonDecode(avgResponse.body)['averageMarks'] ?? 0;
              final internalMarks = (sumMarks / 3) * 24;
              return {
                'studentId': student['id'],
                'student': {'firstName': student['firstName'], 'lastName': student['lastName']},
                'classSubjectId': widget.classSubject['id'],
                'classId': widget.classSubject['classId'],
                'branchId': student['branchId'] ?? widget.classSubject['branchId'],
                'schoolId': student['schoolId'] ?? widget.classSubject['schoolId'],
                'subjectId': widget.classSubject['subjectId'],
                'semester': semester,
                'semesterExamMarks': '0',
                'vivaMarks': '0',
                'internalMarks': internalMarks.toString(),
                'totalMarks': internalMarks,
                'remarks': '',
              };
            }));
            setState(() => semesterResults[semester] = results);
          } else {
            throw Exception('Failed to fetch semester results for $semester: ${response.statusCode}');
          }
        }
      } else {
        throw Exception('Failed to fetch students: ${studentResponse.statusCode}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to initialize results: $e')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  void handleFieldChange(String semester, int index, String field, String value) {
    setState(() {
      final result = semesterResults[semester]?[index];
      var clampedValue = value;
      if (field == 'semesterExamMarks') {
        final numValue = double.tryParse(value) ?? 0;
        clampedValue = numValue.clamp(0, 70).toString();
        if (numValue > 70) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Semester Exam Marks capped at 70 for ${result['student']['firstName']} ${result['student']['lastName']}')),
          );
        }
      } else if (field == 'vivaMarks') {
        final numValue = double.tryParse(value) ?? 0;
        clampedValue = numValue.clamp(0, 6).toString();
        if (numValue > 6) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Viva Marks capped at 6 for ${result['student']['firstName']} ${result['student']['lastName']}')),
          );
        }
      }
      result[field] = clampedValue;
      result['totalMarks'] = (double.tryParse(result['semesterExamMarks']?.toString() ?? '0') ?? 0) +
          (double.tryParse(result['vivaMarks']?.toString() ?? '0') ?? 0) +
          (double.tryParse(result['internalMarks']?.toString() ?? '0') ?? 0);
    });
  }

  Future<void> handleSaveChanges(String semester) async {
    setState(() => isLoading = true);
    try {
      final token = await storage.read(key: 'token');
      if (token == null) {
        throw Exception('No authentication token found');
      }
      final payload = {
        'results': semesterResults[semester]?.map((field) => ({
          'studentId': field['studentId'],
          'classSubjectId': field['classSubjectId'],
          'classId': field['classId'],
          'branchId': field['branchId'],
          'schoolId': field['schoolId'],
          'subjectId': field['subjectId'],
          'semester': field['semester'],
          'semesterExamMarks': double.tryParse(field['semesterExamMarks']?.toString() ?? '0') ?? 0,
          'vivaMarks': double.tryParse(field['vivaMarks']?.toString() ?? '0') ?? 0,
          'internalMarks': double.tryParse(field['internalMarks']?.toString() ?? '0') ?? 0,
          'totalMarks': double.tryParse(field['totalMarks']?.toString() ?? '0') ?? 0,
          'remarks': field['remarks'].isNotEmpty ? field['remarks'] : null,
        })).toList(),
      };
      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SemesterResults/${widget.className.toLowerCase()}/semester-results'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Semester ${semester.replaceAll("SEMESTER_", "")} results saved successfully!'),
            )
        );
        await fetchStudentsAndResults();
      } else {
        throw Exception('Failed to save semester results: ${response.statusCode}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save semester ${semester.replaceAll("SEMESTER_", "")} results: $e')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFF009688),
        title: Row(
          children: [
            const Icon(Icons.calendar_today, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Semester Results for ${widget.classSubject?['subject']['name']} - ${widget.className}',
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
          : SingleChildScrollView(
        child: Column(
          children: [
            for (var semester in ['SEMESTER_I', 'SEMESTER_II', 'SEMESTER_III'])
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      semester.replaceAll('SEMESTER_', 'Semester '),
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    semesterResults[semester] != null && semesterResults[semester]!.isEmpty
                        ? Center(
                      child: Text(
                        'No results found for ${semester.replaceAll("SEMESTER_", "Semester ")}.',
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                    )
                        :
                    Column(
                      children: (semesterResults[semester] ?? [])
                          .asMap()
                          .entries
                          .map((entry) {
                        final index = entry.key;
                        final field = entry.value;

                        return Container(
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          padding: const EdgeInsets.all(8),
                          color: const Color(0xFF222222),
                          child: Row(
                            children: [
                              // Student Name
                              Expanded(
                                flex: 2,
                                child: Text(
                                  '${field['student']['firstName']} ${field['student']['lastName']}',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                              ),

                              // Semester Exam Marks
                              Expanded(
                                flex: 2,
                                child: TextField(
                                  decoration: InputDecoration(
                                    labelText: 'Semester Exam (70)',
                                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                    border: const OutlineInputBorder(),
                                    enabledBorder: const OutlineInputBorder(
                                        borderSide: BorderSide(color: Color(0xFF555555))),
                                    focusedBorder: const OutlineInputBorder(
                                        borderSide: BorderSide(color: Color(0xFF00c757))),
                                  ),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  keyboardType: TextInputType.number,
                                  controller: TextEditingController.fromValue(
                                    TextEditingValue(
                                        text: field['semesterExamMarks'].toString()),
                                  ),
                                  onChanged: (value) => handleFieldChange(
                                      semester, index, 'semesterExamMarks', value),
                                ),
                              ),

                              // Viva Marks
                              Expanded(
                                flex: 2,
                                child: TextField(
                                  decoration: InputDecoration(
                                    labelText: 'Viva (6)',
                                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                    border: const OutlineInputBorder(),
                                    enabledBorder: const OutlineInputBorder(
                                        borderSide: BorderSide(color: Color(0xFF555555))),
                                    focusedBorder: const OutlineInputBorder(
                                        borderSide: BorderSide(color: Color(0xFF00c757))),
                                  ),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  keyboardType: TextInputType.number,
                                  controller: TextEditingController.fromValue(
                                    TextEditingValue(text: field['vivaMarks'].toString()),
                                  ),
                                  onChanged: (value) =>
                                      handleFieldChange(semester, index, 'vivaMarks', value),
                                ),
                              ),

                              // Internal Marks (Disabled)
                              Expanded(
                                flex: 2,
                                child: TextField(
                                  decoration: InputDecoration(
                                    labelText: 'Internal (24)',
                                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                    border: const OutlineInputBorder(),
                                    enabledBorder: const OutlineInputBorder(
                                        borderSide: BorderSide(color: Color(0xFF555555))),
                                    disabledBorder: const OutlineInputBorder(
                                        borderSide: BorderSide(color: Color(0xFF555555))),
                                  ),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  controller: TextEditingController.fromValue(
                                    TextEditingValue(
                                        text: field['internalMarks']
                                            .toStringAsFixed(2)), // <- safe
                                  ),
                                  enabled: false,
                                ),
                              ),

                              // Total Marks (Disabled)
                              Expanded(
                                flex: 2,
                                child: TextField(
                                  decoration: InputDecoration(
                                    labelText: 'Total (100)',
                                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                    border: const OutlineInputBorder(),
                                    enabledBorder: const OutlineInputBorder(
                                        borderSide: BorderSide(color: Color(0xFF555555))),
                                    disabledBorder: const OutlineInputBorder(
                                        borderSide: BorderSide(color: Color(0xFF555555))),
                                  ),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  controller: TextEditingController.fromValue(
                                    TextEditingValue(
                                        text: field['totalMarks'].toStringAsFixed(2)),
                                  ),
                                  enabled: false,
                                ),
                              ),

                              // Remarks
                              Expanded(
                                flex: 2,
                                child: TextField(
                                  decoration: InputDecoration(
                                    labelText: 'Remarks',
                                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                    border: const OutlineInputBorder(),
                                    enabledBorder: const OutlineInputBorder(
                                        borderSide: BorderSide(color: Color(0xFF555555))),
                                    focusedBorder: const OutlineInputBorder(
                                        borderSide: BorderSide(color: Color(0xFF00c757))),
                                  ),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  controller: TextEditingController.fromValue(
                                    TextEditingValue(text: field['remarks'] ?? ''),
                                  ),
                                  onChanged: (value) =>
                                      handleFieldChange(semester, index, 'remarks', value),
                                  maxLines: 2,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => handleSaveChanges(semester),
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00c757)),
                      child: Text('Save ${semester.replaceAll("SEMESTER_", "Semester ")} Results', style: GoogleFonts.poppins(color: Colors.black)),
                    ),
                    if (semester != 'SEMESTER_III') const Divider(color: Color(0xFF333333), height: 32),
                  ],
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
      ),
    );
  }
}
