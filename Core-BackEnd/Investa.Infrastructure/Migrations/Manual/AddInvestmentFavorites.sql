-- Creates the InvestmentFavorites table for persisted investment watchlists
IF OBJECT_ID('dbo.InvestmentFavorites', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.InvestmentFavorites (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        InvestorId UNIQUEIDENTIFIER NOT NULL,
        InvestmentId INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    ALTER TABLE dbo.InvestmentFavorites
        ADD CONSTRAINT FK_InvestmentFavorites_AuthUsers FOREIGN KEY (InvestorId) REFERENCES dbo.AuthUsers(Id) ON DELETE CASCADE;

    ALTER TABLE dbo.InvestmentFavorites
        ADD CONSTRAINT FK_InvestmentFavorites_Investments FOREIGN KEY (InvestmentId) REFERENCES dbo.Investments(Id) ON DELETE CASCADE;

    CREATE UNIQUE INDEX IX_InvestmentFavorites_Investor_Investment ON dbo.InvestmentFavorites(InvestorId, InvestmentId);
    CREATE INDEX IX_InvestmentFavorites_InvestmentId ON dbo.InvestmentFavorites(InvestmentId);
END
