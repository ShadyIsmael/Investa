using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReputationTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReputationRules')
BEGIN
    CREATE TABLE [ReputationRules] (
        [Id] int NOT NULL IDENTITY,
        [RuleCode] nvarchar(50) NOT NULL,
        [Description] nvarchar(200) NOT NULL,
        [Points] int NOT NULL,
        [IsEnabled] bit NOT NULL DEFAULT CAST(1 AS bit),
        [IsSystem] bit NOT NULL DEFAULT CAST(1 AS bit),
        [IsAutomatic] bit NOT NULL DEFAULT CAST(1 AS bit),
        [CanRepeat] bit NOT NULL DEFAULT CAST(0 AS bit),
        [MaximumOccurrences] int NOT NULL DEFAULT 1,
        [SortOrder] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] datetime2 NULL,
        [CreatedByUserId] uniqueidentifier NULL,
        CONSTRAINT [PK_ReputationRules] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ReputationRules_AuthUsers_CreatedByUserId] FOREIGN KEY ([CreatedByUserId]) REFERENCES [AuthUsers] ([Id]) ON DELETE SET NULL
    );
    CREATE UNIQUE INDEX [IX_ReputationRules_RuleCode] ON [ReputationRules] ([RuleCode]);
    CREATE INDEX [IX_ReputationRules_CreatedByUserId] ON [ReputationRules] ([CreatedByUserId]);
END
");

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReputationTransactions')
BEGIN
    CREATE TABLE [ReputationTransactions] (
        [Id] int NOT NULL IDENTITY,
        [UserId] uniqueidentifier NOT NULL,
        [ReputationRuleId] int NULL,
        [Points] int NOT NULL,
        [Reason] nvarchar(max) NULL,
        [ReferenceId] nvarchar(100) NULL,
        [ReferenceType] nvarchar(100) NULL,
        [OccurredAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [CreatedByUserId] uniqueidentifier NULL,
        CONSTRAINT [PK_ReputationTransactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ReputationTransactions_AuthUsers_CreatedByUserId] FOREIGN KEY ([CreatedByUserId]) REFERENCES [AuthUsers] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_ReputationTransactions_AuthUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AuthUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ReputationTransactions_ReputationRules_ReputationRuleId] FOREIGN KEY ([ReputationRuleId]) REFERENCES [ReputationRules] ([Id]) ON DELETE NO ACTION
    );
    CREATE INDEX [IX_ReputationTransactions_CreatedByUserId] ON [ReputationTransactions] ([CreatedByUserId]);
    CREATE INDEX [IX_ReputationTransactions_ReputationRuleId] ON [ReputationTransactions] ([ReputationRuleId]);
    CREATE INDEX [IX_ReputationTransactions_UserId] ON [ReputationTransactions] ([UserId]);
END
");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ReputationRules')
BEGIN
    DELETE FROM ReputationRules;
    SET IDENTITY_INSERT [ReputationRules] ON;

    INSERT INTO ReputationRules (Id, RuleCode, Description, Points, IsEnabled, IsSystem, IsAutomatic, CanRepeat, MaximumOccurrences, SortOrder, CreatedAt)
    VALUES (1, 'profile_completed', 'Profile completed', 50, 1, 1, 1, 0, 1, 1, '2025-12-29T00:00:00Z');

    INSERT INTO ReputationRules (Id, RuleCode, Description, Points, IsEnabled, IsSystem, IsAutomatic, CanRepeat, MaximumOccurrences, SortOrder, CreatedAt)
    VALUES (2, 'email_verified', 'Email verified', 30, 1, 1, 1, 0, 1, 2, '2025-12-29T00:00:00Z');

    INSERT INTO ReputationRules (Id, RuleCode, Description, Points, IsEnabled, IsSystem, IsAutomatic, CanRepeat, MaximumOccurrences, SortOrder, CreatedAt)
    VALUES (3, 'phone_verified', 'Phone verified', 30, 1, 1, 1, 0, 1, 3, '2025-12-29T00:00:00Z');

    INSERT INTO ReputationRules (Id, RuleCode, Description, Points, IsEnabled, IsSystem, IsAutomatic, CanRepeat, MaximumOccurrences, SortOrder, CreatedAt)
    VALUES (4, 'company_verified', 'Company verified', 100, 1, 1, 1, 0, 1, 4, '2025-12-29T00:00:00Z');

    INSERT INTO ReputationRules (Id, RuleCode, Description, Points, IsEnabled, IsSystem, IsAutomatic, CanRepeat, MaximumOccurrences, SortOrder, CreatedAt)
    VALUES (5, 'investment_published', 'Investment published', 200, 1, 1, 1, 1, 10, 5, '2025-12-29T00:00:00Z');

    INSERT INTO ReputationRules (Id, RuleCode, Description, Points, IsEnabled, IsSystem, IsAutomatic, CanRepeat, MaximumOccurrences, SortOrder, CreatedAt)
    VALUES (6, 'investment_approved', 'Investment approved', 150, 1, 1, 1, 0, 1, 6, '2025-12-29T00:00:00Z');

    INSERT INTO ReputationRules (Id, RuleCode, Description, Points, IsEnabled, IsSystem, IsAutomatic, CanRepeat, MaximumOccurrences, SortOrder, CreatedAt)
    VALUES (7, 'first_investment', 'First investment', 500, 1, 1, 1, 0, 1, 7, '2025-12-29T00:00:00Z');

    INSERT INTO ReputationRules (Id, RuleCode, Description, Points, IsEnabled, IsSystem, IsAutomatic, CanRepeat, MaximumOccurrences, SortOrder, CreatedAt)
    VALUES (8, 'repeat_investment', 'Repeat investment', 200, 1, 1, 1, 1, 10, 8, '2025-12-29T00:00:00Z');

    INSERT INTO ReputationRules (Id, RuleCode, Description, Points, IsEnabled, IsSystem, IsAutomatic, CanRepeat, MaximumOccurrences, SortOrder, CreatedAt)
    VALUES (9, 'successful_investment', 'Successful investment', 300, 1, 1, 1, 0, 1, 9, '2025-12-29T00:00:00Z');

    INSERT INTO ReputationRules (Id, RuleCode, Description, Points, IsEnabled, IsSystem, IsAutomatic, CanRepeat, MaximumOccurrences, SortOrder, CreatedAt)
    VALUES (10, 'policy_violation', 'Policy violation', -500, 1, 1, 0, 0, 1, 10, '2025-12-29T00:00:00Z');

    INSERT INTO ReputationRules (Id, RuleCode, Description, Points, IsEnabled, IsSystem, IsAutomatic, CanRepeat, MaximumOccurrences, SortOrder, CreatedAt)
    VALUES (11, 'admin_penalty', 'Admin penalty', -1000, 1, 1, 0, 0, 1, 11, '2025-12-29T00:00:00Z');

    SET IDENTITY_INSERT [ReputationRules] OFF;
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ReputationTransactions') DROP TABLE [ReputationTransactions];
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ReputationRules') DROP TABLE [ReputationRules];
");
        }
    }
}
