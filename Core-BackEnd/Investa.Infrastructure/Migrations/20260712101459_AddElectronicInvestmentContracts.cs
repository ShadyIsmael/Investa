using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations;

public partial class AddElectronicInvestmentContracts : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "InvestmentContracts",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                ContractNumber = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                OpportunityId = table.Column<int>(type: "int", nullable: false),
                FounderUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                InvestmentModel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                CurrentVersionNumber = table.Column<int>(type: "int", nullable: false),
                Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_InvestmentContracts", x => x.Id);
                table.ForeignKey("FK_InvestmentContracts_AuthUsers_FounderUserId", x => x.FounderUserId, "AuthUsers", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_InvestmentContracts_AuthUsers_InvestorUserId", x => x.InvestorUserId, "AuthUsers", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_InvestmentContracts_Opportunities_OpportunityId", x => x.OpportunityId, "Opportunities", "Id", onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "InvestmentContractVersions",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                ContractId = table.Column<int>(type: "int", nullable: false),
                VersionNumber = table.Column<int>(type: "int", nullable: false),
                VersionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                PreviousVersionId = table.Column<int>(type: "int", nullable: true),
                SourceParticipationRequestId = table.Column<int>(type: "int", nullable: false),
                SourceNegotiationOfferId = table.Column<int>(type: "int", nullable: true),
                Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                TermsSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                PreviousTermsSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                ChangesSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                DocumentUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                DocumentHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                DocumentContent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_InvestmentContractVersions", x => x.Id);
                table.ForeignKey("FK_InvestmentContractVersions_InvestmentContracts_ContractId", x => x.ContractId, "InvestmentContracts", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_InvestmentContractVersions_InvestmentContractVersions_PreviousVersionId", x => x.PreviousVersionId, "InvestmentContractVersions", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_InvestmentContractVersions_NegotiationOffers_SourceNegotiationOfferId", x => x.SourceNegotiationOfferId, "NegotiationOffers", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_InvestmentContractVersions_OpportunityJoinRequests_SourceParticipationRequestId", x => x.SourceParticipationRequestId, "OpportunityJoinRequests", "Id", onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "ContractEvents",
            columns: table => new
            {
                Id = table.Column<long>(type: "bigint", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                ContractVersionId = table.Column<int>(type: "int", nullable: false),
                EventType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                PerformedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ContractEvents", x => x.Id);
                table.ForeignKey("FK_ContractEvents_AuthUsers_PerformedByUserId", x => x.PerformedByUserId, "AuthUsers", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_ContractEvents_InvestmentContractVersions_ContractVersionId", x => x.ContractVersionId, "InvestmentContractVersions", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex("IX_InvestmentContracts_ContractNumber", "InvestmentContracts", "ContractNumber", unique: true);
        migrationBuilder.CreateIndex("IX_InvestmentContracts_FounderUserId", "InvestmentContracts", "FounderUserId");
        migrationBuilder.CreateIndex("IX_InvestmentContracts_InvestorUserId", "InvestmentContracts", "InvestorUserId");
        migrationBuilder.CreateIndex("IX_InvestmentContracts_OpportunityId_FounderUserId_InvestorUserId_InvestmentModel", "InvestmentContracts", new[] { "OpportunityId", "FounderUserId", "InvestorUserId", "InvestmentModel" }, unique: true);
        migrationBuilder.CreateIndex("IX_InvestmentContractVersions_ContractId", "InvestmentContractVersions", "ContractId", unique: true, filter: "[Status] = 'Active'");
        migrationBuilder.CreateIndex("IX_InvestmentContractVersions_ContractId_VersionNumber", "InvestmentContractVersions", new[] { "ContractId", "VersionNumber" }, unique: true);
        migrationBuilder.CreateIndex("IX_InvestmentContractVersions_PreviousVersionId", "InvestmentContractVersions", "PreviousVersionId");
        migrationBuilder.CreateIndex("IX_InvestmentContractVersions_SourceNegotiationOfferId", "InvestmentContractVersions", "SourceNegotiationOfferId");
        migrationBuilder.CreateIndex("IX_InvestmentContractVersions_SourceParticipationRequestId", "InvestmentContractVersions", "SourceParticipationRequestId", unique: true);
        migrationBuilder.CreateIndex("IX_ContractEvents_ContractVersionId_CreatedAt", "ContractEvents", new[] { "ContractVersionId", "CreatedAt" });
        migrationBuilder.CreateIndex("IX_ContractEvents_PerformedByUserId", "ContractEvents", "PerformedByUserId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("ContractEvents");
        migrationBuilder.DropTable("InvestmentContractVersions");
        migrationBuilder.DropTable("InvestmentContracts");
    }
}
