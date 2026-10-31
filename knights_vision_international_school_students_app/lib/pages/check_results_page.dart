import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../api_service.dart';

/// A private result card. The API determines the student from the current
/// session, so the app cannot select another school, branch, class, or roll
/// number to inspect a different student's marks.
class CheckResultsPage extends StatefulWidget {
  const CheckResultsPage({super.key});

  @override
  State<CheckResultsPage> createState() => _CheckResultsPageState();
}

class _CheckResultsPageState extends State<CheckResultsPage> {
  final _apiService = ApiService();
  Map<String, dynamic>? _student;
  List<dynamic> _classSubjects = const [];
  Map<String, List<dynamic>> _resultsBySemester = const {};
  bool _loading = true;
  bool _pdfLoading = false;
  String? _error;

  static const _semesterLabels = {
    'SEMESTER_I': 'Semester I',
    'SEMESTER_II': 'Semester II',
    'SEMESTER_III': 'Semester III',
  };

  @override
  void initState() {
    super.initState();
    _loadResults();
  }

  Future<void> _loadResults() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/students/mysemesterresults',
      );
      if (response.statusCode != 200) {
        throw ApiException('Unable to load your semester result.',
            statusCode: response.statusCode);
      }
      final data = _decode(response.body);
      final rawSemesters = data['resultsBySemester'] is List
          ? data['resultsBySemester'] as List
          : const [];
      final bySemester = <String, List<dynamic>>{
        for (final semester in _semesterLabels.keys) semester: <dynamic>[],
      };
      for (final entry in rawSemesters) {
        if (entry is Map && entry['semester'] is String) {
          bySemester[entry['semester'] as String] =
              entry['results'] is List ? entry['results'] as List : const [];
        }
      }
      if (!mounted) return;
      setState(() {
        _student = data['student'] is Map
            ? Map<String, dynamic>.from(data['student'] as Map)
            : null;
        _classSubjects = data['classSubjects'] is List
            ? data['classSubjects'] as List
            : const [];
        _resultsBySemester = bySemester;
        _loading = false;
      });
    } on ApiException catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Unable to contact the school server. Please try again.';
        _loading = false;
      });
    }
  }

  Map<String, dynamic> _decode(String body) {
    // The API returns JSON objects. This local parser is kept intentionally
    // narrow to avoid treating an unexpected response as valid result data.
    return body.isEmpty
        ? <String, dynamic>{}
        : Map<String, dynamic>.from(jsonDecode(body) as Map);
  }

  Map<String, dynamic>? _resultFor(String semester, int classSubjectId) {
    for (final item in _resultsBySemester[semester] ?? const []) {
      if (item is Map && item['classSubjectId'] == classSubjectId) {
        return Map<String, dynamic>.from(item);
      }
    }
    return null;
  }

  num _number(dynamic value) =>
      value is num ? value : num.tryParse('$value') ?? 0;

  num _total(Map<String, dynamic>? result) {
    if (result == null) return 0;
    final saved = _number(result['totalMarks']);
    return saved > 0
        ? saved
        : _number(result['semesterExamMarks']) +
            _number(result['vivaMarks']) +
            _number(result['internalMarks']);
  }

  String _score(Map<String, dynamic>? result) =>
      result == null ? '—' : _total(result).toStringAsFixed(0);

  String _subjectName(dynamic subject) {
    if (subject is! Map) return 'Subject';
    final nested = subject['subject'];
    return nested is Map && nested['name'] is String
        ? nested['name'] as String
        : 'Subject';
  }

  String _studentName() {
    final student = _student;
    if (student == null) return 'Student';
    return [student['firstName'], student['middleName'], student['lastName']]
        .whereType<String>()
        .where((part) => part.trim().isNotEmpty)
        .join(' ');
  }

  double _averagePercentage() {
    if (_classSubjects.isEmpty) return 0;
    var total = 0.0;
    var publishedSemesters = 0;
    for (final semester in _semesterLabels.keys) {
      final marks = _classSubjects.fold<num>(
          0,
          (sum, item) =>
              sum + _total(_resultFor(semester, (item as Map)['id'] as int)));
      if (marks > 0) {
        total += marks.toDouble() / (_classSubjects.length * 100) * 100;
        publishedSemesters++;
      }
    }
    return publishedSemesters == 0 ? 0 : total / publishedSemesters;
  }

  Future<void> _downloadResult() async {
    if (_student == null || _classSubjects.isEmpty) return;
    setState(() => _pdfLoading = true);
    try {
      final pdf = pw.Document();
      final regular = await PdfGoogleFonts.openSansRegular();
      final bold = await PdfGoogleFonts.openSansBold();
      final rows = _classSubjects.map((subject) {
        final item = subject as Map;
        final classSubjectId = item['id'] as int;
        final first = _resultFor('SEMESTER_I', classSubjectId);
        final second = _resultFor('SEMESTER_II', classSubjectId);
        final third = _resultFor('SEMESTER_III', classSubjectId);
        final totals = [first, second, third]
            .whereType<Map<String, dynamic>>()
            .map(_total)
            .toList();
        final annual = totals.isEmpty
            ? '—'
            : (totals.fold<num>(0, (sum, score) => sum + score) / totals.length)
                .toStringAsFixed(0);
        return [
          _subjectName(item),
          _score(first),
          _score(second),
          _score(third),
          annual
        ];
      }).toList();

      pdf.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(28),
          build: (_) => [
            pw.Center(
              child: pw.Column(
                children: [
                  pw.Text('Sure Success Point School',
                      style: pw.TextStyle(
                          font: bold,
                          fontSize: 20,
                          color: PdfColor.fromHex('#8B0000'))),
                  pw.SizedBox(height: 4),
                  pw.Text('Private Student Result Card',
                      style: pw.TextStyle(font: bold, fontSize: 12)),
                ],
              ),
            ),
            pw.SizedBox(height: 18),
            pw.Container(
              padding: const pw.EdgeInsets.all(12),
              decoration: pw.BoxDecoration(
                  border: pw.Border.all(color: PdfColor.fromHex('#8B0000'))),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text('Student: ${_studentName()}',
                      style: pw.TextStyle(font: bold)),
                  pw.Text(
                      'Admission no.: ${_student!['admissionNumber'] ?? '—'}',
                      style: pw.TextStyle(font: regular)),
                  pw.Text(
                      'Class: ${(_student!['class'] as Map?)?['name'] ?? '—'}${((_student!['class'] as Map?)?['section'] as String?)?.isNotEmpty == true ? ' - ${(_student!['class'] as Map)['section']}' : ''}',
                      style: pw.TextStyle(font: regular)),
                  pw.Text(
                      'Average percentage: ${_averagePercentage().toStringAsFixed(1)}%',
                      style: pw.TextStyle(font: regular)),
                ],
              ),
            ),
            pw.SizedBox(height: 16),
            pw.TableHelper.fromTextArray(
              headers: const [
                'Subject',
                'Semester I',
                'Semester II',
                'Semester III',
                'Annual Avg.'
              ],
              data: rows,
              headerStyle: pw.TextStyle(font: bold, color: PdfColors.white),
              headerDecoration:
                  const pw.BoxDecoration(color: PdfColor.fromInt(0xFF8B0000)),
              cellStyle: pw.TextStyle(font: regular),
              border: pw.TableBorder.all(
                  color: PdfColor.fromInt(0xFF555555), width: .5),
              cellAlignment: pw.Alignment.center,
              headerAlignment: pw.Alignment.center,
            ),
            pw.SizedBox(height: 18),
            pw.Text(
                'This card was generated from the signed-in student account. It is not a public result lookup.',
                style: pw.TextStyle(
                    font: regular, fontSize: 9, color: PdfColors.grey700)),
          ],
        ),
      );
      final bytes = await pdf.save();
      await Printing.sharePdf(
          bytes: Uint8List.fromList(bytes),
          filename:
              'SSPS_Result_${_student!['admissionNumber'] ?? 'student'}.pdf');
    } catch (_) {
      Fluttertoast.showToast(
          msg: 'Unable to generate the result card.',
          backgroundColor: Colors.red);
    } finally {
      if (mounted) setState(() => _pdfLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        title: Text('My Semester Results',
            style: GoogleFonts.poppins(
                color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
              onPressed: _loading ? null : _loadResults,
              icon: const Icon(Icons.refresh)),
          IconButton(
              onPressed: _loading || _student == null || _pdfLoading
                  ? null
                  : _downloadResult,
              icon: const Icon(Icons.download, color: Color(0xFF72E89C))),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadResults,
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
              _errorCard()
            else
              ..._resultCards(),
          ],
        ),
      ),
    );
  }

  Widget _errorCard() => Card(
        color: const Color(0xFF2A1515),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Text(_error!,
                  style: GoogleFonts.poppins(color: Colors.white),
                  textAlign: TextAlign.center),
              const SizedBox(height: 12),
              OutlinedButton(
                  onPressed: _loadResults, child: const Text('Try again')),
            ],
          ),
        ),
      );

  List<Widget> _resultCards() {
    final student = _student!;
    final classInfo = student['class'] as Map?;
    return [
      Card(
        color: const Color(0xFF242424),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_studentName(),
                  style: GoogleFonts.poppins(
                      color: const Color(0xFF72E89C),
                      fontSize: 20,
                      fontWeight: FontWeight.bold)),
              Text('Admission no.: ${student['admissionNumber'] ?? '—'}',
                  style: GoogleFonts.poppins(color: Colors.white70)),
              Text(
                  'Class: ${classInfo?['name'] ?? '—'}${(classInfo?['section'] as String?)?.isNotEmpty == true ? ' - ${classInfo?['section']}' : ''}',
                  style: GoogleFonts.poppins(color: Colors.white70)),
              const SizedBox(height: 8),
              Text(
                  'Average percentage: ${_averagePercentage().toStringAsFixed(1)}%',
                  style: GoogleFonts.poppins(
                      color: const Color(0xFFFFD54F),
                      fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
      const SizedBox(height: 12),
      if (_classSubjects.isEmpty)
        _emptyCard('No class subjects are configured for your current session.')
      else
        ..._classSubjects.map((subject) => _subjectCard(subject as Map)),
      const SizedBox(height: 20),
      SizedBox(
        height: 48,
        child: ElevatedButton.icon(
          onPressed: _pdfLoading ? null : _downloadResult,
          style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00C853),
              foregroundColor: Colors.black),
          icon: _pdfLoading
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Colors.black))
              : const Icon(Icons.picture_as_pdf),
          label: Text(
              _pdfLoading
                  ? 'Preparing result card…'
                  : 'Download My Result Card',
              style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        ),
      ),
    ];
  }

  Widget _emptyCard(String text) => Card(
        color: const Color(0xFF242424),
        child: Padding(
            padding: const EdgeInsets.all(20),
            child: Text(text,
                style: GoogleFonts.poppins(color: Colors.white70),
                textAlign: TextAlign.center)),
      );

  Widget _subjectCard(Map subject) {
    final id = subject['id'] as int;
    final first = _resultFor('SEMESTER_I', id);
    final second = _resultFor('SEMESTER_II', id);
    final third = _resultFor('SEMESTER_III', id);
    final available =
        [first, second, third].whereType<Map<String, dynamic>>().toList();
    final annual = available.isEmpty
        ? '—'
        : (available.map(_total).fold<num>(0, (sum, score) => sum + score) /
                available.length)
            .toStringAsFixed(0);
    return Card(
      color: const Color(0xFF242424),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_subjectName(subject),
                style: GoogleFonts.poppins(
                    color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Row(
              children: [
                _scoreTile('Sem I', _score(first)),
                _scoreTile('Sem II', _score(second)),
                _scoreTile('Sem III', _score(third)),
                _scoreTile('Annual', annual, color: const Color(0xFF72E89C)),
              ],
            ),
            if ((first?['remarks'] ??
                    second?['remarks'] ??
                    third?['remarks']) !=
                null) ...[
              const SizedBox(height: 8),
              Text(
                  'Remark: ${(first?['remarks'] ?? second?['remarks'] ?? third?['remarks']).toString()}',
                  style:
                      GoogleFonts.poppins(color: Colors.white70, fontSize: 12)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _scoreTile(String label, String score, {Color color = Colors.white}) =>
      Expanded(
        child: Column(
          children: [
            Text(label,
                style:
                    GoogleFonts.poppins(color: Colors.white60, fontSize: 11)),
            const SizedBox(height: 3),
            Text(score,
                style: GoogleFonts.poppins(
                    color: color, fontWeight: FontWeight.bold)),
          ],
        ),
      );
}
