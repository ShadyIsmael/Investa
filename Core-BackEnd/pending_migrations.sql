BEGIN TRANSACTION;
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

