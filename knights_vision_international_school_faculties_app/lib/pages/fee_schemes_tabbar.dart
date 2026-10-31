import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../api_service.dart';
import '../constants.dart';

class FeeSchemesTabBar extends StatefulWidget {
  const FeeSchemesTabBar({super.key});

  @override
  State<FeeSchemesTabBar> createState() => _FeeSchemesTabBarState();
}

class _FeeSchemesTabBarState extends State<FeeSchemesTabBar>
    with TickerProviderStateMixin {
  List<dynamic> _feeSchemes = [];
  bool _isLoading = true;
  String? _errorMessage;
  TabController? _tabController;
  List<String> _classTabs = [];

  // Faculty must never select, present, or export support/standard market
  // categories.  The API has used both DIRECT_GENERAL and the old
  // GENERAL_DIRECT spelling, therefore every server value is normalized before
  // this allow-list is applied.
  static const Set<String> _approvedCategories = {
    'KSAT_GENERAL',
    'DIRECT_GENERAL',
  };

  static const Map<String, String> _categoryEligibility = {
    'KSAT_GENERAL': 'KSAT-qualified general admission',
    'DIRECT_GENERAL': 'Direct admission (no KSAT requirement)',
  };

  static const Map<String, String> _categoryLabels = {
    'KSAT_GENERAL': 'KSAT General',
    'DIRECT_GENERAL': 'General Direct',
  };

  static const Map<String, int> _categoryCutOff = {
    'KSAT_GENERAL': 35,
    'DIRECT_GENERAL': 0,
  };

  static const Map<String, Color> _categoryColors = {
    'KSAT_GENERAL': Color(0xFFab47bc), // Purple
    'DIRECT_GENERAL': Color(0xFFef5350), // Red
  };

  static const Map<String, int> _categoryOrder = {
    'KSAT_GENERAL': 1,
    'DIRECT_GENERAL': 2,
  };

  static String _normalizeCategory(dynamic value) {
    final normalized = value
        .toString()
        .trim()
        .toUpperCase()
        .replaceAll(RegExp(r'[\s-]+'), '_');

    // The database currently stores DIRECT_GENERAL, while older clients and
    // data exports can still send GENERAL_DIRECT.
    if (normalized == 'GENERAL_DIRECT' || normalized == 'DIRECT_GENERAL') {
      return 'DIRECT_GENERAL';
    }
    return normalized;
  }

  static String _categoryLabel(String category) =>
      _categoryLabels[category] ?? category;

  static int _compareCategories(dynamic left, dynamic right) =>
      (_categoryOrder[left.toString()] ?? 999)
          .compareTo(_categoryOrder[right.toString()] ?? 999);

  @override
  void initState() {
    super.initState();
    _fetchFeeSchemes();
  }

  @override
  void dispose() {
    _tabController?.dispose();
    super.dispose();
  }

  Future<void> _fetchFeeSchemes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Prefer the dedicated Faculty token while retaining the legacy key for
      // existing sessions created before the token-key migration.
      final token = await ApiService().readSessionToken();
      if (token == null) {
        throw Exception('User not authenticated. Please log in.');
      }

      final response = await http.get(
        Uri.parse(
            '$BASE_URL/api-schools-panel/faculties/institution-fee-schemes'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (!data.containsKey('feeSchemes') || data['feeSchemes'] is! List) {
          throw Exception('Invalid response format: fee schemes array missing');
        }

        final formattedSchemes = (data['feeSchemes'] as List)
            .where((item) => _approvedCategories
                .contains(_normalizeCategory(item['category'])))
            .map((item) {
          final category = _normalizeCategory(item['category']);
          return {
            'id': item['id'] ?? item.hashCode,
            'class': {
              'name': item['class']?['name']?.toString() ?? 'N/A',
              'section': item['class']?['section']?.toString() ?? '',
            },
            'category': category,
            'monthlyFee': (item['monthlyFee'] is num)
                ? item['monthlyFee'].toDouble()
                : 0.0,
            'admissionFee': (item['admissionFee'] is num)
                ? item['admissionFee'].toDouble()
                : 0.0,
            'readmissionFee': (item['readmissionFee'] is num)
                ? item['readmissionFee'].toDouble()
                : 0.0,
            'createdAt': item['createdAt'] != null
                ? DateTime.parse(item['createdAt']).toLocal().toString()
                : 'Not recorded',
            'updatedAt': item['updatedAt'] != null
                ? DateTime.parse(item['updatedAt']).toLocal().toString()
                : 'Not updated',
          };
        }).toList();

        final classOrder = {
          'LKG': 1,
          'UKG': 2,
          'I': 3,
          'II': 4,
          'III': 5,
          'IV': 6,
          'V': 7,
          'VI': 8,
          'VII': 9,
          'VIII': 10,
          'IX': 11,
          'X': 12,
          'XS': 13,
          'XI': 14,
          'XII': 15,
          'XIIS': 16,
          'XIII': 17,
          'XIIIJ': 18,
        };
        final classes = formattedSchemes
            .map((scheme) =>
                '${scheme['class']['name']}${scheme['class']['section'].isNotEmpty ? '-${scheme['class']['section']}' : ''}')
            .toSet()
            .toList();
        classes.sort((a, b) {
          final aParts = a.split('-');
          final bParts = b.split('-');
          final aClass = aParts[0];
          final bClass = bParts[0];
          final aSection = aParts.length > 1 ? aParts[1] : '';
          final bSection = bParts.length > 1 ? bParts[1] : '';
          final classCompare =
              (classOrder[aClass] ?? 999).compareTo(classOrder[bClass] ?? 999);
          return classCompare != 0
              ? classCompare
              : aSection.compareTo(bSection);
        });

        setState(() {
          _feeSchemes = formattedSchemes;
          _classTabs = classes;
          _isLoading = false;
          if (_classTabs.isNotEmpty) {
            _tabController =
                TabController(length: _classTabs.length, vsync: this);
          }
        });
      } else {
        throw Exception(
            'Failed to fetch fee schemes: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      debugPrint('Error in _fetchFeeSchemes: $errorMessage');
      setState(() {
        _isLoading = false;
        _errorMessage = errorMessage;
      });
      Fluttertoast.showToast(
        msg: _errorMessage ?? 'Failed to fetch fee schemes',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
    }
  }

  Future<void> _downloadFeeSchemesPdf() async {
    final pdf = pw.Document();
    final classOrder = {
      'LKG': 1,
      'UKG': 2,
      'I': 3,
      'II': 4,
      'III': 5,
      'IV': 6,
      'V': 7,
      'VI': 8,
      'VII': 9,
      'VIII': 10,
      'IX': 11,
      'X': 12,
      'XS': 13,
      'XI': 14,
      'XII': 15,
      'XIIS': 16,
      'XIII': 17,
      'XIIIJ': 18,
    };
    final groupedSchemes = <String, List<dynamic>>{};
    for (var scheme in _feeSchemes) {
      final classKey =
          '${scheme['class']['name']}${scheme['class']['section'].isNotEmpty ? '-${scheme['class']['section']}' : ''}';
      groupedSchemes[classKey] = groupedSchemes[classKey] ?? [];
      groupedSchemes[classKey]!.add(scheme);
    }

    final sortedClasses = groupedSchemes.keys.toList()
      ..sort((a, b) {
        final aParts = a.split('-');
        final bParts = b.split('-');
        final aClass = aParts[0];
        final bClass = bParts[0];
        final aSection = aParts.length > 1 ? aParts[1] : '';
        final bSection = bParts.length > 1 ? bParts[1] : '';
        final classCompare =
            (classOrder[aClass] ?? 999).compareTo(classOrder[bClass] ?? 999);
        return classCompare != 0 ? classCompare : aSection.compareTo(bSection);
      });

    pdf.addPage(
      pw.MultiPage(
        build: (pw.Context context) => [
          pw.Text(
            'Sure Success Point School Fee Schemes',
            style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold),
          ),
          pw.SizedBox(height: 20),
          pw.Text('Fee Scheme Categories',
              style:
                  pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 10),
          ..._categoryEligibility.keys.map((category) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text('Category: ${_categoryLabel(category)}',
                    style: const pw.TextStyle(fontSize: 14)),
                pw.Text(
                    'Eligibility: ${_categoryEligibility[category] ?? 'N/A'}',
                    style: const pw.TextStyle(fontSize: 14)),
                pw.Text('CutOff: ${_categoryCutOff[category] ?? 'N/A'}',
                    style: const pw.TextStyle(fontSize: 14)),
                pw.SizedBox(height: 5),
              ],
            );
          }),
          pw.SizedBox(height: 20),
          ...sortedClasses.map((classKey) {
            final schemes = groupedSchemes[classKey]!;
            schemes.sort(
                (a, b) => _compareCategories(a['category'], b['category']));
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(
                  'Class: $classKey',
                  style: pw.TextStyle(
                      fontSize: 16, fontWeight: pw.FontWeight.bold),
                ),
                pw.SizedBox(height: 10),
                pw.Table(
                  border: pw.TableBorder.all(),
                  children: [
                    pw.TableRow(
                      children: [
                        pw.Text('Monthly Fee',
                            style: pw.TextStyle(
                                fontSize: 14, fontWeight: pw.FontWeight.bold)),
                        pw.Text('Admission Fee',
                            style: pw.TextStyle(
                                fontSize: 14, fontWeight: pw.FontWeight.bold)),
                        pw.Text('Readmission Fee',
                            style: pw.TextStyle(
                                fontSize: 14, fontWeight: pw.FontWeight.bold)),
                      ],
                    ),
                    ...schemes.map((scheme) {
                      return pw.TableRow(
                        children: [
                          pw.Text(' Rs. ${scheme['monthlyFee']}/-',
                              style: const pw.TextStyle(fontSize: 14)),
                          pw.Text(' Rs. ${scheme['admissionFee']}/-',
                              style: const pw.TextStyle(fontSize: 14)),
                          pw.Text(' Rs. ${scheme['readmissionFee']}/-',
                              style: const pw.TextStyle(fontSize: 14)),
                        ],
                      );
                    }),
                  ],
                ),
                pw.SizedBox(height: 20),
              ],
            );
          }),
        ],
      ),
    );

    await Printing.sharePdf(
        bytes: await pdf.save(), filename: 'fee_schemes.pdf');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF212121),
      body: _isLoading
          ? const Center(
              child: SpinKitCircle(color: Color(0xFF00c853), size: 120),
            )
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _errorMessage!,
                        style: GoogleFonts.poppins(
                            color: Colors.red, fontSize: 16),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _errorMessage = null;
                            _isLoading = true;
                          });
                          _fetchFeeSchemes();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00c853),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: Text(
                          'Retry',
                          style: GoogleFonts.poppins(
                              color: Colors.black, fontSize: 16),
                        ),
                      ),
                    ],
                  ),
                )
              : _classTabs.isEmpty
                  ? Center(
                      child: Text(
                        'No approved fee schemes found.',
                        style: GoogleFonts.poppins(
                            color: Colors.white, fontSize: 16),
                      ),
                    )
                  : NestedScrollView(
                      headerSliverBuilder: (context, innerBoxIsScrolled) => [
                        SliverAppBar(
                          backgroundColor: const Color(0xFFb71c1c),
                          pinned: true,
                          flexibleSpace: FlexibleSpaceBar(
                            background: Container(
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Color(0xFFb71c1c),
                                    Color(0xFFd32f2f)
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                              ),
                            ),
                          ),
                          title: Row(
                            children: [
                              const Icon(Icons.monetization_on,
                                  color: Colors.white),
                              const SizedBox(width: 8),
                              Text(
                                'Fee Schemes',
                                style: GoogleFonts.poppins(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          actions: [
                            IconButton(
                              icon: const Icon(Icons.download,
                                  color: Colors.white),
                              onPressed: _downloadFeeSchemesPdf,
                            ),
                          ],
                          bottom: TabBar(
                            controller: _tabController,
                            isScrollable: true,
                            indicatorColor: const Color(0xFF00c853),
                            labelStyle: GoogleFonts.poppins(
                                color: Colors.white, fontSize: 14),
                            unselectedLabelStyle: GoogleFonts.poppins(
                                color: Colors.white70, fontSize: 14),
                            tabs: _classTabs
                                .map((className) => Tab(text: className))
                                .toList(),
                          ),
                        ),
                      ],
                      body: TabBarView(
                        controller: _tabController,
                        children: _classTabs.map((className) {
                          final schemes = _feeSchemes
                              .where((scheme) =>
                                  '${scheme['class']['name']}${scheme['class']['section'].isNotEmpty ? '-${scheme['class']['section']}' : ''}' ==
                                  className)
                              .toList()
                            ..sort((a, b) => _compareCategories(
                                a['category'], b['category']));
                          return ListView(
                            padding: const EdgeInsets.all(16.0),
                            children: [
                              ...schemes.map((scheme) {
                                return Card(
                                  color: const Color(0xFF111111),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    side: const BorderSide(
                                        color: Color(0x3300c853), width: 1),
                                  ),
                                  margin:
                                      const EdgeInsets.symmetric(vertical: 4),
                                  child: ListTile(
                                    contentPadding: const EdgeInsets.all(16),
                                    title: Text(
                                      _categoryLabel(
                                          scheme['category'].toString()),
                                      style: GoogleFonts.poppins(
                                        color: _categoryColors[
                                                scheme['category']] ??
                                            Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                    subtitle: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Eligibility: ${_categoryEligibility[scheme['category']] ?? 'N/A'}',
                                          style: GoogleFonts.poppins(
                                            color: Colors.white70,
                                            fontSize: 14,
                                          ),
                                        ),
                                        Text(
                                          'CutOff: ${_categoryCutOff[scheme['category']] ?? 'N/A'}',
                                          style: GoogleFonts.poppins(
                                            color: _categoryColors[
                                                    scheme['category']] ??
                                                Colors.white,
                                            fontSize: 14,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              'Monthly Fee:',
                                              style: GoogleFonts.poppins(
                                                color: Colors.white70,
                                                fontSize: 16,
                                              ),
                                            ),
                                            Text(
                                              '₹${scheme['monthlyFee']}',
                                              style: GoogleFonts.poppins(
                                                color: const Color(0xFF00c853),
                                                fontSize: 16,
                                              ),
                                            ),
                                          ],
                                        ),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              'Admission Fee:',
                                              style: GoogleFonts.poppins(
                                                color: Colors.white70,
                                                fontSize: 16,
                                              ),
                                            ),
                                            Text(
                                              '₹${scheme['admissionFee']}',
                                              style: GoogleFonts.poppins(
                                                color: const Color(0xFFffa000),
                                                fontSize: 16,
                                              ),
                                            ),
                                          ],
                                        ),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              'Readmission Fee:',
                                              style: GoogleFonts.poppins(
                                                color: Colors.white70,
                                                fontSize: 16,
                                              ),
                                            ),
                                            Text(
                                              '₹${scheme['readmissionFee']}',
                                              style: GoogleFonts.poppins(
                                                color: const Color(0xFF00c853),
                                                fontSize: 16,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              }),
                              if (schemes.isEmpty)
                                Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Text(
                                    'No approved fee schemes found for $className.',
                                    style: GoogleFonts.poppins(
                                        color: Colors.white, fontSize: 16),
                                  ),
                                ),
                            ],
                          );
                        }).toList(),
                      ),
                    ),
    );
  }
}
