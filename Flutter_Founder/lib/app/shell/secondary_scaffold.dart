import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'brand_mark.dart';

class FopxSecondaryScaffold extends StatelessWidget {
  const FopxSecondaryScaffold({super.key, required this.title, required this.subtitle, required this.child});

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsetsDirectional.fromSTEB(FopxSpacing.md, FopxSpacing.md, FopxSpacing.xl, FopxSpacing.md),
              child: Row(
                children: <Widget>[
                  IconButton(onPressed: context.pop, icon: const Icon(Icons.arrow_back_rounded), tooltip: MaterialLocalizations.of(context).backButtonTooltip),
                  const SizedBox(width: FopxSpacing.xs),
                  const FopxBrandMark(compact: true),
                  const SizedBox(width: FopxSpacing.md),
                  Expanded(child: Text(title, style: Theme.of(context).textTheme.titleLarge)),
                ],
              ),
            ),
            Expanded(child: Padding(padding: const EdgeInsetsDirectional.fromSTEB(FopxSpacing.pageGutter, FopxSpacing.sm, FopxSpacing.pageGutter, FopxSpacing.pageGutter), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[Text(subtitle, style: Theme.of(context).textTheme.bodyMedium), const SizedBox(height: FopxSpacing.xl), Expanded(child: child)]))),
          ],
        ),
      ),
    );
  }
}
