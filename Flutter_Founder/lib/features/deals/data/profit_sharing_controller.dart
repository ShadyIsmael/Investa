import 'dart:math';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

import 'profit_sharing.dart';

abstract interface class FounderProfitSharingRepository {
  Future<FounderProfitSharingSummary> fetch(int opportunityId, int participationId);
  Future<void> declareResult({
    required int opportunityId,
    required int obligationId,
    required int periodId,
    required double declaredBasisAmount,
    required double declaredResultAmount,
    required String currency,
    required DateTime declarationDate,
    String? externalReference,
    String? notes,
    List<int>? evidenceBytes,
    String? evidenceFileName,
    String? evidenceContentType,
  });
  Future<void> declareDistribution({
    required int opportunityId,
    required int obligationId,
    required int periodId,
    required double amount,
    required String currency,
    String? externalReference,
    String? notes,
    List<int>? evidenceBytes,
    String? evidenceFileName,
    String? evidenceContentType,
  });
  Future<List<int>> downloadResultEvidence(int declarationId);
  Future<List<int>> downloadDistributionEvidence(int declarationId);
}

class ApiFounderProfitSharingRepository
    implements FounderProfitSharingRepository {
  const ApiFounderProfitSharingRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<FounderProfitSharingSummary> fetch(
    int opportunityId,
    int participationId,
  ) async {
    final response = await _api.get<dynamic>(
      '/profit-sharing/opportunities/$opportunityId/participations/$participationId',
    );
    final data = _psData(response.data);
    if (data is! Map) {
      throw const ApiError(message: 'Profit Sharing data was not returned.');
    }
    return FounderProfitSharingSummary.fromJson(
      Map<String, dynamic>.from(data),
    );
  }

  @override
  Future<void> declareResult({
    required int opportunityId,
    required int obligationId,
    required int periodId,
    required double declaredBasisAmount,
    required double declaredResultAmount,
    required String currency,
    required DateTime declarationDate,
    String? externalReference,
    String? notes,
    List<int>? evidenceBytes,
    String? evidenceFileName,
    String? evidenceContentType,
  }) async {
    final fields = <String, dynamic>{
      'DeclaredBasisAmount': declaredBasisAmount.toString(),
      'DeclaredResultAmount': declaredResultAmount.toString(),
      'Currency': currency,
      'DeclarationDate': DateTime.utc(
        declarationDate.year,
        declarationDate.month,
        declarationDate.day,
      ).toIso8601String(),
      if (externalReference?.trim().isNotEmpty == true)
        'ExternalReference': externalReference!.trim(),
      if (notes?.trim().isNotEmpty == true) 'Notes': notes!.trim(),
      if (evidenceBytes != null && evidenceFileName != null)
        'evidenceFile': _evidencePart(
          evidenceBytes,
          evidenceFileName,
          evidenceContentType,
        ),
    };
    await _api.post<dynamic>(
      '/profit-sharing/opportunities/$opportunityId/obligations/$obligationId/periods/$periodId/declarations',
      data: FormData.fromMap(fields),
      options: Options(headers: <String, dynamic>{'Idempotency-Key': _id()}),
    );
  }

  @override
  Future<void> declareDistribution({
    required int opportunityId,
    required int obligationId,
    required int periodId,
    required double amount,
    required String currency,
    String? externalReference,
    String? notes,
    List<int>? evidenceBytes,
    String? evidenceFileName,
    String? evidenceContentType,
  }) async {
    final fields = <String, dynamic>{
      'DeclaredAmount': amount.toString(),
      'Currency': currency,
      if (externalReference?.trim().isNotEmpty == true)
        'ExternalReference': externalReference!.trim(),
      if (notes?.trim().isNotEmpty == true) 'Notes': notes!.trim(),
      if (evidenceBytes != null && evidenceFileName != null)
        'evidenceFile': _evidencePart(
          evidenceBytes,
          evidenceFileName,
          evidenceContentType,
        ),
    };
    await _api.post<dynamic>(
      '/profit-sharing/opportunities/$opportunityId/obligations/$obligationId/periods/$periodId/distributions',
      data: FormData.fromMap(fields),
      options: Options(headers: <String, dynamic>{'Idempotency-Key': _id()}),
    );
  }

  @override
  Future<List<int>> downloadResultEvidence(int declarationId) =>
      _download('/profit-sharing/declarations/$declarationId/evidence');

  @override
  Future<List<int>> downloadDistributionEvidence(int declarationId) =>
      _download('/profit-sharing/distributions/$declarationId/evidence');

  Future<List<int>> _download(String path) async {
    final response = await _api.getBytes(path);
    final bytes = response.data;
    if (bytes == null || bytes.isEmpty) {
      throw const ApiError(message: 'The evidence file was empty.');
    }
    return bytes;
  }

  MultipartFile _evidencePart(List<int> bytes, String name, String? mimeType) =>
      MultipartFile.fromBytes(
        bytes,
        filename: name,
        contentType: DioMediaType.parse(mimeType ?? 'application/octet-stream'),
      );

  String _id() {
    final bytes = List<int>.generate(16, (_) => Random.secure().nextInt(256));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    final hex = bytes.map((value) => value.toRadixString(16).padLeft(2, '0'));
    final value = hex.join();
    return '${value.substring(0, 8)}-${value.substring(8, 12)}-'
        '${value.substring(12, 16)}-${value.substring(16, 20)}-'
        '${value.substring(20)}';
  }
}

dynamic _psData(dynamic payload) =>
    payload is Map && payload.containsKey('data') ? payload['data'] : payload;

final founderProfitSharingRepositoryProvider =
    Provider<FounderProfitSharingRepository>(
      (ref) => ApiFounderProfitSharingRepository(ref.read(apiClientProvider)),
    );

final founderProfitSharingProvider = FutureProvider.autoDispose.family<
  FounderProfitSharingSummary,
  ({int opportunityId, int participationId})
>((ref, args) => ref
    .read(founderProfitSharingRepositoryProvider)
    .fetch(args.opportunityId, args.participationId));
