using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations;

public partial class AddOpportunityFavorites : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<int>(
            name: "InvestmentId",
            table: "InvestmentFavorites",
            type: "int",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "int");

        migrationBuilder.AddColumn<int>(
            name: "OpportunityId",
            table: "InvestmentFavorites",
            type: "int",
            nullable: true);

        migrationBuilder.Sql("""
            UPDATE favorites
            SET OpportunityId = investments.OpportunityId
            FROM InvestmentFavorites AS favorites
            INNER JOIN Investments AS investments ON investments.Id = favorites.InvestmentId
            WHERE investments.OpportunityId IS NOT NULL;
            """);

        migrationBuilder.CreateIndex(
            name: "IX_InvestmentFavorites_OpportunityId",
            table: "InvestmentFavorites",
            column: "OpportunityId");

        migrationBuilder.CreateIndex(
            name: "IX_InvestmentFavorites_InvestorId_OpportunityId",
            table: "InvestmentFavorites",
            columns: new[] { "InvestorId", "OpportunityId" },
            unique: true,
            filter: "[OpportunityId] IS NOT NULL");

        migrationBuilder.AddForeignKey(
            name: "FK_InvestmentFavorites_Opportunities_OpportunityId",
            table: "InvestmentFavorites",
            column: "OpportunityId",
            principalTable: "Opportunities",
            principalColumn: "Id",
            onDelete: ReferentialAction.NoAction);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_InvestmentFavorites_Opportunities_OpportunityId",
            table: "InvestmentFavorites");

        migrationBuilder.DropIndex(
            name: "IX_InvestmentFavorites_OpportunityId",
            table: "InvestmentFavorites");

        migrationBuilder.DropIndex(
            name: "IX_InvestmentFavorites_InvestorId_OpportunityId",
            table: "InvestmentFavorites");

        migrationBuilder.DropColumn(
            name: "OpportunityId",
            table: "InvestmentFavorites");

        migrationBuilder.AlterColumn<int>(
            name: "InvestmentId",
            table: "InvestmentFavorites",
            type: "int",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "int",
            oldNullable: true);
    }
}
