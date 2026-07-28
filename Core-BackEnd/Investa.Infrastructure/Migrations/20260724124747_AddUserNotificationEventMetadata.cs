using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserNotificationEventMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ActorUserId",
                table: "UserNotifications",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventType",
                table: "UserNotifications",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "UserNotifications",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OpportunityId",
                table: "UserNotifications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RelatedEntityId",
                table: "UserNotifications",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_IdempotencyKey",
                table: "UserNotifications",
                column: "IdempotencyKey",
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserNotifications_IdempotencyKey",
                table: "UserNotifications");

            migrationBuilder.DropColumn(
                name: "ActorUserId",
                table: "UserNotifications");

            migrationBuilder.DropColumn(
                name: "EventType",
                table: "UserNotifications");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "UserNotifications");

            migrationBuilder.DropColumn(
                name: "OpportunityId",
                table: "UserNotifications");

            migrationBuilder.DropColumn(
                name: "RelatedEntityId",
                table: "UserNotifications");
        }
    }
}
