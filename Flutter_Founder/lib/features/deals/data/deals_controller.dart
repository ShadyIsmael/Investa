import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

import 'founder_deals.dart';

abstract interface class FounderDealsRepository {
  Future<List<FounderDeal>> fetchDeals();
}

class ApiFounderDealsRepository implements FounderDealsRepository {
  const ApiFounderDealsRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<List<FounderDeal>> fetchDeals() async {
    final response = await _api.get<dynamic>('/opportunities/my');
    final rawOpportunities = dealItems(response.data);
    final opportunities = rawOpportunities
        .whereType<Map>()
        .map((item) {
          final json = dealMap(item);
          return FounderOwnedOpportunity(
            id: dealInt(json['id']),
            title: dealString(json['title']),
          );
        })
        .where((item) => item.id > 0)
        .toList(growable: false);

    if (opportunities.isEmpty) return const <FounderDeal>[];

    final requestsFuture = Future.wait(
      opportunities.map((opportunity) async {
        final result = await _api.get<dynamic>(
          '/opportunities/${opportunity.id}/join-requests',
        );
        return MapEntry(
          opportunity.id,
          dealItems(
            result.data,
          ).whereType<Map>().map(dealMap).toList(growable: false),
        );
      }),
    );
    final contractsFuture = Future.wait(
      opportunities.map((opportunity) async {
        final result = await _api.get<dynamic>(
          '/opportunities/${opportunity.id}/contracts',
        );
        return MapEntry(
          opportunity.id,
          dealItems(
            result.data,
          ).whereType<Map>().map(dealMap).toList(growable: false),
        );
      }),
    );
    final requestResults = await requestsFuture;
    final contractResults = await contractsFuture;
    final requests = Map<int, List<Map<String, dynamic>>>.fromEntries(
      requestResults,
    );
    final contracts = Map<int, List<Map<String, dynamic>>>.fromEntries(
      contractResults,
    );
    return assembleFounderDeals(
      opportunities: opportunities,
      joinRequests: requests,
      contracts: contracts,
    );
  }
}

final founderDealsRepositoryProvider = Provider<FounderDealsRepository>(
  (ref) => ApiFounderDealsRepository(ref.read(apiClientProvider)),
);

final founderDealsProvider = FutureProvider.autoDispose<List<FounderDeal>>(
  (ref) => ref.read(founderDealsRepositoryProvider).fetchDeals(),
);
