using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DirectOfferScopeAndReplacementNaming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NegotiationOffers_Conversations_ConversationId",
                table: "NegotiationOffers");

            migrationBuilder.DropIndex(
                name: "IX_NegotiationOffers_ConversationId_Version",
                table: "NegotiationOffers");

            migrationBuilder.AlterColumn<Guid>(
                name: "ConversationId",
                table: "NegotiationOffers",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<int>(
                name: "OpportunityId",
                table: "NegotiationOffers",
                type: "int",
                nullable: true);

            migrationBuilder.Sql("UPDATE [NegotiationOffers] SET [Status] = 'Replaced' WHERE [Status] = 'Countered';");

            migrationBuilder.UpdateData(
                table: "PricingRules",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Action", "ActionCode", "Description", "DisplayName" },
                values: new object[] { "SendOfferReplacement", "SendOfferReplacement", "Fixed CREDIT fee to send a full replacement offer.", "Send Offer Replacement" });

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_ConversationId_Version",
                table: "NegotiationOffers",
                columns: new[] { "ConversationId", "Version" },
                unique: true,
                filter: "[ConversationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_OpportunityId",
                table: "NegotiationOffers",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_OpportunityId_CreatedByUserId_Status",
                table: "NegotiationOffers",
                columns: new[] { "OpportunityId", "CreatedByUserId", "Status" });

            migrationBuilder.AddForeignKey(
                name: "FK_NegotiationOffers_Conversations_ConversationId",
                table: "NegotiationOffers",
                column: "ConversationId",
                principalTable: "Conversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NegotiationOffers_Opportunities_OpportunityId",
                table: "NegotiationOffers",
                column: "OpportunityId",
                principalTable: "Opportunities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NegotiationOffers_Conversations_ConversationId",
                table: "NegotiationOffers");

            migrationBuilder.DropForeignKey(
                name: "FK_NegotiationOffers_Opportunities_OpportunityId",
                table: "NegotiationOffers");

            migrationBuilder.DropIndex(
                name: "IX_NegotiationOffers_ConversationId_Version",
                table: "NegotiationOffers");

            migrationBuilder.DropIndex(
                name: "IX_NegotiationOffers_OpportunityId",
                table: "NegotiationOffers");

            migrationBuilder.DropIndex(
                name: "IX_NegotiationOffers_OpportunityId_CreatedByUserId_Status",
                table: "NegotiationOffers");

            migrationBuilder.DropColumn(
                name: "OpportunityId",
                table: "NegotiationOffers");

            migrationBuilder.AlterColumn<Guid>(
                name: "ConversationId",
                table: "NegotiationOffers",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "PricingRules",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Action", "ActionCode", "Description", "DisplayName" },
                values: new object[] { "SendCounterOffer", "SendCounterOffer", "Fixed CREDIT fee to send a counter offer.", "Send Counter Offer" });

            migrationBuilder.AddForeignKey(
                name: "FK_NegotiationOffers_Conversations_ConversationId",
                table: "NegotiationOffers",
                column: "ConversationId",
                principalTable: "Conversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_ConversationId_Version",
                table: "NegotiationOffers",
                columns: new[] { "ConversationId", "Version" },
                unique: true);
        }
    }
}
