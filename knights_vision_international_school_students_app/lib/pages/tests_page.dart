import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'test_marks_view_page.dart';
import '../api_service.dart';

class TestsPage extends StatefulWidget {
  final int classSubjectId;
  final String className;
  final String subjectName;

  const TestsPage({
    super.key,
    required this.classSubjectId,
    required this.className,
    required this.subjectName,
  });

  @override
  _TestsPageState createState() => _TestsPageState();
}

class _TestsPageState extends State<TestsPage> {
  final _apiService = ApiService();
  List<dynamic> _tests = [];
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
      final testsResponse = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/students/mytests',
        queryParameters: {'classSubjectId': '${widget.classSubjectId}'},
      );

      if (testsResponse.statusCode == 200) {
        final testsData =
            jsonDecode(testsResponse.body) as Map<String, dynamic>;
        setState(() {
          _tests = (testsData['tests'] is List ? testsData['tests'] : [])
              .map((t) => {
                    'id': t['id'],
                    'title': t['title'] ?? 'Test ${t['id']}',
                    'testType': t['testType'] ?? 'Test',
                    'syllabus': t['syllabus'] ?? 'N/A',
                    'biWeeklySlotStart': t['biWeeklySlotStart'],
                    'biWeeklySlotEnd': t['biWeeklySlotEnd'],
                    'TestMark': t['TestMark'] ?? [],
                  })
              .toList();
          _students = const [];
          _isLoading = false;
        });
      } else {
        throw ApiException('Unable to load your class tests.',
            statusCode: testsResponse.statusCode);
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    }
  }

  String _formatDateRange(String? start, String? end) {
    if (start == null || end == null) return 'N/A';
    try {
      final startDate = DateTime.parse(start);
      final endDate = DateTime.parse(end);
      return '${startDate.day}/${startDate.month}/${startDate.year} - ${endDate.day}/${endDate.month}/${endDate.year}';
    } catch (e) {
      return 'N/A';
    }
  }

  String _displayMyMarks(List<dynamic> testMarks) {
    if (testMarks.isEmpty) return 'Not published';
    try {
      final marks = testMarks.first;
      final value = marks['marks'] ?? '-';
      final maximum = marks['maxMarks'] ?? '-';
      return '$value/$maximum';
    } catch (e) {
      return 'Not published';
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
                'Tests - ${widget.subjectName} - ${widget.className}',
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
                              child: Text('Bi-Weekly Slot',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('My Marks',
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
                    // Tests List
                    _tests.isEmpty
                        ? Center(
                            child: Text(
                              'No tests found.',
                              style: GoogleFonts.poppins(
                                  color: Colors.white, fontSize: 16),
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _tests.length,
                            itemBuilder: (context, index) {
                              final test = _tests[index];
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
                                        'Title: ${test['title']}',
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF00c757),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Syllabus: ${(test['syllabus'] is String ? test['syllabus'] : jsonEncode(test['syllabus'])).split('\n').join(' ')}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Bi-Weekly Slot: ${_formatDateRange(test['biWeeklySlotStart'], test['biWeeklySlotEnd'])}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'My Marks: ${_displayMyMarks(test['TestMark'])}',
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
                                                      TestMarksViewPage(
                                                    test: test,
                                                    students: _students,
                                                    className: widget.className,
                                                    classSubjectId:
                                                        widget.classSubjectId,
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
                                              'View My Marks',
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
