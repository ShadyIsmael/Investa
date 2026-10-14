using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProfitSharingEvidenceFileCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "FileCategories",
                columns: new[] { "Id", "AllowedExtensions", "AllowedMimeTypes", "Code", "CreatedAt", "CreatedByUserId", "DescriptionAr", "DescriptionEn", "IsActive", "MaxFileSizeBytes", "MaxFilesPerEntity", "NameAr", "NameEn", "SortOrder", "UpdatedAt", "UpdatedByUserId" },
                values: new object[] { 20, ".pdf,.jpg,.jpeg,.png,.webp", "application/pdf,image/jpeg,image/png,image/webp", "PROFIT_SHARING_EVIDENCE", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 26214400L, null, "إثبات مشاركة الأرباح", "Profit Sharing evidence", 20, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FileCategories",
                keyColumn: "Id",
                keyValue: 20);
        }
    }
}
