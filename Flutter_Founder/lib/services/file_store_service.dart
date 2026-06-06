import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:path/path.dart' as p;
import 'api_client.dart';
import 'app_logger.dart';
import 'endpoint_resolver.dart';

/// Centralized file storage service for Investa.FileStore.
/// All file uploads and downloads must go through this service.
class FileStoreService {
  final String? _baseOverride;
  final ApiClient _client;

  FileStoreService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get _fileStoreBase =>
      _baseOverride ?? EndpointResolver.instance.fileStoreBaseUrl;

  String get _apiKey => EndpointResolver.instance.fileStoreApiKey;

  Map<String, String> get _authHeaders => {
        'X-Api-Key': _apiKey,
      };

  /// Upload an investment image to FileStore.
  /// Returns the public URL of the uploaded image, or null on failure.
  Future<String?> uploadInvestmentImage(
      String filePath, int investmentId) async {
    final category = 'investment-images-$investmentId';
    return _uploadFile(filePath, category);
  }

  /// Upload an investment video to FileStore.
  /// Returns the public URL of the uploaded video, or null on failure.
  Future<String?> uploadInvestmentVideo(
      String filePath, int investmentId) async {
    final category = 'investment-videos-$investmentId';
    return _uploadFile(filePath, category);
  }

  /// Upload an investment document (PDF, PPTX, etc.) to FileStore.
  /// Returns the public URL of the uploaded document, or null on failure.
  Future<String?> uploadInvestmentDocument(
      String filePath, int investmentId) async {
    final category = 'investment-docs-$investmentId';
    return _uploadFile(filePath, category);
  }

  /// Upload a generic file to a FileStore category.
  /// Returns the public URL of the uploaded file, or null on failure.
  Future<String?> uploadFile(String filePath, String category) async {
    return _uploadFile(filePath, category);
  }

  /// Delete a file from FileStore by its relative URL path.
  /// Returns true if deleted successfully.
  Future<bool> deleteFile(String relativeUrl) async {
    try {
      // Parse the URL to extract category and filename
      // e.g. "/storage/investments-1/123_image.jpg" → category="investments-1", filename="123_image.jpg"
      final trimmed =
          relativeUrl.startsWith('/') ? relativeUrl.substring(1) : relativeUrl;
      // Remove "storage/" prefix if present
      final path =
          trimmed.startsWith('storage/') ? trimmed.substring(8) : trimmed;
      final lastSlash = path.lastIndexOf('/');
      if (lastSlash < 0) return false;

      final category = path.substring(0, lastSlash);
      final fileName = path.substring(lastSlash + 1);

      final uri = Uri.parse(
          '$_fileStoreBase/files/${Uri.encodeComponent(category)}/${Uri.encodeComponent(fileName)}');

      final resp = await _client.delete(uri.toString(), headers: _authHeaders);
      return (resp.statusCode ?? 0) >= 200 && (resp.statusCode ?? 0) < 300;
    } catch (e, s) {
      AppLogger.logError('FileStoreService', 'Delete failed: $e', s);
      return false;
    }
  }

  /// Convert a relative FileStore URL to an absolute public URL.
  String getPublicUrl(String? relativeUrl) {
    if (relativeUrl == null || relativeUrl.isEmpty) return '';
    final trimmed = relativeUrl.trim();
    if (RegExp(r'^https?://', caseSensitive: false).hasMatch(trimmed)) {
      return trimmed;
    }
    return '$_fileStoreBase$trimmed';
  }

  /// Internal: upload a file to a FileStore category.
  Future<String?> _uploadFile(String filePath, String category) async {
    try {
      final file = File(filePath);
      if (!file.existsSync()) {
        AppLogger.logError(
            'FileStoreService', 'File does not exist: $filePath', null);
        return null;
      }

      final fileName = p.basename(filePath);
      final uri =
          Uri.parse('$_fileStoreBase/files/${Uri.encodeComponent(category)}');

      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });

      AppLogger.logInfo(
          'FileStoreService', 'POST ${uri.toString()} file=$fileName');

      final resp = await _client.post(uri.toString(),
          data: formData, headers: _authHeaders);
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('FileStoreService', 'Response status=$status');

      if (status >= 200 && status < 300) {
        try {
          Map<String, dynamic> body;
          if (resp.data is Map) {
            body = resp.data as Map<String, dynamic>;
          } else if (resp.data is String) {
            final str = resp.data as String;
            if (str.isNotEmpty) {
              body = jsonDecode(str) as Map<String, dynamic>;
            } else {
              AppLogger.logError(
                  'FileStoreService', 'Empty response body', null);
              return null;
            }
          } else {
            AppLogger.logError('FileStoreService',
                'Unexpected response type: ${resp.data.runtimeType}', null);
            return null;
          }
          final url = body['url'];
          if (url is String) return url;
        } catch (e, s) {
          AppLogger.logError('FileStoreService', 'Parse error: $e', s);
        }
      }

      AppLogger.logError(
          'FileStoreService', 'Upload failed: status=$status', null);
      return null;
    } on DioException catch (e) {
      AppLogger.logError(
          'FileStoreService', 'Upload error: ${e.message}', e.stackTrace);
      return null;
    } catch (e, s) {
      AppLogger.logError('FileStoreService', 'Unexpected upload error: $e', s);
      return null;
    }
  }
}
