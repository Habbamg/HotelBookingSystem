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

        // 🔥 ВИПРАВЛЕНО: Додано :int, щоб не плутати з "search" 🔥
        // GET: api/room/{id}
        // Цей метод віддає інформацію про ОДИН конкретний номер (для сторінки оформлення)
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Room>> GetRoomById(int id)
        {
            var room = await _context.Rooms
                .Include(r => r.Images)
                .Include(r => r.Amenities)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null)
                return NotFound("Кімната не знайдена");

            return Ok(room);
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
        [HttpPost("{id:int}/media")]
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
        // 🔥 ВИПРАВЛЕНО: Залишено тільки один атрибут [HttpGet("search")] 🔥
        [HttpGet("search")]
        public async Task<ActionResult<List<Room>>> SearchRooms(
            DateTime checkIn,
            DateTime checkOut,
            int adults = 1,
            int children = 0)
        {
            // 1. Валідація дат
            if (checkIn.Date < DateTime.Today || checkOut.Date <= checkIn.Date)
            {
                return BadRequest("Некоректні дати бронювання.");
            }

            int totalPeople = adults + children;

            var availableRooms = await _context.Rooms
                .Include(r => r.Images)
                .Include(r => r.Amenities)
                // 2. Відсіюємо неактивні та ті, що не підходять по місткості
                .Where(r => r.IsActive && (r.BaseCapacity + 2) >= totalPeople)

                // 3. Відсіюємо зайняті іншими клієнтами (існуючі броні)
                .Where(r => !r.Bookings.Any(b =>
                    b.Status != "Cancelled" &&
                    (checkIn < b.CheckOutDate && checkOut > b.CheckInDate)
                ))

                // 4. НОВЕ: Відсіюємо закриті адміністратором дати
                // Якщо в діапазоні дат є хоча б один день, де IsAvailable == false, номер відкидається
                .Where(r => !r.Availabilities.Any(a =>
                    a.Date >= checkIn &&
                    a.Date < checkOut &&
                    a.IsAvailable == false
                ))
                .ToListAsync();

            return Ok(availableRooms);
        }

        // 5. POST: api/room/{roomId}/amenity/{amenityId}
        // Метод, щоб додати зручність до кімнати
        [Authorize(Roles = "Admin")]
        [HttpPost("{roomId:int}/amenity/{amenityId:int}")]
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

        // 6. PUT: api/room/{id}
        // Метод для повного оновлення текстових і числових характеристик номера
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] Room updatedRoom)
        {
            // Знаходимо існуючий номер у базі
            var room = await _context.Rooms.FindAsync(id);

            if (room == null)
                return NotFound("Кімната не знайдена");

            // Оновлюємо базові поля
            room.Name = updatedRoom.Name;
            room.Description = updatedRoom.Description;
            room.IsActive = updatedRoom.IsActive;
            room.BasePrice = updatedRoom.BasePrice;
            room.ExtraPersonPrice = updatedRoom.ExtraPersonPrice;
            room.MinBookingDays = updatedRoom.MinBookingDays;
            room.BaseCapacity = updatedRoom.BaseCapacity;
            room.MaxCapacity = updatedRoom.MaxCapacity;
            room.Area = updatedRoom.Area;
            room.RoomsCount = updatedRoom.RoomsCount;

            // Зберігаємо зміни
            await _context.SaveChangesAsync();

            return Ok(room);
        }

        // 7. DELETE: api/room/{roomId}/amenity/{amenityId}
        // Метод для видалення зручності з конкретного номера
        [Authorize(Roles = "Admin")]
        [HttpDelete("{roomId:int}/amenity/{amenityId:int}")]
        public async Task<ActionResult> RemoveAmenityFromRoom(int roomId, int amenityId)
        {
            // Завантажуємо кімнату разом із її поточними зручностями
            var room = await _context.Rooms
                .Include(r => r.Amenities)
                .FirstOrDefaultAsync(r => r.Id == roomId);

            if (room == null)
                return NotFound("Кімната не знайдена");

            // Шукаємо зручність всередині списку цієї кімнати
            var amenity = room.Amenities.FirstOrDefault(a => a.Id == amenityId);
            if (amenity == null)
                return NotFound("Ця зручність не прив'язана до даної кімнати");

            // Видаляємо зв'язок із колекції
            room.Amenities.Remove(amenity);

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Зручність успішно видалено з номера '{room.Name}'" });
        }

        // 8. DELETE: api/room/{id}
        // Метод для видалення номера
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            // Шукаємо кімнату разом із її фотографіями та зручностями
            var room = await _context.Rooms
                .Include(r => r.Amenities)
                .Include(r => r.Images)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null) return NotFound("Кімната не знайдена");

            // 1. Відв'язуємо всі зручності (щоб не було помилки бази)
            room.Amenities.Clear();

            // 2. Видаляємо всі фотографії, пов'язані з цим номером
            if (room.Images.Any())
            {
                _context.RoomImages.RemoveRange(room.Images);
            }

            // 3. Тепер безпечно видаляємо сам номер
            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Номер успішно видалено" });
        }

        // 9. PUT: api/room/{id}/sync-images
        // Метод для оновлення списку фотографій
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}/sync-images")]
        public async Task<IActionResult> SyncRoomImages(int id, [FromBody] List<string> imageUrls)
        {
            var room = await _context.Rooms
                .Include(r => r.Images)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null) return NotFound("Кімната не знайдена");

            // 1. Видаляємо всі існуючі фотографії цього номера (очищаємо сміття)
            _context.RoomImages.RemoveRange(room.Images);

            // 2. Додаємо нові посилання, якщо вони не пусті
            foreach (var url in imageUrls)
            {
                if (!string.IsNullOrWhiteSpace(url))
                {
                    room.Images.Add(new RoomImage
                    {
                        Url = url,
                        Type = "image",
                        IsMain = true,
                        RoomId = id
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Фотографії успішно оновлено" });
        }
    }
}