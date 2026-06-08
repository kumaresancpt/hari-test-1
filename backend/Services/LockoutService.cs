using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class LockoutService : ILockoutService
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public LockoutService(AppDbContext dbContext, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _configuration = configuration;
    }

    public Task<(bool IsLocked, DateTime? LockoutUntil, int RemainingMinutes)> GetLockoutStatusAsync(User user, CancellationToken cancellationToken)
    {
        if (user.LockoutUntil is null)
        {
            return Task.FromResult((false, (DateTime?)null, 0));
        }

        var now = DateTime.UtcNow;
        if (user.LockoutUntil <= now)
        {
            return Task.FromResult((false, (DateTime?)null, 0));
        }

        var remaining = (int)Math.Ceiling((user.LockoutUntil.Value - now).TotalMinutes);
        return Task.FromResult((true, user.LockoutUntil, Math.Max(remaining, 1)));
    }

    public async Task RegisterFailedAttemptAsync(User user, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var maxAttempts = _configuration.GetValue<int?>("LockoutSettings:MaxFailedAttempts") ?? 5;
        var windowMinutes = _configuration.GetValue<int?>("LockoutSettings:WindowMinutes") ?? 15;
        var lockoutDurationMinutes = _configuration.GetValue<int?>("LockoutSettings:DurationMinutes") ?? 15;

        if (user.FirstFailedLoginAt is null || user.FirstFailedLoginAt < now.AddMinutes(-windowMinutes))
        {
            user.FirstFailedLoginAt = now;
            user.FailedLoginAttempts = 1;
        }
        else
        {
            user.FailedLoginAttempts += 1;
        }

        if (user.FailedLoginAttempts >= maxAttempts)
        {
            user.LockoutUntil = now.AddMinutes(lockoutDurationMinutes);
            user.FailedLoginAttempts = 0;
            user.FirstFailedLoginAt = null;
        }

        user.UpdatedAt = now;
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ResetFailuresAsync(User user, CancellationToken cancellationToken)
    {
        user.FailedLoginAttempts = 0;
        user.FirstFailedLoginAt = null;
        user.LockoutUntil = null;
        user.UpdatedAt = DateTime.UtcNow;
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
