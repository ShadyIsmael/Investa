using FluentAssertions;
using Investa.Application.Services;
using Investa.Domain.Entities.Enums;
using Xunit;

namespace Investa.UnitTests;

public sealed class ProjectStageMetadataServiceTests
{
    [Fact]
    public void Exposes_the_immutable_bilingual_project_stage_contract()
    {
        var stages = new ProjectStageMetadataService().GetAll();

        stages.Select(x => x.Code).Should().Equal(nameof(ProjectStage.Idea), nameof(ProjectStage.MVP), nameof(ProjectStage.Startup), nameof(ProjectStage.Scaling), nameof(ProjectStage.Established), nameof(ProjectStage.Other));
        stages.Select(x => x.Value).Should().Equal(1, 2, 3, 4, 5, 6);
        stages.Should().ContainSingle(x => x.Code == nameof(ProjectStage.Other) && x.AllowsCustomName && x.NameAr == "أخرى");
        stages.Should().OnlyContain(x => x.IsActive && !string.IsNullOrWhiteSpace(x.NameEn) && !string.IsNullOrWhiteSpace(x.NameAr));
    }
}
