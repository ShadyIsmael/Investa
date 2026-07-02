using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOpportunityClassificationMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Opportunities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExpectedDurationMonths",
                table: "Opportunities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FundingGoalId",
                table: "Opportunities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MaximumInvestmentAmount",
                table: "Opportunities",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MinimumInvestmentAmount",
                table: "Opportunities",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FundingGoals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundingGoals", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityTags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityTagAssignments",
                columns: table => new
                {
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    OpportunityTagId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityTagAssignments", x => new { x.OpportunityId, x.OpportunityTagId });
                    table.ForeignKey(
                        name: "FK_OpportunityTagAssignments_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OpportunityTagAssignments_OpportunityTags_OpportunityTagId",
                        column: x => x.OpportunityTagId,
                        principalTable: "OpportunityTags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "FundingGoals",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name", "SortOrder", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Funding to start a new venture.", true, "Launch New Business", 1, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Funding to scale an operating business.", true, "Expand Existing Business", 2, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Funding to purchase equipment or machinery.", true, "Buy Equipment", 3, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Funding for marketing and customer acquisition.", true, "Marketing", 4, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Funding for operating cash flow.", true, "Working Capital", 5, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Funding to open another location.", true, "Open New Branch", 6, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Funding for product or technical development.", true, "Research & Development", 7, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Funding to purchase inventory.", true, "Inventory Purchase", 8, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 9, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Funding to recruit and grow the team.", true, "Hiring", 9, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 10, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Funding for acquisition activity.", true, "Acquisition", 10, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "OpportunityCategories",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name", "SortOrder", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Technology products, platforms, and services.", true, "Technology", 1, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Food production, restaurants, cafes, and beverage ventures.", true, "Food & Beverage", 2, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Healthcare services, clinics, medical products, and wellness.", true, "Healthcare", 3, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Education, training, and learning products.", true, "Education", 4, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Retail stores, commerce operations, and consumer goods.", true, "Retail", 5, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Manufacturing, production lines, and industrial operations.", true, "Manufacturing", 6, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Agriculture, farms, food supply, and agri-tech.", true, "Agriculture", 7, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Real estate development, operations, and property services.", true, "Real Estate", 8, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 9, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Tourism, hospitality, and travel services.", true, "Tourism", 9, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 10, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Transportation, logistics, and mobility.", true, "Transportation", 10, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 11, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Energy generation, services, and sustainability.", true, "Energy", 11, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 12, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Fashion, apparel, accessories, and design.", true, "Fashion", 12, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 13, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Media, content, publishing, and creative production.", true, "Media", 13, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 14, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Games, interactive entertainment, and gaming platforms.", true, "Gaming", 14, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 15, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Financial technology, payments, lending, and finance tools.", true, "FinTech", 15, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 16, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Artificial intelligence products, services, and infrastructure.", true, "AI", 16, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "OpportunityTags",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name", "SortOrder" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Uses or builds artificial intelligence.", true, "AI", 1 },
                    { 2, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Export-oriented business.", true, "Export", 2 },
                    { 3, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Sustainability or environmentally focused.", true, "Green", 3 },
                    { 4, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Founded or led by women.", true, "Women-led", 4 },
                    { 5, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Franchise or franchisable model.", true, "Franchise", 5 },
                    { 6, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Business-to-business model.", true, "B2B", 6 },
                    { 7, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Business-to-consumer model.", true, "B2C", 7 },
                    { 8, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Software as a service.", true, "SaaS", 8 },
                    { 9, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Mobile application product.", true, "Mobile App", 9 },
                    { 10, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Local market business.", true, "Local Business", 10 },
                    { 11, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Designed for rapid growth.", true, "High Growth", 11 },
                    { 12, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Accessible minimum investment size.", true, "Low Entry Ticket", 12 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_CategoryId",
                table: "Opportunities",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_FundingGoalId",
                table: "Opportunities",
                column: "FundingGoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_InvestmentModel",
                table: "Opportunities",
                column: "InvestmentModel");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ProjectStage",
                table: "Opportunities",
                column: "ProjectStage");

            migrationBuilder.CreateIndex(
                name: "IX_FundingGoals_IsActive_SortOrder",
                table: "FundingGoals",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_FundingGoals_Name",
                table: "FundingGoals",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityCategories_IsActive_SortOrder",
                table: "OpportunityCategories",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityCategories_Name",
                table: "OpportunityCategories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTagAssignments_OpportunityTagId",
                table: "OpportunityTagAssignments",
                column: "OpportunityTagId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTags_IsActive_SortOrder",
                table: "OpportunityTags",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTags_Name",
                table: "OpportunityTags",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Opportunities_FundingGoals_FundingGoalId",
                table: "Opportunities",
                column: "FundingGoalId",
                principalTable: "FundingGoals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Opportunities_OpportunityCategories_CategoryId",
                table: "Opportunities",
                column: "CategoryId",
                principalTable: "OpportunityCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Opportunities_FundingGoals_FundingGoalId",
                table: "Opportunities");

            migrationBuilder.DropForeignKey(
                name: "FK_Opportunities_OpportunityCategories_CategoryId",
                table: "Opportunities");

            migrationBuilder.DropTable(
                name: "FundingGoals");

            migrationBuilder.DropTable(
                name: "OpportunityCategories");

            migrationBuilder.DropTable(
                name: "OpportunityTagAssignments");

            migrationBuilder.DropTable(
                name: "OpportunityTags");

            migrationBuilder.DropIndex(
                name: "IX_Opportunities_CategoryId",
                table: "Opportunities");

            migrationBuilder.DropIndex(
                name: "IX_Opportunities_FundingGoalId",
                table: "Opportunities");

            migrationBuilder.DropIndex(
                name: "IX_Opportunities_InvestmentModel",
                table: "Opportunities");

            migrationBuilder.DropIndex(
                name: "IX_Opportunities_ProjectStage",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ExpectedDurationMonths",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "FundingGoalId",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "MaximumInvestmentAmount",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "MinimumInvestmentAmount",
                table: "Opportunities");
        }
    }
}
