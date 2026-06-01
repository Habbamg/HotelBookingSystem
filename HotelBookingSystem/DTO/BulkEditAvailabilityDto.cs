using System;

namespace HotelBookingSystem.Dtos
{
    public class BulkEditAvailabilityDto
    {
        public int RoomId { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public decimal? Price { get; set; }
        public string Status { get; set; } // "open", "closed", "no_change"
        public int? MinStay { get; set; }
    }
}