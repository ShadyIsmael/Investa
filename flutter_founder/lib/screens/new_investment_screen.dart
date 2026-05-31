import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../theme/app_theme.dart';
import 'new_investment_images_screen.dart';
import '../services/investments_service.dart';
import 'investment_info_screen.dart';
import '../services/categories_service.dart';
import '../services/business_stages_service.dart';
import '../services/project_phases_service.dart';
import '../services/app_logger.dart';

class NewInvestmentScreen extends StatefulWidget {
  const NewInvestmentScreen({super.key});

  @override
  State<NewInvestmentScreen> createState() => _NewInvestmentScreenState();
}

class _NewInvestmentScreenState extends State<NewInvestmentScreen> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

  // Controllers - Common
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _targetController = TextEditingController();
  final _dateController = TextEditingController();
  final _endDateController = TextEditingController();
  final _initialCapitalController = TextEditingController();
  final _minInvestmentController = TextEditingController();
  final _maxInvestmentController = TextEditingController();
  final _videoUrlController = TextEditingController();

  // Controllers - Equity specific
  final _sharePriceController = TextEditingController();
  final _totalSharesController = TextEditingController();
  final _valuationCapController = TextEditingController();

  // Controllers - Founding specific
  final _durationMonthsController = TextEditingController();
  final _profitPercentageController = TextEditingController();
  final _payoutFrequencyController = TextEditingController();
  final _expectedRoiController = TextEditingController();

  // Data State
  List<Category> _categories = [];
  List<BusinessStage> _stages = [];
  List<ProjectPhase> _phases = [];
  bool _isLoading = true;
  bool _isSaving = false;

  List<XFile> _selectedImages = []; // client-side selected images (max 5)

  // Selected Values
  int? _catId;
  int? _stageId;
  int? _phaseId;
  String _risk = 'Medium';
  String _currency = 'USD';
  int _investmentTypeId = 2; // 1 = Founding, 2 = Equity

  final List<String> _currencies = ['USD', 'EUR', 'SAR', 'EGP'];
  final List<Map<String, dynamic>> _investmentTypes = const [
    {'id': 1, 'label': 'Founding'},
    {'id': 2, 'label': 'Equity'},
  ];

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
    _endDateController.dispose();
    _initialCapitalController.dispose();
    _sharePriceController.dispose();
    _totalSharesController.dispose();
    _minInvestmentController.dispose();
    _maxInvestmentController.dispose();
    _valuationCapController.dispose();
    _expectedRoiController.dispose();
    _durationMonthsController.dispose();
    _profitPercentageController.dispose();
    _payoutFrequencyController.dispose();
    _videoUrlController.dispose();
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
          // If a stage is already selected, compute the risk level
          if (_stageId != null) {
            final stageFound = _stages.where((s) => s.id == _stageId).isNotEmpty
                ? _stages.firstWhere((s) => s.id == _stageId)
                : null;
            _risk = _computeRiskFromStage(stageFound);
          }
          _isLoading = false;
        });
      }
    } catch (e, s) {
      AppLogger.logError('NewInvestmentScreen', 'Init failed: $e', s);
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickDate(TextEditingController controller) async {
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
      controller.text = date.toIso8601String().split('T')[0];
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
    } else if (_currentStep == 1) {
      // Basic validation based on investment type
      final initialCapital =
          double.tryParse(_initialCapitalController.text.replaceAll(',', '')) ??
              0.0;

      if (initialCapital <= 0) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Please enter valid Initial Capital.')));
        return;
      }

      // Type-specific validation
      if (_investmentTypeId == 1) {
        // Founding validation
        final duration =
            int.tryParse(_durationMonthsController.text.replaceAll(',', '')) ??
                0;
        final profit = double.tryParse(
                _profitPercentageController.text.replaceAll(',', '')) ??
            0.0;
        if (duration <= 0 || profit <= 0) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Please enter valid Duration and Profit Share.')));
          return;
        }
      } else {
        // Equity validation
        final sharePrice =
            double.tryParse(_sharePriceController.text.replaceAll(',', '')) ??
                0.0;
        final totalShares =
            int.tryParse(_totalSharesController.text.replaceAll(',', '')) ?? 0;
        if (sharePrice <= 0 || totalShares <= 0) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content:
                  Text('Please enter valid Share Price and Total Shares.')));
          return;
        }
      }

      setState(() => _currentStep = 2);
    } else {
      _submit();
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    try {
      final initialCapital =
          double.tryParse(_initialCapitalController.text.replaceAll(',', '')) ??
              0.0;

      // Type-specific values
      double sharePrice = 0.0;
      int totalShares = 0;

      if (_investmentTypeId == 2) {
        // Equity
        sharePrice =
            double.tryParse(_sharePriceController.text.replaceAll(',', '')) ??
                0.0;
        totalShares =
            int.tryParse(_totalSharesController.text.replaceAll(',', '')) ?? 0;

        if (initialCapital <= 0 || sharePrice <= 0 || totalShares <= 0) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text(
                  'Please enter valid Initial Capital, Share Price, and Total Shares.')));
          return;
        }
      } else {
        // Founding - use defaults or calculated values
        sharePrice = 1.0;
        totalShares = initialCapital.toInt();
      }

      final targetFundInput =
          double.tryParse(_targetController.text.replaceAll(',', ''));
      final computedTargetFund = sharePrice * totalShares;
      final targetFund = targetFundInput != null && targetFundInput > 0
          ? targetFundInput
          : computedTargetFund;

      final minInvestment =
          double.tryParse(_minInvestmentController.text.replaceAll(',', ''));
      final maxInvestment =
          double.tryParse(_maxInvestmentController.text.replaceAll(',', ''));
      final valuationCap =
          double.tryParse(_valuationCapController.text.replaceAll(',', ''));
      final expectedRoi =
          double.tryParse(_expectedRoiController.text.replaceAll(',', ''));

      final req = CreateInvestmentRequest(
        initialCapital: initialCapital,
        sharePrice: sharePrice,
        totalShares: totalShares,
        targetFund: targetFund,
        minInvestment:
            minInvestment != null && minInvestment > 0 ? minInvestment : null,
        maxInvestment:
            maxInvestment != null && maxInvestment > 0 ? maxInvestment : null,
        valuationCap:
            valuationCap != null && valuationCap > 0 ? valuationCap : null,
        expectedROI:
            expectedRoi != null && expectedRoi > 0 ? expectedRoi : null,
        businessName: _nameController.text.trim(),
        description: _descController.text.trim(),
        businessCategoryId: _catId ?? 0,
        businessStageId: _stageId ?? 0,
        projectPhaseId: _phaseId,
        milestone: _phaseId != null
            ? _phases
                .firstWhere((p) => p.id == _phaseId,
                    orElse: () =>
                        ProjectPhase(id: 0, key: '', value: '', valueAr: ''))
                .value
            : null,
        riskLevel: _risk,
        currency: _currency,
        investmentTypeId: _investmentTypeId,
        startDate: _dateController.text.isEmpty
            ? DateTime.now().toIso8601String().split('T')[0]
            : _dateController.text,
        endDate:
            _endDateController.text.isEmpty ? null : _endDateController.text,
        // imageUrl handled via post-create uploads from _selectedImages
        imageUrl: null,
        videoUrl: _videoUrlController.text.trim().isEmpty
            ? null
            : _videoUrlController.text.trim(),
      );

      final created = await InvestmentsService().createInvestment(req);
      if (!mounted) return;
      if (created == null || created['error'] != null) {
        final msg = created != null && created['error'] != null
            ? created['error'].toString()
            : 'Failed to publish opportunity';
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(msg)));
      } else {
        // If the user selected images, upload them after creation (sequentially)
        try {
          final createdId = (created['id'] is int)
              ? (created['id'] as int)
              : int.tryParse(created['id']?.toString() ?? '0') ?? 0;
          if (createdId > 0 && _selectedImages.isNotEmpty) {
            int success = 0;
            for (final x in _selectedImages) {
              try {
                final file = File(x.path);
                final res =
                    await InvestmentsService().uploadImage(createdId, file);
                if (res != null) success++;
              } catch (e) {
                AppLogger.logError(
                    'NewInvestmentScreen', 'Upload failed: $e', null);
              }
            }
            if (!mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text(
                    'Uploaded $success of ${_selectedImages.length} images')));
          }
        } catch (e) {
          AppLogger.logError(
              'NewInvestmentScreen', 'Post-upload error: $e', null);
        }

        // Navigate directly to the investment details screen showing the newly created item
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
                          : _currentStep == 1
                              ? _buildStep2(theme)
                              : _buildStep3(theme),
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
                    : Colors.grey.withAlpha((0.3 * 255).round())),
          ),
          _stepCircle(1, 'Financials'),
          Expanded(
            child: Container(
                height: 2,
                color: _currentStep >= 2
                    ? AppPalette.flame
                    : Colors.grey.withAlpha((0.3 * 255).round())),
          ),
          _stepCircle(2, 'Images'),
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
                color: isActive
                    ? AppPalette.flame
                    : Colors.grey.withAlpha((0.5 * 255).round()),
                width: 2),
            boxShadow: isActive
                ? [
                    BoxShadow(
                        color: AppPalette.flame.withAlpha((0.3 * 255).round()),
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
          context,
          label: 'Brand Name',
          controller: _nameController,
          hint: 'Enter your business name',
          icon: Icons.business_center_rounded,
        ),
        const SizedBox(height: 24),
        _buildTextField(
          context,
          label: 'Elevator Pitch',
          controller: _descController,
          hint: 'Briefly describe your project/startup...',
          maxLines: 5,
          icon: Icons.auto_awesome_rounded,
        ),
        const SizedBox(height: 24),
        _buildDropdown<int>(
          context,
          label: 'Industry Category',
          value: _catId,
          items: _categories
              .map((c) => DropdownMenuItem(value: c.id, child: Text(c.value)))
              .toList(),
          onChanged: (v) => setState(() => _catId = v),
          hint: 'e.g. FinTech, AgriTech',
        ),
        const SizedBox(height: 24),
        _buildDropdown<int>(
          context,
          label: 'Investment Type',
          value: _investmentTypeId,
          items: _investmentTypes
              .map((t) => DropdownMenuItem(
                  value: t['id'] as int, child: Text(t['label'] as String)))
              .toList(),
          onChanged: (v) => setState(() => _investmentTypeId = v ?? 2),
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.only(left: 4),
          child: Text(
            _investmentTypeId == 1
                ? 'Fixed duration investment with profit returns'
                : 'Share-based investment with equity growth',
            style: GoogleFonts.dmSans(
                fontSize: 12,
                color: theme.colorScheme.onSurface.withOpacity(0.6),
                fontStyle: FontStyle.italic),
          ),
        ),
      ],
    );
  }

  Widget _buildStep2(ThemeData theme) {
    final isFoundingType = _investmentTypeId == 1;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionHeader(
            isFoundingType ? 'Founding Details' : 'Equity Structure'),
        Row(
          children: [
            SizedBox(
              width: 100,
              child: _buildDropdown<String>(
                context,
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
                context,
                label: 'Target Funding',
                controller: _targetController,
                hint: isFoundingType ? '500,000' : '500,000 (auto if empty)',
                keyboardType: TextInputType.number,
                icon: Icons.payments_rounded,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        _buildTextField(
          context,
          label: 'Initial Capital',
          controller: _initialCapitalController,
          hint: '50,000',
          keyboardType: TextInputType.number,
          icon: Icons.savings_rounded,
        ),
        const SizedBox(height: 24),

        // Founding-specific fields
        if (isFoundingType) ...[
          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  context,
                  label: 'Duration (Months)',
                  controller: _durationMonthsController,
                  hint: '12',
                  keyboardType: TextInputType.number,
                  icon: Icons.calendar_month_rounded,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildTextField(
                  context,
                  label: 'Profit Share (%)',
                  controller: _profitPercentageController,
                  hint: '15',
                  keyboardType: TextInputType.number,
                  icon: Icons.trending_up_rounded,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: _buildDropdown<String>(
                  context,
                  label: 'Payout Frequency',
                  value: _payoutFrequencyController.text.isEmpty
                      ? 'Monthly'
                      : _payoutFrequencyController.text,
                  items: ['Monthly', 'Quarterly', 'Annually', 'At Maturity']
                      .map((f) => DropdownMenuItem(value: f, child: Text(f)))
                      .toList(),
                  onChanged: (v) => setState(
                      () => _payoutFrequencyController.text = v ?? 'Monthly'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildTextField(
                  context,
                  label: 'Expected ROI (%)',
                  controller: _expectedRoiController,
                  hint: '18',
                  keyboardType: TextInputType.number,
                  icon: Icons.percent_rounded,
                ),
              ),
            ],
          ),
        ]
        // Equity-specific fields
        else ...[
          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  context,
                  label: 'Share Price',
                  controller: _sharePriceController,
                  hint: '100',
                  keyboardType: TextInputType.number,
                  icon: Icons.price_change_rounded,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildTextField(
                  context,
                  label: 'Total Shares',
                  controller: _totalSharesController,
                  hint: '10000',
                  keyboardType: TextInputType.number,
                  icon: Icons.confirmation_number_rounded,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildTextField(
            context,
            label: 'Valuation Cap',
            controller: _valuationCapController,
            hint: '1,000,000',
            keyboardType: TextInputType.number,
            icon: Icons.account_balance_rounded,
          ),
        ],

        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                context,
                label: 'Min Investment',
                controller: _minInvestmentController,
                hint: '1,000',
                keyboardType: TextInputType.number,
                icon: Icons.arrow_downward_rounded,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildTextField(
                context,
                label: 'Max Investment',
                controller: _maxInvestmentController,
                hint: '100,000',
                keyboardType: TextInputType.number,
                icon: Icons.arrow_upward_rounded,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: _buildDropdown<int>(
                context,
                label: 'Current Stage',
                value: _stageId,
                items: _stages
                    .map((s) => DropdownMenuItem(
                        value: s.id, child: Text(s.displayName ?? s.value)))
                    .toList(),
                onChanged: (v) => setState(() {
                  _stageId = v;
                  final stageFound =
                      (v != null && _stages.where((s) => s.id == v).isNotEmpty)
                          ? _stages.firstWhere((s) => s.id == v)
                          : null;
                  _risk = _computeRiskFromStage(stageFound);
                }),
                hint: 'Seed / MVP',
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Risk Level',
                      style: GoogleFonts.dmSans(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          color: theme.colorScheme.onSurface.withOpacity(0.7))),
                  const SizedBox(height: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: _risk.toLowerCase() == 'low'
                          ? Colors.green.withOpacity(0.12)
                          : _risk.toLowerCase() == 'high'
                              ? AppPalette.danger.withOpacity(0.12)
                              : Colors.orange.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildRiskDot(_risk),
                        const SizedBox(width: 8),
                        Text(_risk,
                            style: GoogleFonts.outfit(
                                fontWeight: FontWeight.w700,
                                color: theme.colorScheme.onSurface)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        _buildTextField(
          context,
          label: 'Launch Date',
          controller: _dateController,
          hint: 'Select target date',
          readOnly: true,
          onTap: () => _pickDate(_dateController),
          icon: Icons.calendar_today_rounded,
        ),
        const SizedBox(height: 24),
        _buildTextField(
          context,
          label: 'End Date (Optional)',
          controller: _endDateController,
          hint: 'Select end date',
          readOnly: true,
          onTap: () => _pickDate(_endDateController),
          icon: Icons.event_busy_rounded,
        ),
        const SizedBox(height: 24),
        _buildDropdown<int>(
          context,
          label: 'Milestone / Phase',
          value: _phaseId,
          items: _phases
              .map((p) => DropdownMenuItem(
                  value: p.id, child: Text(p.displayName ?? p.value)))
              .toList(),
          onChanged: (v) => setState(() => _phaseId = v),
          hint: 'Next big milestone',
        ),
        const SizedBox(height: 24),
        const SizedBox(height: 24),
        _buildTextField(
          context,
          label: 'Video URL (Optional)',
          controller: _videoUrlController,
          hint: 'https://...',
          keyboardType: TextInputType.url,
          icon: Icons.video_library_rounded,
        ),
      ],
    );
  }

  Widget _buildStep3(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionHeader('Images'),
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Expanded(
                child: Text('Images (Optional)',
                    style: GoogleFonts.dmSans(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                        color: theme.colorScheme.onSurface.withOpacity(0.7))),
              ),
              TextButton(
                onPressed: () async {
                  final result = await Navigator.push<List<XFile>?>(
                      context,
                      MaterialPageRoute(
                          builder: (ctx) => NewInvestmentImagesScreen(
                              initial: _selectedImages)));
                  if (result != null) {
                    setState(() => _selectedImages = List<XFile>.from(result));
                  }
                },
                child: const Text('Manage Images'),
              )
            ],
          ),
        ),
        if (_selectedImages.isNotEmpty)
          SizedBox(
            height: 96,
            child: ListView.separated(
              padding: const EdgeInsets.only(bottom: 12),
              scrollDirection: Axis.horizontal,
              itemBuilder: (_, i) => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: Stack(
                  alignment: Alignment.topRight,
                  children: [
                    Image.file(File(_selectedImages[i].path),
                        width: 84, height: 84, fit: BoxFit.cover),
                    GestureDetector(
                      onTap: () => setState(() => _selectedImages.removeAt(i)),
                      child: Container(
                        decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.6),
                            shape: BoxShape.circle),
                        padding: const EdgeInsets.all(4),
                        child: const Icon(Icons.close,
                            size: 14, color: Colors.white),
                      ),
                    )
                  ],
                ),
              ),
              separatorBuilder: (_, __) => const SizedBox(width: 6),
              itemCount: _selectedImages.length,
            ),
          ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildFooter(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(
                    () => _currentStep = (_currentStep - 1).clamp(0, 2)),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
                child: Text('Previous',
                    style: GoogleFonts.dmSans(fontWeight: FontWeight.bold)),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: 16),
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
                          : _currentStep == 1
                              ? 'Next Images'
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

  Widget _buildTextField(
    BuildContext context, {
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

  Widget _buildDropdown<T>(
    BuildContext context, {
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

  /// Compute risk level from selected business stage (mirrors client portal logic)
  String _computeRiskFromStage(BusinessStage? stage) {
    if (stage == null) return 'Medium';
    final hint = (stage.key.isNotEmpty ? stage.key : stage.value).toLowerCase();

    // Idea / MVP -> High
    if (hint.contains('idea') || hint.contains('mvp')) return 'High';

    // Startup / early -> Medium
    if (hint.contains('startup') || hint.contains('early')) return 'Medium';

    // Running / growth / scale / operational -> Low
    if (hint.contains('running') ||
        hint.contains('operational') ||
        hint.contains('growth') ||
        hint.contains('scale')) {
      return 'Low';
    }

    // Default
    return 'Medium';
  }
}
