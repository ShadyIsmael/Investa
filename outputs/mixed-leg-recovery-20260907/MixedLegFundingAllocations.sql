BEGIN TRANSACTION;
CREATE TABLE [FundingDeclarationLegAllocations] (
    [Id] int NOT NULL IDENTITY,
    [FundingDeclarationId] int NOT NULL,
    [ParticipationId] int NOT NULL,
    [ContractId] int NULL,
    [OfferLegId] int NOT NULL,
    [OfferLegNumber] int NOT NULL,
    [AllocatedAmount] decimal(18,2) NOT NULL,
    [CurrencyCode] nvarchar(3) NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_FundingDeclarationLegAllocations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_FundingDeclarationLegAllocations_FundingDeclarations_FundingDeclarationId] FOREIGN KEY ([FundingDeclarationId]) REFERENCES [FundingDeclarations] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_FundingDeclarationLegAllocations_InvestmentContracts_ContractId] FOREIGN KEY ([ContractId]) REFERENCES [InvestmentContracts] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_FundingDeclarationLegAllocations_NegotiationOfferLegs_OfferLegId] FOREIGN KEY ([OfferLegId]) REFERENCES [NegotiationOfferLegs] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_FundingDeclarationLegAllocations_OpportunityJoinRequests_ParticipationId] FOREIGN KEY ([ParticipationId]) REFERENCES [OpportunityJoinRequests] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_FundingDeclarationLegAllocations_ContractId] ON [FundingDeclarationLegAllocations] ([ContractId]);

CREATE UNIQUE INDEX [IX_FundingDeclarationLegAllocations_FundingDeclarationId_OfferLegId] ON [FundingDeclarationLegAllocations] ([FundingDeclarationId], [OfferLegId]);

CREATE INDEX [IX_FundingDeclarationLegAllocations_OfferLegId] ON [FundingDeclarationLegAllocations] ([OfferLegId]);

CREATE INDEX [IX_FundingDeclarationLegAllocations_ParticipationId_OfferLegId] ON [FundingDeclarationLegAllocations] ([ParticipationId], [OfferLegId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260907180419_MixedLegFundingAllocations', N'10.0.10');

COMMIT;
GO

