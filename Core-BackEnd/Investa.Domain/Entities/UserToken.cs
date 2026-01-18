using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities
{
    /// <summary>
    /// Stores Firebase Cloud Messaging (FCM) device tokens for push notifications.
    /// Each user can have multiple tokens for different devices (Web/Android/iOS).
    /// </summary>
    [Table("UserTokens")]
    public class UserToken
    {
        /// <summary>
        /// Primary key - User identifier (references AspNetUsers.Id)
        /// </summary>
        [Key]
        [Required]
        [MaxLength(450)]
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Firebase Cloud Messaging registration token for the device
        /// </summary>
        [Required]
        [MaxLength(500)]
        public string FcmToken { get; set; } = string.Empty;

        /// <summary>
        /// Type of device (Web, Android, iOS)
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string DeviceType { get; set; } = string.Empty;

        /// <summary>
        /// Last time this token was updated
        /// </summary>
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// When the token was first created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Indicates if the token is still valid (inactive tokens are marked for cleanup)
        /// </summary>
        public bool IsActive { get; set; } = true;
    }
}
