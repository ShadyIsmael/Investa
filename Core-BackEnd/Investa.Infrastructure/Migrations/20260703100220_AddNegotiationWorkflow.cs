using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNegotiationWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Conversations_ConversationId",
                table: "ChatMessages");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_ConversationId",
                table: "ChatMessages");

            migrationBuilder.AddColumn<bool>(
                name: "IsVisibleToFounder",
                table: "OpportunityJoinRequests",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsVisibleToInvestor",
                table: "OpportunityJoinRequests",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SourceConversationId",
                table: "OpportunityJoinRequests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserMobile",
                table: "Conversations",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Conversations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "Requested",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "Pending");

            migrationBuilder.AddColumn<DateTime>(
                name: "ClosedAt",
                table: "Conversations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FounderId",
                table: "Conversations",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "FounderReady",
                table: "Conversations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "InvestorId",
                table: "Conversations",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "InvestorReady",
                table: "Conversations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsVisibleToFounder",
                table: "Conversations",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsVisibleToInvestor",
                table: "Conversations",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "OpportunityId",
                table: "Conversations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParticipationRequestId",
                table: "Conversations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReadyForParticipationAt",
                table: "Conversations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Conversations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AttachmentsJson",
                table: "ChatMessages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "ChatMessages",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EditedAt",
                table: "ChatMessages",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ChatMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsEdited",
                table: "ChatMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "SenderUserId",
                table: "ChatMessages",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_SourceConversationId",
                table: "OpportunityJoinRequests",
                column: "SourceConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_FounderId",
                table: "Conversations",
                column: "FounderId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_InvestorId",
                table: "Conversations",
                column: "InvestorId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_OpportunityId",
                table: "Conversations",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_OpportunityId_FounderId_InvestorId_IsActive",
                table: "Conversations",
                columns: new[] { "OpportunityId", "FounderId", "InvestorId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ParticipationRequestId",
                table: "Conversations",
                column: "ParticipationRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ConversationId_Timestamp",
                table: "ChatMessages",
                columns: new[] { "ConversationId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SenderUserId",
                table: "ChatMessages",
                column: "SenderUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_AuthUsers_SenderUserId",
                table: "ChatMessages",
                column: "SenderUserId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Conversations_ConversationId",
                table: "ChatMessages",
                column: "ConversationId",
                principalTable: "Conversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_AuthUsers_FounderId",
                table: "Conversations",
                column: "FounderId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_AuthUsers_InvestorId",
                table: "Conversations",
                column: "InvestorId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Opportunities_OpportunityId",
                table: "Conversations",
                column: "OpportunityId",
                principalTable: "Opportunities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_OpportunityJoinRequests_ParticipationRequestId",
                table: "Conversations",
                column: "ParticipationRequestId",
                principalTable: "OpportunityJoinRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_AuthUsers_SenderUserId",
                table: "ChatMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Conversations_ConversationId",
                table: "ChatMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_AuthUsers_FounderId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_AuthUsers_InvestorId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Opportunities_OpportunityId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_OpportunityJoinRequests_ParticipationRequestId",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityJoinRequests_SourceConversationId",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_FounderId",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_InvestorId",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_OpportunityId",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_OpportunityId_FounderId_InvestorId_IsActive",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_ParticipationRequestId",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_ConversationId_Timestamp",
                table: "ChatMessages");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_SenderUserId",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "IsVisibleToFounder",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "IsVisibleToInvestor",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "SourceConversationId",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "ClosedAt",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "FounderId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "FounderReady",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "InvestorId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "InvestorReady",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "IsVisibleToFounder",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "IsVisibleToInvestor",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "OpportunityId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "ParticipationRequestId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "ReadyForParticipationAt",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "AttachmentsJson",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "EditedAt",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "IsEdited",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "SenderUserId",
                table: "ChatMessages");

            migrationBuilder.AlterColumn<string>(
                name: "UserMobile",
                table: "Conversations",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Conversations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "Pending",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "Requested");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ConversationId",
                table: "ChatMessages",
                column: "ConversationId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Conversations_ConversationId",
                table: "ChatMessages",
                column: "ConversationId",
                principalTable: "Conversations",
                principalColumn: "Id");
        }
    }
}
