using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAcceptedOfferIdToJoinRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_InvestmentFavorites_InvestorId_InvestmentId",
                table: "InvestmentFavorites");

            migrationBuilder.AddColumn<int>(
                name: "AcceptedOfferId",
                table: "OpportunityJoinRequests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_AcceptedOfferId",
                table: "OpportunityJoinRequests",
                column: "AcceptedOfferId",
                unique: true,
                filter: "[AcceptedOfferId] IS NOT NULL");

            migrationBuilder.AlterColumn<int>(
                name: "InvestmentId",
                table: "InvestmentFavorites",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentFavorites_InvestorId_InvestmentId",
                table: "InvestmentFavorites",
                columns: new[] { "InvestorId", "InvestmentId" },
                unique: true,
                filter: "[InvestmentId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_InvestmentFavorites_InvestorId_InvestmentId",
                table: "InvestmentFavorites");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityJoinRequests_AcceptedOfferId",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "AcceptedOfferId",
                table: "OpportunityJoinRequests");

            migrationBuilder.AlterColumn<int>(
                name: "InvestmentId",
                table: "InvestmentFavorites",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentFavorites_InvestorId_InvestmentId",
                table: "InvestmentFavorites",
                columns: new[] { "InvestorId", "InvestmentId" },
                unique: true);
        }
    }
}
