using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnsureProfileCompanyColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('UserProfiles', 'CompanyName') IS NULL
    ALTER TABLE [UserProfiles] ADD [CompanyName] nvarchar(200) NULL;

IF COL_LENGTH('UserProfiles', 'CompanyAddress') IS NULL
    ALTER TABLE [UserProfiles] ADD [CompanyAddress] nvarchar(500) NULL;

IF COL_LENGTH('UserProfiles', 'CompanyEmail') IS NULL
    ALTER TABLE [UserProfiles] ADD [CompanyEmail] nvarchar(150) NULL;

IF COL_LENGTH('UserProfiles', 'HrLetterFileName') IS NULL
    ALTER TABLE [UserProfiles] ADD [HrLetterFileName] nvarchar(260) NULL;

IF COL_LENGTH('UserProfiles', 'HrLetterBase64') IS NULL
    ALTER TABLE [UserProfiles] ADD [HrLetterBase64] nvarchar(max) NULL;

IF COL_LENGTH('UserProfiles', 'DeviceMacAddress') IS NULL
    ALTER TABLE [UserProfiles] ADD [DeviceMacAddress] nvarchar(100) NULL;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('UserProfiles', 'DeviceMacAddress') IS NOT NULL
    ALTER TABLE [UserProfiles] DROP COLUMN [DeviceMacAddress];

IF COL_LENGTH('UserProfiles', 'HrLetterBase64') IS NOT NULL
    ALTER TABLE [UserProfiles] DROP COLUMN [HrLetterBase64];

IF COL_LENGTH('UserProfiles', 'HrLetterFileName') IS NOT NULL
    ALTER TABLE [UserProfiles] DROP COLUMN [HrLetterFileName];

IF COL_LENGTH('UserProfiles', 'CompanyEmail') IS NOT NULL
    ALTER TABLE [UserProfiles] DROP COLUMN [CompanyEmail];

IF COL_LENGTH('UserProfiles', 'CompanyAddress') IS NOT NULL
    ALTER TABLE [UserProfiles] DROP COLUMN [CompanyAddress];

IF COL_LENGTH('UserProfiles', 'CompanyName') IS NOT NULL
    ALTER TABLE [UserProfiles] DROP COLUMN [CompanyName];
");
        }
    }
}
