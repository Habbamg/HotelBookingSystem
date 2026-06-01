namespace HotelBookingSystem.Dtos // Або твій namespace
{
    public class SaveOccupancyRuleDto
    {
        public int RoomId { get; set; }
        public int GuestCount { get; set; }
        public decimal Discount { get; set; } 
    }

    public class UpdateCapacityDto
    {
        public int RoomId { get; set; }
        public int MaxCapacity { get; set; }
    }
}