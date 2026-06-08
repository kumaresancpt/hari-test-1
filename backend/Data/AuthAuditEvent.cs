using System.ComponentModel.DataAnnotations;

namespace backend.Data;

public class AuthAuditEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = "anonymous";

    [Required]
    [MaxLength(100)]
    public string EventType { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Result { get; set; } = string.Empty;

    [MaxLength(64)]
    public string IpAddress { get; set; } = "unknown";

    [MaxLength(512)]
    public string UserAgent { get; set; } = "unknown";

    [MaxLength(300)]
    public string? Detail { get; set; }
}
