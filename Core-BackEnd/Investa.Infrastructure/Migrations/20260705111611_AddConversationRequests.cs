using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddConversationRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ConversationRequestId",
                table: "Conversations",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ConversationRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    RequesterUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecipientUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AcceptedConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConversationRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConversationRequests_AuthUsers_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConversationRequests_AuthUsers_RequesterUserId",
                        column: x => x.RequesterUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConversationRequests_Conversations_AcceptedConversationId",
                        column: x => x.AcceptedConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConversationRequests_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ConversationRequestId",
                table: "Conversations",
                column: "ConversationRequestId",
                unique: true,
                filter: "[ConversationRequestId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationRequests_AcceptedConversationId",
                table: "ConversationRequests",
                column: "AcceptedConversationId",
                unique: true,
                filter: "[AcceptedConversationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationRequests_OpportunityId",
                table: "ConversationRequests",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationRequests_OpportunityId_RequesterUserId_RecipientUserId_Status",
                table: "ConversationRequests",
                columns: new[] { "OpportunityId", "RequesterUserId", "RecipientUserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ConversationRequests_RecipientUserId",
                table: "ConversationRequests",
                column: "RecipientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationRequests_RequesterUserId",
                table: "ConversationRequests",
                column: "RequesterUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_ConversationRequests_ConversationRequestId",
                table: "Conversations",
                column: "ConversationRequestId",
                principalTable: "ConversationRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_ConversationRequests_ConversationRequestId",
                table: "Conversations");

            migrationBuilder.DropTable(
                name: "ConversationRequests");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_ConversationRequestId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "ConversationRequestId",
                table: "Conversations");
        }
    }
}
