IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [ApplicationPermissions] (
        [Id] int NOT NULL IDENTITY,
        [Key] nvarchar(100) NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(max) NULL,
        [ResourceType] nvarchar(100) NOT NULL,
        [Action] nvarchar(50) NOT NULL,
        [Scope] int NOT NULL,
        [ParentPermissionId] int NULL,
        [TenantId] uniqueidentifier NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [ModifiedAt] datetime2 NULL,
        [ModifiedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_ApplicationPermissions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ApplicationPermissions_ApplicationPermissions_ParentPermissionId] FOREIGN KEY ([ParentPermissionId]) REFERENCES [ApplicationPermissions] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [ApplicationUsers] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [Email] nvarchar(150) NOT NULL,
        [Role] nvarchar(50) NOT NULL,
        [ClientType] int NOT NULL,
        [CredibilityScore] int NOT NULL DEFAULT 3500,
        [WalletBalance] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_ApplicationUsers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [AspNetRoles] (
        [Id] nvarchar(450) NOT NULL,
        [Name] nvarchar(256) NULL,
        [NormalizedName] nvarchar(256) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [AspNetUsers] (
        [Id] nvarchar(450) NOT NULL,
        [UserName] nvarchar(256) NULL,
        [NormalizedUserName] nvarchar(256) NULL,
        [Email] nvarchar(256) NULL,
        [NormalizedEmail] nvarchar(256) NULL,
        [EmailConfirmed] bit NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [SecurityStamp] nvarchar(max) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(max) NULL,
        [PhoneNumberConfirmed] bit NOT NULL,
        [TwoFactorEnabled] bit NOT NULL,
        [LockoutEnd] datetimeoffset NULL,
        [LockoutEnabled] bit NOT NULL,
        [AccessFailedCount] int NOT NULL,
        CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [AuditLogs] (
        [Id] bigint NOT NULL IDENTITY,
        [UserId] uniqueidentifier NULL,
        [UserName] nvarchar(max) NULL,
        [EntityType] nvarchar(100) NOT NULL,
        [EntityId] nvarchar(100) NOT NULL,
        [Action] nvarchar(50) NOT NULL,
        [Changes] nvarchar(max) NULL,
        [OldValues] nvarchar(max) NULL,
        [NewValues] nvarchar(max) NULL,
        [IpAddress] nvarchar(45) NULL,
        [UserAgent] nvarchar(512) NULL,
        [Timestamp] datetime2 NOT NULL,
        [TenantId] uniqueidentifier NULL,
        [Severity] int NOT NULL,
        CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [AuthUsers] (
        [Id] uniqueidentifier NOT NULL,
        [Email] nvarchar(256) NULL,
        [PasswordHash] nvarchar(512) NOT NULL,
        [UserType] nvarchar(20) NOT NULL,
        [Status] bit NOT NULL DEFAULT CAST(1 AS bit),
        [FirebaseUid] nvarchar(128) NULL,
        [SuspendedUntil] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [TenantId] uniqueidentifier NULL,
        CONSTRAINT [PK_AuthUsers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [BusinessCategories] (
        [Id] int NOT NULL IDENTITY,
        [Key] nvarchar(200) NOT NULL,
        [Value] nvarchar(200) NOT NULL,
        [ValueAr] nvarchar(200) NOT NULL,
        [SortOrder] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_BusinessCategories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [ClientStatuses] (
        [Id] int NOT NULL IDENTITY,
        [NameEn] nvarchar(max) NOT NULL,
        [NameAr] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_ClientStatuses] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [Conversations] (
        [Id] uniqueidentifier NOT NULL,
        [UserMobile] nvarchar(20) NOT NULL,
        [AdminEmail] nvarchar(256) NULL,
        [Category] nvarchar(100) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [Status] nvarchar(max) NOT NULL DEFAULT N'Pending',
        CONSTRAINT [PK_Conversations] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [CreditConfigurations] (
        [Id] int NOT NULL IDENTITY,
        [Quantity] int NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [FromDate] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_CreditConfigurations] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [Groups] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(1000) NULL,
        [TenantId] uniqueidentifier NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [ModifiedAt] datetime2 NULL,
        [MetadataJson] nvarchar(max) NULL,
        CONSTRAINT [PK_Groups] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [Lookups] (
        [Id] int NOT NULL IDENTITY,
        [Type] int NOT NULL,
        [Key] nvarchar(100) NOT NULL,
        [Value] nvarchar(200) NOT NULL,
        [ValueAr] nvarchar(200) NOT NULL,
        [SortOrder] int NOT NULL,
        CONSTRAINT [PK_Lookups] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [Permissions] (
        [Id] int NOT NULL IDENTITY,
        [Key] nvarchar(200) NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(1000) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Permissions] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [SupportSessions] (
        [Id] uniqueidentifier NOT NULL,
        [UserMobile] nvarchar(50) NOT NULL,
        [Category] nvarchar(100) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [Status] nvarchar(max) NOT NULL DEFAULT N'Open',
        [UnreadCount] int NOT NULL DEFAULT 0,
        CONSTRAINT [PK_SupportSessions] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [UserTokens] (
        [UserId] nvarchar(450) NOT NULL,
        [FcmToken] nvarchar(500) NOT NULL,
        [DeviceType] nvarchar(50) NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_UserTokens] PRIMARY KEY ([UserId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [Investments] (
        [Id] int NOT NULL IDENTITY,
        [FounderId] uniqueidentifier NOT NULL,
        [InitialCapital] decimal(18,2) NOT NULL,
        [Date] datetime2 NOT NULL,
        [SharePrice] decimal(18,2) NULL,
        [TotalShares] int NULL,
        [AvailableShares] int NULL,
        [MinInvestment] decimal(18,2) NULL,
        [MaxInvestment] decimal(18,2) NULL,
        [ValuationCap] decimal(18,2) NULL,
        [ExpectedROI] decimal(5,2) NULL,
        [InvestmentTypeId] int NOT NULL,
        [Status] nvarchar(20) NOT NULL DEFAULT N'Draft',
        [BusinessName] nvarchar(200) NULL,
        [Description] nvarchar(max) NULL,
        [ImageUrl] nvarchar(500) NULL,
        [VideoUrl] nvarchar(500) NULL,
        [BusinessStageId] int NULL,
        [BusinessCategoryId] int NULL,
        [ProjectPhaseId] int NULL,
        [TargetFund] decimal(18,2) NULL,
        [Milestone] nvarchar(200) NULL,
        [RiskLevel] nvarchar(50) NULL,
        [Currency] nvarchar(10) NULL,
        [StartDate] datetime2 NULL,
        [EndDate] datetime2 NULL,
        CONSTRAINT [PK_Investments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Investments_ApplicationUsers_FounderId] FOREIGN KEY ([FounderId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [Transactions] (
        [Id] int NOT NULL IDENTITY,
        [WalletId] uniqueidentifier NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [Type] int NOT NULL,
        [Timestamp] datetime2 NOT NULL,
        CONSTRAINT [PK_Transactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Transactions_ApplicationUsers_WalletId] FOREIGN KEY ([WalletId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [UserProfiles] (
        [Id] int NOT NULL IDENTITY,
        [UserId] uniqueidentifier NOT NULL,
        [FullName] nvarchar(200) NULL,
        [FirstName] nvarchar(100) NULL,
        [LastName] nvarchar(100) NULL,
        [Gender] nvarchar(50) NULL,
        [Nationality] nvarchar(100) NULL,
        [Bio] nvarchar(1000) NULL,
        [Email] nvarchar(150) NULL,
        [Phone1] nvarchar(20) NULL,
        [Phone2] nvarchar(20) NULL,
        [WorkAddress] nvarchar(500) NULL,
        [Address] nvarchar(500) NULL,
        [AvatarUrl] nvarchar(500) NULL,
        [LinkedInUrl] nvarchar(250) NULL,
        [FacebookUrl] nvarchar(250) NULL,
        [DocumentNumber] nvarchar(50) NULL,
        [DocumentExpiryDate] datetime2 NULL,
        [VerificationStatus] int NOT NULL,
        [CurrentCredibilityScore] decimal(18,2) NOT NULL DEFAULT 0.0,
        [DocumentFrontImageUrl] nvarchar(500) NULL,
        [DocumentBackImageUrl] nvarchar(500) NULL,
        [LastLoginIP] nvarchar(45) NULL,
        [RegistrationIP] nvarchar(45) NULL,
        [DeviceInfo] nvarchar(500) NULL,
        [LastLoginDate] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_UserProfiles] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserProfiles_ApplicationUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [AspNetRoleClaims] (
        [Id] int NOT NULL IDENTITY,
        [RoleId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [AspNetUserClaims] (
        [Id] int NOT NULL IDENTITY,
        [UserId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [AspNetUserLogins] (
        [LoginProvider] nvarchar(450) NOT NULL,
        [ProviderKey] nvarchar(450) NOT NULL,
        [ProviderDisplayName] nvarchar(max) NULL,
        [UserId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [AspNetUserRoles] (
        [UserId] nvarchar(450) NOT NULL,
        [RoleId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [AspNetUserTokens] (
        [UserId] nvarchar(450) NOT NULL,
        [LoginProvider] nvarchar(450) NOT NULL,
        [Name] nvarchar(450) NOT NULL,
        [Value] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [Employees] (
        [Id] int NOT NULL IDENTITY,
        [UserId] uniqueidentifier NOT NULL,
        [EmployeeNumber] nvarchar(50) NOT NULL,
        [Department] nvarchar(100) NULL,
        [PermissionsLevel] tinyint NOT NULL DEFAULT CAST(1 AS tinyint),
        [HireDate] date NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Employees] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Employees_AuthUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AuthUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [RefreshTokens] (
        [Id] uniqueidentifier NOT NULL,
        [AuthUserId] uniqueidentifier NOT NULL,
        [Token] nvarchar(512) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [Revoked] bit NOT NULL DEFAULT CAST(0 AS bit),
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RefreshTokens_AuthUsers_AuthUserId] FOREIGN KEY ([AuthUserId]) REFERENCES [AuthUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [UserSessions] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [RefreshTokenHash] nvarchar(128) NOT NULL,
        [DeviceFingerprint] nvarchar(256) NULL,
        [UserAgent] nvarchar(512) NULL,
        [IpAddress] nvarchar(45) NOT NULL,
        [Location] nvarchar(200) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [LastUsedAt] datetime2 NULL,
        [IsRevoked] bit NOT NULL,
        [RevokedAt] datetime2 NULL,
        [RevocationReason] nvarchar(max) NULL,
        CONSTRAINT [PK_UserSessions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserSessions_AuthUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AuthUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [Clients] (
        [Id] int NOT NULL IDENTITY,
        [UserId] uniqueidentifier NOT NULL,
        [FirstName] nvarchar(100) NULL,
        [LastName] nvarchar(100) NULL,
        [Gender] nvarchar(20) NULL,
        [PersonalImageUrl] nvarchar(500) NULL,
        [MobileNumber] nvarchar(20) NULL,
        [FirebaseUid] nvarchar(200) NULL,
        [Phone] nvarchar(20) NULL,
        [Email] nvarchar(150) NULL,
        [Country] nvarchar(100) NULL,
        [City] nvarchar(100) NULL,
        [District] nvarchar(100) NULL,
        [Address1] nvarchar(500) NULL,
        [Address2] nvarchar(500) NULL,
        [NationalId] nvarchar(50) NULL,
        [BirthDate] datetime2 NULL,
        [Age] int NULL,
        [NationalIdImageUrl] nvarchar(500) NULL,
        [WebsiteUrl] nvarchar(500) NULL,
        [LinkedInUrl] nvarchar(250) NULL,
        [FacebookUrl] nvarchar(250) NULL,
        [BusinessRole] nvarchar(200) NULL,
        [Score] decimal(9,2) NOT NULL DEFAULT 0.0,
        [Credit] decimal(18,2) NOT NULL DEFAULT 0.0,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [StatusId] int NOT NULL,
        [ClientType] int NULL,
        [PenaltyDurationDays] int NULL,
        CONSTRAINT [PK_Clients] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Clients_AuthUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AuthUsers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Clients_ClientStatuses_StatusId] FOREIGN KEY ([StatusId]) REFERENCES [ClientStatuses] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [ConversationParticipants] (
        [ConversationId] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [Role] tinyint NOT NULL,
        [LastReadMessageId] uniqueidentifier NULL,
        [LastReadAt] datetimeoffset NULL,
        [IsMuted] bit NOT NULL DEFAULT CAST(0 AS bit),
        [JoinedAt] datetimeoffset NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_ConversationParticipants] PRIMARY KEY ([ConversationId], [UserId]),
        CONSTRAINT [FK_ConversationParticipants_Conversations_ConversationId] FOREIGN KEY ([ConversationId]) REFERENCES [Conversations] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [Roles] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(256) NOT NULL,
        [NormalizedName] nvarchar(256) NOT NULL,
        [Description] nvarchar(500) NULL,
        [GroupId] int NOT NULL,
        [TenantId] uniqueidentifier NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [ModifiedAt] datetime2 NULL,
        [CreatedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Roles_Groups_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [Groups] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [UserGroups] (
        [Id] int NOT NULL IDENTITY,
        [GroupId] int NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [AssignedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [AssignedBy] uniqueidentifier NULL,
        [UserId1] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_UserGroups] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserGroups_ApplicationUsers_UserId1] FOREIGN KEY ([UserId1]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserGroups_AuthUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AuthUsers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserGroups_Groups_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [Groups] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [ScoreTransactions] (
        [Id] int NOT NULL IDENTITY,
        [UserId] uniqueidentifier NOT NULL,
        [Score] numeric(5,2) NOT NULL,
        [TransactionTypeId] int NOT NULL,
        [ReviewerId] uniqueidentifier NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_ScoreTransactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ScoreTransactions_ApplicationUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ScoreTransactions_Lookups_TransactionTypeId] FOREIGN KEY ([TransactionTypeId]) REFERENCES [Lookups] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [GroupPermissions] (
        [Id] int NOT NULL IDENTITY,
        [GroupId] int NOT NULL,
        [PermissionId] int NOT NULL,
        [AssignedAt] datetime2 NOT NULL,
        [AssignedBy] uniqueidentifier NULL,
        [ApplicationPermissionId] int NULL,
        CONSTRAINT [PK_GroupPermissions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_GroupPermissions_ApplicationPermissions_ApplicationPermissionId] FOREIGN KEY ([ApplicationPermissionId]) REFERENCES [ApplicationPermissions] ([Id]),
        CONSTRAINT [FK_GroupPermissions_Groups_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [Groups] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_GroupPermissions_Permissions_PermissionId] FOREIGN KEY ([PermissionId]) REFERENCES [Permissions] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [ChatMessages] (
        [Id] uniqueidentifier NOT NULL,
        [SenderId] nvarchar(256) NOT NULL,
        [MessageText] nvarchar(max) NOT NULL,
        [Timestamp] datetime2 NOT NULL DEFAULT (GETDATE()),
        [IsRead] bit NOT NULL DEFAULT CAST(0 AS bit),
        [SupportSessionId] uniqueidentifier NULL,
        [ConversationId] uniqueidentifier NULL,
        CONSTRAINT [PK_ChatMessages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ChatMessages_Conversations_ConversationId] FOREIGN KEY ([ConversationId]) REFERENCES [Conversations] ([Id]),
        CONSTRAINT [FK_ChatMessages_SupportSessions_SupportSessionId] FOREIGN KEY ([SupportSessionId]) REFERENCES [SupportSessions] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [Messages] (
        [Id] uniqueidentifier NOT NULL,
        [SupportSessionId] uniqueidentifier NOT NULL,
        [SenderId] nvarchar(256) NOT NULL,
        [MessageText] nvarchar(max) NOT NULL,
        [Timestamp] datetime2 NOT NULL DEFAULT (GETDATE()),
        [IsRead] bit NOT NULL DEFAULT CAST(0 AS bit),
        CONSTRAINT [PK_Messages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Messages_SupportSessions_SupportSessionId] FOREIGN KEY ([SupportSessionId]) REFERENCES [SupportSessions] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [InvestmentEvents] (
        [Id] uniqueidentifier NOT NULL,
        [InvestmentId] int NOT NULL,
        [EventType] nvarchar(100) NOT NULL,
        [Payload] nvarchar(max) NULL,
        [OccurredAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
        [CreatedBy] uniqueidentifier NULL,
        [CorrelationId] uniqueidentifier NULL,
        [Version] int NOT NULL,
        [Metadata] nvarchar(max) NULL,
        CONSTRAINT [PK_InvestmentEvents] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_InvestmentEvents_Investments_InvestmentId] FOREIGN KEY ([InvestmentId]) REFERENCES [Investments] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [InvestmentParticipants] (
        [Id] int NOT NULL IDENTITY,
        [InvestmentId] int NOT NULL,
        [InvestorId] uniqueidentifier NOT NULL,
        [SharesPurchased] int NOT NULL,
        [AmountInvested] decimal(18,2) NOT NULL,
        [InvestmentDate] datetime2 NOT NULL DEFAULT (GETDATE()),
        [Status] nvarchar(20) NOT NULL DEFAULT N'Confirmed',
        [IsAnonymous] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_InvestmentParticipants] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_InvestmentParticipants_ApplicationUsers_InvestorId] FOREIGN KEY ([InvestorId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_InvestmentParticipants_Investments_InvestmentId] FOREIGN KEY ([InvestmentId]) REFERENCES [Investments] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [ClientBusinessCategories] (
        [ClientId] int NOT NULL,
        [BusinessCategoryId] int NOT NULL,
        CONSTRAINT [PK_ClientBusinessCategories] PRIMARY KEY ([ClientId], [BusinessCategoryId]),
        CONSTRAINT [FK_ClientBusinessCategories_BusinessCategories_BusinessCategoryId] FOREIGN KEY ([BusinessCategoryId]) REFERENCES [BusinessCategories] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ClientBusinessCategories_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [ClientStatusHistories] (
        [Id] int NOT NULL IDENTITY,
        [ClientId] int NOT NULL,
        [OldStatusId] int NULL,
        [NewStatusId] int NOT NULL,
        [Reason] nvarchar(1000) NULL,
        [ChangedByAdminId] uniqueidentifier NOT NULL,
        [ChangedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_ClientStatusHistories] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ClientStatusHistories_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [CreditTransactions] (
        [Id] int NOT NULL IDENTITY,
        [UserId] uniqueidentifier NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [JustificationAr] nvarchar(500) NOT NULL,
        [JustificationEn] nvarchar(500) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [AdminId] uniqueidentifier NULL,
        [ClientId] int NULL,
        [UserId1] uniqueidentifier NULL,
        CONSTRAINT [PK_CreditTransactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CreditTransactions_ApplicationUsers_AdminId] FOREIGN KEY ([AdminId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_CreditTransactions_ApplicationUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_CreditTransactions_ApplicationUsers_UserId1] FOREIGN KEY ([UserId1]) REFERENCES [ApplicationUsers] ([Id]),
        CONSTRAINT [FK_CreditTransactions_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [RolePermissions] (
        [Id] int NOT NULL IDENTITY,
        [RoleId] uniqueidentifier NOT NULL,
        [PermissionId] int NOT NULL,
        [AssignedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [AssignedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_RolePermissions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RolePermissions_Permissions_PermissionId] FOREIGN KEY ([PermissionId]) REFERENCES [Permissions] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_RolePermissions_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [UserRoles] (
        [Id] int NOT NULL IDENTITY,
        [UserId] uniqueidentifier NOT NULL,
        [AuthUserId] uniqueidentifier NULL,
        [RoleId] uniqueidentifier NOT NULL,
        [AssignedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [AssignedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_UserRoles] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserRoles_ApplicationUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [MessageAttachments] (
        [Id] uniqueidentifier NOT NULL,
        [MessageId] uniqueidentifier NOT NULL,
        [StoragePath] nvarchar(1024) NOT NULL,
        [FileName] nvarchar(512) NOT NULL,
        [ContentType] nvarchar(max) NULL,
        [SizeBytes] bigint NOT NULL,
        CONSTRAINT [PK_MessageAttachments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_MessageAttachments_ChatMessages_MessageId] FOREIGN KEY ([MessageId]) REFERENCES [ChatMessages] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE TABLE [MessageReactions] (
        [MessageId] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [Reaction] nvarchar(50) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_MessageReactions] PRIMARY KEY ([MessageId], [UserId]),
        CONSTRAINT [FK_MessageReactions_ChatMessages_MessageId] FOREIGN KEY ([MessageId]) REFERENCES [ChatMessages] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ClientType', N'CredibilityScore', N'Email', N'Name', N'Role', N'WalletBalance') AND [object_id] = OBJECT_ID(N'[ApplicationUsers]'))
        SET IDENTITY_INSERT [ApplicationUsers] ON;
    EXEC(N'INSERT INTO [ApplicationUsers] ([Id], [ClientType], [CredibilityScore], [Email], [Name], [Role], [WalletBalance])
    VALUES (''11111111-1111-1111-1111-111111111111'', 1, 4200, N''alice.founder@example.com'', N''Alice Founder'', N''Client'', 100000.0),
    (''22222222-2222-2222-2222-222222222222'', 0, 3750, N''bob.investor@example.com'', N''Bob Investor'', N''Client'', 25000.0),
    (''33333333-3333-3333-3333-333333333333'', 0, 3600, N''clara.investor@example.com'', N''Clara Investor'', N''Client'', 15000.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ClientType', N'CredibilityScore', N'Email', N'Name', N'Role', N'WalletBalance') AND [object_id] = OBJECT_ID(N'[ApplicationUsers]'))
        SET IDENTITY_INSERT [ApplicationUsers] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Key', N'SortOrder', N'Value', N'ValueAr') AND [object_id] = OBJECT_ID(N'[BusinessCategories]'))
        SET IDENTITY_INSERT [BusinessCategories] ON;
    EXEC(N'INSERT INTO [BusinessCategories] ([Id], [Key], [SortOrder], [Value], [ValueAr])
    VALUES (100, N''Technology'', 1, N''Technology'', N''تكنولوجيا''),
    (101, N''Industry'', 2, N''Industry'', N''صناعة''),
    (102, N''Trading'', 3, N''Trading'', N''تجارة'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Key', N'SortOrder', N'Value', N'ValueAr') AND [object_id] = OBJECT_ID(N'[BusinessCategories]'))
        SET IDENTITY_INSERT [BusinessCategories] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'NameAr', N'NameEn') AND [object_id] = OBJECT_ID(N'[ClientStatuses]'))
        SET IDENTITY_INSERT [ClientStatuses] ON;
    EXEC(N'INSERT INTO [ClientStatuses] ([Id], [NameAr], [NameEn])
    VALUES (1, N''نشط'', N''Active''),
    (2, N''غير نشط'', N''Diactive''),
    (3, N''معلق'', N''Suspended'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'NameAr', N'NameEn') AND [object_id] = OBJECT_ID(N'[ClientStatuses]'))
        SET IDENTITY_INSERT [ClientStatuses] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'IsActive', N'MetadataJson', N'ModifiedAt', N'Name', N'TenantId') AND [object_id] = OBJECT_ID(N'[Groups]'))
        SET IDENTITY_INSERT [Groups] ON;
    EXEC(N'INSERT INTO [Groups] ([Id], [CreatedAt], [Description], [IsActive], [MetadataJson], [ModifiedAt], [Name], [TenantId])
    VALUES (1000, ''2025-12-29T00:00:00.0000000Z'', N''Organization administrator - full access'', CAST(1 AS bit), NULL, NULL, N''Org_Admin'', NULL),
    (1001, ''2025-12-29T00:00:00.0000000Z'', N''Admin with elevated privileges'', CAST(1 AS bit), NULL, NULL, N''Admin'', NULL),
    (1002, ''2025-12-29T00:00:00.0000000Z'', N''Manager with limited admin privileges'', CAST(1 AS bit), NULL, NULL, N''Manager'', NULL),
    (1003, ''2025-12-29T00:00:00.0000000Z'', N''Read-only admin'', CAST(1 AS bit), NULL, NULL, N''Viewer'', NULL)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'IsActive', N'MetadataJson', N'ModifiedAt', N'Name', N'TenantId') AND [object_id] = OBJECT_ID(N'[Groups]'))
        SET IDENTITY_INSERT [Groups] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Key', N'SortOrder', N'Type', N'Value', N'ValueAr') AND [object_id] = OBJECT_ID(N'[Lookups]'))
        SET IDENTITY_INSERT [Lookups] ON;
    EXEC(N'INSERT INTO [Lookups] ([Id], [Key], [SortOrder], [Type], [Value], [ValueAr])
    VALUES (1, N''Idea'', 1, 1, N''Idea'', N''فكرة''),
    (2, N''MVP'', 2, 1, N''MVP'', N''المنتج الأولي''),
    (3, N''Startup'', 3, 1, N''Startup'', N''شركة ناشئة''),
    (4, N''Running'', 4, 1, N''Running'', N''قيد التشغيل''),
    (5, N''Expanding'', 5, 1, N''Expanding'', N''توسع''),
    (6, N''Initiation'', 1, 3, N''Initiation'', N''البدء''),
    (7, N''Planning'', 2, 3, N''Planning'', N''التخطيط''),
    (8, N''Execution'', 3, 3, N''Execution'', N''التنفيذ''),
    (9, N''Testing'', 4, 3, N''Testing'', N''الاختبار''),
    (10, N''Launching'', 5, 3, N''Launching'', N''الإطلاق''),
    (11, N''Low'', 1, 4, N''Low'', N''منخفض''),
    (12, N''Medium'', 2, 4, N''Medium'', N''متوسط''),
    (13, N''High'', 3, 4, N''High'', N''مرتفع''),
    (100, N''Technology'', 1, 2, N''Technology'', N''تكنولوجيا''),
    (101, N''Industry'', 2, 2, N''Industry'', N''صناعة''),
    (102, N''Trading'', 3, 2, N''Trading'', N''تجارة''),
    (200, N''Review'', 1, 20, N''Review'', N''مراجعة''),
    (201, N''Interactive'', 2, 20, N''Interactive'', N''تفاعلي''),
    (202, N''Deal'', 3, 20, N''Deal'', N''صفقة'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Key', N'SortOrder', N'Type', N'Value', N'ValueAr') AND [object_id] = OBJECT_ID(N'[Lookups]'))
        SET IDENTITY_INSERT [Lookups] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Key', N'Name') AND [object_id] = OBJECT_ID(N'[Permissions]'))
        SET IDENTITY_INSERT [Permissions] ON;
    EXEC(N'INSERT INTO [Permissions] ([Id], [CreatedAt], [Description], [Key], [Name])
    VALUES (2000, ''2025-12-29T00:00:00.0000000Z'', N''Read client records'', N''admin.clients.read'', N''Read Clients''),
    (2001, ''2025-12-29T00:00:00.0000000Z'', N''Create/update/delete clients'', N''admin.clients.manage'', N''Manage Clients''),
    (2002, ''2025-12-29T00:00:00.0000000Z'', N''CRUD categories'', N''admin.categories.manage'', N''Manage Categories''),
    (2003, ''2025-12-29T00:00:00.0000000Z'', N''Manage groups and assignments'', N''admin.groups.manage'', N''Manage Groups''),
    (2004, ''2025-12-29T00:00:00.0000000Z'', N''Manage lookup values'', N''admin.lookups.manage'', N''Manage Lookups''),
    (2005, ''2025-12-29T00:00:00.0000000Z'', N''Development utility endpoints'', N''admin.dev.manage'', N''Dev Tools'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Key', N'Name') AND [object_id] = OBJECT_ID(N'[Permissions]'))
        SET IDENTITY_INSERT [Permissions] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ApplicationPermissionId', N'AssignedAt', N'AssignedBy', N'GroupId', N'PermissionId') AND [object_id] = OBJECT_ID(N'[GroupPermissions]'))
        SET IDENTITY_INSERT [GroupPermissions] ON;
    EXEC(N'INSERT INTO [GroupPermissions] ([Id], [ApplicationPermissionId], [AssignedAt], [AssignedBy], [GroupId], [PermissionId])
    VALUES (1, NULL, ''2025-12-29T00:00:00.0000000Z'', NULL, 1000, 2000),
    (2, NULL, ''2025-12-29T00:00:00.0000000Z'', NULL, 1000, 2001),
    (3, NULL, ''2025-12-29T00:00:00.0000000Z'', NULL, 1000, 2002),
    (4, NULL, ''2025-12-29T00:00:00.0000000Z'', NULL, 1000, 2003),
    (5, NULL, ''2025-12-29T00:00:00.0000000Z'', NULL, 1000, 2004),
    (6, NULL, ''2025-12-29T00:00:00.0000000Z'', NULL, 1000, 2005)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ApplicationPermissionId', N'AssignedAt', N'AssignedBy', N'GroupId', N'PermissionId') AND [object_id] = OBJECT_ID(N'[GroupPermissions]'))
        SET IDENTITY_INSERT [GroupPermissions] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AvailableShares', N'BusinessCategoryId', N'BusinessName', N'BusinessStageId', N'Currency', N'Date', N'Description', N'EndDate', N'ExpectedROI', N'FounderId', N'ImageUrl', N'InitialCapital', N'InvestmentTypeId', N'MaxInvestment', N'Milestone', N'MinInvestment', N'ProjectPhaseId', N'RiskLevel', N'SharePrice', N'StartDate', N'Status', N'TargetFund', N'TotalShares', N'ValuationCap', N'VideoUrl') AND [object_id] = OBJECT_ID(N'[Investments]'))
        SET IDENTITY_INSERT [Investments] ON;
    EXEC(N'INSERT INTO [Investments] ([Id], [AvailableShares], [BusinessCategoryId], [BusinessName], [BusinessStageId], [Currency], [Date], [Description], [EndDate], [ExpectedROI], [FounderId], [ImageUrl], [InitialCapital], [InvestmentTypeId], [MaxInvestment], [Milestone], [MinInvestment], [ProjectPhaseId], [RiskLevel], [SharePrice], [StartDate], [Status], [TargetFund], [TotalShares], [ValuationCap], [VideoUrl])
    VALUES (1000, 8000, 100, N''SolarGrid Energy'', NULL, N''USD'', ''2025-12-29T00:00:00.0000000Z'', N''Distributed solar microgrid for emerging markets.'', ''2026-01-28T00:00:00.0000000Z'', 12.5, ''11111111-1111-1111-1111-111111111111'', NULL, 50000.0, 2, 5000.0, NULL, 100.0, NULL, N''Medium'', 10.0, ''2025-12-15T00:00:00.0000000Z'', N''Active'', 100000.0, 10000, 5000000.0, NULL),
    (1001, 1200, 101, N''AquaPure'', NULL, N''USD'', ''2025-12-29T00:00:00.0000000Z'', N''Affordable water purification devices.'', ''2026-01-12T00:00:00.0000000Z'', 10.0, ''11111111-1111-1111-1111-111111111111'', NULL, 20000.0, 2, 2000.0, NULL, 50.0, NULL, N''Low'', 5.0, ''2025-12-22T00:00:00.0000000Z'', N''Active'', 25000.0, 5000, 2000000.0, NULL)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AvailableShares', N'BusinessCategoryId', N'BusinessName', N'BusinessStageId', N'Currency', N'Date', N'Description', N'EndDate', N'ExpectedROI', N'FounderId', N'ImageUrl', N'InitialCapital', N'InvestmentTypeId', N'MaxInvestment', N'Milestone', N'MinInvestment', N'ProjectPhaseId', N'RiskLevel', N'SharePrice', N'StartDate', N'Status', N'TargetFund', N'TotalShares', N'ValuationCap', N'VideoUrl') AND [object_id] = OBJECT_ID(N'[Investments]'))
        SET IDENTITY_INSERT [Investments] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AmountInvested', N'CreatedAt', N'InvestmentDate', N'InvestmentId', N'InvestorId', N'IsAnonymous', N'SharesPurchased', N'Status') AND [object_id] = OBJECT_ID(N'[InvestmentParticipants]'))
        SET IDENTITY_INSERT [InvestmentParticipants] ON;
    EXEC(N'INSERT INTO [InvestmentParticipants] ([Id], [AmountInvested], [CreatedAt], [InvestmentDate], [InvestmentId], [InvestorId], [IsAnonymous], [SharesPurchased], [Status])
    VALUES (5000, 3000.0, ''2025-12-24T00:00:00.0000000Z'', ''2025-12-24T00:00:00.0000000Z'', 1000, ''22222222-2222-2222-2222-222222222222'', CAST(0 AS bit), 300, N''Confirmed''),
    (5001, 2000.0, ''2025-12-26T00:00:00.0000000Z'', ''2025-12-26T00:00:00.0000000Z'', 1000, ''33333333-3333-3333-3333-333333333333'', CAST(0 AS bit), 200, N''Confirmed''),
    (5002, 500.0, ''2025-12-27T00:00:00.0000000Z'', ''2025-12-27T00:00:00.0000000Z'', 1001, ''22222222-2222-2222-2222-222222222222'', CAST(0 AS bit), 100, N''Confirmed'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AmountInvested', N'CreatedAt', N'InvestmentDate', N'InvestmentId', N'InvestorId', N'IsAnonymous', N'SharesPurchased', N'Status') AND [object_id] = OBJECT_ID(N'[InvestmentParticipants]'))
        SET IDENTITY_INSERT [InvestmentParticipants] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ApplicationPermissions_Key] ON [ApplicationPermissions] ([Key]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_ApplicationPermissions_ParentPermissionId] ON [ApplicationPermissions] ([ParentPermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_ApplicationPermissions_ResourceType_Action] ON [ApplicationPermissions] ([ResourceType], [Action]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_ApplicationPermissions_TenantId] ON [ApplicationPermissions] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_EntityType] ON [AuditLogs] ([EntityType]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_EntityType_EntityId] ON [AuditLogs] ([EntityType], [EntityId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_TenantId] ON [AuditLogs] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_Timestamp] ON [AuditLogs] ([Timestamp]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_UserId] ON [AuditLogs] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_AuthUsers_Email] ON [AuthUsers] ([Email]) WHERE "Email" IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    EXEC(N'CREATE INDEX [IX_AuthUsers_FirebaseUid] ON [AuthUsers] ([FirebaseUid]) WHERE "FirebaseUid" IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_ChatMessages_ConversationId] ON [ChatMessages] ([ConversationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_ChatMessages_SupportSessionId_Timestamp] ON [ChatMessages] ([SupportSessionId], [Timestamp]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_ClientBusinessCategories_BusinessCategoryId] ON [ClientBusinessCategories] ([BusinessCategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_Clients_Email] ON [Clients] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_Clients_MobileNumber] ON [Clients] ([MobileNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_Clients_Phone] ON [Clients] ([Phone]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_Clients_StatusId] ON [Clients] ([StatusId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Clients_UserId] ON [Clients] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_ClientStatusHistories_ClientId] ON [ClientStatusHistories] ([ClientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_ConversationParticipants_UserId] ON [ConversationParticipants] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_CreditTransactions_AdminId] ON [CreditTransactions] ([AdminId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_CreditTransactions_ClientId] ON [CreditTransactions] ([ClientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_CreditTransactions_UserId] ON [CreditTransactions] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_CreditTransactions_UserId1] ON [CreditTransactions] ([UserId1]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Employees_EmployeeNumber] ON [Employees] ([EmployeeNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Employees_UserId] ON [Employees] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_GroupPermissions_ApplicationPermissionId] ON [GroupPermissions] ([ApplicationPermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_GroupPermissions_GroupId_PermissionId] ON [GroupPermissions] ([GroupId], [PermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_GroupPermissions_PermissionId] ON [GroupPermissions] ([PermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Groups_Name] ON [Groups] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_InvestmentEvents_InvestmentId] ON [InvestmentEvents] ([InvestmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_InvestmentEvents_InvestmentId_OccurredAt] ON [InvestmentEvents] ([InvestmentId], [OccurredAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_InvestmentEvents_InvestmentId_Version] ON [InvestmentEvents] ([InvestmentId], [Version]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_InvestmentParticipants_InvestmentId] ON [InvestmentParticipants] ([InvestmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_InvestmentParticipants_InvestorId] ON [InvestmentParticipants] ([InvestorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_Investments_FounderId] ON [Investments] ([FounderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_MessageAttachments_MessageId] ON [MessageAttachments] ([MessageId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_Messages_SupportSessionId_Timestamp] ON [Messages] ([SupportSessionId], [Timestamp]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Permissions_Key] ON [Permissions] ([Key]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_AuthUserId] ON [RefreshTokens] ([AuthUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RefreshTokens_Token] ON [RefreshTokens] ([Token]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_RolePermissions_PermissionId] ON [RolePermissions] ([PermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RolePermissions_RoleId_PermissionId] ON [RolePermissions] ([RoleId], [PermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Roles_GroupId_Name] ON [Roles] ([GroupId], [Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Roles_NormalizedName] ON [Roles] ([NormalizedName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_ScoreTransactions_TransactionTypeId] ON [ScoreTransactions] ([TransactionTypeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_ScoreTransactions_UserId] ON [ScoreTransactions] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_Transactions_WalletId] ON [Transactions] ([WalletId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_UserGroups_GroupId] ON [UserGroups] ([GroupId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserGroups_UserId_GroupId] ON [UserGroups] ([UserId], [GroupId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_UserGroups_UserId1] ON [UserGroups] ([UserId1]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserProfiles_UserId] ON [UserProfiles] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserRoles_UserId_RoleId] ON [UserRoles] ([UserId], [RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserSessions_RefreshTokenHash] ON [UserSessions] ([RefreshTokenHash]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_UserSessions_UserId] ON [UserSessions] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    CREATE INDEX [IX_UserSessions_UserId_ExpiresAt] ON [UserSessions] ([UserId], [ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260123125914_InitialConsolidated'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260123125914_InitialConsolidated', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125213807_AddInvestmentTeamMembers'
)
BEGIN
    CREATE TABLE [InvestmentTeamMembers] (
        [Id] int NOT NULL IDENTITY,
        [InvestmentId] int NOT NULL,
        [UserId] uniqueidentifier NULL,
        [Name] nvarchar(200) NOT NULL,
        [Role] nvarchar(100) NOT NULL,
        [AvatarUrl] nvarchar(500) NULL,
        [LinkedInUrl] nvarchar(300) NULL,
        [Bio] nvarchar(2000) NULL,
        [SortOrder] int NOT NULL,
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_InvestmentTeamMembers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_InvestmentTeamMembers_ApplicationUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_InvestmentTeamMembers_Investments_InvestmentId] FOREIGN KEY ([InvestmentId]) REFERENCES [Investments] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125213807_AddInvestmentTeamMembers'
)
BEGIN
    CREATE INDEX [IX_InvestmentTeamMembers_InvestmentId] ON [InvestmentTeamMembers] ([InvestmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125213807_AddInvestmentTeamMembers'
)
BEGIN
    CREATE INDEX [IX_InvestmentTeamMembers_InvestmentId_SortOrder] ON [InvestmentTeamMembers] ([InvestmentId], [SortOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125213807_AddInvestmentTeamMembers'
)
BEGIN
    CREATE INDEX [IX_InvestmentTeamMembers_UserId] ON [InvestmentTeamMembers] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125213807_AddInvestmentTeamMembers'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260125213807_AddInvestmentTeamMembers', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125215353_RequireTeamMemberUser'
)
BEGIN
    ALTER TABLE [InvestmentTeamMembers] DROP CONSTRAINT [FK_InvestmentTeamMembers_ApplicationUsers_UserId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125215353_RequireTeamMemberUser'
)
BEGIN
    DECLARE @var sysname;
    SELECT @var = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[InvestmentTeamMembers]') AND [c].[name] = N'AvatarUrl');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [InvestmentTeamMembers] DROP CONSTRAINT [' + @var + '];');
    ALTER TABLE [InvestmentTeamMembers] DROP COLUMN [AvatarUrl];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125215353_RequireTeamMemberUser'
)
BEGIN
    DECLARE @var1 sysname;
    SELECT @var1 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[InvestmentTeamMembers]') AND [c].[name] = N'Bio');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [InvestmentTeamMembers] DROP CONSTRAINT [' + @var1 + '];');
    ALTER TABLE [InvestmentTeamMembers] DROP COLUMN [Bio];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125215353_RequireTeamMemberUser'
)
BEGIN
    DECLARE @var2 sysname;
    SELECT @var2 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[InvestmentTeamMembers]') AND [c].[name] = N'LinkedInUrl');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [InvestmentTeamMembers] DROP CONSTRAINT [' + @var2 + '];');
    ALTER TABLE [InvestmentTeamMembers] DROP COLUMN [LinkedInUrl];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125215353_RequireTeamMemberUser'
)
BEGIN
    DECLARE @var3 sysname;
    SELECT @var3 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[InvestmentTeamMembers]') AND [c].[name] = N'Name');
    IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [InvestmentTeamMembers] DROP CONSTRAINT [' + @var3 + '];');
    ALTER TABLE [InvestmentTeamMembers] DROP COLUMN [Name];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125215353_RequireTeamMemberUser'
)
BEGIN
    DROP INDEX [IX_InvestmentTeamMembers_UserId] ON [InvestmentTeamMembers];
    DECLARE @var4 sysname;
    SELECT @var4 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[InvestmentTeamMembers]') AND [c].[name] = N'UserId');
    IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [InvestmentTeamMembers] DROP CONSTRAINT [' + @var4 + '];');
    EXEC(N'UPDATE [InvestmentTeamMembers] SET [UserId] = ''00000000-0000-0000-0000-000000000000'' WHERE [UserId] IS NULL');
    ALTER TABLE [InvestmentTeamMembers] ALTER COLUMN [UserId] uniqueidentifier NOT NULL;
    ALTER TABLE [InvestmentTeamMembers] ADD DEFAULT '00000000-0000-0000-0000-000000000000' FOR [UserId];
    CREATE INDEX [IX_InvestmentTeamMembers_UserId] ON [InvestmentTeamMembers] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125215353_RequireTeamMemberUser'
)
BEGIN
    CREATE UNIQUE INDEX [IX_InvestmentTeamMembers_InvestmentId_UserId] ON [InvestmentTeamMembers] ([InvestmentId], [UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125215353_RequireTeamMemberUser'
)
BEGIN
    ALTER TABLE [InvestmentTeamMembers] ADD CONSTRAINT [FK_InvestmentTeamMembers_ApplicationUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260125215353_RequireTeamMemberUser'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260125215353_RequireTeamMemberUser', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260127221923_AddUserProfileDateOfBirthAndCountry'
)
BEGIN
    ALTER TABLE [UserProfiles] ADD [Country] nvarchar(100) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260127221923_AddUserProfileDateOfBirthAndCountry'
)
BEGIN
    ALTER TABLE [UserProfiles] ADD [DateOfBirth] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260127221923_AddUserProfileDateOfBirthAndCountry'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260127221923_AddUserProfileDateOfBirthAndCountry', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260129200642_BE-341-InvestmentRequests'
)
BEGIN
    CREATE TABLE [InvestmentRequests] (
        [Id] int NOT NULL IDENTITY,
        [InvestmentId] int NOT NULL,
        [InvestorId] uniqueidentifier NOT NULL,
        [FounderId] uniqueidentifier NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [Shares] int NULL,
        [Status] nvarchar(20) NOT NULL,
        [Direction] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_InvestmentRequests] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_InvestmentRequests_Investments_InvestmentId] FOREIGN KEY ([InvestmentId]) REFERENCES [Investments] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260129200642_BE-341-InvestmentRequests'
)
BEGIN
    CREATE INDEX [IX_InvestmentRequests_FounderId] ON [InvestmentRequests] ([FounderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260129200642_BE-341-InvestmentRequests'
)
BEGIN
    CREATE INDEX [IX_InvestmentRequests_InvestmentId] ON [InvestmentRequests] ([InvestmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260129200642_BE-341-InvestmentRequests'
)
BEGIN
    CREATE INDEX [IX_InvestmentRequests_InvestorId] ON [InvestmentRequests] ([InvestorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260129200642_BE-341-InvestmentRequests'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260129200642_BE-341-InvestmentRequests', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260130041351_20260130152000_BE-XXX_CapturePendingModelChanges'
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns WHERE Name = N'RequestType' AND Object_ID = Object_ID(N'dbo.InvestmentRequests')
    )
    BEGIN
        ALTER TABLE [InvestmentRequests] ADD [RequestType] nvarchar(50) NULL;
        UPDATE InvestmentRequests SET RequestType = 'investment_request' WHERE RequestType IS NULL;
    END
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260130041351_20260130152000_BE-XXX_CapturePendingModelChanges'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260130041351_20260130152000_BE-XXX_CapturePendingModelChanges', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260130120000_BE-XXX_AddRequestTypeToInvestmentRequests'
)
BEGIN
    ALTER TABLE [InvestmentRequests] ADD [RequestType] nvarchar(50) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260130120000_BE-XXX_AddRequestTypeToInvestmentRequests'
)
BEGIN
    UPDATE InvestmentRequests SET RequestType = 'investment_request' WHERE RequestType IS NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260130120000_BE-XXX_AddRequestTypeToInvestmentRequests'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260130120000_BE-XXX_AddRequestTypeToInvestmentRequests', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    ALTER TABLE [UserProfiles] ADD [CompanyAddress] nvarchar(500) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    ALTER TABLE [UserProfiles] ADD [CompanyEmail] nvarchar(150) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    ALTER TABLE [UserProfiles] ADD [CompanyName] nvarchar(200) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    ALTER TABLE [UserProfiles] ADD [DeviceMacAddress] nvarchar(100) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    ALTER TABLE [UserProfiles] ADD [HrLetterBase64] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    ALTER TABLE [UserProfiles] ADD [HrLetterFileName] nvarchar(260) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    ALTER TABLE [Investments] ADD [DurationMonths] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    ALTER TABLE [Investments] ADD [PayoutFrequency] nvarchar(50) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    ALTER TABLE [Investments] ADD [ProfitPercentage] decimal(5,2) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    EXEC(N'UPDATE [Investments] SET [DurationMonths] = NULL, [PayoutFrequency] = NULL, [ProfitPercentage] = NULL
    WHERE [Id] = 1000;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    EXEC(N'UPDATE [Investments] SET [DurationMonths] = NULL, [PayoutFrequency] = NULL, [ProfitPercentage] = NULL
    WHERE [Id] = 1001;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260208193915_AddCompanyAndHrLetterToUserProfile'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260208193915_AddCompanyAndHrLetterToUserProfile', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260209230505_EnsureProfileCompanyColumns'
)
BEGIN

    IF COL_LENGTH('UserProfiles', 'CompanyName') IS NULL
        ALTER TABLE [UserProfiles] ADD [CompanyName] nvarchar(200) NULL;

    IF COL_LENGTH('UserProfiles', 'CompanyAddress') IS NULL
        ALTER TABLE [UserProfiles] ADD [CompanyAddress] nvarchar(500) NULL;

    IF COL_LENGTH('UserProfiles', 'CompanyEmail') IS NULL
        ALTER TABLE [UserProfiles] ADD [CompanyEmail] nvarchar(150) NULL;

    IF COL_LENGTH('UserProfiles', 'HrLetterFileName') IS NULL
        ALTER TABLE [UserProfiles] ADD [HrLetterFileName] nvarchar(260) NULL;

    IF COL_LENGTH('UserProfiles', 'HrLetterBase64') IS NULL
        ALTER TABLE [UserProfiles] ADD [HrLetterBase64] nvarchar(max) NULL;

    IF COL_LENGTH('UserProfiles', 'DeviceMacAddress') IS NULL
        ALTER TABLE [UserProfiles] ADD [DeviceMacAddress] nvarchar(100) NULL;

END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260209230505_EnsureProfileCompanyColumns'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260209230505_EnsureProfileCompanyColumns', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210145831_AddKycCompletionTracking'
)
BEGIN
    ALTER TABLE [UserProfiles] ADD [IsKycVerified] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210145831_AddKycCompletionTracking'
)
BEGIN
    ALTER TABLE [UserProfiles] ADD [KycCompletionPercentage] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210145831_AddKycCompletionTracking'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260210145831_AddKycCompletionTracking', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210213643_AddContactCity_RemoveWorkAddress_Auto'
)
BEGIN
    DECLARE @var5 sysname;
    SELECT @var5 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[UserProfiles]') AND [c].[name] = N'WorkAddress');
    IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [UserProfiles] DROP CONSTRAINT [' + @var5 + '];');
    ALTER TABLE [UserProfiles] DROP COLUMN [WorkAddress];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210213643_AddContactCity_RemoveWorkAddress_Auto'
)
BEGIN
    ALTER TABLE [UserProfiles] ADD [City] nvarchar(100) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210213643_AddContactCity_RemoveWorkAddress_Auto'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260210213643_AddContactCity_RemoveWorkAddress_Auto', N'9.0.2');
END;

COMMIT;
GO

