import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../api_service.dart';

class ViewAllBooksDialog extends StatefulWidget {
  final bool open;
  final VoidCallback onClose;
  final String? classId;
  final String className;
  final int academicYear;

  const ViewAllBooksDialog({
    super.key,
    required this.open,
    required this.onClose,
    this.classId,
    required this.className,
    required this.academicYear,
  });

  @override
  State<ViewAllBooksDialog> createState() => _ViewAllBooksDialogState();
}

class _ViewAllBooksDialogState extends State<ViewAllBooksDialog> {
  final _apiService = ApiService();
  bool _loading = true;
  String? _error;
  List<dynamic> _books = [];
  List<dynamic> _filteredBooks = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void didUpdateWidget(covariant ViewAllBooksDialog oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.open && !oldWidget.open) {
      _loadAndFetchBooks();
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.open) {
      _loadAndFetchBooks();
    }
  }

  Future<void> _loadAndFetchBooks() async {
    setState(() => _loading = true);

    try {
      await _fetchBooks();
    } catch (e) {
      setState(() {
        _error = 'Failed to initialize: ${e.toString()}';
        _loading = false;
      });
      Fluttertoast.showToast(
        msg: 'Initialization failed',
        backgroundColor: Colors.red,
      );
    }
  }

  Future<void> _fetchBooks() async {
    try {
      final response = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/subject-books/all',
      );

      if (response.statusCode != 200) {
        throw Exception('Server error: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      final List rawBooks = data['books'] ?? [];

      final cleanedBooks = rawBooks
          .map((b) => {
                'title': (b['title'] ?? 'N/A').toString().trim(),
                'subjectName':
                    (b['subjectName'] ?? 'Unknown Subject').toString().trim(),
                'author': (b['author'] ?? 'N/A').toString().trim(),
                'publisher': (b['publisher'] ?? 'N/A').toString().trim(),
                'isbn': (b['isbn'] ?? 'N/A').toString().trim(),
                'bookType': (b['bookType'] ?? 'N/A').toString().trim(),
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
          msg: 'No books found for Class ${widget.className}',
          backgroundColor: Colors.orange,
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Failed to load books';
        _loading = false;
      });
      Fluttertoast.showToast(
        msg: 'Network or server error',
        backgroundColor: Colors.red,
      );
    }
  }

  void _handleSearch(String value) {
    setState(() {
      final lower = value.toLowerCase();
      _filteredBooks = _books
          .where((book) =>
              book['title'].toLowerCase().contains(lower) ||
              book['subjectName'].toLowerCase().contains(lower) ||
              book['author'].toLowerCase().contains(lower) ||
              book['publisher'].toLowerCase().contains(lower) ||
              book['bookType'].toLowerCase().contains(lower))
          .toList();
    });
  }

  // Server-side PDF generation (perfect fonts, logos, layout)
  Future<void> _downloadPDF() async {
    if (_books.isEmpty) {
      Fluttertoast.showToast(msg: 'No books to include in PDF');
      return;
    }

    Fluttertoast.showToast(
      msg: 'Generating PDF, please wait...',
      toastLength: Toast.LENGTH_LONG,
    );

    try {
      final response = await _apiService.authorizedPost(
        '/api/generate-pdf',
        body: {
          'books': _books,
          'className': widget.className,
          'academicYear': widget.academicYear,
        },
      );

      if (response.statusCode != 200) {
        throw Exception('PDF generation failed');
      }

      final bytes = response.bodyBytes;
      final dir = await getTemporaryDirectory();
      final fileName =
          'AllBooks_${widget.className}_${widget.academicYear}.pdf';
      final file = File('${dir.path}/$fileName');
      await file.writeAsBytes(bytes);

      await OpenFile.open(file.path);

      Fluttertoast.showToast(
        msg: 'PDF downloaded and opened!',
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
            backgroundColor: const Color(0xFF009688),
            title: Text(
              'All Books - ${widget.className.toUpperCase()} (${widget.academicYear})',
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.bold,
                color: Colors.white,
                fontSize: 16,
              ),
            ),
            leading: IconButton(
              icon: const Icon(Icons.close, color: Colors.white),
              onPressed: widget.onClose,
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.download, color: Colors.white),
                onPressed: _books.isEmpty ? null : _downloadPDF,
                tooltip: 'Download PDF',
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Search Bar
                  TextField(
                    controller: _searchController,
                    onChanged: _handleSearch,
                    style: GoogleFonts.poppins(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Search books by title, subject, author...',
                      hintStyle: GoogleFonts.poppins(color: Colors.white70),
                      prefixIcon:
                          const Icon(Icons.search, color: Color(0xFF00c757)),
                      filled: true,
                      fillColor: const Color(0xFF333333),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: const BorderSide(color: Color(0xFF00c757)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

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
                        'No books found for Class ${widget.className}',
                        style: GoogleFonts.poppins(
                            color: Colors.white70, fontSize: 16),
                      ),
                    ),

                  if (!_loading && _filteredBooks.isNotEmpty)
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _filteredBooks.length,
                      itemBuilder: (context, index) {
                        final book = _filteredBooks[index];
                        return Card(
                          color: const Color(0xFF222222),
                          margin: const EdgeInsets.symmetric(vertical: 6),
                          elevation: 2,
                          child: Padding(
                            padding: const EdgeInsets.all(14.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  book['subjectName'],
                                  style: GoogleFonts.poppins(
                                    color: const Color(0xFF00c757),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Title: ${book['title']}',
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 4),
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
