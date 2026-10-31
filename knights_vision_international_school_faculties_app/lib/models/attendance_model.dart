class Student {
  final int id;
  final String firstName;
  final String middleName;
  final String lastName;
  final String rollNumber;
  final int schoolId;
  final int branchId;
  final int classId;
  final String? status;

  Student({
    required this.id,
    required this.firstName,
    required this.middleName,
    required this.lastName,
    required this.rollNumber,
    required this.schoolId,
    required this.branchId,
    required this.classId,
    this.status,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id'] ?? 0,
      firstName: json['firstName'] ?? '',
      middleName: json['middleName'] ?? '',
      lastName: json['lastName'] ?? '',
      rollNumber: json['rollNumber'] ?? '',
      schoolId: json['schoolId'] ?? 0,
      branchId: json['branchId'] ?? 0,
      classId: json['classId'] ?? 0,
      status: json['status'],
    );
  }
}

class AttendanceRecord {
  final String date;
  final String status;
  final String remarks;

  AttendanceRecord({
    required this.date,
    required this.status,
    required this.remarks,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      date: json['date'] ?? '',
      status: json['status'] ?? '',
      remarks: json['remarks'] ?? '',
    );
  }
}