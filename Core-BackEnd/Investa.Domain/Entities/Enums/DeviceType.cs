namespace Investa.Domain.Entities.Enums
{
    /// <summary>
    /// Represents the type of device for FCM push notifications
    /// </summary>
    public enum DeviceType
    {
        /// <summary>
        /// Web browser client
        /// </summary>
        Web = 0,

        /// <summary>
        /// Android mobile device
        /// </summary>
        Android = 1,

        /// <summary>
        /// iOS mobile device (iPhone/iPad)
        /// </summary>
        iOS = 2
    }
}
