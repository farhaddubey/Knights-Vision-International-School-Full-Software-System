import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'package:intl/intl.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../api_service.dart';
import 'package:pdf/pdf.dart';

class ViewBooksDialog extends StatefulWidget {
  final bool open;
  final VoidCallback onClose;
  final String? classSubjectId;
  final String subjectName;
  final String? classId;

  const ViewBooksDialog({
    super.key,
    required this.open,
    required this.onClose,
    this.classSubjectId,
    required this.subjectName,
    this.classId,
  });

  @override
  State<ViewBooksDialog> createState() => _ViewBooksDialogState();
}

class _ViewBooksDialogState extends State<ViewBooksDialog> {
  final _apiService = ApiService();

  bool _loading = false;
  String? _error;
  List<dynamic> _books = [];
  List<dynamic> _filteredBooks = [];

  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Fetch on first open if we have required params
    if (widget.open && _hasRequiredParams()) {
      _fetchBooks();
    }
  }

  @override
  void didUpdateWidget(covariant ViewBooksDialog oldWidget) {
    super.didUpdateWidget(oldWidget);

    // Trigger fetch when:
    // - Dialog opens
    // - OR classId/classSubjectId becomes available while dialog is open
    final wasClosed = !oldWidget.open && widget.open;
    final paramsNowValid =
        _hasRequiredParams() && !_hasRequiredParams(oldWidget);

    if (wasClosed || paramsNowValid) {
      _fetchBooks();
    }
  }

  bool _hasRequiredParams([ViewBooksDialog? w]) {
    final widgetToCheck = w ?? widget;
    return widgetToCheck.open &&
        widgetToCheck.classSubjectId != null &&
        widgetToCheck.classId != null;
  }

  Future<void> _fetchBooks() async {
    if (!_hasRequiredParams()) {
      // Not ready yet — classId might still be loading from subjects
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
      _books = [];
      _filteredBooks = [];
      _searchController.clear();
    });

    try {
      final response = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/subject-books',
        queryParameters: {
          'classSubjectId': widget.classSubjectId!,
          'classId': widget.classId!,
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Server error ${response.statusCode}');
      }

      final data = jsonDecode(response.body);

      if (data['books'] is! List) {
        throw Exception('Invalid books data');
      }

      final rawBooks = data['books'] as List<dynamic>;

      final cleanedBooks = rawBooks
          .map((b) => {
                'title': (b['title'] ?? 'N/A').toString().trim(),
                'author': (b['author'] ?? 'N/A').toString().trim(),
                'publisher': (b['publisher'] ?? 'N/A').toString().trim(),
                'isbn': (b['isbn'] ?? 'N/A').toString().trim(),
                'bookType': (b['bookType'] ?? 'N/A').toString().trim(),
                'subjectName': widget.subjectName.trim(),
              })
          .toList();

      if (!mounted) return;
      setState(() {
        _books = cleanedBooks;
        _filteredBooks = cleanedBooks;
        _loading = false;
      });

      if (_books.isEmpty) {
        Fluttertoast.showToast(
          msg: 'No books found for ${widget.subjectName}',
          backgroundColor: Colors.orange,
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Failed to load books';
      });

      Fluttertoast.showToast(
        msg: 'Failed to load books',
        backgroundColor: Colors.red,
      );
    }
  }

  void _handleSearchChange(String value) {
    setState(() {
      final lower = value.toLowerCase();
      _filteredBooks = _books
          .where((book) =>
              book['title'].toLowerCase().contains(lower) ||
              book['author'].toLowerCase().contains(lower) ||
              book['publisher'].toLowerCase().contains(lower) ||
              book['bookType'].toLowerCase().contains(lower))
          .toList();
    });
  }

  Future<void> _generatePDF() async {
    if (_filteredBooks.isEmpty) {
      Fluttertoast.showToast(msg: 'No books to include in PDF');
      return;
    }

    try {
      final now = DateTime.now();
      final monthYear = DateFormat('MMMM yyyy').format(now);

      final pdf = pw.Document();
      final font = pw.Font.helvetica();
      final boldFont = pw.Font.helveticaBold();

      pdf.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(40),
          build: (context) => [
            pw.Header(
              level: 0,
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.center,
                children: [
                  pw.Text('Sure Success Point School',
                      style: pw.TextStyle(
                          font: boldFont,
                          fontSize: 24,
                          color: PdfColors.blue900)),
                  pw.Text(
                      'Institution of Humanism, Hardwork, Discipline, Technology & Excellence',
                      style: pw.TextStyle(fontSize: 10)),
                  pw.Text(
                      'www.sspointschool.in | Powered by Knights (KiREAD) Group',
                      style: pw.TextStyle(fontSize: 10)),
                  pw.SizedBox(height: 20),
                  pw.Text('BOOK LIST',
                      style: pw.TextStyle(font: boldFont, fontSize: 18)),
                  pw.Text('Subject: ${widget.subjectName} | $monthYear',
                      style: pw.TextStyle(fontSize: 12)),
                  pw.SizedBox(height: 20),
                ],
              ),
            ),
            pw.Table.fromTextArray(
              headers: ['Title', 'Subject', 'Author', 'Publisher', 'Book Type'],
              data: _filteredBooks
                  .map((book) => [
                        book['title'],
                        book['subjectName'],
                        book['author'],
                        book['publisher'],
                        book['bookType'],
                      ])
                  .toList(),
              headerStyle: pw.TextStyle(font: boldFont, color: PdfColors.white),
              headerDecoration: const pw.BoxDecoration(color: PdfColors.teal),
              cellStyle: const pw.TextStyle(fontSize: 10),
              cellAlignment: pw.Alignment.centerLeft,
              cellPadding: const pw.EdgeInsets.all(5),
            ),
            pw.SizedBox(height: 20),
            pw.Align(
              alignment: pw.Alignment.centerRight,
              child: pw.Text(
                  'Generated on: ${DateFormat('yyyy-MM-dd').format(now)}'),
            ),
          ],
        ),
      );

      final dir = await getTemporaryDirectory();
      final file = File(
          '${dir.path}/Books_${widget.subjectName.replaceAll(' ', '_')}.pdf');
      await file.writeAsBytes(await pdf.save());

      await OpenFile.open(file.path);

      Fluttertoast.showToast(
        msg: 'PDF generated and opened!',
        backgroundColor: Colors.green,
      );
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Failed to generate PDF',
        backgroundColor: Colors.red,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.open) return const SizedBox.shrink();

    return Material(
      color: const Color(0xFF181818),
      child: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFFb71c1c),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                'Books - ${widget.subjectName}',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
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
            leading: IconButton(
              icon: const Icon(Icons.close, color: Colors.white),
              onPressed: widget.onClose,
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.download, color: Colors.white),
                onPressed: _filteredBooks.isEmpty ? null : _generatePDF,
                tooltip: 'Download PDF',
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Search
                  TextField(
                    controller: _searchController,
                    onChanged: _handleSearchChange,
                    style: GoogleFonts.poppins(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Search books...',
                      hintStyle: GoogleFonts.poppins(color: Colors.white70),
                      prefixIcon:
                          const Icon(Icons.search, color: Color(0xFF00c757)),
                      filled: true,
                      fillColor: const Color(0xFF333333),
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.grey.shade700)),
                      focusedBorder: const OutlineInputBorder(
                          borderSide: BorderSide(color: Color(0xFF00c757))),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // States
                  if (_loading)
                    const Center(
                        child:
                            SpinKitCircle(color: Color(0xFF00c757), size: 80)),

                  if (_error != null)
                    Center(
                      child: Text(
                        _error!,
                        style: GoogleFonts.poppins(
                            color: Colors.red, fontSize: 16),
                        textAlign: TextAlign.center,
                      ),
                    ),

                  if (!_loading && _filteredBooks.isEmpty && _error == null)
                    Center(
                      child: Text(
                        'No books found for ${widget.subjectName}',
                        style: GoogleFonts.poppins(
                            color: Colors.white70, fontSize: 16),
                      ),
                    ),

                  // Books List
                  if (!_loading && _filteredBooks.isNotEmpty)
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _filteredBooks.length,
                      itemBuilder: (context, index) {
                        final book = _filteredBooks[index];
                        return Card(
                          color: const Color(0xFF1e1e1e),
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Title: ${book['title']}',
                                    style: GoogleFonts.poppins(
                                        color: const Color(0xFF00c757),
                                        fontWeight: FontWeight.bold)),
                                const SizedBox(height: 6),
                                Text('Subject: ${book['subjectName']}',
                                    style: GoogleFonts.poppins(
                                        color: Colors.white)),
                                Text('Author: ${book['author']}',
                                    style: GoogleFonts.poppins(
                                        color: Colors.white70)),
                                Text('Publisher: ${book['publisher']}',
                                    style: GoogleFonts.poppins(
                                        color: Colors.white70)),
                                Text('ISBN: ${book['isbn']}',
                                    style: GoogleFonts.poppins(
                                        color: Colors.white60)),
                                Text('Type: ${book['bookType']}',
                                    style: GoogleFonts.poppins(
                                        color: const Color(0xFF00c757))),
                              ],
                            ),
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
    );
  }
}
