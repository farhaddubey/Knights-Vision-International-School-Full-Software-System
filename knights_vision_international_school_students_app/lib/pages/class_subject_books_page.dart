import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants.dart';
import 'view_books_dialog.dart';
import 'view_all_books_dialog.dart';

class ClassSubjectBooksPage extends StatefulWidget {
  const ClassSubjectBooksPage({super.key});

  @override
  _ClassSubjectBooksPageState createState() => _ClassSubjectBooksPageState();
}

class _ClassSubjectBooksPageState extends State<ClassSubjectBooksPage> {
  final _storage = const FlutterSecureStorage();

  bool _loading = true;
  String? _error;

  List<dynamic> _subjects = [];
  List<dynamic> _filteredSubjects = [];

  String _searchQuery = '';
  int _page = 1;
  int _totalPages = 1;

  bool _viewBooksDialogOpen = false;
  bool _viewAllBooksDialogOpen = false;

  String? _selectedClassSubjectId;
  String _selectedSubjectName = '';

  final int _academicYear = 2025;

  String? _classId;      // Nullable – will be set from API response
  String? _className;    // Nullable – will be set from API response

  final int _pageSize = 10;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchSubjects(_page);
  }

  Future<void> _fetchSubjects(int pageNum, {String search = ''}) async {
    if (!mounted) return;

    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 100));

    try {
      final token = await _storage.read(key: 'student_token');
      if (token == null) throw Exception('Please log in again');

      // Build URL safely – do NOT include classId if it's null (not needed for this endpoint)
      final url = Uri.parse(
        '$BASE_URL/api/a1-knights-students-panel/class-subjects'
            '?page=$pageNum&pageSize=$_pageSize&searchQuery=$search',
      );

      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode != 200) {
        throw Exception('Server error: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);

      if (data['classSubjects'] is! List) {
        throw Exception('Invalid response format');
      }

      final subjects = data['classSubjects'] as List<dynamic>;

      String? resolvedClassId;
      String? resolvedClassName;

      if (subjects.isNotEmpty) {
        final first = subjects.first;
        resolvedClassId = first['classId']?.toString();
        resolvedClassName = first['className']?.toString();
      }

      setState(() {
        _subjects = subjects;
        _filteredSubjects = subjects;
        _classId = resolvedClassId;
        _className = resolvedClassName ?? 'Unknown Class';
        _totalPages = data['totalPages'] ?? 1;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load subjects: ${e.toString()}';
        _loading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  void _handleSearchChange(String value) {
    setState(() {
      _searchQuery = value;
      _page = 1;
    });
    _fetchSubjects(1, search: value);
  }

  void _handlePageChange(int value) {
    setState(() => _page = value);
    _fetchSubjects(value, search: _searchQuery);
  }

  void _openViewBooksDialog(String classSubjectId, String subjectName) {
    setState(() {
      _selectedClassSubjectId = classSubjectId;
      _selectedSubjectName = subjectName;
      _viewBooksDialogOpen = true;
    });
  }

  void _openViewAllBooksDialog() {
    if (_classId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Class information is loading...')),
      );
      return;
    }
    setState(() => _viewAllBooksDialogOpen = true);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: const Color(0xFF181818),
        body: Center(
          child: SpinKitCircle(color: const Color(0xFF00C757), size: 120),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF181818),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              _error!,
              style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                backgroundColor: const Color(0xFFb71c1c),
                flexibleSpace: FlexibleSpaceBar(
                  centerTitle: true,
                  title: Text(
                    'Subject Books - Class ${_className ?? 'Loading...'}',
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
                actions: [
                  IconButton(
                    icon: const Icon(Icons.book, color: Color(0xFF00C757)),
                    onPressed: _classId != null ? _openViewAllBooksDialog : null,
                    tooltip: 'View All Books',
                  ),
                ],
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      // Search
                      Container(
                        constraints: const BoxConstraints(maxWidth: 500),
                        child: TextField(
                          controller: _searchController,
                          onChanged: _handleSearchChange,
                          style: GoogleFonts.poppins(color: Colors.white),
                          decoration: InputDecoration(
                            prefixIcon: const Icon(Icons.search, color: Colors.white),
                            hintText: 'Search Subjects...',
                            hintStyle: GoogleFonts.poppins(color: Colors.white70),
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(4)),
                            enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                            focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00C853))),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Header
                      Container(
                        color: const Color(0xFF333333),
                        padding: const EdgeInsets.all(8),
                        child: Row(
                          children: [
                            Expanded(flex: 1, child: Text('ID', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('Subject', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('Description', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('Actions', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          ],
                        ),
                      ),

                      // Subjects List
                      _filteredSubjects.isNotEmpty
                          ? ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _filteredSubjects.length,
                        itemBuilder: (context, index) {
                          final subject = _filteredSubjects[index];

                          // Safe access to nested subject data
                          final subjectData = subject['subject'] as Map<String, dynamic>?;
                          final subjectName = subjectData?['name']?.toString() ?? 'Unknown Subject';
                          final subjectDesc = subjectData?['description']?.toString() ?? 'N/A';

                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 2),
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Row(
                                children: [
                                  Expanded(flex: 1, child: Text(subject['id'].toString(), style: GoogleFonts.poppins(color: Colors.white))),
                                  Expanded(flex: 2, child: Text(subjectName, style: GoogleFonts.poppins(color: Colors.white))),
                                  Expanded(flex: 2, child: Text(subjectDesc, style: GoogleFonts.poppins(color: Colors.white))),
                                  Expanded(
                                    flex: 2,
                                    child: OutlinedButton(
                                      onPressed: () => _openViewBooksDialog(
                                        subject['id'].toString(),
                                        subjectName,
                                      ),
                                      style: OutlinedButton.styleFrom(
                                        side: const BorderSide(color: Color(0xFF00C757)),
                                        foregroundColor: const Color(0xFF00C757),
                                      ),
                                      child: Text('View Books', style: GoogleFonts.poppins()),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      )
                          : Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Text(
                          'No subjects found.',
                          style: GoogleFonts.poppins(color: Colors.white70, fontSize: 18),
                          textAlign: TextAlign.center,
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Pagination
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.chevron_left, color: Colors.white),
                            onPressed: _page > 1 ? () => _handlePageChange(_page - 1) : null,
                          ),
                          Text('Page $_page of $_totalPages', style: GoogleFonts.poppins(color: Colors.white)),
                          IconButton(
                            icon: const Icon(Icons.chevron_right, color: Colors.white),
                            onPressed: _page < _totalPages ? () => _handlePageChange(_page + 1) : null,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Per-subject dialog
          if (_viewBooksDialogOpen)
            ViewBooksDialog(
              open: _viewBooksDialogOpen,
              onClose: () => setState(() => _viewBooksDialogOpen = false),
              classSubjectId: _selectedClassSubjectId,
              subjectName: _selectedSubjectName,
              classId: _classId, // Can be null, but ViewBooksDialog should handle it
            ),

          // All books dialog – only open if classId is available
          if (_viewAllBooksDialogOpen && _classId != null)
            ViewAllBooksDialog(
              open: _viewAllBooksDialogOpen,
              onClose: () => setState(() => _viewAllBooksDialogOpen = false),
              classId: _classId!,           // Safe ! because we checked above
              className: _className ?? 'Unknown Class',
              academicYear: _academicYear,
            ),
        ],
      ),
    );
  }
}