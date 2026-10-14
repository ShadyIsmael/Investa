import 'package:flutter/material.dart';
import 'package:fopx_core/fopx_core.dart';

class FounderOpportunity {
  const FounderOpportunity({
    required this.title,
    required this.status,
    required this.fundingStatus,
    this.projectStage = '',
    this.id = 0,
    this.projectId = 0,
    this.sequenceNumber = 0,
    this.createdAt,
    this.updatedAt,
    this.shortDescription,
    this.description,
    this.useOfFunds,
    this.fundingTarget,
    this.fundingCurrency,
    this.minimumInvestmentAmount,
    this.maximumInvestmentAmount,
    this.expectedDurationMonths,
    this.publicInvestmentTermsSummary,
    this.expectedReturnSummary,
    this.fundingOpensAt,
    this.fundingClosesAt,
    this.closedAt,
    this.fundingGoalId,
    this.projectStageCustomName,
    this.coverImageUrl,
    this.tagIds = const <int>[],
    this.isLockedForEditing = false,
    this.canFounderEdit = false,
    this.canFounderSubmitForReview = false,
    this.canFounderPublish = false,
    this.canFounderArchive = false,
  });

  final int id;
  final int projectId;
  final int sequenceNumber;
  final String title;
  final String status;
  final String fundingStatus;
  final String projectStage;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? shortDescription;
  final String? description;
  final String? useOfFunds;
  final double? fundingTarget;
  final String? fundingCurrency;
  final double? minimumInvestmentAmount;
  final double? maximumInvestmentAmount;
  final int? expectedDurationMonths;
  final String? publicInvestmentTermsSummary;
  final String? expectedReturnSummary;
  final DateTime? fundingOpensAt;
  final DateTime? fundingClosesAt;
  final DateTime? closedAt;
  final int? fundingGoalId;
  final String? projectStageCustomName;
  final String? coverImageUrl;
  final List<int> tagIds;
  final bool isLockedForEditing;
  final bool canFounderEdit;
  final bool canFounderSubmitForReview;
  final bool canFounderPublish;
  final bool canFounderArchive;

  factory FounderOpportunity.fromJson(Map<String, dynamic> json) {
    return FounderOpportunity(
      title: _string(json['title']),
      status: _enumName(json['status'], _opportunityStatuses, numericStart: 1),
      fundingStatus: _enumName(json['fundingStatus'], _fundingStatuses),
      projectStage: _enumName(
        json['projectStage'],
        _projectStages,
        numericStart: 1,
      ),
      id: _int(json['id']),
      projectId: _int(json['projectId']),
      sequenceNumber: _int(json['sequenceNumber']),
      createdAt: _date(json['createdAt']),
      updatedAt: _date(json['updatedAt']),
      shortDescription: _nullableString(json['shortDescription']),
      description: _nullableString(json['description']),
      useOfFunds: _nullableString(json['useOfFunds']),
      fundingTarget: _nullableDouble(json['fundingTarget']),
      fundingCurrency: _nullableString(json['fundingCurrency']),
      minimumInvestmentAmount: _nullableDouble(json['minimumInvestmentAmount']),
      maximumInvestmentAmount: _nullableDouble(json['maximumInvestmentAmount']),
      expectedDurationMonths:
          json['expectedDurationMonths'] == null
              ? null
              : _int(json['expectedDurationMonths']),
      publicInvestmentTermsSummary: _nullableString(
        json['publicInvestmentTermsSummary'],
      ),
      expectedReturnSummary: _nullableString(json['expectedReturnSummary']),
      fundingOpensAt: _date(json['fundingOpensAt']),
      fundingClosesAt: _date(json['fundingClosesAt']),
      closedAt: _date(json['closedAt']),
      fundingGoalId: _intOrNull(_map(json['fundingGoal'])['id']),
      projectStageCustomName: _nullableString(json['projectStageCustomName']),
      coverImageUrl: _nullableString(json['coverImageUrl']),
      tagIds: _mapList(json['tags'], (item) => _int(item['id'])),
      isLockedForEditing: json['isLockedForEditing'] == true,
      canFounderEdit: json['canFounderEdit'] == true,
      canFounderSubmitForReview: json['canFounderSubmitForReview'] == true,
      canFounderPublish: json['canFounderPublish'] == true,
      canFounderArchive: json['canFounderArchive'] == true,
    );
  }

  bool get isNonTerminal {
    final normalized = status.toLowerCase();
    return normalized != 'rejected' &&
        normalized != 'completed' &&
        normalized != 'archived';
  }

  bool get isPast =>
      const {'completed', 'archived'}.contains(status.toLowerCase());
}

class FounderOpportunityDetail extends FounderOpportunity {
  const FounderOpportunityDetail({
    required super.id,
    required super.projectId,
    required super.title,
    required super.status,
    required super.fundingStatus,
    super.projectStage,
    super.sequenceNumber,
    super.createdAt,
    super.updatedAt,
    super.shortDescription,
    super.description,
    super.useOfFunds,
    super.fundingTarget,
    super.fundingCurrency,
    super.minimumInvestmentAmount,
    super.maximumInvestmentAmount,
    super.expectedDurationMonths,
    super.publicInvestmentTermsSummary,
    super.expectedReturnSummary,
    super.fundingOpensAt,
    super.fundingClosesAt,
    super.closedAt,
    super.fundingGoalId,
    super.projectStageCustomName,
    super.coverImageUrl,
    super.tagIds,
    super.isLockedForEditing,
    super.canFounderEdit,
    super.canFounderSubmitForReview,
    super.canFounderPublish,
    super.canFounderArchive,
  });

  factory FounderOpportunityDetail.fromJson(
    Map<String, dynamic> json,
  ) => FounderOpportunityDetail(
    id: _int(json['id']),
    projectId: _int(json['projectId']),
    sequenceNumber: _int(json['sequenceNumber']),
    title: _string(json['title']),
    status: _enumName(json['status'], _opportunityStatuses, numericStart: 1),
    fundingStatus: _enumName(json['fundingStatus'], _fundingStatuses),
    projectStage: _enumName(
      json['projectStage'],
      _projectStages,
      numericStart: 1,
    ),
    createdAt: _date(json['createdAt']),
    updatedAt: _date(json['updatedAt']),
    shortDescription: _nullableString(json['shortDescription']),
    description: _nullableString(json['description']),
    useOfFunds: _nullableString(json['useOfFunds']),
    fundingTarget: _nullableDouble(json['fundingTarget']),
    fundingCurrency: _nullableString(json['fundingCurrency']),
    minimumInvestmentAmount: _nullableDouble(json['minimumInvestmentAmount']),
    maximumInvestmentAmount: _nullableDouble(json['maximumInvestmentAmount']),
    expectedDurationMonths:
        json['expectedDurationMonths'] == null
            ? null
            : _int(json['expectedDurationMonths']),
    publicInvestmentTermsSummary: _nullableString(
      json['publicInvestmentTermsSummary'],
    ),
    expectedReturnSummary: _nullableString(json['expectedReturnSummary']),
    fundingOpensAt: _date(json['fundingOpensAt']),
    fundingClosesAt: _date(json['fundingClosesAt']),
    closedAt: _date(json['closedAt']),
    fundingGoalId: _intOrNull(_map(json['fundingGoal'])['id']),
    projectStageCustomName: _nullableString(json['projectStageCustomName']),
    coverImageUrl: _nullableString(json['coverImageUrl']),
    tagIds: _mapList(json['tags'], (item) => _int(item['id'])),
    isLockedForEditing: json['isLockedForEditing'] == true,
    canFounderEdit: json['canFounderEdit'] == true,
    canFounderSubmitForReview: json['canFounderSubmitForReview'] == true,
    canFounderPublish: json['canFounderPublish'] == true,
    canFounderArchive: json['canFounderArchive'] == true,
  );
}

class FounderProjectRoom {
  const FounderProjectRoom({
    required this.projectId,
    required this.displayName,
    required this.summary,
    required this.isFounder,
    required this.updates,
    required this.milestones,
    required this.timeline,
    required this.documents,
    required this.opportunities,
    this.availableDocumentCategories = const <ProjectRoomDocumentCategory>[],
  });

  final int projectId;
  final String displayName;
  final String summary;
  final bool isFounder;
  final List<ProjectRoomEntry> updates;
  final List<ProjectRoomEntry> milestones;
  final List<ProjectRoomEntry> timeline;
  final List<ProjectRoomDocument> documents;
  final List<ProjectRoomOpportunity> opportunities;
  final List<ProjectRoomDocumentCategory> availableDocumentCategories;

  factory FounderProjectRoom.fromJson(Map<String, dynamic> json) =>
      FounderProjectRoom(
        projectId: _int(json['projectId']),
        displayName: _string(json['displayName']),
        summary: _string(json['summary']),
        isFounder: json['isFounder'] == true,
        updates: _mapList(json['updates'], ProjectRoomEntry.fromJson),
        milestones: _mapList(json['milestones'], ProjectRoomEntry.fromJson),
        timeline: _mapList(json['timeline'], ProjectRoomEntry.fromJson),
        documents: _mapList(json['documents'], ProjectRoomDocument.fromJson),
        opportunities: _mapList(
          json['opportunities'],
          ProjectRoomOpportunity.fromJson,
        ),
        availableDocumentCategories: _mapList(
          json['availableDocumentCategories'],
          ProjectRoomDocumentCategory.fromJson,
        ),
      );
}

class ProjectRoomDocumentCategory {
  const ProjectRoomDocumentCategory({
    required this.code,
    required this.nameEn,
    required this.nameAr,
    required this.allowedExtensions,
    required this.maxFileSizeBytes,
  });
  final String code;
  final String nameEn;
  final String nameAr;
  final String allowedExtensions;
  final int maxFileSizeBytes;

  factory ProjectRoomDocumentCategory.fromJson(Map<String, dynamic> json) =>
      ProjectRoomDocumentCategory(
        code: _string(json['code']),
        nameEn: _string(json['nameEn']),
        nameAr: _string(json['nameAr']),
        allowedExtensions: _string(json['allowedExtensions']),
        maxFileSizeBytes: _int(json['maxFileSizeBytes']),
      );
}

class ProjectRoomEntry {
  const ProjectRoomEntry({
    required this.title,
    required this.description,
    required this.createdAt,
    this.id = 0,
    this.entryType = 'Update',
    this.eventType,
    this.opportunityId,
    this.dueAt,
    this.completedAt,
  });
  final String title;
  final int id;
  final String entryType;
  final String? eventType;
  final int? opportunityId;
  final String? description;
  final DateTime? createdAt;
  final DateTime? dueAt;
  final DateTime? completedAt;
  factory ProjectRoomEntry.fromJson(Map<String, dynamic> json) =>
      ProjectRoomEntry(
        id: _int(json['id']),
        entryType: _string(json['entryType']),
        eventType: _nullableString(json['eventType']),
        opportunityId:
            json['opportunityId'] == null ? null : _int(json['opportunityId']),
        title: _string(json['title']),
        description: _nullableString(json['description']),
        createdAt: _date(json['createdAt']),
        dueAt: _date(json['dueAt']),
        completedAt: _date(json['completedAt']),
      );
}

class ProjectRoomDocument {
  const ProjectRoomDocument({
    required this.fileName,
    required this.documentType,
    required this.createdAt,
    this.id = 0,
    this.category = '',
    this.mimeType = '',
    this.fileSize = 0,
    this.visibility = 'ProjectMembers',
    this.downloadUrl = '',
    this.previewUrl,
    this.canDownload = false,
  });
  final int id;
  final String fileName;
  final String documentType;
  final String category;
  final String mimeType;
  final int fileSize;
  final String visibility;
  final String downloadUrl;
  final String? previewUrl;
  final bool canDownload;
  final DateTime? createdAt;
  factory ProjectRoomDocument.fromJson(Map<String, dynamic> json) =>
      ProjectRoomDocument(
        id: _int(json['id']),
        fileName: _string(json['fileName']),
        documentType: _string(json['documentType']),
        category: _string(json['category']),
        mimeType: _string(json['mimeType']),
        fileSize: _int(json['fileSize']),
        visibility: _string(json['visibility']),
        downloadUrl: _string(json['downloadUrl']),
        previewUrl: _nullableString(json['previewUrl']),
        canDownload: json['canDownload'] == true,
        createdAt: _date(json['createdAt']),
      );
}

class ProjectRoomOpportunity {
  const ProjectRoomOpportunity({
    required this.opportunityId,
    required this.title,
    required this.hasAccess,
  });
  final int opportunityId;
  final String title;
  final bool hasAccess;
  factory ProjectRoomOpportunity.fromJson(Map<String, dynamic> json) =>
      ProjectRoomOpportunity(
        opportunityId: _int(json['opportunityId']),
        title: _string(json['title']),
        hasAccess: json['hasOriginatingOpportunityAccess'] == true,
      );
}

List<T> _mapList<T>(dynamic value, T Function(Map<String, dynamic>) fromJson) =>
    value is List
        ? value
            .whereType<Map>()
            .map((item) => fromJson(Map<String, dynamic>.from(item)))
            .toList(growable: false)
        : const [];

class FounderProject {
  const FounderProject({
    required this.id,
    required this.displayName,
    required this.summary,
    required this.industry,
    required this.categoryEn,
    required this.categoryAr,
    this.categoryId,
    required this.stage,
    required this.status,
    required this.opportunityCount,
    required this.opportunities,
    required this.updatedAt,
    required this.logoUrl,
    this.teamDescription,
    this.businessModel,
    this.riskLevel,
    this.riskDisclosure,
    this.defaultCurrency,
  });

  final int id;
  final String displayName;
  final String summary;
  final String? industry;
  final String? categoryEn;
  final String? categoryAr;
  final int? categoryId;
  final String stage;
  final String status;
  final int opportunityCount;
  final List<FounderOpportunity> opportunities;
  final DateTime? updatedAt;
  final String? logoUrl;
  final String? teamDescription;
  final String? businessModel;
  final String? riskLevel;
  final String? riskDisclosure;
  final String? defaultCurrency;

  factory FounderProject.fromJson(Map<String, dynamic> json) {
    final category =
        json['category'] is Map
            ? Map<String, dynamic>.from(json['category'] as Map)
            : null;
    final rawOpportunities = json['opportunities'];
    final opportunities =
        rawOpportunities is List
            ? rawOpportunities
                .whereType<Map>()
                .map(
                  (item) => FounderOpportunity.fromJson(
                    Map<String, dynamic>.from(item),
                  ),
                )
                .toList(growable: false)
            : const <FounderOpportunity>[];

    return FounderProject(
      id: _int(json['id']),
      displayName: _string(json['displayName']),
      summary: _string(json['summary']),
      industry: _nullableString(json['industry']),
      categoryEn: _nullableString(category?['nameEn']),
      categoryAr: _nullableString(category?['nameAr']),
      categoryId: json['categoryId'] == null ? null : _int(json['categoryId']),
      stage: _enumName(json['projectStage'], _projectStages, numericStart: 1),
      status: _enumName(json['status'], _projectStatuses),
      opportunityCount: _int(
        json['opportunityCount'],
        fallback: opportunities.length,
      ),
      opportunities: opportunities,
      updatedAt: _date(json['updatedAt']),
      logoUrl: _nullableString(json['logoUrl']),
      teamDescription: _nullableString(json['teamDescription']),
      businessModel: _nullableString(json['businessModel']),
      riskLevel: _nullableString(json['riskLevel']),
      riskDisclosure: _nullableString(json['riskDisclosure']),
      defaultCurrency: _nullableString(json['defaultCurrency']),
    );
  }

  static List<FounderProject> listFromResponse(dynamic payload) {
    final root = payload is Map ? Map<String, dynamic>.from(payload) : null;
    final data = root?['data'];
    final rawList =
        data is List
            ? data
            : data is Map && data['items'] is List
            ? data['items'] as List
            : const <dynamic>[];
    return rawList
        .whereType<Map>()
        .map((item) => FounderProject.fromJson(Map<String, dynamic>.from(item)))
        .toList(growable: false);
  }

  int get totalOpportunityCount =>
      opportunityCount > 0 ? opportunityCount : opportunities.length;

  int get activeOpportunityCount =>
      opportunities.where((opportunity) => opportunity.isNonTerminal).length;

  bool get isActive => activeOpportunityCount > 0;

  String get monogram {
    final trimmed = displayName.trim();
    return trimmed.isEmpty ? '?' : trimmed.characters.first.toUpperCase();
  }

  String contextLine(FopxLocalizations l10n, Locale locale) {
    final category =
        locale.languageCode == 'ar'
            ? (categoryAr ?? categoryEn)
            : (categoryEn ?? categoryAr);
    final values = <String>[
      if (summary.trim().isNotEmpty) summary.trim(),
      if (industry?.trim().isNotEmpty == true) industry!.trim(),
      if (category?.trim().isNotEmpty == true) category!.trim(),
    ];
    return values.isEmpty ? l10n.projectContextUnavailable : values.join(' · ');
  }

  String stageLabel(FopxLocalizations l10n) => switch (stage.toLowerCase()) {
    'idea' => l10n.stageIdea,
    'mvp' => l10n.stageMvp,
    'startup' => l10n.stageStartup,
    'scaling' => l10n.stageScaling,
    'established' => l10n.stageEstablished,
    'other' => l10n.stageOther,
    _ => stage,
  };

  String statusLabel(FopxLocalizations l10n) => switch (status.toLowerCase()) {
    'draft' => l10n.statusDraft,
    'active' => l10n.statusActive,
    'paused' => l10n.statusPaused,
    'completed' => l10n.statusCompleted,
    'archived' => l10n.statusArchived,
    _ => status,
  };
}

class FounderProjectDetails {
  const FounderProjectDetails({
    required this.id,
    required this.displayName,
    required this.legalName,
    required this.summary,
    required this.description,
    required this.industry,
    required this.categoryEn,
    required this.categoryAr,
    this.categoryId,
    required this.stage,
    required this.status,
    required this.geography,
    required this.foundedOn,
    required this.websiteUrl,
    required this.logoUrl,
    this.teamDescription,
    this.businessModel,
    this.riskLevel,
    this.riskDisclosure,
    this.defaultCurrency,
    required this.opportunityCount,
    required this.opportunities,
    required this.createdAt,
    required this.updatedAt,
    this.canEdit = false,
    this.availableStatusTransitions = const <String>[],
  });

  final int id;
  final String displayName;
  final String? legalName;
  final String summary;
  final String description;
  final String? industry;
  final String? categoryEn;
  final String? categoryAr;
  final int? categoryId;
  final String stage;
  final String status;
  final String? geography;
  final DateTime? foundedOn;
  final String? websiteUrl;
  final String? logoUrl;
  final String? teamDescription;
  final String? businessModel;
  final String? riskLevel;
  final String? riskDisclosure;
  final String? defaultCurrency;
  final int opportunityCount;
  final List<FounderOpportunity> opportunities;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final bool canEdit;
  final List<String> availableStatusTransitions;

  factory FounderProjectDetails.fromJson(Map<String, dynamic> json) {
    final category =
        json['category'] is Map
            ? Map<String, dynamic>.from(json['category'] as Map)
            : null;
    final rawOpportunities = json['opportunities'];
    final opportunities =
        rawOpportunities is List
            ? rawOpportunities
                .whereType<Map>()
                .map(
                  (item) => FounderOpportunity.fromJson(
                    Map<String, dynamic>.from(item),
                  ),
                )
                .toList(growable: false)
            : const <FounderOpportunity>[];

    return FounderProjectDetails(
      id: _int(json['id']),
      displayName: _string(json['displayName']),
      legalName: _nullableString(json['legalName']),
      summary: _string(json['summary']),
      description: _string(json['description']),
      industry: _nullableString(json['industry']),
      categoryEn: _nullableString(category?['nameEn']),
      categoryAr: _nullableString(category?['nameAr']),
      categoryId: json['categoryId'] == null ? null : _int(json['categoryId']),
      stage: _enumName(json['projectStage'], _projectStages, numericStart: 1),
      status: _enumName(json['status'], _projectStatuses),
      geography: _nullableString(json['geography']),
      foundedOn: _date(json['foundedOn']),
      websiteUrl: _nullableString(json['websiteUrl']),
      logoUrl: _nullableString(json['logoUrl']),
      teamDescription: _nullableString(json['teamDescription']),
      businessModel: _nullableString(json['businessModel']),
      riskLevel: _nullableString(json['riskLevel']),
      riskDisclosure: _nullableString(json['riskDisclosure']),
      defaultCurrency: _nullableString(json['defaultCurrency']),
      opportunityCount: _int(
        json['opportunityCount'],
        fallback: opportunities.length,
      ),
      opportunities: opportunities,
      createdAt: _date(json['createdAt']),
      updatedAt: _date(json['updatedAt']),
      canEdit: json['canEdit'] == true,
      availableStatusTransitions:
          json['availableStatusTransitions'] is List
              ? (json['availableStatusTransitions'] as List)
                  .map((status) => _enumName(status, _projectStatuses))
                  .where((status) => status.isNotEmpty)
                  .toList(growable: false)
              : const <String>[],
    );
  }

  int get activeOpportunityCount =>
      opportunities.where((opportunity) => opportunity.isNonTerminal).length;

  String get monogram {
    final trimmed = displayName.trim();
    return trimmed.isEmpty ? '?' : trimmed.characters.first.toUpperCase();
  }

  String stageLabel(FopxLocalizations l10n) => switch (stage.toLowerCase()) {
    'idea' => l10n.stageIdea,
    'mvp' => l10n.stageMvp,
    'startup' => l10n.stageStartup,
    'scaling' => l10n.stageScaling,
    'established' => l10n.stageEstablished,
    'other' => l10n.stageOther,
    _ => stage,
  };

  String statusLabel(FopxLocalizations l10n) => switch (status.toLowerCase()) {
    'draft' => l10n.statusDraft,
    'active' => l10n.statusActive,
    'paused' => l10n.statusPaused,
    'completed' => l10n.statusCompleted,
    'archived' => l10n.statusArchived,
    _ => status,
  };
}

const _projectStages = <String>[
  'Idea',
  'MVP',
  'Startup',
  'Scaling',
  'Established',
  'Other',
];
const _projectStatuses = <String>[
  'Draft',
  'Active',
  'Paused',
  'Completed',
  'Archived',
];
const _opportunityStatuses = <String>[
  'Draft',
  'UnderReview',
  'Rejected',
  'Approved',
  'Published',
  'Funding',
  'FullyFunded',
  'InProgress',
  'Completed',
  'Archived',
];
const _fundingStatuses = <String>[
  'NotScheduled',
  'Scheduled',
  'Open',
  'Paused',
  'Closed',
];

String _string(dynamic value) => value?.toString() ?? '';

Map<String, dynamic> _map(dynamic value) =>
    value is Map ? Map<String, dynamic>.from(value) : <String, dynamic>{};

int? _intOrNull(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value));

String? _nullableString(dynamic value) {
  final result = value?.toString().trim();
  return result == null || result.isEmpty ? null : result;
}

int _int(dynamic value, {int fallback = 0}) =>
    value is num ? value.toInt() : int.tryParse('$value') ?? fallback;

DateTime? _date(dynamic value) =>
    value is String ? DateTime.tryParse(value) : null;

double? _nullableDouble(dynamic value) =>
    value is num ? value.toDouble() : double.tryParse('$value');

String _enumName(dynamic value, List<String> names, {int numericStart = 0}) {
  if (value is String) return value;
  if (value is num) {
    final index = value.toInt() - numericStart;
    if (index >= 0 && index < names.length) return names[index];
  }
  return '';
}
