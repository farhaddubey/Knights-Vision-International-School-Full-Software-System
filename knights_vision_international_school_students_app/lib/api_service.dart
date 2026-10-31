import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:jwt_decoder/jwt_decoder.dart';

import 'constants.dart';

/// A user-safe error from the SSPS API.  The message is deliberately the
/// server's public error only; tokens, request bodies and passwords are never
/// written to device logs.
class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

/// The single authenticated gateway for the Student app.
///
/// Student-scoped APIs must always obtain their identity from the bearer token.
/// Never add student, class, branch or school IDs from a mobile form to widen a
/// request's scope.
class ApiService {
  ApiService({http.Client? client, FlutterSecureStorage? storage})
      : _client = client ?? http.Client(),
        _storage = storage ?? const FlutterSecureStorage();

  static const _tokenKey = 'student_token';
  static const _requestTimeout = Duration(seconds: 15);

  final http.Client _client;
  final FlutterSecureStorage _storage;

  Uri endpoint(String path, {Map<String, String>? queryParameters}) {
    final relativePath = path.startsWith('/') ? path.substring(1) : path;
    return Uri.parse(BASE_URL)
        .resolve(relativePath)
        .replace(queryParameters: queryParameters);
  }

  Future<Map<String, dynamic>> login(String loginId, String password) async {
    final response = await _client
        .post(
          endpoint('/api/students_auth/login'),
          headers: const {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: jsonEncode({'loginId': loginId.trim(), 'password': password}),
        )
        .timeout(_requestTimeout);

    final data = _decodeObject(response);
    if (response.statusCode != 200) {
      throw _responseException(response, data);
    }

    final token = data['student_token'];
    if (token is! String || token.isEmpty) {
      throw const ApiException(
          'The school server did not return a student session.');
    }
    await _storage.write(key: _tokenKey, value: token);
    return data;
  }

  /// Activates an account exactly once using the school-issued code. The server
  /// hashes the password and erases the code after a successful activation.
  Future<void> activateAccount({
    required String admissionNumber,
    required String activationCode,
    required String newPassword,
  }) async {
    final response = await _client
        .post(
          endpoint('/api/students_auth/activate'),
          headers: const {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: jsonEncode({
            'admissionNumber': admissionNumber.trim(),
            'activationCode': activationCode.trim(),
            'newPassword': newPassword,
          }),
        )
        .timeout(_requestTimeout);
    final data = _decodeObject(response);
    if (response.statusCode != 200) {
      throw _responseException(response, data);
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final response = await authorizedPost(
      '/api/students_auth/password',
      body: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
    final data = _decodeObject(response);
    if (response.statusCode != 200) {
      throw _responseException(response, data);
    }
  }

  Future<bool> validateSession() async {
    final token = await _storage.read(key: _tokenKey);
    if (token == null || token.isEmpty) return false;

    try {
      if (JwtDecoder.isExpired(token)) {
        await logout();
        return false;
      }

      final response = await _client
          .get(
            endpoint('/api/students_auth/validate'),
            headers: _authorizationHeaders(token),
          )
          .timeout(_requestTimeout);
      if (response.statusCode == 200) return true;

      // The server is authoritative for a deleted, deactivated or revoked
      // student account.
      if (response.statusCode == 401 || response.statusCode == 403) {
        await logout();
      }
      return false;
    } on FormatException {
      await logout();
      return false;
    } on http.ClientException {
      // Keep a secure stored session during a transient network outage. It will
      // still be verified before Home is opened on the next successful request.
      return false;
    } on Exception {
      return false;
    }
  }

  Future<http.Response> authorizedGet(
    String path, {
    Map<String, String>? queryParameters,
  }) async {
    final token = await _requireToken();
    final response = await _client
        .get(
          endpoint(path, queryParameters: queryParameters),
          headers: _authorizationHeaders(token),
        )
        .timeout(_requestTimeout);
    if (response.statusCode == 401) await logout();
    return response;
  }

  Future<http.Response> authorizedPost(
    String path, {
    required Map<String, dynamic> body,
  }) async {
    final token = await _requireToken();
    final response = await _client
        .post(
          endpoint(path),
          headers: {
            ..._authorizationHeaders(token),
            'Content-Type': 'application/json',
          },
          body: jsonEncode(body),
        )
        .timeout(_requestTimeout);
    if (response.statusCode == 401) await logout();
    return response;
  }

  Future<Map<String, dynamic>> fetchUserData() async {
    final response = await authorizedGet(
      '/api/a1-knights-students-panel/students/myinfo',
    );
    final data = _decodeObject(response);
    if (response.statusCode != 200) {
      throw _responseException(response, data);
    }
    return data;
  }

  Future<void> logout() => _storage.delete(key: _tokenKey);

  Future<String> _requireToken() async {
    final token = await _storage.read(key: _tokenKey);
    if (token == null || token.isEmpty) {
      throw const ApiException(
          'Your student session has ended. Please sign in again.',
          statusCode: 401);
    }
    return token;
  }

  Map<String, String> _authorizationHeaders(String token) => {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      };

  Map<String, dynamic> _decodeObject(http.Response response) {
    if (response.body.trim().isEmpty) return <String, dynamic>{};
    try {
      final decoded = jsonDecode(response.body);
      return decoded is Map<String, dynamic>
          ? decoded
          : Map<String, dynamic>.from(decoded as Map);
    } on FormatException {
      return <String, dynamic>{};
    }
  }

  ApiException _responseException(
      http.Response response, Map<String, dynamic> data) {
    final serverMessage = data['error'] ?? data['message'];
    final message = serverMessage is String && serverMessage.trim().isNotEmpty
        ? serverMessage.trim()
        : 'The school server could not complete this request.';
    return ApiException(message, statusCode: response.statusCode);
  }
}
