using System;

namespace Investa.Application.Common;

public class RequestContext
{
    public Guid? UserId { get; set; }
    public string? Role { get; set; }
    public Guid? OrgId { get; set; }
}
