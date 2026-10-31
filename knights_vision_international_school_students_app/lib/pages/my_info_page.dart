import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import '../constants.dart';

class MyInfoPage extends StatefulWidget {
  const MyInfoPage({super.key});

  @override
  _MyInfoPageState createState() => _MyInfoPageState();
}

class _MyInfoPageState extends State<MyInfoPage> {
  final _storage = const FlutterSecureStorage();
  dynamic _studentData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchStudentData();
  }

  Future<void> _fetchStudentData() async {
    final token = await _storage.read(key: 'student_token');
    if (token == null) {
      Fluttertoast.showToast(msg: 'User not authenticated. Please log in.');
      setState(() => _isLoading = false);
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('$BASE_URL/api/a1-knights-students-panel/students/myinfo'),
        headers: {'Authorization': 'Bearer $token'},
      );
      print('Response status: ${response.statusCode}');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body)['student'];
        setState(() {
          _studentData = data;
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch student information: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print(stackTrace);
      setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: e.toString().replaceFirst('Exception: ', ''),
        backgroundColor: Colors.red,
      );
    }
  }

  String _getInitials(String? firstName, String? lastName) {
    final firstInitial = firstName?.isNotEmpty == true ? firstName![0].toUpperCase() : '';
    final lastInitial = lastName?.isNotEmpty == true ? lastName![0].toUpperCase() : '';
    return '$firstInitial$lastInitial';
  }

  String _formatDate(String? date) {
    if (date == null) return 'N/A';
    try {
      final parsedDate = DateTime.parse(date);
      return '${parsedDate.day}/${parsedDate.month}/${parsedDate.year}';
    } catch (e) {
      return 'N/A';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00c853)))
          : _studentData == null
          ? Center(
        child: Text(
          'No student data available.',
          style: GoogleFonts.poppins(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w500,
          ),
        ),
      )
          : CustomScrollView(
        slivers: [
          // Sticky Header
          SliverAppBar(
            pinned: true,
            expandedHeight: 250.0,
            backgroundColor: const Color(0xFFb71c1c),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFb71c1c), Color(0xFFd32f2f)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // School branding centered
                    Column(
                      children: [
                        const SizedBox(height: 40),
                        Image.asset(
                          'assets/images/ssps.png',
                          width: 140,
                          height: 140,
                          fit: BoxFit.contain,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Sure Success Point School',
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                    const Divider(color: Colors.white24, thickness: 1),
                    // Student info left-aligned
                    Padding(
                      padding: const EdgeInsets.only(left: 20),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CircleAvatar(
                            radius: 30,
                            backgroundColor: _studentData['profileImageUrl'] != null
                                ? Colors.transparent
                                : const Color(0xFF555555),
                            backgroundImage: _studentData['profileImageUrl'] != null
                                ? NetworkImage(_studentData['profileImageUrl'])
                                : null,
                            child: _studentData['profileImageUrl'] == null
                                ? Text(
                              _getInitials(
                                _studentData['firstName'],
                                _studentData['lastName'],
                              ),
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            )
                                : null,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${_studentData['firstName'] ?? 'N/A'} ${_studentData['middleName'] ?? ''} ${_studentData['lastName'] ?? 'N/A'}'
                                      .trim()
                                      .replaceAll(RegExp(r'\s+'), ' '),
                                  style: GoogleFonts.poppins(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Admission No: ${_studentData['admissionNumber']?.toString() ?? 'N/A'}',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white70,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 2),
                  ],
                ),
              ),
            ),
          ),
          // Content Sections
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Personal Details
                  _buildSection(
                    title: 'Personal Details',
                    items: [
                      {'label': 'ID', 'value': _studentData['id']?.toString() ?? 'N/A'},
                      {'label': 'Login Email', 'value': _studentData['loginEmail']?.toString() ?? 'N/A'},
                      {'label': 'Admission Number', 'value': _studentData['admissionNumber']?.toString() ?? 'N/A'},
                      {'label': 'Roll Number', 'value': _studentData['rollNumber']?.toString() ?? 'N/A'},
                      {'label': 'Aadhaar Number', 'value': _studentData['aadhaarNumber']?.toString() ?? 'N/A'},
                      {'label': 'Academic Year', 'value': _studentData['academicYear']?.toString() ?? 'N/A'},
                      {'label': 'Admitted Via Test', 'value': _studentData['admittedViaTest'] == true ? 'Yes' : 'No'},
                      {'label': 'Student Category', 'value': _studentData['studentCategory']?.toString() ?? 'N/A'},
                      {'label': 'Enrollment Mode', 'value': _studentData['enrollmentMode']?.toString() ?? 'N/A'},
                      {'label': 'Scholarship Holder', 'value': _studentData['isScholarshipHolder'] == true ? 'Yes' : 'No'},
                      {'label': 'Transport Required', 'value': _studentData['isTransportRequired'] == true ? 'Yes' : 'No'},
                      {'label': 'Class', 'value': _studentData['class']?['name']?.toString() ?? 'N/A'},
                      {'label': 'Branch', 'value': _studentData['branch']?['name']?.toString() ?? 'N/A'},
                      {'label': 'Gender', 'value': _studentData['gender']?.toString() ?? 'N/A'},
                      {'label': 'Date of Birth', 'value': _formatDate(_studentData['dateOfBirth'])},
                      {'label': 'Admission Date', 'value': _formatDate(_studentData['admissionDate'])},
                      {'label': 'Status', 'value': _studentData['status']?.toString() ?? 'N/A'},
                      {'label': 'Blood Group', 'value': _studentData['bloodGroup']?.toString() ?? 'N/A'},
                      {'label': 'Nationality', 'value': _studentData['nationality']?.toString() ?? 'N/A'},
                      {'label': 'Religion', 'value': _studentData['religion']?.toString() ?? 'N/A'},
                      {'label': 'Caste Category', 'value': _studentData['casteCategory']?.toString() ?? 'N/A'},
                      {'label': 'Dream/Aim', 'value': _studentData['dreamOrAim']?.toString() ?? 'N/A'},
                      {'label': 'Hobbies', 'value': _studentData['hobbies']?.toString() ?? 'N/A'},
                      {'label': 'Special Talents', 'value': _studentData['specialTalents']?.toString() ?? 'N/A'},
                      {'label': 'Created At', 'value': _formatDate(_studentData['createdAt'])},
                      {'label': 'Updated At', 'value': _formatDate(_studentData['updatedAt'])},
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Parent/Guardian Details
                  _buildSection(
                    title: 'Parent/Guardian Details',
                    items: [
                      {'label': 'Father\'s Name', 'value': _studentData['fatherName']?.toString() ?? 'N/A'},
                      {'label': 'Father\'s Contact', 'value': _studentData['fatherContact']?.toString() ?? 'N/A'},
                      {'label': 'Father\'s Email', 'value': _studentData['fatherEmail']?.toString() ?? 'N/A'},
                      {'label': 'Father\'s Profession', 'value': _studentData['fatherProfession']?.toString() ?? 'N/A'},
                      {'label': 'Father\'s Qualification', 'value': _studentData['fatherQualification']?.toString() ?? 'N/A'},
                      {'label': 'Father\'s Income', 'value': _studentData['fatherIncome']?.toString() ?? 'N/A'},
                      {'label': 'Mother\'s Name', 'value': _studentData['motherName']?.toString() ?? 'N/A'},
                      {'label': 'Mother\'s Contact', 'value': _studentData['motherContact']?.toString() ?? 'N/A'},
                      {'label': 'Mother\'s Email', 'value': _studentData['motherEmail']?.toString() ?? 'N/A'},
                      {'label': 'Mother\'s Profession', 'value': _studentData['motherProfession']?.toString() ?? 'N/A'},
                      {'label': 'Mother\'s Qualification', 'value': _studentData['motherQualification']?.toString() ?? 'N/A'},
                      {'label': 'Mother\'s Income', 'value': _studentData['motherIncome']?.toString() ?? 'N/A'},
                      {'label': 'Guardian\'s Name', 'value': _studentData['guardianName']?.toString() ?? 'N/A'},
                      {'label': 'Guardian\'s Relation', 'value': _studentData['guardianRelation']?.toString() ?? 'N/A'},
                      {'label': 'Guardian\'s Contact', 'value': _studentData['guardianContact']?.toString() ?? 'N/A'},
                      {'label': 'Guardian\'s Address', 'value': _studentData['guardianAddress']?.toString() ?? 'N/A'},
                      {'label': 'Emergency Contact', 'value': _studentData['emergencyContact']?.toString() ?? 'N/A'},
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Address Details
                  _buildSection(
                    title: 'Address Details',
                    items: [
                      {'label': 'Residential Address', 'value': _studentData['residentialAddress']?.toString() ?? 'N/A'},
                      {'label': 'City', 'value': _studentData['city']?.toString() ?? 'N/A'},
                      {'label': 'State', 'value': _studentData['state']?.toString() ?? 'N/A'},
                      {'label': 'Pin Code', 'value': _studentData['pinCode']?.toString() ?? 'N/A'},
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Previous School Details
                  _buildSection(
                    title: 'Previous School Details',
                    items: [
                      {'label': 'Previous School Name', 'value': _studentData['previousSchoolName']?.toString() ?? 'N/A'},
                      {'label': 'Last Exam Passed', 'value': _studentData['lastExamPassed']?.toString() ?? 'N/A'},
                      {'label': 'Last Exam Result', 'value': _studentData['lastExamResult']?.toString() ?? 'N/A'},
                      {'label': 'Previous Admission Fee', 'value': _studentData['previousAdmissionFee']?.toString() ?? 'N/A'},
                      {'label': 'Previous Monthly Fee', 'value': _studentData['previousMonthlyFee']?.toString() ?? 'N/A'},
                      {'label': 'Reason for Transfer', 'value': _studentData['reasonOfTransfer']?.toString() ?? 'N/A'},
                      {'label': 'Previous School Medium', 'value': _studentData['previousSchoolMedium']?.toString() ?? 'N/A'},
                      {'label': 'Previous School Board', 'value': _studentData['previousSchoolBoard']?.toString() ?? 'N/A'},
                      {'label': 'Previous School City', 'value': _studentData['previousSchoolCity']?.toString() ?? 'N/A'},
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Health Details
                  _buildSection(
                    title: 'Health Details',
                    items: [
                      {'label': 'Health Immunization', 'value': _studentData['healthImmunization']?.toString() ?? 'N/A'},
                      {'label': 'Preferred Language', 'value': _studentData['preferredLanguage']?.toString() ?? 'N/A'},
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({required String title, required List<Map<String, String>> items}) {
    return Card(
      color: const Color(0xFF222222),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ExpansionTile(
        title: Text(
          title,
          style: GoogleFonts.poppins(
            color: const Color(0xFF00c853),
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        collapsedBackgroundColor: const Color(0xFF222222),
        backgroundColor: const Color(0xFF222222),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 8,
              childAspectRatio: 3,
              children: items.map((item) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item['label']!,
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      item['value']!,
                      style: GoogleFonts.poppins(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
