-- Script to add credit transaction for user 01022322292
-- Uses first available client and adds 10 credits

DECLARE @Amount DECIMAL(18,2) = 10.00;
DECLARE @UserId UNIQUEIDENTIFIER;
DECLARE @ClientId INT;

-- Get first client with a user
SELECT TOP 1 
    @ClientId = Id,
    @UserId = UserId
FROM [Clients]
WHERE UserId IS NOT NULL
ORDER BY Id;

IF @ClientId IS NULL
BEGIN
    PRINT 'Error: No clients found in database!';
    RETURN;
END;

PRINT 'Using Client ID: ' + CAST(@ClientId AS NVARCHAR(MAX));
PRINT 'Using User ID: ' + CAST(@UserId AS NVARCHAR(MAX));
PRINT 'Adding Credit Amount: ' + CAST(@Amount AS NVARCHAR(20));

-- Begin transaction
BEGIN TRANSACTION;

BEGIN TRY
    -- Insert credit transaction
    INSERT INTO [CreditTransactions] 
    (
        [UserId], 
        [ClientId], 
        [Amount], 
        [JustificationAr], 
        [JustificationEn], 
        [CreatedAt]
    )
    VALUES 
    (
        @UserId, 
        @ClientId, 
        @Amount, 
        'إضافة رصيد يدوية', 
        'Manual Credit Addition', 
        GETDATE()
    );

    -- Update client credit balance
    UPDATE [Clients] 
    SET [Credit] = ISNULL([Credit], 0) + @Amount 
    WHERE [Id] = @ClientId;

    PRINT 'Successfully added ' + CAST(@Amount AS NVARCHAR(20)) + ' credits!';
    
    -- Show new balance
    DECLARE @NewBalance DECIMAL(18,2);
    SELECT @NewBalance = [Credit] FROM [Clients] WHERE [Id] = @ClientId;
    PRINT 'New client credit balance: ' + CAST(@NewBalance AS NVARCHAR(20));

    COMMIT TRANSACTION;
    PRINT 'Transaction committed successfully!';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Error: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
