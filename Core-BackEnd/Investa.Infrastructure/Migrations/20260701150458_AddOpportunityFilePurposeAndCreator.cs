using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOpportunityFilePurposeAndCreator : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "OpportunityMedia",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Purpose",
                table: "OpportunityMedia",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "General");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "OpportunityDocuments",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Purpose",
                table: "OpportunityDocuments",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "General");

            migrationBuilder.Sql("""
                UPDATE m
                SET m.CreatedByUserId = o.FounderId
                FROM OpportunityMedia m
                INNER JOIN Opportunities o ON o.Id = m.OpportunityId
                WHERE m.CreatedByUserId = '00000000-0000-0000-0000-000000000000';

                UPDATE d
                SET d.CreatedByUserId = o.FounderId
                FROM OpportunityDocuments d
                INNER JOIN Opportunities o ON o.Id = d.OpportunityId
                WHERE d.CreatedByUserId = '00000000-0000-0000-0000-000000000000';

                UPDATE OpportunityMedia
                SET Purpose = 'Cover', IsPublic = 1
                WHERE IsCover = 1 OR LOWER(MediaType) = 'cover';

                UPDATE OpportunityMedia
                SET Purpose = 'Gallery', IsPublic = 1
                WHERE Purpose = 'General' AND LOWER(MediaType) = 'gallery';

                UPDATE OpportunityMedia
                SET Purpose = 'PitchVideo', IsPublic = 1
                WHERE Purpose = 'General' AND LOWER(MediaType) IN ('video', 'pitchvideo');

                UPDATE OpportunityDocuments
                SET Purpose = 'FinancialReport'
                WHERE LOWER(DocumentType) LIKE '%financial%' OR LOWER(Category) LIKE '%financial%';

                UPDATE OpportunityDocuments
                SET Purpose = 'Contract'
                WHERE Purpose = 'General' AND (LOWER(DocumentType) LIKE '%contract%' OR LOWER(Category) LIKE '%contract%');

                UPDATE OpportunityDocuments
                SET Purpose = 'Legal'
                WHERE Purpose = 'General' AND (LOWER(DocumentType) LIKE '%legal%' OR LOWER(Category) LIKE '%legal%');

                UPDATE OpportunityDocuments
                SET Purpose = 'InternalFile'
                WHERE Purpose = 'General' AND (LOWER(DocumentType) LIKE '%internal%' OR LOWER(Category) LIKE '%internal%');

                UPDATE OpportunityDocuments
                SET Purpose = 'PublicDocument'
                WHERE Purpose = 'General' AND Visibility = 'Public';

                UPDATE OpportunityDocuments
                SET Purpose = 'PrivateDocument'
                WHERE Purpose = 'General' AND Visibility = 'Private';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "OpportunityMedia");

            migrationBuilder.DropColumn(
                name: "Purpose",
                table: "OpportunityMedia");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "OpportunityDocuments");

            migrationBuilder.DropColumn(
                name: "Purpose",
                table: "OpportunityDocuments");
        }
    }
}
