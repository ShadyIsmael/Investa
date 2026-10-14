import 'dart:math';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

import 'contract_detail.dart';

const _maxContractPreviewBytes = 2 * 1024 * 1024;

Future<String> fetchContractPreviewHtml(
  FopxApiClient api, {
  required int contractId,
  required int versionNumber,
}) async {
  final response = await api.getText(
    '/contracts/$contractId/versions/$versionNumber/preview',
    headers: const <String, dynamic>{'Accept': 'text/html'},
  );
  final html = response.data;
  if (html == null || html.isEmpty) {
    throw const ApiError(message: 'The contract preview was empty.');
  }
  return prepareContractPreviewHtml(html);
}

String prepareContractPreviewHtml(String html) {
  if (html.length > _maxContractPreviewBytes) {
    throw const ApiError(message: 'The contract preview is too large.');
  }
  if (!RegExp(r'^\s*<!doctype\s+html\b', caseSensitive: false).hasMatch(html) ||
      !RegExp(r'<head(?:\s[^>]*)?>', caseSensitive: false).hasMatch(html)) {
    throw const ApiError(message: 'The contract preview format is invalid.');
  }

  final unsafeMarkup = RegExp(
    r'<\s*(script|iframe|frame|object|embed|form|input|link|base)\b|'
    r'<[^>]+\bon[a-z]+\s*=|<[^>]+\b(src|href)\s*=',
    caseSensitive: false,
  );
  if (unsafeMarkup.hasMatch(html)) {
    throw const ApiError(
      message: 'The contract preview contains unsupported content.',
    );
  }

  const contentSecurityPolicy =
      "<meta http-equiv=\"Content-Security-Policy\" content=\""
      "default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; "
      "font-src 'none'; connect-src 'none'; media-src 'none'; object-src 'none'; "
      "frame-src 'none'; form-action 'none'; base-uri 'none'; script-src 'none'\">";
  return html.replaceFirstMapped(
    RegExp(r'<head(?:\s[^>]*)?>', caseSensitive: false),
    (match) => '${match[0]}$contentSecurityPolicy',
  );
}

final founderContractPreviewProvider = FutureProvider.autoDispose
    .family<String, (int, int)>((ref, key) {
      return fetchContractPreviewHtml(
        ref.read(apiClientProvider),
        contractId: key.$1,
        versionNumber: key.$2,
      );
    });

final founderContractProvider = FutureProvider.autoDispose
    .family<FounderContractDetail, int>((ref, contractId) async {
      final response = await ref
          .read(apiClientProvider)
          .get<dynamic>('/contracts/$contractId');
      final root = response.data;
      final data =
          root is Map && root.containsKey('data') ? root['data'] : root;
      if (data is! Map) {
        throw const ApiError(message: 'Contract data was not returned.');
      }
      return FounderContractDetail.fromJson(Map<String, dynamic>.from(data));
    });

Future<List<int>> fetchContractPdfBytes(
  FopxApiClient api, {
  required int contractId,
  required int versionNumber,
}) async {
  final response = await api.getBytes(
    '/contracts/$contractId/versions/$versionNumber/pdf',
  );
  final bytes = response.data;
  if (bytes == null || bytes.isEmpty) {
    throw const ApiError(message: 'The contract PDF was empty.');
  }
  return bytes;
}

Future<void> emailContractVersion(
  FopxApiClient api, {
  required int contractId,
  required int versionNumber,
}) async {
  final operationId = _newOperationId();
  await api.post<dynamic>(
    '/contracts/$contractId/versions/$versionNumber/email',
    options: Options(
      headers: <String, dynamic>{'Idempotency-Key': operationId},
    ),
  );
}

String _newOperationId() {
  final bytes = List<int>.generate(16, (_) => Random.secure().nextInt(256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  final hex = bytes.map((byte) => byte.toRadixString(16).padLeft(2, '0'));
  final value = hex.join();
  return '${value.substring(0, 8)}-${value.substring(8, 12)}-'
      '${value.substring(12, 16)}-${value.substring(16, 20)}-'
      '${value.substring(20)}';
}
