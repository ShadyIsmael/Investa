import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_founder/features/deals/data/contract_controller.dart';
import 'package:fopx_founder/features/deals/data/contract_detail.dart';

void main() {
  test('parses contract detail DTO from the API', () {
    final detail = FounderContractDetail.fromJson(<String, dynamic>{
      'contract': <String, dynamic>{
        'contractId': 42,
        'contractNumber': 'INV-42',
        'status': 'Active',
        'investmentModel': 'Equity',
        'founderDisplayName': 'Founder One',
        'investorDisplayName': 'Investor One',
        'currentVersionNumber': 2,
      },
      'currentVersion': <String, dynamic>{
        'versionNumber': 2,
        'versionType': 'Final',
        'status': 'Active',
        'createdAt': '2026-09-22T10:00:00Z',
        'activatedAt': '2026-09-23T10:00:00Z',
        'htmlPreviewAvailable': true,
        'pdfDownloadAvailable': true,
        'pdfStatus': 'Ready',
        'documentHash': 'html-hash',
        'pdfHash': 'pdf-hash',
        'pdfDocumentSize': 8192,
      },
      'versionHistory': <Map<String, dynamic>>[
        <String, dynamic>{
          'versionNumber': 2,
          'versionType': 'Final',
          'status': 'Active',
          'createdAt': '2026-09-22T10:00:00Z',
          'activatedAt': '2026-09-23T10:00:00Z',
          'htmlPreviewAvailable': true,
          'pdfDownloadAvailable': true,
          'pdfStatus': 'Ready',
          'documentHash': 'html-hash',
          'pdfHash': 'pdf-hash',
          'pdfDocumentSize': 8192,
        },
      ],
    });

    expect(detail.id, 42);
    expect(detail.number, 'INV-42');
    expect(detail.investorName, 'Investor One');
    expect(detail.currentVersionNumber, 2);
    expect(detail.pdfAvailable, isTrue);
    expect(detail.htmlPreviewAvailable, isTrue);
    expect(detail.pdfHash, 'pdf-hash');
    expect(detail.pdfDocumentSize, 8192);
    expect(detail.versionHistory, hasLength(1));
    expect(detail.versionHistory.single.type, 'Final');
    expect(detail.versionHistory.single.documentHash, 'html-hash');
  });

  test(
    'fetches authenticated contract preview as HTML and applies CSP',
    () async {
      const html =
          '<!doctype html><html><head><title>Agreement</title></head>'
          '<body><main>Approved terms</main></body></html>';
      final adapter = _ContractPreviewAdapter(html);
      final api = FopxApiClient(
        environment: const AppEnvironment(
          apiBaseUrl: 'https://founder.test/api/v1',
        ),
        sessionStore: _EmptySessionStore(),
        httpClientAdapter: adapter,
      );

      final result = await fetchContractPreviewHtml(
        api,
        contractId: 42,
        versionNumber: 3,
      );

      expect(
        adapter.request!.uri.path,
        '/api/v1/contracts/42/versions/3/preview',
      );
      expect(adapter.request!.method, 'GET');
      expect(adapter.request!.headers['Accept'], 'text/html');
      expect(adapter.request!.responseType, ResponseType.plain);
      expect(result, contains("default-src 'none'"));
      expect(result, contains('Approved terms'));
    },
  );

  test('rejects active or externally linked preview markup', () {
    expect(
      () => prepareContractPreviewHtml(
        '<!doctype html><html><head></head><body><script>alert(1)</script></body></html>',
      ),
      throwsA(isA<ApiError>()),
    );
    expect(
      () => prepareContractPreviewHtml(
        '<!doctype html><html><head></head><body><a href="https://bad.test">terms</a></body></html>',
      ),
      throwsA(isA<ApiError>()),
    );
  });
}

class _ContractPreviewAdapter implements HttpClientAdapter {
  _ContractPreviewAdapter(this.html);

  final String html;
  RequestOptions? request;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    request = options;
    return ResponseBody.fromString(
      html,
      200,
      headers: <String, List<String>>{
        Headers.contentTypeHeader: <String>['text/html; charset=utf-8'],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

class _EmptySessionStore extends SessionStore {
  @override
  Future<SessionTokens?> read() async => null;

  @override
  Future<void> save(SessionTokens tokens) async {}

  @override
  Future<void> clear() async {}
}
