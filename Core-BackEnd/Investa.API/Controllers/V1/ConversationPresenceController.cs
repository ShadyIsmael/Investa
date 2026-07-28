using System.Security.Claims;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.V1;

[ApiController]
[Authorize]
[Route("api/v1/conversations/{conversationId:guid}/presence")]
public sealed class ConversationPresenceController : ControllerBase
{
    private readonly IConversationPresenceService _presence;

    public ConversationPresenceController(IConversationPresenceService presence) => _presence = presence;

    [HttpPut]
    public IActionResult Heartbeat(Guid conversationId)
    {
        _presence.SetActive(CurrentUserId(), conversationId);
        return NoContent();
    }

    [HttpDelete]
    public IActionResult Leave(Guid conversationId)
    {
        _presence.Clear(CurrentUserId(), conversationId);
        return NoContent();
    }

    private Guid CurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id)
            ? id
            : throw new UnauthorizedAccessException("Authenticated user identifier is invalid.");
    }
}
