using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOpportunityType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE [Opportunities] SET [Type] = N'Opportunity' WHERE [Type] = N'FundingCampaign';");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Opportunities",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "Opportunity",
                oldClrType: typeof(string),
                oldType: "nvarchar(80)",
                oldMaxLength: 80,
                oldDefaultValue: "FundingCampaign");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Opportunities",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "FundingCampaign",
                oldClrType: typeof(string),
                oldType: "nvarchar(80)",
                oldMaxLength: 80,
                oldDefaultValue: "Opportunity");

            migrationBuilder.Sql(
                "UPDATE [Opportunities] SET [Type] = N'FundingCampaign' WHERE [Type] = N'Opportunity';");
        }
    }
}
