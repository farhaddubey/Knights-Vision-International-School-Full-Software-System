import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants.dart';
import 'add_behaviour_log_page.dart';
import 'view_behaviour_log_dialog.dart';

class StudentBehaviourLogsPage extends StatefulWidget {
  const StudentBehaviourLogsPage({super.key});

  @override
  _StudentBehaviourLogsPageState createState() => _StudentBehaviourLogsPageState();
}

class _StudentBehaviourLogsPageState extends State<StudentBehaviourLogsPage> with SingleTickerProviderStateMixin {
  final _storage = const FlutterSecureStorage();
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _behaviourLogs = [];
  List<dynamic> _filteredBehaviourLogs = [];
  List<String> _classNames = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _searchQuery = '';
  int _currentPage = 1;
  int _totalPages = 1;
  static const int _pageSize = 10;
  TabController? _tabController;

  @override
  void initState() {
    super.initState();
    _fetchBehaviourLogs();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    _tabController?.dispose();
    super.dispose();
  }

  Future<void> _fetchBehaviourLogs({int page = 1, String search = ''}) async {
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
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/behaviour-logs?page=$page&pageSize=$_pageSize&searchQuery=$search'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> logs = data['behaviourLogs'] ?? [];
        final invalidLogs = <String>[];
        final validLogs = logs.where((log) {
          final isValid = log['id'] != null &&
              log['student'] != null &&
              log['student']['name'] != null &&
              log['category'] != null &&
              log['type'] != null &&
              log['severityLevel'] != null;
          if (!isValid) {
            invalidLogs.add(
                '${log['student']?['name'] ?? 'Unknown'} (Missing: ' +
                    [
                      if (log['id'] == null) 'id',
                      if (log['student'] == null || log['student']['name'] == null) 'student.name',
                      if (log['category'] == null) 'category',
                      if (log['type'] == null) 'type',
                      if (log['severityLevel'] == null) 'severityLevel',
                    ].join(', ') +
                    ')');
          }
          return isValid;
        }).toList();

        // Sort by severityLevel (descending)
        validLogs.sort((a, b) => (b['severityLevel'] as int).compareTo(a['severityLevel'] as int));

        // Extract unique class names
        final classNames = validLogs
            .map((log) => log['classSubject']?['className']?.toString() ?? 'Unassigned')
            .toSet()
            .toList()
          ..sort();

        setState(() {
          _behaviourLogs = validLogs;
          _filteredBehaviourLogs = validLogs;
          _classNames = classNames.isEmpty ? ['Unassigned'] : classNames;
          _totalPages = data['totalPages'] ?? 1;
          _currentPage = page;
          _isLoading = false;
          if (validLogs.isEmpty && logs.isNotEmpty) {
            _errorMessage = 'No valid behaviour logs found. Invalid logs: ${invalidLogs.join('; ')}. Please contact support.';
          }
          _tabController?.dispose();
          _tabController = TabController(length: _classNames.length, vsync: this);
        });
      } else {
        throw Exception('Failed to fetch behaviour logs: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      print('Error in _fetchBehaviourLogs: $errorMessage');
      setState(() {
        _isLoading = false;
        _errorMessage = errorMessage;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_errorMessage ?? 'Failed to fetch behaviour logs')),
        );
      });
    }
  }

  void _onSearchChanged() {
    setState(() {
      _searchQuery = _searchController.text;
      _filteredBehaviourLogs = _behaviourLogs.where((log) {
        final studentName = log['student']['name']?.toString().toLowerCase() ?? '';
        final className = log['classSubject']?['className']?.toString().toLowerCase() ?? '';
        final category = log['category']?.toString().toLowerCase() ?? '';
        final type = log['type']?.toString().toLowerCase() ?? '';
        final description = log['description']?.toString().toLowerCase() ?? '';
        final resolvedBy = log['resolvedBy']?.toString().toLowerCase() ?? '';
        final resolvedNote = log['resolvedNote']?.toString().toLowerCase() ?? '';
        return studentName.contains(_searchQuery.toLowerCase()) ||
            className.contains(_searchQuery.toLowerCase()) ||
            category.contains(_searchQuery.toLowerCase()) ||
            type.contains(_searchQuery.toLowerCase()) ||
            description.contains(_searchQuery.toLowerCase()) ||
            resolvedBy.contains(_searchQuery.toLowerCase()) ||
            resolvedNote.contains(_searchQuery.toLowerCase());
      }).toList();
    });
  }

  void _onPageChanged(int page) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      setState(() {
        _currentPage = page;
      });
      _fetchBehaviourLogs(page: page, search: _searchController.text);
    });
  }

  void _navigateToAddBehaviourLogPage() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddBehaviourLogPage(
          onSave: () => _fetchBehaviourLogs(page: _currentPage, search: _searchQuery),
        ),
      ),
    ).then((result) {
      if (result == true) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Behaviour log added successfully')),
          );
        });
      }
    });
  }

  void _showViewBehaviourLogDialog(Map<String, dynamic> log) {
    showDialog(
      context: context,
      builder: (context) => ViewBehaviourLogDialog(
        logId: log['id'],
        className: log['classSubject']?['className'] ?? 'Unassigned',
      ),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category.toUpperCase()) {
      case 'ACADEMIC':
        return const Color(0xFF2196F3); // Blue
      case 'DISCIPLINE':
        return const Color(0xFFF44336); // Red
      case 'ATTENDANCE':
        return const Color(0xFFFF9800); // Orange
      case 'UNIFORM':
        return const Color(0xFF9C27B0); // Purple
      case 'DEVICE_MISUSE':
        return const Color(0xFF4CAF50); // Green
      case 'EXAM_MISCONDUCT':
        return const Color(0xFFFF5722); // Deep Orange
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
            const Icon(Icons.report, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              'Behaviour Logs',
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
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: ElevatedButton(
              onPressed: _navigateToAddBehaviourLogPage,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00c757),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                'Add New Log',
                style: GoogleFonts.poppins(
                  color: Colors.black,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
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
                    hintText: 'Search by Student, Category, Type, or Class...',
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
                  : _filteredBehaviourLogs.isEmpty
                  ? Center(
                child: Text(
                  'No behaviour logs found.',
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                ),
              )
                  : TabBarView(
                controller: _tabController,
                children: _classNames.map((className) {
                  final classLogs = _filteredBehaviourLogs
                      .where((log) => (log['classSubject']?['className']?.toString() ?? 'Unassigned') == className)
                      .toList();
                  return ListView.builder(
                    itemCount: classLogs.length,
                    itemBuilder: (context, index) {
                      final log = classLogs[index];
                      final categoryColor = _getCategoryColor(log['category']);
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
                                'ID: ${log['id']}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Text(
                                  log['student']['name'],
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
                                log['category'],
                                style: GoogleFonts.poppins(
                                  color: categoryColor,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Type: ${log['type']}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                'Class: ${log['classSubject']?['className'] ?? 'Unassigned'}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                'Severity: ${log['severityLevel']}/5',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                'Description: ${log['description'] ?? 'N/A'}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                'Incident: ${log['incidentDate'] != null ? DateTime.parse(log['incidentDate']).toString().split('.')[0] : 'N/A'}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                'Punishment ID: ${log['punishmentId'] ?? 'N/A'}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                'Resolved: ${log['isResolved'] ? 'Yes' : 'No'}',
                                style: GoogleFonts.poppins(
                                  color: log['isResolved'] ? Colors.green : Colors.red,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                'Resolved By: ${log['resolvedBy'] ?? 'N/A'}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                'Resolved Note: ${log['resolvedNote'] ?? 'N/A'}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                'Created: ${log['createdAt'] != null ? DateTime.parse(log['createdAt']).toString().split('.')[0] : 'N/A'}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                'Updated: ${log['updatedAt'] != null ? DateTime.parse(log['updatedAt']).toString().split('.')[0] : 'N/A'}',
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  OutlinedButton(
                                    onPressed: () => _showViewBehaviourLogDialog(log),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: const Color(0xFF00c757),
                                      side: const BorderSide(color: Color(0xFF00c757)),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    child: Text(
                                      'View',
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
                  );
                }).toList(),
              ),
            ),
            if (!_isLoading && _filteredBehaviourLogs.isNotEmpty)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left, color: Colors.white),
                    onPressed: _currentPage > 1 ? () => _onPageChanged(_currentPage - 1) : null,
                  ),
                  Text(
                    'Page $_currentPage of $_totalPages',
                    style: GoogleFonts.poppins(color: Colors.white),
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right, color: Colors.white),
                    onPressed: _currentPage < _totalPages ? () => _onPageChanged(_currentPage + 1) : null,
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}