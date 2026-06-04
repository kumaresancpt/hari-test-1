namespace VmsBackend.Models;

/// <summary>
/// Register response model for SCRUM-17: Success response after registration
/// Covers: BE-AC7 (201 Created, no passwordHash)
/// </summary>
public class RegisterResponse
{
    /// <summary>Success flag — BE-AC7</summary>
    public bool Success { get; set; } = true;

    /// <summary>Success message — BE-AC7</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Newly created user ID — BE-AC7</summary>
    public string? UserId { get; set; }
}
