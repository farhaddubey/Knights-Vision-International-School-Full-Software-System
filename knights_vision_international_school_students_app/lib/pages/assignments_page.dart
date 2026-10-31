import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'student_assignments_page.dart';
import '../api_service.dart';

class AssignmentsPage extends StatefulWidget {
  final int classSubjectId;
  final String className;
  final String subjectName;
  final int classId;

  const AssignmentsPage({
    super.key,
    required this.classSubjectId,
    required this.className,
    required this.subjectName,
    required this.classId,
  });

  @override
  _AssignmentsPageState createState() => _AssignmentsPageState();
}

class _AssignmentsPageState extends State<AssignmentsPage> {
  final _apiService = ApiService();
  List<dynamic> _assignments = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchAssignments();
  }

  Future<void> _fetchAssignments() async {
    setState(() => _isLoading = true);
    try {
      final response = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/students/myassignments',
        queryParameters: {'classSubjectId': '${widget.classSubjectId}'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _assignments = (data is List ? data : data['assignments'] ?? [])
              .map((a) => {
                    'id': a['id'],
                    'classSubjectId': a['classSubjectId'],
                    'title': a['title'] ?? 'Untitled',
                    'description': a['description'] ?? '',
                    'dueDate': a['dueDate'],
                    'biWeeklySlotStart': a['biWeeklySlotStart'],
                    'biWeeklySlotEnd': a['biWeeklySlotEnd'],
                    'marks': a['marks'],
                    'StudentAssignment': a['StudentAssignment'] ?? [],
                    'createdAt': a['createdAt'],
                    'updatedAt': a['updatedAt'],
                  })
              .toList();
          _isLoading = false;
        });
      } else {
        throw ApiException('Unable to load your assignments.',
            statusCode: response.statusCode);
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: 'Failed to fetch assignments',
        backgroundColor: Colors.red,
      );
    }
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
                'Assignments - ${widget.subjectName} - ${widget.className}',
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
                              flex: 1,
                              child: Text('Title',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('Description',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('Due Date',
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
                              child: Text('My Submission',
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
                    // Assignments List
                    _assignments.isEmpty
                        ? Center(
                            child: Text(
                              'No assignments found.',
                              style: GoogleFonts.poppins(
                                  color: Colors.white, fontSize: 16),
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _assignments.length,
                            itemBuilder: (context, index) {
                              final a = _assignments[index];
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
                                        'Title: ${a['title']}',
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF00c757),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Description: ${a['description']?.split('\n').join(' ') ?? 'N/A'}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Due Date: ${_formatDate(a['dueDate'])}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Bi-Weekly Slot: ${_formatDate(a['biWeeklySlotStart'])} - ${_formatDate(a['biWeeklySlotEnd'])}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            'Submitted: ${((a['StudentAssignment'] as List?)?.isNotEmpty == true && a['StudentAssignment'].first['isSubmitted'] == true) ? 'Yes' : 'No'}',
                                            style: GoogleFonts.poppins(
                                                color: Colors.white),
                                          ),
                                          OutlinedButton(
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) =>
                                                      StudentAssignmentsPage(
                                                    assignmentId: a['id'],
                                                    assignmentTitle:
                                                        a['title'] ??
                                                            'Untitled',
                                                    className: widget.className,
                                                    classId: widget.classId,
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
                                              'View My Submission',
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
