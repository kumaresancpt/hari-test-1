namespace VmsBackend.Models;

public class ErrorResponse
{
    /// <summary>Main error message (for general/non-field errors)</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Field-level error messages — Key: field name, Value: error message (AC-B2, AC-B9)</summary>
    public Dictionary<string, string> Errors { get; set; } = new Dictionary<string, string>();

    /// <summary>Legacy Detail field (for login/logout errors)</summary>
    public string Detail { get; set; } = string.Empty;

    /// <summary>For account lockout errors</summary>
    public int? SecondsRemaining { get; set; }
}
