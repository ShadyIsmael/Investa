using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BusinessMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SenderId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    MessageText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BusinessMessages_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BusinessMessages_Conversations_ConversationId1",
                        column: x => x.ConversationId1,
                        principalTable: "Conversations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_BusinessMessages_ConversationId_Timestamp",
                table: "BusinessMessages",
                columns: new[] { "ConversationId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_BusinessMessages_ConversationId1",
                table: "BusinessMessages",
                column: "ConversationId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BusinessMessages");
        }
    }
}
