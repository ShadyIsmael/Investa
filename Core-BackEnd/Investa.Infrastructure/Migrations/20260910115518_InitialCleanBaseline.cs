using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCleanBaseline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "RoleCodeSequence");

            migrationBuilder.CreateTable(
                name: "ApplicationPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResourceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Scope = table.Column<int>(type: "int", nullable: false),
                    ParentPermissionId = table.Column<int>(type: "int", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationPermissions_ApplicationPermissions_ParentPermissionId",
                        column: x => x.ParentPermissionId,
                        principalTable: "ApplicationPermissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Changes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Severity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuthUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PasswordHash = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    UserType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ClientType = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Status = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    FirebaseUid = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    SuspendedUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WalletBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    CredibilityScore = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    VerificationTrustScore = table.Column<int>(type: "int", nullable: false),
                    TrustLevel = table.Column<int>(type: "int", nullable: false),
                    ReputationScore = table.Column<int>(type: "int", nullable: false),
                    ReputationLevel = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ActivityScore = table.Column<int>(type: "int", nullable: false),
                    ProfileCompletionPercentage = table.Column<int>(type: "int", nullable: false),
                    IsPhoneVerified = table.Column<bool>(type: "bit", nullable: false),
                    IsEmailVerified = table.Column<bool>(type: "bit", nullable: false),
                    EmailVerifiedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WelcomeEmailSentAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RiskFlags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClientStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    IsoAlpha2 = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    IsoAlpha3 = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    NameEn = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    PhoneCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CreditPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Credits = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    BonusCredits = table.Column<int>(type: "int", nullable: false),
                    ActiveFrom = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActiveUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    BillingPeriod = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Currencies",
                columns: table => new
                {
                    ISOCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    EnglishName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ArabicName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Symbol = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DecimalDigits = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SupportsFunding = table.Column<bool>(type: "bit", nullable: false),
                    SupportsSettlement = table.Column<bool>(type: "bit", nullable: false),
                    SupportsWallet = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Currencies", x => x.ISOCode);
                });

            migrationBuilder.CreateTable(
                name: "DeviceTokens",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DeviceId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Browser = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Platform = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceTokens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailOutbox",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CorrelationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Recipient = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    HtmlBody = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PlainTextBody = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SenderName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SenderEmail = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    AttachmentsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Provider = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    MaxRetries = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailureReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NextAttemptAfter = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailOutbox", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailPreference",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailPreference", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailVerificationOtps",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    OtpHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    LastSentAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailVerificationOtps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExchangeRateSnapshots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourceCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TargetCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    ExchangeRate = table.Column<decimal>(type: "decimal(28,12)", precision: 28, scale: 12, nullable: false),
                    RateTimestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProviderQuoteId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsManualOverride = table.Column<bool>(type: "bit", nullable: false),
                    IsOfflineFallback = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExchangeRateSnapshots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExpenseCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    GLAccountCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExpenseCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FileCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DescriptionAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    MaxFileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    AllowedExtensions = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    AllowedMimeTypes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    MaxFilesPerEntity = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FileStoragePolicies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GlobalMaxFileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    DefaultUserQuotaBytes = table.Column<long>(type: "bigint", nullable: false),
                    DefaultProjectQuotaBytes = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileStoragePolicies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FinanceAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AccountType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    CurrentBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 19, scale: 4, nullable: false),
                    BankAccountNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BankName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    OpeningDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinanceAccounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FundingGoals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DescriptionAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundingGoals", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IncomeCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    GLAccountCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IncomeCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Lookups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ValueAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lookups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "info"),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ActionUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Audience = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SpecificUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleTemplate = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    BodyTemplate = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "info"),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    PlaceholderDocs = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedByUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DescriptionAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityTags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PendingAdminChanges",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TargetUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetUserName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MakerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MakerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CheckerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CheckerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BeforeSnapshot = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AfterSnapshot = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewDecision = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ReviewReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsApplied = table.Column<bool>(type: "bit", nullable: false),
                    AppliedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PendingAdminChanges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PricingRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActionCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreditCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PricingRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProfileChangeAudits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FieldName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OldValue = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ChangedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileChangeAudits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DescriptionAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RiskLevels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DescriptionAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RiskLevels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServicePrices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ServiceName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServicePrices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StoredFiles",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FileId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    FileKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CategoryCode = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Extension = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MimeType = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    UploadedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: true),
                    EntityType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    EntityId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoredFiles", x => x.Id);
                    table.UniqueConstraint("AK_StoredFiles_FileId", x => x.FileId);
                });

            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SupplierCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SupplierType = table.Column<int>(type: "int", nullable: false),
                    ServiceCategory = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LegalName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContactPerson = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TaxId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PaymentTerms = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentDetails = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SupportSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserMobile = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Open"),
                    UnreadCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    FcmToken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DeviceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTokens", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuthUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Revoked = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_AuthUsers_AuthUserId",
                        column: x => x.AuthUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReporterUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    TargetId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ReasonCode = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Pending"),
                    ReviewedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolutionNote = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reports_AuthUsers_ReporterUserId",
                        column: x => x.ReporterUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reports_AuthUsers_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ReputationRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RuleCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ActivityCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    RoleScope = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Any"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsSystem = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsAutomatic = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CanRepeat = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    MaximumOccurrences = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "GETDATE()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReputationRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReputationRules_AuthUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Gender = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Nationality = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Bio = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Phone1 = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Phone2 = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CompanyAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CompanyEmail = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    AvatarUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    BusinessRole = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    InvestmentInterests = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LinkedInUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    FacebookUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    PreferredCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false, defaultValue: "EGP"),
                    VerificationStatus = table.Column<int>(type: "int", nullable: false),
                    CurrentCredibilityScore = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    LastLoginIP = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    RegistrationIP = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    DeviceInfo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LastLoginDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserProfiles_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RefreshTokenHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DeviceFingerprint = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevocationReason = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSessions_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserVerification",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VerificationType = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ProviderReferenceId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DocumentUrl = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserVerification", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserVerification_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Wallets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CurrentBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    TotalPurchasedCredits = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    TotalBonusCredits = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    TotalRefundCredits = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wallets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Wallets_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Gender = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PersonalImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MobileNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FirebaseUid = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    District = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Address1 = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Address2 = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    NationalId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BirthDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Age = table.Column<int>(type: "int", nullable: true),
                    NationalIdImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    WebsiteUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LinkedInUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    FacebookUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    BusinessRole = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Score = table.Column<decimal>(type: "decimal(9,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    Credit = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    PenaltyDurationDays = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Clients_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Clients_ClientStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "ClientStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditPlanPurchases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<int>(type: "int", nullable: false),
                    PlanName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PlanCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PlanNameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Credits = table.Column<int>(type: "int", nullable: false),
                    BonusCredits = table.Column<int>(type: "int", nullable: false),
                    PricePaid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PaymentStatus = table.Column<int>(type: "int", nullable: false),
                    PaymentProvider = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ProviderReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WalletTransactionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PurchasedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditPlanPurchases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditPlanPurchases_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CreditPlanPurchases_CreditPlans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "CreditPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmailHistory",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmailOutboxId = table.Column<long>(type: "bigint", nullable: true),
                    CorrelationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Recipient = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Template = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Provider = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProviderMessageId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailureReason = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmailHistory_EmailOutbox_EmailOutboxId",
                        column: x => x.EmailOutboxId,
                        principalTable: "EmailOutbox",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WalletId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExchangeRateSnapshotId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_AuthUsers_WalletId",
                        column: x => x.WalletId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_ExchangeRateSnapshots_ExchangeRateSnapshotId",
                        column: x => x.ExchangeRateSnapshotId,
                        principalTable: "ExchangeRateSnapshots",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FinanceReconciliations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FinanceAccountId = table.Column<int>(type: "int", nullable: false),
                    ReconciliationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PeriodStartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PeriodEndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OpeningBalance = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    PeriodActivity = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    SystemCalculatedBalance = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    ActualStatementBalance = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    Difference = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConfirmedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinanceReconciliations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinanceReconciliations_FinanceAccounts_FinanceAccountId",
                        column: x => x.FinanceAccountId,
                        principalTable: "FinanceAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleNumber = table.Column<long>(type: "bigint", nullable: false, defaultValueSql: "NEXT VALUE FOR [RoleCodeSequence]"),
                    RoleCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false, computedColumnSql: "'ROL-' + CASE WHEN LEN(CONVERT(varchar(20), [RoleNumber])) < 6 THEN REPLICATE('0', 6 - LEN(CONVERT(varchar(20), [RoleNumber]))) ELSE '' END + CONVERT(varchar(20), [RoleNumber])", stored: true),
                    NameEn = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DescriptionAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Roles_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    AssignedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserGroups_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserGroups_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ScoreTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Score = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    TransactionTypeId = table.Column<int>(type: "int", nullable: false),
                    ReviewerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScoreTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScoreTransactions_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScoreTransactions_Lookups_TransactionTypeId",
                        column: x => x.TransactionTypeId,
                        principalTable: "Lookups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserNotifications",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NotificationId = table.Column<long>(type: "bigint", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    TemplateId = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "info"),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ActionUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EventType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OpportunityId = table.Column<int>(type: "int", nullable: true),
                    RelatedEntityId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserNotifications_NotificationTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "NotificationTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_UserNotifications_Notifications_NotificationId",
                        column: x => x.NotificationId,
                        principalTable: "Notifications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GroupPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AssignedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ApplicationPermissionId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupPermissions_ApplicationPermissions_ApplicationPermissionId",
                        column: x => x.ApplicationPermissionId,
                        principalTable: "ApplicationPermissions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_GroupPermissions_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroupPermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FounderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DefaultCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false, defaultValue: "EGP"),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LegalName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Slug = table.Column<string>(type: "nvarchar(220)", maxLength: 220, nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    Industry = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    ProjectStage = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Geography = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TagsSnapshotJson = table.Column<string>(type: "nvarchar(max)", maxLength: 2000, nullable: false, defaultValue: "[]"),
                    FoundedOn = table.Column<DateOnly>(type: "date", nullable: true),
                    WebsiteUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TeamDescription = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    BusinessModel = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RiskLevel = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    RiskDisclosure = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ArchiveReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.UniqueConstraint("AK_Projects_Id_FounderId", x => new { x.Id, x.FounderId });
                    table.ForeignKey(
                        name: "FK_Projects_AuthUsers_FounderId",
                        column: x => x.FounderId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Projects_ProjectCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "ProjectCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FinanceTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TransactionType = table.Column<int>(type: "int", nullable: false),
                    IncomingMoneyType = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    DocumentationStatus = table.Column<int>(type: "int", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PostingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 19, scale: 4, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    ExchangeRate = table.Column<decimal>(type: "decimal(10,6)", precision: 19, scale: 8, nullable: false),
                    AmountInBaseCurrency = table.Column<decimal>(type: "decimal(18,2)", precision: 19, scale: 4, nullable: false),
                    ExchangeRateSnapshotId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SourceName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PaymentMethod = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentGatewayFee = table.Column<decimal>(type: "decimal(18,2)", precision: 19, scale: 4, nullable: false),
                    NetAmountReceived = table.Column<decimal>(type: "decimal(18,2)", precision: 19, scale: 4, nullable: false),
                    SourceAccountId = table.Column<int>(type: "int", nullable: true),
                    DestinationAccountId = table.Column<int>(type: "int", nullable: true),
                    IncomeCategoryId = table.Column<int>(type: "int", nullable: true),
                    ExpenseCategoryId = table.Column<int>(type: "int", nullable: true),
                    SupplierId = table.Column<int>(type: "int", nullable: true),
                    FounderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReversalOfTransactionId = table.Column<int>(type: "int", nullable: true),
                    ReversalCancellationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MakerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewDecision = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ReviewReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ExternalReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConfirmedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinanceTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinanceTransactions_ExchangeRateSnapshots_ExchangeRateSnapshotId",
                        column: x => x.ExchangeRateSnapshotId,
                        principalTable: "ExchangeRateSnapshots",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FinanceTransactions_ExpenseCategories_ExpenseCategoryId",
                        column: x => x.ExpenseCategoryId,
                        principalTable: "ExpenseCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FinanceTransactions_FinanceAccounts_DestinationAccountId",
                        column: x => x.DestinationAccountId,
                        principalTable: "FinanceAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FinanceTransactions_FinanceAccounts_SourceAccountId",
                        column: x => x.SourceAccountId,
                        principalTable: "FinanceAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FinanceTransactions_FinanceTransactions_ReversalOfTransactionId",
                        column: x => x.ReversalOfTransactionId,
                        principalTable: "FinanceTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FinanceTransactions_IncomeCategories_IncomeCategoryId",
                        column: x => x.IncomeCategoryId,
                        principalTable: "IncomeCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FinanceTransactions_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SupportSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    MessageText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Messages_SupportSessions_SupportSessionId",
                        column: x => x.SupportSessionId,
                        principalTable: "SupportSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReputationTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReputationRuleId = table.Column<int>(type: "int", nullable: true),
                    ActivityCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReferenceId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ReferenceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SourceModuleValue = table.Column<int>(type: "int", nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReputationTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReputationTransactions_AuthUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ReputationTransactions_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReputationTransactions_ReputationRules_ReputationRuleId",
                        column: x => x.ReputationRuleId,
                        principalTable: "ReputationRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WalletTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WalletId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Direction = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ActionCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreditAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BalanceBefore = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BalanceAfter = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ReferenceId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ReferenceType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "None"),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    ExchangeRateSnapshotId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WalletTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WalletTransactions_ExchangeRateSnapshots_ExchangeRateSnapshotId",
                        column: x => x.ExchangeRateSnapshotId,
                        principalTable: "ExchangeRateSnapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WalletTransactions_Wallets_WalletId",
                        column: x => x.WalletId,
                        principalTable: "Wallets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientProjectCategories",
                columns: table => new
                {
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    ProjectCategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientProjectCategories", x => new { x.ClientId, x.ProjectCategoryId });
                    table.ForeignKey(
                        name: "FK_ClientProjectCategories_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClientProjectCategories_ProjectCategories_ProjectCategoryId",
                        column: x => x.ProjectCategoryId,
                        principalTable: "ProjectCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClientStatusHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    OldStatusId = table.Column<int>(type: "int", nullable: true),
                    NewStatusId = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ChangedByAdminId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientStatusHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientStatusHistories_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    JustificationAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    JustificationEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    AdminId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ClientId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditTransactions_AuthUsers_AdminId",
                        column: x => x.AdminId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CreditTransactions_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CreditTransactions_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    AssignedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    AssignedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRoles_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Opportunities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    SequenceNumber = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false, defaultValue: "Opportunity"),
                    FounderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ShortDescription = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false, defaultValue: ""),
                    UseOfFunds = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false, defaultValue: ""),
                    FundingTarget = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FundingGoalId = table.Column<int>(type: "int", nullable: true),
                    MinimumInvestmentAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MaximumInvestmentAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ExpectedDurationMonths = table.Column<int>(type: "int", nullable: true),
                    FundingCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false, defaultValue: "EGP"),
                    SharePrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalShares = table.Column<int>(type: "int", nullable: true),
                    OfferedShares = table.Column<int>(type: "int", nullable: true),
                    EquityOfferedPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    ProfitSharePercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    ProfitSharingPayoutFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ProfitSharingContractStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProfitSharingContractEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InterestRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    RepaymentFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FinalRepaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InvestmentModel = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    ProjectStage = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ProjectStageCustomName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    ProjectStageCustomNameNormalized = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ModerationStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    FundingStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    FundingOpensAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FundingClosesAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosureReason = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    ObligationCompletionStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CoverImageUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsLockedForEditing = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    FirstInvestorJoinedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Opportunities", x => x.Id);
                    table.CheckConstraint("CK_Opportunities_ProjectStageCustomName", "([ProjectStage] <> 'Other' AND [ProjectStageCustomName] IS NULL AND [ProjectStageCustomNameNormalized] IS NULL) OR ([ProjectStage] = 'Other' AND [ProjectStageCustomName] IS NOT NULL AND [ProjectStageCustomNameNormalized] IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_Opportunities_AuthUsers_FounderId",
                        column: x => x.FounderId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Opportunities_FundingGoals_FundingGoalId",
                        column: x => x.FundingGoalId,
                        principalTable: "FundingGoals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Opportunities_Projects_ProjectId_FounderId",
                        columns: x => new { x.ProjectId, x.FounderId },
                        principalTable: "Projects",
                        principalColumns: new[] { "Id", "FounderId" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProjectRoomDocuments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    FileKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Visibility = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectRoomDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectRoomDocuments_AuthUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectRoomDocuments_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProjectRoomEntries",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    EntryType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DueAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    IsInvestorVisible = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectRoomEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectRoomEntries_AuthUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectRoomEntries_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FinanceAttachments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransactionId = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FileStorageKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DocumentType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    MimeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DocumentReference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinanceAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinanceAttachments_FinanceTransactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "FinanceTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FinanceAuditEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransactionId = table.Column<int>(type: "int", nullable: false),
                    EventType = table.Column<int>(type: "int", nullable: false),
                    PerformedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Metadata = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinanceAuditEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinanceAuditEvents_FinanceTransactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "FinanceTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FinanceTransactionLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransactionId = table.Column<int>(type: "int", nullable: false),
                    DebitAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 19, scale: 4, nullable: false),
                    CreditAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 19, scale: 4, nullable: false),
                    GLAccountCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    GLAccountDescription = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LineSequence = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinanceTransactionLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinanceTransactionLines_FinanceTransactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "FinanceTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EquityCorporateEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: true),
                    EventType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InitiatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApprovedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AppliedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AppliedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CorrelationId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SharesIssued = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    ResultingTotalIssuedShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    SplitNumerator = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    SplitDenominator = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    ShareClass = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    PreMoneyValuation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    PostMoneyValuation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    PricePerShare = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    ExpectedTotalIssuedShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    ExpectedLatestAppliedEventId = table.Column<int>(type: "int", nullable: true),
                    BeforeCapitalizationSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AfterCapitalizationSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BeforeSnapshotHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    AfterSnapshotHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityCorporateEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityCorporateEvents_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityCorporateEvents_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EquityDividendDeclarations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DeclarationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RecordDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaymentDueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DistributionBasis = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DividendPerShare = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    TotalDeclaredAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DeclaredByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityDividendDeclarations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityDividendDeclarations_AuthUsers_DeclaredByUserId",
                        column: x => x.DeclaredByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityDividendDeclarations_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityDividendDeclarations_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Investments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FounderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: true),
                    InitialCapital = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SharePrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalShares = table.Column<int>(type: "int", nullable: true),
                    AvailableShares = table.Column<int>(type: "int", nullable: true),
                    MinInvestment = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxInvestment = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ValuationCap = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    EquityOfferedPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    ExpectedROI = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    InvestmentTypeId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Draft"),
                    BusinessName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    VideoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ProjectCategoryId = table.Column<int>(type: "int", nullable: true),
                    TargetFund = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Milestone = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RiskLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    MomentumScore = table.Column<int>(type: "int", nullable: false),
                    LastActivityAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PublicActivityCount = table.Column<int>(type: "int", nullable: false),
                    ParticipantOnlyActivityCount = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DurationMonths = table.Column<int>(type: "int", nullable: true),
                    ProfitPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    PayoutFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CurrentValuation = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EstimatedFutureValuation = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EquityExitType = table.Column<int>(type: "int", nullable: true),
                    ExitTargetDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpectedExitStrategy = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ContractStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ContractEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TotalExpectedPayout = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RemainingPayoutAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RevenueDistributionFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RevenueSharePercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    ExpectedMonthlyReturn = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ContractCompletionStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RepaymentStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FinalRepaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RemainingBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalPaidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NextInstallmentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DefaultRiskLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    LoanCompletionStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    InterestRate = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    RepaymentFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GracePeriodMonths = table.Column<int>(type: "int", nullable: true),
                    EstimatedInstallment = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalRepaymentAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Investments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Investments_AuthUsers_FounderId",
                        column: x => x.FounderId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Investments_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Investments_ProjectCategories_ProjectCategoryId",
                        column: x => x.ProjectCategoryId,
                        principalTable: "ProjectCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    FileKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FileUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FileExtension = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MimeType = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    PreviewUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DocumentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Visibility = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "General"),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SearchTags = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ScanStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    ScanCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpportunityDocuments_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    OldValue = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ActorType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    RelatedEntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RelatedEntityId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LocalizedMetadataJson = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsImmutableTimelineEntry = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpportunityEvents_AuthUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OpportunityEvents_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityJoinRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    InvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParticipationSequence = table.Column<int>(type: "int", nullable: false),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RequestType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "GeneralParticipation"),
                    RequestedAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    EnteredAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    EnteredCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    FundingAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FundingCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    ExchangeRateSnapshotId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CalculatedTotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TermsSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ReviewedByFounderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AcceptedOfferId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    SourceConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsVisibleToFounder = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsVisibleToInvestor = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    ActiveRequestSlot = table.Column<int>(type: "int", nullable: false, computedColumnSql: "CASE WHEN [Status] = 'Pending' THEN 0 ELSE [Id] END", stored: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityJoinRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpportunityJoinRequests_AuthUsers_InvestorId",
                        column: x => x.InvestorId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OpportunityJoinRequests_AuthUsers_ReviewedByFounderId",
                        column: x => x.ReviewedByFounderId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OpportunityJoinRequests_ExchangeRateSnapshots_ExchangeRateSnapshotId",
                        column: x => x.ExchangeRateSnapshotId,
                        principalTable: "ExchangeRateSnapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OpportunityJoinRequests_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityMedia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    FileKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FileUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FileType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MimeType = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    PreviewUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    MediaType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsCover = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Purpose = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "General"),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ScanStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    ScanCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpportunityMedia_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityTagAssignments",
                columns: table => new
                {
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    OpportunityTagId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityTagAssignments", x => new { x.OpportunityId, x.OpportunityTagId });
                    table.ForeignKey(
                        name: "FK_OpportunityTagAssignments_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OpportunityTagAssignments_OpportunityTags_OpportunityTagId",
                        column: x => x.OpportunityTagId,
                        principalTable: "OpportunityTags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EquityCapitalizationSnapshots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquityCorporateEventId = table.Column<int>(type: "int", nullable: false),
                    IsBefore = table.Column<bool>(type: "bit", nullable: false),
                    CapturedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    TotalIssuedShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    SnapshotHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityCapitalizationSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityCapitalizationSnapshots_EquityCorporateEvents_EquityCorporateEventId",
                        column: x => x.EquityCorporateEventId,
                        principalTable: "EquityCorporateEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Visibility = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Payload = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CorrelationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    Metadata = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentEvents_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentFavorites",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestmentId = table.Column<int>(type: "int", nullable: true),
                    OpportunityId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentFavorites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentFavorites_AuthUsers_InvestorId",
                        column: x => x.InvestorId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvestmentFavorites_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvestmentFavorites_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "InvestmentImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    MediaType = table.Column<int>(type: "int", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Caption = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    UploadedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentImages_AuthUsers_UploadedBy",
                        column: x => x.UploadedBy,
                        principalTable: "AuthUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InvestmentImages_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentLearnMores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OpenedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UserIp = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentLearnMores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentLearnMores_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentParticipants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    InvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SharesPurchased = table.Column<int>(type: "int", nullable: false),
                    AmountInvested = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    InvestmentDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Status = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsAnonymous = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentParticipants_AuthUsers_InvestorId",
                        column: x => x.InvestorId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvestmentParticipants_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    InvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FounderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Shares = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Direction = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestMetadata = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentRequests_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentTeamMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentTeamMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentTeamMembers_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvestmentTeamMembers_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentViews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ViewedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UserIp = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentViews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentViews_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FundingDeclarations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParticipationId = table.Column<int>(type: "int", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    FounderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    ReceivedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ExternalReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ProofFileId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConfirmedByInvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConfirmationComment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DisputedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DisputedByInvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DisputeReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DeclaredAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundingDeclarations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FundingDeclarations_AuthUsers_ConfirmedByInvestorId",
                        column: x => x.ConfirmedByInvestorId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FundingDeclarations_AuthUsers_DisputedByInvestorId",
                        column: x => x.DisputedByInvestorId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FundingDeclarations_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FundingDeclarations_OpportunityJoinRequests_ParticipationId",
                        column: x => x.ParticipationId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FundingDeclarations_StoredFiles_ProofFileId",
                        column: x => x.ProofFileId,
                        principalTable: "StoredFiles",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ParticipationObligationConfirmations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParticipationRequestId = table.Column<int>(type: "int", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    RequiredUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartyRole = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ConfirmedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConfirmationStatement = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParticipationObligationConfirmations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParticipationObligationConfirmations_AuthUsers_ConfirmedByUserId",
                        column: x => x.ConfirmedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipationObligationConfirmations_AuthUsers_RequiredUserId",
                        column: x => x.RequiredUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipationObligationConfirmations_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipationObligationConfirmations_OpportunityJoinRequests_ParticipationRequestId",
                        column: x => x.ParticipationRequestId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PaymentTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParticipationRequestId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsReversed = table.Column<bool>(type: "bit", nullable: false),
                    ReversalReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReversedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReversedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExchangeRateSnapshotId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_ExchangeRateSnapshots_ExchangeRateSnapshotId",
                        column: x => x.ExchangeRateSnapshotId,
                        principalTable: "ExchangeRateSnapshots",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_OpportunityJoinRequests_ParticipationRequestId",
                        column: x => x.ParticipationRequestId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PaymentAllocations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PaymentTransactionId = table.Column<int>(type: "int", nullable: false),
                    ParticipationRequestId = table.Column<int>(type: "int", nullable: false),
                    AllocatedAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    InstallmentNumber = table.Column<int>(type: "int", nullable: false),
                    InstallmentConfirmationKey = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentAllocations_PaymentTransactions_PaymentTransactionId",
                        column: x => x.PaymentTransactionId,
                        principalTable: "PaymentTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SenderId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    SenderUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MessageText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsEdited = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EditedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AttachmentsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SupportSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatMessages_AuthUsers_SenderUserId",
                        column: x => x.SenderUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChatMessages_SupportSessions_SupportSessionId",
                        column: x => x.SupportSessionId,
                        principalTable: "SupportSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MessageAttachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MessageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoragePath = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MessageAttachments_ChatMessages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "ChatMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MessageReactions",
                columns: table => new
                {
                    MessageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reaction = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageReactions", x => new { x.MessageId, x.UserId });
                    table.ForeignKey(
                        name: "FK_MessageReactions_ChatMessages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "ChatMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractEvents",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContractVersionId = table.Column<int>(type: "int", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PerformedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractEvents_AuthUsers_PerformedByUserId",
                        column: x => x.PerformedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ConversationParticipants",
                columns: table => new
                {
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<byte>(type: "tinyint", nullable: false),
                    LastReadMessageId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastReadAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    IsMuted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    JoinedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConversationParticipants", x => new { x.ConversationId, x.UserId });
                });

            migrationBuilder.CreateTable(
                name: "ConversationRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    RequesterUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecipientUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AcceptedConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConversationRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConversationRequests_AuthUsers_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConversationRequests_AuthUsers_RequesterUserId",
                        column: x => x.RequesterUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConversationRequests_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Conversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserMobile = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AdminEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ConversationRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OpportunityId = table.Column<int>(type: "int", nullable: true),
                    FounderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    InvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    FounderReady = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    InvestorReady = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ReadyForParticipationAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ParticipationRequestId = table.Column<int>(type: "int", nullable: true),
                    IsVisibleToFounder = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsVisibleToInvestor = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CloseReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Requested")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Conversations_AuthUsers_FounderId",
                        column: x => x.FounderId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Conversations_AuthUsers_InvestorId",
                        column: x => x.InvestorId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Conversations_ConversationRequests_ConversationRequestId",
                        column: x => x.ConversationRequestId,
                        principalTable: "ConversationRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Conversations_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Conversations_OpportunityJoinRequests_ParticipationRequestId",
                        column: x => x.ParticipationRequestId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "NegotiationOffers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OpportunityId = table.Column<int>(type: "int", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    ParentOfferId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NegotiationOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NegotiationOffers_AuthUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NegotiationOffers_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NegotiationOffers_NegotiationOffers_ParentOfferId",
                        column: x => x.ParentOfferId,
                        principalTable: "NegotiationOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NegotiationOffers_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentContracts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContractNumber = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferId = table.Column<int>(type: "int", nullable: true),
                    AcceptedOfferVersionNumber = table.Column<int>(type: "int", nullable: true),
                    ParticipationRequestId = table.Column<int>(type: "int", nullable: true),
                    FounderUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestmentModel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OpportunityTitleSnapshot = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FounderNameSnapshot = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    InvestorNameSnapshot = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AcceptedCurrency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    AcceptedAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AcceptanceTimestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentVersionNumber = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentContracts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentContracts_AuthUsers_FounderUserId",
                        column: x => x.FounderUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvestmentContracts_AuthUsers_InvestorUserId",
                        column: x => x.InvestorUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvestmentContracts_NegotiationOffers_AcceptedOfferId",
                        column: x => x.AcceptedOfferId,
                        principalTable: "NegotiationOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvestmentContracts_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvestmentContracts_OpportunityJoinRequests_ParticipationRequestId",
                        column: x => x.ParticipationRequestId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NegotiationOfferLegs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OfferId = table.Column<int>(type: "int", nullable: false),
                    LegType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    EquityPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    EquityOwnershipModel = table.Column<int>(type: "int", nullable: true),
                    InvestorShareCount = table.Column<decimal>(type: "decimal(18,6)", nullable: true),
                    TotalIssuedShares = table.Column<decimal>(type: "decimal(18,6)", nullable: true),
                    ShareClass = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PricePerShare = table.Column<decimal>(type: "decimal(18,6)", nullable: true),
                    PreMoneyValuation = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PostMoneyValuation = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EffectiveOwnershipDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SharesTerms = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReturnRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    TermMonths = table.Column<int>(type: "int", nullable: true),
                    RepaymentModel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ProfitSharePercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    ProfitSharingPayoutFrequency = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    ExitTerms = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NegotiationOfferLegs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NegotiationOfferLegs_NegotiationOffers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "NegotiationOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InvestmentContractVersions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    VersionNumber = table.Column<int>(type: "int", nullable: false),
                    VersionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PreviousVersionId = table.Column<int>(type: "int", nullable: true),
                    SourceParticipationRequestId = table.Column<int>(type: "int", nullable: false),
                    SourceNegotiationOfferId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    TermsSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PreviousTermsSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChangesSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocumentUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DocumentHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    DocumentContent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PdfDocumentUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PdfDocumentHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    PdfDocumentSize = table.Column<long>(type: "bigint", nullable: true),
                    PdfGeneratedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PdfGenerationStatus = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "NotGenerated"),
                    PdfGenerationError = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PdfMimeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false, defaultValue: "application/pdf"),
                    PdfRendererVersion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "playwright-chromium-v1"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentContractVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentContractVersions_InvestmentContractVersions_PreviousVersionId",
                        column: x => x.PreviousVersionId,
                        principalTable: "InvestmentContractVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvestmentContractVersions_InvestmentContracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "InvestmentContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvestmentContractVersions_NegotiationOffers_SourceNegotiationOfferId",
                        column: x => x.SourceNegotiationOfferId,
                        principalTable: "NegotiationOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvestmentContractVersions_OpportunityJoinRequests_SourceParticipationRequestId",
                        column: x => x.SourceParticipationRequestId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FundingDeclarationLegAllocations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FundingDeclarationId = table.Column<int>(type: "int", nullable: false),
                    ParticipationId = table.Column<int>(type: "int", nullable: false),
                    ContractId = table.Column<int>(type: "int", nullable: true),
                    OfferLegId = table.Column<int>(type: "int", nullable: false),
                    OfferLegNumber = table.Column<int>(type: "int", nullable: false),
                    AllocatedAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundingDeclarationLegAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FundingDeclarationLegAllocations_FundingDeclarations_FundingDeclarationId",
                        column: x => x.FundingDeclarationId,
                        principalTable: "FundingDeclarations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FundingDeclarationLegAllocations_InvestmentContracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "InvestmentContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FundingDeclarationLegAllocations_NegotiationOfferLegs_OfferLegId",
                        column: x => x.OfferLegId,
                        principalTable: "NegotiationOfferLegs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FundingDeclarationLegAllocations_OpportunityJoinRequests_ParticipationId",
                        column: x => x.ParticipationId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EquityPositions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParticipationRequestId = table.Column<int>(type: "int", nullable: false),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    ContractVersionId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferVersionNumber = table.Column<int>(type: "int", nullable: false),
                    OfferLegId = table.Column<int>(type: "int", nullable: false),
                    OfferLegNumber = table.Column<int>(type: "int", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: true),
                    FounderUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestmentAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    OwnershipModel = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ContractualOwnershipPercentage = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: true),
                    InvestorShareCount = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    TotalIssuedShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    ShareClass = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PricePerShare = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    PreMoneyValuation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    PostMoneyValuation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    EffectiveOwnershipDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityPositions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityPositions_AuthUsers_FounderUserId",
                        column: x => x.FounderUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityPositions_AuthUsers_InvestorUserId",
                        column: x => x.InvestorUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityPositions_InvestmentContractVersions_ContractVersionId",
                        column: x => x.ContractVersionId,
                        principalTable: "InvestmentContractVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityPositions_InvestmentContracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "InvestmentContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityPositions_NegotiationOfferLegs_OfferLegId",
                        column: x => x.OfferLegId,
                        principalTable: "NegotiationOfferLegs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityPositions_NegotiationOffers_AcceptedOfferId",
                        column: x => x.AcceptedOfferId,
                        principalTable: "NegotiationOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityPositions_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityPositions_OpportunityJoinRequests_ParticipationRequestId",
                        column: x => x.ParticipationRequestId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityPositions_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LoanObligations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParticipationRequestId = table.Column<int>(type: "int", nullable: false),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    ContractVersionId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferVersionNumber = table.Column<int>(type: "int", nullable: false),
                    OfferLegId = table.Column<int>(type: "int", nullable: false),
                    OfferLegNumber = table.Column<int>(type: "int", nullable: false),
                    FounderUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Principal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    InterestRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    TermMonths = table.Column<int>(type: "int", nullable: false),
                    RepaymentModel = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PrincipalRepaymentMethod = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ContractualStartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContractualMaturityDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    MaturedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FullyRepaidAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DefaultedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DefaultedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DefaultReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DefaultOutstandingPrincipal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    DefaultOutstandingInterest = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    DefaultOutstandingTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ClosureReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ClosedFinalPrincipalOutstanding = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ClosedFinalInterestOutstanding = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ClosedFinalTotalOutstanding = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    RepaymentLedgerVersion = table.Column<int>(type: "int", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoanObligations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoanObligations_AuthUsers_FounderUserId",
                        column: x => x.FounderUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanObligations_AuthUsers_InvestorUserId",
                        column: x => x.InvestorUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanObligations_InvestmentContractVersions_ContractVersionId",
                        column: x => x.ContractVersionId,
                        principalTable: "InvestmentContractVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanObligations_InvestmentContracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "InvestmentContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanObligations_NegotiationOfferLegs_OfferLegId",
                        column: x => x.OfferLegId,
                        principalTable: "NegotiationOfferLegs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanObligations_NegotiationOffers_AcceptedOfferId",
                        column: x => x.AcceptedOfferId,
                        principalTable: "NegotiationOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanObligations_OpportunityJoinRequests_ParticipationRequestId",
                        column: x => x.ParticipationRequestId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProfitSharingObligations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParticipationRequestId = table.Column<int>(type: "int", nullable: false),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    ContractVersionId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferVersionNumber = table.Column<int>(type: "int", nullable: false),
                    OfferLegId = table.Column<int>(type: "int", nullable: false),
                    OfferLegNumber = table.Column<int>(type: "int", nullable: false),
                    FounderUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContributionAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ProfitSharePercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    ReportingFrequency = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CalculationBasis = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ContractualStartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContractualEndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaturedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SettledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ClosureReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ClosureSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClosureSnapshotHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    ClosureSnapshotVersion = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfitSharingObligations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfitSharingObligations_AuthUsers_FounderUserId",
                        column: x => x.FounderUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingObligations_AuthUsers_InvestorUserId",
                        column: x => x.InvestorUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingObligations_InvestmentContractVersions_ContractVersionId",
                        column: x => x.ContractVersionId,
                        principalTable: "InvestmentContractVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingObligations_InvestmentContracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "InvestmentContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingObligations_NegotiationOfferLegs_OfferLegId",
                        column: x => x.OfferLegId,
                        principalTable: "NegotiationOfferLegs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingObligations_NegotiationOffers_AcceptedOfferId",
                        column: x => x.AcceptedOfferId,
                        principalTable: "NegotiationOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingObligations_OpportunityJoinRequests_ParticipationRequestId",
                        column: x => x.ParticipationRequestId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EquityCapitalizationSnapshotHolders",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquityCapitalizationSnapshotId = table.Column<int>(type: "int", nullable: false),
                    EquityPositionId = table.Column<int>(type: "int", nullable: false),
                    InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestorShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false),
                    OwnershipPercentage = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: false),
                    ShareClass = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityCapitalizationSnapshotHolders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityCapitalizationSnapshotHolders_EquityCapitalizationSnapshots_EquityCapitalizationSnapshotId",
                        column: x => x.EquityCapitalizationSnapshotId,
                        principalTable: "EquityCapitalizationSnapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EquityCapitalizationSnapshotHolders_EquityPositions_EquityPositionId",
                        column: x => x.EquityPositionId,
                        principalTable: "EquityPositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EquityClosureSnapshots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquityPositionId = table.Column<int>(type: "int", nullable: false),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    ContractVersionId = table.Column<int>(type: "int", nullable: false),
                    InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    InitialOwnershipPercentage = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: true),
                    FinalOwnershipPercentage = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: true),
                    InitialInvestorShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    FinalInvestorShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    TotalIssuedSharesAtClosure = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    TotalDistributionsConfirmed = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FullyExitedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ClosedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClosureReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    SnapshotHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityClosureSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityClosureSnapshots_AuthUsers_ClosedByUserId",
                        column: x => x.ClosedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityClosureSnapshots_EquityPositions_EquityPositionId",
                        column: x => x.EquityPositionId,
                        principalTable: "EquityPositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EquityCorporateEventPositions",
                columns: table => new
                {
                    EquityCorporateEventId = table.Column<int>(type: "int", nullable: false),
                    EquityPositionId = table.Column<int>(type: "int", nullable: false),
                    IsNewPosition = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityCorporateEventPositions", x => new { x.EquityCorporateEventId, x.EquityPositionId });
                    table.ForeignKey(
                        name: "FK_EquityCorporateEventPositions_EquityCorporateEvents_EquityCorporateEventId",
                        column: x => x.EquityCorporateEventId,
                        principalTable: "EquityCorporateEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EquityCorporateEventPositions_EquityPositions_EquityPositionId",
                        column: x => x.EquityPositionId,
                        principalTable: "EquityPositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EquityDividendEntitlements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DividendDeclarationId = table.Column<int>(type: "int", nullable: false),
                    EquityPositionId = table.Column<int>(type: "int", nullable: false),
                    InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    ContractVersionId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferId = table.Column<int>(type: "int", nullable: false),
                    OfferLegId = table.Column<int>(type: "int", nullable: false),
                    EligibleShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false),
                    EligibleOwnershipPercentage = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: false),
                    TotalIssuedSharesAtRecordDate = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false),
                    EntitlementAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityDividendEntitlements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityDividendEntitlements_AuthUsers_InvestorUserId",
                        column: x => x.InvestorUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityDividendEntitlements_EquityDividendDeclarations_DividendDeclarationId",
                        column: x => x.DividendDeclarationId,
                        principalTable: "EquityDividendDeclarations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EquityDividendEntitlements_EquityPositions_EquityPositionId",
                        column: x => x.EquityPositionId,
                        principalTable: "EquityPositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EquityHoldingLedgerEntries",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquityPositionId = table.Column<int>(type: "int", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ShareDelta = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    ResultingInvestorShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    ResultingTotalIssuedShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    ResultingOwnershipPercentage = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: true),
                    ContractualOwnershipPercentage = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: true),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    ContractVersionId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferId = table.Column<int>(type: "int", nullable: false),
                    OfferLegId = table.Column<int>(type: "int", nullable: false),
                    CorporateEventId = table.Column<int>(type: "int", nullable: true),
                    PreviousInvestorShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    PreviousTotalIssuedShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    PreviousOwnershipPercentage = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: true),
                    ShareClass = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ActorType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CorrelationId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityHoldingLedgerEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityHoldingLedgerEntries_EquityCorporateEvents_CorporateEventId",
                        column: x => x.CorporateEventId,
                        principalTable: "EquityCorporateEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityHoldingLedgerEntries_EquityPositions_EquityPositionId",
                        column: x => x.EquityPositionId,
                        principalTable: "EquityPositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EquityHoldingSnapshots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquityPositionId = table.Column<int>(type: "int", nullable: false),
                    OwnershipModel = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContractualOwnershipPercentage = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: true),
                    InvestorShareCount = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    TotalIssuedShares = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    DerivedOwnershipPercentage = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: true),
                    ShareClass = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PricePerShare = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    PreMoneyValuation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    PostMoneyValuation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    ContractVersionId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferId = table.Column<int>(type: "int", nullable: false),
                    OfferLegId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityHoldingSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityHoldingSnapshots_EquityPositions_EquityPositionId",
                        column: x => x.EquityPositionId,
                        principalTable: "EquityPositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EquityTransfers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    SourcePositionId = table.Column<int>(type: "int", nullable: false),
                    SourceInvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DestinationPositionId = table.Column<int>(type: "int", nullable: true),
                    DestinationInvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TransferType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InitiatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApprovedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AppliedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ExternalReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SourceSharesBefore = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    SourceSharesAfter = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    DestinationSharesAfter = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: true),
                    SourceOwnershipBefore = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: true),
                    SourceOwnershipAfter = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: true),
                    DestinationOwnershipAfter = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    AppliedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityTransfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityTransfers_AuthUsers_DestinationInvestorUserId",
                        column: x => x.DestinationInvestorUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityTransfers_AuthUsers_SourceInvestorUserId",
                        column: x => x.SourceInvestorUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityTransfers_EquityPositions_DestinationPositionId",
                        column: x => x.DestinationPositionId,
                        principalTable: "EquityPositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityTransfers_EquityPositions_SourcePositionId",
                        column: x => x.SourcePositionId,
                        principalTable: "EquityPositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityTransfers_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityTransfers_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LoanRepaymentDeclarations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoanObligationId = table.Column<int>(type: "int", nullable: false),
                    ParticipationId = table.Column<int>(type: "int", nullable: false),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    ContractVersionId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferVersionNumber = table.Column<int>(type: "int", nullable: false),
                    OfferLegId = table.Column<int>(type: "int", nullable: false),
                    FounderUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ExternalPaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExternalReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ProofFileId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    DeclaredAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    DeclaredByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DecidedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DecidedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConfirmationComment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DisputeReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoanRepaymentDeclarations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentDeclarations_InvestmentContractVersions_ContractVersionId",
                        column: x => x.ContractVersionId,
                        principalTable: "InvestmentContractVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentDeclarations_InvestmentContracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "InvestmentContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentDeclarations_LoanObligations_LoanObligationId",
                        column: x => x.LoanObligationId,
                        principalTable: "LoanObligations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentDeclarations_NegotiationOfferLegs_OfferLegId",
                        column: x => x.OfferLegId,
                        principalTable: "NegotiationOfferLegs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentDeclarations_NegotiationOffers_AcceptedOfferId",
                        column: x => x.AcceptedOfferId,
                        principalTable: "NegotiationOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentDeclarations_OpportunityJoinRequests_ParticipationId",
                        column: x => x.ParticipationId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentDeclarations_StoredFiles_ProofFileId",
                        column: x => x.ProofFileId,
                        principalTable: "StoredFiles",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LoanRepaymentInstallments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoanObligationId = table.Column<int>(type: "int", nullable: false),
                    InstallmentNumber = table.Column<int>(type: "int", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PrincipalDue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    InterestDue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalDue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoanRepaymentInstallments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentInstallments_LoanObligations_LoanObligationId",
                        column: x => x.LoanObligationId,
                        principalTable: "LoanObligations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfitSharingReportingPeriods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProfitSharingObligationId = table.Column<int>(type: "int", nullable: false),
                    PeriodNumber = table.Column<int>(type: "int", nullable: false),
                    IsFinalPeriod = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReportingDueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfitSharingReportingPeriods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfitSharingReportingPeriods_ProfitSharingObligations_ProfitSharingObligationId",
                        column: x => x.ProfitSharingObligationId,
                        principalTable: "ProfitSharingObligations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EquityDividendDistributionDeclarations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DividendDeclarationId = table.Column<int>(type: "int", nullable: false),
                    DividendEntitlementId = table.Column<int>(type: "int", nullable: false),
                    DeclaredByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DeclaredAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityDividendDistributionDeclarations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityDividendDistributionDeclarations_AuthUsers_DeclaredByUserId",
                        column: x => x.DeclaredByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityDividendDistributionDeclarations_EquityDividendDeclarations_DividendDeclarationId",
                        column: x => x.DividendDeclarationId,
                        principalTable: "EquityDividendDeclarations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EquityDividendDistributionDeclarations_EquityDividendEntitlements_DividendEntitlementId",
                        column: x => x.DividendEntitlementId,
                        principalTable: "EquityDividendEntitlements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LoanRepaymentAllocations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoanRepaymentDeclarationId = table.Column<int>(type: "int", nullable: false),
                    LoanObligationId = table.Column<int>(type: "int", nullable: false),
                    LoanRepaymentInstallmentId = table.Column<int>(type: "int", nullable: false),
                    InstallmentNumber = table.Column<int>(type: "int", nullable: false),
                    InterestAllocated = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PrincipalAllocated = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalAllocated = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoanRepaymentAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentAllocations_LoanObligations_LoanObligationId",
                        column: x => x.LoanObligationId,
                        principalTable: "LoanObligations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentAllocations_LoanRepaymentDeclarations_LoanRepaymentDeclarationId",
                        column: x => x.LoanRepaymentDeclarationId,
                        principalTable: "LoanRepaymentDeclarations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentAllocations_LoanRepaymentInstallments_LoanRepaymentInstallmentId",
                        column: x => x.LoanRepaymentInstallmentId,
                        principalTable: "LoanRepaymentInstallments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LoanRepaymentDeclarationInstallments",
                columns: table => new
                {
                    LoanRepaymentDeclarationId = table.Column<int>(type: "int", nullable: false),
                    LoanRepaymentInstallmentId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoanRepaymentDeclarationInstallments", x => new { x.LoanRepaymentDeclarationId, x.LoanRepaymentInstallmentId });
                    table.ForeignKey(
                        name: "FK_LoanRepaymentDeclarationInstallments_LoanRepaymentDeclarations_LoanRepaymentDeclarationId",
                        column: x => x.LoanRepaymentDeclarationId,
                        principalTable: "LoanRepaymentDeclarations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LoanRepaymentDeclarationInstallments_LoanRepaymentInstallments_LoanRepaymentInstallmentId",
                        column: x => x.LoanRepaymentInstallmentId,
                        principalTable: "LoanRepaymentInstallments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProfitSharingPeriodDeclarations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProfitSharingObligationId = table.Column<int>(type: "int", nullable: false),
                    ReportingPeriodId = table.Column<int>(type: "int", nullable: false),
                    ParticipationId = table.Column<int>(type: "int", nullable: false),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    ContractVersionId = table.Column<int>(type: "int", nullable: false),
                    FounderUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CalculationBasis = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DeclaredBasisAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DeclaredResultAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DeclarationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExternalReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SupportingEvidenceFileId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    DeclaredByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeclaredAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CalculationError = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfitSharingPeriodDeclarations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfitSharingPeriodDeclarations_InvestmentContractVersions_ContractVersionId",
                        column: x => x.ContractVersionId,
                        principalTable: "InvestmentContractVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingPeriodDeclarations_InvestmentContracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "InvestmentContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingPeriodDeclarations_OpportunityJoinRequests_ParticipationId",
                        column: x => x.ParticipationId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingPeriodDeclarations_ProfitSharingObligations_ProfitSharingObligationId",
                        column: x => x.ProfitSharingObligationId,
                        principalTable: "ProfitSharingObligations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingPeriodDeclarations_ProfitSharingReportingPeriods_ReportingPeriodId",
                        column: x => x.ReportingPeriodId,
                        principalTable: "ProfitSharingReportingPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingPeriodDeclarations_StoredFiles_SupportingEvidenceFileId",
                        column: x => x.SupportingEvidenceFileId,
                        principalTable: "StoredFiles",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EquityDividendDistributionConfirmations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DistributionDeclarationId = table.Column<int>(type: "int", nullable: false),
                    ConfirmedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquityDividendDistributionConfirmations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquityDividendDistributionConfirmations_AuthUsers_ConfirmedByUserId",
                        column: x => x.ConfirmedByUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EquityDividendDistributionConfirmations_EquityDividendDistributionDeclarations_DistributionDeclarationId",
                        column: x => x.DistributionDeclarationId,
                        principalTable: "EquityDividendDistributionDeclarations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfitSharingEntitlements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProfitSharingObligationId = table.Column<int>(type: "int", nullable: false),
                    ReportingPeriodId = table.Column<int>(type: "int", nullable: false),
                    DeclarationId = table.Column<int>(type: "int", nullable: false),
                    CalculationBasis = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BasisAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ProfitSharePercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    EntitlementAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DistributionOutstanding = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CalculationVersion = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CalculatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    PendingDistributionAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfitSharingEntitlements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfitSharingEntitlements_ProfitSharingObligations_ProfitSharingObligationId",
                        column: x => x.ProfitSharingObligationId,
                        principalTable: "ProfitSharingObligations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingEntitlements_ProfitSharingPeriodDeclarations_DeclarationId",
                        column: x => x.DeclarationId,
                        principalTable: "ProfitSharingPeriodDeclarations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingEntitlements_ProfitSharingReportingPeriods_ReportingPeriodId",
                        column: x => x.ReportingPeriodId,
                        principalTable: "ProfitSharingReportingPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProfitSharingDistributionDeclarations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProfitSharingObligationId = table.Column<int>(type: "int", nullable: false),
                    ReportingPeriodId = table.Column<int>(type: "int", nullable: false),
                    EntitlementId = table.Column<int>(type: "int", nullable: false),
                    ParticipationId = table.Column<int>(type: "int", nullable: false),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    ContractVersionId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferId = table.Column<int>(type: "int", nullable: false),
                    AcceptedOfferVersionNumber = table.Column<int>(type: "int", nullable: false),
                    OfferLegId = table.Column<int>(type: "int", nullable: false),
                    FounderUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeclaredAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DeclaredAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ExternalReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SupportingEvidenceFileId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    DeclaredByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DecidedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DecidedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConfirmationComment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DisputeReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfitSharingDistributionDeclarations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionDeclarations_AuthUsers_FounderUserId",
                        column: x => x.FounderUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionDeclarations_AuthUsers_InvestorUserId",
                        column: x => x.InvestorUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionDeclarations_InvestmentContractVersions_ContractVersionId",
                        column: x => x.ContractVersionId,
                        principalTable: "InvestmentContractVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionDeclarations_InvestmentContracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "InvestmentContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionDeclarations_NegotiationOfferLegs_OfferLegId",
                        column: x => x.OfferLegId,
                        principalTable: "NegotiationOfferLegs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionDeclarations_NegotiationOffers_AcceptedOfferId",
                        column: x => x.AcceptedOfferId,
                        principalTable: "NegotiationOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionDeclarations_OpportunityJoinRequests_ParticipationId",
                        column: x => x.ParticipationId,
                        principalTable: "OpportunityJoinRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionDeclarations_ProfitSharingEntitlements_EntitlementId",
                        column: x => x.EntitlementId,
                        principalTable: "ProfitSharingEntitlements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionDeclarations_ProfitSharingObligations_ProfitSharingObligationId",
                        column: x => x.ProfitSharingObligationId,
                        principalTable: "ProfitSharingObligations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionDeclarations_ProfitSharingReportingPeriods_ReportingPeriodId",
                        column: x => x.ReportingPeriodId,
                        principalTable: "ProfitSharingReportingPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionDeclarations_StoredFiles_SupportingEvidenceFileId",
                        column: x => x.SupportingEvidenceFileId,
                        principalTable: "StoredFiles",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProfitSharingDistributionAllocations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProfitSharingDistributionDeclarationId = table.Column<int>(type: "int", nullable: false),
                    ProfitSharingObligationId = table.Column<int>(type: "int", nullable: false),
                    ReportingPeriodId = table.Column<int>(type: "int", nullable: false),
                    EntitlementId = table.Column<int>(type: "int", nullable: false),
                    InvestorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    DecisionActorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfitSharingDistributionAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionAllocations_AuthUsers_InvestorUserId",
                        column: x => x.InvestorUserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionAllocations_ProfitSharingDistributionDeclarations_ProfitSharingDistributionDeclarationId",
                        column: x => x.ProfitSharingDistributionDeclarationId,
                        principalTable: "ProfitSharingDistributionDeclarations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionAllocations_ProfitSharingEntitlements_EntitlementId",
                        column: x => x.EntitlementId,
                        principalTable: "ProfitSharingEntitlements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionAllocations_ProfitSharingObligations_ProfitSharingObligationId",
                        column: x => x.ProfitSharingObligationId,
                        principalTable: "ProfitSharingObligations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfitSharingDistributionAllocations_ProfitSharingReportingPeriods_ReportingPeriodId",
                        column: x => x.ReportingPeriodId,
                        principalTable: "ProfitSharingReportingPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "AuthUsers",
                columns: new[] { "Id", "ActivityScore", "ClientType", "CreatedAt", "Email", "EmailVerifiedAtUtc", "FirebaseUid", "IsEmailVerified", "IsPhoneVerified", "Name", "PasswordHash", "ProfileCompletionPercentage", "ReputationLevel", "ReputationScore", "RiskFlags", "Status", "SuspendedUntil", "TenantId", "TrustLevel", "UserType", "VerificationTrustScore", "WalletBalance", "WelcomeEmailSentAtUtc" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), 0, 1, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "alice.founder@example.com", null, null, false, false, "Alice Founder", "seeded", 0, "New Member", 0, null, true, null, null, 1, "Client", 0, 100000m, null });

            migrationBuilder.InsertData(
                table: "AuthUsers",
                columns: new[] { "Id", "ActivityScore", "CreatedAt", "Email", "EmailVerifiedAtUtc", "FirebaseUid", "IsEmailVerified", "IsPhoneVerified", "Name", "PasswordHash", "ProfileCompletionPercentage", "ReputationLevel", "ReputationScore", "RiskFlags", "Status", "SuspendedUntil", "TenantId", "TrustLevel", "UserType", "VerificationTrustScore", "WalletBalance", "WelcomeEmailSentAtUtc" },
                values: new object[,]
                {
                    { new Guid("22222222-2222-2222-2222-222222222222"), 0, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "bob.investor@example.com", null, null, false, false, "Bob Investor", "seeded", 0, "New Member", 0, null, true, null, null, 1, "Client", 0, 25000m, null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), 0, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "clara.investor@example.com", null, null, false, false, "Clara Investor", "seeded", 0, "New Member", 0, null, true, null, null, 1, "Client", 0, 15000m, null }
                });

            migrationBuilder.InsertData(
                table: "ClientStatuses",
                columns: new[] { "Id", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { 1, "نشط", "Active" },
                    { 2, "غير نشط", "Diactive" },
                    { 3, "معلق", "Suspended" }
                });

            migrationBuilder.InsertData(
                table: "Countries",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedByUserId", "IsActive", "IsoAlpha2", "IsoAlpha3", "NameAr", "NameEn", "PhoneCode", "SortOrder", "UpdatedAt", "UpdatedByUserId" },
                values: new object[,]
                {
                    { 1, "EGYPT", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "EG", "EGY", "مصر", "Egypt", "+20", 10, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 2, "SAUDIARABIA", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "SA", "SAU", "المملكة العربية السعودية", "Saudi Arabia", "+966", 20, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 3, "UNITEDARABEMIRATES", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "AE", "ARE", "الإمارات العربية المتحدة", "United Arab Emirates", "+971", 30, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 4, "JORDAN", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "JO", "JOR", "الأردن", "Jordan", "+962", 40, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 5, "LEBANON", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "LB", "LBN", "لبنان", "Lebanon", "+961", 50, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 6, "UNITEDSTATES", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "US", "USA", "الولايات المتحدة", "United States", "+1", 60, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 7, "UNITEDKINGDOM", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "GB", "GBR", "المملكة المتحدة", "United Kingdom", "+44", 70, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 8, "INDIA", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "IN", "IND", "الهند", "India", "+91", 80, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 9, "CANADA", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "CA", "CAN", "كندا", "Canada", "+1", 90, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 10, "AUSTRALIA", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "AU", "AUS", "أستراليا", "Australia", "+61", 100, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 11, "JAPAN", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "JP", "JPN", "اليابان", "Japan", "+81", 110, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 12, "GERMANY", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "DE", "DEU", "ألمانيا", "Germany", "+49", 120, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null }
                });

            migrationBuilder.InsertData(
                table: "Currencies",
                columns: new[] { "ISOCode", "ArabicName", "CreatedAt", "CreatedByUserId", "DecimalDigits", "EnglishName", "IsActive", "SupportsFunding", "SupportsSettlement", "SupportsWallet", "Symbol", "UpdatedAt", "UpdatedByUserId" },
                values: new object[,]
                {
                    { "AED", "الدرهم الإماراتي", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "UAE Dirham", true, true, true, true, "د.إ", null, null },
                    { "EGP", "الجنيه المصري", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "Egyptian Pound", true, true, true, true, "E£", null, null },
                    { "EUR", "اليورو", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "Euro", true, true, true, false, "€", null, null },
                    { "GBP", "الجنيه الإسترليني", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "British Pound", true, true, true, false, "£", null, null },
                    { "JPY", "الين الياباني", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 0, "Japanese Yen", true, false, true, false, "¥", null, null },
                    { "KWD", "الدينار الكويتي", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 3, "Kuwaiti Dinar", true, true, true, true, "د.ك", null, null },
                    { "SAR", "الريال السعودي", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "Saudi Riyal", true, true, true, true, "﷼", null, null },
                    { "USD", "الدولار الأمريكي", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "US Dollar", true, true, true, true, "$", null, null }
                });

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedBy", "Description", "GLAccountCode", "IsActive", "Name", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[] { 1, "EXP-OTHER", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Default company operating expense category", null, true, "Other Operating Expense", 999, null, null });

            migrationBuilder.InsertData(
                table: "FileCategories",
                columns: new[] { "Id", "AllowedExtensions", "AllowedMimeTypes", "Code", "CreatedAt", "CreatedByUserId", "DescriptionAr", "DescriptionEn", "IsActive", "MaxFileSizeBytes", "MaxFilesPerEntity", "NameAr", "NameEn", "SortOrder", "UpdatedAt", "UpdatedByUserId" },
                values: new object[,]
                {
                    { 1, ".jpg,.jpeg,.png,.webp", "image/jpeg,image/png,image/webp", "OPPORTUNITYCOVER", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 10485760L, null, "غلاف الفرصة", "Opportunity cover", 1, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 2, ".jpg,.jpeg,.png,.webp,.gif", "image/jpeg,image/png,image/webp,image/gif", "OPPORTUNITYGALLERY", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 10485760L, null, "معرض الفرصة", "Opportunity gallery", 2, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 3, ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv", "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv", "OPPORTUNITYPUBLICDOCUMENT", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 26214400L, null, "مستند فرصة عام", "Public opportunity document", 3, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 4, ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv", "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv", "OPPORTUNITYPRIVATEDOCUMENT", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 26214400L, null, "مستند فرصة خاص", "Private opportunity document", 4, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 5, ".jpg,.jpeg,.png,.webp", "image/jpeg,image/png,image/webp", "PROJECTIMAGE", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 10485760L, null, "صورة المشروع", "Project image", 5, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 6, ".jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.webm", "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm", "PROJECTUPDATEMEDIA", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 52428800L, null, "وسائط تحديث المشروع", "Project update media", 6, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 7, ".mp4,.mov,.webm", "video/mp4,video/quicktime,video/webm", "PITCHVIDEO", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 52428800L, null, "فيديو العرض", "Pitch video", 7, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 8, ".jpg,.jpeg,.png,.webp", "image/jpeg,image/png,image/webp", "INVESTMENTIMAGE", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 10485760L, null, "صورة الاستثمار", "Investment image", 8, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 9, ".mp4,.mov,.webm", "video/mp4,video/quicktime,video/webm", "INVESTMENTVIDEO", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 52428800L, null, "فيديو الاستثمار", "Investment video", 9, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 10, ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv", "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv", "INVESTMENTDOCUMENT", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 26214400L, null, "مستند الاستثمار", "Investment document", 10, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 11, ".jpg,.jpeg,.png,.webp", "image/jpeg,image/png,image/webp", "PROFILEAVATAR", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 5242880L, 1, "صورة الملف الشخصي", "Profile avatar", 11, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 12, ".jpg,.jpeg,.png,.webp,.pdf", "image/jpeg,image/png,image/webp,application/pdf", "PROFILENATIONALID", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 10485760L, 4, "الهوية الوطنية", "National ID", 12, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 13, ".pdf,.xls,.xlsx,.csv", "application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv", "FINANCIALREPORT", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 26214400L, null, "تقرير مالي", "Financial report", 13, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 14, ".pdf", "application/pdf", "CONTRACT", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 26214400L, null, "عقد", "Contract", 14, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 15, ".ppt,.pptx,.pdf", "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf", "PRESENTATION", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 26214400L, null, "عرض تقديمي", "Presentation", 15, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 16, ".xls,.xlsx,.csv", "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv", "SPREADSHEET", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 26214400L, null, "جدول بيانات", "Spreadsheet", 16, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 17, ".pdf,.doc,.docx", "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", "LEGAL", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 26214400L, null, "مستند قانوني", "Legal document", 17, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 18, ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip", "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/csv,application/zip", "GENERAL", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 26214400L, null, "ملف أعمال عام", "General business file", 18, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 19, ".pdf,.jpg,.jpeg,.png,.webp", "application/pdf,image/jpeg,image/png,image/webp", "FUNDING_PROOF", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, 26214400L, null, "إثبات دفعة تمويل", "Funding payment proof", 19, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null }
                });

            migrationBuilder.InsertData(
                table: "FileStoragePolicies",
                columns: new[] { "Id", "DefaultProjectQuotaBytes", "DefaultUserQuotaBytes", "GlobalMaxFileSizeBytes", "UpdatedAt", "UpdatedByUserId" },
                values: new object[] { 1, 2147483648L, 524288000L, 52428800L, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.InsertData(
                table: "FundingGoals",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedByUserId", "DescriptionAr", "DescriptionEn", "IsActive", "NameAr", "NameEn", "SortOrder", "UpdatedAt", "UpdatedByUserId" },
                values: new object[,]
                {
                    { 1, "LAUNCHNEWBUSINESS", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "تمويل لبدء مشروع جديد.", "Funding to start a new venture.", true, "إطلاق مشروع جديد", "Launch New Business", 1, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 2, "EXPANDEXISTINGBUSINESS", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "تمويل لتوسيع نشاط قائم.", "Funding to scale an operating business.", true, "التوسع في الأعمال القائمة", "Expand Existing Business", 2, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 3, "BUYEQUIPMENT", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "تمويل لشراء المعدات أو الآلات.", "Funding to purchase equipment or machinery.", true, "شراء المعدات", "Buy Equipment", 3, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 4, "MARKETING", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "تمويل للتسويق واكتساب العملاء.", "Funding for marketing and customer acquisition.", true, "التسويق", "Marketing", 4, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 5, "WORKINGCAPITAL", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "تمويل للتدفقات النقدية التشغيلية.", "Funding for operating cash flow.", true, "رأس المال العامل", "Working Capital", 5, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 6, "OPENNEWBRANCH", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "تمويل لافتتاح موقع جديد.", "Funding to open another location.", true, "افتتاح فرع جديد", "Open New Branch", 6, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 7, "RESEARCHDEVELOPMENT", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "تمويل لتطوير المنتجات أو التقنية.", "Funding for product or technical development.", true, "البحث والتطوير", "Research & Development", 7, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 8, "INVENTORYPURCHASE", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "تمويل لشراء المخزون.", "Funding to purchase inventory.", true, "شراء المخزون", "Inventory Purchase", 8, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 9, "HIRING", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "تمويل لاستقطاب الفريق وتنميته.", "Funding to recruit and grow the team.", true, "التوظيف", "Hiring", 9, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 10, "ACQUISITION", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "تمويل لأنشطة الاستحواذ.", "Funding for acquisition activity.", true, "الاستحواذ", "Acquisition", 10, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null }
                });

            migrationBuilder.InsertData(
                table: "Groups",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "MetadataJson", "ModifiedAt", "Name", "TenantId" },
                values: new object[,]
                {
                    { 1000, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Organization administrator - full access", true, null, null, "Org_Admin", null },
                    { 1001, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Admin with elevated privileges", true, null, null, "Admin", null },
                    { 1002, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Manager with limited admin privileges", true, null, null, "Manager", null },
                    { 1003, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Read-only admin", true, null, null, "Viewer", null }
                });

            migrationBuilder.InsertData(
                table: "IncomeCategories",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedBy", "Description", "GLAccountCode", "IsActive", "Name", "NameAr", "NameEn", "SortOrder", "UpdatedAt", "UpdatedBy" },
                values: new object[] { 1, "INC-OTHER", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Default company operating income category", null, true, "Other Operating Income", null, "Other Operating Income", 999, null, null });

            migrationBuilder.InsertData(
                table: "Lookups",
                columns: new[] { "Id", "Key", "SortOrder", "Type", "Value", "ValueAr" },
                values: new object[,]
                {
                    { 200, "Review", 1, 20, "Review", "مراجعة" },
                    { 201, "Interactive", 2, 20, "Interactive", "تفاعلي" },
                    { 202, "Deal", 3, 20, "Deal", "صفقة" }
                });

            migrationBuilder.InsertData(
                table: "OpportunityTags",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedByUserId", "DescriptionAr", "DescriptionEn", "IsActive", "NameAr", "NameEn", "SortOrder", "UpdatedAt", "UpdatedByUserId" },
                values: new object[,]
                {
                    { 1, "AI", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Uses or builds artificial intelligence.", true, "الذكاء الاصطناعي", "AI", 1, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 2, "EXPORT", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Export-oriented business.", true, "التصدير", "Export", 2, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 3, "GREEN", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Sustainability or environmentally focused.", true, "مشاريع خضراء", "Green", 3, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 4, "WOMENLED", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Founded or led by women.", true, "بقيادة نسائية", "Women-led", 4, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 5, "FRANCHISE", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Franchise or franchisable model.", true, "امتياز تجاري", "Franchise", 5, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 6, "B2B", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Business-to-business model.", true, "أعمال موجهة للشركات", "B2B", 6, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 7, "B2C", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Business-to-consumer model.", true, "أعمال موجهة للمستهلكين", "B2C", 7, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 8, "SAAS", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Software as a service.", true, "برمجيات كخدمة", "SaaS", 8, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 9, "MOBILEAPP", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Mobile application product.", true, "تطبيق جوال", "Mobile App", 9, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 10, "LOCALBIZ", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Local market business.", true, "مشروع محلي", "Local Business", 10, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 11, "HIGHGROWTH", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Designed for rapid growth.", true, "نمو مرتفع", "High Growth", 11, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 12, "LOWENTRY", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Accessible minimum investment size.", true, "حد أدنى منخفض للاستثمار", "Low Entry Ticket", 12, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null }
                });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "CreatedAt", "Description", "Key", "Name" },
                values: new object[,]
                {
                    { 2000, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Read client records", "admin.clients.read", "Read Clients" },
                    { 2001, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Create/update/delete clients", "admin.clients.manage", "Manage Clients" },
                    { 2003, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Manage groups and assignments", "admin.groups.manage", "Manage Groups" },
                    { 2005, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Development utility endpoints", "admin.dev.manage", "Dev Tools" },
                    { 2006, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "View groups, roles, and permission assignments", "RBAC.View", "View RBAC" },
                    { 2007, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Create, update, delete groups and assign group permissions", "Group.Manage", "Manage Groups" },
                    { 2008, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Create, update, delete roles and assign role permissions/users", "Role.Manage", "Manage Roles" }
                });

            migrationBuilder.InsertData(
                table: "PricingRules",
                columns: new[] { "Id", "Action", "ActionCode", "CreatedAt", "CreditCost", "Description", "DisplayName", "IsActive", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "SendConversationRequest", "SendConversationRequest", new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc), 5m, "Fixed CREDIT fee to send a negotiation conversation request.", "Send Conversation Request", true, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "SendFirstOffer", "SendFirstOffer", new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc), 5m, "Fixed CREDIT fee to send the first negotiation offer.", "Send First Offer", true, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "SendOfferReplacement", "SendOfferReplacement", new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc), 2m, "Fixed CREDIT fee to send a full replacement offer.", "Send Offer Replacement", true, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, "SubmitParticipationRequest", "SubmitParticipationRequest", new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc), 10m, "Fixed CREDIT fee to submit an opportunity participation request.", "Submit Participation Request", true, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, "PublishOpportunity", "PublishOpportunity", new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc), 15m, "Fixed CREDIT fee to publish an opportunity.", "Publish Opportunity", true, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "ProjectCategories",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedByUserId", "DescriptionAr", "DescriptionEn", "IsActive", "NameAr", "NameEn", "SortOrder", "UpdatedAt", "UpdatedByUserId" },
                values: new object[,]
                {
                    { 1, "TECHNOLOGY", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Technology products, platforms, and services.", true, "تكنولوجيا", "Technology", 1, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 2, "FOODBEVERAGE", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Food production, restaurants, cafes, and beverage ventures.", true, "الأغذية والمشروبات", "Food & Beverage", 2, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 3, "HEALTHCARE", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Healthcare services, clinics, medical products, and wellness.", true, "الرعاية الصحية", "Healthcare", 3, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 4, "EDUCATION", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Education, training, and learning products.", true, "التعليم", "Education", 4, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 5, "RETAIL", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Retail stores, commerce operations, and consumer goods.", true, "التجزئة", "Retail", 5, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 6, "MANUFACTURING", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Manufacturing, production lines, and industrial operations.", true, "التصنيع", "Manufacturing", 6, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 7, "AGRICULTURE", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Agriculture, farms, food supply, and agri-tech.", true, "الزراعة", "Agriculture", 7, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 8, "REALESTATE", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Real estate development, operations, and property services.", true, "العقارات", "Real Estate", 8, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 9, "TOURISM", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Tourism, hospitality, and travel services.", true, "السياحة", "Tourism", 9, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 10, "TRANSPORTATION", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Transportation, logistics, and mobility.", true, "النقل", "Transportation", 10, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 11, "ENERGY", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Energy generation, services, and sustainability.", true, "الطاقة", "Energy", 11, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 12, "FASHION", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Fashion, apparel, accessories, and design.", true, "الأزياء", "Fashion", 12, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 13, "MEDIA", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Media, content, publishing, and creative production.", true, "الإعلام", "Media", 13, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 14, "GAMING", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Games, interactive entertainment, and gaming platforms.", true, "الألعاب", "Gaming", 14, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 15, "FINTECH", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Financial technology, payments, lending, and finance tools.", true, "التقنية المالية", "FinTech", 15, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 16, "AI", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Artificial intelligence products, services, and infrastructure.", true, "الذكاء الاصطناعي", "AI", 16, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 17, "INDUSTRY", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, "الصناعة", "Industry", 17, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 18, "TRADING", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, true, "التجارة", "Trading", 18, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null }
                });

            migrationBuilder.InsertData(
                table: "ReputationRules",
                columns: new[] { "Id", "ActivityCode", "CreatedAt", "CreatedByUserId", "Description", "IsActive", "IsAutomatic", "IsEnabled", "IsSystem", "MaximumOccurrences", "Points", "RoleScope", "RuleCode", "SortOrder" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Profile completed", true, true, true, true, 1, 50, "Any", "profile_completed", 1 },
                    { 2, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Email verified", true, true, true, true, 1, 30, "Any", "email_verified", 2 },
                    { 3, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Phone verified", true, true, true, true, 1, 30, "Any", "phone_verified", 3 },
                    { 4, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Company verified", true, true, true, true, 1, 100, "Any", "company_verified", 4 }
                });

            migrationBuilder.InsertData(
                table: "ReputationRules",
                columns: new[] { "Id", "ActivityCode", "CanRepeat", "CreatedAt", "CreatedByUserId", "Description", "IsActive", "IsAutomatic", "IsEnabled", "IsSystem", "MaximumOccurrences", "Points", "RoleScope", "RuleCode", "SortOrder" },
                values: new object[] { 5, null, true, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Investment published", true, true, true, true, 10, 200, "Any", "investment_published", 5 });

            migrationBuilder.InsertData(
                table: "ReputationRules",
                columns: new[] { "Id", "ActivityCode", "CreatedAt", "CreatedByUserId", "Description", "IsActive", "IsAutomatic", "IsEnabled", "IsSystem", "MaximumOccurrences", "Points", "RoleScope", "RuleCode", "SortOrder" },
                values: new object[,]
                {
                    { 6, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Investment approved", true, true, true, true, 1, 150, "Any", "investment_approved", 6 },
                    { 7, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "First investment", true, true, true, true, 1, 500, "Any", "first_investment", 7 }
                });

            migrationBuilder.InsertData(
                table: "ReputationRules",
                columns: new[] { "Id", "ActivityCode", "CanRepeat", "CreatedAt", "CreatedByUserId", "Description", "IsActive", "IsAutomatic", "IsEnabled", "IsSystem", "MaximumOccurrences", "Points", "RoleScope", "RuleCode", "SortOrder" },
                values: new object[] { 8, null, true, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Repeat investment", true, true, true, true, 10, 200, "Any", "repeat_investment", 8 });

            migrationBuilder.InsertData(
                table: "ReputationRules",
                columns: new[] { "Id", "ActivityCode", "CreatedAt", "CreatedByUserId", "Description", "IsActive", "IsAutomatic", "IsEnabled", "IsSystem", "MaximumOccurrences", "Points", "RoleScope", "RuleCode", "SortOrder" },
                values: new object[] { 9, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Successful investment", true, true, true, true, 1, 300, "Any", "successful_investment", 9 });

            migrationBuilder.InsertData(
                table: "ReputationRules",
                columns: new[] { "Id", "ActivityCode", "CreatedAt", "CreatedByUserId", "Description", "IsActive", "IsEnabled", "IsSystem", "MaximumOccurrences", "Points", "RoleScope", "RuleCode", "SortOrder" },
                values: new object[,]
                {
                    { 10, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Policy violation", true, true, true, 1, -500, "Any", "policy_violation", 10 },
                    { 11, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Admin penalty", true, true, true, 1, -1000, "Any", "admin_penalty", 11 }
                });

            migrationBuilder.InsertData(
                table: "ReputationRules",
                columns: new[] { "Id", "ActivityCode", "CanRepeat", "CreatedAt", "CreatedByUserId", "Description", "IsActive", "IsAutomatic", "IsEnabled", "IsSystem", "Points", "RoleScope", "RuleCode", "SortOrder" },
                values: new object[] { 12, "ConfirmPayment", true, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Payment confirmed by founder", true, true, true, true, 5, "Any", "confirm_payment", 12 });

            migrationBuilder.InsertData(
                table: "RiskLevels",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedByUserId", "DescriptionAr", "DescriptionEn", "IsActive", "NameAr", "NameEn", "SortOrder", "UpdatedAt", "UpdatedByUserId" },
                values: new object[,]
                {
                    { 1, "LOW", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "مستوى مخاطر نسبي منخفض.", "Lower relative risk.", true, "منخفض", "Low", 1, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 2, "MEDIUM", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "مستوى مخاطر نسبي متوسط.", "Medium relative risk.", true, "متوسط", "Medium", 2, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { 3, "HIGH", new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null, "مستوى مخاطر نسبي مرتفع.", "Higher relative risk.", true, "مرتفع", "High", 3, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Utc), null }
                });

            migrationBuilder.InsertData(
                table: "ServicePrices",
                columns: new[] { "Id", "CreatedAt", "Currency", "Description", "IsActive", "Price", "ServiceCode", "ServiceName", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Credits", "Fee charged to publish an investment opportunity.", true, 100m, "PublishOpportunity", "Publish Opportunity", new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Credits", "Fee charged to feature an investment opportunity.", true, 300m, "FeaturedOpportunity", "Featured Opportunity", new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Credits", "Platform fee for investment activity.", true, 25m, "InvestmentFee", "Investment Fee", new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Credits", "Basic subscription service price.", true, 500m, "SubscriptionBasic", "Subscription Basic", new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Credits", "Premium subscription service price.", true, 1000m, "SubscriptionPremium", "Subscription Premium", new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc), "Credits", "Manual administrative charge placeholder.", true, 0m, "AdminManualCharge", "Admin Manual Charge", new DateTime(2026, 6, 29, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "GroupPermissions",
                columns: new[] { "Id", "ApplicationPermissionId", "AssignedAt", "AssignedBy", "GroupId", "PermissionId" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2000 },
                    { 2, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2001 },
                    { 4, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2003 },
                    { 6, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2005 },
                    { 7, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2006 },
                    { 8, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2007 },
                    { 9, null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, 1000, 2008 }
                });

            migrationBuilder.InsertData(
                table: "Investments",
                columns: new[] { "Id", "AvailableShares", "BusinessName", "ContractCompletionStatus", "ContractEndDate", "ContractStartDate", "Currency", "CurrentValuation", "Date", "DefaultRiskLevel", "Description", "DurationMonths", "EndDate", "EquityExitType", "EquityOfferedPercentage", "EstimatedFutureValuation", "EstimatedInstallment", "ExitTargetDate", "ExpectedExitStrategy", "ExpectedMonthlyReturn", "ExpectedROI", "FinalRepaymentDate", "FounderId", "GracePeriodMonths", "ImageUrl", "InitialCapital", "InterestRate", "InvestmentTypeId", "LastActivityAt", "LoanCompletionStatus", "MaxInvestment", "Milestone", "MinInvestment", "MomentumScore", "NextInstallmentDate", "OpportunityId", "ParticipantOnlyActivityCount", "PayoutFrequency", "ProfitPercentage", "ProjectCategoryId", "PublicActivityCount", "RemainingBalance", "RemainingPayoutAmount", "RepaymentFrequency", "RepaymentStartDate", "RevenueDistributionFrequency", "RevenueSharePercentage", "RiskLevel", "SharePrice", "StartDate", "Status", "TargetFund", "TotalExpectedPayout", "TotalPaidAmount", "TotalRepaymentAmount", "TotalShares", "ValuationCap", "VideoUrl" },
                values: new object[,]
                {
                    { 1000, 8000, "SolarGrid Energy", null, null, null, "USD", null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Distributed solar microgrid for emerging markets.", null, new DateTime(2026, 1, 28, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, null, null, null, null, 12.5m, null, new Guid("11111111-1111-1111-1111-111111111111"), null, null, 50000m, null, 2, null, null, 5000m, null, 100m, 0, null, null, 0, null, null, 1, 0, null, null, null, null, null, null, "MEDIUM", 10.00m, new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Active", 100000m, null, null, null, 10000, 5000000m, null },
                    { 1001, 1200, "AquaPure", null, null, null, "USD", null, new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), null, "Affordable water purification devices.", null, new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, null, null, null, null, 10.0m, null, new Guid("11111111-1111-1111-1111-111111111111"), null, null, 20000m, null, 2, null, null, 2000m, null, 50m, 0, null, null, 0, null, null, 17, 0, null, null, null, null, null, null, "LOW", 5.00m, new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), "Active", 25000m, null, null, null, 5000, 2000000m, null }
                });

            migrationBuilder.InsertData(
                table: "InvestmentParticipants",
                columns: new[] { "Id", "AmountInvested", "CreatedAt", "InvestmentDate", "InvestmentId", "InvestorId", "IsAnonymous", "SharesPurchased", "Status" },
                values: new object[,]
                {
                    { 5000, 3000.00m, new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), 1000, new Guid("22222222-2222-2222-2222-222222222222"), false, 300, 4 },
                    { 5001, 2000.00m, new DateTime(2025, 12, 26, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 26, 0, 0, 0, 0, DateTimeKind.Utc), 1000, new Guid("33333333-3333-3333-3333-333333333333"), false, 200, 4 },
                    { 5002, 500.00m, new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), 1001, new Guid("22222222-2222-2222-2222-222222222222"), false, 100, 4 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPermissions_Key",
                table: "ApplicationPermissions",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPermissions_ParentPermissionId",
                table: "ApplicationPermissions",
                column: "ParentPermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPermissions_ResourceType_Action",
                table: "ApplicationPermissions",
                columns: new[] { "ResourceType", "Action" });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPermissions_TenantId",
                table: "ApplicationPermissions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityType",
                table: "AuditLogs",
                column: "EntityType");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityType_EntityId",
                table: "AuditLogs",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_TenantId",
                table: "AuditLogs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Timestamp",
                table: "AuditLogs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AuthUsers_Email",
                table: "AuthUsers",
                column: "Email",
                unique: true,
                filter: "\"Email\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AuthUsers_FirebaseUid",
                table: "AuthUsers",
                column: "FirebaseUid",
                filter: "\"FirebaseUid\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ConversationId_Timestamp",
                table: "ChatMessages",
                columns: new[] { "ConversationId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SenderUserId",
                table: "ChatMessages",
                column: "SenderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SupportSessionId_Timestamp",
                table: "ChatMessages",
                columns: new[] { "SupportSessionId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_ClientProjectCategories_ProjectCategoryId",
                table: "ClientProjectCategories",
                column: "ProjectCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Email",
                table: "Clients",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_MobileNumber",
                table: "Clients",
                column: "MobileNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Phone",
                table: "Clients",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_StatusId",
                table: "Clients",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_UserId",
                table: "Clients",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClientStatusHistories_ClientId",
                table: "ClientStatusHistories",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractEvents_ContractVersionId_CreatedAt",
                table: "ContractEvents",
                columns: new[] { "ContractVersionId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractEvents_PerformedByUserId",
                table: "ContractEvents",
                column: "PerformedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationParticipants_UserId",
                table: "ConversationParticipants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationRequests_AcceptedConversationId",
                table: "ConversationRequests",
                column: "AcceptedConversationId",
                unique: true,
                filter: "[AcceptedConversationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationRequests_OpportunityId",
                table: "ConversationRequests",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationRequests_OpportunityId_RequesterUserId_RecipientUserId_Status",
                table: "ConversationRequests",
                columns: new[] { "OpportunityId", "RequesterUserId", "RecipientUserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ConversationRequests_RecipientUserId",
                table: "ConversationRequests",
                column: "RecipientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationRequests_RequesterUserId",
                table: "ConversationRequests",
                column: "RequesterUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ConversationRequestId",
                table: "Conversations",
                column: "ConversationRequestId",
                unique: true,
                filter: "[ConversationRequestId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_FounderId",
                table: "Conversations",
                column: "FounderId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_InvestorId",
                table: "Conversations",
                column: "InvestorId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_OpportunityId",
                table: "Conversations",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_OpportunityId_FounderId_InvestorId_IsActive",
                table: "Conversations",
                columns: new[] { "OpportunityId", "FounderId", "InvestorId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ParticipationRequestId",
                table: "Conversations",
                column: "ParticipationRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Countries_Code",
                table: "Countries",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Countries_IsActive_SortOrder",
                table: "Countries",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Countries_IsoAlpha2",
                table: "Countries",
                column: "IsoAlpha2",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditPlanPurchases_PlanId",
                table: "CreditPlanPurchases",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditPlanPurchases_UserId",
                table: "CreditPlanPurchases",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditTransactions_AdminId",
                table: "CreditTransactions",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditTransactions_ClientId",
                table: "CreditTransactions",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditTransactions_UserId",
                table: "CreditTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_IsActive",
                table: "Currencies",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_IsActive",
                table: "DeviceTokens",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_Token_UserId",
                table: "DeviceTokens",
                columns: new[] { "Token", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_UserId",
                table: "DeviceTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailHistory_EmailOutboxId",
                table: "EmailHistory",
                column: "EmailOutboxId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailVerificationOtps_UserId_NormalizedEmail_Purpose",
                table: "EmailVerificationOtps",
                columns: new[] { "UserId", "NormalizedEmail", "Purpose" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityCapitalizationSnapshotHolders_EquityCapitalizationSnapshotId_EquityPositionId",
                table: "EquityCapitalizationSnapshotHolders",
                columns: new[] { "EquityCapitalizationSnapshotId", "EquityPositionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EquityCapitalizationSnapshotHolders_EquityPositionId",
                table: "EquityCapitalizationSnapshotHolders",
                column: "EquityPositionId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityCapitalizationSnapshots_EquityCorporateEventId_IsBefore",
                table: "EquityCapitalizationSnapshots",
                columns: new[] { "EquityCorporateEventId", "IsBefore" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EquityClosureSnapshots_ClosedByUserId",
                table: "EquityClosureSnapshots",
                column: "ClosedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityClosureSnapshots_EquityPositionId_ClosedAt",
                table: "EquityClosureSnapshots",
                columns: new[] { "EquityPositionId", "ClosedAt" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EquityClosureSnapshots_InvestorUserId_ProjectId",
                table: "EquityClosureSnapshots",
                columns: new[] { "InvestorUserId", "ProjectId" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityCorporateEventPositions_EquityPositionId",
                table: "EquityCorporateEventPositions",
                column: "EquityPositionId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityCorporateEvents_CorrelationId",
                table: "EquityCorporateEvents",
                column: "CorrelationId",
                unique: true,
                filter: "[CorrelationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EquityCorporateEvents_OpportunityId_Status_EffectiveDate",
                table: "EquityCorporateEvents",
                columns: new[] { "OpportunityId", "Status", "EffectiveDate" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityCorporateEvents_ProjectId_Status_EffectiveDate",
                table: "EquityCorporateEvents",
                columns: new[] { "ProjectId", "Status", "EffectiveDate" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityDividendDeclarations_DeclaredByUserId",
                table: "EquityDividendDeclarations",
                column: "DeclaredByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityDividendDeclarations_OpportunityId_Status",
                table: "EquityDividendDeclarations",
                columns: new[] { "OpportunityId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityDividendDeclarations_ProjectId_Status_DeclarationDate",
                table: "EquityDividendDeclarations",
                columns: new[] { "ProjectId", "Status", "DeclarationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityDividendDistributionConfirmations_ConfirmedByUserId",
                table: "EquityDividendDistributionConfirmations",
                column: "ConfirmedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityDividendDistributionConfirmations_DistributionDeclarationId_ConfirmedByUserId",
                table: "EquityDividendDistributionConfirmations",
                columns: new[] { "DistributionDeclarationId", "ConfirmedByUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EquityDividendDistributionDeclarations_DeclaredByUserId",
                table: "EquityDividendDistributionDeclarations",
                column: "DeclaredByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityDividendDistributionDeclarations_DividendDeclarationId_DividendEntitlementId",
                table: "EquityDividendDistributionDeclarations",
                columns: new[] { "DividendDeclarationId", "DividendEntitlementId" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityDividendDistributionDeclarations_DividendEntitlementId",
                table: "EquityDividendDistributionDeclarations",
                column: "DividendEntitlementId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityDividendEntitlements_DividendDeclarationId_EquityPositionId",
                table: "EquityDividendEntitlements",
                columns: new[] { "DividendDeclarationId", "EquityPositionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EquityDividendEntitlements_EquityPositionId_DividendDeclarationId",
                table: "EquityDividendEntitlements",
                columns: new[] { "EquityPositionId", "DividendDeclarationId" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityDividendEntitlements_InvestorUserId",
                table: "EquityDividendEntitlements",
                column: "InvestorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityHoldingLedgerEntries_CorporateEventId",
                table: "EquityHoldingLedgerEntries",
                column: "CorporateEventId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityHoldingLedgerEntries_EquityPositionId_EffectiveDate_Id",
                table: "EquityHoldingLedgerEntries",
                columns: new[] { "EquityPositionId", "EffectiveDate", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityHoldingLedgerEntries_EquityPositionId_EventType_CorporateEventId",
                table: "EquityHoldingLedgerEntries",
                columns: new[] { "EquityPositionId", "EventType", "CorporateEventId" },
                unique: true,
                filter: "[CorporateEventId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EquityHoldingSnapshots_EquityPositionId",
                table: "EquityHoldingSnapshots",
                column: "EquityPositionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EquityPositions_AcceptedOfferId",
                table: "EquityPositions",
                column: "AcceptedOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityPositions_ContractId_OfferLegId_InvestorUserId",
                table: "EquityPositions",
                columns: new[] { "ContractId", "OfferLegId", "InvestorUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EquityPositions_ContractVersionId",
                table: "EquityPositions",
                column: "ContractVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityPositions_FounderUserId",
                table: "EquityPositions",
                column: "FounderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityPositions_InvestorUserId_Status",
                table: "EquityPositions",
                columns: new[] { "InvestorUserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityPositions_OfferLegId",
                table: "EquityPositions",
                column: "OfferLegId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityPositions_OpportunityId_Status",
                table: "EquityPositions",
                columns: new[] { "OpportunityId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityPositions_ParticipationRequestId_OfferLegId_InvestorUserId",
                table: "EquityPositions",
                columns: new[] { "ParticipationRequestId", "OfferLegId", "InvestorUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EquityPositions_ProjectId",
                table: "EquityPositions",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityTransfers_DestinationInvestorUserId_Status",
                table: "EquityTransfers",
                columns: new[] { "DestinationInvestorUserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityTransfers_DestinationPositionId",
                table: "EquityTransfers",
                column: "DestinationPositionId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityTransfers_OpportunityId_Status",
                table: "EquityTransfers",
                columns: new[] { "OpportunityId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityTransfers_ProjectId_Status_EffectiveDate",
                table: "EquityTransfers",
                columns: new[] { "ProjectId", "Status", "EffectiveDate" });

            migrationBuilder.CreateIndex(
                name: "IX_EquityTransfers_SourceInvestorUserId",
                table: "EquityTransfers",
                column: "SourceInvestorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EquityTransfers_SourcePositionId_Status",
                table: "EquityTransfers",
                columns: new[] { "SourcePositionId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateSnapshots_ProviderQuoteId",
                table: "ExchangeRateSnapshots",
                column: "ProviderQuoteId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateSnapshots_SourceCurrency_TargetCurrency_RateTimestamp",
                table: "ExchangeRateSnapshots",
                columns: new[] { "SourceCurrency", "TargetCurrency", "RateTimestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseCategories_Code",
                table: "ExpenseCategories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FileCategories_Code",
                table: "FileCategories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FileCategories_IsActive_SortOrder",
                table: "FileCategories",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_FinanceAccounts_Code",
                table: "FinanceAccounts",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FinanceAttachments_TransactionId",
                table: "FinanceAttachments",
                column: "TransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_FinanceAuditEvents_TransactionId_CreatedAt",
                table: "FinanceAuditEvents",
                columns: new[] { "TransactionId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_FinanceReconciliations_FinanceAccountId_PeriodEndDate",
                table: "FinanceReconciliations",
                columns: new[] { "FinanceAccountId", "PeriodEndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactionLines_TransactionId_LineSequence",
                table: "FinanceTransactionLines",
                columns: new[] { "TransactionId", "LineSequence" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactions_DestinationAccountId",
                table: "FinanceTransactions",
                column: "DestinationAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactions_ExchangeRateSnapshotId",
                table: "FinanceTransactions",
                column: "ExchangeRateSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactions_ExpenseCategoryId",
                table: "FinanceTransactions",
                column: "ExpenseCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactions_IncomeCategoryId",
                table: "FinanceTransactions",
                column: "IncomeCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactions_MakerId",
                table: "FinanceTransactions",
                column: "MakerId");

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactions_ReferenceNumber",
                table: "FinanceTransactions",
                column: "ReferenceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactions_ReversalOfTransactionId",
                table: "FinanceTransactions",
                column: "ReversalOfTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactions_SourceAccountId",
                table: "FinanceTransactions",
                column: "SourceAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactions_Status_TransactionDate",
                table: "FinanceTransactions",
                columns: new[] { "Status", "TransactionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactions_SupplierId",
                table: "FinanceTransactions",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_FundingDeclarationLegAllocations_ContractId",
                table: "FundingDeclarationLegAllocations",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_FundingDeclarationLegAllocations_FundingDeclarationId_OfferLegId",
                table: "FundingDeclarationLegAllocations",
                columns: new[] { "FundingDeclarationId", "OfferLegId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FundingDeclarationLegAllocations_OfferLegId",
                table: "FundingDeclarationLegAllocations",
                column: "OfferLegId");

            migrationBuilder.CreateIndex(
                name: "IX_FundingDeclarationLegAllocations_ParticipationId_OfferLegId",
                table: "FundingDeclarationLegAllocations",
                columns: new[] { "ParticipationId", "OfferLegId" });

            migrationBuilder.CreateIndex(
                name: "IX_FundingDeclarations_ConfirmedByInvestorId",
                table: "FundingDeclarations",
                column: "ConfirmedByInvestorId");

            migrationBuilder.CreateIndex(
                name: "IX_FundingDeclarations_DisputedByInvestorId",
                table: "FundingDeclarations",
                column: "DisputedByInvestorId");

            migrationBuilder.CreateIndex(
                name: "IX_FundingDeclarations_OpportunityId_Status",
                table: "FundingDeclarations",
                columns: new[] { "OpportunityId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_FundingDeclarations_ParticipationId_DeclaredAt",
                table: "FundingDeclarations",
                columns: new[] { "ParticipationId", "DeclaredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_FundingDeclarations_ParticipationId_IdempotencyKey",
                table: "FundingDeclarations",
                columns: new[] { "ParticipationId", "IdempotencyKey" },
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_FundingDeclarations_ProofFileId",
                table: "FundingDeclarations",
                column: "ProofFileId");

            migrationBuilder.CreateIndex(
                name: "IX_FundingGoals_Code",
                table: "FundingGoals",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FundingGoals_IsActive_SortOrder",
                table: "FundingGoals",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_GroupPermissions_ApplicationPermissionId",
                table: "GroupPermissions",
                column: "ApplicationPermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupPermissions_GroupId_PermissionId",
                table: "GroupPermissions",
                columns: new[] { "GroupId", "PermissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroupPermissions_PermissionId",
                table: "GroupPermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_Name",
                table: "Groups",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_IncomeCategories_Code",
                table: "IncomeCategories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContracts_AcceptedOfferId",
                table: "InvestmentContracts",
                column: "AcceptedOfferId",
                unique: true,
                filter: "[AcceptedOfferId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContracts_ContractNumber",
                table: "InvestmentContracts",
                column: "ContractNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContracts_FounderUserId",
                table: "InvestmentContracts",
                column: "FounderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContracts_InvestorUserId",
                table: "InvestmentContracts",
                column: "InvestorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContracts_OpportunityId_FounderUserId_InvestorUserId_InvestmentModel",
                table: "InvestmentContracts",
                columns: new[] { "OpportunityId", "FounderUserId", "InvestorUserId", "InvestmentModel" });

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContracts_ParticipationRequestId",
                table: "InvestmentContracts",
                column: "ParticipationRequestId",
                unique: true,
                filter: "[ParticipationRequestId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContractVersions_ContractId",
                table: "InvestmentContractVersions",
                column: "ContractId",
                unique: true,
                filter: "[Status] = 'Active'");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContractVersions_ContractId_VersionNumber",
                table: "InvestmentContractVersions",
                columns: new[] { "ContractId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContractVersions_PreviousVersionId",
                table: "InvestmentContractVersions",
                column: "PreviousVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContractVersions_SourceNegotiationOfferId",
                table: "InvestmentContractVersions",
                column: "SourceNegotiationOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContractVersions_SourceParticipationRequestId",
                table: "InvestmentContractVersions",
                column: "SourceParticipationRequestId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentEvents_InvestmentId",
                table: "InvestmentEvents",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentEvents_InvestmentId_OccurredAt",
                table: "InvestmentEvents",
                columns: new[] { "InvestmentId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentEvents_InvestmentId_Version",
                table: "InvestmentEvents",
                columns: new[] { "InvestmentId", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentFavorites_InvestmentId",
                table: "InvestmentFavorites",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentFavorites_InvestorId_InvestmentId",
                table: "InvestmentFavorites",
                columns: new[] { "InvestorId", "InvestmentId" },
                unique: true,
                filter: "[InvestmentId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentFavorites_InvestorId_OpportunityId",
                table: "InvestmentFavorites",
                columns: new[] { "InvestorId", "OpportunityId" },
                unique: true,
                filter: "[OpportunityId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentFavorites_OpportunityId",
                table: "InvestmentFavorites",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentImages_InvestmentId",
                table: "InvestmentImages",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentImages_UploadedBy",
                table: "InvestmentImages",
                column: "UploadedBy");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentLearnMores_InvestmentId",
                table: "InvestmentLearnMores",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentLearnMores_OpenedAt",
                table: "InvestmentLearnMores",
                column: "OpenedAt");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentLearnMores_UserId",
                table: "InvestmentLearnMores",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentParticipants_InvestmentId",
                table: "InvestmentParticipants",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentParticipants_InvestorId",
                table: "InvestmentParticipants",
                column: "InvestorId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentRequests_FounderId",
                table: "InvestmentRequests",
                column: "FounderId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentRequests_InvestmentId",
                table: "InvestmentRequests",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentRequests_InvestorId",
                table: "InvestmentRequests",
                column: "InvestorId");

            migrationBuilder.CreateIndex(
                name: "IX_Investments_FounderId",
                table: "Investments",
                column: "FounderId");

            migrationBuilder.CreateIndex(
                name: "IX_Investments_OpportunityId",
                table: "Investments",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Investments_ProjectCategoryId",
                table: "Investments",
                column: "ProjectCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentTeamMembers_InvestmentId",
                table: "InvestmentTeamMembers",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentTeamMembers_InvestmentId_SortOrder",
                table: "InvestmentTeamMembers",
                columns: new[] { "InvestmentId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentTeamMembers_InvestmentId_UserId",
                table: "InvestmentTeamMembers",
                columns: new[] { "InvestmentId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentTeamMembers_UserId",
                table: "InvestmentTeamMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentViews_InvestmentId",
                table: "InvestmentViews",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentViews_UserId",
                table: "InvestmentViews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentViews_ViewedAt",
                table: "InvestmentViews",
                column: "ViewedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LoanObligations_AcceptedOfferId",
                table: "LoanObligations",
                column: "AcceptedOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanObligations_ContractId_OfferLegId",
                table: "LoanObligations",
                columns: new[] { "ContractId", "OfferLegId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoanObligations_ContractVersionId",
                table: "LoanObligations",
                column: "ContractVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanObligations_FounderUserId",
                table: "LoanObligations",
                column: "FounderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanObligations_InvestorUserId_Status",
                table: "LoanObligations",
                columns: new[] { "InvestorUserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_LoanObligations_OfferLegId",
                table: "LoanObligations",
                column: "OfferLegId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanObligations_ParticipationRequestId_OfferLegId",
                table: "LoanObligations",
                columns: new[] { "ParticipationRequestId", "OfferLegId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentAllocations_LoanObligationId",
                table: "LoanRepaymentAllocations",
                column: "LoanObligationId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentAllocations_LoanRepaymentDeclarationId_LoanRepaymentInstallmentId",
                table: "LoanRepaymentAllocations",
                columns: new[] { "LoanRepaymentDeclarationId", "LoanRepaymentInstallmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentAllocations_LoanRepaymentInstallmentId",
                table: "LoanRepaymentAllocations",
                column: "LoanRepaymentInstallmentId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentDeclarationInstallments_LoanRepaymentInstallmentId",
                table: "LoanRepaymentDeclarationInstallments",
                column: "LoanRepaymentInstallmentId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentDeclarations_AcceptedOfferId",
                table: "LoanRepaymentDeclarations",
                column: "AcceptedOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentDeclarations_ContractId",
                table: "LoanRepaymentDeclarations",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentDeclarations_ContractVersionId",
                table: "LoanRepaymentDeclarations",
                column: "ContractVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentDeclarations_LoanObligationId_DeclaredAt",
                table: "LoanRepaymentDeclarations",
                columns: new[] { "LoanObligationId", "DeclaredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentDeclarations_LoanObligationId_IdempotencyKey",
                table: "LoanRepaymentDeclarations",
                columns: new[] { "LoanObligationId", "IdempotencyKey" },
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentDeclarations_OfferLegId",
                table: "LoanRepaymentDeclarations",
                column: "OfferLegId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentDeclarations_ParticipationId",
                table: "LoanRepaymentDeclarations",
                column: "ParticipationId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentDeclarations_ProofFileId",
                table: "LoanRepaymentDeclarations",
                column: "ProofFileId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRepaymentInstallments_LoanObligationId_InstallmentNumber",
                table: "LoanRepaymentInstallments",
                columns: new[] { "LoanObligationId", "InstallmentNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MessageAttachments_MessageId",
                table: "MessageAttachments",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SupportSessionId_Timestamp",
                table: "Messages",
                columns: new[] { "SupportSessionId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOfferLegs_OfferId",
                table: "NegotiationOfferLegs",
                column: "OfferId");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_ConversationId",
                table: "NegotiationOffers",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_ConversationId_Status",
                table: "NegotiationOffers",
                columns: new[] { "ConversationId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_ConversationId_Version",
                table: "NegotiationOffers",
                columns: new[] { "ConversationId", "Version" },
                unique: true,
                filter: "[ConversationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_CreatedByUserId",
                table: "NegotiationOffers",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_OpportunityId",
                table: "NegotiationOffers",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_OpportunityId_CreatedByUserId_Status",
                table: "NegotiationOffers",
                columns: new[] { "OpportunityId", "CreatedByUserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationOffers_ParentOfferId",
                table: "NegotiationOffers",
                column: "ParentOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_Audience",
                table: "Notifications",
                column: "Audience");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedAt",
                table: "Notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationTemplates_Category",
                table: "NotificationTemplates",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationTemplates_IsActive",
                table: "NotificationTemplates",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationTemplates_Key",
                table: "NotificationTemplates",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_FounderId",
                table: "Opportunities",
                column: "FounderId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_FundingClosesAt",
                table: "Opportunities",
                column: "FundingClosesAt");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_FundingGoalId",
                table: "Opportunities",
                column: "FundingGoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_FundingStatus",
                table: "Opportunities",
                column: "FundingStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_InvestmentModel",
                table: "Opportunities",
                column: "InvestmentModel");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ModerationStatus",
                table: "Opportunities",
                column: "ModerationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ProjectId",
                table: "Opportunities",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ProjectId_FounderId",
                table: "Opportunities",
                columns: new[] { "ProjectId", "FounderId" });

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ProjectId_SequenceNumber",
                table: "Opportunities",
                columns: new[] { "ProjectId", "SequenceNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ProjectStage",
                table: "Opportunities",
                column: "ProjectStage");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_Status",
                table: "Opportunities",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "UX_Opportunities_Project_OtherStage",
                table: "Opportunities",
                columns: new[] { "ProjectId", "ProjectStageCustomNameNormalized" },
                unique: true,
                filter: "[ProjectStage] = 'Other' AND [ProjectStageCustomNameNormalized] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Opportunities_Project_StandardStage",
                table: "Opportunities",
                columns: new[] { "ProjectId", "ProjectStage" },
                unique: true,
                filter: "[ProjectStage] <> 'Other'");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityDocuments_Category",
                table: "OpportunityDocuments",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityDocuments_FileId",
                table: "OpportunityDocuments",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityDocuments_FileKey",
                table: "OpportunityDocuments",
                column: "FileKey");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityDocuments_OpportunityId",
                table: "OpportunityDocuments",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityDocuments_OpportunityId_Visibility",
                table: "OpportunityDocuments",
                columns: new[] { "OpportunityId", "Visibility" });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityEvents_CreatedByUserId",
                table: "OpportunityEvents",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityEvents_IdempotencyKey",
                table: "OpportunityEvents",
                column: "IdempotencyKey",
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityEvents_OpportunityId",
                table: "OpportunityEvents",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityEvents_OpportunityId_CreatedAt",
                table: "OpportunityEvents",
                columns: new[] { "OpportunityId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityEvents_OpportunityId_IsPublic",
                table: "OpportunityEvents",
                columns: new[] { "OpportunityId", "IsPublic" });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_ExchangeRateSnapshotId",
                table: "OpportunityJoinRequests",
                column: "ExchangeRateSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_InvestorId",
                table: "OpportunityJoinRequests",
                column: "InvestorId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_OpportunityId",
                table: "OpportunityJoinRequests",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_OpportunityId_InvestorId_ActiveRequestSlot",
                table: "OpportunityJoinRequests",
                columns: new[] { "OpportunityId", "InvestorId", "ActiveRequestSlot" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_OpportunityId_InvestorId_IdempotencyKey",
                table: "OpportunityJoinRequests",
                columns: new[] { "OpportunityId", "InvestorId", "IdempotencyKey" },
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_OpportunityId_InvestorId_ParticipationSequence",
                table: "OpportunityJoinRequests",
                columns: new[] { "OpportunityId", "InvestorId", "ParticipationSequence" },
                unique: true,
                filter: "[ParticipationSequence] > 0");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_OpportunityId_InvestorId_Status",
                table: "OpportunityJoinRequests",
                columns: new[] { "OpportunityId", "InvestorId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_ReviewedByFounderId",
                table: "OpportunityJoinRequests",
                column: "ReviewedByFounderId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_SourceConversationId",
                table: "OpportunityJoinRequests",
                column: "SourceConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityMedia_FileId",
                table: "OpportunityMedia",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityMedia_FileKey",
                table: "OpportunityMedia",
                column: "FileKey");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityMedia_OpportunityId",
                table: "OpportunityMedia",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityMedia_OpportunityId_SortOrder",
                table: "OpportunityMedia",
                columns: new[] { "OpportunityId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTagAssignments_OpportunityTagId",
                table: "OpportunityTagAssignments",
                column: "OpportunityTagId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTags_Code",
                table: "OpportunityTags",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTags_IsActive_SortOrder",
                table: "OpportunityTags",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationObligationConfirmations_ConfirmedByUserId",
                table: "ParticipationObligationConfirmations",
                column: "ConfirmedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationObligationConfirmations_OpportunityId",
                table: "ParticipationObligationConfirmations",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationObligationConfirmations_ParticipationRequestId_PartyRole",
                table: "ParticipationObligationConfirmations",
                columns: new[] { "ParticipationRequestId", "PartyRole" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationObligationConfirmations_RequiredUserId_IdempotencyKey",
                table: "ParticipationObligationConfirmations",
                columns: new[] { "RequiredUserId", "IdempotencyKey" },
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationObligationConfirmations_RequiredUserId_Status",
                table: "ParticipationObligationConfirmations",
                columns: new[] { "RequiredUserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_InstallmentConfirmationKey",
                table: "PaymentAllocations",
                column: "InstallmentConfirmationKey",
                unique: true,
                filter: "[InstallmentConfirmationKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_PaymentTransactionId",
                table: "PaymentAllocations",
                column: "PaymentTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_PaymentTransactionId_ParticipationRequestId_InstallmentNumber",
                table: "PaymentAllocations",
                columns: new[] { "PaymentTransactionId", "ParticipationRequestId", "InstallmentNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_ExchangeRateSnapshotId",
                table: "PaymentTransactions",
                column: "ExchangeRateSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_IdempotencyKey",
                table: "PaymentTransactions",
                column: "IdempotencyKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_ParticipationRequestId",
                table: "PaymentTransactions",
                column: "ParticipationRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_Reference",
                table: "PaymentTransactions",
                column: "Reference",
                unique: true,
                filter: "[Reference] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PendingAdminChanges_CheckerId",
                table: "PendingAdminChanges",
                column: "CheckerId");

            migrationBuilder.CreateIndex(
                name: "IX_PendingAdminChanges_MakerId",
                table: "PendingAdminChanges",
                column: "MakerId");

            migrationBuilder.CreateIndex(
                name: "IX_PendingAdminChanges_MakerId_Status",
                table: "PendingAdminChanges",
                columns: new[] { "MakerId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_PendingAdminChanges_Status",
                table: "PendingAdminChanges",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_PendingAdminChanges_Status_SubmittedAt",
                table: "PendingAdminChanges",
                columns: new[] { "Status", "SubmittedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PendingAdminChanges_TargetUserId",
                table: "PendingAdminChanges",
                column: "TargetUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Key",
                table: "Permissions",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PricingRules_ActionCode",
                table: "PricingRules",
                column: "ActionCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfileChangeAudits_UserId",
                table: "ProfileChangeAudits",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionAllocations_EntitlementId",
                table: "ProfitSharingDistributionAllocations",
                column: "EntitlementId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionAllocations_InvestorUserId",
                table: "ProfitSharingDistributionAllocations",
                column: "InvestorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionAllocations_ProfitSharingDistributionDeclarationId",
                table: "ProfitSharingDistributionAllocations",
                column: "ProfitSharingDistributionDeclarationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionAllocations_ProfitSharingObligationId_ReportingPeriodId",
                table: "ProfitSharingDistributionAllocations",
                columns: new[] { "ProfitSharingObligationId", "ReportingPeriodId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionAllocations_ReportingPeriodId",
                table: "ProfitSharingDistributionAllocations",
                column: "ReportingPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionDeclarations_AcceptedOfferId",
                table: "ProfitSharingDistributionDeclarations",
                column: "AcceptedOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionDeclarations_ContractId",
                table: "ProfitSharingDistributionDeclarations",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionDeclarations_ContractVersionId",
                table: "ProfitSharingDistributionDeclarations",
                column: "ContractVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionDeclarations_EntitlementId",
                table: "ProfitSharingDistributionDeclarations",
                column: "EntitlementId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionDeclarations_FounderUserId",
                table: "ProfitSharingDistributionDeclarations",
                column: "FounderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionDeclarations_InvestorUserId",
                table: "ProfitSharingDistributionDeclarations",
                column: "InvestorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionDeclarations_OfferLegId",
                table: "ProfitSharingDistributionDeclarations",
                column: "OfferLegId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionDeclarations_ParticipationId",
                table: "ProfitSharingDistributionDeclarations",
                column: "ParticipationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionDeclarations_ProfitSharingObligationId_IdempotencyKey",
                table: "ProfitSharingDistributionDeclarations",
                columns: new[] { "ProfitSharingObligationId", "IdempotencyKey" },
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionDeclarations_ReportingPeriodId_Status",
                table: "ProfitSharingDistributionDeclarations",
                columns: new[] { "ReportingPeriodId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingDistributionDeclarations_SupportingEvidenceFileId",
                table: "ProfitSharingDistributionDeclarations",
                column: "SupportingEvidenceFileId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingEntitlements_DeclarationId",
                table: "ProfitSharingEntitlements",
                column: "DeclarationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingEntitlements_ProfitSharingObligationId",
                table: "ProfitSharingEntitlements",
                column: "ProfitSharingObligationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingEntitlements_ReportingPeriodId",
                table: "ProfitSharingEntitlements",
                column: "ReportingPeriodId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingObligations_AcceptedOfferId",
                table: "ProfitSharingObligations",
                column: "AcceptedOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingObligations_ContractId_OfferLegId",
                table: "ProfitSharingObligations",
                columns: new[] { "ContractId", "OfferLegId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingObligations_ContractVersionId",
                table: "ProfitSharingObligations",
                column: "ContractVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingObligations_FounderUserId",
                table: "ProfitSharingObligations",
                column: "FounderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingObligations_InvestorUserId_Status",
                table: "ProfitSharingObligations",
                columns: new[] { "InvestorUserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingObligations_OfferLegId",
                table: "ProfitSharingObligations",
                column: "OfferLegId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingObligations_ParticipationRequestId_OfferLegId",
                table: "ProfitSharingObligations",
                columns: new[] { "ParticipationRequestId", "OfferLegId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingPeriodDeclarations_ContractId",
                table: "ProfitSharingPeriodDeclarations",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingPeriodDeclarations_ContractVersionId",
                table: "ProfitSharingPeriodDeclarations",
                column: "ContractVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingPeriodDeclarations_ParticipationId",
                table: "ProfitSharingPeriodDeclarations",
                column: "ParticipationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingPeriodDeclarations_ProfitSharingObligationId_IdempotencyKey",
                table: "ProfitSharingPeriodDeclarations",
                columns: new[] { "ProfitSharingObligationId", "IdempotencyKey" },
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingPeriodDeclarations_ReportingPeriodId",
                table: "ProfitSharingPeriodDeclarations",
                column: "ReportingPeriodId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingPeriodDeclarations_SupportingEvidenceFileId",
                table: "ProfitSharingPeriodDeclarations",
                column: "SupportingEvidenceFileId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfitSharingReportingPeriods_ProfitSharingObligationId_PeriodNumber",
                table: "ProfitSharingReportingPeriods",
                columns: new[] { "ProfitSharingObligationId", "PeriodNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCategories_Code",
                table: "ProjectCategories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCategories_IsActive_SortOrder",
                table: "ProjectCategories",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRoomDocuments_CreatedByUserId",
                table: "ProjectRoomDocuments",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRoomDocuments_ProjectId_CreatedAt",
                table: "ProjectRoomDocuments",
                columns: new[] { "ProjectId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRoomEntries_CreatedByUserId",
                table: "ProjectRoomEntries",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRoomEntries_ProjectId_CreatedAt",
                table: "ProjectRoomEntries",
                columns: new[] { "ProjectId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_CategoryId",
                table: "Projects",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_FounderId",
                table: "Projects",
                column: "FounderId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Slug",
                table: "Projects",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_AuthUserId",
                table: "RefreshTokens",
                column: "AuthUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReporterUserId_TargetType_TargetId",
                table: "Reports",
                columns: new[] { "ReporterUserId", "TargetType", "TargetId" },
                unique: true,
                filter: "[Status] = 'Pending'");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReporterUserId_TargetType_TargetId_Status",
                table: "Reports",
                columns: new[] { "ReporterUserId", "TargetType", "TargetId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReviewedByUserId",
                table: "Reports",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_Status_CreatedAt",
                table: "Reports",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ReputationRules_ActivityCode",
                table: "ReputationRules",
                column: "ActivityCode",
                unique: true,
                filter: "[ActivityCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ReputationRules_CreatedByUserId",
                table: "ReputationRules",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ReputationRules_RuleCode",
                table: "ReputationRules",
                column: "RuleCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReputationTransactions_CreatedByUserId",
                table: "ReputationTransactions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ReputationTransactions_ReputationRuleId",
                table: "ReputationTransactions",
                column: "ReputationRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_ReputationTransactions_UserId_ActivityCode_ReferenceType_ReferenceId",
                table: "ReputationTransactions",
                columns: new[] { "UserId", "ActivityCode", "ReferenceType", "ReferenceId" },
                unique: true,
                filter: "[ReferenceType] IS NOT NULL AND [ReferenceId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RiskLevels_Code",
                table: "RiskLevels",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RiskLevels_IsActive_SortOrder",
                table: "RiskLevels",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId_PermissionId",
                table: "RolePermissions",
                columns: new[] { "RoleId", "PermissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_GroupId_Name",
                table: "Roles",
                columns: new[] { "GroupId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_NormalizedName",
                table: "Roles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_RoleCode",
                table: "Roles",
                column: "RoleCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScoreTransactions_TransactionTypeId",
                table: "ScoreTransactions",
                column: "TransactionTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ScoreTransactions_UserId",
                table: "ScoreTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ServicePrices_ServiceCode",
                table: "ServicePrices",
                column: "ServiceCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StoredFiles_CategoryCode_EntityType_EntityId_IsDeleted",
                table: "StoredFiles",
                columns: new[] { "CategoryCode", "EntityType", "EntityId", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_StoredFiles_FileId",
                table: "StoredFiles",
                column: "FileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StoredFiles_ProjectId_IsDeleted",
                table: "StoredFiles",
                columns: new[] { "ProjectId", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_StoredFiles_UploadedByUserId_IsDeleted",
                table: "StoredFiles",
                columns: new[] { "UploadedByUserId", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_SupplierCode",
                table: "Suppliers",
                column: "SupplierCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ExchangeRateSnapshotId",
                table: "Transactions",
                column: "ExchangeRateSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_WalletId",
                table: "Transactions",
                column: "WalletId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_GroupId",
                table: "UserGroups",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_UserId_GroupId",
                table: "UserGroups",
                columns: new[] { "UserId", "GroupId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_IdempotencyKey",
                table: "UserNotifications",
                column: "IdempotencyKey",
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_NotificationId",
                table: "UserNotifications",
                column: "NotificationId");

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_TemplateId",
                table: "UserNotifications",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_UserId",
                table: "UserNotifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_UserId_CreatedAt",
                table: "UserNotifications",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_UserId_IsRead",
                table: "UserNotifications",
                columns: new[] { "UserId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_UserId",
                table: "UserProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserId_RoleId",
                table: "UserRoles",
                columns: new[] { "UserId", "RoleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_RefreshTokenHash",
                table: "UserSessions",
                column: "RefreshTokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_UserId",
                table: "UserSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_UserId_ExpiresAt",
                table: "UserSessions",
                columns: new[] { "UserId", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_UserVerification_UserId",
                table: "UserVerification",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_UserId",
                table: "Wallets",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransactions_ExchangeRateSnapshotId",
                table: "WalletTransactions",
                column: "ExchangeRateSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransactions_ReferenceId",
                table: "WalletTransactions",
                column: "ReferenceId");

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransactions_WalletId",
                table: "WalletTransactions",
                column: "WalletId");

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransactions_WalletId_ActionCode_ReferenceType_ReferenceId",
                table: "WalletTransactions",
                columns: new[] { "WalletId", "ActionCode", "ReferenceType", "ReferenceId" },
                unique: true,
                filter: "[ActionCode] IS NOT NULL AND [ReferenceId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransactions_WalletId_CreatedAt",
                table: "WalletTransactions",
                columns: new[] { "WalletId", "CreatedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Conversations_ConversationId",
                table: "ChatMessages",
                column: "ConversationId",
                principalTable: "Conversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ContractEvents_InvestmentContractVersions_ContractVersionId",
                table: "ContractEvents",
                column: "ContractVersionId",
                principalTable: "InvestmentContractVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversationParticipants_Conversations_ConversationId",
                table: "ConversationParticipants",
                column: "ConversationId",
                principalTable: "Conversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversationRequests_Conversations_AcceptedConversationId",
                table: "ConversationRequests",
                column: "AcceptedConversationId",
                principalTable: "Conversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConversationRequests_AuthUsers_RecipientUserId",
                table: "ConversationRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_ConversationRequests_AuthUsers_RequesterUserId",
                table: "ConversationRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_AuthUsers_FounderId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_AuthUsers_InvestorId",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Opportunities_AuthUsers_FounderId",
                table: "Opportunities");

            migrationBuilder.DropForeignKey(
                name: "FK_OpportunityJoinRequests_AuthUsers_InvestorId",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_OpportunityJoinRequests_AuthUsers_ReviewedByFounderId",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_AuthUsers_FounderId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_ConversationRequests_Conversations_AcceptedConversationId",
                table: "ConversationRequests");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "ClientProjectCategories");

            migrationBuilder.DropTable(
                name: "ClientStatusHistories");

            migrationBuilder.DropTable(
                name: "ContractEvents");

            migrationBuilder.DropTable(
                name: "ConversationParticipants");

            migrationBuilder.DropTable(
                name: "Countries");

            migrationBuilder.DropTable(
                name: "CreditPlanPurchases");

            migrationBuilder.DropTable(
                name: "CreditTransactions");

            migrationBuilder.DropTable(
                name: "Currencies");

            migrationBuilder.DropTable(
                name: "DeviceTokens");

            migrationBuilder.DropTable(
                name: "EmailHistory");

            migrationBuilder.DropTable(
                name: "EmailPreference");

            migrationBuilder.DropTable(
                name: "EmailVerificationOtps");

            migrationBuilder.DropTable(
                name: "EquityCapitalizationSnapshotHolders");

            migrationBuilder.DropTable(
                name: "EquityClosureSnapshots");

            migrationBuilder.DropTable(
                name: "EquityCorporateEventPositions");

            migrationBuilder.DropTable(
                name: "EquityDividendDistributionConfirmations");

            migrationBuilder.DropTable(
                name: "EquityHoldingLedgerEntries");

            migrationBuilder.DropTable(
                name: "EquityHoldingSnapshots");

            migrationBuilder.DropTable(
                name: "EquityTransfers");

            migrationBuilder.DropTable(
                name: "FileCategories");

            migrationBuilder.DropTable(
                name: "FileStoragePolicies");

            migrationBuilder.DropTable(
                name: "FinanceAttachments");

            migrationBuilder.DropTable(
                name: "FinanceAuditEvents");

            migrationBuilder.DropTable(
                name: "FinanceReconciliations");

            migrationBuilder.DropTable(
                name: "FinanceTransactionLines");

            migrationBuilder.DropTable(
                name: "FundingDeclarationLegAllocations");

            migrationBuilder.DropTable(
                name: "GroupPermissions");

            migrationBuilder.DropTable(
                name: "InvestmentEvents");

            migrationBuilder.DropTable(
                name: "InvestmentFavorites");

            migrationBuilder.DropTable(
                name: "InvestmentImages");

            migrationBuilder.DropTable(
                name: "InvestmentLearnMores");

            migrationBuilder.DropTable(
                name: "InvestmentParticipants");

            migrationBuilder.DropTable(
                name: "InvestmentRequests");

            migrationBuilder.DropTable(
                name: "InvestmentTeamMembers");

            migrationBuilder.DropTable(
                name: "InvestmentViews");

            migrationBuilder.DropTable(
                name: "LoanRepaymentAllocations");

            migrationBuilder.DropTable(
                name: "LoanRepaymentDeclarationInstallments");

            migrationBuilder.DropTable(
                name: "MessageAttachments");

            migrationBuilder.DropTable(
                name: "MessageReactions");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "OpportunityDocuments");

            migrationBuilder.DropTable(
                name: "OpportunityEvents");

            migrationBuilder.DropTable(
                name: "OpportunityMedia");

            migrationBuilder.DropTable(
                name: "OpportunityTagAssignments");

            migrationBuilder.DropTable(
                name: "ParticipationObligationConfirmations");

            migrationBuilder.DropTable(
                name: "PaymentAllocations");

            migrationBuilder.DropTable(
                name: "PendingAdminChanges");

            migrationBuilder.DropTable(
                name: "PricingRules");

            migrationBuilder.DropTable(
                name: "ProfileChangeAudits");

            migrationBuilder.DropTable(
                name: "ProfitSharingDistributionAllocations");

            migrationBuilder.DropTable(
                name: "ProjectRoomDocuments");

            migrationBuilder.DropTable(
                name: "ProjectRoomEntries");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "Reports");

            migrationBuilder.DropTable(
                name: "ReputationTransactions");

            migrationBuilder.DropTable(
                name: "RiskLevels");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "ScoreTransactions");

            migrationBuilder.DropTable(
                name: "ServicePrices");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "UserGroups");

            migrationBuilder.DropTable(
                name: "UserNotifications");

            migrationBuilder.DropTable(
                name: "UserProfiles");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "UserSessions");

            migrationBuilder.DropTable(
                name: "UserTokens");

            migrationBuilder.DropTable(
                name: "UserVerification");

            migrationBuilder.DropTable(
                name: "WalletTransactions");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "CreditPlans");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "EmailOutbox");

            migrationBuilder.DropTable(
                name: "EquityCapitalizationSnapshots");

            migrationBuilder.DropTable(
                name: "EquityDividendDistributionDeclarations");

            migrationBuilder.DropTable(
                name: "FinanceTransactions");

            migrationBuilder.DropTable(
                name: "FundingDeclarations");

            migrationBuilder.DropTable(
                name: "ApplicationPermissions");

            migrationBuilder.DropTable(
                name: "Investments");

            migrationBuilder.DropTable(
                name: "LoanRepaymentDeclarations");

            migrationBuilder.DropTable(
                name: "LoanRepaymentInstallments");

            migrationBuilder.DropTable(
                name: "ChatMessages");

            migrationBuilder.DropTable(
                name: "OpportunityTags");

            migrationBuilder.DropTable(
                name: "PaymentTransactions");

            migrationBuilder.DropTable(
                name: "ProfitSharingDistributionDeclarations");

            migrationBuilder.DropTable(
                name: "ReputationRules");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Lookups");

            migrationBuilder.DropTable(
                name: "NotificationTemplates");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Wallets");

            migrationBuilder.DropTable(
                name: "ClientStatuses");

            migrationBuilder.DropTable(
                name: "EquityCorporateEvents");

            migrationBuilder.DropTable(
                name: "EquityDividendEntitlements");

            migrationBuilder.DropTable(
                name: "ExpenseCategories");

            migrationBuilder.DropTable(
                name: "FinanceAccounts");

            migrationBuilder.DropTable(
                name: "IncomeCategories");

            migrationBuilder.DropTable(
                name: "Suppliers");

            migrationBuilder.DropTable(
                name: "LoanObligations");

            migrationBuilder.DropTable(
                name: "SupportSessions");

            migrationBuilder.DropTable(
                name: "ProfitSharingEntitlements");

            migrationBuilder.DropTable(
                name: "Groups");

            migrationBuilder.DropTable(
                name: "EquityDividendDeclarations");

            migrationBuilder.DropTable(
                name: "EquityPositions");

            migrationBuilder.DropTable(
                name: "ProfitSharingPeriodDeclarations");

            migrationBuilder.DropTable(
                name: "ProfitSharingReportingPeriods");

            migrationBuilder.DropTable(
                name: "StoredFiles");

            migrationBuilder.DropTable(
                name: "ProfitSharingObligations");

            migrationBuilder.DropTable(
                name: "InvestmentContractVersions");

            migrationBuilder.DropTable(
                name: "NegotiationOfferLegs");

            migrationBuilder.DropTable(
                name: "InvestmentContracts");

            migrationBuilder.DropTable(
                name: "NegotiationOffers");

            migrationBuilder.DropTable(
                name: "AuthUsers");

            migrationBuilder.DropTable(
                name: "Conversations");

            migrationBuilder.DropTable(
                name: "ConversationRequests");

            migrationBuilder.DropTable(
                name: "OpportunityJoinRequests");

            migrationBuilder.DropTable(
                name: "ExchangeRateSnapshots");

            migrationBuilder.DropTable(
                name: "Opportunities");

            migrationBuilder.DropTable(
                name: "FundingGoals");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "ProjectCategories");

            migrationBuilder.DropSequence(
                name: "RoleCodeSequence");
        }
    }
}
