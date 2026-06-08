using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AuditService : IAuditService
{
    private readonly AppDbContext _dbContext;

    public AuditService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task LogAuthEventAsync(string username, string eventType, string result, string ipAddress, string userAgent, string? detail, CancellationToken cancellationToken)
    {
        var auditEvent = new AuthAuditEvent
        {
            TimestampUtc = DateTime.UtcNow,
            Username = string.IsNullOrWhiteSpace(username) ? "anonymous" : username,
            EventType = eventType,
            Result = result,
            IpAddress = string.IsNullOrWhiteSpace(ipAddress) ? "unknown" : ipAddress,
            UserAgent = string.IsNullOrWhiteSpace(userAgent) ? "unknown" : userAgent,
            Detail = detail
        };

        _dbContext.AuthAuditEvents.Add(auditEvent);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditEventDto>> GetAuthEventsAsync(int limit, CancellationToken cancellationToken)
    {
        return await _dbContext.AuthAuditEvents
            .OrderByDescending(x => x.TimestampUtc)
            .Take(Math.Clamp(limit, 1, 500))
            .Select(x => new AuditEventDto
            {
                TimestampUtc = x.TimestampUtc,
                Username = x.Username,
                EventType = x.EventType,
                Result = x.Result,
                IpAddress = x.IpAddress,
                UserAgent = x.UserAgent,
                Detail = x.Detail
            })
            .ToListAsync(cancellationToken);
    }
}
