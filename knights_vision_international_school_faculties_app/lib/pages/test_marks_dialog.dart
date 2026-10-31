// test_marks_dialog.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants.dart';

class TestMarksDialog extends StatefulWidget {
  final bool open;
  final VoidCallback onClose;
  final dynamic test;
  final List<dynamic> students;
  final String className;
  final Function(int) fetchTests;

  const TestMarksDialog({
    super.key,
    required this.open,
    required this.onClose,
    required this.test,
    required this.students,
    required this.className,
    required this.fetchTests,
  });

  @override
  _TestMarksDialogState createState() => _TestMarksDialogState();
}

class _TestMarksDialogState extends State<TestMarksDialog> {
  List<Map<String, dynamic>> testMarks = [];
  bool loading = false;
  String? errorMessage;
  final _storage = const FlutterSecureStorage();
  final Map<int, TextEditingController> _marksControllers = {};
  final Map<int, TextEditingController> _remarksControllers = {};

  @override
  void initState() {
    super.initState();
    if (widget.open && widget.test != null) {
      fetchTestMarks(widget.test['id']);
    }
  }

  @override
  void dispose() {
    _marksControllers.forEach((_, controller) => controller.dispose());
    _remarksControllers.forEach((_, controller) => controller.dispose());
    super.dispose();
  }

  Future<void> fetchTestMarks(int testId) async {
    setState(() {
      loading = true;
      errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/Tests/${widget.className.toLowerCase()}/test-marks?testId=$testId'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Test Marks Response: $data'); // Debug log
        final existingTestMarks = data['testMarks'] ?? [];

        final mergedTestMarks = widget.students.map((student) {
          final existing = existingTestMarks.firstWhere(
                (tm) => tm['studentId'] == student['id'],
            orElse: () => null,
          );
          final marksController = TextEditingController(text: existing != null ? existing['marks']?.toString() ?? '' : '');
          final remarksController = TextEditingController(text: existing != null ? existing['remarks'] ?? '' : '');
          _marksControllers[student['id']] = marksController;
          _remarksControllers[student['id']] = remarksController;
          return {
            'studentId': student['id'],
            'marks': existing != null ? existing['marks']?.toString() ?? '' : '',
            'maxMarks': existing != null ? existing['maxMarks'] ?? 30 : 30,
            'remarks': existing != null ? existing['remarks'] ?? '' : '',
          };
        }).toList();

        setState(() {
          testMarks = mergedTestMarks;
          loading = false;
        });
      } else {
        throw Exception('Failed to fetch test marks: ${response.statusCode}');
      }
    } catch (e) {
      print('Fetch Test Marks Error: $e'); // Debug log
      setState(() {
        loading = false;
        errorMessage = e.toString().replaceFirst('Exception: ', '');
        testMarks = widget.students.map((student) {
          final marksController = TextEditingController();
          final remarksController = TextEditingController();
          _marksControllers[student['id']] = marksController;
          _remarksControllers[student['id']] = remarksController;
          return {
            'studentId': student['id'],
            'marks': '',
            'maxMarks': 30,
            'remarks': '',
          };
        }).toList();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage ?? 'Failed to fetch test marks')),
      );
    }
  }

  void handleTestMarkChange(int index, String field, String value) {
    setState(() {
      testMarks[index][field] = value;
    });
    if (field == 'marks') {
      _marksControllers[testMarks[index]['studentId']]?.text = value;
    } else if (field == 'remarks') {
      _remarksControllers[testMarks[index]['studentId']]?.text = value;
    }
  }

  Future<void> handleSave() async {
    final invalidTestMarks = testMarks.where((tm) {
      if (tm['marks'] == '') return false;
      final marks = double.tryParse(tm['marks']);
      return marks == null || marks < 0 || marks > (tm['maxMarks'] ?? 30);
    }).toList();

    if (invalidTestMarks.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid marks: Must be between 0 and 30')),
      );
      return;
    }

    try {
      setState(() {
        loading = true;
        errorMessage = null;
      });
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final payload = {
        'testId': widget.test['id'],
        'testMarks': testMarks.map((tm) => {
          'studentId': tm['studentId'],
          'marks': tm['marks'] != '' ? double.parse(tm['marks']) : null,
          'maxMarks': tm['maxMarks'] ?? 30,
          'remarks': tm['remarks'].isNotEmpty ? tm['remarks'] : null,
        }).toList(),
      };

      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/Tests/${widget.className.toLowerCase()}/test-marks/batch'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Test marks updated successfully')),
        );
        widget.fetchTests(widget.test['classSubjectId']);
        widget.onClose();
      } else {
        throw Exception('Failed to update test marks: ${response.statusCode}');
      }
    } catch (e) {
      print('Batch Update Test Marks Error: $e'); // Debug log
      setState(() {
        loading = false;
        errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage ?? 'Failed to update test marks')),
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
            backgroundColor: const Color(0xFF009688),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                'Update Marks for ${widget.test?['title'] ?? 'Unknown'} - ${widget.className}',
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
            leading: const Icon(Icons.calendar_today, color: Colors.white),
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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (errorMessage != null)
                    Center(
                      child: Text(
                        errorMessage!,
                        style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
                      ),
                    )
                  else if (loading)
                    const Center(
                      child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
                    )
                  else ...[
                      Text(
                        'Test Marks Updates',
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      testMarks.isEmpty
                          ? Center(
                        child: Text(
                          'No students found for this test.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                          : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: testMarks.length,
                        itemBuilder: (context, index) {
                          final tm = testMarks[index];
                          final student = widget.students.firstWhere(
                                (s) => s['id'] == tm['studentId'],
                            orElse: () => {'firstName': 'Unknown', 'lastName': ''},
                          );
                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${student['firstName']} ${student['lastName']}',
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
                                          controller: _marksControllers[tm['studentId']],
                                          onChanged: (value) => handleTestMarkChange(index, 'marks', value),
                                          keyboardType: TextInputType.number,
                                          style: GoogleFonts.poppins(color: Colors.white),
                                          decoration: InputDecoration(
                                            labelText: 'Marks (0-30)',
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
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: TextField(
                                          controller: _remarksControllers[tm['studentId']],
                                          onChanged: (value) => handleTestMarkChange(index, 'remarks', value),
                                          maxLines: 2,
                                          style: GoogleFonts.poppins(color: Colors.white),
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
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          ElevatedButton(
                            onPressed: loading ? null : widget.onClose,
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
                            onPressed: loading ? null : handleSave,
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