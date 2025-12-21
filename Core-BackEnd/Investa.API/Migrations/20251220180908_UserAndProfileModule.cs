using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.API.Migrations
{
    /// <inheritdoc />
    public partial class UserAndProfileModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClientType",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Gender = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Nationality = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Bio = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Phone1 = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Phone2 = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    WorkAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DocumentNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DocumentExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VerificationStatus = table.Column<int>(type: "int", nullable: false),
                    DocumentFrontImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DocumentBackImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LastLoginIP = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    RegistrationIP = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    DeviceInfo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LastLoginDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_UserId",
                table: "UserProfiles",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "ClientType",
                table: "Users");
        }
    }
}
