-- Migration: Add Founding Investment Type Fields
-- Date: 2026-02-01
-- Description: Adds DurationMonths, ProfitPercentage, and PayoutFrequency columns to support Founding investment type

-- Add DurationMonths column (nullable for backward compatibility)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Investments]') AND name = 'DurationMonths')
BEGIN
    ALTER TABLE [dbo].[Investments]
    ADD [DurationMonths] INT NULL;
    
    PRINT 'Added DurationMonths column to Investments table';
END
ELSE
BEGIN
    PRINT 'DurationMonths column already exists';
END
GO

-- Add ProfitPercentage column (nullable for backward compatibility)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Investments]') AND name = 'ProfitPercentage')
BEGIN
    ALTER TABLE [dbo].[Investments]
    ADD [ProfitPercentage] DECIMAL(5, 2) NULL;
    
    PRINT 'Added ProfitPercentage column to Investments table';
END
ELSE
BEGIN
    PRINT 'ProfitPercentage column already exists';
END
GO

-- Add PayoutFrequency column (nullable for backward compatibility)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Investments]') AND name = 'PayoutFrequency')
BEGIN
    ALTER TABLE [dbo].[Investments]
    ADD [PayoutFrequency] NVARCHAR(50) NULL;
    
    PRINT 'Added PayoutFrequency column to Investments table';
END
ELSE
BEGIN
    PRINT 'PayoutFrequency column already exists';
END
GO

-- Add check constraint for valid PayoutFrequency values
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Investments_PayoutFrequency')
BEGIN
    ALTER TABLE [dbo].[Investments]
    ADD CONSTRAINT [CK_Investments_PayoutFrequency] 
    CHECK ([PayoutFrequency] IS NULL OR [PayoutFrequency] IN ('Monthly', 'Quarterly', 'Semi-Annually', 'Annually', 'At Maturity'));
    
    PRINT 'Added check constraint for PayoutFrequency';
END
ELSE
BEGIN
    PRINT 'PayoutFrequency check constraint already exists';
END
GO

-- Add comment/description to document the purpose of these fields
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Duration of the investment in months (Founding type only)', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'Investments',
    @level2type = N'COLUMN', @level2name = 'DurationMonths';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Profit percentage for investors (Founding type only)', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'Investments',
    @level2type = N'COLUMN', @level2name = 'ProfitPercentage';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Payout frequency: Monthly, Quarterly, Semi-Annually, Annually, At Maturity (Founding type only)', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'Investments',
    @level2type = N'COLUMN', @level2name = 'PayoutFrequency';

GO

PRINT 'Migration completed successfully: Founding investment fields added';
