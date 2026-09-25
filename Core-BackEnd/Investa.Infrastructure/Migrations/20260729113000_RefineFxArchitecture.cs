using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations;

 [DbContext(typeof(ApplicationDbContext))]
 [Migration("20260729113000_RefineFxArchitecture")]
public partial class RefineFxArchitecture : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "ExchangeRate", table: "OpportunityJoinRequests");
        migrationBuilder.DropColumn(name: "ExchangeRateProvider", table: "OpportunityJoinRequests");
        migrationBuilder.DropColumn(name: "ExchangeRateTimestamp", table: "OpportunityJoinRequests");

        migrationBuilder.CreateTable(
            name: "Currencies",
            columns: table => new
            {
                ISOCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                EnglishName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                ArabicName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Symbol = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                DecimalDigits = table.Column<int>(type: "int", nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false),
                SupportsFunding = table.Column<bool>(type: "bit", nullable: false),
                SupportsSettlement = table.Column<bool>(type: "bit", nullable: false),
                SupportsWallet = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Currencies", x => x.ISOCode));

        migrationBuilder.InsertData(
            table: "Currencies",
            columns: new[] { "ISOCode", "ArabicName", "DecimalDigits", "EnglishName", "IsActive", "SupportsFunding", "SupportsSettlement", "SupportsWallet", "Symbol" },
            columnTypes: new[] { "nvarchar(3)", "nvarchar(100)", "int", "nvarchar(100)", "bit", "bit", "bit", "bit", "nvarchar(10)" },
            values: new object[,]
            {
                { "AED", "درهم إماراتي", 2, "UAE Dirham", true, true, true, true, "د.إ" },
                { "EGP", "جنيه مصري", 2, "Egyptian Pound", true, true, true, true, "ج.م" },
                { "EUR", "يورو", 2, "Euro", true, true, true, true, "€" },
                { "GBP", "جنيه إسترليني", 2, "Pound Sterling", true, true, true, true, "£" },
                { "JPY", "ين ياباني", 0, "Japanese Yen", true, true, true, false, "¥" },
                { "KWD", "دينار كويتي", 3, "Kuwaiti Dinar", true, true, true, true, "د.ك" },
                { "SAR", "ريال سعودي", 2, "Saudi Riyal", true, true, true, true, "ر.س" },
                { "USD", "دولار أمريكي", 2, "US Dollar", true, true, true, true, "$" }
            });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Currencies");
        migrationBuilder.AddColumn<decimal>(name: "ExchangeRate", table: "OpportunityJoinRequests", type: "decimal(28,12)", nullable: true);
        migrationBuilder.AddColumn<string>(name: "ExchangeRateProvider", table: "OpportunityJoinRequests", type: "nvarchar(100)", maxLength: 100, nullable: true);
        migrationBuilder.AddColumn<DateTime>(name: "ExchangeRateTimestamp", table: "OpportunityJoinRequests", type: "datetime2", nullable: true);
    }
}
