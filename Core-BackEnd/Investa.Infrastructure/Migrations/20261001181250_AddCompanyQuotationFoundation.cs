using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyQuotationFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompanyQuotations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumberSequence = table.Column<int>(type: "int", nullable: false),
                    QuotationNumber = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SalesOpportunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContactId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CustomerCodeSnapshot = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CustomerNameSnapshot = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactNameSnapshot = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    ContactEmailSnapshot = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    ContactPhoneSnapshot = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    IssueDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ValidUntil = table.Column<DateOnly>(type: "date", nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentTerms = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CommercialTerms = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AcceptedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyQuotations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyQuotations_CompanyCustomerContacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "CompanyCustomerContacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyQuotations_CompanyCustomers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "CompanyCustomers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyQuotations_CompanySalesOpportunities_SalesOpportunityId",
                        column: x => x.SalesOpportunityId,
                        principalTable: "CompanySalesOpportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompanyQuotationLines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuotationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LineNumber = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CatalogItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ItemCodeSnapshot = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    ItemNameSnapshot = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    DiscountValue = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineSubtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyQuotationLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyQuotationLines_CompanyCatalogItems_CatalogItemId",
                        column: x => x.CatalogItemId,
                        principalTable: "CompanyCatalogItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyQuotationLines_CompanyQuotations_QuotationId",
                        column: x => x.QuotationId,
                        principalTable: "CompanyQuotations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyQuotationLines_CatalogItemId",
                table: "CompanyQuotationLines",
                column: "CatalogItemId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyQuotationLines_QuotationId",
                table: "CompanyQuotationLines",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyQuotations_ContactId",
                table: "CompanyQuotations",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyQuotations_CreatedAt",
                table: "CompanyQuotations",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyQuotations_CustomerId",
                table: "CompanyQuotations",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyQuotations_IssueDate",
                table: "CompanyQuotations",
                column: "IssueDate");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyQuotations_NumberSequence",
                table: "CompanyQuotations",
                column: "NumberSequence",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyQuotations_QuotationNumber",
                table: "CompanyQuotations",
                column: "QuotationNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyQuotations_SalesOpportunityId",
                table: "CompanyQuotations",
                column: "SalesOpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyQuotations_Status",
                table: "CompanyQuotations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyQuotations_ValidUntil",
                table: "CompanyQuotations",
                column: "ValidUntil");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyQuotationLines");

            migrationBuilder.DropTable(
                name: "CompanyQuotations");
        }
    }
}
