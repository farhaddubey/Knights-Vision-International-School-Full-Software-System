import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../api_service.dart';

/// Student-safe institutional fee catalogue.
///
/// Support and concession schemes are internal finance decisions. Students can
/// see only the two published schemes returned by their own school/branch.
class FeeSchemesTabBar extends StatefulWidget {
  const FeeSchemesTabBar({super.key});

  @override
  State<FeeSchemesTabBar> createState() => _FeeSchemesTabBarState();
}

class _FeeSchemesTabBarState extends State<FeeSchemesTabBar>
    with TickerProviderStateMixin {
  static const _visibleCategories = {'KSAT_GENERAL', 'DIRECT_GENERAL'};
  static const _categoryOrder = {
    'KSAT_GENERAL': 1,
    'DIRECT_GENERAL': 2,
  };
  static const _classOrder = {
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

  final _apiService = ApiService();
  final _categoryEligibility = const {
    'KSAT_GENERAL': 'KSAT-qualified general admission',
    'DIRECT_GENERAL': 'General direct admission (no KSAT requirement)',
  };
  final _categoryLabels = const {
    'KSAT_GENERAL': 'KSAT General Fee Scheme',
    'DIRECT_GENERAL': 'General Direct Fee Scheme',
  };
  final _categoryColors = const {
    'KSAT_GENERAL': Color(0xFFAB47BC),
    'DIRECT_GENERAL': Color(0xFFEF5350),
  };

  List<Map<String, dynamic>> _feeSchemes = const [];
  List<String> _classTabs = const [];
  TabController? _tabController;
  bool _isLoading = true;
  String? _errorMessage;

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

  int _classRank(String name) => _classOrder[name] ?? 999;

  String _classKey(Map<String, dynamic> scheme) {
    final schoolClass = Map<String, dynamic>.from(scheme['class'] as Map);
    final name = schoolClass['name']?.toString() ?? 'Not assigned';
    final section = schoolClass['section']?.toString().trim() ?? '';
    return section.isEmpty ? name : '$name-$section';
  }

  int _compareClassKeys(String first, String second) {
    final firstParts = first.split('-');
    final secondParts = second.split('-');
    final rank =
        _classRank(firstParts.first).compareTo(_classRank(secondParts.first));
    if (rank != 0) return rank;
    return first.compareTo(second);
  }

  Future<void> _fetchFeeSchemes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiService.authorizedGet(
        '/api/a1-knights-students-panel/students/institution-fee-schemes',
      );
      final decoded = jsonDecode(response.body);
      if (response.statusCode != 200 ||
          decoded is! Map ||
          decoded['feeSchemes'] is! List) {
        final error = decoded is Map ? decoded['error'] : null;
        throw Exception(error is String && error.isNotEmpty
            ? error
            : 'Unable to fetch the institutional fee structure.');
      }

      final schemes = (decoded['feeSchemes'] as List)
          .whereType<Map>()
          .where((item) => _visibleCategories.contains(item['category']))
          .map((item) {
        final category = item['category']?.toString() ?? '';
        return <String, dynamic>{
          'id': item['id'],
          'class': Map<String, dynamic>.from(item['class'] as Map? ?? const {}),
          'category': category,
          'categoryLabel': _categoryLabels[category] ?? 'Fee Scheme',
          'monthlyFee': (item['monthlyFee'] as num?)?.toDouble() ?? 0,
          'admissionFee': (item['admissionFee'] as num?)?.toDouble() ?? 0,
          'readmissionFee': (item['readmissionFee'] as num?)?.toDouble() ?? 0,
        };
      }).toList()
        ..sort((first, second) {
          final classComparison =
              _compareClassKeys(_classKey(first), _classKey(second));
          if (classComparison != 0) return classComparison;
          return (_categoryOrder[first['category']] ?? 999)
              .compareTo(_categoryOrder[second['category']] ?? 999);
        });

      final classes = schemes.map(_classKey).toSet().toList()
        ..sort(_compareClassKeys);

      if (!mounted) return;
      _tabController?.dispose();
      setState(() {
        _feeSchemes = schemes;
        _classTabs = classes;
        _tabController = classes.isEmpty
            ? null
            : TabController(length: classes.length, vsync: this);
        _isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      final message = error.toString().replaceFirst('Exception: ', '');
      setState(() {
        _isLoading = false;
        _errorMessage = message;
      });
      Fluttertoast.showToast(
        msg: message,
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
    }
  }

  Future<void> _downloadFeeSchemesPdf() async {
    final pdf = pw.Document();
    final grouped = <String, List<Map<String, dynamic>>>{};
    for (final scheme in _feeSchemes) {
      grouped.putIfAbsent(_classKey(scheme), () => []).add(scheme);
    }
    final classes = grouped.keys.toList()..sort(_compareClassKeys);

    pdf.addPage(
      pw.MultiPage(
        build: (_) => [
          pw.Text('Sure Success Point School Fee Structure',
              style:
                  pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 8),
          pw.Text('Published student/guardian schemes only',
              style: const pw.TextStyle(fontSize: 10)),
          pw.SizedBox(height: 16),
          ...classes.expand((classKey) {
            final schemes = grouped[classKey]!
              ..sort((first, second) =>
                  (_categoryOrder[first['category']] ?? 999)
                      .compareTo(_categoryOrder[second['category']] ?? 999));
            return [
              pw.Text('Class: $classKey',
                  style: pw.TextStyle(
                      fontSize: 15, fontWeight: pw.FontWeight.bold)),
              pw.SizedBox(height: 6),
              pw.Table.fromTextArray(
                headers: const [
                  'Scheme',
                  'Monthly fee',
                  'Admission fee',
                  'Readmission fee'
                ],
                data: schemes
                    .map((scheme) => [
                          scheme['categoryLabel'],
                          'Rs. ${scheme['monthlyFee']}',
                          'Rs. ${scheme['admissionFee']}',
                          'Rs. ${scheme['readmissionFee']}',
                        ])
                    .toList(),
              ),
              pw.SizedBox(height: 8),
              ...schemes.map((scheme) => pw.Text(
                    '${scheme['categoryLabel']}: ${_categoryEligibility[scheme['category']] ?? ''}',
                    style: const pw.TextStyle(fontSize: 9),
                  )),
              pw.SizedBox(height: 16),
            ];
          }),
        ],
      ),
    );
    await Printing.sharePdf(
      bytes: await pdf.save(),
      filename: 'ssps-institution-fee-structure.pdf',
    );
  }

  Widget _feeCard(Map<String, dynamic> scheme) {
    final category = scheme['category']?.toString() ?? '';
    final color = _categoryColors[category] ?? Colors.white;
    final text = GoogleFonts.poppins;
    return Card(
      color: const Color(0xFF111111),
      margin: const EdgeInsets.symmetric(vertical: 5),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0x3300C853)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        title: Text(scheme['categoryLabel']?.toString() ?? 'Fee Scheme',
            style:
                text(color: color, fontWeight: FontWeight.bold, fontSize: 16)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(_categoryEligibility[category] ?? '',
                style: text(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 10),
            _feeRow(
                'Monthly Fee', scheme['monthlyFee'], const Color(0xFF00C853)),
            _feeRow('Admission Fee', scheme['admissionFee'],
                const Color(0xFFFFA000)),
            _feeRow('Readmission Fee', scheme['readmissionFee'],
                const Color(0xFF00C853)),
          ],
        ),
      ),
    );
  }

  Widget _feeRow(String label, dynamic amount, Color color) => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('$label:',
              style: GoogleFonts.poppins(color: Colors.white70, fontSize: 15)),
          Text('₹${amount ?? 0}',
              style: GoogleFonts.poppins(
                  color: color, fontSize: 15, fontWeight: FontWeight.w600)),
        ],
      );

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF212121),
        body: Center(child: SpinKitCircle(color: Color(0xFF00C853), size: 72)),
      );
    }
    if (_errorMessage != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF212121),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Text(_errorMessage!,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                      color: Colors.redAccent, fontSize: 16)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _fetchFeeSchemes,
                style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00C853)),
                child: Text('Retry',
                    style: GoogleFonts.poppins(color: Colors.black)),
              ),
            ]),
          ),
        ),
      );
    }
    if (_classTabs.isEmpty || _tabController == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF212121),
        body: Center(
          child: Text('No published fee schemes are available for your branch.',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(color: Colors.white70, fontSize: 16)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF212121),
      body: NestedScrollView(
        headerSliverBuilder: (_, __) => [
          SliverAppBar(
            backgroundColor: const Color(0xFFB71C1C),
            pinned: true,
            title: Row(children: [
              const Icon(Icons.monetization_on, color: Colors.white),
              const SizedBox(width: 8),
              Text('Institution Fee Structure',
                  style: GoogleFonts.poppins(
                      color: Colors.white, fontWeight: FontWeight.bold)),
            ]),
            actions: [
              IconButton(
                tooltip: 'Download published fee structure',
                icon: const Icon(Icons.download, color: Colors.white),
                onPressed: _downloadFeeSchemesPdf,
              ),
            ],
            bottom: TabBar(
              controller: _tabController,
              isScrollable: true,
              indicatorColor: const Color(0xFF00C853),
              tabs: _classTabs.map((name) => Tab(text: name)).toList(),
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: _classTabs.map((className) {
            final schemes = _feeSchemes
                .where((scheme) => _classKey(scheme) == className)
                .toList();
            return ListView(
              padding: const EdgeInsets.all(16),
              children: schemes.map(_feeCard).toList(),
            );
          }).toList(),
        ),
      ),
    );
  }
}
