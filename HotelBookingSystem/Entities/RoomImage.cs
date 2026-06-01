using System.Text.Json.Serialization; // Потрібно для JsonIgnore

namespace HotelBookingAPI.Entities
{
    public class RoomImage
    {
        public int Id { get; set; }

        // Посилання на картинку (напр. "/images/room101.jpg")
        public string Url { get; set; } = string.Empty;

        public string Type { get; set; } = "image";
        // --- ЗВ'ЯЗОК ---

        // ID кімнати, до якої належить це фото
        public int RoomId { get; set; }

        // Навігаційна властивість (щоб ми знали, що це фото саме від цієї кімнати)
        // [JsonIgnore] потрібен, щоб не було замкненого кола при завантаженні
        [JsonIgnore]
        public Room? Room { get; set; }
        public bool IsMain { get; set; }
    }
}