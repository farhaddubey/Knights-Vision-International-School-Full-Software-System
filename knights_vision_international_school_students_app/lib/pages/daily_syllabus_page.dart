import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants.dart';

class DailySyllabusPage extends StatefulWidget {
  final dynamic classSubject;
  final String className;

  const DailySyllabusPage({super.key, required this.classSubject, required this.className});

  @override
  _DailySyllabusPageState createState() => _DailySyllabusPageState();
}

class _DailySyllabusPageState extends State<DailySyllabusPage> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _syllabusSchedules = [];
  List<dynamic> _filteredSyllabusSchedules = [];
  bool _isLoading = false;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchSyllabusSchedules();
  }

  Future<void> _fetchSyllabusSchedules() async {
    setState(() => _isLoading = true);
    try {
      final token = await _storage.read(key: 'student_token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      print('Fetching syllabus schedules');
      print('Fetch URL: $BASE_URL/api/a1-knights-students-panel/SyllabusScheduleDailyPlan/syllabus-schedule?classSubjectId=${widget.classSubject['id']}');
      final response = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/SyllabusScheduleDailyPlan/syllabus-schedule?classSubjectId=${widget.classSubject['id']}'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Fetch response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _syllabusSchedules = data['schedules'] ?? [];
          _filteredSyllabusSchedules = _syllabusSchedules;
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch syllabus schedules: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching syllabus schedules: $e');
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
      _filteredSyllabusSchedules = _syllabusSchedules.where((s) {
        final topicTitle = s['topicTitle']?.toLowerCase() ?? '';
        final syllabusTopic = s['subjectSyllabus']?['topic']?.toLowerCase() ?? '';
        final instructionsStudents = s['instructions_for_students']?.toLowerCase() ?? '';
        final instructionsTeachers = s['instructions_for_teachers']?.toLowerCase() ?? '';
        final notes = s['notes']?.toLowerCase() ?? '';
        final homework = s['homeworkDescription']?.toLowerCase() ?? '';
        return topicTitle.contains(_searchQuery.toLowerCase()) ||
            syllabusTopic.contains(_searchQuery.toLowerCase()) ||
            instructionsStudents.contains(_searchQuery.toLowerCase()) ||
            instructionsTeachers.contains(_searchQuery.toLowerCase()) ||
            notes.contains(_searchQuery.toLowerCase()) ||
            homework.contains(_searchQuery.toLowerCase());
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
                'Syllabus for ${widget.classSubject['subject']['name'] ?? 'Unknown'} - ${widget.className}',
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
                  // Search Bar
                  Card(
                    color: const Color(0xFF111111),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 2.0),
                      child: TextField(
                        onChanged: _handleSearchChange,
                        decoration: InputDecoration(
                          hintText: 'Search Topics, Instructions, Notes, or Homework...',
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
                          Expanded(flex: 2, child: Text('Date\nTopic\nSyllabus Topic', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          Expanded(flex: 4, child: Text('Instructions\nCompleted\nHoliday', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          Expanded(flex: 5, child: Text('Notes\nHomework\nLinks', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ),
                    // Syllabus Schedules List
                    _filteredSyllabusSchedules.isEmpty
                        ? Center(
                      child: Text(
                        'No syllabus schedules found.',
                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                      ),
                    )
                        : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _filteredSyllabusSchedules.length,
                      itemBuilder: (context, index) {
                        final s = _filteredSyllabusSchedules[index];
                        return Card(
                          color: const Color(0xFF181818),
                          margin: const EdgeInsets.symmetric(vertical: 2),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Date: ${_formatDate(s['date'])}',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Topic: ${s['topicTitle'] ?? 'N/A'}',
                                  style: GoogleFonts.poppins(
                                    color: const Color(0xFF00c757),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Syllabus Topic: ${s['subjectSyllabus']?['topic'] ?? 'N/A'}',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Instructions for Students:',
                                  style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  s['instructions_for_students']?.split('\n').join('\n') ?? 'N/A',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Instructions for Teachers:',
                                  style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  s['instructions_for_teachers']?.split('\n').join('\n') ?? 'N/A',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Holiday: ${s['isHoliday'] ? 'Yes' : 'No'}',
                                      style: GoogleFonts.poppins(color: Colors.white),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: s['isCompleted'] ? const Color(0xFF00c757) : const Color(0xFFFFC107),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        s['isCompleted'] ? 'Completed' : 'Not Completed',
                                        style: GoogleFonts.poppins(color: Colors.black, fontWeight: FontWeight.w500),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Special Notes:',
                                  style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  s['notes']?.split('\n').join('\n') ?? 'N/A',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Homework:',
                                  style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  s['homeworkDescription']?.split('\n').join('\n') ?? 'N/A',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Homework Due Date: ${_formatDate(s['homeworkDueDate'])}',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                                if (s['articleLinks1'] != null) ...[
                                  const SizedBox(height: 4),
                                  InkWell(
                                    onTap: () => launchUrl(Uri.parse(s['articleLinks1'])),
                                    child: Text(
                                      'Article Link 1',
                                      style: GoogleFonts.poppins(color: const Color(0xFF00c757)),
                                    ),
                                  ),
                                ],
                                if (s['articleLinks2'] != null) ...[
                                  const SizedBox(height: 4),
                                  InkWell(
                                    onTap: () => launchUrl(Uri.parse(s['articleLinks2'])),
                                    child: Text(
                                      'Article Link 2',
                                      style: GoogleFonts.poppins(color: const Color(0xFF00c757)),
                                    ),
                                  ),
                                ],
                                if (s['videoLinks'] != null) ...[
                                  const SizedBox(height: 4),
                                  SizedBox(
                                    height: 100,
                                    child: InAppWebView(
                                      initialUrlRequest: URLRequest(
                                        url: WebUri('https://www.youtube.com/embed/${s['videoLinks'].split('v=')[1]?.split('&')[0]}'),
                                      ),
                                    ),
                                  ),
                                ],
                                if (s['videoLinks2'] != null) ...[
                                  const SizedBox(height: 4),
                                  SizedBox(
                                    height: 100,
                                    child: InAppWebView(
                                      initialUrlRequest: URLRequest(
                                        url: WebUri('https://www.youtube.com/embed/${s['videoLinks2'].split('v=')[1]?.split('&')[0]}'),
                                      ),
                                    ),
                                  ),
                                ],
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
