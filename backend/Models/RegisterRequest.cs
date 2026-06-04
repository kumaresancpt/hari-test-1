using System.ComponentModel.DataAnnotations;

namespace VmsBackend.Models;

/// <summary>
/// Register request model for SCRUM-17: User registration endpoint
/// Covers: BE-AC1, BE-AC9
/// </summary>
public class RegisterRequest
{
    /// <summary>User's full name — BE-AC1, BE-AC9</summary>
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(200, ErrorMessage = "Name must not exceed 200 characters")]
    public string Name { get; set; } = string.Empty;

    /// <summary>User's email — BE-AC1, BE-AC2, BE-AC9</summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Email must be a valid email format")]
    [MaxLength(255, ErrorMessage = "Email must not exceed 255 characters")]
    public string Email { get; set; } = string.Empty;

    /// <summary>User's password — BE-AC1, BE-AC3, BE-AC4, BE-AC9</summary>
    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    [MaxLength(100, ErrorMessage = "Password must not exceed 100 characters")]
    public string Password { get; set; } = string.Empty;

    /// <summary>Password confirmation — BE-AC1, BE-AC3, BE-AC9</summary>
    [Required(ErrorMessage = "Confirm password is required")]
    [MaxLength(100, ErrorMessage = "Confirm password must not exceed 100 characters")]
    public string ConfirmPassword { get; set; } = string.Empty;

    /// <summary>User's phone number — BE-AC5</summary>
    [Required(ErrorMessage = "Phone number is required")]
    [Phone(ErrorMessage = "Phone number must be a valid phone format")]
    [MaxLength(20, ErrorMessage = "Phone number must not exceed 20 characters")]
    public string PhoneNumber { get; set; } = string.Empty;
}
