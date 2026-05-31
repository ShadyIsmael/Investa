using System;

namespace Investa.Domain.Entities;

/// <summary>
/// OBSOLETE — internal staff are now represented as AuthUser records with UserType = OrgUser.
/// RBAC (UserRoles / UserGroups) controls their permissions. No profile required.
/// This stub is kept to avoid breaking stray references during migration.
/// </summary>
[Obsolete("Staff/admin users are AuthUser with UserType = OrgUser. Employee table is dropped.")]
[System.ComponentModel.DataAnnotations.Schema.NotMapped]
public class Employee { }
