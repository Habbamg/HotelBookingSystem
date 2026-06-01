using HotelBookingAPI.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. ЖОРСТКА ПРИВ'ЯЗКА ДО ПОРТУ 5000 🔒
// ==========================================
builder.WebHost.UseUrls("http://*:5000");

// 2. Додаємо сервіси
builder.Services.AddControllers().AddJsonOptions(x =>
   x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();

// 3. CORS (Дозволяємо React заходити з будь-якого порту, щоб точно запрацювало)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 4. База даних
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=HotelDiplomDb;Trusted_Connection=true;TrustServerCertificate=true;");
});

// 5. Авторизація і Swagger
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value!)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Description = "Auth",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    options.OperationFilter<SecurityRequirementsOperationFilter>();
});

var app = builder.Build();

// ==========================================
// 6. ЗАПУСК (ВЖИВАЄМО ПРАВИЛЬНИЙ ПОРЯДОК)
// ==========================================
app.UseSwagger();
app.UseSwaggerUI();

// 1. Спочатку маршрутизація
app.UseRouting();

// 2. ПОТІМ CORS (назва має точно співпадати з політикою вище)
app.UseCors("AllowAll");

// 3. А вже потім авторизація і контролери
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();