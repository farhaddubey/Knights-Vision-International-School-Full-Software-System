import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:fluttertoast/fluttertoast.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../constants.dart';

class HolidayCalendarPage extends StatefulWidget {
  const HolidayCalendarPage({super.key});

  @override
  _HolidayCalendarPageState createState() => _HolidayCalendarPageState();
}

class _HolidayCalendarPageState extends State<HolidayCalendarPage> {
  final _storage = const FlutterSecureStorage();
  DateTime _selectedMonth = DateTime(DateTime.now().year, DateTime.now().month, 1);
  List<dynamic> _holidays = [];
  bool _loading = false;
  bool _dialogOpen = false;
  static const greenAccent = Color(0xFF00c757);

  @override
  void initState() {
    super.initState();
    _fetchHolidays();
  }

  Future<void> _fetchHolidays() async {
    final token = await _storage.read(key: 'student_token');
    if (token == null) {
      Fluttertoast.showToast(
        msg: 'User not authenticated. Please log in.',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
      setState(() => _loading = false);
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    setState(() => _loading = true);
    try {
      print('Fetching holidays for month: ${_selectedMonth.toIso8601String().substring(0, 7)}');
      print('Fetch URL: $BASE_URL/api/holidays?month=${_selectedMonth.toIso8601String().substring(0, 7)}');
      final response = await http.get(
        Uri.parse('$BASE_URL/api/holidays?month=${_selectedMonth.toIso8601String().substring(0, 7)}'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Fetch response status: ${response.statusCode}');

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        setState(() {
          _holidays = (data['holidays'] ?? []).map((h) => {
            'id': h['id']?.toString().split('\n').join(' ') ?? 'N/A',
            'date': h['date']?.toString().split('\n').join(' ') ?? 'N/A',
            'title': h['title']?.toString().split('\n').join(' ') ?? 'N/A',
          }).toList();
          _loading = false;
        });
      } else {
        throw Exception('Invalid response format: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching holidays: $e');
      print(stackTrace);
      Fluttertoast.showToast(
        msg: 'Failed to fetch holidays: ${e.toString().replaceFirst('Exception: ', '')}',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
      setState(() => _loading = false);
    }
  }

  void _handleMonthChange(DateTime date) {
    setState(() {
      _selectedMonth = DateTime(date.year, date.month, 1);
    });
    _fetchHolidays();
  }

  Widget _getTileContent(DateTime date, {required CalendarFormat view}) {
    if (view != CalendarFormat.month) return const SizedBox.shrink();
    final dateStr = date.toIso8601String().substring(0, 10);
    final holiday = _holidays.firstWhere(
          (h) => h['date'].substring(0, 10) == dateStr,
      orElse: () => null,
    );
    final isSunday = date.weekday == DateTime.sunday;

    return Container(
      height: 40,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (isSunday) ...[
            Container(
              width: 20,
              height: 20,
              decoration: const BoxDecoration(
                color: Color(0xFFffeb3b),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text('W', style: GoogleFonts.poppins(color: Colors.black, fontSize: 12)),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Sunday',
              style: GoogleFonts.poppins(color: Colors.white, fontSize: 10),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ] else if (holiday != null) ...[
            Container(
              width: 20,
              height: 20,
              decoration: const BoxDecoration(
                color: Color(0xFF9c27b0),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text('H', style: GoogleFonts.poppins(color: Colors.white, fontSize: 12)),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              holiday['title'],
              style: GoogleFonts.poppins(color: Colors.white, fontSize: 10),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ] else
            const SizedBox.shrink(),
        ],
      ),
    );
  }

  Future<void> _handleDownloadPDF() async {
    try {
      final pdf = pw.Document();
      final font = await PdfGoogleFonts.poppinsRegular();
      final boldFont = await PdfGoogleFonts.poppinsBold();

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          build: (pw.Context context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.center,
              children: [
                pw.Text(
                  'Sure Success Point School',
                  style: pw.TextStyle(
                    font: boldFont,
                    fontSize: 40,
                    color: const PdfColor.fromInt(0xFF003087),
                  ),
                ),
                pw.Text(
                  'Institution of Humanism, Hardwork, Discipline, Technology & Excellence',
                  style: pw.TextStyle(font: boldFont, fontSize: 12, color: const PdfColor.fromInt(0xFF333333)),
                ),
                pw.Text(
                  'www.sspointschool.in | Powered by Knights (KiREAD) Group',
                  style: pw.TextStyle(font: font, fontSize: 12, color: const PdfColor.fromInt(0xFF333333)),
                ),
                pw.SizedBox(height: 16),
                pw.Text(
                  'Holiday Calendar',
                  style: pw.TextStyle(font: boldFont, fontSize: 14, color: const PdfColor.fromInt(0xFF000000)),
                ),
                pw.Text(
                  'Month: ${_selectedMonth.toString().substring(0, 7).replaceAll('-', '/')}',
                  style: pw.TextStyle(font: font, fontSize: 12, color: const PdfColor.fromInt(0xFF000000)),
                ),
                pw.SizedBox(height: 16),
                pw.Table.fromTextArray(
                  headers: ['ID', 'Date', 'Title'],
                  data: _holidays.map((holiday) => [
                    holiday['id'],
                    DateTime.parse(holiday['date']).toString().substring(0, 10),
                    holiday['title'],
                  ]).toList(),
                  border: pw.TableBorder.all(color: const PdfColor.fromInt(0xFF333333), width: 0.5),
                  headerStyle: pw.TextStyle(
                    font: boldFont,
                    fontSize: 10,
                    color: const PdfColor.fromInt(0xFFFFFFFF),
                    background: const pw.BoxDecoration(color: PdfColor.fromInt(0xFF00c757)),
                  ),
                  cellStyle: pw.TextStyle(font: font, fontSize: 10, color: const PdfColor.fromInt(0xFF000000)),
                  cellAlignments: {
                    0: pw.Alignment.centerLeft,
                    1: pw.Alignment.centerLeft,
                    2: pw.Alignment.centerLeft,
                  },
                  cellPadding: const pw.EdgeInsets.all(4),
                  columnWidths: {
                    0: const pw.FlexColumnWidth(1),
                    1: const pw.FlexColumnWidth(2),
                    2: const pw.FlexColumnWidth(3),
                  },
                ),
              ],
            );
          },
        ),
      );

      await Printing.sharePdf(
        bytes: await pdf.save(),
        filename: 'Holiday_Calendar_${_selectedMonth.toString().substring(0, 7).replaceAll('-', '_')}.pdf',
      );
      Fluttertoast.showToast(
        msg: 'PDF generated successfully!',
        backgroundColor: Colors.green,
        textColor: Colors.white,
      );
    } catch (e, stackTrace) {
      print('Error generating PDF: $e');
      print(stackTrace);
      Fluttertoast.showToast(
        msg: 'Failed to generate PDF: ${e.toString().replaceFirst('Exception: ', '')}',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // Sticky Header
              SliverAppBar(
                pinned: true,
                backgroundColor: const Color(0xFFb71c1c),
                flexibleSpace: FlexibleSpaceBar(
                  centerTitle: true,
                  title: Text(
                    'Student Holiday Calendar',
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
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Month Selector
                              Container(
                                width: MediaQuery.of(context).size.width * 0.5,
                                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                                child: DropdownButton<DateTime>(
                                  value: _selectedMonth,
                                  isExpanded: true,
                                  items: List.generate(24, (index) {
                                    final date = DateTime(
                                      DateTime.now().year,
                                      DateTime.now().month - 12 + index,
                                      1,
                                    );
                                    return DropdownMenuItem(
                                      value: date,
                                      child: Text(
                                        '${date.month.toString().padLeft(2, '0')}/${date.year}',
                                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                                      ),
                                    );
                                  }),
                                  onChanged: (value) => _handleMonthChange(value!),
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
                              _loading
                                  ? const Center(child: CircularProgressIndicator(color: greenAccent))
                                  : TableCalendar(
                                firstDay: DateTime.utc(2000, 1, 1),
                                lastDay: DateTime.utc(2100, 12, 31),
                                focusedDay: _selectedMonth,
                                calendarFormat: CalendarFormat.month,
                                onPageChanged: _handleMonthChange,
                                calendarStyle: CalendarStyle(
                                  defaultTextStyle: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
                                  weekendTextStyle: GoogleFonts.poppins(color: const Color(0xFFf44336), fontSize: 14),
                                  outsideTextStyle: GoogleFonts.poppins(color: Colors.white70, fontSize: 14),
                                  todayDecoration: const BoxDecoration(
                                    color: greenAccent,
                                    shape: BoxShape.circle,
                                  ),
                                  todayTextStyle: GoogleFonts.poppins(color: Colors.cyanAccent, fontSize: 14),
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
                                  markerBuilder: (context, date, _) => _getTileContent(date, view: CalendarFormat.month),
                                ),
                              ),
                              const SizedBox(height: 16),
                              // Legend
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 16,
                                        height: 16,
                                        decoration: const BoxDecoration(
                                          color: Color(0xFF9c27b0),
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      Text('Holiday', style: GoogleFonts.poppins(color: Colors.white, fontSize: 12)),
                                    ],
                                  ),
                                  Row(
                                    children: [
                                      Container(
                                        width: 16,
                                        height: 16,
                                        decoration: const BoxDecoration(
                                          color: Color(0xFFffeb3b),
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      Text('Weekly Holiday', style: GoogleFonts.poppins(color: Colors.white, fontSize: 12)),
                                    ],
                                  ),
                                  OutlinedButton(
                                    onPressed: () => setState(() => _dialogOpen = true),
                                    style: OutlinedButton.styleFrom(
                                      side: BorderSide(color: greenAccent),
                                      foregroundColor: greenAccent,
                                    ),
                                    child: Text('View Holidays List', style: GoogleFonts.poppins()),
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
              ),
            ],
          ),
          // Holiday List Dialog
          if (_dialogOpen)
            Material(
              color: const Color(0xFF181818),
              child: CustomScrollView(
                slivers: [
                  SliverAppBar(
                    pinned: true,
                    backgroundColor: const Color(0xFFb71c1c),
                    flexibleSpace: FlexibleSpaceBar(
                      centerTitle: true,
                      title: Text(
                        'Holiday List - ${_selectedMonth.toString().substring(0, 7).replaceAll('-', '/')}',
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
                    leading: IconButton(
                      icon: const Icon(Icons.close, color: greenAccent),
                      onPressed: () => setState(() => _dialogOpen = false),
                      tooltip: 'Close',
                    ),
                    actions: [
                      IconButton(
                        icon: const Icon(Icons.download, color: greenAccent),
                        onPressed: _handleDownloadPDF,
                        tooltip: 'Download PDF',
                      ),
                    ],
                  ),
                  SliverToBoxAdapter(
                    child: Container(
                      width: MediaQuery.of(context).size.width * 0.9,
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          Container(
                            color: const Color(0xFF333333),
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                              children: [
                                Expanded(flex: 1, child: Text('ID', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                                Expanded(flex: 2, child: Text('Date', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                                Expanded(flex: 3, child: Text('Title', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                              ],
                            ),
                          ),
                          _holidays.isEmpty
                              ? Center(
                            child: Text(
                              'No holidays found for this month.',
                              style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                            ),
                          )
                              : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _holidays.length,
                            itemBuilder: (context, index) {
                              final holiday = _holidays[index];
                              return Card(
                                color: const Color(0xFF1e1e1e),
                                margin: const EdgeInsets.symmetric(vertical: 2),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'ID: ${holiday['id']}',
                                        style: GoogleFonts.poppins(
                                          color: greenAccent,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Date: ${DateTime.parse(holiday['date']).toString().substring(0, 10)}',
                                        style: GoogleFonts.poppins(color: Colors.white),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Title: ${holiday['title']}',
                                        style: GoogleFonts.poppins(color: Colors.white),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 16),
                          OutlinedButton(
                            onPressed: () => setState(() => _dialogOpen = false),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: greenAccent),
                              foregroundColor: greenAccent,
                            ),
                            child: Text('Close', style: GoogleFonts.poppins()),
                          ),
                        ],
                      ),
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
