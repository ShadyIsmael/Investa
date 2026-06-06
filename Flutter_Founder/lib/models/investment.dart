import 'investment_image.dart';

/// Investment model for Founder investments with exit strategy support
class Investment {
  final String id;
  final String title;
  final int type; // 1 = Founding, 2 = Equity, 3 = Revenue Sharing, 4 = Loan
  final double targetAmount;
  final double currentAmount;
  final String description;
  final Map<String, dynamic> rawData;
  final int momentumScore;
  final String momentumLabel;
  final DateTime? lastActivityAt;
  final int publicActivityCount;
  final int participantOnlyActivityCount;
  final String visibilityLabel;

  // Equity Crowdfunding Structure
  final double? sharePrice;
  final int? totalShares;
  final int? availableShares;
  final int? soldShares;
  final double? minInvestment;
  final double? maxInvestment;
  final double? valuationCap;

  /// Percentage of equity being offered to investors (Equity type only)
  final double? equityOfferedPercentage;
  final double? expectedROI;

  // Founding-specific fields
  final int? durationMonths;
  final double? profitPercentage;
  final String? payoutFrequency;

  // ==================== Equity Exit Strategy Fields ====================
  final double? currentValuation;
  final double? estimatedFutureValuation;
  final int? equityExitType;
  final DateTime? exitTargetDate;
  final String? expectedExitStrategy;

  // ==================== Revenue Sharing Exit Strategy Fields ====================
  final DateTime? contractStartDate;
  final DateTime? contractEndDate;
  final double? totalExpectedPayout;
  final double? remainingPayoutAmount;
  final String? revenueDistributionFrequency;

  /// Percentage of revenue shared with investors (Revenue Sharing type only)
  final double? revenueSharePercentage;

  /// Expected monthly return amount to investors (Revenue Sharing type only)
  final double? expectedMonthlyReturn;
  final String? contractCompletionStatus;

  // ==================== Loan/Debt Exit Strategy Fields ====================
  final DateTime? repaymentStartDate;
  final DateTime? finalRepaymentDate;
  final double? remainingBalance;
  final double? totalPaidAmount;
  final DateTime? nextInstallmentDate;
  final String? defaultRiskLevel;
  final String? loanCompletionStatus;

  // ==================== Additional Loan/Debt Fields ====================

  /// Annual interest rate for the loan (Loan type only)
  final double? interestRate;

  /// Frequency of loan repayments (Loan type only)
  /// Monthly, Quarterly, Semi-Annually, Annually
  final String? repaymentFrequency;

  /// Grace period before repayments begin in months (Loan type only)
  final int? gracePeriodMonths;

  /// Estimated installment amount per payment (Loan type only)
  final double? estimatedInstallment;

  /// Total repayment amount including principal and interest (Loan type only)
  final double? totalRepaymentAmount;

  // Images
  final List<InvestmentImage>? images;

  Investment({
    required this.id,
    required this.title,
    required this.type,
    required this.targetAmount,
    required this.currentAmount,
    required this.description,
    this.rawData = const {},
    this.momentumScore = 0,
    this.momentumLabel = 'Building Momentum',
    this.lastActivityAt,
    this.publicActivityCount = 0,
    this.participantOnlyActivityCount = 0,
    this.visibilityLabel = 'Public Overview',
    
    // Equity crowdfunding fields
    this.sharePrice,
    this.totalShares,
    this.availableShares,
    this.soldShares,
    this.minInvestment,
    this.maxInvestment,
    this.valuationCap,
    this.equityOfferedPercentage,
    this.expectedROI,
    
    // Founding-specific fields
    this.durationMonths,
    this.profitPercentage,
    this.payoutFrequency,
    
    // Equity exit strategy fields
    this.currentValuation,
    this.estimatedFutureValuation,
    this.equityExitType,
    this.exitTargetDate,
    this.expectedExitStrategy,
    
    // Revenue sharing exit strategy fields
    this.contractStartDate,
    this.contractEndDate,
    this.totalExpectedPayout,
    this.remainingPayoutAmount,
    this.revenueDistributionFrequency,
    this.revenueSharePercentage,
    this.expectedMonthlyReturn,
    this.contractCompletionStatus,
    
    // Loan/Debt exit strategy fields
    this.repaymentStartDate,
    this.finalRepaymentDate,
    this.remainingBalance,
    this.totalPaidAmount,
    this.nextInstallmentDate,
    this.defaultRiskLevel,
    this.loanCompletionStatus,
    this.interestRate,
    this.repaymentFrequency,
    this.gracePeriodMonths,
    this.estimatedInstallment,
    this.totalRepaymentAmount,
    this.images,
  });

  double get progress => currentAmount / targetAmount;
  double get progressPercent => (progress * 100);

  /// Get cover image URL (primary image or first image)
  String? get coverImageUrl {
    if (images == null || images!.isEmpty) return null;
    final primaryImage = images!.firstWhere((img) => img.isPrimary, orElse: () => images!.first);
    return primaryImage.url;
  }

  /// Get investment type display name
  String get typeDisplay {
    switch (type) {
      case 1:
        return 'Founding Investment';
      case 2:
        return 'Equity Investment';
      case 3:
        return 'Revenue Sharing';
      case 4:
        return 'Loan / Debt';
      default:
        return 'Unknown';
    }
  }

  /// Get equity exit type display name
  String? get equityExitTypeDisplay {
    if (equityExitType == null) return null;
    switch (equityExitType) {
      case 1:
        return 'Acquisition';
      case 2:
        return 'Strategic Buyout';
      case 3:
        return 'Secondary Share Sale';
      case 4:
        return 'IPO';
      case 5:
        return 'Founder Buyback';
      case 6:
        return 'Undetermined';
      default:
        return 'Unknown';
    }
  }

  /// Check if this investment has equity exit strategy data
  bool get hasExitStrategy {
    return type == 2 && (
      currentValuation != null ||
      estimatedFutureValuation != null ||
      equityExitType != null ||
      exitTargetDate != null
    );
  }

  /// Check if this investment has revenue sharing data
  bool get hasRevenueSharingData {
    return type == 3 && (
      contractStartDate != null ||
      contractEndDate != null ||
      totalExpectedPayout != null
    );
  }

  /// Check if this investment has loan data
  bool get hasLoanData {
    return type == 4 && (
      repaymentStartDate != null ||
      finalRepaymentDate != null ||
      remainingBalance != null
    );
  }

  /// Create Investment from API response data
  factory Investment.fromJson(Map<String, dynamic> json) {
    return Investment(
      id: json['id']?.toString() ?? '',
      title: json['businessName'] ?? json['name'] ?? json['title'] ?? '',
      type: json['investmentTypeId'] ?? json['investmentType'] ?? 1,
      targetAmount: (json['targetFund'] ?? json['targetAmount'] ?? 0).toDouble(),
      currentAmount: (json['currentFunding'] ?? json['currentAmount'] ?? 0).toDouble(),
      description: json['description'] ?? '',
      rawData: json,
      momentumScore: json['momentumScore'] as int? ?? 0,
      momentumLabel: json['momentumLabel'] as String? ?? 'Building Momentum',
      lastActivityAt: json['lastActivityAt'] != null
          ? DateTime.tryParse(json['lastActivityAt'])
          : null,
      publicActivityCount: json['publicActivityCount'] as int? ?? 0,
      participantOnlyActivityCount:
          json['participantOnlyActivityCount'] as int? ?? 0,
      visibilityLabel: json['visibilityLabel'] as String? ?? 'Public Overview',
      
      // Equity crowdfunding fields
      sharePrice: json['sharePrice']?.toDouble(),
      totalShares: json['totalShares']?.toInt(),
      availableShares: json['availableShares']?.toInt(),
      soldShares: json['soldShares']?.toInt(),
      minInvestment: json['minInvestment']?.toDouble(),
      maxInvestment: json['maxInvestment']?.toDouble(),
      valuationCap: json['valuationCap']?.toDouble(),
      equityOfferedPercentage: json['equityOfferedPercentage']?.toDouble(),
      expectedROI: json['expectedROI']?.toDouble(),
      
      // Founding-specific fields
      durationMonths: json['durationMonths']?.toInt(),
      profitPercentage: json['profitPercentage']?.toDouble(),
      payoutFrequency: json['payoutFrequency'],
      
      // Equity exit strategy fields
      currentValuation: json['currentValuation']?.toDouble(),
      estimatedFutureValuation: json['estimatedFutureValuation']?.toDouble(),
      equityExitType: json['equityExitType']?.toInt(),
      exitTargetDate: json['exitTargetDate'] != null 
          ? DateTime.tryParse(json['exitTargetDate']) 
          : null,
      expectedExitStrategy: json['expectedExitStrategy'],
      
      // Revenue sharing exit strategy fields
      contractStartDate: json['contractStartDate'] != null
          ? DateTime.tryParse(json['contractStartDate'])
          : null,
      contractEndDate: json['contractEndDate'] != null
          ? DateTime.tryParse(json['contractEndDate'])
          : null,
      totalExpectedPayout: json['totalExpectedPayout']?.toDouble(),
      remainingPayoutAmount: json['remainingPayoutAmount']?.toDouble(),
      revenueDistributionFrequency: json['revenueDistributionFrequency'],
      revenueSharePercentage: json['revenueSharePercentage']?.toDouble(),
      expectedMonthlyReturn: json['expectedMonthlyReturn']?.toDouble(),
      contractCompletionStatus: json['contractCompletionStatus'],
      
      // Loan/Debt exit strategy fields
      repaymentStartDate: json['repaymentStartDate'] != null
          ? DateTime.tryParse(json['repaymentStartDate'])
          : null,
      finalRepaymentDate: json['finalRepaymentDate'] != null
          ? DateTime.tryParse(json['finalRepaymentDate'])
          : null,
      remainingBalance: json['remainingBalance']?.toDouble(),
      totalPaidAmount: json['totalPaidAmount']?.toDouble(),
      nextInstallmentDate: json['nextInstallmentDate'] != null
          ? DateTime.tryParse(json['nextInstallmentDate'])
          : null,
      defaultRiskLevel: json['defaultRiskLevel'],
      loanCompletionStatus: json['loanCompletionStatus'],
      interestRate: json['interestRate']?.toDouble(),
      repaymentFrequency: json['repaymentFrequency'],
      gracePeriodMonths: json['gracePeriodMonths']?.toInt(),
      estimatedInstallment: json['estimatedInstallment']?.toDouble(),
      totalRepaymentAmount: json['totalRepaymentAmount']?.toDouble(),
      images: json['images'] != null
          ? (json['images'] as List)
              .map((img) => InvestmentImage.fromJson(img as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  /// Convert to JSON for API requests
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'businessName': title,
      'investmentTypeId': type,
      'targetFund': targetAmount,
      'currentFunding': currentAmount,
      'description': description,
      
      // Equity crowdfunding fields
      if (sharePrice != null) 'sharePrice': sharePrice,
      if (totalShares != null) 'totalShares': totalShares,
      if (availableShares != null) 'availableShares': availableShares,
      if (minInvestment != null) 'minInvestment': minInvestment,
      if (maxInvestment != null) 'maxInvestment': maxInvestment,
      if (valuationCap != null) 'valuationCap': valuationCap,
      if (equityOfferedPercentage != null) 'equityOfferedPercentage': equityOfferedPercentage,
      if (expectedROI != null) 'expectedROI': expectedROI,
      
      // Founding-specific fields
      if (durationMonths != null) 'durationMonths': durationMonths,
      if (profitPercentage != null) 'profitPercentage': profitPercentage,
      if (payoutFrequency != null) 'payoutFrequency': payoutFrequency,
      
      // Equity exit strategy fields
      if (currentValuation != null) 'currentValuation': currentValuation,
      if (estimatedFutureValuation != null) 'estimatedFutureValuation': estimatedFutureValuation,
      if (equityExitType != null) 'equityExitType': equityExitType,
      if (exitTargetDate != null) 'exitTargetDate': exitTargetDate?.toIso8601String(),
      if (expectedExitStrategy != null) 'expectedExitStrategy': expectedExitStrategy,
      
      // Revenue sharing exit strategy fields
      if (contractStartDate != null) 'contractStartDate': contractStartDate?.toIso8601String(),
      if (contractEndDate != null) 'contractEndDate': contractEndDate?.toIso8601String(),
      if (totalExpectedPayout != null) 'totalExpectedPayout': totalExpectedPayout,
      if (remainingPayoutAmount != null) 'remainingPayoutAmount': remainingPayoutAmount,
      if (revenueDistributionFrequency != null) 'revenueDistributionFrequency': revenueDistributionFrequency,
      if (revenueSharePercentage != null) 'revenueSharePercentage': revenueSharePercentage,
      if (expectedMonthlyReturn != null) 'expectedMonthlyReturn': expectedMonthlyReturn,
      if (contractCompletionStatus != null) 'contractCompletionStatus': contractCompletionStatus,
      
      // Loan/Debt exit strategy fields
      if (repaymentStartDate != null) 'repaymentStartDate': repaymentStartDate?.toIso8601String(),
      if (finalRepaymentDate != null) 'finalRepaymentDate': finalRepaymentDate?.toIso8601String(),
      if (remainingBalance != null) 'remainingBalance': remainingBalance,
      if (totalPaidAmount != null) 'totalPaidAmount': totalPaidAmount,
      if (nextInstallmentDate != null) 'nextInstallmentDate': nextInstallmentDate?.toIso8601String(),
      if (defaultRiskLevel != null) 'defaultRiskLevel': defaultRiskLevel,
      if (loanCompletionStatus != null) 'loanCompletionStatus': loanCompletionStatus,
      if (interestRate != null) 'interestRate': interestRate,
      if (repaymentFrequency != null) 'repaymentFrequency': repaymentFrequency,
      if (gracePeriodMonths != null) 'gracePeriodMonths': gracePeriodMonths,
      if (estimatedInstallment != null) 'estimatedInstallment': estimatedInstallment,
      if (totalRepaymentAmount != null) 'totalRepaymentAmount': totalRepaymentAmount,
      
      // Images
      if (images != null) 'images': images?.map((img) => img.toJson()).toList(),
    };
  }
}

/// Investment type enum matching backend
enum InvestmentType {
  founding(1, 'Founding Investment'),
  equity(2, 'Equity Investment'),
  revenueSharing(3, 'Revenue Sharing'),
  loan(4, 'Loan / Debt');

  const InvestmentType(this.value, this.displayName);
  final int value;
  final String displayName;

  static InvestmentType fromValue(int value) {
    return InvestmentType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => InvestmentType.founding,
    );
  }
}

/// Equity exit type enum matching backend
enum EquityExitType {
  acquisition(1, 'Acquisition'),
  strategicBuyout(2, 'Strategic Buyout'),
  secondaryShareSale(3, 'Secondary Share Sale'),
  ipo(4, 'IPO'),
  founderBuyback(5, 'Founder Buyback'),
  undetermined(6, 'Undetermined');

  const EquityExitType(this.value, this.displayName);
  final int value;
  final String displayName;

  static EquityExitType fromValue(int? value) {
    if (value == null) return EquityExitType.undetermined;
    return EquityExitType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => EquityExitType.undetermined,
    );
  }
}
