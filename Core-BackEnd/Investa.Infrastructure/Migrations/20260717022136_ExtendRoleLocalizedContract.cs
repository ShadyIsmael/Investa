using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ExtendRoleLocalizedContract : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "RoleCodeSequence");

            migrationBuilder.AddColumn<string>(
                name: "DescriptionAr",
                table: "Roles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionEn",
                table: "Roles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameAr",
                table: "Roles",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameEn",
                table: "Roles",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RoleNumber",
                table: "Roles",
                type: "bigint",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE [Roles]
                SET [NameEn] = [Name],
                    [NameAr] = [Name],
                    [DescriptionEn] = [Description],
                    [DescriptionAr] = [Description],
                    [RoleNumber] = NEXT VALUE FOR [RoleCodeSequence];
                """);

            migrationBuilder.AlterColumn<string>(
                name: "NameEn",
                table: "Roles",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NameAr",
                table: "Roles",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "RoleNumber",
                table: "Roles",
                type: "bigint",
                nullable: false,
                defaultValueSql: "NEXT VALUE FOR [RoleCodeSequence]",
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoleCode",
                table: "Roles",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                computedColumnSql: "'ROL-' + CASE WHEN LEN(CONVERT(varchar(20), [RoleNumber])) < 6 THEN REPLICATE('0', 6 - LEN(CONVERT(varchar(20), [RoleNumber]))) ELSE '' END + CONVERT(varchar(20), [RoleNumber])",
                stored: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_RoleCode",
                table: "Roles",
                column: "RoleCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Roles_RoleCode",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "RoleCode",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "DescriptionAr",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "DescriptionEn",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "NameAr",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "NameEn",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "RoleNumber",
                table: "Roles");

            migrationBuilder.DropSequence(
                name: "RoleCodeSequence");
        }
    }
}
