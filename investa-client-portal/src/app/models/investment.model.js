/**
 * Risk level for investments
 */
export var RiskLevel;
(function (RiskLevel) {
    RiskLevel["Low"] = "Low";
    RiskLevel["Medium"] = "Medium";
    RiskLevel["High"] = "High";
})(RiskLevel || (RiskLevel = {}));
/**
 * Investment type enumeration - matches backend InvestmentType enum
 * Supports Founding, Equity, Revenue Sharing, and Loan/Debt
 */
export var MediaType;
(function (MediaType) {
    MediaType[MediaType["CoverImage"] = 0] = "CoverImage";
    MediaType[MediaType["Image"] = 1] = "Image";
    MediaType[MediaType["Video"] = 2] = "Video";
})(MediaType || (MediaType = {}));
export var InvestmentType;
(function (InvestmentType) {
    InvestmentType[InvestmentType["Founding"] = 1] = "Founding";
    InvestmentType[InvestmentType["Equity"] = 2] = "Equity";
    InvestmentType[InvestmentType["RevenueSharing"] = 3] = "RevenueSharing";
    InvestmentType[InvestmentType["Loan"] = 4] = "Loan";
})(InvestmentType || (InvestmentType = {}));
/**
 * Equity exit strategy types
 */
export var EquityExitType;
(function (EquityExitType) {
    EquityExitType[EquityExitType["Acquisition"] = 1] = "Acquisition";
    EquityExitType[EquityExitType["StrategicBuyout"] = 2] = "StrategicBuyout";
    EquityExitType[EquityExitType["SecondaryShareSale"] = 3] = "SecondaryShareSale";
    EquityExitType[EquityExitType["IPO"] = 4] = "IPO";
    EquityExitType[EquityExitType["FounderBuyback"] = 5] = "FounderBuyback";
    EquityExitType[EquityExitType["Undetermined"] = 6] = "Undetermined";
})(EquityExitType || (EquityExitType = {}));
/**
 * Equity investment status lifecycle
 */
export var EquityInvestmentStatus;
(function (EquityInvestmentStatus) {
    EquityInvestmentStatus[EquityInvestmentStatus["Draft"] = 0] = "Draft";
    EquityInvestmentStatus[EquityInvestmentStatus["Active"] = 1] = "Active";
    EquityInvestmentStatus[EquityInvestmentStatus["Funded"] = 2] = "Funded";
    EquityInvestmentStatus[EquityInvestmentStatus["Scaling"] = 3] = "Scaling";
    EquityInvestmentStatus[EquityInvestmentStatus["Exited"] = 4] = "Exited";
    EquityInvestmentStatus[EquityInvestmentStatus["Acquired"] = 5] = "Acquired";
    EquityInvestmentStatus[EquityInvestmentStatus["Closed"] = 6] = "Closed";
})(EquityInvestmentStatus || (EquityInvestmentStatus = {}));
/**
 * Revenue sharing investment status lifecycle
 */
export var RevenueSharingInvestmentStatus;
(function (RevenueSharingInvestmentStatus) {
    RevenueSharingInvestmentStatus[RevenueSharingInvestmentStatus["Draft"] = 0] = "Draft";
    RevenueSharingInvestmentStatus[RevenueSharingInvestmentStatus["Active"] = 1] = "Active";
    RevenueSharingInvestmentStatus[RevenueSharingInvestmentStatus["RevenueDistribution"] = 2] = "RevenueDistribution";
    RevenueSharingInvestmentStatus[RevenueSharingInvestmentStatus["Completed"] = 3] = "Completed";
    RevenueSharingInvestmentStatus[RevenueSharingInvestmentStatus["Expired"] = 4] = "Expired";
    RevenueSharingInvestmentStatus[RevenueSharingInvestmentStatus["Closed"] = 5] = "Closed";
})(RevenueSharingInvestmentStatus || (RevenueSharingInvestmentStatus = {}));
/**
 * Loan investment status lifecycle
 */
export var LoanInvestmentStatus;
(function (LoanInvestmentStatus) {
    LoanInvestmentStatus[LoanInvestmentStatus["Draft"] = 0] = "Draft";
    LoanInvestmentStatus[LoanInvestmentStatus["Active"] = 1] = "Active";
    LoanInvestmentStatus[LoanInvestmentStatus["Repayment"] = 2] = "Repayment";
    LoanInvestmentStatus[LoanInvestmentStatus["Completed"] = 3] = "Completed";
    LoanInvestmentStatus[LoanInvestmentStatus["Defaulted"] = 4] = "Defaulted";
    LoanInvestmentStatus[LoanInvestmentStatus["Closed"] = 5] = "Closed";
})(LoanInvestmentStatus || (LoanInvestmentStatus = {}));
/**
 * Helper to get display name for investment type
 */
export function getInvestmentTypeDisplay(type) {
    if (type === undefined || type === null)
        return 'Unknown';
    switch (type) {
        case InvestmentType.Founding:
            return 'Profit Sharing';
        case InvestmentType.Equity:
            return 'Equity';
        case InvestmentType.RevenueSharing:
            return 'Profit Sharing';
        case InvestmentType.Loan:
            return 'Loan';
        default:
            return 'Unknown';
    }
}
/**
 * Helper to get investment type badge color classes
 */
export function getInvestmentTypeBadgeClass(type) {
    switch (type) {
        case InvestmentType.Founding:
            return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        case InvestmentType.Equity:
            return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case InvestmentType.RevenueSharing:
            return 'bg-green-500/20 text-green-300 border-green-500/30';
        case InvestmentType.Loan:
            return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
        default:
            return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
}
/**
 * Helper to get display name for equity exit type
 */
export function getEquityExitTypeDisplay(type) {
    if (type === undefined || type === null)
        return 'Undetermined';
    switch (type) {
        case EquityExitType.Acquisition:
            return 'Acquisition';
        case EquityExitType.StrategicBuyout:
            return 'Strategic Buyout';
        case EquityExitType.SecondaryShareSale:
            return 'Secondary Share Sale';
        case EquityExitType.IPO:
            return 'IPO';
        case EquityExitType.FounderBuyback:
            return 'Founder Buyback';
        case EquityExitType.Undetermined:
        default:
            return 'Undetermined';
    }
}
/**
 * Investment status lifecycle - matches backend
 * All investment types share these statuses
 */
export var InvestmentStatus;
(function (InvestmentStatus) {
    InvestmentStatus["Draft"] = "Draft";
    InvestmentStatus["Active"] = "Active";
    InvestmentStatus["ReviewingParticipants"] = "Reviewing Participants";
    InvestmentStatus["InProgress"] = "In Progress";
    InvestmentStatus["FullyFunded"] = "Fully Funded";
    InvestmentStatus["Paused"] = "Paused";
    InvestmentStatus["Completed"] = "Completed";
    InvestmentStatus["Archived"] = "Archived";
})(InvestmentStatus || (InvestmentStatus = {}));
