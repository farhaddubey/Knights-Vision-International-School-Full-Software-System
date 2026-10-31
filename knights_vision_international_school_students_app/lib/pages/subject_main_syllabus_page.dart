import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import '../constants.dart';

class SubjectMainSyllabusPage extends StatefulWidget {
  final dynamic classSubject;
  final String className;

  const SubjectMainSyllabusPage({super.key, required this.classSubject, required this.className});

  @override
  _SubjectMainSyllabusPageState createState() => _SubjectMainSyllabusPageState();
}

class _SubjectMainSyllabusPageState extends State<SubjectMainSyllabusPage> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _syllabusTopics = [];
  List<dynamic> _filteredSyllabusTopics = [];
  bool _isLoading = false;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchSyllabusTopics();
  }

  Future<void> _fetchSyllabusTopics() async {
    setState(() => _isLoading = true);
    try {
      final token = await _storage.read(key: 'student_token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      print('Fetching syllabus topics');
    print('Fetch URL: $BASE_URL/api/a1-knights-students-panel/SyllabusScheduleDailyPlan/subject-syllabus/${widget.classSubject['id']}');
      final response = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/SyllabusScheduleDailyPlan/subject-syllabus/${widget.classSubject['id']}'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Fetch response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _syllabusTopics = data['topics'] ?? [];
          _filteredSyllabusTopics = _syllabusTopics;
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch syllabus topics: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching syllabus topics: $e');
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
      _filteredSyllabusTopics = _syllabusTopics.where((t) {
        final topic = t['topic']?.toLowerCase() ?? '';
        final lectureContent = t['lectureContent']?.toLowerCase() ?? '';
        return topic.contains(_searchQuery.toLowerCase()) || lectureContent.contains(_searchQuery.toLowerCase());
      }).toList();
    });
  }

  void _handleSearchChange(String value) {
    setState(() {
      _searchQuery = value;
      _applySearchFilter();
    });
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
                'Main Syllabus for ${widget.classSubject['subject']['name'] ?? 'Unknown'} - ${widget.className}',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 16, // Reduced from 20
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
                  // Search Bar
                  Card(
                    color: const Color(0xFF111111),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 2.0),
                      child: TextField(
                        onChanged: _handleSearchChange,
                        decoration: InputDecoration(
                          hintText: 'Search Topics or Lecture Content...',
                          hintStyle: GoogleFonts.poppins(color: Colors.white70),
                          filled: true,
                          fillColor: const Color(0xFF333333),
                          border: const OutlineInputBorder(),
                          prefixIcon: const Icon(Icons.search, color: Colors.white70),
                        ),
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Loading Indicator
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator(color: Color(0xFF00c757)))
                  else ...[
                    // Table Header
                    Container(
                      color: const Color(0xFF333333),
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        children: [
                          Expanded(flex: 1, child: Text('ID', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          Expanded(flex: 2, child: Text('Topic', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          Expanded(flex: 2, child: Text('Status', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          Expanded(flex: 2, child: Text('Date', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          Expanded(flex: 5, child: Text('Lecture Content', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ),
                    // Syllabus Topics List
                    _filteredSyllabusTopics.isEmpty
                        ? Center(
                      child: Text(
                        'No syllabus topics found.',
                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                      ),
                    )
                        : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _filteredSyllabusTopics.length,
                      itemBuilder: (context, index) {
                        final t = _filteredSyllabusTopics[index];
                        return Card(
                          color: const Color(0xFF181818),
                          margin: const EdgeInsets.symmetric(vertical: 2),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'ID: ${t['id'].toString()}',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Topic: ${t['topic'] ?? 'N/A'}',
                                  style: GoogleFonts.poppins(
                                    color: const Color(0xFF00c757), // Green for topic
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      _formatDate(t['completionDate']),
                                      style: GoogleFonts.poppins(color: Colors.white),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: t['isCompleted'] ? const Color(0xFF00c757) : const Color(0xFFFFC107),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        t['isCompleted'] ? 'Completed' : 'Not Completed',
                                        style: GoogleFonts.poppins(color: Colors.black, fontWeight: FontWeight.w500),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Lecture Content:',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                t['lectureContent']?.startsWith('https://') ?? false
                                    ? SizedBox(
                                  height: 100,
                                  child: InAppWebView(
                                    initialUrlRequest: URLRequest(
                                      url: WebUri(t['lectureContent'].contains('youtube.com') || t['lectureContent'].contains('youtu.be')
                                          ? 'https://www.youtube.com/embed/${t['lectureContent'].split('v=')[1]?.split('&')[0] ?? t['lectureContent'].split('/').last}'
                                          : t['lectureContent']),
                                    ),
                                  ),
                                )
                                    : Text(
                                  t['lectureContent']?.split('\n').join('\n') ?? 'N/A',
                                  style: GoogleFonts.poppins(color: Colors.white),
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
