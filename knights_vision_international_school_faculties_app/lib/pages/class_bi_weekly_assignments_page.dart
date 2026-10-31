import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import '../constants.dart';
import 'assignments_dialog.dart';

class ClassSubject {
  final int id;
  final String className;
  final String subjectName;
  final int subjectId;
  final int classId; // Added classId

  ClassSubject({
    required this.id,
    required this.className,
    required this.subjectName,
    required this.subjectId,
    required this.classId,
  });

  factory ClassSubject.fromJson(Map<String, dynamic> json) {
    return ClassSubject(
      id: json['id'] ?? 0,
      className: json['className'] ?? 'N/A',
      subjectName: json['subject']['name'] ?? 'N/A',
      subjectId: json['subjectId'] ?? 0,
      classId: json['classId'] ?? 0, // Parse classId
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'className': className,
    'subject': {'name': subjectName},
    'subjectId': subjectId,
    'classId': classId, // Include classId
  };
}

class ClassSubjectViewModel extends ChangeNotifier {
  List<ClassSubject> classSubjects = [];
  List<ClassSubject> filteredClassSubjects = [];
  bool isLoading = false;
  String searchQuery = '';
  int page = 1;
  int totalPages = 1;
  final int pageSize = 10;
  final _storage = const FlutterSecureStorage();

  Future<void> fetchClassSubjects({required int page}) async {
    isLoading = true;
    notifyListeners();

    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/class-subjects?page=$page&pageSize=$pageSize'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Class Subjects Response: $data'); // Debug log
        if (data['classSubjects'] == null) throw Exception('Invalid response format');
        classSubjects = (data['classSubjects'] as List<dynamic>)
            .map((item) => ClassSubject.fromJson(item))
            .toList();
        totalPages = data['totalPages'] ?? 1;
        this.page = page;
        applySearchFilter();
      } else {
        throw Exception('Failed to fetch class subjects: ${response.statusCode}');
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void applySearchFilter() {
    filteredClassSubjects = classSubjects.where((cs) {
      final subjectName = cs.subjectName.toLowerCase();
      final className = cs.className.toLowerCase();
      return subjectName.contains(searchQuery.toLowerCase()) ||
          className.contains(searchQuery.toLowerCase());
    }).toList();
    notifyListeners();
  }

  void handleSearchChange(String value) {
    searchQuery = value;
    page = 1;
    applySearchFilter();
  }

  void handlePageChange(int value) {
    page = value;
    fetchClassSubjects(page: value);
  }
}

class ClassBiWeeklyAssignmentsPage extends StatefulWidget {
  const ClassBiWeeklyAssignmentsPage({super.key});

  @override
  _ClassBiWeeklyAssignmentsPageState createState() =>
      _ClassBiWeeklyAssignmentsPageState();
}

class _ClassBiWeeklyAssignmentsPageState
    extends State<ClassBiWeeklyAssignmentsPage> {
  final _viewModel = ClassSubjectViewModel();

  @override
  void initState() {
    super.initState();
    _viewModel.fetchClassSubjects(page: 1);
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: _viewModel,
      child: Consumer<ClassSubjectViewModel>(
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
                      'My Classes Bi-Weekly Assignments',
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
                        Card(
                          color: const Color(0xFF111111),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 0, vertical: 2.0),
                            child: TextField(
                              onChanged: viewModel.handleSearchChange,
                              decoration: InputDecoration(
                                hintText: 'Search Subjects or Classes...',
                                hintStyle:
                                GoogleFonts.poppins(color: Colors.white70),
                                filled: true,
                                fillColor: const Color(0xFF333333),
                                border:
                                const OutlineInputBorder(borderSide: BorderSide.none),
                                prefixIcon:
                                const Icon(Icons.search, color: Colors.white70),
                              ),
                              style: GoogleFonts.poppins(color: Colors.white),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        if (viewModel.isLoading)
                          const Center(
                            child: SpinKitCircle(
                                color: Color(0xFF00c757), size: 120),
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
                                Expanded(
                                  flex: 3,
                                  child: Text(
                                    'Actions',
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
                          viewModel.filteredClassSubjects.isEmpty
                              ? Center(
                            child: Text(
                              'No subjects found for your classes.',
                              style: GoogleFonts.poppins(
                                  color: Colors.white, fontSize: 16),
                            ),
                          )
                              : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: viewModel.filteredClassSubjects.length,
                            itemBuilder: (context, index) {
                              final cs = viewModel.filteredClassSubjects[index];
                              return Card(
                                color: const Color(0xFF1e1e1e),
                                margin: const EdgeInsets.symmetric(vertical: 2),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            flex: 1,
                                            child: Text(
                                              cs.id.toString(),
                                              style: GoogleFonts.poppins(
                                                  color: Colors.white,
                                                  fontSize: 12),
                                            ),
                                          ),
                                          Expanded(
                                            flex: 2,
                                            child: Text(
                                              cs.className,
                                              style: GoogleFonts.poppins(
                                                  color: Colors.white,
                                                  fontSize: 12),
                                            ),
                                          ),
                                          Expanded(
                                            flex: 2,
                                            child: Text(
                                              cs.subjectName,
                                              style: GoogleFonts.poppins(
                                                  color: Colors.white,
                                                  fontSize: 12),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment:
                                        MainAxisAlignment.end,
                                        children: [
                                          OutlinedButton(
                                            onPressed: () {
                                              if (cs.id == 0 ||
                                                  cs.classId == 0) {
                                                Fluttertoast.showToast(
                                                  msg:
                                                  'Invalid class subject or class ID',
                                                  backgroundColor: Colors.red,
                                                );
                                                return;
                                              }
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) =>
                                                      AssignmentsDialog(
                                                        selectedClassSubject:
                                                        cs.toJson(),
                                                        className: cs.className,
                                                        onClose: () =>
                                                            Navigator.pop(context),
                                                      ),
                                                ),
                                              );
                                            },
                                            style: OutlinedButton.styleFrom(
                                              foregroundColor:
                                              const Color(0xFF00c757),
                                              side: const BorderSide(
                                                  color: Color(0xFF00c757)),
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                BorderRadius.circular(5),
                                              ),
                                            ),
                                            child: Text(
                                              'Manage Assignments',
                                              style: GoogleFonts.poppins(
                                                  fontSize: 12),
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
                          if (viewModel.totalPages > 1)
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.chevron_left,
                                      color: Colors.white),
                                  onPressed: viewModel.page > 1
                                      ? () =>
                                      viewModel.handlePageChange(viewModel.page - 1)
                                      : null,
                                ),
                                Text(
                                  'Page ${viewModel.page} of ${viewModel.totalPages}',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white, fontSize: 14),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.chevron_right,
                                      color: Colors.white),
                                  onPressed: viewModel.page < viewModel.totalPages
                                      ? () =>
                                      viewModel.handlePageChange(viewModel.page + 1)
                                      : null,
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
        },
      ),
    );
  }
}