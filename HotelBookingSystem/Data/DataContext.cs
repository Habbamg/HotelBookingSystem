using HotelBookingAPI.Entities;
using HotelBookingSystem.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingAPI.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomImage> RoomImages { get; set; }
        public DbSet<Amenity> Amenities { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<HotelSetting> HotelSettings { get; set; }

        public DbSet<RoomOccupancyRule> RoomOccupancyRules { get; set; }

        // 👇 ДОДАЛИ НОВУ ТАБЛИЦЮ ДЛЯ КАЛЕНДАРЯ ДОСТУПНОСТІ ТА ЦІН 👇
        public DbSet<RoomAvailability> RoomAvailabilities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Налаштовуємо точність для грошей у Кімнатах
            modelBuilder.Entity<Room>()
                .Property(r => r.BasePrice)
                .HasColumnType("decimal(18, 0)");

            modelBuilder.Entity<Room>()
                .Property(r => r.ExtraPersonPrice)
                .HasColumnType("decimal(18, 0)");

            // Налаштовуємо точність для грошей у Бронюваннях
            modelBuilder.Entity<Booking>()
                .Property(b => b.TotalPrice)
                .HasColumnType("decimal(18, 0)");

            modelBuilder.Entity<RoomAvailability>()
                .Property(ra => ra.CustomPrice)
                .HasColumnType("decimal(18, 0)");

            // 👇 НАЛАШТУВАННЯ УНІКАЛЬНОГО ІНДЕКСУ ДЛЯ КАЛЕНДАРЯ 👇
            // Комбінація RoomId + Date має бути єдиною, щоб не було дублів дат для одного номера
            modelBuilder.Entity<RoomAvailability>()
                .HasIndex(ra => new { ra.RoomId, ra.Date })
                .IsUnique();
            // Налаштування унікальності: один номер = одне правило для конкретної кількості гостей
            modelBuilder.Entity<RoomOccupancyRule>()
                .HasIndex(r => new { r.RoomId, r.GuestCount })
                .IsUnique();
        }
    }
}