namespace Investa.Application.DTOs;

public class FirebaseOptions
{
    public bool Enabled { get; set; }
    public string ProjectId { get; set; } = string.Empty;
    public string DatabaseUrl { get; set; } = string.Empty;
    public string CredentialsPath { get; set; } = string.Empty;
}