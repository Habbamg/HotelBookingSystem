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
// 1. ЖОРСТКА ПРИВ'ЯЗКА ДО ПОРТУ (ВИМКНЕНО)
// ==========================================
// builder.WebHost.UseUrls("http://*:5000");

// 2. Додаємо сервіси
builder.Services.AddControllers().AddJsonOptions(x =>
   x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
builder.Services.AddEndpointsApiExplorer();

// 3. CORS (Дозволяємо React заходити з будь-якого сайту - ідеально для диплому)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 4. База даних (Беремо підключення з appsettings.json!)
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
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
        // Додаємо CORS заголовки навіть до 401 відповідей
        options.Events = new JwtBearerEvents
        {
            OnChallenge = context =>
            {
                context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
                context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Authorization");
                return Task.CompletedTask;
            }
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
// 6. ЗАПУСК (ПРАВИЛЬНИЙ ПОРЯДОК)
// ==========================================
app.UseDeveloperExceptionPage();
// Swagger працюватиме завжди
app.UseSwagger();
app.UseSwaggerUI();

// 1. Маршрутизація (ПЕРШОЮ)
app.UseRouting();

// 2. CORS (після UseRouting, але ДО UseAuthentication — так вимагає документація Microsoft)
app.UseCors("AllowAll");

// 3. Авторизація і контролери
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();