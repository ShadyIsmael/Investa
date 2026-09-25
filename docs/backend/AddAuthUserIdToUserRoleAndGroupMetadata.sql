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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
        CONSTRAINT [PK_AuthUsers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE TABLE [Groups] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(1000) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Groups] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE TABLE [Investments] (
        [Id] int NOT NULL IDENTITY,
        [InvestorId] uniqueidentifier NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [Date] datetime2 NOT NULL,
        [BusinessName] nvarchar(200) NULL,
        [Description] nvarchar(max) NULL,
        [StartDate] datetime2 NULL,
        [BusinessStageId] int NULL,
        [BusinessCategoryId] int NULL,
        [ProjectPhaseId] int NULL,
        [TargetFund] decimal(18,2) NULL,
        [Milestone] nvarchar(200) NULL,
        [RiskLevel] nvarchar(50) NULL,
        [Currency] nvarchar(10) NULL,
        CONSTRAINT [PK_Investments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Investments_ApplicationUsers_InvestorId] FOREIGN KEY ([InvestorId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
        [Score] decimal(5,2) NOT NULL DEFAULT 0.0,
        [Credit] decimal(18,2) NOT NULL DEFAULT 0.0,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [StatusId] int NOT NULL,
        [PenaltyDurationDays] int NULL,
        CONSTRAINT [PK_Clients] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Clients_AuthUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AuthUsers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Clients_ClientStatuses_StatusId] FOREIGN KEY ([StatusId]) REFERENCES [ClientStatuses] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE TABLE [UserGroups] (
        [Id] int NOT NULL IDENTITY,
        [GroupId] int NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [AssignedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_UserGroups] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserGroups_ApplicationUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserGroups_Groups_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [Groups] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE TABLE [GroupPermissions] (
        [GroupId] int NOT NULL,
        [PermissionId] int NOT NULL,
        CONSTRAINT [PK_GroupPermissions] PRIMARY KEY ([GroupId], [PermissionId]),
        CONSTRAINT [FK_GroupPermissions_Groups_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [Groups] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_GroupPermissions_Permissions_PermissionId] FOREIGN KEY ([PermissionId]) REFERENCES [Permissions] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE TABLE [CreditTransactions] (
        [Id] int NOT NULL IDENTITY,
        [UserId] uniqueidentifier NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [Type] int NOT NULL,
        [ReferenceId] int NULL,
        [Description] nvarchar(1000) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETDATE()),
        [ClientId] int NULL,
        CONSTRAINT [PK_CreditTransactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CreditTransactions_ApplicationUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_CreditTransactions_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[Groups]'))
        SET IDENTITY_INSERT [Groups] ON;
    EXEC(N'INSERT INTO [Groups] ([Id], [CreatedAt], [Description], [Name])
    VALUES (1000, ''2025-12-29T00:00:00.0000000Z'', N''Organization administrator - full access'', N''Org_Admin''),
    (1001, ''2025-12-29T00:00:00.0000000Z'', N''Admin with elevated privileges'', N''Admin''),
    (1002, ''2025-12-29T00:00:00.0000000Z'', N''Manager with limited admin privileges'', N''Manager''),
    (1003, ''2025-12-29T00:00:00.0000000Z'', N''Read-only admin'', N''Viewer'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[Groups]'))
        SET IDENTITY_INSERT [Groups] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
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
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'GroupId', N'PermissionId') AND [object_id] = OBJECT_ID(N'[GroupPermissions]'))
        SET IDENTITY_INSERT [GroupPermissions] ON;
    EXEC(N'INSERT INTO [GroupPermissions] ([GroupId], [PermissionId])
    VALUES (1000, 2000),
    (1000, 2001),
    (1000, 2002),
    (1000, 2003),
    (1000, 2004),
    (1000, 2005)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'GroupId', N'PermissionId') AND [object_id] = OBJECT_ID(N'[GroupPermissions]'))
        SET IDENTITY_INSERT [GroupPermissions] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_AuthUsers_Email] ON [AuthUsers] ([Email]) WHERE "Email" IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    EXEC(N'CREATE INDEX [IX_AuthUsers_FirebaseUid] ON [AuthUsers] ([FirebaseUid]) WHERE "FirebaseUid" IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ClientBusinessCategories_BusinessCategoryId] ON [ClientBusinessCategories] ([BusinessCategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Clients_Email] ON [Clients] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Clients_MobileNumber] ON [Clients] ([MobileNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Clients_Phone] ON [Clients] ([Phone]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Clients_StatusId] ON [Clients] ([StatusId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Clients_UserId] ON [Clients] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ClientStatusHistories_ClientId] ON [ClientStatusHistories] ([ClientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CreditTransactions_ClientId] ON [CreditTransactions] ([ClientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CreditTransactions_UserId] ON [CreditTransactions] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Employees_EmployeeNumber] ON [Employees] ([EmployeeNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Employees_UserId] ON [Employees] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_GroupPermissions_PermissionId] ON [GroupPermissions] ([PermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Groups_Name] ON [Groups] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Investments_InvestorId] ON [Investments] ([InvestorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Permissions_Key] ON [Permissions] ([Key]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_AuthUserId] ON [RefreshTokens] ([AuthUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RefreshTokens_Token] ON [RefreshTokens] ([Token]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ScoreTransactions_TransactionTypeId] ON [ScoreTransactions] ([TransactionTypeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ScoreTransactions_UserId] ON [ScoreTransactions] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Transactions_WalletId] ON [Transactions] ([WalletId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserGroups_GroupId] ON [UserGroups] ([GroupId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserGroups_UserId_GroupId] ON [UserGroups] ([UserId], [GroupId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserProfiles_UserId] ON [UserProfiles] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109131334_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260109131334_InitialCreate', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260109230628_AddCreditConfiguration'
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
    WHERE [MigrationId] = N'20260109230628_AddCreditConfiguration'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260109230628_AddCreditConfiguration', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110011748_ChatModule_Encryption'
)
BEGIN
    CREATE TABLE [Conversations] (
        [Id] uniqueidentifier NOT NULL,
        [Type] tinyint NOT NULL,
        [Title] nvarchar(200) NULL,
        [CreatedBy] uniqueidentifier NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL DEFAULT (GETDATE()),
        [IsArchived] bit NOT NULL DEFAULT CAST(0 AS bit),
        [WrappedDek] varbinary(max) NULL,
        [DekNonce] varbinary(64) NULL,
        [DekTag] varbinary(64) NULL,
        [DekKeyId] nvarchar(200) NULL,
        [DekVersion] int NULL,
        [Metadata] nvarchar(max) NULL,
        CONSTRAINT [PK_Conversations] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110011748_ChatModule_Encryption'
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
    WHERE [MigrationId] = N'20260110011748_ChatModule_Encryption'
)
BEGIN
    CREATE TABLE [Messages] (
        [Id] uniqueidentifier NOT NULL,
        [ConversationId] uniqueidentifier NOT NULL,
        [SenderId] uniqueidentifier NOT NULL,
        [CipherText] varbinary(max) NOT NULL,
        [Nonce] varbinary(64) NOT NULL,
        [Tag] varbinary(64) NOT NULL,
        [KeyId] nvarchar(200) NULL,
        [Algorithm] nvarchar(50) NOT NULL DEFAULT N'AES-GCM',
        [CreatedAt] datetimeoffset NOT NULL DEFAULT (GETDATE()),
        [EditedAt] datetimeoffset NULL,
        [ReplyToMessageId] uniqueidentifier NULL,
        [IsDeleted] bit NOT NULL,
        [Metadata] nvarchar(max) NULL,
        CONSTRAINT [PK_Messages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Messages_Conversations_ConversationId] FOREIGN KEY ([ConversationId]) REFERENCES [Conversations] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110011748_ChatModule_Encryption'
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
        CONSTRAINT [FK_MessageAttachments_Messages_MessageId] FOREIGN KEY ([MessageId]) REFERENCES [Messages] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110011748_ChatModule_Encryption'
)
BEGIN
    CREATE TABLE [MessageReactions] (
        [MessageId] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [Reaction] nvarchar(50) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_MessageReactions] PRIMARY KEY ([MessageId], [UserId]),
        CONSTRAINT [FK_MessageReactions_Messages_MessageId] FOREIGN KEY ([MessageId]) REFERENCES [Messages] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110011748_ChatModule_Encryption'
)
BEGIN
    CREATE INDEX [IX_ConversationParticipants_UserId] ON [ConversationParticipants] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110011748_ChatModule_Encryption'
)
BEGIN
    CREATE INDEX [IX_MessageAttachments_MessageId] ON [MessageAttachments] ([MessageId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110011748_ChatModule_Encryption'
)
BEGIN
    CREATE INDEX [IX_Messages_ConversationId_CreatedAt] ON [Messages] ([ConversationId], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110011748_ChatModule_Encryption'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260110011748_ChatModule_Encryption', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    ALTER TABLE [MessageAttachments] DROP CONSTRAINT [FK_MessageAttachments_Messages_MessageId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    ALTER TABLE [MessageReactions] DROP CONSTRAINT [FK_MessageReactions_Messages_MessageId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DROP TABLE [Messages];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DECLARE @var sysname;
    SELECT @var = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Conversations]') AND [c].[name] = N'CreatedBy');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [Conversations] DROP CONSTRAINT [' + @var + '];');
    ALTER TABLE [Conversations] DROP COLUMN [CreatedBy];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DECLARE @var1 sysname;
    SELECT @var1 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Conversations]') AND [c].[name] = N'DekKeyId');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Conversations] DROP CONSTRAINT [' + @var1 + '];');
    ALTER TABLE [Conversations] DROP COLUMN [DekKeyId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DECLARE @var2 sysname;
    SELECT @var2 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Conversations]') AND [c].[name] = N'DekNonce');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [Conversations] DROP CONSTRAINT [' + @var2 + '];');
    ALTER TABLE [Conversations] DROP COLUMN [DekNonce];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DECLARE @var3 sysname;
    SELECT @var3 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Conversations]') AND [c].[name] = N'DekTag');
    IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [Conversations] DROP CONSTRAINT [' + @var3 + '];');
    ALTER TABLE [Conversations] DROP COLUMN [DekTag];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DECLARE @var4 sysname;
    SELECT @var4 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Conversations]') AND [c].[name] = N'DekVersion');
    IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [Conversations] DROP CONSTRAINT [' + @var4 + '];');
    ALTER TABLE [Conversations] DROP COLUMN [DekVersion];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DECLARE @var5 sysname;
    SELECT @var5 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Conversations]') AND [c].[name] = N'IsArchived');
    IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [Conversations] DROP CONSTRAINT [' + @var5 + '];');
    ALTER TABLE [Conversations] DROP COLUMN [IsArchived];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DECLARE @var6 sysname;
    SELECT @var6 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Conversations]') AND [c].[name] = N'Metadata');
    IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [Conversations] DROP CONSTRAINT [' + @var6 + '];');
    ALTER TABLE [Conversations] DROP COLUMN [Metadata];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DECLARE @var7 sysname;
    SELECT @var7 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Conversations]') AND [c].[name] = N'Title');
    IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [Conversations] DROP CONSTRAINT [' + @var7 + '];');
    ALTER TABLE [Conversations] DROP COLUMN [Title];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DECLARE @var8 sysname;
    SELECT @var8 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Conversations]') AND [c].[name] = N'Type');
    IF @var8 IS NOT NULL EXEC(N'ALTER TABLE [Conversations] DROP CONSTRAINT [' + @var8 + '];');
    ALTER TABLE [Conversations] DROP COLUMN [Type];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DECLARE @var9 sysname;
    SELECT @var9 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Conversations]') AND [c].[name] = N'WrappedDek');
    IF @var9 IS NOT NULL EXEC(N'ALTER TABLE [Conversations] DROP CONSTRAINT [' + @var9 + '];');
    ALTER TABLE [Conversations] DROP COLUMN [WrappedDek];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    DECLARE @var10 sysname;
    SELECT @var10 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Conversations]') AND [c].[name] = N'CreatedAt');
    IF @var10 IS NOT NULL EXEC(N'ALTER TABLE [Conversations] DROP CONSTRAINT [' + @var10 + '];');
    ALTER TABLE [Conversations] ALTER COLUMN [CreatedAt] datetime2 NOT NULL;
    ALTER TABLE [Conversations] ADD DEFAULT (GETDATE()) FOR [CreatedAt];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    ALTER TABLE [Conversations] ADD [AdminEmail] nvarchar(256) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    ALTER TABLE [Conversations] ADD [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    ALTER TABLE [Conversations] ADD [UserMobile] nvarchar(20) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    CREATE TABLE [ChatMessages] (
        [Id] uniqueidentifier NOT NULL,
        [ConversationId] uniqueidentifier NOT NULL,
        [SenderId] nvarchar(256) NOT NULL,
        [MessageText] nvarchar(max) NOT NULL,
        [Timestamp] datetime2 NOT NULL DEFAULT (GETDATE()),
        [IsRead] bit NOT NULL DEFAULT CAST(0 AS bit),
        CONSTRAINT [PK_ChatMessages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ChatMessages_Conversations_ConversationId] FOREIGN KEY ([ConversationId]) REFERENCES [Conversations] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    CREATE INDEX [IX_ChatMessages_ConversationId_Timestamp] ON [ChatMessages] ([ConversationId], [Timestamp]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    ALTER TABLE [MessageAttachments] ADD CONSTRAINT [FK_MessageAttachments_ChatMessages_MessageId] FOREIGN KEY ([MessageId]) REFERENCES [ChatMessages] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    ALTER TABLE [MessageReactions] ADD CONSTRAINT [FK_MessageReactions_ChatMessages_MessageId] FOREIGN KEY ([MessageId]) REFERENCES [ChatMessages] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110195702_UpdateChatEntities'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260110195702_UpdateChatEntities', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260110213151_ResolveChatSchemaConflicts20260110'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260110213151_ResolveChatSchemaConflicts20260110', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113083450_AddStatusToConversation'
)
BEGIN
    ALTER TABLE [Conversations] ADD [Category] nvarchar(100) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113083450_AddStatusToConversation'
)
BEGIN
    ALTER TABLE [Conversations] ADD [Status] nvarchar(max) NOT NULL DEFAULT N'Pending';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113083450_AddStatusToConversation'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260113083450_AddStatusToConversation', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113200156_AddSupportSessionAndMessage'
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
    WHERE [MigrationId] = N'20260113200156_AddSupportSessionAndMessage'
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
    WHERE [MigrationId] = N'20260113200156_AddSupportSessionAndMessage'
)
BEGIN
    CREATE INDEX [IX_Messages_SupportSessionId_Timestamp] ON [Messages] ([SupportSessionId], [Timestamp]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113200156_AddSupportSessionAndMessage'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260113200156_AddSupportSessionAndMessage', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114132734_UpdateChatMessageToSupportSession'
)
BEGIN
    ALTER TABLE [ChatMessages] ADD [SupportSessionId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114132734_UpdateChatMessageToSupportSession'
)
BEGIN
    CREATE INDEX [IX_ChatMessages_SupportSessionId_Timestamp] ON [ChatMessages] ([SupportSessionId], [Timestamp]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114132734_UpdateChatMessageToSupportSession'
)
BEGIN
    ALTER TABLE [ChatMessages] ADD CONSTRAINT [FK_ChatMessages_SupportSessions_SupportSessionId] FOREIGN KEY ([SupportSessionId]) REFERENCES [SupportSessions] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114132734_UpdateChatMessageToSupportSession'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260114132734_UpdateChatMessageToSupportSession', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114133000_MakeSupportSessionIdNullable'
)
BEGIN
    DECLARE @var11 sysname;
    SELECT @var11 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ChatMessages]') AND [c].[name] = N'SupportSessionId');
    IF @var11 IS NOT NULL EXEC(N'ALTER TABLE [ChatMessages] DROP CONSTRAINT [' + @var11 + '];');
    ALTER TABLE [ChatMessages] ALTER COLUMN [SupportSessionId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114133000_MakeSupportSessionIdNullable'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260114133000_MakeSupportSessionIdNullable', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114134318_RemoveConversationIdFromChatMessages'
)
BEGIN
    ALTER TABLE [ChatMessages] DROP CONSTRAINT [FK_ChatMessages_Conversations_ConversationId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114134318_RemoveConversationIdFromChatMessages'
)
BEGIN
    DROP INDEX [IX_ChatMessages_ConversationId_Timestamp] ON [ChatMessages];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114134318_RemoveConversationIdFromChatMessages'
)
BEGIN
    DECLARE @var12 sysname;
    SELECT @var12 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ChatMessages]') AND [c].[name] = N'ConversationId');
    IF @var12 IS NOT NULL EXEC(N'ALTER TABLE [ChatMessages] DROP CONSTRAINT [' + @var12 + '];');
    ALTER TABLE [ChatMessages] ALTER COLUMN [ConversationId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114134318_RemoveConversationIdFromChatMessages'
)
BEGIN
    CREATE INDEX [IX_ChatMessages_ConversationId] ON [ChatMessages] ([ConversationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114134318_RemoveConversationIdFromChatMessages'
)
BEGIN
    ALTER TABLE [ChatMessages] ADD CONSTRAINT [FK_ChatMessages_Conversations_ConversationId] FOREIGN KEY ([ConversationId]) REFERENCES [Conversations] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114134318_RemoveConversationIdFromChatMessages'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260114134318_RemoveConversationIdFromChatMessages', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [UserGroups] DROP CONSTRAINT [FK_UserGroups_ApplicationUsers_UserId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [GroupPermissions] DROP CONSTRAINT [PK_GroupPermissions];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    EXEC(N'DELETE FROM [GroupPermissions]
    WHERE [GroupId] = 1000 AND [PermissionId] = 2000;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    EXEC(N'DELETE FROM [GroupPermissions]
    WHERE [GroupId] = 1000 AND [PermissionId] = 2001;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    EXEC(N'DELETE FROM [GroupPermissions]
    WHERE [GroupId] = 1000 AND [PermissionId] = 2002;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    EXEC(N'DELETE FROM [GroupPermissions]
    WHERE [GroupId] = 1000 AND [PermissionId] = 2003;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    EXEC(N'DELETE FROM [GroupPermissions]
    WHERE [GroupId] = 1000 AND [PermissionId] = 2004;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    EXEC(N'DELETE FROM [GroupPermissions]
    WHERE [GroupId] = 1000 AND [PermissionId] = 2005;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [UserGroups] ADD [AssignedBy] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [UserGroups] ADD [UserId1] uniqueidentifier NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [Groups] ADD [IsActive] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [Groups] ADD [ModifiedAt] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [Groups] ADD [TenantId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [GroupPermissions] ADD [Id] int NOT NULL IDENTITY;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [GroupPermissions] ADD [ApplicationPermissionId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [GroupPermissions] ADD [AssignedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [GroupPermissions] ADD [AssignedBy] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [AuthUsers] ADD [TenantId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [GroupPermissions] ADD CONSTRAINT [PK_GroupPermissions] PRIMARY KEY ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
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
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
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
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
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
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
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
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    EXEC(N'UPDATE [Groups] SET [IsActive] = CAST(1 AS bit), [ModifiedAt] = NULL, [TenantId] = NULL
    WHERE [Id] = 1000;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    EXEC(N'UPDATE [Groups] SET [IsActive] = CAST(1 AS bit), [ModifiedAt] = NULL, [TenantId] = NULL
    WHERE [Id] = 1001;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    EXEC(N'UPDATE [Groups] SET [IsActive] = CAST(1 AS bit), [ModifiedAt] = NULL, [TenantId] = NULL
    WHERE [Id] = 1002;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    EXEC(N'UPDATE [Groups] SET [IsActive] = CAST(1 AS bit), [ModifiedAt] = NULL, [TenantId] = NULL
    WHERE [Id] = 1003;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_UserGroups_UserId1] ON [UserGroups] ([UserId1]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_GroupPermissions_ApplicationPermissionId] ON [GroupPermissions] ([ApplicationPermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE UNIQUE INDEX [IX_GroupPermissions_GroupId_PermissionId] ON [GroupPermissions] ([GroupId], [PermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ApplicationPermissions_Key] ON [ApplicationPermissions] ([Key]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_ApplicationPermissions_ParentPermissionId] ON [ApplicationPermissions] ([ParentPermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_ApplicationPermissions_ResourceType_Action] ON [ApplicationPermissions] ([ResourceType], [Action]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_ApplicationPermissions_TenantId] ON [ApplicationPermissions] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_EntityType] ON [AuditLogs] ([EntityType]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_EntityType_EntityId] ON [AuditLogs] ([EntityType], [EntityId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_TenantId] ON [AuditLogs] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_Timestamp] ON [AuditLogs] ([Timestamp]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_UserId] ON [AuditLogs] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserSessions_RefreshTokenHash] ON [UserSessions] ([RefreshTokenHash]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_UserSessions_UserId] ON [UserSessions] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    CREATE INDEX [IX_UserSessions_UserId_ExpiresAt] ON [UserSessions] ([UserId], [ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [GroupPermissions] ADD CONSTRAINT [FK_GroupPermissions_ApplicationPermissions_ApplicationPermissionId] FOREIGN KEY ([ApplicationPermissionId]) REFERENCES [ApplicationPermissions] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [UserGroups] ADD CONSTRAINT [FK_UserGroups_ApplicationUsers_UserId1] FOREIGN KEY ([UserId1]) REFERENCES [ApplicationUsers] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    ALTER TABLE [UserGroups] ADD CONSTRAINT [FK_UserGroups_AuthUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AuthUsers] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114141929_EnterpriseRBACRefactoring'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260114141929_EnterpriseRBACRefactoring', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114202839_AddGroupBoundRoleArchitecture'
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
    WHERE [MigrationId] = N'20260114202839_AddGroupBoundRoleArchitecture'
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
    WHERE [MigrationId] = N'20260114202839_AddGroupBoundRoleArchitecture'
)
BEGIN
    CREATE TABLE [UserRoles] (
        [Id] int NOT NULL IDENTITY,
        [UserId] uniqueidentifier NOT NULL,
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
    WHERE [MigrationId] = N'20260114202839_AddGroupBoundRoleArchitecture'
)
BEGIN
    CREATE INDEX [IX_RolePermissions_PermissionId] ON [RolePermissions] ([PermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114202839_AddGroupBoundRoleArchitecture'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RolePermissions_RoleId_PermissionId] ON [RolePermissions] ([RoleId], [PermissionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114202839_AddGroupBoundRoleArchitecture'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Roles_GroupId_Name] ON [Roles] ([GroupId], [Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114202839_AddGroupBoundRoleArchitecture'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Roles_NormalizedName] ON [Roles] ([NormalizedName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114202839_AddGroupBoundRoleArchitecture'
)
BEGIN
    CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114202839_AddGroupBoundRoleArchitecture'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserRoles_UserId_RoleId] ON [UserRoles] ([UserId], [RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114202839_AddGroupBoundRoleArchitecture'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260114202839_AddGroupBoundRoleArchitecture', N'9.0.2');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260115140258_AddAuthUserIdToUserRoleAndGroupMetadata'
)
BEGIN
    ALTER TABLE [UserRoles] ADD [AuthUserId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260115140258_AddAuthUserIdToUserRoleAndGroupMetadata'
)
BEGIN
    ALTER TABLE [Groups] ADD [MetadataJson] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260115140258_AddAuthUserIdToUserRoleAndGroupMetadata'
)
BEGIN
    UPDATE ur
        SET AuthUserId = u.Id
        FROM UserRoles ur
        INNER JOIN AuthUsers u ON ur.UserId = u.Id
        WHERE ur.AuthUserId IS NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260115140258_AddAuthUserIdToUserRoleAndGroupMetadata'
)
BEGIN
    EXEC(N'UPDATE [Groups] SET [MetadataJson] = NULL
    WHERE [Id] = 1000;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260115140258_AddAuthUserIdToUserRoleAndGroupMetadata'
)
BEGIN
    EXEC(N'UPDATE [Groups] SET [MetadataJson] = NULL
    WHERE [Id] = 1001;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260115140258_AddAuthUserIdToUserRoleAndGroupMetadata'
)
BEGIN
    EXEC(N'UPDATE [Groups] SET [MetadataJson] = NULL
    WHERE [Id] = 1002;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260115140258_AddAuthUserIdToUserRoleAndGroupMetadata'
)
BEGIN
    EXEC(N'UPDATE [Groups] SET [MetadataJson] = NULL
    WHERE [Id] = 1003;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260115140258_AddAuthUserIdToUserRoleAndGroupMetadata'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260115140258_AddAuthUserIdToUserRoleAndGroupMetadata', N'9.0.2');
END;

COMMIT;
GO

