import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'board_exams_page.dart';
import '../constants.dart';

class MyKWBMTPSResultsPage extends StatefulWidget {
  const MyKWBMTPSResultsPage({super.key});

  @override
  _MyKWBMTPSResultsPageState createState() => _MyKWBMTPSResultsPageState();
}

class _MyKWBMTPSResultsPageState extends State<MyKWBMTPSResultsPage> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _subjects = [];
  List<dynamic> _filteredSubjects = [];
  bool _isLoading = true;
  String _searchQuery = '';
  int _page = 1;
  int _totalPages = 1;
  String _selectedMonth = 'November';
  int _academicYear = 2025;
  final int _pageSize = 20;
  final List<String> _monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  @override
  void initState() {
    super.initState();
    _fetchSubjects();
  }

  Future<void> _fetchSubjects({int page = 1}) async {
    setState(() => _isLoading = true);
    try {
      final token = await _storage.read(key: 'student_token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      print('Fetching class subjects');
      print(
          'Fetch URL: $BASE_URL/api/a1-knights-students-panel/class-subjects?page=$page&pageSize=$_pageSize');
      final response = await http.get(
        Uri.parse(
            '$BASE_URL/api/a1-knights-students-panel/class-subjects?page=$page&pageSize=$_pageSize'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Fetch response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _subjects = data['classSubjects'] ?? [];
          _totalPages = data['totalPages'] ?? 1;
          _applySearchFilter();
          _isLoading = false;
        });
      } else {
        throw Exception(
            'Failed to fetch class subjects: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching class subjects: $e');
      print(stackTrace);
      setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    }
  }

  void _applySearchFilter() {
    setState(() {
      _filteredSubjects = _subjects.where((s) {
        final subjectName = s['subject']['name']?.toLowerCase() ?? '';
        final className = s['className']?.toLowerCase() ?? '';
        return subjectName.contains(_searchQuery.toLowerCase()) ||
            className.contains(_searchQuery.toLowerCase());
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
    _fetchSubjects(page: value);
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
                'My Board Exam Results',
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
                  // Search Bar, Month Dropdown, and Academic Year
                  Card(
                    color: const Color(0xFF111111),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8.0, vertical: 2.0),
                      child: Column(
                        children: [
                          TextField(
                            onChanged: _handleSearchChange,
                            decoration: InputDecoration(
                              hintText: 'Search Subjects or Classes...',
                              hintStyle:
                                  GoogleFonts.poppins(color: Colors.white70),
                              filled: true,
                              fillColor: const Color(0xFF333333),
                              border: const OutlineInputBorder(),
                              prefixIcon: const Icon(Icons.search,
                                  color: Colors.white70),
                            ),
                            style: GoogleFonts.poppins(color: Colors.white),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: DropdownButton<String>(
                                  value: _selectedMonth,
                                  dropdownColor: const Color(0xFF333333),
                                  isExpanded: true,
                                  items: _monthNames.map((month) {
                                    return DropdownMenuItem<String>(
                                      value: month,
                                      child: Text(month,
                                          style: GoogleFonts.poppins(
                                              color: Colors.white)),
                                    );
                                  }).toList(),
                                  onChanged: (value) =>
                                      setState(() => _selectedMonth = value!),
                                ),
                              ),
                              const SizedBox(width: 8),
                              SizedBox(
                                width: 150,
                                child: TextField(
                                  keyboardType: TextInputType.number,
                                  decoration: InputDecoration(
                                    labelText: 'Academic Year',
                                    labelStyle: GoogleFonts.poppins(
                                        color: Colors.white70),
                                    filled: true,
                                    fillColor: const Color(0xFF333333),
                                    border: const OutlineInputBorder(),
                                  ),
                                  style:
                                      GoogleFonts.poppins(color: Colors.white),
                                  onChanged: (value) => setState(() =>
                                      _academicYear =
                                          int.tryParse(value) ?? _academicYear),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
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
                              child: Text('Subject Name',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 1,
                              child: Text('Action',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ),
                    // Subjects List
                    _filteredSubjects.isEmpty
                        ? Center(
                            child: Text(
                              'No subjects found for your classes.',
                              style: GoogleFonts.poppins(
                                  color: Colors.white, fontSize: 16),
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
                                margin: const EdgeInsets.symmetric(vertical: 2),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'ID: ${subject['id'].toString()}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Class: ${subject['className'] ?? 'N/A'}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Subject: ${subject['subject']['name'] ?? 'N/A'}',
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF00c757),
                                          fontWeight: FontWeight.bold,
                                        ),
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
                                                      BoardExamsPage(
                                                    classSubjectId:
                                                        subject['id'],
                                                    className:
                                                        subject['className'] ??
                                                            '',
                                                    subjectName:
                                                        subject['subject']
                                                                ['name'] ??
                                                            '',
                                                    academicYear: _academicYear,
                                                    month: _selectedMonth,
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
                                              'View My Results',
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
                    const SizedBox(height: 8),
                    // Pagination
                    Row(
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
