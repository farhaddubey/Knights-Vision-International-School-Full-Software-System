// constants.dart
import 'dart:ui';

/// Production traffic uses the school domain unless a developer explicitly
/// supplies a local or staging value at build/run time.
///
/// Example local Android-emulator override:
/// `flutter run --dart-define=SSPS_API_BASE_URL=http://10.0.2.2:3000`
final String BASE_URL = "https://suresuccesspoint.com";
// const String _productionBaseUrl = 'https://suresuccesspoint.com';
//
// String _resolveApiBaseUrl() {
//   const configuredUrl = String.fromEnvironment('SSPS_API_BASE_URL');
//   if (configuredUrl.isNotEmpty) {
//     return configuredUrl.replaceFirst(RegExp(r'/$'), '');
//   }
//
//   return _productionBaseUrl;
// }

// Colors
const Color DARK_BACKGROUND = Color(0xFF121212);
const Color CARD_COLOR_DARK = Color(0xFF1E1E1E);
const Color PRIMARY_COLOR = Color(0xFF00E676);
const Color ACCENT_COLOR = Color(0xFF3498DB);
const Color TEXT_COLOR = Color(0xFF90CAF9);
const Color HEADER_TEXT_COLOR = Color(0xFFE0E0E0);
const Color ERROR_COLOR = Color(0xFFB71C1C);
const Color REFRESH_COLOR = Color(0xFF00C853);
const Color PAYMENT_COLOR = Color(0xFF4CAF50);
const Color MODE_COLOR = Color(0xFFFFD54F);
const Color ATTENDANCE_COLOR = Color(0xFF004D40);
