import 'package:flutter/material.dart';

class ViewParentTeacherMeetingNoteDialog extends StatelessWidget {
  final bool open;
  final VoidCallback onClose;
  final dynamic note;
  final String className;

  const ViewParentTeacherMeetingNoteDialog({
    super.key,
    required this.open,
    required this.onClose,
    this.note,
    required this.className,
  });

  @override
  Widget build(BuildContext context) {
    const drawerWidth = 280.0;
    const appBarHeight = 64.0;
    const greenAccent = Color(0xFF00C853);

    return open
        ? Material(
      color: Colors.transparent,
      child: Stack(
        children: [
          Positioned(
            left: drawerWidth,
            top: appBarHeight,
            width: MediaQuery.of(context).size.width - drawerWidth,
            height: MediaQuery.of(context).size.height - appBarHeight,
            child: Container(
              color: const Color(0xFF181818),
              child: Column(
                children: [
                  Container(
                    color: const Color(0xFF181818),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(
                      children: [
                        Icon(Icons.meeting_room, color: greenAccent),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            'Parent-Teacher Meeting Note - $className',
                            style: const TextStyle(color: Colors.white, fontSize: 16),
                          ),
                        ),
                        OutlinedButton(
                          onPressed: onClose,
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFFF44336)),
                            foregroundColor: const Color(0xFFF44336),
                          ),
                          child: const Icon(Icons.close),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      child: note != null
                          ? DataTable(
                        columns: const [
                          DataColumn(label: Text('Field', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                          DataColumn(label: Text('Value', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                        ],
                        rows: [
                          DataRow(cells: [
                            const DataCell(Text('Student', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                            DataCell(Text(note['student']?['name'] ?? 'N/A', style: const TextStyle(color: Colors.white))),
                          ]),
                          DataRow(cells: [
                            const DataCell(Text('Class', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                            DataCell(Text(note['class']?['name'] ?? className ?? 'N/A', style: const TextStyle(color: Colors.white))),
                          ]),
                          DataRow(cells: [
                            const DataCell(Text('Meeting Date', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                            DataCell(
                              Text(
                                DateTime.parse(note['meetingDate']).toLocal().toString().split('.')[0],
                                style: const TextStyle(color: Colors.white),
                              ),
                            ),
                          ]),
                          DataRow(cells: [
                            const DataCell(Text('Guardian Instruction', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                            DataCell(Text(note['guardianInstruction'] ?? 'N/A', style: const TextStyle(color: Colors.white))),
                          ]),
                          DataRow(cells: [
                            const DataCell(Text('Guardian Feedback', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                            DataCell(Text(note['guardianFeedback'] ?? 'N/A', style: const TextStyle(color: Colors.white))),
                          ]),
                        ],
                        dataRowColor: MaterialStateProperty.all(const Color(0xFF181818)),
                      )
                          : const Center(
                        child: Text('No note data available.', style: TextStyle(color: Colors.white)),
                      ),
                    ),
                  ),
                  Container(
                    color: const Color(0xFF181818),
                    padding: const EdgeInsets.all(8),
                    child: ElevatedButton(
                      onPressed: onClose,
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF44336)),
                      child: const Text('Close', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    )
        : const SizedBox.shrink();
  }
}