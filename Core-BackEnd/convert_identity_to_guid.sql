-- ================================================================
-- IDENTITY KEY TYPE CONVERSION SCRIPT
-- Database: InvestaDb
-- Purpose: Convert Identity tables from nvarchar(450) to uniqueidentifier
-- Author: GitHub Copilot
-- Date: 2026-05-04
-- ================================================================
-- IMPORTANT: Run backup_database.sql BEFORE executing this script!
-- ================================================================

USE InvestaDb;
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

PRINT '================================================================';
PRINT 'IDENTITY KEY TYPE CONVERSION';
PRINT 'Converting from nvarchar(450) to uniqueidentifier';
PRINT 'Started at: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
PRINT '================================================================';
PRINT '';

-- Start transaction for safety
BEGIN TRANSACTION;

BEGIN TRY

    -- ============================================================
    -- STEP 1: Drop Foreign Key Constraints
    -- ============================================================
    PRINT '--- STEP 1: Dropping Foreign Key Constraints ---';
    
    ALTER TABLE [AspNetUserClaims] DROP CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId];
    PRINT '  ✓ Dropped FK_AspNetUserClaims_AspNetUsers_UserId';
    
    ALTER TABLE [AspNetUserLogins] DROP CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId];
    PRINT '  ✓ Dropped FK_AspNetUserLogins_AspNetUsers_UserId';
    
    ALTER TABLE [AspNetUserRoles] DROP CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId];
    PRINT '  ✓ Dropped FK_AspNetUserRoles_AspNetUsers_UserId';
    
    ALTER TABLE [AspNetUserRoles] DROP CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId];
    PRINT '  ✓ Dropped FK_AspNetUserRoles_AspNetRoles_RoleId';
    
    ALTER TABLE [AspNetUserTokens] DROP CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId];
    PRINT '  ✓ Dropped FK_AspNetUserTokens_AspNetUsers_UserId';
    
    ALTER TABLE [AspNetRoleClaims] DROP CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId];
    PRINT '  ✓ Dropped FK_AspNetRoleClaims_AspNetRoles_RoleId';
    
    PRINT '';

    -- ============================================================
    -- STEP 2: Drop Primary Key Constraints
    -- ============================================================
    PRINT '--- STEP 2: Dropping Primary Key Constraints ---';
    
    ALTER TABLE [AspNetUsers] DROP CONSTRAINT [PK_AspNetUsers];
    PRINT '  ✓ Dropped PK_AspNetUsers';
    
    ALTER TABLE [AspNetRoles] DROP CONSTRAINT [PK_AspNetRoles];
    PRINT '  ✓ Dropped PK_AspNetRoles';
    
    -- Drop composite PK on AspNetUserRoles
    ALTER TABLE [AspNetUserRoles] DROP CONSTRAINT [PK_AspNetUserRoles];
    PRINT '  ✓ Dropped PK_AspNetUserRoles';
    
    -- Drop composite PK on AspNetUserTokens (UserId + LoginProvider + Name)
    ALTER TABLE [AspNetUserTokens] DROP CONSTRAINT [PK_AspNetUserTokens];
    PRINT '  ✓ Dropped PK_AspNetUserTokens';
    
    -- Drop composite PK on AspNetUserLogins (LoginProvider + ProviderKey)
    ALTER TABLE [AspNetUserLogins] DROP CONSTRAINT [PK_AspNetUserLogins];
    PRINT '  ✓ Dropped PK_AspNetUserLogins';
    
    PRINT '';

    -- ============================================================
    -- STEP 3: Drop Indexes
    -- ============================================================
    PRINT '--- STEP 3: Dropping Indexes ---';
    
    -- Drop index on AspNetUserRoles.RoleId
    IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetUserRoles_RoleId')
    BEGIN
        DROP INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles];
        PRINT '  ✓ Dropped IX_AspNetUserRoles_RoleId';
    END
    
    -- Drop index on AspNetUserClaims.UserId
    IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetUserClaims_UserId')
    BEGIN
        DROP INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims];
        PRINT '  ✓ Dropped IX_AspNetUserClaims_UserId';
    END
    
    -- Drop index on AspNetUserLogins.UserId
    IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetUserLogins_UserId')
    BEGIN
        DROP INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins];
        PRINT '  ✓ Dropped IX_AspNetUserLogins_UserId';
    END
    
    -- Drop index on AspNetRoleClaims.RoleId
    IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetRoleClaims_RoleId')
    BEGIN
        DROP INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims];
        PRINT '  ✓ Dropped IX_AspNetRoleClaims_RoleId';
    END
    
    PRINT '';

    -- ============================================================
    -- STEP 4: Alter Primary Tables (AspNetUsers, AspNetRoles)
    -- ============================================================
    PRINT '--- STEP 4: Converting Primary Tables ---';
    
    ALTER TABLE [AspNetUsers] ALTER COLUMN [Id] uniqueidentifier NOT NULL;
    PRINT '  ✓ Converted AspNetUsers.Id to uniqueidentifier';
    
    ALTER TABLE [AspNetRoles] ALTER COLUMN [Id] uniqueidentifier NOT NULL;
    PRINT '  ✓ Converted AspNetRoles.Id to uniqueidentifier';
    
    PRINT '';

    -- ============================================================
    -- STEP 5: Alter Foreign Key Columns
    -- ============================================================
    PRINT '--- STEP 5: Converting Foreign Key Columns ---';
    
    -- AspNetUserRoles
    ALTER TABLE [AspNetUserRoles] ALTER COLUMN [UserId] uniqueidentifier NOT NULL;
    PRINT '  ✓ Converted AspNetUserRoles.UserId to uniqueidentifier';
    
    ALTER TABLE [AspNetUserRoles] ALTER COLUMN [RoleId] uniqueidentifier NOT NULL;
    PRINT '  ✓ Converted AspNetUserRoles.RoleId to uniqueidentifier';
    
    -- AspNetUserClaims
    ALTER TABLE [AspNetUserClaims] ALTER COLUMN [UserId] uniqueidentifier NOT NULL;
    PRINT '  ✓ Converted AspNetUserClaims.UserId to uniqueidentifier';
    
    -- AspNetUserLogins
    ALTER TABLE [AspNetUserLogins] ALTER COLUMN [UserId] uniqueidentifier NOT NULL;
    PRINT '  ✓ Converted AspNetUserLogins.UserId to uniqueidentifier';
    
    -- AspNetUserTokens
    ALTER TABLE [AspNetUserTokens] ALTER COLUMN [UserId] uniqueidentifier NOT NULL;
    PRINT '  ✓ Converted AspNetUserTokens.UserId to uniqueidentifier';
    
    -- AspNetRoleClaims
    ALTER TABLE [AspNetRoleClaims] ALTER COLUMN [RoleId] uniqueidentifier NOT NULL;
    PRINT '  ✓ Converted AspNetRoleClaims.RoleId to uniqueidentifier';
    
    PRINT '';

    -- ============================================================
    -- STEP 6: Recreate Primary Key Constraints
    -- ============================================================
    PRINT '--- STEP 6: Recreating Primary Key Constraints ---';
    
    ALTER TABLE [AspNetUsers]
    ADD CONSTRAINT [PK_AspNetUsers] PRIMARY KEY CLUSTERED ([Id] ASC);
    PRINT '  ✓ Created PK_AspNetUsers';
    
    ALTER TABLE [AspNetRoles]
    ADD CONSTRAINT [PK_AspNetRoles] PRIMARY KEY CLUSTERED ([Id] ASC);
    PRINT '  ✓ Created PK_AspNetRoles';
    
    -- Recreate composite PK on AspNetUserRoles
    ALTER TABLE [AspNetUserRoles]
    ADD CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY CLUSTERED ([UserId] ASC, [RoleId] ASC);
    PRINT '  ✓ Created PK_AspNetUserRoles';
    
    -- Recreate composite PK on AspNetUserTokens
    ALTER TABLE [AspNetUserTokens]
    ADD CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY CLUSTERED ([UserId] ASC, [LoginProvider] ASC, [Name] ASC);
    PRINT '  ✓ Created PK_AspNetUserTokens';
    
    -- Recreate composite PK on AspNetUserLogins
    ALTER TABLE [AspNetUserLogins]
    ADD CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY CLUSTERED ([LoginProvider] ASC, [ProviderKey] ASC);
    PRINT '  ✓ Created PK_AspNetUserLogins';
    
    PRINT '';

    -- ============================================================
    -- STEP 7: Recreate Indexes
    -- ============================================================
    PRINT '--- STEP 7: Recreating Indexes ---';
    
    CREATE NONCLUSTERED INDEX [IX_AspNetUserRoles_RoleId]
    ON [AspNetUserRoles] ([RoleId] ASC);
    PRINT '  ✓ Created IX_AspNetUserRoles_RoleId';
    
    CREATE NONCLUSTERED INDEX [IX_AspNetUserClaims_UserId]
    ON [AspNetUserClaims] ([UserId] ASC);
    PRINT '  ✓ Created IX_AspNetUserClaims_UserId';
    
    CREATE NONCLUSTERED INDEX [IX_AspNetUserLogins_UserId]
    ON [AspNetUserLogins] ([UserId] ASC);
    PRINT '  ✓ Created IX_AspNetUserLogins_UserId';
    
    CREATE NONCLUSTERED INDEX [IX_AspNetRoleClaims_RoleId]
    ON [AspNetRoleClaims] ([RoleId] ASC);
    PRINT '  ✓ Created IX_AspNetRoleClaims_RoleId';
    
    PRINT '';

    -- ============================================================
    -- STEP 8: Recreate Foreign Key Constraints
    -- ============================================================
    PRINT '--- STEP 8: Recreating Foreign Key Constraints ---';
    
    ALTER TABLE [AspNetUserClaims]
    ADD CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId]
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id])
    ON DELETE CASCADE;
    PRINT '  ✓ Created FK_AspNetUserClaims_AspNetUsers_UserId';
    
    ALTER TABLE [AspNetUserLogins]
    ADD CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId]
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id])
    ON DELETE CASCADE;
    PRINT '  ✓ Created FK_AspNetUserLogins_AspNetUsers_UserId';
    
    ALTER TABLE [AspNetUserRoles]
    ADD CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId]
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id])
    ON DELETE CASCADE;
    PRINT '  ✓ Created FK_AspNetUserRoles_AspNetUsers_UserId';
    
    ALTER TABLE [AspNetUserRoles]
    ADD CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId]
    FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id])
    ON DELETE CASCADE;
    PRINT '  ✓ Created FK_AspNetUserRoles_AspNetRoles_RoleId';
    
    ALTER TABLE [AspNetUserTokens]
    ADD CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId]
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id])
    ON DELETE CASCADE;
    PRINT '  ✓ Created FK_AspNetUserTokens_AspNetUsers_UserId';
    
    ALTER TABLE [AspNetRoleClaims]
    ADD CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId]
    FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id])
    ON DELETE CASCADE;
    PRINT '  ✓ Created FK_AspNetRoleClaims_AspNetRoles_RoleId';
    
    PRINT '';

    -- ============================================================
    -- STEP 9: Verification
    -- ============================================================
    PRINT '--- STEP 9: Verification ---';
    
    DECLARE @UserCount INT, @RoleCount INT, @UserRoleCount INT;
    SELECT @UserCount = COUNT(*) FROM AspNetUsers;
    SELECT @RoleCount = COUNT(*) FROM AspNetRoles;
    SELECT @UserRoleCount = COUNT(*) FROM AspNetUserRoles;
    
    PRINT '  Users retained: ' + CAST(@UserCount AS NVARCHAR(10));
    PRINT '  Roles retained: ' + CAST(@RoleCount AS NVARCHAR(10));
    PRINT '  UserRoles retained: ' + CAST(@UserRoleCount AS NVARCHAR(10));
    
    -- Check column types
    IF EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'AspNetUsers' 
        AND COLUMN_NAME = 'Id' 
        AND DATA_TYPE = 'uniqueidentifier'
    )
    BEGIN
        PRINT '  ✓ AspNetUsers.Id is now uniqueidentifier';
    END
    ELSE
    BEGIN
        RAISERROR('  ✗ AspNetUsers.Id conversion failed!', 16, 1);
    END
    
    IF EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'AspNetRoles' 
        AND COLUMN_NAME = 'Id' 
        AND DATA_TYPE = 'uniqueidentifier'
    )
    BEGIN
        PRINT '  ✓ AspNetRoles.Id is now uniqueidentifier';
    END
    ELSE
    BEGIN
        RAISERROR('  ✗ AspNetRoles.Id conversion failed!', 16, 1);
    END
    
    PRINT '';
    PRINT '================================================================';
    PRINT '✓✓✓ CONVERSION COMPLETED SUCCESSFULLY ✓✓✓';
    PRINT 'Completed at: ' + CONVERT(NVARCHAR(50), GETDATE(), 120);
    PRINT '================================================================';
    PRINT '';
    PRINT 'NEXT STEPS:';
    PRINT '1. Commit this transaction (run: COMMIT TRANSACTION)';
    PRINT '2. Verify data integrity';
    PRINT '3. Restart Investa.API';
    PRINT '4. Test authentication endpoints';
    PRINT '';
    PRINT 'If any issues occur, rollback with: ROLLBACK TRANSACTION';
    PRINT '';

    -- Auto-commit (remove this line if you want manual commit)
    COMMIT TRANSACTION;
    PRINT '✓ Transaction committed automatically';

END TRY
BEGIN CATCH
    -- Error occurred, rollback
    ROLLBACK TRANSACTION;
    
    PRINT '';
    PRINT '================================================================';
    PRINT '✗✗✗ ERROR OCCURRED - TRANSACTION ROLLED BACK ✗✗✗';
    PRINT '================================================================';
    PRINT 'Error Message: ' + ERROR_MESSAGE();
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS NVARCHAR(10));
    PRINT 'Error Severity: ' + CAST(ERROR_SEVERITY() AS NVARCHAR(10));
    PRINT '';
    PRINT 'Database has been restored to pre-conversion state.';
    PRINT 'Review the error and try again.';
    PRINT '';
    
    -- Rethrow the error
    THROW;
END CATCH

GO

SET NOCOUNT OFF;
