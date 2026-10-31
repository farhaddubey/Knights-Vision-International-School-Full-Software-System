import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';
import 'daily_homework_status_update_page.dart';
import 'class_monthly_homework_report_page.dart';

class ClassDailyHomeworkUpdateStatusPage extends StatefulWidget {
  const ClassDailyHomeworkUpdateStatusPage({super.key});

  @override
  _ClassDailyHomeworkUpdateStatusPageState createState() => _ClassDailyHomeworkUpdateStatusPageState();
}

class _ClassDailyHomeworkUpdateStatusPageState extends State<ClassDailyHomeworkUpdateStatusPage> {
  final ApiService _apiService = ApiService();
  List<dynamic> classSubjects = [];
  List<dynamic> filteredClassSubjects = [];
  String searchQuery = '';
  int page = 1;
  int totalPages = 1;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchClassSubjects();
  }

  Future<void> _fetchClassSubjects() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    try {
      final data = await _apiService.fetchClassSubjects(page, 10);
      setState(() {
        classSubjects = data?['classSubjects'] ?? [];
        filteredClassSubjects = classSubjects;
        totalPages = data?['totalPages'] ?? 1;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = 'Failed to fetch class subjects: $e';
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  void _filterSubjects(String query) {
    setState(() {
      searchQuery = query;
      filteredClassSubjects = classSubjects.where((cs) {
        final subjectName = cs['subject']['name']?.toLowerCase() ?? '';
        final className = cs['className']?.toLowerCase() ?? '';
        return subjectName.contains(query.toLowerCase()) || className.contains(query.toLowerCase());
      }).toList();
      page = 1;
    });
  }

  void _changePage(int newPage) {
    setState(() {
      page = newPage;
    });
    _fetchClassSubjects();
  }

  void _navigateToHomeworkPage(dynamic classSubject) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DailyHomeworkStatusUpdatePage(
          selectedClassSubject: classSubject,
          students: [],
          className: classSubject['className'] ?? '',
        ),
      ),
    ).then((_) => _fetchClassSubjects()); // Refresh data if needed
  }

  void _navigateToReportPage(dynamic classSubject) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ClassMonthlyHomeworkReportPage(
          classSubjectId: classSubject['id'],
          className: classSubject['className'],
          subjectName: classSubject['subject']['name'],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
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
                'My Classes Daily Homework',
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
                        onChanged: _filterSubjects,
                        decoration: InputDecoration(
                          hintText: 'Search Subjects or Classes...',
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
                  if (isLoading)
                    const Center(child: SpinKitCircle(color: Color(0xFF00c757)))
                  else if (error != null)
                    Center(child: Text(error!, style: GoogleFonts.poppins(color: Colors.red, fontSize: 16)))
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
                                'Class',
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
                                'Subject',
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
                      filteredClassSubjects.isEmpty
                          ? Center(
                        child: Text(
                          'No subjects found for your classes.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                          : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filteredClassSubjects.length,
                        itemBuilder: (context, index) {
                          final cs = filteredClassSubjects[index];
                          return Card(
                            color: const Color(0xFF181818),
                            margin: const EdgeInsets.symmetric(vertical: 2),
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        flex: 1,
                                        child: Text(
                                          cs['id'].toString(),
                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                        ),
                                      ),
                                      Expanded(
                                        flex: 2,
                                        child: Text(
                                          cs['className'] ?? 'N/A',
                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                        ),
                                      ),
                                      Expanded(
                                        flex: 2,
                                        child: Text(
                                          cs['subject']['name'] ?? 'N/A',
                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      OutlinedButton(
                                        onPressed: () => _navigateToHomeworkPage(cs),
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: const Color(0xFF00c757),
                                          side: const BorderSide(color: Color(0xFF00c757)),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(5),
                                          ),
                                        ),
                                        child: Text(
                                          'Manage Homework',
                                          style: GoogleFonts.poppins(fontSize: 12),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      OutlinedButton(
                                        onPressed: () => _navigateToReportPage(cs),
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: const Color(0xFFffeb3b),
                                          side: const BorderSide(color: Color(0xFFffeb3b)),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(5),
                                          ),
                                        ),
                                        child: Text(
                                          'View Monthly Report',
                                          style: GoogleFonts.poppins(fontSize: 12, color: Colors.yellow),
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
                      if (totalPages > 1)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.chevron_left, color: Colors.white),
                              onPressed: page > 1 ? () => _changePage(page - 1) : null,
                            ),
                            Text(
                              'Page $page of $totalPages',
                              style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                            ),
                            IconButton(
                              icon: const Icon(Icons.chevron_right, color: Colors.white),
                              onPressed: page < totalPages ? () => _changePage(page + 1) : null,
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