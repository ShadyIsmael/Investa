using System.Security.Claims;
using Investa.Application.Common;

namespace Investa.API.Middlewares;

public class RequestContextMiddleware
{
    private readonly RequestDelegate _next;

    public RequestContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext ctx, RequestContext context)
    {
        if (ctx.User?.Identity?.IsAuthenticated == true)
        {
            var idClaim = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(idClaim, out var uid)) context.UserId = uid;

            context.Role = ctx.User.FindFirstValue(ClaimTypes.Role);

            var orgClaim = ctx.User.FindFirst("org_id")?.Value;
            if (Guid.TryParse(orgClaim, out var oid)) context.OrgId = oid;
        }

        await _next(ctx);
    }
}
