using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOpportunityFileStoreMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FileId",
                table: "OpportunityMedia",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileKey",
                table: "OpportunityMedia",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "OpportunityMedia",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MimeType",
                table: "OpportunityMedia",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreviewUrl",
                table: "OpportunityMedia",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "OpportunityMedia",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileId",
                table: "OpportunityDocuments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileKey",
                table: "OpportunityDocuments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "OpportunityDocuments",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MimeType",
                table: "OpportunityDocuments",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreviewUrl",
                table: "OpportunityDocuments",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "OpportunityDocuments",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityMedia_FileId",
                table: "OpportunityMedia",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityMedia_FileKey",
                table: "OpportunityMedia",
                column: "FileKey");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityDocuments_FileId",
                table: "OpportunityDocuments",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityDocuments_FileKey",
                table: "OpportunityDocuments",
                column: "FileKey");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OpportunityMedia_FileId",
                table: "OpportunityMedia");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityMedia_FileKey",
                table: "OpportunityMedia");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityDocuments_FileId",
                table: "OpportunityDocuments");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityDocuments_FileKey",
                table: "OpportunityDocuments");

            migrationBuilder.DropColumn(
                name: "FileId",
                table: "OpportunityMedia");

            migrationBuilder.DropColumn(
                name: "FileKey",
                table: "OpportunityMedia");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "OpportunityMedia");

            migrationBuilder.DropColumn(
                name: "MimeType",
                table: "OpportunityMedia");

            migrationBuilder.DropColumn(
                name: "PreviewUrl",
                table: "OpportunityMedia");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "OpportunityMedia");

            migrationBuilder.DropColumn(
                name: "FileId",
                table: "OpportunityDocuments");

            migrationBuilder.DropColumn(
                name: "FileKey",
                table: "OpportunityDocuments");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "OpportunityDocuments");

            migrationBuilder.DropColumn(
                name: "MimeType",
                table: "OpportunityDocuments");

            migrationBuilder.DropColumn(
                name: "PreviewUrl",
                table: "OpportunityDocuments");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "OpportunityDocuments");
        }
    }
}
