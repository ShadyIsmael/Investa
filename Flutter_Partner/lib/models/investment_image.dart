/// Media type for investment images/videos
enum MediaType { coverImage, image, video }

class InvestmentImage {
  final int id;
  final int mediaType;
  final String url;
  final String? thumbnailUrl;
  final String? fileName;
  final String? caption;
  final int sortOrder;
  final bool isPrimary;
  final String? uploadedBy;
  final DateTime createdAt;

  InvestmentImage({
    required this.id,
    required this.mediaType,
    required this.url,
    this.thumbnailUrl,
    this.fileName,
    this.caption,
    required this.sortOrder,
    required this.isPrimary,
    this.uploadedBy,
    required this.createdAt,
  });

  factory InvestmentImage.fromJson(Map<String, dynamic> json) {
    return InvestmentImage(
      id: json['id'],
      mediaType: json['mediaType'] ?? 1,
      url: json['url'],
      thumbnailUrl: json['thumbnailUrl'],
      fileName: json['fileName'],
      caption: json['caption'],
      sortOrder: json['sortOrder'] ?? 0,
      isPrimary: json['isPrimary'] ?? false,
      uploadedBy: json['uploadedBy']?.toString(),
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mediaType': mediaType,
      'url': url,
      if (thumbnailUrl != null) 'thumbnailUrl': thumbnailUrl,
      if (fileName != null) 'fileName': fileName,
      if (caption != null) 'caption': caption,
      'sortOrder': sortOrder,
      'isPrimary': isPrimary,
      if (uploadedBy != null) 'uploadedBy': uploadedBy,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
