using System.ComponentModel.DataAnnotations;

namespace backend.Data;

public class SessionToken
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string TokenId { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;

    public bool IsRevoked { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
