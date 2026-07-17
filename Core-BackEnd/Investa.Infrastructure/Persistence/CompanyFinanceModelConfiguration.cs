using Investa.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Persistence;

public partial class ApplicationDbContext
{
    private static void ConfigureCompanyFinance(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FinanceAccount>(b =>
        {
            b.ToTable("FinanceAccounts"); b.HasIndex(x => x.Code).IsUnique();
            b.Property(x => x.CurrentBalance).HasPrecision(19, 4);
        });
        modelBuilder.Entity<Supplier>(b =>
        {
            b.ToTable("Suppliers");
            b.HasIndex(x => x.SupplierCode).IsUnique();
            b.Property(x => x.SupplierCode).HasMaxLength(50).IsRequired();
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.ServiceCategory).HasMaxLength(100).IsRequired();
            b.Property(x => x.LegalName).HasMaxLength(200);
            b.Property(x => x.Country).HasMaxLength(100);
            b.Property(x => x.PaymentDetails).HasMaxLength(500);
            b.Property(x => x.Notes).HasMaxLength(1000);
        });
        modelBuilder.Entity<IncomeCategory>(b =>
        {
            b.ToTable("IncomeCategories"); b.HasIndex(x => x.Code).IsUnique();
            b.Property(x => x.NameEn).HasMaxLength(200);
            b.Property(x => x.NameAr).HasMaxLength(200);
            b.HasData(new IncomeCategory { Id = 1, Code = "INC-OTHER", Name = "Other Operating Income", NameEn = "Other Operating Income", Description = "Default company operating income category", IsActive = true, SortOrder = 999, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) });
        });
        modelBuilder.Entity<ExpenseCategory>(b =>
        {
            b.ToTable("ExpenseCategories"); b.HasIndex(x => x.Code).IsUnique();
            b.HasData(new ExpenseCategory { Id = 1, Code = "EXP-OTHER", Name = "Other Operating Expense", Description = "Default company operating expense category", IsActive = true, SortOrder = 999, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) });
        });
        modelBuilder.Entity<FinanceTransaction>(b =>
        {
            b.ToTable("FinanceTransactions"); b.HasIndex(x => x.ReferenceNumber).IsUnique(); b.HasIndex(x => new { x.Status, x.TransactionDate }); b.HasIndex(x => x.MakerId);
            b.Property(x => x.Amount).HasPrecision(19, 4); b.Property(x => x.AmountInBaseCurrency).HasPrecision(19, 4); b.Property(x => x.ExchangeRate).HasPrecision(19, 8); b.Property(x => x.RowVersion).IsRowVersion();
            b.Property(x => x.SourceName).HasMaxLength(200);
            b.Property(x => x.PaymentMethod).HasMaxLength(100);
            b.Property(x => x.PaymentGatewayFee).HasPrecision(19, 4);
            b.Property(x => x.NetAmountReceived).HasPrecision(19, 4);
            b.HasOne(x => x.SourceAccount).WithMany().HasForeignKey(x => x.SourceAccountId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.DestinationAccount).WithMany().HasForeignKey(x => x.DestinationAccountId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.IncomeCategory).WithMany(x => x.Transactions).HasForeignKey(x => x.IncomeCategoryId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.ExpenseCategory).WithMany(x => x.Transactions).HasForeignKey(x => x.ExpenseCategoryId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Supplier).WithMany(x => x.Transactions).HasForeignKey(x => x.SupplierId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne<FinanceTransaction>().WithMany().HasForeignKey(x => x.ReversalOfTransactionId).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<FinanceTransactionLine>(b => { b.ToTable("FinanceTransactionLines"); b.Property(x => x.DebitAmount).HasPrecision(19, 4); b.Property(x => x.CreditAmount).HasPrecision(19, 4); b.HasIndex(x => new { x.TransactionId, x.LineSequence }).IsUnique(); b.HasOne(x => x.Transaction).WithMany(x => x.TransactionLines).HasForeignKey(x => x.TransactionId).OnDelete(DeleteBehavior.Restrict); });
        modelBuilder.Entity<FinanceAttachment>(b => { b.ToTable("FinanceAttachments"); b.HasIndex(x => x.TransactionId); b.HasOne(x => x.Transaction).WithMany(x => x.Attachments).HasForeignKey(x => x.TransactionId).OnDelete(DeleteBehavior.Restrict); });
        modelBuilder.Entity<FinanceAuditEvent>(b => { b.ToTable("FinanceAuditEvents"); b.HasIndex(x => new { x.TransactionId, x.CreatedAt }); b.HasOne(x => x.Transaction).WithMany(x => x.AuditEvents).HasForeignKey(x => x.TransactionId).OnDelete(DeleteBehavior.Restrict); });
        modelBuilder.Entity<FinanceReconciliation>(b =>
        {
            b.ToTable("FinanceReconciliations");
            b.Property(x => x.OpeningBalance).HasPrecision(19, 4);
            b.Property(x => x.PeriodActivity).HasPrecision(19, 4);
            b.Property(x => x.SystemCalculatedBalance).HasPrecision(19, 4);
            b.Property(x => x.ActualStatementBalance).HasPrecision(19, 4);
            b.Property(x => x.Difference).HasPrecision(19, 4);
            b.HasIndex(x => new { x.FinanceAccountId, x.PeriodEndDate });
            b.HasOne(x => x.FinanceAccount).WithMany().HasForeignKey(x => x.FinanceAccountId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
