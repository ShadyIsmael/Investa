using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Investa.Infrastructure.Persistence;

#nullable disable

namespace Investa.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260823190000_MoveCategoryOwnershipToProject")]
public partial class MoveCategoryOwnershipToProject : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Preserve the earliest assigned opportunity category as the Project category
        // when a project does not already have one, before removing the duplicate field.
        migrationBuilder.Sql(@"
;WITH RankedCategories AS
(
    SELECT o.ProjectId, o.CategoryId,
           ROW_NUMBER() OVER (PARTITION BY o.ProjectId ORDER BY o.CreatedAt, o.Id) AS RowNumber
    FROM Opportunities o
    WHERE o.CategoryId IS NOT NULL
)
UPDATE p
SET CategoryId = r.CategoryId
FROM Projects p
INNER JOIN RankedCategories r ON r.ProjectId = p.Id AND r.RowNumber = 1
WHERE p.CategoryId IS NULL;");

        migrationBuilder.DropForeignKey(
            name: "FK_Opportunities_OpportunityCategories_CategoryId",
            table: "Opportunities");

        migrationBuilder.DropIndex(
            name: "IX_Opportunities_CategoryId",
            table: "Opportunities");

        migrationBuilder.DropColumn(
            name: "CategoryId",
            table: "Opportunities");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "CategoryId",
            table: "Opportunities",
            type: "int",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Opportunities_CategoryId",
            table: "Opportunities",
            column: "CategoryId");

        migrationBuilder.AddForeignKey(
            name: "FK_Opportunities_OpportunityCategories_CategoryId",
            table: "Opportunities",
            column: "CategoryId",
            principalTable: "OpportunityCategories",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }
}
