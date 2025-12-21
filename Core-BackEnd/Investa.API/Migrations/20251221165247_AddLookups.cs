using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Investa.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLookups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Lookups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lookups", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Lookups",
                columns: new[] { "Id", "Key", "SortOrder", "Type", "Value" },
                values: new object[,]
                {
                    { 1, "Initiation", 1, 1, "Initiation" },
                    { 2, "Planning", 2, 1, "Planning" },
                    { 3, "Execution", 3, 1, "Execution" },
                    { 4, "Running", 4, 1, "Running" },
                    { 5, "Expanding", 5, 1, "Expanding" },
                    { 100, "Technology", 1, 2, "Technology" },
                    { 101, "Industry", 2, 2, "Industry" },
                    { 102, "Trading", 3, 2, "Trading" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Lookups");
        }
    }
}
