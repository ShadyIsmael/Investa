using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs;

public class ChangeClientStatusRequest
{
    [Required]
    public int NewStatusId { get; set; }

    [Required]
    [StringLength(1000)]
    public string Reason { get; set; } = string.Empty;
}
