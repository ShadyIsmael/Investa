using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    // Migration neutralized during consolidation.
    public partial class AddEquityCrowdfundingSupport : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder) { }
        protected override void Down(MigrationBuilder migrationBuilder) { }
    }
}
            migrationBuilder.DropForeignKey(
                name: "FK_Investments_ApplicationUsers_InvestorId",
                table: "Investments");

            migrationBuilder.RenameColumn(
                name: "InvestorId",
                table: "Investments",
                newName: "FounderId");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "Investments",
                newName: "InitialCapital");

            migrationBuilder.RenameIndex(
                name: "IX_Investments_InvestorId",
                table: "Investments",
                newName: "IX_Investments_FounderId");

            migrationBuilder.AddColumn<int>(
                name: "AvailableShares",
                table: "Investments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "Investments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ExpectedROI",
                table: "Investments",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Investments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvestmentType",
                table: "Investments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxInvestment",
                table: "Investments",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MinInvestment",
                table: "Investments",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SharePrice",
                table: "Investments",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Investments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Draft");

            migrationBuilder.AddColumn<int>(
                name: "TotalShares",
                table: "Investments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ValuationCap",
                table: "Investments",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Investments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "InvestmentParticipants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    InvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SharesPurchased = table.Column<int>(type: "int", nullable: false),
                    AmountInvested = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    InvestmentDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Confirmed"),
                    IsAnonymous = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentParticipants_ApplicationUsers_InvestorId",
                        column: x => x.InvestorId,
                        principalTable: "ApplicationUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvestmentParticipants_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentParticipants_InvestmentId",
                table: "InvestmentParticipants",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentParticipants_InvestorId",
                table: "InvestmentParticipants",
                column: "InvestorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Investments_ApplicationUsers_FounderId",
                table: "Investments",
                column: "FounderId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Investments_ApplicationUsers_FounderId",
                table: "Investments");

            migrationBuilder.DropTable(
                name: "InvestmentParticipants");

            migrationBuilder.DropColumn(
                name: "AvailableShares",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "ExpectedROI",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "InvestmentType",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "MaxInvestment",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "MinInvestment",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "SharePrice",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "TotalShares",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "ValuationCap",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Investments");

            migrationBuilder.RenameColumn(
                name: "InitialCapital",
                table: "Investments",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "FounderId",
                table: "Investments",
                newName: "InvestorId");

            migrationBuilder.RenameIndex(
                name: "IX_Investments_FounderId",
                table: "Investments",
                newName: "IX_Investments_InvestorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Investments_ApplicationUsers_InvestorId",
                table: "Investments",
                column: "InvestorId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
