using System;

namespace Investa.Application.DTOs
{
    public class ClientAdminDto()
    {
        public string? StatusNameEn { get; set; }
        public string? StatusNameAr { get; set; }
        public int StatusId { get; set; }
        public string? StatusName { get; set; }
        public int? PenaltyDurationDays { get; set; }

        public int Id { get; set; }
        public Guid UserId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? MobileNumber { get; set; }
        public string? FirebaseUid { get; set; }
        public string? Phone { get; set; }
        public decimal Credit { get; set; }
        public decimal Score { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

