import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import '../../../app/shell/brand_mark.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _passwordFocus = FocusNode();
  String? _error;
  String? _phoneError;
  bool _busy = false;
  List<FopxCountry> _countries = FopxCountryCatalog.fallback;
  FopxCountry _country = FopxCountryCatalog.egypt;

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_loadCountries);
  }

  Future<void> _loadCountries() async {
    final countries = await ref.read(fopxCountryCatalogProvider.future);
    if (!mounted || countries.isEmpty) return;
    var selected = countries.first;
    for (final country in countries) {
      if (country.isoAlpha2 == _country.isoAlpha2) {
        selected = country;
        break;
      }
    }
    setState(() {
      _countries = countries;
      _country = selected;
    });
  }

  @override
  void dispose() {
    _phone.dispose();
    _password.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final l10n = context.l10n;
    final normalizedPhone = FopxPhoneNormalizer.normalize(
      rawValue: _phone.text,
      selectedCountry: _country,
      countries: _countries,
    );
    if (!normalizedPhone.isValid) {
      setState(() {
        _phoneError = switch (normalizedPhone.issue) {
          FopxPhoneIssue.empty => l10n.requiredField,
          FopxPhoneIssue.unsupportedCountry => l10n.unsupportedCountry,
          FopxPhoneIssue.ambiguousCountry => l10n.ambiguousCountry,
          FopxPhoneIssue.malformed || null => l10n.invalidPhoneNumber,
        };
        _error = null;
      });
      return;
    }
    if (_password.text.isEmpty) {
      setState(() => _error = l10n.requiredField);
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
      _phoneError = null;
    });
    try {
      await ref
          .read(sessionControllerProvider.notifier)
          .login(phoneNumber: normalizedPhone.value!, password: _password.text);
      if (mounted) context.go('/home');
    } catch (error) {
      if (!mounted) return;
      setState(
        () =>
            _error =
                error is ApiError ? error.message : l10n.invalidCredentials,
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      body: Stack(
        children: <Widget>[
          PositionedDirectional(
            top: -120,
            end: -90,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: scheme.primary.withValues(alpha: 0.09),
              ),
            ),
          ),
          PositionedDirectional(
            bottom: -160,
            start: -110,
            child: Container(
              width: 340,
              height: 340,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: scheme.secondary.withValues(alpha: 0.07),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsetsDirectional.fromSTEB(
                FopxSpacing.pageGutter,
                FopxSpacing.largeSectionGap,
                FopxSpacing.pageGutter,
                FopxSpacing.xl,
              ),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 520),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const FopxBrandMark(),
                    const SizedBox(height: FopxSpacing.largeSectionGap),
                    Text(
                      l10n.secureAccess,
                      style: Theme.of(context).textTheme.displaySmall,
                    ),
                    const SizedBox(height: FopxSpacing.md),
                    Text(
                      l10n.loginSubtitle,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: scheme.onSurface.withValues(alpha: 0.62),
                      ),
                    ),
                    const SizedBox(height: FopxSpacing.largeSectionGap),
                    FopxPhoneField(
                      label: l10n.phoneNumber,
                      hintText: l10n.phoneNumberHint,
                      countrySemanticLabel: l10n.countrySelector,
                      searchCountriesLabel: l10n.searchCountries,
                      countries: _countries,
                      selectedCountry: _country,
                      onCountryChanged:
                          (country) => setState(() {
                            _country = country;
                            _phoneError = null;
                          }),
                      controller: _phone,
                      onChanged: (_) {
                        if (_phoneError != null) {
                          setState(() => _phoneError = null);
                        }
                      },
                      onSubmitted: (_) => _passwordFocus.requestFocus(),
                      textInputAction: TextInputAction.next,
                      errorText: _phoneError,
                    ),
                    const SizedBox(height: FopxSpacing.formGap),
                    FopxTextField(
                      label: l10n.password,
                      hintText: l10n.passwordHint,
                      controller: _password,
                      focusNode: _passwordFocus,
                      obscureText: true,
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) => _submit(),
                      autofillHints: const <String>[AutofillHints.password],
                    ),
                    AnimatedSwitcher(
                      duration: FopxMotion.duration(
                        context,
                        FopxMotion.standard,
                      ),
                      child:
                          _error == null
                              ? const SizedBox(
                                height: 24,
                                key: ValueKey('no-error'),
                              )
                              : Padding(
                                key: const ValueKey('error'),
                                padding: const EdgeInsets.only(
                                  top: FopxSpacing.formGap,
                                ),
                                child: Text(
                                  _error!,
                                  style: Theme.of(context).textTheme.bodyMedium
                                      ?.copyWith(color: scheme.error),
                                ),
                              ),
                    ),
                    FopxButton(
                      label: l10n.continueLabel,
                      icon: Icons.arrow_forward_rounded,
                      onPressed: _submit,
                      expanded: true,
                      busy: _busy,
                    ),
                    const SizedBox(height: FopxSpacing.xl),
                    Center(
                      child: Text(
                        l10n.phaseZero,
                        style: Theme.of(
                          context,
                        ).textTheme.labelMedium?.copyWith(
                          color: scheme.onSurface.withValues(alpha: 0.45),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
