using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;

namespace Investa.Domain.Entities;

/// <summary>
/// OBSOLETE — merged into AuthUser. This class is kept as an empty stub
/// only to allow incremental migration without a big-bang rename.
/// All application code must use <see cref="AuthUser"/> instead.
/// </summary>
[Obsolete("Use AuthUser instead")]
[System.ComponentModel.DataAnnotations.Schema.NotMapped]
public class User { }