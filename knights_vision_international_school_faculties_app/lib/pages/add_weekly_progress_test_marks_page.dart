// class_bi_weekly_tests_page.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../constants.dart';
import 'tests_dialog.dart';

class ClassBiWeeklyTestsPage extends StatefulWidget {
  const ClassBiWeeklyTestsPage({super.key});

  @override
  _ClassBiWeeklyTestsPageState createState() => _ClassBiWeeklyTestsPageState();
}

class _ClassBiWeeklyTestsPageState extends State<ClassBiWeeklyTestsPage> {
  List<dynamic> classSubjects = [];
  List<dynamic> filteredClassSubjects = [];
  bool loading = false;
  String? error;
  String searchQuery = '';
  int page = 1;
  int totalPages = 1;
  final int pageSize = 10;
  final _storage = const FlutterSecureStorage();
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchClassSubjects(page);
  }

  Future<void> fetchClassSubjects(int pageNum) async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/class-subjects?page=$pageNum&pageSize=$pageSize'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Class Subjects Response: $data'); // Debug log
        if (data['classSubjects'] == null || data['classSubjects'] is! List) {
          throw Exception('Invalid response format');
        }
        setState(() {
          classSubjects = data['classSubjects'];
          filteredClassSubjects = classSubjects;
          totalPages = data['totalPages'] ?? 1;
          loading = false;
        });
      } else {
        throw Exception('Failed to fetch class subjects: ${response.statusCode}');
      }
    } catch (e) {
      print('Fetch Class Subjects Error: $e'); // Debug log
      setState(() {
        loading = false;
        error = e.toString().replaceFirst('Exception: ', '');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error ?? 'Failed to fetch class subjects')),
      );
    }
  }

  void handleSearchChange(String query) {
    setState(() {
      searchQuery = query.toLowerCase();
      filteredClassSubjects = classSubjects.where((cs) {
        final subjectName = cs['subject']['name']?.toLowerCase() ?? '';
        final className = cs['className']?.toLowerCase() ?? '';
        return subjectName.contains(searchQuery) || className.contains(searchQuery);
      }).toList();
      page = 1;
    });
  }

  void handlePageChange(int newPage) {
    setState(() {
      page = newPage;
    });
    fetchClassSubjects(newPage);
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
                'My Classes Bi-Weekly Tests',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 20,
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
                  TextField(
                    controller: _searchController,
                    onChanged: handleSearchChange,
                    style: GoogleFonts.poppins(color: Colors.white),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.search, color: Colors.white),
                      hintText: 'Search Subjects or Classes...',
                      hintStyle: GoogleFonts.poppins(color: Colors.white70),
                      filled: true,
                      fillColor: const Color(0xFF222222),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFF555555)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFF00c757)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (loading)
                    const Center(
                      child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
                    )
                  else if (error != null)
                    Center(
                      child: Text(
                        error!,
                        style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
                      ),
                    )
                  else ...[
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
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          '${cs['subject']['name']} (${cs['className']})',
                                          style: GoogleFonts.poppins(
                                            color: Colors.white,
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        'ID: ${cs['id']}',
                                        style: GoogleFonts.poppins(
                                          color: Colors.white70,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Subject: ${cs['subject']['name']}',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Class: ${cs['className']}',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      OutlinedButton(
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) => TestsDialog(
                                                classSubject: cs,
                                                className: cs['className'],
                                                onClose: () => Navigator.pop(context),
                                              ),
                                            ),
                                          );
                                        },
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: const Color(0xFF00c757),
                                          side: const BorderSide(color: Color(0xFF00c757)),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(5),
                                          ),
                                        ),
                                        child: Text(
                                          'Manage Tests',
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
                      const SizedBox(height: 16),
                      if (totalPages > 1)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            IconButton(
                              onPressed: page > 1 ? () => handlePageChange(page - 1) : null,
                              icon: const Icon(Icons.chevron_left, color: Colors.white),
                            ),
                            Text(
                              'Page $page of $totalPages',
                              style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                            ),
                            IconButton(
                              onPressed: page < totalPages ? () => handlePageChange(page + 1) : null,
                              icon: const Icon(Icons.chevron_right, color: Colors.white),
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