import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../constants.dart';

class KnightsWbTestPreparationPage extends StatefulWidget {
  const KnightsWbTestPreparationPage({super.key});

  @override
  _KnightsWbTestPreparationPageState createState() => _KnightsWbTestPreparationPageState();
}

class _KnightsWbTestPreparationPageState extends State<KnightsWbTestPreparationPage> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _subjects = [];
  List<dynamic> _filteredSubjects = [];
  String _selectedMonth = 'November';
  int _academicYear = 2025;
  bool _isLoading = true;
  String? _errorMessage;
  String _searchQuery = '';
  Map<String, dynamic>? _selectedSubject;

  final List<String> _monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  @override
  void initState() {
    super.initState();
    _fetchSubjects();
  }

  Future<void> _fetchSubjects() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/class-subjects?page=1&pageSize=100'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Subjects Response: $data'); // Debug log
        setState(() {
          _subjects = data['classSubjects'] ?? [];
          _filteredSubjects = _subjects;
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch subjects: ${response.statusCode}');
      }
    } catch (e) {
      print('Fetch Subjects Error: $e'); // Debug log
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to fetch subjects')),
      );
    }
  }

  void _filterSubjects(String query) {
    setState(() {
      _searchQuery = query;
      _filteredSubjects = _subjects.where((s) {
        final subjectName = s['subject']['name'].toString().toLowerCase();
        final className = s['className'].toString().toLowerCase();
        return subjectName.contains(query.toLowerCase()) || className.contains(query.toLowerCase());
      }).toList();
    });
  }

  Future<void> _generatePDF() async {
    if (_selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a subject')),
      );
      return;
    }

    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final monthIndex = _monthNames.indexOf(_selectedMonth) + 1;
      final className = _selectedSubject!['className'].toLowerCase();
      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/classes/$className/board-exam-results/data?classId=${_selectedSubject!['classId']}&academicYear=$_academicYear&month=$monthIndex'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final subjects = data['subjects'] ?? [];
        final students = data['students'] ?? [];
        final boardExams = data['boardExams'] ?? [];

        final pdf = pw.Document();
        final font = pw.Font.helvetica();
        final boldFont = pw.Font.helveticaBold();

        pdf.addPage(
          pw.MultiPage(
            pageFormat: PdfPageFormat.a4,
            build: (context) => [
              pw.Container(
                color: PdfColor.fromHex('212121'),
                padding: const pw.EdgeInsets.all(10),
                child: pw.Column(
                  children: [
                    pw.Text(
                      'Board Exam Results - ${_selectedSubject!['className']} ($_academicYear, $_selectedMonth)',
                      style: pw.TextStyle(font: boldFont, fontSize: 16, color: PdfColor.fromHex('FFFFFF')),
                    ),
                    pw.SizedBox(height: 10),
                    pw.Table.fromTextArray(
                      headers: [
                        ['Student Name', ...subjects.map((s) => [s['subject']['name'], '', '']).expand((x) => x)],
                        ['', ...subjects.map((_) => ['W', 'O', 'T']).expand((x) => x)],
                      ],
                      data: students.map((student) {
                        final row = [student['name']];
                        for (var subject in subjects) {
                          final exam = boardExams.firstWhere(
                                (e) => e['classSubjectId'] == subject['id'],
                            orElse: () => null,
                          );
                          if (exam == null) {
                            row.addAll(['-', '-', '-']);
                          } else {
                            final result = exam['BoardExamResult'].firstWhere(
                                  (r) => r['studentId'] == student['id'],
                              orElse: () => null,
                            );
                            row.addAll([
                              result != null ? result['writtenMarks'].toString() : '-',
                              result != null ? result['oralMarks'].toString() : '-',
                              result != null ? result['totalMarks'].toString() : '-',
                            ]);
                          }
                        }
                        return row;
                      }).toList(),
                      headerStyle: pw.TextStyle(font: boldFont, color: PdfColor.fromHex('FFFFFF'), fontWeight: pw.FontWeight.bold),
                      cellStyle: pw.TextStyle(font: font, color: PdfColor.fromHex('FFFFFF')),
                      border: pw.TableBorder.all(color: PdfColor.fromHex('555555')),
                      columnWidths: {
                        0: const pw.FixedColumnWidth(100),
                        for (int i = 1; i <= subjects.length * 3; i++) i: const pw.FlexColumnWidth(1),
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        );

        await Printing.sharePdf(
          bytes: await pdf.save(),
          filename: 'board_exam_results_${_selectedSubject!['className']}_$_academicYear$_selectedMonth.pdf',
        );
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('PDF generated successfully')),
        );
      } else {
        throw Exception('Failed to generate PDF: ${response.statusCode}');
      }
    } catch (e) {
      print('PDF Generation Error: $e'); // Debug log
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error generating PDF: $e')),
      );
    }
  }

  void _showBoardExamsDialog(Map<String, dynamic> subject) {
    setState(() {
      _selectedSubject = subject;
    });
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BoardExamsDialog(
          classSubject: subject,
          className: subject['className'],
          academicYear: _academicYear,
          month: _selectedMonth,
        ),
      ),
    );
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
                'Board Exam Preparation',
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
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
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
                          onChanged: _filterSubjects,
                        ),
                      ),
                      const SizedBox(width: 8),
                      DropdownButton<String>(
                        value: _selectedMonth,
                        items: _monthNames.map((month) {
                          return DropdownMenuItem(
                            value: month,
                            child: Text(month, style: GoogleFonts.poppins(color: Colors.white)),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedMonth = value!;
                          });
                        },
                        dropdownColor: const Color(0xFF333333),
                        style: GoogleFonts.poppins(color: Colors.white),
                        iconEnabledColor: Colors.white,
                      ),
                      const SizedBox(width: 8),
                      SizedBox(
                        width: 100,
                        child: TextField(
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: 'Year',
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
                          onChanged: (value) {
                            setState(() {
                              _academicYear = int.tryParse(value) ?? 2025;
                            });
                          },
                          controller: TextEditingController(text: _academicYear.toString()),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (_errorMessage != null)
                    Center(
                      child: Text(
                        _errorMessage!,
                        style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
                      ),
                    )
                  else if (_isLoading)
                    const Center(
                      child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
                    )
                  else ...[
                      _filteredSubjects.isEmpty
                          ? Center(
                        child: Text(
                          'No subjects found.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                          : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _filteredSubjects.length,
                        itemBuilder: (context, index) {
                          final subject = _filteredSubjects[index];
                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${subject['className']} - ${subject['subject']['name']}',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'ID: ${subject['id']}',
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
                                          setState(() {
                                            _selectedSubject = subject;
                                          });
                                          _generatePDF();
                                        },
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: const Color(0xFF00c757),
                                          side: const BorderSide(color: Color(0xFF00c757)),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(5),
                                          ),
                                        ),
                                        child: Text(
                                          'Download PDF',
                                          style: GoogleFonts.poppins(fontSize: 12),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      OutlinedButton(
                                        onPressed: () => _showBoardExamsDialog(subject),
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: Colors.white,
                                          side: const BorderSide(color: Colors.white),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(5),
                                          ),
                                        ),
                                        child: Text(
                                          'Manage',
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

class BoardExamsDialog extends StatefulWidget {
  final Map<String, dynamic> classSubject;
  final String className;
  final int academicYear;
  final String month;

  const BoardExamsDialog({
    super.key,
    required this.classSubject,
    required this.className,
    required this.academicYear,
    required this.month,
  });

  @override
  _BoardExamsDialogState createState() => _BoardExamsDialogState();
}

class _BoardExamsDialogState extends State<BoardExamsDialog> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _boardExams = [];
  List<dynamic> _students = [];
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchBoardExams();
    _fetchStudents();
  }

  Future<void> _fetchBoardExams() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/BoardExams/${widget.className.toLowerCase()}/board-exams?classSubjectId=${widget.classSubject['id']}&academicYear=${widget.academicYear}&month=${widget.month}'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Board Exams Response: $data'); // Debug log
        setState(() {
          _boardExams = data['boardExams'] ?? [];
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch board exams: ${response.statusCode}');
      }
    } catch (e) {
      print('Fetch Board Exams Error: $e'); // Debug log
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to fetch board exams')),
      );
    }
  }

  Future<void> _fetchStudents() async {
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/BoardExams/${widget.className.toLowerCase()}/students/${widget.classSubject['classId']}'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Students Response: $data'); // Debug log
        setState(() {
          _students = data['students'] ?? [];
        });
      } else {
        throw Exception('Failed to fetch students: ${response.statusCode}');
      }
    } catch (e) {
      print('Fetch Students Error: $e'); // Debug log
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to fetch students')),
      );
    }
  }

  void _showCreateBoardExamDialog() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CreateBoardExamDialog(
          classSubjectId: widget.classSubject['id'],
          className: widget.className,
          onSave: _fetchBoardExams,
        ),
      ),
    );
  }

  void _showResultsDialog(Map<String, dynamic> boardExam) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BoardExamResultsDialog(
          boardExam: boardExam,
          students: _students,
          className: widget.className,
          onSave: _fetchBoardExams,
        ),
      ),
    );
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
                'Board Exams for ${widget.classSubject['subject']['name']} - ${widget.className}',
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
                icon: const Icon(Icons.add, color: Colors.white),
                onPressed: _showCreateBoardExamDialog,
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Color(0xFFf44336)),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  if (_errorMessage != null)
                    Center(
                      child: Text(
                        _errorMessage!,
                        style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
                      ),
                    )
                  else if (_isLoading)
                    const Center(
                      child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
                    )
                  else ...[
                      _boardExams.isEmpty
                          ? Center(
                        child: Text(
                          'No board exams found.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                          : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _boardExams.length,
                        itemBuilder: (context, index) {
                          final exam = _boardExams[index];
                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    exam['title'] ?? 'Exam ${exam['id']}',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Date: ${exam['examDate'] != null ? DateTime.parse(exam['examDate']).toLocal().toString().substring(0, 10) : 'N/A'}',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Syllabus: ${exam['syllabus'] ?? 'N/A'}',
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
                                        onPressed: () => _showResultsDialog(exam),
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: const Color(0xFF00c757),
                                          side: const BorderSide(color: Color(0xFF00c757)),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(5),
                                          ),
                                        ),
                                        child: Text(
                                          'Update Results',
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

class CreateBoardExamDialog extends StatefulWidget {
  final int classSubjectId;
  final String className;
  final VoidCallback onSave;

  const CreateBoardExamDialog({
    super.key,
    required this.classSubjectId,
    required this.className,
    required this.onSave,
  });

  @override
  _CreateBoardExamDialogState createState() => _CreateBoardExamDialogState();
}

class _CreateBoardExamDialogState extends State<CreateBoardExamDialog> {
  final _storage = const FlutterSecureStorage();
  final _titleController = TextEditingController();
  final _syllabusController = TextEditingController();
  final _dateController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _titleController.dispose();
    _syllabusController.dispose();
    _dateController.dispose();
    super.dispose();
  }

  Future<void> _createBoardExam() async {
    if (_titleController.text.isEmpty || _syllabusController.text.isEmpty || _dateController.text.isEmpty) {
      setState(() {
        _errorMessage = 'All fields are required';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final payload = {
        'classSubjectId': widget.classSubjectId,
        'title': _titleController.text,
        'syllabus': _syllabusController.text,
        'examDate': _dateController.text,
        'totalMarks': 100,
      };

      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/BoardExams/${widget.className.toLowerCase()}/board-exams'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Board exam created successfully')),
        );
        widget.onSave();
        Navigator.pop(context);
      } else {
        throw Exception('Failed to create board exam: ${response.statusCode}');
      }
    } catch (e) {
      print('Create Board Exam Error: $e'); // Debug log
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to create board exam')),
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
                'Create Board Exam',
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
                icon: const Icon(Icons.close, color: Color(0xFFf44336)),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  if (_errorMessage != null)
                    Center(
                      child: Text(
                        _errorMessage!,
                        style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
                      ),
                    )
                  else if (_isLoading)
                    const Center(
                      child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
                    )
                  else ...[
                      Card(
                        color: const Color(0xFF1e1e1e),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              TextField(
                                controller: _titleController,
                                decoration: InputDecoration(
                                  labelText: 'Title',
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
                              ),
                              const SizedBox(height: 12),
                              TextField(
                                controller: _syllabusController,
                                decoration: InputDecoration(
                                  labelText: 'Syllabus',
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
                                maxLines: 3,
                              ),
                              const SizedBox(height: 12),
                              TextField(
                                controller: _dateController,
                                decoration: InputDecoration(
                                  labelText: 'Exam Date (YYYY-MM-DD)',
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
                                    onPressed: _createBoardExam,
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
                              ),
                            ],
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

class BoardExamResultsDialog extends StatefulWidget {
  final Map<String, dynamic> boardExam;
  final List<dynamic> students;
  final String className;
  final VoidCallback onSave;

  const BoardExamResultsDialog({
    super.key,
    required this.boardExam,
    required this.students,
    required this.className,
    required this.onSave,
  });

  @override
  _BoardExamResultsDialogState createState() => _BoardExamResultsDialogState();
}

class _BoardExamResultsDialogState extends State<BoardExamResultsDialog> {
  final _storage = const FlutterSecureStorage();
  List<Map<String, dynamic>> _results = [];
  bool _isLoading = false;
  String? _errorMessage;
  final Map<int, TextEditingController> _writtenMarksControllers = {};
  final Map<int, TextEditingController> _oralMarksControllers = {};
  final Map<int, TextEditingController> _remarksControllers = {};

  @override
  void initState() {
    super.initState();
    _fetchResults();
  }

  @override
  void dispose() {
    _writtenMarksControllers.forEach((_, controller) => controller.dispose());
    _oralMarksControllers.forEach((_, controller) => controller.dispose());
    _remarksControllers.forEach((_, controller) => controller.dispose());
    super.dispose();
  }

  Future<void> _fetchResults() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/BoardExams/${widget.className.toLowerCase()}/board-exam-results?boardExamId=${widget.boardExam['id']}'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Board Exam Results Response: $data'); // Debug log
        final existingResults = data['results'] ?? [];
        setState(() {
          _results = widget.students.map((student) {
            final existing = existingResults.firstWhere(
                  (r) => r['studentId'] == student['id'],
              orElse: () => {},
            );
            final writtenMarksController = TextEditingController(text: existing['writtenMarks']?.toString() ?? '');
            final oralMarksController = TextEditingController(text: existing['oralMarks']?.toString() ?? '');
            final remarksController = TextEditingController(text: existing['remarks'] ?? '');
            _writtenMarksControllers[student['id']] = writtenMarksController;
            _oralMarksControllers[student['id']] = oralMarksController;
            _remarksControllers[student['id']] = remarksController;
            return {
              'studentId': student['id'],
              'studentName': '${student['firstName']} ${student['lastName'] ?? ''}'.trim(),
              'writtenMarks': existing['writtenMarks']?.toString() ?? '',
              'oralMarks': existing['oralMarks']?.toString() ?? '',
              'remarks': existing['remarks'] ?? '',
            };
          }).toList();
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch results: ${response.statusCode}');
      }
    } catch (e) {
      print('Fetch Results Error: $e'); // Debug log
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _results = widget.students.map((student) {
          final writtenMarksController = TextEditingController();
          final oralMarksController = TextEditingController();
          final remarksController = TextEditingController();
          _writtenMarksControllers[student['id']] = writtenMarksController;
          _oralMarksControllers[student['id']] = oralMarksController;
          _remarksControllers[student['id']] = remarksController;
          return {
            'studentId': student['id'],
            'studentName': '${student['firstName']} ${student['lastName'] ?? ''}'.trim(),
            'writtenMarks': '',
            'oralMarks': '',
            'remarks': '',
          };
        }).toList();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to fetch results')),
      );
    }
  }

  void _updateResult(int index, String field, String value) {
    setState(() {
      double? parsedValue = double.tryParse(value);
      if (field == 'writtenMarks' && parsedValue != null) {
        parsedValue = parsedValue.clamp(0, 90);
      } else if (field == 'oralMarks' && parsedValue != null) {
        parsedValue = parsedValue.clamp(0, 10);
      }
      _results[index][field] = parsedValue?.toString() ?? value;
      if (field == 'writtenMarks') {
        _writtenMarksControllers[_results[index]['studentId']]?.text = value;
      } else if (field == 'oralMarks') {
        _oralMarksControllers[_results[index]['studentId']]?.text = value;
      } else if (field == 'remarks') {
        _remarksControllers[_results[index]['studentId']]?.text = value;
      }
    });
  }

  Future<void> _saveResults() async {
    final invalidResults = _results.any((result) {
      final written = double.tryParse(result['writtenMarks'] ?? '');
      final oral = double.tryParse(result['oralMarks'] ?? '');
      return (result['writtenMarks']?.isNotEmpty == true && written == null) ||
          (result['oralMarks']?.isNotEmpty == true && oral == null) ||
          (written != null && (written < 0 || written > 90)) ||
          (oral != null && (oral < 0 || oral > 10));
    });

    if (invalidResults) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid marks (Written: 0-90, Oral: 0-10)')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final payload = {
        'results': _results.map((result) => {
          'boardExamId': widget.boardExam['id'],
          'studentId': result['studentId'],
          'writtenMarks': result['writtenMarks']?.isNotEmpty == true ? double.parse(result['writtenMarks']) : null,
          'oralMarks': result['oralMarks']?.isNotEmpty == true ? double.parse(result['oralMarks']) : null,
          'totalMarks': result['writtenMarks']?.isNotEmpty == true && result['oralMarks']?.isNotEmpty == true ? double.parse(result['writtenMarks']) + double.parse(result['oralMarks']) : null,
          'remarks': result['remarks']?.isNotEmpty == true ? result['remarks'] : null,
        }).toList(),
      };

      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/BoardExams/board-exam-results/batch'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Results saved successfully')),
        );
        widget.onSave();
        Navigator.pop(context);
      } else {
        throw Exception('Failed to save results: ${response.statusCode}');
      }
    } catch (e) {
      print('Save Results Error: $e'); // Debug log
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to save results')),
      );
    }
  }

  Future<void> _generatePDF() async {
    try {
      final pdf = pw.Document();
      final font = pw.Font.helvetica();
      final boldFont = pw.Font.helveticaBold();

      pdf.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4,
          build: (context) => [
            pw.Text(
              'Sure Success Point School',
              style: pw.TextStyle(font: boldFont, fontSize: 40, color: PdfColor.fromHex('003087')),
              textAlign: pw.TextAlign.center,
            ),
            pw.Text(
              'Knights West Bengal Board Preparation Test Series (KWBBPTS)',
              style: pw.TextStyle(font: boldFont, fontSize: 11, color: PdfColor.fromHex('333333')),
              textAlign: pw.TextAlign.center,
            ),
            pw.Text(
              'Board Exam: ${widget.boardExam['title'] ?? 'Unknown'}',
              style: pw.TextStyle(font: font, fontSize: 12, color: PdfColor.fromHex('000000')),
              textAlign: pw.TextAlign.center,
            ),
            pw.Text(
              'Class: ${widget.className}',
              style: pw.TextStyle(font: font, fontSize: 12, color: PdfColor.fromHex('000000')),
              textAlign: pw.TextAlign.center,
            ),
            pw.SizedBox(height: 16),
            pw.Table.fromTextArray(
              headers: ['Student Name', 'Written Marks (90)', 'Oral Marks (10)', 'Total Marks', 'Remarks'],
              data: _results.map((result) {
                final writtenStr = result['writtenMarks'] ?? '';
                final oralStr = result['oralMarks'] ?? '';
                final written = double.tryParse(writtenStr) ?? 0.0;
                final oral = double.tryParse(oralStr) ?? 0.0;
                final total = (written + oral).toStringAsFixed(2);
                return [
                  result['studentName'] ?? '-',
                  writtenStr.isEmpty ? '-' : writtenStr,
                  oralStr.isEmpty ? '-' : oralStr,
                  total,
                  result['remarks'].isEmpty ? '-' : result['remarks'],
                ];
              }).toList(),
              border: pw.TableBorder.all(color: PdfColor.fromHex('B40000'), width: 0.1),
              headerStyle: pw.TextStyle(
                font: boldFont,
                fontSize: 10,
                color: PdfColor.fromInt(0xFFFFFFFF),
                background: pw.BoxDecoration(color: PdfColor.fromHex('DC2626')),
              ),
              cellStyle: pw.TextStyle(font: font, fontSize: 10, color: PdfColor.fromHex('000000')),
              cellAlignment: pw.Alignment.centerLeft,
              headerDecoration: pw.BoxDecoration(color: PdfColor.fromHex('DC2626')),
              rowDecoration: pw.BoxDecoration(color: PdfColor.fromHex('FFFFFF')),
              columnWidths: {
                0: const pw.FlexColumnWidth(3),
                1: const pw.FlexColumnWidth(1),
                2: const pw.FlexColumnWidth(1),
                3: const pw.FlexColumnWidth(1),
                4: const pw.FlexColumnWidth(2),
              },
            ),
          ],
        ),
      );

      await Printing.sharePdf(
        bytes: await pdf.save(),
        filename: 'BoardExam_${widget.boardExam['title'] ?? 'Unknown'}.pdf',
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('PDF downloaded successfully')),
      );
    } catch (e) {
      print('PDF Generation Error: $e'); // Debug log
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error generating PDF: $e')),
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
                'Board Exam Results for ${widget.boardExam['title'] ?? 'Unknown'} - ${widget.className}',
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
                icon: const Icon(Icons.download, color: Color(0xFF00c757)),
                onPressed: _generatePDF,
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Color(0xFFf44336)),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  if (_errorMessage != null)
                    Center(
                      child: Text(
                        _errorMessage!,
                        style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
                      ),
                    )
                  else if (_isLoading)
                    const Center(
                      child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
                    )
                  else ...[
                      _results.isEmpty
                          ? Center(
                        child: Text(
                          'No students found for this exam.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                          : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _results.length,
                        itemBuilder: (context, index) {
                          final result = _results[index];
                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    result['studentName'],
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
                                          controller: _writtenMarksControllers[result['studentId']],
                                          keyboardType: TextInputType.number,
                                          decoration: InputDecoration(
                                            labelText: 'Written Marks (0-90)',
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
                                          onChanged: (value) => _updateResult(index, 'writtenMarks', value),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: TextField(
                                          controller: _oralMarksControllers[result['studentId']],
                                          keyboardType: TextInputType.number,
                                          decoration: InputDecoration(
                                            labelText: 'Oral Marks (0-10)',
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
                                          onChanged: (value) => _updateResult(index, 'oralMarks', value),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  TextField(
                                    controller: _remarksControllers[result['studentId']],
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
                                    onChanged: (value) => _updateResult(index, 'remarks', value),
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
                            onPressed: _saveResults,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF00c757),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(5),
                              ),
                            ),
                            child: Text(
                              'Save All',
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