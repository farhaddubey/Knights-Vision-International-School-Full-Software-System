import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:table_calendar/table_calendar.dart';
import '../constants.dart';

class AttendanceHistoryDialog extends StatefulWidget {
  final int studentId;
  final String studentName;
  final String className;

  const AttendanceHistoryDialog({
    super.key,
    required this.studentId,
    required this.studentName,
    required this.className,
  });

  @override
  _AttendanceHistoryDialogState createState() => _AttendanceHistoryDialogState();
}

class _AttendanceHistoryDialogState extends State<AttendanceHistoryDialog> {
  final _storage = const FlutterSecureStorage();
  String _selectedMonth = DateTime.now().toIso8601String().substring(0, 7);
  List<dynamic> _attendanceRecords = [];
  bool _isLoading = false;
  DateTime _focusedDay = DateTime.now();

  @override
  void initState() {
    super.initState();
    if (widget.studentId != 0) {
      _fetchAttendanceHistory();
    }
  }

  Future<void> _fetchAttendanceHistory() async {
    setState(() => _isLoading = true);
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/attendance/${widget.className.toLowerCase()}/history/${widget.studentId}?month=$_selectedMonth'),
        headers: {'Authorization': 'Bearer $token'},
      );

      print('Fetching attendance history');
      print('Fetch URL: $BASE_URL/api-schools-panel/class_teachers_panel/attendance/${widget.className.toLowerCase()}/history/${widget.studentId}?month=$_selectedMonth');
      print('Fetch response status: ${response.statusCode}');
      print('Fetch response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _attendanceRecords = data['attendanceRecords'] ?? [];
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch attendance history: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching attendance history: $e');
      print(stackTrace);
      setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: 'Failed to fetch attendance history',
        backgroundColor: Colors.red,
      );
    }
  }

  void _onMonthChanged(DateTime newMonth) {
    setState(() {
      _selectedMonth = newMonth.toIso8601String().substring(0, 7);
      _focusedDay = newMonth;
    });
    _fetchAttendanceHistory();
  }

  Widget _statusCircle(String letter, Color bg, Color fg) {
    return Container(
      decoration: BoxDecoration(
        color: bg,
        shape: BoxShape.circle,
      ),
      width: 24,
      height: 24,
      child: Center(
        child: Text(
          letter,
          style: GoogleFonts.poppins(color: fg, fontSize: 12, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }

  Widget _buildDayCell(DateTime date, {bool isToday = false}) {
    final dateStr = date.toIso8601String().substring(0, 10);
    final isSunday = date.weekday == DateTime.sunday;
    final record = _attendanceRecords.firstWhere(
          (r) => r['date'].substring(0, 10) == dateStr,
      orElse: () => null,
    );

    Widget statusWidget = const SizedBox.shrink();
    if (isSunday && record == null) {
      // Default to WEEKLY_HOLIDAY for Sundays with no record
      statusWidget = Tooltip(
        message: 'Weekly Holiday',
        child: _statusCircle('S', const Color(0xFFffeb3b), Colors.black),
      );
    } else if (record != null) {
      final status = record['status'] as String;
      final statusColors = {
        'PRESENT': const Color(0xFF00c853),
        'ABSENT': const Color(0xFFf44336),
        'HOLIDAY': const Color(0xFF9c27b0),
        'WEEKLY_HOLIDAY': const Color(0xFFffeb3b),
      };
      final bg = statusColors[status] ?? const Color(0xFF888888);
      final textColor = status == 'WEEKLY_HOLIDAY' ? Colors.black : Colors.white;
      statusWidget = Tooltip(
        message: '${record['status']}${record['remarks'] != null ? ': ${record['remarks']}' : ''}',
        child: _statusCircle(status[0], bg, textColor),
      );
    }

    final dayTextStyle = isToday
        ? GoogleFonts.poppins(color: Colors.amber, fontSize: 16, fontWeight: FontWeight.bold)
        : GoogleFonts.poppins(color: Colors.white, fontSize: 14);

    return Container(
      constraints: const BoxConstraints(minHeight: 60),
      padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('${date.day}', style: dayTextStyle),
          const SizedBox(height: 4),
          statusWidget,
        ],
      ),
    );
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
                    const Icon(Icons.calendar_today, color: Colors.white),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Attendance History for ${widget.studentName}',
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
                  children: [
                    Container(
                      width: 200,
                      padding: const EdgeInsets.symmetric(horizontal: 8.0),
                      child: DropdownButton<String>(
                        value: _selectedMonth,
                        isExpanded: true,
                        items: List.generate(12, (index) {
                          final date = DateTime(
                            DateTime.now().year,
                            DateTime.now().month - index,
                          );
                          final monthStr = date.toIso8601String().substring(0, 7);
                          return DropdownMenuItem(
                            value: monthStr,
                            child: Text(
                              date.toString().substring(0, 7).replaceAll('-', '/'),
                              style: GoogleFonts.poppins(color: Colors.white),
                            ),
                          );
                        }),
                        onChanged: (value) {
                          if (value != null) {
                            _onMonthChanged(DateTime.parse('$value-01'));
                          }
                        },
                        dropdownColor: const Color(0xFF333333),
                        style: GoogleFonts.poppins(color: Colors.white),
                        underline: Container(
                          height: 1,
                          color: const Color(0xFF555555),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    _isLoading
                        ? const Center(child: CircularProgressIndicator(color: Color(0xFF00c757)))
                        : TableCalendar(
                      firstDay: DateTime.utc(2000, 1, 1),
                      lastDay: DateTime.utc(2100, 12, 31),
                      focusedDay: _focusedDay,
                      calendarFormat: CalendarFormat.month,
                      onPageChanged: _onMonthChanged,
                      calendarStyle: CalendarStyle(
                        defaultTextStyle: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                        weekendTextStyle: GoogleFonts.poppins(color: const Color(0xFFf44336), fontSize: 14),
                        outsideTextStyle: GoogleFonts.poppins(color: Colors.white70, fontSize: 14),
                        todayDecoration: const BoxDecoration(
                          color: Color(0xFF00c853),
                          shape: BoxShape.circle,
                        ),
                        todayTextStyle: GoogleFonts.poppins(color: Colors.cyanAccent, fontSize: 16),
                        cellMargin: const EdgeInsets.all(2.0),
                        cellPadding: const EdgeInsets.all(4.0),
                      ),
                      headerStyle: HeaderStyle(
                        titleTextStyle: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        formatButtonVisible: false,
                        leftChevronIcon: const Icon(Icons.chevron_left, color: Colors.white),
                        rightChevronIcon: const Icon(Icons.chevron_right, color: Colors.white),
                      ),
                      daysOfWeekStyle: DaysOfWeekStyle(
                        weekdayStyle: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                        weekendStyle: GoogleFonts.poppins(color: const Color(0xFFf44336), fontSize: 14),
                      ),
                      calendarBuilders: CalendarBuilders(
                        defaultBuilder: (context, date, focusedDay) => _buildDayCell(date),
                        todayBuilder: (context, date, focusedDay) => _buildDayCell(date, isToday: true),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildLegendBox(const Color(0xFF00c853), 'Present'),
                        _buildLegendBox(const Color(0xFFf44336), 'Absent'),
                        _buildLegendBox(const Color(0xFF9c27b0), 'Holiday'),
                        _buildLegendBox(const Color(0xFFffeb3b), 'Weekly Holiday'),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // ElevatedButton(
                    //   onPressed: () => Navigator.pop(context),
                    //   style: ElevatedButton.styleFrom(
                    //     backgroundColor: Colors.red,
                    //   ),
                    //   child: Text('Close', style: GoogleFonts.poppins()),
                    // ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendBox(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
        ),
      ],
    );
  }
}