import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:sure_success_point_school_faculties_app/view_models/study_view_model.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

import '../models/study_view_model.dart';

class StudyPage extends StatefulWidget {
  @override
  _StudyPageState createState() => _StudyPageState();
}

class _StudyPageState extends State<StudyPage> with SingleTickerProviderStateMixin {
  TabController? _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
    Provider.of<StudyViewModel>(context, listen: false).fetchStudyData();
  }

  @override
  void dispose() {
    _tabController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<StudyViewModel>(
      builder: (context, viewModel, child) {
        return Scaffold(
          backgroundColor: Color(0xFF212121),
          appBar: AppBar(
            backgroundColor: Color(0xFFB71C1C),
            title: Text('Study', style: TextStyle(color: Colors.white)),
            bottom: TabBar(
              controller: _tabController,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              tabs: [
                Tab(text: 'Syllabus'),
                Tab(text: 'Assignments'),
                Tab(text: 'Test Marks'),
                Tab(text: 'Semester Marks'),
                Tab(text: 'Resources'),
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
              _buildSyllabusTab(viewModel),
              _buildAssignmentsTab(viewModel),
              _buildTestMarksTab(viewModel),
              _buildSemesterMarksTab(viewModel),
              _buildResourcesTab(viewModel),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSyllabusTab(StudyViewModel viewModel) {
    return ListView.builder(
      itemCount: viewModel.homework.length,
      itemBuilder: (context, index) {
        final homework = viewModel.homework[index];
        return ListTile(
          title: Text('Subject: ${homework['subject']}', style: TextStyle(color: Colors.white)),
          subtitle: Text('Status: ${homework['status']}', style: TextStyle(color: Colors.white70)),
          trailing: Text(
            DateFormat('dd MMM yyyy').format(DateTime.parse(homework['date'])),
            style: TextStyle(color: Colors.white70),
          ),
        );
      },
    );
  }

  Widget _buildAssignmentsTab(StudyViewModel viewModel) {
    return ListView.builder(
      itemCount: viewModel.assignments.length,
      itemBuilder: (context, index) {
        final assignment = viewModel.assignments[index];
        return ListTile(
          title: Text('Assignment: ${assignment['title']}', style: TextStyle(color: Colors.white)),
          subtitle: Text('Due: ${assignment['dueDate']}', style: TextStyle(color: Colors.white70)),
        );
      },
    );
  }

  Widget _buildTestMarksTab(StudyViewModel viewModel) {
    return ListView.builder(
      itemCount: viewModel.testMarks.length,
      itemBuilder: (context, index) {
        final test = viewModel.testMarks[index];
        return ListTile(
          title: Text('Test: ${test['testName']}', style: TextStyle(color: Colors.white)),
          subtitle: Text('Marks: ${test['marks']}', style: TextStyle(color: Colors.white70)),
        );
      },
    );
  }

  Widget _buildSemesterMarksTab(StudyViewModel viewModel) {
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

  Widget _buildResourcesTab(StudyViewModel viewModel) {
    return ListView.builder(
      itemCount: viewModel.resources.length,
      itemBuilder: (context, index) {
        final resource = viewModel.resources[index];
        return ListTile(
          title: Text('Resource: ${resource['title']}', style: TextStyle(color: Colors.white)),
          subtitle: Text('Type: ${resource['type']}', style: TextStyle(color: Colors.white70)),
        );
      },
    );
  }
}