using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConsolidatedInitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApplicationPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResourceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                        principalColumn: "Id");
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
                    EntityType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Changes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    UserType = table.Column<int>(type: "int", nullable: false),
                    ClientType = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    FirebaseUid = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    SuspendedUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WalletBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CredibilityScore = table.Column<int>(type: "int", nullable: false),
                    TrustLevel = table.Column<int>(type: "int", nullable: false),
                    ReputationScore = table.Column<int>(type: "int", nullable: false),
                    ProfileCompletionPercentage = table.Column<int>(type: "int", nullable: false),
                    IsPhoneVerified = table.Column<bool>(type: "bit", nullable: false),
                    IsEmailVerified = table.Column<bool>(type: "bit", nullable: false),
                    RiskFlags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BusinessCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ValueAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessCategories", x => x.Id);
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
                name: "Conversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserMobile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdminEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CreditConfigurations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FromDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditConfigurations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CreditPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Credits = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
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
                name: "Groups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
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
                name: "NotificationTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleTemplate = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    BodyTemplate = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    PlaceholderDocs = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProfileChangeAudits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FieldName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OldValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChangedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileChangeAudits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SupportSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserMobile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    UnreadCount = table.Column<int>(type: "int", nullable: false)
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
                name: "Investments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FounderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InitialCapital = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SharePrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalShares = table.Column<int>(type: "int", nullable: true),
                    AvailableShares = table.Column<int>(type: "int", nullable: true),
                    MinInvestment = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxInvestment = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ValuationCap = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ExpectedROI = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    InvestmentTypeId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Draft"),
                    BusinessName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    VideoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    BusinessStageId = table.Column<int>(type: "int", nullable: true),
                    BusinessCategoryId = table.Column<int>(type: "int", nullable: true),
                    ProjectPhaseId = table.Column<int>(type: "int", nullable: true),
                    TargetFund = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Milestone = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RiskLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DurationMonths = table.Column<int>(type: "int", nullable: true),
                    ProfitPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    PayoutFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CurrentValuation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    EstimatedFutureValuation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    EquityExitType = table.Column<int>(type: "int", nullable: true),
                    ExitTargetDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpectedExitStrategy = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ContractStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ContractEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TotalExpectedPayout = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    RemainingPayoutAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    RevenueDistributionFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContractCompletionStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RepaymentStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FinalRepaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RemainingBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalPaidAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    NextInstallmentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DefaultRiskLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    LoanCompletionStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Investments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Investments_AuthUsers_FounderId",
                        column: x => x.FounderId,
                        principalTable: "AuthUsers",
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
                    Revoked = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WalletId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_AuthUsers_WalletId",
                        column: x => x.WalletId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                    CurrentCredibilityScore = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LastLoginIP = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    RegistrationIP = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    DeviceInfo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LastLoginDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    RefreshTokenHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeviceFingerprint = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    Score = table.Column<decimal>(type: "decimal(9,2)", nullable: false),
                    Credit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MessageText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    SupportSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatMessages_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id");
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
                    IsMuted = table.Column<bool>(type: "bit", nullable: false),
                    JoinedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConversationParticipants", x => new { x.ConversationId, x.UserId });
                    table.ForeignKey(
                        name: "FK_ConversationParticipants_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
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
                    Credits = table.Column<int>(type: "int", nullable: false),
                    PricePaid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
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
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NormalizedName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    Score = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TransactionTypeId = table.Column<int>(type: "int", nullable: false),
                    ReviewerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScoreTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScoreTransactions_AuthUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScoreTransactions_Lookups_TransactionTypeId",
                        column: x => x.TransactionTypeId,
                        principalTable: "Lookups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserNotifications",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    TemplateId = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    ActionUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserNotifications_NotificationTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "NotificationTemplates",
                        principalColumn: "Id");
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
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SupportSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MessageText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false)
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
                name: "InvestmentEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Payload = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                });

            migrationBuilder.CreateTable(
                name: "InvestmentImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvestmentId = table.Column<int>(type: "int", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Caption = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentImages_Investments_InvestmentId",
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
                    AmountInvested = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InvestmentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsAnonymous = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvestmentParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvestmentParticipants_AuthUsers_InvestorId",
                        column: x => x.InvestorId,
                        principalTable: "AuthUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Shares = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Direction = table.Column<int>(type: "int", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvestmentTeamMembers_Investments_InvestmentId",
                        column: x => x.InvestmentId,
                        principalTable: "Investments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientBusinessCategories",
                columns: table => new
                {
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    BusinessCategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientBusinessCategories", x => new { x.ClientId, x.BusinessCategoryId });
                    table.ForeignKey(
                        name: "FK_ClientBusinessCategories_BusinessCategories_BusinessCategoryId",
                        column: x => x.BusinessCategoryId,
                        principalTable: "BusinessCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClientBusinessCategories_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    JustificationAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    JustificationEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                        onDelete: ReferentialAction.SetNull);
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
                name: "MessageAttachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MessageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoragePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    Reaction = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                name: "RolePermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
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

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationPermissions_ParentPermissionId",
                table: "ApplicationPermissions",
                column: "ParentPermissionId");

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
                name: "IX_ChatMessages_ConversationId",
                table: "ChatMessages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientBusinessCategories_BusinessCategoryId",
                table: "ClientBusinessCategories",
                column: "BusinessCategoryId");

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
                name: "IX_GroupPermissions_ApplicationPermissionId",
                table: "GroupPermissions",
                column: "ApplicationPermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupPermissions_GroupId",
                table: "GroupPermissions",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupPermissions_PermissionId",
                table: "GroupPermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentEvents_InvestmentId",
                table: "InvestmentEvents",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentFavorites_InvestmentId",
                table: "InvestmentFavorites",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentFavorites_InvestorId",
                table: "InvestmentFavorites",
                column: "InvestorId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentImages_InvestmentId",
                table: "InvestmentImages",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentParticipants_InvestmentId",
                table: "InvestmentParticipants",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentParticipants_InvestorId",
                table: "InvestmentParticipants",
                column: "InvestorId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentRequests_InvestmentId",
                table: "InvestmentRequests",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Investments_FounderId",
                table: "Investments",
                column: "FounderId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentTeamMembers_InvestmentId",
                table: "InvestmentTeamMembers",
                column: "InvestmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentTeamMembers_UserId",
                table: "InvestmentTeamMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageAttachments_MessageId",
                table: "MessageAttachments",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SupportSessionId",
                table: "Messages",
                column: "SupportSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_AuthUserId",
                table: "RefreshTokens",
                column: "AuthUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId",
                table: "RolePermissions",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_GroupId",
                table: "Roles",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ScoreTransactions_TransactionTypeId",
                table: "ScoreTransactions",
                column: "TransactionTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ScoreTransactions_UserId",
                table: "ScoreTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_WalletId",
                table: "Transactions",
                column: "WalletId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_GroupId",
                table: "UserGroups",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_UserId",
                table: "UserGroups",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_TemplateId",
                table: "UserNotifications",
                column: "TemplateId");

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
                name: "IX_UserRoles_UserId",
                table: "UserRoles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_UserId",
                table: "UserSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserVerification_UserId",
                table: "UserVerification",
                column: "UserId");

            // ── Seed Data ─────────────────────────────────────────────────────────────

            migrationBuilder.Sql(@"
-- BusinessCategories (IDENTITY column - explicit IDs)
SET IDENTITY_INSERT [BusinessCategories] ON;
IF NOT EXISTS (SELECT 1 FROM BusinessCategories WHERE Id = 100)
    INSERT INTO BusinessCategories (Id, [Key], [Value], ValueAr, SortOrder, CreatedAt)
    VALUES (100, 'Technology', 'Technology', N'تكنولوجيا', 1, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM BusinessCategories WHERE Id = 101)
    INSERT INTO BusinessCategories (Id, [Key], [Value], ValueAr, SortOrder, CreatedAt)
    VALUES (101, 'Industry', 'Industry', N'صناعة', 2, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM BusinessCategories WHERE Id = 102)
    INSERT INTO BusinessCategories (Id, [Key], [Value], ValueAr, SortOrder, CreatedAt)
    VALUES (102, 'Trading', 'Trading', N'تجارة', 3, GETUTCDATE());
SET IDENTITY_INSERT [BusinessCategories] OFF;

-- ClientStatuses (IDENTITY column - explicit IDs)
SET IDENTITY_INSERT [ClientStatuses] ON;
IF NOT EXISTS (SELECT 1 FROM ClientStatuses WHERE Id = 1)
    INSERT INTO ClientStatuses (Id, NameEn, NameAr) VALUES (1, 'Active', N'نشط');
IF NOT EXISTS (SELECT 1 FROM ClientStatuses WHERE Id = 2)
    INSERT INTO ClientStatuses (Id, NameEn, NameAr) VALUES (2, 'Diactive', N'غير نشط');
IF NOT EXISTS (SELECT 1 FROM ClientStatuses WHERE Id = 3)
    INSERT INTO ClientStatuses (Id, NameEn, NameAr) VALUES (3, 'Suspended', N'معلق');
SET IDENTITY_INSERT [ClientStatuses] OFF;

-- Lookups (IDENTITY column - explicit IDs)
SET IDENTITY_INSERT [Lookups] ON;
-- Type 1: Business Stage
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 1)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (1, 1, 'Idea', 'Idea', N'فكرة', 1);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 2)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (2, 1, 'MVP', 'MVP', N'نموذج أولي', 2);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 3)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (3, 1, 'Startup', 'Startup', N'شركة ناشئة', 3);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 4)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (4, 1, 'Running', 'Running', N'قيد التشغيل', 4);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 5)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (5, 1, 'Expanding', 'Expanding', N'توسع', 5);
-- Type 2: Business Category
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 100)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (100, 2, 'Technology', 'Technology', N'تكنولوجيا', 1);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 101)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (101, 2, 'Industry', 'Industry', N'صناعة', 2);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 102)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (102, 2, 'Trading', 'Trading', N'تجارة', 3);
-- Type 3: Project Phase
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 6)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (6, 3, 'Initiation', 'Initiation', N'البدء', 1);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 7)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (7, 3, 'Planning', 'Planning', N'التخطيط', 2);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 8)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (8, 3, 'Execution', 'Execution', N'التنفيذ', 3);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 9)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (9, 3, 'Testing', 'Testing', N'الاختبار', 4);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 10)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (10, 3, 'Launching', 'Launching', N'الإطلاق', 5);
-- Type 4: Risk Level
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 11)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (11, 4, 'Low', 'Low', N'منخفض', 1);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 12)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (12, 4, 'Medium', 'Medium', N'متوسط', 2);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 13)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (13, 4, 'High', 'High', N'مرتفع', 3);
-- Type 20: Score Transaction Types
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 200)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (200, 20, 'Review', 'Review', N'مراجعة', 1);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 201)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (201, 20, 'Interactive', 'Interactive', N'تفاعل', 2);
IF NOT EXISTS (SELECT 1 FROM Lookups WHERE Id = 202)
    INSERT INTO Lookups (Id, [Type], [Key], [Value], ValueAr, SortOrder) VALUES (202, 20, 'Deal', 'Deal', N'صفقة', 3);
SET IDENTITY_INSERT [Lookups] OFF;

-- Groups (IDENTITY column - explicit IDs)
SET IDENTITY_INSERT [Groups] ON;
IF NOT EXISTS (SELECT 1 FROM Groups WHERE Id = 1000)
    INSERT INTO Groups (Id, [Name], [Description], IsActive, CreatedAt)
    VALUES (1000, 'Org_Admin', 'Organization administrator - full access', 1, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM Groups WHERE Id = 1001)
    INSERT INTO Groups (Id, [Name], [Description], IsActive, CreatedAt)
    VALUES (1001, 'Admin', 'Admin with elevated privileges', 1, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM Groups WHERE Id = 1002)
    INSERT INTO Groups (Id, [Name], [Description], IsActive, CreatedAt)
    VALUES (1002, 'Manager', 'Manager with limited admin privileges', 1, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM Groups WHERE Id = 1003)
    INSERT INTO Groups (Id, [Name], [Description], IsActive, CreatedAt)
    VALUES (1003, 'Viewer', 'Read-only admin', 1, GETUTCDATE());
SET IDENTITY_INSERT [Groups] OFF;

-- Permissions (IDENTITY column - explicit IDs)
SET IDENTITY_INSERT [Permissions] ON;
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE Id = 2000)
    INSERT INTO Permissions (Id, [Key], [Name], [Description], CreatedAt)
    VALUES (2000, 'admin.clients.read', 'Read Clients', 'Read client records', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE Id = 2001)
    INSERT INTO Permissions (Id, [Key], [Name], [Description], CreatedAt)
    VALUES (2001, 'admin.clients.manage', 'Manage Clients', 'Create/update/delete clients', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE Id = 2002)
    INSERT INTO Permissions (Id, [Key], [Name], [Description], CreatedAt)
    VALUES (2002, 'admin.categories.manage', 'Manage Categories', 'CRUD categories', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE Id = 2003)
    INSERT INTO Permissions (Id, [Key], [Name], [Description], CreatedAt)
    VALUES (2003, 'admin.groups.manage', 'Manage Groups', 'Manage groups and assignments', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE Id = 2004)
    INSERT INTO Permissions (Id, [Key], [Name], [Description], CreatedAt)
    VALUES (2004, 'admin.lookups.manage', 'Manage Lookups', 'Manage lookup values', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE Id = 2005)
    INSERT INTO Permissions (Id, [Key], [Name], [Description], CreatedAt)
    VALUES (2005, 'admin.dev.manage', 'Dev Tools', 'Development utility endpoints', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE Id = 2006)
    INSERT INTO Permissions (Id, [Key], [Name], [Description], CreatedAt)
    VALUES (2006, 'RBAC.View', 'View RBAC', 'View groups, roles, and permission assignments', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE Id = 2007)
    INSERT INTO Permissions (Id, [Key], [Name], [Description], CreatedAt)
    VALUES (2007, 'Group.Manage', 'Manage Groups', 'Create, update, delete groups and assign group permissions', GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE Id = 2008)
    INSERT INTO Permissions (Id, [Key], [Name], [Description], CreatedAt)
    VALUES (2008, 'Role.Manage', 'Manage Roles', 'Create, update, delete roles and assign role permissions/users', GETUTCDATE());
SET IDENTITY_INSERT [Permissions] OFF;

-- GroupPermissions - Org_Admin gets all permissions (IDENTITY column)
SET IDENTITY_INSERT [GroupPermissions] ON;
IF NOT EXISTS (SELECT 1 FROM GroupPermissions WHERE Id = 1)
    INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt) VALUES (1, 1000, 2000, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM GroupPermissions WHERE Id = 2)
    INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt) VALUES (2, 1000, 2001, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM GroupPermissions WHERE Id = 3)
    INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt) VALUES (3, 1000, 2002, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM GroupPermissions WHERE Id = 4)
    INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt) VALUES (4, 1000, 2003, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM GroupPermissions WHERE Id = 5)
    INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt) VALUES (5, 1000, 2004, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM GroupPermissions WHERE Id = 6)
    INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt) VALUES (6, 1000, 2005, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM GroupPermissions WHERE Id = 7)
    INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt) VALUES (7, 1000, 2006, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM GroupPermissions WHERE Id = 8)
    INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt) VALUES (8, 1000, 2007, GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM GroupPermissions WHERE Id = 9)
    INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt) VALUES (9, 1000, 2008, GETUTCDATE());
SET IDENTITY_INSERT [GroupPermissions] OFF;

-- Demo AuthUsers (Guid PK - no IDENTITY_INSERT needed)
IF NOT EXISTS (SELECT 1 FROM AuthUsers WHERE Id = '11111111-1111-1111-1111-111111111111')
    INSERT INTO AuthUsers (Id, [Name], Email, PasswordHash, UserType, ClientType, [Status], CreatedAt,
                           WalletBalance, CredibilityScore, TrustLevel, ReputationScore,
                           ProfileCompletionPercentage, IsPhoneVerified, IsEmailVerified)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Alice Founder', 'alice.founder@example.com',
            'DEMO_HASH_NOT_FOR_PRODUCTION', 1, 1, 1, GETUTCDATE(), 100000.00, 4200, 0, 0, 0, 0, 0);

IF NOT EXISTS (SELECT 1 FROM AuthUsers WHERE Id = '22222222-2222-2222-2222-222222222222')
    INSERT INTO AuthUsers (Id, [Name], Email, PasswordHash, UserType, ClientType, [Status], CreatedAt,
                           WalletBalance, CredibilityScore, TrustLevel, ReputationScore,
                           ProfileCompletionPercentage, IsPhoneVerified, IsEmailVerified)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Bob Investor', 'bob.investor@example.com',
            'DEMO_HASH_NOT_FOR_PRODUCTION', 1, 0, 1, GETUTCDATE(), 25000.00, 3750, 0, 0, 0, 0, 0);

IF NOT EXISTS (SELECT 1 FROM AuthUsers WHERE Id = '33333333-3333-3333-3333-333333333333')
    INSERT INTO AuthUsers (Id, [Name], Email, PasswordHash, UserType, ClientType, [Status], CreatedAt,
                           WalletBalance, CredibilityScore, TrustLevel, ReputationScore,
                           ProfileCompletionPercentage, IsPhoneVerified, IsEmailVerified)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Clara Investor', 'clara.investor@example.com',
            'DEMO_HASH_NOT_FOR_PRODUCTION', 1, 0, 1, GETUTCDATE(), 15000.00, 3600, 0, 0, 0, 0, 0);
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                name: "ClientBusinessCategories");

            migrationBuilder.DropTable(
                name: "ClientStatusHistories");

            migrationBuilder.DropTable(
                name: "ConversationParticipants");

            migrationBuilder.DropTable(
                name: "CreditConfigurations");

            migrationBuilder.DropTable(
                name: "CreditPlanPurchases");

            migrationBuilder.DropTable(
                name: "CreditTransactions");

            migrationBuilder.DropTable(
                name: "GroupPermissions");

            migrationBuilder.DropTable(
                name: "InvestmentEvents");

            migrationBuilder.DropTable(
                name: "InvestmentFavorites");

            migrationBuilder.DropTable(
                name: "InvestmentImages");

            migrationBuilder.DropTable(
                name: "InvestmentParticipants");

            migrationBuilder.DropTable(
                name: "InvestmentRequests");

            migrationBuilder.DropTable(
                name: "InvestmentTeamMembers");

            migrationBuilder.DropTable(
                name: "MessageAttachments");

            migrationBuilder.DropTable(
                name: "MessageReactions");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "ProfileChangeAudits");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "ScoreTransactions");

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
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "BusinessCategories");

            migrationBuilder.DropTable(
                name: "CreditPlans");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "ApplicationPermissions");

            migrationBuilder.DropTable(
                name: "Investments");

            migrationBuilder.DropTable(
                name: "ChatMessages");

            migrationBuilder.DropTable(
                name: "SupportSessions");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Lookups");

            migrationBuilder.DropTable(
                name: "NotificationTemplates");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "ClientStatuses");

            migrationBuilder.DropTable(
                name: "AuthUsers");

            migrationBuilder.DropTable(
                name: "Conversations");

            migrationBuilder.DropTable(
                name: "Groups");
        }
    }
}
