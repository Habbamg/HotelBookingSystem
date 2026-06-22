using HotelBookingAPI.Data;
using HotelBookingAPI.Entities;
using Microsoft.AspNetCore.Authorization; // Обов'язково для [Authorize]
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly DataContext _context;

        public ReviewController(DataContext context)
        {
            _context = context;
        }

        // 1. ДЛЯ КЛІЄНТІВ (Отримати тільки схвалені)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetApprovedReviews()
        {
            var reviews = await _context.Reviews
                .Where(r => r.IsApproved == true)
                .OrderByDescending(r => r.CreatedAt) // Найновіші зверху
                .ToListAsync();

            return Ok(reviews);
        }

        // 2. ДЛЯ КЛІЄНТІВ (Залишити відгук)
        [HttpPost]
        public async Task<ActionResult<Review>> CreateReview([FromBody] Review review)
        {
            review.CreatedAt = DateTime.Now;
            review.IsApproved = false; // Обов'язкова модерація
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return Ok(review);
        }

        // ==========================================
        // 🔥 МЕТОДИ ДЛЯ АДМІНА (Захищені токеном) 🔥
        // ==========================================

        // 3. Отримати ВСІ відгуки (і нові, і старі)
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Review>>> GetAllReviews()
        {
            var reviews = await _context.Reviews
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }

        // 4. Схвалити відгук
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound("Відгук не знайдено");

            review.IsApproved = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // 5. Видалити відгук (якщо це спам або нецензурщина)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound("Відгук не знайдено");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}