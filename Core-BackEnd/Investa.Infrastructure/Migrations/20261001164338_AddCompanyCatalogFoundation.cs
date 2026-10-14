using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyCatalogFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompanyCatalogItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodeSequence = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Type = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    SupportsLicense = table.Column<bool>(type: "bit", nullable: false),
                    SupportsSubscription = table.Column<bool>(type: "bit", nullable: false),
                    SupportsWorkspace = table.Column<bool>(type: "bit", nullable: false),
                    WorkspaceKey = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    DefaultUnit = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyCatalogItems", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCatalogItems_Code",
                table: "CompanyCatalogItems",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCatalogItems_CodeSequence",
                table: "CompanyCatalogItems",
                column: "CodeSequence",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCatalogItems_CreatedAt",
                table: "CompanyCatalogItems",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCatalogItems_Status",
                table: "CompanyCatalogItems",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCatalogItems_Type",
                table: "CompanyCatalogItems",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyCatalogItems");
        }
    }
}
