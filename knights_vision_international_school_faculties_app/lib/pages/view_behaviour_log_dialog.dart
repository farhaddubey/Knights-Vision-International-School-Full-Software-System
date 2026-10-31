import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import '../constants.dart';

class ViewBehaviourLogDialog extends StatefulWidget {
  final int logId;
  final String className;

  const ViewBehaviourLogDialog({
    super.key,
    required this.logId,
    required this.className,
  });

  @override
  _ViewBehaviourLogDialogState createState() => _ViewBehaviourLogDialogState();
}

class _ViewBehaviourLogDialogState extends State<ViewBehaviourLogDialog> {
  final _storage = const FlutterSecureStorage();
  dynamic _log;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchLog();
  }

  Future<void> _fetchLog() async {
    try {
      setState(() {
        _isLoading = true;
      });
      final token = await _storage.read(key: 'token');
      if (token == null) throw Exception('User not authenticated');

      final response = await http.get(
        Uri.parse('$BASE_URL/api/MonthlyStudentBehaviourLogs/${widget.className.toLowerCase()}/logs/${widget.logId}'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _log = data;
        });
      } else {
        throw Exception('Failed to fetch behaviour log: ${response.statusCode}');
      }
    } catch (e) {
      Fluttertoast.showToast(msg: 'Failed to fetch behaviour log: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF000000),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            color: const Color(0xFF009688),
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                const Icon(Icons.report, color: Colors.white),
                const SizedBox(width: 8),
                Text(
                  'View Behaviour Log',
                  style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Color(0xFFf44336)),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF00c757)))
                : _log != null
                ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Log Details', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Student: ${_log['student']['name']}', style: GoogleFonts.poppins(color: Colors.white)),
                Text('Category: ${_log['category']}', style: GoogleFonts.poppins(color: Colors.white)),
                Text('Type: ${_log['type']}', style: GoogleFonts.poppins(color: Colors.white)),
                Text('Severity Level: ${_log['severityLevel']}', style: GoogleFonts.poppins(color: Colors.white)),
                Text('Incident Date: ${DateTime.parse(_log['incidentDate']).toLocal().toString().split(' ')[0]}', style: GoogleFonts.poppins(color: Colors.white)),
                Text('Class Subject: ${_log['classSubject']?['subject']['name'] ?? 'N/A'}', style: GoogleFonts.poppins(color: Colors.white)),
                Text('Description: ${_log['description'] ?? 'N/A'}', style: GoogleFonts.poppins(color: Colors.white)),
                Text('Punishment: ${_log['punishment']?['title'] ?? 'N/A'}', style: GoogleFonts.poppins(color: Colors.white)),
                Text('Resolved: ${_log['isResolved'] ? 'Yes' : 'No'}', style: GoogleFonts.poppins(color: Colors.white)),
                Text('Resolved By: ${_log['resolvedBy'] ?? 'N/A'}', style: GoogleFonts.poppins(color: Colors.white)),
                Text('Resolved Note: ${_log['resolvedNote'] ?? 'N/A'}', style: GoogleFonts.poppins(color: Colors.white)),
              ],
            )
                : Text('No data available', style: GoogleFonts.poppins(color: Colors.white)),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFf44336)),
              child: Text('Close', style: GoogleFonts.poppins(color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}