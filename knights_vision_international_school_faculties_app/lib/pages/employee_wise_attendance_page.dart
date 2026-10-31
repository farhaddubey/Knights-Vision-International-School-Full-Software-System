import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../constants.dart';

class EmployeeWiseAttendancePage extends StatefulWidget {
  const EmployeeWiseAttendancePage({super.key});

  @override
  _EmployeeWiseAttendancePageState createState() => _EmployeeWiseAttendancePageState();
}

class _EmployeeWiseAttendancePageState extends State<EmployeeWiseAttendancePage> with SingleTickerProviderStateMixin {
  final _storage = const FlutterSecureStorage();
  final TextEditingController _monthYearController = TextEditingController();
  List<dynamic> _attendanceLogs = [];
  List<String> _roles = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _username = '';
  String _role = '';
  String _salary = '';
  TabController? _tabController;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _monthYearController.text = '${now.year}-${now.month.toString().padLeft(2, '0')}';
    _fetchEmployees();
  }

  @override
  void dispose() {
    _monthYearController.dispose();
    _tabController?.dispose();
    super.dispose();
  }

  Future<void> _fetchEmployees({String? selectedMonthYear}) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated. Please log in.');
      }

      final decoded = JwtDecoder.decode(token);
      final userId = int.tryParse(decoded['id']?.toString() ?? '');
      if (userId == null) {
        throw Exception('Invalid user ID in token');
      }

      final monthYear = selectedMonthYear ?? _monthYearController.text;
      final [year, month] = monthYear.split('-');
      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/employee-attendance-logs/get-attendance-all-by-userId?userId=$userId&month=$month&year=$year'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['username'] is! String || data['attendance_logs'] is! List) {
          throw Exception('Invalid user data format');
        }

        final logs = data['attendance_logs'] ?? [];
        final invalidLogs = <String>[];
        final validLogs = logs.where((log) {
          final isValid = log['id'] != null && log['date'] != null;
          if (!isValid) {
            invalidLogs.add('Log ID: ${log['id'] ?? 'Unknown'} (Missing: ${log['id'] == null ? 'id' : ''}${log['date'] == null ? ', date' : ''})');
          }
          return isValid;
        }).toList();

        // Sort by date (descending)
        validLogs.sort((a, b) => DateTime.parse(b['date']).compareTo(DateTime.parse(a['date'])));

        // Extract role (single role from data['role'])
        final role = data['role'] is String ? data['role'] : 'Unassigned';

        setState(() {
          _username = data['username'] is String ? data['username'] : '';
          _role = role;
          _salary = data['per_day_salary'] is String ? data['per_day_salary'] : '';
          _attendanceLogs = validLogs;
          _roles = [role]; // Single role as a list for TabBar
          _isLoading = false;
          if (validLogs.isEmpty && logs.isNotEmpty) {
            _errorMessage = 'No valid attendance logs found. Invalid logs: ${invalidLogs.join('; ')}. Please contact support.';
          }
        });

        // Initialize TabController after roles are set
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            setState(() {
              _tabController?.dispose();
              _tabController = TabController(length: _roles.length, vsync: this);
            });
          }
        });
      } else {
        throw Exception('Failed to fetch attendance logs: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      print('Error in _fetchEmployees: $errorMessage');
      setState(() {
        _isLoading = false;
        _errorMessage = errorMessage;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_errorMessage ?? 'Failed to fetch attendance logs')),
        );
      });
    }
  }

  void _handleSearch() {
    setState(() {
      _isLoading = true;
    });
    _fetchEmployees(selectedMonthYear: _monthYearController.text);
  }

  Color _getEntryTimeColor(dynamic log) {
    final lateMinutes = log['late_minutes'];
    if (lateMinutes == null) return const Color(0xFFFFFF00); // Yellow for null/invalid
    return lateMinutes == 0 ? const Color(0xFF00c757) : const Color(0xFFF44336); // Green if 0, else Red
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFFb71c1c),
        title: Row(
          children: [
            const Icon(Icons.people, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              'Employee Attendance Logs',
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
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Left Column: User Details
                Expanded(
                  child: Card(
                    color: const Color(0xFF111111),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'User: $_username',
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Role: $_role',
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Per Day Salary: $_salary',
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                // Right Column: Date Picker and Search Button
                Expanded(
                  child: Card(
                    color: const Color(0xFF111111),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween, // Fill vertical space evenly
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          TextField(
                            controller: _monthYearController,
                            readOnly: true,
                            onTap: () async {
                              final DateTime? picked = await showDatePicker(
                                context: context,
                                initialDate: DateTime.now(),
                                firstDate: DateTime(2000),
                                lastDate: DateTime(2100),
                                initialEntryMode: DatePickerEntryMode.calendarOnly,
                                builder: (context, child) {
                                  return Theme(
                                    data: ThemeData.dark().copyWith(
                                      colorScheme: const ColorScheme.dark(
                                        primary: Color(0xFF00c757),
                                        onPrimary: Colors.black,
                                        surface: Color(0xFF111111),
                                        onSurface: Colors.white,
                                      ),
                                    ),
                                    child: child!,
                                  );
                                },
                              );
                              if (picked != null) {
                                setState(() {
                                  _monthYearController.text =
                                  '${picked.year}-${picked.month.toString().padLeft(2, '0')}';
                                });
                              }
                            },
                            decoration: InputDecoration(
                              hintText: 'Select Month (YYYY-MM) *',
                              hintStyle: GoogleFonts.poppins(color: Colors.white70),
                              filled: true,
                              fillColor: const Color(0xFF333333),
                              border: const OutlineInputBorder(borderSide: BorderSide.none),
                              prefixIcon:
                              const Icon(Icons.calendar_today, color: Colors.white70),
                            ),
                            style: GoogleFonts.poppins(color: Colors.white),
                          ),
                          Align(
                            alignment: Alignment.centerRight, // Right align the button
                            child: ElevatedButton(
                              onPressed: _handleSearch,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF00c757),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                padding:
                                const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                              ),
                              child: Text(
                                'Search',
                                style:
                                GoogleFonts.poppins(color: Colors.black, fontSize: 12),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

              ],
            ),
          ),
          const SizedBox(height: 16),
          if (_roles.isNotEmpty && !_isLoading && _roles.length > 1)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: TabBar(
                controller: _tabController,
                isScrollable: true,
                labelStyle: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold),
                unselectedLabelStyle: GoogleFonts.poppins(fontSize: 14),
                labelColor: const Color(0xFF00c757),
                unselectedLabelColor: Colors.white70,
                indicatorColor: const Color(0xFF00c757),
                tabs: _roles.map((role) => Tab(text: role)).toList(),
              ),
            ),
          Expanded(
            child: _errorMessage != null
                ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _errorMessage!,
                    style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _errorMessage = null;
                        _isLoading = true;
                      });
                      _fetchEmployees();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00c757),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      'Retry',
                      style: GoogleFonts.poppins(color: Colors.black, fontSize: 12),
                    ),
                  ),
                ],
              ),
            )
                : _isLoading
                ? const Center(
              child: SpinKitCircle(color: Color(0xFF00c757), size: 120),
            )
                : _attendanceLogs.isEmpty
                ? Center(
              child: Text(
                'No attendance logs found.',
                style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
              ),
            )
                : LayoutBuilder(
              builder: (context, constraints) {
                return TabBarView(
                  controller: _tabController,
                  children: _roles.map((role) {
                    final roleLogs = _attendanceLogs
                        .where((log) => _role == role)
                        .toList();
                    return SingleChildScrollView(
                      scrollDirection: Axis.vertical,
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: ConstrainedBox(
                          constraints: BoxConstraints(minWidth: constraints.maxWidth),
                          child: Column(
                            children: [
                              // Header (inside scrolling box)
                              Card(
                                color: const Color(0xFF333333),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Container(
                                  width: 1200, // Adjusted for 11 columns
                                  padding: const EdgeInsets.all(8.0),
                                  child: Row(
                                    children: [
                                      _buildHeaderCell('Date'),
                                      _buildHeaderCell('Entry Time'),
                                      _buildHeaderCell('Exit Time'),
                                      _buildHeaderCell('Total Hours'),
                                      _buildHeaderCell('Late Minutes'),
                                      _buildHeaderCell('Penalty'),
                                      _buildHeaderCell('Overtime Min'),
                                      _buildHeaderCell('Salary'),
                                      _buildHeaderCell('Base Salary'),
                                      _buildHeaderCell('Bonus Salary'),
                                      _buildHeaderCell('Net Salary'),
                                    ],
                                  ),
                                ),
                              ),
                              // Data Rows
                              ...roleLogs.map((log) {
                                return Card(
                                  color: const Color(0xFF181818),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  margin: const EdgeInsets.symmetric(vertical: 4),
                                  child: Container(
                                    width: 1200,
                                    padding: const EdgeInsets.all(8.0),
                                    child: Row(
                                      children: [
                                        _buildDataCell(log['date'] != null
                                            ? DateTime.parse(log['date']).toString().split(' ')[0].replaceAll('-', '/')
                                            : 'N/A'),
                                        _buildDataCell(
                                          log['entry_time'] ?? 'N/A',
                                          color: _getEntryTimeColor(log),
                                        ),
                                        _buildDataCell(log['leave_time'] ?? 'N/A'),
                                        _buildDataCell(log['total_hours']?.toString() ?? 'N/A'),
                                        _buildDataCell(
                                          log['late_minutes']?.toString() ?? 'N/A',
                                          color: const Color(0xFFF44336),
                                        ),
                                        _buildDataCell(
                                          log['penalty']?.toString() ?? 'N/A',
                                          color: const Color(0xFFF44336),
                                        ),
                                        _buildDataCell(log['overtime_minutes']?.toString() ?? 'N/A'),
                                        _buildDataCell(_salary),
                                        _buildDataCell(log['base_salary_per_day']?.toString() ?? 'N/A'),
                                        _buildDataCell(log['bonus_salary_per_day']?.toString() ?? 'N/A'),
                                        _buildDataCell(log['net_salary_of_the_day']?.toString() ?? 'N/A'),
                                      ],
                                    ),
                                  ),
                                );
                              }),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderCell(String text) {
    return Expanded(
      flex: 1,
      child: Text(
        text,
        style: GoogleFonts.poppins(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _buildDataCell(String text, {Color? color}) {
    return Expanded(
      flex: 1,
      child: Text(
        text,
        style: GoogleFonts.poppins(
          color: color ?? Colors.white70,
          fontSize: 12,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}