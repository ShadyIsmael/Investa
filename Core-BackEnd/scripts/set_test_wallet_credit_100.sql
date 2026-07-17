-- DEV ONLY: Sets the authenticated test user's CREDIT (Wallet.CurrentBalance) to 100
-- without affecting investments/shares/loans/contributions.
--
-- IMPORTANT:
-- 1) This script is intended for local/dev/test databases only.
-- 2) It performs the minimum safe updates:
--    - ensures a Wallet exists for the target user
--    - sets Wallet.CurrentBalance = 100
--    - inserts a WalletTransaction credit entry (immutable log pattern)
-- 3) WalletTransaction rows are normally append-only; this script *also* follows that pattern.
--
-- You MUST replace the @UserId value to match your current authenticated test user.

DECLARE @UserId UNIQUEIDENTIFIER = 'PUT_TEST_USER_GUID_HERE';
DECLARE @TargetBalance DECIMAL(18,2) = 100.00;

BEGIN TRANSACTION;
BEGIN TRY

    -- Ensure wallet exists (lazy creation would happen in app code, but we do it explicitly here)
    IF NOT EXISTS (SELECT 1 FROM [Wallets] WHERE [UserId] = @UserId)
    BEGIN
        DECLARE @WalletId UNIQUEIDENTIFIER = NEWID();
        INSERT INTO [Wallets]
        (
            [Id],
            [UserId],
            [CurrentBalance],
            [TotalPurchasedCredits],
            [TotalBonusCredits],
            [TotalRefundCredits],
            [CreatedAt],
            [UpdatedAt]
        )
        VALUES
        (
            @WalletId,
            @UserId,
            0m,
            0m,
            0m,
            0m,
            GETDATE(),
            GETDATE()
        );
    END

    DECLARE @WalletId UNIQUEIDENTIFIER;
    DECLARE @BalanceBefore DECIMAL(18,2);

    SELECT
        @WalletId = [Id],
        @BalanceBefore = [CurrentBalance]
    FROM [Wallets]
    WHERE [UserId] = @UserId;

    -- Only add credits if currently below target
    IF @BalanceBefore < @TargetBalance
    BEGIN
        DECLARE @CreditAmount DECIMAL(18,2) = @TargetBalance - @BalanceBefore;

        -- Append-only log entry (credit)
        INSERT INTO [WalletTransactions]
        (
            [Id],
            [WalletId],
            [Direction],
            [Reason],
            [CreditAmount],
            [BalanceBefore],
            [BalanceAfter],
            [ReferenceType],
            [ReferenceId],
            [Description],
            [CreatedByUserId],
            [ActionCode],
            [CreatedAt]
        )
        VALUES
        (
            NEWID(),
            @WalletId,
            'Credit',
            'AdminAdjustmentCredit',
            @CreditAmount,
            @BalanceBefore,
            @TargetBalance,
            'None',
            NULL,
            'DEV_ONLY set test wallet credit to 100',
            NULL,
            NULL,
            GETDATE()
        );

        -- Update the canonical balance
        UPDATE [Wallets]
        SET [CurrentBalance] = @TargetBalance,
            [UpdatedAt] = GETDATE()
        WHERE [Id] = @WalletId;
    END
    ELSE
    BEGIN
        -- If already >= target, don't top up to avoid accidental double-credit.
        -- (You can change this behavior if you want an exact reset.)
        PRINT 'Wallet balance already >= target. No credit transaction inserted.';
    END

    COMMIT TRANSACTION;
    PRINT 'OK: Wallet for @UserId=' + CAST(@UserId AS NVARCHAR(50)) + ' set to >= ' + CAST(@TargetBalance AS NVARCHAR(50));

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'FAILED: ' + ERROR_MESSAGE();
    THROW;
END CATCH;

