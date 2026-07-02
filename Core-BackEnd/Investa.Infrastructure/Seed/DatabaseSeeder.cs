using Investa.Application.Common;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Investa.Infrastructure.Identity;

namespace Investa.Infrastructure.Seed;

/// <summary>
/// Comprehensive database seeder for Investa platform testing.
/// Generates realistic demo data for local, UI, mobile, workflow, and investment flow testing.
/// </summary>
public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher<AuthUser> _passwordHasher;
    private readonly UserManager<ApplicationIdentityUser> _userManager;
    private readonly RoleManager<ApplicationIdentityRole> _roleManager;
    private readonly Dictionary<string, Guid> _userIds = new();
    private readonly Dictionary<string, int> _investmentIds = new();

    public DatabaseSeeder(
        ApplicationDbContext context,
        IPasswordHasher<AuthUser> passwordHasher,
        UserManager<ApplicationIdentityUser> userManager,
        RoleManager<ApplicationIdentityRole> roleManager)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    /// <summary>
    /// Seeds the database with comprehensive demo data.
    /// </summary>
    public async Task SeedAsync()
    {
        Console.WriteLine("🌱 Starting database seeding...");

        await DeleteDemoUsersAsync();
        await SeedUsersAsync();
        await SeedOpportunitiesAsync();
        await SeedParticipationsAsync();
        await SeedWatchlistsAsync();
        await SeedActivitiesAsync();
        await SeedNotificationsAsync();

        Console.WriteLine("✅ Database seeding completed successfully!");
    }

    /// <summary>
    /// Deletes all demo/test users and their related data.
    /// </summary>
    private async Task DeleteDemoUsersAsync()
    {
        Console.WriteLine("🗑️  Deleting demo users...");

        // Demo user emails
        var demoEmails = Enumerable.Range(92, 20)
            .Select(i => $"user{i}@investa.test")
            .ToArray();

        var deletedCount = 0;

        foreach (var email in demoEmails)
        {
            var user = await _context.AuthUsers
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user != null)
            {
                Console.WriteLine($"Deleting user: {email}...");

                // Delete related data first (due to foreign key constraints)
                var userId = user.Id;
                var userIdString = userId.ToString();

                // Delete notifications
                var notifications = await _context.UserNotifications
                    .Where(n => n.UserId == userIdString)
                    .ToListAsync();
                if (notifications.Any())
                {
                    _context.UserNotifications.RemoveRange(notifications);
                }

                // Delete investment favorites
                var favorites = await _context.InvestmentFavorites
                    .Where(f => f.InvestorId == userId)
                    .ToListAsync();
                if (favorites.Any())
                {
                    _context.InvestmentFavorites.RemoveRange(favorites);
                }

                // Delete investment participants
                var participants = await _context.InvestmentParticipants
                    .Where(p => p.InvestorId == userId)
                    .ToListAsync();
                if (participants.Any())
                {
                    _context.InvestmentParticipants.RemoveRange(participants);
                }

                // Delete investment requests
                var requests = await _context.InvestmentRequests
                    .Where(r => r.InvestorId == userId || r.FounderId == userId)
                    .ToListAsync();
                if (requests.Any())
                {
                    _context.InvestmentRequests.RemoveRange(requests);
                }

                // Delete investment team members
                var teamMembers = await _context.InvestmentTeamMembers
                    .Where(tm => tm.UserId == userId)
                    .ToListAsync();
                if (teamMembers.Any())
                {
                    _context.InvestmentTeamMembers.RemoveRange(teamMembers);
                }

                // Delete user profile
                var profile = await _context.UserProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);
                if (profile != null)
                {
                    _context.UserProfiles.Remove(profile);
                }

                // Delete investments created by this user
                var investments = await _context.Investments
                    .Where(i => i.FounderId == userId)
                    .ToListAsync();
                if (investments.Any())
                {
                    // Delete investment events for these investments
                    foreach (var investment in investments)
                    {
                        var events = await _context.InvestmentEvents
                            .Where(e => e.InvestmentId == investment.Id)
                            .ToListAsync();
                        if (events.Any())
                        {
                            _context.InvestmentEvents.RemoveRange(events);
                        }
                    }

                    _context.Investments.RemoveRange(investments);
                }

                // Delete credit transactions (must be removed before deleting AuthUsers due to FK constraint)
                var creditTransactions = await _context.CreditTransactions
                    .Where(ct => ct.UserId == userId)
                    .ToListAsync();
                if (creditTransactions.Any())
                {
                    _context.CreditTransactions.RemoveRange(creditTransactions);
                }

                // Delete the user
                _context.AuthUsers.Remove(user);

                // Delete from AspNetUsers (Identity) table
                var identityUser = await _userManager.FindByIdAsync(userId.ToString());
                if (identityUser != null)
                {
                    await _userManager.DeleteAsync(identityUser);
                }

                await _context.SaveChangesAsync();
                deletedCount++;
                Console.WriteLine($"✅ Deleted {email}");
            }
        }

        if (deletedCount > 0)
        {
            Console.WriteLine($"✅ Deleted {deletedCount} demo users successfully");
        }
        else
        {
            Console.WriteLine("No demo users found to delete");
        }
    }

    /// <summary>
    /// Seeds users: 20 demo clients + 1 admin.
    /// Demo client phone numbers: 01022322291 to 01022322310.
    /// Demo client password: P@ss0rd.
    /// </summary>
    private async Task SeedUsersAsync()
    {
        Console.WriteLine("👤 Seeding users...");

        // Admin user
        var adminUser = await GetOrCreateUserAsync(
            email: "admin@investa.com",
            name: "System Administrator",
            phone: "+201000000000",
            password: "P@ssw0rd",
            userType: UserType.OrgUser,
            clientType: ClientType.Investor,
            trustLevel: TrustLevel.TrustedActive,
            reputationScore: 10000,
            activityScore: 10000,
            verificationTrustScore: 100
        );
        await EnsureAdminAuthorizationRoleAsync(adminUser, "admin@investa.com", "P@ssw0rd");
        _userIds["admin"] = adminUser.Id;

        // Demo client users with phone numbers 01022322291 to 01022322310.
        var testUserData = new[]
        {
            new { Phone = "01022322291", Name = "Ahmed Elmasry", Email = "user92@investa.test", Type = ClientType.Founder, Role = "Trusted Founder", RepScore = 8500, ActScore = 7200, Trust = TrustLevel.TrustedActive, Gender = "Male", City = "Cairo", BirthDate = new DateTime(1988, 3, 14) },
            new { Phone = "01022322292", Name = "Mariam Hassan", Email = "user93@investa.test", Type = ClientType.Founder, Role = "Active Founder", RepScore = 6200, ActScore = 5800, Trust = TrustLevel.Interactive, Gender = "Female", City = "Alexandria", BirthDate = new DateTime(1991, 7, 22) },
            new { Phone = "01022322293", Name = "Omar Abdelrahman", Email = "user94@investa.test", Type = ClientType.Founder, Role = "Rising Founder", RepScore = 3800, ActScore = 3200, Trust = TrustLevel.Interactive, Gender = "Male", City = "Giza", BirthDate = new DateTime(1990, 11, 5) },
            new { Phone = "01022322294", Name = "Nourhan Ali", Email = "user95@investa.test", Type = ClientType.Founder, Role = "Emerging Founder", RepScore = 2100, ActScore = 1800, Trust = TrustLevel.Registered, Gender = "Female", City = "Mansoura", BirthDate = new DateTime(1994, 2, 18) },
            new { Phone = "01022322295", Name = "Khaled Ibrahim", Email = "user96@investa.test", Type = ClientType.Investor, Role = "Active Partner", RepScore = 7800, ActScore = 6900, Trust = TrustLevel.TrustedActive, Gender = "Male", City = "Cairo", BirthDate = new DateTime(1985, 9, 9) },
            new { Phone = "01022322296", Name = "Layla Mahmoud", Email = "user97@investa.test", Type = ClientType.Investor, Role = "Top Contributor", RepScore = 9200, ActScore = 8500, Trust = TrustLevel.TrustedActive, Gender = "Female", City = "Tanta", BirthDate = new DateTime(1989, 4, 27) },
            new { Phone = "01022322297", Name = "Youssef Ali", Email = "user98@investa.test", Type = ClientType.Investor, Role = "Rising Partner", RepScore = 4500, ActScore = 4100, Trust = TrustLevel.Interactive, Gender = "Male", City = "Zagazig", BirthDate = new DateTime(1993, 6, 12) },
            new { Phone = "01022322298", Name = "Farida Hassan", Email = "user99@investa.test", Type = ClientType.Investor, Role = "New Partner", RepScore = 1200, ActScore = 900, Trust = TrustLevel.Registered, Gender = "Female", City = "Cairo", BirthDate = new DateTime(1996, 1, 30) },
            new { Phone = "01022322299", Name = "Mahmoud Fathy", Email = "user100@investa.test", Type = ClientType.Founder, Role = "FoodTech Founder", RepScore = 5600, ActScore = 4700, Trust = TrustLevel.Interactive, Gender = "Male", City = "Port Said", BirthDate = new DateTime(1987, 12, 3) },
            new { Phone = "01022322300", Name = "Salma Mostafa", Email = "user101@investa.test", Type = ClientType.Investor, Role = "Angel Partner", RepScore = 7100, ActScore = 6400, Trust = TrustLevel.TrustedActive, Gender = "Female", City = "Cairo", BirthDate = new DateTime(1992, 8, 16) },
            new { Phone = "01022322301", Name = "Hossam Nabil", Email = "user102@investa.test", Type = ClientType.Founder, Role = "Logistics Founder", RepScore = 4900, ActScore = 4300, Trust = TrustLevel.Interactive, Gender = "Male", City = "Ismailia", BirthDate = new DateTime(1986, 5, 7) },
            new { Phone = "01022322302", Name = "Rana Tarek", Email = "user103@investa.test", Type = ClientType.Investor, Role = "Growth Partner", RepScore = 6600, ActScore = 6100, Trust = TrustLevel.Interactive, Gender = "Female", City = "Alexandria", BirthDate = new DateTime(1995, 10, 21) },
            new { Phone = "01022322303", Name = "Mostafa Salem", Email = "user104@investa.test", Type = ClientType.Founder, Role = "HealthTech Founder", RepScore = 7300, ActScore = 6500, Trust = TrustLevel.TrustedActive, Gender = "Male", City = "Assiut", BirthDate = new DateTime(1984, 2, 2) },
            new { Phone = "01022322304", Name = "Yasmin Adel", Email = "user105@investa.test", Type = ClientType.Investor, Role = "Strategic Partner", RepScore = 5800, ActScore = 5200, Trust = TrustLevel.Interactive, Gender = "Female", City = "Cairo", BirthDate = new DateTime(1990, 3, 28) },
            new { Phone = "01022322305", Name = "Karim Fouad", Email = "user106@investa.test", Type = ClientType.Founder, Role = "SaaS Founder", RepScore = 8100, ActScore = 7600, Trust = TrustLevel.TrustedActive, Gender = "Male", City = "Giza", BirthDate = new DateTime(1983, 7, 11) },
            new { Phone = "01022322306", Name = "Dina Samy", Email = "user107@investa.test", Type = ClientType.Investor, Role = "Portfolio Partner", RepScore = 3400, ActScore = 3000, Trust = TrustLevel.Registered, Gender = "Female", City = "Mansoura", BirthDate = new DateTime(1997, 9, 19) },
            new { Phone = "01022322307", Name = "Hany Rashad", Email = "user108@investa.test", Type = ClientType.Founder, Role = "AgriTech Founder", RepScore = 5300, ActScore = 4800, Trust = TrustLevel.Interactive, Gender = "Male", City = "Fayoum", BirthDate = new DateTime(1989, 6, 4) },
            new { Phone = "01022322308", Name = "Mai Gaber", Email = "user109@investa.test", Type = ClientType.Investor, Role = "Fintech Partner", RepScore = 6900, ActScore = 6200, Trust = TrustLevel.TrustedActive, Gender = "Female", City = "Cairo", BirthDate = new DateTime(1991, 12, 25) },
            new { Phone = "01022322309", Name = "Amr Elshazly", Email = "user110@investa.test", Type = ClientType.Founder, Role = "Manufacturing Founder", RepScore = 4700, ActScore = 3900, Trust = TrustLevel.Interactive, Gender = "Male", City = "Suez", BirthDate = new DateTime(1982, 1, 13) },
            new { Phone = "01022322310", Name = "Menna Ashraf", Email = "user111@investa.test", Type = ClientType.Investor, Role = "Retail Partner", RepScore = 2500, ActScore = 2100, Trust = TrustLevel.Registered, Gender = "Female", City = "Alexandria", BirthDate = new DateTime(1998, 5, 8) }
        };

        for (int i = 0; i < testUserData.Length; i++)
        {
            var userData = testUserData[i];
            var userKey = $"user{i + 92}";
            
            var user = await GetOrCreateUserAsync(
                email: userData.Email,
                name: userData.Name,
                phone: userData.Phone,
                password: "P@ss0rd",
                userType: UserType.Client,
                clientType: userData.Type,
                trustLevel: userData.Trust,
                reputationScore: userData.RepScore,
                activityScore: userData.ActScore,
                verificationTrustScore: userData.Trust == TrustLevel.TrustedActive ? 85 : (userData.Trust == TrustLevel.Interactive ? 60 : 30)
            );

            // Create user profile
            await GetOrCreateUserProfileAsync(
                user.Id,
                userData.Name,
                userData.Email,
                userData.Phone,
                userData.Role,
                userData.Gender,
                userData.City,
                userData.BirthDate);

            _userIds[userKey] = user.Id;
        }

        Console.WriteLine($"Seeded {testUserData.Length} demo clients and 1 admin user");
    }

    /// <summary>
    /// Seeds investment opportunities across all types (Equity, Revenue Sharing, Loan)
    /// </summary>
    private async Task SeedOpportunitiesAsync()
    {
        Console.WriteLine("💼 Seeding investment opportunities...");

        // Equity Opportunities
        var equityOpportunities = new[]
        {
            new {
                Name = "TechVenture AI Solutions",
                Description = "Revolutionary AI-powered business intelligence platform for SMEs",
                Founder = "user92",
                Type = InvestmentType.Equity,
                Status = "Active",
                Valuation = 2500000m,
                EquityOffered = 15m,
                TargetFund = 375000m,
                SharePrice = 25m,
                TotalShares = 100000,
                AvailableShares = 85000,
                MinInvestment = 1000m,
                MaxInvestment = 50000m,
                CurrentValuation = 2500000m,
                EstimatedFutureValuation = 10000000m,
                ExitType = EquityExitType.IPO,
                ExitTargetDate = DateTime.UtcNow.AddYears(5),
                ExitStrategy = "Planned IPO on NASDAQ after reaching $10M ARR",
                Momentum = 8500,
                PublicActivity = 25,
                ParticipantActivity = 12
            },
            new {
                Name = "GreenEnergy Solar Farms",
                Description = "Large-scale solar energy infrastructure across MENA region",
                Founder = "user93",
                Type = InvestmentType.Equity,
                Status = "Reviewing",
                Valuation = 5000000m,
                EquityOffered = 20m,
                TargetFund = 1000000m,
                SharePrice = 50m,
                TotalShares = 100000,
                AvailableShares = 80000,
                MinInvestment = 5000m,
                MaxInvestment = 100000m,
                CurrentValuation = 5000000m,
                EstimatedFutureValuation = 25000000m,
                ExitType = EquityExitType.Acquisition,
                ExitTargetDate = DateTime.UtcNow.AddYears(4),
                ExitStrategy = "Strategic acquisition by major energy conglomerate",
                Momentum = 6200,
                PublicActivity = 18,
                ParticipantActivity = 8
            },
            new {
                Name = "MedTech Diagnostics Platform",
                Description = "AI-powered medical diagnostics for early disease detection",
                Founder = "user94",
                Type = InvestmentType.Equity,
                Status = "In Progress",
                Valuation = 1800000m,
                EquityOffered = 12m,
                TargetFund = 216000m,
                SharePrice = 18m,
                TotalShares = 100000,
                AvailableShares = 88000,
                MinInvestment = 500m,
                MaxInvestment = 30000m,
                CurrentValuation = 1800000m,
                EstimatedFutureValuation = 8000000m,
                ExitType = EquityExitType.SecondaryShareSale,
                ExitTargetDate = DateTime.UtcNow.AddYears(6),
                ExitStrategy = "Secondary market sale to institutional investors",
                Momentum = 3800,
                PublicActivity = 12,
                ParticipantActivity = 5
            }
        };

        // Revenue Sharing Opportunities
        var revenueOpportunities = new[]
        {
            new {
                Name = "E-commerce Revenue Share",
                Description = "Profit-sharing from established online retail platform",
                Founder = "user95",
                Type = InvestmentType.RevenueSharing,
                Status = "Fully Funded",
                RevenueShare = 8m,
                ContractDuration = 36,
                ExpectedROI = 18m,
                TargetFund = 500000m,
                ContractStartDate = DateTime.UtcNow.AddMonths(-6),
                ContractEndDate = DateTime.UtcNow.AddMonths(30),
                TotalExpectedPayout = 600000m,
                RemainingPayout = 450000m,
                DistributionFrequency = "Quarterly",
                CompletionStatus = "In Progress",
                Momentum = 7200,
                PublicActivity = 20,
                ParticipantActivity = 15
            },
            new {
                Name = "SaaS Subscription Revenue",
                Description = "Revenue sharing from B2B SaaS platform with recurring revenue",
                Founder = "user92",
                Type = InvestmentType.RevenueSharing,
                Status = "Active",
                RevenueShare = 10m,
                ContractDuration = 48,
                ExpectedROI = 22m,
                TargetFund = 750000m,
                ContractStartDate = DateTime.UtcNow.AddMonths(-3),
                ContractEndDate = DateTime.UtcNow.AddMonths(45),
                TotalExpectedPayout = 900000m,
                RemainingPayout = 875000m,
                DistributionFrequency = "Monthly",
                CompletionStatus = "Active",
                Momentum = 5800,
                PublicActivity = 15,
                ParticipantActivity = 10
            }
        };

        // Loan Opportunities
        var loanOpportunities = new[]
        {
            new {
                Name = "Business Expansion Loan",
                Description = "Working capital loan for manufacturing business expansion",
                Founder = "user93",
                Type = InvestmentType.Loan,
                Status = "Active",
                InterestRate = 12m,
                RepaymentDuration = 24,
                TargetFund = 300000m,
                RepaymentStartDate = DateTime.UtcNow.AddMonths(6),
                FinalRepaymentDate = DateTime.UtcNow.AddMonths(30),
                RemainingBalance = 300000m,
                TotalPaid = 0m,
                DefaultRisk = "Low",
                CompletionStatus = "Active",
                Momentum = 4100,
                PublicActivity = 10,
                ParticipantActivity = 6
            },
            new {
                Name = "Equipment Financing Loan",
                Description = "Loan for purchasing industrial equipment and machinery",
                Founder = "user94",
                Type = InvestmentType.Loan,
                Status = "Completed",
                InterestRate = 10m,
                RepaymentDuration = 18,
                TargetFund = 200000m,
                RepaymentStartDate = DateTime.UtcNow.AddMonths(-12),
                FinalRepaymentDate = DateTime.UtcNow.AddMonths(6),
                RemainingBalance = 25000m,
                TotalPaid = 175000m,
                DefaultRisk = "Low",
                CompletionStatus = "Near Completion",
                Momentum = 2900,
                PublicActivity = 8,
                ParticipantActivity = 4
            }
        };

        // Seed Equity Opportunities
        foreach (var opp in equityOpportunities)
        {
            var investment = await CreateInvestmentAsync(
                opp.Name, opp.Description, opp.Founder, opp.Type, opp.Status,
                opp.TargetFund, opp.Momentum, opp.PublicActivity, opp.ParticipantActivity,
                opp.SharePrice, opp.TotalShares, opp.AvailableShares,
                opp.MinInvestment, opp.MaxInvestment, opp.Valuation,
                opp.CurrentValuation, opp.EstimatedFutureValuation,
                opp.ExitType, opp.ExitTargetDate, opp.ExitStrategy
            );
            _investmentIds[$"equity_{opp.Name.Replace(" ", "_")}"] = investment.Id;
        }

        // Seed Revenue Sharing Opportunities
        foreach (var opp in revenueOpportunities)
        {
            var investment = await CreateInvestmentAsync(
                opp.Name, opp.Description, opp.Founder, opp.Type, opp.Status,
                opp.TargetFund, opp.Momentum, opp.PublicActivity, opp.ParticipantActivity,
                ExpectedROI: opp.ExpectedROI,
                ContractStartDate: opp.ContractStartDate,
                ContractEndDate: opp.ContractEndDate,
                TotalExpectedPayout: opp.TotalExpectedPayout,
                RemainingPayout: opp.RemainingPayout,
                DistributionFrequency: opp.DistributionFrequency,
                CompletionStatus: opp.CompletionStatus
            );
            _investmentIds[$"revenue_{opp.Name.Replace(" ", "_")}"] = investment.Id;
        }

        // Seed Loan Opportunities
        foreach (var opp in loanOpportunities)
        {
            var investment = await CreateInvestmentAsync(
                opp.Name, opp.Description, opp.Founder, opp.Type, opp.Status,
                opp.TargetFund, opp.Momentum, opp.PublicActivity, opp.ParticipantActivity,
                InterestRate: opp.InterestRate,
                RepaymentStartDate: opp.RepaymentStartDate,
                FinalRepaymentDate: opp.FinalRepaymentDate,
                RemainingBalance: opp.RemainingBalance,
                TotalPaid: opp.TotalPaid,
                DefaultRisk: opp.DefaultRisk,
                CompletionStatus: opp.CompletionStatus
            );
            _investmentIds[$"loan_{opp.Name.Replace(" ", "_")}"] = investment.Id;
        }

        Console.WriteLine($"✅ Seeded {equityOpportunities.Length + revenueOpportunities.Length + loanOpportunities.Length} investment opportunities");
    }

    /// <summary>
    /// Seeds participation data (requests, approved participants)
    /// </summary>
    private async Task SeedParticipationsAsync()
    {
        Console.WriteLine("🤝 Seeding participation data...");

        // Create investment requests
        var requests = new[]
        {
            new { Investment = "equity_TechVenture_AI_Solutions", Investor = "user96", Amount = 25000m, Shares = 1000, Status = InvestmentRequestStatus.Accepted },
            new { Investment = "equity_TechVenture_AI_Solutions", Investor = "user97", Amount = 50000m, Shares = 2000, Status = InvestmentRequestStatus.Accepted },
            new { Investment = "equity_TechVenture_AI_Solutions", Investor = "user98", Amount = 10000m, Shares = 400, Status = InvestmentRequestStatus.Pending },
            new { Investment = "equity_GreenEnergy_Solar_Farms", Investor = "user97", Amount = 75000m, Shares = 1500, Status = InvestmentRequestStatus.Pending },
            new { Investment = "equity_MedTech_Diagnostics_Platform", Investor = "user96", Amount = 15000m, Shares = 833, Status = InvestmentRequestStatus.Accepted },
            new { Investment = "revenue_E-commerce_Revenue_Share", Investor = "user98", Amount = 50000m, Shares = 0, Status = InvestmentRequestStatus.Accepted },
            new { Investment = "revenue_SaaS_Subscription_Revenue", Investor = "user99", Amount = 25000m, Shares = 0, Status = InvestmentRequestStatus.Pending },
            new { Investment = "loan_Business_Expansion_Loan", Investor = "user96", Amount = 100000m, Shares = 0, Status = InvestmentRequestStatus.Accepted }
        };

        foreach (var req in requests)
        {
            await CreateInvestmentRequestAsync((req.Investment, req.Investor, req.Amount, req.Shares, req.Status));
        }

        // Create approved participants
        var participants = new[]
        {
            new { Investment = "equity_TechVenture_AI_Solutions", Investor = "user96", Amount = 25000m, Shares = 1000, Status = "Participated" },
            new { Investment = "equity_TechVenture_AI_Solutions", Investor = "user97", Amount = 50000m, Shares = 2000, Status = "Participated" },
            new { Investment = "equity_MedTech_Diagnostics_Platform", Investor = "user96", Amount = 15000m, Shares = 833, Status = "Participated" },
            new { Investment = "revenue_E-commerce_Revenue_Share", Investor = "user98", Amount = 50000m, Shares = 0, Status = "Participated" },
            new { Investment = "loan_Business_Expansion_Loan", Investor = "user96", Amount = 100000m, Shares = 0, Status = "Participated" }
        };

        foreach (var part in participants)
        {
            await CreateInvestmentParticipantAsync((part.Investment, part.Investor, part.Amount, part.Shares, part.Status));
        }

        Console.WriteLine($"✅ Seeded {requests.Length} requests and {participants.Length} participants");
    }

    /// <summary>
    /// Seeds watchlist data (saved opportunities for partners)
    /// </summary>
    private async Task SeedWatchlistsAsync()
    {
        Console.WriteLine("⭐ Seeding watchlist data...");

        var watchlistItems = new[]
        {
            new { Investor = "user96", Investment = "equity_GreenEnergy_Solar_Farms" },
            new { Investor = "user96", Investment = "revenue_SaaS_Subscription_Revenue" },
            new { Investor = "user97", Investment = "equity_MedTech_Diagnostics_Platform" },
            new { Investor = "user97", Investment = "loan_Equipment_Financing_Loan" },
            new { Investor = "user98", Investment = "equity_TechVenture_AI_Solutions" },
            new { Investor = "user98", Investment = "revenue_E-commerce_Revenue_Share" },
            new { Investor = "user99", Investment = "equity_GreenEnergy_Solar_Farms" },
            new { Investor = "user99", Investment = "equity_TechVenture_AI_Solutions" }
        };

        foreach (var item in watchlistItems)
        {
            await CreateInvestmentFavoriteAsync((item.Investor, item.Investment));
        }

        Console.WriteLine($"✅ Seeded {watchlistItems.Length} watchlist items");
    }

    /// <summary>
    /// Seeds activity data (opportunity events, user activities)
    /// </summary>
    private async Task SeedActivitiesAsync()
    {
        Console.WriteLine("📊 Seeding activity data...");

        // Create investment events (timeline activities)
        var events = new[]
        {
            new { Investment = "equity_TechVenture_AI_Solutions", Type = "StatusUpdated", Visibility = "Public", Payload = JsonSerializer.Serialize(new { oldStatus = "Draft", newStatus = "Active" }), CreatedBy = "user92" },
            new { Investment = "equity_TechVenture_AI_Solutions", Type = "ParticipantAdded", Visibility = "Public", Payload = JsonSerializer.Serialize(new { participantName = "Khalid Ibrahim", amount = 25000 }), CreatedBy = "user92" },
            new { Investment = "equity_TechVenture_AI_Solutions", Type = "MilestoneReached", Visibility = "Public", Payload = JsonSerializer.Serialize(new { milestone = "50% Funding Target Reached", date = DateTime.UtcNow.AddDays(-10) }), CreatedBy = "user92" },
            new { Investment = "equity_GreenEnergy_Solar_Farms", Type = "StatusUpdated", Visibility = "Public", Payload = JsonSerializer.Serialize(new { oldStatus = "Active", newStatus = "Reviewing Participants" }), CreatedBy = "user93" },
            new { Investment = "equity_MedTech_Diagnostics_Platform", Type = "StatusUpdated", Visibility = "Public", Payload = JsonSerializer.Serialize(new { oldStatus = "Draft", newStatus = "In Progress" }), CreatedBy = "user94" },
            new { Investment = "revenue_E-commerce_Revenue_Share", Type = "PayoutDistributed", Visibility = "ParticipantOnly", Payload = JsonSerializer.Serialize(new { amount = 15000, date = DateTime.UtcNow.AddDays(-5) }), CreatedBy = "user95" },
            new { Investment = "loan_Business_Expansion_Loan", Type = "RepaymentMade", Visibility = "ParticipantOnly", Payload = JsonSerializer.Serialize(new { amount = 25000, date = DateTime.UtcNow.AddDays(-15) }), CreatedBy = "user93" }
        };

        foreach (var evt in events)
        {
            await CreateInvestmentEventAsync((evt.Investment, evt.Type, evt.Visibility, evt.Payload, evt.CreatedBy));
        }

        Console.WriteLine($"✅ Seeded {events.Length} activity events");
    }

    /// <summary>
    /// Seeds notification data
    /// </summary>
    private async Task SeedNotificationsAsync()
    {
        Console.WriteLine("🔔 Seeding notification data...");

        var notifications = new[]
        {
            new { User = "user96", Title = "Investment Request Approved", Body = "Your investment request for TechVenture AI Solutions has been approved.", Type = "success", ActionUrl = "/opportunities/1" },
            new { User = "user97", Title = "New Opportunity Available", Body = "GreenEnergy Solar Farms is now accepting investments.", Type = "info", ActionUrl = "/opportunities/2" },
            new { User = "user98", Title = "Payout Received", Body = "You received a revenue share payout of $2,500 from E-commerce Revenue Share.", Type = "success", ActionUrl = "/wallet" },
            new { User = "user96", Title = "Milestone Achieved", Body = "TechVenture AI Solutions has reached 50% of funding target.", Type = "info", ActionUrl = "/opportunities/1/timeline" },
            new { User = "user99", Title = "Welcome to Investa", Body = "Thank you for joining Investa. Complete your profile to unlock all features.", Type = "info", ActionUrl = "/profile" }
        };

        foreach (var notif in notifications)
        {
            await CreateUserNotificationAsync((notif.User, notif.Title, notif.Body, notif.Type, notif.ActionUrl));
        }

        Console.WriteLine($"✅ Seeded {notifications.Length} notifications");
    }

    #region Helper Methods

private async Task<AuthUser> GetOrCreateUserAsync(
        string email,
        string name,
        string? phone,
        string password,
        UserType userType,
        ClientType clientType,
        TrustLevel trustLevel,
        int reputationScore,
        int activityScore,
        int verificationTrustScore)
    {
string? normalizedPhone = null;
        if (!string.IsNullOrWhiteSpace(phone))
        {
            normalizedPhone = PhoneNumberNormalizer.NormalizePhoneNumber(phone) ?? phone.Trim();
        }

        var existingUser = await _context.AuthUsers
            .FirstOrDefaultAsync(u => u.Email == email || (normalizedPhone != null && u.FirebaseUid == normalizedPhone));

        if (existingUser != null)
        {
            if (IsSeededDemoPhone(normalizedPhone))
            {
                await ResetDemoUserPasswordAsync(existingUser, normalizedPhone!, email, password);
            }

            return existingUser;
        }

        var identityUserName = userType == UserType.Client && normalizedPhone != null ? normalizedPhone : email;

// Create user in AspNetUsers (Identity) table for login
        var identityUser = new ApplicationIdentityUser
        {
            Id = Guid.NewGuid(),
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            UserName = identityUserName,
            NormalizedUserName = identityUserName.ToUpperInvariant(),
            PhoneNumber = normalizedPhone,
            PhoneNumberConfirmed = normalizedPhone != null,
            EmailConfirmed = true,
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString()
        };
        identityUser.PasswordHash = new PasswordHasher<ApplicationIdentityUser>().HashPassword(identityUser, password);

        _context.Users.Add(identityUser);
        await _context.SaveChangesAsync();

        var authUser = new AuthUser
        {
            Id = Guid.Parse(identityUser.Id.ToString()),
            Name = name,
            Email = email,
            PasswordHash = identityUser.PasswordHash,
            UserType = userType,
            ClientType = clientType,
            Status = true,
            FirebaseUid = normalizedPhone,
            CreatedAt = DateTime.UtcNow,
            WalletBalance = userType == UserType.Client ? 100000m : 0m,
            CredibilityScore = 3500,
            VerificationTrustScore = verificationTrustScore,
            TrustLevel = trustLevel,
            ReputationScore = reputationScore,
            ReputationLevel = GetReputationLevel(reputationScore),
            ActivityScore = activityScore,
            ProfileCompletionPercentage = userType == UserType.Client ? 85 : 0,
            IsPhoneVerified = normalizedPhone != null,
            IsEmailVerified = true
        };

        _context.AuthUsers.Add(authUser);
        await _context.SaveChangesAsync();

        return authUser;
    }

    private async Task ResetDemoUserPasswordAsync(AuthUser existingUser, string normalizedPhone, string email, string password)
    {
        var identityUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == existingUser.Id);
        if (identityUser == null)
        {
            identityUser = new ApplicationIdentityUser
            {
                Id = existingUser.Id,
                Email = email,
                NormalizedEmail = email.ToUpperInvariant(),
                UserName = normalizedPhone,
                NormalizedUserName = normalizedPhone.ToUpperInvariant(),
                PhoneNumber = normalizedPhone,
                PhoneNumberConfirmed = true,
                EmailConfirmed = true
            };

            _context.Users.Add(identityUser);
        }
        else
        {
            identityUser.Email = email;
            identityUser.NormalizedEmail = email.ToUpperInvariant();
            identityUser.UserName = normalizedPhone;
            identityUser.NormalizedUserName = normalizedPhone.ToUpperInvariant();
            identityUser.PhoneNumber = normalizedPhone;
            identityUser.PhoneNumberConfirmed = true;
            identityUser.EmailConfirmed = true;
        }

        identityUser.SecurityStamp = Guid.NewGuid().ToString();
        identityUser.ConcurrencyStamp = Guid.NewGuid().ToString();
        identityUser.PasswordHash = new PasswordHasher<ApplicationIdentityUser>().HashPassword(identityUser, password);

        existingUser.Email = email;
        existingUser.FirebaseUid = normalizedPhone;
        existingUser.PasswordHash = identityUser.PasswordHash;
        existingUser.IsPhoneVerified = true;
        existingUser.IsEmailVerified = true;

        await _context.SaveChangesAsync();
        Console.WriteLine($"Reset password for demo user: {email}");
    }

    private async Task EnsureAdminAuthorizationRoleAsync(AuthUser adminUser, string email, string password)
    {
        const string adminRoleName = "Admin";

        if (!await _roleManager.RoleExistsAsync(adminRoleName))
        {
            var role = new ApplicationIdentityRole
            {
                Name = adminRoleName,
                NormalizedName = adminRoleName.ToUpperInvariant()
            };

            var roleResult = await _roleManager.CreateAsync(role);
            if (!roleResult.Succeeded)
            {
                var roleErrors = string.Join("; ", roleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to create admin role: {roleErrors}");
            }
        }

        var identityUser = await _userManager.FindByIdAsync(adminUser.Id.ToString())
            ?? await _userManager.FindByEmailAsync(email);

        if (identityUser == null)
        {
            throw new InvalidOperationException($"Could not resolve identity user for seeded admin {email}");
        }

        if (!await _userManager.IsInRoleAsync(identityUser, adminRoleName))
        {
            var addRoleResult = await _userManager.AddToRoleAsync(identityUser, adminRoleName);
            if (!addRoleResult.Succeeded)
            {
                var roleErrors = string.Join("; ", addRoleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to assign admin role to {email}: {roleErrors}");
            }
        }

        if (!string.IsNullOrWhiteSpace(password))
        {
            var passwordHasher = new PasswordHasher<ApplicationIdentityUser>();
            identityUser.PasswordHash = passwordHasher.HashPassword(identityUser, password);
            await _userManager.UpdateAsync(identityUser);
        }

        Console.WriteLine($"Assigned role '{adminRoleName}' to seeded admin user: {email}");
    }

    private static bool IsSeededDemoPhone(string? normalizedPhone)
    {
        if (string.IsNullOrWhiteSpace(normalizedPhone))
            return false;

        for (var i = 291; i <= 310; i++)
        {
            if (normalizedPhone == $"+201022322{i}")
                return true;
        }

        return false;
    }

    private async Task<UserProfile> GetOrCreateUserProfileAsync(
        Guid userId,
        string name,
        string email,
        string? phone,
        string role,
        string gender,
        string city,
        DateTime birthDate)
    {
        var existingProfile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (existingProfile != null)
        {
            return existingProfile;
        }

        string? normalizedPhone = null;
        if (!string.IsNullOrWhiteSpace(phone))
        {
            normalizedPhone = PhoneNumberNormalizer.NormalizePhoneNumber(phone) ?? phone.Trim();
        }

        var profile = new UserProfile
        {
            UserId = userId,
            FullName = name,
            FirstName = name.Split(' ')[0],
            LastName = name.Split(' ').Length > 1 ? string.Join(" ", name.Split(' ').Skip(1)) : "",
            Email = email,
            Phone1 = normalizedPhone,
            Gender = gender,
            DateOfBirth = birthDate,
            Country = "Egypt",
            City = city,
            Bio = $"Experienced {role} with a proven track record in the investment ecosystem.",
            BusinessRole = role,
            LinkedInUrl = $"https://linkedin.com/in/{name.Replace(" ", "").ToLower()}",
            AvatarUrl = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(name)}&background=random",
            VerificationStatus = VerificationStatus.Verified,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync();

        return profile;
    }

    private static string GetReputationLevel(int reputationScore)
    {
        return reputationScore switch
        {
            >= 8500 => "Elite Member",
            >= 6500 => "Trusted Member",
            >= 3500 => "Rising Member",
            _ => "New Member"
        };
    }

    private async Task<Investment> CreateInvestmentAsync(
        string Name, string Description, string Founder, InvestmentType Type, string Status,
        decimal TargetFund, int Momentum, int PublicActivity, int ParticipantActivity,
        decimal? SharePrice = null, int? TotalShares = null, int? AvailableShares = null,
        decimal? MinInvestment = null, decimal? MaxInvestment = null, decimal? Valuation = null,
        decimal? CurrentValuation = null, decimal? EstimatedFutureValuation = null,
        EquityExitType? ExitType = null, DateTime? ExitTargetDate = null, string? ExitStrategy = null,
        decimal? ExpectedROI = null, decimal? RevenueShare = null, int? ContractDuration = null,
        DateTime? ContractStartDate = null, DateTime? ContractEndDate = null,
        decimal? TotalExpectedPayout = null, decimal? RemainingPayout = null,
        string? DistributionFrequency = null, string? CompletionStatus = null,
        decimal? InterestRate = null, int? RepaymentDuration = null,
        DateTime? RepaymentStartDate = null, DateTime? FinalRepaymentDate = null,
        decimal? RemainingBalance = null, decimal? TotalPaid = null, string? DefaultRisk = null)
    {
        var founderId = _userIds[Founder];
        
        var investment = new Investment
        {
            FounderId = founderId,
            InitialCapital = TargetFund * 0.1m,
            Date = DateTime.UtcNow.AddDays(-30),
            BusinessName = Name,
            Description = Description,
            InvestmentTypeId = Type,
            Status = Status,
            TargetFund = TargetFund,
            MomentumScore = Momentum,
            LastActivityAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 10)),
            PublicActivityCount = PublicActivity,
            ParticipantOnlyActivityCount = ParticipantActivity,
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow.AddDays(90)
        };

        // Type-specific fields
        if (Type == InvestmentType.Equity)
        {
            investment.SharePrice = SharePrice;
            investment.TotalShares = TotalShares;
            investment.AvailableShares = AvailableShares;
            investment.MinInvestment = MinInvestment;
            investment.MaxInvestment = MaxInvestment;
            investment.ValuationCap = Valuation;
            investment.CurrentValuation = CurrentValuation;
            investment.EstimatedFutureValuation = EstimatedFutureValuation;
            investment.EquityExitType = ExitType;
            investment.ExitTargetDate = ExitTargetDate;
            investment.ExpectedExitStrategy = ExitStrategy;
        }
        else if (Type == InvestmentType.RevenueSharing)
        {
            investment.ExpectedROI = ExpectedROI;
            investment.ContractStartDate = ContractStartDate;
            investment.ContractEndDate = ContractEndDate;
            investment.TotalExpectedPayout = TotalExpectedPayout;
            investment.RemainingPayoutAmount = RemainingPayout;
            investment.RevenueDistributionFrequency = DistributionFrequency;
            investment.ContractCompletionStatus = CompletionStatus;
        }
        else if (Type == InvestmentType.Loan)
        {
            investment.ExpectedROI = InterestRate;
            investment.RepaymentStartDate = RepaymentStartDate;
            investment.FinalRepaymentDate = FinalRepaymentDate;
            investment.RemainingBalance = RemainingBalance;
            investment.TotalPaidAmount = TotalPaid;
            investment.DefaultRiskLevel = DefaultRisk;
            investment.LoanCompletionStatus = CompletionStatus;
        }

        _context.Investments.Add(investment);
        await _context.SaveChangesAsync();

        return investment;
    }

    private async Task CreateInvestmentRequestAsync((string Investment, string Investor, decimal Amount, int Shares, InvestmentRequestStatus Status) req)
    {
        var investmentId = _investmentIds[req.Investment];
        var investorId = _userIds[req.Investor];
        var founderId = _context.Investments.First(i => i.Id == investmentId).FounderId;

        var request = new InvestmentRequest
        {
            InvestmentId = investmentId,
            InvestorId = investorId,
            FounderId = founderId,
            Amount = req.Amount,
            Shares = req.Shares,
            Status = req.Status,
            Direction = InvestmentRequestDirection.Outgoing,
            RequestType = "investment_request",
            CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 20))
        };

        _context.InvestmentRequests.Add(request);
        await _context.SaveChangesAsync();
    }

    private async Task CreateInvestmentParticipantAsync((string Investment, string Investor, decimal Amount, int Shares, string Status) part)
    {
        var investmentId = _investmentIds[part.Investment];
        var investorId = _userIds[part.Investor];

        var participant = new InvestmentParticipant
        {
            InvestmentId = investmentId,
            InvestorId = investorId,
            SharesPurchased = part.Shares,
            AmountInvested = part.Amount,
            InvestmentDate = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30)),
            Status = Enum.Parse<ParticipationLifecycle>(part.Status),
            IsAnonymous = false,
            CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30))
        };

        _context.InvestmentParticipants.Add(participant);
        await _context.SaveChangesAsync();
    }

    private async Task CreateInvestmentFavoriteAsync((string Investor, string Investment) item)
    {
        var investmentId = _investmentIds[item.Investment];
        var investorId = _userIds[item.Investor];

        var existing = await _context.InvestmentFavorites
            .FirstOrDefaultAsync(f => f.InvestorId == investorId && f.InvestmentId == investmentId);

        if (existing == null)
        {
            var favorite = new InvestmentFavorite
            {
                InvestorId = investorId,
                InvestmentId = investmentId,
                CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 15))
            };

            _context.InvestmentFavorites.Add(favorite);
            await _context.SaveChangesAsync();
        }
    }

    private async Task CreateInvestmentEventAsync((string Investment, string Type, string Visibility, string Payload, string CreatedBy) evt)
    {
        var investmentId = _investmentIds[evt.Investment];
        var createdById = _userIds.ContainsKey(evt.CreatedBy) ? _userIds[evt.CreatedBy] : (Guid?)null;

        var version = Random.Shared.Next(1000, 9999);
        var retryCount = 0;
        while (retryCount < 10)
        {
            var existingWithVersion = await _context.InvestmentEvents
                .AnyAsync(e => e.InvestmentId == investmentId && e.Version == version);

            if (!existingWithVersion)
                break;

            version = Random.Shared.Next(1000, 9999);
            retryCount++;
        }

        var investmentEvent = new InvestmentEvent
        {
            InvestmentId = investmentId,
            EventType = evt.Type,
            Visibility = evt.Visibility,
            Payload = evt.Payload,
            OccurredAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30)),
            CreatedBy = createdById,
            Version = version
        };

        _context.InvestmentEvents.Add(investmentEvent);
        await _context.SaveChangesAsync();
    }

    private async Task CreateUserNotificationAsync((string User, string Title, string Body, string Type, string ActionUrl) notif)
    {
        var userId = _userIds[notif.User].ToString();

        var notification = new UserNotification
        {
            UserId = userId,
            Title = notif.Title,
            Body = notif.Body,
            Type = notif.Type,
            ActionUrl = notif.ActionUrl,
            IsRead = false,
            CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 7))
        };

        _context.UserNotifications.Add(notification);
        await _context.SaveChangesAsync();
    }

    #endregion
}
