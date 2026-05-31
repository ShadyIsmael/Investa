using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConsolidateUserToAuthUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CreditTransactions_ApplicationUsers_AdminId",
                table: "CreditTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_CreditTransactions_ApplicationUsers_UserId",
                table: "CreditTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_CreditTransactions_ApplicationUsers_UserId1",
                table: "CreditTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_InvestmentParticipants_ApplicationUsers_InvestorId",
                table: "InvestmentParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_Investments_ApplicationUsers_FounderId",
                table: "Investments");

            migrationBuilder.DropForeignKey(
                name: "FK_InvestmentTeamMembers_ApplicationUsers_UserId",
                table: "InvestmentTeamMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_ScoreTransactions_ApplicationUsers_UserId",
                table: "ScoreTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_ApplicationUsers_WalletId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_UserGroups_ApplicationUsers_UserId1",
                table: "UserGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_UserProfiles_ApplicationUsers_UserId",
                table: "UserProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_ApplicationUsers_UserId",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_UserGroups_UserId1",
                table: "UserGroups");

            migrationBuilder.DropColumn(
                name: "AuthUserId",
                table: "UserRoles");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "NotificationTemplates",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "ClientType",
                table: "AuthUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CredibilityScore",
                table: "AuthUsers",
                type: "int",
                nullable: false,
                defaultValue: 3500);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "AuthUsers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "WalletBalance",
                table: "AuthUsers",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            // DATA MIGRATION: reconcile ApplicationUsers rows whose email already exists in AuthUsers
            migrationBuilder.Sql(@"
                UPDATE inv
                SET FounderId = a.Id
                FROM Investments inv
                JOIN ApplicationUsers u ON inv.FounderId = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE inv.FounderId <> a.Id;

                DELETE up
                FROM UserProfiles up
                JOIN ApplicationUsers u ON up.UserId = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE up.UserId <> a.Id
                    AND EXISTS (SELECT 1 FROM UserProfiles existingUp WHERE existingUp.UserId = a.Id);

                UPDATE up
                SET UserId = a.Id
                FROM UserProfiles up
                JOIN ApplicationUsers u ON up.UserId = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE up.UserId <> a.Id;

                UPDATE ip
                SET InvestorId = a.Id
                FROM InvestmentParticipants ip
                JOIN ApplicationUsers u ON ip.InvestorId = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE ip.InvestorId <> a.Id;

                UPDATE itm
                SET UserId = a.Id
                FROM InvestmentTeamMembers itm
                JOIN ApplicationUsers u ON itm.UserId = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE itm.UserId <> a.Id;

                UPDATE t
                SET WalletId = a.Id
                FROM Transactions t
                JOIN ApplicationUsers u ON t.WalletId = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE t.WalletId <> a.Id;

                UPDATE ct
                SET UserId = a.Id
                FROM CreditTransactions ct
                JOIN ApplicationUsers u ON ct.UserId = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE ct.UserId <> a.Id;

                UPDATE ct
                SET AdminId = a.Id
                FROM CreditTransactions ct
                JOIN ApplicationUsers u ON ct.AdminId = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE ct.AdminId IS NOT NULL AND ct.AdminId <> a.Id;

                UPDATE st
                SET UserId = a.Id
                FROM ScoreTransactions st
                JOIN ApplicationUsers u ON st.UserId = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE st.UserId <> a.Id;

                UPDATE ur
                SET UserId = a.Id
                FROM UserRoles ur
                JOIN ApplicationUsers u ON ur.UserId = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE ur.UserId <> a.Id;

                UPDATE ug
                SET UserId = a.Id
                FROM UserGroups ug
                JOIN ApplicationUsers u ON ug.UserId = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE ug.UserId <> a.Id;

                UPDATE ug
                SET UserId1 = a.Id
                FROM UserGroups ug
                JOIN ApplicationUsers u ON ug.UserId1 = u.Id
                JOIN AuthUsers a ON a.Email = u.Email
                WHERE ug.UserId1 <> a.Id;
            ");

            // DATA MIGRATION: create missing AuthUsers for existing ApplicationUsers first
            migrationBuilder.Sql(@"
                INSERT INTO AuthUsers (Id, Email, PasswordHash, UserType, Status, CreatedAt, ClientType, Name, WalletBalance, CredibilityScore)
                SELECT u.Id, u.Email, '', 'Client', 1, GETDATE(), u.ClientType, u.Name, u.WalletBalance, u.CredibilityScore
                FROM ApplicationUsers u
                WHERE NOT EXISTS (SELECT 1 FROM AuthUsers a WHERE a.Id = u.Id OR a.Email = u.Email);
            ");

            // DATA MIGRATION: copy updated fields from ApplicationUsers into AuthUsers now that the columns exist
            migrationBuilder.Sql(@"
                UPDATE au
                SET
                    au.Name            = ISNULL(u.Name, ''),
                    au.WalletBalance   = ISNULL(u.WalletBalance, 0),
                    au.CredibilityScore = ISNULL(u.CredibilityScore, 3500),
                    au.ClientType      = ISNULL(u.ClientType, 0)
                FROM AuthUsers au
                INNER JOIN ApplicationUsers u ON au.Id = u.Id
            ");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "UserGroups");

            migrationBuilder.DropTable(
                name: "ApplicationUsers");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM AuthUsers WHERE Id = '11111111-1111-1111-1111-111111111111')
                BEGIN
                    INSERT INTO AuthUsers (Id, ClientType, CreatedAt, CredibilityScore, Email, FirebaseUid, Name, PasswordHash, Status, SuspendedUntil, TenantId, UserType, WalletBalance)
                    VALUES ('11111111-1111-1111-1111-111111111111', 1, '2025-12-29T00:00:00.0000000Z', 4200, N'alice.founder@example.com', NULL, N'Alice Founder', N'seeded', 1, NULL, NULL, N'Client', 100000.0);
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM AuthUsers WHERE Id = '22222222-2222-2222-2222-222222222222')
                BEGIN
                    INSERT INTO AuthUsers (Id, CreatedAt, CredibilityScore, Email, FirebaseUid, Name, PasswordHash, Status, SuspendedUntil, TenantId, UserType, WalletBalance)
                    VALUES ('22222222-2222-2222-2222-222222222222', '2025-12-29T00:00:00.0000000Z', 3750, N'bob.investor@example.com', NULL, N'Bob Investor', N'seeded', 1, NULL, NULL, N'Client', 25000.0);
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM AuthUsers WHERE Id = '33333333-3333-3333-3333-333333333333')
                BEGIN
                    INSERT INTO AuthUsers (Id, CreatedAt, CredibilityScore, Email, FirebaseUid, Name, PasswordHash, Status, SuspendedUntil, TenantId, UserType, WalletBalance)
                    VALUES ('33333333-3333-3333-3333-333333333333', '2025-12-29T00:00:00.0000000Z', 3600, N'clara.investor@example.com', NULL, N'Clara Investor', N'seeded', 1, NULL, NULL, N'Client', 15000.0);
                END
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_CreditTransactions_AuthUsers_AdminId",
                table: "CreditTransactions",
                column: "AdminId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CreditTransactions_AuthUsers_UserId",
                table: "CreditTransactions",
                column: "UserId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InvestmentParticipants_AuthUsers_InvestorId",
                table: "InvestmentParticipants",
                column: "InvestorId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Investments_AuthUsers_FounderId",
                table: "Investments",
                column: "FounderId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InvestmentTeamMembers_AuthUsers_UserId",
                table: "InvestmentTeamMembers",
                column: "UserId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScoreTransactions_AuthUsers_UserId",
                table: "ScoreTransactions",
                column: "UserId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_AuthUsers_WalletId",
                table: "Transactions",
                column: "WalletId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserProfiles_AuthUsers_UserId",
                table: "UserProfiles",
                column: "UserId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_AuthUsers_UserId",
                table: "UserRoles",
                column: "UserId",
                principalTable: "AuthUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CreditTransactions_AuthUsers_AdminId",
                table: "CreditTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_CreditTransactions_AuthUsers_UserId",
                table: "CreditTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_InvestmentParticipants_AuthUsers_InvestorId",
                table: "InvestmentParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_Investments_AuthUsers_FounderId",
                table: "Investments");

            migrationBuilder.DropForeignKey(
                name: "FK_InvestmentTeamMembers_AuthUsers_UserId",
                table: "InvestmentTeamMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_ScoreTransactions_AuthUsers_UserId",
                table: "ScoreTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_AuthUsers_WalletId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_UserProfiles_AuthUsers_UserId",
                table: "UserProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_AuthUsers_UserId",
                table: "UserRoles");

            migrationBuilder.DeleteData(
                table: "AuthUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "AuthUsers",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "AuthUsers",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DropColumn(
                name: "ClientType",
                table: "AuthUsers");

            migrationBuilder.DropColumn(
                name: "CredibilityScore",
                table: "AuthUsers");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "AuthUsers");

            migrationBuilder.DropColumn(
                name: "WalletBalance",
                table: "AuthUsers");

            migrationBuilder.AddColumn<Guid>(
                name: "AuthUserId",
                table: "UserRoles",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId1",
                table: "UserGroups",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "NotificationTemplates",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.CreateTable(
                name: "ApplicationUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientType = table.Column<int>(type: "int", nullable: false),
                    CredibilityScore = table.Column<int>(type: "int", nullable: false, defaultValue: 3500),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WalletBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EmployeeNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    HireDate = table.Column<DateTime>(type: "date", nullable: true),
                    PermissionsLevel = table.Column<byte>(type: "tinyint", nullable: false, defaultValue: (byte)1),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Employees_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "ApplicationUsers",
                columns: new[] { "Id", "ClientType", "CredibilityScore", "Email", "Name", "Role", "WalletBalance" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), 1, 4200, "alice.founder@example.com", "Alice Founder", "Client", 100000m },
                    { new Guid("22222222-2222-2222-2222-222222222222"), 0, 3750, "bob.investor@example.com", "Bob Investor", "Client", 25000m },
                    { new Guid("33333333-3333-3333-3333-333333333333"), 0, 3600, "clara.investor@example.com", "Clara Investor", "Client", 15000m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_UserId1",
                table: "UserGroups",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_EmployeeNumber",
                table: "Employees",
                column: "EmployeeNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UserId",
                table: "Employees",
                column: "UserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CreditTransactions_ApplicationUsers_AdminId",
                table: "CreditTransactions",
                column: "AdminId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CreditTransactions_ApplicationUsers_UserId",
                table: "CreditTransactions",
                column: "UserId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InvestmentParticipants_ApplicationUsers_InvestorId",
                table: "InvestmentParticipants",
                column: "InvestorId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Investments_ApplicationUsers_FounderId",
                table: "Investments",
                column: "FounderId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InvestmentTeamMembers_ApplicationUsers_UserId",
                table: "InvestmentTeamMembers",
                column: "UserId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScoreTransactions_ApplicationUsers_UserId",
                table: "ScoreTransactions",
                column: "UserId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_ApplicationUsers_WalletId",
                table: "Transactions",
                column: "WalletId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserGroups_ApplicationUsers_UserId1",
                table: "UserGroups",
                column: "UserId1",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserProfiles_ApplicationUsers_UserId",
                table: "UserProfiles",
                column: "UserId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_ApplicationUsers_UserId",
                table: "UserRoles",
                column: "UserId",
                principalTable: "ApplicationUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
