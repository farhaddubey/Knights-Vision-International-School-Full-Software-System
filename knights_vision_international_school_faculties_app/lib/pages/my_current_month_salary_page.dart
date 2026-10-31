import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../constants.dart';

class MyCurrentMonthSalaryPage extends StatefulWidget {
  const MyCurrentMonthSalaryPage({super.key});

  @override
  _MyCurrentMonthSalaryPageState createState() => _MyCurrentMonthSalaryPageState();
}

class _MyCurrentMonthSalaryPageState extends State<MyCurrentMonthSalaryPage> {
  final _storage = const FlutterSecureStorage();
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _salaries = [];
  List<dynamic> _filteredSalaries = [];
  int _selectedYear = DateTime.now().year;
  bool _isLoading = true;
  String? _errorMessage;
  String _username = '';
  String _role = 'Unassigned';
  String _perDaySalary = '';

  @override
  void initState() {
    super.initState();
    _fetchSalaries();
    _searchController.addListener(_handleSearch);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchSalaries({int? year}) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    const retries = 3;
    const delay = Duration(milliseconds: 1000);

    for (int i = 0; i < retries; i++) {
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

        final response = await http.get(
          Uri.parse('$BASE_URL/api-schools-panel/employee_salaries/salary_by_id_year?userId=$userId&year=${year ?? _selectedYear}'),
          headers: {'Authorization': 'Bearer $token'},
        );

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final formattedSalaries = (data as List).map((item) {
            return {
              'id': item['id'] ?? item.hashCode,
              'total_hours_worked': (item['total_hours_worked'] is num) ? item['total_hours_worked'].toDouble() : 0.0,
              'payment_status': item['payment_status']?.toString() ?? 'Unknown',
              'allowances': (item['allowances'] is num) ? item['allowances'].toDouble() : 0.0,
              'total_late_deduction': (item['total_late_deduction'] is num) ? item['total_late_deduction'].toDouble() : 0.0,
              'total_overtime_bonus': (item['total_overtime_bonus'] is num) ? item['total_overtime_bonus'].toDouble() : 0.0,
              'total_sell_bonus': (item['total_sell_bonus'] is num) ? item['total_sell_bonus'].toDouble() : 0.0,
              'net_salary': (item['net_salary'] is num) ? item['net_salary'].toDouble() : 0.0,
              'salary_paid': (item['salary_paid'] is num) ? item['salary_paid'].toDouble() : 0.0,
              'remaining_salary_of_month': (item['remaining_salary_of_month'] is num) ? item['remaining_salary_of_month'].toDouble() : 0.0,
              'month_year': item['month_year'] != null ? DateTime.parse(item['month_year']).toIso8601String().split('T')[0] : 'N/A',
              'created_at': item['created_at'] != null ? DateTime.parse(item['created_at']).toString() : 'Not recorded',
              'updated_at': item['updated_at'] != null ? DateTime.parse(item['updated_at']).toLocal().toString() : 'Not updated',
              'user_id': item['user_id']?.toString(),
            };
          }).toList();

          setState(() {
            _username = decoded['username']?.toString() ?? '';
            _role = decoded['role']?.toString() ?? 'Unassigned';
            _perDaySalary = decoded['per_day_salary']?.toString() ?? '';
            _salaries = formattedSalaries;
            _filteredSalaries = formattedSalaries;
            _isLoading = false;
          });
          return;
        } else {
          throw Exception('Failed to fetch salary data: ${response.statusCode} - ${response.body}');
        }
      } catch (e) {
        if (i == retries - 1) {
          final errorMessage = e.toString().replaceFirst('Exception: ', '');
          print('Error in _fetchSalaries: $errorMessage');
          setState(() {
            _isLoading = false;
            _errorMessage = errorMessage;
          });
          WidgetsBinding.instance.addPostFrameCallback((_) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(_errorMessage ?? 'Failed to fetch salary data')),
            );
          });
        }
        await Future.delayed(delay);
      }
    }
  }

  void _handleSearch() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredSalaries = _salaries.where((salary) {
        return [
          salary['id'].toString(),
          salary['month_year'],
          salary['total_hours_worked'].toString(),
          salary['payment_status'],
          salary['allowances'].toString(),
          salary['total_late_deduction'].toString(),
          salary['total_overtime_bonus'].toString(),
          salary['total_sell_bonus'].toString(),
          salary['net_salary'].toString(),
          salary['salary_paid'].toString(),
          salary['remaining_salary_of_month'].toString(),
          salary['created_at'],
          salary['updated_at'],
          salary['user_id']?.toString() ?? '',
        ].any((field) => field.toLowerCase().contains(query));
      }).toList();
    });
  }

  void _handleYearChange(int? newYear) {
    if (newYear != null && newYear > 0) {
      setState(() {
        _selectedYear = newYear;
        _isLoading = true;
      });
      _fetchSalaries(year: newYear);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF212121),
      appBar: AppBar(
        backgroundColor: const Color(0xFFb71c1c),
        title: Row(
          children: [
            const Icon(Icons.account_balance_wallet, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              'My Current Month Salary',
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
                            'Per Day Salary: $_perDaySalary',
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                // Right Column: Year Selection and Search
                Expanded(
                  child: Card(
                    color: const Color(0xFF111111),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Column(
                        children: [
                          DropdownButtonFormField<int>(
                            value: _selectedYear,
                            items: List.generate(5, (index) {
                              final year = DateTime.now().year - index;
                              return DropdownMenuItem(
                                value: year,
                                child: Text(
                                  year.toString(),
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                              );
                            }),
                            onChanged: _handleYearChange,
                            decoration: InputDecoration(
                              labelText: 'Select Year',
                              labelStyle: GoogleFonts.poppins(color: Colors.white),
                              filled: true,
                              fillColor: const Color(0xFF333333),
                              border: const OutlineInputBorder(borderSide: BorderSide.none),
                            ),
                            style: GoogleFonts.poppins(color: Colors.white),
                            dropdownColor: const Color(0xFF333333),
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _searchController,
                            decoration: InputDecoration(
                              hintText: 'Search...',
                              hintStyle: GoogleFonts.poppins(color: Colors.white70),
                              filled: true,
                              fillColor: const Color(0xFF333333),
                              border: const OutlineInputBorder(borderSide: BorderSide.none),
                              prefixIcon: const Icon(Icons.search, color: Colors.white),
                            ),
                            style: GoogleFonts.poppins(color: Colors.white),
                          ),
                          const SizedBox(height: 8),
                          ElevatedButton(
                            onPressed: _fetchSalaries,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF00c853),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: const Icon(Icons.refresh, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
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
                      _fetchSalaries();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00c853),
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
              child: SpinKitCircle(color: Color(0xFF00c853), size: 120),
            )
                : _filteredSalaries.isEmpty
                ? Center(
              child: Text(
                'No salary records found for $_selectedYear.',
                style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
              ),
            )
                : SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Column(
                  children: [
                    // Header
                    Container(
                      width: 1000,
                      color: const Color(0xFF1f1f1f),
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        children: [
                          _buildHeaderCell('Month'),
                          _buildHeaderCell('Total Hours'),
                          _buildHeaderCell('Payment Status'),
                          _buildHeaderCell('Late Deduction'),
                          _buildHeaderCell('Net Salary'),
                          _buildHeaderCell('Salary Paid'),
                          _buildHeaderCell('Remaining Salary'),
                          _buildHeaderCell('Date'),
                        ],
                      ),
                    ),
                    // Data Rows
                    ..._filteredSalaries.map((item) {
                      return InkWell(
                        onTap: () {}, // Placeholder for potential interactivity
                        child: Container(
                          width: 1000,
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          color: const Color(0xFF1a1a1a),
                          padding: const EdgeInsets.all(8.0),
                          child: Row(
                            children: [
                              _buildDataCell(item['month_year']),
                              _buildDataCell(item['total_hours_worked'].toString(), color: const Color(0xFF4caf50)),
                              _buildDataCell(item['payment_status'], color: const Color(0xFFf44336)),
                              _buildDataCell('₹${item['total_late_deduction']}', color: const Color(0xFFccc)),
                              _buildDataCell('₹${item['net_salary']}', color: const Color(0xFF4caf50)),
                              _buildDataCell('₹${item['salary_paid']}', color: const Color(0xFF4caf50)),
                              _buildDataCell('₹${item['remaining_salary_of_month']}', color: const Color(0xFF4caf50)),
                              _buildDataCell(
                                DateTime.parse(item['updated_at']).toLocal().toString().split('.')[0],
                                color: const Color(0xFFccc),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
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
          color: const Color(0xFFe0e0e0),
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
          color: color ?? const Color(0xFF90caf9),
          fontSize: 12,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}