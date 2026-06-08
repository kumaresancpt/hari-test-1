namespace backend.Models;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public string RedirectUrl { get; set; } = string.Empty;
}
