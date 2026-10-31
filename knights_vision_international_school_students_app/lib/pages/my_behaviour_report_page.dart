import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../api_service.dart';

class MyBehaviourReportPage extends StatefulWidget {
  const MyBehaviourReportPage({super.key});

  @override
  State<MyBehaviourReportPage> createState() => _MyBehaviourReportPageState();
}

class _MyBehaviourReportPageState extends State<MyBehaviourReportPage> {
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
          '/api/a1-knights-students-panel/students/mybehaviourlogs');
      if (response.statusCode != 200)
        throw ApiException('Unable to load your behaviour report.',
            statusCode: response.statusCode);
      final data = Map<String, dynamic>.from(jsonDecode(response.body) as Map);
      if (mounted)
        setState(() {
          _logs = data['behaviourLogs'] is List
              ? data['behaviourLogs'] as List
              : const [];
          _loading = false;
        });
    } on ApiException catch (error) {
      if (mounted)
        setState(() {
          _error = error.message;
          _loading = false;
        });
    } catch (_) {
      if (mounted)
        setState(() {
          _error = 'Unable to contact the school server. Please try again.';
          _loading = false;
        });
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: const Color(0xFF181818),
        appBar: AppBar(
          backgroundColor: const Color(0xFFB71C1C),
          title: Text('My Behaviour Report',
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
                        child: CircularProgressIndicator(
                            color: Color(0xFF00C853))))
              else if (_error != null)
                _message(_error!, error: true)
              else if (_logs.isEmpty)
                _message(
                    'No behaviour records have been published for your account.')
              else
                ..._logs.map(
                    (entry) => _card(Map<String, dynamic>.from(entry as Map))),
            ],
          ),
        ),
      );

  Widget _message(String text, {bool error = false}) => Card(
        color: error ? const Color(0xFF2A1515) : const Color(0xFF242424),
        child: Padding(
            padding: const EdgeInsets.all(20),
            child: Text(text,
                style: GoogleFonts.poppins(color: Colors.white),
                textAlign: TextAlign.center)),
      );

  Widget _card(Map<String, dynamic> log) {
    final date = DateTime.tryParse('${log['incidentDate']}');
    final subject = (log['classSubject'] as Map?)?['subject'] as Map?;
    final punishment = log['punishment'] as Map?;
    final severity = (log['severityLevel'] as num?)?.toInt() ?? 0;
    return Card(
      color: const Color(0xFF242424),
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(
              '${log['category'] ?? 'Record'} · ${log['type'] ?? 'School note'}',
              style: GoogleFonts.poppins(
                  color: const Color(0xFFFFD54F), fontWeight: FontWeight.bold)),
          const SizedBox(height: 5),
          Text(
              '${date?.day.toString().padLeft(2, '0') ?? '--'}/${date?.month.toString().padLeft(2, '0') ?? '--'}/${date?.year ?? '----'} · Severity $severity/5',
              style: GoogleFonts.poppins(color: Colors.white60, fontSize: 12)),
          if (subject?['name'] != null)
            Text('Subject: ${subject!['name']}',
                style:
                    GoogleFonts.poppins(color: Colors.white70, fontSize: 12)),
          if ((log['description'] as String?)?.trim().isNotEmpty == true) ...[
            const SizedBox(height: 8),
            Text(log['description'] as String,
                style: GoogleFonts.poppins(color: Colors.white))
          ],
          if (punishment?['title'] != null) ...[
            const SizedBox(height: 8),
            Text('School action: ${punishment!['title']}',
                style: GoogleFonts.poppins(color: Colors.white70))
          ],
          if (log['isResolved'] == true)
            Text(
                'Resolved${log['resolvedNote'] != null ? ': ${log['resolvedNote']}' : ''}',
                style: GoogleFonts.poppins(
                    color: const Color(0xFF72E89C), fontSize: 12)),
        ]),
      ),
    );
  }
}
