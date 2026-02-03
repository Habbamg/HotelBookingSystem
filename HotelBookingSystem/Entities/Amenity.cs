using System.Text.Json.Serialization; // Потрібно для [JsonIgnore]

namespace HotelBookingAPI.Entities
{
    public class Amenity
    {
        // Унікальний номер зручності в базі (1, 2, 3...)
        public int Id { get; set; }

        // Назва зручності, яку бачить клієнт
        // Наприклад: "Швидкісний Wi-Fi", "Фен", "Набір рушників"
        public string Name { get; set; } = string.Empty;

        // Код іконки (для Bootstrap Icons або FontAwesome)
        // Наприклад: "bi-wifi", "bi-wind", "bi-p-circle"
        public string IconClass { get; set; } = string.Empty;

        // --- ЗВ'ЯЗОК ---
        // Список номерів, у яких є ця зручність.
        // [JsonIgnore] потрібен, щоб програма не зависла, намагаючись 
        // завантажити "Зручність -> Номери -> Зручність -> Номери..." по колу.
        [JsonIgnore]
        public List<Room> Rooms { get; set; } = new List<Room>();
    }
}