import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import '../api_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscureText = true;

  @override
  void initState() {
    super.initState();
    _checkSessionAndNavigate();
  }

  Future<void> _checkSessionAndNavigate() async {
    final hasActiveSession = await context.read<ApiService>().validateSession();
    if (!mounted || !hasActiveSession) return;
    Navigator.pushReplacementNamed(context, '/home');
  }

  Future<void> _login() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      Fluttertoast.showToast(
        msg: 'Please fill all fields',
        backgroundColor: Colors.red,
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await context.read<ApiService>().login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/home');
    } catch (_) {
      Fluttertoast.showToast(
        msg:
            'Unable to sign in. Verify your credentials and server connection.',
        backgroundColor: Colors.red,
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _togglePasswordVisibility() {
    setState(() => _obscureText = !_obscureText);
  }

  Future<void> _showActivationDialog() async {
    final emailController = TextEditingController(
      text: _emailController.text.trim(),
    );
    final codeController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    var obscurePasswords = true;
    var submitting = false;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF181818),
          title: Text(
            'Activate Faculty Account',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Use the one-time code issued privately by Administration. It works once and expires after seven days.',
                  style: GoogleFonts.poppins(color: Colors.white70),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  style: GoogleFonts.poppins(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Registered email / login ID',
                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                    filled: true,
                    fillColor: const Color(0xFF212121),
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: codeController,
                  style: GoogleFonts.poppins(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'One-time account code',
                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                    filled: true,
                    fillColor: const Color(0xFF212121),
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: newPasswordController,
                  obscureText: obscurePasswords,
                  style: GoogleFonts.poppins(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'New password (minimum 12 characters)',
                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                    filled: true,
                    fillColor: const Color(0xFF212121),
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscurePasswords
                            ? Icons.visibility_off
                            : Icons.visibility,
                        color: Colors.white70,
                      ),
                      onPressed: () => setDialogState(
                        () => obscurePasswords = !obscurePasswords,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: confirmPasswordController,
                  obscureText: obscurePasswords,
                  style: GoogleFonts.poppins(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Confirm new password',
                    labelStyle: GoogleFonts.poppins(color: Colors.white70),
                    filled: true,
                    fillColor: const Color(0xFF212121),
                    border: const OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: submitting
                  ? null
                  : () => Navigator.of(dialogContext).pop(),
              child: Text(
                'Cancel',
                style: GoogleFonts.poppins(color: Colors.white70),
              ),
            ),
            ElevatedButton(
              onPressed: submitting
                  ? null
                  : () async {
                      final email = emailController.text.trim();
                      final code = codeController.text.trim();
                      final password = newPasswordController.text;
                      if (email.isEmpty || code.isEmpty || password.isEmpty) {
                        Fluttertoast.showToast(
                          msg:
                              'Enter your login ID, one-time code, and new password.',
                          backgroundColor: Colors.red,
                        );
                        return;
                      }
                      if (password.length < 12) {
                        Fluttertoast.showToast(
                          msg:
                              'Use at least 12 characters for the new password.',
                          backgroundColor: Colors.red,
                        );
                        return;
                      }
                      if (password != confirmPasswordController.text) {
                        Fluttertoast.showToast(
                          msg: 'The password confirmation does not match.',
                          backgroundColor: Colors.red,
                        );
                        return;
                      }
                      setDialogState(() => submitting = true);
                      try {
                        await context.read<ApiService>().activateFacultyAccount(
                          email: email,
                          activationCode: code,
                          newPassword: password,
                        );
                        _emailController.text = email;
                        if (dialogContext.mounted) {
                          Navigator.of(dialogContext).pop();
                        }
                        Fluttertoast.showToast(
                          msg: 'Password updated. You can sign in now.',
                          backgroundColor: const Color(0xFF00c757),
                        );
                      } catch (error) {
                        Fluttertoast.showToast(
                          msg: error.toString().replaceFirst('Exception: ', ''),
                          backgroundColor: Colors.red,
                        );
                      } finally {
                        if (dialogContext.mounted) {
                          setDialogState(() => submitting = false);
                        }
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00c757),
              ),
              child: submitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.black,
                      ),
                    )
                  : Text(
                      'Set password',
                      style: GoogleFonts.poppins(color: Colors.black),
                    ),
            ),
          ],
        ),
      ),
    );

    emailController.dispose();
    codeController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF212121),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(2.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Card(
                elevation: 15,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(150),
                ),
                color: const Color(0xFF181818),
                child: SizedBox(
                  width: 250,
                  height: 250,
                  child: Padding(
                    padding: const EdgeInsets.all(1.0),
                    child: Image.asset(
                      'assets/images/ssps.png',
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Sure Success Point School',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Card(
                elevation: 5,
                color: const Color(0xFF181818),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 400),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Faculties Panel',
                          style: GoogleFonts.poppins(
                            color: Colors.red,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 20),
                        TextField(
                          controller: _emailController,
                          decoration: InputDecoration(
                            labelText: 'Email',
                            labelStyle: GoogleFonts.poppins(
                              color: Colors.white70,
                            ),
                            filled: true,
                            fillColor: const Color(0xFF181818),
                            border: const OutlineInputBorder(),
                          ),
                          style: GoogleFonts.poppins(color: Colors.white),
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _passwordController,
                          decoration: InputDecoration(
                            labelText: 'Password',
                            labelStyle: GoogleFonts.poppins(
                              color: Colors.white70,
                            ),
                            filled: true,
                            fillColor: const Color(0xFF181818),
                            border: const OutlineInputBorder(),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureText
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                                color: Colors.white70,
                              ),
                              onPressed: _togglePasswordVisibility,
                            ),
                          ),
                          style: GoogleFonts.poppins(color: Colors.white),
                          obscureText: _obscureText,
                        ),
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          child: _isLoading
                              ? const CircularProgressIndicator(
                                  color: Color(0xFF00c757),
                                )
                              : ElevatedButton(
                                  onPressed: _login,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF00c757),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 32,
                                      vertical: 14,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: Text(
                                    'Faculties Panel',
                                    style: GoogleFonts.poppins(
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                ),
                        ),
                        const SizedBox(height: 6),
                        TextButton.icon(
                          onPressed: _isLoading ? null : _showActivationDialog,
                          icon: const Icon(
                            Icons.lock_reset,
                            color: Color(0xFFc4a4ff),
                          ),
                          label: Text(
                            'Activate / reset faculty password',
                            style: GoogleFonts.poppins(
                              color: const Color(0xFFc4a4ff),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'A unit of the Knights (KiREAD) Group',
                style: GoogleFonts.poppins(color: Colors.white70, fontSize: 16),
              ),
              Text(
                'Knights International Group for Research, Education & Academic Development',
                style: GoogleFonts.poppins(color: Colors.white70, fontSize: 14),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
