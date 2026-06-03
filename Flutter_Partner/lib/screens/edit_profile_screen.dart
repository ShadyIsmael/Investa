import 'dart:convert';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:network_info_plus/network_info_plus.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';
import '../widgets/app_background.dart';
import '../services/profile_service.dart';
import '../services/app_logger.dart';
import '../l10n/app_localizations.dart';
import 'profile_screen.dart';

class EditProfileScreen extends StatefulWidget {
  final Profile? profile;
  final ProfileService? service;

  const EditProfileScreen({Key? key, this.profile, this.service})
      : super(key: key);

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _roleController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  late TextEditingController _bioController;
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _genderController;
  String? _selectedGender;
  String? _selectedNationality;
  String? _selectedNationalityCode;
  late TextEditingController _nationalityController;
  late TextEditingController _avatarController;
  late TextEditingController _dobController;
  DateTime? _selectedDob;

  late TextEditingController _phone2Controller;
  // workAddress removed per new contact requirements
  late TextEditingController _countryController;
  late TextEditingController _cityController;
  late TextEditingController _addressController;
  late TextEditingController _linkedInController;
  late TextEditingController _facebookController;

  late TextEditingController _companyController;
  late TextEditingController _companyAddressController;
  late TextEditingController _companyEmailController;

  late TextEditingController _walletController;

  late TextEditingController _docNumberController;
  late TextEditingController _docExpiryController;
  late TextEditingController _verificationController;

  late TextEditingController _lastLoginIpController;
  late TextEditingController _deviceInfoController;

  bool _isSaving = false;
  String? _deviceMacAddress;

  // Phone2 masking
  late FocusNode _phone2FocusNode;
  String _phone2Raw = '';
  Future<void> _popToProfile({bool saved = false}) async {
    final rootNavigator = Navigator.of(context, rootNavigator: true);
    if (rootNavigator.canPop()) {
      rootNavigator.pop(saved ? {'saved': true} : null);
      return;
    }

    final themeMode = Theme.of(context).brightness == Brightness.dark
        ? ThemeMode.dark
        : ThemeMode.light;
    final locale = Localizations.localeOf(context);

    await rootNavigator.pushReplacement(
      MaterialPageRoute(
        builder: (_) => ProfileScreen(
          themeMode: themeMode,
          currentLocale: locale,
        ),
      ),
    );
  }

  Future<void> _handleBackNavigation() async {
    await _popToProfile();
  }

    final loc = AppLocalizations.of(context);
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        withData: true,
        allowedExtensions: const ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
      );
      if (result == null || result.files.isEmpty) return;

      final file = result.files.first;
      final bytes = file.bytes;
      if (bytes != null && bytes.isNotEmpty) {
        setState(() {
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(loc.t('file_selected'))),
        );
      } else {
        setState(() {
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(loc.t('file_selected'))),
        );
      }
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(loc.t('file_select_failed'))),
      );
    }
  }

  Future<void> _resolveDeviceMacAddress() async {
    if (_deviceMacAddress != null && _deviceMacAddress!.isNotEmpty) return;
    try {
      final info = NetworkInfo();
      _deviceMacAddress = await info.getWifiBSSID();
    } catch (_) {
      _deviceMacAddress = null;
    }
  }

  @override
  void initState() {
    super.initState();
    final p = widget.profile;
    _nameController = TextEditingController(
        text: p?.basicInfo?.fullName ??
            '${p?.basicInfo?.firstName ?? ''} ${p?.basicInfo?.lastName ?? ''}'
                .trim());
    _roleController = TextEditingController(text: p?.coreMetrics?.role ?? '');
    _phoneController =
        TextEditingController(text: p?.contactInfo?.phone1 ?? '');
    _emailController = TextEditingController(
        text: p?.contactInfo?.email ?? p?.coreMetrics?.email ?? '');
    _bioController = TextEditingController(text: p?.basicInfo?.bio ?? '');

    _firstNameController =
        TextEditingController(text: p?.basicInfo?.firstName ?? '');
    _lastNameController =
        TextEditingController(text: p?.basicInfo?.lastName ?? '');
    _genderController = TextEditingController(text: p?.basicInfo?.gender ?? '');
    final normalized = (p?.basicInfo?.gender ?? '').toString().trim();
    if (normalized.isNotEmpty) {
      _selectedGender = normalized.toLowerCase().startsWith('m')
          ? 'M'
          : (normalized.toLowerCase().startsWith('f') ? 'F' : normalized);
    } else {
      _selectedGender = null;
    }
    _nationalityController =
        TextEditingController(text: p?.basicInfo?.nationality ?? '');
    // If backend stores an ISO code, keep it for save; display label will be set in build using localization
    _selectedNationalityCode = p?.basicInfo?.nationality != null &&
            p!.basicInfo!.nationality!.isNotEmpty
        ? p.basicInfo!.nationality
        : null;
    _avatarController =
        TextEditingController(text: p?.basicInfo?.avatarUrl ?? '');

    // Date of birth controller / selected value
    _selectedDob = p?.basicInfo?.dateOfBirth;
    _dobController = TextEditingController(
        text: p?.basicInfo?.dateOfBirth != null
            ? p!.basicInfo!.dateOfBirth!.toIso8601String().split('T').first
            : '');

    _phone2Controller = TextEditingController(text: '');
    // Store raw value separately to implement masked display
    _phone2Raw = p?.contactInfo?.phone2 ?? '';
    _phone2Controller.text = _maskPhone(_phone2Raw);

    _phone2FocusNode = FocusNode();
    _phone2FocusNode.addListener(() {
      if (_phone2FocusNode.hasFocus) {
        // reveal raw value for editing
        _phone2Controller.text = _phone2Raw;
      } else {
        _phone2Raw = _phone2Controller.text.trim();
        _phone2Controller.text = _maskPhone(_phone2Raw);
      }
    });

    _countryController =
        TextEditingController(text: p?.contactInfo?.country ?? '');
    _cityController = TextEditingController(text: p?.contactInfo?.city ?? '');
    _addressController =
        TextEditingController(text: p?.contactInfo?.address ?? '');
    _linkedInController =
        TextEditingController(text: p?.contactInfo?.linkedInUrl ?? '');
    _facebookController =
        TextEditingController(text: p?.contactInfo?.facebookUrl ?? '');

    _companyController =
        TextEditingController(text: p?.basicInfo?.companyName ?? '');
    _companyAddressController =
        TextEditingController(text: p?.contactInfo?.companyAddress ?? '');
    _companyEmailController =
        TextEditingController(text: p?.contactInfo?.companyEmail ?? '');

    _walletController = TextEditingController(
        text: p?.credit?.toString() ??
            p?.coreMetrics?.walletBalance?.toString() ??
            '');

    _docNumberController = TextEditingController(
    _docExpiryController = TextEditingController(
        text:
    _verificationController = TextEditingController(
        text: p?.identityCompliance?.verificationStatus ?? '');

    _lastLoginIpController =
        TextEditingController(text: p?.auditUsage?.lastLoginIP ?? '');
    _deviceInfoController =
        TextEditingController(text: p?.auditUsage?.deviceInfo ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _roleController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _bioController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _genderController.dispose();
    _nationalityController.dispose();
    _avatarController.dispose();
    _dobController.dispose();

    _phone2Controller.dispose();
    _countryController.dispose();
    _cityController.dispose();

    _phone2FocusNode.dispose();
    _addressController.dispose();
    _linkedInController.dispose();
    _facebookController.dispose();

    _companyController.dispose();
    _companyAddressController.dispose();
    _companyEmailController.dispose();

    _walletController.dispose();

    _docNumberController.dispose();
    _docExpiryController.dispose();
    _verificationController.dispose();

    _lastLoginIpController.dispose();
    _deviceInfoController.dispose();
    super.dispose();
  }

  // Map a localized nationality label back to an ISO code
  String? _mapNationalityLabelToCode(String label) {
    final loc = AppLocalizations.of(context);
    final mapping = {
      loc.t('country_egypt'): 'EG',
      loc.t('country_saudi_arabia'): 'SA',
      loc.t('country_uae'): 'AE',
      loc.t('country_jordan'): 'JO',
      loc.t('country_lebanon'): 'LB',
      loc.t('country_usa'): 'US',
      loc.t('country_uk'): 'GB',
      loc.t('country_india'): 'IN',
      loc.t('country_canada'): 'CA',
      loc.t('country_australia'): 'AU',
      loc.t('country_other'): 'OT',
    };
    return mapping[label];
  }

  String _genderCodeFromValue(String value) {
    if (value.toLowerCase().startsWith('m')) return 'M';
    if (value.toLowerCase().startsWith('f')) return 'F';
    return value;
  }

  String _maskPhone(String v) {
    if (v.isEmpty) return '';
    final s = v.trim();
    if (s.length <= 5) return s;
    const start = 3;
    const end = 2;
    final maskedLen = s.length - start - end;
    if (maskedLen <= 0) return s;
    final stars = List.filled(maskedLen, '*').join();
    return s.substring(0, start) + stars + s.substring(s.length - end);
  }

  Future<void> _save() async {
    AppLogger.logInfo('EditProfileScreen._save', 'invoked');
    // Validation removed — allow saving regardless of field contents
    setState(() => _isSaving = true);

    // Build payload only with meaningful values to avoid server validation errors
    await _resolveDeviceMacAddress();
    final basic = <String, dynamic>{
      if (_firstNameController.text.trim().isNotEmpty)
        'firstName': _firstNameController.text.trim(),
      if (_lastNameController.text.trim().isNotEmpty)
        'lastName': _lastNameController.text.trim(),
      if (_nameController.text.trim().isNotEmpty)
        'fullName': _nameController.text.trim(),
      if ((_selectedGender ?? _genderController.text).trim().isNotEmpty)
        'gender': _genderCodeFromValue(
            (_selectedGender ?? _genderController.text).trim()),
      // Nationality: prefer selected ISO code, otherwise attempt to map displayed label back to code
      if ((_selectedNationalityCode ?? _nationalityController.text)
          .toString()
          .trim()
          .isNotEmpty)
        'nationality': (_selectedNationalityCode != null &&
                _selectedNationalityCode!.isNotEmpty)
            ? _selectedNationalityCode
            : (_mapNationalityLabelToCode(_nationalityController.text.trim()) ??
                _nationalityController.text.trim()),
      if ((_selectedDob != null || _dobController.text.trim().isNotEmpty))
        'dateOfBirth': (_selectedDob != null)
            ? _selectedDob!.toIso8601String()
            : DateTime.tryParse(_dobController.text.trim())?.toIso8601String(),
      if (_bioController.text.trim().isNotEmpty)
        'bio': _bioController.text.trim(),
      if (_companyController.text.trim().isNotEmpty)
        'companyName': _companyController.text.trim(),
      // Avatar input removed from edit form.
    };

    final contact = <String, dynamic>{
      if (_emailController.text.trim().isNotEmpty)
        'email': _emailController.text.trim(),
      // Country and city added above

      if (_phoneController.text.trim().isNotEmpty)
        'phone1': _phoneController.text.trim(),
      if (_phone2Raw.trim().isNotEmpty)
        'phone2': _phone2Raw.trim(), // ensure we send the raw (unmasked) value
      if (_countryController.text.trim().isNotEmpty)
        'country': _countryController.text.trim(),
      if (_cityController.text.trim().isNotEmpty)
        'city': _cityController.text.trim(),
      if (_addressController.text.trim().isNotEmpty)
        'address': _addressController.text.trim(),
      if (_countryController.text.trim().isNotEmpty)
        'country': _countryController.text.trim(),
      if (_cityController.text.trim().isNotEmpty)
        'city': _cityController.text.trim(),
      if (_linkedInController.text.trim().isNotEmpty)
        'linkedInUrl': _linkedInController.text.trim(),
      if (_facebookController.text.trim().isNotEmpty)
        'facebookUrl': _facebookController.text.trim(),
      if (_companyAddressController.text.trim().isNotEmpty)
        'companyAddress': _companyAddressController.text.trim(),
      if (_companyEmailController.text.trim().isNotEmpty)
        'companyEmail': _companyEmailController.text.trim(),
      if (_countryController.text.trim().isNotEmpty)
        'country': _countryController.text.trim(),
      if (_cityController.text.trim().isNotEmpty)
        'city': _cityController.text.trim(),
    };


    // Handle date: if provided, attempt parse, otherwise omit to avoid binding errors
    final docExpiryText = _docExpiryController.text.trim();
    if (docExpiryText.isNotEmpty) {
      final parsed = DateTime.tryParse(docExpiryText);
      if (parsed == null) {
        final loc = AppLocalizations.of(context);
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(loc.t('invalid_date'))));
        if (mounted) setState(() => _isSaving = false);
        return;
      }
    }

    final payload = <String, dynamic>{
      if (basic.isNotEmpty) 'BasicInfo': basic,
      if (contact.isNotEmpty) 'ContactInfo': contact,
      
    };

    AppLogger.logInfo(
        'EditProfileScreen._save', 'Payload: ${payload.toString()}');

    if (payload.isEmpty) {
      final loc = AppLocalizations.of(context);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(loc.t('no_changes'))));
      if (mounted) setState(() => _isSaving = false);
      return;
    }

    try {
      final service = widget.service ?? ProfileService();
      await service.updateProfile(payload);
      await _popToProfile(saved: true);
      return;
    } catch (e, stackTrace) {
      AppLogger.logError(
          'EditProfileScreen._save', 'Save failed: $e', stackTrace);
      final loc = AppLocalizations.of(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(loc.t('save_failed'))),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final loc = AppLocalizations.of(context);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, _) async {
        if (!didPop) await _handleBackNavigation();
      },
      child: Scaffold(
        extendBodyBehindAppBar: true,
        appBar: AppBar(
          leading: IconButton(
            key: const Key('edit_profile_back_button'),
            icon: Icon(Icons.arrow_back, color: theme.colorScheme.onSurface),
            onPressed: () async => _handleBackNavigation(),
          ),
          title: Text(loc.t('edit_profile')),
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
          actions: [
            TextButton(
              key: const Key('edit_profile_save_button'),
              onPressed: _isSaving ? null : _save,
              style: TextButton.styleFrom(
                foregroundColor: AppPalette.flame,
                textStyle: const TextStyle(fontWeight: FontWeight.bold),
              ),
              child: _isSaving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: AppPalette.flame))
                  : Text(loc.t('save')),
            ),
            const SizedBox(width: 8),
          ],
        ),
        body: AppBackground(
          child: SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 20),
                _buildAvatarSection(theme),
                const SizedBox(height: 20),
                Expanded(
                  child: DefaultTabController(
                    length: 3,
                    child: Column(
                      children: [
                        Container(
                          margin: const EdgeInsets.symmetric(horizontal: 20),
                          padding: const EdgeInsets.all(6),
                          decoration: theme.brightness == Brightness.dark
                              ? AppDecorations.premiumGlass(radius: 30)
                              : BoxDecoration(
                                  color: theme.cardColor,
                                  borderRadius: BorderRadius.circular(30),
                                  boxShadow: AppShadows.soft,
                                ),
                          child: TabBar(
                            indicator: BoxDecoration(
                              borderRadius: BorderRadius.circular(24),
                              gradient: const LinearGradient(
                                colors: [AppPalette.flame, AppPalette.amber],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color:
                                      AppPalette.flame.withOpacityCompat(0.4),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            indicatorSize: TabBarIndicatorSize.tab,
                            dividerColor: Colors.transparent,
                            labelColor: Colors.white,
                            unselectedLabelColor:
                                theme.brightness == Brightness.dark
                                    ? Colors.white60
                                    : theme.colorScheme.onSurface
                                        .withOpacityCompat(0.6),
                            labelStyle: const TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 13),
                            tabs: [
                              Tab(
                                icon: const Icon(Icons.person_rounded),
                                text: loc.t('personal'),
                                iconMargin: const EdgeInsets.only(bottom: 4),
                              ),
                              Tab(
                                icon: const Icon(Icons.contact_phone_rounded),
                                text: loc.t('contact'),
                                iconMargin: const EdgeInsets.only(bottom: 4),
                              ),
                              Tab(
                                icon: const Icon(Icons.verified_user_rounded),
                                text: loc.t('meta'),
                                iconMargin: const EdgeInsets.only(bottom: 4),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        Expanded(
                          child: TabBarView(
                            children: [
                              _buildPersonalTab(),
                              _buildContactTab(),
                              _buildComplianceTab(),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAvatarSection(ThemeData theme) {
    return Center(
      child: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: theme.colorScheme.primary, width: 2),
              boxShadow: [
                BoxShadow(
                  color: AppPalette.flame.withOpacityCompat(0.28),
                  blurRadius: 20,
                  spreadRadius: 2,
                )
              ],
            ),
            child: CircleAvatar(
              radius: 50,
              backgroundColor: Colors.grey[800],
              backgroundImage: _avatarController.text.isNotEmpty
                  ? NetworkImage(_avatarController.text)
                  : null,
              child: _avatarController.text.isEmpty
                  ? Text(
                      _firstNameController.text.isNotEmpty
                          ? _firstNameController.text[0].toUpperCase()
                          : '?',
                      style: theme.textTheme.displaySmall
                          ?.copyWith(color: Colors.white),
                    )
                  : null,
            ),
          ),
          Positioned(
            bottom: 0,
            right: 0,
            child: InkWell(
              onTap: () {
                final loc = AppLocalizations.of(context);
                // Suggest integration with image_picker package
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(loc.t('image_picker_placeholder'))),
                );
              },
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppPalette.flame,
                  shape: BoxShape.circle,
                  border: Border.all(
                      color: theme.scaffoldBackgroundColor, width: 2),
                ),
                child:
                    const Icon(Icons.camera_alt, size: 16, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalTab() {
    final loc = AppLocalizations.of(context);
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  controller: _firstNameController,
                  label: loc.t('first_name'),
                  icon: Icons.person_outline,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildTextField(
                  controller: _lastNameController,
                  label: loc.t('last_name'),
                  icon: Icons.person_outline,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _nameController,
            label: loc.t('display_name'),
            icon: Icons.badge_outlined,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _roleController,
            label: loc.t('role_job_title'),
            icon: Icons.work_outline,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _companyController,
            label: loc.t('company') ?? 'Company',
            icon: Icons.business_outlined,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _bioController,
            label: loc.t('bio'),
            icon: Icons.info_outline,
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value:
                      (_selectedGender != null && _selectedGender!.isNotEmpty)
                          ? _selectedGender
                          : null,
                  items: [
                    DropdownMenuItem(
                        value: 'M', child: Text(loc.t('male') ?? 'Male')),
                    DropdownMenuItem(
                        value: 'F', child: Text(loc.t('female') ?? 'Female')),
                  ],
                  decoration: InputDecoration(
                    labelText: loc.t('gender'),
                    prefixIcon: const Icon(Icons.accessibility_new),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  onChanged: (v) {
                    setState(() {
                      _selectedGender = v;
                      _genderController.text = v == 'M'
                          ? (loc.t('male') ?? 'Male')
                          : (v == 'F' ? (loc.t('female') ?? 'Female') : '');
                    });
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Autocomplete<String>(
                  // Build list of country options with localized labels
                  initialValue: TextEditingValue(
                    text: (() {
                      if (_selectedNationalityCode != null &&
                          _selectedNationalityCode!.isNotEmpty) {
                        final countries = [
                          {
                            'code': 'EG',
                            'label': loc.t('country_egypt') ?? 'Egypt'
                          },
                          {
                            'code': 'SA',
                            'label':
                                loc.t('country_saudi_arabia') ?? 'Saudi Arabia'
                          },
                          {
                            'code': 'AE',
                            'label':
                                loc.t('country_uae') ?? 'United Arab Emirates'
                          },
                          {
                            'code': 'JO',
                            'label': loc.t('country_jordan') ?? 'Jordan'
                          },
                          {
                            'code': 'LB',
                            'label': loc.t('country_lebanon') ?? 'Lebanon'
                          },
                          {
                            'code': 'US',
                            'label': loc.t('country_usa') ?? 'United States'
                          },
                          {
                            'code': 'GB',
                            'label': loc.t('country_uk') ?? 'United Kingdom'
                          },
                          {
                            'code': 'IN',
                            'label': loc.t('country_india') ?? 'India'
                          },
                          {
                            'code': 'CA',
                            'label': loc.t('country_canada') ?? 'Canada'
                          },
                          {
                            'code': 'AU',
                            'label': loc.t('country_australia') ?? 'Australia'
                          },
                          {
                            'code': 'OT',
                            'label': loc.t('country_other') ?? 'Other'
                          },
                        ];
                        final found = countries.firstWhere(
                            (c) => c['code'] == _selectedNationalityCode,
                            orElse: () => {});
                        return (found.isNotEmpty)
                            ? (found['label'] as String)
                            : _nationalityController.text;
                      }
                      return _nationalityController.text;
                    })(),
                  ),
                  optionsBuilder: (TextEditingValue textEditingValue) {
                    final countries = [
                      {
                        'code': 'EG',
                        'label': loc.t('country_egypt') ?? 'Egypt'
                      },
                      {
                        'code': 'SA',
                        'label': loc.t('country_saudi_arabia') ?? 'Saudi Arabia'
                      },
                      {
                        'code': 'AE',
                        'label': loc.t('country_uae') ?? 'United Arab Emirates'
                      },
                      {
                        'code': 'JO',
                        'label': loc.t('country_jordan') ?? 'Jordan'
                      },
                      {
                        'code': 'LB',
                        'label': loc.t('country_lebanon') ?? 'Lebanon'
                      },
                      {
                        'code': 'US',
                        'label': loc.t('country_usa') ?? 'United States'
                      },
                      {
                        'code': 'GB',
                        'label': loc.t('country_uk') ?? 'United Kingdom'
                      },
                      {
                        'code': 'IN',
                        'label': loc.t('country_india') ?? 'India'
                      },
                      {
                        'code': 'CA',
                        'label': loc.t('country_canada') ?? 'Canada'
                      },
                      {
                        'code': 'AU',
                        'label': loc.t('country_australia') ?? 'Australia'
                      },
                      {
                        'code': 'OT',
                        'label': loc.t('country_other') ?? 'Other'
                      },
                    ];
                    final all =
                        countries.map((c) => c['label'] as String).toList();
                    if (textEditingValue.text.isEmpty) return all;
                    return all.where((c) => c
                        .toLowerCase()
                        .contains(textEditingValue.text.toLowerCase()));
                  },
                  onSelected: (selection) {
                    setState(() {
                      // Map selected label back to code
                      final mapping = {
                        loc.t('country_egypt') ?? 'Egypt': 'EG',
                        loc.t('country_saudi_arabia') ?? 'Saudi Arabia': 'SA',
                        loc.t('country_uae') ?? 'United Arab Emirates': 'AE',
                        loc.t('country_jordan') ?? 'Jordan': 'JO',
                        loc.t('country_lebanon') ?? 'Lebanon': 'LB',
                        loc.t('country_usa') ?? 'United States': 'US',
                        loc.t('country_uk') ?? 'United Kingdom': 'GB',
                        loc.t('country_india') ?? 'India': 'IN',
                        loc.t('country_canada') ?? 'Canada': 'CA',
                        loc.t('country_australia') ?? 'Australia': 'AU',
                        loc.t('country_other') ?? 'Other': 'OT',
                      };
                      _selectedNationality = selection;
                      _nationalityController.text = selection;
                      _selectedNationalityCode = mapping[selection];
                    });
                  },
                  fieldViewBuilder:
                      (context, controller, focusNode, onFieldSubmitted) {
                    controller.addListener(() {
                      _nationalityController.text = controller.text;
                    });
                    return TextFormField(
                      key: const Key('edit_profile_nationality_field'),
                      controller: controller,
                      focusNode: focusNode,
                      decoration: InputDecoration(
                        labelText: loc.t('nationality'),
                        hintText: loc.t('nationality_select_hint'),
                        prefixIcon: const Icon(Icons.flag_outlined),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8)),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Date of Birth field
          _buildDateOfBirthField(loc),
          // Avatar input removed from edit form.
        ],
      ),
    );
  }

  Widget _buildDateOfBirthField(AppLocalizations loc) {
    return _buildDateField(
      controller: _dobController,
      label: loc.t('date_of_birth'),
      icon: Icons.cake_outlined,
      onPick: () async {
        final initial = _selectedDob ??
            DateTime.now().subtract(const Duration(days: 365 * 25));
        final first = DateTime(1900);
        final last = DateTime.now();
        final picked = await showDatePicker(
          context: context,
          initialDate: initial,
          firstDate: first,
          lastDate: last,
        );
        if (picked != null) {
          setState(() {
            _selectedDob = picked;
            _dobController.text = picked.toIso8601String().split('T').first;
          });
        }
      },
    );
  }

  Widget _buildDateField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required Future<void> Function() onPick,
  }) {
    return GestureDetector(
      onTap: onPick,
      child: AbsorbPointer(
        child: _buildTextField(
          controller: controller,
          label: label,
          icon: icon,
        ),
      ),
    );
  }

  Widget _buildContactTab() {
    final loc = AppLocalizations.of(context);
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  controller: _emailController,
                  label: loc.t('email_address'),
                  icon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                ),
              ),
              const SizedBox(width: 8),
              TextButton(
                key: const Key('edit_profile_verify_email_button'),
                onPressed: () async {
                  final service = widget.service ?? ProfileService();
                  final success = await service.startEmailVerification();
                  final msg = success
                      ? loc.t('verification_sent')
                      : loc.t('verification_failed');
                  ScaffoldMessenger.of(context)
                      .showSnackBar(SnackBar(content: Text(msg)));
                },
                child: Text(loc.t('verify')),
              )
            ],
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _phoneController,
            label: loc.t('primary_phone'),
            icon: Icons.phone_outlined,
            keyboardType: TextInputType.phone,
            readOnly: true, // primary mobile is not editable from this screen
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _phone2Controller,
            focusNode: _phone2FocusNode,
            label: loc.t('secondary_phone'),
            icon: Icons.phone_android_outlined,
            keyboardType: TextInputType.phone,
            // Shows masked value when unfocused, reveals on focus
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _addressController,
            label: loc.t('home_address'),
            icon: Icons.home_outlined,
            maxLines: 2,
          ),
          const SizedBox(height: 16),
          // Country and City fields
          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  controller: _countryController,
                  label: loc.t('country'),
                  icon: Icons.flag_outlined,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildTextField(
                  controller: _cityController,
                  label: loc.t('city'),
                  icon: Icons.location_city_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _companyEmailController,
            label: loc.t('company_email'),
            icon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _companyAddressController,
            label: loc.t('company_address'),
            icon: Icons.location_on_outlined,
            maxLines: 2,
          ),
          const SizedBox(height: 24),
          Text(
            loc.t('social_profiles'),
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white70,
                ),
          ),
          const SizedBox(height: 12),
          _buildTextField(
            controller: _linkedInController,
            label: loc.t('linkedin_url'),
            icon: Icons.link,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _facebookController,
            label: loc.t('facebook_url'),
            icon: Icons.facebook,
          ),
        ],
      ),
    );
  }

  Widget _buildComplianceTab() {
    final loc = AppLocalizations.of(context);
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Column(
        children: [
          _buildSectionHeader(loc.t('verification')),
          _buildTextField(
            controller: _verificationController,
            label: loc.t('status'),
            icon: Icons.verified_user_outlined,
            readOnly: true,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _docNumberController,
            label: loc.t('document_number'),
            icon: Icons.description_outlined,
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () async {
              final DateTime? picked = await showDatePicker(
                context: context,
                initialDate: DateTime.now(),
                firstDate: DateTime(2000),
                lastDate: DateTime(2100),
              );
              if (picked != null) {
                setState(() {
                  _docExpiryController.text =
                      picked.toIso8601String().split('T')[0];
                });
              }
            },
            child: AbsorbPointer(
              child: _buildTextField(
                controller: _docExpiryController,
                label: loc.t('expiry_date'),
                icon: Icons.calendar_today,
                readOnly: true,
              ),
            ),
          ),
          const SizedBox(height: 24),
          _buildSectionHeader(loc.t('hr_letter')),
          InkWell(
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white24),
                color: Colors.white.withOpacity(0.03),
              ),
              child: Row(
                children: [
                  const Icon(Icons.upload_file_outlined, color: Colors.white70),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      style: const TextStyle(color: Colors.white70),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: Colors.white54),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          _buildSectionHeader(loc.t('system_data')),
          _buildTextField(
            controller: _lastLoginIpController,
            label: loc.t('last_login_ip'),
            icon: Icons.computer,
            readOnly: true,
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: SizedBox(
        width: double.infinity,
        child: Text(
          title,
          style: const TextStyle(
            color: Colors.white70,
            fontWeight: FontWeight.bold,
            fontSize: 14,
            letterSpacing: 1.1,
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    int maxLines = 1,
    bool readOnly = false,
    TextInputType? keyboardType,
    FocusNode? focusNode,
  }) {
    final theme = Theme.of(context);

    return TextFormField(
      controller: controller,
      readOnly: readOnly,
      maxLines: maxLines,
      focusNode: focusNode,
      keyboardType: keyboardType,
      style: theme.textTheme.bodyMedium
          ?.copyWith(color: theme.colorScheme.onSurface),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(
            color: theme.colorScheme.onSurface.withOpacityCompat(0.6)),
        prefixIcon: Icon(icon,
            color: theme.colorScheme.onSurface.withOpacityCompat(0.7),
            size: 20),
        filled: true,
        fillColor: theme.colorScheme.surface.withOpacityCompat(0.06),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(
              color: theme.colorScheme.onSurface.withOpacityCompat(0.08)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppPalette.flame),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.red.withOpacityCompat(0.5)),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      ),
      validator: (value) {
        // Validation removed intentionally — always accept input
        return null;
      },
    );
  }
}
