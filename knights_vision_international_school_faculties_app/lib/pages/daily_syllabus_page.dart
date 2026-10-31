import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants.dart';

class SyllabusSchedule {
  final String? date;
  final String? topicTitle;
  final String? syllabusTopic;
  final String? instructionsForStudents;
  final String? instructionsForTeachers;
  final bool isHoliday;
  final bool isCompleted;
  final String? notes;
  final String? homeworkDescription;
  final String? homeworkDueDate;
  final String? articleLinks1;
  final String? articleLinks2;
  final String? videoLinks;
  final String? videoLinks2;
  final int id;

  SyllabusSchedule({
    required this.id,
    this.date,
    this.topicTitle,
    this.syllabusTopic,
    this.instructionsForStudents,
    this.instructionsForTeachers,
    required this.isHoliday,
    required this.isCompleted,
    this.notes,
    this.homeworkDescription,
    this.homeworkDueDate,
    this.articleLinks1,
    this.articleLinks2,
    this.videoLinks,
    this.videoLinks2,
  });

  factory SyllabusSchedule.fromJson(Map<String, dynamic> json) {
    return SyllabusSchedule(
      id: json['id'] ?? 0,
      date: json['date'],
      topicTitle: json['topicTitle'],
      syllabusTopic: json['subjectSyllabus']?['topic'],
      instructionsForStudents: json['instructions_for_students'],
      instructionsForTeachers: json['instructions_for_teachers'],
      isHoliday: json['isHoliday'] ?? false,
      isCompleted: json['isCompleted'] ?? false,
      notes: json['notes'],
      homeworkDescription: json['homeworkDescription'],
      homeworkDueDate: json['homeworkDueDate'],
      articleLinks1: json['articleLinks1'],
      articleLinks2: json['articleLinks2'],
      videoLinks: json['videoLinks'],
      videoLinks2: json['videoLinks2'],
    );
  }
}

class SyllabusViewModel extends ChangeNotifier {
  List<SyllabusSchedule> syllabusSchedules = [];
  List<SyllabusSchedule> filteredSyllabusSchedules = [];
  bool isLoading = false;
  String searchQuery = '';
  final _storage = const FlutterSecureStorage();

  Future<void> fetchSyllabusSchedules(int classSubjectId) async {
    isLoading = true;
    notifyListeners();

    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      print('Fetching syllabus schedules: classSubjectId=$classSubjectId');
      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SyllabusScheduleDailyPlan/syllabus-schedule?classSubjectId=$classSubjectId'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Response status: ${response.statusCode}, body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        syllabusSchedules = (data['schedules'] as List<dynamic>)
            .map((item) => SyllabusSchedule.fromJson(item))
            .toList();
        applySearchFilter();
      } else {
        throw Exception('Failed to fetch syllabus schedules: ${response.statusCode}');
      }
    } catch (e) {
      print('Error: $e');
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAsCompleted(int id) async {
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      print('Marking schedule as completed: id=$id');
      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SyllabusScheduleDailyPlan/completed/$id'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Response status: ${response.statusCode}, body: ${response.body}');

      if (response.statusCode == 200) {
        syllabusSchedules = syllabusSchedules.map((s) {
          if (s.id == id) {
            return SyllabusSchedule(
              id: s.id,
              date: s.date,
              topicTitle: s.topicTitle,
              syllabusTopic: s.syllabusTopic,
              instructionsForStudents: s.instructionsForStudents,
              instructionsForTeachers: s.instructionsForTeachers,
              isHoliday: s.isHoliday,
              isCompleted: true,
              notes: s.notes,
              homeworkDescription: s.homeworkDescription,
              homeworkDueDate: s.homeworkDueDate,
              articleLinks1: s.articleLinks1,
              articleLinks2: s.articleLinks2,
              videoLinks: s.videoLinks,
              videoLinks2: s.videoLinks2,
            );
          }
          return s;
        }).toList();
        applySearchFilter();
        Fluttertoast.showToast(
          msg: 'Syllabus schedule marked as completed',
          backgroundColor: const Color(0xFF00c757),
        );
      } else {
        throw Exception('Failed to mark as completed: ${response.statusCode}');
      }
    } catch (e) {
      print('Error: $e');
      Fluttertoast.showToast(
        msg: 'Failed to mark as completed',
        backgroundColor: Colors.red,
      );
    } finally {
      notifyListeners();
    }
  }

  void applySearchFilter() {
    filteredSyllabusSchedules = syllabusSchedules.where((s) {
      final topicTitle = s.topicTitle?.toLowerCase() ?? '';
      final syllabusTopic = s.syllabusTopic?.toLowerCase() ?? '';
      final instructionsStudents = s.instructionsForStudents?.toLowerCase() ?? '';
      final instructionsTeachers = s.instructionsForTeachers?.toLowerCase() ?? '';
      final notes = s.notes?.toLowerCase() ?? '';
      final homework = s.homeworkDescription?.toLowerCase() ?? '';
      return topicTitle.contains(searchQuery.toLowerCase()) ||
          syllabusTopic.contains(searchQuery.toLowerCase()) ||
          instructionsStudents.contains(searchQuery.toLowerCase()) ||
          instructionsTeachers.contains(searchQuery.toLowerCase()) ||
          notes.contains(searchQuery.toLowerCase()) ||
          homework.contains(searchQuery.toLowerCase());
    }).toList();
    notifyListeners();
  }

  void handleSearchChange(String value) {
    searchQuery = value;
    applySearchFilter();
  }

  String formatDate(String? date) {
    if (date == null) return 'N/A';
    try {
      final parsedDate = DateTime.parse(date);
      return '${parsedDate.day.toString().padLeft(2, '0')}/${parsedDate.month.toString().padLeft(2, '0')}/${parsedDate.year}';
    } catch (e) {
      return 'N/A';
    }
  }
}

class DailySyllabusPage extends StatefulWidget {
  final Map<String, dynamic> classSubject;
  final String className;

  const DailySyllabusPage({super.key, required this.classSubject, required this.className});

  @override
  _DailySyllabusPageState createState() => _DailySyllabusPageState();
}

class _DailySyllabusPageState extends State<DailySyllabusPage> {
  final _viewModel = SyllabusViewModel();

  @override
  void initState() {
    super.initState();
    _viewModel.fetchSyllabusSchedules(widget.classSubject['id']);
  }

  @override
  Widget build(BuildContext context) {
    final subjectName = widget.classSubject['subject']?['name'] ?? 'Unknown';
    final className = widget.className;

    return ChangeNotifierProvider.value(
      value: _viewModel,
      child: Consumer<SyllabusViewModel>(
        builder: (context, viewModel, child) {
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
                      'Syllabus for $subjectName - $className',
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
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        Card(
                          color: const Color(0xFF111111),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 2.0),
                            child: TextField(
                              onChanged: viewModel.handleSearchChange,
                              decoration: InputDecoration(
                                hintText: 'Search Topics, Instructions, Notes, or Homework...',
                                hintStyle: GoogleFonts.poppins(color: Colors.white70),
                                filled: true,
                                fillColor: const Color(0xFF333333),
                                border: const OutlineInputBorder(borderSide: BorderSide.none),
                                prefixIcon: const Icon(Icons.search, color: Colors.white70),
                              ),
                              style: GoogleFonts.poppins(color: Colors.white),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        if (viewModel.isLoading)
                          const Center(child: CircularProgressIndicator(color: Color(0xFF00c757)))
                        else ...[
                          Container(
                            color: const Color(0xFF333333),
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    'Date\nTopic\nSyllabus Topic',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 4,
                                  child: Text(
                                    'Instructions\nCompleted\nHoliday',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 5,
                                  child: Text(
                                    'Notes\nHomework\nLinks',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          viewModel.filteredSyllabusSchedules.isEmpty
                              ? Center(
                            child: Text(
                              'No syllabus schedules found.',
                              style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                            ),
                          )
                              : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: viewModel.filteredSyllabusSchedules.length,
                            itemBuilder: (context, index) {
                              final s = viewModel.filteredSyllabusSchedules[index];
                              return Card(
                                color: const Color(0xFF181818),
                                margin: const EdgeInsets.symmetric(vertical: 2),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Date: ${viewModel.formatDate(s.date)}',
                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Topic: ${s.topicTitle ?? 'N/A'}',
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF00c757),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Syllabus Topic: ${s.syllabusTopic ?? 'N/A'}',
                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Instructions for Students:',
                                        style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                      ),
                                      Text(
                                        s.instructionsForStudents?.split('\n').join('\n') ?? 'N/A',
                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Instructions for Teachers:',
                                        style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                      ),
                                      Text(
                                        s.instructionsForTeachers?.split('\n').join('\n') ?? 'N/A',
                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            'Holiday: ${s.isHoliday ? 'Yes' : 'No'}',
                                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                            decoration: BoxDecoration(
                                              color: s.isCompleted ? const Color(0xFF00c757) : const Color(0xFFFFC107),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              s.isCompleted ? 'Completed' : 'Not Completed',
                                              style: GoogleFonts.poppins(color: Colors.black, fontWeight: FontWeight.w500, fontSize: 12),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Special Notes:',
                                        style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                      ),
                                      Text(
                                        s.notes?.split('\n').join('\n') ?? 'N/A',
                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Homework:',
                                        style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                      ),
                                      Text(
                                        s.homeworkDescription?.split('\n').join('\n') ?? 'N/A',
                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Homework Due Date: ${viewModel.formatDate(s.homeworkDueDate)}',
                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                      ),
                                      if (s.articleLinks1 != null) ...[
                                        const SizedBox(height: 4),
                                        InkWell(
                                          onTap: () => launchUrl(Uri.parse(s.articleLinks1!)),
                                          child: Text(
                                            'Article Link 1',
                                            style: GoogleFonts.poppins(color: const Color(0xFF00c757), fontSize: 12),
                                          ),
                                        ),
                                      ],
                                      if (s.articleLinks2 != null) ...[
                                        const SizedBox(height: 4),
                                        InkWell(
                                          onTap: () => launchUrl(Uri.parse(s.articleLinks2!)),
                                          child: Text(
                                            'Article Link 2',
                                            style: GoogleFonts.poppins(color: const Color(0xFF00c757), fontSize: 12),
                                          ),
                                        ),
                                      ],
                                      if (s.videoLinks != null) ...[
                                        const SizedBox(height: 4),
                                        SizedBox(
                                          height: 100,
                                          child: InAppWebView(
                                            initialUrlRequest: URLRequest(
                                              url: WebUri('https://www.youtube.com/embed/${s.videoLinks!.split('v=')[1]?.split('&')[0]}'),
                                            ),
                                          ),
                                        ),
                                      ],
                                      if (s.videoLinks2 != null) ...[
                                        const SizedBox(height: 4),
                                        SizedBox(
                                          height: 100,
                                          child: InAppWebView(
                                            initialUrlRequest: URLRequest(
                                              url: WebUri('https://www.youtube.com/embed/${s.videoLinks2!.split('v=')[1]?.split('&')[0]}'),
                                            ),
                                          ),
                                        ),
                                      ],
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          ElevatedButton(
                                            onPressed: s.isCompleted
                                                ? null
                                                : () => viewModel.markAsCompleted(s.id),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: s.isCompleted ? const Color(0xFF4caf50) : const Color(0xFFFFC107),
                                              foregroundColor: s.isCompleted ? Colors.white : Colors.black,
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                                            ),
                                            child: Text(
                                              'Mark as Completed',
                                              style: GoogleFonts.poppins(fontSize: 12),
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
        },
      ),
    );
  }
}