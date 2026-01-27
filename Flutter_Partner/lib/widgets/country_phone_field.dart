import 'package:flutter/material.dart';

class CountryPhoneField extends StatefulWidget {
  final TextEditingController controller;
  final String initialCountryCode;
  final ValueChanged<String>? onCountryCodeChanged;
  final FocusNode? focusNode;
  final bool readOnly;
  final String labelText;
  final FormFieldValidator<String>? validator;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onFieldSubmitted;

  const CountryPhoneField({
    Key? key,
    required this.controller,
    this.initialCountryCode = '+1',
    this.onCountryCodeChanged,
    this.focusNode,
    this.readOnly = false,
    this.labelText = 'Phone number',
    this.validator,
    this.textInputAction,
    this.onFieldSubmitted,
  }) : super(key: key);

  @override
  State<CountryPhoneField> createState() => _CountryPhoneFieldState();
}

class _CountryPhoneFieldState extends State<CountryPhoneField> {
  static const List<Map<String, String>> _countries = [
    {'code': '+20', 'label': 'Egypt', 'flag': '🇪🇬'},
    {'code': '+1', 'label': 'United States', 'flag': '🇺🇸'},
    {'code': '+44', 'label': 'United Kingdom', 'flag': '🇬🇧'},
    {'code': '+91', 'label': 'India', 'flag': '🇮🇳'},
    {'code': '+61', 'label': 'Australia', 'flag': '🇦🇺'},
    {'code': '+234', 'label': 'Nigeria', 'flag': '🇳🇬'},
  ];

  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex =
        _countries.indexWhere((c) => c['code'] == widget.initialCountryCode);
    if (_selectedIndex < 0) _selectedIndex = 0;
  }

  void _openPicker() async {
    final idx = await showModalBottomSheet<int>(
      context: context,
      builder: (ctx) {
        return SafeArea(
          child: ListView.separated(
            shrinkWrap: true,
            itemCount: _countries.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, i) {
              final c = _countries[i];
              return ListTile(
                leading: Text(c['flag'] ?? ''),
                title: Text('${c['label']} (${c['code']})'),
                onTap: () => Navigator.of(ctx).pop(i),
              );
            },
          ),
        );
      },
    );

    if (idx != null && idx >= 0 && idx < _countries.length) {
      setState(() => _selectedIndex = idx);
      widget.onCountryCodeChanged?.call(_countries[_selectedIndex]['code']!);
    }
  }

  @override
  Widget build(BuildContext context) {
    final country = _countries[_selectedIndex];

    return TextFormField(
      controller: widget.controller,
      focusNode: widget.focusNode,
      textInputAction: widget.textInputAction,
      keyboardType: TextInputType.phone,
      readOnly: widget.readOnly,
      decoration: InputDecoration(
        labelText: widget.labelText,
        // Use `prefix` so the country chip is fixed at the left and does not
        // scroll with the input text. It's inside the field but has its own
        // padding and background for clarity.
        prefix: GestureDetector(
          onTap: _openPicker,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              color: Theme.of(context).brightness == Brightness.dark
                  ? Colors.white.withAlpha((0.04 * 255).round())
                  : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(country['flag'] ?? '',
                    style: const TextStyle(fontSize: 18)),
                const SizedBox(width: 6),
                Text(country['code'] ?? '',
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(width: 6),
                const Icon(Icons.arrow_drop_down, size: 18),
              ],
            ),
          ),
        ),
        // Ensure input has enough left padding so text does not collide
        contentPadding:
            const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      ),
      validator: widget.validator,
      onFieldSubmitted: widget.onFieldSubmitted,
    );
  }
}
