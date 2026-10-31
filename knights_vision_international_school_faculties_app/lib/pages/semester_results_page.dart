import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants.dart';

class SemesterResultsPage extends StatefulWidget {
  final Map<String, dynamic> classSubject;
  final String className;

  const SemesterResultsPage({super.key, required this.classSubject, required this.className});

  @override
  _SemesterResultsPageState createState() => _SemesterResultsPageState();
}

class _SemesterResultsPageState extends State<SemesterResultsPage> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _students = [];
  Map<String, List<Map<String, dynamic>>> _semesterResults = {
    'SEMESTER_I': [],
    'SEMESTER_II': [],
    'SEMESTER_III': [],
  };
  bool _isLoading = true;
  String? _errorMessage;
  final Map<String, Map<int, TextEditingController>> _controllers = {
    'SEMESTER_I': {},
    'SEMESTER_II': {},
    'SEMESTER_III': {},
  };

  @override
  void initState() {
    super.initState();
    _fetchStudentsAndResults();
  }

  @override
  void dispose() {
    for (var semester in _controllers.keys) {
      _controllers[semester]!.forEach((_, controller) => controller.dispose());
    }
    super.dispose();
  }

  Future<void> _fetchStudentsAndResults() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      // Validate critical classSubject fields
      final missingFields = [];
      if (widget.classSubject['id'] == null) missingFields.add('id');
      if (widget.classSubject['classId'] == null) missingFields.add('classId');
      if (widget.classSubject['subjectId'] == null) missingFields.add('subjectId');
      if (widget.classSubject['className'] == null) missingFields.add('className');
      if (widget.classSubject['subject'] == null || widget.classSubject['subject']['name'] == null) {
        missingFields.add('subject.name');
      }
      if (missingFields.isNotEmpty) {
        print('Invalid class subject: ${widget.classSubject} - Missing fields: ${missingFields.join(', ')}');
        throw Exception('Invalid class subject data: missing ${missingFields.join(', ')}');
      }

      // Fetch students
      final studentResponse = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SemesterResults/${widget.className.toLowerCase()}/students/${widget.classSubject['classId']}'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (studentResponse.statusCode != 200) {
        throw Exception('Failed to fetch students: ${studentResponse.statusCode} - ${studentResponse.body}');
      }

      final List<dynamic> students = jsonDecode(studentResponse.body)['students'] ?? [];
      final invalidStudents = <String>[];
      final validStudents = students.where((student) {
        final isValid = student['id'] != null && student['firstName'] != null;
        if (!isValid) {
          invalidStudents.add(
              '${student['firstName'] ?? 'Unknown'} ${student['lastName'] ?? ''} (Missing: ' +
                  [
                    if (student['id'] == null) 'id',
                    if (student['firstName'] == null) 'firstName',
                  ].join(', ') +
                  ')');
        }
        return isValid;
      }).toList();

      if (validStudents.isEmpty) {
        print('No valid students found in response: ${jsonDecode(studentResponse.body)}');
        throw Exception(
            'No valid students found for class ID ${widget.classSubject['classId']}. Invalid students: ${invalidStudents.join('; ')}');
      }

      setState(() {
        _students = validStudents;
      });

      // Fetch results for all semesters in parallel
      final semesters = ['SEMESTER_I', 'SEMESTER_II', 'SEMESTER_III'];
      final resultsBySemester = await Future.wait(
        semesters.map((semester) async {
          final response = await http.get(
            Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SemesterResults/${widget.className.toLowerCase()}/semester-results?classSubjectId=${widget.classSubject['id']}&semester=$semester'),
            headers: {'Authorization': 'Bearer $token'},
          );
          if (response.statusCode == 200) {
            return {'semester': semester, 'results': jsonDecode(response.body)['results'] ?? []};
          } else {
            throw Exception('Failed to fetch results for $semester: ${response.statusCode} - ${response.body}');
          }
        }),
      );

      // Initialize results
      for (var semester in semesters) {
        final semesterData = resultsBySemester.firstWhere((r) => r['semester'] == semester);
        final List<dynamic> existingResults = semesterData['results'];
        final List<Map<String, dynamic>> initializedResults = await Future.wait(
          validStudents.map((student) async {
            final existingResult = existingResults.firstWhere(
                  (r) => r['studentId'] == student['id'] && r['semester'] == semester,
              orElse: () => null,
            );

            if (existingResult != null) {
              return <String, dynamic>{
                ...existingResult as Map<String, dynamic>,
                'totalMarks': (double.tryParse(existingResult['semesterExamMarks']?.toString() ?? '0') ?? 0) +
                    (double.tryParse(existingResult['vivaMarks']?.toString() ?? '0') ?? 0) +
                    (double.tryParse(existingResult['internalMarks']?.toString() ?? '0') ?? 0),
                'student': {
                  'firstName': student['firstName'] as String,
                  'lastName': student['lastName'] as String? ?? '',
                },
              };
            }

            // Fetch internal marks only if no existing result
            final avgResponse = await http.get(
              Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SemesterResults/${widget.className.toLowerCase()}/student-assignments/sum-of-internal-assigns?studentId=${student['id']}&classSubjectId=${widget.classSubject['id']}&semester=$semester'),
              headers: {'Authorization': 'Bearer $token'},
            );

            final sumMarks = avgResponse.statusCode == 200 ? (jsonDecode(avgResponse.body)['averageMarks'] ?? 0) : 0;
            final internalMarks = (sumMarks / 3) * 24;

            return <String, dynamic>{
              'studentId': student['id'] as int,
              'student': {
                'firstName': student['firstName'] as String,
                'lastName': student['lastName'] as String? ?? '',
              },
              'classSubjectId': widget.classSubject['id'] as int,
              'classId': widget.classSubject['classId'] as int,
              'branchId': widget.classSubject['branchId'] as int?, // Allow null
              'schoolId': widget.classSubject['schoolId'] as int?, // Allow null
              'subjectId': widget.classSubject['subjectId'] as int,
              'semester': semester,
              'semesterExamMarks': '0',
              'vivaMarks': '0',
              'internalMarks': internalMarks.toStringAsFixed(2),
              'totalMarks': internalMarks.toStringAsFixed(2),
              'remarks': '',
            };
          }),
        );

        setState(() {
          _semesterResults[semester] = initializedResults;
          _controllers[semester] = {};
          for (var result in initializedResults) {
            _controllers[semester]![result['studentId'] as int] = TextEditingController(text: result['remarks'] as String);
          }
        });
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      print('Error in _fetchStudentsAndResults: $errorMessage');
      setState(() {
        _errorMessage = errorMessage;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to fetch students or results')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _updateField(String semester, int index, String field, String value) {
    setState(() {
      final result = _semesterResults[semester]![index];
      double? parsedValue = double.tryParse(value);
      if (field == 'semesterExamMarks' && parsedValue != null) {
        parsedValue = parsedValue.clamp(0, 70);
        if (double.tryParse(value) != null && double.parse(value) > 70) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Semester Exam Marks capped at 70 for ${result['student']['firstName']} ${result['student']['lastName']}',
              ),
            ),
          );
        }
      } else if (field == 'vivaMarks' && parsedValue != null) {
        parsedValue = parsedValue.clamp(0, 6);
        if (double.tryParse(value) != null && double.parse(value) > 6) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Viva Marks capped at 6 for ${result['student']['firstName']} ${result['student']['lastName']}',
              ),
            ),
          );
        }
      }
      result[field] = parsedValue?.toString() ?? value;
      if (field == 'remarks') {
        _controllers[semester]![result['studentId']]!.text = value;
      }
      final semesterExamMarks = double.tryParse(result['semesterExamMarks']?.toString() ?? '0') ?? 0;
      final vivaMarks = double.tryParse(result['vivaMarks']?.toString() ?? '0') ?? 0;
      final internalMarks = double.tryParse(result['internalMarks']?.toString() ?? '0') ?? 0;
      result['totalMarks'] = (semesterExamMarks + vivaMarks + internalMarks).clamp(0, 100).toStringAsFixed(2);
    });
  }

  Future<void> _saveChanges(String semester) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final payload = {
        'results': _semesterResults[semester]!.map((field) => {
          'studentId': field['studentId'],
          'classSubjectId': field['classSubjectId'],
          'classId': field['classId'],
          'branchId': field['branchId'] ?? null, // Allow null
          'schoolId': field['schoolId'] ?? null, // Allow null
          'subjectId': field['subjectId'],
          'semester': field['semester'],
          'semesterExamMarks': double.tryParse(field['semesterExamMarks']?.toString() ?? '0') ?? 0,
          'vivaMarks': double.tryParse(field['vivaMarks']?.toString() ?? '0') ?? 0,
          'internalMarks': double.tryParse(field['internalMarks']?.toString() ?? '0') ?? 0,
          'totalMarks': double.tryParse(field['totalMarks']?.toString() ?? '0') ?? 0,
          'remarks': field['remarks']?.isNotEmpty == true ? field['remarks'] : null,
        }).toList(),
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
          ),
        );
        await _fetchStudentsAndResults();
      } else {
        throw Exception('Failed to save semester ${semester.replaceAll("SEMESTER_", "")} results: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      print('Error in _saveChanges: $errorMessage');
      setState(() {
        _errorMessage = errorMessage;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to save results')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFF009688),
        title: Text(
          'Results: ${widget.classSubject['subject']['name']} - ${widget.className}',
          style: GoogleFonts.poppins(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.close, color: Color(0xFFf44336)),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: _errorMessage != null
            ? Center(
          child: Text(
            _errorMessage!,
            style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
            textAlign: TextAlign.center,
          ),
        )
            : _isLoading
            ? const Center(
          child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
        )
            : ListView(
          children: [
            for (var semester in ['SEMESTER_I', 'SEMESTER_II', 'SEMESTER_III']) ...[
              Text(
                semester.replaceAll('SEMESTER_', 'Semester '),
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _semesterResults[semester]!.isEmpty
                  ? Center(
                child: Text(
                  'No results found for ${semester.replaceAll("SEMESTER_", "Semester ")}.',
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                ),
              )
                  : ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _semesterResults[semester]!.length,
                itemBuilder: (context, index) {
                  final result = _semesterResults[semester]![index];
                  return Card(
                    color: const Color(0xFF1e1e1e),
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${result['student']['firstName']} ${result['student']['lastName']}',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  keyboardType: TextInputType.number,
                                  decoration: InputDecoration(
                                    labelText: 'Semester Exam (70)',
                                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                    filled: true,
                                    fillColor: const Color(0xFF222222),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(color: Color(0xFF555555)),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(color: Color(0xFF00c757)),
                                    ),
                                  ),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  onChanged: (value) => _updateField(semester, index, 'semesterExamMarks', value),
                                  controller: TextEditingController(
                                    text: result['semesterExamMarks'].toString(),
                                  )..selection = TextSelection.fromPosition(
                                    TextPosition(offset: result['semesterExamMarks'].toString().length),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: TextField(
                                  keyboardType: TextInputType.number,
                                  decoration: InputDecoration(
                                    labelText: 'Viva (6)',
                                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                    filled: true,
                                    fillColor: const Color(0xFF222222),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(color: Color(0xFF555555)),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(color: Color(0xFF00c757)),
                                    ),
                                  ),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  onChanged: (value) => _updateField(semester, index, 'vivaMarks', value),
                                  controller: TextEditingController(
                                    text: result['vivaMarks'].toString(),
                                  )..selection = TextSelection.fromPosition(
                                    TextPosition(offset: result['vivaMarks'].toString().length),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  enabled: false,
                                  decoration: InputDecoration(
                                    labelText: 'Internal (24)',
                                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                    filled: true,
                                    fillColor: const Color(0xFF222222),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(color: Color(0xFF555555)),
                                    ),
                                  ),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  controller: TextEditingController(
                                    text: double.tryParse(result['internalMarks']?.toString() ?? '0')?.toStringAsFixed(2) ?? '0.00',
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: TextField(
                                  enabled: false,
                                  decoration: InputDecoration(
                                    labelText: 'Total (100)',
                                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                    filled: true,
                                    fillColor: const Color(0xFF222222),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(color: Color(0xFF555555)),
                                    ),
                                  ),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  controller: TextEditingController(
                                    text: double.tryParse(result['totalMarks']?.toString() ?? '0')?.toStringAsFixed(2) ?? '0.00',
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            decoration: InputDecoration(
                              labelText: 'Remarks',
                              labelStyle: GoogleFonts.poppins(color: Colors.white70),
                              filled: true,
                              fillColor: const Color(0xFF222222),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: Color(0xFF555555)),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: Color(0xFF00c757)),
                              ),
                            ),
                            style: GoogleFonts.poppins(color: Colors.white),
                            maxLines: 2,
                            onChanged: (value) => _updateField(semester, index, 'remarks', value),
                            controller: _controllers[semester]![result['studentId']],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      'Cancel',
                      style: GoogleFonts.poppins(color: Colors.red),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () => _saveChanges(semester),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00c757),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ),
                    child: Text(
                      'Save ${semester.replaceAll("SEMESTER_", "Semester ")} Results',
                      style: GoogleFonts.poppins(color: Colors.black, fontSize: 12),
                    ),
                  ),
                ],
              ),
              if (semester != 'SEMESTER_III') const Divider(color: Color(0xFF333333)),
              const SizedBox(height: 16),
            ],
          ],
        ),
      ),
    );
  }
}