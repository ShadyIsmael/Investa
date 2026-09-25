using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260823182000_AddProjectOpportunityStageUniqueness")]
public partial class AddProjectOpportunityStageUniqueness : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "ProjectStageCustomName",
            table: "Opportunities",
            type: "nvarchar(120)",
            maxLength: 120,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "ProjectStageCustomNameNormalized",
            table: "Opportunities",
            type: "nvarchar(120)",
            maxLength: 120,
            nullable: true);

        // Existing projects may pre-date milestone uniqueness. Retain every
        // opportunity by converting only subsequent duplicate standard stages
        // into distinct legacy Other milestones before adding the constraint.
        migrationBuilder.Sql("""
            ;WITH DuplicateStages AS
            (
                SELECT [Id], [ProjectStage],
                    ROW_NUMBER() OVER (PARTITION BY [ProjectId], [ProjectStage] ORDER BY [CreatedAt], [Id]) AS [Position]
                FROM [Opportunities]
                WHERE [ProjectStage] <> 'Other'
            )
            UPDATE o
            SET [ProjectStage] = 'Other',
                [ProjectStageCustomName] = CONCAT(N'Legacy ', d.[ProjectStage], N' milestone #', o.[Id]),
                [ProjectStageCustomNameNormalized] = UPPER(CONCAT(N'Legacy ', d.[ProjectStage], N' milestone #', o.[Id]))
            FROM [Opportunities] o
            INNER JOIN DuplicateStages d ON d.[Id] = o.[Id]
            WHERE d.[Position] > 1;
            """);

        migrationBuilder.AddCheckConstraint(
            name: "CK_Opportunities_ProjectStageCustomName",
            table: "Opportunities",
            sql: "([ProjectStage] <> 'Other' AND [ProjectStageCustomName] IS NULL AND [ProjectStageCustomNameNormalized] IS NULL) OR ([ProjectStage] = 'Other' AND [ProjectStageCustomName] IS NOT NULL AND [ProjectStageCustomNameNormalized] IS NOT NULL)");

        migrationBuilder.CreateIndex(
            name: "UX_Opportunities_Project_StandardStage",
            table: "Opportunities",
            columns: new[] { "ProjectId", "ProjectStage" },
            unique: true,
            filter: "[ProjectStage] <> 'Other'");

        migrationBuilder.CreateIndex(
            name: "UX_Opportunities_Project_OtherStage",
            table: "Opportunities",
            columns: new[] { "ProjectId", "ProjectStageCustomNameNormalized" },
            unique: true,
            filter: "[ProjectStage] = 'Other' AND [ProjectStageCustomNameNormalized] IS NOT NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "UX_Opportunities_Project_StandardStage", table: "Opportunities");
        migrationBuilder.DropIndex(name: "UX_Opportunities_Project_OtherStage", table: "Opportunities");
        migrationBuilder.DropCheckConstraint(name: "CK_Opportunities_ProjectStageCustomName", table: "Opportunities");
        migrationBuilder.DropColumn(name: "ProjectStageCustomName", table: "Opportunities");
        migrationBuilder.DropColumn(name: "ProjectStageCustomNameNormalized", table: "Opportunities");
    }
}
