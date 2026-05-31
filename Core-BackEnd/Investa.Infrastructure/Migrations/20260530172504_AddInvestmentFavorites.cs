using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInvestmentFavorites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InvestmentFavorites",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentFavorites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentFavorites_AuthUsers_InvestorId",
                        column: x => x.InvestorId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvestmentFavorites_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentFavorites_InvestmentId",
                table: "InvestmentFavorites",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentFavorites_InvestorId_InvestmentId",
                table: "InvestmentFavorites",
                columns: new[] { "InvestorId", "InvestmentId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InvestmentFavorites");
        }
    }
}
