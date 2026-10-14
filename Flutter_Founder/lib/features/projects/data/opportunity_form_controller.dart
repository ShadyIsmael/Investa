import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

class OpportunityStageChoice {
  const OpportunityStageChoice({
    required this.code,
    required this.value,
    required this.nameEn,
    required this.nameAr,
    required this.allowsCustomName,
  });

  final String code;
  final int value;
  final String nameEn;
  final String nameAr;
  final bool allowsCustomName;

  factory OpportunityStageChoice.fromJson(Map<String, dynamic> json) =>
      OpportunityStageChoice(
        code: _string(json['code']),
        value: _int(json['value']),
        nameEn: _string(json['nameEn']),
        nameAr: _string(json['nameAr']),
        allowsCustomName: json['allowsCustomName'] == true,
      );

  String label(String languageCode) =>
      languageCode == 'ar' && nameAr.isNotEmpty ? nameAr : nameEn;
}

class OpportunityGoalChoice {
  const OpportunityGoalChoice({
    required this.id,
    required this.code,
    required this.nameEn,
    required this.nameAr,
  });

  final int id;
  final String code;
  final String nameEn;
  final String nameAr;

  factory OpportunityGoalChoice.fromJson(Map<String, dynamic> json) =>
      OpportunityGoalChoice(
        id: _int(json['id']),
        code: _string(json['code']),
        nameEn: _string(json['nameEn']),
        nameAr: _string(json['nameAr']),
      );

  String label(String languageCode) =>
      languageCode == 'ar' && nameAr.isNotEmpty ? nameAr : nameEn;
}

class OpportunityCurrencyChoice {
  const OpportunityCurrencyChoice({
    required this.code,
    required this.nameEn,
    required this.nameAr,
  });

  final String code;
  final String nameEn;
  final String nameAr;

  factory OpportunityCurrencyChoice.fromJson(Map<String, dynamic> json) =>
      OpportunityCurrencyChoice(
        code: _string(json['isoCode']).toUpperCase(),
        nameEn: _string(json['englishName']),
        nameAr: _string(json['arabicName']),
      );

  String label(String languageCode) =>
      languageCode == 'ar' && nameAr.isNotEmpty ? nameAr : nameEn;
}

class OpportunityFormChoices {
  const OpportunityFormChoices({
    required this.stages,
    required this.fundingGoals,
    required this.currencies,
  });

  final List<OpportunityStageChoice> stages;
  final List<OpportunityGoalChoice> fundingGoals;
  final List<OpportunityCurrencyChoice> currencies;
}

class OpportunityPublishQuote {
  const OpportunityPublishQuote({
    required this.creditCost,
    required this.currentBalance,
    required this.hasSufficientCredit,
    required this.chargingEnabled,
  });

  final double creditCost;
  final double currentBalance;
  final bool hasSufficientCredit;
  final bool chargingEnabled;

  factory OpportunityPublishQuote.fromJson(Map<String, dynamic> json) =>
      OpportunityPublishQuote(
        creditCost: _double(json['creditCost']),
        currentBalance: _double(json['currentBalance']),
        hasSufficientCredit: json['hasSufficientCredit'] == true,
        chargingEnabled: json['chargingEnabled'] == true,
      );
}

abstract interface class OpportunityFormRepository {
  Future<OpportunityFormChoices> fetchChoices();
  Future<int> create(Map<String, dynamic> request);
  Future<void> update(int opportunityId, Map<String, dynamic> request);
  Future<OpportunityPublishQuote> quotePublish();
  Future<void> submitForReview(int opportunityId);
  Future<void> publish(int opportunityId);
  Future<void> archive(int opportunityId);
  Future<void> setCoverImage({
    required int projectId,
    required int opportunityId,
    required List<int> fileBytes,
    required String fileName,
  });
}

class ApiOpportunityFormRepository implements OpportunityFormRepository {
  const ApiOpportunityFormRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<OpportunityFormChoices> fetchChoices() async {
    final responses = await Future.wait<dynamic>(<Future<dynamic>>[
      _api.get<dynamic>('/project-stages'),
      _api.get<dynamic>(
        '/funding-goals',
        queryParameters: {'includeInactive': false},
      ),
      _api.getAtOriginPath<dynamic>(
        '/api/currency',
        queryParameters: {'purpose': 'funding', 'includeInactive': false},
      ),
    ]);
    final stages = _list(responses[0].data);
    final goals = _list(responses[1].data);
    final currencies = responses[2].data;
    if (currencies is! List) {
      throw const ApiError(message: 'Funding currencies were not returned.');
    }
    return OpportunityFormChoices(
      stages: stages
          .map(OpportunityStageChoice.fromJson)
          .where((item) => item.code.isNotEmpty && item.value > 0)
          .toList(growable: false),
      fundingGoals: goals
          .map(OpportunityGoalChoice.fromJson)
          .where((item) => item.id > 0)
          .toList(growable: false),
      currencies: currencies
          .whereType<Map>()
          .map(
            (item) => OpportunityCurrencyChoice.fromJson(
              Map<String, dynamic>.from(item),
            ),
          )
          .where((item) => item.code.length == 3)
          .toList(growable: false),
    );
  }

  @override
  Future<int> create(Map<String, dynamic> request) async {
    final response = await _api.post<dynamic>('/opportunities', data: request);
    final root = response.data;
    final data = root is Map && root.containsKey('data') ? root['data'] : root;
    final id = data is Map ? _int(data['id']) : 0;
    if (id <= 0) {
      throw const ApiError(
        message: 'The created opportunity identifier was not returned.',
      );
    }
    return id;
  }

  @override
  Future<void> update(int opportunityId, Map<String, dynamic> request) async {
    await _api.put<dynamic>('/opportunities/$opportunityId', data: request);
  }

  @override
  Future<OpportunityPublishQuote> quotePublish() async {
    final response = await _api.get<dynamic>(
      '/wallet/me/paid-actions/PublishOpportunity/quote',
    );
    final payload = response.data;
    final data = payload is Map ? payload['data'] : null;
    if (data is! Map) {
      throw const ApiError(
        message: 'Opportunity publishing price was not returned.',
      );
    }
    return OpportunityPublishQuote.fromJson(Map<String, dynamic>.from(data));
  }

  @override
  Future<void> publish(int opportunityId) async {
    await _api.post<dynamic>('/opportunities/$opportunityId/publish');
  }

  @override
  Future<void> submitForReview(int opportunityId) async {
    await _api.post<dynamic>('/opportunities/$opportunityId/submit-review');
  }

  @override
  Future<void> archive(int opportunityId) async {
    await _api.post<dynamic>('/opportunities/$opportunityId/archive');
  }

  @override
  Future<void> setCoverImage({
    required int projectId,
    required int opportunityId,
    required List<int> fileBytes,
    required String fileName,
  }) async {
    final uploaded = await FopxGovernedFileUploader(_api).upload(
      bytes: fileBytes,
      fileName: fileName,
      categoryCode: 'OPPORTUNITYCOVER',
      projectId: projectId,
      entityType: 'Opportunity',
      entityId: opportunityId.toString(),
    );

    await _api.post<dynamic>(
      '/opportunities/$opportunityId/media',
      data: <String, dynamic>{
        'fileKey': uploaded.fileKey,
        'mediaType': 'Cover',
        'purpose': 'Cover',
        'isCover': true,
        'isPublic': true,
        'sortOrder': 0,
      },
    );
  }

  List<Map<String, dynamic>> _list(dynamic payload) {
    final data =
        payload is Map && payload.containsKey('data')
            ? payload['data']
            : payload;
    if (data is! List) {
      throw const ApiError(
        message: 'Opportunity form choices were not returned.',
      );
    }
    return data
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false);
  }
}

final opportunityFormRepositoryProvider = Provider<OpportunityFormRepository>(
  (ref) => ApiOpportunityFormRepository(ref.read(apiClientProvider)),
);

final opportunityFormChoicesProvider =
    FutureProvider.autoDispose<OpportunityFormChoices>(
      (ref) => ref.read(opportunityFormRepositoryProvider).fetchChoices(),
    );

String _string(dynamic value) => value?.toString() ?? '';

int _int(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value)) ?? 0;

double _double(dynamic value) =>
    value is num ? value.toDouble() : double.tryParse(_string(value)) ?? 0;
