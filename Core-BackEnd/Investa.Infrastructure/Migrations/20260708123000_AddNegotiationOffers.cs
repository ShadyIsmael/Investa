using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNegotiationOffers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NegotiationOffers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    ParentOfferId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NegotiationOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NegotiationOffers_AuthUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NegotiationOffers_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NegotiationOffers_NegotiationOffers_ParentOfferId",
                        column: x => x.ParentOfferId,
                        principalTable: "NegotiationOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NegotiationOfferLegs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OfferId = table.Column<int>(type: "int", nullable: false),
                    LegType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EquityPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    SharesTerms = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReturnRate = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    TermMonths = table.Column<int>(type: "int", nullable: true),
                    RepaymentModel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ProfitSharePercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    ExitTerms = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NegotiationOfferLegs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NegotiationOfferLegs_NegotiationOffers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "NegotiationOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOfferLegs_OfferId",
                table: "NegotiationOfferLegs",
                column: "OfferId");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_ConversationId",
                table: "NegotiationOffers",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_ConversationId_Status",
                table: "NegotiationOffers",
                columns: new[] { "ConversationId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_ConversationId_Version",
                table: "NegotiationOffers",
                columns: new[] { "ConversationId", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_CreatedByUserId",
                table: "NegotiationOffers",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_ParentOfferId",
                table: "NegotiationOffers",
                column: "ParentOfferId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NegotiationOfferLegs");

            migrationBuilder.DropTable(
                name: "NegotiationOffers");
        }
    }
}
