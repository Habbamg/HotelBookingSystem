namespace HotelBookingAPI.Entities
{
    public class Review
    {
        public int Id { get; set; }

        public string AuthorName { get; set; } = string.Empty;

        // Текст відгуку
        public string Comment { get; set; } = string.Empty;

        // Оцінка (зірочки від 1 до 5)
        public int Rating { get; set; }

        // Дата написання (автоматично ставиться поточна)
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // 🔥 ВАЖЛИВО: Премодерація
        // false = відгук бачить тільки адмін. 
        // true = адмін натиснув "ОК", і відгук з'явився на сайті.
        public bool IsApproved { get; set; } = false;
    }
}