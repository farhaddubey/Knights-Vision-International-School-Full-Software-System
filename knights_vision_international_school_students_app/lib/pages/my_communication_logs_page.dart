import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../api_service.dart';

/// Read-only communication history for the signed-in student's family.
class MyCommunicationLogsPage extends StatefulWidget {
  const MyCommunicationLogsPage({super.key});

  @override
  State<MyCommunicationLogsPage> createState() =>
      _MyCommunicationLogsPageState();
}

class _MyCommunicationLogsPageState extends State<MyCommunicationLogsPage> {
  final _apiService = ApiService();
  List<dynamic> _logs = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/students/myguardiancommunicationlogs',
        queryParameters: const {'page': '1', 'pageSize': '100'},
      );
      if (response.statusCode != 200) {
        throw ApiException('Unable to load communication history.',
            statusCode: response.statusCode);
      }
      final data = Map<String, dynamic>.from(jsonDecode(response.body) as Map);
      if (!mounted) return;
      setState(() {
        _logs = data['logs'] is List ? data['logs'] as List : const [];
        _loading = false;
      });
    } on ApiException catch (error) {
      if (mounted) {
        setState(() {
          _error = error.message;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'Unable to contact the school server. Please try again.';
          _loading = false;
        });
      }
    }
  }

  String _formatDate(dynamic value) {
    final date = DateTime.tryParse('$value');
    if (date == null) return 'Date not recorded';
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  String _details(dynamic value) {
    if (value == null) return '';
    if (value is String) return value;
    return const JsonEncoder.withIndent('  ').convert(value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        title: Text('School Communication',
            style: GoogleFonts.poppins(
                color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
              onPressed: _loading ? null : _load,
              icon: const Icon(Icons.refresh))
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_loading)
              const Padding(
                  padding: EdgeInsets.all(48),
                  child: Center(
                      child:
                          CircularProgressIndicator(color: Color(0xFF00C853))))
            else if (_error != null)
              _message(_error!, isError: true)
            else if (_logs.isEmpty)
              _message(
                  'No school communication has been recorded for your account yet.')
            else
              ..._logs.map(
                  (entry) => _logCard(Map<String, dynamic>.from(entry as Map))),
          ],
        ),
      ),
    );
  }

  Widget _message(String text, {bool isError = false}) => Card(
        color: isError ? const Color(0xFF2A1515) : const Color(0xFF242424),
        child: Padding(
            padding: const EdgeInsets.all(20),
            child: Text(text,
                style: GoogleFonts.poppins(color: Colors.white),
                textAlign: TextAlign.center)),
      );

  Widget _logCard(Map<String, dynamic> log) => Card(
        color: const Color(0xFF242424),
        margin: const EdgeInsets.only(bottom: 10),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                  '${log['communicationType'] ?? 'School communication'} · ${log['method'] ?? 'Record'}',
                  style: GoogleFonts.poppins(
                      color: const Color(0xFF72E89C),
                      fontWeight: FontWeight.bold)),
              const SizedBox(height: 5),
              Text(_formatDate(log['recordedAt']),
                  style:
                      GoogleFonts.poppins(color: Colors.white60, fontSize: 12)),
              if ((log['summary'] as String?)?.trim().isNotEmpty == true) ...[
                const SizedBox(height: 8),
                Text(log['summary'] as String,
                    style: GoogleFonts.poppins(color: Colors.white)),
              ],
              if (log['details'] != null) ...[
                const SizedBox(height: 8),
                Text(_details(log['details']),
                    style: GoogleFonts.poppins(
                        color: Colors.white70, fontSize: 12)),
              ],
            ],
          ),
        ),
      );
}
