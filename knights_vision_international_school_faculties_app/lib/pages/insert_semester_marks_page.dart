import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'semester_results_page.dart';
import '../constants.dart';

class InsertSemesterMarksPage extends StatefulWidget {
  const InsertSemesterMarksPage({super.key});

  @override
  _InsertSemesterMarksPageState createState() => _InsertSemesterMarksPageState();
}

class _InsertSemesterMarksPageState extends State<InsertSemesterMarksPage> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _classSubjects = [];
  List<dynamic> _filteredClassSubjects = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _searchQuery = '';
  int _page = 1;
  int _totalPages = 1;
  final int _pageSize = 10;

  @override
  void initState() {
    super.initState();
    _fetchClassSubjects();
  }

  Future<void> _fetchClassSubjects() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/class-subjects?page=$_page&pageSize=$_pageSize&searchQuery=$_searchQuery'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> classSubjects = data['classSubjects'] ?? [];
        // Track invalid subjects for error message
        final invalidSubjects = <String>[];
        // Filter valid class subjects (relaxed validation for branchId and schoolId)
        final validClassSubjects = classSubjects.where((cs) {
          final isValid = cs['id'] != null &&
              cs['classId'] != null &&
              cs['subjectId'] != null &&
              cs['className'] != null &&
              cs['subject'] != null &&
              cs['subject']['name'] != null;
          if (!isValid) {
            invalidSubjects.add(
                '${cs['className'] ?? 'Unknown'} - ${cs['subject']?['name'] ?? 'Unknown'} (Missing: ' +
                    [
                      if (cs['id'] == null) 'id',
                      if (cs['classId'] == null) 'classId',
                      if (cs['subjectId'] == null) 'subjectId',
                      if (cs['className'] == null) 'className',
                      if (cs['subject'] == null || cs['subject']['name'] == null) 'subject.name',
                    ].join(', ') +
                    ')');
          } else if (cs['branchId'] == null || cs['schoolId'] == null) {
            invalidSubjects.add(
                '${cs['className']} - ${cs['subject']['name']} (Missing: ' +
                    [
                      if (cs['branchId'] == null) 'branchId',
                      if (cs['schoolId'] == null) 'schoolId',
                    ].join(', ') +
                    ')');
          }
          return isValid; // Allow subjects with missing branchId/schoolId
        }).toList();

        setState(() {
          _classSubjects = validClassSubjects;
          _filteredClassSubjects = validClassSubjects;
          _totalPages = data['totalPages'] ?? 1;
          _isLoading = false;
          if (validClassSubjects.isEmpty && classSubjects.isNotEmpty) {
            _errorMessage = 'No valid class subjects found. Invalid subjects: ${invalidSubjects.join('; ')}. Please contact support.';
          }
        });
      } else {
        throw Exception('Failed to fetch class subjects: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      print('Error in _fetchClassSubjects: $errorMessage');
      setState(() {
        _isLoading = false;
        _errorMessage = errorMessage;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to fetch class subjects')),
      );
    }
  }

  void _filterClassSubjects(String query) {
    setState(() {
      _searchQuery = query;
      _filteredClassSubjects = _classSubjects.where((cs) {
        final subjectName = cs['subject']['name'].toString().toLowerCase();
        final className = cs['className'].toString().toLowerCase();
        return subjectName.contains(query.toLowerCase()) || className.contains(query.toLowerCase());
      }).toList();
    });
  }

  void _showResultsPage(Map<String, dynamic> classSubject) {
    // Validate classSubject before navigating (relaxed validation)
    final missingFields = [];
    if (classSubject['id'] == null) missingFields.add('id');
    if (classSubject['classId'] == null) missingFields.add('classId');
    if (classSubject['subjectId'] == null) missingFields.add('subjectId');
    if (classSubject['className'] == null) missingFields.add('className');
    if (classSubject['subject'] == null || classSubject['subject']['name'] == null) {
      missingFields.add('subject.name');
    }

    if (missingFields.isNotEmpty) {
      print('Cannot navigate to results page for invalid class subject: $classSubject - Missing fields: ${missingFields.join(', ')}');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Cannot load results for ${classSubject['subject']?['name'] ?? 'unknown subject'}: missing data (${missingFields.join(', ')}).',
          ),
        ),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SemesterResultsPage(
          classSubject: classSubject,
          className: classSubject['className'],
        ),
      ),
    );
  }

  void _showBatchResultsDialog() {
    showDialog(
      context: context,
      builder: (context) => BatchResultsDialog(
        classSubjects: _classSubjects,
        onSave: _fetchClassSubjects,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFF009688),
        title: Text(
          'Semester Marks',
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
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: _showBatchResultsDialog,
            tooltip: 'Create Batch Results',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: 'Search Subjects or Classes',
                labelStyle: GoogleFonts.poppins(color: Colors.white70),
                prefixIcon: const Icon(Icons.search, color: Colors.white),
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
              onChanged: _filterClassSubjects,
            ),
            const SizedBox(height: 16),
            Expanded(
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
                  : _filteredClassSubjects.isEmpty
                  ? Center(
                child: Text(
                  'No subjects found.',
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                ),
              )
                  : ListView.builder(
                itemCount: _filteredClassSubjects.length,
                itemBuilder: (context, index) {
                  final cs = _filteredClassSubjects[index];
                  return Card(
                    color: const Color(0xFF1e1e1e),
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${cs['className']} - ${cs['subject']['name']}',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'ID: ${cs['id']}',
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
                                onPressed: () => _showResultsPage(cs),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: const Color(0xFF00c757),
                                  side: const BorderSide(color: Color(0xFF00c757)),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                ),
                                child: Text(
                                  'Manage Results',
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
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left, color: Colors.white),
                  onPressed: _page > 1
                      ? () {
                    setState(() {
                      _page--;
                    });
                    _fetchClassSubjects();
                  }
                      : null,
                ),
                Text(
                  'Page $_page of $_totalPages',
                  style: GoogleFonts.poppins(color: Colors.white),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right, color: Colors.white),
                  onPressed: _page < _totalPages
                      ? () {
                    setState(() {
                      _page++;
                    });
                    _fetchClassSubjects();
                  }
                      : null,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class BatchResultsDialog extends StatefulWidget {
  final List<dynamic> classSubjects;
  final VoidCallback onSave;

  const BatchResultsDialog({super.key, required this.classSubjects, required this.onSave});

  @override
  _BatchResultsDialogState createState() => _BatchResultsDialogState();
}

class _BatchResultsDialogState extends State<BatchResultsDialog> {
  final _storage = const FlutterSecureStorage();
  String _selectedSemester = 'SEMESTER_I';
  List<int> _selectedSubjectIds = [];
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _createBatchResults() async {
    if (_selectedSubjectIds.isEmpty || _selectedSemester.isEmpty) {
      setState(() {
        _errorMessage = 'Select at least one subject and a semester';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final groupedByClass = _selectedSubjectIds.fold<Map<String, List<Map<String, dynamic>>>>({}, (acc, id) {
        final subject = widget.classSubjects.firstWhere((cs) => cs['id'] == id);
        final className = subject['className'].toLowerCase();
        if (!acc.containsKey(className)) {
          acc[className] = [];
        }
        acc[className]!.add({
          'classSubjectId': id,
          'classId': subject['classId'],
          'branchId': subject['branchId'] ?? null, // Allow null
          'schoolId': subject['schoolId'] ?? null, // Allow null
          'subjectId': subject['subjectId'],
          'semester': _selectedSemester,
        });
        return acc;
      });

      final requests = groupedByClass.entries.map((entry) async {
        final response = await http.post(
          Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SemesterResults/${entry.key}/semester-results/batch'),
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({'classSubjects': entry.value}),
        );
        return response;
      });

      final responses = await Future.wait(requests);
      if (responses.every((r) => r.statusCode == 200)) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Batch results initialized successfully')),
        );
        widget.onSave();
        Navigator.pop(context);
      } else {
        throw Exception('Failed to create batch results: ${responses.firstWhere((r) => r.statusCode != 200).body}');
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to create batch results')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF181818),
      title: Text(
        'Create Batch Semester Results',
        style: GoogleFonts.poppins(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_errorMessage != null)
              Text(
                _errorMessage!,
                style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
              )
            else if (_isLoading)
              const SpinKitCircle(color: Color(0xFF00c757), size: 120)
            else ...[
                DropdownButtonFormField<String>(
                  value: _selectedSemester,
                  items: ['SEMESTER_I', 'SEMESTER_II', 'SEMESTER_III'].map((semester) {
                    return DropdownMenuItem(
                      value: semester,
                      child: Text(
                        semester.replaceAll('SEMESTER_', 'Semester '),
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedSemester = value!;
                    });
                  },
                  decoration: InputDecoration(
                    labelText: 'Semester',
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
                  dropdownColor: const Color(0xFF333333),
                  style: GoogleFonts.poppins(color: Colors.white),
                ),
                const SizedBox(height: 16),
                Text(
                  'Select Subjects:',
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 300,
                  child: ListView.builder(
                    itemCount: widget.classSubjects.length,
                    itemBuilder: (context, index) {
                      final cs = widget.classSubjects[index];
                      return CheckboxListTile(
                        title: Text(
                          '${cs['className']} - ${cs['subject']['name']}',
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        value: _selectedSubjectIds.contains(cs['id']),
                        onChanged: (value) {
                          setState(() {
                            if (value == true) {
                              _selectedSubjectIds.add(cs['id']);
                            } else {
                              _selectedSubjectIds.remove(cs['id']);
                            }
                          });
                        },
                        checkColor: Colors.black,
                        activeColor: const Color(0xFF00c757),
                        controlAffinity: ListTileControlAffinity.leading,
                      );
                    },
                  ),
                ),
              ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            'Cancel',
            style: GoogleFonts.poppins(color: Colors.red),
          ),
        ),
        ElevatedButton(
          onPressed: _createBatchResults,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF00c757),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(5),
            ),
          ),
          child: Text(
            'Create',
            style: GoogleFonts.poppins(color: Colors.black, fontSize: 12),
          ),
        ),
      ],
    );
  }
}