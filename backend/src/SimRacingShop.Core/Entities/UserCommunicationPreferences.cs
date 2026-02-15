using System;

namespace SimRacingShop.Core.Entities
{
    /// <summary>
    /// Preferencias de comunicación del usuario
    /// </summary>
    public class UserCommunicationPreferences
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        /// <summary>
        /// Acepta recibir newsletter por email
        /// </summary>
        public bool Newsletter { get; set; }

        /// <summary>
        /// Acepta recibir notificaciones de pedidos por email
        /// </summary>
        public bool OrderNotifications { get; set; }

        /// <summary>
        /// Acepta recibir promociones por SMS
        /// </summary>
        public bool SmsPromotions { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation property
        public User User { get; set; } = null!;
    }
}
