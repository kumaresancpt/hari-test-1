using backend.Data;

namespace backend.Services;

public interface ISessionService
{
    Task<(string Token, DateTime ExpiresAt, string TokenId)> CreateSessionAsync(User user, CancellationToken cancellationToken);

    Task<(bool IsActive, bool ShowWarning, int MinutesUntilExpiry)> GetSessionStatusAsync(string tokenId, CancellationToken cancellationToken);

    Task<bool> IsSessionActiveAsync(string tokenId, CancellationToken cancellationToken);

    Task TouchSessionAsync(string tokenId, CancellationToken cancellationToken);

    Task InvalidateSessionAsync(string tokenId, CancellationToken cancellationToken);

    Task InvalidateAllSessionsForUserAsync(Guid userId, CancellationToken cancellationToken);
}
