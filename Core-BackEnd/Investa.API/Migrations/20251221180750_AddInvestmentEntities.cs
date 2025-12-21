using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.API.Migrations
{
    /// <inheritdoc />
    public partial class AddInvestmentEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Partners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactInfo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentOpportunities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BusinessName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TargetFund = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BusinessStageId = table.Column<int>(type: "int", nullable: true),
                    BusinessCategoryId = table.Column<int>(type: "int", nullable: true),
                    PartnerId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentOpportunities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentOpportunities_Partners_PartnerId",
                        column: x => x.PartnerId,
                        principalTable: "Partners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentOpportunityId = table.Column<int>(type: "int", nullable: false),
                    ReviewerId = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentReviews_InvestmentOpportunities_InvestmentOpportunityId",
                        column: x => x.InvestmentOpportunityId,
                        principalTable: "InvestmentOpportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentOpportunityId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ShareAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InvestedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentUsers_InvestmentOpportunities_InvestmentOpportunityId",
                        column: x => x.InvestmentOpportunityId,
                        principalTable: "InvestmentOpportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentOpportunities_PartnerId",
                table: "InvestmentOpportunities",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentReviews_InvestmentOpportunityId",
                table: "InvestmentReviews",
                column: "InvestmentOpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentUsers_InvestmentOpportunityId",
                table: "InvestmentUsers",
                column: "InvestmentOpportunityId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InvestmentReviews");

            migrationBuilder.DropTable(
                name: "InvestmentUsers");

            migrationBuilder.DropTable(
                name: "InvestmentOpportunities");

            migrationBuilder.DropTable(
                name: "Partners");
        }
    }
}
