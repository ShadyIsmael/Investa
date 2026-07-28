namespace Investa.Application.DTOs;

public class FirebasePushSendResult
{
    public bool Success { get; set; }
    public FirebasePushSendStatus Status { get; set; }
    public string? Message { get; set; }
}

public enum FirebasePushSendStatus
{
    Success,
    InvalidToken,
    RetryableFailure,
    PermanentFailure
}