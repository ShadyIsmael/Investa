import 'package:fopx_core/fopx_core.dart';
import 'package:flutter/material.dart';

import '../theme/fopx_tokens.dart';

/// A reusable, theme-driven country selector for phone-number fields.
class FopxCountryCodeSelector extends StatelessWidget {
  const FopxCountryCodeSelector({
    super.key,
    required this.countries,
    required this.selectedCountry,
    required this.onChanged,
    required this.semanticLabel,
    required this.searchLabel,
  });

  final List<FopxCountry> countries;
  final FopxCountry selectedCountry;
  final ValueChanged<FopxCountry> onChanged;
  final String semanticLabel;
  final String searchLabel;

  Future<void> _openPicker(BuildContext context) async {
    final selected = await showModalBottomSheet<FopxCountry>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) => _CountryPickerSheet(
        countries: countries,
        selectedCountry: selectedCountry,
        searchLabel: searchLabel,
      ),
    );
    if (selected != null && context.mounted) onChanged(selected);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Semantics(
      button: true,
      label:
          '$semanticLabel, ${selectedCountry.nameFor(Localizations.localeOf(context))}, ${selectedCountry.callingCode}',
      child: InkWell(
        onTap: countries.isEmpty ? null : () => _openPicker(context),
        borderRadius: BorderRadius.circular(FopxRadii.control - 3),
        child: ConstrainedBox(
          constraints: const BoxConstraints(minWidth: 116, minHeight: 48),
          child: Padding(
            padding: const EdgeInsetsDirectional.only(start: 4, end: 10),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Text(
                  selectedCountry.flag,
                  style: const TextStyle(fontSize: 20),
                  textDirection: TextDirection.ltr,
                ),
                const SizedBox(width: 7),
                Text(
                  selectedCountry.callingCode,
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontFeatures: const <FontFeature>[
                      FontFeature.tabularFigures(),
                    ],
                  ),
                  textDirection: TextDirection.ltr,
                ),
                const SizedBox(width: 3),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  size: 20,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.62),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class FopxPhoneField extends StatefulWidget {
  const FopxPhoneField({
    super.key,
    required this.label,
    required this.hintText,
    required this.countrySemanticLabel,
    required this.searchCountriesLabel,
    required this.countries,
    required this.selectedCountry,
    required this.onCountryChanged,
    required this.controller,
    this.focusNode,
    this.errorText,
    this.onChanged,
    this.onSubmitted,
    this.textInputAction,
  });

  final String label;
  final String hintText;
  final String countrySemanticLabel;
  final String searchCountriesLabel;
  final List<FopxCountry> countries;
  final FopxCountry selectedCountry;
  final ValueChanged<FopxCountry> onCountryChanged;
  final TextEditingController controller;
  final FocusNode? focusNode;
  final String? errorText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final TextInputAction? textInputAction;

  @override
  State<FopxPhoneField> createState() => _FopxPhoneFieldState();
}

class _FopxPhoneFieldState extends State<FopxPhoneField> {
  bool _focused = false;

  @override
  void initState() {
    super.initState();
    widget.focusNode?.addListener(_handleFocusChanged);
    widget.controller.addListener(_handleControllerChanged);
    _focused = widget.focusNode?.hasFocus ?? false;
  }

  @override
  void didUpdateWidget(covariant FopxPhoneField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.focusNode != widget.focusNode) {
      oldWidget.focusNode?.removeListener(_handleFocusChanged);
      widget.focusNode?.addListener(_handleFocusChanged);
      _focused = widget.focusNode?.hasFocus ?? false;
    }
    if (oldWidget.controller != widget.controller) {
      oldWidget.controller.removeListener(_handleControllerChanged);
      widget.controller.addListener(_handleControllerChanged);
    }
  }

  @override
  void dispose() {
    widget.focusNode?.removeListener(_handleFocusChanged);
    widget.controller.removeListener(_handleControllerChanged);
    super.dispose();
  }

  void _handleFocusChanged() {
    if (mounted) setState(() => _focused = widget.focusNode?.hasFocus ?? false);
  }

  void _handleControllerChanged() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final widget = this.widget;
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final borderColor = widget.errorText != null
        ? scheme.error
        : _focused
        ? scheme.primary
        : scheme.outline;
    return InputDecorator(
      isFocused: _focused,
      isEmpty: widget.controller.text.isEmpty,
      decoration: InputDecoration(
        labelText: widget.label,
        floatingLabelBehavior: FloatingLabelBehavior.always,
        errorText: widget.errorText,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FopxRadii.control),
          borderSide: BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FopxRadii.control),
          borderSide: BorderSide(color: borderColor, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FopxRadii.control),
          borderSide: BorderSide(color: scheme.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FopxRadii.control),
          borderSide: BorderSide(color: scheme.error, width: 1.5),
        ),
        filled: true,
        fillColor: theme.inputDecorationTheme.fillColor,
        contentPadding: const EdgeInsetsDirectional.fromSTEB(8, 6, 14, 6),
      ),
      child: Row(
        children: <Widget>[
          FopxCountryCodeSelector(
            countries: widget.countries,
            selectedCountry: widget.selectedCountry,
            onChanged: widget.onCountryChanged,
            semanticLabel: widget.countrySemanticLabel,
            searchLabel: widget.searchCountriesLabel,
          ),
          Container(width: 1, height: 28, color: scheme.outlineVariant),
          const SizedBox(width: 10),
          Expanded(
            child: Directionality(
              textDirection: TextDirection.ltr,
              child: TextField(
                controller: widget.controller,
                focusNode: widget.focusNode,
                keyboardType: TextInputType.phone,
                textInputAction: widget.textInputAction,
                onChanged: widget.onChanged,
                onSubmitted: widget.onSubmitted,
                textDirection: TextDirection.ltr,
                textAlign: TextAlign.start,
                autofillHints: const <String>[AutofillHints.telephoneNumber],
                style: theme.textTheme.bodyLarge?.copyWith(
                  fontFeatures: const <FontFeature>[
                    FontFeature.tabularFigures(),
                  ],
                ),
                decoration: InputDecoration.collapsed(
                  hintText: widget.hintText,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CountryPickerSheet extends StatefulWidget {
  const _CountryPickerSheet({
    required this.countries,
    required this.selectedCountry,
    required this.searchLabel,
  });

  final List<FopxCountry> countries;
  final FopxCountry selectedCountry;
  final String searchLabel;

  @override
  State<_CountryPickerSheet> createState() => _CountryPickerSheetState();
}

class _CountryPickerSheetState extends State<_CountryPickerSheet> {
  final _search = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final locale = Localizations.localeOf(context);
    final normalizedQuery = _query.trim().toLowerCase();
    final countries = widget.countries
        .where((country) {
          if (normalizedQuery.isEmpty) return true;
          return country.nameEn.toLowerCase().contains(normalizedQuery) ||
              country.nameAr.contains(_query.trim()) ||
              country.callingCode.contains(normalizedQuery) ||
              country.isoAlpha2.toLowerCase().contains(normalizedQuery);
        })
        .toList(growable: false);
    final theme = Theme.of(context);
    return SafeArea(
      child: Padding(
        padding: const EdgeInsetsDirectional.fromSTEB(
          FopxSpacing.pageGutter,
          0,
          FopxSpacing.pageGutter,
          FopxSpacing.lg,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(widget.searchLabel, style: theme.textTheme.titleLarge),
            const SizedBox(height: FopxSpacing.md),
            TextField(
              controller: _search,
              autofocus: false,
              onChanged: (value) => setState(() => _query = value),
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: widget.searchLabel,
                prefixIcon: const Icon(Icons.search_rounded),
              ),
            ),
            const SizedBox(height: FopxSpacing.md),
            SizedBox(
              height: (MediaQuery.sizeOf(context).height * 0.55)
                  .clamp(220.0, 520.0)
                  .toDouble(),
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: countries.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final country = countries[index];
                  final selected =
                      country.isoAlpha2 == widget.selectedCountry.isoAlpha2;
                  return Semantics(
                    button: true,
                    selected: selected,
                    label: '${country.nameFor(locale)}, ${country.callingCode}',
                    child: ListTile(
                      contentPadding: const EdgeInsetsDirectional.symmetric(
                        horizontal: 4,
                      ),
                      leading: Text(
                        country.flag,
                        style: const TextStyle(fontSize: 24),
                      ),
                      title: Text(country.nameFor(locale)),
                      subtitle: Text(
                        country.isoAlpha2,
                        textDirection: TextDirection.ltr,
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Text(
                            country.callingCode,
                            textDirection: TextDirection.ltr,
                          ),
                          if (selected) ...<Widget>[
                            const SizedBox(width: 8),
                            Icon(
                              Icons.check_rounded,
                              color: theme.colorScheme.primary,
                            ),
                          ],
                        ],
                      ),
                      onTap: () => Navigator.of(context).pop(country),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
