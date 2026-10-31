import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'package:intl/intl.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../constants.dart';

class MyDueFeesPage extends StatefulWidget {
  const MyDueFeesPage({super.key});

  @override
  _MyDueFeesPageState createState() => _MyDueFeesPageState();
}

class _MyDueFeesPageState extends State<MyDueFeesPage> {
  final _storage = const FlutterSecureStorage();
  String? _className;
  String _schoolName = 'Sure Success Point School';
  String _branchAddress = 'Unknown Address';
  List<dynamic> _fees = [];
  List<dynamic> _filteredFees = [];
  List<dynamic> _payments = [];
  dynamic _selectedMonth;
  int _academicYear = 2025;
  bool _loading = false;
  bool _dialogOpen = false;
  String? _error;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  static const greenAccent = Color(0xFF00c757);

  final List<String> monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  @override
  void initState() {
    super.initState();
    _fetchFeeStatus();
  }

  Future<void> _fetchFeeStatus() async {
    setState(() {
      _loading = true;
      _searchQuery = '';
      _searchController.clear();
    });
    final token = await _storage.read(key: 'student_token');
    if (token == null) {
      setState(() {
        _error = 'User not authenticated. Please log in.';
        _loading = false;
      });
      Fluttertoast.showToast(
        msg: 'User not authenticated. Please log in.',
        backgroundColor: Colors.red,
      );
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    try {
      print('Fetching fee status for academic year: $_academicYear');
      print('Fetch URL: $BASE_URL/api/a1-knights-students-panel/students/myfeestatus?academicYear=$_academicYear');
      final response = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/students/myfeestatus?academicYear=$_academicYear'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Fetch response status: ${response.statusCode}');

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['fees'] is List) {
        setState(() {
          _fees = data['fees'].map((f) => {
            'id': f['id'],
            'month': f['month'],
            'status': f['status']?.toString().split('\n').join(' ') ?? 'N/A',
            'totalDue': f['totalDue'] ?? 0.0,
            'paidAmount': f['paidAmount'] ?? 0.0,
            'fineAmount': f['fineAmount'] ?? 0.0,
            'dueDate': f['dueDate']?.toString().split('\n').join(' ') ?? 'N/A',
            'isWaived': f['isWaived'] ?? false,
            'waivedAmount': f['waivedAmount'] ?? 0.0,
            'remarks': f['remarks']?.toString().split('\n').join(' ') ?? 'N/A',
          }).toList();
          _filteredFees = _fees;
          _className = data['className']?.toString().split('\n').join(' ') ?? 'Unknown';
          _schoolName = data['schoolName']?.toString().split('\n').join(' ') ?? 'Sure Success Point School';
          _branchAddress = data['branchAddress']?.toString().split('\n').join(' ') ?? 'Unknown Address';
          _error = null;
          _loading = false;
        });
      } else {
        throw Exception('Invalid response format: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching fee status: $e');
      print(stackTrace);
      setState(() {
        _error = 'Failed to fetch fee status: ${e.toString().replaceFirst('Exception: ', '')}';
        _loading = false;
      });
      Fluttertoast.showToast(
        msg: 'Failed to fetch fee status: ${e.toString().replaceFirst('Exception: ', '')}',
        backgroundColor: Colors.red,
      );
    }
  }

  Future<void> _fetchPayments(String monthlyFeeId) async {
    setState(() => _loading = true);
    final token = await _storage.read(key: 'student_token');
    if (token == null) {
      setState(() => _loading = false);
      Fluttertoast.showToast(
        msg: 'User not authenticated. Please log in.',
        backgroundColor: Colors.red,
      );
      return;
    }

    try {
      print('Fetching payments for monthlyFeeId: $monthlyFeeId');
      print('Fetch URL: $BASE_URL/api/a1-knights-students-panel/students/myfeestatus?monthlyFeeId=$monthlyFeeId');
      final response = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/students/myfeestatus?monthlyFeeId=$monthlyFeeId'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Fetch response status: ${response.statusCode}');

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['payments'] is List) {
        setState(() {
          _payments = data['payments'].map((p) => {
            'amount': p['amount'] ?? 0.0,
            'paymentDate': p['paymentDate']?.toString().split('\n').join(' ') ?? 'N/A',
            'method': p['method']?.toString().split('\n').join(' ') ?? 'N/A',
            'transactionId': p['transactionId']?.toString().split('\n').join(' ') ?? 'N/A',
            'receivedBy': p['receivedBy']?.toString().split('\n').join(' ') ?? 'N/A',
            'remarks': p['remarks']?.toString().split('\n').join(' ') ?? 'N/A',
          }).toList();
          _className = data['className']?.toString().split('\n').join(' ') ?? _className ?? 'Unknown';
          _schoolName = data['schoolName']?.toString().split('\n').join(' ') ?? _schoolName;
          _branchAddress = data['branchAddress']?.toString().split('\n').join(' ') ?? _branchAddress;
          _error = null;
          _loading = false;
        });
      } else {
        throw Exception('Invalid response format: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching payments: $e');
      print(stackTrace);
      setState(() {
        _payments = [];
        _error = 'Failed to fetch payment details: ${e.toString().replaceFirst('Exception: ', '')}';
        _loading = false;
      });
      Fluttertoast.showToast(
        msg: 'Failed to fetch payment details: ${e.toString().replaceFirst('Exception: ', '')}',
        backgroundColor: Colors.red,
      );
    }
  }

  void _handleSearchChange(String value) {
    setState(() {
      _searchQuery = value;
      _filteredFees = _fees.where((fee) {
        final month = monthNames[fee['month'] - 1].toLowerCase();
        final status = fee['status'].toString().toLowerCase();
        final totalDue = fee['totalDue'].toString().toLowerCase();
        final paidAmount = fee['paidAmount'].toString().toLowerCase();
        final fineAmount = fee['fineAmount'].toString().toLowerCase();
        final dueDate = fee['dueDate'].toString().toLowerCase();
        return month.contains(value.toLowerCase()) ||
            status.contains(value.toLowerCase()) ||
            totalDue.contains(value.toLowerCase()) ||
            paidAmount.contains(value.toLowerCase()) ||
            fineAmount.contains(value.toLowerCase()) ||
            dueDate.contains(value.toLowerCase());
      }).toList();
    });
  }

  void _handleOpenDialog(dynamic fee) {
    setState(() {
      _selectedMonth = fee;
      _dialogOpen = true;
      _searchQuery = '';
      _searchController.clear();
    });
    if (fee['id'] != null) {
      _fetchPayments(fee['id']);
    } else {
      setState(() => _payments = []);
    }
  }

  void _handleCloseDialog() {
    setState(() {
      _dialogOpen = false;
      _selectedMonth = null;
      _payments = [];
    });
  }

  Future<void> _handleDownloadPDF() async {
    try {
      final now = DateTime.now();
      final monthYear = DateFormat('MMMM yyyy').format(now);

      final pdf = pw.Document();
      final font = pw.Font.helvetica();
      final boldFont = pw.Font.helveticaBold();

      // Fetch payment details for all months with existing records
      final token = await _storage.read(key: 'student_token');
      final paymentData = <String, String>{};
      for (final fee in _filteredFees.where((f) => f['id'] != null)) {
        try {
          print('Fetching payment details for monthlyFeeId: ${fee['id']}');
          final response = await http.get(
            Uri.parse('$BASE_URL/api/a1-knights-students-panel/students/myfeestatus?monthlyFeeId=${fee['id']}'),
            headers: {'Authorization': 'Bearer $token'},
          );
          print('Fetch payment response status: ${response.statusCode}');
          final data = jsonDecode(response.body);
          final latestPayment = (data['payments'] as List?)
              ?.cast<Map<String, dynamic>>()
              .where((p) => p['paymentDate'] != null)
              .toList()
            ?..sort((a, b) => DateTime.parse(b['paymentDate']).compareTo(DateTime.parse(a['paymentDate'])));
          paymentData[fee['id']] = latestPayment!.isNotEmpty
              ? '${latestPayment[0]['transactionId']?.toString().split('\n').join(' ') ?? 'N/A'} (${latestPayment[0]['method']?.toString().split('\n').join(' ') ?? 'N/A'})'
              : 'N/A';
        } catch (e) {
          print('Error fetching payment details for ${fee['id']}: $e');
          paymentData[fee['id']] = 'N/A';
        }
      }

      // Prepare table data
      final tableData = _filteredFees.map((fee) => [
        monthNames[fee['month'] - 1],
        fee['status'],
        '₹${fee['totalDue'].toStringAsFixed(2)}',
        '₹${fee['paidAmount'].toStringAsFixed(2)}',
        '₹${fee['fineAmount'].toStringAsFixed(2)}',
        fee['dueDate'].substring(0, 10),
        fee['id'] != null ? paymentData[fee['id']] ?? 'N/A' : 'N/A',
      ]).toList();

      // Calculate totals
      final totalPaid = _filteredFees.fold<double>(0, (sum, fee) => sum + (fee['paidAmount'] as num));
      final totalRemaining =
      _filteredFees.fold<double>(0, (sum, fee) => sum + (fee['status'] == 'PAID' ? 0 : (fee['totalDue'] - fee['paidAmount']) as num));

      pdf.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4,
          margin: pw.EdgeInsets.all(10),
          build: (pw.Context context) => [
            // Header
            pw.Center(
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.center,
                children: [
                  pw.Text(
                    'Sure Success Point School',
                    style: pw.TextStyle(
                      font: boldFont,
                      fontSize: 20,
                      color: PdfColor.fromHex('#003087'),
                    ),
                    textAlign: pw.TextAlign.center,
                  ),
                  pw.SizedBox(height: 4),
                  pw.Text(
                    'Institution of Humanism, Hardwork, Discipline, Technology & Excellence',
                    style: pw.TextStyle(
                      font: boldFont,
                      fontSize: 10,
                      color: PdfColor.fromHex('#333333'),
                    ),
                    textAlign: pw.TextAlign.center,
                  ),
                  pw.Text(
                    'www.sspointschool.in | $_branchAddress',
                    style: pw.TextStyle(
                      font: font,
                      fontSize: 10,
                      color: PdfColor.fromHex('#333333'),
                    ),
                    textAlign: pw.TextAlign.center,
                  ),
                  pw.SizedBox(height: 4),
                  pw.Text(
                    'FEE PAYMENT RECEIPT',
                    style: pw.TextStyle(
                      font: boldFont,
                      fontSize: 12,
                      color: PdfColor.fromHex('#000000'),
                    ),
                    textAlign: pw.TextAlign.center,
                  ),
                  pw.SizedBox(height: 4),
                  pw.Text(
                    'Class: ${_className?.toUpperCase() ?? 'Unknown'} | Academic Year: $_academicYear',
                    style: pw.TextStyle(
                      font: font,
                      fontSize: 10,
                      color: PdfColor.fromHex('#000000'),
                    ),
                    textAlign: pw.TextAlign.center,
                  ),
                  pw.SizedBox(height: 8),
                ],
              ),
            ),
            // Table
            pw.Table(
              border: pw.TableBorder.all(
                color: PdfColor.fromHex('#000000'),
                width: 0.1,
              ),
              columnWidths: {
                0: const pw.FlexColumnWidth(1),
                1: const pw.FlexColumnWidth(1),
                2: const pw.FlexColumnWidth(1),
                3: const pw.FlexColumnWidth(1),
                4: const pw.FlexColumnWidth(1),
                5: const pw.FlexColumnWidth(1),
                6: const pw.FlexColumnWidth(2),
              },
              children: [
                // Header Row
                pw.TableRow(
                  decoration: pw.BoxDecoration(
                    color: PdfColor.fromHex('#009688'),
                  ),
                  children: [
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(4),
                      child: pw.Text(
                        'Month',
                        style: pw.TextStyle(
                          font: boldFont,
                          fontSize: 10,
                          color: PdfColor.fromHex('#FFFFFF'),
                        ),
                      ),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(4),
                      child: pw.Text(
                        'Status',
                        style: pw.TextStyle(
                          font: boldFont,
                          fontSize: 10,
                          color: PdfColor.fromHex('#FFFFFF'),
                        ),
                      ),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(4),
                      child: pw.Text(
                        'Total Due',
                        style: pw.TextStyle(
                          font: boldFont,
                          fontSize: 10,
                          color: PdfColor.fromHex('#FFFFFF'),
                        ),
                      ),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(4),
                      child: pw.Text(
                        'Paid Amount',
                        style: pw.TextStyle(
                          font: boldFont,
                          fontSize: 10,
                          color: PdfColor.fromHex('#FFFFFF'),
                        ),
                      ),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(4),
                      child: pw.Text(
                        'Fine Amount',
                        style: pw.TextStyle(
                          font: boldFont,
                          fontSize: 10,
                          color: PdfColor.fromHex('#FFFFFF'),
                        ),
                      ),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(4),
                      child: pw.Text(
                        'Due Date',
                        style: pw.TextStyle(
                          font: boldFont,
                          fontSize: 10,
                          color: PdfColor.fromHex('#FFFFFF'),
                        ),
                      ),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(4),
                      child: pw.Text(
                        'Transaction ID/Method',
                        style: pw.TextStyle(
                          font: boldFont,
                          fontSize: 10,
                          color: PdfColor.fromHex('#FFFFFF'),
                        ),
                      ),
                    ),
                  ],
                ),
                // Data Rows
                ...tableData.asMap().entries.map((entry) {
                  final index = entry.key;
                  final row = entry.value;
                  final isEven = index % 2 == 0;
                  return pw.TableRow(
                    decoration: pw.BoxDecoration(
                      color: isEven ? PdfColor.fromHex('#FFFFFF') : PdfColor.fromHex('#F0F0F0'),
                    ),
                    children: row.asMap().entries.map((cell) {
                      final j = cell.key;
                      final value = cell.value;
                      return pw.Padding(
                        padding: const pw.EdgeInsets.all(4),
                        child: pw.Text(
                          value.toString(),
                          style: pw.TextStyle(
                            font: font,
                            fontSize: 10,
                            color: j == 1
                                ? (value == 'PAID'
                                ? PdfColor.fromHex('#00c757')
                                : value == 'WAIVED'
                                ? PdfColor.fromHex('#FFCA28')
                                : PdfColor.fromHex('#F44336'))
                                : PdfColor.fromHex('#000000'),
                            fontWeight: j == 1 && value == 'PAID' ? pw.FontWeight.bold : pw.FontWeight.normal,
                          ),
                        ),
                      );
                    }).toList(),
                  );
                }),
              ],
            ),
            // Totals
            if (tableData.isNotEmpty) ...[
              pw.SizedBox(height: 10),
              pw.Text(
                'Total Paid: ₹${totalPaid.toStringAsFixed(2)}',
                style: pw.TextStyle(
                  font: boldFont,
                  fontSize: 12,
                  color: PdfColor.fromHex('#000000'),
                ),
              ),
              pw.SizedBox(height: 8),
              pw.Text(
                'Total Remaining: ₹${totalRemaining.toStringAsFixed(2)}',
                style: pw.TextStyle(
                  font: boldFont,
                  fontSize: 12,
                  color: PdfColor.fromHex('#000000'),
                ),
              ),
            ],
            // Footer
            pw.SizedBox(height: 8),
            pw.Align(
              alignment: pw.Alignment.centerLeft,
              child: pw.Text(
                'Generated on: ${DateFormat('yyyy-MM-dd').format(now)}',
                style: pw.TextStyle(font: font, fontSize: 8),
              ),
            ),
          ],
        ),
      );

      final output = await getTemporaryDirectory();
      final file = File('${output.path}/fee_receipt_${_className ?? 'Unknown'}_$_academicYear.pdf');
      await file.writeAsBytes(await pdf.save());
      await OpenFile.open(file.path);
      Fluttertoast.showToast(
        msg: 'Fee receipt downloaded successfully',
        backgroundColor: Colors.green,
      );
    } catch (e, stackTrace) {
      print('Error generating PDF: $e');
      print(stackTrace);
      Fluttertoast.showToast(
        msg: 'Failed to generate or open PDF: ${e.toString()}',
        backgroundColor: Colors.red,
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
                    'My Fee Status - Class ${_className ?? 'Unknown'}',
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
                    icon: const Icon(Icons.download, color: greenAccent),
                    onPressed: _filteredFees.isEmpty ? null : _handleDownloadPDF,
                    tooltip: 'Download Receipt',
                  ),
                ],
              ),
              // Content
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      // Search Bar and Academic Year
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          SizedBox(
                            width: 200,
                            child: TextField(
                              controller: _searchController,
                              onChanged: _handleSearchChange,
                              decoration: InputDecoration(
                                hintText: 'Search Fees...',
                                hintStyle: GoogleFonts.poppins(color: Colors.white70),
                                filled: true,
                                fillColor: const Color(0xFF333333),
                                border: const OutlineInputBorder(),
                                prefixIcon: const Icon(Icons.search, color: greenAccent),
                              ),
                              style: GoogleFonts.poppins(color: Colors.white),
                            ),
                          ),
                          SizedBox(
                            width: 150,
                            child: TextField(
                              decoration: InputDecoration(
                                hintText: 'Academic Year',
                                hintStyle: GoogleFonts.poppins(color: Colors.white70),
                                filled: true,
                                fillColor: const Color(0xFF333333),
                                border: const OutlineInputBorder(),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                              style: GoogleFonts.poppins(color: Colors.white),
                              keyboardType: TextInputType.number,
                              onChanged: (value) {
                                setState(() => _academicYear = int.tryParse(value) ?? 2025);
                                _fetchFeeStatus();
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      // Table Header
                      Container(
                        color: const Color(0xFF333333),
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            Expanded(flex: 1, child: Text('Month', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 1, child: Text('Status', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 1, child: Text('Due', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 1, child: Text('Paid', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 1, child: Text('Fine', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('Due Date', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          ],
                        ),
                      ),
                      // Fees List
                      if (_loading)
                        const Center(child: SpinKitCircle(color: greenAccent, size: 120))
                      else if (_error != null)
                        Center(child: Text(_error!, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16)))
                      else
                        _filteredFees.isEmpty
                            ? Center(
                          child: Text(
                            'No fee records found for $_className in $_academicYear.',
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                          ),
                        )
                            : ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _filteredFees.length,
                          itemBuilder: (context, index) {
                            final fee = _filteredFees[index];
                            return Card(
                              color: const Color(0xFF1e1e1e),
                              margin: const EdgeInsets.symmetric(vertical: 2),
                              child: Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Month: ${monthNames[fee['month'] - 1]}',
                                      style: GoogleFonts.poppins(
                                        color: greenAccent,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Status: ${fee['status']}',
                                      style: GoogleFonts.poppins(
                                        color: fee['status'] == 'PAID'
                                            ? greenAccent
                                            : fee['status'] == 'WAIVED'
                                            ? const Color(0xFFFFCA28)
                                            : const Color(0xFFF44336),
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Total Due: ₹${fee['totalDue'].toStringAsFixed(2)}',
                                      style: GoogleFonts.poppins(color: Colors.white),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Paid Amount: ₹${fee['paidAmount'].toStringAsFixed(2)}',
                                      style: GoogleFonts.poppins(color: Colors.white),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Fine Amount: ₹${fee['fineAmount'].toStringAsFixed(2)}',
                                      style: GoogleFonts.poppins(color: Colors.white),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Due Date: ${fee['dueDate'].substring(0, 10)}',
                                      style: GoogleFonts.poppins(color: Colors.white),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    OutlinedButton(
                                      onPressed: () => _handleOpenDialog(fee),
                                      style: OutlinedButton.styleFrom(
                                        side: BorderSide(color: greenAccent),
                                        foregroundColor: greenAccent,
                                      ),
                                      child: Text('View Payments', style: GoogleFonts.poppins()),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          // Payment Details Dialog
          if (_dialogOpen)
            Material(
              color: const Color(0xFF181818),
              child: CustomScrollView(
                slivers: [
                  // Sticky Header
                  SliverAppBar(
                    pinned: true,
                    backgroundColor: const Color(0xFFb71c1c),
                    flexibleSpace: FlexibleSpaceBar(
                      centerTitle: true,
                      title: Text(
                        'Payment Details for ${_selectedMonth != null ? monthNames[_selectedMonth['month'] - 1] : 'Unknown'} $_academicYear - Class ${_className ?? 'Unknown'}',
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
                      onPressed: _handleCloseDialog,
                      tooltip: 'Close',
                    ),
                  ),
                  // Content
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (_selectedMonth != null) ...[
                            Text(
                              'Status: ${_selectedMonth['status']}',
                              style: GoogleFonts.poppins(
                                color: _selectedMonth['status'] == 'PAID'
                                    ? greenAccent
                                    : _selectedMonth['status'] == 'WAIVED'
                                    ? const Color(0xFFFFCA28)
                                    : const Color(0xFFF44336),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Total Due: ₹${_selectedMonth['totalDue'].toStringAsFixed(2)}',
                              style: GoogleFonts.poppins(color: Colors.white),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Paid Amount: ₹${_selectedMonth['paidAmount'].toStringAsFixed(2)}',
                              style: GoogleFonts.poppins(color: Colors.white),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Fine Amount: ₹${_selectedMonth['fineAmount'].toStringAsFixed(2)}',
                              style: GoogleFonts.poppins(color: Colors.white),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Waived: ${_selectedMonth['isWaived'] == true ? 'Yes' : 'No'}',
                              style: GoogleFonts.poppins(color: Colors.white),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (_selectedMonth['isWaived'] == true)
                              Text(
                                'Waived Amount: ₹${_selectedMonth['waivedAmount'].toStringAsFixed(2)}',
                                style: GoogleFonts.poppins(color: Colors.white),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            const SizedBox(height: 4),
                            Text(
                              'Remarks: ${_selectedMonth['remarks']}',
                              style: GoogleFonts.poppins(color: Colors.white),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Total Payments: ${_payments.length}',
                              style: GoogleFonts.poppins(color: Colors.white),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8),
                          ],
                          // Payments List
                          if (_loading)
                            const Center(child: SpinKitCircle(color: greenAccent, size: 120))
                          else if (_payments.isEmpty)
                            Center(
                              child: Text(
                                'No payment records found for this month.',
                                style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                              ),
                            )
                          else
                            Container(
                              height: 200,
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: _payments.length,
                                itemBuilder: (context, index) {
                                  final payment = _payments[index];
                                  return Container(
                                    width: 300,
                                    margin: const EdgeInsets.all(8),
                                    child: Card(
                                      color: const Color(0xFF1e1e1e),
                                      child: Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'Amount: ₹${payment['amount'].toStringAsFixed(2)}',
                                              style: GoogleFonts.poppins(
                                                color: greenAccent,
                                                fontWeight: FontWeight.bold,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Payment Date: ${payment['paymentDate'].substring(0, 10)}',
                                              style: GoogleFonts.poppins(color: Colors.white),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Method: ${payment['method']}',
                                              style: GoogleFonts.poppins(color: Colors.white),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Transaction ID: ${payment['transactionId']}',
                                              style: GoogleFonts.poppins(color: Colors.white),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Received By: ${payment['receivedBy']}',
                                              style: GoogleFonts.poppins(color: Colors.white),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Remarks: ${payment['remarks']}',
                                              style: GoogleFonts.poppins(color: Colors.white),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
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
