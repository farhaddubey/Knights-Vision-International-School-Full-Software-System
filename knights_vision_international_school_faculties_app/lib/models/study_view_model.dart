import 'package:flutter/foundation.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';

class StudyViewModel extends ChangeNotifier {
  final ApiService _apiService;
  List<dynamic> homework = [];
  List<dynamic> assignments = [];
  List<dynamic> testMarks = [];
  List<dynamic> semesterResults = [];
  List<dynamic> resources = [];
  bool isLoading = false;
  String? error;

  StudyViewModel(this._apiService);

  Future<void> fetchStudyData() async {
    isLoading = true;
    notifyListeners();

    try {
      // Placeholder API calls
      homework = (await _apiService.fetchHomework()) ?? [];
      assignments = (await _apiService.fetchAssignments()) ?? [];
      testMarks = (await _apiService.fetchTestMarks()) ?? [];
      semesterResults = (await _apiService.fetchSemesterResults()) ?? [];
      resources = (await _apiService.fetchResources()) ?? [];
    } catch (e) {
      error = 'Failed to fetch study data: $e';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}