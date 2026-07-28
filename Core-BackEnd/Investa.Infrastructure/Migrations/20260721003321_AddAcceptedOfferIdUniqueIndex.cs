using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260721003321_AddAcceptedOfferIdUniqueIndex")]
public sealed class AddAcceptedOfferIdUniqueIndex : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_OpportunityJoinRequests_AcceptedOfferId",
            table: "OpportunityJoinRequests");

        migrationBuilder.CreateIndex(
            name: "IX_OpportunityJoinRequests_AcceptedOfferId",
            table: "OpportunityJoinRequests",
            column: "AcceptedOfferId",
            unique: true,
            filter: "[AcceptedOfferId] IS NOT NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_OpportunityJoinRequests_AcceptedOfferId",
            table: "OpportunityJoinRequests");

        migrationBuilder.CreateIndex(
            name: "IX_OpportunityJoinRequests_AcceptedOfferId",
            table: "OpportunityJoinRequests",
            column: "AcceptedOfferId",
            filter: "[AcceptedOfferId] IS NOT NULL");
    }
}
