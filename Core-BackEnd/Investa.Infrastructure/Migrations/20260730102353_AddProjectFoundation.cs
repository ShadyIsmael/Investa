using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FounderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LegalName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Slug = table.Column<string>(type: "nvarchar(220)", maxLength: 220, nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    Industry = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    BusinessStage = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Geography = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TagsSnapshotJson = table.Column<string>(type: "nvarchar(max)", maxLength: 2000, nullable: false, defaultValue: "[]"),
                    FoundedOn = table.Column<DateOnly>(type: "date", nullable: true),
                    WebsiteUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TeamDescription = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    BusinessModel = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RiskLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RiskDisclosure = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ArchiveReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    SourceOpportunityId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.UniqueConstraint("AK_Projects_Id_FounderId", x => new { x.Id, x.FounderId });
                    table.ForeignKey(
                        name: "FK_Projects_AuthUsers_FounderId",
                        column: x => x.FounderId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Projects_OpportunityCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "OpportunityCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddColumn<int>(
                name: "ProjectId",
                table: "Opportunities",
                type: "int",
                nullable: true);

            // Deliberately creates one Project per Opportunity. The source ID is
            // a temporary migration correlation only; no title/founder matching or
            // automatic grouping is performed.
            migrationBuilder.Sql(
                """
                INSERT INTO [Projects]
                    ([FounderId], [DisplayName], [LegalName], [Slug], [Summary], [Description],
                     [CategoryId], [Industry], [BusinessStage], [Geography], [TagsSnapshotJson],
                     [FoundedOn], [WebsiteUrl], [LogoUrl], [TeamDescription], [BusinessModel],
                     [RiskLevel], [RiskDisclosure], [Status], [ArchiveReason], [CreatedAt],
                     [UpdatedAt], [SourceOpportunityId])
                SELECT
                    o.[FounderId],
                    LEFT(COALESCE(NULLIF(o.[Title], ''), CONCAT('Project ', o.[Id])), 200),
                    NULL,
                    CONCAT('project-', o.[Id]),
                    LEFT(COALESCE(NULLIF(o.[ShortDescription], ''), NULLIF(o.[Title], ''), CONCAT('Project ', o.[Id])), 500),
                    LEFT(COALESCE(NULLIF(o.[Description], ''), NULLIF(o.[ShortDescription], ''), NULLIF(o.[Title], ''), CONCAT('Project ', o.[Id])), 4000),
                    o.[CategoryId],
                    LEFT(c.[Name], 150),
                    o.[ProjectStage],
                    NULL,
                    '[]',
                    NULL,
                    NULL,
                    o.[CoverImageUrl],
                    NULL,
                    NULL,
                    NULL,
                    NULL,
                    'Draft',
                    NULL,
                    o.[CreatedAt],
                    o.[UpdatedAt],
                    o.[Id]
                FROM [Opportunities] o
                LEFT JOIN [OpportunityCategories] c ON c.[Id] = o.[CategoryId];

                UPDATE o
                SET o.[ProjectId] = p.[Id]
                FROM [Opportunities] o
                INNER JOIN [Projects] p ON p.[SourceOpportunityId] = o.[Id];

                IF EXISTS (SELECT 1 FROM [Opportunities] WHERE [ProjectId] IS NULL)
                    THROW 51000, 'Project foundation backfill failed: an Opportunity has no Project.', 1;
                """);

            migrationBuilder.AlterColumn<int>(
                name: "ProjectId",
                table: "Opportunities",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "SourceOpportunityId",
                table: "Projects");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ProjectId",
                table: "Opportunities",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ProjectId_FounderId",
                table: "Opportunities",
                columns: new[] { "ProjectId", "FounderId" });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_CategoryId",
                table: "Projects",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_FounderId",
                table: "Projects",
                column: "FounderId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Slug",
                table: "Projects",
                column: "Slug",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Opportunities_Projects_ProjectId_FounderId",
                table: "Opportunities",
                columns: new[] { "ProjectId", "FounderId" },
                principalTable: "Projects",
                principalColumns: new[] { "Id", "FounderId" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Opportunities_Projects_ProjectId_FounderId",
                table: "Opportunities");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Opportunities_ProjectId",
                table: "Opportunities");

            migrationBuilder.DropIndex(
                name: "IX_Opportunities_ProjectId_FounderId",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "Opportunities");
        }
    }
}
