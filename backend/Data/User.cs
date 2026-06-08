using System.ComponentModel.DataAnnotations;

namespace backend.Data;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = "Receptionist";

    public int FailedLoginAttempts { get; set; }

    public DateTime? FirstFailedLoginAt { get; set; }

    public DateTime? LockoutUntil { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PasswordHistory> PasswordHistories { get; set; } = new List<PasswordHistory>();

    public ICollection<PasswordResetOtp> PasswordResetOtps { get; set; } = new List<PasswordResetOtp>();

    public ICollection<SessionToken> SessionTokens { get; set; } = new List<SessionToken>();
}
