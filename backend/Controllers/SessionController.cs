using System.Security.Claims;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Authorize]
[Route("api/session")]
public class SessionController : ControllerBase
{
    private readonly ISessionService _sessionService;

    public SessionController(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [HttpGet("status")]
    public async Task<ActionResult<SessionStatusResponse>> GetStatus(CancellationToken cancellationToken)
    {
        var tokenId = User.FindFirstValue("jti") ?? User.FindFirstValue(ClaimTypes.Sid);
        if (string.IsNullOrWhiteSpace(tokenId))
        {
            return Unauthorized(new { detail = "Session token is missing." });
        }

        var status = await _sessionService.GetSessionStatusAsync(tokenId, cancellationToken);
        if (!status.IsActive)
        {
            return Unauthorized(new { detail = "Session expired." });
        }

        await _sessionService.TouchSessionAsync(tokenId, cancellationToken);

        return Ok(new SessionStatusResponse
        {
            IsActive = status.IsActive,
            ShowWarning = status.ShowWarning,
            MinutesUntilExpiry = status.MinutesUntilExpiry
        });
    }
}
