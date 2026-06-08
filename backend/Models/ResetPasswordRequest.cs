using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ResetPasswordRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^\\d{6}$")]
    public string Otp { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string ConfirmPassword { get; set; } = string.Empty;
}
