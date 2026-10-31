// constants.dart
import 'dart:ui';

/// Production traffic always uses the school domain unless a developer
/// explicitly supplies a local/staging value at build or run time.
///
/// Local Android-emulator example:
/// `flutter run --dart-define=SSPS_API_BASE_URL=http://10.0.2.2:3000`
///
/// A release build must use HTTPS. Do not replace this with a local address.
/// A local or staging address can be supplied with [SSPS_API_BASE_URL].
/// Otherwise every app build talks to the secure production API.
final String BASE_URL = 'https://suresuccesspoint.com';
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
