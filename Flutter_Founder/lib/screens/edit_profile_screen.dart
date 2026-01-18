import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';
import '../widgets/app_background.dart';
import '../services/profile_service.dart';
import '../l10n/app_localizations.dart';

class EditProfileScreen extends StatefulWidget {
  final Profile? profile;

  const EditProfileScreen({Key? key, this.profile}) : super(key: key);

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
  late TextEditingController _nationalityController;
  late TextEditingController _avatarController;

  late TextEditingController _phone2Controller;
  late TextEditingController _workAddressController;
  late TextEditingController _addressController;
  late TextEditingController _linkedInController;
  late TextEditingController _facebookController;

  late TextEditingController _credibilityController;
  late TextEditingController _walletController;
  late TextEditingController _clientTypeController;

  late TextEditingController _docNumberController;
  late TextEditingController _docExpiryController;
  late TextEditingController _verificationController;

  late TextEditingController _lastLoginIpController;
  late TextEditingController _deviceInfoController;

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
    _nationalityController =
        TextEditingController(text: p?.basicInfo?.nationality ?? '');
    _avatarController =
        TextEditingController(text: p?.basicInfo?.avatarUrl ?? '');

    _phone2Controller =
        TextEditingController(text: p?.contactInfo?.phone2 ?? '');
    _workAddressController =
        TextEditingController(text: p?.contactInfo?.workAddress ?? '');
    _addressController =
        TextEditingController(text: p?.contactInfo?.address ?? '');
    _linkedInController =
        TextEditingController(text: p?.contactInfo?.linkedInUrl ?? '');
    _facebookController =
        TextEditingController(text: p?.contactInfo?.facebookUrl ?? '');

    _credibilityController = TextEditingController(
        text: p?.coreMetrics?.credibilityScore?.toString() ?? '');
    _walletController = TextEditingController(
        text: p?.coreMetrics?.walletBalance?.toString() ?? '');
    _clientTypeController =
        TextEditingController(text: p?.coreMetrics?.clientType ?? '');

    _docNumberController = TextEditingController(
        text: p?.identityCompliance?.documentNumber ?? '');
    _docExpiryController = TextEditingController(
        text:
            p?.identityCompliance?.documentExpiryDate?.toIso8601String() ?? '');
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

    _phone2Controller.dispose();
    _workAddressController.dispose();
    _addressController.dispose();
    _linkedInController.dispose();
    _facebookController.dispose();

    _credibilityController.dispose();
    _walletController.dispose();
    _clientTypeController.dispose();

    _docNumberController.dispose();
    _docExpiryController.dispose();
    _verificationController.dispose();

    _lastLoginIpController.dispose();
    _deviceInfoController.dispose();
    super.dispose();
  }

  void _save() {
    if (_formKey.currentState?.validate() == true) {
      Navigator.of(context).pop({
        'name': _nameController.text.trim(),
        'firstName': _firstNameController.text.trim(),
        'lastName': _lastNameController.text.trim(),
        'role': _roleController.text.trim(),
        'phone1': _phoneController.text.trim(),
        'phone2': _phone2Controller.text.trim(),
        'email': _emailController.text.trim(),
        'workAddress': _workAddressController.text.trim(),
        'address': _addressController.text.trim(),
        'linkedIn': _linkedInController.text.trim(),
        'facebook': _facebookController.text.trim(),
        'bio': _bioController.text.trim(),
        'clientType': _clientTypeController.text.trim(),
        'credibilityScore': _credibilityController.text.trim(),
        'walletBalance': _walletController.text.trim(),
        'documentNumber': _docNumberController.text.trim(),
        'documentExpiryDate': _docExpiryController.text.trim(),
        'verificationStatus': _verificationController.text.trim(),
        'lastLoginIP': _lastLoginIpController.text.trim(),
        'deviceInfo': _deviceInfoController.text.trim(),
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final loc = AppLocalizations.of(context);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(loc.t('edit_profile')),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: _save,
            style: TextButton.styleFrom(
              foregroundColor: AppPalette.flame,
              textStyle: const TextStyle(fontWeight: FontWeight.bold),
            ),
            child: Text(loc.t('save')),
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
                                color: AppPalette.flame.withOpacityCompat(0.4),
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
            controller: _bioController,
            label: loc.t('bio'),
            icon: Icons.info_outline,
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  controller: _genderController,
                  label: loc.t('gender'),
                  icon: Icons.accessibility_new,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildTextField(
                  controller: _nationalityController,
                  label: loc.t('nationality'),
                  icon: Icons.flag_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _avatarController,
            label: loc.t('avatar_url'),
            icon: Icons.link,
          ),
        ],
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
          _buildTextField(
            controller: _emailController,
            label: loc.t('email_address'),
            icon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _phoneController,
            label: loc.t('primary_phone'),
            icon: Icons.phone_outlined,
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _phone2Controller,
            label: loc.t('secondary_phone'),
            icon: Icons.phone_android_outlined,
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _addressController,
            label: loc.t('home_address'),
            icon: Icons.home_outlined,
            maxLines: 2,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _workAddressController,
            label: loc.t('work_address'),
            icon: Icons.business_outlined,
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
          _buildSectionHeader(loc.t('system_data')),
          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  controller: _credibilityController,
                  label: loc.t('credibility'),
                  icon: Icons.score_outlined,
                  readOnly: true,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildTextField(
                  controller: _clientTypeController,
                  label: loc.t('client_type'),
                  icon: Icons.category_outlined,
                  readOnly: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
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
  }) {
    final theme = Theme.of(context);

    return TextFormField(
      controller: controller,
      readOnly: readOnly,
      maxLines: maxLines,
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
        if (label.contains('Name') && (value == null || value.isEmpty)) {
          final loc = AppLocalizations.of(context);
          return loc.t('required');
        }
        return null;
      },
    );
  }
}
