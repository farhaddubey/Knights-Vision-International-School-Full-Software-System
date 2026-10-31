import 'package:flutter/foundation.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';

class SalaryViewModel extends ChangeNotifier {
  final ApiService _apiService;
  List<dynamic> teacherAttendance = [];
  List<dynamic> salaryLogs = [];
  Map<String, dynamic>? currentMonthSalary;
  bool isLoading = false;
  String? error;

  SalaryViewModel(this._apiService);

  Future<void> fetchSalaryData() async {
    isLoading = true;
    notifyListeners();

    try {
      teacherAttendance = (await _apiService.fetchTeacherAttendance()) ?? [];
      salaryLogs = (await _apiService.fetchSalaryLogs()) ?? [];
      currentMonthSalary = await _apiService.fetchCurrentMonthSalary();
    } catch (e) {
      error = 'Failed to fetch salary data: $e';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}