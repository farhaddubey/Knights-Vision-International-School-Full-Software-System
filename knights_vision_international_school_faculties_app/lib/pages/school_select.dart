import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants.dart';

class SchoolSelect extends StatefulWidget {
  final String? value;
  final String? selectedSchool;
  final ValueChanged<String?> onChanged;

  const SchoolSelect({
    super.key,
    this.value,
    this.selectedSchool,
    required this.onChanged,
  });

  @override
  _SchoolSelectState createState() => _SchoolSelectState();
}

class _SchoolSelectState extends State<SchoolSelect> {
  final _storage = const FlutterSecureStorage();
  List<Map<String, dynamic>> _schools = [];

  @override
  void initState() {
    super.initState();
    _fetchSchools();
  }

  Future<void> _fetchSchools() async {
    final token = await _storage.read(key: 'token');
    try {
      final response = await http.get(
        Uri.parse('$BASE_URL/api/schools/select'),
        headers: {'Authorization': 'Bearer $token'},
      );
      final data = jsonDecode(response.body);
      if (data is List) {
        setState(() {
          _schools = data.map((item) => {'id': item['id'].toString(), 'name': item['name'] as String}).toList();
        });
      } else {
        throw Exception('Invalid API response structure');
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Error fetching schools: $e',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: widget.selectedSchool,
      decoration: InputDecoration(
        labelText: 'Select School',
        labelStyle: GoogleFonts.poppins(color: const Color(0xFFAAAAAA)),
        enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
        focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00C853))),
        filled: true,
        fillColor: const Color(0xFF333333),
      ),
      style: GoogleFonts.poppins(color: Colors.white),
      dropdownColor: const Color(0xFF333333),
      items: _schools.map<DropdownMenuItem<String>>((school) => DropdownMenuItem<String>(
        value: school['id'].toString(),
        child: Text(
          school['name'].toString(),
          style: GoogleFonts.poppins(color: Colors.white),
        ),
      )).toList(),
      onChanged: widget.onChanged,
    );
  }
}