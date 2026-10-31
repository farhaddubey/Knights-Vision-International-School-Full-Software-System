import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sure_success_point_school_faculties_app/view_models/behaviour_view_model.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

import '../models/behaviour_view_model.dart';

class BehaviourPage extends StatefulWidget {
  @override
  _BehaviourPageState createState() => _BehaviourPageState();
}

class _BehaviourPageState extends State<BehaviourPage> with SingleTickerProviderStateMixin {
  TabController? _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    Provider.of<BehaviourViewModel>(context, listen: false).fetchBehaviourData();
  }

  @override
  void dispose() {
    _tabController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<BehaviourViewModel>(
      builder: (context, viewModel, child) {
        return Scaffold(
          backgroundColor: Color(0xFF212121),
          appBar: AppBar(
            backgroundColor: Color(0xFFB71C1C),
            title: Text('Behaviour', style: TextStyle(color: Colors.white)),
            bottom: TabBar(
              controller: _tabController,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              tabs: [
                Tab(text: 'Punishments'),
                Tab(text: 'Behaviour Logs'),
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
              _buildPunishmentsTab(viewModel),
              _buildBehaviourLogsTab(viewModel),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPunishmentsTab(BehaviourViewModel viewModel) {
    return ListView.builder(
      itemCount: viewModel.punishments.length,
      itemBuilder: (context, index) {
        final punishment = viewModel.punishments[index];
        return ListTile(
          title: Text('Incident: ${punishment['incident']}', style: TextStyle(color: Colors.white)),
          subtitle: Text('Date: ${punishment['date']}', style: TextStyle(color: Colors.white70)),
        );
      },
    );
  }

  Widget _buildBehaviourLogsTab(BehaviourViewModel viewModel) {
    return ListView.builder(
      itemCount: viewModel.behaviourLogs.length,
      itemBuilder: (context, index) {
        final log = viewModel.behaviourLogs[index];
        return ListTile(
          title: Text('Log: ${log['description']}', style: TextStyle(color: Colors.white)),
          subtitle: Text('Date: ${log['date']}', style: TextStyle(color: Colors.white70)),
        );
      },
    );
  }
}