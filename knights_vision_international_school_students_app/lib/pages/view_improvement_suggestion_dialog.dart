import 'package:flutter/material.dart';

class ViewImprovementSuggestionDialog extends StatelessWidget {
  final bool open;
  final VoidCallback onClose;
  final dynamic suggestion;
  final String className;

  const ViewImprovementSuggestionDialog({
    super.key,
    required this.open,
    required this.onClose,
    this.suggestion,
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
                        Icon(Icons.lightbulb, color: greenAccent),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            'Improvement Suggestion - $className',
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
                      child: suggestion != null
                          ? DataTable(
                        columns: const [
                          DataColumn(label: Text('Field', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                          DataColumn(label: Text('Value', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                        ],
                        rows: [
                          DataRow(cells: [
                            const DataCell(Text('ID', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                            DataCell(Text(suggestion['id'].toString(), style: const TextStyle(color: Colors.white))),
                          ]),
                          DataRow(cells: [
                            const DataCell(Text('Category', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                            DataCell(Text(suggestion['category'], style: const TextStyle(color: Colors.white))),
                          ]),
                          DataRow(cells: [
                            const DataCell(Text('Suggestion', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                            DataCell(Text(suggestion['message'] ?? 'N/A', style: const TextStyle(color: Colors.white))),
                          ]),
                          DataRow(cells: [
                            const DataCell(Text('Response', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                            DataCell(Text(suggestion['responseMessage'] ?? 'N/A', style: const TextStyle(color: Colors.white))),
                          ]),
                          DataRow(cells: [
                            const DataCell(Text('Month', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                            DataCell(Text(suggestion['month'].toString(), style: const TextStyle(color: Colors.white))),
                          ]),
                          DataRow(cells: [
                            const DataCell(Text('Year', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                            DataCell(Text(suggestion['year'].toString(), style: const TextStyle(color: Colors.white))),
                          ]),
                        ],
                        dataRowColor: MaterialStateProperty.all(const Color(0xFF181818)),
                        headingRowColor: MaterialStateProperty.all(const Color(0xFF333333)),
                      )
                          : const Center(
                        child: Text('No suggestion data available.', style: TextStyle(color: Colors.white)),
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