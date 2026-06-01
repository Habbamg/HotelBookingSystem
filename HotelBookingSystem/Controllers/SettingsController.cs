using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelBookingAPI.Data;
using HotelBookingAPI.Entities;
using Microsoft.AspNetCore.Authorization;

namespace HotelBookingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private readonly DataContext _context;

        public SettingsController(DataContext context)
        {
            _context = context;
        }

        // GET: api/settings
        // Цей метод викликатиме клієнтський календар
        [HttpGet]
        public async Task<ActionResult<HotelSetting>> GetSettings()
        {
            var settings = await _context.HotelSettings.FirstOrDefaultAsync();

            // Якщо ми ще нічого не налаштували, створимо дефолтні налаштування (напр. +3 місяці)
            if (settings == null)
            {
                settings = new HotelSetting { MaxBookingDate = DateTime.Today.AddMonths(3) };
                _context.HotelSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(settings);
        }

        // PUT: api/settings
        // Цей метод викликатиме адмінка для збереження нової дати
        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<IActionResult> UpdateSettings([FromBody] HotelSetting updatedSettings)
        {
            var settings = await _context.HotelSettings.FirstOrDefaultAsync();

            if (settings == null)
            {
                _context.HotelSettings.Add(updatedSettings);
            }
            else
            {
                settings.MaxBookingDate = updatedSettings.MaxBookingDate;
            }

            await _context.SaveChangesAsync();
            return Ok(settings);
        }
    }
}