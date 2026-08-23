using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;
namespace Investa.Domain.Entities;
public sealed class ProjectRoomDocument
{
    public long Id{get;set;} public int ProjectId{get;set;}
    [StringLength(500)] public string FileKey{get;set;}=string.Empty;
    [StringLength(200)] public string FileName{get;set;}=string.Empty;
    [StringLength(100)] public string DocumentType{get;set;}=string.Empty;
    public ProjectRoomDocumentVisibility Visibility{get;set;}=ProjectRoomDocumentVisibility.ProjectMembers;
    public Guid CreatedByUserId{get;set;} public DateTime CreatedAt{get;set;}=DateTime.UtcNow;
    [Timestamp] public byte[] RowVersion{get;set;}=[];
    public Project? Project{get;set;} public AuthUser? CreatedByUser{get;set;}
}
