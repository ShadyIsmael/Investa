import 'package:flutter/material.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

class FoundationSectionPage extends StatelessWidget {
  const FoundationSectionPage({super.key, required this.title, required this.subtitle, required this.body, required this.icon});

  final String title;
  final String subtitle;
  final String body;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsetsDirectional.fromSTEB(FopxSpacing.pageGutter, FopxSpacing.md, FopxSpacing.pageGutter, FopxSpacing.xl),
      children: <Widget>[
        Text(title, style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: FopxSpacing.sm),
        Text(subtitle, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.62))),
        const SizedBox(height: FopxSpacing.largeSectionGap),
        FopxStatusBadge(label: context.l10n.phaseZero),
        const SizedBox(height: FopxSpacing.md),
        SizedBox(height: 300, child: FopxEmptyState(title: context.l10n.emptyTitle, body: body, icon: icon)),
      ],
    );
  }
}
