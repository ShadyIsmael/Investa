using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInvestmentOpportunityCompatibilityLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OpportunityId",
                table: "Investments",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Investments",
                keyColumn: "Id",
                keyValue: 1000,
                column: "OpportunityId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Investments",
                keyColumn: "Id",
                keyValue: 1001,
                column: "OpportunityId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Investments_OpportunityId",
                table: "Investments",
                column: "OpportunityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Investments_Opportunities_OpportunityId",
                table: "Investments",
                column: "OpportunityId",
                principalTable: "Opportunities",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Investments_Opportunities_OpportunityId",
                table: "Investments");

            migrationBuilder.DropIndex(
                name: "IX_Investments_OpportunityId",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "OpportunityId",
                table: "Investments");
        }
    }
}
