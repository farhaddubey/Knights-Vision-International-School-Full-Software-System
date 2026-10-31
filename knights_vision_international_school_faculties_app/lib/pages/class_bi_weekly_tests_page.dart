import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';
import 'package:sure_success_point_school_faculties_app/pages/tests_dialog.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../constants.dart';
class ClassBiWeeklyTestsPage extends StatefulWidget {
  const ClassBiWeeklyTestsPage({super.key});

  @override
  _ClassBiWeeklyTestsPageState createState() => _ClassBiWeeklyTestsPageState();
}

class _ClassBiWeeklyTestsPageState extends State<ClassBiWeeklyTestsPage> {
  final ApiService _apiService = ApiService();
  final _storage = const FlutterSecureStorage();
  List<dynamic> classSubjects = [];
  List<dynamic> filteredClassSubjects = [];
  String searchQuery = '';
  int page = 1;
  int totalPages = 1;
  bool isLoading = false;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchClassSubjects(page);
  }

  Future<void> fetchClassSubjects(int pageNum) async {
    setState(() {
      isLoading = true;
      error = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/class-subjects?page=$pageNum&pageSize=10'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['classSubjects'] is List) {
          setState(() {
            classSubjects = data['classSubjects'];
            filteredClassSubjects = classSubjects;
            totalPages = data['totalPages'] ?? 1;
            isLoading = false;
          });
        } else {
          throw Exception('Invalid response format');
        }
      } else {
        throw Exception('Failed to fetch class subjects: ${response.body}');
      }
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch class subjects: $e')),
      );
    }
  }

  void handleSearchChange(String query) {
    setState(() {
      searchQuery = query;
      filteredClassSubjects = classSubjects.where((cs) {
        final subjectName = cs['subject']['name'].toString().toLowerCase();
        final className = cs['className'].toString().toLowerCase();
        return subjectName.contains(query.toLowerCase()) || className.contains(query.toLowerCase());
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
      body: isLoading
          ? const Center(child: SpinKitCircle(color: Color(0xFF00c757), size: 120))
          : error != null
          ? Center(child: Text(error!, style: GoogleFonts.poppins(color: Colors.white)))
          : Column(
        children: [
          Container(
            color: const Color(0xFF333333),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.search, color: Colors.white),
                const SizedBox(width: 8),
                Text(
                  'My Classes Bi-Weekly Tests',
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                SizedBox(
                  width: 300,
                  child: TextField(
                    onChanged: handleSearchChange,
                    style: GoogleFonts.poppins(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Search Subjects or Classes...',
                      hintStyle: GoogleFonts.poppins(color: Colors.white70),
                      prefixIcon: const Icon(Icons.search, color: Colors.white),
                      filled: true,
                      fillColor: const Color(0xFF222222),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide: const BorderSide(color: Color(0xFF555555)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide: const BorderSide(color: Color(0xFF555555)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide: const BorderSide(color: Color(0xFF00c757)),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                children: [
                  Container(
                    color: const Color(0xFF333333),
                    padding: const EdgeInsets.all(8),
                    child: Row(
                      children: [
                        Expanded(flex: 1, child: Text('ID', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                        Expanded(flex: 2, child: Text('Class', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                        Expanded(flex: 2, child: Text('Subject', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                        Expanded(flex: 3, child: Text('Actions', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                      ],
                    ),
                  ),
                  Expanded(
                    child: filteredClassSubjects.isEmpty
                        ? Center(child: Text('No subjects found for your classes.', style: GoogleFonts.poppins(color: Colors.white)))
                        : ListView.builder(
                      itemCount: filteredClassSubjects.length,
                      itemBuilder: (context, index) {
                        final cs = filteredClassSubjects[index];
                        return Container(
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          color: const Color(0xFF1e1e1e),
                          child: ListTile(
                            onTap: () {
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
                            title: Row(
                              children: [
                                Expanded(flex: 1, child: Text('${cs['id']}', style: GoogleFonts.poppins(color: Colors.white))),
                                Expanded(flex: 2, child: Text(cs['className'], style: GoogleFonts.poppins(color: Colors.white))),
                                Expanded(flex: 2, child: Text(cs['subject']['name'], style: GoogleFonts.poppins(color: Colors.white))),
                                Expanded(
                                  flex: 3,
                                  child: ElevatedButton(
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
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.transparent,
                                      foregroundColor: const Color(0xFF00c757),
                                      side: const BorderSide(color: Color(0xFF00c757)),
                                    ),
                                    child: Text('Manage Tests', style: GoogleFonts.poppins()),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  Container(
                    margin: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.chevron_left, color: Colors.white),
                          onPressed: page > 1 ? () => handlePageChange(page - 1) : null,
                        ),
                        Text(
                          'Page $page of $totalPages',
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        IconButton(
                          icon: const Icon(Icons.chevron_right, color: Colors.white),
                          onPressed: page < totalPages ? () => handlePageChange(page + 1) : null,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}