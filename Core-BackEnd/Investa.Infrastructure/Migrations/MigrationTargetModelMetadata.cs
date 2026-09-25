using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Migrations;

partial class ApplicationDbContextModelSnapshot
{
    internal static void BuildMigrationTargetModel(ModelBuilder modelBuilder) =>
        new ApplicationDbContextModelSnapshot().BuildModel(modelBuilder);
}

public partial class InitialCreate
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder) =>
        ApplicationDbContextModelSnapshot.BuildMigrationTargetModel(modelBuilder);
}

public partial class AddPricingEngine
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder) =>
        ApplicationDbContextModelSnapshot.BuildMigrationTargetModel(modelBuilder);
}

public partial class AddOpportunityClassificationMetadata
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder) =>
        ApplicationDbContextModelSnapshot.BuildMigrationTargetModel(modelBuilder);
}

public partial class AddInvestmentOpportunityCompatibilityLink
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder) =>
        ApplicationDbContextModelSnapshot.BuildMigrationTargetModel(modelBuilder);
}

public partial class AddPaidActionPricingRules
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder) =>
        ApplicationDbContextModelSnapshot.BuildMigrationTargetModel(modelBuilder);
}

public partial class AddCompanyFinancePhase1BCorrected
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder) =>
        ApplicationDbContextModelSnapshot.BuildMigrationTargetModel(modelBuilder);
}

public partial class ExtendMoneyInBackendContract
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder) =>
        ApplicationDbContextModelSnapshot.BuildMigrationTargetModel(modelBuilder);
}
