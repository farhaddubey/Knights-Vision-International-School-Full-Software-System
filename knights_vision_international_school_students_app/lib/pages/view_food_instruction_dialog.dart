import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ViewFoodInstructionDialog extends StatelessWidget {
  final bool open;
  final VoidCallback onClose;
  final dynamic instruction;
  final String className;

  const ViewFoodInstructionDialog({
    super.key,
    required this.open,
    required this.onClose,
    this.instruction,
    required this.className,
  });

  void _handleUrlClick(String? url) async {
    if (url != null) {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    }
  }

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
                        Icon(Icons.restaurant, color: greenAccent),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            'Food Instruction for $className: ${instruction?['title'] ?? 'Unknown'}',
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
                      child: Column(
                        children: [
                          if (instruction != null)
                            DataTable(
                              columns: const [
                                DataColumn(label: Text('Field', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                                DataColumn(label: Text('Value', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                              ],
                              rows: [
                                DataRow(cells: [
                                  const DataCell(Text('Title', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                                  DataCell(Text(instruction['title'], style: const TextStyle(color: Colors.white))),
                                ]),
                                DataRow(cells: [
                                  const DataCell(Text('Description', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                                  DataCell(Text(instruction['description'] ?? 'N/A', style: const TextStyle(color: Colors.white))),
                                ]),
                                DataRow(cells: [
                                  const DataCell(Text('Food Type', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                                  DataCell(Text(instruction['foodType'], style: const TextStyle(color: Colors.white))),
                                ]),
                                DataRow(cells: [
                                  const DataCell(Text('Time of Day', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                                  DataCell(Text(instruction['timeOfDay'] ?? 'N/A', style: const TextStyle(color: Colors.white))),
                                ]),
                                DataRow(cells: [
                                  const DataCell(Text('Week Day', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                                  DataCell(Text(instruction['weekDay'] ?? 'N/A', style: const TextStyle(color: Colors.white))),
                                ]),
                                DataRow(cells: [
                                  const DataCell(Text('Frequency', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                                  DataCell(Text(instruction['frequency'], style: const TextStyle(color: Colors.white))),
                                ]),
                                DataRow(cells: [
                                  const DataCell(Text('Media URL', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                                  DataCell(
                                    instruction['mediaUrl'] != null && RegExp(r'\.(png|jpg|jpeg)$', caseSensitive: false).hasMatch(instruction['mediaUrl'])
                                        ? GestureDetector(
                                      onTap: () => _handleUrlClick(instruction['mediaUrl']),
                                      child: Image.network(
                                        instruction['mediaUrl'],
                                        width: 200,
                                        height: 200,
                                        fit: BoxFit.cover,
                                      ),
                                    )
                                        : instruction['mediaUrl'] != null
                                        ? TextButton(
                                      onPressed: () => _handleUrlClick(instruction['mediaUrl']),
                                      style: TextButton.styleFrom(foregroundColor: greenAccent),
                                      child: const Text('View Media'),
                                    )
                                        : const Text('N/A', style: TextStyle(color: Colors.white)),
                                  ),
                                ]),
                              ],
                              dataRowColor: MaterialStateProperty.all(const Color(0xFF181818)),
                            ),
                          if (instruction != null && instruction['suggestedItems'] != null && instruction['suggestedItems'].isNotEmpty)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Padding(
                                  padding: EdgeInsets.all(8.0),
                                  child: Text('Suggested Items', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                ),
                                DataTable(
                                  columns: const [
                                    DataColumn(label: Text('Name', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Quantity', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Benefit', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                                  ],
                                  rows: (instruction['suggestedItems'] as List).map((item) => DataRow(cells: [
                                    DataCell(Text(item['name'], style: const TextStyle(color: Colors.white))),
                                    DataCell(Text(item['quantity'] ?? 'N/A', style: const TextStyle(color: Colors.white))),
                                    DataCell(Text(item['benefit'] ?? 'N/A', style: const TextStyle(color: Colors.white))),
                                  ])).toList(),
                                  dataRowColor: MaterialStateProperty.resolveWith((states) => states.contains(MaterialState.hovered)
                                      ? const Color(0xFF222222)
                                      : const Color(0xFF181818)),
                                  headingRowColor: MaterialStateProperty.all(const Color(0xFF333333)),
                                ),
                              ],
                            )
                          else
                            const Padding(
                              padding: EdgeInsets.all(8.0),
                              child: Text('No suggested items available.', style: TextStyle(color: Colors.white)),
                            ),
                        ],
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