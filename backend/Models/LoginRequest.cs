using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class LoginRequest
{
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Password { get; set; } = string.Empty;
}
