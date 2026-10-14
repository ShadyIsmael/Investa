using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services;

public sealed class ProjectStageMetadataService : IProjectStageMetadataService
{
    private static readonly IReadOnlyList<ProjectStageMetadataDto> Stages =
    [
        new() { Code = nameof(ProjectStage.Idea), Value = (int)ProjectStage.Idea, NameEn = "Idea", NameAr = "فكرة", SortOrder = 10 },
        new() { Code = nameof(ProjectStage.MVP), Value = (int)ProjectStage.MVP, NameEn = "MVP", NameAr = "المنتج الأولي", SortOrder = 20 },
        new() { Code = nameof(ProjectStage.Startup), Value = (int)ProjectStage.Startup, NameEn = "Startup", NameAr = "شركة ناشئة", SortOrder = 30 },
        new() { Code = nameof(ProjectStage.Scaling), Value = (int)ProjectStage.Scaling, NameEn = "Scaling", NameAr = "التوسع", SortOrder = 40 },
        new() { Code = nameof(ProjectStage.Established), Value = (int)ProjectStage.Established, NameEn = "Established", NameAr = "نشاط مستقر", SortOrder = 50 },
        new() { Code = nameof(ProjectStage.Other), Value = (int)ProjectStage.Other, NameEn = "Other", NameAr = "أخرى", SortOrder = 60, AllowsCustomName = true }
    ];

    public IReadOnlyList<ProjectStageMetadataDto> GetAll() => Stages;
}
