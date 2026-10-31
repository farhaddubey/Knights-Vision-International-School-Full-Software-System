import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import 'package:sure_success_point_school_students/pages/class_biweekly_assignments_page.dart';
import 'package:sure_success_point_school_students/pages/fee_schemes_tabbar.dart';
import 'package:sure_success_point_school_students/pages/my_attendance_page.dart';
import 'package:sure_success_point_school_students/pages/my_info_page.dart';
import 'package:sure_success_point_school_students/pages/my_parent_teacher_meeting_notes_page.dart';
import 'package:sure_success_point_school_students/pages/my_requested_leaves_page.dart';
import 'package:sure_success_point_school_students/pages/my_school_syllabus_page.dart';
import 'package:sure_success_point_school_students/pages/my_weekly_test_marks_page.dart';
import 'package:sure_success_point_school_students/pages/noble_knights.dart';
import 'package:sure_success_point_school_students/pages/school_sports_page.dart';
import 'package:sure_success_point_school_students/pages/view_homework_status_page.dart';
import 'package:sure_success_point_school_students/pages/my_daily_homework_report_page.dart';
import 'package:sure_success_point_school_students/pages/my_weekly_assignment_marks_page.dart';
import 'package:sure_success_point_school_students/pages/prayer_oath_page.dart';
import 'package:sure_success_point_school_students/pages/check_results_page.dart';
import 'package:sure_success_point_school_students/pages/my_improvement_suggestions_page.dart';
import 'package:sure_success_point_school_students/pages/my_communication_logs_page.dart';
import 'package:sure_success_point_school_students/pages/my_behaviour_report_page.dart';
import 'package:sure_success_point_school_students/pages/holiday_calendar_page.dart';
import 'package:sure_success_point_school_students/pages/class_subject_books_page.dart';
import 'package:sure_success_point_school_students/pages/my_due_fees_page.dart';
import 'package:sure_success_point_school_students/pages/my_food_instructions_page.dart';
import 'package:sure_success_point_school_students/pages/my_kwbmtps_results_page.dart';
import 'package:sure_success_point_school_students/pages/semester_exam_schedule_page.dart';
import 'api_service.dart';
import 'main.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  _HomeShellState createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  final _apiService = ApiService();
  int _selectedIndex = 0;
  String? _userName;
  String? _dream;
  bool _isLoading = true;
  late BuildContext _scaffoldContext; // Store Scaffold context for navigation

  final List<Widget> _pages = [
    const PersonalAttendanceTabPage(),
    const AcademicsTabPage(),
    const PerformanceResultsTabPage(),
    const WellbeingTalentTabPage(),
    const CommunicationFinanceTabPage(),
  ];

  final Map<String, bool> _expansionState = {
    'Personal & Attendance': false,
    'Academics': false,
    'Performance & Results': false,
    'Wellbeing & Talent': false,
    'Communication & Finance': false,
  };

  final List<Map<String, dynamic>> _drawerItems = [
    {
      'title': 'My Info',
      'icon': Icons.person,
      'group': 'Personal & Attendance',
      'page': () => const MyInfoPage()
    },
    {
      'title': 'My Attendance',
      'icon': Icons.event_available,
      'group': 'Personal & Attendance',
      'page': () => const MyAttendancePage()
    },
    {
      'title': 'My Requested Leaves',
      'icon': Icons.calendar_today,
      'group': 'Personal & Attendance',
      'page': () => const MyRequestedLeavesPage()
    },
    {
      'title': 'Holiday Calendar',
      'icon': Icons.calendar_today,
      'group': 'Personal & Attendance',
      'page': () => const HolidayCalendarPage()
    },
    {
      'title': 'My School Syllabus',
      'icon': Icons.book,
      'group': 'Academics',
      'page': () => const MySchoolSyllabusPage()
    },
    {
      'title': 'View Homework Status',
      'icon': Icons.assignment,
      'group': 'Academics',
      'page': () => const ViewHomeworkStatusPage()
    },
    {
      'title': 'My Assignments',
      'icon': Icons.assignment_turned_in,
      'group': 'Academics',
      'page': () => const ClassBiWeeklyAssignmentsPage()
    },
    {
      'title': 'My Class Tests',
      'icon': Icons.quiz,
      'group': 'Academics',
      'page': () => const MyWeeklyTestMarksPage()
    },
    {
      'title': 'My KWBMTPS Tests',
      'icon': Icons.bookmark,
      'group': 'Academics',
      'page': () => const MyKWBMTPSResultsPage()
    },
    {
      'title': 'My Daily Homework Report',
      'icon': Icons.report,
      'group': 'Performance & Results',
      'page': () => const MyDailyHomeworkReportPage()
    },
    {
      'title': 'My Weekly Test Marks',
      'icon': Icons.grade,
      'group': 'Performance & Results',
      'page': () => const MyWeeklyTestMarksPage()
    },
    {
      'title': 'My Weekly Assignment Marks',
      'icon': Icons.score,
      'group': 'Performance & Results',
      'page': () => const MyWeeklyAssignmentMarksPage()
    },
    {
      'title': 'My KWBMTPS Results',
      'icon': Icons.check_circle,
      'group': 'Performance & Results',
      'page': () => const MyKWBMTPSResultsPage()
    },
    {
      'title': 'Semester Exam Dates',
      'icon': Icons.calendar_today,
      'group': 'Performance & Results',
      'page': () => const SemesterExamSchedulePage()
    },
    {
      'title': 'Check Semester Results',
      'icon': Icons.check_circle,
      'group': 'Performance & Results',
      'page': () => const CheckResultsPage()
    },
    {
      'title': 'Class Books Assigned',
      'icon': Icons.bookmarks,
      'group': 'Wellbeing & Talent',
      'page': () => const ClassSubjectBooksPage()
    },
    {
      'title': 'Foods to Boost Brain Power',
      'icon': Icons.fastfood,
      'group': 'Wellbeing & Talent',
      'page': () => const MyFoodInstructionsPage()
    },
    {
      'title': 'Sports & Competitions',
      'icon': Icons.emoji_events,
      'group': 'Wellbeing & Talent',
      'page': () => const CompetitionsSportsPage()
    },
    {
      'title': 'Behaviour Report',
      'icon': Icons.report,
      'group': 'Wellbeing & Talent',
      'page': () => const MyBehaviourReportPage()
    },
    {
      'title': 'School Oath & Prayer',
      'icon': Icons.favorite,
      'group': 'Wellbeing & Talent',
      'page': () => const PrayerOathPage()
    },
    {
      'title': 'Noble Knights',
      'icon': Icons.book,
      'group': 'Wellbeing & Talent',
      'page': () => const NobleKnights()
    },
    {
      'title': 'Institution Fee Structure',
      'icon': Icons.security,
      'group': 'Communication & Finance',
      'page': () => const FeeSchemesTabBar()
    },
    {
      'title': 'My Due Fees',
      'icon': Icons.account_balance_wallet,
      'group': 'Communication & Finance',
      'page': () => const MyDueFeesPage()
    },
    {
      'title': 'Communication Logs with School',
      'icon': Icons.message,
      'group': 'Communication & Finance',
      'page': () => const MyCommunicationLogsPage()
    },
    {
      'title': 'Parent-Teacher Meeting Notes',
      'icon': Icons.meeting_room,
      'group': 'Communication & Finance',
      'page': () => const MyParentTeacherMeetingNotesPage()
    },
    {
      'title': 'Improvement Suggestions',
      'icon': Icons.lightbulb,
      'group': 'Communication & Finance',
      'page': () => const MyImprovementSuggestionsPage()
    },
  ];

  final List<Map<String, dynamic>> _bottomNavItems = [
    {'title': 'Personal & Attendance', 'icon': Icons.person_pin, 'index': 0},
    {'title': 'Academics', 'icon': Icons.school, 'index': 1},
    {'title': 'Performance & Results', 'icon': Icons.grade, 'index': 2},
    {'title': 'Wellbeing & Talent', 'icon': Icons.favorite, 'index': 3},
    {
      'title': 'Communication & Finance',
      'icon': Icons.account_balance_wallet,
      'index': 4
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    try {
      final userData = await _apiService.fetchUserData();
      final student = userData['student'];
      if (student is! Map)
        throw const ApiException('Your student session has ended.');
      if (!mounted) return;
      setState(() {
        _userName = [
          student['firstName'],
          student['middleName'],
          student['lastName']
        ].whereType<String>().where((part) => part.trim().isNotEmpty).join(' ');
        _dream = student['dreamOrAim'] as String? ?? 'Official Personality';
        _isLoading = false;
      });
    } on ApiException catch (error) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg: error.message,
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
      if (error.statusCode == 401) await _logout();
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      Fluttertoast.showToast(
        msg:
            'Unable to contact the school server. Please check the connection.',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _navigateToPage(BuildContext context, Map<String, dynamic> item) {
    try {
      final page = item['page']();
      final group = item['group'];
      final groupToIndex = {
        'Personal & Attendance': 0,
        'Academics': 1,
        'Performance & Results': 2,
        'Wellbeing & Talent': 3,
        'Communication & Finance': 4,
      };
      Navigator.push(
        _scaffoldContext,
        MaterialPageRoute(builder: (context) => page),
      ).then((_) {
        setState(() {
          _selectedIndex = groupToIndex[group]!;
        });
      });
    } catch (_) {
      Fluttertoast.showToast(
        msg: 'Unable to open that page.',
        backgroundColor: Colors.red,
      );
    }
  }

  Future<void> _logout() async {
    try {
      await _apiService.logout();
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/login');
    } catch (_) {
      Fluttertoast.showToast(
        msg: 'Unable to complete logout. Please try again.',
        backgroundColor: Colors.red,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    _scaffoldContext = context; // Store Scaffold context
    final themeProvider = Provider.of<ThemeProvider>(context);

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
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
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
                        padding: const EdgeInsets.only(right: 16.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const CircleAvatar(
                              radius: 40,
                              backgroundColor: Colors.white,
                              child: Icon(Icons.person,
                                  size: 40, color: Color(0xFFb71c1c)),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _isLoading
                                  ? 'Loading...'
                                  : (_userName ?? 'Student'),
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _isLoading
                                  ? 'Loading...'
                                  : (_dream ?? 'AIM- Successful Personality'),
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
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
                  padding:
                      EdgeInsets.zero, // ⬅️ Removes unwanted space under header
                  children: [
                    for (var group
                        in _drawerItems.map((item) => item['group']).toSet())
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
                        children: _drawerItems
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

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> categories = [
      {'title': 'Personal & Attendance', 'icon': Icons.person_pin, 'index': 0},
      {'title': 'Academics', 'icon': Icons.school, 'index': 1},
      {'title': 'Performance & Results', 'icon': Icons.grade, 'index': 2},
      {'title': 'Wellbeing & Talent', 'icon': Icons.favorite, 'index': 3},
      {
        'title': 'Communication & Finance',
        'icon': Icons.account_balance_wallet,
        'index': 4
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const SizedBox(height: 16),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.2,
                ),
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  return GestureDetector(
                    onTap: () {
                      (context as Element)
                          .findAncestorStateOfType<_HomeShellState>()
                          ?._onItemTapped(categories[index]['index']);
                    },
                    child: Card(
                      color: const Color(0xFF222222),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            categories[index]['icon'],
                            size: 48,
                            color: const Color(0xFF00c757),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            categories[index]['title'],
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
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
          ],
        ),
      ),
    );
  }
}

class PersonalAttendanceTabPage extends StatelessWidget {
  const PersonalAttendanceTabPage({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> items = [
      {
        'title': 'My Info',
        'icon': Icons.person,
        'page': () => const MyInfoPage()
      },
      {
        'title': 'My Attendance',
        'icon': Icons.event_available,
        'page': () => const MyAttendancePage()
      },
      {
        'title': 'My Requested Leaves',
        'icon': Icons.calendar_today,
        'page': () => const MyRequestedLeavesPage()
      },
      {
        'title': 'Holiday Calendar',
        'icon': Icons.calendar_today,
        'page': () => const HolidayCalendarPage()
      },
    ];

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
          itemCount: items.length,
          itemBuilder: (context, index) {
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => items[index]['page']()),
                );
              },
              child: Card(
                color: const Color(0xFF222222),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      items[index]['icon'],
                      size: 48,
                      color: const Color(0xFF00c757),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      items[index]['title'],
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

class AcademicsTabPage extends StatelessWidget {
  const AcademicsTabPage({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> items = [
      {
        'title': 'My School Syllabus',
        'icon': Icons.book,
        'page': () => const MySchoolSyllabusPage()
      },
      {
        'title': 'View Homework Status',
        'icon': Icons.assignment,
        'page': () => const ViewHomeworkStatusPage()
      },
      {
        'title': 'My Assignments',
        'icon': Icons.assignment_turned_in,
        'page': () => const ClassBiWeeklyAssignmentsPage()
      },
      {
        'title': 'My Class Tests',
        'icon': Icons.quiz,
        'page': () => const MyWeeklyTestMarksPage()
      },
      {
        'title': 'My KWBMTPS Tests',
        'icon': Icons.bookmark,
        'page': () => const MyKWBMTPSResultsPage()
      },
    ];

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
          itemCount: items.length,
          itemBuilder: (context, index) {
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => items[index]['page']()),
                );
              },
              child: Card(
                color: const Color(0xFF222222),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      items[index]['icon'],
                      size: 48,
                      color: const Color(0xFF00c757),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      items[index]['title'],
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

class PerformanceResultsTabPage extends StatelessWidget {
  const PerformanceResultsTabPage({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> items = [
      {
        'title': 'My Daily Homework Report',
        'icon': Icons.report,
        'page': () => const MyDailyHomeworkReportPage()
      },
      {
        'title': 'My Weekly Test Marks',
        'icon': Icons.grade,
        'page': () => const MyWeeklyTestMarksPage()
      },
      {
        'title': 'My Weekly Assignment Marks',
        'icon': Icons.score,
        'page': () => const ClassBiWeeklyAssignmentsPage()
      },
      {
        'title': 'My KWBMTPS Results',
        'icon': Icons.check_circle,
        'page': () => const MyKWBMTPSResultsPage()
      },
      {
        'title': 'Semester Exam Dates',
        'icon': Icons.calendar_today,
        'page': () => const SemesterExamSchedulePage()
      },
      {
        'title': 'Check Semester Results',
        'icon': Icons.check_circle,
        'page': () => const CheckResultsPage()
      },
    ];

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
          itemCount: items.length,
          itemBuilder: (context, index) {
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => items[index]['page']()),
                );
              },
              child: Card(
                color: const Color(0xFF222222),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      items[index]['icon'],
                      size: 48,
                      color: const Color(0xFF00c757),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      items[index]['title'],
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

class WellbeingTalentTabPage extends StatelessWidget {
  const WellbeingTalentTabPage({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> items = [
      {
        'title': 'Class Books Assigned',
        'icon': Icons.bookmarks,
        'page': () => const ClassSubjectBooksPage()
      },
      {
        'title': 'Foods to Boost Brain Power',
        'icon': Icons.fastfood,
        'page': () => const MyFoodInstructionsPage()
      },
      {
        'title': '26th Jan, Institution Sports',
        'icon': Icons.emoji_events,
        'page': () => const CompetitionsSportsPage()
      },
      {
        'title': 'Behaviour Report',
        'icon': Icons.report,
        'page': () => const MyBehaviourReportPage()
      },
      {
        'title': 'Institution Fee Structure',
        'icon': Icons.security,
        'page': () => const FeeSchemesTabBar()
      },
      {
        'title': 'School Oath & Prayer',
        'icon': Icons.favorite,
        'page': () => const PrayerOathPage()
      },
      {
        'title': 'Noble Knights',
        'icon': Icons.book,
        'page': () => const NobleKnights()
      }
    ];

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
          itemCount: items.length,
          itemBuilder: (context, index) {
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => items[index]['page']()),
                );
              },
              child: Card(
                color: const Color(0xFF222222),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      items[index]['icon'],
                      size: 48,
                      color: const Color(0xFF00c757),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      items[index]['title'],
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

class CommunicationFinanceTabPage extends StatelessWidget {
  const CommunicationFinanceTabPage({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> items = [
      {
        'title': 'My Due Fees',
        'icon': Icons.account_balance_wallet,
        'page': () => const MyDueFeesPage()
      },
      {
        'title': 'Communication Logs with School',
        'icon': Icons.message,
        'page': () => const MyCommunicationLogsPage()
      },
      {
        'title': 'Parent-Teacher Meeting Notes',
        'icon': Icons.meeting_room,
        'page': () => const MyParentTeacherMeetingNotesPage()
      },
      {
        'title': 'Improvement Suggestions',
        'icon': Icons.lightbulb,
        'page': () => const MyImprovementSuggestionsPage()
      },
    ];

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
          itemCount: items.length,
          itemBuilder: (context, index) {
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => items[index]['page']()),
                );
              },
              child: Card(
                color: const Color(0xFF222222),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      items[index]['icon'],
                      size: 48,
                      color: const Color(0xFF00c757),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      items[index]['title'],
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

class PlaceholderPage extends StatelessWidget {
  final String title;
  const PlaceholderPage({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        title: Text(
          title,
          style: GoogleFonts.poppins(
              color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFFb71c1c),
      ),
      body: Center(
        child: Text(
          '$title\nInstitution tracking all those infos secretly & keeping a sharp record on you. '
          'So have respectful manner, not to face any consequences, suspend or ban.',
          style: GoogleFonts.poppins(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
