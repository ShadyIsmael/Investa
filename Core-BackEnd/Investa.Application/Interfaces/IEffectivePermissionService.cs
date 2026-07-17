namespace Investa.Application.Interfaces;

public sealed record EffectivePermissionSet(
    IReadOnlyCollection<string> PermissionKeys,
    IReadOnlyCollection<string> RoleNames,
    IReadOnlyCollection<int> GroupIds,
    IReadOnlyCollection<string> GroupNames);

public interface IEffectivePermissionService
{
    Task<EffectivePermissionSet> ResolveAsync(Guid userId);
}
