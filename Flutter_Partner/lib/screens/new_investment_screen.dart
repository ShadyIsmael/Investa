import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/investments_service.dart';
import 'investment_info_screen.dart';
import '../services/categories_service.dart';
import '../services/business_stages_service.dart';
import '../services/project_phases_service.dart';
import '../services/secure_storage.dart';
import '../services/app_logger.dart';
import '../l10n/app_localizations.dart';

class NewInvestmentScreen extends StatefulWidget {
  const NewInvestmentScreen({super.key});

  @override
  State<NewInvestmentScreen> createState() => _NewInvestmentScreenState();
}

class _NewInvestmentScreenState extends State<NewInvestmentScreen> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

  // Controllers
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _targetController = TextEditingController();
  final _dateController = TextEditingController();

  // Data State
  List<Category> _categories = [];
  List<BusinessStage> _stages = [];
  List<ProjectPhase> _phases = [];
  bool _isLoading = true;
  bool _isSaving = false;

  // Selected Values
  int? _catId;
  int? _stageId;
  int? _phaseId;
  String _risk = 'Medium';
  String _currency = 'USD';

  final List<String> _risks = ['Low', 'Medium', 'High'];
  final List<String> _currencies = ['USD', 'EUR', 'SAR', 'EGP'];

  @override
  void initState() {
    super.initState();
    _loadAllData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    _targetController.dispose();
    _dateController.dispose();
    super.dispose();
  }

  Future<void> _loadAllData() async {
    try {
      final results = await Future.wait([
        CategoriesService().fetchCategories(),
        BusinessStagesService().fetchStages(),
        ProjectPhasesService().fetchPhases(),
      ]);

      if (mounted) {
        setState(() {
          _categories = results[0] as List<Category>;
          _stages = results[1] as List<BusinessStage>;
          _phases = results[2] as List<ProjectPhase>;
          _isLoading = false;
        });
      }
    } catch (e, s) {
      AppLogger.logError('NewInvestmentScreen', 'Init failed: $e', s);
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365 * 5)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(
                  primary: AppPalette.plum,
                ),
          ),
          child: child!,
        );
      },
    );
    if (date != null) {
      _dateController.text = date.toIso8601String().split('T')[0];
    }
  }

  void _nextStep() {
    if (_currentStep == 0) {
      if (_nameController.text.isEmpty ||
          _descController.text.isEmpty ||
          _catId == null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Please complete the basic information first.')));
        return;
      }
      setState(() => _currentStep = 1);
    } else {
      _submit();
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    try {
      final uid = await SecureStorage().read('userId') ?? '0';
      final val =
          double.tryParse(_targetController.text.replaceAll(',', '')) ?? 0.0;

      // Build a CreateInvestment payload compatible with backend CreateInvestmentDto
      final payload = <String, dynamic>{
        'businessName': _nameController.text.trim(),
        'description': _descController.text.trim(),
        'businessCategoryId': _catId ?? 0,
        'businessStageId': _stageId ?? 0,
        'projectPhaseId': _phaseId ?? 0,
        'milestone': _phaseId != null
            ? _phases
                .firstWhere((p) => p.id == _phaseId,
                    orElse: () =>
                        ProjectPhase(id: 0, key: '', value: '', valueAr: ''))
                .value
            : null,
        'riskLevel': _risk,
        'currency': _currency,
        'targetFund': val > 0 ? val : null,
        'startDate': _dateController.text.isEmpty
            ? DateTime.now().toIso8601String().split('T')[0]
            : _dateController.text,
        // Provide minimal required equity fields with safe defaults so backend validation passes
        'initialCapital': val > 0 ? val : 1.0,
        'sharePrice': 1.0,
        'totalShares': 1,
        'investmentTypeId': 2, // default to Equity
      };

      final created = await InvestmentsService().createInvestment(payload);
      if (!mounted) return;
      if (created == null || created['error'] != null) {
        final msg = created != null && created['error'] != null
            ? created['error'].toString()
            : 'Failed to publish opportunity';
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(msg)));
      } else {
        // Navigate to the investment details screen showing the newly created item
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (ctx) => InvestmentInfoScreen(item: created),
          ),
        );
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Opportunity published successfully!')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? AppPalette.midnightDeep : const Color(0xFFFBFBFE),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded,
              color: theme.colorScheme.onSurface, size: 20),
          onPressed: () {
            if (_currentStep == 1) {
              setState(() => _currentStep = 0);
            } else {
              Navigator.pop(context);
            }
          },
        ),
        title: Text(
          'Create Opportunity',
          style: GoogleFonts.outfit(
              fontWeight: FontWeight.bold,
              fontSize: 20,
              color: theme.colorScheme.onSurface),
        ),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                _buildProgressIndicator(),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Form(
                      key: _formKey,
                      child: _currentStep == 0
                          ? _buildStep1(theme)
                          : _buildStep2(theme),
                    ),
                  ),
                ),
                _buildFooter(theme),
              ],
            ),
    );
  }

  Widget _buildProgressIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 48),
      child: Row(
        children: [
          _stepCircle(0, 'Basics'),
          Expanded(
              child: Container(
                  height: 2,
                  color: _currentStep >= 1
                      ? AppPalette.flame
                      : Colors.grey.withAlpha((0.3 * 255).round()))),
          _stepCircle(1, 'Financials'),
        ],
      ),
    );
  }

  Widget _stepCircle(int step, String label) {
    final isActive = _currentStep >= step;
    return Column(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive ? AppPalette.flame : Colors.transparent,
            border: Border.all(
                color:
                    isActive ? AppPalette.flame : Colors.grey.withOpacity(0.5),
                width: 2),
            boxShadow: isActive
                ? [
                    BoxShadow(
                        color: AppPalette.flame.withOpacity(0.3),
                        blurRadius: 8,
                        spreadRadius: 2)
                  ]
                : [],
          ),
          child: Center(
            child: isActive && _currentStep > step
                ? const Icon(Icons.check, color: Colors.white, size: 16)
                : Text('${step + 1}',
                    style: TextStyle(
                        color: isActive ? Colors.white : Colors.grey,
                        fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 8),
        Text(label,
            style: GoogleFonts.dmSans(
                fontSize: 12,
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                color: isActive ? AppPalette.flame : Colors.grey)),
      ],
    );
  }

  Widget _buildStep1(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionHeader('Business Identity'),
        _buildTextField(
          label: 'Brand Name',
          controller: _nameController,
          hint: 'Enter your business name',
          icon: Icons.business_center_rounded,
        ),
        const SizedBox(height: 24),
        _buildTextField(
          label: 'Elevator Pitch',
          controller: _descController,
          hint: 'Briefly describe your project/startup...',
          maxLines: 5,
          icon: Icons.auto_awesome_rounded,
        ),
        const SizedBox(height: 24),
        _buildDropdown<int>(
          label: 'Industry Category',
          value: _catId,
          items: _categories
              .map((c) => DropdownMenuItem(
                  value: c.id,
                  child: Text(context.isArabic && c.valueAr.isNotEmpty
                      ? c.valueAr
                      : c.value)))
              .toList(),
          onChanged: (v) => setState(() => _catId = v),
          hint: 'e.g. FinTech, AgriTech',
        ),
      ],
    );
  }

  Widget _buildStep2(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionHeader('Financial Details'),
        Row(
          children: [
            SizedBox(
              width: 100,
              child: _buildDropdown<String>(
                label: 'Currency',
                value: _currency,
                items: _currencies
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (v) => setState(() => _currency = v!),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildTextField(
                label: 'Target Funding',
                controller: _targetController,
                hint: '500,000',
                keyboardType: TextInputType.number,
                icon: Icons.payments_rounded,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: _buildDropdown<int>(
                label: 'Current Stage',
                value: _stageId,
                items: _stages
                    .map((s) => DropdownMenuItem(
                        value: s.id,
                        child: Text(context.isArabic && s.valueAr.isNotEmpty
                            ? s.valueAr
                            : (s.displayName ?? s.value))))
                    .toList(),
                onChanged: (v) => setState(() => _stageId = v),
                hint: 'Seed / MVP',
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildDropdown<String>(
                label: 'Risk Profile',
                value: _risk,
                items: _risks
                    .map((r) => DropdownMenuItem(
                        value: r,
                        child: Row(children: [
                          _buildRiskDot(r),
                          const SizedBox(width: 8),
                          Text(r)
                        ])))
                    .toList(),
                onChanged: (v) => setState(() => _risk = v!),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        _buildTextField(
          label: 'Launch Date',
          controller: _dateController,
          hint: 'Select target date',
          readOnly: true,
          onTap: _pickDate,
          icon: Icons.calendar_today_rounded,
        ),
        const SizedBox(height: 24),
        _buildDropdown<int>(
          label: 'Milestone / Phase',
          value: _phaseId,
          items: _phases
              .map((p) => DropdownMenuItem(
                  value: p.id,
                  child: Text(context.isArabic && p.valueAr.isNotEmpty
                      ? p.valueAr
                      : (p.displayName ?? p.value))))
              .toList(),
          onChanged: (v) => setState(() => _phaseId = v),
          hint: 'Next big milestone',
        ),
      ],
    );
  }

  Widget _buildFooter(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      child: Row(
        children: [
          if (_currentStep == 1)
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _currentStep = 0),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
                child: Text('Previous',
                    style: GoogleFonts.dmSans(fontWeight: FontWeight.bold)),
              ),
            ),
          if (_currentStep == 1) const SizedBox(width: 16),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _nextStep,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppPalette.success,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: _isSaving
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : Text(
                      _currentStep == 0
                          ? 'Next Details'
                          : 'Publish Opportunity',
                      style: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Text(title,
          style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppPalette.flame)),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    String? hint,
    IconData? icon,
    bool readOnly = false,
    int maxLines = 1,
    TextInputType? keyboardType,
    VoidCallback? onTap,
  }) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: GoogleFonts.dmSans(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: theme.colorScheme.onSurface.withOpacity(0.7))),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          readOnly: readOnly,
          maxLines: maxLines,
          keyboardType: keyboardType,
          onTap: onTap,
          style: GoogleFonts.outfit(fontSize: 15),
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: icon != null
                ? Icon(icon,
                    size: 18,
                    color: AppPalette.flame.withAlpha((0.7 * 255).round()))
                : null,
            filled: true,
            fillColor: theme.colorScheme.surface,
            contentPadding: const EdgeInsets.all(16),
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.withOpacity(0.1))),
            focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                    const BorderSide(color: AppPalette.flame, width: 1.5)),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown<T>({
    required String label,
    required T? value,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
    String? hint,
  }) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: GoogleFonts.dmSans(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: theme.colorScheme.onSurface.withOpacity(0.7))),
        const SizedBox(height: 8),
        DropdownButtonFormField<T>(
          value: value,
          items: items,
          onChanged: onChanged,
          icon: const Icon(Icons.expand_more_rounded),
          style: GoogleFonts.outfit(
              fontSize: 15, color: theme.colorScheme.onSurface),
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: theme.colorScheme.surface,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.withOpacity(0.1))),
          ),
        ),
      ],
    );
  }

  Widget _buildRiskDot(String risk) {
    Color color;
    switch (risk.toLowerCase()) {
      case 'low':
        color = Colors.green;
        break;
      case 'high':
        color = AppPalette.danger;
        break;
      default:
        color = Colors.orange;
    }
    return Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle));
  }
}
