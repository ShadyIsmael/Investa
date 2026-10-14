class FounderConversation {
  const FounderConversation({
    required this.id,
    required this.opportunityId,
    required this.opportunityTitle,
    required this.counterpartyName,
    required this.counterpartyRole,
    required this.status,
    required this.unreadCount,
    required this.updatedAt,
    this.currentUserReady = false,
    this.founderReady = false,
    this.investorReady = false,
    this.canContinue = false,
    this.projectRoomUnlocked = false,
    this.isVisibleToCurrentUser = true,
    this.closedAt,
    this.closeReason,
  });

  final String id;
  final int opportunityId;
  final String opportunityTitle;
  final String counterpartyName;
  final String counterpartyRole;
  final String status;
  final int unreadCount;
  final DateTime? updatedAt;
  final bool currentUserReady;
  final bool founderReady;
  final bool investorReady;
  final bool canContinue;
  final bool projectRoomUnlocked;
  final bool isVisibleToCurrentUser;
  final DateTime? closedAt;
  final String? closeReason;

  bool get isClosed =>
      closedAt != null || status.toLowerCase().contains('closed');

  factory FounderConversation.fromJson(Map<String, dynamic> json) {
    final opportunity = _map(json['opportunity']);
    final investor = _map(json['investor']);
    final counterpartyName = _string(json['counterpartyName']);
    return FounderConversation(
      id: _string(json['id']),
      opportunityId: _int(json['opportunityId']),
      opportunityTitle: _string(opportunity['title']),
      counterpartyName:
          counterpartyName.isNotEmpty
              ? counterpartyName
              : _string(investor['name']).isNotEmpty
              ? _string(investor['name'])
              : _string(json['requesterName']),
      counterpartyRole: _string(json['counterpartyRole']),
      status:
          _string(json['statusText']).isNotEmpty
              ? _string(json['statusText'])
              : _string(json['conversationStatus']),
      unreadCount: _int(json['unreadCount']),
      updatedAt: DateTime.tryParse(
        _string(json['updatedAt']).isNotEmpty
            ? _string(json['updatedAt'])
            : _string(json['createdAt']),
      ),
      currentUserReady: json['currentUserReady'] == true,
      founderReady: json['founderReady'] == true,
      investorReady: json['investorReady'] == true,
      canContinue: json['canContinue'] == true,
      projectRoomUnlocked: json['projectRoomUnlocked'] == true,
      isVisibleToCurrentUser: json['isVisibleToCurrentUser'] != false,
      closedAt: DateTime.tryParse(_string(json['closedAt'])),
      closeReason: _nullableString(json['closeReason']),
    );
  }
}

class FounderConversationRequest {
  const FounderConversationRequest({
    required this.id,
    required this.opportunityId,
    required this.opportunityTitle,
    required this.counterpartyName,
    required this.message,
    required this.status,
    required this.direction,
    required this.canAccept,
    required this.canReject,
    required this.canWithdraw,
    this.acceptedConversationId,
    this.createdAt,
  });

  final String id;
  final int opportunityId;
  final String opportunityTitle;
  final String counterpartyName;
  final String? message;
  final String status;
  final String direction;
  final bool canAccept;
  final bool canReject;
  final bool canWithdraw;
  final String? acceptedConversationId;
  final DateTime? createdAt;

  factory FounderConversationRequest.fromJson(Map<String, dynamic> json) {
    final opportunity = _map(json['opportunity']);
    return FounderConversationRequest(
      id: _string(json['id']),
      opportunityId: _int(json['opportunityId']),
      opportunityTitle: _string(opportunity['title']),
      counterpartyName: _string(json['counterpartyName']),
      message: _nullableString(json['message']),
      status:
          _string(json['statusText']).isNotEmpty
              ? _string(json['statusText'])
              : _string(json['status']),
      direction: _string(json['direction']),
      canAccept: json['canAccept'] == true,
      canReject: json['canReject'] == true,
      canWithdraw: json['canWithdraw'] == true,
      acceptedConversationId: _nullableString(json['acceptedConversationId']),
      createdAt: DateTime.tryParse(_string(json['createdAt'])),
    );
  }
}

class FounderChatMessage {
  const FounderChatMessage({
    required this.id,
    required this.senderName,
    required this.message,
    required this.sentAt,
    required this.isDeleted,
  });

  final String id;
  final String senderName;
  final String message;
  final DateTime? sentAt;
  final bool isDeleted;

  factory FounderChatMessage.fromJson(Map<String, dynamic> json) =>
      FounderChatMessage(
        id: _string(json['id']),
        senderName: _string(json['senderName']),
        message: _string(json['message']),
        sentAt: DateTime.tryParse(_string(json['sentAt'])),
        isDeleted: json['isDeleted'] == true,
      );
}

class FounderNegotiationOfferLeg {
  const FounderNegotiationOfferLeg({
    required this.type,
    required this.amount,
    this.equityOwnershipModel,
    this.equityPercentage,
    this.investorShareCount,
    this.totalIssuedShares,
    this.shareClass,
    this.pricePerShare,
    this.preMoneyValuation,
    this.postMoneyValuation,
    this.effectiveOwnershipDate,
    this.sharesTerms,
    this.returnRate,
    this.termMonths,
    this.repaymentModel,
    this.profitSharePercentage,
    this.profitSharingPayoutFrequency,
    this.exitTerms,
  });

  final String type;
  final double amount;
  final String? equityOwnershipModel;
  final double? equityPercentage;
  final double? investorShareCount;
  final double? totalIssuedShares;
  final String? shareClass;
  final double? pricePerShare;
  final double? preMoneyValuation;
  final double? postMoneyValuation;
  final DateTime? effectiveOwnershipDate;
  final String? sharesTerms;
  final double? returnRate;
  final int? termMonths;
  final String? repaymentModel;
  final double? profitSharePercentage;
  final String? profitSharingPayoutFrequency;
  final String? exitTerms;

  factory FounderNegotiationOfferLeg.fromJson(Map<String, dynamic> json) =>
      FounderNegotiationOfferLeg(
        type: _string(json['legType']),
        amount: _number(json['amount']) ?? 0,
        equityOwnershipModel: _nullableString(json['equityOwnershipModel']),
        equityPercentage: _number(json['equityPercentage']),
        investorShareCount: _number(json['investorShareCount']),
        totalIssuedShares: _number(json['totalIssuedShares']),
        shareClass: _nullableString(json['shareClass']),
        pricePerShare: _number(json['pricePerShare']),
        preMoneyValuation: _number(json['preMoneyValuation']),
        postMoneyValuation: _number(json['postMoneyValuation']),
        effectiveOwnershipDate: DateTime.tryParse(
          _string(json['effectiveOwnershipDate']),
        ),
        sharesTerms: _nullableString(json['sharesTerms']),
        returnRate: _number(json['returnRate']),
        termMonths: _intOrNull(json['termMonths']),
        repaymentModel: _nullableString(json['repaymentModel']),
        profitSharePercentage: _number(json['profitSharePercentage']),
        profitSharingPayoutFrequency: _nullableString(
          json['profitSharingPayoutFrequency'],
        ),
        exitTerms: _nullableString(json['exitTerms']),
      );
}

class FounderNegotiationOffer {
  const FounderNegotiationOffer({
    required this.id,
    required this.createdByName,
    required this.createdByRole,
    required this.version,
    this.replacesOfferId,
    required this.status,
    required this.currency,
    required this.note,
    required this.createdAt,
    required this.legs,
    required this.canAccept,
    required this.canReject,
    required this.canRespond,
    required this.canWithdraw,
  });

  final int id;
  final String createdByName;
  final String createdByRole;
  final int version;
  final int? replacesOfferId;
  final String status;
  final String currency;
  final String note;
  final DateTime? createdAt;
  final List<FounderNegotiationOfferLeg> legs;
  final bool canAccept;
  final bool canReject;
  final bool canRespond;
  final bool canWithdraw;

  factory FounderNegotiationOffer.fromJson(Map<String, dynamic> json) {
    final rawLegs = json['legs'];
    return FounderNegotiationOffer(
      id: _int(json['id']),
      createdByName: _string(json['createdByName']),
      createdByRole: _string(json['createdByRole']),
      version: _int(json['version']),
      replacesOfferId: _intOrNull(json['replacesOfferId']),
      status: _string(json['status']),
      currency: _string(json['currency']),
      note: _string(json['note']),
      createdAt: DateTime.tryParse(_string(json['createdAt'])),
      legs:
          rawLegs is List
              ? rawLegs
                  .whereType<Map>()
                  .map(
                    (item) => FounderNegotiationOfferLeg.fromJson(
                      Map<String, dynamic>.from(item),
                    ),
                  )
                  .toList(growable: false)
              : const <FounderNegotiationOfferLeg>[],
      canAccept: json['canAccept'] == true,
      canReject: json['canReject'] == true,
      canRespond: json['canRespond'] == true,
      canWithdraw: json['canWithdraw'] == true,
    );
  }
}

class FounderOfferCurrency {
  const FounderOfferCurrency({
    required this.code,
    required this.nameEn,
    required this.nameAr,
  });

  final String code;
  final String nameEn;
  final String nameAr;

  factory FounderOfferCurrency.fromJson(Map<String, dynamic> json) =>
      FounderOfferCurrency(
        code: _string(json['isoCode']).toUpperCase(),
        nameEn: _string(json['englishName']),
        nameAr: _string(json['arabicName']),
      );

  String label(String languageCode) {
    final name = languageCode == 'ar' ? nameAr : nameEn;
    return name.isEmpty ? code : '$code · $name';
  }
}

class FounderOfferQuote {
  const FounderOfferQuote({
    required this.creditCost,
    required this.currentBalance,
    required this.hasSufficientCredit,
    required this.chargingEnabled,
  });

  final double creditCost;
  final double currentBalance;
  final bool hasSufficientCredit;
  final bool chargingEnabled;

  factory FounderOfferQuote.fromJson(Map<String, dynamic> json) =>
      FounderOfferQuote(
        creditCost: _number(json['creditCost']) ?? 0,
        currentBalance: _number(json['currentBalance']) ?? 0,
        hasSufficientCredit: json['hasSufficientCredit'] == true,
        chargingEnabled: json['chargingEnabled'] == true,
      );
}

Map<String, dynamic> _map(dynamic value) =>
    value is Map ? Map<String, dynamic>.from(value) : <String, dynamic>{};

String _string(dynamic value) => value?.toString() ?? '';

String? _nullableString(dynamic value) {
  final result = value?.toString().trim();
  return result == null || result.isEmpty ? null : result;
}

int _int(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value)) ?? 0;

int? _intOrNull(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value));

double? _number(dynamic value) =>
    value is num ? value.toDouble() : double.tryParse(_string(value));
