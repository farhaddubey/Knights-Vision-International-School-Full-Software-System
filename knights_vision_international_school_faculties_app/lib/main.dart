import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';
import 'package:sure_success_point_school_faculties_app/home_shell.dart';
import 'package:sure_success_point_school_faculties_app/pages/login_page.dart';
import 'package:sure_success_point_school_faculties_app/theme_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  String _displayText1 = '';
  String _displayText2 = '';
  String _displayText3 = '';
  final String _fullText1 = 'Sure Success Point School';
  final String _fullText2 = 'Institution of';
  final String _fullText3 = 'Powered by\nKnights (KiREAD Group)';
  final List<String> _pillars = [
    'Humanism',
    'Hardwork',
    'Discipline',
    'Technology',
    '& Excellence'
  ];
  final List<Color> _pillarColors = [
    Colors.blue,
    Colors.green,
    Colors.red,
    Colors.yellow,
    Colors.purple,
  ];
  List<double> _pillarOpacities = [0.0, 0.0, 0.0, 0.0, 0.0];
  late Timer _timer;
  int _index1 = 0;
  int _index2 = 0;
  int _index3 = 0;
  bool _showText2 = false;
  bool _showPillars = false;
  bool _showText3 = false;
  int _pillarIndex = 0;
  int _remainingTime = 5;
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    )..repeat();
    _timer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      if (_index1 < _fullText1.length) {
        setState(() {
          _displayText1 = _fullText1.substring(0, _index1 + 1);
          _index1++;
        });
      } else if (!_showText2) {
        setState(() {
          _showText2 = true;
        });
      } else if (_index2 < _fullText2.length) {
        setState(() {
          _displayText2 = _fullText2.substring(0, _index2 + 1);
          _index2++;
        });
      } else if (!_showPillars) {
        setState(() {
          _showPillars = true;
        });
      } else if (_pillarIndex < _pillars.length) {
        setState(() {
          _pillarOpacities[_pillarIndex] = 1.0;
          _pillarIndex++;
        });
      } else if (!_showText3) {
        setState(() {
          _showText3 = true;
        });
      } else if (_index3 < _fullText3.length) {
        setState(() {
          _displayText3 = _fullText3.substring(0, _index3 + 1);
          _index3++;
        });
      } else {
        timer.cancel();
        _checkSessionAndNavigate();
      }
    });
  }

  Future<void> _checkSessionAndNavigate() async {
    final isAuthenticated = await context.read<ApiService>().validateSession();
    if (!mounted) return;
    Navigator.pushReplacementNamed(
        context, isAuthenticated ? '/home' : '/login');
  }

  @override
  void dispose() {
    _timer.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF212121),
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Image.asset(
                    'assets/images/ssps.png',
                    width: 150,
                    height: 150,
                  ),
                ),
                const SizedBox(height: 20),
                Center(
                  child: Text(
                    _displayText1,
                    style: GoogleFonts.poppins(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 10),
                if (_showText2)
                  Text(
                    _displayText2,
                    style: GoogleFonts.poppins(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                const SizedBox(height: 20),
                if (_showPillars)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: List.generate(_pillars.length, (index) {
                      return AnimatedOpacity(
                        opacity: _pillarOpacities[index],
                        duration: const Duration(milliseconds: 500),
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 6),
                          padding: const EdgeInsets.symmetric(
                              vertical: 10, horizontal: 16),
                          decoration: BoxDecoration(
                            color: Colors.black,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.blueAccent.withOpacity(0.3),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: Text(
                            _pillars[index],
                            style: GoogleFonts.poppins(
                              fontSize: 30 + index * 2,
                              color: _pillarColors[index],
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                const SizedBox(height: 20),
                if (_showText3)
                  Center(
                    child: Text(
                      _displayText3,
                      style: GoogleFonts.poppins(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
              ],
            ),
          ),
          if (_showText3)
            Positioned(
              bottom: 20,
              left: 0,
              right: 0,
              child: Center(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 40,
                      height: 40,
                      child: CircularProgressIndicator(
                        value: _remainingTime / 5,
                        strokeWidth: 4,
                        valueColor: const AlwaysStoppedAnimation<Color>(
                            Color(0xFF00c757)),
                        backgroundColor: Colors.white.withOpacity(0.2),
                      ),
                    ),
                    RotationTransition(
                      turns: Tween(begin: 0.0, end: 1.0).animate(_controller),
                      child: Text(
                        '$_remainingTime',
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF00c757),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        Provider(create: (_) => ApiService()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            theme: ThemeData(
              primaryColor: const Color(0xFF00c757),
              scaffoldBackgroundColor: const Color(0xFF212121),
              cardColor: const Color(0xFF181818),
              textTheme: const TextTheme(
                bodyMedium: TextStyle(color: Colors.white),
              ),
            ),
            initialRoute: '/splash',
            routes: {
              '/splash': (context) => const SplashScreen(),
              '/login': (context) => const LoginPage(),
              '/home': (context) => const HomeShell(),
            },
          );
        },
      ),
    );
  }
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}
