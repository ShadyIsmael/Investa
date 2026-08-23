using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations;

public partial class FixReputationActivityCodeUniqueness : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_ReputationRules_ActivityCode",
            table: "ReputationRules");

        migrationBuilder.AlterColumn<string>(
            name: "ActivityCode",
            table: "ReputationRules",
            type: "nvarchar(100)",
            maxLength: 100,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "nvarchar(100)",
            oldMaxLength: 100);

        migrationBuilder.Sql(
            "UPDATE [ReputationRules] SET [ActivityCode] = NULL WHERE [ActivityCode] = '';");

        migrationBuilder.CreateIndex(
            name: "IX_ReputationRules_ActivityCode",
            table: "ReputationRules",
            column: "ActivityCode",
            unique: true,
            filter: "[ActivityCode] IS NOT NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_ReputationRules_ActivityCode",
            table: "ReputationRules");

        migrationBuilder.Sql(
            "UPDATE [ReputationRules] SET [ActivityCode] = [RuleCode] WHERE [ActivityCode] IS NULL;");

        migrationBuilder.AlterColumn<string>(
            name: "ActivityCode",
            table: "ReputationRules",
            type: "nvarchar(100)",
            maxLength: 100,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "nvarchar(100)",
            oldMaxLength: 100,
            oldNullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_ReputationRules_ActivityCode",
            table: "ReputationRules",
            column: "ActivityCode",
            unique: true);
    }
}
