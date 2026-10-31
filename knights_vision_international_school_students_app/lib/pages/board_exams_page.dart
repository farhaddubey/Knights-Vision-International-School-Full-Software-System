import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'board_exam_results_page.dart';
import '../api_service.dart';

class BoardExamsPage extends StatefulWidget {
  final int classSubjectId;
  final String className;
  final String subjectName;
  final int academicYear;
  final String month;

  const BoardExamsPage({
    super.key,
    required this.classSubjectId,
    required this.className,
    required this.subjectName,
    required this.academicYear,
    required this.month,
  });

  @override
  _BoardExamsPageState createState() => _BoardExamsPageState();
}

class _BoardExamsPageState extends State<BoardExamsPage> {
  final _apiService = ApiService();
  List<dynamic> _boardExams = [];
  List<dynamic> _students = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final monthNumber = _monthNumber(widget.month);
      final examsResponse = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/students/myboardexamresults',
        queryParameters: {
          'classSubjectId': '${widget.classSubjectId}',
          'academicYear': '${widget.academicYear}',
          'month': '$monthNumber',
        },
      );

      if (examsResponse.statusCode == 200) {
        final examsData = jsonDecode(examsResponse.body);
        setState(() {
          _boardExams =
              (examsData['results'] is List ? examsData['results'] : [])
                  .map((e) => {
                        'id': e['id'],
                        'title': e['title'] ?? 'N/A',
                        'syllabus': 'Board examination result',
                        'examDate': e['examDate'],
                        'totalMarks': e['totalMarks'] ?? 0,
                        'writtenMarks': e['writtenMarks'],
                        'oralMarks': e['oralMarks'],
                        'remarks': e['remarks'],
                      })
                  .toList();
          _students = const [];
          _isLoading = false;
        });
      } else {
        throw ApiException('Unable to load your board examination results.',
            statusCode: examsResponse.statusCode);
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    }
  }

  int _monthNumber(String month) {
    const months = {
      'January': 1,
      'February': 2,
      'March': 3,
      'April': 4,
      'May': 5,
      'June': 6,
      'July': 7,
      'August': 8,
      'September': 9,
      'October': 10,
      'November': 11,
      'December': 12,
    };
    return months[month] ?? DateTime.now().month;
  }

  String _formatDate(String? date) {
    if (date == null) return 'N/A';
    try {
      final parsedDate = DateTime.parse(date);
      return '${parsedDate.day}/${parsedDate.month}/${parsedDate.year}';
    } catch (e) {
      return 'N/A';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: CustomScrollView(
        slivers: [
          // Sticky Header
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFFb71c1c),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                'My Board Exam Results - ${widget.subjectName}',
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
          ),
          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Loading Indicator
                  if (_isLoading)
                    const Center(
                        child:
                            CircularProgressIndicator(color: Color(0xFF00c757)))
                  else ...[
                    // Table Header
                    Container(
                      color: const Color(0xFF333333),
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        children: [
                          Expanded(
                              flex: 2,
                              child: Text('Title',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 3,
                              child: Text('Syllabus',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('Exam Date',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('My Total',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('Actions',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ),
                    // Board Exams List
                    _boardExams.isEmpty
                        ? Center(
                            child: Text(
                              'No board exams found.',
                              style: GoogleFonts.poppins(
                                  color: Colors.white, fontSize: 16),
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
                                margin: const EdgeInsets.symmetric(vertical: 2),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Title: ${exam['title']}',
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF00c757),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Syllabus: ${exam['syllabus']?.split('\n').join(' ') ?? 'N/A'}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Exam Date: ${_formatDate(exam['examDate'])}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Total Marks: ${exam['totalMarks'].toString()}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.end,
                                        children: [
                                          OutlinedButton(
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) =>
                                                      BoardExamResultsPage(
                                                    boardExam: exam,
                                                    students: _students,
                                                    className: widget.className,
                                                  ),
                                                ),
                                              );
                                            },
                                            style: OutlinedButton.styleFrom(
                                              foregroundColor:
                                                  const Color(0xFF00c757),
                                              side: const BorderSide(
                                                  color: Color(0xFF00c757)),
                                            ),
                                            child: Text(
                                              'View My Result',
                                              style: GoogleFonts.poppins(),
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
