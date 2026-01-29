-- Script to update CurrentCredibilityScore for all users based on sum of CreditTransactions
-- This ensures the Current Score displays correctly as the sum of all credit amounts

-- Update UserProfiles.CurrentCredibilityScore with the sum of CreditTransactions
UPDATE up
SET up.CurrentCredibilityScore = ISNULL(creditSum.TotalCredits, 0)
FROM UserProfiles up
LEFT JOIN (
    SELECT 
        UserId,
        SUM(Amount) AS TotalCredits
    FROM CreditTransactions
    GROUP BY UserId
) creditSum ON up.UserId = creditSum.UserId;

-- Display results
SELECT 
    up.Id,
    up.UserId,
    up.FullName,
    up.CurrentCredibilityScore,
    ISNULL(creditSum.TotalCredits, 0) AS CalculatedTotal,
    ISNULL(creditSum.TransactionCount, 0) AS TransactionCount
FROM UserProfiles up
LEFT JOIN (
    SELECT 
        UserId,
        SUM(Amount) AS TotalCredits,
        COUNT(*) AS TransactionCount
    FROM CreditTransactions
    GROUP BY UserId
) creditSum ON up.UserId = creditSum.UserId
WHERE creditSum.TransactionCount > 0
ORDER BY up.Id;

PRINT 'CurrentCredibilityScore updated successfully for all users with credit transactions.';
