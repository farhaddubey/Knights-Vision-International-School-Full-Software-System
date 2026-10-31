import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

import '../models/results_view_model.dart';

class ResultsPage extends StatefulWidget {
  @override
  _ResultsPageState createState() => _ResultsPageState();
}

class _ResultsPageState extends State<ResultsPage> with SingleTickerProviderStateMixin {
  TabController? _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    Provider.of<ResultsViewModel>(context, listen: false).fetchResultsData();
  }

  @override
  void dispose() {
    _tabController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ResultsViewModel>(
      builder: (context, viewModel, child) {
        return Scaffold(
          backgroundColor: Color(0xFF212121),
          appBar: AppBar(
            backgroundColor: Color(0xFFB71C1C),
            title: Text('Results', style: TextStyle(color: Colors.white)),
            bottom: TabBar(
              controller: _tabController,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              tabs: [
                Tab(text: 'Semester Results'),
                Tab(text: 'Oath & Prayer'),
              ],
            ),
          ),
          body: viewModel.isLoading
              ? Center(child: SpinKitCircle(color: Theme.of(context).primaryColor))
              : viewModel.error != null
              ? Center(child: Text(viewModel.error!, style: TextStyle(color: Colors.red)))
              : TabBarView(
            controller: _tabController,
            children: [
              _buildSemesterResultsTab(viewModel),
              _buildOathPrayerTab(viewModel),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSemesterResultsTab(ResultsViewModel viewModel) {
    return ListView.builder(
      itemCount: viewModel.semesterResults.length,
      itemBuilder: (context, index) {
        final result = viewModel.semesterResults[index];
        return ListTile(
          title: Text('Semester: ${result['semester']}', style: TextStyle(color: Colors.white)),
          subtitle: Text('Marks: ${result['marks']}', style: TextStyle(color: Colors.white70)),
        );
      },
    );
  }

  Widget _buildOathPrayerTab(ResultsViewModel viewModel) {
    return ListView.builder(
      itemCount: viewModel.oathPrayers.length,
      itemBuilder: (context, index) {
        final oath = viewModel.oathPrayers[index];
        return ListTile(
          title: Text('Title: ${oath['title']}', style: TextStyle(color: Colors.white)),
          subtitle: Text('Date: ${oath['date']}', style: TextStyle(color: Colors.white70)),
        );
      },
    );
  }
}