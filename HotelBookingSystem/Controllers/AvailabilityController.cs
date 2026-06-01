using HotelBookingAPI.Data; // Твій DataContext тут
using HotelBookingSystem.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
// Якщо DTO або Entities підкреслює червоним, додай потрібні using через Ctrl+.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HotelBookingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AvailabilityController : ControllerBase
    {
        private readonly DataContext _context;

        public AvailabilityController(DataContext context)
        {
            _context = context;
        }

        // 1. Отримання даних для відмальовки календаря
      
        [HttpGet]
        public async Task<IActionResult> GetAvailability([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            var availabilities = await _context.RoomAvailabilities
                .Where(ra => ra.Date >= start.Date && ra.Date <= end.Date)
                .ToListAsync();

            return Ok(availabilities);
        }

        // 2. Збереження налаштувань (ціна, статус) з бокової панелі
        [HttpPost("bulk-update")]
        public async Task<IActionResult> BulkUpdate([FromBody] HotelBookingSystem.Dtos.BulkEditAvailabilityDto dto) // Шлях до DTO зі скріншота
        {
            if (dto.FromDate.Date > dto.ToDate.Date)
            {
                return BadRequest("Дата 'Від' не може бути більшою за дату 'По'.");
            }

            var room = await _context.Rooms.FindAsync(dto.RoomId);
            if (room == null) return NotFound("Номер не знайдено.");

            var existingAvailabilities = await _context.RoomAvailabilities
                .Where(ra => ra.RoomId == dto.RoomId && ra.Date >= dto.FromDate.Date && ra.Date <= dto.ToDate.Date)
                .ToDictionaryAsync(ra => ra.Date.Date);

            var toUpdate = new List<dynamic>(); // Використовуємо var для спрощення
            var availabilitiesToUpdate = new List<dynamic>(); // Тимчасові списки
            var availabilitiesToAdd = new List<dynamic>();

            // Запускаємо цикл по кожному дню з вибраного діапазону
            for (DateTime date = dto.FromDate.Date; date <= dto.ToDate.Date; date = date.AddDays(1))
            {
                if (existingAvailabilities.TryGetValue(date, out var existing))
                {
                    // Оновлюємо існуючий день
                    if (dto.Price.HasValue) existing.CustomPrice = dto.Price.Value;
                    if (dto.Status == "open") existing.IsAvailable = true;
                    if (dto.Status == "closed") existing.IsAvailable = false;
                    if (dto.MinStay.HasValue) existing.MinStayDays = dto.MinStay.Value;

                    _context.RoomAvailabilities.Update(existing);
                }
                else
                {
                    // Створюємо новий запис на цей день
                    var newAvailability = new HotelBookingSystem.Entities.RoomAvailability // Шлях до Entity
                    {
                        RoomId = dto.RoomId,
                        Date = date,
                        IsAvailable = true // По замовчуванню відкрито
                    };

                    if (dto.Price.HasValue) newAvailability.CustomPrice = dto.Price.Value;
                    if (dto.Status == "open") newAvailability.IsAvailable = true;
                    if (dto.Status == "closed") newAvailability.IsAvailable = false;
                    if (dto.MinStay.HasValue) newAvailability.MinStayDays = dto.MinStay.Value;

                    _context.RoomAvailabilities.Add(newAvailability);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Календар успішно оновлено!" });
        }

        // 3. Отримання всіх правил знижок для таблиці
        [HttpGet("occupancy-rules")]
        public async Task<IActionResult> GetOccupancyRules()
        {
            var rules = await _context.RoomOccupancyRules.ToListAsync();
            return Ok(rules);
        }

        // 4. Збереження або оновлення правила знижки
        [HttpPost("occupancy-rule")]
        public async Task<IActionResult> SaveOccupancyRule([FromBody] HotelBookingSystem.Dtos.SaveOccupancyRuleDto dto)
        {
            // Шукаємо, чи є вже правило для цього номера і цієї кількості гостей
            var existingRule = await _context.RoomOccupancyRules
                .FirstOrDefaultAsync(r => r.RoomId == dto.RoomId && r.GuestCount == dto.GuestCount);

            if (existingRule != null)
            {
                // Якщо є — просто оновлюємо суму знижки
                existingRule.DiscountAmount = dto.Discount;
                _context.RoomOccupancyRules.Update(existingRule);
            }
            else
            {
                // Якщо немає — створюємо нове правило
                var newRule = new HotelBookingSystem.Entities.RoomOccupancyRule
                {
                    RoomId = dto.RoomId,
                    GuestCount = dto.GuestCount,
                    DiscountAmount = dto.Discount
                };
                _context.RoomOccupancyRules.Add(newRule);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Тарифне правило успішно збережено!" });
        }
        [HttpPut("update-capacity")]
        public async Task<IActionResult> UpdateCapacity([FromBody] UpdateCapacityDto dto)
        {
            // Шукаємо номер в базі
            var room = await _context.Rooms.FindAsync(dto.RoomId);
            if (room == null)
            {
                return NotFound("Номер не знайдено");
            }

            // Оновлюємо місткість
            room.MaxCapacity = dto.MaxCapacity;

            // Зберігаємо зміни
            await _context.SaveChangesAsync();

            return Ok(new { message = "Місткість успішно оновлено" });
        }
    }
}