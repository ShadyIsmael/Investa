import 'package:flutter/material.dart';

class FopxLocalizations {
  const FopxLocalizations(this.locale);

  final Locale locale;

  String get appName => _value('appName');
  String get founder => _value('founder');
  String get login => _value('login');
  String get email => _value('email');
  String get password => _value('password');
  String get signIn => _value('signIn');
  String get signOut => _value('signOut');
  String get invalidCredentials => _value('invalidCredentials');
  String get sessionExpired => _value('sessionExpired');
  String get home => _value('home');
  String get projects => _value('projects');
  String get deals => _value('deals');
  String get chat => _value('chat');
  String get notifications => _value('notifications');
  String get profile => _value('profile');
  String get overview => _value('overview');
  String get homeSubtitle => _value('homeSubtitle');
  String get sectionShell => _value('sectionShell');
  String get projectsSubtitle => _value('projectsSubtitle');
  String get dealsSubtitle => _value('dealsSubtitle');
  String get dealsLoadFailed => _value('dealsLoadFailed');
  String get dealsLoadFailedBody => _value('dealsLoadFailedBody');
  String get dealsEmptyTitle => _value('dealsEmptyTitle');
  String get dealsEmptyBody => _value('dealsEmptyBody');
  String get contractNumber => _value('contractNumber');
  String get contractDetails => _value('contractDetails');
  String get contractCurrentVersion => _value('contractCurrentVersion');
  String get contractVersionHistory => _value('contractVersionHistory');
  String get contractVersion => _value('contractVersion');
  String get contractVersionType => _value('contractVersionType');
  String get contractVersionCreated => _value('contractVersionCreated');
  String get contractVersionActivated => _value('contractVersionActivated');
  String get contractPreviewAvailable => _value('contractPreviewAvailable');
  String get contractPreviewOpen => _value('contractPreviewOpen');
  String get contractPreviewTitle => _value('contractPreviewTitle');
  String get contractPreviewUnsupported => _value('contractPreviewUnsupported');
  String get contractPreviewUnavailable => _value('contractPreviewUnavailable');
  String get contractDownload => _value('contractDownload');
  String get contractDownloaded => _value('contractDownloaded');
  String get contractDownloadFailed => _value('contractDownloadFailed');
  String get contractEmail => _value('contractEmail');
  String get contractEmailConfirm => _value('contractEmailConfirm');
  String get contractEmailSent => _value('contractEmailSent');
  String get contractEmailFailed => _value('contractEmailFailed');
  String get contractDocumentHash => _value('contractDocumentHash');
  String get contractDetailLoadFailed => _value('contractDetailLoadFailed');
  String get contractDetailLoadFailedBody =>
      _value('contractDetailLoadFailedBody');
  String get contractReadOnly => _value('contractReadOnly');
  String get investmentModel => _value('investmentModel');
  String get status => _value('status');
  String get investorRequests => _value('investorRequests');
  String get requestsLoadFailed => _value('requestsLoadFailed');
  String get noInvestorRequests => _value('noInvestorRequests');
  String get noInvestorRequestsBody => _value('noInvestorRequestsBody');
  String get requestType => _value('requestType');
  String get requestApprovedStatus => _value('requestApprovedStatus');
  String get requestRejectedStatus => _value('requestRejectedStatus');
  String get requestCancelledStatus => _value('requestCancelledStatus');
  String get approve => _value('approve');
  String get reject => _value('reject');
  String get cancel => _value('cancel');
  String get approveJoinRequest => _value('approveJoinRequest');
  String get approveJoinRequestConfirm => _value('approveJoinRequestConfirm');
  String get rejectJoinRequest => _value('rejectJoinRequest');
  String get rejectionReasonHint => _value('rejectionReasonHint');
  String get joinRequestApproved => _value('joinRequestApproved');
  String get joinRequestRejected => _value('joinRequestRejected');
  String get joinRequestReviewFailed => _value('joinRequestReviewFailed');
  String get createOpportunity => _value('createOpportunity');
  String get editOpportunity => _value('editOpportunity');
  String get opportunityEditingUnavailable =>
      _value('opportunityEditingUnavailable');
  String get opportunityEditingLockedBody =>
      _value('opportunityEditingLockedBody');
  String get opportunityUpdated => _value('opportunityUpdated');
  String get opportunitySaveFailed => _value('opportunitySaveFailed');
  String get publishOpportunity => _value('publishOpportunity');
  String paidActionConfirmation(String cost, String balance) => _value(
    'paidActionConfirmation',
  ).replaceAll('{cost}', cost).replaceAll('{balance}', balance);
  String get opportunityPublished => _value('opportunityPublished');
  String get submitOpportunityForReview => _value('submitOpportunityForReview');
  String get opportunitySubmittedForReview =>
      _value('opportunitySubmittedForReview');
  String get opportunitySubmitFailed => _value('opportunitySubmitFailed');
  String get opportunityArchiveConfirmTitle =>
      _value('opportunityArchiveConfirmTitle');
  String get opportunityArchiveConfirmBody =>
      _value('opportunityArchiveConfirmBody');
  String get opportunityArchiveAction => _value('opportunityArchiveAction');
  String get opportunityArchived => _value('opportunityArchived');
  String get opportunityArchiveFailed => _value('opportunityArchiveFailed');
  String get opportunityPublishFailed => _value('opportunityPublishFailed');
  String get opportunityCoverImage => _value('opportunityCoverImage');
  String get changeCoverImage => _value('changeCoverImage');
  String get opportunityCoverImageUpdated =>
      _value('opportunityCoverImageUpdated');
  String get opportunityCoverImageFailed =>
      _value('opportunityCoverImageFailed');
  String get opportunityCoverImageTooLarge =>
      _value('opportunityCoverImageTooLarge');
  String get insufficientPublishCredit => _value('insufficientPublishCredit');
  String get opportunityFundingCurrencyImmutable =>
      _value('opportunityFundingCurrencyImmutable');
  String get opportunityTitle => _value('opportunityTitle');
  String get opportunityShortDescription =>
      _value('opportunityShortDescription');
  String get opportunityUseOfFunds => _value('opportunityUseOfFunds');
  String get opportunityFundingTarget => _value('opportunityFundingTarget');
  String get opportunityFundingCurrency => _value('opportunityFundingCurrency');
  String get opportunityFundingGoal => _value('opportunityFundingGoal');
  String get opportunityProjectStage => _value('opportunityProjectStage');
  String get opportunityCustomStage => _value('opportunityCustomStage');
  String get opportunityDescription => _value('opportunityDescription');
  String get opportunityDraftCreated => _value('opportunityDraftCreated');
  String get opportunityCreateFailed => _value('opportunityCreateFailed');
  String get noAvailableOpportunityStages =>
      _value('noAvailableOpportunityStages');
  String get save => _value('save');
  String get saving => _value('saving');
  String get negotiationOffers => _value('negotiationOffers');
  String get noDirectOffers => _value('noDirectOffers');
  String get offerFrom => _value('offerFrom');
  String get offerVersion => _value('offerVersion');
  String get offerReplacesVersion => _value('offerReplacesVersion');
  String get totalOfferAmount => _value('totalOfferAmount');
  String get acceptOffer => _value('acceptOffer');
  String get rejectOffer => _value('rejectOffer');
  String get acceptOfferConfirm => _value('acceptOfferConfirm');
  String get rejectOfferConfirm => _value('rejectOfferConfirm');
  String get offerActionFailed => _value('offerActionFailed');
  String get offerAccepted => _value('offerAccepted');
  String get offerRejected => _value('offerRejected');
  String get makeOffer => _value('makeOffer');
  String get counterOffer => _value('counterOffer');
  String get withdrawOffer => _value('withdrawOffer');
  String get withdrawOfferConfirm => _value('withdrawOfferConfirm');
  String get offerWithdrawn => _value('offerWithdrawn');
  String get offerCurrency => _value('offerCurrency');
  String get offerType => _value('offerType');
  String get equityOffer => _value('equityOffer');
  String get loanOffer => _value('loanOffer');
  String get profitSharingOffer => _value('profitSharingOffer');
  String get offerAmount => _value('offerAmount');
  String get equityOwnership => _value('equityOwnership');
  String get percentageBased => _value('percentageBased');
  String get shareBased => _value('shareBased');
  String get equityPercent => _value('equityPercent');
  String get equityTitle => _value('equityTitle');
  String get equityLoadFailed => _value('equityLoadFailed');
  String get equityNoPosition => _value('equityNoPosition');
  String get equityCapitalization => _value('equityCapitalization');
  String get equityCapTableEmpty => _value('equityCapTableEmpty');
  String get equityPrepareEvent => _value('equityPrepareEvent');
  String get equityEventApprovalNote => _value('equityEventApprovalNote');
  String get equityCorporateEvents => _value('equityCorporateEvents');
  String get equityEventsEmpty => _value('equityEventsEmpty');
  String get equityDividends => _value('equityDividends');
  String get equityDividendsEmpty => _value('equityDividendsEmpty');
  String get equityTransfers => _value('equityTransfers');
  String get equityTransfersEmpty => _value('equityTransfersEmpty');
  String get equityPosition => _value('equityPosition');
  String get equityContractualOwnership => _value('equityContractualOwnership');
  String get equityCurrentOwnership => _value('equityCurrentOwnership');
  String get equityDilution => _value('equityDilution');
  String get equityInvestorShares => _value('equityInvestorShares');
  String get equityTotalShares => _value('equityTotalShares');
  String get equityShareClass => _value('equityShareClass');
  String get equityPricePerShare => _value('equityPricePerShare');
  String get equityLedger => _value('equityLedger');
  String get equityOwnershipAsOf => _value('equityOwnershipAsOf');
  String get equityDividendStatus => _value('equityDividendStatus');
  String get equityTotalDividend => _value('equityTotalDividend');
  String get equityEntitlement => _value('equityEntitlement');
  String get equityEventType => _value('equityEventType');
  String get equitySplitNumerator => _value('equitySplitNumerator');
  String get equitySplitDenominator => _value('equitySplitDenominator');
  String get equitySharesIssued => _value('equitySharesIssued');
  String get equityEventReason => _value('equityEventReason');
  String get equityEffectiveDate => _value('equityEffectiveDate');
  String get equitySubmitForApproval => _value('equitySubmitForApproval');
  String get equityActionFailed => _value('equityActionFailed');
  String get equityClosure => _value('equityClosure');
  String get equityClosureUnavailable => _value('equityClosureUnavailable');
  String get equityFullyExitedAt => _value('equityFullyExitedAt');
  String get equityClosedAt => _value('equityClosedAt');
  String get equityConfirmedDistributions =>
      _value('equityConfirmedDistributions');
  String get investorShareCount => _value('investorShareCount');
  String get totalIssuedShares => _value('totalIssuedShares');
  String get shareClass => _value('shareClass');
  String get pricePerShare => _value('pricePerShare');
  String get preMoneyValuation => _value('preMoneyValuation');
  String get postMoneyValuation => _value('postMoneyValuation');
  String get effectiveOwnershipDate => _value('effectiveOwnershipDate');
  String get sharesTerms => _value('sharesTerms');
  String get returnRate => _value('returnRate');
  String get termMonths => _value('termMonths');
  String get repaymentModel => _value('repaymentModel');
  String get profitSharePercentage => _value('profitSharePercentage');
  String get payoutFrequency => _value('payoutFrequency');
  String get exitTerms => _value('exitTerms');
  String get offerNote => _value('offerNote');
  String get sendOffer => _value('sendOffer');
  String get offerSent => _value('offerSent');
  String get offerReplaced => _value('offerReplaced');
  String get offerSubmitFailed => _value('offerSubmitFailed');
  String get offerQuoteFailed => _value('offerQuoteFailed');
  String get insufficientOfferCredit => _value('insufficientOfferCredit');
  String offerCostConfirmation(String cost, String balance) => _value(
    'offerCostConfirmation',
  ).replaceAll('{cost}', cost).replaceAll('{balance}', balance);
  String get invalidAmount => _value('invalidAmount');
  String get invalidDate => _value('invalidDate');
  String get none => _value('none');
  String validationMaxLength(int maximum) =>
      _value('validationMaxLength').replaceAll('{maximum}', '$maximum');
  String get investor => _value('investor');
  String get chatSubtitle => _value('chatSubtitle');
  String get chatEmptyTitle => _value('chatEmptyTitle');
  String get chatEmptyBody => _value('chatEmptyBody');
  String get chatLoadFailed => _value('chatLoadFailed');
  String get chatLoadFailedBody => _value('chatLoadFailedBody');
  String get incomingConversationRequests =>
      _value('incomingConversationRequests');
  String get conversations => _value('conversations');
  String get conversationRequests => _value('conversationRequests');
  String get withdrawConversationRequest =>
      _value('withdrawConversationRequest');
  String get withdrawConversationRequestConfirm =>
      _value('withdrawConversationRequestConfirm');
  String get conversationRequestsLoadFailed =>
      _value('conversationRequestsLoadFailed');
  String get rejectConversationRequest => _value('rejectConversationRequest');
  String get acceptConversationRequest => _value('acceptConversationRequest');
  String get rejectConversationRequestConfirm =>
      _value('rejectConversationRequestConfirm');
  String get conversationRequestAccepted =>
      _value('conversationRequestAccepted');
  String get conversationRequestRejected =>
      _value('conversationRequestRejected');
  String get conversationRequestWithdrawn =>
      _value('conversationRequestWithdrawn');
  String get conversationRequestActionFailed =>
      _value('conversationRequestActionFailed');
  String get readyToProceed => _value('readyToProceed');
  String get closeConversation => _value('closeConversation');
  String get closeConversationConfirm => _value('closeConversationConfirm');
  String get closeReasonOptional => _value('closeReasonOptional');
  String get conversationClosed => _value('conversationClosed');
  String get conversationNotVisible => _value('conversationNotVisible');
  String get conversationActionFailed => _value('conversationActionFailed');
  String get dealDetails => _value('dealDetails');
  String get fundingLoadFailed => _value('fundingLoadFailed');
  String get fundingPosition => _value('fundingPosition');
  String get fundingCommitted => _value('fundingCommitted');
  String get fundingDeclared => _value('fundingDeclared');
  String get fundingAwaitingConfirmation =>
      _value('fundingAwaitingConfirmation');
  String get fundingDisputed => _value('fundingDisputed');
  String get fundingConfirmed => _value('fundingConfirmed');
  String get fundingOutstanding => _value('fundingOutstanding');
  String get fundsTransferredOutsideFopx =>
      _value('fundsTransferredOutsideFopx');
  String get declareFundingReceived => _value('declareFundingReceived');
  String get fundingDeclarations => _value('fundingDeclarations');
  String get noFundingDeclarations => _value('noFundingDeclarations');
  String get noFundingDeclarationsBody => _value('noFundingDeclarationsBody');
  String get fundingReceivedDate => _value('fundingReceivedDate');
  String get fundingPaymentMethod => _value('fundingPaymentMethod');
  String get fundingExternalReference => _value('fundingExternalReference');
  String get fundingAmount => _value('fundingAmount');
  String get fundingEvidence => _value('fundingEvidence');
  String get fundingEvidenceAvailable => _value('fundingEvidenceAvailable');
  String get fundingConfirmationNote => _value('fundingConfirmationNote');
  String get fundingDisputeReason => _value('fundingDisputeReason');
  String get fundingDeclarationFailed => _value('fundingDeclarationFailed');
  String get profitSharingTitle => _value('profitSharingTitle');
  String get profitSharingNoObligations => _value('profitSharingNoObligations');
  String get profitSharingRate => _value('profitSharingRate');
  String get profitSharingReporting => _value('profitSharingReporting');
  String get profitSharingBasis => _value('profitSharingBasis');
  String get profitSharingStatus => _value('profitSharingStatus');
  String get profitSharingEntitlement => _value('profitSharingEntitlement');
  String get profitSharingConfirmed => _value('profitSharingConfirmed');
  String get profitSharingPending => _value('profitSharingPending');
  String get profitSharingOutstanding => _value('profitSharingOutstanding');
  String get profitSharingPeriod => _value('profitSharingPeriod');
  String get profitSharingDeclareResult => _value('profitSharingDeclareResult');
  String get profitSharingDeclaredBasis => _value('profitSharingDeclaredBasis');
  String get profitSharingDeclaredResult =>
      _value('profitSharingDeclaredResult');
  String get profitSharingDistribution => _value('profitSharingDistribution');
  String get profitSharingDeclareDistribution =>
      _value('profitSharingDeclareDistribution');
  String get profitSharingDeclarationFailed =>
      _value('profitSharingDeclarationFailed');
  String get profitSharingResultHistory => _value('profitSharingResultHistory');
  String get profitSharingPeriodRange => _value('profitSharingPeriodRange');
  String get profitSharingDownloadEvidence =>
      _value('profitSharingDownloadEvidence');
  String get profitSharingInvestorDecision =>
      _value('profitSharingInvestorDecision');
  String get profitSharingCalculationError =>
      _value('profitSharingCalculationError');
  String get profitSharingSettledAt => _value('profitSharingSettledAt');
  String get profitSharingClosedAt => _value('profitSharingClosedAt');
  String get profitSharingNotes => _value('profitSharingNotes');
  String get acceptedTermsLoadFailed => _value('acceptedTermsLoadFailed');
  String get allocateAcrossOfferLegs => _value('allocateAcrossOfferLegs');
  String get fundingLegAllocation => _value('fundingLegAllocation');
  String get fundingLegUndeclaredCapacity =>
      _value('fundingLegUndeclaredCapacity');
  String get fundingAllocationExceedsCapacity =>
      _value('fundingAllocationExceedsCapacity');
  String get fundingAllocationMustReconcile =>
      _value('fundingAllocationMustReconcile');
  String get loanLifecycle => _value('loanLifecycle');
  String get principalOutstanding => _value('principalOutstanding');
  String get interestOutstanding => _value('interestOutstanding');
  String get loanOutstanding => _value('loanOutstanding');
  String get confirmedRepaid => _value('confirmedRepaid');
  String get pendingRepaymentConfirmation =>
      _value('pendingRepaymentConfirmation');
  String get repaymentDisputed => _value('repaymentDisputed');
  String get overdueAmount => _value('overdueAmount');
  String get nextPayment => _value('nextPayment');
  String get maturityDate => _value('maturityDate');
  String get defaultReason => _value('defaultReason');
  String get closureReason => _value('closureReason');
  String get persistedLoanSchedule => _value('persistedLoanSchedule');
  String get persistedLoanScheduleUnavailable =>
      _value('persistedLoanScheduleUnavailable');
  String get installment => _value('installment');
  String get installments => _value('installments');
  String get loanRepaymentHistory => _value('loanRepaymentHistory');
  String get declareLoanRepayment => _value('declareLoanRepayment');
  String get loanFundsTransferredOutsideFopx =>
      _value('loanFundsTransferredOutsideFopx');
  String get repaymentAmount => _value('repaymentAmount');
  String get externalPaymentDate => _value('externalPaymentDate');
  String get loanRepaymentMaximum => _value('loanRepaymentMaximum');
  String get loanRepaymentDeclarationFailed =>
      _value('loanRepaymentDeclarationFailed');
  String get notes => _value('notes');
  String get submit => _value('submit');
  String get founderReady => _value('founderReady');
  String get investorReady => _value('investorReady');
  String get projectRoomUnlocked => _value('projectRoomUnlocked');
  String get canContinueNegotiation => _value('canContinueNegotiation');
  String get yes => _value('yes');
  String get no => _value('no');
  String get chatNoMessages => _value('chatNoMessages');
  String get chatNoMessagesBody => _value('chatNoMessagesBody');
  String get chatMessageHint => _value('chatMessageHint');
  String get chatSend => _value('chatSend');
  String get chatSendFailed => _value('chatSendFailed');
  String get chatMessageRemoved => _value('chatMessageRemoved');
  String get notificationsSubtitle => _value('notificationsSubtitle');
  String get notificationsLoadFailed => _value('notificationsLoadFailed');
  String get notificationsLoadFailedBody =>
      _value('notificationsLoadFailedBody');
  String get notificationsEmptyBody => _value('notificationsEmptyBody');
  String get markAllRead => _value('markAllRead');
  String get notificationUpdateFailed => _value('notificationUpdateFailed');
  String get deleteNotification => _value('deleteNotification');
  String get loadMore => _value('loadMore');
  String get loadingMore => _value('loadingMore');
  String get profileSubtitle => _value('profileSubtitle');
  String get editProfile => _value('editProfile');
  String get firstName => _value('firstName');
  String get lastName => _value('lastName');
  String get mobile => _value('mobile');
  String get profileUpdated => _value('profileUpdated');
  String get profileUpdateFailed => _value('profileUpdateFailed');
  String get appearance => _value('appearance');
  String get themeSystem => _value('themeSystem');
  String get themeLight => _value('themeLight');
  String get themeDark => _value('themeDark');
  String get trustRequirements => _value('trustRequirements');
  String get verificationHistory => _value('verificationHistory');
  String get requirementMet => _value('requirementMet');
  String get requirementOpen => _value('requirementOpen');
  String get profileLoadFailed => _value('profileLoadFailed');
  String get profileLoadFailedBody => _value('profileLoadFailedBody');
  String get profileCompletion => _value('profileCompletion');
  String get credibilityScore => _value('credibilityScore');
  String get profileScore => _value('profileScore');
  String get accountSecurity => _value('accountSecurity');
  String get changePassword => _value('changePassword');
  String get changePasswordSubtitle => _value('changePasswordSubtitle');
  String get verifyPhoneToChangePassword => _value('verifyPhoneToChangePassword');
  String get currentPassword => _value('currentPassword');
  String get sendVerificationCode => _value('sendVerificationCode');
  String get passwordCodeSent => _value('passwordCodeSent');
  String get verificationCode => _value('verificationCode');
  String get newPassword => _value('newPassword');
  String get confirmNewPassword => _value('confirmNewPassword');
  String get passwordsDoNotMatch => _value('passwordsDoNotMatch');
  String get passwordChangeComplete => _value('passwordChangeComplete');
  String get passwordChangeFailed => _value('passwordChangeFailed');
  String get trustAndReputation => _value('trustAndReputation');
  String get trustLevel => _value('trustLevel');
  String get reputationScore => _value('reputationScore');
  String get activityScore => _value('activityScore');
  String get phoneVerified => _value('phoneVerified');
  String get emailVerified => _value('emailVerified');
  String get verified => _value('verified');
  String get pending => _value('pending');
  String get emptyTitle => _value('emptyTitle');
  String get emptyBody => _value('emptyBody');
  String get noNotifications => _value('noNotifications');
  String get noProfileData => _value('noProfileData');
  String get language => _value('language');
  String get english => _value('english');
  String get arabic => _value('arabic');
  String get unreadNotifications => _value('unreadNotifications');
  String get notificationsUnavailable => _value('notificationsUnavailable');
  String get secureAccess => _value('secureAccess');
  String get loginSubtitle => _value('loginSubtitle');
  String get emailHint => _value('emailHint');
  String get phoneNumber => _value('phoneNumber');
  String get phoneNumberHint => _value('phoneNumberHint');
  String get countrySelector => _value('countrySelector');
  String get searchCountries => _value('searchCountries');
  String get invalidPhoneNumber => _value('invalidPhoneNumber');
  String get unsupportedCountry => _value('unsupportedCountry');
  String get ambiguousCountry => _value('ambiguousCountry');
  String get passwordHint => _value('passwordHint');
  String get requiredField => _value('requiredField');
  String get continueLabel => _value('continueLabel');
  String get retry => _value('retry');
  String get founderIdentity => _value('founderIdentity');
  String get phaseZero => _value('phaseZero');
  String get projectsContext => _value('projectsContext');
  String get portfolioSummary => _value('portfolioSummary');
  String get totalProjects => _value('totalProjects');
  String get activeProjects => _value('activeProjects');
  String get activeOpportunities => _value('activeOpportunities');
  String get homePortfolio => _value('homePortfolio');
  String get homeCapitalPosition => _value('homeCapitalPosition');
  String get homeNeedsAttention => _value('homeNeedsAttention');
  String homePendingActions(int count) =>
      _value('homePendingActions').replaceAll('{count}', '$count');
  String get homeYourProjects => _value('homeYourProjects');
  String get homeNoProjects => _value('homeNoProjects');
  String get homeNoProjectsBody => _value('homeNoProjectsBody');
  String get homeCommitted => _value('homeCommitted');
  String get homeDeclared => _value('homeDeclared');
  String get homeAwaitingConfirmation => _value('homeAwaitingConfirmation');
  String get homeDisputed => _value('homeDisputed');
  String get homeConfirmed => _value('homeConfirmed');
  String get homeOutstanding => _value('homeOutstanding');
  String get homeErrorTitle => _value('homeErrorTitle');
  String get homeErrorBody => _value('homeErrorBody');
  String get homeForbiddenTitle => _value('homeForbiddenTitle');
  String get homeForbiddenBody => _value('homeForbiddenBody');
  String get approximateValue => _value('approximateValue');
  String get projectCreate => _value('projectCreate');
  String get projectEdit => _value('projectEdit');
  String get projectSaveChanges => _value('projectSaveChanges');
  String get projectIdentitySection => _value('projectIdentitySection');
  String get projectNarrativeSection => _value('projectNarrativeSection');
  String get projectRiskSection => _value('projectRiskSection');
  String get projectName => _value('projectName');
  String get projectLegalName => _value('projectLegalName');
  String get projectLogoUrl => _value('projectLogoUrl');
  String get projectLogoChooseAction => _value('projectLogoChooseAction');
  String get projectLogoTooLarge => _value('projectLogoTooLarge');
  String get projectLogoPickFailed => _value('projectLogoPickFailed');
  String get projectLogoPartialFailure => _value('projectLogoPartialFailure');
  String get projectStatusActions => _value('projectStatusActions');
  String get projectArchiveConfirmTitle => _value('projectArchiveConfirmTitle');
  String get projectArchiveConfirmBody => _value('projectArchiveConfirmBody');
  String get projectArchiveReason => _value('projectArchiveReason');
  String get projectArchiveAction => _value('projectArchiveAction');
  String get projectArchiveCancel => _value('projectArchiveCancel');
  String get projectStatusUpdateFailed => _value('projectStatusUpdateFailed');
  String get projectSummary => _value('projectSummary');
  String get projectDescription => _value('projectDescription');
  String get projectBusinessModel => _value('projectBusinessModel');
  String get projectTeamDescription => _value('projectTeamDescription');
  String get projectRiskLevel => _value('projectRiskLevel');
  String get projectRiskDisclosure => _value('projectRiskDisclosure');
  String get projectFoundedDate => _value('projectFoundedDate');
  String get projectInvalidUrl => _value('projectInvalidUrl');
  String get projectStageRequired => _value('projectStageRequired');
  String get notSpecified => _value('notSpecified');
  String get clearLabel => _value('clearLabel');
  String get projectSaveFailed => _value('projectSaveFailed');
  String get projectSaveFailedBody => _value('projectSaveFailedBody');
  String get projectsEmptyTitle => _value('projectsEmptyTitle');
  String get projectsEmptyBody => _value('projectsEmptyBody');
  String get projectsErrorTitle => _value('projectsErrorTitle');
  String get projectsErrorBody => _value('projectsErrorBody');
  String get projectsForbiddenTitle => _value('projectsForbiddenTitle');
  String get projectsForbiddenBody => _value('projectsForbiddenBody');
  String get projectContextUnavailable => _value('projectContextUnavailable');
  String get updated => _value('updated');
  String get activity => _value('activity');
  String get stageIdea => _value('stageIdea');
  String get stageMvp => _value('stageMvp');
  String get stageStartup => _value('stageStartup');
  String get stageScaling => _value('stageScaling');
  String get stageEstablished => _value('stageEstablished');
  String get stageOther => _value('stageOther');
  String get stageLabel => _value('stageLabel');
  String get industryLabel => _value('industryLabel');
  String get categoryLabel => _value('categoryLabel');
  String get businessProfile => _value('businessProfile');
  String get aboutProject => _value('aboutProject');
  String get opportunities => _value('opportunities');
  String get projectInformation => _value('projectInformation');
  String get founded => _value('founded');
  String get location => _value('location');
  String get website => _value('website');
  String get created => _value('created');
  String get lastUpdated => _value('lastUpdated');
  String get noOpportunitiesTitle => _value('noOpportunitiesTitle');
  String get noOpportunitiesBody => _value('noOpportunitiesBody');
  String get projectOverviewErrorTitle => _value('projectOverviewErrorTitle');
  String get projectOverviewErrorBody => _value('projectOverviewErrorBody');
  String get projectOverviewNotFoundTitle =>
      _value('projectOverviewNotFoundTitle');
  String get projectOverviewNotFoundBody =>
      _value('projectOverviewNotFoundBody');
  String get projectOverviewForbiddenTitle =>
      _value('projectOverviewForbiddenTitle');
  String get projectOverviewForbiddenBody =>
      _value('projectOverviewForbiddenBody');
  String get latestOpportunity => _value('latestOpportunity');
  String get viewOpportunity => _value('viewOpportunity');
  String get viewAllOpportunities => _value('viewAllOpportunities');
  String get viewPastOpportunities => _value('viewPastOpportunities');
  String get currentRecent => _value('currentRecent');
  String get pastOpportunities => _value('pastOpportunities');
  String get noPastOpportunities => _value('noPastOpportunities');
  String get projectRoom => _value('projectRoom');
  String get projectRoomDescription => _value('projectRoomDescription');
  String get openProjectRoom => _value('openProjectRoom');
  String get roomUnavailable => _value('roomUnavailable');
  String get roomOverview => _value('roomOverview');
  String get roomUpdates => _value('roomUpdates');
  String get roomMilestones => _value('roomMilestones');
  String get roomTimeline => _value('roomTimeline');
  String get addRoomUpdate => _value('addRoomUpdate');
  String get addRoomMilestone => _value('addRoomMilestone');
  String get roomEntryTitle => _value('roomEntryTitle');
  String get roomEntryDescription => _value('roomEntryDescription');
  String get roomDueDate => _value('roomDueDate');
  String get investorVisible => _value('investorVisible');
  String get markMilestoneComplete => _value('markMilestoneComplete');
  String get milestoneCompleteConfirm => _value('milestoneCompleteConfirm');
  String get roomEntrySaved => _value('roomEntrySaved');
  String get roomEntrySaveFailed => _value('roomEntrySaveFailed');
  String get milestoneCompleted => _value('milestoneCompleted');
  String get milestoneUpdateFailed => _value('milestoneUpdateFailed');
  String get roomDocuments => _value('roomDocuments');
  String get addRoomDocument => _value('addRoomDocument');
  String get roomDocumentPurpose => _value('roomDocumentPurpose');
  String get roomDocumentCategory => _value('roomDocumentCategory');
  String get roomDocumentVisibility => _value('roomDocumentVisibility');
  String get roomDocumentMembers => _value('roomDocumentMembers');
  String get roomDocumentFounderOnly => _value('roomDocumentFounderOnly');
  String get roomDocumentUpload => _value('roomDocumentUpload');
  String get roomDocumentUploaded => _value('roomDocumentUploaded');
  String get roomDocumentSizeInvalid => _value('roomDocumentSizeInvalid');
  String get roomDocumentUploadFailed => _value('roomDocumentUploadFailed');
  String get roomDocumentDownloaded => _value('roomDocumentDownloaded');
  String get roomDocumentDownloadFailed => _value('roomDocumentDownloadFailed');
  String get roomDocumentPreview => _value('roomDocumentPreview');
  String get roomDocumentDownload => _value('roomDocumentDownload');
  String get roomDocumentPreviewUnsupported =>
      _value('roomDocumentPreviewUnsupported');
  String get projectEventOpportunityCreated =>
      _value('projectEventOpportunityCreated');
  String get projectEventMilestoneCreated =>
      _value('projectEventMilestoneCreated');
  String get projectEventMilestoneCompleted =>
      _value('projectEventMilestoneCompleted');
  String get projectEventMilestoneDelayed =>
      _value('projectEventMilestoneDelayed');
  String get projectEventMilestoneUpdated =>
      _value('projectEventMilestoneUpdated');
  String get projectEventDocumentPublished =>
      _value('projectEventDocumentPublished');
  String get projectEventContractActivated =>
      _value('projectEventContractActivated');
  String get projectEventParticipationApproved =>
      _value('projectEventParticipationApproved');
  String get projectEventFundingProgress =>
      _value('projectEventFundingProgress');
  String get projectEventProjectStatus => _value('projectEventProjectStatus');
  String get projectEventFundingCompleted =>
      _value('projectEventFundingCompleted');
  String get noRoomContent => _value('noRoomContent');
  String get opportunityContext => _value('opportunityContext');
  String get publicTerms => _value('publicTerms');
  String get useOfFunds => _value('useOfFunds');
  String get expectedReturn => _value('expectedReturn');
  String get fundingTarget => _value('fundingTarget');
  String get minimumParticipation => _value('minimumParticipation');
  String get maximumParticipation => _value('maximumParticipation');
  String get expectedDuration => _value('expectedDuration');
  String get fundingWindow => _value('fundingWindow');
  String get unavailable => _value('unavailable');
  String get statusDraft => _value('statusDraft');
  String get statusActive => _value('statusActive');
  String get statusPaused => _value('statusPaused');
  String get statusCompleted => _value('statusCompleted');
  String get statusArchived => _value('statusArchived');

  String opportunityCount(int active, int total) => _value(
    'opportunityCount',
  ).replaceAll('{active}', '$active').replaceAll('{total}', '$total');

  String activeOpportunitySummary(int active) {
    if (active == 0) return _value('noActiveOpportunities');
    final key =
        active == 1 ? 'oneActiveOpportunity' : 'activeOpportunitiesSummary';
    return _value(key).replaceAll('{active}', '$active');
  }

  String projectOpportunityTotal(int total) =>
      _value('projectOpportunityTotal').replaceAll('{total}', '$total');

  String projectMinimumCharacters(int minimum) =>
      _value('projectMinimumCharacters').replaceAll('{minimum}', '$minimum');

  String opportunityStatusLabel(String status) => switch (status
      .toLowerCase()) {
    'draft' => _value('opportunityStatusDraft'),
    'underreview' => _value('opportunityStatusUnderReview'),
    'rejected' => _value('opportunityStatusRejected'),
    'approved' => _value('opportunityStatusApproved'),
    'published' => _value('opportunityStatusPublished'),
    'funding' => _value('opportunityStatusFunding'),
    'fullyfunded' => _value('opportunityStatusFullyFunded'),
    'inprogress' => _value('opportunityStatusInProgress'),
    'completed' => _value('opportunityStatusCompleted'),
    'archived' => _value('opportunityStatusArchived'),
    _ => status,
  };

  String projectSemanticLabel(
    String name,
    String status,
    int active,
    int total,
  ) => _value('projectSemanticLabel')
      .replaceAll('{name}', name)
      .replaceAll('{status}', status)
      .replaceAll('{active}', '$active')
      .replaceAll('{total}', '$total');

  String _value(String key) =>
      _strings[locale.languageCode]?[key] ?? _strings['en']![key]!;

  static const _strings = <String, Map<String, String>>{
    'en': {
      'appName': 'FOPX',
      'founder': 'Founder',
      'login': 'Sign in',
      'email': 'Email',
      'password': 'Password',
      'signIn': 'Continue securely',
      'signOut': 'Sign out',
      'invalidCredentials': 'We could not sign you in with those details.',
      'sessionExpired': 'Your session has ended. Please sign in again.',
      'home': 'Home',
      'projects': 'Projects',
      'deals': 'Deals',
      'chat': 'Chat',
      'notifications': 'Notifications',
      'profile': 'Profile',
      'overview': 'Overview',
      'homeSubtitle': 'Your operating view, ready when you are.',
      'sectionShell': 'Foundation shell',
      'projectsSubtitle': 'Your projects will live here.',
      'dealsSubtitle':
          'Accepted participations and contracts across your opportunities.',
      'dealsLoadFailed': 'Deals could not be loaded',
      'dealsLoadFailedBody': 'Check your connection and try again.',
      'dealsEmptyTitle': 'No accepted deals yet',
      'dealsEmptyBody':
          'Approved investor participations and their contracts will appear here.',
      'contractNumber': 'Contract',
      'contractDetails': 'Contract details',
      'contractCurrentVersion': 'Current version',
      'contractVersionHistory': 'Version history',
      'contractVersion': 'Version',
      'contractVersionType': 'Type',
      'contractVersionCreated': 'Created',
      'contractVersionActivated': 'Activated',
      'contractPreviewAvailable': 'Document preview available',
      'contractPreviewOpen': 'Preview contract',
      'contractPreviewTitle': 'Contract preview',
      'contractPreviewUnsupported':
          'Contract preview is not supported on this device.',
      'contractPreviewUnavailable': 'Document preview is not available yet',
      'contractDownload': 'Download PDF',
      'contractDownloaded': 'Contract PDF saved.',
      'contractDownloadFailed': 'The contract PDF could not be downloaded.',
      'contractEmail': 'Email contract',
      'contractEmailConfirm':
          'Send this official contract PDF to your verified account email?',
      'contractEmailSent': 'The contract email was queued for delivery.',
      'contractEmailFailed': 'The contract email could not be sent.',
      'contractDocumentHash': 'Document hash',
      'contractDetailLoadFailed': 'Contract details could not be loaded',
      'contractDetailLoadFailedBody': 'Check your connection and try again.',
      'contractReadOnly': 'Read-only contract information',
      'investmentModel': 'Investment model',
      'status': 'Status',
      'investorRequests': 'Investor requests',
      'requestsLoadFailed': 'Investor requests could not be loaded',
      'noInvestorRequests': 'No investor requests yet',
      'noInvestorRequestsBody':
          'Requests for this opportunity will appear here.',
      'requestType': 'Request type',
      'requestApprovedStatus': 'Approved',
      'requestRejectedStatus': 'Rejected',
      'requestCancelledStatus': 'Cancelled',
      'approve': 'Approve',
      'reject': 'Reject',
      'cancel': 'Cancel',
      'approveJoinRequest': 'Approve investor request?',
      'approveJoinRequestConfirm':
          'This will approve the participation request and may update this opportunity’s funding state.',
      'rejectJoinRequest': 'Reject investor request',
      'rejectionReasonHint': 'Reason for rejection',
      'joinRequestApproved': 'Investor request approved.',
      'joinRequestRejected': 'Investor request rejected.',
      'joinRequestReviewFailed':
          'The request could not be reviewed. Try again.',
      'createOpportunity': 'Create opportunity',
      'editOpportunity': 'Edit opportunity',
      'opportunityEditingUnavailable': 'This opportunity cannot be edited',
      'opportunityEditingLockedBody':
          'The backend has locked its core fields after investor participation.',
      'opportunityUpdated': 'Opportunity changes saved.',
      'opportunitySaveFailed': 'The opportunity could not be saved. Try again.',
      'publishOpportunity': 'Publish opportunity',
      'paidActionConfirmation':
          'Publishing costs {cost} credits. Your current balance is {balance}. Continue?',
      'opportunityPublished': 'Opportunity published.',
      'submitOpportunityForReview': 'Submit for review',
      'opportunitySubmittedForReview': 'Opportunity submitted for review.',
      'opportunitySubmitFailed':
          'The opportunity could not be submitted for review. Try again.',
      'opportunityArchiveConfirmTitle': 'Archive this opportunity?',
      'opportunityArchiveConfirmBody':
          'Archiving cannot be undone. This opportunity will leave active work. Continue only if this is intended.',
      'opportunityArchiveAction': 'Archive opportunity',
      'opportunityArchived': 'Opportunity archived.',
      'opportunityArchiveFailed':
          'The opportunity could not be archived. Try again.',
      'opportunityPublishFailed':
          'The opportunity could not be published. Try again.',
      'opportunityCoverImage': 'Opportunity cover image',
      'changeCoverImage': 'Add or change cover image',
      'opportunityCoverImageUpdated': 'Cover image updated.',
      'opportunityCoverImageFailed':
          'The cover image could not be uploaded. Try again.',
      'opportunityCoverImageTooLarge': 'Choose an image smaller than 10 MB.',
      'insufficientPublishCredit':
          'Your balance is not sufficient to publish this opportunity.',
      'opportunityFundingCurrencyImmutable':
          'Funding currency cannot be changed after publishing.',
      'opportunityTitle': 'Opportunity title',
      'opportunityShortDescription': 'Short description (20–300 characters)',
      'opportunityUseOfFunds': 'Use of funds (30–2,000 characters)',
      'opportunityFundingTarget': 'Funding target',
      'opportunityFundingCurrency': 'Funding currency',
      'opportunityFundingGoal': 'Funding goal (optional)',
      'opportunityProjectStage': 'Project stage',
      'opportunityCustomStage': 'Custom stage name',
      'opportunityDescription': 'Additional details (optional)',
      'opportunityDraftCreated': 'Opportunity draft created.',
      'opportunityCreateFailed':
          'The opportunity could not be created. Check the fields and try again.',
      'noAvailableOpportunityStages':
          'All project stages are already assigned to opportunities.',
      'save': 'Save',
      'saving': 'Saving…',
      'negotiationOffers': 'Negotiation offers',
      'noDirectOffers': 'No direct offers yet.',
      'offerFrom': 'Offer from',
      'offerVersion': 'Version',
      'offerReplacesVersion': 'Replaces offer',
      'totalOfferAmount': 'Total across offer legs',
      'acceptOffer': 'Accept offer',
      'rejectOffer': 'Reject offer',
      'acceptOfferConfirm':
          'Accepting this offer creates an approved participation and may change the opportunity’s funding capacity. Continue?',
      'rejectOfferConfirm': 'Reject this offer? This action cannot be undone.',
      'offerActionFailed': 'The offer could not be updated. Try again.',
      'offerAccepted': 'Offer accepted and participation recorded.',
      'offerRejected': 'Offer rejected.',
      'makeOffer': 'Make an offer',
      'counterOffer': 'Counteroffer',
      'withdrawOffer': 'Withdraw offer',
      'withdrawOfferConfirm': 'Withdraw this pending offer?',
      'offerWithdrawn': 'Offer withdrawn.',
      'offerCurrency': 'Offer currency',
      'offerType': 'Investment terms',
      'equityOffer': 'Equity',
      'loanOffer': 'Loan',
      'profitSharingOffer': 'Profit sharing',
      'offerAmount': 'Investment amount',
      'equityOwnership': 'Equity ownership basis',
      'percentageBased': 'Percentage ownership',
      'shareBased': 'Share count',
      'equityPercent': 'Ownership percentage',
      'equityTitle': 'Equity position',
      'equityLoadFailed': 'Equity information could not be loaded.',
      'equityNoPosition':
          'No equity position is recorded for this participation.',
      'equityCapitalization': 'Capitalization table',
      'equityCapTableEmpty': 'No capitalization records are available.',
      'equityPrepareEvent': 'Prepare capitalization request',
      'equityEventApprovalNote':
          'This submits a request only. Ownership changes after Operations approval and application.',
      'equityCorporateEvents': 'Corporate events',
      'equityEventsEmpty': 'No corporate events are recorded.',
      'equityDividends': 'Dividends',
      'equityDividendsEmpty': 'No dividend declarations are recorded.',
      'equityTransfers': 'Share transfers',
      'equityTransfersEmpty': 'No share transfers are recorded.',
      'equityPosition': 'Position',
      'equityContractualOwnership': 'Contractual ownership',
      'equityCurrentOwnership': 'Current ownership',
      'equityDilution': 'Dilution',
      'equityInvestorShares': 'Investor shares',
      'equityTotalShares': 'Total issued shares',
      'equityShareClass': 'Share class',
      'equityPricePerShare': 'Price per share',
      'equityLedger': 'Ownership history',
      'equityOwnershipAsOf': 'Ownership as of date',
      'equityDividendStatus': 'Dividend status',
      'equityTotalDividend': 'Declared total',
      'equityEntitlement': 'Entitlement',
      'equityEventType': 'Event type',
      'equitySplitNumerator': 'Split numerator',
      'equitySplitDenominator': 'Split denominator',
      'equitySharesIssued': 'Shares issued',
      'equityEventReason': 'Reason',
      'equityEffectiveDate': 'Effective date',
      'equitySubmitForApproval': 'Submit for Operations approval',
      'equityActionFailed':
          'The request could not be submitted. Please try again.',
      'equityClosure': 'Exit and closure record',
      'equityClosureUnavailable': 'No closure snapshot is available.',
      'equityFullyExitedAt': 'Fully exited',
      'equityClosedAt': 'Closed',
      'equityConfirmedDistributions': 'Confirmed distributions',
      'investorShareCount': 'Investor shares',
      'totalIssuedShares': 'Total issued shares',
      'shareClass': 'Share class',
      'pricePerShare': 'Price per share',
      'preMoneyValuation': 'Pre-money valuation',
      'postMoneyValuation': 'Post-money valuation',
      'effectiveOwnershipDate': 'Effective ownership date',
      'sharesTerms': 'Share terms',
      'returnRate': 'Annual return rate (%)',
      'termMonths': 'Term (months)',
      'repaymentModel': 'Repayment schedule',
      'profitSharePercentage': 'Profit share (%)',
      'payoutFrequency': 'Reporting frequency',
      'exitTerms': 'Exit terms',
      'offerNote': 'Note to the investor (optional)',
      'sendOffer': 'Review and send',
      'offerSent': 'Offer sent to the investor.',
      'offerReplaced': 'Counteroffer sent to the investor.',
      'offerSubmitFailed':
          'The offer could not be sent. Check the terms and try again.',
      'offerQuoteFailed':
          'Offer pricing could not be checked. No offer was sent.',
      'insufficientOfferCredit':
          'Your balance is not enough to send this offer.',
      'offerCostConfirmation':
          'This offer costs {cost} credits. Your balance is {balance} credits. Send it now?',
      'invalidAmount': 'Enter an amount greater than zero.',
      'invalidDate': 'Enter a valid date in YYYY-MM-DD format.',
      'none': 'None',
      'validationMaxLength': 'Use no more than {maximum} characters.',
      'investor': 'Investor',
      'chatSubtitle': 'Conversations and negotiations with your investors.',
      'chatEmptyTitle': 'No conversations yet',
      'chatEmptyBody':
          'Conversation requests and active negotiations will appear here.',
      'chatLoadFailed': 'Conversations could not be loaded',
      'chatLoadFailedBody': 'Check your connection and try again.',
      'incomingConversationRequests': 'Incoming conversation requests',
      'conversations': 'Conversations',
      'conversationRequests': 'Conversation requests',
      'withdrawConversationRequest': 'Withdraw request',
      'withdrawConversationRequestConfirm':
          'Withdraw this pending conversation request?',
      'conversationRequestsLoadFailed':
          'Incoming requests could not be loaded.',
      'rejectConversationRequest': 'Reject conversation request',
      'acceptConversationRequest': 'Accept',
      'rejectConversationRequestConfirm':
          'Reject this request to start a conversation?',
      'conversationRequestAccepted': 'Conversation request accepted.',
      'conversationRequestRejected': 'Conversation request rejected.',
      'conversationRequestWithdrawn': 'Conversation request withdrawn.',
      'conversationRequestActionFailed':
          'The request could not be updated. Try again.',
      'readyToProceed': 'Ready to proceed',
      'closeConversation': 'Close conversation',
      'closeConversationConfirm':
          'Close this conversation? You will no longer be able to send messages or offers.',
      'closeReasonOptional': 'Reason (optional)',
      'conversationClosed': 'This conversation is closed.',
      'conversationNotVisible':
          'This conversation is not available to this account.',
      'conversationActionFailed':
          'The conversation could not be updated. Try again.',
      'founderReady': 'Founder ready',
      'investorReady': 'Investor ready',
      'projectRoomUnlocked': 'Project Room is unlocked',
      'canContinueNegotiation': 'Both sides can continue',
      'yes': 'Yes',
      'no': 'No',
      'dealDetails': 'Deal details',
      'fundingLoadFailed': 'Funding details could not be loaded',
      'fundingPosition': 'Funding position',
      'fundingCommitted': 'Committed',
      'fundingDeclared': 'Declared',
      'fundingAwaitingConfirmation': 'Awaiting investor confirmation',
      'fundingDisputed': 'Disputed',
      'fundingConfirmed': 'Confirmed',
      'fundingOutstanding': 'Outstanding',
      'fundsTransferredOutsideFopx':
          'Funds are transferred directly between the parties outside FOPX. This record only documents the Founder’s declaration.',
      'declareFundingReceived': 'Declare funds received',
      'fundingDeclarations': 'Funding declarations',
      'noFundingDeclarations': 'No funding declared yet',
      'noFundingDeclarationsBody':
          'Record funds only after they have been received directly from the Investor.',
      'fundingReceivedDate': 'Date funds were received',
      'fundingPaymentMethod': 'Payment method',
      'fundingExternalReference': 'External reference',
      'fundingAmount': 'Amount received',
      'fundingEvidence': 'Evidence',
      'fundingEvidenceAvailable': 'Available',
      'fundingConfirmationNote': 'Investor confirmation note',
      'fundingDisputeReason': 'Investor dispute reason',
      'fundingDeclarationFailed':
          'The funding declaration could not be saved. Try again.',
      'profitSharingTitle': 'Profit Sharing lifecycle',
      'profitSharingNoObligations':
          'No active Profit Sharing obligation is attached to this deal.',
      'profitSharingRate': 'Accepted profit share',
      'profitSharingReporting': 'Reporting frequency',
      'profitSharingBasis': 'Calculation basis',
      'profitSharingStatus': 'Lifecycle status',
      'profitSharingEntitlement': 'Investor entitlement',
      'profitSharingConfirmed': 'Confirmed distributions',
      'profitSharingPending': 'Awaiting investor confirmation',
      'profitSharingOutstanding': 'Distribution outstanding',
      'profitSharingPeriod': 'Reporting period {number}',
      'profitSharingDeclareResult': 'Declare period result',
      'profitSharingDeclaredBasis': 'Declared calculation basis amount',
      'profitSharingDeclaredResult': 'Declared result amount',
      'profitSharingDistribution': 'Distribution history',
      'profitSharingDeclareDistribution': 'Declare distribution',
      'profitSharingDeclarationFailed':
          'The Profit Sharing declaration could not be saved. Try again.',
      'profitSharingResultHistory': 'Founder result declaration',
      'profitSharingPeriodRange': '{start} – {end}',
      'profitSharingDownloadEvidence': 'Download evidence',
      'profitSharingInvestorDecision': 'Investor decision: {status}',
      'profitSharingCalculationError': 'Calculation note: {message}',
      'profitSharingSettledAt': 'Settled on',
      'profitSharingClosedAt': 'Closed on',
      'profitSharingNotes': 'Notes',
      'acceptedTermsLoadFailed':
          'Accepted deal terms could not be loaded. Retry before declaring funds.',
      'allocateAcrossOfferLegs':
          'Allocate this receipt across the accepted offer legs',
      'fundingLegAllocation': 'Offer leg {number} · {type} amount',
      'fundingLegUndeclaredCapacity': 'Remaining undeclared capacity: {amount}',
      'fundingAllocationExceedsCapacity':
          'Enter an amount within this leg’s remaining capacity.',
      'fundingAllocationMustReconcile':
          'Leg allocations must add up exactly to the declared amount.',
      'loanLifecycle': 'Loan lifecycle',
      'principalOutstanding': 'Principal outstanding',
      'interestOutstanding': 'Interest outstanding',
      'loanOutstanding': 'Total outstanding',
      'confirmedRepaid': 'Confirmed repayments',
      'pendingRepaymentConfirmation': 'Awaiting confirmation',
      'repaymentDisputed': 'Disputed repayments',
      'overdueAmount': 'Overdue amount',
      'nextPayment': 'Next payment',
      'maturityDate': 'Maturity date',
      'defaultReason': 'Default reason',
      'closureReason': 'Closure reason',
      'persistedLoanSchedule': 'Persisted repayment schedule',
      'persistedLoanScheduleUnavailable':
          'The backend has not provided a persisted repayment schedule.',
      'installment': 'Installment',
      'installments': 'Installments',
      'loanRepaymentHistory': 'Repayment history',
      'declareLoanRepayment': 'Record a repayment',
      'loanFundsTransferredOutsideFopx':
          'Repayments are transferred directly to the Investor outside FOPX. This records the Founder’s declaration for Investor review.',
      'repaymentAmount': 'Amount paid',
      'externalPaymentDate': 'Date paid externally',
      'loanRepaymentMaximum': 'Remaining amount available to declare: {amount}',
      'loanRepaymentDeclarationFailed':
          'The repayment declaration could not be saved. Try again.',
      'notes': 'Notes',
      'submit': 'Submit declaration',
      'chatNoMessages': 'No messages yet',
      'chatNoMessagesBody': 'Start the conversation when you are ready.',
      'chatMessageHint': 'Write a message',
      'chatSend': 'Send message',
      'chatSendFailed': 'The message could not be sent. Try again.',
      'chatMessageRemoved': 'This message was removed.',
      'notificationsSubtitle': 'Stay close to meaningful changes.',
      'notificationsLoadFailed': 'Notifications could not be loaded',
      'notificationsLoadFailedBody': 'Check your connection and try again.',
      'notificationsEmptyBody':
          'Updates about your projects and conversations will appear here.',
      'markAllRead': 'Mark all read',
      'notificationUpdateFailed':
          'The notification could not be updated. Try again.',
      'deleteNotification': 'Delete notification',
      'loadMore': 'Load more',
      'loadingMore': 'Loading…',
      'profileSubtitle': 'Your shared FOPX account space.',
      'editProfile': 'Edit profile',
      'firstName': 'First name',
      'lastName': 'Last name',
      'mobile': 'Mobile number',
      'profileUpdated': 'Profile updated.',
      'profileUpdateFailed':
          'Profile could not be updated. Check the details and try again.',
      'appearance': 'Appearance',
      'themeSystem': 'System',
      'themeLight': 'Light',
      'themeDark': 'Dark',
      'trustRequirements': 'Next trust level',
      'verificationHistory': 'Verification history',
      'requirementMet': 'Completed',
      'requirementOpen': 'Still needed',
      'profileLoadFailed': 'Profile details could not be loaded',
      'profileLoadFailedBody': 'Check your connection and try again.',
      'profileCompletion': 'Profile completion',
      'credibilityScore': 'Credibility score',
      'profileScore': 'Profile score',
      'accountSecurity': 'Account security',
      'changePassword': 'Change password',
      'changePasswordSubtitle': 'Verify your current password and a code sent to your verified phone.',
      'verifyPhoneToChangePassword': 'Verify your phone number before changing your password.',
      'currentPassword': 'Current password',
      'sendVerificationCode': 'Send verification code',
      'passwordCodeSent': 'A six-digit code was sent to your verified phone.',
      'verificationCode': 'Verification code',
      'newPassword': 'New password',
      'confirmNewPassword': 'Confirm new password',
      'passwordsDoNotMatch': 'The new passwords do not match.',
      'passwordChangeComplete': 'Your password was changed.',
      'passwordChangeFailed': 'The password could not be changed. Check the details and try again.',
      'trustAndReputation': 'Trust and reputation',
      'trustLevel': 'Trust level',
      'reputationScore': 'Reputation score',
      'activityScore': 'Activity score',
      'phoneVerified': 'Phone',
      'emailVerified': 'Email',
      'verified': 'Verified',
      'pending': 'Not verified',
      'emptyTitle': 'A considered beginning',
      'emptyBody': 'This foundation is ready for the next product layer.',
      'noNotifications': 'No notifications yet',
      'noProfileData': 'Profile details will appear here when available.',
      'language': 'Language',
      'english': 'English',
      'arabic': 'العربية',
      'unreadNotifications': 'unread notifications',
      'notificationsUnavailable': 'Unread count is not available yet.',
      'secureAccess': 'Secure access to your FOPX workspace',
      'loginSubtitle': 'Use your FOPX account to continue to Founder.',
      'emailHint': 'name@company.com',
      'phoneNumber': 'Phone number',
      'phoneNumberHint': '010 2232 2291',
      'countrySelector': 'Country and calling code',
      'searchCountries': 'Search countries',
      'invalidPhoneNumber': 'Enter a valid phone number.',
      'unsupportedCountry': 'This country is not supported yet.',
      'ambiguousCountry': 'Select the matching country before continuing.',
      'passwordHint': 'Enter your password',
      'requiredField': 'This field is required.',
      'continueLabel': 'Continue',
      'retry': 'Try again',
      'founderIdentity': 'Founder workspace',
      'phaseZero': 'Phase 0 · Foundation',
      'projectsContext': 'Manage the businesses you are building on FOPX.',
      'portfolioSummary': 'Portfolio pulse',
      'totalProjects': 'Total projects',
      'activeProjects': 'Active projects',
      'activeOpportunities': 'Active opportunities',
      'homePortfolio': 'Portfolio',
      'homeCapitalPosition': 'Capital position',
      'homeNeedsAttention': 'Needs attention',
      'homePendingActions': 'Pending actions: {count}',
      'homeYourProjects': 'Your projects',
      'homeNoProjects': 'Your portfolio is ready to begin',
      'homeNoProjectsBody':
          'Projects you own will appear here when they are available.',
      'homeCommitted': 'Committed',
      'homeDeclared': 'Declared by you',
      'homeAwaitingConfirmation': 'Awaiting investor confirmation',
      'homeDisputed': 'Disputed',
      'homeConfirmed': 'Confirmed by investors',
      'homeOutstanding': 'Outstanding',
      'homeErrorTitle': 'Your overview is unavailable right now',
      'homeErrorBody':
          'We could not load your Founder overview. Check your connection and try again.',
      'homeForbiddenTitle': 'Founder overview access is restricted',
      'homeForbiddenBody':
          'Your account is not authorized to view this Founder overview. Your session is still active.',
      'approximateValue': 'Approximate value',
      'projectOpportunityTotal': '{total} opportunities',
      'projectCreate': 'Create project',
      'projectEdit': 'Edit project',
      'projectSaveChanges': 'Save changes',
      'projectIdentitySection': 'Project identity',
      'projectNarrativeSection': 'Business context',
      'projectRiskSection': 'Risk context',
      'projectName': 'Project name',
      'projectLegalName': 'Legal name',
      'projectLogoUrl': 'Project logo URL',
      'projectLogoChooseAction': 'Choose a project logo image',
      'projectLogoTooLarge': 'Choose an image smaller than 10 MB.',
      'projectLogoPickFailed': 'The project logo image could not be selected.',
      'projectLogoPartialFailure':
          'Project details were saved, but the logo could not be attached. Retry to finish.',
      'projectStatusActions': 'Project status actions',
      'projectArchiveConfirmTitle': 'Archive this project?',
      'projectArchiveConfirmBody':
          'Archiving cannot be undone. The project will leave active work and cannot be edited or reopened. Continue only if this is intended.',
      'projectArchiveReason': 'Reason (at least 5 characters)',
      'projectArchiveAction': 'Archive project',
      'projectArchiveCancel': 'Cancel',
      'projectStatusUpdateFailed':
          'Project status could not be updated. Try again.',
      'projectSummary': 'Summary',
      'projectDescription': 'Description',
      'projectBusinessModel': 'Business model',
      'projectTeamDescription': 'Team',
      'projectRiskLevel': 'Risk level',
      'projectRiskDisclosure': 'Risk disclosure',
      'projectFoundedDate': 'Date founded',
      'projectInvalidUrl':
          'Enter a valid URL starting with http:// or https://.',
      'projectStageRequired': 'Select a project stage.',
      'notSpecified': 'Not specified',
      'clearLabel': 'Clear',
      'projectSaveFailed': 'Project could not be saved',
      'projectSaveFailedBody': 'Check the entered details and try again.',
      'projectMinimumCharacters': 'Enter at least {minimum} characters.',
      'projectsEmptyTitle': 'Start with your first project',
      'projectsEmptyBody':
          'Projects give your future opportunities a clear business home. Your portfolio will take shape here when project creation is available.',
      'projectsErrorTitle': 'Projects are unavailable right now',
      'projectsErrorBody':
          'We could not load your Founder portfolio. Check your connection and try again.',
      'projectsForbiddenTitle': 'Projects access is restricted',
      'projectsForbiddenBody':
          'Your account is not authorized to view this Founder portfolio. Your session is still active.',
      'projectContextUnavailable':
          'Business context will appear when available.',
      'updated': 'Updated',
      'activity': 'Opportunity activity',
      'opportunityCount': '{active} active · {total} total opportunities',
      'noActiveOpportunities': 'No active opportunities',
      'oneActiveOpportunity': '1 active opportunity',
      'activeOpportunitiesSummary': '{active} active opportunities',
      'projectSemanticLabel':
          '{name}. Status {status}. {active} active opportunities out of {total}.',
      'stageIdea': 'Idea',
      'stageMvp': 'MVP',
      'stageStartup': 'Startup',
      'stageScaling': 'Scaling',
      'stageEstablished': 'Established',
      'stageOther': 'Other',
      'stageLabel': 'Stage',
      'industryLabel': 'Industry',
      'categoryLabel': 'Category',
      'businessProfile': 'Business profile',
      'aboutProject': 'About the project',
      'opportunities': 'Opportunities',
      'projectInformation': 'Project information',
      'founded': 'Founded',
      'location': 'Location',
      'website': 'Website',
      'created': 'Created',
      'lastUpdated': 'Last updated',
      'noOpportunitiesTitle': 'No opportunities yet',
      'noOpportunitiesBody':
          'Investment opportunities created for this project will appear here.',
      'projectOverviewErrorTitle': 'Project overview is unavailable right now',
      'projectOverviewErrorBody':
          'We could not load this Project. Check your connection and try again.',
      'projectOverviewNotFoundTitle': 'Project not found',
      'projectOverviewNotFoundBody':
          'This Project is no longer available in your Founder workspace.',
      'projectOverviewForbiddenTitle': 'Project access is restricted',
      'projectOverviewForbiddenBody':
          'Your account is not authorized to view this Project.',
      'latestOpportunity': 'Latest opportunity',
      'viewOpportunity': 'View opportunity',
      'viewAllOpportunities': 'View all opportunities',
      'viewPastOpportunities': 'Past opportunities',
      'currentRecent': 'Current and recent',
      'pastOpportunities': 'Past opportunities',
      'noPastOpportunities':
          'There are no past opportunities for this Project.',
      'projectRoom': 'Project Room',
      'projectRoomDescription':
          'Your workspace for project investment activity.',
      'openProjectRoom': 'Open Project Room',
      'roomUnavailable':
          'Project Room is unavailable for this account right now.',
      'roomOverview': 'Overview',
      'roomUpdates': 'Updates',
      'roomMilestones': 'Milestones',
      'roomTimeline': 'Activity',
      'addRoomUpdate': 'Add update',
      'addRoomMilestone': 'Add milestone',
      'roomEntryTitle': 'Title',
      'roomEntryDescription': 'Description (optional)',
      'roomDueDate': 'Due date',
      'investorVisible': 'Visible to investors',
      'markMilestoneComplete': 'Mark complete',
      'milestoneCompleteConfirm': 'Mark this milestone as completed?',
      'roomEntrySaved': 'Project Room entry added.',
      'roomEntrySaveFailed': 'The Project Room entry could not be saved.',
      'milestoneCompleted': 'Milestone marked complete.',
      'milestoneUpdateFailed': 'The milestone could not be updated.',
      'roomDocuments': 'Documents',
      'addRoomDocument': 'Add document',
      'roomDocumentPurpose': 'Document purpose',
      'roomDocumentCategory': 'File category',
      'roomDocumentVisibility': 'Visibility',
      'roomDocumentMembers': 'Project members',
      'roomDocumentFounderOnly': 'Founder only',
      'roomDocumentUpload': 'Upload document',
      'roomDocumentUploaded': 'Project Room document uploaded.',
      'roomDocumentSizeInvalid': 'Choose a supported file up to 25 MB.',
      'roomDocumentUploadFailed': 'The document could not be uploaded.',
      'roomDocumentDownloaded': 'Document saved to your device.',
      'roomDocumentDownloadFailed': 'The document could not be downloaded.',
      'roomDocumentPreview': 'Preview',
      'roomDocumentDownload': 'Download',
      'roomDocumentPreviewUnsupported':
          'Preview is not available for this file type. Download the document to open it.',
      'projectEventOpportunityCreated': 'Opportunity created',
      'projectEventMilestoneCreated': 'Milestone added',
      'projectEventMilestoneCompleted': 'Milestone completed',
      'projectEventMilestoneDelayed': 'Milestone delayed',
      'projectEventMilestoneUpdated': 'Milestone updated',
      'projectEventDocumentPublished': 'Project document published',
      'projectEventContractActivated': 'Investment contract activated',
      'projectEventParticipationApproved': 'Participation approved',
      'projectEventFundingProgress': 'Funding progress updated',
      'projectEventProjectStatus': 'Project status changed',
      'projectEventFundingCompleted': 'Funding completed',
      'noRoomContent': 'There is no Project Room activity to show yet.',
      'opportunityContext': 'Opportunity context',
      'publicTerms': 'Public terms',
      'useOfFunds': 'Use of funds',
      'expectedReturn': 'Expected return',
      'fundingTarget': 'Funding target',
      'minimumParticipation': 'Minimum participation',
      'maximumParticipation': 'Maximum participation',
      'expectedDuration': 'Expected duration',
      'fundingWindow': 'Funding window',
      'unavailable': 'Unavailable',
      'opportunityStatusDraft': 'Draft',
      'opportunityStatusUnderReview': 'Under review',
      'opportunityStatusRejected': 'Rejected',
      'opportunityStatusApproved': 'Approved',
      'opportunityStatusPublished': 'Published',
      'opportunityStatusFunding': 'Funding',
      'opportunityStatusFullyFunded': 'Fully funded',
      'opportunityStatusInProgress': 'In progress',
      'opportunityStatusCompleted': 'Completed',
      'opportunityStatusArchived': 'Archived',
      'statusDraft': 'Draft',
      'statusActive': 'Active',
      'statusPaused': 'Paused',
      'statusCompleted': 'Completed',
      'statusArchived': 'Archived',
    },
    'ar': {
      'appName': 'فوبكس',
      'founder': 'المؤسس',
      'login': 'تسجيل الدخول',
      'email': 'البريد الإلكتروني',
      'password': 'كلمة المرور',
      'signIn': 'متابعة بأمان',
      'signOut': 'تسجيل الخروج',
      'invalidCredentials': 'تعذر تسجيل الدخول بهذه البيانات.',
      'sessionExpired': 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.',
      'home': 'الرئيسية',
      'projects': 'المشاريع',
      'deals': 'الاتفاقيات',
      'chat': 'المحادثات',
      'notifications': 'الإشعارات',
      'profile': 'الملف الشخصي',
      'overview': 'نظرة عامة',
      'homeSubtitle': 'مساحتك التشغيلية جاهزة عندما تكون مستعداً.',
      'sectionShell': 'قاعدة المنتج',
      'projectsSubtitle': 'ستظهر مشاريعك هنا.',
      'dealsSubtitle': 'المشاركات المعتمدة والعقود في فرصك الاستثمارية.',
      'dealsLoadFailed': 'تعذر تحميل الصفقات',
      'dealsLoadFailedBody': 'تحقق من الاتصال وحاول مرة أخرى.',
      'dealsEmptyTitle': 'لا توجد صفقات معتمدة بعد',
      'dealsEmptyBody':
          'ستظهر هنا مشاركات المستثمرين المعتمدة والعقود المرتبطة بها.',
      'contractNumber': 'العقد',
      'contractDetails': 'تفاصيل العقد',
      'contractCurrentVersion': 'الإصدار الحالي',
      'contractVersionHistory': 'سجل الإصدارات',
      'contractVersion': 'الإصدار',
      'contractVersionType': 'النوع',
      'contractVersionCreated': 'تاريخ الإنشاء',
      'contractVersionActivated': 'تاريخ التفعيل',
      'contractPreviewAvailable': 'معاينة المستند متاحة',
      'contractPreviewOpen': 'معاينة العقد',
      'contractPreviewTitle': 'معاينة العقد',
      'contractPreviewUnsupported': 'معاينة العقد غير مدعومة على هذا الجهاز.',
      'contractPreviewUnavailable': 'معاينة المستند غير متاحة بعد',
      'contractDownload': 'تنزيل PDF',
      'contractDownloaded': 'تم حفظ ملف العقد.',
      'contractDownloadFailed': 'تعذر تنزيل ملف العقد.',
      'contractEmail': 'إرسال العقد بالبريد',
      'contractEmailConfirm':
          'هل تريد إرسال ملف العقد الرسمي إلى بريدك الإلكتروني الموثق؟',
      'contractEmailSent': 'تمت إضافة رسالة العقد إلى قائمة الإرسال.',
      'contractEmailFailed': 'تعذر إرسال العقد بالبريد الإلكتروني.',
      'contractDocumentHash': 'بصمة المستند',
      'contractDetailLoadFailed': 'تعذر تحميل تفاصيل العقد',
      'contractDetailLoadFailedBody': 'تحقق من الاتصال وحاول مرة أخرى.',
      'contractReadOnly': 'معلومات العقد للعرض فقط',
      'investmentModel': 'نموذج الاستثمار',
      'status': 'الحالة',
      'investorRequests': 'طلبات المستثمرين',
      'requestsLoadFailed': 'تعذر تحميل طلبات المستثمرين',
      'noInvestorRequests': 'لا توجد طلبات مستثمرين بعد',
      'noInvestorRequestsBody': 'ستظهر طلبات هذه الفرصة هنا.',
      'requestType': 'نوع الطلب',
      'requestApprovedStatus': 'مقبول',
      'requestRejectedStatus': 'مرفوض',
      'requestCancelledStatus': 'ملغي',
      'approve': 'قبول',
      'reject': 'رفض',
      'cancel': 'إلغاء',
      'approveJoinRequest': 'قبول طلب المستثمر؟',
      'approveJoinRequestConfirm':
          'سيؤدي ذلك إلى قبول طلب المشاركة وقد يغيّر حالة تمويل الفرصة.',
      'rejectJoinRequest': 'رفض طلب المستثمر',
      'rejectionReasonHint': 'سبب الرفض',
      'joinRequestApproved': 'تم قبول طلب المستثمر.',
      'joinRequestRejected': 'تم رفض طلب المستثمر.',
      'joinRequestReviewFailed': 'تعذر مراجعة الطلب. حاول مرة أخرى.',
      'createOpportunity': 'إنشاء فرصة',
      'editOpportunity': 'تعديل الفرصة',
      'opportunityEditingUnavailable': 'لا يمكن تعديل هذه الفرصة',
      'opportunityEditingLockedBody':
          'قفل الخادم الحقول الأساسية بعد بدء مشاركة المستثمرين.',
      'opportunityUpdated': 'تم حفظ التعديلات.',
      'opportunitySaveFailed': 'تعذر حفظ الفرصة. حاول مرة أخرى.',
      'publishOpportunity': 'نشر الفرصة',
      'paidActionConfirmation':
          'يكلف النشر {cost} من الرصيد. رصيدك الحالي {balance}. هل تريد المتابعة؟',
      'opportunityPublished': 'تم نشر الفرصة.',
      'submitOpportunityForReview': 'إرسال للمراجعة',
      'opportunitySubmittedForReview': 'تم إرسال الفرصة للمراجعة.',
      'opportunitySubmitFailed': 'تعذر إرسال الفرصة للمراجعة. حاول مرة أخرى.',
      'opportunityArchiveConfirmTitle': 'أرشفة هذه الفرصة؟',
      'opportunityArchiveConfirmBody':
          'لا يمكن التراجع عن الأرشفة. ستخرج الفرصة من العمل النشط. تابع فقط إذا كان هذا مقصودًا.',
      'opportunityArchiveAction': 'أرشفة الفرصة',
      'opportunityArchived': 'تمت أرشفة الفرصة.',
      'opportunityArchiveFailed': 'تعذر أرشفة الفرصة. حاول مرة أخرى.',
      'opportunityPublishFailed': 'تعذر نشر الفرصة. حاول مرة أخرى.',
      'opportunityCoverImage': 'صورة غلاف الفرصة',
      'changeCoverImage': 'إضافة أو تغيير صورة الغلاف',
      'opportunityCoverImageUpdated': 'تم تحديث صورة الغلاف.',
      'opportunityCoverImageFailed': 'تعذر رفع صورة الغلاف. حاول مرة أخرى.',
      'opportunityCoverImageTooLarge': 'اختر صورة أصغر من 10 ميجابايت.',
      'insufficientPublishCredit': 'رصيدك لا يكفي لنشر هذه الفرصة.',
      'opportunityFundingCurrencyImmutable':
          'لا يمكن تغيير عملة التمويل بعد النشر.',
      'opportunityTitle': 'عنوان الفرصة',
      'opportunityShortDescription': 'وصف مختصر (20–300 حرف)',
      'opportunityUseOfFunds': 'أوجه استخدام التمويل (30–2000 حرف)',
      'opportunityFundingTarget': 'المبلغ المستهدف',
      'opportunityFundingCurrency': 'عملة التمويل',
      'opportunityFundingGoal': 'هدف التمويل (اختياري)',
      'opportunityProjectStage': 'مرحلة المشروع',
      'opportunityCustomStage': 'اسم المرحلة المخصص',
      'opportunityDescription': 'تفاصيل إضافية (اختياري)',
      'opportunityDraftCreated': 'تم إنشاء مسودة الفرصة.',
      'opportunityCreateFailed':
          'تعذر إنشاء الفرصة. راجع البيانات وحاول مرة أخرى.',
      'noAvailableOpportunityStages':
          'تم تخصيص جميع مراحل المشروع لفرص موجودة بالفعل.',
      'save': 'حفظ',
      'saving': 'جارٍ الحفظ…',
      'negotiationOffers': 'عروض التفاوض',
      'noDirectOffers': 'لا توجد عروض مباشرة حتى الآن.',
      'offerFrom': 'العرض من',
      'offerVersion': 'الإصدار',
      'offerReplacesVersion': 'يستبدل العرض',
      'totalOfferAmount': 'الإجمالي عبر بنود العرض',
      'acceptOffer': 'قبول العرض',
      'rejectOffer': 'رفض العرض',
      'acceptOfferConfirm':
          'قبول العرض ينشئ مشاركة معتمدة وقد يغيّر السعة التمويلية للفرصة. هل تريد المتابعة؟',
      'rejectOfferConfirm':
          'هل تريد رفض هذا العرض؟ لا يمكن التراجع عن هذا الإجراء.',
      'offerActionFailed': 'تعذر تحديث العرض. حاول مرة أخرى.',
      'offerAccepted': 'تم قبول العرض وتسجيل المشاركة.',
      'offerRejected': 'تم رفض العرض.',
      'makeOffer': 'إنشاء عرض',
      'counterOffer': 'تقديم عرض مقابل',
      'withdrawOffer': 'سحب العرض',
      'withdrawOfferConfirm': 'هل تريد سحب هذا العرض المعلّق؟',
      'offerWithdrawn': 'تم سحب العرض.',
      'offerCurrency': 'عملة العرض',
      'offerType': 'شروط الاستثمار',
      'equityOffer': 'حصة ملكية',
      'loanOffer': 'قرض',
      'profitSharingOffer': 'مشاركة في الأرباح',
      'offerAmount': 'مبلغ الاستثمار',
      'equityOwnership': 'أساس احتساب الملكية',
      'percentageBased': 'نسبة ملكية',
      'shareBased': 'عدد الأسهم',
      'equityPercent': 'نسبة الملكية',
      'equityTitle': 'مركز الملكية',
      'equityLoadFailed': 'تعذر تحميل بيانات الملكية.',
      'equityNoPosition': 'لا يوجد مركز ملكية مسجل لهذه المشاركة.',
      'equityCapitalization': 'جدول رأس المال',
      'equityCapTableEmpty': 'لا توجد سجلات لرأس المال.',
      'equityPrepareEvent': 'إعداد طلب تغيير رأس المال',
      'equityEventApprovalNote':
          'هذا يرسل طلبًا فقط. لا تتغير الملكية إلا بعد اعتماد العمليات وتنفيذ الطلب.',
      'equityCorporateEvents': 'أحداث الشركة',
      'equityEventsEmpty': 'لا توجد أحداث شركة مسجلة.',
      'equityDividends': 'التوزيعات',
      'equityDividendsEmpty': 'لا توجد توزيعات أرباح مسجلة.',
      'equityTransfers': 'نقل الأسهم',
      'equityTransfersEmpty': 'لا توجد تحويلات أسهم مسجلة.',
      'equityPosition': 'المركز',
      'equityContractualOwnership': 'الملكية التعاقدية',
      'equityCurrentOwnership': 'الملكية الحالية',
      'equityDilution': 'التخفيف',
      'equityInvestorShares': 'أسهم المستثمر',
      'equityTotalShares': 'إجمالي الأسهم المصدرة',
      'equityShareClass': 'فئة الأسهم',
      'equityPricePerShare': 'سعر السهم',
      'equityLedger': 'سجل الملكية',
      'equityOwnershipAsOf': 'الملكية في تاريخ',
      'equityDividendStatus': 'حالة التوزيع',
      'equityTotalDividend': 'إجمالي التوزيعات',
      'equityEntitlement': 'الاستحقاق',
      'equityEventType': 'نوع الحدث',
      'equitySplitNumerator': 'بسط التقسيم',
      'equitySplitDenominator': 'مقام التقسيم',
      'equitySharesIssued': 'عدد الأسهم المصدرة',
      'equityEventReason': 'السبب',
      'equityEffectiveDate': 'تاريخ السريان',
      'equitySubmitForApproval': 'إرسال لاعتماد العمليات',
      'equityActionFailed': 'تعذر إرسال الطلب. حاول مرة أخرى.',
      'equityClosure': 'سجل التخارج والإغلاق',
      'equityClosureUnavailable': 'لا يتوفر سجل إغلاق.',
      'equityFullyExitedAt': 'تاريخ اكتمال التخارج',
      'equityClosedAt': 'تاريخ الإغلاق',
      'equityConfirmedDistributions': 'التوزيعات المؤكدة',
      'investorShareCount': 'أسهم المستثمر',
      'totalIssuedShares': 'إجمالي الأسهم المصدرة',
      'shareClass': 'فئة الأسهم',
      'pricePerShare': 'سعر السهم',
      'preMoneyValuation': 'التقييم قبل الاستثمار',
      'postMoneyValuation': 'التقييم بعد الاستثمار',
      'effectiveOwnershipDate': 'تاريخ سريان الملكية',
      'sharesTerms': 'شروط الأسهم',
      'returnRate': 'العائد السنوي (%)',
      'termMonths': 'المدة (بالأشهر)',
      'repaymentModel': 'جدول السداد',
      'profitSharePercentage': 'نسبة المشاركة في الأرباح',
      'payoutFrequency': 'دورية التقارير',
      'exitTerms': 'شروط الخروج',
      'offerNote': 'ملاحظة للمستثمر (اختياري)',
      'sendOffer': 'مراجعة وإرسال',
      'offerSent': 'تم إرسال العرض إلى المستثمر.',
      'offerReplaced': 'تم إرسال العرض المقابل إلى المستثمر.',
      'offerSubmitFailed': 'تعذر إرسال العرض. راجع الشروط وحاول مرة أخرى.',
      'offerQuoteFailed': 'تعذر التحقق من تكلفة العرض. لم يتم إرسال أي عرض.',
      'insufficientOfferCredit': 'رصيدك لا يكفي لإرسال هذا العرض.',
      'offerCostConfirmation':
          'تكلفة إرسال هذا العرض {cost} رصيد. رصيدك الحالي {balance}. هل تريد الإرسال الآن؟',
      'invalidAmount': 'أدخل مبلغًا أكبر من صفر.',
      'invalidDate': 'أدخل تاريخًا صحيحًا بصيغة YYYY-MM-DD.',
      'none': 'بدون',
      'validationMaxLength': 'استخدم {maximum} حرفًا كحد أقصى.',
      'investor': 'المستثمر',
      'chatSubtitle': 'محادثاتك ومفاوضاتك مع المستثمرين.',
      'chatEmptyTitle': 'لا توجد محادثات بعد',
      'chatEmptyBody': 'ستظهر هنا طلبات المحادثة والمفاوضات النشطة.',
      'chatLoadFailed': 'تعذر تحميل المحادثات',
      'chatLoadFailedBody': 'تحقق من الاتصال وحاول مرة أخرى.',
      'incomingConversationRequests': 'طلبات بدء المحادثة',
      'conversations': 'المحادثات',
      'conversationRequests': 'طلبات المحادثة',
      'withdrawConversationRequest': 'سحب الطلب',
      'withdrawConversationRequestConfirm': 'هل تريد سحب طلب المحادثة المعلّق؟',
      'conversationRequestsLoadFailed': 'تعذر تحميل طلبات المحادثة الواردة.',
      'rejectConversationRequest': 'رفض طلب المحادثة',
      'acceptConversationRequest': 'قبول',
      'rejectConversationRequestConfirm':
          'هل تريد رفض هذا الطلب لبدء المحادثة؟',
      'conversationRequestAccepted': 'تم قبول طلب المحادثة.',
      'conversationRequestRejected': 'تم رفض طلب المحادثة.',
      'conversationRequestWithdrawn': 'تم سحب طلب المحادثة.',
      'conversationRequestActionFailed': 'تعذر تحديث الطلب. حاول مرة أخرى.',
      'readyToProceed': 'جاهز للمتابعة',
      'closeConversation': 'إغلاق المحادثة',
      'closeConversationConfirm':
          'هل تريد إغلاق هذه المحادثة؟ لن تتمكن من إرسال رسائل أو عروض بعدها.',
      'closeReasonOptional': 'السبب (اختياري)',
      'conversationClosed': 'هذه المحادثة مغلقة.',
      'conversationNotVisible': 'هذه المحادثة غير متاحة لهذا الحساب.',
      'conversationActionFailed': 'تعذر تحديث المحادثة. حاول مرة أخرى.',
      'founderReady': 'المؤسس جاهز',
      'investorReady': 'المستثمر جاهز',
      'projectRoomUnlocked': 'تم فتح غرفة المشروع',
      'canContinueNegotiation': 'يمكن للطرفين المتابعة',
      'yes': 'نعم',
      'no': 'لا',
      'dealDetails': 'تفاصيل الصفقة',
      'fundingLoadFailed': 'تعذر تحميل تفاصيل التمويل',
      'fundingPosition': 'موقف التمويل',
      'fundingCommitted': 'المبلغ المتفق عليه',
      'fundingDeclared': 'المبلغ المصرح به',
      'fundingAwaitingConfirmation': 'بانتظار تأكيد المستثمر',
      'fundingDisputed': 'محل نزاع',
      'fundingConfirmed': 'مؤكد',
      'fundingOutstanding': 'المتبقي',
      'fundsTransferredOutsideFopx':
          'يتم تحويل الأموال مباشرة بين الطرفين خارج فوبكس. هذا السجل يوثق تصريح المؤسس فقط.',
      'declareFundingReceived': 'تسجيل استلام أموال',
      'fundingDeclarations': 'تصريحات التمويل',
      'noFundingDeclarations': 'لا توجد تصريحات تمويل بعد',
      'noFundingDeclarationsBody':
          'سجّل التمويل بعد استلامه مباشرة من المستثمر فقط.',
      'fundingReceivedDate': 'تاريخ استلام الأموال',
      'fundingPaymentMethod': 'طريقة الدفع',
      'fundingExternalReference': 'المرجع الخارجي',
      'fundingAmount': 'المبلغ المستلم',
      'fundingEvidence': 'الإثبات',
      'fundingEvidenceAvailable': 'متاح',
      'fundingConfirmationNote': 'ملاحظة تأكيد المستثمر',
      'fundingDisputeReason': 'سبب اعتراض المستثمر',
      'fundingDeclarationFailed': 'تعذر حفظ تصريح التمويل. حاول مرة أخرى.',
      'profitSharingTitle': 'دورة مشاركة الأرباح',
      'profitSharingNoObligations':
          'لا يوجد التزام مشاركة أرباح نشط مرتبط بهذه الصفقة.',
      'profitSharingRate': 'نسبة المشاركة المقبولة',
      'profitSharingReporting': 'دورية التقارير',
      'profitSharingBasis': 'أساس الاحتساب',
      'profitSharingStatus': 'حالة الدورة',
      'profitSharingEntitlement': 'استحقاق المستثمر',
      'profitSharingConfirmed': 'التوزيعات المؤكدة',
      'profitSharingPending': 'بانتظار تأكيد المستثمر',
      'profitSharingOutstanding': 'التوزيع المتبقي',
      'profitSharingPeriod': 'فترة التقرير {number}',
      'profitSharingDeclareResult': 'تسجيل نتيجة الفترة',
      'profitSharingDeclaredBasis': 'المبلغ المصرح به لأساس الاحتساب',
      'profitSharingDeclaredResult': 'مبلغ النتيجة المصرح به',
      'profitSharingDistribution': 'سجل التوزيعات',
      'profitSharingDeclareDistribution': 'تسجيل توزيع',
      'profitSharingDeclarationFailed':
          'تعذر حفظ تصريح مشاركة الأرباح. حاول مرة أخرى.',
      'profitSharingResultHistory': 'تصريح المؤسس بالنتيجة',
      'profitSharingPeriodRange': '{start} – {end}',
      'profitSharingDownloadEvidence': 'تنزيل الإثبات',
      'profitSharingInvestorDecision': 'قرار المستثمر: {status}',
      'profitSharingCalculationError': 'ملاحظة الاحتساب: {message}',
      'profitSharingSettledAt': 'تاريخ التسوية',
      'profitSharingClosedAt': 'تاريخ الإغلاق',
      'profitSharingNotes': 'ملاحظات',
      'acceptedTermsLoadFailed':
          'تعذر تحميل شروط الصفقة. أعد المحاولة قبل تسجيل الأموال.',
      'allocateAcrossOfferLegs': 'وزّع هذا المبلغ على بنود العرض المقبول',
      'fundingLegAllocation': 'البند {number} · {type} المبلغ',
      'fundingLegUndeclaredCapacity': 'السعة المتبقية غير المصرح بها: {amount}',
      'fundingAllocationExceedsCapacity':
          'أدخل مبلغًا ضمن السعة المتبقية لهذا البند.',
      'fundingAllocationMustReconcile':
          'يجب أن يساوي مجموع توزيع البنود مبلغ التصريح تمامًا.',
      'loanLifecycle': 'دورة القرض',
      'principalOutstanding': 'أصل القرض المتبقي',
      'interestOutstanding': 'الفائدة المتبقية',
      'loanOutstanding': 'إجمالي المستحق',
      'confirmedRepaid': 'السداد المؤكد',
      'pendingRepaymentConfirmation': 'بانتظار تأكيد السداد',
      'repaymentDisputed': 'السداد محل اعتراض',
      'overdueAmount': 'المبلغ المتأخر',
      'nextPayment': 'الدفعة التالية',
      'maturityDate': 'تاريخ الاستحقاق النهائي',
      'defaultReason': 'سبب التعثر',
      'closureReason': 'سبب الإغلاق',
      'persistedLoanSchedule': 'جدول السداد المحفوظ',
      'persistedLoanScheduleUnavailable':
          'لم يوفّر الخادم جدول سداد محفوظًا بعد.',
      'installment': 'القسط',
      'installments': 'الأقساط',
      'loanRepaymentHistory': 'سجل السداد',
      'declareLoanRepayment': 'تسجيل دفعة سداد',
      'loanFundsTransferredOutsideFopx':
          'تُحوّل الدفعات مباشرة إلى المستثمر خارج فوبكس. هذا السجل يوثق تصريح المؤسس ليُراجعه المستثمر.',
      'repaymentAmount': 'المبلغ المدفوع',
      'externalPaymentDate': 'تاريخ الدفع الخارجي',
      'loanRepaymentMaximum': 'المبلغ المتاح للتسجيل: {amount}',
      'loanRepaymentDeclarationFailed': 'تعذر حفظ تصريح السداد. حاول مرة أخرى.',
      'notes': 'ملاحظات',
      'submit': 'إرسال التصريح',
      'chatNoMessages': 'لا توجد رسائل بعد',
      'chatNoMessagesBody': 'ابدأ المحادثة عندما تكون مستعدًا.',
      'chatMessageHint': 'اكتب رسالة',
      'chatSend': 'إرسال الرسالة',
      'chatSendFailed': 'تعذر إرسال الرسالة. حاول مرة أخرى.',
      'chatMessageRemoved': 'تم حذف هذه الرسالة.',
      'notificationsSubtitle': 'ابق قريباً من التغييرات المهمة.',
      'notificationsLoadFailed': 'تعذر تحميل الإشعارات',
      'notificationsLoadFailedBody': 'تحقق من الاتصال وحاول مرة أخرى.',
      'notificationsEmptyBody': 'ستظهر هنا مستجدات مشروعاتك ومحادثاتك.',
      'markAllRead': 'تحديد الكل كمقروء',
      'notificationUpdateFailed': 'تعذر تحديث الإشعار. حاول مرة أخرى.',
      'deleteNotification': 'حذف الإشعار',
      'loadMore': 'تحميل المزيد',
      'loadingMore': 'جارٍ التحميل…',
      'profileSubtitle': 'مساحة حسابك المشتركة في فوبكس.',
      'editProfile': 'تعديل الملف الشخصي',
      'firstName': 'الاسم الأول',
      'lastName': 'اسم العائلة',
      'mobile': 'رقم الهاتف المحمول',
      'profileUpdated': 'تم تحديث الملف الشخصي.',
      'profileUpdateFailed':
          'تعذر تحديث الملف الشخصي. راجع البيانات وحاول مرة أخرى.',
      'appearance': 'المظهر',
      'themeSystem': 'حسب الجهاز',
      'themeLight': 'فاتح',
      'themeDark': 'داكن',
      'trustRequirements': 'متطلبات مستوى الثقة التالي',
      'verificationHistory': 'سجل التحقق',
      'requirementMet': 'مكتمل',
      'requirementOpen': 'متبقٍ',
      'profileLoadFailed': 'تعذر تحميل بيانات الملف الشخصي',
      'profileLoadFailedBody': 'تحقق من الاتصال وحاول مرة أخرى.',
      'profileCompletion': 'اكتمال الملف الشخصي',
      'credibilityScore': 'درجة المصداقية',
      'profileScore': 'درجة الملف الشخصي',
      'accountSecurity': 'أمان الحساب',
      'changePassword': 'تغيير كلمة المرور',
      'changePasswordSubtitle': 'أكّد كلمة المرور الحالية والرمز المرسل إلى هاتفك المتحقق منه.',
      'verifyPhoneToChangePassword': 'تحقق من رقم هاتفك قبل تغيير كلمة المرور.',
      'currentPassword': 'كلمة المرور الحالية',
      'sendVerificationCode': 'إرسال رمز التحقق',
      'passwordCodeSent': 'تم إرسال رمز من ستة أرقام إلى هاتفك المتحقق منه.',
      'verificationCode': 'رمز التحقق',
      'newPassword': 'كلمة المرور الجديدة',
      'confirmNewPassword': 'تأكيد كلمة المرور الجديدة',
      'passwordsDoNotMatch': 'كلمتا المرور الجديدتان غير متطابقتين.',
      'passwordChangeComplete': 'تم تغيير كلمة المرور.',
      'passwordChangeFailed': 'تعذر تغيير كلمة المرور. تحقق من البيانات وحاول مرة أخرى.',
      'trustAndReputation': 'الثقة والسمعة',
      'trustLevel': 'مستوى الثقة',
      'reputationScore': 'درجة السمعة',
      'activityScore': 'درجة النشاط',
      'phoneVerified': 'الهاتف',
      'emailVerified': 'البريد الإلكتروني',
      'verified': 'تم التحقق',
      'pending': 'غير متحقق',
      'emptyTitle': 'بداية مدروسة',
      'emptyBody': 'هذه القاعدة جاهزة للطبقة التالية من المنتج.',
      'noNotifications': 'لا توجد إشعارات بعد',
      'noProfileData': 'ستظهر تفاصيل الملف الشخصي هنا عند توفرها.',
      'language': 'اللغة',
      'english': 'English',
      'arabic': 'العربية',
      'unreadNotifications': 'إشعارات غير مقروءة',
      'notificationsUnavailable': 'عدد الإشعارات غير متاح بعد.',
      'secureAccess': 'وصول آمن إلى مساحة عملك في فوبكس',
      'loginSubtitle': 'استخدم حساب فوبكس للمتابعة إلى مساحة المؤسس.',
      'emailHint': 'name@company.com',
      'phoneNumber': 'رقم الهاتف',
      'phoneNumberHint': '010 2232 2291',
      'countrySelector': 'الدولة ومفتاح الاتصال',
      'searchCountries': 'ابحث عن دولة',
      'invalidPhoneNumber': 'أدخل رقم هاتف صحيحاً.',
      'unsupportedCountry': 'هذه الدولة غير مدعومة حالياً.',
      'ambiguousCountry': 'اختر الدولة المطابقة قبل المتابعة.',
      'passwordHint': 'أدخل كلمة المرور',
      'requiredField': 'هذا الحقل مطلوب.',
      'continueLabel': 'متابعة',
      'retry': 'حاول مرة أخرى',
      'founderIdentity': 'مساحة المؤسس',
      'phaseZero': 'المرحلة صفر · التأسيس',
      'projectsContext': 'أدر الأعمال التي تبنيها على فوبكس.',
      'portfolioSummary': 'نبض المحفظة',
      'totalProjects': 'إجمالي المشاريع',
      'activeProjects': 'المشاريع النشطة',
      'activeOpportunities': 'الفرص النشطة',
      'homePortfolio': 'المحفظة',
      'homeCapitalPosition': 'الموقف التمويلي',
      'homeNeedsAttention': 'تحتاج إلى متابعة',
      'homePendingActions': 'عدد الإجراءات المعلّقة: {count}',
      'homeYourProjects': 'مشاريعك',
      'homeNoProjects': 'محفظتك جاهزة للبداية',
      'homeNoProjectsBody': 'ستظهر هنا المشاريع التي تملكها عند توفرها.',
      'homeCommitted': 'المبالغ الملتزم بها',
      'homeDeclared': 'المبالغ التي أعلنتها',
      'homeAwaitingConfirmation': 'بانتظار تأكيد المستثمر',
      'homeDisputed': 'محل نزاع',
      'homeConfirmed': 'أكدها المستثمرون',
      'homeOutstanding': 'المتبقي',
      'homeErrorTitle': 'نظرتك العامة غير متاحة حالياً',
      'homeErrorBody':
          'تعذر تحميل نظرتك كمؤسس. تحقق من الاتصال وحاول مرة أخرى.',
      'homeForbiddenTitle': 'الوصول إلى نظرة المؤسس مقيّد',
      'homeForbiddenBody':
          'حسابك غير مصرح له بعرض نظرة المؤسس. ما زالت جلستك نشطة.',
      'approximateValue': 'قيمة تقريبية',
      'projectOpportunityTotal': '{total} من الفرص',
      'projectCreate': 'إنشاء مشروع',
      'projectEdit': 'تعديل المشروع',
      'projectSaveChanges': 'حفظ التغييرات',
      'projectIdentitySection': 'هوية المشروع',
      'projectNarrativeSection': 'السياق التجاري',
      'projectRiskSection': 'سياق المخاطر',
      'projectName': 'اسم المشروع',
      'projectLegalName': 'الاسم القانوني',
      'projectLogoUrl': 'رابط شعار المشروع',
      'projectLogoChooseAction': 'اختيار صورة شعار المشروع',
      'projectLogoTooLarge': 'اختر صورة أصغر من 10 ميجابايت.',
      'projectLogoPickFailed': 'تعذر اختيار صورة شعار المشروع.',
      'projectLogoPartialFailure':
          'تم حفظ بيانات المشروع، لكن تعذر إرفاق الشعار. أعد المحاولة لإكمال الحفظ.',
      'projectStatusActions': 'إجراءات حالة المشروع',
      'projectArchiveConfirmTitle': 'أرشفة هذا المشروع؟',
      'projectArchiveConfirmBody':
          'لا يمكن التراجع عن الأرشفة. سيخرج المشروع من العمل النشط ولن يمكن تعديله أو إعادة فتحه. تابع فقط إذا كان هذا مقصوداً.',
      'projectArchiveReason': 'السبب (5 أحرف على الأقل)',
      'projectArchiveAction': 'أرشفة المشروع',
      'projectArchiveCancel': 'إلغاء',
      'projectStatusUpdateFailed': 'تعذر تحديث حالة المشروع. حاول مرة أخرى.',
      'projectSummary': 'نبذة مختصرة',
      'projectDescription': 'الوصف',
      'projectBusinessModel': 'نموذج العمل',
      'projectTeamDescription': 'الفريق',
      'projectRiskLevel': 'مستوى المخاطر',
      'projectRiskDisclosure': 'الإفصاح عن المخاطر',
      'projectFoundedDate': 'تاريخ التأسيس',
      'projectInvalidUrl': 'أدخل رابطاً صالحاً يبدأ بـ http:// أو https://.',
      'projectStageRequired': 'اختر مرحلة المشروع.',
      'notSpecified': 'غير محدد',
      'clearLabel': 'مسح',
      'projectSaveFailed': 'تعذر حفظ المشروع',
      'projectSaveFailedBody': 'راجع البيانات المدخلة وحاول مرة أخرى.',
      'projectMinimumCharacters': 'أدخل {minimum} أحرف على الأقل.',
      'projectsEmptyTitle': 'ابدأ بمشروعك الأول',
      'projectsEmptyBody':
          'تمنح المشاريع فرصك القادمة سياقاً تجارياً واضحاً. ستتشكل محفظتك هنا عند توفر إنشاء المشاريع.',
      'projectsErrorTitle': 'المشاريع غير متاحة حالياً',
      'projectsErrorBody':
          'تعذر تحميل محفظة المؤسس. تحقق من الاتصال وحاول مرة أخرى.',
      'projectsForbiddenTitle': 'الوصول إلى المشاريع مقيّد',
      'projectsForbiddenBody':
          'حسابك غير مصرح له بعرض محفظة المؤسس. ما زالت جلستك نشطة.',
      'projectContextUnavailable': 'سيظهر السياق التجاري عند توفره.',
      'updated': 'آخر تحديث',
      'activity': 'نشاط الفرص',
      'opportunityCount': '{active} نشطة · {total} إجمالي الفرص',
      'noActiveOpportunities': 'لا توجد فرص نشطة',
      'oneActiveOpportunity': 'فرصة نشطة واحدة',
      'activeOpportunitiesSummary': '{active} فرص نشطة',
      'projectSemanticLabel':
          '{name}. الحالة {status}. {active} فرص نشطة من أصل {total}.',
      'stageIdea': 'فكرة',
      'stageMvp': 'نموذج أولي',
      'stageStartup': 'شركة ناشئة',
      'stageScaling': 'توسع',
      'stageEstablished': 'راسخة',
      'stageOther': 'أخرى',
      'stageLabel': 'المرحلة',
      'industryLabel': 'الصناعة',
      'categoryLabel': 'الفئة',
      'businessProfile': 'ملف العمل',
      'aboutProject': 'عن المشروع',
      'opportunities': 'الفرص',
      'projectInformation': 'معلومات المشروع',
      'founded': 'التأسيس',
      'location': 'الموقع',
      'website': 'الموقع الإلكتروني',
      'created': 'تاريخ الإنشاء',
      'lastUpdated': 'آخر تحديث',
      'noOpportunitiesTitle': 'لا توجد فرص بعد',
      'noOpportunitiesBody': 'ستظهر فرص الاستثمار التي تُنشأ لهذا المشروع هنا.',
      'projectOverviewErrorTitle': 'تعذر عرض المشروع حالياً',
      'projectOverviewErrorBody':
          'تعذر تحميل هذا المشروع. تحقق من الاتصال وحاول مرة أخرى.',
      'projectOverviewNotFoundTitle': 'المشروع غير موجود',
      'projectOverviewNotFoundBody':
          'لم يعد هذا المشروع متاحاً في مساحة المؤسس الخاصة بك.',
      'projectOverviewForbiddenTitle': 'الوصول إلى المشروع مقيّد',
      'projectOverviewForbiddenBody': 'حسابك غير مصرح له بعرض هذا المشروع.',
      'latestOpportunity': 'أحدث فرصة',
      'viewOpportunity': 'عرض الفرصة',
      'viewAllOpportunities': 'عرض جميع الفرص',
      'viewPastOpportunities': 'الفرص السابقة',
      'currentRecent': 'الحالية والحديثة',
      'pastOpportunities': 'الفرص السابقة',
      'noPastOpportunities': 'لا توجد فرص سابقة لهذا المشروع.',
      'projectRoom': 'مساحة المشروع',
      'projectRoomDescription': 'مساحة العمل لنشاط الاستثمار في المشروع.',
      'openProjectRoom': 'فتح مساحة المشروع',
      'roomUnavailable': 'مساحة المشروع غير متاحة لهذا الحساب حالياً.',
      'roomOverview': 'نظرة عامة',
      'roomUpdates': 'التحديثات',
      'roomMilestones': 'المعالم',
      'roomTimeline': 'النشاط',
      'addRoomUpdate': 'إضافة تحديث',
      'addRoomMilestone': 'إضافة معلم',
      'roomEntryTitle': 'العنوان',
      'roomEntryDescription': 'الوصف (اختياري)',
      'roomDueDate': 'تاريخ الاستحقاق',
      'investorVisible': 'مرئي للمستثمرين',
      'markMilestoneComplete': 'تحديد كمكتمل',
      'milestoneCompleteConfirm': 'هل تريد تحديد هذا المعلم كمكتمل؟',
      'roomEntrySaved': 'تمت إضافة العنصر إلى مساحة المشروع.',
      'roomEntrySaveFailed': 'تعذر حفظ العنصر في مساحة المشروع.',
      'milestoneCompleted': 'تم تحديد المعلم كمكتمل.',
      'milestoneUpdateFailed': 'تعذر تحديث المعلم.',
      'roomDocuments': 'المستندات',
      'addRoomDocument': 'إضافة مستند',
      'roomDocumentPurpose': 'الغرض من المستند',
      'roomDocumentCategory': 'فئة الملف',
      'roomDocumentVisibility': 'مستوى الظهور',
      'roomDocumentMembers': 'أعضاء المشروع',
      'roomDocumentFounderOnly': 'المؤسس فقط',
      'roomDocumentUpload': 'رفع المستند',
      'roomDocumentUploaded': 'تم رفع المستند إلى مساحة المشروع.',
      'roomDocumentSizeInvalid': 'اختر ملفاً مدعوماً لا يتجاوز 25 ميجابايت.',
      'roomDocumentUploadFailed': 'تعذر رفع المستند.',
      'roomDocumentDownloaded': 'تم حفظ المستند على جهازك.',
      'roomDocumentDownloadFailed': 'تعذر تنزيل المستند.',
      'roomDocumentPreview': 'معاينة',
      'roomDocumentDownload': 'تنزيل',
      'roomDocumentPreviewUnsupported':
          'المعاينة غير متاحة لهذا النوع من الملفات. نزّل المستند لفتحه.',
      'projectEventOpportunityCreated': 'تم إنشاء فرصة',
      'projectEventMilestoneCreated': 'تمت إضافة معلم',
      'projectEventMilestoneCompleted': 'اكتمل المعلم',
      'projectEventMilestoneDelayed': 'تأخر المعلم',
      'projectEventMilestoneUpdated': 'تم تحديث المعلم',
      'projectEventDocumentPublished': 'تم نشر مستند للمشروع',
      'projectEventContractActivated': 'تم تفعيل عقد الاستثمار',
      'projectEventParticipationApproved': 'تمت الموافقة على المشاركة',
      'projectEventFundingProgress': 'تم تحديث تقدم التمويل',
      'projectEventProjectStatus': 'تم تغيير حالة المشروع',
      'projectEventFundingCompleted': 'اكتمل التمويل',
      'noRoomContent': 'لا يوجد نشاط في مساحة المشروع لعرضه بعد.',
      'opportunityContext': 'سياق الفرصة',
      'publicTerms': 'الشروط المعلنة',
      'useOfFunds': 'استخدام التمويل',
      'expectedReturn': 'العائد المتوقع',
      'fundingTarget': 'المبلغ المستهدف',
      'minimumParticipation': 'الحد الأدنى للمشاركة',
      'maximumParticipation': 'الحد الأقصى للمشاركة',
      'expectedDuration': 'المدة المتوقعة',
      'fundingWindow': 'فترة التمويل',
      'unavailable': 'غير متاح',
      'opportunityStatusDraft': 'مسودة',
      'opportunityStatusUnderReview': 'قيد المراجعة',
      'opportunityStatusRejected': 'مرفوضة',
      'opportunityStatusApproved': 'معتمدة',
      'opportunityStatusPublished': 'منشورة',
      'opportunityStatusFunding': 'تمويل',
      'opportunityStatusFullyFunded': 'مُمولة بالكامل',
      'opportunityStatusInProgress': 'قيد التنفيذ',
      'opportunityStatusCompleted': 'مكتملة',
      'opportunityStatusArchived': 'مؤرشفة',
      'statusDraft': 'مسودة',
      'statusActive': 'نشط',
      'statusPaused': 'متوقف مؤقتاً',
      'statusCompleted': 'مكتمل',
      'statusArchived': 'مؤرشف',
    },
  };
}

class FopxLocalizationsDelegate
    extends LocalizationsDelegate<FopxLocalizations> {
  const FopxLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'ar'].contains(locale.languageCode);

  @override
  Future<FopxLocalizations> load(Locale locale) async =>
      FopxLocalizations(locale);

  @override
  bool shouldReload(FopxLocalizationsDelegate old) => false;
}

extension FopxLocalizationsX on BuildContext {
  FopxLocalizations get l10n =>
      Localizations.of<FopxLocalizations>(this, FopxLocalizations) ??
      const FopxLocalizations(Locale('en'));
}
