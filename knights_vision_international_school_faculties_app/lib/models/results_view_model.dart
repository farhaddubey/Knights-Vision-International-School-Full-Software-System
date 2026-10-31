import 'package:flutter/foundation.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';

class ResultsViewModel extends ChangeNotifier {
  final ApiService _apiService;
  List<dynamic> semesterResults = [];
  List<dynamic> oathPrayers = [];
  bool isLoading = false;
  String? error;

  ResultsViewModel(this._apiService);

  Future<void> fetchResultsData() async {
    isLoading = true;
    notifyListeners();

    try {
      semesterResults = (await _apiService.fetchSemesterResults()) ?? [];
      oathPrayers = (await _apiService.fetchOathPrayers()) ?? [];
    } catch (e) {
      error = 'Failed to fetch results data: $e';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}