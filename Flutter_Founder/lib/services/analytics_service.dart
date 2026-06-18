import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';

class AnalyticsService {
  final String baseUrl = Constants.apiUrl;

  Future<void> recordView(int investmentId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/investments/analytics/$investmentId/view'),
        headers: await _getHeaders(),
      );
      if (response.statusCode != 200) {
        print('Failed to record view: ${response.statusCode}');
      }
    } catch (e) {
      print('Error recording view: $e');
    }
  }

  Future<void> recordLearnMore(int investmentId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/investments/analytics/$investmentId/learn-more'),
        headers: await _getHeaders(),
      );
      if (response.statusCode != 200) {
        print('Failed to record learn more: ${response.statusCode}');
      }
    } catch (e) {
      print('Error recording learn more: $e');
    }
  }

  Future<Map<String, dynamic>> getFounderSummary({int? days}) async {
    try {
      final queryParams = <String, String>{};
      if (days != null) {
        final startDate = _calculateStartDate(days);
        queryParams['startDate'] = startDate.toIso8601String();
      }

      final uri = Uri.parse('$baseUrl/investments/analytics/summary')
          .replace(queryParameters: queryParams);

      final response = await http.get(uri, headers: await _getHeaders());
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      }
      throw Exception('Failed to load summary');
    } catch (e) {
      print('Error loading summary: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getInvestmentMetrics(int investmentId, {int? days}) async {
    try {
      final queryParams = <String, String>{};
      if (days != null) {
        final startDate = _calculateStartDate(days);
        queryParams['startDate'] = startDate.toIso8601String();
      }

      final uri = Uri.parse('$baseUrl/investments/analytics/$investmentId')
          .replace(queryParameters: queryParams);

      final response = await http.get(uri, headers: await _getHeaders());
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      }
      throw Exception('Failed to load investment metrics');
    } catch (e) {
      print('Error loading investment metrics: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getOpportunitiesPerformance({int? days}) async {
    try {
      final queryParams = <String, String>{};
      if (days != null) {
        final startDate = _calculateStartDate(days);
        queryParams['startDate'] = startDate.toIso8601String();
      }

      final uri = Uri.parse('$baseUrl/investments/analytics/opportunities')
          .replace(queryParameters: queryParams);

      final response = await http.get(uri, headers: await _getHeaders());
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['data']);
      }
      throw Exception('Failed to load opportunities performance');
    } catch (e) {
      print('Error loading opportunities performance: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getTopPerformingOpportunities({
    int limit = 5,
    int? days,
  }) async {
    try {
      final queryParams = <String, String>{'limit': limit.toString()};
      if (days != null) {
        final startDate = _calculateStartDate(days);
        queryParams['startDate'] = startDate.toIso8601String();
      }

      final uri = Uri.parse('$baseUrl/investments/analytics/top-performing')
          .replace(queryParameters: queryParams);

      final response = await http.get(uri, headers: await _getHeaders());
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['data']);
      }
      throw Exception('Failed to load top performing opportunities');
    } catch (e) {
      print('Error loading top performing opportunities: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getLowPerformingOpportunities({
    int limit = 5,
    int? days,
  }) async {
    try {
      final queryParams = <String, String>{'limit': limit.toString()};
      if (days != null) {
        final startDate = _calculateStartDate(days);
        queryParams['startDate'] = startDate.toIso8601String();
      }

      final uri = Uri.parse('$baseUrl/investments/analytics/low-performing')
          .replace(queryParameters: queryParams);

      final response = await http.get(uri, headers: await _getHeaders());
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['data']);
      }
      throw Exception('Failed to load low performing opportunities');
    } catch (e) {
      print('Error loading low performing opportunities: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getConversionFunnel({int? days}) async {
    try {
      final queryParams = <String, String>{};
      if (days != null) {
        final startDate = _calculateStartDate(days);
        queryParams['startDate'] = startDate.toIso8601String();
      }

      final uri = Uri.parse('$baseUrl/investments/analytics/conversion-funnel')
          .replace(queryParameters: queryParams);

      final response = await http.get(uri, headers: await _getHeaders());
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      }
      throw Exception('Failed to load conversion funnel');
    } catch (e) {
      print('Error loading conversion funnel: $e');
      rethrow;
    }
  }

  Future<Map<String, String>> _getHeaders() async {
    // TODO: Implement auth token retrieval
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE',
    };
  }

  DateTime _calculateStartDate(int days) {
    final date = DateTime.now().subtract(Duration(days: days));
    return date;
  }
}
