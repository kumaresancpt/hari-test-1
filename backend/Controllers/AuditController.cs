using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Authorize]
[Route("api/audit")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet("auth-events")]
    public async Task<ActionResult<IReadOnlyList<AuditEventDto>>> GetAuthEvents([FromQuery] int limit = 100, CancellationToken cancellationToken = default)
    {
        var events = await _auditService.GetAuthEventsAsync(limit, cancellationToken);
        return Ok(events);
    }
}
