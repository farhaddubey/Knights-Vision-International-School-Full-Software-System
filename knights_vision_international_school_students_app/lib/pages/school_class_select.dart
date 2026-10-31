import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants.dart';

class SchoolClassSelect extends StatefulWidget {
  final String? value;
  final String? selectedClass;
  final ValueChanged<String?> onChanged;

  const SchoolClassSelect({
    super.key,
    this.value,
    this.selectedClass,
    required this.onChanged,
  });

  @override
  _SchoolClassSelectState createState() => _SchoolClassSelectState();
}

class _SchoolClassSelectState extends State<SchoolClassSelect> {
  final _storage = const FlutterSecureStorage();
  List<Map<String, dynamic>> _classes = [];

  @override
  void initState() {
    super.initState();
    _fetchClasses();
  }

  Future<void> _fetchClasses() async {
    final token = await _storage.read(key: 'token');
    try {
      final response = await http.get(
        Uri.parse('$BASE_URL/api/school-classes/select'),
        headers: {'Authorization': 'Bearer $token'},
      );
      final data = jsonDecode(response.body);
      if (data is List) {
        setState(() {
          _classes = data.map((item) => {
            'id': item['id'].toString(),
            'name': '${item['name']}${item['section'] != null ? ' - ${item['section']}' : ''}',
          }).toList();
        });
      } else {
        throw Exception('Invalid API response structure');
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Error fetching classes: $e',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: widget.selectedClass,
      decoration: InputDecoration(
        labelText: 'Select Class-Section',
        labelStyle: GoogleFonts.poppins(color: const Color(0xFFAAAAAA)),
        enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF555555))),
        focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00C853))),
        filled: true,
        fillColor: const Color(0xFF333333),
      ),
      style: GoogleFonts.poppins(color: Colors.white),
      dropdownColor: const Color(0xFF333333),
      items: _classes.map((classItem) {
        return DropdownMenuItem<String>(
          value: classItem['id'].toString(),
          child: Text(
            classItem['name'].toString(),
            style: GoogleFonts.poppins(color: Colors.white),
          ),
        );
      }).toList(),
      onChanged: widget.onChanged,
    );
  }
}