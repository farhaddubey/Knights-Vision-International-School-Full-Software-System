import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants.dart';

class SchoolBranchSelect extends StatefulWidget {
  final String? value;
  final String? selectedBranch;
  final ValueChanged<String?> onChanged;

  const SchoolBranchSelect({
    super.key,
    this.value,
    this.selectedBranch,
    required this.onChanged,
  });

  @override
  _SchoolBranchSelectState createState() => _SchoolBranchSelectState();
}

class _SchoolBranchSelectState extends State<SchoolBranchSelect> {
  final _storage = const FlutterSecureStorage();
  List<Map<String, dynamic>> _branches = [];

  @override
  void initState() {
    super.initState();
    _fetchBranches();
  }

  Future<void> _fetchBranches() async {
    final token = await _storage.read(key: 'token');
    try {
      final response = await http.get(
        Uri.parse('$BASE_URL/api/school-branches/select'),
        headers: {'Authorization': 'Bearer $token'},
      );
      final data = jsonDecode(response.body);
      if (data is List) {
        setState(() {
          _branches = data.map((item) => {'id': item['id'].toString(), 'name': item['name'] as String}).toList();
        });
      } else {
        throw Exception('Invalid API response structure');
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Error fetching branches: $e',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: widget.selectedBranch,
      decoration: InputDecoration(
        labelText: 'Select Branch',
        labelStyle: GoogleFonts.poppins(color: const Color(0xFFAAAAAA)),
        enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
        focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00C853))),
        filled: true,
        fillColor: const Color(0xFF333333),
      ),
      style: GoogleFonts.poppins(color: Colors.white),
      dropdownColor: const Color(0xFF333333),
      items: _branches.map<DropdownMenuItem<String>>((branch) => DropdownMenuItem<String>(
        value: branch['id'].toString(),
        child: Text(
          branch['name'].toString(),
          style: GoogleFonts.poppins(color: Colors.white),
        ),
      )).toList(),
      onChanged: widget.onChanged,
    );
  }
}