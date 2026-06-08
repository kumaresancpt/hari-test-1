using backend.Data;

namespace backend.Services;

public interface IOtpService
{
    Task<(bool Success, string Detail, DateTime? ExpiresAt)> GenerateOtpAsync(User user, CancellationToken cancellationToken);

    Task<(bool Success, string Detail)> VerifyOtpAsync(User user, string otp, CancellationToken cancellationToken);
}
