import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:table_calendar/table_calendar.dart';
import '../constants.dart';

class MyAttendancePage extends StatefulWidget {
  const MyAttendancePage({super.key});

  @override
  _MyAttendancePageState createState() => _MyAttendancePageState();
}

class _MyAttendancePageState extends State<MyAttendancePage> {
  final _storage = const FlutterSecureStorage();
  DateTime _focusedDay = DateTime.now();
  String _selectedMonth = DateTime.now().toIso8601String().substring(0, 7);
  List<dynamic> _attendanceRecords = [];
  List<dynamic> _holidayRecords = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchAttendance();
  }

  Future<void> _fetchAttendance() async {
    final token = await _storage.read(key: 'student_token');
    if (token == null) {
      Fluttertoast.showToast(msg: 'User not authenticated. Please log in.');
      setState(() => _isLoading = false);
      return;
    }

    setState(() => _isLoading = true);
    try {
      print('Fetching attendance for month: $_selectedMonth');
      print('Attendance URL: $BASE_URL/api/a1-knights-students-panel/students/myattendance?month=$_selectedMonth');
      final attendanceResponse = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/students/myattendance?month=$_selectedMonth'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Attendance response status: ${attendanceResponse.statusCode}');

      print('Fetching holidays for month: $_selectedMonth');
      print('Holiday URL: $BASE_URL/api/holidays?month=$_selectedMonth');
      final holidayResponse = await http.get(
        Uri.parse('$BASE_URL/api/holidays?month=$_selectedMonth'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Holiday response status: ${holidayResponse.statusCode}');

      if (attendanceResponse.statusCode == 200) {
        final attendanceData = jsonDecode(attendanceResponse.body)['attendanceRecords'] ?? [];
        final holidayData = holidayResponse.statusCode == 200
            ? jsonDecode(holidayResponse.body)['holidays'] ?? []
            : [];
        setState(() {
          _attendanceRecords = attendanceData;
          _holidayRecords = holidayData;
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch attendance records: ${attendanceResponse.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching data: $e');
      print(stackTrace);
      setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    }
  }

  void _onMonthChanged(DateTime newMonth) {
    setState(() {
      _selectedMonth = newMonth.toIso8601String().substring(0, 7);
      _focusedDay = newMonth;
    });
    _fetchAttendance();
  }

  Widget _statusCircle(String letter, Color bg, Color fg) {
    return Container(
      decoration: BoxDecoration(
        color: bg,
        shape: BoxShape.circle,
      ),
      width: 20,
      height: 20,
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
    final attendanceRecord = _attendanceRecords.firstWhere(
          (r) => r['date'].substring(0, 10) == dateStr,
      orElse: () => null,
    );
    final holidayRecord = _holidayRecords.firstWhere(
          (r) => r['date'].substring(0, 10) == dateStr,
      orElse: () => null,
    );
    final isSunday = date.weekday == DateTime.sunday;

    Widget statusWidget = const SizedBox.shrink();
    if (holidayRecord != null) {
      statusWidget = _statusCircle('H', const Color(0xFF9c27b0), Colors.white);
    } else if (attendanceRecord == null && isSunday) {
      statusWidget = _statusCircle('W', const Color(0xFFffeb3b), Colors.black);
    } else if (attendanceRecord != null) {
      final status = attendanceRecord['status'] as String;
      final statusColors = {
        'PRESENT': const Color(0xFF00c853),
        'ABSENT': const Color(0xFFf44336),
        'HOLIDAY': const Color(0xFF9c27b0),
        'WEEKLY_HOLIDAY': const Color(0xFFffeb3b),
      };
      final bg = statusColors[status] ?? const Color(0xFF888888);
      final textColor = status == 'WEEKLY_HOLIDAY' ? Colors.black : Colors.white;
      statusWidget = _statusCircle(status[0], bg, textColor);
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
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: CustomScrollView(
        slivers: [
          // Sticky Header
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFFb71c1c),
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                'My Attendance',
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
          ),
          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(2.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    color: const Color(0xFF222222),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          // Month Selector
                          Container(
                            width: MediaQuery.of(context).size.width * 0.5,
                            padding: const EdgeInsets.symmetric(horizontal: 8.0),
                            child: DropdownButton<String>(
                              value: _selectedMonth,
                              isExpanded: true,
                              items: List.generate(24, (index) {
                                final date = DateTime(
                                  DateTime.now().year,
                                  DateTime.now().month - 12 + index,
                                );
                                final monthStr = date.toIso8601String().substring(0, 7);
                                return DropdownMenuItem(
                                  value: monthStr,
                                  child: Text(
                                    '${date.month}/${date.year}',
                                    style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                                  ),
                                );
                              }).toSet().toList(),
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
                          // Calendar
                          _isLoading
                              ? const Center(child: CircularProgressIndicator(color: Color(0xFF00c853)))
                              : TableCalendar(
                            firstDay: DateTime.utc(2000, 1, 1),
                            lastDay: DateTime.utc(2100, 12, 31),
                            focusedDay: _focusedDay,
                            calendarFormat: CalendarFormat.month,
                            onPageChanged: (focusedDay) => _onMonthChanged(focusedDay),
                            calendarStyle: CalendarStyle(
                              defaultTextStyle:
                              GoogleFonts.poppins(color: Colors.white, fontSize: 20),
                              weekendTextStyle:
                              GoogleFonts.poppins(color: const Color(0xFFf44336), fontSize: 20),
                              outsideTextStyle:
                              GoogleFonts.poppins(color: Colors.white70, fontSize: 16),
                              todayDecoration: const BoxDecoration(
                                color: Color(0xFF00c853),
                                shape: BoxShape.circle,
                              ),
                              todayTextStyle:
                              GoogleFonts.poppins(color: Colors.cyanAccent, fontSize: 16),
                              cellMargin: const EdgeInsets.all(2.0),
                              cellPadding: const EdgeInsets.all(4.0),
                            ),
                            headerStyle: HeaderStyle(
                              titleTextStyle:
                              GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                              formatButtonVisible: false,
                              leftChevronIcon:
                              const Icon(Icons.chevron_left, color: Colors.white),
                              rightChevronIcon:
                              const Icon(Icons.chevron_right, color: Colors.white),
                            ),
                            daysOfWeekStyle: DaysOfWeekStyle(
                              weekdayStyle:
                              GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                              weekendStyle: GoogleFonts.poppins(
                                  color: const Color(0xFFf44336), fontSize: 14),
                            ),
                            calendarBuilders: CalendarBuilders(
                              defaultBuilder: (context, date, focusedDay) =>
                                  _buildDayCell(date),
                              todayBuilder: (context, date, focusedDay) =>
                                  _buildDayCell(date, isToday: true),
                            ),
                          ),
                          const SizedBox(height: 64),
                          // Legend
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              _buildLegendBox(const Color(0xFF00c853), 'Present'),
                              _buildLegendBox(const Color(0xFFf44336), 'Absent'),
                              _buildLegendBox(const Color(0xFF9c27b0), 'Holiday'),
                              _buildLegendBox(const Color(0xFFffeb3b), 'Weekly Holiday'),
                            ],
                          ),
                        ],
                      ),
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
