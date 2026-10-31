import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../constants.dart';
class StudentAssignmentsDialog extends StatefulWidget {
  final dynamic selectedAssignment;
  final String className;
  final VoidCallback onClose;

  const StudentAssignmentsDialog({
    super.key,
    required this.selectedAssignment,
    required this.className,
    required this.onClose,
  });

  @override
  _StudentAssignmentsDialogState createState() => _StudentAssignmentsDialogState();
}

class _StudentAssignmentsDialogState extends State<StudentAssignmentsDialog> {
  List<dynamic> studentAssignments = [];
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    fetchStudentAssignments();
  }

  Future<void> fetchStudentAssignments() async {
    setState(() {
      isLoading = true;
    });
    try {
      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/Assignments/student-assignments?assignmentId=${widget.selectedAssignment['id']}'),
      );
      if (response.statusCode == 200) {
        setState(() {
          studentAssignments = jsonDecode(response.body)['studentAssignments'] ?? [];
          isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch student assignments');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch student assignments: $e')),
      );
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
                pw.Text('Assignment: ${widget.selectedAssignment['title'] ?? 'Unknown'}', style: const pw.TextStyle(fontSize: 12)),
                pw.Text('Class: ${widget.className}', style: const pw.TextStyle(fontSize: 12)),
                pw.Divider(),
                pw.Table(
                  border: pw.TableBorder.all(),
                  children: [
                    pw.TableRow(
                      children: [
                        pw.Text('Student', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text('Submitted', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text('Marks (0-3)', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text('Remarks', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text('Quality Tag', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      ],
                    ),
                    for (var sa in studentAssignments)
                      pw.TableRow(
                        children: [
                          pw.Text('${sa['student']['firstName']} ${sa['student']['lastName'] ?? ''}'),
                          pw.Text(sa['isSubmitted'] ? 'Yes' : 'No'),
                          pw.Text(sa['marksObtained']?.toString() ?? '-'),
                          pw.Text(sa['remarks'] ?? '-'),
                          pw.Text(sa['qualityTag'] ?? 'None'),
                        ],
                      ),
                  ],
                ),
              ],
            );
          },
        ),
      );
      await Printing.sharePdf(bytes: await pdf.save(), filename: 'Assignment_${widget.selectedAssignment['title'] ?? 'Unknown'}.pdf');
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
      backgroundColor: const Color(0xFF181818),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFFb71c1c),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                'View Submissions for ${widget.selectedAssignment?['title'] ?? 'Unknown'} - ${widget.className}',
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
            actions: [
              IconButton(
                onPressed: handleDownloadPDF,
                icon: const Icon(Icons.download, color: Color(0xFF00c757)),
              ),
              IconButton(
                onPressed: widget.onClose,
                icon: const Icon(Icons.close, color: Colors.red),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  if (isLoading)
                    const Center(child: SpinKitCircle(color: Color(0xFF00c757), size: 120))
                  else ...[
                    Container(
                      color: const Color(0xFF333333),
                      padding: const EdgeInsets.all(8),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 2,
                            child: Text(
                              'Student',
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
                              'Submitted',
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
                              'Marks (0-3)',
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
                              'Remarks',
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
                              'Quality Tag',
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
                    studentAssignments.isEmpty
                        ? Center(
                      child: Text(
                        'No student assignments found.',
                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                      ),
                    )
                        : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: studentAssignments.length,
                      itemBuilder: (context, index) {
                        final sa = studentAssignments[index];
                        return Card(
                          color: const Color(0xFF1e1e1e),
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          child: Padding(
                            padding: const EdgeInsets.all(8),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    '${sa['student']['firstName']} ${sa['student']['lastName'] ?? ''}',
                                    style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    sa['isSubmitted'] ? 'Yes' : 'No',
                                    style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    sa['marksObtained']?.toString() ?? '-',
                                    style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    sa['remarks'] ?? '-',
                                    style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    sa['qualityTag'] ?? 'None',
                                    style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 8),
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