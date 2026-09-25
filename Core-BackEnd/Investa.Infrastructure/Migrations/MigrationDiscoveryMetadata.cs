using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Investa.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext)), Migration("20260608231203_InitialCreate")]
public partial class InitialCreate;
[DbContext(typeof(ApplicationDbContext)), Migration("20260611232122_AddInvestmentViewsAndLearnMores")]
public partial class AddInvestmentViewsAndLearnMores;
[DbContext(typeof(ApplicationDbContext)), Migration("20260614181417_UpdateInvestmentParticipantStatusDefaultToInterested")]
public partial class UpdateInvestmentParticipantStatusDefaultToInterested;
[DbContext(typeof(ApplicationDbContext)), Migration("20260614235959_AddRequestMetadataToInvestmentRequests")]
public partial class AddRequestMetadataToInvestmentRequests;
[DbContext(typeof(ApplicationDbContext)), Migration("20260621163643_AddBusinessMessage")]
public partial class AddBusinessMessage;
[DbContext(typeof(ApplicationDbContext)), Migration("20260621184312_AddConversationIdToInvestmentRequest")]
public partial class AddConversationIdToInvestmentRequest;
[DbContext(typeof(ApplicationDbContext)), Migration("20260621191446_IncreaseUserMobileColumnSize")]
public partial class IncreaseUserMobileColumnSize;
[DbContext(typeof(ApplicationDbContext)), Migration("20260628230653_AddReputationTables")]
public partial class AddReputationTables;
[DbContext(typeof(ApplicationDbContext)), Migration("20260628233006_ResyncSnapshot")]
public partial class ResyncSnapshot;
[DbContext(typeof(ApplicationDbContext)), Migration("20260630095929_AddPricingEngine")]
public partial class AddPricingEngine;
[DbContext(typeof(ApplicationDbContext)), Migration("20260630104126_AddOpportunityFoundation")]
public partial class AddOpportunityFoundation;
[DbContext(typeof(ApplicationDbContext)), Migration("20260630114558_AddOpportunityClassificationMetadata")]
public partial class AddOpportunityClassificationMetadata;
[DbContext(typeof(ApplicationDbContext)), Migration("20260630122418_AddOpportunityFileStoreMetadata")]
public partial class AddOpportunityFileStoreMetadata;
[DbContext(typeof(ApplicationDbContext)), Migration("20260630125454_ResyncAuthUserReputationLevel")]
public partial class ResyncAuthUserReputationLevel;
[DbContext(typeof(ApplicationDbContext)), Migration("20260630221240_AddOpportunityJoinRequests")]
public partial class AddOpportunityJoinRequests;
[DbContext(typeof(ApplicationDbContext)), Migration("20260630230418_AddOpportunityJoinRequestDetails")]
public partial class AddOpportunityJoinRequestDetails;
[DbContext(typeof(ApplicationDbContext)), Migration("20260701143941_AddOpportunityMediaVisibility")]
public partial class AddOpportunityMediaVisibility;
[DbContext(typeof(ApplicationDbContext)), Migration("20260701150458_AddOpportunityFilePurposeAndCreator")]
public partial class AddOpportunityFilePurposeAndCreator;
[DbContext(typeof(ApplicationDbContext)), Migration("20260701154101_AddInvestmentOpportunityCompatibilityLink")]
public partial class AddInvestmentOpportunityCompatibilityLink;
[DbContext(typeof(ApplicationDbContext)), Migration("20260702144117_PersistOpportunityCreationFields")]
public partial class PersistOpportunityCreationFields;
[DbContext(typeof(ApplicationDbContext)), Migration("20260703100220_AddNegotiationWorkflow")]
public partial class AddNegotiationWorkflow;
[DbContext(typeof(ApplicationDbContext)), Migration("20260705111611_AddConversationRequests")]
public partial class AddConversationRequests;
[DbContext(typeof(ApplicationDbContext)), Migration("20260708120000_AddConversationCloseMetadata")]
public partial class AddConversationCloseMetadata;
[DbContext(typeof(ApplicationDbContext)), Migration("20260708123000_AddNegotiationOffers")]
public partial class AddNegotiationOffers;
[DbContext(typeof(ApplicationDbContext)), Migration("20260709120000_AddPaidActionPricingRules")]
public partial class AddPaidActionPricingRules;
[DbContext(typeof(ApplicationDbContext)), Migration("20260711120000_AddActivityBasedReputationEngine")]
public partial class AddActivityBasedReputationEngine;
[DbContext(typeof(ApplicationDbContext)), Migration("20260712101459_AddElectronicInvestmentContracts")]
public partial class AddElectronicInvestmentContracts;
[DbContext(typeof(ApplicationDbContext)), Migration("20260712103223_AddInvestmentContractPdfMetadata")]
public partial class AddInvestmentContractPdfMetadata;
[DbContext(typeof(ApplicationDbContext)), Migration("20260712114108_AddOpportunityProfitSharingTerms")]
public partial class AddOpportunityProfitSharingTerms;
[DbContext(typeof(ApplicationDbContext)), Migration("20260712191907_StabilizeOpportunityLoanSchema")]
public partial class StabilizeOpportunityLoanSchema;
[DbContext(typeof(ApplicationDbContext)), Migration("20260713100914_AddOpportunityEquityTerms")]
public partial class AddOpportunityEquityTerms;
[DbContext(typeof(ApplicationDbContext)), Migration("20260716114832_AddCompanyFinancePhase1BCorrected")]
public partial class AddCompanyFinancePhase1BCorrected;
[DbContext(typeof(ApplicationDbContext)), Migration("20260716131900_AddSupplierContractAndAutoCode")]
public partial class AddSupplierContractAndAutoCode;
[DbContext(typeof(ApplicationDbContext)), Migration("20260716151847_ExtendMoneyInBackendContract")]
public partial class ExtendMoneyInBackendContract;
[DbContext(typeof(ApplicationDbContext)), Migration("20260717022136_ExtendRoleLocalizedContract")]
public partial class ExtendRoleLocalizedContract;
[DbContext(typeof(ApplicationDbContext)), Migration("20260717112733_AddFinanceReconciliation")]
public partial class AddFinanceReconciliation;
[DbContext(typeof(ApplicationDbContext)), Migration("20260719143000_CompleteCreditPurchaseLifecycle")]
public partial class CompleteCreditPurchaseLifecycle;
