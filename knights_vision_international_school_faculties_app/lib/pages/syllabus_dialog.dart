import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';
import 'package:webview_flutter/webview_flutter.dart';

class SyllabusDialog extends StatefulWidget {
  final bool open;
  final VoidCallback onClose;
  final dynamic selectedClassSubject;
  final List<dynamic> syllabusSchedules;
  final bool syllabusLoading;
  final String className;

  const SyllabusDialog({
    super.key,
    required this.open,
    required this.onClose,
    required this.selectedClassSubject,
    required this.syllabusSchedules,
    required this.syllabusLoading,
    required this.className,
  });

  @override
  _SyllabusDialogState createState() => _SyllabusDialogState();
}

class _SyllabusDialogState extends State<SyllabusDialog> {
  final ApiService _apiService = ApiService();
  List<dynamic> schedules = [];
  bool loading = false;

  @override
  void initState() {
    super.initState();
    schedules = widget.syllabusSchedules;
  }

  Future<void> _markAsCompleted(int id) async {
    setState(() {
      loading = true;
    });
    try {
      final success = await _apiService.markSyllabusScheduleAsCompleted(id);
      if (success) {
        setState(() {
          schedules = schedules.map((s) => s['id'] == id ? {...s, 'isCompleted': true, 'completionDate': DateTime.now().toIso8601String()} : s).toList();
        });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Syllabus schedule marked as completed')));
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
                    'Syllabus for ${widget.selectedClassSubject?['subject']['name'] ?? 'Unknown'} - ${widget.className}',
                    style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00c757)),
                  child: Text('Create Syllabus', style: GoogleFonts.poppins()),
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
                      Expanded(flex: 2, child: Text('Date\nTopic\nSyllabus Topic', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                      Expanded(flex: 4, child: Text('Instructions\nIf Completed', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                      Expanded(flex: 5, child: Text('Homework\nArticle & Video Links', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                      Expanded(flex: 1, child: Text('Action', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                    ],
                  ),
                ),
                Expanded(
                  child: schedules.isEmpty
                      ? Center(child: Text('No syllabus schedules found.', style: GoogleFonts.poppins(color: Colors.white)))
                      : ListView.builder(
                    itemCount: schedules.length,
                    itemBuilder: (context, index) {
                      final schedule = schedules[index];
                      // Create WebViewController for videoLinks
                      final controller1 = WebViewController()
                        ..setJavaScriptMode(JavaScriptMode.unrestricted)
                        ..loadRequest(Uri.parse('https://www.youtube.com/embed/${schedule['videoLinks']?.split('v=')[1]?.split('&')[0] ?? ''}'));

                      // Create WebViewController for videoLinks2
                      final controller2 = WebViewController()
                        ..setJavaScriptMode(JavaScriptMode.unrestricted)
                        ..loadRequest(Uri.parse('https://www.youtube.com/embed/${schedule['videoLinks2']?.split('v=')[1]?.split('&')[0] ?? ''}'));

                      return Container(
                        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                        decoration: BoxDecoration(color: const Color(0xFF181818), borderRadius: BorderRadius.circular(4)),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 2,
                              child: Padding(
                                padding: const EdgeInsets.all(8),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(DateTime.parse(schedule['date']).toLocal().toString().substring(0, 10), style: GoogleFonts.poppins(color: Colors.white)),
                                    Text(schedule['topicTitle'] ?? 'N/A', style: GoogleFonts.poppins(color: Colors.white)),
                                    Text(schedule['subjectSyllabus']?['topic'] ?? 'N/A', style: GoogleFonts.poppins(color: Colors.white)),
                                  ],
                                ),
                              ),
                            ),
                            Expanded(
                              flex: 4,
                              child: Padding(
                                padding: const EdgeInsets.all(8),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Students: ${schedule['instructions_for_students']?.split('\n').join('\n') ?? 'N/A'}', style: GoogleFonts.poppins(color: Colors.white)),
                                    Text('Teachers: ${schedule['instructions_for_teachers']?.split('\n').join('\n') ?? 'N/A'}', style: GoogleFonts.poppins(color: Colors.white)),
                                    Text('Completed: ${schedule['isCompleted'] ? 'Yes' : 'No'}', style: GoogleFonts.poppins(color: Colors.white)),
                                    Text('Holiday: ${schedule['isHoliday'] ? 'Yes' : 'No'}', style: GoogleFonts.poppins(color: Colors.white)),
                                  ],
                                ),
                              ),
                            ),
                            Expanded(
                              flex: 5,
                              child: Padding(
                                padding: const EdgeInsets.all(8),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Notes: ${schedule['notes']?.split('\n').join('\n') ?? 'N/A'}', style: GoogleFonts.poppins(color: Colors.white)),
                                    Text('Homework: ${schedule['homeworkDescription']?.split('\n').join('\n') ?? 'N/A'}', style: GoogleFonts.poppins(color: Colors.white)),
                                    Text(
                                      'Due: ${schedule['homeworkDueDate'] != null ? DateTime.parse(schedule['homeworkDueDate']).toLocal().toString().substring(0, 10) : 'N/A'}',
                                      style: GoogleFonts.poppins(color: Colors.white),
                                    ),
                                    if (schedule['articleLinks1'] != null)
                                      GestureDetector(
                                        onTap: () {}, // Implement URL launch
                                        child: Text('Link 1', style: GoogleFonts.poppins(color: const Color(0xFF00c757))),
                                      ),
                                    if (schedule['articleLinks2'] != null)
                                      GestureDetector(
                                        onTap: () {}, // Implement URL launch
                                        child: Text('Link 2', style: GoogleFonts.poppins(color: const Color(0xFF00c757))),
                                      ),
                                    if (schedule['videoLinks'] != null)
                                      SizedBox(
                                        height: 100,
                                        child: WebViewWidget(
                                          controller: controller1,
                                        ),
                                      ),
                                    if (schedule['videoLinks2'] != null)
                                      SizedBox(
                                        height: 100,
                                        child: WebViewWidget(
                                          controller: controller2,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ),
                            Expanded(
                              flex: 1,
                              child: ElevatedButton(
                                onPressed: schedule['isCompleted'] ? null : () => _markAsCompleted(schedule['id']),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: schedule['isCompleted'] ? const Color(0xFF4caf50) : const Color(0xFFffc107),
                                  foregroundColor: schedule['isCompleted'] ? Colors.white : Colors.black,
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