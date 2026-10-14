using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyContractFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompanyContracts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumberSequence = table.Column<int>(type: "int", nullable: false),
                    ContractNumber = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourceQuotationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SalesOpportunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContactId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CustomerCodeSnapshot = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CustomerNameSnapshot = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CustomerLegalNameSnapshot = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ContactNameSnapshot = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    ContactEmailSnapshot = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    ContactPhoneSnapshot = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    EffectiveDate = table.Column<DateOnly>(type: "date", nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    SignedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentTerms = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CommercialTerms = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TerminatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TerminationReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyContracts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyContracts_CompanyCustomerContacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "CompanyCustomerContacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyContracts_CompanyCustomers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "CompanyCustomers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyContracts_CompanyQuotations_SourceQuotationId",
                        column: x => x.SourceQuotationId,
                        principalTable: "CompanyQuotations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyContracts_CompanySalesOpportunities_SalesOpportunityId",
                        column: x => x.SalesOpportunityId,
                        principalTable: "CompanySalesOpportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompanyContractLines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContractId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourceQuotationLineId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    LineTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SupportsLicenseSnapshot = table.Column<bool>(type: "bit", nullable: false),
                    SupportsSubscriptionSnapshot = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyContractLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyContractLines_CompanyCatalogItems_CatalogItemId",
                        column: x => x.CatalogItemId,
                        principalTable: "CompanyCatalogItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyContractLines_CompanyContracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "CompanyContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompanyContractLines_CompanyQuotationLines_SourceQuotationLineId",
                        column: x => x.SourceQuotationLineId,
                        principalTable: "CompanyQuotationLines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContractLines_CatalogItemId",
                table: "CompanyContractLines",
                column: "CatalogItemId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContractLines_ContractId",
                table: "CompanyContractLines",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContractLines_SourceQuotationLineId",
                table: "CompanyContractLines",
                column: "SourceQuotationLineId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContracts_ContactId",
                table: "CompanyContracts",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContracts_ContractNumber",
                table: "CompanyContracts",
                column: "ContractNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContracts_CreatedAt",
                table: "CompanyContracts",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContracts_CustomerId",
                table: "CompanyContracts",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContracts_EffectiveDate",
                table: "CompanyContracts",
                column: "EffectiveDate");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContracts_EndDate",
                table: "CompanyContracts",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContracts_NumberSequence",
                table: "CompanyContracts",
                column: "NumberSequence",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContracts_SalesOpportunityId",
                table: "CompanyContracts",
                column: "SalesOpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContracts_SourceQuotationId",
                table: "CompanyContracts",
                column: "SourceQuotationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContracts_StartDate",
                table: "CompanyContracts",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyContracts_Status",
                table: "CompanyContracts",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyContractLines");

            migrationBuilder.DropTable(
                name: "CompanyContracts");
        }
    }
}
