import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';
import '../services/messages.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../services/investments_service.dart';
import '../services/secure_storage.dart';
import '../services/analytics_service.dart';

// A small set of public test images (Unsplash) used when no images available.
const List<String> _kTestImages = [
  'https://images.unsplash.com/photo-1506765515384-028b60a970df?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503602642458-232111445657?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1400&q=80&auto=format&fit=crop',
];

class InvestmentInfoScreen extends StatefulWidget {
  final Map<String, dynamic> item;
  final dynamic category;
  const InvestmentInfoScreen({super.key, required this.item, this.category});

  @override
  State<InvestmentInfoScreen> createState() => _InvestmentInfoScreenState();
}

class _InvestmentInfoScreenState extends State<InvestmentInfoScreen> {
  late bool _fav;
  int _currentImageIndex = 0;
  final ScrollController _scrollController = ScrollController();

  // Image management state
  List<String> _images = [];
  bool _isOwner = false;
  final _investmentsService = InvestmentsService();
  final _analyticsService = AnalyticsService();
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _fav = widget.item['isFavorite'] as bool? ?? false;
    _initImageState();
    _recordView();
  }

  Future<void> _initImageState() async {
    // Initialize local images list from widget data
    final rawImages = widget.item['images'] ??
        widget.item['imagesAlbum'] ??
        widget.item['gallery'] ??
        widget.item['photos'];
    final images = <String>[];
    if (rawImages is List) {
      for (final v in rawImages) {
        if (v is String && v.isNotEmpty) images.add(v);
        if (v is Map && v['url'] is String) images.add(v['url']);
      }
    }
    setState(() => _images = images);

    // Ownership check
    try {
      final uid = await SecureStorage().read('user_id');
      final founder = widget.item['founderId']?.toString();
      setState(
          () => _isOwner = (uid != null && uid.isNotEmpty && uid == founder));
    } catch (_) {}
  }

  Future<void> _recordView() async {
    final investmentId = widget.item['id'];
    if (investmentId != null) {
      try {
        await _analyticsService.recordView(investmentId as int);
      } catch (e) {
        // Don't block main functionality if analytics fails
        print('Failed to record view: $e');
      }
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _toggleFav() {
    setState(() => _fav = !_fav);
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        backgroundColor: _fav ? AppPalette.flame : Colors.grey[800],
        duration: const Duration(seconds: 1),
        content: Text(_fav
            ? AppMessages.addedToFavorites
            : AppMessages.removedFromFavorites)));
  }

  void _share() {
    final title =
        widget.item['businessName'] ?? widget.item['title'] ?? 'Investment';
    final desc = widget.item['description'] ?? widget.item['details'] ?? '';
    final text = '$title\n$desc';
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppMessages.copiedShareText)));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Data Extraction
    final item = widget.item;
    final title = item['businessName'] ?? item['title'] ?? 'Venture';
    final description = item['description'] ??
        item['details'] ??
        'No detailed description provided.';
    final founderName =
        item['founderName'] ?? item['FounderDisplay'] ?? 'Unknown Founder';
    final founderAvatar = item['founderAvatar'] ?? item['authorAvatar'];
    final riskLevel = (item['riskLevel'] as String? ?? 'Medium');
    final investmentId = item['id']?.toString() ?? '-';
    final typeRaw = (item['type'] ?? item['investmentType'] ?? 'founding')
        .toString()
        .toLowerCase();
    final typeLabel = typeRaw == 'equity' ? 'Equity' : 'Founding';

    // Images
    final images = <String>[];
    final rawImages = item['images'] ??
        item['imagesAlbum'] ??
        item['gallery'] ??
        item['photos'];
    if (rawImages is List) {
      for (final v in rawImages) {
        if (v is String && v.isNotEmpty) images.add(v);
        if (v is Map && v['url'] is String) images.add(v['url']);
      }
    }
    if (images.isEmpty) images.addAll(_kTestImages);

    // Financials
    double toDouble(dynamic value) {
      if (value is num) return value.toDouble();
      if (value is String) {
        return double.tryParse(value.replaceAll(',', '')) ?? 0.0;
      }
      return 0.0;
    }

    final targetAmount =
        toDouble(item['targetAmount'] ?? item['targetFund'] ?? 0);
    final currentAmount = toDouble(item['currentAmount'] ??
        item['collected'] ??
        item['collectedAmount'] ??
        item['raised'] ??
        item['raisedAmount'] ??
        item['amountRaised'] ??
        item['fundedAmount'] ??
        0);
    final minInvest = item['minInvest'] ?? '5,000';
    final valuation = item['valuation'] ?? '2.5M';
    final currency = item['currency'] ?? '\$';
    final progress =
        targetAmount > 0 ? (currentAmount / targetAmount).clamp(0.0, 1.0) : 0.0;

    final rawPartners = item['partners'] ??
        item['partnerList'] ??
        item['investors'] ??
        item['team'] ??
        [];
    final List<dynamic> partners = rawPartners is List ? rawPartners : [];

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              // 1. App Bar with Hero Image
              SliverAppBar(
                expandedHeight: 320,
                pinned: true,
                elevation: 0,
                backgroundColor:
                    isDark ? AppPalette.midnightDeep : Colors.white,
                foregroundColor: isDark ? Colors.white : Colors.black,
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      PageView.builder(
                        itemCount:
                            (_images.isNotEmpty ? _images : images).length,
                        onPageChanged: (i) =>
                            setState(() => _currentImageIndex = i),
                        itemBuilder: (_, i) {
                          final list = _images.isNotEmpty ? _images : images;
                          return Image.network(
                            list[i],
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) =>
                                Container(color: Colors.grey[900]),
                          );
                        },
                      ),
                      // Gradient Overlay
                      DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.black.withOpacityCompat(0.3),
                                Colors.transparent,
                                isDark
                                    ? AppPalette.midnightDeep
                                    : theme.scaffoldBackgroundColor
                                        .withOpacityCompat(0.1),
                                isDark
                                    ? AppPalette.midnightDeep
                                    : theme.scaffoldBackgroundColor,
                              ],
                              stops: const [
                                0.0,
                                0.2,
                                0.8,
                                1.0
                              ]),
                        ),
                      ),
                      // Page Indicator (scrollable to avoid small right overflow when many images)
                      Positioned(
                        bottom: 40,
                        left: 0,
                        right: 0,
                        child: Center(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: List.generate(
                                  (_images.isNotEmpty ? _images : images)
                                      .length, (i) {
                                return AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  margin:
                                      const EdgeInsets.symmetric(horizontal: 4),
                                  height: 6,
                                  width: _currentImageIndex == i ? 24 : 6,
                                  decoration: BoxDecoration(
                                    color: _currentImageIndex == i
                                        ? theme.colorScheme.primary
                                        : Colors.white.withOpacityCompat(0.5),
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                );
                              }),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                actions: [
                  IconButton(
                    onPressed: _toggleFav,
                    icon: CircleAvatar(
                      backgroundColor: Colors.black.withOpacityCompat(0.3),
                      child: Icon(_fav ? Icons.favorite : Icons.favorite_border,
                          color: _fav ? AppPalette.flame : Colors.white),
                    ),
                  ),
                  IconButton(
                    onPressed: _share,
                    icon: CircleAvatar(
                      backgroundColor: Colors.black.withOpacityCompat(0.3),
                      child:
                          const Icon(Icons.share_rounded, color: Colors.white),
                    ),
                  ),
                  if (_isOwner)
                    IconButton(
                      onPressed: _openManagePhotosSheet,
                      icon: CircleAvatar(
                        backgroundColor: Colors.black.withOpacityCompat(0.3),
                        child: const Icon(Icons.photo_library,
                            color: Colors.white),
                      ),
                    ),
                  const SizedBox(width: 16),
                ],
              ),

              // 2. Content Body
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badge & Title
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildTag(riskLevel, theme),
                                const SizedBox(height: 8),
                                _buildTag(typeLabel, theme),
                                const SizedBox(height: 12),
                                Text(
                                  title,
                                  style: GoogleFonts.outfit(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: theme.colorScheme.onSurface,
                                    height: 1.1,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Founder Avatar Large
                          Container(
                            decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                    color: theme.colorScheme.surface, width: 4),
                                boxShadow: [
                                  BoxShadow(
                                      color:
                                          Colors.black.withOpacityCompat(0.1),
                                      blurRadius: 10,
                                      offset: const Offset(0, 5))
                                ]),
                            child: CircleAvatar(
                              radius: 32,
                              backgroundImage: founderAvatar != null
                                  ? NetworkImage(founderAvatar)
                                  : null,
                              backgroundColor:
                                  theme.colorScheme.surfaceContainerHighest,
                              child: founderAvatar == null
                                  ? const Icon(Icons.person, size: 32)
                                  : null,
                            ),
                          )
                        ],
                      ),

                      const SizedBox(height: 8),
                      Text('by $founderName',
                          style: GoogleFonts.dmSans(
                              fontSize: 16,
                              color: theme.colorScheme.primary,
                              fontWeight: FontWeight.w500)),

                      const SizedBox(height: 32),

                      // Progress Bar Section
                      Text('Funding Status',
                          style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.onSurface)),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: progress,
                          minHeight: 12,
                          backgroundColor:
                              theme.colorScheme.surfaceContainerHighest,
                          valueColor: AlwaysStoppedAnimation(progress >= 0.75
                              ? const Color(0xFF10B981)
                              : progress >= 0.4
                                  ? AppPalette.amber
                                  : AppPalette.flame),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${(progress * 100).toStringAsFixed(0)}% Funded',
                              style: GoogleFonts.dmSans(
                                  fontWeight: FontWeight.bold,
                                  color: theme.colorScheme.primary)),
                          Text(
                              '$currency${currentAmount.toStringAsFixed(0)} / $currency${targetAmount.toStringAsFixed(0)}',
                              style: GoogleFonts.dmSans(
                                  color: theme.disabledColor)),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Investment Details (All Core Data)
                      Text('Investment Details',
                          style: GoogleFonts.outfit(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.onSurface)),
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                              color: theme.colorScheme.outline
                                  .withOpacityCompat(0.2)),
                        ),
                        child: Column(
                          children: [
                            _buildDetailRow(theme, 'ID', investmentId),
                            _buildDetailRow(theme, 'Type', typeLabel),
                            _buildDetailRow(theme, 'Target Amount',
                                '$currency${targetAmount.toStringAsFixed(0)}'),
                            _buildDetailRow(theme, 'Current Amount',
                                '$currency${currentAmount.toStringAsFixed(0)}'),
                            _buildDetailRow(theme, 'Progress',
                                '${(progress * 100).toStringAsFixed(0)}%'),
                          ],
                        ),
                      ),

                      // Key Financials Grid
                      Row(
                        children: [
                          Expanded(
                              child: _buildInfoCard(
                                  context,
                                  'Valuation',
                                  '$currency$valuation',
                                  Icons.analytics_outlined)),
                          const SizedBox(width: 16),
                          Expanded(
                              child: _buildInfoCard(
                                  context,
                                  'Min. Invest',
                                  '$currency$minInvest',
                                  Icons.monetization_on_outlined)),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Description
                      Text('About',
                          style: GoogleFonts.outfit(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.onSurface)),
                      const SizedBox(height: 16),
                      Text(
                        description,
                        style: GoogleFonts.dmSans(
                            fontSize: 16,
                            height: 1.6,
                            color: theme.colorScheme.onSurface
                                .withOpacityCompat(0.8)),
                      ),

                      const SizedBox(height: 32),

                      // Partners
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Partners',
                              style: GoogleFonts.outfit(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: theme.colorScheme.onSurface)),
                          if (partners.isNotEmpty)
                            TextButton(
                              onPressed: () =>
                                  _showPartnersSheet(context, partners),
                              child: Text('View all (${partners.length})',
                                  style: GoogleFonts.dmSans(
                                      fontWeight: FontWeight.w600)),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (partners.isEmpty)
                        Text(
                          'No partners listed yet.',
                          style: GoogleFonts.dmSans(
                              color: theme.colorScheme.onSurface
                                  .withOpacityCompat(0.6)),
                        )
                      else
                        _buildPartnersAvatars(theme, partners),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTag(String text, ThemeData theme) {
    Color color;
    switch (text.toUpperCase()) {
      case 'HIGH':
        color = AppPalette.danger;
        break;
      case 'LOW':
        color = const Color(0xFF10B981);
        break;
      default:
        color = AppPalette.amber;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacityCompat(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacityCompat(0.2)),
      ),
      child: Text(
        text.toUpperCase(),
        style: GoogleFonts.dmSans(
            fontWeight: FontWeight.bold,
            fontSize: 12,
            color: color,
            letterSpacing: 1),
      ),
    );
  }

  Future<void> _openManagePhotosSheet() async {
    final invId = widget.item['id'] as int?;
    if (invId == null) return;

    await showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (ctx) {
          return StatefulBuilder(builder: (ctx, setStateModal) {
            final current = _images.isNotEmpty ? _images : [];
            return Padding(
              padding: MediaQuery.of(ctx).viewInsets,
              child: Container(
                height: 420,
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Manage Photos',
                            style: Theme.of(ctx).textTheme.titleLarge),
                        Builder(builder: (bctx) {
                          final currentList = _images.isNotEmpty
                              ? _images
                              : (widget.item['images'] is List
                                  ? (widget.item['images'] as List)
                                      .map((m) => m is String
                                          ? m
                                          : (m is Map && m['url'] is String
                                              ? m['url']
                                              : ''))
                                      .where((s) => s.isNotEmpty)
                                      .toList()
                                  : []);
                          final remaining = 5 - currentList.length;
                          return TextButton(
                              onPressed: remaining <= 0
                                  ? null
                                  : () async {
                                      // Pick multiple images (limit client-side to remaining)
                                      List<XFile>? picked;
                                      try {
                                        picked = await _picker.pickMultiImage(
                                            imageQuality: 80);
                                      } catch (_) {
                                        // Fallback to single image picker on platforms
                                        // that don't support multi-select.
                                        final XFile? single =
                                            await _picker.pickImage(
                                                source: ImageSource.gallery,
                                                imageQuality: 80);
                                        picked = single != null ? [single] : [];
                                      }
                                      if (picked.isEmpty) {
                                        return;
                                      }
                                      final toUpload =
                                          picked.take(remaining).toList();
                                      bool anySuccess = false;
                                      for (final p in toUpload) {
                                        final file = File(p.path);
                                        final res = await _investmentsService
                                            .uploadImage(invId, file);
                                        if (res != null) anySuccess = true;
                                      }
                                      await _refreshImages();
                                      setStateModal(() {});
                                      if (!bctx.mounted) return;
                                      ScaffoldMessenger.of(bctx).showSnackBar(
                                        SnackBar(
                                            content: Text(anySuccess
                                                ? 'Uploaded ${toUpload.length} image(s)'
                                                : 'Upload failed')),
                                      );
                                    },
                              child: Text(remaining <= 0
                                  ? 'Max 5 images'
                                  : 'Add Photos ($remaining left)'));
                        })
                      ],
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: current.isEmpty
                          ? Center(child: Text('No images yet'))
                          : GridView.builder(
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: 3,
                                      crossAxisSpacing: 8,
                                      mainAxisSpacing: 8),
                              itemCount: current.length,
                              itemBuilder: (c, i) {
                                final url = current[i];
                                return Stack(
                                  fit: StackFit.expand,
                                  children: [
                                    Image.network(url,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) =>
                                            Container(color: Colors.grey[800])),
                                    Positioned(
                                      top: 6,
                                      right: 6,
                                      child: Column(
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.star_border,
                                                color: Colors.white),
                                            onPressed: () async {
                                              // Find image id (if present in widget.item images list)
                                              final foundMap =
                                                  (widget.item['images'] ?? [])
                                                      .firstWhere(
                                                          (m) => (m is Map &&
                                                              m['url'] == url),
                                                          orElse: () => null);
                                              final id = foundMap is Map
                                                  ? (foundMap['id'] as int?)
                                                  : null;
                                              if (id != null) {
                                                final messenger =
                                                    ScaffoldMessenger.of(
                                                        context);
                                                final ok =
                                                    await _investmentsService
                                                        .setPrimaryImage(
                                                            invId, id);
                                                if (ok) {
                                                  await _refreshImages();
                                                  setStateModal(() {});
                                                  messenger.showSnackBar(
                                                      const SnackBar(
                                                          content: Text(
                                                              'Set as primary')));
                                                }
                                              }
                                            },
                                          ),
                                          IconButton(
                                            icon: const Icon(
                                                Icons.delete_forever,
                                                color: Colors.white),
                                            onPressed: () async {
                                              final foundMap =
                                                  (widget.item['images'] ?? [])
                                                      .firstWhere(
                                                          (m) => (m is Map &&
                                                              m['url'] == url),
                                                          orElse: () => null);
                                              final id = foundMap is Map
                                                  ? (foundMap['id'] as int?)
                                                  : null;
                                              if (id != null) {
                                                final messenger =
                                                    ScaffoldMessenger.of(
                                                        context);
                                                final ok =
                                                    await _investmentsService
                                                        .deleteImage(invId, id);
                                                if (ok) {
                                                  await _refreshImages();
                                                  setStateModal(() {});
                                                  messenger.showSnackBar(
                                                      const SnackBar(
                                                          content:
                                                              Text('Deleted')));
                                                }
                                              }
                                            },
                                          )
                                        ],
                                      ),
                                    )
                                  ],
                                );
                              }),
                    ),
                  ],
                ),
              ),
            );
          });
        });
  }

  Future<void> _refreshImages() async {
    final invId = widget.item['id'] as int?;
    if (invId == null) return;
    try {
      final data = await _investmentsService.getInvestmentById(invId);
      final raw = data?['images'] ??
          data?['imagesAlbum'] ??
          data?['gallery'] ??
          data?['photos'];
      final newImages = <String>[];
      if (raw is List) {
        for (final v in raw) {
          if (v is String && v.isNotEmpty) newImages.add(v);
          if (v is Map && v['url'] is String) newImages.add(v['url']);
        }
      }
      setState(() => _images = newImages);
    } catch (_) {}
  }
}

Widget _buildInfoCard(
    BuildContext context, String title, String value, IconData icon) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;
  return Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacityCompat(isDark ? 0.2 : 0.05),
              offset: const Offset(0, 4),
              blurRadius: 12)
        ],
        border: Border.all(
            color: theme.colorScheme.outline
                .withOpacityCompat(isDark ? 0.1 : 0.05))),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: theme.colorScheme.primary, size: 24),
        const SizedBox(height: 12),
        Text(title,
            style: GoogleFonts.dmSans(
                fontSize: 12,
                color: theme.colorScheme.onSurface.withOpacityCompat(0.6),
                fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(value,
            style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface)),
      ],
    ),
  );
}

Widget _buildDetailRow(ThemeData theme, String label, String value) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 6),
    child: Row(
      children: [
        Expanded(
          flex: 4,
          child: Text(
            label,
            style: GoogleFonts.dmSans(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface.withOpacityCompat(0.6),
            ),
          ),
        ),
        Expanded(
          flex: 6,
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: GoogleFonts.dmSans(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),
        ),
      ],
    ),
  );
}

Map<String, String?> _parsePartner(dynamic partner) {
  String name = 'Partner';
  String role = 'Contributor';
  String? avatar;

  if (partner is String) {
    name = partner;
  } else if (partner is Map) {
    final dynamicName = partner['name'] ??
        partner['partnerName'] ??
        partner['fullName'] ??
        partner['displayName'];
    if (dynamicName != null) name = dynamicName.toString();
    final dynamicRole = partner['role'] ??
        partner['title'] ??
        partner['position'] ??
        partner['type'];
    if (dynamicRole != null) role = dynamicRole.toString();
    final dynamicAvatar = partner['avatar'] ??
        partner['avatarUrl'] ??
        partner['photo'] ??
        partner['image'];
    if (dynamicAvatar != null) avatar = dynamicAvatar.toString();
  }

  return {
    'name': name,
    'role': role,
    'avatar': avatar,
  };
}

Widget _buildPartnersAvatars(ThemeData theme, List<dynamic> partners) {
  final displayCount = partners.length > 5 ? 5 : partners.length;
  final overflow = partners.length - displayCount;
  return SizedBox(
    height: 56,
    child: Stack(
      children: [
        for (int i = 0; i < displayCount; i++)
          Positioned(
            left: i * 28,
            child: _buildPartnerAvatar(theme, partners[i]),
          ),
        if (overflow > 0)
          Positioned(
            left: displayCount * 28,
            child: _buildMoreAvatar(theme, overflow),
          ),
      ],
    ),
  );
}

Widget _buildPartnerAvatar(ThemeData theme, dynamic partner) {
  final data = _parsePartner(partner);
  final name = data['name'] ?? 'Partner';
  final avatar = data['avatar'];
  return CircleAvatar(
    radius: 22,
    backgroundImage: avatar != null ? NetworkImage(avatar) : null,
    backgroundColor: theme.colorScheme.surfaceContainerHighest,
    child: avatar == null ? Text(name.isNotEmpty ? name[0] : '?') : null,
  );
}

Widget _buildMoreAvatar(ThemeData theme, int count) {
  return CircleAvatar(
    radius: 22,
    backgroundColor: theme.colorScheme.primary.withOpacityCompat(0.15),
    child: Text(
      '+$count',
      style: GoogleFonts.dmSans(
        fontWeight: FontWeight.w700,
        color: theme.colorScheme.primary,
      ),
    ),
  );
}

void _showPartnersSheet(BuildContext context, List<dynamic> partners) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (ctx) {
      final theme = Theme.of(ctx);
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Partners',
                      style: GoogleFonts.outfit(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.onSurface)),
                  TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('Close'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: partners.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) => _buildPartnerTile(theme, partners[i]),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

Widget _buildPartnerTile(ThemeData theme, dynamic partner) {
  final data = _parsePartner(partner);
  final name = data['name'] ?? 'Partner';
  final role = data['role'] ?? 'Contributor';
  final avatar = data['avatar'];

  return Container(
    margin: const EdgeInsets.only(bottom: 10),
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    decoration: BoxDecoration(
      color: theme.colorScheme.surface,
      borderRadius: BorderRadius.circular(14),
      border:
          Border.all(color: theme.colorScheme.outline.withOpacityCompat(0.2)),
    ),
    child: Row(
      children: [
        CircleAvatar(
          radius: 20,
          backgroundImage: avatar != null ? NetworkImage(avatar) : null,
          backgroundColor: theme.colorScheme.surfaceContainerHighest,
          child: avatar == null ? Text(name.isNotEmpty ? name[0] : '?') : null,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name,
                  style: GoogleFonts.dmSans(
                      fontWeight: FontWeight.w700,
                      color: theme.colorScheme.onSurface)),
              const SizedBox(height: 2),
              Text(role,
                  style: GoogleFonts.dmSans(
                      color:
                          theme.colorScheme.onSurface.withOpacityCompat(0.6))),
            ],
          ),
        ),
      ],
    ),
  );
}
