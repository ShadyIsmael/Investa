using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImmutableProjectActivityTimeline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActorType",
                table: "OpportunityEvents",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "OpportunityEvents",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsImmutableTimelineEntry",
                table: "OpportunityEvents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LocalizedMetadataJson",
                table: "OpportunityEvents",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RelatedEntityId",
                table: "OpportunityEvents",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RelatedEntityType",
                table: "OpportunityEvents",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityEvents_IdempotencyKey",
                table: "OpportunityEvents",
                column: "IdempotencyKey",
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OpportunityEvents_IdempotencyKey",
                table: "OpportunityEvents");

            migrationBuilder.DropColumn(
                name: "ActorType",
                table: "OpportunityEvents");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "OpportunityEvents");

            migrationBuilder.DropColumn(
                name: "IsImmutableTimelineEntry",
                table: "OpportunityEvents");

            migrationBuilder.DropColumn(
                name: "LocalizedMetadataJson",
                table: "OpportunityEvents");

            migrationBuilder.DropColumn(
                name: "RelatedEntityId",
                table: "OpportunityEvents");

            migrationBuilder.DropColumn(
                name: "RelatedEntityType",
                table: "OpportunityEvents");
        }
    }
}
