import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class ClassMonthlyHomeworkReportPage extends StatefulWidget {
  final int? classSubjectId;
  final String? className;
  final String? subjectName;
  final int? studentId;
  final String? studentName;

  const ClassMonthlyHomeworkReportPage({
    super.key,
    required this.classSubjectId,
    required this.className,
    required this.subjectName,
    this.studentId,
    this.studentName,
  });

  @override
  _ClassMonthlyHomeworkReportPageState createState() => _ClassMonthlyHomeworkReportPageState();
}

class _ClassMonthlyHomeworkReportPageState extends State<ClassMonthlyHomeworkReportPage> {
  final ApiService _apiService = ApiService();
  String month = DateTime.now().toIso8601String().substring(0, 7);
  List<dynamic> homeworkRecords = [];
  List<int> daysInMonth = [];
  bool loading = false;

  @override
  void initState() {
    super.initState();
    if (widget.classSubjectId != null) {
      _fetchHomeworkReport();
    }
  }

  Future<void> _fetchHomeworkReport() async {
    setState(() {
      loading = true;
    });
    try {
      final records = await _apiService.fetchClassHomeworkReport(widget.classSubjectId!, month);
      final date = DateTime.parse('$month-01');
      final days = DateTime(date.year, date.month + 1, 0).day;
      setState(() {
        homeworkRecords = records ?? [];
        if (widget.studentId != null) {
          homeworkRecords = homeworkRecords.where((record) => record['studentId'] == widget.studentId).toList();
        }
        daysInMonth = List.generate(days, (i) => i + 1);
        loading = false;
      });
    } catch (e) {
      setState(() {
        homeworkRecords = [];
        loading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to fetch class homework report: $e')));
    }
  }

  void _handleMonthChange(String? newMonth) {
    if (newMonth != null) {
      setState(() {
        month = newMonth;
      });
      _fetchHomeworkReport();
    }
  }

  Future<void> _generatePDF() async {
    final pdf = pw.Document();
    final statusColors = {
      'PENDING': PdfColor.fromInt(0xFFCCCCCC),
      'SUBMITTED': PdfColor.fromInt(0xFFCCFFCC),
      'LATE': PdfColor.fromInt(0xFFFFCCCC),
      'NEEDS_IMPROVEMENT': PdfColor.fromInt(0xFFFFFFCC),
      'EXCELLENT': PdfColor.fromInt(0xFF009900),
    };
    const statusAbbreviations = {
      'PENDING': 'PE',
      'SUBMITTED': 'SU',
      'LATE': 'LA',
      'NEEDS_IMPROVEMENT': 'NI',
      'EXCELLENT': 'EX',
    };

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4.landscape,
        margin: const pw.EdgeInsets.all(10),
        build: (context) => [
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Container(width: 40, height: 40),
              pw.Column(
                children: [
                  pw.Text('Sure Success Point School', style: pw.TextStyle(fontSize: 40, color: PdfColor.fromInt(0xFF003087), fontWeight: pw.FontWeight.bold)),
                  pw.Text('Institution of Humanism, Hardwork, Discipline, Technology & Excellence', style: const pw.TextStyle(fontSize: 12, color: PdfColor.fromInt(0xFF333333))),
                  pw.Text('MONTHLY DAILY HOMEWORK PROGRESS REPORT', style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
                  pw.Text(
                    'Class: ${widget.className} | Subject: ${widget.subjectName} | Month: ${DateTime.parse('$month-01').toString().substring(0, 7)} | www.sspointschool.in | Powered by Knights (KiREAD) Group',
                    style: const pw.TextStyle(fontSize: 12),
                  ),
                ],
              ),
              pw.Container(width: 40, height: 40),
            ],
          ),
          pw.SizedBox(height: 10),
          pw.Table(
            border: pw.TableBorder.all(width: 0.5),
            columnWidths: {
              0: const pw.FixedColumnWidth(100),
            },
            children: [
              pw.TableRow(
                decoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFF212121)),
                children: [
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('Student Name', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.white)),
                  ),
                  ...daysInMonth.map(
                        (day) => pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child: pw.Text(
                        day.toString(),
                        style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.white),
                        textAlign: pw.TextAlign.center,
                      ),
                    ),
                  ),
                ],
              ),
              ...homeworkRecords.asMap().entries.map((entry) {
                final record = entry.value;
                return pw.TableRow(
                  children: [
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child: pw.Text(record['studentName'] ?? '', style: const pw.TextStyle(fontSize: 8)),
                    ),
                    ...daysInMonth.map((day) {
                      final dateStr = '$month-${day.toString().padLeft(2, '0')}';
                      final status = record['statuses'][dateStr] ?? 'PENDING';
                      final statusShort = statusAbbreviations[status] ?? 'PE';
                      final bgColor = statusColors[status] ?? PdfColors.grey300;
                      return pw.Container(
                        alignment: pw.Alignment.center,
                        color: bgColor,
                        padding: const pw.EdgeInsets.all(5),
                        child: pw.Text(statusShort, style: const pw.TextStyle(fontSize: 8)),
                      );
                    }),
                  ],
                );
              }),
            ],
          ),
          pw.SizedBox(height: 10),
          pw.Text(
            'Generated on: ${DateTime.now().toLocal().toString().substring(0, 10)}',
            style: const pw.TextStyle(fontSize: 10),
          ),
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.end,
            children: statusColors.entries.map((entry) {
              return pw.Padding(
                padding: const pw.EdgeInsets.only(right: 10),
                child: pw.Row(
                  children: [
                    pw.Container(width: 10, height: 10, color: entry.value),
                    pw.SizedBox(width: 5),
                    pw.Text('${statusAbbreviations[entry.key]} = ${entry.key.replaceAll('_', ' ')}', style: const pw.TextStyle(fontSize: 8)),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
    await Printing.sharePdf(bytes: await pdf.save(), filename: 'Homework_Report_${widget.className}_${widget.subjectName}_$month.pdf');
  }

  @override
  Widget build(BuildContext context) {
    final statusStyles = {
      'PENDING': {'variant': 'outlined', 'color': Colors.red},
      'SUBMITTED': {'variant': 'contained', 'color': Colors.green},
      'LATE': {'variant': 'contained', 'color': Colors.red},
      'NEEDS_IMPROVEMENT': {'variant': 'contained', 'color': Colors.yellow},
      'EXCELLENT': {'variant': 'contained', 'color': Colors.green},
    };

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
                'Class Homework Report - ${widget.className} - ${widget.subjectName}${widget.studentName != null ? ' - ${widget.studentName}' : ''}',
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
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              DropdownButton<String>(
                value: month,
                onChanged: _handleMonthChange,
                items: List.generate(12, (index) {
                  final date = DateTime.now().subtract(Duration(days: index * 30));
                  final monthStr = date.toIso8601String().substring(0, 7);
                  return DropdownMenuItem(
                    value: monthStr,
                    child: Text(
                      monthStr,
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                    ),
                  );
                }),
                dropdownColor: const Color(0xFF181818),
                style: GoogleFonts.poppins(color: Colors.white),
                icon: const Icon(Icons.calendar_today, color: Colors.white),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: _generatePDF,
                icon: const Icon(Icons.download, color: Colors.green),
                tooltip: 'Download PDF',
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  if (loading)
                    const Center(child: SpinKitCircle(color: Color(0xFF00c757)))
                  else if (homeworkRecords.isEmpty)
                    Center(
                      child: Text(
                        'No homework records found for this class${widget.studentName != null ? ' and student' : ''}.',
                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                      ),
                    )
                  else
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: SizedBox(
                        width: 150 + daysInMonth.length * 100,
                        child: Column(
                          children: [
                            Container(
                              color: const Color(0xFF333333),
                              padding: const EdgeInsets.all(8),
                              child: Row(
                                children: [
                                  Expanded(
                                    flex: 1,
                                    child: Text(
                                      'Student Name',
                                      style: GoogleFonts.poppins(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                      textAlign: TextAlign.left,
                                    ),
                                  ),
                                  ...daysInMonth.map((day) => Expanded(
                                    flex: 1,
                                    child: Text(
                                      '$day',
                                      style: GoogleFonts.poppins(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  )),
                                ],
                              ),
                            ),
                            ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: homeworkRecords.length,
                              itemBuilder: (context, index) {
                                final record = homeworkRecords[index];
                                return Container(
                                  margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF181818),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        flex: 1,
                                        child: Padding(
                                          padding: const EdgeInsets.all(8),
                                          child: Text(
                                            record['studentName'],
                                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                          ),
                                        ),
                                      ),
                                      ...daysInMonth.map((day) {
                                        final dateStr = '$month-${day.toString().padLeft(2, '0')}';
                                        final status = record['statuses'][dateStr] ?? 'PENDING';
                                        return Expanded(
                                          flex: 1,
                                          child: Center(
                                            child: ElevatedButton(
                                              onPressed: null,
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: statusStyles[status]!['color'] as Color,
                                                side: BorderSide(
                                                  color: statusStyles[status]!['color'] as Color,
                                                ),
                                                minimumSize: const Size(80, 36),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(5),
                                                ),
                                              ),
                                              child: Text(
                                                status.replaceAll('_', ' '),
                                                style: GoogleFonts.poppins(
                                                  color: Colors.white,
                                                  fontSize: 12,
                                                ),
                                              ),
                                            ),
                                          ),
                                        );
                                      }),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
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