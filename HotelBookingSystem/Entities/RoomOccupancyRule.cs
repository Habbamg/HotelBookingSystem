using HotelBookingAPI.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBookingSystem.Entities // Або HotelBookingAPI.Entities (використовуй свій namespace)
{
    public class RoomOccupancyRule
    {
        [Key]
        public int Id { get; set; }

        public int RoomId { get; set; }
        public Room Room { get; set; }

        // Для якої кількості гостей ця знижка (наприклад, 1, 2, 3...)
        public int GuestCount { get; set; }

        // Сума знижки (наприклад, 300)
        [Column(TypeName = "decimal(18, 0)")]
        public decimal DiscountAmount { get; set; }
    }
}