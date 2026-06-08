namespace backend.Models;

public class SessionStatusResponse
{
    public bool IsActive { get; set; }

    public bool ShowWarning { get; set; }

    public int MinutesUntilExpiry { get; set; }
}
