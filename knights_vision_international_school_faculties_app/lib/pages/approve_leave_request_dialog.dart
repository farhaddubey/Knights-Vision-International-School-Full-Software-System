import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:fluttertoast/fluttertoast.dart';
import '../constants.dart';
import './leave_requests_page.dart';

class ApproveLeaveRequestDialog extends StatefulWidget {
  final LeaveRequest request;
  final VoidCallback onUpdate;

  const ApproveLeaveRequestDialog({
    super.key,
    required this.request,
    required this.onUpdate,
  });

  @override
  _ApproveLeaveRequestDialogState createState() => _ApproveLeaveRequestDialogState();
}

class _ApproveLeaveRequestDialogState extends State<ApproveLeaveRequestDialog> {
  bool _isUpdating = false;
  final _storage = const FlutterSecureStorage();

  Future<void> _handleApprove(bool approve) async {
    setState(() => _isUpdating = true);
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.patch(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/leave-requests/${widget.request.id}'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'approved': approve}),
      );

      print('Updating leave request ${widget.request.id}');
      print('Update URL: $BASE_URL/api-schools-panel/class_teachers_panel/leave-requests/${widget.request.id}');
      print('Update response status: ${response.statusCode}');
      print('Update response body: ${response.body}');

      if (response.statusCode == 200) {
        Fluttertoast.showToast(
          msg: 'Leave request ${approve ? 'approved' : 'rejected'} successfully',
          backgroundColor: Colors.green,
        );
        widget.onUpdate();
        Navigator.pop(context);
      } else {
        throw Exception('Failed to update leave request: ${response.statusCode}');
      }
    } catch (e) {
      print('Error updating leave request: $e');
      Fluttertoast.showToast(
        msg: 'Failed to update leave request: $e',
        backgroundColor: Colors.red,
      );
    } finally {
      setState(() => _isUpdating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.all(0),
      backgroundColor: Colors.transparent,
      child: Container(
        color: const Color(0xFF000000),
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              backgroundColor: const Color(0xFFb71c1c),
              flexibleSpace: FlexibleSpaceBar(
                title: Row(
                  children: [
                    const Icon(Icons.event_available, color: Colors.white),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Approve/Reject Leave Request',
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
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
              automaticallyImplyLeading: true,
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Request ID: ${widget.request.id}',
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Student: ${widget.request.studentName}',
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Date Range: ${widget.request.fromDate.substring(0, 10)} to ${widget.request.toDate.substring(0, 10)}',
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Reason: ${widget.request.reason}',
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Status: ${widget.request.approved == null ? 'Pending' : widget.request.approved! ? 'Approved' : 'Rejected'}',
                      style: GoogleFonts.poppins(
                        color: widget.request.approved == null
                            ? Colors.yellow
                            : widget.request.approved!
                            ? Colors.green
                            : Colors.red,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _isUpdating
                        ? const Center(child: CircularProgressIndicator(color: Color(0xFF00c757)))
                        : Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            minimumSize: const Size(120, 36),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5),
                            ),
                          ),
                          child: Text(
                            'Cancel',
                            style: GoogleFonts.poppins(color: Colors.white),
                          ),
                        ),
                        ElevatedButton(
                          onPressed: widget.request.approved == null ? () => _handleApprove(true) : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF00c757),
                            minimumSize: const Size(120, 36),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5),
                            ),
                          ),
                          child: Text(
                            'Approve',
                            style: GoogleFonts.poppins(color: Colors.white),
                          ),
                        ),
                        ElevatedButton(
                          onPressed: widget.request.approved == null ? () => _handleApprove(false) : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFffeb3b),
                            minimumSize: const Size(120, 36),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5),
                            ),
                          ),
                          child: Text(
                            'Reject',
                            style: GoogleFonts.poppins(color: Colors.black),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}