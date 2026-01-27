using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    // Migration neutralized during consolidation.
    public partial class AddCurrentCredibilityScoreAndUpdateCreditTransaction : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder) { }
        protected override void Down(MigrationBuilder migrationBuilder) { }
    }
}
            migrationBuilder.DropColumn(
                name: "Description",
                table: "CreditTransactions");

            migrationBuilder.DropColumn(
                name: "ReferenceId",
                table: "CreditTransactions");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "CreditTransactions");

            migrationBuilder.AddColumn<decimal>(
                name: "CurrentCredibilityScore",
                table: "UserProfiles",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "AdminId",
                table: "CreditTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "JustificationAr",
                table: "CreditTransactions",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "JustificationEn",
                table: "CreditTransactions",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId1",
                table: "CreditTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditTransactions_AdminId",
                table: "CreditTransactions",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditTransactions_UserId1",
                table: "CreditTransactions",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_CreditTransactions_ApplicationUsers_AdminId",
                table: "CreditTransactions",
                column: "AdminId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CreditTransactions_ApplicationUsers_UserId1",
                table: "CreditTransactions",
                column: "UserId1",
                principalTable: "ApplicationUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CreditTransactions_ApplicationUsers_AdminId",
                table: "CreditTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_CreditTransactions_ApplicationUsers_UserId1",
                table: "CreditTransactions");

            migrationBuilder.DropIndex(
                name: "IX_CreditTransactions_AdminId",
                table: "CreditTransactions");

            migrationBuilder.DropIndex(
                name: "IX_CreditTransactions_UserId1",
                table: "CreditTransactions");

            migrationBuilder.DropColumn(
                name: "CurrentCredibilityScore",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "AdminId",
                table: "CreditTransactions");

            migrationBuilder.DropColumn(
                name: "JustificationAr",
                table: "CreditTransactions");

            migrationBuilder.DropColumn(
                name: "JustificationEn",
                table: "CreditTransactions");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "CreditTransactions");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "CreditTransactions",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReferenceId",
                table: "CreditTransactions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "CreditTransactions",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
