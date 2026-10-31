class LeaveRequest {
  final int id;
  final int studentId;
  final String studentName;
  final String fromDate;
  final String toDate;
  final String reason;
  final bool? approved;

  LeaveRequest({
    required this.id,
    required this.studentId,
    required this.studentName,
    required this.fromDate,
    required this.toDate,
    required this.reason,
    this.approved,
  });

  factory LeaveRequest.fromJson(Map<String, dynamic> json) {
    return LeaveRequest(
      id: json['id'] ?? 0,
      studentId: json['studentId'] ?? 0,
      studentName: json['studentName'] ?? '',
      fromDate: json['fromDate'] ?? '',
      toDate: json['toDate'] ?? '',
      reason: json['reason'] ?? '',
      approved: json['approved'],
    );
  }
}