import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants.dart';

class ViewBooksPage extends StatefulWidget {
  final int classSubjectId;
  final String subjectName;
  final String className;

  const ViewBooksPage({
    super.key,
    required this.classSubjectId,
    required this.subjectName,
    required this.className,
  });

  @override
  _ViewBooksPageState createState() => _ViewBooksPageState();
}

class _ViewBooksPageState extends State<ViewBooksPage> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _books = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchBooks();
  }

  Future<void> _fetchBooks() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SubjectBooks/${widget.className.toLowerCase()}/subject-books?classSubjectId=${widget.classSubjectId}'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> books = data['books'] ?? [];
        final invalidBooks = <String>[];
        final validBooks = books.where((book) {
          final isValid = book['id'] != null && book['title'] != null && book['bookType'] != null;
          if (!isValid) {
            invalidBooks.add(
                '${book['title'] ?? 'Unknown'} (Missing: ' +
                    [
                      if (book['id'] == null) 'id',
                      if (book['title'] == null) 'title',
                      if (book['bookType'] == null) 'bookType',
                    ].join(', ') +
                    ')');
          }
          return isValid;
        }).toList();

        setState(() {
          _books = validBooks;
          _isLoading = false;
          if (validBooks.isEmpty && books.isNotEmpty) {
            _errorMessage = 'No valid books found. Invalid books: ${invalidBooks.join('; ')}. Please contact support.';
          }
        });
      } else {
        throw Exception('Failed to fetch books: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      print('Error in _fetchBooks: $errorMessage');
      setState(() {
        _isLoading = false;
        _errorMessage = errorMessage;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to fetch books')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFF009688),
        title: Row(
          children: [
            const Icon(Icons.calendar_today, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              'Books for ${widget.subjectName}',
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.close, color: Color(0xFFf44336)),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: _errorMessage != null
            ? Center(
          child: Text(
            _errorMessage!,
            style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
            textAlign: TextAlign.center,
          ),
        )
            : _isLoading
            ? const Center(
          child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
        )
            : _books.isEmpty
            ? Center(
          child: Text(
            'No books found for this subject.',
            style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
          ),
        )
            : ListView.builder(
          itemCount: _books.length,
          itemBuilder: (context, index) {
            final book = _books[index];
            return Card(
              color: const Color(0xFF111111),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              margin: const EdgeInsets.symmetric(vertical: 4),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                title: Text(
                  book['title'],
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      book['bookType'],
                      style: GoogleFonts.poppins(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Author: ${book['author'] ?? 'N/A'}',
                      style: GoogleFonts.poppins(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      'Publisher: ${book['publisher'] ?? 'N/A'}',
                      style: GoogleFonts.poppins(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      'ISBN: ${book['isbn'] ?? 'N/A'}',
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
      ),
    );
  }
}