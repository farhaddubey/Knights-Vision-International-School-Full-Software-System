import 'package:flutter_test/flutter_test.dart';
import 'package:sure_success_point_school_students/api_service.dart';

void main() {
  test('student activation uses the dedicated student-auth API route', () {
    final endpoint = ApiService().endpoint('/api/students_auth/activate');

    expect(endpoint.path, '/api/students_auth/activate');
    expect(endpoint.host, isNotEmpty);
  });
}
