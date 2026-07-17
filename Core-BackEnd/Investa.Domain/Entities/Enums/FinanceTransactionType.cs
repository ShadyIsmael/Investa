namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Types of finance transactions for company operating finance.
/// Company finance only - no investor/project/opportunity money.
/// </summary>
public enum FinanceTransactionType
{
    /// <summary>Money received from sales, services, or other income sources</summary>
    MoneyIn = 1,

    /// <summary>Expense payment to suppliers or contractors</summary>
    MoneyOut = 2,

    /// <summary>Founder paid an expense on behalf of the company</summary>
    FounderPaid = 3,

    /// <summary>Company reimburses founder for prior expenses</summary>
    FounderReimbursement = 4,

    /// <summary>Transfer between company accounts (must use different accounts)</summary>
    InternalTransfer = 5,

    /// <summary>Cash advance to employee or vendor</summary>
    CashAdvance = 6,

    /// <summary>Refund issued to supplier</summary>
    SupplierRefund = 7,

    /// <summary>Purchase of assets (fixed or otherwise)</summary>
    AssetPurchase = 8
}
