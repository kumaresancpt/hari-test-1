namespace backend.Models;

public class AuditEventDto
{
    public DateTime TimestampUtc { get; set; }

    public string Username { get; set; } = string.Empty;

    public string EventType { get; set; } = string.Empty;

    public string Result { get; set; } = string.Empty;

    public string IpAddress { get; set; } = "unknown";

    public string UserAgent { get; set; } = "unknown";

    public string? Detail { get; set; }
}
