using backend.Data;

namespace backend.Services;

public interface ILockoutService
{
    Task<(bool IsLocked, DateTime? LockoutUntil, int RemainingMinutes)> GetLockoutStatusAsync(User user, CancellationToken cancellationToken);

    Task RegisterFailedAttemptAsync(User user, CancellationToken cancellationToken);

    Task ResetFailuresAsync(User user, CancellationToken cancellationToken);
}
