using System.Security.Cryptography;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class OtpService : IOtpService
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public OtpService(AppDbContext dbContext, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _configuration = configuration;
    }

    public async Task<(bool Success, string Detail, DateTime? ExpiresAt)> GenerateOtpAsync(User user, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var maxRequestsPerHour = _configuration.GetValue<int?>("OtpSettings:MaxRequestsPerHour") ?? 3;
        var expiryMinutes = _configuration.GetValue<int?>("OtpSettings:ExpiryMinutes") ?? 10;
        var maxAttempts = _configuration.GetValue<int?>("OtpSettings:MaxAttempts") ?? 3;

        var requestCount = await _dbContext.PasswordResetOtps
            .Where(x => x.UserId == user.Id && x.CreatedAt >= now.AddHours(-1))
            .CountAsync(cancellationToken);

        if (requestCount >= maxRequestsPerHour)
        {
            return (false, "Too many OTP requests. Try again later.", null);
        }

        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var expiresAt = now.AddMinutes(expiryMinutes);

        var otp = new PasswordResetOtp
        {
            UserId = user.Id,
            OtpCode = code,
            ExpiresAt = expiresAt,
            AttemptsRemaining = maxAttempts,
            IsUsed = false,
            CreatedAt = now
        };

        _dbContext.PasswordResetOtps.Add(otp);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return (true, "OTP issued.", expiresAt);
    }

    public async Task<(bool Success, string Detail)> VerifyOtpAsync(User user, string otp, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var activeOtp = await _dbContext.PasswordResetOtps
            .Where(x => x.UserId == user.Id && !x.IsUsed)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (activeOtp is null)
        {
            return (false, "No OTP request found.");
        }

        if (activeOtp.ExpiresAt < now)
        {
            return (false, "OTP expired. Request a new OTP.");
        }

        if (activeOtp.AttemptsRemaining <= 0)
        {
            return (false, "OTP attempt limit reached. Request a new OTP.");
        }

        if (!string.Equals(activeOtp.OtpCode, otp, StringComparison.Ordinal))
        {
            activeOtp.AttemptsRemaining -= 1;
            if (activeOtp.AttemptsRemaining <= 0)
            {
                activeOtp.IsUsed = true;
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            return (false, "Invalid OTP.");
        }

        activeOtp.IsUsed = true;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return (true, "OTP verified.");
    }
}
