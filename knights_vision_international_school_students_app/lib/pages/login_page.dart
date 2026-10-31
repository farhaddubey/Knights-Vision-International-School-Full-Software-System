import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';

import '../api_service.dart';
import '../constants.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _loginIdController = TextEditingController();
  final _passwordController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isLoading = false;
  bool _obscureText = true;

  @override
  void initState() {
    super.initState();
    _checkSessionAndNavigate();
  }

  Future<void> _checkSessionAndNavigate() async {
    final isSessionValid = await _apiService.validateSession();
    if (!mounted || !isSessionValid) return;
    Navigator.pushReplacementNamed(context, '/home');
  }

  Future<void> _login() async {
    final loginId = _loginIdController.text.trim();
    final password = _passwordController.text;
    if (loginId.isEmpty || password.isEmpty) {
      _showMessage('Enter your admission number or school email and password.');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _apiService.login(loginId, password);
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/home');
    } on ApiException catch (error) {
      if (!mounted) return;
      _showMessage(error.message);
    } catch (_) {
      if (!mounted) return;
      _showMessage(
          'Unable to contact the school server. Check the internet connection and try again.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _openActivation() async {
    final activatedCredentials = await showDialog<_ActivatedCredentials>(
      context: context,
      builder: (_) => const _StudentActivationDialog(),
    );
    if (!mounted || activatedCredentials == null) return;

    setState(() {
      _loginIdController.text = activatedCredentials.admissionNumber;
      _passwordController.text = activatedCredentials.password;
    });
    _showMessage(
        'Account activated. Your admission number and new password are ready to sign in.');
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF212121),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Card(
                elevation: 15,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(150)),
                color: Theme.of(context).cardColor,
                child: SizedBox(
                  width: 220,
                  height: 220,
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: Image.asset('assets/images/ssps.png',
                        fit: BoxFit.contain),
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
                color: Theme.of(context).cardColor,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 400),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Student Login',
                          style: GoogleFonts.poppins(
                            color: Colors.red,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                        const SizedBox(height: 20),
                        TextField(
                          controller: _loginIdController,
                          enabled: !_isLoading,
                          decoration: _inputDecoration(
                              'Admission Number or School Email'),
                          style: GoogleFonts.poppins(color: Colors.white),
                          keyboardType: TextInputType.text,
                          textInputAction: TextInputAction.next,
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _passwordController,
                          enabled: !_isLoading,
                          onSubmitted: (_) => _isLoading ? null : _login(),
                          decoration: _inputDecoration('Password').copyWith(
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureText
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                                color: Colors.white70,
                              ),
                              onPressed: () =>
                                  setState(() => _obscureText = !_obscureText),
                            ),
                          ),
                          style: GoogleFonts.poppins(color: Colors.white),
                          obscureText: _obscureText,
                          textInputAction: TextInputAction.done,
                        ),
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          child: _isLoading
                              ? const SpinKitCircle(color: Colors.green)
                              : ElevatedButton(
                                  onPressed: _login,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF3498db),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 32, vertical: 14),
                                    shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8)),
                                  ),
                                  child: Text('Log In',
                                      style: GoogleFonts.poppins(
                                          color: Colors.white, fontSize: 16)),
                                ),
                        ),
                        const SizedBox(height: 8),
                        TextButton.icon(
                          onPressed: _isLoading ? null : _openActivation,
                          icon: const Icon(Icons.lock_reset,
                              color: Color(0xFF74d99f)),
                          label: Text(
                            'First time here? Activate account',
                            style: GoogleFonts.poppins(
                                color: const Color(0xFF74d99f)),
                          ),
                        ),
                        Text(
                          'Use the one-time activation code issued by the school.',
                          style: GoogleFonts.poppins(
                              color: Colors.white60, fontSize: 12),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text('A unit of the Knights (KiREAD) Group',
                  style:
                      GoogleFonts.poppins(color: Colors.white70, fontSize: 16)),
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

  InputDecoration _inputDecoration(String label) => InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.poppins(color: Colors.white70),
        filled: true,
        fillColor: const Color(0xFF181818),
        border: const OutlineInputBorder(),
      );

  @override
  void dispose() {
    _loginIdController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}

class _ActivatedCredentials {
  const _ActivatedCredentials(this.admissionNumber, this.password);

  final String admissionNumber;
  final String password;
}

class _StudentActivationDialog extends StatefulWidget {
  const _StudentActivationDialog();

  @override
  State<_StudentActivationDialog> createState() =>
      _StudentActivationDialogState();
}

class _StudentActivationDialogState extends State<_StudentActivationDialog> {
  final _admissionController = TextEditingController();
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _apiService = ApiService();
  bool _isSubmitting = false;
  bool _hidePassword = true;

  Future<void> _activate() async {
    final admissionNumber = _admissionController.text.trim();
    final activationCode = _codeController.text.trim();
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;
    if (admissionNumber.isEmpty ||
        activationCode.isEmpty ||
        password.isEmpty ||
        confirmPassword.isEmpty) {
      _showError('Complete every field to activate or reset the account.');
      return;
    }
    if (password.length < 12) {
      _showError('Choose a password with at least 12 characters.');
      return;
    }
    if (password != confirmPassword) {
      _showError('The two password entries do not match.');
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      await _apiService.activateAccount(
        admissionNumber: admissionNumber,
        activationCode: activationCode,
        newPassword: password,
      );
      if (!mounted) return;
      Navigator.of(context)
          .pop(_ActivatedCredentials(admissionNumber, password));
    } on ApiException catch (error) {
      if (mounted) _showError(error.message);
    } catch (_) {
      if (mounted) {
        _showError(
            'Cannot reach the school server at $BASE_URL. Confirm the server is running and the Student App API address is correct.');
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF212121),
       title: Text('Activate or Reset Student Account',
          style: GoogleFonts.poppins(
              color: Colors.white, fontWeight: FontWeight.w600)),
      content: SingleChildScrollView(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                 'Enter the one-time code issued by the school. It can be used once to set a first or replacement password.',
                style: GoogleFonts.poppins(color: Colors.white70, fontSize: 13),
              ),
              const SizedBox(height: 16),
              _field(_admissionController, 'Admission Number',
                  textInputAction: TextInputAction.next),
              const SizedBox(height: 12),
               _field(_codeController, 'One-time Account Code',
                  textInputAction: TextInputAction.next),
              const SizedBox(height: 12),
              _field(
                  _passwordController, 'New Password (minimum 12 characters)',
                  obscureText: _hidePassword,
                  textInputAction: TextInputAction.next),
              const SizedBox(height: 12),
              _field(
                _confirmPasswordController,
                'Confirm New Password',
                obscureText: _hidePassword,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _isSubmitting ? null : _activate(),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: () =>
                      setState(() => _hidePassword = !_hidePassword),
                  icon: Icon(
                      _hidePassword ? Icons.visibility : Icons.visibility_off,
                      color: const Color(0xFF74d99f)),
                  label: Text(
                      _hidePassword ? 'Show passwords' : 'Hide passwords',
                      style:
                          GoogleFonts.poppins(color: const Color(0xFF74d99f))),
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
          child:
              Text('Cancel', style: GoogleFonts.poppins(color: Colors.white70)),
        ),
        ElevatedButton(
          onPressed: _isSubmitting ? null : _activate,
          style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF218c4c)),
          child: _isSubmitting
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Colors.white))
              : Text('Activate',
                  style: GoogleFonts.poppins(color: Colors.white)),
        ),
      ],
    );
  }

  Widget _field(
    TextEditingController controller,
    String label, {
    bool obscureText = false,
    TextInputAction? textInputAction,
    ValueChanged<String>? onSubmitted,
  }) {
    return TextField(
      controller: controller,
      enabled: !_isSubmitting,
      obscureText: obscureText,
      textInputAction: textInputAction,
      onSubmitted: onSubmitted,
      style: GoogleFonts.poppins(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.poppins(color: Colors.white70),
        filled: true,
        fillColor: const Color(0xFF181818),
        border: const OutlineInputBorder(),
      ),
    );
  }

  @override
  void dispose() {
    _admissionController.dispose();
    _codeController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
}
