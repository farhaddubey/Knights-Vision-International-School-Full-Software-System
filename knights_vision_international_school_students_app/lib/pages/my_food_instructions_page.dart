import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'dart:io';
import 'package:intl/intl.dart';
import '../constants.dart';
import 'view_food_instruction_dialog.dart';

class MyFoodInstructionsPage extends StatefulWidget {
  const MyFoodInstructionsPage({super.key});

  @override
  _MyFoodInstructionsPageState createState() => _MyFoodInstructionsPageState();
}

class _MyFoodInstructionsPageState extends State<MyFoodInstructionsPage> {
  final _storage = const FlutterSecureStorage();
  bool _loading = false;
  String? _error;
  String _className = '';
  List<dynamic> _allInstructions = [];
  List<dynamic> _filteredInstructions = [];
  String _searchQuery = '';
  int _page = 1;
  int _totalPages = 1;
  bool _viewDialogOpen = false;
  dynamic _selectedInstruction;
  final int _pageSize = 50;
  final TextEditingController _searchController = TextEditingController();
  static const greenAccent = Color(0xFF00c757);

  @override
  void initState() {
    super.initState();
    _fetchInstructions();
  }

  Future<void> _fetchInstructions() async {
    setState(() => _loading = true);
    final token = await _storage.read(key: 'student_token');
    if (token == null) {
      setState(() {
        _error = 'User not authenticated. Please log in.';
        _loading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('User not authenticated. Please log in.')),
      );
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    try {
      print('Fetching food instructions');
      print('Fetch URL: $BASE_URL/api/a1-knights-students-panel/students/myfoodinstructions?page=1&pageSize=$_pageSize');
      final response = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/students/myfoodinstructions?page=1&pageSize=$_pageSize'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Fetch response status: ${response.statusCode}');

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['instructions'] is List) {
        setState(() {
          _allInstructions = data['instructions'].map((i) => {
            'id': i['id'],
            'title': i['title']?.toString().split('\n').join(' ') ?? 'N/A',
            'foodType': i['foodType']?.toString().split('\n').join(' ') ?? 'N/A',
            'frequency': i['frequency']?.toString().split('\n').join(' ') ?? 'N/A',
            'description': i['description']?.toString().split('\n').join(' ') ?? 'N/A',
            'mediaUrl': i['mediaUrl'],
          }).toList();
          _filteredInstructions = _allInstructions;
          _totalPages = (_allInstructions.length / _pageSize).ceil();
          _className = data['className']?.toString().split('\n').join(' ') ?? 'Unknown';
          _loading = false;
        });
      } else {
        throw Exception('Invalid response format: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('Error fetching food instructions: $e');
      print(stackTrace);
      setState(() {
        _error = 'Failed to fetch food instructions: ${e.toString()}';
        _loading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to fetch food instructions.')),
      );
    }
  }

  void _handleSearchChange(String value) {
    setState(() {
      _searchQuery = value;
      _filteredInstructions = _allInstructions.where((instruction) =>
      instruction['title'].toString().toLowerCase().contains(value.toLowerCase()) ||
          (instruction['description']?.toString().toLowerCase() ?? '').contains(value.toLowerCase())).toList();
      _totalPages = (_filteredInstructions.length / _pageSize).ceil();
      _page = 1;
    });
  }

  void _handlePageChange(int value) {
    setState(() => _page = value);
  }

  void _openViewDialog(dynamic instruction) {
    setState(() {
      _selectedInstruction = instruction;
      _viewDialogOpen = true;
    });
  }

  Future<void> _generatePDF() async {
    try {
      final now = DateTime.now();
      final monthYear = DateFormat('MMMM yyyy').format(now);

      final pdf = pw.Document();
      final font = pw.Font.helvetica();
      final boldFont = pw.Font.helveticaBold();

      pdf.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4,
          margin: pw.EdgeInsets.all(10),
          build: (pw.Context context) {
            return [
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
                      'www.sspointschool.in | Powered by Knights (KiREAD) Group',
                      style: pw.TextStyle(
                        font: font,
                        fontSize: 10,
                        color: PdfColor.fromHex('#333333'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'FOOD INSTRUCTIONS',
                      style: pw.TextStyle(
                        font: boldFont,
                        fontSize: 12,
                        color: PdfColor.fromHex('#000000'),
                      ),
                      textAlign: pw.TextAlign.center,
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'Class: $_className | Generated on: $monthYear',
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
                  0: const pw.FlexColumnWidth(2),
                  1: const pw.FlexColumnWidth(2),
                  2: const pw.FlexColumnWidth(2),
                  3: const pw.FlexColumnWidth(3),
                },
                children: [
                  // Header row
                  pw.TableRow(
                    decoration: pw.BoxDecoration(
                      color: PdfColor.fromHex('#009688'),
                    ),
                    children: [
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(4),
                        child: pw.Text(
                          'Title',
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
                          'Food Type',
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
                          'Frequency',
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
                          'Description',
                          style: pw.TextStyle(
                            font: boldFont,
                            fontSize: 10,
                            color: PdfColor.fromHex('#FFFFFF'),
                          ),
                        ),
                      ),
                    ],
                  ),
                  // Data rows
                  ..._filteredInstructions.asMap().entries.map((entry) {
                    final index = entry.key;
                    final instruction = entry.value;
                    final isEven = index % 2 == 0;
                    return pw.TableRow(
                      decoration: pw.BoxDecoration(
                        color: isEven ? PdfColor.fromHex('#FFFFFF') : PdfColor.fromHex('#F0F0F0'),
                      ),
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            instruction['title'] ?? 'N/A',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            instruction['foodType'] ?? 'N/A',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            instruction['frequency'] ?? 'N/A',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(4),
                          child: pw.Text(
                            instruction['description'] ?? 'N/A',
                            style: pw.TextStyle(font: font, fontSize: 10),
                          ),
                        ),
                      ],
                    );
                  }),
                ],
              ),
              // Footer
              pw.SizedBox(height: 8),
              pw.Align(
                alignment: pw.Alignment.centerLeft,
                child: pw.Text(
                  'Generated on: ${DateFormat('yyyy-MM-dd').format(now)}',
                  style: pw.TextStyle(font: font, fontSize: 8),
                ),
              ),
            ];
          },
        ),
      );

      final output = await getTemporaryDirectory();
      final file = File('${output.path}/food_instructions_${_className}.pdf');
      await file.writeAsBytes(await pdf.save());
      await OpenFile.open(file.path);
      Fluttertoast.showToast(
        msg: 'PDF downloaded successfully',
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
    if (_loading) {
      return Scaffold(
        backgroundColor: const Color(0xFF181818),
        body: const Center(
          child: SpinKitCircle(color: greenAccent, size: 120),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF181818),
        body: Center(
          child: Text(_error!, style: GoogleFonts.poppins(color: Colors.white)),
        ),
      );
    }

    final paginatedInstructions = _filteredInstructions.sublist(
      (_page - 1) * _pageSize,
      (_page * _pageSize).clamp(0, _filteredInstructions.length),
    );

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
                    'My Food Instructions - Class $_className',
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
                    onPressed: _filteredInstructions.isEmpty ? null : _generatePDF,
                  ),
                ],
              ),
              // Content
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      // Search Bar
                      Row(
                        children: [
                          SizedBox(
                            width: 200,
                            child: TextField(
                              controller: _searchController,
                              onChanged: _handleSearchChange,
                              decoration: InputDecoration(
                                hintText: 'Search Instructions...',
                                hintStyle: GoogleFonts.poppins(color: Colors.white70),
                                filled: true,
                                fillColor: const Color(0xFF333333),
                                border: const OutlineInputBorder(),
                                prefixIcon: const Icon(Icons.search, color: Colors.white70),
                              ),
                              style: GoogleFonts.poppins(color: Colors.white),
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
                            Expanded(flex: 2, child: Text('Title', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('Food Type', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('Frequency', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                            Expanded(flex: 2, child: Text('Actions', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold))),
                          ],
                        ),
                      ),
                      // Instructions List
                      paginatedInstructions.isEmpty
                          ? Center(
                        child: Text(
                          'No food instructions found for Class $_className.',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
                        ),
                      )
                          : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: paginatedInstructions.length,
                        itemBuilder: (context, index) {
                          final instruction = paginatedInstructions[index];
                          return Card(
                            color: const Color(0xFF1e1e1e),
                            margin: const EdgeInsets.symmetric(vertical: 2),
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Title: ${instruction['title']}',
                                    style: GoogleFonts.poppins(
                                      color: greenAccent,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Food Type: ${instruction['foodType']}',
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Frequency: ${instruction['frequency']}',
                                    style: GoogleFonts.poppins(color: Colors.white),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  OutlinedButton(
                                    onPressed: () => _openViewDialog(instruction),
                                    style: OutlinedButton.styleFrom(
                                      side: BorderSide(color: greenAccent),
                                      foregroundColor: greenAccent,
                                    ),
                                    child: Text('View', style: GoogleFonts.poppins()),
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
              // Pagination
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.chevron_left, color: greenAccent),
                        onPressed: _page > 1 ? () => _handlePageChange(_page - 1) : null,
                      ),
                      Text(
                        'Page $_page of $_totalPages',
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                      IconButton(
                        icon: const Icon(Icons.chevron_right, color: greenAccent),
                        onPressed: _page < _totalPages ? () => _handlePageChange(_page + 1) : null,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          if (_viewDialogOpen)
            ViewFoodInstructionDialog(
              open: _viewDialogOpen,
              onClose: () => setState(() => _viewDialogOpen = false),
              instruction: _selectedInstruction,
              className: _className,
            ),
        ],
      ),
    );
  }
}
