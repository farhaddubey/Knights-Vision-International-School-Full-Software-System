import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'dart:io';
import '../api_service.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';

class StudentAssignmentsPage extends StatefulWidget {
  final int assignmentId;
  final String assignmentTitle;
  final String className;
  final int classId;
  final int classSubjectId;

  const StudentAssignmentsPage({
    super.key,
    required this.assignmentId,
    required this.assignmentTitle,
    required this.className,
    required this.classId,
    required this.classSubjectId,
  });

  @override
  _StudentAssignmentsPageState createState() => _StudentAssignmentsPageState();
}

class _StudentAssignmentsPageState extends State<StudentAssignmentsPage> {
  final _apiService = ApiService();
  List<dynamic> _studentAssignments = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchStudentAssignments();
  }

  Future<void> _fetchStudentAssignments() async {
    setState(() => _isLoading = true);
    try {
      final response = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/students/myassignments',
        queryParameters: {'classSubjectId': '${widget.classSubjectId}'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final assignments = data['assignments'] is List
            ? data['assignments'] as List
            : const [];
        final assignment = assignments.cast<dynamic>().firstWhere(
              (entry) => entry['id'] == widget.assignmentId,
              orElse: () => <String, dynamic>{},
            );
        final submissions = assignment['StudentAssignment'] is List
            ? assignment['StudentAssignment'] as List
            : const [];
        final submission = submissions.isNotEmpty && submissions.first is Map
            ? submissions.first as Map
            : const <String, dynamic>{};
        setState(() {
          _studentAssignments = [
            {
              'student': {'firstName': 'My', 'lastName': 'Submission'},
              'isSubmitted': submission['isSubmitted'] == true,
              'submittedAt': submission['submittedAt'],
              'marksObtained': submission['marksObtained'],
              'remarks': submission['remarks'],
              'qualityTag': submission['qualityTag'],
            }
          ];
          _isLoading = false;
        });
      } else {
        throw ApiException('Unable to load your assignment submission.',
            statusCode: response.statusCode);
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: 'Failed to fetch student assignments',
        backgroundColor: Colors.red,
      );
    }
  }

  Future<void> _generatePDF() async {
    try {
      final now = DateTime.now();
      final monthYear =
          DateFormat('MMMM yyyy').format(now); // e.g., "August 2025"

      final pdf = pw.Document();
      final font = pw.Font.helvetica();
      final boldFont = pw.Font.helveticaBold();

      pdf.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4, // from pdf.dart
          margin: pw.EdgeInsets.all(10),
          build: (pw.Context context) {
            return [
              // Header
              pw.Center(
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.center,
                  children: [
                    pw.Text(
                      'Sure Success Point School',
                      style: pw.TextStyle(
                        font: boldFont,
                        fontSize: 20,
                        color: PdfColor.fromHex('#003087'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'Institution of Humanism, Hardwork, Discipline, Technology & Excellence',
                      style: pw.TextStyle(
                        font: boldFont,
                        fontSize: 10,
                        color: PdfColor.fromHex('#333333'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.Text(
                      'www.sspointschool.in | Powered by Knights (KiREAD) Group',
                      style: pw.TextStyle(
                        font: font,
                        fontSize: 10,
                        color: PdfColor.fromHex('#333333'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'ASSIGNMENT REPORT',
                      style: pw.TextStyle(
                        font: boldFont,
                        fontSize: 12,
                        color: PdfColor.fromHex('#000000'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'Class: ${widget.className} | Assignment: ${widget.assignmentTitle} | Month: $monthYear',
                      style: pw.TextStyle(
                        font: font,
                        fontSize: 10,
                        color: PdfColor.fromHex('#000000'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 8),
                  ],
                ),
              ),

              // Table
              pw.Table(
                border: pw.TableBorder.all(
                  color: PdfColor.fromHex('#000000'),
                  width: 0.1,
                ),
                columnWidths: {
                  0: const pw.FlexColumnWidth(2),
                  1: const pw.FlexColumnWidth(1),
                  2: const pw.FlexColumnWidth(1),
                  3: const pw.FlexColumnWidth(2),
                  4: const pw.FlexColumnWidth(1),
                },
                children: [
                  // Header row
                  pw.TableRow(
                    decoration: pw.BoxDecoration(
                      color: PdfColor.fromHex('#009688'),
                    ),
                    children: [
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(4),
                        child: pw.Text(
                          'Student',
                          style: pw.TextStyle(
                            font: boldFont,
                            fontSize: 10,
                            color: PdfColor.fromHex('#FFFFFF'),
                          ),
                        ),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(4),
                        child: pw.Text(
                          'Submitted',
                          style: pw.TextStyle(
                            font: boldFont,
                            fontSize: 10,
                            color: PdfColor.fromHex('#FFFFFF'),
                          ),
                        ),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(4),
                        child: pw.Text(
                          'Marks (0-3)',
                          style: pw.TextStyle(
                            font: boldFont,
                            fontSize: 10,
                            color: PdfColor.fromHex('#FFFFFF'),
                          ),
                        ),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(4),
                        child: pw.Text(
                          'Remarks',
                          style: pw.TextStyle(
                            font: boldFont,
                            fontSize: 10,
                            color: PdfColor.fromHex('#FFFFFF'),
                          ),
                        ),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(4),
                        child: pw.Text(
                          'Quality Tag',
                          style: pw.TextStyle(
                            font: boldFont,
                            fontSize: 10,
                            color: PdfColor.fromHex('#FFFFFF'),
                          ),
                        ),
                      ),
                    ],
                  ),
                  // Data rows
                  ...List.generate(_studentAssignments.length, (index) {
                    final sa = _studentAssignments[index];
                    final isOdd = index % 2 == 1;
                    return pw.TableRow(
                      decoration: pw.BoxDecoration(
                        color: isOdd
                            ? PdfColor.fromHex('#F0F0F0')
                            : PdfColor.fromHex('#FFFFFF'),
                      ),
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            '${sa['student']?['firstName'] ?? ''} ${sa['student']?['lastName'] ?? ''}'
                                .trim(),
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            (sa['isSubmitted'] == true) ? 'Yes' : 'No',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            sa['marksObtained'] != null
                                ? sa['marksObtained'].toString()
                                : '-',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            sa['remarks'] ?? '-',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            sa['qualityTag'] ?? 'None',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                      ],
                    );
                  }),
                ],
              ),

              // Footer
              pw.SizedBox(height: 8),
              pw.Align(
                alignment: pw.Alignment.centerLeft,
                child: pw.Text(
                  'Generated on: ${DateFormat('yyyy-MM-dd').format(now)}',
                  style: pw.TextStyle(font: font, fontSize: 8),
                ),
              ),
            ];
          },
        ),
      );

      final output = await getTemporaryDirectory();
      final file = File('${output.path}/assignment_${widget.assignmentId}.pdf');
      await file.writeAsBytes(await pdf.save());
      await OpenFile.open(file.path);
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Failed to generate or open PDF: ${e.toString()}',
        backgroundColor: Colors.red,
      );
    }
  }

  String _formatDate(String? date) {
    if (date == null) return 'N/A';
    try {
      final parsedDate = DateTime.parse(date);
      return '${parsedDate.day}/${parsedDate.month}/${parsedDate.year}';
    } catch (e) {
      return 'N/A';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: CustomScrollView(
        slivers: [
          // Sticky Header
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFFb71c1c),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                'My Submission - ${widget.assignmentTitle}',
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
            actions: [
              IconButton(
                icon: const Icon(Icons.download, color: Color(0xFF00c757)),
                onPressed: _generatePDF,
              ),
            ],
          ),
          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Loading Indicator
                  if (_isLoading)
                    const Center(
                        child:
                            CircularProgressIndicator(color: Color(0xFF00c757)))
                  else ...[
                    // Table Header
                    Container(
                      color: const Color(0xFF333333),
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        children: [
                          Expanded(
                              flex: 2,
                              child: Text('Record',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 1,
                              child: Text('Submitted',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 1,
                              child: Text('Marks (0-3)',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('Remarks',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 1,
                              child: Text('Quality Tag',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ),
                    // Student Assignments List
                    _studentAssignments.isEmpty
                        ? Center(
                            child: Text(
                              'No submission record has been published.',
                              style: GoogleFonts.poppins(
                                  color: Colors.white, fontSize: 16),
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _studentAssignments.length,
                            itemBuilder: (context, index) {
                              final sa = _studentAssignments[index];
                              return Card(
                                color: const Color(0xFF1e1e1e),
                                margin: const EdgeInsets.symmetric(vertical: 2),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'My submission',
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF00c757),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Submitted: ${sa['isSubmitted'] ? 'Yes' : 'No'}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Marks: ${sa['marksObtained']?.toString() ?? '-'}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Remarks: ${sa['remarks'] ?? '-'}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Quality Tag: ${sa['qualityTag'] ?? 'None'}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
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
  }
}

extension on DateTime {
  String get monthName {
    const names = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    return names[month - 1];
  }
}
