import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import '../../../app/app.dart';
import '../../../app/shell/secondary_scaffold.dart';
import '../data/founder_profile.dart';
import '../data/profile_controller.dart';
import '../../notifications/data/notifications_controller.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale =
        ref.watch(localeControllerProvider).valueOrNull ?? const Locale('en');
    final profile = ref.watch(founderProfileProvider);
    final trust = ref.watch(founderTrustScoreProvider);
    return FopxSecondaryScaffold(
      title: context.l10n.profile,
      subtitle: context.l10n.profileSubtitle,
      child: ListView(
        children: <Widget>[
          _ProfileIdentity(profile: profile),
          if (profile.valueOrNull != null) ...<Widget>[
            const SizedBox(height: FopxSpacing.sm),
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: OutlinedButton.icon(
                onPressed: () async {
                  final saved = await showDialog<bool>(
                    context: context,
                    builder:
                        (_) =>
                            _EditProfileDialog(profile: profile.valueOrNull!),
                  );
                  if (saved == true && context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(context.l10n.profileUpdated)),
                    );
                  }
                },
                icon: const Icon(Icons.edit_outlined),
                label: Text(context.l10n.editProfile),
              ),
            ),
          ],
          const SizedBox(height: FopxSpacing.lg),
          _TrustCard(trust: trust),
          const SizedBox(height: FopxSpacing.xxl),
          Text(
            context.l10n.accountSecurity,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: FopxSpacing.xs),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.lock_outline_rounded),
            title: Text(context.l10n.changePassword),
            subtitle: Text(
              trust.valueOrNull?.phoneVerified == true
                  ? context.l10n.changePasswordSubtitle
                  : context.l10n.verifyPhoneToChangePassword,
            ),
            trailing: const Icon(Icons.chevron_right_rounded),
            enabled: trust.valueOrNull?.phoneVerified == true,
            onTap:
                trust.valueOrNull?.phoneVerified != true
                    ? null
                    : () async {
                      final changed = await showDialog<bool>(
                        context: context,
                        builder: (_) => const _PasswordChangeDialog(),
                      );
                      if (changed == true && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(context.l10n.passwordChangeComplete),
                          ),
                        );
                      }
                    },
          ),
          const SizedBox(height: FopxSpacing.xxl),
          Text(
            context.l10n.language,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: FopxSpacing.md),
          Row(
            children: <Widget>[
              Expanded(
                child: _LanguageChoice(
                  label: context.l10n.english,
                  selected: locale.languageCode == 'en',
                  onTap:
                      () => ref
                          .read(localeControllerProvider.notifier)
                          .setLocale(const Locale('en')),
                ),
              ),
              const SizedBox(width: FopxSpacing.sm),
              Expanded(
                child: _LanguageChoice(
                  label: context.l10n.arabic,
                  selected: locale.languageCode == 'ar',
                  onTap:
                      () => ref
                          .read(localeControllerProvider.notifier)
                          .setLocale(const Locale('ar')),
                ),
              ),
            ],
          ),
          const SizedBox(height: FopxSpacing.xxl),
          Text(
            context.l10n.appearance,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: FopxSpacing.sm),
          DropdownButtonFormField<ThemeMode>(
            initialValue:
                ref.watch(themeModeControllerProvider).valueOrNull ??
                ThemeMode.system,
            decoration: InputDecoration(labelText: context.l10n.appearance),
            items: <DropdownMenuItem<ThemeMode>>[
              DropdownMenuItem(
                value: ThemeMode.system,
                child: Text(context.l10n.themeSystem),
              ),
              DropdownMenuItem(
                value: ThemeMode.light,
                child: Text(context.l10n.themeLight),
              ),
              DropdownMenuItem(
                value: ThemeMode.dark,
                child: Text(context.l10n.themeDark),
              ),
            ],
            onChanged: (mode) {
              if (mode != null) {
                ref
                    .read(themeModeControllerProvider.notifier)
                    .setThemeMode(mode);
              }
            },
          ),
          const SizedBox(height: FopxSpacing.xxl),
          FopxButton(
            label: context.l10n.signOut,
            icon: Icons.logout_rounded,
            expanded: true,
            onPressed: () async {
              try {
                await deactivateFounderPushToken(ref.read(apiClientProvider));
              } catch (_) {
                // Push-token cleanup is best effort; it must not trap logout.
              }
              ref.invalidate(founderProfileProvider);
              ref.invalidate(founderTrustScoreProvider);
              await ref.read(sessionControllerProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
    );
  }
}

class _ProfileIdentity extends StatelessWidget {
  const _ProfileIdentity({required this.profile});

  final AsyncValue<FounderProfile> profile;

  @override
  Widget build(BuildContext context) => profile.when(
    loading: () => const FopxLoadingState(height: 150),
    error:
        (_, _) => FopxErrorState(
          title: context.l10n.profileLoadFailed,
          body: context.l10n.profileLoadFailedBody,
          actionLabel: context.l10n.retry,
          kind: FopxErrorKind.network,
          onAction:
              () =>
                  ProviderScope.containerOf(context)
                    ..invalidate(founderProfileProvider),
        ),
    data: (data) {
      final displayName =
          data.fullName.isNotEmpty
              ? data.fullName
              : context.l10n.founderIdentity;
      final completion = (data.profileCompletion / 100).clamp(0.0, 1.0);
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              FopxAvatar(label: displayName, size: 58),
              const SizedBox(width: FopxSpacing.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      displayName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    if (data.companyName.isNotEmpty)
                      Text(
                        data.companyName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    if (data.email.isNotEmpty)
                      Text(
                        data.email,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                  ],
                ),
              ),
            ],
          ),
          if (data.bio.isNotEmpty) ...<Widget>[
            const SizedBox(height: FopxSpacing.md),
            Text(data.bio, style: Theme.of(context).textTheme.bodyMedium),
          ],
          if (data.city.isNotEmpty || data.country.isNotEmpty) ...<Widget>[
            const SizedBox(height: FopxSpacing.sm),
            Text(
              <String>[
                data.city,
                data.country,
              ].where((part) => part.isNotEmpty).join(', '),
            ),
          ],
          const SizedBox(height: FopxSpacing.lg),
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  context.l10n.profileCompletion,
                  style: Theme.of(context).textTheme.labelLarge,
                ),
              ),
              Text('${data.profileCompletion}%'),
            ],
          ),
          const SizedBox(height: FopxSpacing.xs),
          LinearProgressIndicator(value: completion),
          const SizedBox(height: FopxSpacing.lg),
          if (data.credibilityScore != null)
            _ScoreLine(
              label: context.l10n.credibilityScore,
              value: _formatScore(data.credibilityScore!),
            ),
          if (data.score != null)
            _ScoreLine(
              label: context.l10n.profileScore,
              value: _formatScore(data.score!),
            ),
        ],
      );
    },
  );
}

class _TrustCard extends StatelessWidget {
  const _TrustCard({required this.trust});

  final AsyncValue<FounderTrustScore> trust;

  @override
  Widget build(BuildContext context) => trust.when(
    loading: () => const FopxLoadingState(height: 132),
    error: (_, _) => const SizedBox.shrink(),
    data:
        (data) => Card(
          child: Padding(
            padding: const EdgeInsets.all(FopxSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  context.l10n.trustAndReputation,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: FopxSpacing.sm),
                _ScoreLine(
                  label: context.l10n.trustLevel,
                  value:
                      data.trustLevelLabel.isEmpty
                          ? data.trustLevel.toString()
                          : data.trustLevelLabel,
                ),
                _ScoreLine(
                  label: context.l10n.reputationScore,
                  value: data.reputationScore.toString(),
                ),
                _ScoreLine(
                  label: context.l10n.activityScore,
                  value: data.activityScore.toString(),
                ),
                const SizedBox(height: FopxSpacing.sm),
                Wrap(
                  spacing: FopxSpacing.sm,
                  runSpacing: FopxSpacing.xs,
                  children: <Widget>[
                    _VerificationChip(
                      label: context.l10n.phoneVerified,
                      verified: data.phoneVerified,
                    ),
                    _VerificationChip(
                      label: context.l10n.emailVerified,
                      verified: data.emailVerified,
                    ),
                  ],
                ),
                if (data.nextLevelRequirements.isNotEmpty) ...<Widget>[
                  const SizedBox(height: FopxSpacing.md),
                  Text(
                    context.l10n.trustRequirements,
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  for (final requirement in data.nextLevelRequirements)
                    ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: Icon(
                        requirement.isMet
                            ? Icons.check_circle_outline
                            : Icons.radio_button_unchecked,
                      ),
                      title: Text(
                        Localizations.localeOf(context).languageCode == 'ar' &&
                                requirement.labelAr.isNotEmpty
                            ? requirement.labelAr
                            : requirement.labelEn,
                      ),
                      subtitle: Text(
                        requirement.isMet
                            ? context.l10n.requirementMet
                            : context.l10n.requirementOpen,
                      ),
                    ),
                ],
                if (data.verifications.isNotEmpty) ...<Widget>[
                  const SizedBox(height: FopxSpacing.md),
                  Text(
                    context.l10n.verificationHistory,
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  for (final verification in data.verifications)
                    _ScoreLine(
                      label: verification.type,
                      value: verification.status,
                    ),
                ],
              ],
            ),
          ),
        ),
  );
}

class _ScoreLine extends StatelessWidget {
  const _ScoreLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: FopxSpacing.xs),
    child: Row(
      children: <Widget>[
        Expanded(child: Text(label)),
        Text(value, style: Theme.of(context).textTheme.labelLarge),
      ],
    ),
  );
}

class _VerificationChip extends StatelessWidget {
  const _VerificationChip({required this.label, required this.verified});

  final String label;
  final bool verified;

  @override
  Widget build(BuildContext context) => Chip(
    avatar: Icon(
      verified ? Icons.verified_rounded : Icons.pending_outlined,
      size: 18,
    ),
    label: Text(
      '$label · ${verified ? context.l10n.verified : context.l10n.pending}',
    ),
  );
}

String _formatScore(double value) =>
    value == value.roundToDouble()
        ? value.toInt().toString()
        : value.toStringAsFixed(1);

class _EditProfileDialog extends ConsumerStatefulWidget {
  const _EditProfileDialog({required this.profile});

  final FounderProfile profile;

  @override
  ConsumerState<_EditProfileDialog> createState() => _EditProfileDialogState();
}

class _EditProfileDialogState extends ConsumerState<_EditProfileDialog> {
  late final TextEditingController _firstName = TextEditingController(
    text: widget.profile.firstName,
  );
  late final TextEditingController _lastName = TextEditingController(
    text: widget.profile.lastName,
  );
  late final TextEditingController _mobile = TextEditingController(
    text: widget.profile.mobile,
  );
  final _formKey = GlobalKey<FormState>();
  bool _saving = false;
  bool _failed = false;

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _mobile.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: Text(context.l10n.editProfile),
    content: SizedBox(
      width: 440,
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              TextFormField(
                controller: _firstName,
                textCapitalization: TextCapitalization.words,
                decoration: InputDecoration(labelText: context.l10n.firstName),
                validator:
                    (value) =>
                        (value?.trim().isEmpty ?? true)
                            ? context.l10n.requiredField
                            : null,
              ),
              TextFormField(
                controller: _lastName,
                textCapitalization: TextCapitalization.words,
                decoration: InputDecoration(labelText: context.l10n.lastName),
                validator:
                    (value) =>
                        (value?.trim().isEmpty ?? true)
                            ? context.l10n.requiredField
                            : null,
              ),
              TextFormField(
                controller: _mobile,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(labelText: context.l10n.mobile),
                validator: (value) {
                  final number = value?.trim() ?? '';
                  return number.isEmpty || number.length > 30
                      ? context.l10n.invalidPhoneNumber
                      : null;
                },
              ),
              if (_failed)
                Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: Text(
                    context.l10n.profileUpdateFailed,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    ),
    actions: <Widget>[
      TextButton(
        onPressed: _saving ? null : () => Navigator.pop(context, false),
        child: Text(context.l10n.cancel),
      ),
      FilledButton(
        onPressed: _saving ? null : _save,
        child:
            _saving
                ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
                : Text(context.l10n.save),
      ),
    ],
  );

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _failed = false;
    });
    try {
      await ref
          .read(founderProfileRepositoryProvider)
          .updateBasicProfile(
            firstName: _firstName.text,
            lastName: _lastName.text,
            mobile: _mobile.text,
          );
      ref.invalidate(founderProfileProvider);
      ref.invalidate(founderTrustScoreProvider);
      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _saving = false;
          _failed = true;
        });
      }
    }
  }
}

class _PasswordChangeDialog extends ConsumerStatefulWidget {
  const _PasswordChangeDialog();

  @override
  ConsumerState<_PasswordChangeDialog> createState() =>
      _PasswordChangeDialogState();
}

class _PasswordChangeDialogState extends ConsumerState<_PasswordChangeDialog> {
  final _formKey = GlobalKey<FormState>();
  final _currentPassword = TextEditingController();
  final _code = TextEditingController();
  final _newPassword = TextEditingController();
  final _confirmPassword = TextEditingController();
  bool _codeSent = false;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _currentPassword.dispose();
    _code.dispose();
    _newPassword.dispose();
    _confirmPassword.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: Text(context.l10n.changePassword),
    content: SizedBox(
      width: 440,
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              if (!_codeSent) ...<Widget>[
                TextFormField(
                  controller: _currentPassword,
                  obscureText: true,
                  autofillHints: const <String>[AutofillHints.password],
                  decoration: InputDecoration(
                    labelText: context.l10n.currentPassword,
                  ),
                  validator:
                      (value) =>
                          (value?.isEmpty ?? true)
                              ? context.l10n.requiredField
                              : null,
                ),
              ] else ...<Widget>[
                Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: FopxSpacing.sm),
                    child: Text(context.l10n.passwordCodeSent),
                  ),
                ),
                TextFormField(
                  controller: _code,
                  keyboardType: TextInputType.number,
                  textInputAction: TextInputAction.next,
                  inputFormatters: <TextInputFormatter>[
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(6),
                  ],
                  decoration: InputDecoration(
                    labelText: context.l10n.verificationCode,
                  ),
                  validator:
                      (value) =>
                          (value?.trim().length == 6)
                              ? null
                              : context.l10n.requiredField,
                ),
                TextFormField(
                  controller: _newPassword,
                  obscureText: true,
                  autofillHints: const <String>[AutofillHints.newPassword],
                  decoration: InputDecoration(
                    labelText: context.l10n.newPassword,
                  ),
                  validator:
                      (value) =>
                          (value?.isEmpty ?? true)
                              ? context.l10n.requiredField
                              : null,
                ),
                TextFormField(
                  controller: _confirmPassword,
                  obscureText: true,
                  autofillHints: const <String>[AutofillHints.newPassword],
                  decoration: InputDecoration(
                    labelText: context.l10n.confirmNewPassword,
                  ),
                  validator:
                      (value) =>
                          value != _newPassword.text
                              ? context.l10n.passwordsDoNotMatch
                              : null,
                ),
              ],
              if (_error != null) ...<Widget>[
                const SizedBox(height: FopxSpacing.sm),
                Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: Text(
                    _error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    ),
    actions: <Widget>[
      TextButton(
        onPressed: _busy ? null : () => Navigator.pop(context, false),
        child: Text(context.l10n.cancel),
      ),
      FilledButton(
        onPressed: _busy ? null : (_codeSent ? _confirm : _sendCode),
        child:
            _busy
                ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
                : Text(
                  _codeSent
                      ? context.l10n.changePassword
                      : context.l10n.sendVerificationCode,
                ),
      ),
    ],
  );

  Future<void> _sendCode() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref
          .read(founderProfileRepositoryProvider)
          .sendPasswordChangeCode(_currentPassword.text);
      if (mounted) {
        setState(() {
          _codeSent = true;
          _currentPassword.clear();
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _error = _passwordChangeError(error);
        });
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _confirm() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref
          .read(founderProfileRepositoryProvider)
          .confirmPasswordChange(
            code: _code.text.trim(),
            newPassword: _newPassword.text,
          );
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      if (mounted) {
        setState(() {
          _error = _passwordChangeError(error);
        });
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _passwordChangeError(Object error) {
    if (error is! ApiError) return context.l10n.passwordChangeFailed;

    final details = <String>[];
    final data = error.data;
    if (data is List) {
      for (final item in data) {
        if (item is String && item.trim().isNotEmpty) {
          details.add(item.trim());
        } else if (item is Map) {
          final description = item['description'] ?? item['message'];
          if (description is String && description.trim().isNotEmpty) {
            details.add(description.trim());
          }
        }
      }
    }
    details.addAll(
      error.errors
          .map((item) => item.message.trim())
          .where((message) => message.isNotEmpty),
    );
    return <String>{error.message, ...details}.join('\n');
  }
}

class _LanguageChoice extends StatelessWidget {
  const _LanguageChoice({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Semantics(
      button: true,
      selected: selected,
      label: label,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: FopxMotion.duration(context, FopxMotion.standard),
          padding: const EdgeInsets.symmetric(vertical: FopxSpacing.lg),
          decoration: BoxDecoration(
            color: selected ? scheme.primaryContainer : scheme.surface,
            borderRadius: BorderRadius.circular(FopxRadii.control),
            border: Border.all(
              color: selected ? scheme.primary : scheme.outline,
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: selected ? scheme.primary : scheme.onSurface,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
