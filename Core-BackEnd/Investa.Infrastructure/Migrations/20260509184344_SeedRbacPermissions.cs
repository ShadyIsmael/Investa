using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedRbacPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AuthUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "AuthUsers",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "AuthUsers",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "CreatedAt", "Description", "Key", "Name" },
                values: new object[,]
                {
                    { 2006, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "View groups, roles, and permission assignments", "RBAC.View", "View RBAC" },
                    { 2007, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Create, update, delete groups and assign group permissions", "Group.Manage", "Manage Groups" },
                    { 2008, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Create, update, delete roles and assign role permissions/users", "Role.Manage", "Manage Roles" }
                });

            migrationBuilder.InsertData(
                table: "GroupPermissions",
                columns: new[] { "Id", "ApplicationPermissionId", "AssignedAt", "AssignedBy", "GroupId", "PermissionId" },
                values: new object[,]
                {
                    { 7, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2006 },
                    { 8, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2007 },
                    { 9, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2008 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "GroupPermissions",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 2006);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 2007);

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: 2008);

            migrationBuilder.UpdateData(
                table: "AuthUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 5, 9, 13, 4, 53, 469, DateTimeKind.Utc).AddTicks(587));

            migrationBuilder.UpdateData(
                table: "AuthUsers",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 5, 9, 13, 4, 53, 469, DateTimeKind.Utc).AddTicks(4218));

            migrationBuilder.UpdateData(
                table: "AuthUsers",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 5, 9, 13, 4, 53, 469, DateTimeKind.Utc).AddTicks(4287));
        }
    }
}
