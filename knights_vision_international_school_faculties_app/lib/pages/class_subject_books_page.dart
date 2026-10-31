import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:sure_success_point_school_faculties_app/pages/view_books_dialog.dart';
import '../constants.dart';

class ClassSubjectBooksPage extends StatefulWidget {
  const ClassSubjectBooksPage({super.key});

  @override
  _ClassSubjectBooksPageState createState() => _ClassSubjectBooksPageState();
}

class _ClassSubjectBooksPageState extends State<ClassSubjectBooksPage> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _subjects = [];
  List<dynamic> _filteredSubjects = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _searchQuery = '';
  int _page = 1;
  int _totalPages = 1;
  final int _pageSize = 10;

  @override
  void initState() {
    super.initState();
    _fetchSubjects();
  }

  Future<void> _fetchSubjects() async {
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
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/class-subjects?page=$_page&pageSize=$_pageSize&searchQuery=$_searchQuery'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> subjects = data['classSubjects'] ?? [];
        final invalidSubjects = <String>[];
        final validSubjects = subjects.where((subject) {
          final isValid = subject['id'] != null &&
              subject['classId'] != null &&
              subject['subjectId'] != null &&
              subject['className'] != null &&
              subject['subject'] != null &&
              subject['subject']['name'] != null;
          if (!isValid) {
            invalidSubjects.add(
                '${subject['className'] ?? 'Unknown'} - ${subject['subject']?['name'] ?? 'Unknown'} (Missing: ' +
                    [
                      if (subject['id'] == null) 'id',
                      if (subject['classId'] == null) 'classId',
                      if (subject['subjectId'] == null) 'subjectId',
                      if (subject['className'] == null) 'className',
                      if (subject['subject'] == null || subject['subject']['name'] == null) 'subject.name',
                    ].join(', ') +
                    ')');
          } else if (subject['branchId'] == null || subject['schoolId'] == null) {
            invalidSubjects.add(
                '${subject['className']} - ${subject['subject']['name']} (Missing: ' +
                    [
                      if (subject['branchId'] == null) 'branchId',
                      if (subject['schoolId'] == null) 'schoolId',
                    ].join(', ') +
                    ')');
          }
          return isValid;
        }).toList();

        setState(() {
          _subjects = validSubjects;
          _filteredSubjects = validSubjects;
          _totalPages = data['totalPages'] ?? 1;
          _isLoading = false;
          if (validSubjects.isEmpty && subjects.isNotEmpty) {
            _errorMessage = 'No valid subjects found. Invalid subjects: ${invalidSubjects.join('; ')}. Please contact support.';
          }
        });
      } else {
        throw Exception('Failed to fetch subjects: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      print('Error in _fetchSubjects: $errorMessage');
      setState(() {
        _isLoading = false;
        _errorMessage = errorMessage;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to fetch subjects')),
      );
    }
  }

  void _filterSubjects(String query) {
    setState(() {
      _searchQuery = query;
      _filteredSubjects = _subjects.where((subject) {
        final subjectName = subject['subject']['name'].toString().toLowerCase();
        final className = subject['className'].toString().toLowerCase();
        return subjectName.contains(query.toLowerCase()) || className.contains(query.toLowerCase());
      }).toList();
    });
  }

  void _handleOpenViewBooksPage(Map<String, dynamic> subject) {
    final missingFields = [];
    if (subject['id'] == null) missingFields.add('id');
    if (subject['classId'] == null) missingFields.add('classId');
    if (subject['subjectId'] == null) missingFields.add('subjectId');
    if (subject['className'] == null) missingFields.add('className');
    if (subject['subject'] == null || subject['subject']['name'] == null) {
      missingFields.add('subject.name');
    }

    if (missingFields.isNotEmpty) {
      print('Cannot navigate to view books page for invalid subject: $subject - Missing fields: ${missingFields.join(', ')}');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Cannot view books for ${subject['subject']?['name'] ?? 'unknown subject'}: missing data (${missingFields.join(', ')}).',
          ),
        ),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ViewBooksPage(
          classSubjectId: subject['id'],
          subjectName: subject['subject']['name'],
          className: subject['className'],
        ),
      ),
    );
  }

  void _showAddBooksDialog(Map<String, dynamic> subject) {
    showDialog(
      context: context,
      builder: (context) => AddBooksDialog(
        classSubjectId: subject['id'],
        subjectName: subject['subject']['name'],
        className: subject['className'],
        onSave: _fetchSubjects,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFFb71c1c),
        title: Row(
          children: [
            const Icon(Icons.book, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              'My Classes Subject Books',
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
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Card(
              color: const Color(0xFF111111),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 2.0),
                child: TextField(
                  onChanged: _filterSubjects,
                  decoration: InputDecoration(
                    hintText: 'Search Subjects or Classes...',
                    hintStyle: GoogleFonts.poppins(color: Colors.white70),
                    filled: true,
                    fillColor: const Color(0xFF333333),
                    border: const OutlineInputBorder(borderSide: BorderSide.none),
                    prefixIcon: const Icon(Icons.search, color: Colors.white70),
                  ),
                  style: GoogleFonts.poppins(color: Colors.white),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
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
                  : _filteredSubjects.isEmpty
                  ? Center(
                child: Text(
                  'No subjects found for your classes.',
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                ),
              )
                  : ListView.builder(
                itemCount: _filteredSubjects.length,
                itemBuilder: (context, index) {
                  final subject = _filteredSubjects[index];
                  return Card(
                    color: const Color(0xFF111111),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(16),
                      title: Row(
                        children: [
                          Text(
                            'ID: ${subject['id']}',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Text(
                              subject['className'],
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ],
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            subject['subject']['name'],
                            style: GoogleFonts.poppins(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Description: ${subject['subject']['description'] ?? 'N/A'}',
                            style: GoogleFonts.poppins(
                              color: Colors.white70,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              OutlinedButton(
                                onPressed: () => _handleOpenViewBooksPage(subject),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: const Color(0xFF00c757),
                                  side: const BorderSide(color: Color(0xFF00c757)),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: Text(
                                  'View Books',
                                  style: GoogleFonts.poppins(
                                    color: const Color(0xFF00c757),
                                    fontSize: 12,
                                  ),
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
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left, color: Colors.white),
                  onPressed: _page > 1
                      ? () {
                    setState(() {
                      _page--;
                    });
                    _fetchSubjects();
                  }
                      : null,
                ),
                Text(
                  'Page $_page of $_totalPages',
                  style: GoogleFonts.poppins(color: Colors.white),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right, color: Colors.white),
                  onPressed: _page < _totalPages
                      ? () {
                    setState(() {
                      _page++;
                    });
                    _fetchSubjects();
                  }
                      : null,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class AddBooksDialog extends StatefulWidget {
  final int classSubjectId;
  final String subjectName;
  final String className;
  final VoidCallback onSave;

  const AddBooksDialog({
    super.key,
    required this.classSubjectId,
    required this.subjectName,
    required this.className,
    required this.onSave,
  });

  @override
  _AddBooksDialogState createState() => _AddBooksDialogState();
}

class _AddBooksDialogState extends State<AddBooksDialog> {
  final _storage = const FlutterSecureStorage();
  final _titleController = TextEditingController();
  final _authorController = TextEditingController();
  final _publisherController = TextEditingController();
  final _isbnController = TextEditingController();
  String _bookType = 'TEXTBOOK';
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _addBook() async {
    if (_titleController.text.isEmpty || _bookType.isEmpty) {
      setState(() {
        _errorMessage = 'Title and book type are required';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/SubjectBooks/${widget.className.toLowerCase()}/subject-books'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'classSubjectId': widget.classSubjectId,
          'title': _titleController.text,
          'author': _authorController.text.isNotEmpty ? _authorController.text : null,
          'publisher': _publisherController.text.isNotEmpty ? _publisherController.text : null,
          'isbn': _isbnController.text.isNotEmpty ? _isbnController.text : null,
          'bookType': _bookType,
        }),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Book added successfully')),
        );
        widget.onSave();
        Navigator.pop(context);
      } else {
        throw Exception('Failed to add book: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage ?? 'Failed to add book')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _authorController.dispose();
    _publisherController.dispose();
    _isbnController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF111111),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      title: Text(
        'Add Book for ${widget.subjectName} - ${widget.className}',
        style: GoogleFonts.poppins(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_errorMessage != null)
              Text(
                _errorMessage!,
                style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
              )
            else if (_isLoading)
              const SpinKitCircle(color: Color(0xFF00c757), size: 120)
            else ...[
                TextField(
                  controller: _titleController,
                  decoration: InputDecoration(
                    hintText: 'Title *',
                    hintStyle: GoogleFonts.poppins(color: Colors.white70),
                    filled: true,
                    fillColor: const Color(0xFF333333),
                    border: const OutlineInputBorder(borderSide: BorderSide.none),
                    prefixIcon: const Icon(Icons.book, color: Colors.white70),
                  ),
                  style: GoogleFonts.poppins(color: Colors.white),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _authorController,
                  decoration: InputDecoration(
                    hintText: 'Author',
                    hintStyle: GoogleFonts.poppins(color: Colors.white70),
                    filled: true,
                    fillColor: const Color(0xFF333333),
                    border: const OutlineInputBorder(borderSide: BorderSide.none),
                    prefixIcon: const Icon(Icons.person, color: Colors.white70),
                  ),
                  style: GoogleFonts.poppins(color: Colors.white),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _publisherController,
                  decoration: InputDecoration(
                    hintText: 'Publisher',
                    hintStyle: GoogleFonts.poppins(color: Colors.white70),
                    filled: true,
                    fillColor: const Color(0xFF333333),
                    border: const OutlineInputBorder(borderSide: BorderSide.none),
                    prefixIcon: const Icon(Icons.business, color: Colors.white70),
                  ),
                  style: GoogleFonts.poppins(color: Colors.white),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _isbnController,
                  decoration: InputDecoration(
                    hintText: 'ISBN',
                    hintStyle: GoogleFonts.poppins(color: Colors.white70),
                    filled: true,
                    fillColor: const Color(0xFF333333),
                    border: const OutlineInputBorder(borderSide: BorderSide.none),
                    prefixIcon: const Icon(Icons.code, color: Colors.white70),
                  ),
                  style: GoogleFonts.poppins(color: Colors.white),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: _bookType,
                  items: ['TEXTBOOK', 'REFERENCE', 'GUIDE'].map((type) {
                    return DropdownMenuItem(
                      value: type,
                      child: Text(
                        type,
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _bookType = value!;
                    });
                  },
                  decoration: InputDecoration(
                    hintText: 'Book Type *',
                    hintStyle: GoogleFonts.poppins(color: Colors.white70),
                    filled: true,
                    fillColor: const Color(0xFF333333),
                    border: const OutlineInputBorder(borderSide: BorderSide.none),
                    prefixIcon: const Icon(Icons.category, color: Colors.white70),
                  ),
                  dropdownColor: const Color(0xFF333333),
                  style: GoogleFonts.poppins(color: Colors.white),
                ),
              ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            'Cancel',
            style: GoogleFonts.poppins(color: Colors.red),
          ),
        ),
        ElevatedButton(
          onPressed: _addBook,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF00c757),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: Text(
            'Add Book',
            style: GoogleFonts.poppins(color: Colors.black, fontSize: 12),
          ),
        ),
      ],
    );
  }
}