namespace HotelBookingAPI.Entities
{
    public class Booking
    {
        // 1. Унікальний номер у базі даних (1, 2, 3...)
        // Використовується тільки програмістами і базою. Клієнт його не бачить.
        public int Id { get; set; }

        // --- 🔗 ЗВ'ЯЗОК З НОМЕРОМ ---

        // Це "Зовнішній ключ" (Foreign Key). Він вказує, ЩО саме забронювали.
        // Наприклад: RoomId = 5 (це значить номер "Люкс").
        public int RoomId { get; set; }

        // Це "Навігаційна властивість". 
        // Вона дозволяє нам у коді писати: booking.Room.Name
        // Тобто діставати назву кімнати прямо з бронювання.
        public Room? Room { get; set; }

        // --- 👤 ІНФОРМАЦІЯ ПРО ГОСТЯ ---

        public string GuestName { get; set; } = string.Empty; // "Тарас Шевченко"
        public string GuestPhone { get; set; } = string.Empty; // "+380..."
        public string GuestEmail { get; set; } = string.Empty; // Для чеків/листів

        // --- 🔒 БЕЗПЕКА (ЗАМІСТЬ ПАРОЛЯ) ---

        // Унікальний код (PNR), який ми згенеруємо (наприклад "A7-K2").
        // Клієнт вводить Телефон + Цей код, щоб побачити своє бронювання.
        public string BookingCode { get; set; } = string.Empty;

        // --- 📅 ЧАС ---

        public DateTime CheckInDate { get; set; }  // Коли заїжджає
        public DateTime CheckOutDate { get; set; } // Коли виїжджає

        // Дата створення запису. Дуже важливо для адміна!
        // Щоб бачити: "Це бронювання впало 5 хвилин тому".
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // --- 👨‍👩‍👧‍👦 ДЕТАЛІ ПРОЖИВАННЯ ---

        public int Adults { get; set; }   // Дорослих
        public int Children { get; set; } // Дітей
        public string? Comments { get; set; } // "Потрібне дитяче ліжечко" (може бути пустим)

        // --- 💰 ФІНАНСИ ТА СТАТУС ---

        // Фіксована сума. Ми розраховуємо її один раз при бронюванні і записуємо сюди.
        // Навіть якщо ціна номера потім зміниться, у цьому бронюванні сума залишиться старою (чесною).
        public decimal TotalPrice { get; set; }

        // Життєвий цикл броні:
        // "New" (щойно створили) -> "Confirmed" (адмін підтвердив) -> 
        // "Completed" (виселилися) АБО "Cancelled" (скасували).
        public string Status { get; set; } = "New";
    }
}