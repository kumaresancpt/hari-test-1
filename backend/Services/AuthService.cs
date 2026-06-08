using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AuthService : IAuthService
{
    private static readonly IReadOnlyDictionary<string, string> RoleRedirectMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["Admin"] = "/dashboard/admin",
        ["Receptionist"] = "/dashboard/receptionist",
        ["Security Guard"] = "/dashboard/gate-entry",
        ["SecurityGuard"] = "/dashboard/gate-entry"
    };

    private readonly AppDbContext _dbContext;
    private readonly ILockoutService _lockoutService;
    private readonly IOtpService _otpService;
    private readonly IPasswordPolicyService _passwordPolicyService;
    private readonly ISessionService _sessionService;
    private readonly IAuditService _auditService;

    public AuthService(
        AppDbContext dbContext,
        ILockoutService lockoutService,
        IOtpService otpService,
        IPasswordPolicyService passwordPolicyService,
        ISessionService sessionService,
        IAuditService auditService)
    {
        _dbContext = dbContext;
        _lockoutService = lockoutService;
        _otpService = otpService;
        _passwordPolicyService = passwordPolicyService;
        _sessionService = sessionService;
        _auditService = auditService;
    }

    public async Task<(bool Success, string Detail, LoginResponse? Response)> LoginAsync(LoginRequest request, string ipAddress, string userAgent, CancellationToken cancellationToken)
    {
        var username = request.Username.Trim();
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Username == username, cancellationToken);

        if (user is null)
        {
            await _auditService.LogAuthEventAsync(username, "login", "failed", ipAddress, userAgent, "Invalid username or password.", cancellationToken);
            return (false, "Invalid username or password.", null);
        }

        var lockoutStatus = await _lockoutService.GetLockoutStatusAsync(user, cancellationToken);
        if (lockoutStatus.IsLocked)
        {
            var detail = $"Account locked due to too many failed attempts. Try again in {lockoutStatus.RemainingMinutes} minutes.";
            await _auditService.LogAuthEventAsync(user.Username, "account-lockout", "locked", ipAddress, userAgent, detail, cancellationToken);
            return (false, detail, null);
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!passwordValid)
        {
            await _lockoutService.RegisterFailedAttemptAsync(user, cancellationToken);
            await _auditService.LogAuthEventAsync(user.Username, "login", "failed", ipAddress, userAgent, "Invalid username or password.", cancellationToken);
            return (false, "Invalid username or password.", null);
        }

        await _lockoutService.ResetFailuresAsync(user, cancellationToken);

        var session = await _sessionService.CreateSessionAsync(user, cancellationToken);

        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var redirectUrl = RoleRedirectMap.TryGetValue(user.Role, out var url)
            ? url
            : "/dashboard/receptionist";

        await _auditService.LogAuthEventAsync(user.Username, "login", "success", ipAddress, userAgent, "Login succeeded.", cancellationToken);

        return (true, "Login succeeded.", new LoginResponse
        {
            Token = session.Token,
            Role = user.Role,
            ExpiresAt = session.ExpiresAt,
            RedirectUrl = redirectUrl
        });
    }

    public async Task<(bool Success, string Detail, DateTime? OtpExpiresAt)> ForgotPasswordAsync(ForgotPasswordRequest request, string ipAddress, string userAgent, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == email, cancellationToken);

        if (user is null)
        {
            await _auditService.LogAuthEventAsync(email, "forgot-password", "failed", ipAddress, userAgent, "Email not found.", cancellationToken);
            return (true, "If the account exists, an OTP has been sent.", null);
        }

        var otpResult = await _otpService.GenerateOtpAsync(user, cancellationToken);
        if (!otpResult.Success)
        {
            await _auditService.LogAuthEventAsync(user.Username, "forgot-password", "failed", ipAddress, userAgent, otpResult.Detail, cancellationToken);
            return (false, otpResult.Detail, null);
        }

        await _auditService.LogAuthEventAsync(user.Username, "forgot-password", "success", ipAddress, userAgent, "OTP issued.", cancellationToken);

        return (true, "OTP sent successfully.", otpResult.ExpiresAt);
    }

    public async Task<(bool Success, string Detail)> ResetPasswordAsync(ResetPasswordRequest request, string ipAddress, string userAgent, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == email, cancellationToken);

        if (user is null)
        {
            await _auditService.LogAuthEventAsync(email, "password-reset", "failed", ipAddress, userAgent, "Invalid reset request.", cancellationToken);
            return (false, "Invalid reset request.");
        }

        var otpCheck = await _otpService.VerifyOtpAsync(user, request.Otp, cancellationToken);
        if (!otpCheck.Success)
        {
            await _auditService.LogAuthEventAsync(user.Username, "password-reset", "failed", ipAddress, userAgent, otpCheck.Detail, cancellationToken);
            return (false, otpCheck.Detail);
        }

        var policyCheck = await _passwordPolicyService.ValidateNewPasswordAsync(user, request.NewPassword, request.ConfirmPassword, cancellationToken);
        if (!policyCheck.Success)
        {
            await _auditService.LogAuthEventAsync(user.Username, "password-reset", "failed", ipAddress, userAgent, policyCheck.Detail, cancellationToken);
            return (false, policyCheck.Detail);
        }

        await _passwordPolicyService.RecordPasswordHistoryAsync(user, user.PasswordHash, cancellationToken);

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, workFactor: 12);
        user.UpdatedAt = DateTime.UtcNow;
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _sessionService.InvalidateAllSessionsForUserAsync(user.Id, cancellationToken);

        await _auditService.LogAuthEventAsync(user.Username, "password-reset", "success", ipAddress, userAgent, "Password reset succeeded.", cancellationToken);

        return (true, "Password reset succeeded. Please login again.");
    }

    public async Task LogoutAsync(string? tokenId, string username, string ipAddress, string userAgent, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(tokenId))
        {
            await _sessionService.InvalidateSessionAsync(tokenId, cancellationToken);
        }

        await _auditService.LogAuthEventAsync(username, "logout", "success", ipAddress, userAgent, "Logout succeeded.", cancellationToken);
    }
}
