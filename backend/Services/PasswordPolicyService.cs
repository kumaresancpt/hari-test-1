using System.Text.RegularExpressions;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class PasswordPolicyService : IPasswordPolicyService
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public PasswordPolicyService(AppDbContext dbContext, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _configuration = configuration;
    }

    public async Task<(bool Success, string Detail)> ValidateNewPasswordAsync(User user, string newPassword, string confirmPassword, CancellationToken cancellationToken)
    {
        if (!string.Equals(newPassword, confirmPassword, StringComparison.Ordinal))
        {
            return (false, "Confirm password does not match.");
        }

        var minLength = _configuration.GetValue<int?>("PasswordPolicySettings:MinLength") ?? 8;
        if (newPassword.Length < minLength)
        {
            return (false, $"Password must be at least {minLength} characters long.");
        }

        if (!Regex.IsMatch(newPassword, "[A-Z]"))
        {
            return (false, "Password must contain at least one uppercase letter.");
        }

        if (!Regex.IsMatch(newPassword, "[a-z]"))
        {
            return (false, "Password must contain at least one lowercase letter.");
        }

        if (!Regex.IsMatch(newPassword, "[0-9]"))
        {
            return (false, "Password must contain at least one number.");
        }

        if (!Regex.IsMatch(newPassword, "[^a-zA-Z0-9]"))
        {
            return (false, "Password must contain at least one special character.");
        }

        if (BCrypt.Net.BCrypt.Verify(newPassword, user.PasswordHash))
        {
            return (false, "New password cannot match your current password.");
        }

        var historyCount = _configuration.GetValue<int?>("PasswordPolicySettings:PasswordHistoryCount") ?? 5;
        var recentHashes = await _dbContext.PasswordHistories
            .Where(x => x.UserId == user.Id)
            .OrderByDescending(x => x.CreatedAt)
            .Take(historyCount)
            .Select(x => x.PasswordHash)
            .ToListAsync(cancellationToken);

        if (recentHashes.Any(hash => BCrypt.Net.BCrypt.Verify(newPassword, hash)))
        {
            return (false, $"New password cannot match the last {historyCount} used passwords.");
        }

        return (true, "Password policy validation succeeded.");
    }

    public async Task RecordPasswordHistoryAsync(User user, string passwordHash, CancellationToken cancellationToken)
    {
        var historyCount = _configuration.GetValue<int?>("PasswordPolicySettings:PasswordHistoryCount") ?? 5;

        _dbContext.PasswordHistories.Add(new PasswordHistory
        {
            UserId = user.Id,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        });

        await _dbContext.SaveChangesAsync(cancellationToken);

        var staleEntries = await _dbContext.PasswordHistories
            .Where(x => x.UserId == user.Id)
            .OrderByDescending(x => x.CreatedAt)
            .Skip(historyCount)
            .ToListAsync(cancellationToken);

        if (staleEntries.Count > 0)
        {
            _dbContext.PasswordHistories.RemoveRange(staleEntries);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
