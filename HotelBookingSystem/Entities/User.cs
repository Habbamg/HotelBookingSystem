namespace HotelBookingAPI.Entities
{
    public class User
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty; // Логін

        public string Email { get; set; } = string.Empty;    // Для відновлення пароля

        // 🔒 БЕЗПЕКА
        // Ми ніколи не зберігаємо пароль як "12345". 
        // Ми зберігаємо його "Хеш" (зашифрований вигляд).
        public string PasswordHash { get; set; } = string.Empty;

        // Роль користувача. Поки що буде "Admin". 
        // В майбутньому можна додати "Cleaner" (Прибиральниця), яка бачить тільки графік прибирання.
        public string Role { get; set; } = "Admin";
    }
}