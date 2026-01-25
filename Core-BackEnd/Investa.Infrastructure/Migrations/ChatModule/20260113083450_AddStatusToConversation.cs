using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations.ChatModule
{
    // Migration neutralized during consolidation.
    public partial class AddStatusToConversation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder) { }
        protected override void Down(MigrationBuilder migrationBuilder) { }
    }
}
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Conversations",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Conversations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "Pending");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Conversations");
        }
    }
}
