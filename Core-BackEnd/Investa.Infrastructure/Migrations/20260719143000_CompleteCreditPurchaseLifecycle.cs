using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations;

public partial class CompleteCreditPurchaseLifecycle : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTime>("ActiveFrom", "CreditPlans", nullable: true);
        migrationBuilder.AddColumn<DateTime>("ActiveUntil", "CreditPlans", nullable: true);
        migrationBuilder.AddColumn<int>("BonusCredits", "CreditPlans", nullable: false, defaultValue: 0);
        migrationBuilder.AddColumn<string>("Code", "CreditPlans", maxLength: 50, nullable: false, defaultValue: "");
        migrationBuilder.AddColumn<string>("Currency", "CreditPlans", maxLength: 3, nullable: false, defaultValue: "EGP");
        migrationBuilder.AddColumn<int>("DisplayOrder", "CreditPlans", nullable: false, defaultValue: 0);
        migrationBuilder.AddColumn<bool>("IsFeatured", "CreditPlans", nullable: false, defaultValue: false);
        migrationBuilder.AddColumn<string>("NameAr", "CreditPlans", maxLength: 100, nullable: false, defaultValue: "");

        migrationBuilder.AddColumn<int>("BonusCredits", "CreditPlanPurchases", nullable: false, defaultValue: 0);
        migrationBuilder.AddColumn<DateTime>("CreatedAt", "CreditPlanPurchases", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP");
        migrationBuilder.AddColumn<string>("Currency", "CreditPlanPurchases", maxLength: 3, nullable: false, defaultValue: "EGP");
        migrationBuilder.AddColumn<DateTime>("PaidAt", "CreditPlanPurchases", nullable: true);
        migrationBuilder.AddColumn<int>("PaymentStatus", "CreditPlanPurchases", nullable: false, defaultValue: 0);
        migrationBuilder.AddColumn<string>("PaymentProvider", "CreditPlanPurchases", maxLength: 100, nullable: true);
        migrationBuilder.AddColumn<string>("PlanCode", "CreditPlanPurchases", maxLength: 50, nullable: false, defaultValue: "");
        migrationBuilder.AddColumn<string>("PlanNameAr", "CreditPlanPurchases", maxLength: 100, nullable: false, defaultValue: "");
        migrationBuilder.AddColumn<string>("ProviderReference", "CreditPlanPurchases", maxLength: 200, nullable: true);
        migrationBuilder.AddColumn<DateTime>("UpdatedAt", "CreditPlanPurchases", nullable: true);
        migrationBuilder.AddColumn<Guid>("WalletTransactionId", "CreditPlanPurchases", nullable: true);
        migrationBuilder.AlterColumn<string>("ReferenceNumber", "CreditPlanPurchases", maxLength: 50, nullable: false, oldClrType: typeof(string), oldType: "character varying(30)", oldMaxLength: 30);
        migrationBuilder.CreateIndex("IX_CreditPlanPurchases_ProviderReference", "CreditPlanPurchases", "ProviderReference", unique: true, filter: "\"ProviderReference\" IS NOT NULL");
        migrationBuilder.CreateIndex("IX_CreditPlanPurchases_WalletTransactionId", "CreditPlanPurchases", "WalletTransactionId", unique: true, filter: "\"WalletTransactionId\" IS NOT NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex("IX_CreditPlanPurchases_ProviderReference", "CreditPlanPurchases");
        migrationBuilder.DropIndex("IX_CreditPlanPurchases_WalletTransactionId", "CreditPlanPurchases");
        foreach (var column in new[] { "ActiveFrom", "ActiveUntil", "BonusCredits", "Code", "Currency", "DisplayOrder", "IsFeatured", "NameAr" })
            migrationBuilder.DropColumn(column, "CreditPlans");
        foreach (var column in new[] { "BonusCredits", "CreatedAt", "Currency", "PaidAt", "PaymentStatus", "PaymentProvider", "PlanCode", "PlanNameAr", "ProviderReference", "UpdatedAt", "WalletTransactionId" })
            migrationBuilder.DropColumn(column, "CreditPlanPurchases");
        migrationBuilder.AlterColumn<string>("ReferenceNumber", "CreditPlanPurchases", type: "character varying(30)", maxLength: 30, nullable: false, oldClrType: typeof(string), oldMaxLength: 50);
    }
}
