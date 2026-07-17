using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Investa.Infrastructure.Persistence;

#nullable disable

namespace Investa.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260711221838_AddReportsModeration")]
public partial class AddReportsModeration : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Reports",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                ReporterUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                TargetType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                TargetId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                ReasonCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                ReviewedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                ResolutionNote = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Reports", x => x.Id);
                table.ForeignKey("FK_Reports_AuthUsers_ReporterUserId", x => x.ReporterUserId, "AuthUsers", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_Reports_AuthUsers_ReviewedByUserId", x => x.ReviewedByUserId, "AuthUsers", "Id", onDelete: ReferentialAction.Restrict);
            });
        migrationBuilder.CreateIndex("IX_Reports_ReporterUserId_TargetType_TargetId", "Reports", new[] { "ReporterUserId", "TargetType", "TargetId" }, unique: true, filter: "[Status] = 'Pending'");
        migrationBuilder.CreateIndex("IX_Reports_ReporterUserId_TargetType_TargetId_Status", "Reports", new[] { "ReporterUserId", "TargetType", "TargetId", "Status" });
        migrationBuilder.CreateIndex("IX_Reports_ReviewedByUserId", "Reports", "ReviewedByUserId");
        migrationBuilder.CreateIndex("IX_Reports_Status_CreatedAt", "Reports", new[] { "Status", "CreatedAt" });
    }

    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropTable("Reports");
}
