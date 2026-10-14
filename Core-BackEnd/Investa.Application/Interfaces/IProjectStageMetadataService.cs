using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IProjectStageMetadataService
{
    IReadOnlyList<ProjectStageMetadataDto> GetAll();
}
