using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectDefaultCurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DefaultCurrency",
                table: "Projects",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "EGP");

            // Safe backfill: existing Projects adopt their Founder's preferred currency
            // when it references an active Currency Master record; otherwise they keep
            // the platform default. Historical data is never re-priced.
            migrationBuilder.Sql(
                """
                UPDATE p
                SET p.[DefaultCurrency] = COALESCE(
                    (SELECT TOP (1) up.[PreferredCurrency]
                       FROM [UserProfiles] up
                       INNER JOIN [Currencies] c ON c.[ISOCode] = up.[PreferredCurrency]
                      WHERE up.[UserId] = p.[FounderId]
                        AND LEN(up.[PreferredCurrency]) = 3
                        AND c.[IsActive] = 1),
                    'EGP')
                FROM [Projects] p
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultCurrency",
                table: "Projects");
        }
    }
}
