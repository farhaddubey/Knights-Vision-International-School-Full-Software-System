// test_marks_view_dialog.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../constants.dart';

class TestMarksViewDialog extends StatefulWidget {
  final dynamic test;
  final List<dynamic> students;
  final String className;
  final VoidCallback onClose;

  const TestMarksViewDialog({
    super.key,
    required this.test,
    required this.students,
    required this.className,
    required this.onClose,
  });

  @override
  _TestMarksViewDialogState createState() => _TestMarksViewDialogState();
}

class _TestMarksViewDialogState extends State<TestMarksViewDialog> {
  List<Map<String, dynamic>> testMarks = [];
  bool isLoading = false;
  String? errorMessage;
  final _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    if (widget.test != null) {
      fetchTestMarks(widget.test['id']);
    }
  }

  Future<void> fetchTestMarks(int testId) async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/Tests/${widget.className.toLowerCase()}/test-marks?testId=$testId'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Test Marks Response: $data'); // Debug log
        final existingTestMarks = data['testMarks'] ?? [];

        final mergedTestMarks = widget.students.map((student) {
          final existing = existingTestMarks.firstWhere(
                (tm) => tm['studentId'] == student['id'],
            orElse: () => null,
          );
          return {
            'studentId': student['id'],
            'studentName': '${student['firstName']} ${student['lastName'] ?? ''}'.trim(),
            'marks': existing != null ? existing['marks']?.toString() ?? '-' : '-',
            'maxMarks': existing != null ? existing['maxMarks'] ?? 30 : 30,
            'remarks': existing != null ? existing['remarks'] ?? '-' : '-',
          };
        }).toList();

        setState(() {
          testMarks = mergedTestMarks;
          isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch test marks: ${response.statusCode}');
      }
    } catch (e) {
      print('Fetch Test Marks Error: $e'); // Debug log
      setState(() {
        isLoading = false;
        errorMessage = e.toString().replaceFirst('Exception: ', '');
        testMarks = widget.students.map((student) {
          return {
            'studentId': student['id'],
            'studentName': '${student['firstName']} ${student['lastName'] ?? ''}'.trim(),
            'marks': '-',
            'maxMarks': 30,
            'remarks': '-',
          };
        }).toList();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage ?? 'Failed to fetch test marks')),
      );
    }
  }

  Future<void> handleDownloadPDF() async {
    try {
      final pdf = pw.Document();
      final font = pw.Font.helvetica();
      final boldFont = pw.Font.helveticaBold();

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          build: (pw.Context context) {
            return pw.Column(
              children: [
                // School Name
                pw.Text(
                  'Sure Success Point School',
                  style: pw.TextStyle(font: boldFont, fontSize: 40, color: PdfColor.fromHex('003087')),
                  textAlign: pw.TextAlign.center,
                ),
                pw.SizedBox(height: 8),
                // School Motto
                pw.Text(
                  'Institution of Humanism, Hardwork, Discipline, Technology & Excellence',
                  style: pw.TextStyle(font: boldFont, fontSize: 12, color: PdfColor.fromHex('333333')),
                  textAlign: pw.TextAlign.center,
                ),
                pw.Text(
                  'www.sspointschool.in | Powered by Knights (KiREAD) Group',
                  style: pw.TextStyle(font: font, fontSize: 12, color: PdfColor.fromHex('333333')),
                  textAlign: pw.TextAlign.center,
                ),
                pw.SizedBox(height: 8),
                // Report Title
                pw.Text(
                  'TEST REPORT',
                  style: pw.TextStyle(font: boldFont, fontSize: 14, color: PdfColor.fromHex('000000')),
                  textAlign: pw.TextAlign.center,
                ),
                pw.SizedBox(height: 8),
                // Class, Test, Month
                pw.Text(
                  'Class: ${widget.className} | Test: ${widget.test?['title'] ?? 'Unknown'} | Month: ${DateTime.now().toString().substring(0, 7)}',
                  style: pw.TextStyle(font: font, fontSize: 12, color: PdfColor.fromHex('000000')),
                  textAlign: pw.TextAlign.center,
                ),
                pw.SizedBox(height: 16),
                // Table
                pw.Table.fromTextArray(
                  headers: ['Student', 'Marks', 'Max Marks', 'Remarks'],
                  data: testMarks.map((tm) => [
                    tm['studentName'],
                    tm['marks'],
                    tm['maxMarks'].toString(),
                    tm['remarks'],
                  ]).toList(),
                  border: pw.TableBorder.all(color: PdfColor.fromHex('B40000'), width: 0.1),
                  headerStyle: pw.TextStyle(
                    font: boldFont,
                    fontSize: 10,
                    color: PdfColor.fromInt(0xFFFFFFFF),
                    background: pw.BoxDecoration(color: PdfColor.fromHex('DC2626')),
                  ),
                  cellStyle: pw.TextStyle(font: font, fontSize: 10, color: PdfColor.fromHex('000000')),
                  cellAlignment: pw.Alignment.centerLeft,
                  headerDecoration: pw.BoxDecoration(color: PdfColor.fromHex('DC2626')),
                  rowDecoration: pw.BoxDecoration(color: PdfColor.fromHex('FFFFFF')),
                  columnWidths: {
                    0: const pw.FlexColumnWidth(3),
                    1: const pw.FlexColumnWidth(1),
                    2: const pw.FlexColumnWidth(1),
                    3: const pw.FlexColumnWidth(2),
                  },
                ),
              ],
            );
          },
        ),
      );

      await Printing.sharePdf(
        bytes: await pdf.save(),
        filename: 'TestMarks_${widget.test?['title'] ?? 'Unknown'}.pdf',
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('PDF downloaded successfully')),
      );
    } catch (e) {
      print('PDF Generation Error: $e'); // Debug log
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to generate PDF: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFF009688),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                'View Marks for ${widget.test?['title'] ?? 'Unknown'} - ${widget.className}',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            toolbarHeight: 56.0,
            elevation: 0,
            forceElevated: false,
            leading: const Icon(Icons.calendar_today, color: Colors.white),
            actions: [
              IconButton(
                onPressed: handleDownloadPDF,
                icon: const Icon(Icons.download, color: Color(0xFF00c757)),
              ),
              IconButton(
                onPressed: widget.onClose,
                icon: const Icon(Icons.close, color: Color(0xFFf44336)),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  if (errorMessage != null)
                    Center(
                      child: Text(
                        errorMessage!,
                        style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
                      ),
                    )
                  else if (isLoading)
                    const Center(
                      child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
                    )
                  else ...[
                      testMarks.isEmpty
                          ? Center(
                        child: Text(
                          'No students found for this test.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                          : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: testMarks.length,
                        itemBuilder: (context, index) {
                          final tm = testMarks[index];
                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    tm['studentName'],
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Marks: ${tm['marks']} / ${tm['maxMarks']}',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Remarks: ${tm['remarks']}',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 16),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: ElevatedButton(
                          onPressed: widget.onClose,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5),
                            ),
                          ),
                          child: Text(
                            'Close',
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                          ),
                        ),
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