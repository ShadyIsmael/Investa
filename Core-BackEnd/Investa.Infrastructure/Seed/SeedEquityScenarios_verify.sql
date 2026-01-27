SELECT Id, Name, Email, ClientType, CredibilityScore, WalletBalance FROM ApplicationUsers WHERE Id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333');
SELECT Id, BusinessName, FounderId, SharePrice, AvailableShares, TotalShares, Status FROM Investments WHERE Id IN (1000,1001);
SELECT Id, InvestmentId, InvestorId, SharesPurchased, AmountInvested FROM InvestmentParticipants WHERE Id IN (5000,5001,5002);
