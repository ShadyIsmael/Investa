import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../app/shell/secondary_scaffold.dart';
import '../data/contract_controller.dart';

class ContractPreviewPage extends ConsumerWidget {
  const ContractPreviewPage({
    required this.contractId,
    required this.versionNumber,
    super.key,
  });

  final int contractId;
  final int versionNumber;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (!_supportsWebView) {
      return FopxSecondaryScaffold(
        title: context.l10n.contractPreviewTitle,
        subtitle: context.l10n.contractReadOnly,
        child: Center(
          child: Text(
            context.l10n.contractPreviewUnsupported,
            textAlign: TextAlign.center,
          ),
        ),
      );
    }
    final key = (contractId, versionNumber);
    final preview = ref.watch(founderContractPreviewProvider(key));
    return FopxSecondaryScaffold(
      title: context.l10n.contractPreviewTitle,
      subtitle: context.l10n.contractReadOnly,
      child: preview.when(
        loading: () => const FopxLoadingState(height: 220),
        error:
            (_, _) => FopxErrorState(
              title: context.l10n.contractDetailLoadFailed,
              body: context.l10n.contractDetailLoadFailedBody,
              actionLabel: context.l10n.retry,
              kind: FopxErrorKind.network,
              onAction:
                  () => ref.invalidate(founderContractPreviewProvider(key)),
            ),
        data: (html) => _ContractHtmlView(html: html),
      ),
    );
  }

  bool get _supportsWebView => switch (defaultTargetPlatform) {
    TargetPlatform.android ||
    TargetPlatform.iOS ||
    TargetPlatform.macOS => true,
    _ => false,
  };
}

class _ContractHtmlView extends StatefulWidget {
  const _ContractHtmlView({required this.html});

  final String html;

  @override
  State<_ContractHtmlView> createState() => _ContractHtmlViewState();
}

class _ContractHtmlViewState extends State<_ContractHtmlView> {
  late final WebViewController _controller;
  late final Future<void> _load;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController();
    _load = _controller
        .setJavaScriptMode(JavaScriptMode.disabled)
        .then(
          (_) => _controller.setNavigationDelegate(
            NavigationDelegate(
              onNavigationRequest: (_) => NavigationDecision.prevent,
            ),
          ),
        )
        .then((_) => _controller.setBackgroundColor(Colors.white))
        .then((_) => _controller.enableZoom(true))
        .then((_) => _controller.loadHtmlString(widget.html));
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<void>(
    future: _load,
    builder: (context, snapshot) {
      if (snapshot.hasError) {
        return FopxErrorState(
          title: context.l10n.contractDetailLoadFailed,
          body: context.l10n.contractDetailLoadFailedBody,
          kind: FopxErrorKind.network,
        );
      }
      if (snapshot.connectionState != ConnectionState.done) {
        return const FopxLoadingState(height: 220);
      }
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: WebViewWidget(controller: _controller),
      );
    },
  );
}
