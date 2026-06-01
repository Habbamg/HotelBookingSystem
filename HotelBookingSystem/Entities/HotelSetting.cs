namespace HotelBookingAPI.Entities
{
    public class HotelSetting
    {
        public int Id { get; set; }

        // До якого числа готель приймає бронювання
        public DateTime MaxBookingDate { get; set; }
    }
}