import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'dart:io';
import 'package:intl/intl.dart';
import '../constants.dart';
import 'package:pdf/pdf.dart';

class SemesterExamSchedulePage extends StatefulWidget {
  const SemesterExamSchedulePage({super.key});

  @override
  _SemesterExamSchedulePageState createState() => _SemesterExamSchedulePageState();
}

class _SemesterExamSchedulePageState extends State<SemesterExamSchedulePage> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _schedules = [];
  List<dynamic> _filteredSchedules = [];
  bool _isLoading = true;
  String _searchQuery = '';
  int _page = 1;
  int _totalPages = 1;
  String _selectedSemester = 'SEMESTER_I';
  String _className = '';
  int? _classId;
  String _schoolName = 'Sure Success Point School';
  final int _pageSize = 30;

  @override
  void initState() {
    super.initState();
    _fetchClassInfo();
  }

  Future<void> _fetchClassInfo() async {
    try {
      final token = await _storage.read(key: 'student_token');
      if (token == null) {
        throw Exception('No student token found. Please log in.');
      }

      final response = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/class-subjects?page=1&pageSize=1'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['classSubjects']?.isNotEmpty ?? false) {
          setState(() {
            _classId = data['classSubjects'][0]['classId'];
            _className = data['classSubjects'][0]['className'] ?? 'N/A';
          });
          _fetchSchedules();
        } else {
          throw Exception('No class subjects found');
        }
      } else {
        throw Exception('Failed to fetch class information: ${response.statusCode}');
      }
    } catch (e) {
      setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    }
  }

  Future<void> _fetchSchedules({int page = 1}) async {
    if (_classId == null) return;
    setState(() => _isLoading = true);
    try {
      final token = await _storage.read(key: 'student_token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/semester-exam-schedules?page=$page&pageSize=$_pageSize'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _schedules = (data['schedules'] is List ? data['schedules'] : []).map((s) => {
            'id': s['id'],
            'subjectName': s['subjectName']?.toString().trim() ?? 'N/A',
            'semester': s['semester'] ?? 'N/A',
            'examDate': s['examDate'],
            'durationMinutes': s['durationMinutes'],
            'examHall': s['examHall']?.toString().trim() ?? 'N/A',
            'classId': s['classId'],
          }).toList();
          _schoolName = data['schoolName'] ?? 'Sure Success Point School';
          _applySearchFilter();
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch schedules: ${response.statusCode}');
      }
    } catch (e) {
      setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    }
  }

  void _applySearchFilter() {
    setState(() {
      _filteredSchedules = _schedules.where((schedule) {
        final subjectName = schedule['subjectName']?.toLowerCase() ?? '';
        final semester = schedule['semester']?.toLowerCase() ?? '';
        return schedule['semester'] == _selectedSemester &&
            (subjectName.contains(_searchQuery.toLowerCase()) || semester.contains(_searchQuery.toLowerCase()));
      }).toList();
      _totalPages = (_filteredSchedules.length / _pageSize).ceil();
    });
  }

  void _handleSearchChange(String value) {
    setState(() {
      _searchQuery = value;
      _page = 1;
      _applySearchFilter();
    });
  }

  void _handlePageChange(int value) {
    setState(() => _page = value);
    _fetchSchedules(page: value);
  }

  Future<void> _generatePDF() async {
    try {
      final now = DateTime.now();
      final monthYear = DateFormat('MMMM yyyy').format(now);

      final pdf = pw.Document();
      final font = pw.Font.helvetica();
      final boldFont = pw.Font.helveticaBold();

      pdf.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4,
          margin: pw.EdgeInsets.all(10),
          build: (pw.Context context) {
            return [
              pw.Center(
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.center,
                  children: [
                    pw.Text(
                      _schoolName,
                      style: pw.TextStyle(
                        font: boldFont,
                        fontSize: 20,
                        color: PdfColor.fromHex('#003087'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'Institution of Humanism, Hardwork, Discipline, Technology & Excellence',
                      style: pw.TextStyle(
                        font: boldFont,
                        fontSize: 10,
                        color: PdfColor.fromHex('#333333'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.Text(
                      'www.sspointschool.in | Powered by Knights (KiREAD) Group',
                      style: pw.TextStyle(
                        font: font,
                        fontSize: 10,
                        color: PdfColor.fromHex('#333333'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'SEMESTER EXAM SCHEDULE',
                      style: pw.TextStyle(
                        font: boldFont,
                        fontSize: 12,
                        color: PdfColor.fromHex('#000000'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'Class: $_className | Semester: ${_selectedSemester.replaceAll('_', ' ')} | Month: $monthYear',
                      style: pw.TextStyle(
                        font: font,
                        fontSize: 10,
                        color: PdfColor.fromHex('#000000'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 8),
                  ],
                ),
              ),
              pw.Table(
                border: pw.TableBorder.all(
                  color: PdfColor.fromHex('#000000'),
                  width: 0.1,
                ),
                columnWidths: {
                  0: const pw.FlexColumnWidth(2),
                  1: const pw.FlexColumnWidth(2),
                  2: const pw.FlexColumnWidth(1),
                  3: const pw.FlexColumnWidth(2),
                },
                children: [
                  pw.TableRow(
                    decoration: pw.BoxDecoration(
                      color: PdfColor.fromHex('#009688'),
                    ),
                    children: [
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(4),
                        child: pw.Text(
                          'Subject',
                          style: pw.TextStyle(
                            font: boldFont,
                            fontSize: 10,
                            color: PdfColor.fromHex('#FFFFFF'),
                          ),
                        ),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(4),
                        child: pw.Text(
                          'Exam Date & Time',
                          style: pw.TextStyle(
                            font: boldFont,
                            fontSize: 10,
                            color: PdfColor.fromHex('#FFFFFF'),
                          ),
                        ),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(4),
                        child: pw.Text(
                          'Duration',
                          style: pw.TextStyle(
                            font: boldFont,
                            fontSize: 10,
                            color: PdfColor.fromHex('#FFFFFF'),
                          ),
                        ),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(4),
                        child: pw.Text(
                          'Exam Hall',
                          style: pw.TextStyle(
                            font: boldFont,
                            fontSize: 10,
                            color: PdfColor.fromHex('#FFFFFF'),
                          ),
                        ),
                      ),
                    ],
                  ),
                  ..._filteredSchedules.asMap().entries.map((entry) {
                    final index = entry.key;
                    final schedule = entry.value;
                    final isEven = index % 2 == 0;
                    return pw.TableRow(
                      decoration: pw.BoxDecoration(
                        color: isEven ? PdfColor.fromHex('#FFFFFF') : PdfColor.fromHex('#F0F0F0'),
                      ),
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            schedule['subjectName'] ?? 'N/A',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            schedule['examDate'] != null
                                ? DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(schedule['examDate']))
                                : 'N/A',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            '${schedule['durationMinutes'] ?? 'N/A'} min',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            schedule['examHall'] ?? 'N/A',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                      ],
                    );
                  }),
                ],
              ),
              pw.SizedBox(height: 8),
              pw.Align(
                alignment: pw.Alignment.centerLeft,
                child: pw.Text(
                  'Generated on: ${DateFormat('yyyy-MM-dd').format(now)}',
                  style: pw.TextStyle(font: font, fontSize: 8),
                ),
              ),
            ];
          },
        ),
      );

      final output = await getTemporaryDirectory();
      final file = File('${output.path}/exam_schedule_${_className}_${_selectedSemester}.pdf');
      await file.writeAsBytes(await pdf.save());
      await OpenFile.open(file.path);
      Fluttertoast.showToast(
        msg: 'PDF downloaded successfully',
        backgroundColor: Colors.green,
      );
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Failed to generate or open PDF: ${e.toString()}',
        backgroundColor: Colors.red,
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
            backgroundColor: const Color(0xFFb71c1c),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                'Semester Exam Schedule - Class $_className',
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
            forceElevated: false,
            actions: [
              IconButton(
                icon: const Icon(Icons.download, color: Color(0xFF00c757)),
                onPressed: _filteredSchedules.isEmpty ? null : _generatePDF,
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Row(
                    children: [
                      Flexible(
                        flex: 6,
                        child: TextField(
                          onChanged: _handleSearchChange,
                          decoration: InputDecoration(
                            hintText: 'Search by Subject',
                            hintStyle: GoogleFonts.poppins(color: Colors.white70),
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: const OutlineInputBorder(),
                            prefixIcon: const Icon(Icons.search, color: Colors.white70),
                          ),
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Flexible(
                        flex: 4,
                        child: DropdownButton<String>(
                          isExpanded: true,
                          value: _selectedSemester,
                          dropdownColor: const Color(0xFF333333),
                          items: ['SEMESTER_I', 'SEMESTER_II', 'SEMESTER_III'].map((semester) {
                            return DropdownMenuItem<String>(
                              value: semester,
                              child: Text(
                                semester.replaceAll('_', ' '),
                                style: GoogleFonts.poppins(color: const Color(0xFF00c757)),
                              ),
                            );
                          }).toList(),
                          onChanged: (value) => setState(() {
                            _selectedSemester = value!;
                            _page = 1;
                            _applySearchFilter();
                          }),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator(color: Color(0xFF00c757)))
                  else ...[
                    Container(
                      color: const Color(0xFF333333),
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        children: [
                          Expanded(flex: 1, child: Text('ID', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          Expanded(flex: 2, child: Text('Subject', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          Expanded(flex: 2, child: Text('Semester', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          Expanded(flex: 2, child: Text('Exam Date', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          Expanded(flex: 2, child: Text('Duration', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          Expanded(flex: 2, child: Text('Exam Hall', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ),
                    _filteredSchedules.isEmpty
                        ? Center(
                      child: Text(
                        'No exam schedules found for Class $_className - ${_selectedSemester.replaceAll('_', ' ')}.',
                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                      ),
                    )
                        : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _filteredSchedules.length,
                      itemBuilder: (context, index) {
                        final schedule = _filteredSchedules[index];
                        return Card(
                          color: const Color(0xFF1e1e1e),
                          margin: const EdgeInsets.symmetric(vertical: 2),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Subject: ${schedule['subjectName']}',
                                  style: GoogleFonts.poppins(
                                    color: const Color(0xFF00c757),
                                    fontWeight: FontWeight.bold,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Semester: ${schedule['semester']?.replaceAll('_', ' ') ?? 'N/A'}',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Exam Date: ${schedule['examDate'] != null ? DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(schedule['examDate'])) : 'N/A'}',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Duration: ${schedule['durationMinutes'] ?? 'N/A'} min',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Exam Hall: ${schedule['examHall']}',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
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
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left, color: Color(0xFF00c757)),
                    onPressed: _page > 1 ? () => _handlePageChange(_page - 1) : null,
                  ),
                  Text(
                    'Page $_page of $_totalPages',
                    style: GoogleFonts.poppins(color: Colors.white),
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right, color: Color(0xFF00c757)),
                    onPressed: _page < _totalPages ? () => _handlePageChange(_page + 1) : null,
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