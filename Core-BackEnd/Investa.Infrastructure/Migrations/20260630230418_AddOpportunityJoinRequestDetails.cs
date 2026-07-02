using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOpportunityJoinRequestDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CalculatedTotalAmount",
                table: "OpportunityJoinRequests",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestType",
                table: "OpportunityJoinRequests",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "GeneralParticipation");

            migrationBuilder.AddColumn<string>(
                name: "TermsSnapshotJson",
                table: "OpportunityJoinRequests",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CalculatedTotalAmount",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "RequestType",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "TermsSnapshotJson",
                table: "OpportunityJoinRequests");
        }
    }
}
