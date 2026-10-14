using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnforceCompanyCustomerPrimaryContact : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CompanyCustomerContacts_CustomerId",
                table: "CompanyCustomerContacts");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCustomerContacts_CustomerId",
                table: "CompanyCustomerContacts",
                column: "CustomerId",
                unique: true,
                filter: "[IsPrimary] = 1 AND [IsActive] = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CompanyCustomerContacts_CustomerId",
                table: "CompanyCustomerContacts");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCustomerContacts_CustomerId",
                table: "CompanyCustomerContacts",
                column: "CustomerId");
        }
    }
}
