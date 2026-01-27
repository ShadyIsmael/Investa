using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations.ChatModule
{
    // Migration neutralized during consolidation.
    public partial class UpdateChatMessageToSupportSession : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder) { }
        protected override void Down(MigrationBuilder migrationBuilder) { }
    }
}
            migrationBuilder.AddColumn<Guid>(
                name: "SupportSessionId",
                table: "ChatMessages",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SupportSessionId_Timestamp",
                table: "ChatMessages",
                columns: new[] { "SupportSessionId", "Timestamp" });

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_SupportSessions_SupportSessionId",
                table: "ChatMessages",
                column: "SupportSessionId",
                principalTable: "SupportSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_SupportSessions_SupportSessionId",
                table: "ChatMessages");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_SupportSessionId_Timestamp",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "SupportSessionId",
                table: "ChatMessages");
        }
    }
}
