import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:flutter/foundation.dart' show kDebugMode;
import 'constants.dart';

class ApiService {
  static const facultyTokenKey = 'faculty_token';
  // Existing faculty pages still read this key directly. Keep it during the
  // migration so the updated sign-in flow does not break those pages.
  static const legacyTokenKey = 'token';

  final _storage = const FlutterSecureStorage();
  final client = http.Client();

  Future<String?> readSessionToken() async {
    return await _storage.read(key: facultyTokenKey) ??
        await _storage.read(key: legacyTokenKey);
  }

  Future<void> _storeSessionToken(String token) async {
    await _storage.write(key: facultyTokenKey, value: token);
    await _storage.write(key: legacyTokenKey, value: token);
  }

  Future<void> clearSession() async {
    await _storage.delete(key: facultyTokenKey);
    await _storage.delete(key: legacyTokenKey);
  }

  Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$BASE_URL/api-schools-panel/auth/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        String? token =
            data['faculties_token'] ??
            data['token'] ??
            data['access_token'] ??
            data['jwt'] ??
            data['auth_token'];
        if (token != null) {
          await _storeSessionToken(token);
          return data;
        } else {
          throw Exception('The server did not return a faculty session.');
        }
      } else {
        throw Exception(
          'Sign-in was not accepted. Please verify your credentials.',
        );
      }
    } catch (_) {
      throw Exception(
        'Unable to sign in right now. Please check the server address and try again.',
      );
    }
  }

  /// Completes either first activation or a password-recovery flow using an
  /// Administration-issued, single-use code. The previous password is never
  /// read or exposed by the client or server.
  Future<void> activateFacultyAccount({
    required String email,
    required String activationCode,
    required String newPassword,
  }) async {
    final response = await http
        .post(
          Uri.parse('$BASE_URL/api/faculties_auth/activate'),
          headers: const {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: jsonEncode({
            'email': email.trim(),
            'activationCode': activationCode.trim(),
            'newPassword': newPassword,
          }),
        )
        .timeout(const Duration(seconds: 15));

    Map<String, dynamic> body = {};
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) body = decoded;
    } catch (_) {
      // The public message below intentionally avoids exposing response data.
    }
    if (response.statusCode != 200) {
      throw Exception(body['error'] ?? 'Unable to activate this account.');
    }
  }

  Future<bool> validateSession() async {
    final token = await readSessionToken();
    if (token == null) {
      return false;
    }

    try {
      if (JwtDecoder.isExpired(token)) {
        await clearSession();
        return false;
      }
    } catch (_) {
      await clearSession();
      return false;
    }

    try {
      final response = await http
          .get(
            Uri.parse('$BASE_URL/api-schools-panel/auth/validate'),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) return true;
      if (response.statusCode == 401 || response.statusCode == 403) {
        await clearSession();
        return false;
      }
      // A temporary server failure must not silently sign a faculty member
      // out. The signed token remains authoritative and has its own expiry.
      return true;
    } on TimeoutException {
      return true;
    } on http.ClientException {
      return true;
    } catch (_) {
      return true;
    }
  }

  /// Returns the live Faculty authorization snapshot used to keep the mobile
  /// navigation aligned with server-side RBAC. The server remains authoritative
  /// for every API request; this only prevents offering obvious dead-end tiles.
  Future<Map<String, dynamic>?> fetchFacultyAuthorization() async {
    final token = await readSessionToken();
    if (token == null || token.isEmpty) return null;

    try {
      final response = await http
          .get(
            Uri.parse('$BASE_URL/api-schools-panel/auth/validate'),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode != 200) return null;
      final decoded = jsonDecode(response.body);
      return decoded is Map<String, dynamic>
          ? decoded
          : Map<String, dynamic>.from(decoded as Map);
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>?> fetchUserData() async {
    final token = await readSessionToken();
    if (token == null) {
      if (kDebugMode) print('No token found for user data');
      return null;
    }

    try {
      final decoded = JwtDecoder.decode(token);
      final userId = decoded['id'] ?? decoded['userId'] ?? decoded['sub'];
      if (userId == null) {
        if (kDebugMode) print('No user ID found in token: $decoded');
        return null;
      }

      final response = await client
          .get(
            Uri.parse('$BASE_URL/api-schools-panel/users/$userId'),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch User Data Request URL: $BASE_URL/api-schools-panel/users/$userId',
        );
        print('Fetch User Data Response Status: ${response.statusCode}');
        print('Fetch User Data Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return null;
      }
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch user data error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  // Add other methods (fetchAttendanceData, updateAttendance, etc.) as in previous response
  Future<Map<String, dynamic>?> fetchAttendanceData(
    int page,
    int pageSize,
  ) async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for attendance data');
      return null;
    }

    try {
      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/attendance/fetch-attendance?page=$page&pageSize=$pageSize',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Attendance Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/attendance/fetch-attendance?page=$page&pageSize=$pageSize',
        );
        print('Fetch Attendance Response Status: ${response.statusCode}');
        print('Fetch Attendance Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch attendance data error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<bool> updateAttendance(Map<String, dynamic> payload) async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for updating attendance');
      return false;
    }

    try {
      final response = await client
          .post(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/attendance',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Update Attendance Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/attendance',
        );
        print('Update Attendance Response Status: ${response.statusCode}');
        print('Update Attendance Response Body: ${response.body}');
      }

      return response.statusCode == 200;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Update attendance error: $e');
        print('Stack Trace: $stackTrace');
      }
      return false;
    }
  }

  Future<List<dynamic>?> fetchAttendanceHistory(
    String className,
    int studentId,
    String month,
  ) async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for attendance history');
      return null;
    }

    try {
      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/attendance/$className/history/$studentId?month=$month',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Attendance History Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/attendance/$className/history/$studentId?month=$month',
        );
        print(
          'Fetch Attendance History Response Status: ${response.statusCode}',
        );
        print('Fetch Attendance History Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['attendanceRecords'] as List<dynamic>?;
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch attendance history error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<Map<String, dynamic>?> fetchLeaveRequests(
    int page,
    int pageSize,
    String status,
  ) async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for leave requests');
      return null;
    }

    try {
      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/leave-requests?page=$page&pageSize=$pageSize&status=$status',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Leave Requests Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/leave-requests?page=$page&pageSize=$pageSize&status=$status',
        );
        print('Fetch Leave Requests Response Status: ${response.statusCode}');
        print('Fetch Leave Requests Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch leave requests error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<bool> updateLeaveRequest(int requestId, bool approved) async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for updating leave request');
      return false;
    }

    try {
      final response = await client
          .patch(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/leave-requests/$requestId',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: jsonEncode({'approved': approved}),
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Update Leave Request Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/leave-requests/$requestId',
        );
        print('Update Leave Request Response Status: ${response.statusCode}');
        print('Update Leave Request Response Body: ${response.body}');
      }

      return response.statusCode == 200;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Update leave request error: $e');
        print('Stack Trace: $stackTrace');
      }
      return false;
    }
  }

  Future<List<dynamic>?> fetchSalaryLogs() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for salary logs');
      return null;
    }

    try {
      final decoded = JwtDecoder.decode(token);
      final userId = decoded['id'] ?? decoded['userId'] ?? decoded['sub'];
      if (userId == null) {
        if (kDebugMode) print('No user ID found in token for salary logs');
        return null;
      }

      final response = await client
          .get(
            Uri.parse('$BASE_URL/api-schools-panel/teachers/salary-logs'),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Salary Logs Request URL: $BASE_URL/api-schools-panel/teachers/salary-logs',
        );
        print('Fetch Salary Logs Response Status: ${response.statusCode}');
        print('Fetch Salary Logs Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['paymentLogs'] as List<dynamic>?)
            ?.map(
              (item) => {
                'id': item['id'] ?? item.hashCode,
                'paidAmount': double.parse(
                  item['paidAmount']?.toString() ?? '0',
                ).toStringAsFixed(2),
                'paidOn': item['paidOn'] != null
                    ? DateTime.parse(item['paidOn']).toLocal().toString()
                    : 'N/A',
                'paymentMode': item['paymentMode'] ?? 'Unknown',
                'note': item['note'] ?? 'No remarks',
                'paidByUserId': item['paidByUserId']?.toString() ?? 'N/A',
                'createdAt': item['createdAt'] != null
                    ? DateTime.parse(item['createdAt']).toLocal().toString()
                    : 'Not recorded',
                'updatedAt': item['updatedAt'] != null
                    ? DateTime.parse(item['updatedAt']).toLocal().toString()
                    : 'Not updated',
              },
            )
            .toList();
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch salary logs error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<List<dynamic>?> fetchTeacherAttendance() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for teacher attendance');
      return null;
    }

    try {
      final decoded = JwtDecoder.decode(token);
      final userId = decoded['id'] ?? decoded['userId'] ?? decoded['sub'];
      if (userId == null) {
        if (kDebugMode)
          print('No user ID found in token for teacher attendance');
        return null;
      }

      final response = await client
          .get(
            Uri.parse('$BASE_URL/api-schools-panel/teachers/attendance'),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Teacher Attendance Request URL: $BASE_URL/api-schools-panel/teachers/attendance',
        );
        print(
          'Fetch Teacher Attendance Response Status: ${response.statusCode}',
        );
        print('Fetch Teacher Attendance Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['attendance'] as List<dynamic>?)
            ?.map(
              (log) => {
                'id': log['id'] ?? null,
                'date': log['date'] != null
                    ? DateTime.parse(
                        log['date'],
                      ).toLocal().toString().split(' ')[0]
                    : 'N/A',
                'status': log['status'] ?? 'N/A',
              },
            )
            .toList();
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch teacher attendance error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<Map<String, dynamic>?> fetchCurrentMonthSalary() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for current month salary');
      return null;
    }

    try {
      final decoded = JwtDecoder.decode(token);
      final userId = decoded['id'] ?? decoded['userId'] ?? decoded['sub'];
      if (userId == null) {
        if (kDebugMode)
          print('No user ID found in token for current month salary');
        return null;
      }

      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/teachers/current-month-salary',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Current Month Salary Request URL: $BASE_URL/api-schools-panel/teachers/current-month-salary',
        );
        print(
          'Fetch Current Month Salary Response Status: ${response.statusCode}',
        );
        print('Fetch Current Month Salary Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch current month salary error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<List<dynamic>?> fetchHomework() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for homework');
      return null;
    }

    try {
      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/homework',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Homework Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/homework',
        );
        print('Fetch Homework Response Status: ${response.statusCode}');
        print('Fetch Homework Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['homework'] as List<dynamic>?)
            ?.map(
              (item) => {
                'id': item['id'] ?? item.hashCode,
                'subject': item['subject'] ?? 'N/A',
                'status': item['status'] ?? 'N/A',
                'date': item['date'] != null
                    ? DateTime.parse(item['date']).toLocal().toString()
                    : 'N/A',
              },
            )
            .toList();
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch homework error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<List<dynamic>?> fetchAssignments() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for assignments');
      return null;
    }

    try {
      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/assignments',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Assignments Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/assignments',
        );
        print('Fetch Assignments Response Status: ${response.statusCode}');
        print('Fetch Assignments Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['assignments'] as List<dynamic>?)
            ?.map(
              (item) => {
                'id': item['id'] ?? item.hashCode,
                'title': item['title'] ?? 'N/A',
                'dueDate': item['dueDate'] != null
                    ? DateTime.parse(item['dueDate']).toLocal().toString()
                    : 'N/A',
              },
            )
            .toList();
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch assignments error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<List<dynamic>?> fetchTestMarks() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for test marks');
      return null;
    }

    try {
      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/test-marks',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Test Marks Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/test-marks',
        );
        print('Fetch Test Marks Response Status: ${response.statusCode}');
        print('Fetch Test Marks Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['testMarks'] as List<dynamic>?)
            ?.map(
              (item) => {
                'id': item['id'] ?? item.hashCode,
                'testName': item['testName'] ?? 'N/A',
                'marks': item['marks']?.toString() ?? 'N/A',
              },
            )
            .toList();
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch test marks error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<List<dynamic>?> fetchSemesterResults() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for semester results');
      return null;
    }

    try {
      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/semester-results',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Semester Results Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/semester-results',
        );
        print('Fetch Semester Results Response Status: ${response.statusCode}');
        print('Fetch Semester Results Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['semesterResults'] as List<dynamic>?)
            ?.map(
              (item) => {
                'id': item['id'] ?? item.hashCode,
                'semester': item['semester'] ?? 'N/A',
                'marks': item['marks']?.toString() ?? 'N/A',
              },
            )
            .toList();
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch semester results error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<List<dynamic>?> fetchResources() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for resources');
      return null;
    }

    try {
      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/resources',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Resources Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/resources',
        );
        print('Fetch Resources Response Status: ${response.statusCode}');
        print('Fetch Resources Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['resources'] as List<dynamic>?)
            ?.map(
              (item) => {
                'id': item['id'] ?? item.hashCode,
                'title': item['title'] ?? 'N/A',
                'type': item['type'] ?? 'N/A',
              },
            )
            .toList();
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch resources error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<List<dynamic>?> fetchPunishments() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for punishments');
      return null;
    }

    try {
      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/punishments',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Punishments Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/punishments',
        );
        print('Fetch Punishments Response Status: ${response.statusCode}');
        print('Fetch Punishments Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['punishments'] as List<dynamic>?)
            ?.map(
              (item) => {
                'id': item['id'] ?? item.hashCode,
                'incident': item['incident'] ?? 'N/A',
                'date': item['date'] != null
                    ? DateTime.parse(item['date']).toLocal().toString()
                    : 'N/A',
              },
            )
            .toList();
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch punishments error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<List<dynamic>?> fetchBehaviourLogs() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for behaviour logs');
      return null;
    }

    try {
      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/behaviour-logs',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Behaviour Logs Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/behaviour-logs',
        );
        print('Fetch Behaviour Logs Response Status: ${response.statusCode}');
        print('Fetch Behaviour Logs Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['behaviourLogs'] as List<dynamic>?)
            ?.map(
              (item) => {
                'id': item['id'] ?? item.hashCode,
                'description': item['description'] ?? 'N/A',
                'date': item['date'] != null
                    ? DateTime.parse(item['date']).toLocal().toString()
                    : 'N/A',
              },
            )
            .toList();
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch behaviour logs error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<List<dynamic>?> fetchOathPrayers() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      if (kDebugMode) print('No token found for oath prayers');
      return null;
    }

    try {
      final response = await client
          .get(
            Uri.parse(
              '$BASE_URL/api-schools-panel/class_teachers_panel/oath-prayers',
            ),
            headers: {
              'Authorization': 'Bearer $token',
              'Accept': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (kDebugMode) {
        print(
          'Fetch Oath Prayers Request URL: $BASE_URL/api-schools-panel/class_teachers_panel/oath-prayers',
        );
        print('Fetch Oath Prayers Response Status: ${response.statusCode}');
        print('Fetch Oath Prayers Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['oathPrayers'] as List<dynamic>?)
            ?.map(
              (item) => {
                'id': item['id'] ?? item.hashCode,
                'title': item['title'] ?? 'N/A',
                'date': item['date'] != null
                    ? DateTime.parse(item['date']).toLocal().toString()
                    : 'N/A',
              },
            )
            .toList();
      }
      return null;
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Fetch oath prayers error: $e');
        print('Stack Trace: $stackTrace');
      }
      return null;
    }
  }

  Future<void> logout() async {
    try {
      await clearSession();
      if (kDebugMode) print('Faculty session cleared');
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Logout error: $e');
        print('Stack Trace: $stackTrace');
      }
    }
  }

  Future<bool> isTokenExpired() async {
    final token = await readSessionToken();
    if (token == null) {
      if (kDebugMode) print('No token found for expiration check');
      return true;
    }
    try {
      return JwtDecoder.isExpired(token);
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('Token expiration check error: $e');
        print('Stack Trace: $stackTrace');
      }
      return true;
    }
  }

  Future<Map<String, dynamic>?> fetchClassSubjects(
    int page,
    int pageSize,
  ) async {
    final token = await _storage.read(key: 'token');
    if (token == null) throw Exception('User not authenticated');

    final response = await http.get(
      Uri.parse(
        '$BASE_URL/api-schools-panel/class_teachers_panel/class-subjects?page=$page&pageSize=$pageSize',
      ),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to fetch class subjects: ${response.body}');
  }

  Future<List<dynamic>?> fetchSyllabusSchedules(int classSubjectId) async {
    final token = await _storage.read(key: 'token');
    if (token == null) throw Exception('User not authenticated');

    final response = await http.get(
      Uri.parse(
        '$BASE_URL/api-schools-panel/class_teachers_panel/SyllabusScheduleDailyPlan/syllabus-schedule?classSubjectId=$classSubjectId',
      ),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['schedules'];
    }
    throw Exception('Failed to fetch syllabus schedules');
  }

  Future<List<dynamic>?> fetchSyllabusTopics(int classSubjectId) async {
    final token = await _storage.read(key: 'token');
    if (token == null) throw Exception('User not authenticated');

    final response = await http.get(
      Uri.parse(
        '$BASE_URL/api-schools-panel/class_teachers_panel/SyllabusScheduleDailyPlan/subject-syllabus/$classSubjectId',
      ),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['topics'];
    }
    throw Exception('Failed to fetch syllabus topics');
  }

  Future<bool> markSyllabusTopicAsCompleted(int id) async {
    final token = await _storage.read(key: 'token');
    if (token == null) throw Exception('User not authenticated');

    final response = await http.post(
      Uri.parse(
        '$BASE_URL/api-schools-panel/class_teachers_panel/SubjectSyllabus/completed/$id',
      ),
      headers: {'Authorization': 'Bearer $token'},
    );

    return response.statusCode == 200;
  }

  Future<bool> markSyllabusScheduleAsCompleted(int id) async {
    final token = await _storage.read(key: 'token');
    if (token == null) throw Exception('User not authenticated');

    final response = await http.post(
      Uri.parse(
        '$BASE_URL/api-schools-panel/class_teachers_panel/SyllabusScheduleDailyPlan/completed/$id',
      ),
      headers: {'Authorization': 'Bearer $token'},
    );

    return response.statusCode == 200;
  }

  Future<List<dynamic>?> fetchStudents(int classId) async {
    final token = await _storage.read(key: 'token');
    if (token == null) throw Exception('User not authenticated');

    final response = await http.get(
      Uri.parse(
        '$BASE_URL/api-schools-panel/class_teachers_panel/students/$classId',
      ),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['students'];
    }
    throw Exception('Failed to fetch students');
  }

  Future<Map<int, String>?> fetchHomeworkStatuses(
    int classSubjectId,
    List<dynamic> students,
    String date,
  ) async {
    final token = await _storage.read(key: 'token');
    if (token == null) throw Exception('User not authenticated');

    final statuses = <int, String>{};
    for (var student in students) {
      final response = await http.get(
        Uri.parse(
          '$BASE_URL/api-schools-panel/class_teachers_panel/homework/status/$classSubjectId/${student['id']}?date=$date',
        ),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final record = jsonDecode(response.body)['homeworkRecords']?.first;
        statuses[student['id']] = record != null ? record['status'] : 'PENDING';
      }
    }
    return statuses;
  }

  Future<bool> updateHomeworkStatus(
    int classSubjectId,
    int studentId,
    String status,
    String date,
  ) async {
    final token = await _storage.read(key: 'token');
    if (token == null) throw Exception('User not authenticated');

    final response = await http.post(
      Uri.parse(
        '$BASE_URL/api-schools-panel/class_teachers_panel/homework/status/$classSubjectId/$studentId',
      ),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'status': status, 'date': date}),
    );

    return response.statusCode == 200;
  }

  Future<List<dynamic>?> fetchHomeworkReport(
    int classSubjectId,
    String month,
    int studentId,
  ) async {
    final token = await _storage.read(key: 'token');
    if (token == null) throw Exception('User not authenticated');

    final response = await http.get(
      Uri.parse(
        '$BASE_URL/api-schools-panel/class_teachers_panel/homework/report?classSubjectId=$classSubjectId&month=$month&studentId=$studentId',
      ),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['homeworkRecords'];
    }
    throw Exception('Failed to fetch homework report');
  }

  Future<List<dynamic>?> fetchClassHomeworkReport(
    int classSubjectId,
    String month,
  ) async {
    final token = await _storage.read(key: 'token');
    if (token == null) throw Exception('User not authenticated');

    final response = await http.get(
      Uri.parse(
        '$BASE_URL/api-schools-panel/class_teachers_panel/homework/class-report?classSubjectId=$classSubjectId&month=$month',
      ),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['homeworkRecords'];
    }
    throw Exception('Failed to fetch class homework report');
  }
}
