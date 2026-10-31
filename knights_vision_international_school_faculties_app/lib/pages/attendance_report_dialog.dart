import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../constants.dart';

class AttendanceReportDialog extends StatefulWidget {
  final int studentId;
  final String studentName;
  final String className;

  const AttendanceReportDialog({
    super.key,
    required this.studentId,
    required this.studentName,
    required this.className,
  });

  @override
  _AttendanceReportDialogState createState() => _AttendanceReportDialogState();
}

class _AttendanceReportDialogState extends State<AttendanceReportDialog> {
  final _storage = const FlutterSecureStorage();
  String _selectedMonth = DateTime.now().toIso8601String().substring(0, 7);
  List<dynamic> _attendanceRecords = [];
  bool _isLoading = false;
  bool _pdfLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.studentId != 0) {
      _fetchAttendanceReport();
    }
  }

  Future<void> _fetchAttendanceReport() async {
    setState(() => _isLoading = true);
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/attendance/${widget.className.toLowerCase()}/history/${widget.studentId}?month=$_selectedMonth'),
        headers: {'Authorization': 'Bearer $token'},
      );

      print('Fetching attendance report');
      print('Fetch URL: $BASE_URL/api-schools-panel/class_teachers_panel/attendance/${widget.className.toLowerCase()}/history/${widget.studentId}?month=$_selectedMonth');
      print('Fetch response status: ${response.statusCode}');
      print('Fetch response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _attendanceRecords = data['attendanceRecords'] ?? [];
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch attendance report: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching attendance report: $e');
      print(stackTrace);
      setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: 'Failed to fetch attendance report',
        backgroundColor: Colors.red,
      );
    }
  }

  void _onMonthChanged(String? value) {
    if (value != null) {
      setState(() {
        _selectedMonth = value;
      });
      _fetchAttendanceReport();
    }
  }

  Future<void> _handleDownloadPDF() async {
    if (_attendanceRecords.isEmpty) {
      Fluttertoast.showToast(
        msg: 'No attendance records found for this month',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
      return;
    }

    setState(() => _pdfLoading = true);
    try {
      final doc = pw.Document();
      final font = await PdfGoogleFonts.poppinsRegular();
      final boldFont = await PdfGoogleFonts.poppinsBold();

      final tableData = _attendanceRecords.map((record) {
        final date = DateTime.parse(record['date']).toString().substring(0, 10);
        final day = DateTime.parse(record['date']).weekday == 1
            ? 'Mon'
            : DateTime.parse(record['date']).weekday == 2
            ? 'Tue'
            : DateTime.parse(record['date']).weekday == 3
            ? 'Wed'
            : DateTime.parse(record['date']).weekday == 4
            ? 'Thu'
            : DateTime.parse(record['date']).weekday == 5
            ? 'Fri'
            : DateTime.parse(record['date']).weekday == 6
            ? 'Sat'
            : 'Sun';
        final status = record['status'] as String;
        return [date, day, status];
      }).toList();

      doc.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          build: (pw.Context context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(
                  'Sure Success Point School',
                  style: pw.TextStyle(
                    font: boldFont,
                    fontSize: 24,
                    color: const PdfColor.fromInt(0xFF4CAF50),
                  ),
                  textAlign: pw.TextAlign.center,
                ),
                pw.Text(
                  'Institution of Humanism, Hardwork, Discipline, Technology & Excellence',
                  style: pw.TextStyle(font: boldFont, fontSize: 10, color: const PdfColor.fromInt(0xFF00BFA5)),
                  textAlign: pw.TextAlign.center,
                ),
                pw.Text(
                  'Najirpur, Alinagar, Kaliachak, Malda - India',
                  style: pw.TextStyle(font: font, fontSize: 10, color: const PdfColor.fromInt(0xFF333333)),
                  textAlign: pw.TextAlign.center,
                ),
                pw.Text(
                  'www.sspointschool.in',
                  style: pw.TextStyle(font: font, fontSize: 10, color: const PdfColor.fromInt(0xFF333333)),
                  textAlign: pw.TextAlign.center,
                ),
                pw.SizedBox(height: 10),
                pw.Text(
                  'Attendance Report - $_selectedMonth',
                  style: pw.TextStyle(font: boldFont, fontSize: 14, color: const PdfColor.fromInt(0xFF000000)),
                  textAlign: pw.TextAlign.center,
                ),
                pw.SizedBox(height: 5),
                pw.Text(
                  'Student Name: ${widget.studentName}',
                  style: pw.TextStyle(font: font, fontSize: 11, color: const PdfColor.fromInt(0xFF000000)),
                ),
                pw.Text(
                  'Class: ${widget.className}',
                  style: pw.TextStyle(font: font, fontSize: 11, color: const PdfColor.fromInt(0xFF000000)),
                ),
                pw.SizedBox(height: 10),
                pw.Table(
                  border: pw.TableBorder.all(color: const PdfColor.fromInt(0xFF444444), width: 0.3),
                  columnWidths: {
                    0: const pw.FlexColumnWidth(2),
                    1: const pw.FlexColumnWidth(1),
                    2: const pw.FlexColumnWidth(2),
                  },
                  children: [
                    pw.TableRow(
                      decoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFF4CAF50)),
                      children: [
                        pw.Container(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text('Date', style: pw.TextStyle(font: boldFont, fontSize: 10, color: const PdfColor.fromInt(0xFFFFFFFF))),
                          alignment: pw.Alignment.center,
                        ),
                        pw.Container(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text('Day', style: pw.TextStyle(font: boldFont, fontSize: 10, color: const PdfColor.fromInt(0xFFFFFFFF))),
                          alignment: pw.Alignment.center,
                        ),
                        pw.Container(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text('Status', style: pw.TextStyle(font: boldFont, fontSize: 10, color: const PdfColor.fromInt(0xFFFFFFFF))),
                          alignment: pw.Alignment.center,
                        ),
                      ],
                    ),
                    ...tableData.map((row) {
                      final status = row[2];
                      final statusColor = status == 'PRESENT'
                          ? const PdfColor.fromInt(0xFF00c853)
                          : status == 'ABSENT'
                          ? const PdfColor.fromInt(0xFFf44336)
                          : status == 'HOLIDAY'
                          ? const PdfColor.fromInt(0xFF9c27b0)
                          : const PdfColor.fromInt(0xFFffeb3b);
                      return pw.TableRow(
                        children: [
                          pw.Container(
                            padding: const pw.EdgeInsets.all(4),
                            child: pw.Text(row[0], style: pw.TextStyle(font: font, fontSize: 10, color: const PdfColor.fromInt(0xFF000000))),
                            alignment: pw.Alignment.center,
                          ),
                          pw.Container(
                            padding: const pw.EdgeInsets.all(4),
                            child: pw.Text(row[1], style: pw.TextStyle(font: font, fontSize: 10, color: const PdfColor.fromInt(0xFF000000))),
                            alignment: pw.Alignment.center,
                          ),
                          pw.Container(
                            padding: const pw.EdgeInsets.all(4),
                            decoration: pw.BoxDecoration(color: statusColor),
                            child: pw.Text(
                              row[2],
                              style: pw.TextStyle(
                                font: font,
                                fontSize: 10,
                                color: status == 'WEEKLY_HOLIDAY' ? const PdfColor.fromInt(0xFF000000) : const PdfColor.fromInt(0xFFFFFFFF),
                              ),
                            ),
                            alignment: pw.Alignment.center,
                          ),
                        ],
                      );
                    }),
                  ],
                ),
                pw.SizedBox(height: 10),
                pw.Text(
                  'Generated on: ${DateTime.now().toString().substring(0, 10)}',
                  style: pw.TextStyle(font: font, fontSize: 10, color: const PdfColor.fromInt(0xFF333333)),
                  textAlign: pw.TextAlign.center,
                ),
              ],
            );
          },
        ),
      );

      final safeFileName = widget.studentName.replaceAll(RegExp(r'[^a-zA-Z0-9-_]'), '_');
      await Printing.sharePdf(
        bytes: await doc.save(),
        filename: 'Attendance_Report_${safeFileName}_$_selectedMonth.pdf',
      );
      Fluttertoast.showToast(
        msg: 'Attendance report generated successfully.',
        backgroundColor: Colors.green,
        textColor: Colors.white,
      );
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Failed to generate attendance report: $e',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
    } finally {
      setState(() => _pdfLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.all(0),
      backgroundColor: Colors.transparent,
      child: Container(
        color: const Color(0xFF000000),
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              backgroundColor: const Color(0xFFb71c1c),
              flexibleSpace: FlexibleSpaceBar(
                title: Row(
                  children: [
                    const Icon(Icons.assessment, color: Colors.white),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Attendance Report for ${widget.studentName}',
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
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
              automaticallyImplyLeading: true,
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    // Header row with month selector and download button
                    Container(
                      color: const Color(0xFF333333),
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 1,
                            child: Text(
                              'Date',
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Expanded(
                            flex: 1,
                            child: Text(
                              'Day',
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Expanded(
                            flex: 2,
                            child: Text(
                              'Status',
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Row(
                            children: [
                              Container(
                                width: 150,
                                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                                child: DropdownButton<String>(
                                  value: _selectedMonth,
                                  isExpanded: true,
                                  items: List.generate(12, (index) {
                                    final date = DateTime(
                                      DateTime.now().year,
                                      DateTime.now().month - index,
                                    );
                                    final monthStr = date.toIso8601String().substring(0, 7);
                                    return DropdownMenuItem(
                                      value: monthStr,
                                      child: Text(
                                        date.toString().substring(0, 7).replaceAll('-', '/'),
                                        style: GoogleFonts.poppins(color: Colors.white),
                                      ),
                                    );
                                  }),
                                  onChanged: _onMonthChanged,
                                  dropdownColor: const Color(0xFF333333),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  underline: Container(
                                    height: 1,
                                    color: const Color(0xFF555555),
                                  ),
                                ),
                              ),
                              IconButton(
                                onPressed: _pdfLoading ? null : _handleDownloadPDF,
                                icon: _pdfLoading
                                    ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    color: Color(0xFF00c757),
                                    strokeWidth: 2,
                                  ),
                                )
                                    : const Icon(Icons.download, color: Colors.white),
                                tooltip: 'Download Report',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4.0),
                    _isLoading
                        ? const Center(child: CircularProgressIndicator(color: Color(0xFF00c757)))
                        : _attendanceRecords.isEmpty
                        ? Center(
                      child: Text(
                        'No attendance records found for this month.',
                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                      ),
                    )
                        : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _attendanceRecords.length,
                      itemBuilder: (context, index) {
                        final record = _attendanceRecords[index];
                        final status = record['status'] as String;
                        final statusColors = {
                          'PRESENT': Colors.green,
                          'ABSENT': Colors.red,
                          'HOLIDAY': Colors.purple,
                          'WEEKLY_HOLIDAY': Colors.yellow,
                        };
                        final statusColor = statusColors[status] ?? Colors.grey[800];
                        return Card(
                          color: const Color(0xFF1e1e1e),
                          margin: const EdgeInsets.symmetric(vertical: 2),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 1,
                                  child: Text(
                                    DateTime.parse(record['date']).toString().substring(0, 10),
                                    style: GoogleFonts.poppins(color: Colors.white),
                                  ),
                                ),
                                Expanded(
                                  flex: 1,
                                  child: Text(
                                    DateTime.parse(record['date']).weekday == 1
                                        ? 'Mon'
                                        : DateTime.parse(record['date']).weekday == 2
                                        ? 'Tue'
                                        : DateTime.parse(record['date']).weekday == 3
                                        ? 'Wed'
                                        : DateTime.parse(record['date']).weekday == 4
                                        ? 'Thu'
                                        : DateTime.parse(record['date']).weekday == 5
                                        ? 'Fri'
                                        : DateTime.parse(record['date']).weekday == 6
                                        ? 'Sat'
                                        : 'Sun',
                                    style: GoogleFonts.poppins(color: Colors.white),
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: ElevatedButton(
                                    onPressed: null,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: statusColor,
                                      minimumSize: const Size(120, 36),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(5),
                                      ),
                                    ),
                                    child: Text(
                                      status == 'WEEKLY_HOLIDAY' ? 'Weekly Off' : status,
                                      style: GoogleFonts.poppins(
                                        color: status == 'WEEKLY_HOLIDAY' ? Colors.black : Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                        ),
                        child: Text('Close', style: GoogleFonts.poppins()),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}