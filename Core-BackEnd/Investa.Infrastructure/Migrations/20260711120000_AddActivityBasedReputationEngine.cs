using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityBasedReputationEngine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
IF COL_LENGTH('ReputationRules', 'ActivityCode') IS NULL
BEGIN
    ALTER TABLE [ReputationRules] ADD [ActivityCode] nvarchar(100) NULL;
END;

IF COL_LENGTH('ReputationRules', 'RoleScope') IS NULL
BEGIN
    ALTER TABLE [ReputationRules] ADD [RoleScope] nvarchar(50) NOT NULL CONSTRAINT [DF_ReputationRules_RoleScope] DEFAULT ('Any');
END;

IF COL_LENGTH('ReputationRules', 'IsActive') IS NULL
BEGIN
    ALTER TABLE [ReputationRules] ADD [IsActive] bit NOT NULL CONSTRAINT [DF_ReputationRules_IsActive] DEFAULT (1);
END;
""");

            migrationBuilder.Sql("""
UPDATE [ReputationRules]
SET [ActivityCode] = COALESCE(NULLIF([ActivityCode], ''), [RuleCode])
WHERE [ActivityCode] IS NULL OR [ActivityCode] = '';

ALTER TABLE [ReputationRules] ALTER COLUMN [ActivityCode] nvarchar(100) NOT NULL;
""");

            migrationBuilder.Sql("""
IF COL_LENGTH('ReputationTransactions', 'ActivityCode') IS NULL
BEGIN
    ALTER TABLE [ReputationTransactions] ADD [ActivityCode] nvarchar(100) NULL;
END;

IF COL_LENGTH('ReputationTransactions', 'CreatedAt') IS NULL
BEGIN
    ALTER TABLE [ReputationTransactions] ADD [CreatedAt] datetime2 NOT NULL CONSTRAINT [DF_ReputationTransactions_CreatedAt] DEFAULT (SYSUTCDATETIME());
END;
""");

            migrationBuilder.Sql("""
UPDATE [ReputationTransactions]
SET [ActivityCode] = COALESCE(NULLIF(rt.[ActivityCode], ''), rr.[ActivityCode], rr.[RuleCode], 'LegacyReputation')
FROM [ReputationTransactions] rt
LEFT JOIN [ReputationRules] rr ON rr.[Id] = rt.[ReputationRuleId]
WHERE rt.[ActivityCode] IS NULL OR rt.[ActivityCode] = '';

ALTER TABLE [ReputationTransactions] ALTER COLUMN [ActivityCode] nvarchar(100) NOT NULL;
""");

            migrationBuilder.Sql("""
DECLARE @Rules TABLE (
    Id int NOT NULL,
    ActivityCode nvarchar(100) NOT NULL,
    Points int NOT NULL,
    RoleScope nvarchar(50) NOT NULL,
    Description nvarchar(200) NOT NULL
);

INSERT INTO @Rules (Id, ActivityCode, Points, RoleScope, Description)
VALUES
(101, 'CompleteProfile', 10, 'Any', 'Complete profile.'),
(102, 'PublishOpportunity', 15, 'Founder', 'Publish an opportunity.'),
(103, 'SendConversationRequest', 1, 'Investor', 'Send a conversation request.'),
(104, 'AcceptConversationRequest', 2, 'Founder', 'Accept a conversation request.'),
(105, 'SendStructuredOffer', 2, 'Any', 'Send a structured negotiation offer.'),
(106, 'AcceptStructuredOffer', 8, 'Any', 'Accept a structured negotiation offer.'),
(107, 'SubmitParticipationRequest', 5, 'Investor', 'Submit a participation request.'),
(108, 'ApproveParticipation', 15, 'Founder', 'Approve participation.'),
(109, 'BecomeParticipant', 15, 'Investor', 'Become an approved participant.'),
(110, 'AddProjectUpdate', 3, 'Founder', 'Add a project update.'),
(111, 'AddProjectMilestone', 5, 'Founder', 'Add a project milestone.'),
(112, 'CompleteProjectMilestone', 10, 'Founder', 'Complete a project milestone.'),
(113, 'UploadProjectDocument', 2, 'Founder', 'Upload a project document.'),
(114, 'WithdrawConversationRequest', -1, 'Investor', 'Withdraw a conversation request.'),
(115, 'WithdrawParticipationRequest', -2, 'Investor', 'Withdraw a participation request.'),
(116, 'CloseConversationWithoutAgreement', -2, 'Any', 'Close a conversation without agreement.'),
(117, 'ConfirmedUserReport', -20, 'Any', 'Confirmed user report.'),
(118, 'ConfirmedOpportunityReport', -25, 'Founder', 'Confirmed opportunity report.'),
(119, 'SpamBehaviorConfirmed', -30, 'Any', 'Spam behavior confirmed.');

MERGE [ReputationRules] AS target
USING @Rules AS source
ON target.[ActivityCode] = source.[ActivityCode]
WHEN MATCHED THEN
    UPDATE SET
        target.[RuleCode] = source.[ActivityCode],
        target.[Points] = source.[Points],
        target.[RoleScope] = source.[RoleScope],
        target.[Description] = source.[Description],
        target.[IsActive] = 1,
        target.[IsEnabled] = 1,
        target.[IsSystem] = 1,
        target.[IsAutomatic] = 1,
        target.[CanRepeat] = 1,
        target.[MaximumOccurrences] = 0,
        target.[SortOrder] = source.[Id],
        target.[UpdatedAt] = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
    INSERT ([RuleCode], [ActivityCode], [Description], [Points], [RoleScope], [IsActive], [IsEnabled], [IsSystem], [IsAutomatic], [CanRepeat], [MaximumOccurrences], [SortOrder], [CreatedAt], [UpdatedAt])
    VALUES (source.[ActivityCode], source.[ActivityCode], source.[Description], source.[Points], source.[RoleScope], 1, 1, 1, 1, 1, 0, source.[Id], SYSUTCDATETIME(), SYSUTCDATETIME());
""");

            migrationBuilder.Sql("""
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_ReputationRules_ActivityCode'
      AND object_id = OBJECT_ID('ReputationRules')
)
BEGIN
    CREATE UNIQUE INDEX [IX_ReputationRules_ActivityCode] ON [ReputationRules] ([ActivityCode]);
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_ReputationTransactions_UserId_ActivityCode_ReferenceType_ReferenceId'
      AND object_id = OBJECT_ID('ReputationTransactions')
)
BEGIN
    CREATE UNIQUE INDEX [IX_ReputationTransactions_UserId_ActivityCode_ReferenceType_ReferenceId]
    ON [ReputationTransactions] ([UserId], [ActivityCode], [ReferenceType], [ReferenceId])
    WHERE [ReferenceType] IS NOT NULL AND [ReferenceId] IS NOT NULL;
END;
""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_ReputationTransactions_UserId_ActivityCode_ReferenceType_ReferenceId'
      AND object_id = OBJECT_ID('ReputationTransactions')
)
BEGIN
    DROP INDEX [IX_ReputationTransactions_UserId_ActivityCode_ReferenceType_ReferenceId] ON [ReputationTransactions];
END;

IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_ReputationRules_ActivityCode'
      AND object_id = OBJECT_ID('ReputationRules')
)
BEGIN
    DROP INDEX [IX_ReputationRules_ActivityCode] ON [ReputationRules];
END;
""");
        }
    }
}
