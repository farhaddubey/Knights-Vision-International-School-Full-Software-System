import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:provider/provider.dart';
import '../constants.dart';

class SyllabusTopic {
  final int id;
  final String topic;
  final String? completionDate;
  final bool isCompleted;
  final String? lectureContent;

  SyllabusTopic({
    required this.id,
    required this.topic,
    this.completionDate,
    required this.isCompleted,
    this.lectureContent,
  });

  factory SyllabusTopic.fromJson(Map<String, dynamic> json) {
    return SyllabusTopic(
      id: json['id'] ?? 0,
      topic: json['topic'] ?? 'N/A',
      completionDate: json['completionDate'],
      isCompleted: json['isCompleted'] ?? false,
      lectureContent: json['lectureContent'],
    );
  }
}

class SyllabusViewModel extends ChangeNotifier {
  List<SyllabusTopic> syllabusTopics = [];
  List<SyllabusTopic> filteredSyllabusTopics = [];
  bool isLoading = false;
  String searchQuery = '';
  final _storage = const FlutterSecureStorage();

Future<void> fetchSyllabusTopics(int classSubjectId) async {
    isLoading = true;
    notifyListeners();

    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

    print('Fetching syllabus topics: classSubjectId=$classSubjectId');
      final response = await http.get(
      Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SyllabusScheduleDailyPlan/subject-syllabus/$classSubjectId'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Response status: ${response.statusCode}, body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        syllabusTopics = (data['topics'] as List<dynamic>)
            .map((item) => SyllabusTopic.fromJson(item))
            .toList();
        applySearchFilter();
      } else {
        throw Exception('Failed to fetch syllabus topics: ${response.statusCode}');
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

      print('Marking topic as completed: id=$id');
      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SubjectSyllabus/completed/$id'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Response status: ${response.statusCode}, body: ${response.body}');

      if (response.statusCode == 200) {
        syllabusTopics = syllabusTopics.map((t) {
          if (t.id == id) {
            return SyllabusTopic(
              id: t.id,
              topic: t.topic,
              completionDate: DateTime.now().toIso8601String(),
              isCompleted: true,
              lectureContent: t.lectureContent,
            );
          }
          return t;
        }).toList();
        applySearchFilter();
        Fluttertoast.showToast(
          msg: 'Syllabus topic marked as completed',
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
    filteredSyllabusTopics = syllabusTopics.where((t) {
      final topic = t.topic.toLowerCase();
      final lectureContent = t.lectureContent?.toLowerCase() ?? '';
      return topic.contains(searchQuery.toLowerCase()) || lectureContent.contains(searchQuery.toLowerCase());
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

class SubjectMainSyllabusPage extends StatefulWidget {
  final Map<String, dynamic> classSubject;
  final String className;

  const SubjectMainSyllabusPage({super.key, required this.classSubject, required this.className});

  @override
  _SubjectMainSyllabusPageState createState() => _SubjectMainSyllabusPageState();
}

class _SubjectMainSyllabusPageState extends State<SubjectMainSyllabusPage> {
  final _viewModel = SyllabusViewModel();

  @override
  void initState() {
    super.initState();
  _viewModel.fetchSyllabusTopics(widget.classSubject['id']);
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
                      'Main Syllabus for $subjectName - $className',
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
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 2.0),
                            child: TextField(
                              onChanged: viewModel.handleSearchChange,
                              decoration: InputDecoration(
                                hintText: 'Search Topics or Lecture Content...',
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
                          const Center(
                            child: CircularProgressIndicator(color: Color(0xFF00c757)),
                          )
                        else ...[
                          Container(
                            color: const Color(0xFF333333),
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 1,
                                  child: Text(
                                    'ID',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    'Topic',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    'Status',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    'Date',
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
                                    'Lecture Content',
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
                          viewModel.filteredSyllabusTopics.isEmpty
                              ? Center(
                            child: Text(
                              'No syllabus topics found.',
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontSize: 16,
                              ),
                            ),
                          )
                              : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: viewModel.filteredSyllabusTopics.length,
                            itemBuilder: (context, index) {
                              final t = viewModel.filteredSyllabusTopics[index];
                              return Card(
                                color: const Color(0xFF181818),
                                margin: const EdgeInsets.symmetric(vertical: 2),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'ID: ${t.id.toString()}',
                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Topic: ${t.topic}',
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF00c757),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            viewModel.formatDate(t.completionDate),
                                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                            decoration: BoxDecoration(
                                              color: t.isCompleted ? const Color(0xFF00c757) : const Color(0xFFFFC107),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              t.isCompleted ? 'Completed' : 'Not Completed',
                                              style: GoogleFonts.poppins(color: Colors.black, fontWeight: FontWeight.w500, fontSize: 12),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Lecture Content:',
                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                      ),
                                      t.lectureContent?.startsWith('https://') ?? false
                                          ? SizedBox(
                                        height: 100,
                                        child: InAppWebView(
                                          initialUrlRequest: URLRequest(
                                            url: WebUri(
                                              t.lectureContent!.contains('youtube.com') || t.lectureContent!.contains('youtu.be')
                                                  ? 'https://www.youtube.com/embed/${t.lectureContent!.split('v=')[1].split('&')[0]}'
                                                  : t.lectureContent!,
                                            ),
                                          ),
                                        ),
                                      )
                                          : Text(
                                        t.lectureContent?.split('\n').join('\n') ?? 'N/A',
                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          ElevatedButton(
                                            onPressed: t.isCompleted
                                                ? null
                                                : () => viewModel.markAsCompleted(t.id),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: t.isCompleted
                                                  ? const Color(0xFF4caf50)
                                                  : const Color(0xFFFFC107),
                                              foregroundColor: t.isCompleted ? Colors.white : Colors.black,
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(5),
                                              ),
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
