using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ResyncAuthUserReputationLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH('AuthUsers', 'ReputationLevel') IS NULL
                BEGIN
                    ALTER TABLE [AuthUsers]
                    ADD [ReputationLevel] nvarchar(80) NOT NULL
                    CONSTRAINT [DF_AuthUsers_ReputationLevel] DEFAULT N'Rising Member';
                END

                UPDATE [AuthUsers]
                SET [ReputationLevel] = N'Rising Member'
                WHERE [ReputationLevel] IS NULL OR [ReputationLevel] = N'';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
