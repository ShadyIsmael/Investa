import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/analytics_service.dart';

class FounderAnalyticsScreen extends StatefulWidget {
  const FounderAnalyticsScreen({super.key});

  @override
  State<FounderAnalyticsScreen> createState() => _FounderAnalyticsScreenState();
}

class _FounderAnalyticsScreenState extends State<FounderAnalyticsScreen> {
  final AnalyticsService _analyticsService = AnalyticsService();

  // Time filter options
  final List<TimeFilter> _timeFilters = [
    TimeFilter(label: 'Last 7 Days', days: 7),
    TimeFilter(label: 'Last 30 Days', days: 30),
    TimeFilter(label: 'Last 90 Days', days: 90),
    TimeFilter(label: 'All Time', days: null),
  ];

  TimeFilter? _selectedTimeFilter;

  // Data
  Map<String, dynamic>? _summary;
  Map<String, dynamic>? _conversionFunnel;
  List<Map<String, dynamic>> _topPerforming = [];
  List<Map<String, dynamic>> _lowPerforming = [];
  List<String> _insights = [];

  // Loading states
  bool _loading = true;
  bool _loadingSummary = true;
  bool _loadingFunnel = true;
  bool _loadingTopPerforming = true;
  bool _loadingLowPerforming = true;

  @override
  void initState() {
    super.initState();
    _selectedTimeFilter = _timeFilters[1]; // Default to 30 days
    _loadAnalytics();
  }

  Future<void> _loadAnalytics() async {
    setState(() {
      _loading = true;
      _loadingSummary = true;
      _loadingFunnel = true;
      _loadingTopPerforming = true;
      _loadingLowPerforming = true;
    });

    try {
      final results = await Future.wait([
        _analyticsService.getFounderSummary(days: _selectedTimeFilter?.days),
        _analyticsService.getConversionFunnel(days: _selectedTimeFilter?.days),
        _analyticsService.getTopPerformingOpportunities(
          limit: 5,
          days: _selectedTimeFilter?.days,
        ),
        _analyticsService.getLowPerformingOpportunities(
          limit: 5,
          days: _selectedTimeFilter?.days,
        ),
      ]);

      setState(() {
        _summary = results[0] as Map<String, dynamic>;
        _conversionFunnel = results[1] as Map<String, dynamic>;
        _topPerforming = results[2] as List<Map<String, dynamic>>;
        _lowPerforming = results[3] as List<Map<String, dynamic>>;
        _loadingSummary = false;
        _loadingFunnel = false;
        _loadingTopPerforming = false;
        _loadingLowPerforming = false;
        _loading = false;
      });

      _generateInsights();
    } catch (e) {
      print('Error loading analytics: $e');
      setState(() {
        _loading = false;
      });
    }
  }

  void _generateInsights() {
    final insights = <String>[];

    if (_summary != null) {
      final approvalRate = (_summary!['approvalRate'] as num?)?.toDouble() ?? 0.0;
      if (approvalRate >= 70) {
        insights.add('✅ Your approval rate is ${approvalRate.toStringAsFixed(1)}%, which is excellent.');
      } else if (approvalRate < 30) {
        insights.add('⚠️ Your approval rate is ${approvalRate.toStringAsFixed(1)}%. Consider reviewing your investment terms.');
      }

      final totalViews = (_summary!['totalViews'] as int?) ?? 0;
      final requestsReceived = (_summary!['requestsReceived'] as int?) ?? 0;
      if (totalViews > 0 && requestsReceived == 0) {
        insights.add('💡 You have ${_formatNumber(totalViews)} views but no requests. Consider improving your pitch.');
      }
    }

    if (_topPerforming.isNotEmpty) {
      final best = _topPerforming[0];
      insights.add('🏆 "${best['investmentName']}" is your top performing opportunity.');
    }

    if (_lowPerforming.isNotEmpty) {
      final worst = _lowPerforming[0];
      final views = (worst['views'] as int?) ?? 0;
      final requests = (worst['requests'] as int?) ?? 0;
      if (views < 50 && requests == 0) {
        insights.add('📉 "${worst['investmentName']}" needs attention. Consider updating content.');
      }
    }

    setState(() {
      _insights = insights.take(3).toList();
    });
  }

  String _formatNumber(int num) {
    if (num >= 1000) {
      return (num / 1000).toStringAsFixed(1) + 'K';
    }
    return num.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Founder Analytics'),
        actions: [
          DropdownButton<TimeFilter>(
            value: _selectedTimeFilter,
            items: _timeFilters.map((filter) {
              return DropdownMenuItem<TimeFilter>(
                value: filter,
                child: Text(filter.label),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedTimeFilter = value;
              });
              _loadAnalytics();
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildKPIGrid(),
                  const SizedBox(height: 24),
                  _buildConversionFunnel(),
                  const SizedBox(height: 24),
                  _buildTopPerforming(),
                  const SizedBox(height: 24),
                  _buildLowPerforming(),
                  const SizedBox(height: 24),
                  if (_insights.isNotEmpty) _buildInsights(),
                ],
              ),
            ),
    );
  }

  Widget _buildKPIGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildKPICard('Total Opportunities', _summary?['totalOpportunities']?.toString() ?? '0',
            subtitle: '${_summary?['publishedOpportunities'] ?? 0} Published'),
        _buildKPICard('Total Views', _formatNumber(_summary?['totalViews'] ?? 0),
            subtitle: '${_formatNumber(_summary?['uniqueViews'] ?? 0)} Unique'),
        _buildKPICard('Learn More Opens', _formatNumber(_summary?['learnMoreOpens'] ?? 0),
            subtitle: '${_formatNumber(_summary?['uniqueLearnMoreOpens'] ?? 0)} Unique'),
        _buildKPICard('Requests Received', _summary?['requestsReceived']?.toString() ?? '0'),
        _buildKPICard('Approved Requests', _summary?['approvedRequests']?.toString() ?? '0'),
        _buildKPICard('Approval Rate', '${(_summary?['approvalRate'] ?? 0).toStringAsFixed(1)}%'),
        _buildKPICard('Rejected Requests', _summary?['rejectedRequests']?.toString() ?? '0'),
        _buildKPICard('Active Conversations', _summary?['activeConversations']?.toString() ?? '0'),
      ],
    );
  }

  Widget _buildKPICard(String label, String value, {String? subtitle}) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 10, color: Colors.grey),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildConversionFunnel() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Conversion Funnel', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            if (!_loadingFunnel && _conversionFunnel != null) ...[
              _buildFunnelBar('Views', _conversionFunnel!['uniqueViews'] ?? 0, _conversionFunnel!['uniqueViews'] ?? 1),
              _buildFunnelBar('Learn More', _conversionFunnel!['uniqueLearnMore'] ?? 0, _conversionFunnel!['uniqueViews'] ?? 1),
              _buildFunnelBar('Requests', _conversionFunnel!['requests'] ?? 0, _conversionFunnel!['uniqueViews'] ?? 1),
              _buildFunnelBar('Approvals', _conversionFunnel!['approvals'] ?? 0, _conversionFunnel!['uniqueViews'] ?? 1),
              _buildFunnelBar('Chats', _conversionFunnel!['chats'] ?? 0, _conversionFunnel!['uniqueViews'] ?? 1),
            ] else
              const Center(child: CircularProgressIndicator()),
          ],
        ),
      ),
    );
  }

  Widget _buildFunnelBar(String label, int value, int total) {
    final percentage = total > 0 ? (value / total * 100).clamp(0, 100) : 0.0;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(label, style: const TextStyle(fontSize: 12)),
          ),
          Expanded(
            child: Stack(
              children: [
                Container(
                  height: 24,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                FractionallySizedBox(
                  widthFactor: percentage / 100,
                  child: Container(
                    height: 24,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Colors.blue, Colors.green]),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            width: 60,
            child: Text(_formatNumber(value), style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildTopPerforming() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Top Performing Opportunities', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            if (!_loadingTopPerforming)
              _topPerforming.isEmpty
                  ? const Center(child: Text('No opportunities found'))
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _topPerforming.length,
                      itemBuilder: (context, index) {
                        final opp = _topPerforming[index];
                        return _buildOpportunityCard(opp);
                      },
                    )
            else
              const Center(child: CircularProgressIndicator()),
          ],
        ),
      ),
    );
  }

  Widget _buildOpportunityCard(Map<String, dynamic> opp) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (opp['coverImage'] != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  opp['coverImage'],
                  height: 120,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 120,
                      color: Colors.grey[200],
                      child: const Icon(Icons.image_not_supported),
                    );
                  },
                ),
              ),
            const SizedBox(height: 8),
            Text(
              opp['investmentName'] ?? 'Untitled',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildMetric('Views', _formatNumber(opp['uniqueViews'] ?? 0)),
                _buildMetric('Requests', opp['requests']?.toString() ?? '0'),
                _buildMetric('Approval', '${(opp['approvalRate'] ?? 0).toStringAsFixed(1)}%'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
      ],
    );
  }

  Widget _buildLowPerforming() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Low Performing Opportunities', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            if (!_loadingLowPerforming)
              _lowPerforming.isEmpty
                  ? const Center(child: Text('No opportunities found'))
                  : SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: DataTable(
                        columns: const [
                          DataColumn(label: Text('Name')),
                          DataColumn(label: Text('Views')),
                          DataColumn(label: Text('Unique Views')),
                          DataColumn(label: Text('Learn More')),
                          DataColumn(label: Text('Unique Learn More')),
                          DataColumn(label: Text('Requests')),
                        ],
                        rows: _lowPerforming.map((opp) {
                          return DataRow(
                            cells: [
                              DataCell(Text(opp['investmentName'] ?? '')),
                              DataCell(Text((opp['views'] ?? 0).toString())),
                              DataCell(Text((opp['uniqueViews'] ?? 0).toString())),
                              DataCell(Text((opp['learnMore'] ?? 0).toString())),
                              DataCell(Text((opp['uniqueLearnMore'] ?? 0).toString())),
                              DataCell(Text((opp['requests'] ?? 0).toString())),
                            ],
                          );
                        }).toList(),
                      ),
                    )
            else
              const Center(child: CircularProgressIndicator()),
          ],
        ),
      ),
    );
  }

  Widget _buildInsights() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Founder Insights', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ..._insights.map((insight) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border(left: BorderSide(color: Colors.blue, width: 4)),
                    ),
                    child: Text(insight, style: const TextStyle(fontSize: 12)),
                  ),
                )),
          ],
        ),
      ),
    );
  }
}

class TimeFilter {
  final String label;
  final int? days;

  TimeFilter({required this.label, this.days});
}
