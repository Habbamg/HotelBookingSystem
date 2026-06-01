using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelBookingAPI.Data;
using HotelBookingAPI.Entities;
using BCrypt.Net;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace HotelBookingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IConfiguration _configuration; // Інструмент для читання appsettings.json

        // Ми додаємо IConfiguration у конструктор, щоб отримати доступ до "Печатки"
        public AuthController(DataContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(string username, string email, string password)
        {
            if (await _context.Users.AnyAsync(u => u.Username == username))
                return BadRequest("Користувач існує.");

            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = "Admin"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login([FromBody] LoginRequest request)
        {
            // Звертаємося до request.Username
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null) return BadRequest("Користувача не знайдено.");

            // Звертаємося до request.Password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)) return BadRequest("Невірний пароль.");

            string token = CreateToken(user);
            return Ok(token);
        }

        // 👇 ПРИВАТНИЙ МЕТОД ГЕНЕРАЦІЇ ТОКЕНА 👇
        private string CreateToken(User user)
        {
            // 1. Створюємо "Паспортні дані" (Claims), які будуть зашиті всередині токена
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role), // Важливо! Тут ми кажемо, що він Admin
                new Claim(ClaimTypes.Email, user.Email)
            };

            // 2. Дістаємо нашу "Секретну Печатку" з налаштувань
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value!));

            // 3. Шифруємо печатку (алгоритм HmacSha512)
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            // 4. Збираємо токен
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1), // Токен діє 1 день
                signingCredentials: creds
            );

            // 5. Перетворюємо його у стрічку
            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return jwt;
        }
    }
}
public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}