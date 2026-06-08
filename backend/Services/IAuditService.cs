using backend.Models;

namespace backend.Services;

public interface IAuditService
{
    Task LogAuthEventAsync(string username, string eventType, string result, string ipAddress, string userAgent, string? detail, CancellationToken cancellationToken);

    Task<IReadOnlyList<AuditEventDto>> GetAuthEventsAsync(int limit, CancellationToken cancellationToken);
}
