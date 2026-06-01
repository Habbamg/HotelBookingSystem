using HotelBookingAPI.Entities;
using System;

namespace HotelBookingSystem.Entities
{
    public class RoomAvailability
    {
        public int Id { get; set; }

        // Зв'язок із таблицею номерів
        public int RoomId { get; set; }
        public Room Room { get; set; }

        // Конкретна дата (час обнуляємо, зберігаємо тільки день)
        public DateTime Date { get; set; }

        // Ціна на цей день (якщо null, береться базова ціна номера BasePrice)
        public decimal? CustomPrice { get; set; }

        // Чи відкритий номер для бронювання в цей день
        public bool IsAvailable { get; set; } = true;

        // Мінімальний термін проживання в ночах (особливе обмеження для цієї дати)
        public int? MinStayDays { get; set; }
    }
}