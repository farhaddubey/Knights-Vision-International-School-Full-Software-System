import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'dart:io';
import 'package:intl/intl.dart';
import '../api_service.dart';
import 'package:pdf/pdf.dart';

class TestMarksViewPage extends StatefulWidget {
  final Map<String, dynamic> test;
  final List<dynamic> students;
  final String className;
  final int classSubjectId;

  const TestMarksViewPage({
    super.key,
    required this.test,
    required this.students,
    required this.className,
    required this.classSubjectId,
  });

  @override
  _TestMarksViewPageState createState() => _TestMarksViewPageState();
}

class _TestMarksViewPageState extends State<TestMarksViewPage> {
  final _apiService = ApiService();
  List<Map<String, dynamic>> _testMarks = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchTestMarks();
  }

  Future<void> _fetchTestMarks() async {
    setState(() => _isLoading = true);
    try {
      final response = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/students/mytests',
        queryParameters: {'classSubjectId': '${widget.classSubjectId}'},
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final tests = data['tests'] is List ? data['tests'] : const [];
        final selectedTest = tests.cast<dynamic>().firstWhere(
              (test) => test['id'] == widget.test['id'],
              orElse: () => <String, dynamic>{},
            );
        final entries = selectedTest['TestMark'] is List
            ? selectedTest['TestMark'] as List
            : const [];
        final mark = entries.isNotEmpty && entries.first is Map
            ? entries.first as Map
            : const <String, dynamic>{};
        setState(() {
          _testMarks = [
            {
              'studentId': 'me',
              'studentName': 'My Result',
              'marks': mark['marks']?.toString() ?? '-',
              'maxMarks': mark['maxMarks']?.toString() ?? '-',
              'remarks': mark['remarks']?.toString() ?? '-',
            }
          ];
          _isLoading = false;
        });
      } else {
        throw ApiException('Unable to load your test marks.',
            statusCode: response.statusCode);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _testMarks = [
          {
            'studentId': 'me',
            'studentName': 'My Result',
            'marks': '-',
            'maxMarks': '-',
            'remarks': '-',
          }
        ];
        _isLoading = false;
      });
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    }
  }

  Future<void> _generatePDF() async {
    try {
      final now = DateTime.now();
      final monthYear = DateFormat('MMMM yyyy').format(now);

      final pdf = pw.Document();
      final font = pw.Font.helvetica();
      final boldFont = pw.Font.helveticaBold();

      pdf.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4,
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
                      'TEST REPORT',
                      style: pw.TextStyle(
                        font: boldFont,
                        fontSize: 12,
                        color: PdfColor.fromHex('#000000'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'Class: ${widget.className} | Test: ${widget.test['title'] ?? 'Unknown'} | Month: $monthYear',
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
                          'Student Name',
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
                          'Marks',
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
                          'Max Marks',
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
                    ],
                  ),
                  // Data rows
                  ...List.generate(_testMarks.length, (index) {
                    final tm = _testMarks[index];
                    final isEven = index % 2 == 0;
                    return pw.TableRow(
                      decoration: pw.BoxDecoration(
                        color: isEven
                            ? PdfColor.fromHex('#FFFFFF')
                            : PdfColor.fromHex('#F0F0F0'),
                      ),
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            tm['studentName']?.toString() ?? '-',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            tm['marks']?.toString() ?? '-',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            tm['maxMarks']?.toString() ?? '-',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            tm['remarks']?.toString() ?? '-',
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
      final file = File(
          '${output.path}/test_marks_${widget.test['title'] ?? 'unknown'}_${widget.className}.pdf');
      await file.writeAsBytes(await pdf.save());
      await OpenFile.open(file.path);
      Fluttertoast.showToast(
        msg: 'PDF downloaded successfully',
        backgroundColor: Colors.green,
      );
    } catch (e, stackTrace) {
      print('Error generating PDF: $e');
      print(stackTrace);
      Fluttertoast.showToast(
        msg: 'Failed to generate or open PDF: ${e.toString()}',
        backgroundColor: Colors.red,
      );
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
                'Test Marks - ${widget.test['title'] ?? 'Unknown'} - ${widget.className}',
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
                              child: Text('Student',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 1,
                              child: Text('Marks',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 1,
                              child: Text('Max Marks',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('Remarks',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ),
                    // Test Marks List
                    _testMarks.isEmpty
                        ? Center(
                            child: Text(
                              'No students found for this test.',
                              style: GoogleFonts.poppins(
                                  color: Colors.white, fontSize: 16),
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _testMarks.length,
                            itemBuilder: (context, index) {
                              final tm = _testMarks[index];
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
                                        'Student: ${tm['studentName']}',
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF00c757),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Marks: ${tm['marks']}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Max Marks: ${tm['maxMarks']}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Remarks: ${tm['remarks']}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
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
