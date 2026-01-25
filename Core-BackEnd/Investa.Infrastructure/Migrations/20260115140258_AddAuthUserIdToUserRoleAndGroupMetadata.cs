using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    // Migration neutralized during consolidation.
    public partial class AddAuthUserIdToUserRoleAndGroupMetadata : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder) { }
        protected override void Down(MigrationBuilder migrationBuilder) { }
    }
}
            migrationBuilder.AddColumn<Guid>(
                name: "AuthUserId",
                table: "UserRoles",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MetadataJson",
                table: "Groups",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.Sql(@"UPDATE ur
    SET AuthUserId = u.Id
    FROM UserRoles ur
    INNER JOIN AuthUsers u ON ur.UserId = u.Id
    WHERE ur.AuthUserId IS NULL;");

            migrationBuilder.UpdateData(
                table: "Groups",
                keyColumn: "Id",
                keyValue: 1000,
                column: "MetadataJson",
                value: null);

            migrationBuilder.UpdateData(
                table: "Groups",
                keyColumn: "Id",
                keyValue: 1001,
                column: "MetadataJson",
                value: null);

            migrationBuilder.UpdateData(
                table: "Groups",
                keyColumn: "Id",
                keyValue: 1002,
                column: "MetadataJson",
                value: null);

            migrationBuilder.UpdateData(
                table: "Groups",
                keyColumn: "Id",
                keyValue: 1003,
                column: "MetadataJson",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AuthUserId",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "MetadataJson",
                table: "Groups");
        }
    }
}
