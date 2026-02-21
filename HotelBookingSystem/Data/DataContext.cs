using HotelBookingAPI.Entities;
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

        // 👇👇👇 ОСЬ ЦЕЙ НОВИЙ МЕТОД ВИПРАВЛЯЄ ПОПЕРЕДЖЕННЯ 👇👇👇
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
        }
    }
}