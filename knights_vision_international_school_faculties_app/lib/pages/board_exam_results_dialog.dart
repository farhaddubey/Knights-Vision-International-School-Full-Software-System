import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../constants.dart';
class BoardExamResultsDialog extends StatefulWidget {
  final dynamic boardExam;
  final List<dynamic> students;
  final String className;
  final VoidCallback onClose;
  final Function fetchBoardExams;

  const BoardExamResultsDialog({
    super.key,
    required this.boardExam,
    required this.students,
    required this.className,
    required this.onClose,
    required this.fetchBoardExams,
  });

  @override
  _BoardExamResultsDialogState createState() => _BoardExamResultsDialogState();
}

class _BoardExamResultsDialogState extends State<BoardExamResultsDialog> {
  final storage = const FlutterSecureStorage();
  List<dynamic> results = [];
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.boardExam != null && widget.students.isNotEmpty) {
      fetchResults();
    }
  }

  Future<void> fetchResults() async {
    setState(() => isLoading = true);
    try {
      final token = await storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated.');
      }
      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/BoardExams/${widget.className.toLowerCase()}/board-exam-results?boardExamId=${widget.boardExam['id']}'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final existingResults = data['results'] ?? [];
        setState(() {
          results = widget.students.map((student) {
            final existing = existingResults.firstWhere(
                  (r) => r['studentId'] == student['id'],
              orElse: () => {},
            );
            return {
              'studentId': student['id'],
              'studentName': '${student['firstName']} ${student['middleName'] ?? ''} ${student['lastName']}'.trim(),
              'writtenMarks': existing['writtenMarks']?.toString() ?? '',
              'oralMarks': existing['oralMarks']?.toString() ?? '',
              'remarks': existing['remarks'] ?? '',
            };
          }).toList();
          isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch board exam results: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        results = widget.students.map((student) => ({
          'studentId': student['id'],
          'studentName': '${student['firstName']} ${student['middleName'] ?? ''} ${student['lastName']}'.trim(),
          'writtenMarks': '',
          'oralMarks': '',
          'remarks': '',
        })).toList();
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch board exam results: $e')),
      );
    }
  }

  void handleResultChange(int index, String field, String value) {
    setState(() {
      var parsedValue = value;
      if (field == 'writtenMarks' || field == 'oralMarks') {
        final numValue = double.tryParse(value) ?? 0;
        parsedValue = numValue.clamp(field == 'writtenMarks' ? 0 : 0, field == 'writtenMarks' ? 90 : 10).toString();
        if (double.parse(value) > (field == 'writtenMarks' ? 90 : 10)) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('${field == 'writtenMarks' ? 'Written' : 'Oral'} Marks capped at ${field == 'writtenMarks' ? 90 : 10}')),
          );
        }
      }
      results[index][field] = parsedValue;
    });
  }

  Future<void> handleSaveResults() async {
    final invalidResults = results.any((r) =>
    (r['writtenMarks'].isNotEmpty && double.tryParse(r['writtenMarks']) == null) ||
        (r['oralMarks'].isNotEmpty && double.tryParse(r['oralMarks']) == null) ||
        (double.tryParse(r['writtenMarks']) ?? 0) < 0 ||
        (double.tryParse(r['writtenMarks']) ?? 0) > 90 ||
        (double.tryParse(r['oralMarks']) ?? 0) < 0 ||
        (double.tryParse(r['oralMarks']) ?? 0) > 10);
    if (invalidResults) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All marks must be valid numbers (Written: 0-90, Oral: 0-10)')),
      );
      return;
    }

    setState(() => isLoading = true);
    try {
      final token = await storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated.');
      }
      final payload = {
        'results': results.map((r) => ({
          'boardExamId': widget.boardExam['id'],
          'studentId': r['studentId'],
          'writtenMarks': r['writtenMarks'].isNotEmpty ? double.parse(r['writtenMarks']) : null,
          'oralMarks': r['oralMarks'].isNotEmpty ? double.parse(r['oralMarks']) : null,
          'totalMarks': (double.tryParse(r['writtenMarks']) ?? 0) + (double.tryParse(r['oralMarks']) ?? 0),
          'remarks': r['remarks'].isNotEmpty ? r['remarks'] : null,
        })).toList(),
      };
      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/BoardExams/board-exam-results/batch'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Board exam results saved successfully.')),
        );
        widget.fetchBoardExams();
        widget.onClose();
      } else {
        throw Exception('Failed to save board exam results: ${response.statusCode}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save board exam results: $e')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> handleDownloadPDF() async {
    try {
      final pdf = pw.Document();
      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          build: (pw.Context context) {
            return pw.Column(
              children: [
                pw.Text('Sure Success Point School', style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
                pw.Text('Knights West Bengal Board Preparation Test Series (KWBBPTS)', style: const pw.TextStyle(fontSize: 11)),
                pw.Text('Board Exam: ${widget.boardExam?['title'] ?? 'Unknown'}', style: const pw.TextStyle(fontSize: 12)),
                pw.Text('Class: ${widget.className}', style: const pw.TextStyle(fontSize: 12)),
                pw.Divider(),
                pw.Table(
                  border: pw.TableBorder.all(),
                  children: [
                    pw.TableRow(
                      children: [
                        pw.Text('Student Name', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text('Written Marks (90)', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text('Oral Marks (10)', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text('Total Marks', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text('Remarks', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      ],
                    ),
                    ...results.map((r) => pw.TableRow(
                      children: [
                        pw.Text(r['studentName']),
                        pw.Text(r['writtenMarks'].isNotEmpty ? r['writtenMarks'] : '-'),
                        pw.Text(r['oralMarks'].isNotEmpty ? r['oralMarks'] : '-'),
                        pw.Text(((double.tryParse(r['writtenMarks']) ?? 0) + (double.tryParse(r['oralMarks']) ?? 0)).toStringAsFixed(2)),
                        pw.Text(r['remarks'].isNotEmpty ? r['remarks'] : '-'),
                      ],
                    )),
                  ],
                ),
              ],
            );
          },
        ),
      );
      await Printing.sharePdf(
        bytes: await pdf.save(),
        filename: 'BoardExam_${widget.boardExam?['title'] ?? 'Unknown'}.pdf',
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('PDF downloaded successfully.')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to generate PDF: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      appBar: AppBar(
        backgroundColor: const Color(0xFF009688),
        title: Row(
          children: [
            const Icon(Icons.calendar_today, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Board Exam Results for ${widget.boardExam?['title'] ?? 'Unknown'} - ${widget.className}',
                style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            IconButton(
              onPressed: handleDownloadPDF,
              icon: const Icon(Icons.download, color: Colors.white),
            ),
            IconButton(
              onPressed: widget.onClose,
              icon: const Icon(Icons.close, color: Colors.red),
            ),
          ],
        ),
      ),
      body: isLoading
          ? const Center(child: SpinKitCircle(color: Color(0xFF00c757), size: 120))
          : Column(
        children: [
          Container(
            color: const Color(0xFF333333),
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(flex: 2, child: Text('Student Name', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                Expanded(flex: 2, child: Text('Written Marks (90)', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                Expanded(flex: 2, child: Text('Oral Marks (10)', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                Expanded(flex: 2, child: Text('Total Marks', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                Expanded(flex: 2, child: Text('Remarks', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
              ],
            ),
          ),
          Expanded(
            child: widget.students.isEmpty
                ? Center(child: Text('No students found.', style: GoogleFonts.poppins(color: Colors.white)))
                : ListView.builder(
              itemCount: results.length,
              itemBuilder: (context, index) {
                final result = results[index];
                return Container(
                  margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                  color: const Color(0xFF181818),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: Text(result['studentName'], style: GoogleFonts.poppins(color: Colors.white)),
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: TextField(
                            decoration: InputDecoration(
                              labelText: 'Written (90)',
                              labelStyle: GoogleFonts.poppins(color: Colors.white70),
                              border: const OutlineInputBorder(),
                              enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                              focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00c757))),
                            ),
                            style: GoogleFonts.poppins(color: Colors.white),
                            keyboardType: TextInputType.number,
                            controller: TextEditingController(text: result['writtenMarks']),
                            onChanged: (value) => handleResultChange(index, 'writtenMarks', value),
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: TextField(
                            decoration: InputDecoration(
                              labelText: 'Oral (10)',
                              labelStyle: GoogleFonts.poppins(color: Colors.white70),
                              border: const OutlineInputBorder(),
                              enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                              focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00c757))),
                            ),
                            style: GoogleFonts.poppins(color: Colors.white),
                            keyboardType: TextInputType.number,
                            controller: TextEditingController(text: result['oralMarks']),
                            onChanged: (value) => handleResultChange(index, 'oralMarks', value),
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: Text(
                            ((double.tryParse(result['writtenMarks']) ?? 0) + (double.tryParse(result['oralMarks']) ?? 0)).toStringAsFixed(2),
                            style: GoogleFonts.poppins(color: Colors.white),
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: TextField(
                            decoration: InputDecoration(
                              labelText: 'Remarks',
                              labelStyle: GoogleFonts.poppins(color: Colors.white70),
                              border: const OutlineInputBorder(),
                              enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
                              focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00c757))),
                            ),
                            style: GoogleFonts.poppins(color: Colors.white),
                            controller: TextEditingController(text: result['remarks']),
                            onChanged: (value) => handleResultChange(index, 'remarks', value),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                ElevatedButton(
                  onPressed: widget.onClose,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                  child: Text('Cancel', style: GoogleFonts.poppins(color: Colors.white)),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: isLoading ? null : handleSaveResults,
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00c757)),
                  child: Text('Save All', style: GoogleFonts.poppins(color: Colors.black)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
