class FounderContractVersion {
  const FounderContractVersion({
    required this.number,
    required this.type,
    required this.status,
    required this.createdAt,
    required this.activatedAt,
    required this.htmlPreviewAvailable,
    required this.pdfDownloadAvailable,
    required this.pdfStatus,
    required this.documentHash,
    required this.pdfHash,
    required this.pdfDocumentSize,
  });

  final int number;
  final String type;
  final String status;
  final DateTime? createdAt;
  final DateTime? activatedAt;
  final bool htmlPreviewAvailable;
  final bool pdfDownloadAvailable;
  final String pdfStatus;
  final String documentHash;
  final String pdfHash;
  final int? pdfDocumentSize;

  factory FounderContractVersion.fromJson(Map<String, dynamic> json) =>
      FounderContractVersion(
        number: _int(json['versionNumber']),
        type: _string(json['versionType']),
        status: _string(json['status']),
        createdAt: DateTime.tryParse(_string(json['createdAt'])),
        activatedAt: DateTime.tryParse(_string(json['activatedAt'])),
        htmlPreviewAvailable: json['htmlPreviewAvailable'] == true,
        pdfDownloadAvailable: json['pdfDownloadAvailable'] == true,
        pdfStatus: _string(json['pdfStatus']),
        documentHash: _string(json['documentHash']),
        pdfHash: _string(json['pdfHash']),
        pdfDocumentSize: _intOrNull(json['pdfDocumentSize']),
      );
}

class FounderContractDetail {
  const FounderContractDetail({
    required this.id,
    required this.number,
    required this.status,
    required this.investmentModel,
    required this.founderName,
    required this.investorName,
    required this.currentVersionNumber,
    required this.currentVersionType,
    required this.currentVersionStatus,
    required this.currentVersionCreatedAt,
    required this.currentVersionActivatedAt,
    required this.pdfAvailable,
    required this.pdfStatus,
    required this.htmlPreviewAvailable,
    required this.pdfHash,
    required this.pdfDocumentSize,
    required this.versionHistory,
  });

  final int id;
  final String number;
  final String status;
  final String investmentModel;
  final String founderName;
  final String investorName;
  final int currentVersionNumber;
  final String currentVersionType;
  final String currentVersionStatus;
  final DateTime? currentVersionCreatedAt;
  final DateTime? currentVersionActivatedAt;
  final bool pdfAvailable;
  final String pdfStatus;
  final bool htmlPreviewAvailable;
  final String pdfHash;
  final int? pdfDocumentSize;
  final List<FounderContractVersion> versionHistory;

  factory FounderContractDetail.fromJson(Map<String, dynamic> json) {
    final contract = _map(json['contract']);
    final current = _map(json['currentVersion']);
    final rawHistory = json['versionHistory'];
    return FounderContractDetail(
      id: _int(contract['contractId']),
      number: _string(contract['contractNumber']),
      status: _string(contract['status']),
      investmentModel: _string(contract['investmentModel']),
      founderName: _string(contract['founderDisplayName']),
      investorName: _string(contract['investorDisplayName']),
      currentVersionNumber: _int(current['versionNumber']),
      currentVersionType: _string(current['versionType']),
      currentVersionStatus: _string(current['status']),
      currentVersionCreatedAt: DateTime.tryParse(_string(current['createdAt'])),
      currentVersionActivatedAt: DateTime.tryParse(
        _string(current['activatedAt']),
      ),
      pdfAvailable: current['pdfDownloadAvailable'] == true,
      pdfStatus: _string(current['pdfStatus']),
      htmlPreviewAvailable: current['htmlPreviewAvailable'] == true,
      pdfHash: _string(current['pdfHash']),
      pdfDocumentSize: _intOrNull(current['pdfDocumentSize']),
      versionHistory:
          rawHistory is List
              ? rawHistory
                  .whereType<Map>()
                  .map(
                    (item) => FounderContractVersion.fromJson(
                      Map<String, dynamic>.from(item),
                    ),
                  )
                  .toList(growable: false)
              : const <FounderContractVersion>[],
    );
  }
}

Map<String, dynamic> _map(dynamic value) =>
    value is Map ? Map<String, dynamic>.from(value) : <String, dynamic>{};

String _string(dynamic value) => value?.toString() ?? '';

int _int(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value)) ?? 0;

int? _intOrNull(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value));
