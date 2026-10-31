import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../constants.dart';
import 'view_improvement_suggestion_dialog.dart';

class MyImprovementSuggestionsPage extends StatefulWidget {
  const MyImprovementSuggestionsPage({super.key});

  @override
  _MyImprovementSuggestionsPageState createState() => _MyImprovementSuggestionsPageState();
}

class _MyImprovementSuggestionsPageState extends State<MyImprovementSuggestionsPage> {
  final _storage = const FlutterSecureStorage();
  bool _loading = false;
  String? _error;
  String _className = '';
  List<dynamic> _suggestions = [];
  List<dynamic> _filteredSuggestions = [];
  String _searchQuery = '';
  int _page = 1;
  int _totalPages = 1;
  bool _viewDialogOpen = false;
  dynamic _selectedSuggestion;
  final Map<String, dynamic> _formData = {'category': 'DISCIPLINE', 'message': ''};
  final int _pageSize = 100;
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();
  static const greenAccent = Color(0xFF00c757);

  final List<String> _suggestionCategories = [
    'DISCIPLINE',
    'UNIFORM',
    'SYLLABUS',
    'HOMEWORK',
    'TEACHER_BEHAVIOR',
    'CLEANLINESS',
    'TRANSPORT',
    'EXTRACURRICULAR',
    'TIMETABLE',
    'OTHER',
  ];

  @override
  void initState() {
    super.initState();
    _fetchSuggestions();
  }

  Future<void> _fetchSuggestions({int pageNum = 1, String search = ''}) async {
    setState(() {
      _loading = true;
      _searchQuery = search;
      _searchController.text = search;
    });
    final token = await _storage.read(key: 'student_token');
    if (token == null) {
      setState(() {
        _error = 'User not authenticated. Please log in.';
        _loading = false;
      });
      Fluttertoast.showToast(
        msg: 'User not authenticated. Please log in.',
        backgroundColor: Colors.red,
      );
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    try {
      print('Fetching suggestions for page: $pageNum, search: $search');
      print('Fetch URL: $BASE_URL/api/a1-knights-students-panel/students/myimprovementsuggestions?page=$pageNum&pageSize=$_pageSize&searchQuery=$search');
      final response = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/students/myimprovementsuggestions?page=$pageNum&pageSize=$_pageSize&searchQuery=$search'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Fetch response status: ${response.statusCode}');

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['suggestions'] is List) {
        setState(() {
          _suggestions = data['suggestions'].map((s) => {
            'id': s['id']?.toString().split('\n').join(' ') ?? 'N/A',
            'category': s['category']?.toString().split('\n').join(' ') ?? 'N/A',
            'message': s['message']?.toString().split('\n').join(' ') ?? 'N/A',
            'responseMessage': s['responseMessage']?.toString().split('\n').join(' ') ?? 'N/A',
            'month': s['month'] ?? 0,
            'year': s['year'] ?? 0,
          }).toList();
          _filteredSuggestions = _suggestions;
          _totalPages = data['totalPages'] ?? 1;
          _className = data['className']?.toString().split('\n').join(' ') ?? '';
          _error = null;
          _loading = false;
        });
      } else {
        throw Exception('Invalid response format: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching suggestions: $e');
      print(stackTrace);
      setState(() {
        _error = 'Failed to fetch improvement suggestions: ${e.toString().replaceFirst('Exception: ', '')}';
        _loading = false;
      });
      Fluttertoast.showToast(
        msg: 'Failed to fetch improvement suggestions: ${e.toString().replaceFirst('Exception: ', '')}',
        backgroundColor: Colors.red,
      );
    }
  }

  void _handleSearchChange(String value) {
    setState(() {
      _searchQuery = value;
      _page = 1;
    });
    _fetchSuggestions(pageNum: 1, search: value);
    print('Search query: $value');
  }

  void _handlePageChange(int value) {
    setState(() => _page = value);
    _fetchSuggestions(pageNum: value, search: _searchQuery);
  }

  void _handleFormChange(String field, String value) {
    setState(() => _formData[field] = value);
  }

  Future<void> _submitSuggestion() async {
    final token = await _storage.read(key: 'student_token');
    if (token == null) {
      Fluttertoast.showToast(
        msg: 'User not authenticated. Please log in.',
        backgroundColor: Colors.red,
      );
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    if (_formData['category'].isEmpty || _formData['message'].isEmpty) {
      Fluttertoast.showToast(
        msg: 'Please select a category and provide a suggestion.',
        backgroundColor: Colors.red,
      );
      return;
    }

    setState(() => _loading = true);
    try {
      final currentDate = DateTime.now();
      print('Submitting suggestion');
      print('Submit URL: $BASE_URL/api/a1-knights-students-panel/students/myimprovementsuggestions');
      final response = await http.post(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/students/myimprovementsuggestions'),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
        body: jsonEncode({
          'category': _formData['category'],
          'message': _formData['message'],
          'month': currentDate.month,
          'year': currentDate.year,
        }),
      );
      print('Submit response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        setState(() {
          _formData['category'] = 'DISCIPLINE';
          _formData['message'] = '';
          _messageController.clear();
          _searchQuery = '';
          _searchController.clear();
        });
        await _fetchSuggestions(pageNum: 1);
        Fluttertoast.showToast(
          msg: 'Suggestion submitted successfully!',
          backgroundColor: Colors.green,
        );
      } else if (response.statusCode == 409) {
        Fluttertoast.showToast(
          msg: 'You have already submitted a suggestion for this month.',
          backgroundColor: Colors.red,
        );
      } else {
        throw Exception('Failed to submit suggestion: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error submitting suggestion: $e');
      print(stackTrace);
      Fluttertoast.showToast(
        msg: 'Failed to submit suggestion: ${e.toString().replaceFirst('Exception: ', '')}',
        backgroundColor: Colors.red,
      );
    } finally {
      setState(() => _loading = false);
    }
  }

  void _openViewDialog(dynamic suggestion) {
    setState(() {
      _selectedSuggestion = suggestion;
      _viewDialogOpen = true;
      _searchQuery = '';
      _searchController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading && _suggestions.isEmpty) {
      return Scaffold(
        backgroundColor: const Color(0xFF181818),
        body: const Center(
          child: SpinKitCircle(color: greenAccent, size: 120),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF181818),
        body: Center(
          child: Text(
            _error!,
            style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // Sticky Header
              SliverAppBar(
                pinned: true,
                backgroundColor: const Color(0xFFb71c1c),
                flexibleSpace: FlexibleSpaceBar(
                  centerTitle: true,
                  title: Text(
                    'My Improvement Suggestions - Class $_className',
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
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [

                      // Suggestion Form
                      Card(
                        color: const Color(0xFF1e1e1e),
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '💡 How Can We Improve Better?',
                                style: GoogleFonts.poppins(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '👉 Tell us honestly — What should be improved this month?',
                                style: GoogleFonts.poppins(color: Colors.white),
                              ),
                              const SizedBox(height: 16),
                              SizedBox(
                                width: 200,
                                child:  DropdownButtonFormField<String>(
                                  value: _formData['category'],
                                  decoration: InputDecoration(
                                    labelText: 'Category',
                                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                    filled: true,
                                    fillColor: const Color(0xFF333333),
                                    border: const OutlineInputBorder(),
                                  ),
                                  dropdownColor: const Color(0xFF333333),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                  items: _suggestionCategories
                                      .map((category) => DropdownMenuItem(
                                    value: category,
                                    child: Text(category, style: GoogleFonts.poppins()),
                                  ))
                                      .toList(),
                                  onChanged: (value) => _handleFormChange('category', value!),
                                ),
                              ),
                              const SizedBox(height: 24),
                              Row(
                                children: [
                                  Expanded(
                                    flex: 2,
                                    child: TextField(
                                      controller: _messageController,
                                      maxLines: 4,
                                      maxLength: 1000,
                                      style: GoogleFonts.poppins(color: Colors.white),
                                      decoration: InputDecoration(
                                        labelText: 'Your Suggestion',
                                        labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                        filled: true,
                                        fillColor: const Color(0xFF333333),
                                        border: const OutlineInputBorder(),
                                      ),
                                      onChanged: (value) => _handleFormChange('message', value),
                                    ),
                                  ),
                                ],
                              ),

                              const SizedBox(height: 16),
                              OutlinedButton(
                                onPressed: _loading || _formData['category'].isEmpty || _formData['message'].isEmpty ? null : _submitSuggestion,
                                style: OutlinedButton.styleFrom(
                                  side: BorderSide(color: greenAccent),
                                  foregroundColor: greenAccent,
                                ),
                                child: Text('Submit Suggestion', style: GoogleFonts.poppins()),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Table Header
                      Container(
                        color: const Color(0xFF333333),
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            Expanded(flex: 1, child: Text('ID', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('Category', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 3, child: Text('Message', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 3, child: Text('Response', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('Action', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          ],
                        ),
                      ),
                      // Suggestions List
                      _filteredSuggestions.isEmpty
                          ? Center(
                        child: Text(
                          'No improvement suggestions found.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                          : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _filteredSuggestions.length,
                        itemBuilder: (context, index) {
                          final suggestion = _filteredSuggestions[index];
                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 2),
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'ID: ${suggestion['id']}',
                                    style: GoogleFonts.poppins(
                                      color: greenAccent,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Category: ${suggestion['category']}',
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Message: ${suggestion['message']}',
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Response: ${suggestion['responseMessage']}',
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  OutlinedButton(
                                    onPressed: () => _openViewDialog(suggestion),
                                    style: OutlinedButton.styleFrom(
                                      side: BorderSide(color: greenAccent),
                                      foregroundColor: greenAccent,
                                    ),
                                    child: Text('View', style: GoogleFonts.poppins()),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 8),
                      // Pagination Controls
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.chevron_left, color: greenAccent),
                            onPressed: _page > 1 ? () => _handlePageChange(_page - 1) : null,
                          ),
                          Text(
                            'Page $_page of $_totalPages',
                            style: GoogleFonts.poppins(color: Colors.white),
                          ),
                          IconButton(
                            icon: const Icon(Icons.chevron_right, color: greenAccent),
                            onPressed: _page < _totalPages ? () => _handlePageChange(_page + 1) : null,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          // View Suggestion Dialog
          if (_viewDialogOpen)
            ViewImprovementSuggestionDialog(
              open: _viewDialogOpen,
              onClose: () => setState(() => _viewDialogOpen = false),
              suggestion: _selectedSuggestion,
              className: _className,
            ),
        ],
      ),
    );
  }
}
