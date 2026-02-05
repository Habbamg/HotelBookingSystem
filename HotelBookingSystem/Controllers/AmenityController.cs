using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelBookingAPI.Data;
using HotelBookingAPI.Entities;

namespace HotelBookingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AmenityController : ControllerBase
    {
        private readonly DataContext _context;

        public AmenityController(DataContext context)
        {
            _context = context;
        }

        // 1. Отримати весь список зручностей
        [HttpGet]
        public async Task<ActionResult<List<Amenity>>> GetAll()
        {
            return Ok(await _context.Amenities.ToListAsync());
        }

        // 2. Створити нову зручність (напр. "Wi-Fi")
        [HttpPost]
        public async Task<ActionResult<Amenity>> Create(Amenity amenity)
        {
            _context.Amenities.Add(amenity);
            await _context.SaveChangesAsync();
            return Ok(amenity);
        }

        // 3. Змінити (напр. виправити помилку в назві)
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, Amenity amenity)
        {
            var dbAmenity = await _context.Amenities.FindAsync(id);
            if (dbAmenity == null)
                return NotFound("Зручність не знайдена");

            dbAmenity.Name = amenity.Name;
            dbAmenity.IconClass = amenity.IconClass; // Наприклад "fa-wifi" для іконки

            await _context.SaveChangesAsync();
            return Ok(dbAmenity);
        }

        // 4. Видалити
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var amenity = await _context.Amenities.FindAsync(id);
            if (amenity == null)
                return NotFound();

            _context.Amenities.Remove(amenity);
            await _context.SaveChangesAsync();
            return Ok("Видалено");
        }
    }
}