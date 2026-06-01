using System.ComponentModel.DataAnnotations.Schema; // Потрібно для [NotMapped]


namespace HotelBookingAPI.Entities
{
    public class Room
    {
        // Унікальний ID номера (ключ у базі)
        public int Id { get; set; }

        // Назва номера (напр. "Стандарт покращений", "Сімейний люкс")
        public string Name { get; set; } = string.Empty;

        // Детальний опис (текст, що приваблює клієнта)
        public string Description { get; set; } = string.Empty;

        // Чи показувати номер на сайті? 
        // false = номер на ремонті або видалений, його ніхто не бачить
        public bool IsActive { get; set; } = true;

        // --- 💰 ГРОШІ ТА ЦІНИ ---

        // Базова вартість за ніч (для базової кількості людей)
        public decimal BasePrice { get; set; }

        // Скільки доплачувати за кожного додаткового гостя
        // Якщо 0 - то доплати немає
        public decimal ExtraPersonPrice { get; set; }

        // --- 📅 ПРАВИЛА БРОНЮВАННЯ ---

        // Мінімальна кількість ночей.
        // 1 - можна на добу. 3 - мінімум на 3 дні (актуально на свята).
        public int MinBookingDays { get; set; } = 1;

        // --- 👨‍👩‍👧‍👦 МІСТКІСТЬ ---

        // Скільки людей входить у базову ціну (напр. 2 особи)
        public int BaseCapacity { get; set; }

        // Скільки максимум людей можна поселити (з урахуванням диванів/розкладачок)
        // Це число використовується для фільтру пошуку
        public int MaxCapacity { get; set; }

        // Площа номера в квадратних метрах
        public int Area { get; set; }

        // Кількість кімнат у номері (наприклад, 1 для стандарту, 2 для люксу)
        public int RoomsCount { get; set; } = 1;

        // Це "віртуальне" поле. Його немає в базі даних ([NotMapped]).
        // Воно автоматично склеює цифри в гарний текст для сайту.
        // Результат: "2 особи" або "2-4 особи"
        [NotMapped]
        public string CapacityDisplay => BaseCapacity == MaxCapacity
            ? $"{BaseCapacity} особи"
            : $"{BaseCapacity}-{MaxCapacity} особи";

        // --- 🔗 ЗВ'ЯЗКИ З ІНШИМИ ТАБЛИЦЯМИ ---
        // Зв'язок із календарем (щоб знати, які дати закриті)
        public List<HotelBookingSystem.Entities.RoomAvailability> Availabilities { get; set; } = new List<HotelBookingSystem.Entities.RoomAvailability>();

        // Список фотографій цього номера (Слайдер)
        public List<RoomImage> Images { get; set; } = new List<RoomImage>();

        // Список зручностей у цьому номері
        // Сюди ми додамо: Wi-Fi, Фен, Паркінг, Засоби гігієни
        public List<Booking> Bookings { get; set; } = new List<Booking>();

        public List<Amenity> Amenities { get; set; } = new List<Amenity>();
    }

}