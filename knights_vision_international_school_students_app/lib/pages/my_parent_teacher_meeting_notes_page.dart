import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'view_parent_teacher_meeting_note_dialog.dart';
import '../constants.dart';

class MyParentTeacherMeetingNotesPage extends StatefulWidget {
  const MyParentTeacherMeetingNotesPage({super.key});

  @override
  _MyParentTeacherMeetingNotesPageState createState() => _MyParentTeacherMeetingNotesPageState();
}

class _MyParentTeacherMeetingNotesPageState extends State<MyParentTeacherMeetingNotesPage> {
  final _storage = const FlutterSecureStorage();
  bool _loading = false;
  String? _error;
  String _className = '';
  List<dynamic> _notes = [];
  List<dynamic> _filteredNotes = [];
  String _searchQuery = '';
  int _page = 1;
  int _totalPages = 1;
  bool _viewDialogOpen = false;
  dynamic _selectedNote;
  final int _pageSize = 10;
  final TextEditingController _searchController = TextEditingController();
  static const greenAccent = Color(0xFF00c757);

  @override
  void initState() {
    super.initState();
    _fetchNotes();
  }

  Future<void> _fetchNotes({int pageNum = 1, String search = ''}) async {
    setState(() {
      _loading = true;
      _searchQuery = search;
      _searchController.text = search;
    });
    final token = await _storage.read(key: 'student_token');
    if (token == null) {
      setState(() {
        _error = 'User not authenticated. Please log in.';
        _loading = false;
      });
      Fluttertoast.showToast(
        msg: 'User not authenticated. Please log in.',
        backgroundColor: Colors.red,
      );
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    try {
      print('Fetching notes for page: $pageNum, search: $search');
      print('Fetch URL: $BASE_URL/api/a1-knights-students-panel/students/myparentteachermeetingnotes?page=$pageNum&pageSize=$_pageSize&searchQuery=$search');
      final response = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/students/myparentteachermeetingnotes?page=$pageNum&pageSize=$_pageSize&searchQuery=$search'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Fetch response status: ${response.statusCode}');

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['notes'] is List) {
        setState(() {
          _notes = data['notes'].map((n) => {
            'id': n['id']?.toString().split('\n').join(' ') ?? 'N/A',
            'meetingDate': n['meetingDate']?.toString().split('\n').join(' ') ?? 'N/A',
            'guardianFeedback': n['guardianFeedback']?.toString().split('\n').join(' ') ?? 'N/A',
            'teacherName': n['teacherName']?.toString().split('\n').join(' ') ?? 'N/A',
            'guardianName': n['guardianName']?.toString().split('\n').join(' ') ?? 'N/A',
            'teacherFeedback': n['teacherFeedback']?.toString().split('\n').join(' ') ?? 'N/A',
            'additionalNotes': n['additionalNotes']?.toString().split('\n').join(' ') ?? 'N/A',
          }).toList();
          _filteredNotes = _notes;
          _totalPages = data['totalPages'] ?? 1;
          _className = data['className']?.toString().split('\n').join(' ') ?? '';
          _error = null;
          _loading = false;
        });
      } else {
        throw Exception('Invalid response format: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching notes: $e');
      print(stackTrace);
      setState(() {
        _error = 'Failed to fetch parent-teacher meeting notes: ${e.toString().replaceFirst('Exception: ', '')}';
        _loading = false;
      });
      Fluttertoast.showToast(
        msg: 'Failed to fetch parent-teacher meeting notes: ${e.toString().replaceFirst('Exception: ', '')}',
        backgroundColor: Colors.red,
      );
    }
  }

  void _handleSearchChange(String value) {
    setState(() {
      _searchQuery = value;
      _page = 1;
    });
    _fetchNotes(pageNum: 1, search: value);
    print('Search query: $value');
  }

  void _handlePageChange(int value) {
    setState(() => _page = value);
    _fetchNotes(pageNum: value, search: _searchQuery);
  }

  void _openViewDialog(dynamic note) {
    setState(() {
      _selectedNote = note;
      _viewDialogOpen = true;
      _searchQuery = '';
      _searchController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading && _notes.isEmpty) {
      return Scaffold(
        backgroundColor: const Color(0xFF181818),
        body: const Center(
          child: SpinKitCircle(color: greenAccent, size: 120),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF181818),
        body: Center(
          child: Text(
            _error!,
            style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
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
              // Sticky Header
              SliverAppBar(
                pinned: true,
                backgroundColor: const Color(0xFFb71c1c),
                flexibleSpace: FlexibleSpaceBar(
                  centerTitle: true,
                  title: Text(
                    'My Parent-Teacher Meeting Notes - Class $_className',
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
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Search Bar
                      SizedBox(
                        width: 200,
                        child: TextField(
                          controller: _searchController,
                          onChanged: _handleSearchChange,
                          decoration: InputDecoration(
                            hintText: 'Search Notes...',
                            hintStyle: GoogleFonts.poppins(color: Colors.white70),
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: const OutlineInputBorder(),
                            prefixIcon: const Icon(Icons.search, color: greenAccent),
                          ),
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Table Header
                      Container(
                        color: const Color(0xFF333333),
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            Expanded(flex: 1, child: Text('ID', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('Meeting Date', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 3, child: Text('Guardian Feedback', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('Action', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          ],
                        ),
                      ),
                      // Notes List
                      _filteredNotes.isEmpty
                          ? Center(
                        child: Text(
                          'No parent-teacher meeting notes found for this class.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                          : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _filteredNotes.length,
                        itemBuilder: (context, index) {
                          final note = _filteredNotes[index];
                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 2),
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'ID: ${note['id']}',
                                    style: GoogleFonts.poppins(
                                      color: greenAccent,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Meeting Date: ${DateTime.parse(note['meetingDate']).toLocal().toString().split('.')[0]}',
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Guardian Feedback: ${note['guardianFeedback']}',
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  OutlinedButton(
                                    onPressed: () => _openViewDialog(note),
                                    style: OutlinedButton.styleFrom(
                                      side: BorderSide(color: greenAccent),
                                      foregroundColor: greenAccent,
                                    ),
                                    child: Text('View', style: GoogleFonts.poppins()),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 8),
                      // Pagination Controls
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.chevron_left, color: greenAccent),
                            onPressed: _page > 1 ? () => _handlePageChange(_page - 1) : null,
                          ),
                          Text(
                            'Page $_page of $_totalPages',
                            style: GoogleFonts.poppins(color: Colors.white),
                          ),
                          IconButton(
                            icon: const Icon(Icons.chevron_right, color: greenAccent),
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
          // View Note Dialog
          if (_viewDialogOpen)
            ViewParentTeacherMeetingNoteDialog(
              open: _viewDialogOpen,
              onClose: () => setState(() => _viewDialogOpen = false),
              note: _selectedNote,
              className: _className,
            ),
        ],
      ),
    );
  }
}
