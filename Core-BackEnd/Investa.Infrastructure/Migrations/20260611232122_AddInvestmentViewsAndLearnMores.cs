using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInvestmentViewsAndLearnMores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InvestmentLearnMores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OpenedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UserIp = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentLearnMores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentLearnMores_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentViews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ViewedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UserIp = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentViews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentViews_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentLearnMores_InvestmentId",
                table: "InvestmentLearnMores",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentLearnMores_OpenedAt",
                table: "InvestmentLearnMores",
                column: "OpenedAt");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentLearnMores_UserId",
                table: "InvestmentLearnMores",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentViews_InvestmentId",
                table: "InvestmentViews",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentViews_UserId",
                table: "InvestmentViews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentViews_ViewedAt",
                table: "InvestmentViews",
                column: "ViewedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InvestmentLearnMores");

            migrationBuilder.DropTable(
                name: "InvestmentViews");
        }
    }
}
