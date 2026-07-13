namespace Investa.Domain.Entities.Enums;

public enum InvestmentContractStatus { Active = 0, Terminated = 1 }
public enum InvestmentContractVersionType { InitialAgreement = 0, AdditionalInvestment = 1, AdditionalSharePurchase = 2, TermsAmendment = 3, LoanRestructuring = 4, ProfitSharingAmendment = 5, Extension = 6, PartialExit = 7, Termination = 8 }
public enum InvestmentContractVersionStatus { Active = 0, Superseded = 1, Terminated = 2, Cancelled = 3 }
public enum ContractEventType { Generated = 0, Activated = 1, Superseded = 2, Viewed = 3, Downloaded = 4, Terminated = 5 }
public enum PdfGenerationStatus { NotGenerated = 0, Generating = 1, Ready = 2, Failed = 3 }
