import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';
import '../services/messages.dart';
import '../services/config.dart';

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
  const InvestmentInfoScreen({Key? key, required this.item, this.category})
      : super(key: key);

  @override
  State<InvestmentInfoScreen> createState() => _InvestmentInfoScreenState();
}

class _InvestmentInfoScreenState extends State<InvestmentInfoScreen> {
  late bool _fav;
  int _currentImageIndex = 0;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _fav = widget.item['isFavorite'] as bool? ?? false;
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

  Future<void> _handleInvest() async {
    final cost = Env.engageCreditCost;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Start Engagement',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        content: Text(
            'This action will deduct $cost credits from your balance to open a secure channel with the founder. Continue?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppPalette.flame,
                foregroundColor: Colors.white,
              ),
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Confirm')),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text(AppMessages.engageRequestSent),
        backgroundColor: Theme.of(context).colorScheme.secondary,
      ));
    }
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
    final targetVal = item['targetFund'];
    final minInvest = item['minInvest'] ?? '5,000';
    final valuation = item['valuation'] ?? '2.5M';
    final currency = item['currency'] ?? '\$';

    // Parse raised for progress
    double raised = 0.0;
    double target = 0.0;
    if (targetVal is num) {
      target = targetVal.toDouble();
    } else if (targetVal is String) {
      target = double.tryParse(targetVal.replaceAll(',', '')) ?? 0.0;
    }

    const keys = [
      'collected',
      'collectedAmount',
      'raised',
      'raisedAmount',
      'amountRaised',
      'fundedAmount'
    ];
    for (var k in keys) {
      if (item[k] != null) {
        final val = item[k];
        if (val is num) {
          raised = val.toDouble();
        } else if (val is String) {
          raised = double.tryParse(val.replaceAll(',', '')) ?? 0.0;
        }
        break;
      }
    }
    final progress = target > 0 ? (raised / target).clamp(0.0, 1.0) : 0.0;

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
                        itemCount: images.length,
                        onPageChanged: (i) =>
                            setState(() => _currentImageIndex = i),
                        itemBuilder: (_, i) => Image.network(
                          images[i],
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              Container(color: Colors.grey[900]),
                        ),
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
                      // Page Indicator
                      Positioned(
                        bottom: 40,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(images.length, (i) {
                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              margin: const EdgeInsets.symmetric(horizontal: 4),
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
                              '$currency${raised.toStringAsFixed(0)} / $currency${target.toStringAsFixed(0)}',
                              style: GoogleFonts.dmSans(
                                  color: theme.disabledColor)),
                        ],
                      ),

                      const SizedBox(height: 32),

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

                      // Additional lists (Investors, Reviews) could go here...
                      const SizedBox(
                          height: 100), // Bottom padding for fixed button
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Sticky Bottom Action Bar
          Positioned(
            bottom: 0,
            right: 0,
            left: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                  gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                    isDark
                        ? AppPalette.midnightDeep
                        : theme.scaffoldBackgroundColor,
                    isDark
                        ? AppPalette.midnightDeep.withOpacityCompat(0.9)
                        : theme.scaffoldBackgroundColor.withOpacityCompat(0.9),
                    isDark
                        ? AppPalette.midnightDeep.withOpacityCompat(0.0)
                        : theme.scaffoldBackgroundColor.withOpacityCompat(0.0),
                  ],
                      stops: const [
                    0.4,
                    0.8,
                    1.0
                  ])),
              child: SafeArea(
                top: false,
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _handleInvest,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      foregroundColor: Colors.white,
                      elevation: 8,
                      shadowColor:
                          theme.colorScheme.primary.withOpacityCompat(0.4),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text('Invest Now',
                        style: GoogleFonts.outfit(
                            fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ),
              ),
            ),
          )
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
}
