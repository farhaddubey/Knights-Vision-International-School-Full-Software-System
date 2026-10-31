import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  String _displayText1 = '';
  String _displayText2 = '';
  final String _fullText1 = 'Sure Success Point School';
  final String _fullText2 = 'Next Institution of Humanism Hardwork Discipline Technology & Excellence';
  late Timer _timer;
  int _index1 = 0;
  int _index2 = 0;
  bool _showSecondText = false;

  @override
  void initState() {
    super.initState();
    // Start typing animation for first text
    _timer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      if (_index1 < _fullText1.length) {
        setState(() {
          _displayText1 = _fullText1.substring(0, _index1 + 1);
          _index1++;
        });
      } else if (!_showSecondText) {
        // Start second text after first is complete
        setState(() {
          _showSecondText = true;
        });
      } else if (_index2 < _fullText2.length) {
        setState(() {
          _displayText2 = _fullText2.substring(0, _index2 + 1);
          _index2++;
        });
      } else {
        // Both texts complete, wait 1 second, then navigate
        timer.cancel();
        Future.delayed(const Duration(seconds: 1), () {
          FlutterNativeSplash.remove(); // Remove native splash
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const MainApp()),
          );
        });
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // Matches native splash background
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            Image.asset(
              'assets/images/ssps.png',
              width: 150, // Adjust size as needed
              height: 150,
            ),
            const SizedBox(height: 20),
            // First animated text
            Text(
              _displayText1,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            // Second animated text (visible after first completes)
            if (_showSecondText)
              Text(
                _displayText2,
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.black54,
                ),
                textAlign: TextAlign.center,
              ),
          ],
        ),
      ),
    );
  }
}

// Placeholder for your main app
class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: Text('Welcome to Sure Success Point School'),
        ),
      ),
    );
  }
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MaterialApp(home: SplashScreen()));
}