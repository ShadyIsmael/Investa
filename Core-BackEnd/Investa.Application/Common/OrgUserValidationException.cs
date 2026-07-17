namespace Investa.Application.Common;

public sealed class OrgUserValidationException : Exception
{
    public string Code { get; }
    public IReadOnlyCollection<string> Errors { get; }

    public OrgUserValidationException(string code, string message, IEnumerable<string>? errors = null)
        : base(message)
    {
        Code = code;
        Errors = (errors ?? new[] { message }).Where(x => !string.IsNullOrWhiteSpace(x)).ToArray();
    }
}
