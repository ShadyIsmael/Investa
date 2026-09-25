using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;
namespace Investa.Domain.Entities;
public sealed class ProjectRoomEntry
{
    public long Id{get;set;} public int ProjectId{get;set;} public ProjectRoomEntryType EntryType{get;set;}
    [StringLength(200)] public string Title{get;set;}=string.Empty;
    [StringLength(4000)] public string? Description{get;set;}
    public DateTime? DueAt{get;set;} public DateTime? CompletedAt{get;set;}
    public Guid CreatedByUserId{get;set;} public DateTime CreatedAt{get;set;}=DateTime.UtcNow;
    public bool IsInvestorVisible{get;set;}=true; [Timestamp] public byte[] RowVersion{get;set;}=[];
    public Project? Project{get;set;} public AuthUser? CreatedByUser{get;set;}
}
