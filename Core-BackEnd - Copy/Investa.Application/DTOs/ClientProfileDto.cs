using System;

namespace Investa.Application.DTOs
{
    public class ClientProfileDto()
    {
        public int StatusId { get; set; }
        public string? StatusName { get; set; }
        public int? PenaltyDurationDays { get; set; }

        public int Id { get; set; }
        public Guid UserId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Gender { get; set; }
        public string? PersonalImageUrl { get; set; }
        public string? MobileNumber { get; set; }
        public string? FirebaseUid { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? NationalId { get; set; }
        public string? NationalIdImageUrl { get; set; }
        public DateTime? BirthDate { get; set; }
        public int? Age { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? FacebookUrl { get; set; }
        public string? BusinessTitle { get; set; }
        public int[]? CategoryIds { get; set; }
        public decimal Score { get; set; }
        public decimal Credit { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
