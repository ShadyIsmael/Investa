import 'package:dio/dio.dart';

import '../api/api_error.dart';
import '../api/fopx_api_client.dart';

/// Metadata returned by the canonical authenticated `/files/upload` endpoint.
class FopxGovernedFile {
  const FopxGovernedFile({
    required this.fileKey,
    required this.categoryCode,
    this.fileId,
    this.url,
    this.previewUrl,
    this.thumbnailUrl,
    this.originalFileName,
    this.mimeType,
    this.fileSize,
  });

  final String fileKey;
  final String categoryCode;
  final String? fileId;
  final String? url;
  final String? previewUrl;
  final String? thumbnailUrl;
  final String? originalFileName;
  final String? mimeType;
  final int? fileSize;

  factory FopxGovernedFile.fromJson(Map<String, dynamic> json) =>
      FopxGovernedFile(
        fileKey: _text(json['fileKey']),
        categoryCode: _text(json['category']),
        fileId: _optionalText(json['fileId']),
        url: _optionalText(json['url']),
        previewUrl: _optionalText(json['previewUrl']),
        thumbnailUrl: _optionalText(json['thumbnailUrl']),
        originalFileName: _optionalText(json['originalFileName']),
        mimeType: _optionalText(json['mimeType']),
        fileSize: _intOrNull(json['fileSize']),
      );
}

/// Reusable client for the backend's governed file upload pipeline.
/// Entity linking and visibility remain with the owning feature API.
class FopxGovernedFileUploader {
  const FopxGovernedFileUploader(this._api);

  final FopxApiClient _api;

  Future<FopxGovernedFile> upload({
    required List<int> bytes,
    required String fileName,
    required String categoryCode,
    int? projectId,
    String? entityType,
    String? entityId,
  }) async {
    final normalizedCategory = categoryCode.trim().toUpperCase();
    final normalizedName = fileName.trim();
    if (bytes.isEmpty || normalizedName.isEmpty || normalizedCategory.isEmpty) {
      throw const ApiError(
        message: 'A file, filename, and file category are required.',
      );
    }

    final response = await _api.post<dynamic>(
      '/files/upload',
      data: FormData.fromMap(<String, dynamic>{
        'file': MultipartFile.fromBytes(bytes, filename: normalizedName),
        'categoryCode': normalizedCategory,
        if (projectId != null) 'projectId': projectId,
        if (entityType != null && entityType.trim().isNotEmpty)
          'entityType': entityType.trim(),
        if (entityId != null && entityId.trim().isNotEmpty)
          'entityId': entityId.trim(),
      }),
    );
    final root = response.data;
    final data = root is Map && root.containsKey('data') ? root['data'] : root;
    if (data is! Map) {
      throw const ApiError(message: 'The governed file upload was not returned.');
    }
    final result = FopxGovernedFile.fromJson(Map<String, dynamic>.from(data));
    if (result.fileKey.isEmpty) {
      throw const ApiError(message: 'The governed file key was not returned.');
    }
    if (result.categoryCode.toUpperCase() != normalizedCategory) {
      throw const ApiError(
        message: 'The governed upload returned an unexpected file category.',
      );
    }
    return result;
  }
}

String _text(dynamic value) => value?.toString().trim() ?? '';
String? _optionalText(dynamic value) {
  final result = _text(value);
  return result.isEmpty ? null : result;
}

int? _intOrNull(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_text(value));
