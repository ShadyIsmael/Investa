using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanySalesOpportunityFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompanySalesOpportunities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodeSequence = table.Column<int>(type: "int", nullable: false),
                    OpportunityCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PrimaryContactId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Stage = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ExpectedValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    Probability = table.Column<int>(type: "int", nullable: true),
                    ExpectedCloseDate = table.Column<DateOnly>(type: "date", nullable: true),
                    SalesOwnerUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    LostReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    WonAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LostAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanySalesOpportunities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanySalesOpportunities_AuthUsers_SalesOwnerUserId",
                        column: x => x.SalesOwnerUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanySalesOpportunities_CompanyCustomerContacts_PrimaryContactId",
                        column: x => x.PrimaryContactId,
                        principalTable: "CompanyCustomerContacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanySalesOpportunities_CompanyCustomers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "CompanyCustomers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompanySalesOpportunityItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SalesOpportunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CatalogItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanySalesOpportunityItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanySalesOpportunityItems_CompanyCatalogItems_CatalogItemId",
                        column: x => x.CatalogItemId,
                        principalTable: "CompanyCatalogItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanySalesOpportunityItems_CompanySalesOpportunities_SalesOpportunityId",
                        column: x => x.SalesOpportunityId,
                        principalTable: "CompanySalesOpportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompanySalesOpportunities_CodeSequence",
                table: "CompanySalesOpportunities",
                column: "CodeSequence",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanySalesOpportunities_CreatedAt",
                table: "CompanySalesOpportunities",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CompanySalesOpportunities_CustomerId_Status",
                table: "CompanySalesOpportunities",
                columns: new[] { "CustomerId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CompanySalesOpportunities_ExpectedCloseDate",
                table: "CompanySalesOpportunities",
                column: "ExpectedCloseDate");

            migrationBuilder.CreateIndex(
                name: "IX_CompanySalesOpportunities_OpportunityCode",
                table: "CompanySalesOpportunities",
                column: "OpportunityCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanySalesOpportunities_PrimaryContactId",
                table: "CompanySalesOpportunities",
                column: "PrimaryContactId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanySalesOpportunities_SalesOwnerUserId",
                table: "CompanySalesOpportunities",
                column: "SalesOwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanySalesOpportunities_Status_Stage",
                table: "CompanySalesOpportunities",
                columns: new[] { "Status", "Stage" });

            migrationBuilder.CreateIndex(
                name: "IX_CompanySalesOpportunityItems_CatalogItemId",
                table: "CompanySalesOpportunityItems",
                column: "CatalogItemId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanySalesOpportunityItems_SalesOpportunityId_CatalogItemId",
                table: "CompanySalesOpportunityItems",
                columns: new[] { "SalesOpportunityId", "CatalogItemId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanySalesOpportunityItems");

            migrationBuilder.DropTable(
                name: "CompanySalesOpportunities");
        }
    }
}
