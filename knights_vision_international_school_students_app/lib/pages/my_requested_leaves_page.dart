import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import '../constants.dart';

class MyRequestedLeavesPage extends StatefulWidget {
  const MyRequestedLeavesPage({super.key});

  @override
  _MyRequestedLeavesPageState createState() => _MyRequestedLeavesPageState();
}

class _MyRequestedLeavesPageState extends State<MyRequestedLeavesPage> {
  final _storage = const FlutterSecureStorage();
  List<dynamic> _leaveRequests = [];
  List<dynamic> _filteredRequests = [];
  bool _isLoading = false;
  String _filter = 'ALL';
  final _fromDateController = TextEditingController();
  final _toDateController = TextEditingController();
  final _reasonController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchLeaveRequests();
  }

  Future<void> _fetchLeaveRequests() async {
    final token = await _storage.read(key: 'student_token');
    if (token == null) {
      Fluttertoast.showToast(msg: 'User not authenticated. Please log in.');
      setState(() => _isLoading = false);
      return;
    }

    setState(() => _isLoading = true);
    try {
      print('Fetching leave requests');
      print('Fetch URL: $BASE_URL/api/a1-knights-students-panel/students/myleaves');
      final response = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/students/myleaves'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Fetch response status: ${response.statusCode}');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _leaveRequests = data['leaveRequests'] ?? [];
          _applyFilter();
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch leave requests: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching leave requests: $e');
      print(stackTrace);
      setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    }
  }

  void _applyFilter() {
    setState(() {
      if (_filter == 'ALL') {
        _filteredRequests = _leaveRequests;
      } else {
        _filteredRequests = _leaveRequests.where((req) {
          return _filter == 'APPROVED' ? req['approved'] : !req['approved'];
        }).toList();
      }
    });
  }

  Future<void> _createLeaveRequest() async {
    final token = await _storage.read(key: 'student_token');
    if (token == null) {
      Fluttertoast.showToast(msg: 'User not authenticated. Please log in.');
      return;
    }

    if (_fromDateController.text.isEmpty ||
        _toDateController.text.isEmpty ||
        _reasonController.text.isEmpty) {
      Fluttertoast.showToast(msg: 'All fields are required.');
      return;
    }

    final fromDate = DateTime.tryParse(_fromDateController.text);
    final toDate = DateTime.tryParse(_toDateController.text);
    if (fromDate == null || toDate == null) {
      Fluttertoast.showToast(msg: 'Invalid date format.');
      return;
    }

    if (fromDate.isAfter(toDate)) {
      Fluttertoast.showToast(msg: 'From Date must be before or equal to To Date.');
      return;
    }

    final today = DateTime.now();
    if (fromDate.isBefore(DateTime(today.year, today.month, today.day))) {
      Fluttertoast.showToast(msg: 'From Date cannot be in the past.');
      return;
    }

    setState(() => _isLoading = true);
    try {
      print('Creating leave request');
      print('Post URL: $BASE_URL/api/a1-knights-students-panel/students/myleaves');
      final response = await http.post(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/students/myleaves'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'fromDate': _fromDateController.text,
          'toDate': _toDateController.text,
          'reason': _reasonController.text,
        }),
      );
      print('Post response status: ${response.statusCode}');
      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseBody = jsonDecode(response.body);
        final newRequest = responseBody['leaveRequest'] ??
            responseBody['data']?['leaveRequest'] ??
            responseBody;
        setState(() {
          _leaveRequests.add(newRequest);
          _applyFilter();
          _fromDateController.clear();
          _toDateController.clear();
          _reasonController.clear();
        });
        Fluttertoast.showToast(msg: 'Leave request created successfully.');
      } else {
        throw Exception('Failed to create leave request: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error creating leave request: $e');
      print(stackTrace);
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _selectDate(BuildContext context, TextEditingController controller) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      controller.text = picked.toIso8601String().substring(0, 10);
    }
  }

  String _formatDate(String? date) {
    if (date == null) return 'N/A';
    try {
      final parsedDate = DateTime.parse(date);
      return '${parsedDate.day}/${parsedDate.month}/${parsedDate.year}';
    } catch (e) {
      return 'N/A';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818), // Match MyAttendancePage
      body: CustomScrollView(
        slivers: [
          // Sticky Header
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFFb71c1c),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                'My Leave Requests',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 20,
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
              padding: const EdgeInsets.all(4.0),
              child: Column(
                children: [
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator(color: Color(0xFF00c853)))
                  else ...[
                    // Create New Leave Request
                    Card(
                      color: const Color(0xFF111111),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Create New Leave Request',
                              style: GoogleFonts.poppins(
                                color: const Color(0xFF00c853),
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: _fromDateController,
                                    readOnly: true,
                                    decoration: InputDecoration(
                                      labelText: 'From Date',
                                      labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                      filled: true,
                                      fillColor: const Color(0xFF333333),
                                      border: const OutlineInputBorder(),
                                      suffixIcon: const Icon(Icons.calendar_today, color: Colors.white70),
                                    ),
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    onTap: () => _selectDate(context, _fromDateController),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: TextField(
                                    controller: _toDateController,
                                    readOnly: true,
                                    decoration: InputDecoration(
                                      labelText: 'To Date',
                                      labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                      filled: true,
                                      fillColor: const Color(0xFF333333),
                                      border: const OutlineInputBorder(),
                                      suffixIcon: const Icon(Icons.calendar_today, color: Colors.white70),
                                    ),
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    onTap: () => _selectDate(context, _toDateController),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            TextField(
                              controller: _reasonController,
                              decoration: InputDecoration(
                                labelText: 'Reason',
                                labelStyle: GoogleFonts.poppins(color: Colors.white70),
                                filled: true,
                                fillColor: const Color(0xFF333333),
                                border: const OutlineInputBorder(),
                              ),
                              style: GoogleFonts.poppins(color: Colors.white),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _isLoading ? null : _createLeaveRequest,
                              icon: const Icon(Icons.add, color: Colors.black),
                              label: Text(
                                'Submit Leave Request',
                                style: GoogleFonts.poppins(color: Colors.black),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF00c853),
                                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Filter and Summary
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        DropdownButton<String>(
                          value: _filter,
                          items: const [
                            DropdownMenuItem(value: 'ALL', child: Text('All')),
                            DropdownMenuItem(value: 'APPROVED', child: Text('Approved')),
                            DropdownMenuItem(value: 'UNAPPROVED', child: Text('Unapproved')),
                          ],
                          onChanged: (value) {
                            if (value != null) {
                              setState(() => _filter = value);
                              _applyFilter();
                            }
                          },
                          dropdownColor: const Color(0xFF333333),
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        Text(
                          'Total: ${_filteredRequests.length}',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    // Leave Requests List
                    _filteredRequests.isEmpty
                        ? Center(
                      child: Text(
                        'No leave requests found.',
                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 20),
                      ),
                    )
                        : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _filteredRequests.length,
                      itemBuilder: (context, index) {
                        final request = _filteredRequests[index];
                        return Card(
                          color: const Color(0xFF111111),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(16),
                            title: Text(
                              'From: ${_formatDate(request['fromDate'])} - To: ${_formatDate(request['toDate'])}',
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Reason: ${request['reason'] ?? 'N/A'}',
                                  style: GoogleFonts.poppins(color: Colors.white70),
                                ),
                                Text(
                                  'Status: ${request['approved'] ? 'Approved' : 'Unapproved'}',
                                  style: GoogleFonts.poppins(
                                    color: request['approved']
                                        ? const Color(0xFF00c853)
                                        : const Color(0xFFf44336),
                                  ),
                                ),
                                if (request['approvedBy'] != null)
                                  Text(
                                    'Approved By: ${request['approvedBy']['firstName']} ${request['approvedBy']['lastName']}',
                                    style: GoogleFonts.poppins(color: Colors.white70),
                                  ),
                                Text(
                                  'Created At: ${_formatDate(request['createdAt'])}',
                                  style: GoogleFonts.poppins(color: Colors.white70),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _fromDateController.dispose();
    _toDateController.dispose();
    _reasonController.dispose();
    super.dispose();
  }
}
