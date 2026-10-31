import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';
import 'package:sure_success_point_school_faculties_app/pages/attendance_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/class_daily_homework_update_status_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/employee_wise_attendance_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/faculty_responsibilities.dart';
import 'package:sure_success_point_school_faculties_app/pages/fee_schemes_tabbar.dart';
import 'package:sure_success_point_school_faculties_app/pages/holiday_calendar_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/leave_requests_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/my_current_month_salary_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/noble_knights.dart';
import 'package:sure_success_point_school_faculties_app/pages/salary_payment_logs_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/class_bi_weekly_assignments_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/class_subject_books_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/class_punishments_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/school_sports_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/student_behaviour_logs_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/check_results_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/prayer_oath_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/add_weekly_progress_test_marks_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/knights_wb_test_preparation_page.dart';
import 'package:sure_success_point_school_faculties_app/pages/insert_semester_marks_page.dart';
import 'package:sure_success_point_school_faculties_app/theme_provider.dart';
import 'package:sure_success_point_school_faculties_app/pages/my_school_syllabus_page.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

bool _hasFacultyPermission(Set<String> permissions, String? permission) {
  return permission == null ||
      permissions.contains('*') ||
      permissions.contains(permission);
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  _HomeShellState createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _selectedIndex = 0;
  String? _userName;
  String? _userRole;
  bool _isLoading = true;
  Set<String> _permissions = const {'panel.access'};
  late BuildContext _scaffoldContext;

  List<Widget> get _pages => [
        AttendanceTabPage(permissions: _permissions),
        StudyTabPage(permissions: _permissions),
        BehaviourTabPage(permissions: _permissions),
        CurriculumTabPage(permissions: _permissions),
        PersonalTabPage(permissions: _permissions),
      ];

  final Map<String, bool> _expansionState = {
    'Students Attendance Panel': true,
    'System Study Materials': true,
    'Punishments & Report Behaviours': true,
    'Salary & Performance Management': true,
    'Curriculum & School Info': true,
  };

  final List<Map<String, dynamic>> _drawerItems = [
    {
      'title': 'Insert & View Attendance',
      'icon': Icons.event_available,
      'group': 'Students Attendance Panel',
      'permission': 'attendance.read',
      'page': () => const AttendancePage()
    },
    {
      'title': 'Leave Requests & Approvals',
      'icon': Icons.mail,
      'group': 'Students Attendance Panel',
      'permission': 'attendance.read',
      'page': () => const LeaveRequestsPage()
    },
    {
      'title': 'Institution Holiday Calendar',
      'icon': Icons.calendar_today,
      'group': 'Students Attendance Panel',
      'permission': 'school.read',
      'page': () => const HolidayCalendarPage()
    },
    {
      'title': 'Lecture & Homework Syllabus',
      'icon': Icons.school,
      'group': 'System Study Materials',
      'permission': 'homework.read',
      'page': () => const MySchoolSyllabusPage()
    },
    {
      'title': 'Update Daily Homework Status',
      'icon': Icons.assignment_late,
      'group': 'System Study Materials',
      'permission': 'homework.manage',
      'page': () => const ClassDailyHomeworkUpdateStatusPage()
    },
    {
      'title': 'Institution Assignments',
      'icon': Icons.assignment_turned_in,
      'group': 'System Study Materials',
      'permission': 'homework.read',
      'page': () => const ClassBiWeeklyAssignmentsPage()
    },
    {
      'title': 'Weekly Progress Test Marks',
      'icon': Icons.edit_note,
      'group': 'System Study Materials',
      'permission': 'exam.manage',
      'page': () => const ClassBiWeeklyTestsPage()
    },
    {
      'title': 'Knights WB Test Preparation Series',
      'icon': Icons.bookmark,
      'group': 'System Study Materials',
      'permission': 'exam.read',
      'page': () => const KnightsWbTestPreparationPage()
    },
    {
      'title': 'Insert Students Semester Marks',
      'icon': Icons.score,
      'group': 'System Study Materials',
      'permission': 'exam.manage',
      'page': () => const InsertSemesterMarksPage()
    },
    {
      'title': 'View Instructed Books',
      'icon': Icons.bookmarks,
      'group': 'System Study Materials',
      'permission': 'class.read',
      'page': () => const ClassSubjectBooksPage()
    },
    {
      'title': 'View Students Marks',
      'icon': Icons.grade,
      'group': 'System Study Materials',
      'permission': 'exam.read',
      'page': () => const CheckResultsPage()
    },
    {
      'title': 'Check Semester Results',
      'icon': Icons.check_circle,
      'group': 'System Study Materials',
      'permission': 'exam.read',
      'page': () => const CheckResultsPage()
    },
    {
      'title': 'View Punishment to Use',
      'icon': Icons.gavel,
      'group': 'Punishments & Report Behaviours',
      'permission': 'student.read',
      'page': () => const ClassPunishmentsPage()
    },
    {
      'title': 'Student Behaviour Logs',
      'icon': Icons.report,
      'group': 'Punishments & Report Behaviours',
      'permission': 'student.read',
      'page': () => const StudentBehaviourLogsPage()
    },
    {
      'title': 'My Attendance',
      'icon': Icons.person_pin,
      'group': 'Salary & Performance Management',
      'permission': 'panel.access',
      'page': () => const EmployeeWiseAttendancePage()
    },
    {
      'title': 'My Received Salary History',
      'icon': Icons.account_balance_wallet,
      'group': 'Salary & Performance Management',
      'permission': 'panel.access',
      'page': () => const SalaryPaymentLogsPage()
    },
    {
      'title': 'My Current Month Salary',
      'icon': Icons.account_balance,
      'group': 'Salary & Performance Management',
      'permission': 'panel.access',
      'page': () => const MyCurrentMonthSalaryPage()
    },
    {
      'title': 'My School Oath & Prayer',
      'icon': Icons.favorite,
      'group': 'Curriculum & School Info',
      'permission': 'panel.access',
      'page': () => const PrayerOathPage()
    },
    {
      'title': 'Sports & Competitions',
      'icon': Icons.emoji_events,
      'group': 'Wellbeing & Talent',
      'permission': 'panel.access',
      'page': () => const CompetitionsSportsPage()
    },
    {
      'title': 'Fee Structures',
      'icon': Icons.security,
      'group': 'Curriculum & School Info',
      'permission': 'panel.access',
      'page': () => const FeeSchemesTabBar()
    },
    {
      'title': 'Faculty Responsibilities',
      'icon': Icons.emergency_outlined,
      'group': 'Curriculum & School Info',
      'permission': 'panel.access',
      'page': () => const FacultyResponsibilities()
    },
    {
      'title': 'Noble Knights',
      'icon': Icons.book,
      'group': 'Curriculum & School Info',
      'permission': 'panel.access',
      'page': () => const NobleKnights()
    },
  ];

  final List<Map<String, dynamic>> _bottomNavItems = [
    {'title': 'Attendance', 'icon': Icons.event_available, 'index': 0},
    {'title': 'Study', 'icon': Icons.school, 'index': 1},
    {'title': 'Behaviour', 'icon': Icons.report, 'index': 2},
    {'title': 'Curriculums', 'icon': Icons.check_circle, 'index': 3},
    {'title': 'Personal', 'icon': Icons.account_balance_wallet, 'index': 4},
  ];

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final results = await Future.wait([
        apiService.fetchUserData(),
        apiService.fetchFacultyAuthorization(),
      ]);
      final userData = results[0];
      final authorizationResponse = results[1];
      final authorization = authorizationResponse?['authorization'];
      final serverPermissions =
          authorization is Map ? authorization['permissions'] : null;
      final permissions = serverPermissions is List
          ? serverPermissions
              .whereType<String>()
              .map((value) => value.trim())
              .where((value) => value.isNotEmpty)
              .toSet()
          : <String>{'panel.access'};
      final token = await apiService.readSessionToken();
      if (!mounted) return;
      if (token != null) {
        final decodedToken = JwtDecoder.decode(token);
        setState(() {
          _userName =
              decodedToken['name'] ?? userData?['username'] ?? 'Faculty';
          _userRole = decodedToken['role'] ?? 'Faculty';
          _permissions = permissions.isEmpty ? {'panel.access'} : permissions;
          _isLoading = false;
        });
      } else {
        setState(() {
          _userName = userData?['name'] ?? 'Faculty';
          _userRole = 'Faculty';
          _permissions = permissions.isEmpty ? {'panel.access'} : permissions;
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading user data: $e');
      if (!mounted) return;
      setState(() {
        _userName = 'Faculty';
        _userRole = 'Faculty';
        _permissions = {'panel.access'};
        _isLoading = false;
      });
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _navigateToPage(BuildContext context, Map<String, dynamic> item) {
    try {
      print('Navigating to: ${item['title']}');
      final page = item['page']();
      Navigator.push(
        _scaffoldContext,
        MaterialPageRoute(builder: (context) => page),
      ).then((_) {
        final group = item['group'];
        final groupToIndex = {
          'Students Attendance Panel': 0,
          'System Study Materials': 1,
          'Punishments & Report Behaviours': 2,
          'Curriculum & School Info': 3,
          'Salary & Performance Management': 4,
        };
        if (groupToIndex.containsKey(group)) {
          setState(() {
            _selectedIndex = groupToIndex[group]!;
          });
        }
      });
    } catch (e, stackTrace) {
      print('Error navigating to ${item['title']}: $e');
      print('Stack Trace: $stackTrace');
      Fluttertoast.showToast(
        msg: 'Error navigating: $e',
        backgroundColor: Colors.red,
      );
    }
  }

  Future<void> _logout() async {
    try {
      await context.read<ApiService>().logout();
      Fluttertoast.showToast(
        msg: 'Logged out successfully',
        backgroundColor: Colors.green,
      );
      Navigator.pushNamedAndRemoveUntil(
        context,
        '/login',
        (route) => false,
      );
    } catch (e, stackTrace) {
      print('Logout error: $e');
      print('Stack Trace: $stackTrace');
      Fluttertoast.showToast(
        msg: 'Error logging out: $e',
        backgroundColor: Colors.red,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    _scaffoldContext = context;
    final themeProvider = Provider.of<ThemeProvider>(context);
    final visibleDrawerItems = _drawerItems
        .where((item) => _hasFacultyPermission(
              _permissions,
              item['permission'] as String?,
            ))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _bottomNavItems[_selectedIndex]['title'],
          style: GoogleFonts.poppins(
              color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFFb71c1c),
        actions: [
          IconButton(
            icon: Icon(
                themeProvider.isDarkMode ? Icons.light_mode : Icons.dark_mode),
            onPressed: () {
              themeProvider.toggleTheme();
            },
            tooltip: 'Toggle Theme',
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: _logout,
            tooltip: 'Log Out',
          ),
        ],
      ),
      drawer: Drawer(
        child: Container(
          color: const Color(0xFF000000),
          child: Column(
            children: [
              DrawerHeader(
                padding: EdgeInsets.zero,
                margin: EdgeInsets.zero,
                decoration: const BoxDecoration(color: Color(0xFF000000)),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.asset(
                      'assets/images/appbar_drawer_top_bg.png',
                      fit: BoxFit.cover,
                    ),
                    Align(
                      alignment: Alignment.centerRight,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const CircleAvatar(
                              radius: 40,
                              backgroundColor: Colors.white,
                              child: Icon(Icons.person,
                                  size: 50, color: Color(0xFFb71c1c)),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _isLoading
                                  ? 'Loading...'
                                  : (_userName ?? 'Faculty'),
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              _isLoading ? '' : (_userRole ?? 'Faculty'),
                              style: GoogleFonts.poppins(
                                color: Colors.white70,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  children: [
                    for (var group in visibleDrawerItems
                        .map((item) => item['group'])
                        .toSet())
                      ExpansionTile(
                        initiallyExpanded: _expansionState[group] ?? true,
                        title: Text(
                          group,
                          style: GoogleFonts.poppins(
                            color: const Color(0xFFb71c1c),
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        onExpansionChanged: (expanded) {
                          setState(() {
                            _expansionState[group] = expanded;
                          });
                        },
                        children: visibleDrawerItems
                            .where((item) => item['group'] == group)
                            .map((item) => ListTile(
                                  leading:
                                      Icon(item['icon'], color: Colors.white),
                                  title: Text(
                                    item['title'],
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  onTap: () {
                                    print('Tapped: ${item['title']}');
                                    Navigator.pop(context);
                                    _navigateToPage(context, item);
                                    print('Navigated to: ${item['title']}');
                                  },
                                ))
                            .toList(),
                      ),
                  ],
                ),
              ),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.red),
                title: Text(
                  'Logout',
                  style: GoogleFonts.poppins(
                      color: Colors.red, fontWeight: FontWeight.w500),
                ),
                onTap: _logout,
              ),
            ],
          ),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF00c757)))
          : _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        items: _bottomNavItems
            .map((item) => BottomNavigationBarItem(
                  icon: Icon(item['icon']),
                  label: item['title'],
                ))
            .toList(),
        currentIndex: _selectedIndex,
        selectedItemColor: const Color(0xFF00c757),
        unselectedItemColor: Colors.white,
        backgroundColor: const Color(0xFF000000),
        selectedLabelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w500),
        unselectedLabelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w500),
        type: BottomNavigationBarType.fixed,
        onTap: _onItemTapped,
      ),
    );
  }
}

class FacultyActionGrid extends StatelessWidget {
  const FacultyActionGrid({
    super.key,
    required this.permissions,
    required this.items,
  });

  final Set<String> permissions;
  final List<Map<String, dynamic>> items;

  @override
  Widget build(BuildContext context) {
    final visibleItems = items
        .where((item) => _hasFacultyPermission(
              permissions,
              item['permission'] as String?,
            ))
        .toList();

    if (visibleItems.isEmpty) {
      return const Scaffold(
        backgroundColor: Color(0xFF181818),
        body: Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Text(
              'No functions are assigned to this faculty role in this section.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70, fontSize: 16),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: GridView.builder(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.2,
          ),
          itemCount: visibleItems.length,
          itemBuilder: (context, index) {
            final item = visibleItems[index];
            return GestureDetector(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => item['page']()),
              ),
              child: Card(
                color: const Color(0xFF222222),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(item['icon'],
                        size: 48, color: const Color(0xFF00c757)),
                    const SizedBox(height: 8),
                    Text(
                      item['title'],
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        textStyle:
                            const TextStyle(overflow: TextOverflow.ellipsis),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class AttendanceTabPage extends StatelessWidget {
  const AttendanceTabPage({super.key, required this.permissions});

  final Set<String> permissions;

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> items = [
      {
        'title': 'Insert & View Attendance',
        'icon': Icons.event_available,
        'permission': 'attendance.read',
        'page': () => const AttendancePage()
      },
      {
        'title': 'Leave Requests & Approvals',
        'icon': Icons.mail,
        'permission': 'attendance.read',
        'page': () => const LeaveRequestsPage()
      },
      {
        'title': 'Lecture & Homework Syllabus',
        'icon': Icons.school,
        'permission': 'homework.read',
        'page': () => const MySchoolSyllabusPage()
      },
      {
        'title': 'Update Daily Homework Status',
        'icon': Icons.assignment_late,
        'permission': 'homework.manage',
        'page': () => const ClassDailyHomeworkUpdateStatusPage()
      },
      {
        'title': 'Institution Holiday Calendar',
        'icon': Icons.calendar_today,
        'permission': 'school.read',
        'page': () => const HolidayCalendarPage()
      },
    ];
    return FacultyActionGrid(permissions: permissions, items: items);
  }
}

class StudyTabPage extends StatelessWidget {
  const StudyTabPage({super.key, required this.permissions});

  final Set<String> permissions;

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> items = [
      {
        'title': 'Institution Assignments',
        'icon': Icons.assignment_turned_in,
        'permission': 'homework.read',
        'page': () => const ClassBiWeeklyAssignmentsPage()
      },
      {
        'title': 'Progress Test Marks',
        'icon': Icons.edit_note,
        'permission': 'exam.manage',
        'page': () => const ClassBiWeeklyTestsPage()
      },
      {
        'title': 'Knights WB Board Preparation Series',
        'icon': Icons.text_snippet_rounded,
        'permission': 'exam.read',
        'page': () => const KnightsWbTestPreparationPage()
      },
      {
        'title': 'Semester Marks',
        'icon': Icons.score,
        'permission': 'exam.manage',
        'page': () => const InsertSemesterMarksPage()
      },
      {
        'title': 'Study Books',
        'icon': Icons.bookmarks,
        'permission': 'class.read',
        'page': () => const ClassSubjectBooksPage()
      },
      {
        'title': 'Check Semester Results',
        'icon': Icons.check_circle,
        'permission': 'exam.read',
        'page': () => const CheckResultsPage()
      },
    ];

    return FacultyActionGrid(permissions: permissions, items: items);
  }
}

class BehaviourTabPage extends StatelessWidget {
  const BehaviourTabPage({super.key, required this.permissions});

  final Set<String> permissions;

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> items = [
      {
        'title': 'Punishments',
        'icon': Icons.gavel,
        'permission': 'student.read',
        'page': () => const ClassPunishmentsPage()
      },
      {
        'title': 'Behaviour Logs',
        'icon': Icons.report,
        'permission': 'student.read',
        'page': () => const StudentBehaviourLogsPage()
      },
    ];

    return FacultyActionGrid(permissions: permissions, items: items);
  }
}

class CurriculumTabPage extends StatelessWidget {
  const CurriculumTabPage({super.key, required this.permissions});

  final Set<String> permissions;

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> items = [
      {
        'title': 'Oath & Prayer',
        'icon': Icons.favorite,
        'permission': 'panel.access',
        'page': () => const PrayerOathPage()
      },
      {
        'title': 'Sports & Competitions',
        'icon': Icons.emoji_events,
        'permission': 'panel.access',
        'page': () => const CompetitionsSportsPage()
      },
      {
        'title': 'Fee Structures',
        'icon': Icons.security,
        'permission': 'panel.access',
        'page': () => const FeeSchemesTabBar()
      },
      {
        'title': 'Faculty Responsibilities',
        'icon': Icons.emergency_outlined,
        'permission': 'panel.access',
        'page': () => const FacultyResponsibilities()
      },
      {
        'title': 'Noble Knights',
        'icon': Icons.book,
        'permission': 'panel.access',
        'page': () => const NobleKnights()
      },
    ];

    return FacultyActionGrid(permissions: permissions, items: items);
  }
}

class PersonalTabPage extends StatelessWidget {
  const PersonalTabPage({super.key, required this.permissions});

  final Set<String> permissions;

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> items = [
      {
        'title': 'My Attendance',
        'icon': Icons.person_pin,
        'permission': 'panel.access',
        'page': () => const EmployeeWiseAttendancePage()
      },
      {
        'title': 'Current Month Salary',
        'icon': Icons.account_balance,
        'permission': 'panel.access',
        'page': () => const MyCurrentMonthSalaryPage()
      },
      {
        'title': 'My Received Salary History',
        'icon': Icons.account_balance_wallet,
        'permission': 'panel.access',
        'page': () => const SalaryPaymentLogsPage()
      },
    ];

    return FacultyActionGrid(permissions: permissions, items: items);
  }
}
