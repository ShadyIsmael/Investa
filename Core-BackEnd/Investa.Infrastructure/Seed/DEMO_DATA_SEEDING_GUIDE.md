# Investa Demo Data Seeding Guide

This guide provides comprehensive documentation for the Investa platform demo data seeding system.

## Overview

The demo data seeder generates realistic testing data across the entire Investa ecosystem to support:
- Local testing
- UI testing (Angular Portal, React Admin)
- Mobile testing (Founder Flutter App, Partner Flutter App)
- Workflow validation
- Investment flow testing
- Reputation system testing
- Momentum system testing
- Notification testing

## Seeded Data Summary

### Users (9 Total)

#### Admin User
- **Email**: `admin@investa.com`
- **Password**: `P@ssw0rd`
- **User Type**: OrgUser (Internal Staff)
- **Trust Level**: Verified
- **Reputation Level**: Platform Administrator
- **Permissions**: Full platform access, all roles

#### Test Users (8 Users)

| Phone | Name | Email | Type | Role | Trust Level | Reputation |
|-------|------|-------|------|------|-------------|------------|
| 01022322292 | Ahmed Mohamed | user92@investa.test | Founder | Trusted Founder | Verified | 8500 |
| 01022322293 | Sara Ali | user93@investa.test | Founder | Active Founder | Established | 6200 |
| 01022322294 | Omar Hassan | user94@investa.test | Founder | Rising Founder | Established | 3800 |
| 01022322295 | Fatima Ahmed | user95@investa.test | Founder | Emerging Founder | Registered | 2100 |
| 01022322296 | Khalid Ibrahim | user96@investa.test | Investor | Active Partner | Verified | 7800 |
| 01022322297 | Layla Mahmoud | user97@investa.test | Investor | Top Contributor | Verified | 9200 |
| 01022322298 | Youssef Ali | user98@investa.test | Investor | Rising Partner | Established | 4500 |
| 01022322299 | Nour Hassan | user99@investa.test | Investor | New Partner | Registered | 1200 |

**All test users use the same password**: `P@ssw0rd`

### Investment Opportunities (8 Total)

#### Equity Opportunities (3)

1. **TechVenture AI Solutions**
   - Type: Equity
   - Status: Active
   - Valuation: $2,500,000
   - Equity Offered: 15%
   - Funding Target: $375,000
   - Share Price: $25
   - Total Shares: 100,000
   - Available Shares: 85,000
   - Min Investment: $1,000
   - Max Investment: $50,000
   - Exit Strategy: IPO on NASDAQ
   - Momentum Score: 8500

2. **GreenEnergy Solar Farms**
   - Type: Equity
   - Status: Reviewing Participants
   - Valuation: $5,000,000
   - Equity Offered: 20%
   - Funding Target: $1,000,000
   - Share Price: $50
   - Total Shares: 100,000
   - Available Shares: 80,000
   - Min Investment: $5,000
   - Max Investment: $100,000
   - Exit Strategy: Strategic acquisition
   - Momentum Score: 6200

3. **MedTech Diagnostics Platform**
   - Type: Equity
   - Status: In Progress
   - Valuation: $1,800,000
   - Equity Offered: 12%
   - Funding Target: $216,000
   - Share Price: $18
   - Total Shares: 100,000
   - Available Shares: 88,000
   - Min Investment: $500
   - Max Investment: $30,000
   - Exit Strategy: Secondary market sale
   - Momentum Score: 3800

#### Revenue Sharing Opportunities (2)

1. **E-commerce Revenue Share**
   - Type: Revenue Sharing
   - Status: Fully Funded
   - Revenue Share: 8%
   - Contract Duration: 36 months
   - Expected ROI: 18%
   - Funding Target: $500,000
   - Distribution Frequency: Quarterly
   - Momentum Score: 7200

2. **SaaS Subscription Revenue**
   - Type: Revenue Sharing
   - Status: Active
   - Revenue Share: 10%
   - Contract Duration: 48 months
   - Expected ROI: 22%
   - Funding Target: $750,000
   - Distribution Frequency: Monthly
   - Momentum Score: 5800

#### Loan Opportunities (2)

1. **Business Expansion Loan**
   - Type: Loan
   - Status: Active
   - Interest Rate: 12%
   - Repayment Duration: 24 months
   - Funding Target: $300,000
   - Default Risk: Low
   - Momentum Score: 4100

2. **Equipment Financing Loan**
   - Type: Loan
   - Status: Completed
   - Interest Rate: 10%
   - Repayment Duration: 18 months
   - Funding Target: $200,000
   - Default Risk: Low
   - Momentum Score: 2900

### Participation Data

- **Investment Requests**: 8 (mix of Pending, Approved)
- **Approved Participants**: 5
- **Watchlist Items**: 8

### Activity Data

- **Investment Events**: 7 (timeline activities including status updates, milestones, payouts)
- **User Notifications**: 5 (investment approvals, new opportunities, payouts)

### Momentum & Reputation Distribution

The seeded data includes realistic momentum and reputation distribution:

- **High Momentum** (7000-8500): TechVenture AI, E-commerce Revenue Share
- **Medium Momentum** (5000-7000): GreenEnergy Solar, SaaS Revenue
- **Low Momentum** (2000-5000): MedTech Diagnostics, Business Expansion Loan

- **Trusted Users** (Reputation 8000+): Ahmed Mohamed, Layla Mahmoud
- **Active Users** (Reputation 6000-7999): Sara Ali, Khalid Ibrahim
- **Rising Users** (Reputation 3000-5999): Omar Hassan, Youssef Ali
- **New Users** (Reputation <3000): Fatima Ahmed, Nour Hassan

## Installation & Setup

### Prerequisites

1. Database must be created and migrations applied
2. EF Core must be properly configured
3. ApplicationDbContext must be registered in DI container

### Step 1: Register Seeder Service

Add the following line to `Program.cs` after other service registrations:

```csharp
builder.Services.AddDatabaseSeeder();
```

### Step 2: Run Seeder on Startup

Add the following code to `Program.cs` after `var app = builder.Build();`:

```csharp
// Seed database with demo data
await app.SeedDatabaseAsync();
```

**Note**: The `Program.cs` file in this project appears to be corrupted (contains null bytes). You may need to:
1. Restore the file from version control
2. Manually add the seeder registration
3. Or run the seeder manually using the code below

### Alternative: Manual Seeder Execution

If you cannot modify `Program.cs`, create a temporary console application or use the following code in a controller endpoint:

```csharp
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    await seeder.SeedAsync();
}
```

## Running the Seeder

### Automatic Seeding

The seeder runs automatically on application startup when properly registered in `Program.cs`.

### Manual Seeding

To run the seeder manually:

1. Build the solution
2. Run the application
3. The seeder will execute during startup

### Re-seeding

The seeder includes idempotency checks to prevent duplicate data:
- Users are checked by email or phone number
- Opportunities are not re-created if they exist
- Watchlist items are checked for duplicates

To completely reset and re-seed:

1. Drop the database: `dotnet ef database drop --force`
2. Re-create migrations: `dotnet ef database update`
3. Run the application (seeder will execute)

## Data Validation

After seeding, verify the following:

### User Accounts
- [ ] All 9 users can log in with password `P@ssw0rd`
- [ ] Admin user has full platform access
- [ ] Test users have appropriate client types (Founder/Investor)

### Opportunities
- [ ] 8 opportunities display correctly in dashboards
- [ ] Equity opportunities show share prices and valuations
- [ ] Revenue sharing opportunities show contract details
- [ ] Loan opportunities show repayment schedules

### User Profiles
- [ ] User profiles are populated with realistic data
- [ ] Profile images display correctly
- [ ] LinkedIn URLs are valid
- [ ] Profile completion percentages are set

### Momentum & Reputation
- [ ] Momentum scores vary across opportunities
- [ ] Reputation levels differ between users
- [ ] Trust levels are appropriate
- [ ] Activity scores reflect user engagement

### Participations
- [ ] Investment requests show correct status
- [ ] Approved participants are listed
- [ ] Watchlist items display for partners

### Activities & Notifications
- [ ] Timeline activities show for opportunities
- [ ] Notifications appear for users
- [ ] Activity counts are accurate

## Testing Scenarios

### Flutter Founder App Testing

Use the following test accounts:

**Founder Accounts**:
- Phone: 01022322292 (Ahmed Mohamed - Trusted Founder)
- Phone: 01022322293 (Sara Ali - Active Founder)
- Phone: 01022322294 (Omar Hassan - Rising Founder)
- Phone: 01022322295 (Fatima Ahmed - Emerging Founder)

**Test Scenarios**:
- Create new investment opportunity
- Update opportunity status
- Respond to investment requests
- View participant list
- Add team members
- Post timeline updates

### Flutter Partner App Testing

Use the following test accounts:

**Partner Accounts**:
- Phone: 01022322296 (Khalid Ibrahim - Active Partner)
- Phone: 01022322297 (Layla Mahmoud - Top Contributor)
- Phone: 01022322298 (Youssef Ali - Rising Partner)
- Phone: 01022322299 (Nour Hassan - New Partner)

**Test Scenarios**:
- Browse opportunities
- Send investment requests
- View watchlist
- Add to watchlist
- View notifications
- Check investment portfolio

### Angular Portal Testing

Use the admin account:
- Email: admin@investa.com
- Password: P@ssw0rd

**Test Scenarios**:
- View all users
- Manage opportunities
- Review investment requests
- Access audit logs
- Configure platform settings

### React Admin Testing

Use the admin account:
- Email: admin@investa.com
- Password: P@ssw0rd

**Test Scenarios**:
- Dashboard analytics
- User management
- Opportunity moderation
- Revenue tracking
- System monitoring

## File Structure

```
Investa.Infrastructure/
└── Seed/
    ├── DatabaseSeeder.cs              # Main seeder class
    ├── ServiceCollectionExtensions.cs  # Service registration
    └── DEMO_DATA_SEEDING_GUIDE.md     # This documentation
```

## Safety Features

### Idempotency

The seeder includes safety checks:
- Users are checked by email/phone before creation
- Watchlist items are checked for duplicates
- Existing data is not overwritten

### Password Hashing

All passwords are hashed using ASP.NET Core Identity's `IPasswordHasher<AuthUser>`.

### Transaction Safety

Entity Framework's `SaveChangesAsync()` wraps operations in transactions by default.

## Troubleshooting

### Seeder Not Running

**Issue**: Seeder doesn't execute on startup

**Solutions**:
1. Verify service registration in `Program.cs`
2. Check that `await app.SeedDatabaseAsync();` is called after `app.Build()`
3. Review application logs for errors

### Duplicate Data

**Issue**: Duplicate records appear after multiple runs

**Solutions**:
1. The seeder includes idempotency checks
2. If duplicates persist, drop and recreate the database
3. Verify email/phone uniqueness constraints

### Build Errors

**Issue**: Compilation errors in DatabaseSeeder.cs

**Solutions**:
1. Ensure all required NuGet packages are installed
2. Verify entity namespaces are correct
3. Check that ApplicationDbContext is accessible

### Program.cs Corruption

**Issue**: Cannot modify Program.cs (contains null bytes)

**Solutions**:
1. Restore Program.cs from version control
2. Create a new Program.cs file
3. Use manual seeder execution via controller endpoint

## Customization

### Adding New Users

Edit the `testUserData` array in `SeedUsersAsync()` method:

```csharp
var testUserData = new[]
{
    new { 
        Phone = "01022322300", 
        Name = "New User", 
        Email = "user100@investa.test", 
        Type = ClientType.Investor, 
        Role = "New Role", 
        RepScore = 1000, 
        ActScore = 800, 
        Trust = TrustLevel.Registered, 
        RepLevel = "New Level" 
    }
};
```

### Adding New Opportunities

Edit the arrays in `SeedOpportunitiesAsync()` method:

```csharp
var equityOpportunities = new[]
{
    new {
        Name = "New Opportunity",
        Description = "Description here",
        Founder = "user92",
        Type = InvestmentType.Equity,
        // ... other properties
    }
};
```

### Adjusting Momentum/Reputation Scores

Modify the `Momentum`, `RepScore`, `ActScore` values in the data arrays to create different distributions.

## Best Practices

1. **Development**: Run the seeder after database migrations
2. **Testing**: Use the seeder before running automated tests
3. **Staging**: Use modified seed data for staging environments
4. **Production**: Never run the seeder in production with test credentials
5. **Version Control**: Commit seeder code but exclude sensitive credentials
6. **Security**: Change default passwords before deploying to production

## Support

For issues or questions:
- Check application logs for detailed error messages
- Review EF Core documentation
- Contact the development team

## Changelog

### Version 1.0 (2026-06-03)
- Initial comprehensive seeder implementation
- 9 users (1 admin + 8 test users)
- 8 investment opportunities (3 Equity, 2 Revenue Sharing, 2 Loan)
- Participation data (requests, participants, watchlists)
- Activity data (events, notifications)
- Momentum and reputation distribution
- Support for Angular, React, and Flutter apps
