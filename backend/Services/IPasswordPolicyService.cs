using backend.Data;

namespace backend.Services;

public interface IPasswordPolicyService
{
    Task<(bool Success, string Detail)> ValidateNewPasswordAsync(User user, string newPassword, string confirmPassword, CancellationToken cancellationToken);

    Task RecordPasswordHistoryAsync(User user, string passwordHash, CancellationToken cancellationToken);
}
