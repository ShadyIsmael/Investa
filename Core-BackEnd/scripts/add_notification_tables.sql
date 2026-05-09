-- Migration: Add NotificationTemplates and UserNotifications tables
-- Run against InvestaDb on desktop-dih7cqh

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'NotificationTemplates')
BEGIN
    CREATE TABLE [NotificationTemplates] (
        [Id]               INT             NOT NULL IDENTITY(1,1),
        [Key]              NVARCHAR(100)   NOT NULL,
        [Name]             NVARCHAR(200)   NOT NULL,
        [TitleTemplate]    NVARCHAR(500)   NOT NULL,
        [BodyTemplate]     NVARCHAR(2000)  NOT NULL,
        [Type]             NVARCHAR(20)    NOT NULL DEFAULT 'info',
        [Icon]             NVARCHAR(100)   NULL,
        [Category]         NVARCHAR(100)   NULL,
        [IsActive]         BIT             NOT NULL DEFAULT 1,
        [PlaceholderDocs]  NVARCHAR(500)   NULL,
        [CreatedAt]        DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt]        DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
        [CreatedByUserId]  NVARCHAR(450)   NULL,
        CONSTRAINT [PK_NotificationTemplates] PRIMARY KEY ([Id])
    );

    CREATE UNIQUE INDEX [IX_NotificationTemplates_Key] ON [NotificationTemplates] ([Key]);
    CREATE INDEX [IX_NotificationTemplates_Category] ON [NotificationTemplates] ([Category]);

    -- Seed default templates
    INSERT INTO [NotificationTemplates] ([Key],[Name],[TitleTemplate],[BodyTemplate],[Type],[Icon],[Category],[IsActive],[PlaceholderDocs])
    VALUES
        ('kyc.approved',       'KYC Approved',               N'KYC Verified ✅',                N'Congratulations {{userName}}! Your identity has been verified.',           'success', '✅', 'KYC',        1, 'userName'),
        ('kyc.rejected',       'KYC Rejected',               N'KYC Verification Failed',         N'Your KYC submission was rejected. Reason: {{reason}}. Please resubmit.',  'error',   '❌', 'KYC',        1, 'userName,reason'),
        ('kyc.pending',        'KYC Under Review',           N'KYC Submission Received',         N'Your documents are under review. We will notify you within 48 hours.',     'info',    '🔍', 'KYC',        1, ''),
        ('investment.approved','Investment Approved',         N'Investment Request Approved ✅',   N'Your investment request for {{amount}} has been approved.',                'success', '💰', 'Investment', 1, 'amount,investmentName'),
        ('investment.rejected','Investment Rejected',         N'Investment Request Rejected',     N'Your investment request for {{investmentName}} was rejected.',             'error',   '❌', 'Investment', 1, 'investmentName,reason'),
        ('credit.earned',      'Credibility Points Earned',  N'+{{points}} Credibility Points',  N'You earned {{points}} credibility points for {{reason}}.',                 'success', '⭐', 'Credit',     1, 'points,reason'),
        ('welcome',            'Welcome Notification',       N'Welcome to Investa! 🎉',          N'Hi {{userName}}, welcome aboard. Complete your profile to get started.',   'info',    '🎉', 'Onboarding', 1, 'userName'),
        ('profile.complete',   'Profile Complete',           N'Profile Updated',                 N'Your profile has been updated successfully.',                              'success', '✅', 'Profile',    1, '');
END

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'UserNotifications')
BEGIN
    CREATE TABLE [UserNotifications] (
        [Id]          BIGINT          NOT NULL IDENTITY(1,1),
        [UserId]      NVARCHAR(450)   NOT NULL,
        [TemplateId]  INT             NULL,
        [Title]       NVARCHAR(500)   NOT NULL,
        [Body]        NVARCHAR(2000)  NOT NULL,
        [Type]        NVARCHAR(20)    NOT NULL DEFAULT 'info',
        [Icon]        NVARCHAR(100)   NULL,
        [IsRead]      BIT             NOT NULL DEFAULT 0,
        [ActionUrl]   NVARCHAR(500)   NULL,
        [CreatedAt]   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
        [ReadAt]      DATETIME2       NULL,
        CONSTRAINT [PK_UserNotifications] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserNotifications_Templates] FOREIGN KEY ([TemplateId])
            REFERENCES [NotificationTemplates]([Id]) ON DELETE SET NULL
    );

    CREATE INDEX [IX_UserNotifications_UserId_CreatedAt] ON [UserNotifications] ([UserId], [CreatedAt] DESC);
    CREATE INDEX [IX_UserNotifications_UserId_IsRead]   ON [UserNotifications] ([UserId], [IsRead]);
END
