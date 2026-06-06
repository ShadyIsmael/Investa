enum MediaType {
  coverImage(0),
  image(1),
  video(2);

  final int value;
  const MediaType(this.value);
  
  static MediaType fromValue(int value) {
    return MediaType.values.firstWhere((e) => e.value == value, orElse: () => MediaType.image);
  }
}

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
      id: json['id'] as int? ?? 0,
      mediaType: json['mediaType'] as int? ?? 1,
      url: json['url'] as String? ?? '',
      thumbnailUrl: json['thumbnailUrl'] as String?,
      fileName: json['fileName'] as String?,
      caption: json['caption'] as String?,
      sortOrder: json['sortOrder'] as int? ?? 0,
      isPrimary: json['isPrimary'] as bool? ?? false,
      uploadedBy: json['uploadedBy']?.toString(),
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
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
