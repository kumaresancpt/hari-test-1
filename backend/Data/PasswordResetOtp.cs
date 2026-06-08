using System.ComponentModel.DataAnnotations;

namespace backend.Data;

public class PasswordResetOtp
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    [Required]
    [MaxLength(6)]
    public string OtpCode { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public int AttemptsRemaining { get; set; }

    public bool IsUsed { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
