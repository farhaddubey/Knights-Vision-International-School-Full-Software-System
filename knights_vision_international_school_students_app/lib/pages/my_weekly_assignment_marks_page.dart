import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import '../api_service.dart';

class MyWeeklyAssignmentMarksPage extends StatefulWidget {
  const MyWeeklyAssignmentMarksPage({super.key});

  @override
  _MyWeeklyAssignmentMarksPageState createState() =>
      _MyWeeklyAssignmentMarksPageState();
}

class _MyWeeklyAssignmentMarksPageState
    extends State<MyWeeklyAssignmentMarksPage> {
  final _apiService = ApiService();
  List<dynamic> _assignmentMarks = [];
  List<dynamic> _filteredAssignmentMarks = [];
  bool _isLoading = false;
  String _searchQuery = '';
  int _page = 1;
  int _totalPages = 1;
  final int _pageSize = 10;

  @override
  void initState() {
    super.initState();
    _fetchAssignmentMarks();
  }

  Future<void> _fetchAssignmentMarks({int page = 1}) async {
    setState(() => _isLoading = true);
    try {
      final response = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/students/myassignmentmarks',
        queryParameters: {
          'page': '$page',
          'pageSize': '$_pageSize',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (!mounted) return;
        setState(() {
          _assignmentMarks = data['assignmentMarks'] ?? [];
          _totalPages = data['totalPages'] ?? 1;
          _applySearchFilter();
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch assignment marks');
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    }
  }

  void _applySearchFilter() {
    setState(() {
      _filteredAssignmentMarks = _assignmentMarks.where((am) {
        final subjectName = am['subject']['name']?.toLowerCase() ?? '';
        final className = am['className']?.toLowerCase() ?? '';
        final assignmentTitle = am['assignment']['title']?.toLowerCase() ?? '';
        return subjectName.contains(_searchQuery.toLowerCase()) ||
            className.contains(_searchQuery.toLowerCase()) ||
            assignmentTitle.contains(_searchQuery.toLowerCase());
      }).toList();
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
    _fetchAssignmentMarks(page: value);
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
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF00c757)))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Container(
                    color: const Color(0xFF333333),
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      children: [
                        const Icon(Icons.search, color: Colors.white),
                        const SizedBox(width: 8),
                        Text(
                          'My Weekly Assignment Marks',
                          style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: TextField(
                            onChanged: _handleSearchChange,
                            decoration: InputDecoration(
                              hintText:
                                  'Search Subjects, Classes, or Assignments...',
                              hintStyle:
                                  GoogleFonts.poppins(color: Colors.white70),
                              filled: true,
                              fillColor: const Color(0xFF222222),
                              border: const OutlineInputBorder(),
                              prefixIcon: const Icon(Icons.search,
                                  color: Colors.white70),
                            ),
                            style: GoogleFonts.poppins(color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView(
                      children: [
                        Container(
                          color: const Color(0xFF333333),
                          padding: const EdgeInsets.all(8.0),
                          child: Row(
                            children: [
                              Expanded(
                                  flex: 1,
                                  child: Text('ID',
                                      style: GoogleFonts.poppins(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold))),
                              Expanded(
                                  flex: 2,
                                  child: Text('Class',
                                      style: GoogleFonts.poppins(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold))),
                              Expanded(
                                  flex: 2,
                                  child: Text('Subject',
                                      style: GoogleFonts.poppins(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold))),
                              Expanded(
                                  flex: 3,
                                  child: Text('Assignment',
                                      style: GoogleFonts.poppins(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold))),
                              Expanded(
                                  flex: 2,
                                  child: Text('Marks',
                                      style: GoogleFonts.poppins(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold))),
                              Expanded(
                                  flex: 2,
                                  child: Text('Submission Date',
                                      style: GoogleFonts.poppins(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold))),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),
                        if (_filteredAssignmentMarks.isEmpty)
                          Center(
                            child: Text(
                              'No assignment marks found.',
                              style: GoogleFonts.poppins(
                                  color: Colors.white, fontSize: 16),
                            ),
                          )
                        else
                          ..._filteredAssignmentMarks.map((am) => Card(
                                color: const Color(0xFF1e1e1e),
                                margin: const EdgeInsets.symmetric(vertical: 4),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.all(8.0),
                                  title: Row(
                                    children: [
                                      Expanded(
                                          flex: 1,
                                          child: Text(am['id'].toString(),
                                              style: GoogleFonts.poppins(
                                                  color: Colors.white))),
                                      Expanded(
                                          flex: 2,
                                          child: Text(am['className'] ?? 'N/A',
                                              style: GoogleFonts.poppins(
                                                  color: Colors.white))),
                                      Expanded(
                                          flex: 2,
                                          child: Text(
                                              am['subject']['name'] ?? 'N/A',
                                              style: GoogleFonts.poppins(
                                                  color: Colors.white))),
                                      Expanded(
                                          flex: 3,
                                          child: Text(
                                              am['assignment']['title'] ??
                                                  'N/A',
                                              style: GoogleFonts.poppins(
                                                  color: Colors.white))),
                                      Expanded(
                                          flex: 2,
                                          child: Text(
                                              '${am['marksObtained'] ?? 'N/A'}/${am['totalMarks'] ?? 'N/A'}',
                                              style: GoogleFonts.poppins(
                                                  color: Colors.white))),
                                      Expanded(
                                          flex: 2,
                                          child: Text(
                                              _formatDate(am['submissionDate']),
                                              style: GoogleFonts.poppins(
                                                  color: Colors.white))),
                                    ],
                                  ),
                                ),
                              )),
                      ],
                    ),
                  ),
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.chevron_left,
                              color: Colors.white),
                          onPressed: _page > 1
                              ? () => _handlePageChange(_page - 1)
                              : null,
                        ),
                        Text(
                          'Page $_page of $_totalPages',
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        IconButton(
                          icon: const Icon(Icons.chevron_right,
                              color: Colors.white),
                          onPressed: _page < _totalPages
                              ? () => _handlePageChange(_page + 1)
                              : null,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
