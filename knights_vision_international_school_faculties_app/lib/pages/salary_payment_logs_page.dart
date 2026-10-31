import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../constants.dart';

class SalaryPaymentLogsPage extends StatefulWidget {
  const SalaryPaymentLogsPage({super.key});

  @override
  _SalaryPaymentLogsPageState createState() => _SalaryPaymentLogsPageState();
}

class _SalaryPaymentLogsPageState extends State<SalaryPaymentLogsPage> {
  final _storage = const FlutterSecureStorage();
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _paymentLogs = [];
  List<dynamic> _filteredLogs = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _username = '';
  String _role = 'Unassigned';
  String _perDaySalary = '';

  @override
  void initState() {
    super.initState();
    _fetchPaymentLogs();
    _searchController.addListener(_handleSearch);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchPaymentLogs() async {
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
      final userId = int.tryParse(decoded['userId']?.toString() ?? decoded['id']?.toString() ?? '');
      if (userId == null) {
        throw Exception('Invalid user ID in token');
      }

      final response = await http.get(
        Uri.parse('$BASE_URL/api/employee_salaries/salary_paid_logs/by_user?userId=$userId'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final formattedLogs = (data as List).map((item) {
          return {
            'id': item['id'] ?? item.hashCode,
            'salary_id': item['salary_id']?.toString(),
            'paid_amount': (item['paid_amount'] is num) ? item['paid_amount'].toDouble().toStringAsFixed(2) : '0.00',
            'paid_on': item['paid_on'] != null ? DateTime.parse(item['paid_on']).toLocal().toString() : 'N/A',
            'payment_mode': item['payment_mode']?.toString() ?? 'Unknown',
            'note': item['note']?.toString() ?? 'No remarks',
            'paid_by_user_id': item['paid_by_user_id']?.toString() ?? 'N/A',
            'created_at': item['created_at'] != null ? DateTime.parse(item['created_at']).toLocal().toString() : 'Not recorded',
            'updated_at': item['updated_at'] != null ? DateTime.parse(item['updated_at']).toLocal().toString() : 'Not updated',
            'user_id': item['user_id']?.toString(),
          };
        }).toList();

        setState(() {
          _username = decoded['username']?.toString() ?? '';
          _role = decoded['role']?.toString() ?? 'Unassigned';
          _perDaySalary = decoded['per_day_salary']?.toString() ?? '';
          _paymentLogs = formattedLogs;
          _filteredLogs = formattedLogs;
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch payment logs: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      print('Error in _fetchPaymentLogs: $errorMessage');
      setState(() {
        _isLoading = false;
        _errorMessage = errorMessage;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_errorMessage ?? 'Failed to fetch payment logs')),
        );
      });
    }
  }

  void _handleSearch() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredLogs = _paymentLogs.where((log) {
        return [
          log['paid_amount'],
          log['paid_on'],
          log['payment_mode'],
          log['note'],
          log['paid_by_user_id'],
        ].any((field) => field.toLowerCase().contains(query));
      }).toList();
    });
  }

  void _showDetailsDialog(Map<String, dynamic> item) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF181818),
          title: Row(
            children: [
              const Icon(Icons.payment, color: Colors.white),
              const SizedBox(width: 8),
              Text(
                'Payment Log Details',
                style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.close, color: Color(0xFFf44336)),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          ),
          titlePadding: const EdgeInsets.all(8.0),
          contentPadding: const EdgeInsets.all(16.0),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildDialogTextField('Log ID', item['id'].toString()),
                _buildDialogTextField('Paid Amount', '₹${item['paid_amount']}'),
                _buildDialogTextField('Paid On', item['paid_on']),
                _buildDialogTextField('Payment Mode', item['payment_mode']),
                _buildDialogTextField('Note', item['note'], maxLines: 2),
                _buildDialogTextField('Paid By User ID', item['paid_by_user_id']),
                _buildDialogTextField('Created At', item['created_at']),
                _buildDialogTextField('Updated At', item['updated_at']),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text(
                'Close',
                style: GoogleFonts.poppins(color: const Color(0xFF00c853)),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildDialogTextField(String label, String value, {int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: TextField(
        enabled: false,
        controller: TextEditingController(text: value),
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: GoogleFonts.poppins(color: Colors.white70),
          filled: true,
          fillColor: const Color(0xFF333333),
          border: const OutlineInputBorder(borderSide: BorderSide.none),
        ),
        style: GoogleFonts.poppins(color: Colors.white),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF212121),
      appBar: AppBar(
        backgroundColor: const Color(0xFFb71c1c),
        title: Row(
          children: [
            const Icon(Icons.payment, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              'Salary Payment Logs',
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
                // Right Column: Search
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
                            onPressed: _fetchPaymentLogs,
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
                      _fetchPaymentLogs();
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
                : _filteredLogs.isEmpty
                ? Center(
              child: Text(
                'No payment logs found.',
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
                      width: 800,
                      color: const Color(0xFF1f1f1f),
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        children: [
                          _buildHeaderCell('Log ID'),
                          _buildHeaderCell('Paid Amount'),
                          _buildHeaderCell('Paid On'),
                          _buildHeaderCell('Payment Mode'),
                          _buildHeaderCell('Paid By'),
                          _buildHeaderCell('Actions'),
                        ],
                      ),
                    ),
                    // Data Rows
                    ..._filteredLogs.map((item) {
                      return InkWell(
                        onTap: () => _showDetailsDialog(item),
                        child: Container(
                          width: 800,
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          color: const Color(0xFF1a1a1a),
                          padding: const EdgeInsets.all(8.0),
                          child: Row(
                            children: [
                              _buildDataCell(item['id'].toString(), color: const Color(0xFFccc)),
                              _buildDataCell('₹${item['paid_amount']}', color: const Color(0xFF4caf50)),
                              _buildDataCell(item['paid_on'], color: const Color(0xFF90caf9)),
                              _buildDataCell(item['payment_mode'], color: const Color(0xFFffd54f)),
                              _buildDataCell(item['paid_by_user_id'], color: const Color(0xFFccc)),
                              _buildDataCell(
                                'View Details',
                                color: const Color(0xFFb39ddb),
                                onTap: () => _showDetailsDialog(item),
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

  Widget _buildDataCell(String text, {Color? color, VoidCallback? onTap}) {
    return Expanded(
      flex: 1,
      child: GestureDetector(
        onTap: onTap,
        child: Text(
          text,
          style: GoogleFonts.poppins(
            color: color ?? const Color(0xFF90caf9),
            fontSize: 12,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}