import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'dart:io';
import '../api_service.dart';

class MonthlyHomeworkReportPage extends StatefulWidget {
  final int classSubjectId;
  final String className;
  final String subjectName;

  const MonthlyHomeworkReportPage({
    super.key,
    required this.classSubjectId,
    required this.className,
    required this.subjectName,
  });

  @override
  _MonthlyHomeworkReportPageState createState() =>
      _MonthlyHomeworkReportPageState();
}

class _MonthlyHomeworkReportPageState extends State<MonthlyHomeworkReportPage> {
  final _apiService = ApiService();
  List<dynamic> _homeworkRecords = [];
  List<dynamic> _filteredHomeworkRecords = [];
  bool _isLoading = false;
  String _searchQuery = '';
  List<Map<String, dynamic>> _months = [];
  int? _selectedMonth;
  final int _year = DateTime.now().year;

  @override
  void initState() {
    super.initState();
    _initializeMonths();
    _fetchHomeworkReport();
  }

  void _initializeMonths() {
    final monthList = List.generate(12, (i) {
      final monthIndex = i + 1;
      return {
        'month': monthIndex,
        'name': DateTime(_year, monthIndex).monthName,
      };
    });
    setState(() {
      _months = monthList;
      _selectedMonth = DateTime.now().month;
    });
  }

  Future<void> _fetchHomeworkReport() async {
    setState(() => _isLoading = true);
    try {
      final month =
          '${_year.toString().padLeft(4, '0')}-${(_selectedMonth ?? DateTime.now().month).toString().padLeft(2, '0')}';
      final response = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/students/myhomework',
        queryParameters: {
          'classSubjectId': '${widget.classSubjectId}',
          'month': month,
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (!mounted) return;
        setState(() {
          _homeworkRecords = (data['homeworkAssignments'] is List
                  ? data['homeworkAssignments']
                  : [])
              .map((record) => {
                    'date': record['date'],
                    'topicTitle':
                        record['subjectSyllabus']?['topic'] ?? 'Homework',
                    'homeworkDescription': record['homeworkDescription'] ?? '',
                    'subjectName': record['classSubject']?['subject']
                            ?['name'] ??
                        widget.subjectName,
                    'status': 'Published',
                    'homeworkDueDate': record['date'],
                  })
              .toList();
          _filteredHomeworkRecords = _homeworkRecords;
          _isLoading = false;
        });
      } else {
        throw Exception(
            'Failed to fetch homework report: ${response.statusCode}');
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    }
  }

  void _applySearchFilter() {
    setState(() {
      _filteredHomeworkRecords = _homeworkRecords.where((record) {
        final topicTitle = record['topicTitle']?.toLowerCase() ?? '';
        final homeworkDescription =
            record['homeworkDescription']?.toLowerCase() ?? '';
        return topicTitle.contains(_searchQuery.toLowerCase()) ||
            homeworkDescription.contains(_searchQuery.toLowerCase());
      }).toList();
    });
  }

  void _handleSearchChange(String value) {
    setState(() {
      _searchQuery = value;
      _applySearchFilter();
    });
  }

  Future<void> _generatePDF() async {
    try {
      final pdf = pw.Document();
      // Use GoogleFonts.poppins font family for PDF
      final font =
          pw.Font.helvetica(); // Fallback to Helvetica if GoogleFonts fails
      final boldFont = pw.Font.helveticaBold(); // Fallback for bold text

      pdf.addPage(
        pw.MultiPage(
          build: (pw.Context context) => [
            pw.Header(
              level: 0,
              child: pw.Text(
                'Monthly Homework Report - ${widget.className} - ${widget.subjectName} ($_year)',
                style: pw.TextStyle(
                  font: boldFont,
                  fontSize: 20,
                  fontWeight: pw.FontWeight.bold,
                ),
              ),
            ),
            pw.Table(
              border: pw.TableBorder.all(),
              columnWidths: {
                0: const pw.FixedColumnWidth(50),
                1: const pw.FlexColumnWidth(2),
                2: const pw.FlexColumnWidth(2),
                3: const pw.FlexColumnWidth(3),
                4: const pw.FlexColumnWidth(2),
              },
              children: [
                pw.TableRow(
                  children: [
                    pw.Text('Date',
                        style: pw.TextStyle(
                            font: boldFont, fontWeight: pw.FontWeight.bold)),
                    pw.Text('Topic',
                        style: pw.TextStyle(
                            font: boldFont, fontWeight: pw.FontWeight.bold)),
                    pw.Text('Homework',
                        style: pw.TextStyle(
                            font: boldFont, fontWeight: pw.FontWeight.bold)),
                    pw.Text('Status',
                        style: pw.TextStyle(
                            font: boldFont, fontWeight: pw.FontWeight.bold)),
                    pw.Text('Due Date',
                        style: pw.TextStyle(
                            font: boldFont, fontWeight: pw.FontWeight.bold)),
                  ],
                ),
                ..._filteredHomeworkRecords.map((record) => pw.TableRow(
                      children: [
                        pw.Text(_formatDate(record['date']),
                            style: pw.TextStyle(font: font)),
                        pw.Text(record['topicTitle'] ?? 'N/A',
                            style: pw.TextStyle(font: font)),
                        pw.Text(
                            record['homeworkDescription']
                                    ?.split('\n')
                                    .join(' ') ??
                                'N/A',
                            style: pw.TextStyle(font: font)),
                        pw.Text(record['status'] ?? 'N/A',
                            style: pw.TextStyle(font: font)),
                        pw.Text(_formatDate(record['homeworkDueDate']),
                            style: pw.TextStyle(font: font)),
                      ],
                    )),
              ],
            ),
          ],
        ),
      );

      final output = await getTemporaryDirectory();
      final file = File(
          '${output.path}/homework_report_${widget.classSubjectId}_$_selectedMonth.pdf');
      await file.writeAsBytes(await pdf.save());
      await OpenFile.open(file.path);
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Failed to generate or open PDF: $e',
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
                'Homework Report - ${widget.className} - ${widget.subjectName}',
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
          ),
          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Search Bar
                  Card(
                    color: const Color(0xFF111111),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 0, vertical: 2.0),
                      child: TextField(
                        onChanged: _handleSearchChange,
                        decoration: InputDecoration(
                          hintText: 'Search Topics or Homework...',
                          hintStyle: GoogleFonts.poppins(color: Colors.white70),
                          filled: true,
                          fillColor: const Color(0xFF333333),
                          border: const OutlineInputBorder(),
                          prefixIcon:
                              const Icon(Icons.search, color: Colors.white70),
                        ),
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Month Dropdown
                  Card(
                    color: const Color(0xFF111111),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8.0),
                      child: DropdownButton<int>(
                        value: _selectedMonth,
                        hint: Text('Select Month',
                            style: GoogleFonts.poppins(color: Colors.white)),
                        dropdownColor: const Color(0xFF333333),
                        isExpanded: true,
                        items: _months.map((month) {
                          return DropdownMenuItem<int>(
                            value: month['month'],
                            child: Text(month['name'],
                                style:
                                    GoogleFonts.poppins(color: Colors.white)),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() => _selectedMonth = value);
                          _fetchHomeworkReport();
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
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
                              flex: 1,
                              child: Text('Date',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('Topic',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('Homework',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 3,
                              child: Text('Status',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                          Expanded(
                              flex: 2,
                              child: Text('Due Date',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ),
                    // Homework Records List
                    _filteredHomeworkRecords.isEmpty
                        ? Center(
                            child: Text(
                              'No homework records found.',
                              style: GoogleFonts.poppins(
                                  color: Colors.white, fontSize: 16),
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _filteredHomeworkRecords.length,
                            itemBuilder: (context, index) {
                              final record = _filteredHomeworkRecords[index];
                              return Card(
                                color: const Color(0xFF181818),
                                margin: const EdgeInsets.symmetric(vertical: 2),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Date: ${_formatDate(record['date'])}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Topic: ${record['topicTitle'] ?? 'N/A'}',
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF00c757),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Homework: ${record['homeworkDescription']?.split('\n').join(' ') ?? 'N/A'}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            'Due Date: ${_formatDate(record['homeworkDueDate'])}',
                                            style: GoogleFonts.poppins(
                                                color: Colors.white),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 12, vertical: 6),
                                            decoration: BoxDecoration(
                                              color: (record['status'] ?? '')
                                                          .toLowerCase() ==
                                                      'completed'
                                                  ? const Color(0xFF00c757)
                                                  : const Color(0xFFFFC107),
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              record['status'] ?? 'N/A',
                                              style: GoogleFonts.poppins(
                                                  color: Colors.black,
                                                  fontWeight: FontWeight.w500),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                    const SizedBox(height: 8),
                    // Download PDF Button
                    ElevatedButton(
                      onPressed: _generatePDF,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00c757),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                      ),
                      child: Text(
                        'Download PDF',
                        style: GoogleFonts.poppins(color: Colors.white),
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
