using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260728162402_ResetReputationScoresToZero")]
partial class ResetReputationScoresToZero
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder)
    {
        modelBuilder.HasAnnotation("ProductVersion", "9.0.1");
    }
}
