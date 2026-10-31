import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';

class DailyHomeworkReportDialog extends StatefulWidget {
  final bool open;
  final VoidCallback onClose;
  final int? classSubjectId;
  final String? className;
  final String? subjectName;
  final int? studentId;
  final String? studentName;

  const DailyHomeworkReportDialog({
    super.key,
    required this.open,
    required this.onClose,
    required this.classSubjectId,
    required this.className,
    required this.subjectName,
    required this.studentId,
    required this.studentName,
  });

  @override
  _DailyHomeworkReportDialogState createState() => _DailyHomeworkReportDialogState();
}

class _DailyHomeworkReportDialogState extends State<DailyHomeworkReportDialog> {
  final ApiService _apiService = ApiService();
  String month = DateTime.now().toIso8601String().substring(0, 7);
  List<dynamic> homeworkRecords = [];
  List<int> daysInMonth = [];
  bool loading = false;

  @override
  void initState() {
    super.initState();
    if (widget.open && widget.classSubjectId != null && widget.studentId != null) {
      _fetchHomeworkReport();
    }
  }

  Future<void> _fetchHomeworkReport() async {
    setState(() {
      loading = true;
    });
    try {
      final records = await _apiService.fetchHomeworkReport(widget.classSubjectId!, month, widget.studentId!);
      final date = DateTime.parse('$month-01');
      final days = DateTime(date.year, date.month + 1, 0).day;
      setState(() {
        homeworkRecords = records ?? [];
        daysInMonth = List.generate(days, (i) => i + 1);
        loading = false;
      });
    } catch (e) {
      setState(() {
        homeworkRecords = [];
        loading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to fetch homework report: $e')));
    }
  }

  void _handleMonthChange(String? newMonth) {
    if (newMonth != null) {
      setState(() {
        month = newMonth;
      });
      _fetchHomeworkReport();
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusStyles = {
      'PENDING': {'variant': 'outlined', 'color': Colors.yellow},
      'SUBMITTED': {'variant': 'contained', 'color': Colors.green},
      'LATE': {'variant': 'contained', 'color': Colors.red},
      'NEEDS_IMPROVEMENT': {'variant': 'contained', 'color': Colors.yellow},
      'EXCELLENT': {'variant': 'contained', 'color': Colors.green},
    };

    return Dialog(
      insetPadding: const EdgeInsets.only(top: 64, left: 280),
      backgroundColor: const Color(0xFF181818),
      child: Column(
        children: [
          Container(
            color: const Color(0xFF212121),
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                const Icon(Icons.assessment, color: Colors.white),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Homework Report for ${widget.studentName} - ${widget.className} - ${widget.subjectName}',
                    style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                DropdownButton<String>(
                  value: month,
                  onChanged: _handleMonthChange,
                  items: List.generate(12, (index) {
                    final date = DateTime.now().subtract(Duration(days: index * 30));
                    final monthStr = date.toIso8601String().substring(0, 7);
                    return DropdownMenuItem(
                      value: monthStr,
                      child: Text(
                        date.toString(),
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                    );
                  }),
                  dropdownColor: const Color(0xFF181818),
                  style: GoogleFonts.poppins(color: Colors.white),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: widget.onClose,
                  icon: const Icon(Icons.close, color: Colors.red),
                ),
              ],
            ),
          ),
          Expanded(
            child: loading
                ? const Center(child: SpinKitCircle(color: Colors.green))
                : Column(
              children: [
                Container(
                  color: const Color(0xFF333333),
                  padding: const EdgeInsets.all(8),
                  child: Row(
                    children: [
                      Expanded(flex: 2, child: Text('Date', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                      Expanded(flex: 1, child: Text('Status', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold), textAlign: TextAlign.center)),
                    ],
                  ),
                ),
                Expanded(
                  child: homeworkRecords.isEmpty
                      ? Center(child: Text('No homework records found for this month.', style: GoogleFonts.poppins(color: Colors.white)))
                      : ListView.builder(
                    itemCount: homeworkRecords.length,
                    itemBuilder: (context, index) {
                      final record = homeworkRecords[index];
                      return Container(
                        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                        decoration: BoxDecoration(color: const Color(0xFF181818), borderRadius: BorderRadius.circular(4)),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 2,
                              child: Padding(
                                padding: const EdgeInsets.all(8),
                                child: Text(
                                  record['date'] != null ? DateTime.parse(record['date']).toLocal().toString().substring(0, 10) : 'Invalid Date',
                                  style: GoogleFonts.poppins(color: Colors.white),
                                ),
                              ),
                            ),
                            Expanded(
                              flex: 1,
                              child: Center(
                                child: ElevatedButton(
                                  onPressed: null,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: statusStyles[record['status']]!['color'] as Color,
                                    side: BorderSide(
                                      color: statusStyles[record['status']]!['color'] as Color,
                                    ),
                                    minimumSize: const Size(80, 36),
                                  ),
                                  child: Text(record['status']?.replaceAll('_', ' ') ?? 'N/A', style: GoogleFonts.poppins()),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: ElevatedButton(
                    onPressed: widget.onClose,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    child: Text('Close', style: GoogleFonts.poppins()),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}