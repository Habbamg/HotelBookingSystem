using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelBookingAPI.Data;
using HotelBookingAPI.Entities;
using Microsoft.AspNetCore.Authorization;

namespace HotelBookingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly DataContext _context;

        public BookingController(DataContext context)
        {
            _context = context;
        }

        // 1. Створити бронювання (POST) - Доступно всім
        [HttpPost]
        public async Task<ActionResult<Booking>> CreateBooking(Booking booking)
        {
            // 1. Перевірка номера
            var room = await _context.Rooms.FindAsync(booking.RoomId);
            if (room == null) return NotFound("Такого номера не існує");

            // 2. Перевірка зайнятості
            var isBusy = await _context.Bookings.AnyAsync(b =>
                b.RoomId == booking.RoomId &&
                b.Status != "Cancelled" &&
                ((booking.CheckInDate >= b.CheckInDate && booking.CheckInDate < b.CheckOutDate) ||
                 (booking.CheckOutDate > b.CheckInDate && booking.CheckOutDate <= b.CheckOutDate) ||
                 (booking.CheckInDate <= b.CheckInDate && booking.CheckOutDate >= b.CheckOutDate)));

            if (isBusy) return BadRequest("Цей номер вже зайнятий на вибрані дати!");

            // 3. Розрахунки
            var days = (booking.CheckOutDate - booking.CheckInDate).Days;
            if (days < room.MinBookingDays) return BadRequest($"Мінімум {room.MinBookingDays} дні");

            decimal price = room.BasePrice;
            int extraPeople = (booking.Adults + booking.Children) - room.BaseCapacity;
            if (extraPeople > 0) price += (extraPeople * room.ExtraPersonPrice);

            booking.TotalPrice = price * days;

            // 4. Генерація коду
            booking.BookingCode = Guid.NewGuid().ToString().Substring(0, 4).ToUpper();
            booking.CreatedAt = DateTime.Now;
            booking.Status = "Confirmed";

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return Ok(booking);
        }

        // 2. 🔐 ПЕРЕВІРКА БРОНЮВАННЯ (Тільки Телефон + Код)
        [HttpGet("check-status")]
        public async Task<ActionResult<Booking>> CheckBookingStatus(string phone, string bookingCode)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.Room.Images)
                .FirstOrDefaultAsync(b => b.GuestPhone == phone && b.BookingCode == bookingCode);

            if (booking == null)
            {
                return NotFound("Бронювання не знайдено. Перевірте номер телефону та код.");
            }

            return Ok(booking);
        }

        // 3. 👮‍♂️ СКАСУВАННЯ
        [HttpPost("cancel")]
        public async Task<ActionResult> CancelBooking(string bookingCode)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.BookingCode == bookingCode);
            if (booking == null) return NotFound("Бронювання не знайдено");

            booking.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Бронювання {bookingCode} успішно скасовано." });
        }

        // 4. Подивитися ВCІ бронювання (Тільки Адмін)
        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<ActionResult<List<Booking>>> GetAllBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Room)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Ok(bookings);
        }

        // 5. Зміна статусу бронювання (ВИПРАВЛЕНО: без FromBody)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, string newStatus)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound("Бронювання не знайдено");

            booking.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(booking);
        }
    }
}