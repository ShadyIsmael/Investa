using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations.ChatModule
{
    /// <inheritdoc />
    public partial class UpdateChatEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MessageAttachments_Messages_MessageId",
                table: "MessageAttachments");

            migrationBuilder.DropForeignKey(
                name: "FK_MessageReactions_Messages_MessageId",
                table: "MessageReactions");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "DekKeyId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "DekNonce",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "DekTag",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "DekVersion",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "Metadata",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "WrappedDek",
                table: "Conversations");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Conversations",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTimeOffset),
                oldType: "datetimeoffset",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AddColumn<string>(
                name: "AdminEmail",
                table: "Conversations",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Conversations",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "UserMobile",
                table: "Conversations",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    MessageText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatMessages_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ConversationId_Timestamp",
                table: "ChatMessages",
                columns: new[] { "ConversationId", "Timestamp" });

            migrationBuilder.AddForeignKey(
                name: "FK_MessageAttachments_ChatMessages_MessageId",
                table: "MessageAttachments",
                column: "MessageId",
                principalTable: "ChatMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MessageReactions_ChatMessages_MessageId",
                table: "MessageReactions",
                column: "MessageId",
                principalTable: "ChatMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MessageAttachments_ChatMessages_MessageId",
                table: "MessageAttachments");

            migrationBuilder.DropForeignKey(
                name: "FK_MessageReactions_ChatMessages_MessageId",
                table: "MessageReactions");

            migrationBuilder.DropTable(
                name: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "AdminEmail",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "UserMobile",
                table: "Conversations");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "CreatedAt",
                table: "Conversations",
                type: "datetimeoffset",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Conversations",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "DekKeyId",
                table: "Conversations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "DekNonce",
                table: "Conversations",
                type: "varbinary(64)",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "DekTag",
                table: "Conversations",
                type: "varbinary(64)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DekVersion",
                table: "Conversations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Conversations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Metadata",
                table: "Conversations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Conversations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "Type",
                table: "Conversations",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.AddColumn<byte[]>(
                name: "WrappedDek",
                table: "Conversations",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Algorithm = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "AES-GCM"),
                    CipherText = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "GETDATE()"),
                    EditedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    KeyId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Metadata = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Nonce = table.Column<byte[]>(type: "varbinary(64)", nullable: false),
                    ReplyToMessageId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tag = table.Column<byte[]>(type: "varbinary(64)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Messages_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ConversationId_CreatedAt",
                table: "Messages",
                columns: new[] { "ConversationId", "CreatedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_MessageAttachments_Messages_MessageId",
                table: "MessageAttachments",
                column: "MessageId",
                principalTable: "Messages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MessageReactions_Messages_MessageId",
                table: "MessageReactions",
                column: "MessageId",
                principalTable: "Messages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
