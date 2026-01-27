using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RequireTeamMemberUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvestmentTeamMembers_ApplicationUsers_UserId",
                table: "InvestmentTeamMembers");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "InvestmentTeamMembers");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "InvestmentTeamMembers");

            migrationBuilder.DropColumn(
                name: "LinkedInUrl",
                table: "InvestmentTeamMembers");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "InvestmentTeamMembers");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "InvestmentTeamMembers",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentTeamMembers_InvestmentId_UserId",
                table: "InvestmentTeamMembers",
                columns: new[] { "InvestmentId", "UserId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_InvestmentTeamMembers_ApplicationUsers_UserId",
                table: "InvestmentTeamMembers",
                column: "UserId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvestmentTeamMembers_ApplicationUsers_UserId",
                table: "InvestmentTeamMembers");

            migrationBuilder.DropIndex(
                name: "IX_InvestmentTeamMembers_InvestmentId_UserId",
                table: "InvestmentTeamMembers");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "InvestmentTeamMembers",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "InvestmentTeamMembers",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "InvestmentTeamMembers",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedInUrl",
                table: "InvestmentTeamMembers",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "InvestmentTeamMembers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_InvestmentTeamMembers_ApplicationUsers_UserId",
                table: "InvestmentTeamMembers",
                column: "UserId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
