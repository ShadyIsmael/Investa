import 'package:file_picker/file_picker.dart';

/// Shared byte-backed picker for files sent through governed FOPX endpoints.
Future<PlatformFile?> pickFounderFile({
  required List<String> allowedExtensions,
  required int maxFileSizeBytes,
}) async {
  final normalizedExtensions = allowedExtensions
      .map((extension) => extension.trim().replaceFirst('.', '').toLowerCase())
      .where((extension) => extension.isNotEmpty)
      .toSet()
      .toList(growable: false);
  if (normalizedExtensions.isEmpty || maxFileSizeBytes <= 0) {
    throw ArgumentError('Valid file extensions and size limit are required.');
  }

  final result = await FilePicker.platform.pickFiles(
    type: FileType.custom,
    allowedExtensions: normalizedExtensions,
    withData: true,
  );
  if (result == null || result.files.isEmpty) return null;
  final file = result.files.single;
  if (file.bytes == null || file.size <= 0 || file.size > maxFileSizeBytes) {
    throw const FounderFileSelectionException();
  }
  return file;
}

class FounderFileSelectionException implements Exception {
  const FounderFileSelectionException();
}
