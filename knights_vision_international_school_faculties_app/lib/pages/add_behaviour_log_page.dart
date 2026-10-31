import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants.dart';

class AddBehaviourLogPage extends StatefulWidget {
  final VoidCallback onSave;

  const AddBehaviourLogPage({super.key, required this.onSave});

  @override
  _AddBehaviourLogPageState createState() => _AddBehaviourLogPageState();
}

class _AddBehaviourLogPageState extends State<AddBehaviourLogPage> {
  final _storage = const FlutterSecureStorage();
  final TextEditingController _studentIdController = TextEditingController();
  final TextEditingController _typeController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _resolvedByController = TextEditingController();
  final TextEditingController _resolvedNoteController = TextEditingController();
  String? _selectedClassSubjectId;
  String? _selectedCategory;
  String? _selectedSeverity;
  String? _selectedPunishmentId;
  bool _isResolved = false;
  bool _isLoading = false;
  String? _errorMessage;
  List<Map<String, dynamic>> _classSubjects = [];
  List<Map<String, dynamic>> _punishments = [];
  final List<String> _categories = [
    'ACADEMIC',
    'DISCIPLINE',
    'ATTENDANCE',
    'UNIFORM',
    'DEVICE_MISUSE',
    'EXAM_MISCONDUCT'
  ];
  final List<String> _severities = ['1', '2', '3', '4', '5'];

  @override
  void initState() {
    super.initState();
    _fetchDropdownData();
  }

  Future<void> _fetchDropdownData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      // Fetch class subjects
      final classSubjectsResponse = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/class-subjects'),
        headers: {'Authorization': 'Bearer $token'},
      );

      // Fetch punishments
      final punishmentsResponse = await http.get(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/punishments'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (classSubjectsResponse.statusCode == 200 && punishmentsResponse.statusCode == 200) {
        final classSubjectsData = jsonDecode(classSubjectsResponse.body);
        final punishmentsData = jsonDecode(punishmentsResponse.body);
        setState(() {
          _classSubjects = List<Map<String, dynamic>>.from(classSubjectsData['classSubjects'] ?? []);
          _punishments = List<Map<String, dynamic>>.from(punishmentsData['punishments'] ?? []);
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch dropdown data: ${classSubjectsResponse.statusCode}, ${punishmentsResponse.statusCode}');
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      print('Error in _fetchDropdownData: $errorMessage');
      setState(() {
        _isLoading = false;
        _errorMessage = errorMessage;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_errorMessage ?? 'Failed to fetch dropdown data')),
        );
      });
    }
  }

  Future<void> _submitLog() async {
    if (_studentIdController.text.isEmpty ||
        _typeController.text.isEmpty ||
        _selectedClassSubjectId == null ||
        _selectedCategory == null ||
        _selectedSeverity == null) {
      setState(() {
        _errorMessage = 'Please fill all required fields';
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please fill all required fields')),
        );
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/class_teachers_panel/behaviour-logs'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'studentId': _studentIdController.text,
          'classSubjectId': _selectedClassSubjectId,
          'category': _selectedCategory,
          'type': _typeController.text,
          'severityLevel': int.parse(_selectedSeverity!),
          'description': _descriptionController.text.isNotEmpty ? _descriptionController.text : null,
          'punishmentId': _selectedPunishmentId,
          'isResolved': _isResolved,
          'resolvedBy': _resolvedByController.text.isNotEmpty ? _resolvedByController.text : null,
          'resolvedNote': _resolvedNoteController.text.isNotEmpty ? _resolvedNoteController.text : null,
          'incidentDate': DateTime.now().toIso8601String(),
        }),
      );

      if (response.statusCode == 201) {
        widget.onSave();
        Navigator.pop(context, true);
      } else {
        throw Exception('Failed to add behaviour log: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      final errorMessage = e.toString().replaceFirst('Exception: ', '');
      print('Error in _submitLog: $errorMessage');
      setState(() {
        _isLoading = false;
        _errorMessage = errorMessage;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_errorMessage ?? 'Failed to add behaviour log')),
        );
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _studentIdController.dispose();
    _typeController.dispose();
    _descriptionController.dispose();
    _resolvedByController.dispose();
    _resolvedNoteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFFb71c1c),
        title: Row(
          children: [
            const Icon(Icons.add, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              'Add Behaviour Log',
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        centerTitle: true,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            children: [
              if (_errorMessage != null)
                Text(
                  _errorMessage!,
                  style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
                ),
              if (_isLoading)
                const SpinKitCircle(color: Color(0xFF00c757), size: 120)
              else ...[
                Card(
                  color: const Color(0xFF111111),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        TextField(
                          controller: _studentIdController,
                          decoration: InputDecoration(
                            hintText: 'Student ID *',
                            hintStyle: GoogleFonts.poppins(color: Colors.white70),
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: const OutlineInputBorder(borderSide: BorderSide.none),
                            prefixIcon: const Icon(Icons.person, color: Colors.white70),
                          ),
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: _selectedClassSubjectId,
                          hint: Text(
                            'Select Class Subject *',
                            style: GoogleFonts.poppins(color: Colors.white70),
                          ),
                          items: _classSubjects.map((subject) {
                            return DropdownMenuItem(
                              value: subject['id'].toString(),
                              child: Text(
                                '${subject['subject']['name']} - ${subject['className']}',
                                style: GoogleFonts.poppins(color: Colors.white),
                              ),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedClassSubjectId = value;
                            });
                          },
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: const OutlineInputBorder(borderSide: BorderSide.none),
                            prefixIcon: const Icon(Icons.class_, color: Colors.white70),
                          ),
                          dropdownColor: const Color(0xFF333333),
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: _selectedCategory,
                          hint: Text(
                            'Select Category *',
                            style: GoogleFonts.poppins(color: Colors.white70),
                          ),
                          items: _categories.map((category) {
                            return DropdownMenuItem(
                              value: category,
                              child: Text(
                                category,
                                style: GoogleFonts.poppins(color: Colors.white),
                              ),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedCategory = value;
                            });
                          },
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: const OutlineInputBorder(borderSide: BorderSide.none),
                            prefixIcon: const Icon(Icons.category, color: Colors.white70),
                          ),
                          dropdownColor: const Color(0xFF333333),
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _typeController,
                          decoration: InputDecoration(
                            hintText: 'Type *',
                            hintStyle: GoogleFonts.poppins(color: Colors.white70),
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: const OutlineInputBorder(borderSide: BorderSide.none),
                            prefixIcon: const Icon(Icons.label, color: Colors.white70),
                          ),
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: _selectedSeverity,
                          hint: Text(
                            'Select Severity *',
                            style: GoogleFonts.poppins(color: Colors.white70),
                          ),
                          items: _severities.map((severity) {
                            return DropdownMenuItem(
                              value: severity,
                              child: Text(
                                severity,
                                style: GoogleFonts.poppins(color: Colors.white),
                              ),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedSeverity = value;
                            });
                          },
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: const OutlineInputBorder(borderSide: BorderSide.none),
                            prefixIcon: const Icon(Icons.warning, color: Colors.white70),
                          ),
                          dropdownColor: const Color(0xFF333333),
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _descriptionController,
                          decoration: InputDecoration(
                            hintText: 'Description (Optional)',
                            hintStyle: GoogleFonts.poppins(color: Colors.white70),
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: const OutlineInputBorder(borderSide: BorderSide.none),
                            prefixIcon: const Icon(Icons.description, color: Colors.white70),
                          ),
                          style: GoogleFonts.poppins(color: Colors.white),
                          maxLines: 3,
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: _selectedPunishmentId,
                          hint: Text(
                            'Select Punishment (Optional)',
                            style: GoogleFonts.poppins(color: Colors.white70),
                          ),
                          items: _punishments.map((punishment) {
                            return DropdownMenuItem(
                              value: punishment['id'].toString(),
                              child: Text(
                                punishment['title'],
                                style: GoogleFonts.poppins(color: Colors.white),
                              ),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedPunishmentId = value;
                            });
                          },
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: const OutlineInputBorder(borderSide: BorderSide.none),
                            prefixIcon: const Icon(Icons.gavel, color: Colors.white70),
                          ),
                          dropdownColor: const Color(0xFF333333),
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        const SizedBox(height: 16),
                        SwitchListTile(
                          title: Text(
                            'Resolved',
                            style: GoogleFonts.poppins(color: Colors.white),
                          ),
                          value: _isResolved,
                          onChanged: (value) {
                            setState(() {
                              _isResolved = value;
                            });
                          },
                          activeColor: const Color(0xFF00c757),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _resolvedByController,
                          decoration: InputDecoration(
                            hintText: 'Resolved By (Optional)',
                            hintStyle: GoogleFonts.poppins(color: Colors.white70),
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: const OutlineInputBorder(borderSide: BorderSide.none),
                            prefixIcon: const Icon(Icons.person, color: Colors.white70),
                          ),
                          style: GoogleFonts.poppins(color: Colors.white),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _resolvedNoteController,
                          decoration: InputDecoration(
                            hintText: 'Resolved Note (Optional)',
                            hintStyle: GoogleFonts.poppins(color: Colors.white70),
                            filled: true,
                            fillColor: const Color(0xFF333333),
                            border: const OutlineInputBorder(borderSide: BorderSide.none),
                            prefixIcon: const Icon(Icons.note, color: Colors.white70),
                          ),
                          style: GoogleFonts.poppins(color: Colors.white),
                          maxLines: 3,
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              child: Text(
                                'Cancel',
                                style: GoogleFonts.poppins(color: Colors.red),
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: _submitLog,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF00c757),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: Text(
                                'Submit',
                                style: GoogleFonts.poppins(color: Colors.black, fontSize: 12),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}