import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:google_fonts/google_fonts.dart';
import 'school_select.dart';
import 'school_branch_select.dart';
import 'school_class_select.dart';
import '../constants.dart';

class CheckResultsPage extends StatefulWidget {
  const CheckResultsPage({super.key});

  @override
  _CheckResultsPageState createState() => _CheckResultsPageState();
}

class _CheckResultsPageState extends State<CheckResultsPage> {
  final _storage = const FlutterSecureStorage();
  String? _selectedSchool;
  String? _selectedBranch;
  String? _selectedClass;
  String _rollNo = '';
  String? _className;
  String? _classSubjectId;
  Map<String, dynamic>? _studentData;
  List<dynamic>? _resultData;
  List<dynamic> _classSubjects = [];
  Map<String, int>? _sem1Totals;
  Map<String, int>? _sem2Totals;
  Map<String, int>? _sem3Totals;
  int? _totalFullMarks;
  int? _annualTotal;
  int? _annualPercentage;
  bool _loading = false;
  bool _pdfLoading = false;
  String? _error;
  final Color greenAccent = const Color(0xFF00C853);

  // Helper function to safely parse dynamic values to int
  int _parseToInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    if (value is double) return value.floor();
    if (value is String) {
      try {
        return int.parse(value.trim());
      } catch (e) {
        print('Error parsing string to int: $value, error: $e');
        return 0;
      }
    }
    return 0;
  }

  // Define grade colors
  Color getGradeColor(String grade) {
    switch (grade) {
      case 'A':
      case 'A+':
      case 'AA':
        return const Color(0xFF00C853); // Green for A/A+/AA
      case 'B':
      case 'B+':
        return const Color(0xFF0288D1); // Blue for B/B+
      case 'C':
      case 'C+':
        return const Color(0xFFFFCA28); // Yellow for C/C+
      case 'D':
      case 'F':
        return const Color(0xFFD32F2F); // Red for D/F
      default:
        return Colors.white;
    }
  }

  Map<String, dynamic> getGrade(int percentage) {
    if (percentage >= 90) return {'grade': 'AA', 'color': const PdfColor.fromInt(0xFF008000), 'point': 10};
    if (percentage >= 80) return {'grade': 'A+', 'color': const PdfColor.fromInt(0xFF00FF00), 'point': 9};
    if (percentage >= 60) return {'grade': 'A', 'color': const PdfColor.fromInt(0xFF87CEEB), 'point': 8};
    if (percentage >= 45) return {'grade': 'B+', 'color': const PdfColor.fromInt(0xFFFFFF00), 'point': 7};
    if (percentage >= 35) return {'grade': 'B', 'color': const PdfColor.fromInt(0xFFFFA500), 'point': 6};
    if (percentage >= 25) return {'grade': 'C', 'color': const PdfColor.fromInt(0xFFFFFFE0), 'point': 5};
    return {'grade': 'D', 'color': const PdfColor.fromInt(0xFFFF0000), 'point': 4};
  }

  Map<String, String> calculateCGPA(List<dynamic> resultsBySemester, List<dynamic> classSubjects) {
    double sem1Points = 0, sem2Points = 0, sem3Points = 0;
    final subjectCount = classSubjects.length;

    for (var cs in classSubjects) {
      final sem1Result = resultsBySemester.firstWhere(
            (r) => r['semester'] == 'SEMESTER_I',
        orElse: () => {'results': []},
      )['results'].firstWhere(
            (r) => r['classSubjectId'] == cs['id'],
        orElse: () => <String, dynamic>{
          'semesterExamMarks': 0,
          'vivaMarks': 0,
          'internalMarks': 0,
          'totalMarks': 0,
          'remarks': '',
        },
      );
      final sem2Result = resultsBySemester.firstWhere(
            (r) => r['semester'] == 'SEMESTER_II',
        orElse: () => {'results': []},
      )['results'].firstWhere(
            (r) => r['classSubjectId'] == cs['id'],
        orElse: () => <String, dynamic>{
          'semesterExamMarks': 0,
          'vivaMarks': 0,
          'internalMarks': 0,
          'totalMarks': 0,
          'remarks': '',
        },
      );
      final sem3Result = resultsBySemester.firstWhere(
            (r) => r['semester'] == 'SEMESTER_III',
        orElse: () => {'results': []},
      )['results'].firstWhere(
            (r) => r['classSubjectId'] == cs['id'],
        orElse: () => <String, dynamic>{
          'semesterExamMarks': 0,
          'vivaMarks': 0,
          'internalMarks': 0,
          'totalMarks': 0,
          'remarks': '',
        },
      );

      final sem1Total = _parseToInt(sem1Result['semesterExamMarks']) +
          _parseToInt(sem1Result['vivaMarks']) +
          _parseToInt(sem1Result['internalMarks']);
      final sem2Total = _parseToInt(sem2Result['semesterExamMarks']) +
          _parseToInt(sem2Result['vivaMarks']) +
          _parseToInt(sem2Result['internalMarks']);
      final sem3Total = _parseToInt(sem3Result['semesterExamMarks']) +
          _parseToInt(sem3Result['vivaMarks']) +
          _parseToInt(sem3Result['internalMarks']);

      sem1Points += getGrade(sem1Total)['point'];
      sem2Points += getGrade(sem2Total)['point'];
      sem3Points += getGrade(sem3Total)['point'];
    }

    return {
      'sem1CGPA': subjectCount > 0 ? (sem1Points / subjectCount).toStringAsFixed(2) : '0.00',
      'sem2CGPA': subjectCount > 0 ? (sem2Points / subjectCount).toStringAsFixed(2) : '0.00',
      'sem3CGPA': subjectCount > 0 ? (sem3Points / subjectCount).toStringAsFixed(2) : '0.00',
      'overallCGPA': subjectCount > 0 ? ((sem1Points + sem2Points + sem3Points) / (subjectCount * 3)).toStringAsFixed(2) : '0.00',
    };
  }

  String formatSubjectName(String? name) {
    if (name == null || name == 'N/A') return 'N/A';
    if (name.length <= 14) return name;
    if (name.contains(' ') || name.contains('-')) {
      return '${name.substring(0, 3)}.. ${name.substring(name.length - 8)}';
    }
    return name.substring(0, 14);
  }

  Future<void> _handleSearch() async {
    if (_selectedSchool == null ||
        _selectedBranch == null ||
        _selectedClass == null ||
        _rollNo.isEmpty) {
      setState(() => _error = 'Please fill all fields');
      Fluttertoast.showToast(
        msg: 'Please fill all fields',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        setState(() {
          _loading = false;
          _error = 'User not authenticated. Please log in.';
        });
        Fluttertoast.showToast(
          msg: 'User not authenticated. Please log in.',
          backgroundColor: Colors.red,
          textColor: Colors.white,
        );
        Navigator.pushReplacementNamed(context, '/login');
        return;
      }

      print('Fetching semester results');
      final uri = Uri.parse(
          '$BASE_URL/api/semester-results/student?schoolId=$_selectedSchool&branchId=$_selectedBranch&classId=$_selectedClass&rollNumber=$_rollNo');
      print('Fetch URL: $uri');

      final response = await http.get(
        uri,
        headers: {'Authorization': 'Bearer $token'},
      );

      print('Fetch response status: ${response.statusCode}');
      print('Fetch response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;

        // Normalize student data
        final rawStudent = (data['student'] as Map?) ?? {};
        final student = rawStudent.map<String, dynamic>((key, value) {
          if (value is String) {
            return MapEntry(key.toString(), value.replaceAll('\n', ' '));
          } else {
            return MapEntry(key.toString(), value);
          }
        });

        // Normalize class subjects
        final classSubjectsRaw = (data['classSubjects'] as List?) ?? [];
        final classSubjects = classSubjectsRaw.map<Map<String, String>>((s) {
          final subject = s as Map? ?? {};
          return {
            'id': (subject['id']?.toString().replaceAll('\n', ' ')) ?? 'N/A',
            'name': (subject['subject']?['name']?.toString().replaceAll('\n', ' ')) ?? 'N/A',
          };
        }).toList();

        // Normalize results by semester
        final resultsBySemesterRaw = (data['resultsBySemester'] as List?) ?? [];
        final resultsBySemester = resultsBySemesterRaw.map<Map<String, dynamic>>((r) {
          final sem = r as Map? ?? {};
          final resultsRaw = (sem['results'] as List?) ?? [];
          final normalizedResults = resultsRaw.map<Map<String, dynamic>>((res) {
            final result = res as Map? ?? {};
            final semesterExamMarks = _parseToInt(result['semesterExamMarks']);
            final vivaMarks = _parseToInt(result['vivaMarks']);
            final internalMarks = _parseToInt(result['internalMarks']);
            final totalMarks = _parseToInt(result['totalMarks']) == 0
                ? semesterExamMarks + vivaMarks + internalMarks
                : _parseToInt(result['totalMarks']);
            return {
              'subjectId': (result['subjectId']?.toString().replaceAll('\n', ' ')) ?? 'N/A',
              'classSubjectId': (result['classSubjectId']?.toString().replaceAll('\n', ' ')) ?? 'N/A',
              'semesterExamMarks': semesterExamMarks,
              'vivaMarks': vivaMarks,
              'internalMarks': internalMarks,
              'totalMarks': totalMarks,
              'remarks': (result['remarks']?.toString().replaceAll('\n', ' ')) ?? '',
            };
          }).toList();

          return {
            'semester': (sem['semester']?.toString().replaceAll('\n', ' ')) ?? 'N/A',
            'results': normalizedResults,
          };
        }).toList();

        Map<String, int> _foldTotals(List<dynamic> semesterList, String key) {
          final sem = semesterList.firstWhere(
                (r) => (r['semester'] as String?) == key,
            orElse: () => {'results': []},
          );
          final List<Map<String, dynamic>> results = (sem['results'] as List<dynamic>).cast<Map<String, dynamic>>();
          return results.fold<Map<String, int>>(
            {
              'semesterExamMarks': 0,
              'vivaMarks': 0,
              'internalMarks': 0,
              'totalMarks': 0,
            },
                (acc, r) => {
              'semesterExamMarks': acc['semesterExamMarks']! + _parseToInt(r['semesterExamMarks']),
              'vivaMarks': acc['vivaMarks']! + _parseToInt(r['vivaMarks']),
              'internalMarks': acc['internalMarks']! + _parseToInt(r['internalMarks']),
              'totalMarks': acc['totalMarks']! + _parseToInt(r['totalMarks']),
            },
          );
        }

        final sem1Totals = _foldTotals(resultsBySemester, 'SEMESTER_I');
        final sem2Totals = _foldTotals(resultsBySemester, 'SEMESTER_II');
        final sem3Totals = _foldTotals(resultsBySemester, 'SEMESTER_III');

        final totalFullMarks = classSubjects.length * 100;
        final annualTotal = ((sem1Totals['totalMarks']! +
            sem2Totals['totalMarks']! +
            sem3Totals['totalMarks']!) /
            3)
            .floor();
        final annualPercentage =
        totalFullMarks > 0 ? ((annualTotal / totalFullMarks) * 100).floor() : 0;

        setState(() {
          _studentData = student;
          _classSubjects = classSubjects;
          _resultData = resultsBySemester;
          _sem1Totals = sem1Totals;
          _sem2Totals = sem2Totals;
          _sem3Totals = sem3Totals;
          _totalFullMarks = totalFullMarks;
          _annualTotal = annualTotal;
          _annualPercentage = annualPercentage;
          _className =
              (student['class']?['name']?.toString().replaceAll('\n', ' ')) ?? 'Unknown';
          _loading = false;
        });

        print('Student data: ${jsonEncode(student)}');
        print('Class subjects: ${jsonEncode(classSubjects)}');
        print('Results by semester: ${jsonEncode(resultsBySemester)}');
      } else if (response.statusCode == 401 || response.statusCode == 403) {
        setState(() {
          _error = 'Authentication failed. Please log in again.';
          _loading = false;
        });
        Fluttertoast.showToast(
          msg: 'Authentication failed. Please log in again.',
          backgroundColor: Colors.red,
          textColor: Colors.white,
        );
        Navigator.pushReplacementNamed(context, '/login');
      } else {
        setState(() {
          _error = 'Failed to fetch results. Server responded ${response.statusCode}.';
          _loading = false;
        });
        Fluttertoast.showToast(
          msg: 'Failed to fetch results. Server responded ${response.statusCode}.',
          backgroundColor: Colors.red,
          textColor: Colors.white,
        );
      }
    } catch (e, stackTrace) {
      print('Error fetching results: $e');
      print(stackTrace);
      setState(() {
        _error = 'Failed to fetch results: ${e.toString().replaceFirst('Exception: ', '')}';
        _loading = false;
      });
      Fluttertoast.showToast(
        msg: 'Failed to fetch results: ${e.toString().replaceFirst('Exception: ', '')}',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
    }
  }

  Future<void> _handleDownloadPDF() async {
    if (_studentData == null) {
      Fluttertoast.showToast(msg: 'Student not found', backgroundColor: Colors.red, textColor: Colors.white);
      return;
    }

    setState(() => _pdfLoading = true);
    try {
      final doc = pw.Document();
      final font = await PdfGoogleFonts.openSansRegular();
      final boldFont = await PdfGoogleFonts.openSansBold();

      final tableData = _classSubjects.map((cs) {
        final sem1Result = _resultData!.firstWhere(
              (r) => r['semester'] == 'SEMESTER_I',
          orElse: () => {'results': []},
        )['results'].firstWhere(
              (r) => r['classSubjectId'] == cs['id'],
          orElse: () => <String, dynamic>{
            'semesterExamMarks': 0,
            'vivaMarks': 0,
            'internalMarks': 0,
            'totalMarks': 0,
            'remarks': '',
          },
        );
        final sem2Result = _resultData!.firstWhere(
              (r) => r['semester'] == 'SEMESTER_II',
          orElse: () => {'results': []},
        )['results'].firstWhere(
              (r) => r['classSubjectId'] == cs['id'],
          orElse: () => <String, dynamic>{
            'semesterExamMarks': 0,
            'vivaMarks': 0,
            'internalMarks': 0,
            'totalMarks': 0,
            'remarks': '',
          },
        );
        final sem3Result = _resultData!.firstWhere(
              (r) => r['semester'] == 'SEMESTER_III',
          orElse: () => {'results': []},
        )['results'].firstWhere(
              (r) => r['classSubjectId'] == cs['id'],
          orElse: () => <String, dynamic>{
            'semesterExamMarks': 0,
            'vivaMarks': 0,
            'internalMarks': 0,
            'totalMarks': 0,
            'remarks': '',
          },
        );

        final sem1Total = _parseToInt(sem1Result['semesterExamMarks']) +
            _parseToInt(sem1Result['vivaMarks']) +
            _parseToInt(sem1Result['internalMarks']);
        final sem2Total = _parseToInt(sem2Result['semesterExamMarks']) +
            _parseToInt(sem2Result['vivaMarks']) +
            _parseToInt(sem2Result['internalMarks']);
        final sem3Total = _parseToInt(sem3Result['semesterExamMarks']) +
            _parseToInt(sem3Result['vivaMarks']) +
            _parseToInt(sem3Result['internalMarks']);
        final annualTotal = ((sem1Total + sem2Total + sem3Total) / 3).floor();
        final annualPercentage = annualTotal;

        return [
          formatSubjectName(cs['name']),
          _parseToInt(sem1Result['semesterExamMarks']).toString(),
          _parseToInt(sem1Result['vivaMarks']).toString(),
          _parseToInt(sem1Result['internalMarks']).toString(),
          sem1Total.toString(),
          getGrade(sem1Total)['grade'],
          _parseToInt(sem2Result['semesterExamMarks']).toString(),
          _parseToInt(sem2Result['vivaMarks']).toString(),
          _parseToInt(sem2Result['internalMarks']).toString(),
          sem2Total.toString(),
          getGrade(sem2Total)['grade'],
          _parseToInt(sem3Result['semesterExamMarks']).toString(),
          _parseToInt(sem3Result['vivaMarks']).toString(),
          _parseToInt(sem3Result['internalMarks']).toString(),
          sem3Total.toString(),
          getGrade(sem3Total)['grade'],
          annualPercentage.toString(),
          getGrade(annualPercentage)['grade'],
          sem1Result['remarks'] ?? sem2Result['remarks'] ?? sem3Result['remarks'] ?? '',
        ];
      }).toList();

      final cgpa = calculateCGPA(_resultData!, _classSubjects);

      tableData.add([
        'Total',
        _sem1Totals!['semesterExamMarks'].toString(),
        _sem1Totals!['vivaMarks'].toString(),
        _sem1Totals!['internalMarks'].toString(),
        _sem1Totals!['totalMarks'].toString(),
        getGrade((_sem1Totals!['totalMarks']! / _totalFullMarks! * 100).floor())['grade'],
        _sem2Totals!['semesterExamMarks'].toString(),
        _sem2Totals!['vivaMarks'].toString(),
        _sem2Totals!['internalMarks'].toString(),
        _sem2Totals!['totalMarks'].toString(),
        getGrade((_sem2Totals!['totalMarks']! / _totalFullMarks! * 100).floor())['grade'],
        _sem3Totals!['semesterExamMarks'].toString(),
        _sem3Totals!['vivaMarks'].toString(),
        _sem3Totals!['internalMarks'].toString(),
        _sem3Totals!['totalMarks'].toString(),
        getGrade((_sem3Totals!['totalMarks']! / _totalFullMarks! * 100).floor())['grade'],
        _annualPercentage!.toString(),
        getGrade(_annualPercentage!)['grade'],
        '',
      ]);

      tableData.add([
        'CGPA',
        '', '', '', '', cgpa['sem1CGPA'],
        '', '', '', '', cgpa['sem2CGPA'],
        '', '', '', '', cgpa['sem3CGPA'],
        cgpa['overallCGPA'], '', '',
      ]);

      final gradeTableData = [
        ['90-100', 'AA', 'Outstanding', '10'],
        ['80-89', 'A+', 'Excellent', '9'],
        ['60-79', 'A', 'Very Good', '8'],
        ['45-59', 'B+', 'Good', '7'],
        ['35-44', 'B', 'Satisfactory', '6'],
        ['25-34', 'C', 'Marginal', '5'],
        ['Below 25', 'D', 'Dissatisfactory', '4'],
      ];

      doc.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          build: (pw.Context context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Stack(
                  children: [
                    pw.Text(
                      'Sure Success Point School',
                      style: pw.TextStyle(
                        font: boldFont,
                        fontSize: 49,
                        color: const PdfColor.fromInt(0xFF4CAF50),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.Text(
                      'Sure Success Point School',
                      style: pw.TextStyle(
                        font: boldFont,
                        fontSize: 49,
                        color: const PdfColor.fromInt(0xFFD50000),
                        decoration: pw.TextDecoration.underline,
                        decorationThickness: 1.2,
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                  ],
                ),
                pw.Text(
                  'Institution of Humanism, Hardwork, Discipline, Technology & Excellence',
                  style: pw.TextStyle(font: boldFont, fontSize: 12.8, color: const PdfColor.fromInt(0xFF00BFA5)),
                ),
                pw.Text(
                  'Regd No.: S/1L 60976',
                  style: pw.TextStyle(font: font, fontSize: 12, color: const PdfColor.fromInt(0xFF333333)),
                ),
                pw.Text(
                  'Institution ID.: KNIGHTS0000001',
                  style: pw.TextStyle(font: font, fontSize: 12, color: const PdfColor.fromInt(0xFF333333)),
                ),
                pw.Text(
                  'Najirpur, Alinagar, Kaliachak, Malda - India',
                  style: pw.TextStyle(font: font, fontSize: 12, color: const PdfColor.fromInt(0xFF333333)),
                ),
                pw.Text(
                  'UDISE: 19060419693',
                  style: pw.TextStyle(font: font, fontSize: 12, color: const PdfColor.fromInt(0xFF333333)),
                ),
                pw.Text(
                  'Branch: ${_studentData!['class']['branch']['name']}',
                  style: pw.TextStyle(font: font, fontSize: 12, color: const PdfColor.fromInt(0xFF333333)),
                ),
                pw.Text(
                  'www.sspointschool.in',
                  style: pw.TextStyle(font: font, fontSize: 12, color: const PdfColor.fromInt(0xFF333333)),
                ),
                pw.SizedBox(height: 5),
                pw.Container(
                  width: 190,
                  child: pw.Table.fromTextArray(
                    headers: ['ANNUAL PROGRESS REPORT CARD - ${DateTime.now().year}'],
                    data: [['']],
                    border: pw.TableBorder.all(color: const PdfColor.fromInt(0xFF444444), width: 0.3),
                    headerStyle: pw.TextStyle(font: boldFont, fontSize: 10, color: const PdfColor.fromInt(0xFF000000)),
                    headerDecoration: const pw.BoxDecoration(),
                    cellStyle: pw.TextStyle(font: font, fontSize: 10, color: const PdfColor.fromInt(0xFF000000)),
                    cellAlignments: {0: pw.Alignment.center},
                    cellPadding: const pw.EdgeInsets.all(1),
                    columnWidths: {0: const pw.FixedColumnWidth(190)},
                  ),
                ),
                pw.SizedBox(height: 5),
                pw.Text(
                  'Student Name: ${_studentData!['firstName']} ${_studentData!['lastName']}',
                  style: pw.TextStyle(font: font, fontSize: 11, color: const PdfColor.fromInt(0xFF000000)),
                ),
                pw.Text(
                  'C/O.: ${_studentData!['guardianName'] ?? 'N/A'}',
                  style: pw.TextStyle(font: font, fontSize: 11, color: const PdfColor.fromInt(0xFF000000)),
                ),
                pw.Text(
                  'UID.: ${_studentData!['admissionNumber'] ?? 'N/A'}',
                  style: pw.TextStyle(font: font, fontSize: 11, color: const PdfColor.fromInt(0xFF000000)),
                ),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(
                      '${_studentData!['class']['name']}${_studentData!['class']['section'] != null ? '-${_studentData!['class']['section']}' : ''}',
                      style: pw.TextStyle(font: font, fontSize: 11, color: const PdfColor.fromInt(0xFF000000)),
                    ),
                    pw.Text(
                      'Roll No.: ${_studentData!['rollNumber'] ?? 'N/A'}',
                      style: pw.TextStyle(font: font, fontSize: 11, color: const PdfColor.fromInt(0xFF000000)),
                    ),
                  ],
                ),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(
                      'Section: ${_studentData!['class']['section'] ?? 'A'}',
                      style: pw.TextStyle(font: font, fontSize: 11, color: const PdfColor.fromInt(0xFF000000)),
                    ),
                    pw.Text(
                      'Reg No.: ${_studentData!['admissionNumber'] ?? 'N/A'}',
                      style: pw.TextStyle(font: font, fontSize: 11, color: const PdfColor.fromInt(0xFF000000)),
                    ),
                  ],
                ),
                pw.Text(
                  'Student Code: ${_studentData!['admissionNumber'] ?? 'N/A'}',
                  style: pw.TextStyle(font: font, fontSize: 11, color: const PdfColor.fromInt(0xFF000000)),
                ),
                pw.SizedBox(height: 5),
                pw.Table(
                  border: pw.TableBorder.all(color: const PdfColor.fromInt(0xFF444444), width: 0.3),
                  columnWidths: {
                    0: const pw.FlexColumnWidth(2),
                    1: const pw.FlexColumnWidth(1),
                    2: const pw.FlexColumnWidth(1),
                    3: const pw.FlexColumnWidth(1),
                    4: const pw.FlexColumnWidth(1),
                    5: const pw.FlexColumnWidth(1),
                    6: const pw.FlexColumnWidth(1),
                    7: const pw.FlexColumnWidth(1),
                    8: const pw.FlexColumnWidth(1),
                    9: const pw.FlexColumnWidth(1),
                    10: const pw.FlexColumnWidth(1),
                    11: const pw.FlexColumnWidth(1),
                    12: const pw.FlexColumnWidth(1),
                    13: const pw.FlexColumnWidth(1),
                    14: const pw.FlexColumnWidth(1),
                    15: const pw.FlexColumnWidth(1),
                    16: const pw.FlexColumnWidth(1),
                    17: const pw.FlexColumnWidth(1),
                    18: const pw.FlexColumnWidth(2),
                  },
                  children: [
                    pw.TableRow(
                      decoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFF4CAF50)),
                      children: [
                        pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          child: pw.Text('Subject', style: pw.TextStyle(font: boldFont, fontSize: 8, color: const PdfColor.fromInt(0xFFFFFFFF)), textAlign: pw.TextAlign.left),
                        ),
                        pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          child: pw.Text('1st Semester', style: pw.TextStyle(font: boldFont, fontSize: 8, color: const PdfColor.fromInt(0xFFFFFFFF)), textAlign: pw.TextAlign.center),
                          alignment: pw.Alignment.center,
                        ),
                        ...List.generate(4, (_) => pw.Container(padding: const pw.EdgeInsets.all(1))),
                        pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          child: pw.Text('2nd Semester', style: pw.TextStyle(font: boldFont, fontSize: 8, color: const PdfColor.fromInt(0xFFFFFFFF)), textAlign: pw.TextAlign.center),
                          alignment: pw.Alignment.center,
                        ),
                        ...List.generate(4, (_) => pw.Container(padding: const pw.EdgeInsets.all(1))),
                        pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          child: pw.Text('3rd Semester', style: pw.TextStyle(font: boldFont, fontSize: 8, color: const PdfColor.fromInt(0xFFFFFFFF)), textAlign: pw.TextAlign.center),
                          alignment: pw.Alignment.center,
                        ),
                        ...List.generate(4, (_) => pw.Container(padding: const pw.EdgeInsets.all(1))),
                        pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          child: pw.Text('Annual', style: pw.TextStyle(font: boldFont, fontSize: 8, color: const PdfColor.fromInt(0xFFFFFFFF)), textAlign: pw.TextAlign.center),
                          alignment: pw.Alignment.center,
                        ),
                        pw.Container(padding: const pw.EdgeInsets.all(1)),
                        pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          child: pw.Text('Remarks', style: pw.TextStyle(font: boldFont, fontSize: 8, color: const PdfColor.fromInt(0xFFFFFFFF)), textAlign: pw.TextAlign.left),
                          alignment: pw.Alignment.centerLeft,
                        ),
                      ],
                    ),
                    pw.TableRow(
                      decoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFF4CAF50)),
                      children: [
                        pw.Container(padding: const pw.EdgeInsets.all(1)),
                        ...['SM', 'VM', 'IAM', 'TM', 'ISG'].map((header) => pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          child: pw.Text(header, style: pw.TextStyle(font: boldFont, fontSize: 8, color: const PdfColor.fromInt(0xFFFFFFFF)), textAlign: pw.TextAlign.center),
                          alignment: pw.Alignment.center,
                        )),
                        ...['SM', 'VM', 'IAM', 'TM', 'ISG'].map((header) => pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          child: pw.Text(header, style: pw.TextStyle(font: boldFont, fontSize: 8, color: const PdfColor.fromInt(0xFFFFFFFF)), textAlign: pw.TextAlign.center),
                          alignment: pw.Alignment.center,
                        )),
                        ...['SM', 'VM', 'IAM', 'TM', 'ISG'].map((header) => pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          child: pw.Text(header, style: pw.TextStyle(font: boldFont, fontSize: 8, color: const PdfColor.fromInt(0xFFFFFFFF)), textAlign: pw.TextAlign.center),
                          alignment: pw.Alignment.center,
                        )),
                        pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          child: pw.Text('%', style: pw.TextStyle(font: boldFont, fontSize: 8, color: const PdfColor.fromInt(0xFFFFFFFF)), textAlign: pw.TextAlign.center),
                          alignment: pw.Alignment.center,
                        ),
                        pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          child: pw.Text('Grade', style: pw.TextStyle(font: boldFont, fontSize: 8, color: const PdfColor.fromInt(0xFFFFFFFF)), textAlign: pw.TextAlign.center),
                          alignment: pw.Alignment.center,
                        ),
                        pw.Container(padding: const pw.EdgeInsets.all(1)),
                      ],
                    ),
                    ...tableData.map((row) => pw.TableRow(
                      children: row.asMap().entries.map((entry) {
                        final colIndex = entry.key;
                        final cellText = entry.value;
                        PdfColor bgColor;
                        if (colIndex >= 1 && colIndex <= 5) {
                          bgColor = const PdfColor.fromInt(0xFFF0F8FF);
                        } else if (colIndex >= 6 && colIndex <= 10) {
                          bgColor = const PdfColor.fromInt(0xFFF5F5DC);
                        } else if (colIndex >= 11 && colIndex <= 15) {
                          bgColor = const PdfColor.fromInt(0xFFFFE4E1);
                        } else {
                          bgColor = const PdfColor.fromInt(0xFFFFFFFF);
                        }
                        return pw.Container(
                          padding: const pw.EdgeInsets.all(1),
                          decoration: pw.BoxDecoration(color: bgColor),
                          alignment: colIndex == 0 || colIndex == 18 ? pw.Alignment.centerLeft : pw.Alignment.center,
                          child: pw.Text(
                            cellText,
                            style: pw.TextStyle(font: font, fontSize: 8, color: const PdfColor.fromInt(0xFF000000)),
                          ),
                        );
                      }).toList(),
                    )),
                  ],
                ),
                pw.SizedBox(height: 10),
                pw.Container(
                  height: PdfPageFormat.a4.height - 130,
                  child: pw.Row(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Table.fromTextArray(
                        headers: ['Abbreviation', 'Description'],
                        data: [
                          ['SM', 'Semester Exam Marks (Maximum: 70)'],
                          ['IAM', 'Internal Assignment Marks (Maximum: 24)'],
                          ['VM', 'Viva Marks (Maximum: 6)'],
                          ['TM', 'Total Marks (SM + IAM + VM = 100)'],
                          ['ISG', 'Individual Subject Grade'],
                          ['AIC', 'Academics In Charge'],
                          ['HOD', 'Head of Department'],
                          ['CGPA', 'Cumulative Grade Point Average'],
                        ],
                        border: pw.TableBorder.all(color: const PdfColor.fromInt(0xFF444444), width: 0.3),
                        headerStyle: pw.TextStyle(font: boldFont, fontSize: 9, color: const PdfColor.fromInt(0xFFFFFFFF)),
                        headerDecoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFF4CAF50)),
                        cellStyle: pw.TextStyle(font: font, fontSize: 9, color: const PdfColor.fromInt(0xFF000000)),
                        cellPadding: const pw.EdgeInsets.all(1),
                        columnWidths: {0: const pw.FixedColumnWidth(87 / 2), 1: const pw.FixedColumnWidth(87 / 2)},
                      ),
                      pw.SizedBox(width: 3),
                      pw.Table(
                        border: pw.TableBorder.all(color: const PdfColor.fromInt(0xFF444444), width: 0.3),
                        columnWidths: {
                          0: const pw.FixedColumnWidth(100 / 4),
                          1: const pw.FixedColumnWidth(100 / 4),
                          2: const pw.FixedColumnWidth(100 / 4),
                          3: const pw.FixedColumnWidth(100 / 4),
                        },
                        children: [
                          pw.TableRow(
                            decoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFF4CAF50)),
                            children: [
                              pw.Container(
                                padding: const pw.EdgeInsets.all(1),
                                child: pw.Text('Grade Scale (%)', style: pw.TextStyle(font: boldFont, fontSize: 9, color: const PdfColor.fromInt(0xFFFFFFFF))),
                                alignment: pw.Alignment.center,
                              ),
                              pw.Container(
                                padding: const pw.EdgeInsets.all(1),
                                child: pw.Text('Grade', style: pw.TextStyle(font: boldFont, fontSize: 9, color: const PdfColor.fromInt(0xFFFFFFFF))),
                                alignment: pw.Alignment.center,
                              ),
                              pw.Container(
                                padding: const pw.EdgeInsets.all(1),
                                child: pw.Text('Performance Indicator', style: pw.TextStyle(font: boldFont, fontSize: 9, color: const PdfColor.fromInt(0xFFFFFFFF))),
                                alignment: pw.Alignment.center,
                              ),
                              pw.Container(
                                padding: const pw.EdgeInsets.all(1),
                                child: pw.Text('Grade Point', style: pw.TextStyle(font: boldFont, fontSize: 9, color: const PdfColor.fromInt(0xFFFFFFFF))),
                                alignment: pw.Alignment.center,
                              ),
                            ],
                          ),
                          ...gradeTableData.map((row) => pw.TableRow(
                            children: row.asMap().entries.map((entry) {
                              final colIndex = entry.key;
                              final cellText = entry.value;
                              PdfColor bgColor = const PdfColor.fromInt(0xFFFFFFFF);
                              if (colIndex == 1) {
                                final percentage = int.tryParse(row[0].split('-')[0]) ?? 0;
                                bgColor = getGrade(percentage)['color'];
                              }
                              return pw.Container(
                                padding: const pw.EdgeInsets.all(1),
                                decoration: pw.BoxDecoration(color: bgColor),
                                alignment: pw.Alignment.center,
                                child: pw.Text(
                                  cellText,
                                  style: pw.TextStyle(font: font, fontSize: 9, color: const PdfColor.fromInt(0xFF000000)),
                                ),
                              );
                            }).toList(),
                          )),
                        ],
                      ),
                    ],
                  ),
                ),
                pw.SizedBox(height: 5),
                pw.Table.fromTextArray(
                  headers: ['Designations', 'Class Teacher', 'AIC', 'HOD', 'eSeal'],
                  data: [['Authorized by', '', '', '', '']],
                  border: pw.TableBorder.all(color: const PdfColor.fromInt(0xFF444444), width: 0.3),
                  headerStyle: pw.TextStyle(font: boldFont, fontSize: 9, color: const PdfColor.fromInt(0xFFFFFFFF)),
                  headerDecoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFF4CAF50)),
                  cellStyle: pw.TextStyle(font: font, fontSize: 9, color: const PdfColor.fromInt(0xFF000000)),
                  cellPadding: const pw.EdgeInsets.all(2),
                  columnWidths: {
                    0: const pw.FixedColumnWidth(190 / 5),
                    1: const pw.FixedColumnWidth(190 / 5),
                    2: const pw.FixedColumnWidth(190 / 5),
                    3: const pw.FixedColumnWidth(190 / 5),
                    4: const pw.FixedColumnWidth(190 / 5),
                  },
                  cellHeight: 16,
                ),
                pw.SizedBox(height: 5),
                pw.Table.fromTextArray(
                  headers: [['To view results online, use the Student App or visit our official site â€“ www.sspointschool.in']],
                  data: [],
                  border: pw.TableBorder.all(color: const PdfColor.fromInt(0xFF444444), width: 0.3),
                  headerStyle: pw.TextStyle(font: boldFont, fontSize: 10, color: const PdfColor.fromInt(0xFF000000)),
                  headerDecoration: const pw.BoxDecoration(),
                  cellStyle: pw.TextStyle(font: font, fontSize: 10, color: const PdfColor.fromInt(0xFF000000)),
                  cellPadding: const pw.EdgeInsets.all(2),
                  columnWidths: {0: const pw.FixedColumnWidth(190)},
                ),
                pw.Table.fromTextArray(
                  headers: [['N.B: The Academic Excellence Award is granted to Knights students securing an AA grade in the current academic year.']],
                  data: [
                    [
                      'It is recognized under the Knights Career Development Program of Sure Success Point School â€“ an advanced, software-integrated, jointly-oriented, career-centric education system aimed at ensuring holistic development and assured career success. All systems are powered by Knights Groupâ€™s research-driven Strong Education System.',
                    ],
                  ],
                  border: pw.TableBorder.all(color: const PdfColor.fromInt(0xFFFF0000), width: 0.7),
                  headerStyle: pw.TextStyle(font: boldFont, fontSize: 10, color: const PdfColor.fromInt(0xFFFFC107)),
                  headerDecoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFF757575)),
                  cellStyle: pw.TextStyle(font: boldFont, fontSize: 9, color: const PdfColor.fromInt(0xFF000000)),
                  cellPadding: const pw.EdgeInsets.all(2),
                  columnWidths: {0: const pw.FixedColumnWidth(190)},
                ),
              ],
            );
          },
        ),
      );

      final safeFileName = '${_studentData!['firstName']}_${_studentData!['lastName']}'.replaceAll(RegExp(r'[^a-zA-Z0-9-_]'), '_');
      await Printing.sharePdf(
        bytes: await doc.save(),
        filename: 'Result_${safeFileName}_Annual.pdf',
      );
      Fluttertoast.showToast(
        msg: 'Result card generated successfully.',
        backgroundColor: Colors.green,
        textColor: Colors.white,
      );
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Failed to generate result card: $e',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
    } finally {
      setState(() => _pdfLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFFb71c1c),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                'Check Student Results',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 16,
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
            actions: [
              IconButton(
                icon: const Icon(Icons.download, color: Color(0xFF00c757)),
                onPressed: _resultData == null || _resultData!.isEmpty ? null : _handleDownloadPDF,
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                  Image.asset(
                    'assets/images/ssps.png',
                    width: MediaQuery.of(context).size.width < 600 ? 200 : 300,
                    height: MediaQuery.of(context).size.width < 600 ? 200 : 300,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Check Student\'s Result Here',
                    style: GoogleFonts.poppins(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    constraints: const BoxConstraints(maxWidth: 500),
                    child: Column(
                      children: [
                        SchoolSelect(
                          selectedSchool: _selectedSchool,
                          onChanged: (value) => setState(() => _selectedSchool = value),
                        ),
                        const SizedBox(height: 12),
                        SchoolBranchSelect(
                          selectedBranch: _selectedBranch,
                          onChanged: (value) => setState(() => _selectedBranch = value),
                        ),
                        const SizedBox(height: 12),
                        SchoolClassSelect(
                          selectedClass: _selectedClass,
                          onChanged: (value) => setState(() => _selectedClass = value),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          decoration: InputDecoration(
                            labelText: 'Roll Number',
                            labelStyle: GoogleFonts.poppins(color: const Color(0xFFAAAAAA)),
                            enabledBorder: const OutlineInputBorder(
                              borderSide: BorderSide(color: Color(0xFF555555)),
                            ),
                            focusedBorder: const OutlineInputBorder(
                              borderSide: BorderSide(color: Color(0xFF00C853)),
                            ),
                            filled: true,
                            fillColor: const Color(0xFF333333),
                          ),
                          style: GoogleFonts.poppins(color: Colors.white),
                          onChanged: (value) => setState(() => _rollNo = value),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _loading ? null : _handleSearch,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: greenAccent,
                            foregroundColor: Colors.black,
                            minimumSize: const Size(200, 50),
                          ),
                          child: _loading
                              ? const CircularProgressIndicator(color: Colors.black)
                              : Text('Search', style: GoogleFonts.poppins(fontSize: 16)),
                        ),
                        const SizedBox(height: 16),
                        if (_error != null)
                          Text(
                            _error!,
                            style: GoogleFonts.poppins(color: Colors.red, fontSize: 14),
                            textAlign: TextAlign.center,
                          ),
                        if (_loading)
                          const CircularProgressIndicator(color: Color(0xFF00c757))
                        else if (_resultData != null && _resultData!.isNotEmpty) ...[
                          Container(
                            constraints: const BoxConstraints(
                              maxWidth: 1200,
                              minWidth: 800,
                              maxHeight: 400,
                            ),
                            margin: const EdgeInsets.symmetric(horizontal: 8.0),
                            child: Card(
                              color: const Color(0xFF1e1e1e),
                              elevation: 4,
                              child: SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: Container(
                                  padding: const EdgeInsets.all(8.0),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: const Color(0xFF555555)),
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                  child: Column(
                                    children: [
                                      // Header Row
                                      Row(
                                        children: [
                                          Container(
                                            width: 120,
                                            height: 40,
                                            alignment: Alignment.centerLeft,
                                            padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                            color: const Color(0xFF333333),
                                            child: Text(
                                              'Subject',
                                              style: GoogleFonts.poppins(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          ...['Sem 1 SM', 'VM', 'IAM', 'TM', 'Grade'].map((header) => Container(
                                            width: 60,
                                            height: 40,
                                            alignment: Alignment.center,
                                            padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                            color: const Color(0xFF333333),
                                            child: Text(
                                              header,
                                              style: GoogleFonts.poppins(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                              textAlign: TextAlign.center,
                                            ),
                                          )),
                                          ...['Sem 2 SM', 'VM', 'IAM', 'TM', 'Grade'].map((header) => Container(
                                            width: 60,
                                            height: 40,
                                            alignment: Alignment.center,
                                            padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                            color: const Color(0xFF333333),
                                            child: Text(
                                              header,
                                              style: GoogleFonts.poppins(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                              textAlign: TextAlign.center,
                                            ),
                                          )),
                                          ...['Sem 3 SM', 'VM', 'IAM', 'TM', 'Grade'].map((header) => Container(
                                            width: 60,
                                            height: 40,
                                            alignment: Alignment.center,
                                            padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                            color: const Color(0xFF333333),
                                            child: Text(
                                              header,
                                              style: GoogleFonts.poppins(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                              textAlign: TextAlign.center,
                                            ),
                                          )),
                                          Container(
                                            width: 60,
                                            height: 40,
                                            alignment: Alignment.center,
                                            padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                            color: const Color(0xFF333333),
                                            child: Text(
                                              'Annual %',
                                              style: GoogleFonts.poppins(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                              textAlign: TextAlign.center,
                                            ),
                                          ),
                                          Container(
                                            width: 60,
                                            height: 40,
                                            alignment: Alignment.center,
                                            padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                            color: const Color(0xFF333333),
                                            child: Text(
                                              'Grade',
                                              style: GoogleFonts.poppins(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                              textAlign: TextAlign.center,
                                            ),
                                          ),
                                          Container(
                                            width: 120,
                                            height: 40,
                                            alignment: Alignment.centerLeft,
                                            padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                            color: const Color(0xFF333333),
                                            child: Text(
                                              'Remarks',
                                              style: GoogleFonts.poppins(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                      // Divider
                                      Container(
                                        height: 1,
                                        color: const Color(0xFF555555),
                                      ),
                                      // Subject Rows
                                      SingleChildScrollView(
                                        scrollDirection: Axis.vertical,
                                        child: Column(
                                          children: [
                                            ..._classSubjects.asMap().entries.map((entry) {
                                              final index = entry.key;
                                              final cs = entry.value;
                                              final sem1Result = _resultData!.firstWhere(
                                                    (r) => r['semester'] == 'SEMESTER_I',
                                                orElse: () => {'results': []},
                                              )['results'].firstWhere(
                                                    (r) => r['classSubjectId'] == cs['id'],
                                                orElse: () => <String, dynamic>{
                                                  'semesterExamMarks': 0,
                                                  'vivaMarks': 0,
                                                  'internalMarks': 0,
                                                  'totalMarks': 0,
                                                  'remarks': '',
                                                },
                                              );
                                              final sem2Result = _resultData!.firstWhere(
                                                    (r) => r['semester'] == 'SEMESTER_II',
                                                orElse: () => {'results': []},
                                              )['results'].firstWhere(
                                                    (r) => r['classSubjectId'] == cs['id'],
                                                orElse: () => <String, dynamic>{
                                                  'semesterExamMarks': 0,
                                                  'vivaMarks': 0,
                                                  'internalMarks': 0,
                                                  'totalMarks': 0,
                                                  'remarks': '',
                                                },
                                              );
                                              final sem3Result = _resultData!.firstWhere(
                                                    (r) => r['semester'] == 'SEMESTER_III',
                                                orElse: () => {'results': []},
                                              )['results'].firstWhere(
                                                    (r) => r['classSubjectId'] == cs['id'],
                                                orElse: () => <String, dynamic>{
                                                  'semesterExamMarks': 0,
                                                  'vivaMarks': 0,
                                                  'internalMarks': 0,
                                                  'totalMarks': 0,
                                                  'remarks': '',
                                                },
                                              );

                                              final sem1Total = _parseToInt(sem1Result['semesterExamMarks']) +
                                                  _parseToInt(sem1Result['vivaMarks']) +
                                                  _parseToInt(sem1Result['internalMarks']);
                                              final sem2Total = _parseToInt(sem2Result['semesterExamMarks']) +
                                                  _parseToInt(sem2Result['vivaMarks']) +
                                                  _parseToInt(sem2Result['internalMarks']);
                                              final sem3Total = _parseToInt(sem3Result['semesterExamMarks']) +
                                                  _parseToInt(sem3Result['vivaMarks']) +
                                                  _parseToInt(sem3Result['internalMarks']);
                                              final annualTotal = ((sem1Total + sem2Total + sem3Total) / 3).floor();
                                              final annualPercentage = annualTotal;

                                              return Column(
                                                children: [
                                                  Row(
                                                    children: [
                                                      Container(
                                                        width: 120,
                                                        height: 36,
                                                        alignment: Alignment.centerLeft,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          formatSubjectName(cs['name']),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          _parseToInt(sem1Result['semesterExamMarks']).toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          _parseToInt(sem1Result['vivaMarks']).toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          _parseToInt(sem1Result['internalMarks']).toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          sem1Total.toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: getGradeColor(getGrade(sem1Total)['grade']),
                                                        child: Text(
                                                          getGrade(sem1Total)['grade'],
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          _parseToInt(sem2Result['semesterExamMarks']).toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          _parseToInt(sem2Result['vivaMarks']).toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          _parseToInt(sem2Result['internalMarks']).toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          sem2Total.toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: getGradeColor(getGrade(sem2Total)['grade']),
                                                        child: Text(
                                                          getGrade(sem2Total)['grade'],
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          _parseToInt(sem3Result['semesterExamMarks']).toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          _parseToInt(sem3Result['vivaMarks']).toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          _parseToInt(sem3Result['internalMarks']).toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          sem3Total.toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: getGradeColor(getGrade(sem3Total)['grade']),
                                                        child: Text(
                                                          getGrade(sem3Total)['grade'],
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          annualPercentage.toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: getGradeColor(getGrade(annualPercentage)['grade']),
                                                        child: Text(
                                                          getGrade(annualPercentage)['grade'],
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 120,
                                                        height: 36,
                                                        alignment: Alignment.centerLeft,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: index % 2 == 0 ? const Color(0xFF2A2A2A) : const Color(0xFF1e1e1e),
                                                        child: Text(
                                                          sem1Result['remarks'] ?? sem2Result['remarks'] ?? sem3Result['remarks'] ?? '',
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  Container(
                                                    height: 1,
                                                    color: const Color(0xFF555555),
                                                  ),
                                                ],
                                              );
                                            }).toList(),
                                            // Total Row
                                            if (_sem1Totals != null &&
                                                _sem2Totals != null &&
                                                _sem3Totals != null &&
                                                _totalFullMarks != null &&
                                                _annualPercentage != null) ...[
                                              Column(
                                                children: [
                                                  Row(
                                                    children: [
                                                      Container(
                                                        width: 120,
                                                        height: 36,
                                                        alignment: Alignment.centerLeft,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          'Total',
                                                          style: GoogleFonts.poppins(
                                                            color: Colors.white,
                                                            fontWeight: FontWeight.bold,
                                                            fontSize: 12,
                                                          ),
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem1Totals!['semesterExamMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem1Totals!['vivaMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem1Totals!['internalMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem1Totals!['totalMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: getGradeColor(getGrade((_sem1Totals!['totalMarks']! / _totalFullMarks! * 100).floor())['grade']),
                                                        child: Text(
                                                          getGrade((_sem1Totals!['totalMarks']! / _totalFullMarks! * 100).floor())['grade'],
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem2Totals!['semesterExamMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem2Totals!['vivaMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem2Totals!['internalMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem2Totals!['totalMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: (_sem2Totals?['totalMarks'] != null && _totalFullMarks != null)
                                                            ? getGradeColor(
                                                          getGrade(
                                                            ((_sem2Totals!['totalMarks']! / _totalFullMarks!) * 100).floor(),
                                                          )['grade'],
                                                        )
                                                            : Colors.grey, // or any fallback color
                                                        child: Text(
                                                          getGrade((_sem2Totals!['totalMarks']! / _totalFullMarks! * 100).floor())['grade'],
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem3Totals!['semesterExamMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem3Totals!['vivaMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem3Totals!['internalMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _sem3Totals!['totalMarks'].toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: (_sem3Totals?['totalMarks'] != null && _totalFullMarks != null)
                                                            ? getGradeColor(
                                                          getGrade(
                                                            ((_sem3Totals!['totalMarks']! / _totalFullMarks!) * 100).floor(),
                                                          )['grade'],
                                                        )
                                                            : Colors.grey, // or any fallback color
                                                        child: Text(
                                                          getGrade((_sem3Totals!['totalMarks']! / _totalFullMarks! * 100).floor())['grade'],
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          _annualPercentage.toString(),
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 60,
                                                        height: 36,
                                                        alignment: Alignment.center,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: getGradeColor(getGrade(_annualPercentage!)['grade']),
                                                        child: Text(
                                                          getGrade(_annualPercentage!)['grade'],
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ),
                                                      Container(
                                                        width: 120,
                                                        height: 36,
                                                        alignment: Alignment.centerLeft,
                                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                        color: const Color(0xFF2A2A2A),
                                                        child: Text(
                                                          '',
                                                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  Container(
                                                    height: 1,
                                                    color: const Color(0xFF555555),
                                                  ),
                                                ],
                                              ),
                                            ],
                                            // CGPA Row
                                            Column(
                                              children: [
                                                Row(
                                                  children: [
                                                    Container(
                                                      width: 120,
                                                      height: 36,
                                                      alignment: Alignment.centerLeft,
                                                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                      color: const Color(0xFF2A2A2A),
                                                      child: Text(
                                                        'CGPA',
                                                        style: GoogleFonts.poppins(
                                                          color: Colors.white,
                                                          fontWeight: FontWeight.bold,
                                                          fontSize: 12,
                                                        ),
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                    ),
                                                    Container(
                                                      width: 300,
                                                      height: 36,
                                                      alignment: Alignment.center,
                                                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                      color: const Color(0xFF2A2A2A),
                                                      child: Text(
                                                        calculateCGPA(_resultData!, _classSubjects)['sem1CGPA']!,
                                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                        textAlign: TextAlign.center,
                                                      ),
                                                    ),
                                                    Container(
                                                      width: 300,
                                                      height: 36,
                                                      alignment: Alignment.center,
                                                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                      color: const Color(0xFF2A2A2A),
                                                      child: Text(
                                                        calculateCGPA(_resultData!, _classSubjects)['sem2CGPA']!,
                                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                        textAlign: TextAlign.center,
                                                      ),
                                                    ),
                                                    Container(
                                                      width: 300,
                                                      height: 36,
                                                      alignment: Alignment.center,
                                                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                      color: const Color(0xFF2A2A2A),
                                                      child: Text(
                                                        calculateCGPA(_resultData!, _classSubjects)['sem3CGPA']!,
                                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                        textAlign: TextAlign.center,
                                                      ),
                                                    ),
                                                    Container(
                                                      width: 60,
                                                      height: 36,
                                                      alignment: Alignment.center,
                                                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                      color: const Color(0xFF2A2A2A),
                                                      child: Text(
                                                        calculateCGPA(_resultData!, _classSubjects)['overallCGPA']!,
                                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                        textAlign: TextAlign.center,
                                                      ),
                                                    ),
                                                    Container(
                                                      width: 60,
                                                      height: 36,
                                                      alignment: Alignment.center,
                                                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                      color: const Color(0xFF2A2A2A),
                                                      child: Text(
                                                        '',
                                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                        textAlign: TextAlign.center,
                                                      ),
                                                    ),
                                                    Container(
                                                      width: 120,
                                                      height: 36,
                                                      alignment: Alignment.centerLeft,
                                                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                                      color: const Color(0xFF2A2A2A),
                                                      child: Text(
                                                        '',
                                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                Container(
                                                  height: 1,
                                                  color: const Color(0xFF555555),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          _pdfLoading
                              ? const CircularProgressIndicator(color: Color(0xFF00c757))
                              : ElevatedButton(
                            onPressed: _handleDownloadPDF,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: greenAccent,
                              foregroundColor: Colors.black,
                              minimumSize: const Size(200, 50),
                            ),
                            child: Text(
                              'Download Result',
                              style: GoogleFonts.poppins(fontSize: 16),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
