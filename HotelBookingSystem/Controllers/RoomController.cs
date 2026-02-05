using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelBookingAPI.Data;
using HotelBookingAPI.Entities;
using Microsoft.AspNetCore.Authorization;

namespace HotelBookingAPI.Controllers
{
    // Це адреса, за якою сайт буде звертатися: https://localhost:xxxx/api/room
    [Route("api/[controller]")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly DataContext _context;

        // Тут ми "беремо кухню" (базу даних) в роботу
        public RoomController(DataContext context)
        {
            _context = context;
        }

        // 1. GET: api/room
        // Цей метод віддає список всіх номерів
        [HttpGet]
        public async Task<ActionResult<List<Room>>> GetAllRooms()
        {
            // Йдемо в базу -> беремо таблицю Rooms -> підтягуємо Картинки і Зручності -> перетворюємо в список
            var rooms = await _context.Rooms
                .Include(r => r.Images)     // Важливо! Не забудь завантажити фото
                .Include(r => r.Amenities)  // Важливо! Не забудь завантажити зручності
                .ToListAsync();

            return Ok(rooms); // Повертаємо статус 200 OK і список
        }

        // 2. POST: api/room
        // Цей метод додає новий номер
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Room>> CreateRoom(Room room)
        {
            // Додаємо в чергу
            _context.Rooms.Add(room);

            // Зберігаємо зміни фізично в базу
            await _context.SaveChangesAsync();

            return Ok(room); // Повертаємо доданий номер
        }

        // 3. POST: api/room/{id}/media
        // Окремий метод, щоб додати фото або відео до існуючої кімнати
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/media")]
        public async Task<ActionResult<RoomImage>> AddRoomMedia(int id, [FromBody] RoomImage media)
        {
            // 1. Перевіряємо, чи існує така кімната
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
                return NotFound("Кімната не знайдена");

            // 2. Валідація для РЕАЛЬНОГО проекту (щоб адмін не написав дурниць)
            if (media.Type != "image" && media.Type != "video")
            {
                return BadRequest("Тип медіа має бути тільки 'image' або 'video'");
            }

            // 3. Прив'язуємо медіа до кімнати
            media.RoomId = id;

            _context.RoomImages.Add(media);
            await _context.SaveChangesAsync();

            return Ok(media);
        }

        // 4. GET: api/room/search
        // Найважливіший метод: Пошук вільних номерів
        [HttpGet("search")]
        public async Task<ActionResult<List<Room>>> SearchRooms(
            DateTime checkIn,
            DateTime checkOut,
            int adults = 1,
            int children = 0)
        {
            // Валідація дат (щоб не ввели минуле або виїзд раніше заїзду)
            if (checkIn < DateTime.Today || checkOut <= checkIn)
            {
                return BadRequest("Некоректні дати бронювання.");
            }

            // Загальна кількість людей
            int totalPeople = adults + children;

            // 🔥 МАГІЯ EF CORE: Фільтрація
            var availableRooms = await _context.Rooms
                .Include(r => r.Images)
                .Include(r => r.Amenities)
                // 1. Відсіюємо ті, що не підходять по місткості
                .Where(r => r.IsActive && (r.BaseCapacity + 2) >= totalPeople)
                // 2. Відсіюємо ті, що ЗАЙНЯТІ в ці дати
                .Where(r => !r.Bookings.Any(b =>
                    b.Status != "Cancelled" && // Ігноруємо скасовані броні
                    (
                        // Перевірка на перетин дат (Класична формула)
                        (checkIn >= b.CheckInDate && checkIn < b.CheckOutDate) ||
                        (checkOut > b.CheckInDate && checkOut <= b.CheckOutDate) ||
                        (checkIn <= b.CheckInDate && checkOut >= b.CheckOutDate)
                    )
                ))
                .ToListAsync();

            return Ok(availableRooms);
        }

        // 5. POST: api/room/{roomId}/amenity/{amenityId}
        // Метод, щоб додати зручність до кімнати
        [Authorize(Roles = "Admin")]
        [HttpPost("{roomId}/amenity/{amenityId}")]
        public async Task<ActionResult> AddAmenityToRoom(int roomId, int amenityId)
        {
            // 1. Шукаємо кімнату (обов'язково вантажимо існуючі зручності через Include!)
            var room = await _context.Rooms
                .Include(r => r.Amenities)
                .FirstOrDefaultAsync(r => r.Id == roomId);

            if (room == null)
                return NotFound("Кімната не знайдена");

            // 2. Шукаємо зручність
            var amenity = await _context.Amenities.FindAsync(amenityId);
            if (amenity == null)
                return NotFound("Зручність не знайдена");

            // 3. Перевірка: чи не додали ми цю зручність раніше?
            if (room.Amenities.Any(a => a.Id == amenityId))
            {
                return BadRequest("Ця зручність вже є в цій кімнаті");
            }

            // 4. Додаємо зв'язок
            room.Amenities.Add(amenity);

            // 5. Зберігаємо
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Зручність '{amenity.Name}' успішно додано до кімнати '{room.Name}'" });
        }

    }
}