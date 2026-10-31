import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants.dart';

class ClassPunishmentsPage extends StatefulWidget {
  const ClassPunishmentsPage({super.key});

  @override
  _ClassPunishmentsPageState createState() => _ClassPunishmentsPageState();
}

class _ClassPunishmentsPageState extends State<ClassPunishmentsPage> with SingleTickerProviderStateMixin {
  final _storage = const FlutterSecureStorage();
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _punishments = [];
  List<dynamic> _filteredPunishments = [];
  List<String> _classNames = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _searchQuery = '';
  int _currentPage = 1;
  int _totalPages = 1;
  static const int _pageSize = 100;
  TabController? _tabController;

  @override
  void initState() {
    super.initState();
    _fetchData();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    _tabController?.dispose();
    super.dispose();
  }

  Future<void> _fetchData({int page = 1, String search = ''}) async {
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
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/punishments?page=$page&pageSize=$_pageSize&searchQuery=$search'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> punishments = data['punishments'] ?? [];
        final invalidPunishments = <String>[];
        final validPunishments = punishments.where((p) {
          final isValid = p['id'] != null && p['title'] != null && p['type'] != null && p['severity'] != null;
          if (!isValid) {
            invalidPunishments.add(
                '${p['title'] ?? 'Unknown'} (Missing: ' +
                    [
                      if (p['id'] == null) 'id',
                      if (p['title'] == null) 'title',
                      if (p['type'] == null) 'type',
                      if (p['severity'] == null) 'severity',
                    ].join(', ') +
                    ')');
          }
          return isValid;
        }).toList();

        // Sort by severity (descending)
        validPunishments.sort((a, b) => (b['severity'] as int).compareTo(a['severity'] as int));

        // Extract unique class names
        final classNames = validPunishments
            .map((p) => p['className']?.toString() ?? 'Unassigned')
            .toSet()
            .toList()
          ..sort();

        setState(() {
          _punishments = validPunishments;
          _filteredPunishments = validPunishments;
          _classNames = classNames.isEmpty ? ['Unassigned'] : classNames;
          _totalPages = data['totalPages'] ?? 1;
          _currentPage = page;
          _isLoading = false;
          if (validPunishments.isEmpty && punishments.isNotEmpty) {
            _errorMessage = 'No valid punishments found. Invalid punishments: ${invalidPunishments.join('; ')}. Please contact support.';
          }
          _tabController?.dispose();
          _tabController = TabController(length: _classNames.length, vsync: this);
        });
      } else {
        throw Exception('Failed to fetch punishments: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      print('Error in _fetchData: $errorMessage');
      setState(() {
        _isLoading = false;
        _errorMessage = errorMessage;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_errorMessage ?? 'Failed to fetch punishments')),
        );
      });
    }
  }

  void _onSearchChanged() {
    setState(() {
      _searchQuery = _searchController.text;
      _filteredPunishments = _punishments.where((p) {
        final title = p['title']?.toString().toLowerCase() ?? '';
        final className = p['className']?.toString().toLowerCase() ?? '';
        final description = p['description']?.toString().toLowerCase() ?? '';
        return title.contains(_searchQuery.toLowerCase()) ||
            className.contains(_searchQuery.toLowerCase()) ||
            description.contains(_searchQuery.toLowerCase());
      }).toList();
    });
  }

  void _onPageChanged(int page) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      setState(() {
        _currentPage = page;
      });
      _fetchData(page: page, search: _searchController.text);
    });
  }

  Color _getPunishmentTypeColor(String type) {
    switch (type) {
      case 'BEHAVIORAL':
        return const Color(0xFFF44336); // Red
      case 'ACADEMIC':
        return const Color(0xFF2196F3); // Blue
      case 'PHYSICAL_TASK':
        return const Color(0xFFFF9800); // Orange
      case 'PRIVILEGE_LOSS':
        return const Color(0xFF9C27B0); // Purple
      case 'COUNSELING':
        return const Color(0xFF4CAF50); // Green
      default:
        return Colors.white70;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFFb71c1c),
        title: Row(
          children: [
            const Icon(Icons.gavel, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              'My Classes Punishments',
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
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search Punishments or Classes...',
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
            if (_classNames.isNotEmpty && !_isLoading)
              TabBar(
                controller: _tabController,
                isScrollable: true,
                labelStyle: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold),
                unselectedLabelStyle: GoogleFonts.poppins(fontSize: 14),
                labelColor: const Color(0xFF00c757),
                unselectedLabelColor: Colors.white70,
                indicatorColor: const Color(0xFF00c757),
                tabs: _classNames.map((className) => Tab(text: className)).toList(),
              ),
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
                  : _filteredPunishments.isEmpty
                  ? Center(
                child: Text(
                  'No punishments found.',
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                ),
              )
                  : TabBarView(
                controller: _tabController,
                children: _classNames.map((className) {
                  final classPunishments = _filteredPunishments
                      .where((p) => (p['className']?.toString() ?? 'Unassigned') == className)
                      .toList();
                  return ListView.builder(
                    itemCount: classPunishments.length,
                    itemBuilder: (context, index) {
                      final punishment = classPunishments[index];
                      final typeColor = _getPunishmentTypeColor(punishment['type']);
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
                                'ID: ${punishment['id']}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Text(
                                  punishment['title'],
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
                                punishment['type'],
                                style: GoogleFonts.poppins(
                                  color: typeColor,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Class: ${punishment['className'] ?? 'Unassigned'}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                'Description: ${punishment['description'] ?? 'N/A'}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                'Severity: ${punishment['severity']}/5',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                'Created: ${punishment['createdAt'] != null ? DateTime.parse(punishment['createdAt']).toString().split('.')[0] : 'N/A'}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                'Updated: ${punishment['updatedAt'] != null ? DateTime.parse(punishment['updatedAt']).toString().split('.')[0] : 'N/A'}',
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
                  );
                }).toList(),
              ),
            ),
            if (!_isLoading && _filteredPunishments.isNotEmpty)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left, color: Colors.white),
                    onPressed: _currentPage > 1
                        ? () => _onPageChanged(_currentPage - 1)
                        : null,
                  ),
                  Text(
                    'Page $_currentPage of $_totalPages',
                    style: GoogleFonts.poppins(color: Colors.white),
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right, color: Colors.white),
                    onPressed: _currentPage < _totalPages
                        ? () => _onPageChanged(_currentPage + 1)
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