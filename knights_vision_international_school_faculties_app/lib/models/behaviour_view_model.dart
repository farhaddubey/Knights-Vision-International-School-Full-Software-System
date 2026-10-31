import 'package:flutter/foundation.dart';
import 'package:sure_success_point_school_faculties_app/api_service.dart';

class BehaviourViewModel extends ChangeNotifier {
  final ApiService _apiService;
  List<dynamic> punishments = [];
  List<dynamic> behaviourLogs = [];
  bool isLoading = false;
  String? error;

  BehaviourViewModel(this._apiService);

  Future<void> fetchBehaviourData() async {
    isLoading = true;
    notifyListeners();

    try {
      punishments = (await _apiService.fetchPunishments()) ?? [];
      behaviourLogs = (await _apiService.fetchBehaviourLogs()) ?? [];
    } catch (e) {
      error = 'Failed to fetch behaviour data: $e';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}