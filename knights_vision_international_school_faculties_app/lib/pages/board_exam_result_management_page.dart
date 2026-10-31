import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'board_exams_dialog.dart';
import '../constants.dart';


class BoardExamResultManagementPage extends StatefulWidget {
  const BoardExamResultManagementPage({super.key});

  @override
  _BoardExamResultManagementPageState createState() => _BoardExamResultManagementPageState();
}

class _BoardExamResultManagementPageState extends State<BoardExamResultManagementPage> {
  final storage = const FlutterSecureStorage();
  List<dynamic> subjects = [];
  List<dynamic> filteredSubjects = [];
  String selectedMonth = 'November';
  int academicYear = 2025;
  bool isLoading = true;
  String? error;
  String searchQuery = '';
  final List<String> monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  @override
  void initState() {
    super.initState();
    fetchSubjects();
  }

  Future<void> fetchSubjects() async {
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
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/class-subjects?page=1&pageSize=100'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          subjects = data['classSubjects'] ?? [];
          filteredSubjects = subjects;
          isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch subjects: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        error = e.toString();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch subjects: $e')),
      );
    }
  }

  void handleSearchChange(String query) {
    setState(() {
      searchQuery = query;
      filteredSubjects = subjects.where((s) =>
      s['subject']['name'].toLowerCase().contains(query.toLowerCase()) ||
          s['className'].toLowerCase().contains(query.toLowerCase())).toList();
    });
  }

  Future<void> handleGeneratePDF() async {
    if (subjects.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a subject to generate PDF.')),
      );
      return;
    }
    try {
      final token = await storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated.');
      }
      final monthIndex = monthNames.indexOf(selectedMonth) + 1;
      final className = subjects[0]['className'].toLowerCase();
      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/classes/$className/board-exam-results/data?classId=${subjects[0]['classId']}&academicYear=$academicYear&month=$monthIndex'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final pdf = pw.Document();
        pdf.addPage(
          pw.Page(
            pageFormat: PdfPageFormat.a4,
            build: (pw.Context context) {
              return pw.Column(
                children: [
                  pw.Text('Sure Success Point School', style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
                  pw.Text('Board Exam Results - ${subjects[0]['className']} ($academicYear, $selectedMonth)', style: const pw.TextStyle(fontSize: 12)),
                  pw.Divider(),
                  pw.Table(
                    border: pw.TableBorder.all(),
                    children: [
                      pw.TableRow(
                        children: [
                          pw.Text('Student Name', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                          ...data['subjects'].map((subject) => [
                            pw.Text(subject['subject']['name'], style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                            pw.Text('W', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                            pw.Text('O', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                            pw.Text('T', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                          ]).expand((e) => e).toList(),
                        ],
                      ),
                      ...data['students'].map((student) {
                        return pw.TableRow(
                          children: [
                            pw.Text(student['name']),
                            ...data['subjects'].map((subject) {
                              final exam = data['boardExams'].firstWhere(
                                    (e) => e['classSubjectId'] == subject['id'],
                                orElse: () => null,
                              );
                              if (exam == null) {
                                return [pw.Text('-'), pw.Text('-'), pw.Text('-')];
                              }
                              final result = exam['BoardExamResult'].firstWhere(
                                    (r) => r['studentId'] == student['id'],
                                orElse: () => null,
                              );
                              return result != null
                                  ? [
                                pw.Text(result['writtenMarks'].toStringAsFixed(1)),
                                pw.Text(result['oralMarks'].toStringAsFixed(1)),
                                pw.Text(result['totalMarks'].toStringAsFixed(1)),
                              ]
                                  : [pw.Text('-'), pw.Text('-'), pw.Text('-')];
                            }).expand((e) => e).toList(),
                          ],
                        );
                      }).toList(),
                    ],
                  ),
                ],
              );
            },
          ),
        );
        await Printing.sharePdf(
          bytes: await pdf.save(),
          filename: 'board_exam_results_${subjects[0]['className']}_${academicYear}_$selectedMonth.pdf',
        );
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('PDF generated successfully.')),
        );
      } else {
        throw Exception('Failed to generate PDF: ${response.statusCode}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to generate PDF: $e')),
      );
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
            const Icon(Icons.edit, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              'Board Exam Result Management',
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
                DropdownButton<String>(
                  value: selectedMonth,
                  items: monthNames.map((month) => DropdownMenuItem(value: month, child: Text(month, style: GoogleFonts.poppins(color: Colors.white)))).toList(),
                  onChanged: (value) => setState(() => selectedMonth = value!),
                  dropdownColor: const Color(0xFF333333),
                  style: GoogleFonts.poppins(color: Colors.white),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  width: 100,
                  child: TextField(
                    decoration: InputDecoration(
                      labelText: 'Year',
                      labelStyle: GoogleFonts.poppins(color: Colors.white70),
                      border: const OutlineInputBorder(),
                      enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                      focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00c757))),
                    ),
                    style: GoogleFonts.poppins(color: Colors.white),
                    keyboardType: TextInputType.number,
                    onChanged: (value) => setState(() => academicYear = int.parse(value)),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: fetchSubjects,
                  icon: const Icon(Icons.refresh, color: Color(0xFF00c757)),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: handleGeneratePDF,
                  icon: const Icon(Icons.download, color: Colors.black),
                  label: Text('Download PDF', style: GoogleFonts.poppins(color: Colors.black)),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00c757)),
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
                      Expanded(flex: 2, child: Text('Action', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                    ],
                  ),
                ),
                Expanded(
                  child: filteredSubjects.isEmpty
                      ? Center(child: Text('No subjects found.', style: GoogleFonts.poppins(color: Colors.white)))
                      : ListView.builder(
                    itemCount: filteredSubjects.length,
                    itemBuilder: (context, index) {
                      final subject = filteredSubjects[index];
                      return Container(
                        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                        color: const Color(0xFF181818),
                        child: Row(
                          children: [
                            Expanded(flex: 1, child: Padding(padding: const EdgeInsets.all(8), child: Text(subject['id'].toString(), style: GoogleFonts.poppins(color: Colors.white)))),
                            Expanded(flex: 2, child: Padding(padding: const EdgeInsets.all(8), child: Text(subject['className'], style: GoogleFonts.poppins(color: Colors.white)))),
                            Expanded(flex: 2, child: Padding(padding: const EdgeInsets.all(8), child: Text(subject['subject']['name'], style: GoogleFonts.poppins(color: Colors.white)))),
                            Expanded(
                              flex: 2,
                              child: Padding(
                                padding: const EdgeInsets.all(8),
                                child: ElevatedButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => BoardExamsDialog(
                                          classSubject: subject,
                                          className: subject['className'],
                                          academicYear: academicYear,
                                          month: selectedMonth,
                                          onClose: () => Navigator.pop(context),
                                        ),
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00c757)),
                                  child: Text('Manage', style: GoogleFonts.poppins(color: Colors.black)),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
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