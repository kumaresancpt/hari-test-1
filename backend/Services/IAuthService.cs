using backend.Models;

namespace backend.Services;

public interface IAuthService
{
    Task<(bool Success, string Detail, LoginResponse? Response)> LoginAsync(LoginRequest request, string ipAddress, string userAgent, CancellationToken cancellationToken);

    Task<(bool Success, string Detail, DateTime? OtpExpiresAt)> ForgotPasswordAsync(ForgotPasswordRequest request, string ipAddress, string userAgent, CancellationToken cancellationToken);

    Task<(bool Success, string Detail)> ResetPasswordAsync(ResetPasswordRequest request, string ipAddress, string userAgent, CancellationToken cancellationToken);

    Task LogoutAsync(string? tokenId, string username, string ipAddress, string userAgent, CancellationToken cancellationToken);
}
