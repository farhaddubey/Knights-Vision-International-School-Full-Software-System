import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sure_success_point_school_faculties_app/view_models/salary_view_model.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:intl/intl.dart';

import '../models/salary_view_model.dart';

class SalaryPage extends StatefulWidget {
  @override
  _SalaryPageState createState() => _SalaryPageState();
}

class _SalaryPageState extends State<SalaryPage> with SingleTickerProviderStateMixin {
  TabController? _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    Provider.of<SalaryViewModel>(context, listen: false).fetchSalaryData();
  }

  @override
  void dispose() {
    _tabController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<SalaryViewModel>(
      builder: (context, viewModel, child) {
        return Scaffold(
          backgroundColor: Color(0xFF212121),
          appBar: AppBar(
            backgroundColor: Color(0xFFB71C1C),
            title: Text('Salary', style: TextStyle(color: Colors.white)),
            bottom: TabBar(
              controller: _tabController,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              tabs: [
                Tab(text: 'My Attendance'),
                Tab(text: 'Salary History'),
                Tab(text: 'Current Month'),
              ],
            ),
          ),
          body: viewModel.isLoading
              ? Center(child: SpinKitCircle(color: Theme.of(context).primaryColor))
              : viewModel.error != null
              ? Center(child: Text(viewModel.error!, style: TextStyle(color: Colors.red)))
              : TabBarView(
            controller: _tabController,
            children: [
              _buildAttendanceTab(viewModel),
              _buildSalaryHistoryTab(viewModel),
              _buildCurrentMonthTab(viewModel),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAttendanceTab(SalaryViewModel viewModel) {
    return ListView.builder(
      itemCount: viewModel.teacherAttendance.length,
      itemBuilder: (context, index) {
        final attendance = viewModel.teacherAttendance[index];
        return ListTile(
          title: Text('Date: ${attendance['date']}', style: TextStyle(color: Colors.white)),
          subtitle: Text('Status: ${attendance['status']}', style: TextStyle(color: Colors.white70)),
        );
      },
    );
  }

  Widget _buildSalaryHistoryTab(SalaryViewModel viewModel) {
    return ListView.builder(
      itemCount: viewModel.salaryLogs.length,
      itemBuilder: (context, index) {
        final log = viewModel.salaryLogs[index];
        return Card(
          margin: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          color: Color(0xFF181818),
          child: ListTile(
            title: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('ID: ${log['id']}', style: TextStyle(color: Colors.white)),
                Text('₹${log['paidAmount']}', style: TextStyle(color: Colors.green)),
                Text(
                  _formatDateTime(log['paidOn']),
                  style: TextStyle(color: Colors.white70),
                ),
              ],
            ),
            subtitle: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(log['paymentMode'], style: TextStyle(color: Colors.blue)),
                Text('Paid By: ${log['paidByUserId']}', style: TextStyle(color: Colors.grey)),
              ],
            ),
            onTap: () => _showSalaryDetails(context, log),
          ),
        );
      },
    );
  }

  Widget _buildCurrentMonthTab(SalaryViewModel viewModel) {
    final salary = viewModel.currentMonthSalary;
    return Padding(
      padding: EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Current Month Salary', style: TextStyle(color: Colors.white, fontSize: 18)),
          SizedBox(height: 16),
          Text('Amount: ₹${salary?['amount'] ?? 'N/A'}', style: TextStyle(color: Colors.green)),
          Text('Status: ${salary?['status'] ?? 'N/A'}', style: TextStyle(color: Colors.white70)),
          Text(
            'Date: ${_formatDateTime(salary?['date'])}',
            style: TextStyle(color: Colors.white70),
          ),
        ],
      ),
    );
  }

  String _formatDateTime(String? isoString) {
    if (isoString == null) return 'N/A';
    try {
      DateTime utcDate = DateTime.parse(isoString).toLocal();
      return DateFormat('dd MMM yyyy, h:mm a').format(utcDate);
    } catch (e) {
      return 'Invalid date';
    }
  }

  void _showSalaryDetails(BuildContext context, Map<String, dynamic> log) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Color(0xFF181818),
        title: ListTile(
          leading: Icon(Icons.payment, color: Colors.white),
          title: Text('Payment Log Details', style: TextStyle(color: Colors.white)),
          trailing: IconButton(
            icon: Icon(Icons.close, color: Colors.red),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        content: SingleChildScrollView(
          child: Column(
            children: [
              _buildDialogField('Log ID', log['id'].toString()),
              _buildDialogField('Paid Amount', '₹${log['paidAmount']}'),
              _buildDialogField('Paid On', _formatDateTime(log['paidOn'])),
              _buildDialogField('Payment Mode', log['paymentMode']),
              _buildDialogField('Note', log['note'] ?? 'N/A'),
              _buildDialogField('Paid By User ID', log['paidByUserId'].toString()),
              _buildDialogField('Created At', _formatDateTime(log['createdAt'])),
              _buildDialogField('Updated At', _formatDateTime(log['updatedAt'])),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildDialogField(String label, String value) {
    final controller = TextEditingController(text: value);
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 2),
      child: TextFormField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(),
          labelStyle: TextStyle(color: Colors.white70),
        ),
        readOnly: true,
        style: TextStyle(color: Colors.white),
      ),
    );
  }
}