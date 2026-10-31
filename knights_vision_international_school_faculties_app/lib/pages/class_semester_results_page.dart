import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'semester_result_dialog.dart';
import '../constants.dart';
class ClassSemesterResultsPage extends StatefulWidget {
  const ClassSemesterResultsPage({super.key});

  @override
  _ClassSemesterResultsPageState createState() => _ClassSemesterResultsPageState();
}

class _ClassSemesterResultsPageState extends State<ClassSemesterResultsPage> {
  final storage = const FlutterSecureStorage();
  List<dynamic> classSubjects = [];
  List<dynamic> filteredClassSubjects = [];
  String searchQuery = '';
  int page = 1;
  int totalPages = 1;
  bool isLoading = false;
  String? error;
  bool batchResultsDialogOpen = false;
  Map<String, dynamic> batchResults = {'classSubjectIds': [], 'semester': ''};

  @override
  void initState() {
    super.initState();
    fetchClassSubjects();
  }

  Future<void> fetchClassSubjects([int pageNum = 1]) async {
    setState(() {
      isLoading = true;
      error = null;
    });
    try {
      final token = await storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated.');
      }
      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/class-subjects?page=$pageNum&pageSize=10'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          classSubjects = data['classSubjects'] ?? [];
          filteredClassSubjects = classSubjects;
          totalPages = data['totalPages'] ?? 1;
          isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch class subjects: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        error = e.toString();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch class subjects: $e')),
      );
    }
  }

  void handleSearchChange(String query) {
    setState(() {
      searchQuery = query;
      filteredClassSubjects = classSubjects.where((cs) =>
      cs['subject']['name'].toLowerCase().contains(query.toLowerCase()) ||
          cs['className'].toLowerCase().contains(query.toLowerCase())).toList();
      page = 1;
    });
  }

  void handleBatchResultsChange(String field, dynamic value) {
    setState(() {
      batchResults[field] = value;
    });
  }

  Future<void> handleCreateBatchResults() async {
    if (batchResults['classSubjectIds'].isEmpty || batchResults['semester'].isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select at least one subject and a semester.')),
      );
      return;
    }
    setState(() => isLoading = true);
    try {
      final token = await storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated.');
      }
      final groupedByClass = batchResults['classSubjectIds'].fold<Map<String, List<dynamic>>>({}, (acc, id) {
        final subject = classSubjects.firstWhere((cs) => cs['id'] == id);
        final className = subject['className'].toLowerCase();
        if (!acc.containsKey(className)) {
          acc[className] = [];
        }
        acc[className]!.add({
          'classSubjectId': id,
          'classId': subject['classId'],
          'branchId': subject['branchId'],
          'schoolId': subject['schoolId'],
          'subjectId': subject['subjectId'],
          'semester': batchResults['semester'],
        });
        return acc;
      });

      for (var entry in groupedByClass.entries) {
        final response = await http.post(
          Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SemesterResults/${entry.key}/semester-results/batch'),
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({'classSubjects': entry.value}),
        );

        if (response.statusCode != 200) {
          throw Exception('Failed to create batch results for ${entry.key}: ${response.statusCode}');
        }
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Batch semester results initialized successfully.')),
      );
      setState(() {
        batchResultsDialogOpen = false;
        batchResults = {'classSubjectIds': [], 'semester': ''};
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to create batch results: $e')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFF009688),
        title: Row(
          children: [
            const Icon(Icons.search, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              'My Classes Semester Results',
              style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
      body: isLoading
          ? const Center(child: SpinKitCircle(color: Color(0xFF00c757), size: 120))
          : error != null
          ? Center(child: Text(error!, style: GoogleFonts.poppins(color: Colors.red)))
          : Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.search, color: Colors.white),
                      hintText: 'Search Subjects or Classes...',
                      hintStyle: GoogleFonts.poppins(color: Colors.white70),
                      border: const OutlineInputBorder(),
                      enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                      focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00c757))),
                    ),
                    style: GoogleFonts.poppins(color: Colors.white),
                    onChanged: handleSearchChange,
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () => setState(() => batchResultsDialogOpen = true),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00c757)),
                  child: Text('Create Batch Results', style: GoogleFonts.poppins(color: Colors.black)),
                ),
              ],
            ),
          ),
          Expanded(
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
                      ? Center(child: Text('No subjects found.', style: GoogleFonts.poppins(color: Colors.white)))
                      : ListView.builder(
                    itemCount: filteredClassSubjects.length,
                    itemBuilder: (context, index) {
                      final cs = filteredClassSubjects[index];
                      return Container(
                        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                        color: const Color(0xFF181818),
                        child: Row(
                          children: [
                            Expanded(flex: 1, child: Padding(padding: const EdgeInsets.all(8), child: Text(cs['id'].toString(), style: GoogleFonts.poppins(color: Colors.white)))),
                            Expanded(flex: 2, child: Padding(padding: const EdgeInsets.all(8), child: Text(cs['className'], style: GoogleFonts.poppins(color: Colors.white)))),
                            Expanded(flex: 2, child: Padding(padding: const EdgeInsets.all(8), child: Text(cs['subject']['name'], style: GoogleFonts.poppins(color: Colors.white)))),
                            Expanded(
                              flex: 3,
                              child: Padding(
                                padding: const EdgeInsets.all(8),
                                child: ElevatedButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => SemesterResultDialog(
                                          classSubject: cs,
                                          className: cs['className'],
                                          onClose: () => Navigator.pop(context),
                                        ),
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00c757)),
                                  child: Text('Manage Semester Results', style: GoogleFonts.poppins(color: Colors.black)),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      onPressed: page > 1 ? () => setState(() => page--) : null,
                      icon: const Icon(Icons.chevron_left, color: Colors.white),
                    ),
                    Text('Page $page of $totalPages', style: GoogleFonts.poppins(color: Colors.white)),
                    IconButton(
                      onPressed: page < totalPages ? () => setState(() => page++) : null,
                      icon: const Icon(Icons.chevron_right, color: Colors.white),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (batchResultsDialogOpen)
            Dialog(
              backgroundColor: const Color(0xFF181818),
              child: Container(
                padding: const EdgeInsets.all(16),
                width: 500,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Create Batch Semester Results', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    DropdownButton<String>(
                      value: batchResults['semester'],
                      hint: Text('Select Semester', style: GoogleFonts.poppins(color: Colors.white70)),
                      items: ['First', 'Second'].map((s) => DropdownMenuItem(value: s, child: Text(s, style: GoogleFonts.poppins(color: Colors.white)))).toList(),
                      onChanged: (value) => handleBatchResultsChange('semester', value!),
                      dropdownColor: const Color(0xFF333333),
                      style: GoogleFonts.poppins(color: Colors.white),
                      isExpanded: true,
                    ),
                    const SizedBox(height: 16),
                    Text('Select Subjects:', style: GoogleFonts.poppins(color: Colors.white)),
                    const SizedBox(height: 8),
                    Container(
                      height: 300,
                      child: ListView(
                        children: classSubjects.map((cs) => CheckboxListTile(
                          title: Text('${cs['className']} - ${cs['subject']['name']}', style: GoogleFonts.poppins(color: Colors.white)),
                          value: batchResults['classSubjectIds'].contains(cs['id']),
                          onChanged: (value) {
                            final ids = value!
                                ? [...batchResults['classSubjectIds'], cs['id']]
                                : batchResults['classSubjectIds'].where((id) => id != cs['id']).toList();
                            handleBatchResultsChange('classSubjectIds', ids);
                          },
                          checkColor: Colors.black,
                          activeColor: const Color(0xFF00c757),
                        )).toList(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        ElevatedButton(
                          onPressed: () => setState(() => batchResultsDialogOpen = false),
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                          child: Text('Cancel', style: GoogleFonts.poppins(color: Colors.white)),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: handleCreateBatchResults,
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00c757)),
                          child: Text('Create', style: GoogleFonts.poppins(color: Colors.black)),
                        ),
                      ],
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
