import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

import 'chat_models.dart';

abstract interface class FounderChatRepository {
  Future<List<FounderConversationRequest>> fetchConversationRequests();
  Future<void> acceptConversationRequest(String requestId);
  Future<void> rejectConversationRequest(String requestId);
  Future<void> withdrawConversationRequest(String requestId);
  Future<List<FounderConversation>> fetchConversations();
  Future<FounderConversation> fetchConversation(String conversationId);
  Future<void> markReadyToProceed(String conversationId);
  Future<void> closeConversation(String conversationId, String? reason);
  Future<List<FounderChatMessage>> fetchMessages(String conversationId);
  Future<void> markMessagesRead(String conversationId);
  Future<List<FounderNegotiationOffer>> fetchOffers(String conversationId);
  Future<void> sendMessage(String conversationId, String message);
  Future<void> acceptOffer(String conversationId, int offerId);
  Future<void> rejectOffer(String conversationId, int offerId);
  Future<List<FounderOfferCurrency>> fetchOfferCurrencies();
  Future<FounderOfferQuote> quoteFirstOffer();
  Future<FounderOfferQuote> quoteOfferReplacement();
  Future<void> sendOffer(String conversationId, Map<String, dynamic> offer);
  Future<void> replaceOffer(
    String conversationId,
    int offerId,
    Map<String, dynamic> offer,
  );
  Future<void> withdrawOffer(String conversationId, int offerId);
  Future<List<FounderNegotiationOffer>> fetchDirectOffers(int opportunityId);
  Future<void> acceptDirectOffer(int opportunityId, int offerId);
  Future<void> rejectDirectOffer(int opportunityId, int offerId);
}

class ApiFounderChatRepository implements FounderChatRepository {
  const ApiFounderChatRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<List<FounderConversationRequest>> fetchConversationRequests() async {
    final response = await _api.get<dynamic>('/conversation-requests');
    final payload = _data(response.data);
    if (payload is! List) {
      throw const ApiError(
        message: 'Conversation request data was not returned.',
      );
    }
    return payload
        .whereType<Map>()
        .map(
          (item) => FounderConversationRequest.fromJson(
            Map<String, dynamic>.from(item),
          ),
        )
        .toList(growable: false);
  }

  @override
  Future<void> acceptConversationRequest(String requestId) async {
    await _api.post<dynamic>('/conversation-requests/$requestId/accept');
  }

  @override
  Future<void> rejectConversationRequest(String requestId) async {
    await _api.post<dynamic>(
      '/conversation-requests/$requestId/reject',
      data: <String, dynamic>{'reason': null},
    );
  }

  @override
  Future<void> withdrawConversationRequest(String requestId) async {
    await _api.post<dynamic>('/conversation-requests/$requestId/withdraw');
  }

  @override
  Future<List<FounderConversation>> fetchConversations() async {
    final response = await _api.get<dynamic>('/conversations');
    final payload = _data(response.data);
    if (payload is! List) {
      throw const ApiError(message: 'Conversation data was not returned.');
    }
    return payload
        .whereType<Map>()
        .map(
          (item) =>
              FounderConversation.fromJson(Map<String, dynamic>.from(item)),
        )
        .toList(growable: false);
  }

  @override
  Future<FounderConversation> fetchConversation(String conversationId) async {
    final response = await _api.get<dynamic>('/conversations/$conversationId');
    final payload = _data(response.data);
    if (payload is! Map) {
      throw const ApiError(message: 'Conversation details were not returned.');
    }
    return FounderConversation.fromJson(Map<String, dynamic>.from(payload));
  }

  @override
  Future<void> markReadyToProceed(String conversationId) async {
    await _api.post<dynamic>('/conversations/$conversationId/ready-to-proceed');
  }

  @override
  Future<void> closeConversation(String conversationId, String? reason) async {
    await _api.post<dynamic>(
      '/conversations/$conversationId/close',
      data: <String, dynamic>{'reason': reason},
    );
  }

  @override
  Future<List<FounderChatMessage>> fetchMessages(String conversationId) async {
    final response = await _api.get<dynamic>(
      '/conversations/$conversationId/messages',
    );
    final payload = _data(response.data);
    if (payload is! List) {
      throw const ApiError(message: 'Message data was not returned.');
    }
    return payload
        .whereType<Map>()
        .map(
          (item) =>
              FounderChatMessage.fromJson(Map<String, dynamic>.from(item)),
        )
        .toList(growable: false);
  }

  @override
  Future<void> markMessagesRead(String conversationId) async {
    await _api.patch<dynamic>('/conversations/$conversationId/messages/read');
  }

  @override
  Future<void> sendMessage(String conversationId, String message) async {
    await _api.post<dynamic>(
      '/conversations/$conversationId/messages',
      data: <String, dynamic>{'message': message.trim()},
    );
  }

  @override
  Future<List<FounderNegotiationOffer>> fetchOffers(
    String conversationId,
  ) async {
    final response = await _api.get<dynamic>(
      '/conversations/$conversationId/offers',
    );
    final payload = _data(response.data);
    if (payload is! List) {
      throw const ApiError(message: 'Offer data was not returned.');
    }
    return payload
        .whereType<Map>()
        .map(
          (item) =>
              FounderNegotiationOffer.fromJson(Map<String, dynamic>.from(item)),
        )
        .toList(growable: false);
  }

  @override
  Future<void> acceptOffer(String conversationId, int offerId) async {
    await _api.post<dynamic>(
      '/conversations/$conversationId/offers/$offerId/accept',
    );
  }

  @override
  Future<void> rejectOffer(String conversationId, int offerId) async {
    await _api.post<dynamic>(
      '/conversations/$conversationId/offers/$offerId/reject',
    );
  }

  @override
  Future<List<FounderOfferCurrency>> fetchOfferCurrencies() async {
    final response = await _api.getAtOriginPath<dynamic>(
      '/api/currency',
      queryParameters: <String, dynamic>{
        'purpose': 'funding',
        'includeInactive': false,
      },
    );
    final payload = response.data;
    if (payload is! List) {
      throw const ApiError(message: 'Offer currencies were not returned.');
    }
    return payload
        .whereType<Map>()
        .map(
          (item) =>
              FounderOfferCurrency.fromJson(Map<String, dynamic>.from(item)),
        )
        .where((currency) => currency.code.length == 3)
        .toList(growable: false);
  }

  @override
  Future<FounderOfferQuote> quoteFirstOffer() async {
    return _quoteOffer('SendFirstOffer');
  }

  @override
  Future<FounderOfferQuote> quoteOfferReplacement() async {
    return _quoteOffer('SendOfferReplacement');
  }

  Future<FounderOfferQuote> _quoteOffer(String action) async {
    final response = await _api.get<dynamic>(
      '/wallet/me/paid-actions/$action/quote',
    );
    final payload = _data(response.data);
    if (payload is! Map) {
      throw const ApiError(message: 'Offer pricing was not returned.');
    }
    return FounderOfferQuote.fromJson(Map<String, dynamic>.from(payload));
  }

  @override
  Future<void> sendOffer(
    String conversationId,
    Map<String, dynamic> offer,
  ) async {
    await _api.post<dynamic>(
      '/conversations/$conversationId/offers',
      data: offer,
    );
  }

  @override
  Future<void> replaceOffer(
    String conversationId,
    int offerId,
    Map<String, dynamic> offer,
  ) async {
    await _api.post<dynamic>(
      '/conversations/$conversationId/offers/$offerId/replace',
      data: offer,
    );
  }

  @override
  Future<void> withdrawOffer(String conversationId, int offerId) async {
    await _api.post<dynamic>(
      '/conversations/$conversationId/offers/$offerId/withdraw',
    );
  }

  @override
  Future<List<FounderNegotiationOffer>> fetchDirectOffers(
    int opportunityId,
  ) async {
    final response = await _api.get<dynamic>(
      '/opportunities/$opportunityId/offers',
    );
    final payload = _data(response.data);
    if (payload is! List) {
      throw const ApiError(message: 'Direct offer data was not returned.');
    }
    return payload
        .whereType<Map>()
        .map(
          (item) =>
              FounderNegotiationOffer.fromJson(Map<String, dynamic>.from(item)),
        )
        .toList(growable: false);
  }

  @override
  Future<void> acceptDirectOffer(int opportunityId, int offerId) async {
    await _api.post<dynamic>(
      '/opportunities/$opportunityId/offers/$offerId/accept',
    );
  }

  @override
  Future<void> rejectDirectOffer(int opportunityId, int offerId) async {
    await _api.post<dynamic>(
      '/opportunities/$opportunityId/offers/$offerId/reject',
    );
  }

  dynamic _data(dynamic value) =>
      value is Map && value.containsKey('data') ? value['data'] : value;
}

final founderChatRepositoryProvider = Provider<FounderChatRepository>(
  (ref) => ApiFounderChatRepository(ref.read(apiClientProvider)),
);

final founderConversationsProvider =
    FutureProvider.autoDispose<List<FounderConversation>>(
      (ref) => ref.read(founderChatRepositoryProvider).fetchConversations(),
    );

final founderConversationProvider = FutureProvider.autoDispose
    .family<FounderConversation, String>(
      (ref, conversationId) => ref
          .read(founderChatRepositoryProvider)
          .fetchConversation(conversationId),
    );

final founderConversationRequestsProvider = FutureProvider.autoDispose<
  List<FounderConversationRequest>
>((ref) => ref.read(founderChatRepositoryProvider).fetchConversationRequests());

final founderChatMessagesProvider = FutureProvider.autoDispose
    .family<List<FounderChatMessage>, String>(
      (ref, conversationId) =>
          ref.read(founderChatRepositoryProvider).fetchMessages(conversationId),
    );

final founderChatOffersProvider = FutureProvider.autoDispose
    .family<List<FounderNegotiationOffer>, String>(
      (ref, conversationId) =>
          ref.read(founderChatRepositoryProvider).fetchOffers(conversationId),
    );

final founderDirectOffersProvider = FutureProvider.autoDispose
    .family<List<FounderNegotiationOffer>, int>(
      (ref, opportunityId) => ref
          .read(founderChatRepositoryProvider)
          .fetchDirectOffers(opportunityId),
    );

final founderOfferCurrenciesProvider = FutureProvider.autoDispose
    .family<List<FounderOfferCurrency>, String>(
      (ref, conversationId) =>
          ref.read(founderChatRepositoryProvider).fetchOfferCurrencies(),
    );
