using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOpportunityObligationCompletionPhase6 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ObligationCompletionStatus",
                table: "Opportunities",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "NotStarted");

            migrationBuilder.CreateTable(
                name: "ParticipationObligationConfirmations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParticipationRequestId = table.Column<int>(type: "int", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    RequiredUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartyRole = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ConfirmedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConfirmationStatement = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParticipationObligationConfirmations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParticipationObligationConfirmations_AuthUsers_ConfirmedByUserId",
                        column: x => x.ConfirmedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipationObligationConfirmations_AuthUsers_RequiredUserId",
                        column: x => x.RequiredUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipationObligationConfirmations_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipationObligationConfirmations_OpportunityJoinRequests_ParticipationRequestId",
                        column: x => x.ParticipationRequestId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationObligationConfirmations_ConfirmedByUserId",
                table: "ParticipationObligationConfirmations",
                column: "ConfirmedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationObligationConfirmations_OpportunityId",
                table: "ParticipationObligationConfirmations",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationObligationConfirmations_ParticipationRequestId_PartyRole",
                table: "ParticipationObligationConfirmations",
                columns: new[] { "ParticipationRequestId", "PartyRole" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationObligationConfirmations_RequiredUserId_IdempotencyKey",
                table: "ParticipationObligationConfirmations",
                columns: new[] { "RequiredUserId", "IdempotencyKey" },
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationObligationConfirmations_RequiredUserId_Status",
                table: "ParticipationObligationConfirmations",
                columns: new[] { "RequiredUserId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ParticipationObligationConfirmations");

            migrationBuilder.DropColumn(
                name: "ObligationCompletionStatus",
                table: "Opportunities");
        }
    }
}
