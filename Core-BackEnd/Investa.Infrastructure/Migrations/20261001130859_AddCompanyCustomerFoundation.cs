using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyCustomerFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompanyCustomers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodeSequence = table.Column<int>(type: "int", nullable: false),
                    CustomerCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    LegalName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TaxId = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    CommercialRegistrationNumber = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    PrimaryEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    PrimaryPhone = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyCustomers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompanyCustomerContacts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    JobTitle = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyCustomerContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyCustomerContacts_CompanyCustomers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "CompanyCustomers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCustomerContacts_CustomerId",
                table: "CompanyCustomerContacts",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCustomerContacts_CustomerId_IsPrimary",
                table: "CompanyCustomerContacts",
                columns: new[] { "CustomerId", "IsPrimary" });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCustomers_CodeSequence",
                table: "CompanyCustomers",
                column: "CodeSequence",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCustomers_CreatedAt",
                table: "CompanyCustomers",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCustomers_CustomerCode",
                table: "CompanyCustomers",
                column: "CustomerCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCustomers_Status",
                table: "CompanyCustomers",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCustomers_TaxId",
                table: "CompanyCustomers",
                column: "TaxId",
                unique: true,
                filter: "[TaxId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCustomers_Type",
                table: "CompanyCustomers",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyCustomerContacts");

            migrationBuilder.DropTable(
                name: "CompanyCustomers");
        }
    }
}
