-- =============================================
-- Investment Model Enhancement Migration
-- Adds equity crowdfunding support with multi-investor tracking
-- =============================================

BEGIN TRANSACTION;

-- ==================== Update Investments Table ====================

-- Rename existing columns for clarity
EXEC sp_rename 'Investments.InvestorId', 'FounderId', 'COLUMN';
EXEC sp_rename 'Investments.Amount', 'InitialCapital', 'COLUMN';

-- Add new financial structure fields
ALTER TABLE Investments ADD SharePrice DECIMAL(18,2) NULL;
ALTER TABLE Investments ADD TotalShares INT NULL;
ALTER TABLE Investments ADD AvailableShares INT NULL;
ALTER TABLE Investments ADD MinInvestment DECIMAL(18,2) NULL;
ALTER TABLE Investments ADD MaxInvestment DECIMAL(18,2) NULL;
ALTER TABLE Investments ADD ValuationCap DECIMAL(18,2) NULL;
ALTER TABLE Investments ADD ExpectedROI DECIMAL(5,2) NULL;
ALTER TABLE Investments ADD InvestmentType NVARCHAR(50) NULL;
ALTER TABLE Investments ADD Status NVARCHAR(20) NOT NULL DEFAULT 'Draft';

-- Add new timeline and media fields
ALTER TABLE Investments ADD EndDate DATETIME2 NULL;
ALTER TABLE Investments ADD ImageUrl NVARCHAR(500) NULL;
ALTER TABLE Investments ADD VideoUrl NVARCHAR(500) NULL;

-- Add constraints
ALTER TABLE Investments ADD CONSTRAINT CHK_Investment_SharePrice CHECK (SharePrice IS NULL OR SharePrice > 0);
ALTER TABLE Investments ADD CONSTRAINT CHK_Investment_TotalShares CHECK (TotalShares IS NULL OR TotalShares > 0);
ALTER TABLE Investments ADD CONSTRAINT CHK_Investment_AvailableShares CHECK (AvailableShares IS NULL OR AvailableShares >= 0);
ALTER TABLE Investments ADD CONSTRAINT CHK_Investment_MinInvestment CHECK (MinInvestment IS NULL OR MinInvestment > 0);
ALTER TABLE Investments ADD CONSTRAINT CHK_Investment_MaxInvestment CHECK (MaxInvestment IS NULL OR MaxInvestment > 0);
ALTER TABLE Investments ADD CONSTRAINT CHK_Investment_ValuationCap CHECK (ValuationCap IS NULL OR ValuationCap > 0);
ALTER TABLE Investments ADD CONSTRAINT CHK_Investment_ExpectedROI CHECK (ExpectedROI IS NULL OR ExpectedROI >= 0);
ALTER TABLE Investments ADD CONSTRAINT CHK_Investment_Status CHECK (Status IN ('Draft', 'Active', 'Funded', 'Closed'));
ALTER TABLE Investments ADD CONSTRAINT CHK_Investment_InvestmentType CHECK (InvestmentType IS NULL OR InvestmentType IN ('Equity', 'Debt', 'Convertible'));

-- ==================== Create InvestmentParticipants Table ====================

CREATE TABLE InvestmentParticipants (
    Id INT PRIMARY KEY IDENTITY(1,1),
    InvestmentId INT NOT NULL,
    InvestorId UNIQUEIDENTIFIER NOT NULL,
    SharesPurchased INT NOT NULL,
    AmountInvested DECIMAL(18,2) NOT NULL,
    InvestmentDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Confirmed',
    IsAnonymous BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_InvestmentParticipants_Investment 
        FOREIGN KEY (InvestmentId) 
        REFERENCES Investments(Id) 
        ON DELETE CASCADE,
        
    CONSTRAINT FK_InvestmentParticipants_Investor 
        FOREIGN KEY (InvestorId) 
        REFERENCES ApplicationUsers(Id) 
        ON DELETE NO ACTION,
        
    CONSTRAINT CHK_InvestmentParticipants_Shares 
        CHECK (SharesPurchased > 0),
        
    CONSTRAINT CHK_InvestmentParticipants_Amount 
        CHECK (AmountInvested > 0),
        
    CONSTRAINT CHK_InvestmentParticipants_Status 
        CHECK (Status IN ('Pending', 'Confirmed', 'Cancelled'))
);

-- Create indexes for performance
CREATE INDEX IX_InvestmentParticipants_Investment ON InvestmentParticipants(InvestmentId);
CREATE INDEX IX_InvestmentParticipants_Investor ON InvestmentParticipants(InvestorId);
CREATE INDEX IX_InvestmentParticipants_Status ON InvestmentParticipants(Status);
CREATE INDEX IX_InvestmentParticipants_Date ON InvestmentParticipants(InvestmentDate);

-- Create composite index for common queries
CREATE INDEX IX_InvestmentParticipants_Investment_Investor 
    ON InvestmentParticipants(InvestmentId, InvestorId);

-- ==================== Update Existing Data ====================

-- Set Status to 'Active' for investments with target funds
UPDATE Investments 
SET Status = 'Active' 
WHERE TargetFund IS NOT NULL AND TargetFund > 0;

-- Initialize AvailableShares = TotalShares for existing investments
UPDATE Investments 
SET AvailableShares = TotalShares 
WHERE TotalShares IS NOT NULL;

-- ==================== Add Comments (SQL Server Extended Properties) ====================

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'The user who created this investment opportunity (founder/business owner)', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'Investments',
    @level2type = N'COLUMN', @level2name = 'FounderId';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Founder initial capital contribution', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'Investments',
    @level2type = N'COLUMN', @level2name = 'InitialCapital';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Price per share for equity investments', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'Investments',
    @level2type = N'COLUMN', @level2name = 'SharePrice';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Investment opportunity status: Draft, Active, Funded, Closed', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'Investments',
    @level2type = N'COLUMN', @level2name = 'Status';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Tracks individual investor participation in investment opportunities', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'InvestmentParticipants';

COMMIT TRANSACTION;

-- ==================== Rollback Script (Save separately) ====================
/*
BEGIN TRANSACTION;

-- Drop InvestmentParticipants table
DROP INDEX IF EXISTS IX_InvestmentParticipants_Investment_Investor ON InvestmentParticipants;
DROP INDEX IF EXISTS IX_InvestmentParticipants_Date ON InvestmentParticipants;
DROP INDEX IF EXISTS IX_InvestmentParticipants_Status ON InvestmentParticipants;
DROP INDEX IF EXISTS IX_InvestmentParticipants_Investor ON InvestmentParticipants;
DROP INDEX IF EXISTS IX_InvestmentParticipants_Investment ON InvestmentParticipants;
DROP TABLE IF EXISTS InvestmentParticipants;

-- Remove new columns from Investments
ALTER TABLE Investments DROP CONSTRAINT IF EXISTS CHK_Investment_InvestmentType;
ALTER TABLE Investments DROP CONSTRAINT IF EXISTS CHK_Investment_Status;
ALTER TABLE Investments DROP CONSTRAINT IF EXISTS CHK_Investment_ExpectedROI;
ALTER TABLE Investments DROP CONSTRAINT IF EXISTS CHK_Investment_ValuationCap;
ALTER TABLE Investments DROP CONSTRAINT IF EXISTS CHK_Investment_MaxInvestment;
ALTER TABLE Investments DROP CONSTRAINT IF EXISTS CHK_Investment_MinInvestment;
ALTER TABLE Investments DROP CONSTRAINT IF EXISTS CHK_Investment_AvailableShares;
ALTER TABLE Investments DROP CONSTRAINT IF EXISTS CHK_Investment_TotalShares;
ALTER TABLE Investments DROP CONSTRAINT IF EXISTS CHK_Investment_SharePrice;

ALTER TABLE Investments DROP COLUMN IF EXISTS VideoUrl;
ALTER TABLE Investments DROP COLUMN IF EXISTS ImageUrl;
ALTER TABLE Investments DROP COLUMN IF EXISTS EndDate;
ALTER TABLE Investments DROP COLUMN IF EXISTS Status;
ALTER TABLE Investments DROP COLUMN IF EXISTS InvestmentType;
ALTER TABLE Investments DROP COLUMN IF EXISTS ExpectedROI;
ALTER TABLE Investments DROP COLUMN IF EXISTS ValuationCap;
ALTER TABLE Investments DROP COLUMN IF EXISTS MaxInvestment;
ALTER TABLE Investments DROP COLUMN IF EXISTS MinInvestment;
ALTER TABLE Investments DROP COLUMN IF EXISTS AvailableShares;
ALTER TABLE Investments DROP COLUMN IF EXISTS TotalShares;
ALTER TABLE Investments DROP COLUMN IF EXISTS SharePrice;

-- Rename columns back
EXEC sp_rename 'Investments.FounderId', 'InvestorId', 'COLUMN';
EXEC sp_rename 'Investments.InitialCapital', 'Amount', 'COLUMN';

COMMIT TRANSACTION;
*/
