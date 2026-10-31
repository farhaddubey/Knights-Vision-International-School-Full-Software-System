import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:provider/provider.dart';
import 'package:sure_success_point_school_faculties_app/models/attendance_model.dart';
import 'package:sure_success_point_school_faculties_app/models/leave_request_model.dart';
import 'package:sure_success_point_school_faculties_app/view_models/attendance_view_model.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';

class StudentListItem extends StatelessWidget {
  final Student student;
  final String status;
  final Function(String) onStatusChange;
  final VoidCallback onHistoryTap;
  final VoidCallback onReportTap;

  StudentListItem({
    required this.student,
    required this.status,
    required this.onStatusChange,
    required this.onHistoryTap,
    required this.onReportTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      color: Color(0xFF181818),
      child: ListTile(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('ID: ${student.id}', style: TextStyle(color: Colors.white)),
            Text('${student.firstName} ${student.lastName}', style: TextStyle(color: Colors.white)),
            Text('Roll: ${student.rollNumber}', style: TextStyle(color: Colors.white)),
          ],
        ),
        subtitle: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                ElevatedButton(
                  onPressed: () => onStatusChange('PRESENT'),
                  child: Text('Present'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: status == 'PRESENT' ? Colors.green : Colors.grey,
                  ),
                ),
                SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () => onStatusChange('ABSENT'),
                  child: Text('Absent'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: status == 'ABSENT' ? Colors.red : Colors.grey,
                  ),
                ),
                SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () => onStatusChange('HOLIDAY'),
                  child: Text('Holiday'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: status == 'HOLIDAY' ? Colors.purple : Colors.grey,
                  ),
                ),
                SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () => onStatusChange('WEEKLY_HOLIDAY'),
                  child: Text('Sunday'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: status == 'WEEKLY_HOLIDAY' ? Colors.blue : Colors.grey,
                  ),
                ),
              ],
            ),
            Row(
              children: [
                TextButton(
                  onPressed: onHistoryTap,
                  child: Text('History', style: TextStyle(color: Colors.yellow)),
                ),
                TextButton(
                  onPressed: onReportTap,
                  child: Text('Report', style: TextStyle(color: Colors.orange)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class LeaveRequestListItem extends StatelessWidget {
  final LeaveRequest request;
  final VoidCallback onDetailsTap;
  final VoidCallback onApproveTap;
  final VoidCallback onAttendanceTap;
  final VoidCallback onLeaveHistoryTap;

  LeaveRequestListItem({
    required this.request,
    required this.onDetailsTap,
    required this.onApproveTap,
    required this.onAttendanceTap,
    required this.onLeaveHistoryTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      color: Color(0xFF181818),
      child: ListTile(
        onTap: onDetailsTap,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('ID: ${request.id}', style: TextStyle(color: Colors.white)),
            Text(request.studentName, style: TextStyle(color: Colors.white)),
            Text(
              '${request.fromDate.substring(0, 10)} to ${request.toDate.substring(0, 10)}',
              style: TextStyle(color: Colors.white),
            ),
            Text(request.reason, style: TextStyle(color: Colors.white)),
            Text(
              request.approved == null
                  ? 'Pending'
                  : (request.approved == true ? 'Approved' : 'Rejected'),
              style: TextStyle(color: Colors.white),
            ),
          ],
        ),
        subtitle: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            ElevatedButton(
              onPressed: request.approved == null ? onApproveTap : null,
              child: Text('Approve/Reject'),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            ),
            SizedBox(width: 8),
            TextButton(
              onPressed: onAttendanceTap,
              child: Text('Attendance', style: TextStyle(color: Colors.white)),
            ),
            TextButton(
              onPressed: onLeaveHistoryTap,
              child: Text('Leave History', style: TextStyle(color: Colors.blue)),
            ),
          ],
        ),
      ),
    );
  }
}

class AttendanceHistoryDialog extends StatelessWidget {
  final int studentId;
  final String studentName;
  final String className;

  AttendanceHistoryDialog({
    required this.studentId,
    required this.studentName,
    required this.className,
  });

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<AttendanceViewModel>(context);
    return Dialog(
      backgroundColor: Color(0xFF212121),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: Icon(Icons.calendar_today, color: Colors.white),
            title: Text(
              'Attendance History for $studentName - $className',
              style: TextStyle(color: Colors.white),
            ),
            trailing: IconButton(
              icon: Icon(Icons.close, color: Colors.red),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          DropdownButton<String>(
            value: viewModel.selectedMonth,
            onChanged: (value) => viewModel.setSelectedMonth(value!),
            items: List.generate(12, (index) {
              final date = DateTime.now().subtract(Duration(days: index * 30));
              final monthStr = DateFormat('yyyy-MM').format(date);
              return DropdownMenuItem(
                value: monthStr,
                child: Text(
                  DateFormat('MMMM yyyy').format(date),
                  style: TextStyle(color: Colors.white),
                ),
              );
            }),
            dropdownColor: Color(0xFF181818),
          ),
          viewModel.isLoadingHistory
              ? Center(child: SpinKitCircle(color: Theme.of(context).primaryColor))
              : Container(
            height: 400,
            child: TableCalendar(
              firstDay: DateTime.utc(2020, 1, 1),
              lastDay: DateTime.utc(2030, 12, 31),
              focusedDay: DateTime.parse('${viewModel.selectedMonth}-01'),
              calendarFormat: CalendarFormat.month,
              onDaySelected: (selectedDay, focusedDay) {},
              calendarBuilders: CalendarBuilders(
                defaultBuilder: (context, date, _) {
                  final record = viewModel.attendanceRecords.firstWhere(
                        (r) => r.date.substring(0, 10) == DateFormat('yyyy-MM-dd').format(date),
                    orElse: () => AttendanceRecord(date: '', status: '', remarks: ''),
                  );
                  if (record.status.isEmpty) return null;
                  final statusColors = {
                    'PRESENT': Colors.green,
                    'ABSENT': Colors.red,
                    'HOLIDAY': Colors.purple,
                    'WEEKLY_HOLIDAY': Colors.yellow,
                  };
                  return Container(
                    margin: EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: statusColors[record.status] ?? Colors.grey,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        '${date.day}',
                        style: TextStyle(color: Colors.black),
                      ),
                    ),
                  );
                },
              ),
              calendarStyle: CalendarStyle(
                defaultTextStyle: TextStyle(color: Colors.white),
                weekendTextStyle: TextStyle(color: Colors.red),
                outsideTextStyle: TextStyle(color: Colors.grey),
                selectedDecoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  shape: BoxShape.circle,
                ),
              ),
              headerStyle: HeaderStyle(
                titleTextStyle: TextStyle(color: Colors.white),
                formatButtonVisible: false,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildLegendItem('Present', Colors.green),
                _buildLegendItem('Absent', Colors.red),
                _buildLegendItem('Holiday', Colors.purple),
                _buildLegendItem('Weekly Holiday', Colors.yellow),
              ],
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
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
        SizedBox(width: 4),
        Text(label, style: TextStyle(color: Colors.white)),
      ],
    );
  }
}

class AttendanceReportDialog extends StatelessWidget {
  final int studentId;
  final String studentName;
  final String className;

  AttendanceReportDialog({
    required this.studentId,
    required this.studentName,
    required this.className,
  });

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<AttendanceViewModel>(context);
    return Dialog(
      backgroundColor: Color(0xFF212121),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: Icon(Icons.assessment, color: Colors.white),
            title: Text(
              'Attendance Report for $studentName - $className',
              style: TextStyle(color: Colors.white),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButton<String>(
                  value: viewModel.selectedMonth,
                  onChanged: (value) => viewModel.setSelectedMonth(value!),
                  items: List.generate(12, (index) {
                    final date = DateTime.now().subtract(Duration(days: index * 30));
                    final monthStr = DateFormat('yyyy-MM').format(date);
                    return DropdownMenuItem(
                      value: monthStr,
                      child: Text(
                        DateFormat('MMMM yyyy').format(date),
                        style: TextStyle(color: Colors.white),
                      ),
                    );
                  }),
                  dropdownColor: Color(0xFF181818),
                ),
                IconButton(
                  icon: Icon(Icons.close, color: Colors.red),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          viewModel.isLoadingHistory
              ? Center(child: SpinKitCircle(color: Theme.of(context).primaryColor))
              : Expanded(
            child: ListView.builder(
              itemCount: viewModel.attendanceRecords.length,
              itemBuilder: (context, index) {
                final record = viewModel.attendanceRecords[index];
                return ListTile(
                  title: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        DateFormat('dd MMM yyyy').format(DateTime.parse(record.date)),
                        style: TextStyle(color: Colors.white),
                      ),
                      Text(
                        DateFormat('EEEE').format(DateTime.parse(record.date)),
                        style: TextStyle(color: Colors.white),
                      ),
                      Row(
                        children: [
                          ElevatedButton(
                            onPressed: null,
                            child: Text('Present'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: record.status == 'PRESENT' ? Colors.green : Colors.grey,
                            ),
                          ),
                          SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: null,
                            child: Text('Absent'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: record.status == 'ABSENT' ? Colors.red : Colors.grey,
                            ),
                          ),
                          SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: null,
                            child: Text('Holiday'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: record.status == 'HOLIDAY' ? Colors.purple : Colors.grey,
                            ),
                          ),
                          SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: null,
                            child: Text('Weekly Off'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: record.status == 'WEEKLY_HOLIDAY' ? Colors.blue : Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class ApproveLeaveRequestDialog extends StatelessWidget {
  final LeaveRequest request;

  ApproveLeaveRequestDialog({required this.request});

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<AttendanceViewModel>(context);
    return Dialog(
      backgroundColor: Color(0xFF212121),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            title: Text('Approve/Reject Leave Request', style: TextStyle(color: Colors.white)),
            trailing: IconButton(
              icon: Icon(Icons.close, color: Colors.red),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Request ID: ${request.id}', style: TextStyle(color: Colors.white)),
                Text('Student: ${request.studentName}', style: TextStyle(color: Colors.white)),
                Text(
                  'Date Range: ${request.fromDate.substring(0, 10)} to ${request.toDate.substring(0, 10)}',
                  style: TextStyle(color: Colors.white),
                ),
                Text('Reason: ${request.reason}', style: TextStyle(color: Colors.white)),
                Text(
                  request.approved == null
                      ? 'Pending'
                      : (request.approved == true ? 'Approved' : 'Rejected'),
                  style: TextStyle(color: Colors.white),
                ),
              ],
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('Cancel', style: TextStyle(color: Colors.red)),
              ),
              ElevatedButton(
                onPressed: request.approved == null ? () => viewModel.approveLeaveRequest(request.id, true) : null,
                child: Text('Approve'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              ),
              ElevatedButton(
                onPressed: request.approved == null ? () => viewModel.approveLeaveRequest(request.id, false) : null,
                child: Text('Reject'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
              ),
            ],
          ),
        ],
      ),
    );
  }
}