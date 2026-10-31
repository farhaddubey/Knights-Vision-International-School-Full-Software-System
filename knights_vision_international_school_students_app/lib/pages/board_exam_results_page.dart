import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:intl/intl.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'dart:io';
import 'package:pdf/pdf.dart'; // <-- needed for PdfPageFormat and PdfColor

class BoardExamResultsPage extends StatefulWidget {
  final Map<String, dynamic> boardExam;
  final List<dynamic> students;
  final String className;

  const BoardExamResultsPage({
    super.key,
    required this.boardExam,
    required this.students,
    required this.className,
  });

  @override
  _BoardExamResultsPageState createState() => _BoardExamResultsPageState();
}

class _BoardExamResultsPageState extends State<BoardExamResultsPage> {
  List<Map<String, dynamic>> _results = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchResults();
  }

  void _fetchResults() {
    setState(() => _isLoading = true);
    setState(() {
      _results = [
        {
          'studentId': 'me',
          'studentName': 'My Result',
          'writtenMarks': widget.boardExam['writtenMarks']?.toString() ?? '-',
          'oralMarks': widget.boardExam['oralMarks']?.toString() ?? '-',
          'totalMarks': widget.boardExam['totalMarks']?.toString() ?? '-',
          'remarks':
              widget.boardExam['remarks']?.toString().split('\n').join(' ') ??
                  '-',
        }
      ];
      _isLoading = false;
    });
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
                      'BOARD EXAM RESULTS',
                      style: pw.TextStyle(
                        font: boldFont,
                        fontSize: 12,
                        color: PdfColor.fromHex('#000000'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'Class: ${widget.className} | Exam: ${widget.boardExam['title'] ?? 'Unknown'} | Month: $monthYear',
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
                  3: const pw.FlexColumnWidth(1),
                  4: const pw.FlexColumnWidth(2),
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
                          'Written Marks (90)',
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
                          'Oral Marks (10)',
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
                          'Total Marks',
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
                  // Data rows with proper striping
                  ...List.generate(_results.length, (index) {
                    final result = _results[index];
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
                            result['studentName']?.toString() ?? '-',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            result['writtenMarks']?.toString() ?? '-',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            result['oralMarks']?.toString() ?? '-',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            result['totalMarks']?.toString() ?? '-',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            (result['remarks'] != null
                                    ? result['remarks']
                                        .toString()
                                        .split('\n')
                                        .join(' ')
                                    : '-')
                                .trim(),
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
          '${output.path}/board_exam_${widget.boardExam['id'] ?? 'unknown'}_${widget.className}.pdf');
      await file.writeAsBytes(await pdf.save());
      await OpenFile.open(file.path);
      Fluttertoast.showToast(
        msg: 'PDF downloaded successfully',
        backgroundColor: Colors.green,
      );
    } catch (e) {
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
                'My Board Exam Result - ${widget.boardExam['title'] ?? 'Unknown'}',
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
              padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 2),
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
                              flex: 2,
                              child: Text('Written (90)',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('Oral (10)',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 1,
                              child: Text('Total',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ),
                    // Results List
                    _results.isEmpty
                        ? Center(
                            child: Text(
                              'No result has been published.',
                              style: GoogleFonts.poppins(
                                  color: Colors.white, fontSize: 16),
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _results.length,
                            itemBuilder: (context, index) {
                              final result = _results[index];
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
                                        'My result',
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF00c757),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Written Marks: ${result['writtenMarks']}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Oral Marks: ${result['oralMarks']}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Total Marks: ${result['totalMarks']}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Remarks: ${result['remarks']?.split('\n').join(' ') ?? '-'}',
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
