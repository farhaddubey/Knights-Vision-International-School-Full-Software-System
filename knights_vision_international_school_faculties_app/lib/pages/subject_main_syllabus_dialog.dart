import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';
import 'package:webview_flutter/webview_flutter.dart';

class SubjectMainSyllabusDialog extends StatefulWidget {
  final bool open;
  final VoidCallback onClose;
  final dynamic selectedClassSubject;
  final List<dynamic> syllabusTopics;
  final bool syllabusLoading;
  final String className;

  const SubjectMainSyllabusDialog({
    super.key,
    required this.open,
    required this.onClose,
    required this.selectedClassSubject,
    required this.syllabusTopics,
    required this.syllabusLoading,
    required this.className,
  });

  @override
  _SubjectMainSyllabusDialogState createState() => _SubjectMainSyllabusDialogState();
}

class _SubjectMainSyllabusDialogState extends State<SubjectMainSyllabusDialog> {
  final ApiService _apiService = ApiService();
  List<dynamic> topics = [];
  bool loading = false;

  @override
  void initState() {
    super.initState();
    topics = widget.syllabusTopics;
    // No explicit platform configuration needed for webview_flutter 4.8.0+
    // Hybrid composition is enabled by default on Android
  }

  Future<void> _markAsCompleted(int id) async {
    setState(() {
      loading = true;
    });
    try {
      final success = await _apiService.markSyllabusTopicAsCompleted(id);
      if (success) {
        setState(() {
          topics = topics.map((t) => t['id'] == id ? {...t, 'isCompleted': true, 'completionDate': DateTime.now().toIso8601String()} : t).toList();
        });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Syllabus topic marked as completed')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to mark as completed: $e')));
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.only(top: 64, left: 280),
      backgroundColor: const Color(0xFF000000),
      child: Column(
        children: [
          Container(
            color: const Color(0xFF009688),
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                const Icon(Icons.calendar_today, color: Colors.white),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Main Syllabus for ${widget.selectedClassSubject?['subject']['name'] ?? 'Unknown'} - ${widget.className}',
                    style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00c757)),
                  child: Text('Create Syllabus Topic', style: GoogleFonts.poppins()),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: widget.onClose,
                  icon: const Icon(Icons.close, color: Colors.red),
                ),
              ],
            ),
          ),
          Expanded(
            child: widget.syllabusLoading || loading
                ? const Center(child: SpinKitCircle(color: Colors.green))
                : Column(
              children: [
                Container(
                  color: const Color(0xFF333333),
                  padding: const EdgeInsets.all(8),
                  child: Row(
                    children: [
                      Expanded(flex: 1, child: Text('ID', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                      Expanded(flex: 2, child: Text('Topic', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                      Expanded(flex: 2, child: Text('Completed', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                      Expanded(flex: 2, child: Text('Completion Date', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                      Expanded(flex: 5, child: Text('Lecture Content', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                      Expanded(flex: 1, child: Text('Action', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                    ],
                  ),
                ),
                Expanded(
                  child: topics.isEmpty
                      ? Center(child: Text('No syllabus topics found.', style: GoogleFonts.poppins(color: Colors.white)))
                      : ListView.builder(
                    itemCount: topics.length,
                    itemBuilder: (context, index) {
                      final topic = topics[index];
                      final lectureContent = topic['lectureContent'] ?? 'N/A';
                      final isYouTube = lectureContent.startsWith('https://') && (lectureContent.contains('youtube.com') || lectureContent.contains('youtu.be'));

                      // Create WebViewController for YouTube content
                      final controller = WebViewController()
                        ..setJavaScriptMode(JavaScriptMode.unrestricted)
                        ..loadRequest(Uri.parse(
                          isYouTube
                              ? 'https://www.youtube.com/embed/${lectureContent.split('v=')[1]?.split('&')[0] ?? lectureContent.split('/').last}'
                              : lectureContent,
                        ));

                      return Container(
                        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                        decoration: BoxDecoration(color: const Color(0xFF181818), borderRadius: BorderRadius.circular(4)),
                        child: Row(
                          children: [
                            Expanded(flex: 1, child: Padding(padding: const EdgeInsets.all(8), child: Text('${topic['id']}', style: GoogleFonts.poppins(color: Colors.white)))),
                            Expanded(flex: 2, child: Padding(padding: const EdgeInsets.all(8), child: Text(topic['topic'] ?? 'N/A', style: GoogleFonts.poppins(color: Colors.white)))),
                            Expanded(flex: 2, child: Padding(padding: const EdgeInsets.all(8), child: Text(topic['isCompleted'] ? 'Yes' : 'No', style: GoogleFonts.poppins(color: Colors.white)))),
                            Expanded(
                              flex: 2,
                              child: Padding(
                                padding: const EdgeInsets.all(8),
                                child: Text(
                                  topic['completionDate'] != null ? DateTime.parse(topic['completionDate']).toLocal().toString().substring(0, 10) : 'N/A',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                              ),
                            ),
                            Expanded(
                              flex: 5,
                              child: Padding(
                                padding: const EdgeInsets.all(8),
                                child: isYouTube
                                    ? SizedBox(
                                  height: 100,
                                  child: WebViewWidget(
                                    controller: controller,
                                  ),
                                )
                                    : Text(
                                  lectureContent.split('\n').join('\n'),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                              ),
                            ),
                            Expanded(
                              flex: 1,
                              child: ElevatedButton(
                                onPressed: topic['isCompleted'] ? null : () => _markAsCompleted(topic['id']),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: topic['isCompleted'] ? const Color(0xFF4caf50) : const Color(0xFFffc107),
                                  foregroundColor: topic['isCompleted'] ? Colors.white : Colors.black,
                                ),
                                child: Text('Mark as Completed', style: GoogleFonts.poppins()),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: ElevatedButton(
                    onPressed: widget.onClose,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    child: Text('Close', style: GoogleFonts.poppins()),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}