using System;
using System.Collections.Generic;

namespace Investa.Application.DTOs
{
    public class SupportSessionDto
    {
        public Guid Id { get; set; }
        public string UserMobile { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<MessageDto> Messages { get; set; } = new List<MessageDto>();
    }
}