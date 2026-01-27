BEGIN TRANSACTION;

-- Seed sample users (founders and investors)
IF NOT EXISTS (SELECT 1 FROM ApplicationUsers WHERE Id = '11111111-1111-1111-1111-111111111111')
BEGIN
    INSERT INTO ApplicationUsers (Id, Name, Email, Role, ClientType, CredibilityScore, WalletBalance)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Alice Founder', 'alice.founder@example.com', 'Client', 1, 4200, 100000.00);
END

IF NOT EXISTS (SELECT 1 FROM ApplicationUsers WHERE Id = '22222222-2222-2222-2222-222222222222')
BEGIN
    INSERT INTO ApplicationUsers (Id, Name, Email, Role, ClientType, CredibilityScore, WalletBalance)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Bob Investor', 'bob.investor@example.com', 'Client', 0, 3750, 25000.00);
END

IF NOT EXISTS (SELECT 1 FROM ApplicationUsers WHERE Id = '33333333-3333-3333-3333-333333333333')
BEGIN
    INSERT INTO ApplicationUsers (Id, Name, Email, Role, ClientType, CredibilityScore, WalletBalance)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Clara Investor', 'clara.investor@example.com', 'Client', 0, 3600, 15000.00);
END

-- Seed sample investments
-- Ensure we can insert explicit Id values into identity columns for seed data
IF NOT EXISTS (SELECT 1 FROM Investments WHERE Id = 1000)
BEGIN
    SET IDENTITY_INSERT Investments ON;
    INSERT INTO Investments (Id, FounderId, InitialCapital, Date, BusinessName, Description, SharePrice, TotalShares, AvailableShares, MinInvestment, MaxInvestment, ValuationCap, ExpectedROI, InvestmentType, Status, TargetFund, BusinessCategoryId, RiskLevel, Currency, StartDate, EndDate)
    SELECT 1000, '11111111-1111-1111-1111-111111111111', 50000.00, GETUTCDATE(), 'SolarGrid Energy', 'Distributed solar microgrid for emerging markets.', 10.00, 10000, 8000, 100.00, 5000.00, 5000000.00, 12.50, 'Equity', 'Active', 100000.00, 100, 'Medium', 'USD', DATEADD(day,-14,GETUTCDATE()), DATEADD(day,30,GETUTCDATE());
    SET IDENTITY_INSERT Investments OFF;
END

IF NOT EXISTS (SELECT 1 FROM Investments WHERE Id = 1001)
BEGIN
    SET IDENTITY_INSERT Investments ON;
    INSERT INTO Investments (Id, FounderId, InitialCapital, Date, BusinessName, Description, SharePrice, TotalShares, AvailableShares, MinInvestment, MaxInvestment, ValuationCap, ExpectedROI, InvestmentType, Status, TargetFund, BusinessCategoryId, RiskLevel, Currency, StartDate, EndDate)
    SELECT 1001, '11111111-1111-1111-1111-111111111111', 20000.00, GETUTCDATE(), 'AquaPure', 'Affordable water purification devices.', 5.00, 5000, 1200, 50.00, 2000.00, 2000000.00, 10.00, 'Equity', 'Active', 25000.00, 101, 'Low', 'USD', DATEADD(day,-7,GETUTCDATE()), DATEADD(day,14,GETUTCDATE());
    SET IDENTITY_INSERT Investments OFF;
END

-- Seed participants (investor contributions)
-- Enable explicit identity values for seed participant records
IF NOT EXISTS (SELECT 1 FROM InvestmentParticipants WHERE Id IN (5000,5001,5002))
BEGIN
    SET IDENTITY_INSERT InvestmentParticipants ON;
    IF NOT EXISTS (SELECT 1 FROM InvestmentParticipants WHERE Id = 5000)
    BEGIN
        INSERT INTO InvestmentParticipants (Id, InvestmentId, InvestorId, SharesPurchased, AmountInvested, InvestmentDate, Status, IsAnonymous, CreatedAt)
        VALUES (5000, 1000, '22222222-2222-2222-2222-222222222222', 300, 3000.00, DATEADD(day,-5,GETUTCDATE()), 'Confirmed', 0, DATEADD(day,-5,GETUTCDATE()));
    END

    IF NOT EXISTS (SELECT 1 FROM InvestmentParticipants WHERE Id = 5001)
    BEGIN
        INSERT INTO InvestmentParticipants (Id, InvestmentId, InvestorId, SharesPurchased, AmountInvested, InvestmentDate, Status, IsAnonymous, CreatedAt)
        VALUES (5001, 1000, '33333333-3333-3333-3333-333333333333', 200, 2000.00, DATEADD(day,-3,GETUTCDATE()), 'Confirmed', 0, DATEADD(day,-3,GETUTCDATE()));
    END

    IF NOT EXISTS (SELECT 1 FROM InvestmentParticipants WHERE Id = 5002)
    BEGIN
        INSERT INTO InvestmentParticipants (Id, InvestmentId, InvestorId, SharesPurchased, AmountInvested, InvestmentDate, Status, IsAnonymous, CreatedAt)
        VALUES (5002, 1001, '22222222-2222-2222-2222-222222222222', 100, 500.00, DATEADD(day,-2,GETUTCDATE()), 'Confirmed', 0, DATEADD(day,-2,GETUTCDATE()));
    END
    SET IDENTITY_INSERT InvestmentParticipants OFF;
END

COMMIT;
