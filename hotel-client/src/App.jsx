import { useState, useEffect } from 'react';
import './App.css'; // Наш файл для краси

function App() {
  const [rooms, setRooms] = useState([]);

  // Завантажуємо номери з нашого бекенду
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/Room');
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        } else {
          console.error("Помилка завантаження номерів");
        }
      } catch (error) {
        console.error("Немає зв'язку з сервером", error);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="hotel-app">
      
      {/* 1. ШАПКА (Header) */}
      <header className="header">
        <div className="logo">Гостинний Двір</div>
        <nav className="nav-menu">
          <a href="#about">Про нас</a>
          <a href="#rooms">Номери</a>
          <a href="#contacts">Контакти</a>
        </nav>
      </header>

      {/* 2. ГОЛОВНИЙ ЕКРАН (Hero Section) */}
      <section className="hero">
        <div className="hero-content">
          <h1>Відпочинок, де зупиняється час</h1>
          <p>Ваш затишок у серці Карпат</p>
          <a href="#rooms" className="btn-primary">Обрати номер</a>
        </div>
      </section>

      {/* 3. ПРО НАС (About Section) */}
      <section id="about" className="about">
        <h2>Про Затишний Двір</h2>
        <p>
          Наш готель знаходиться у мальовничому куточку Карпат. 
          Це ідеальне місце для тих, хто хоче втекти від міської метушні, 
          насолодитися свіжим гірським повітрям та справжнім спокоєм.
        </p>
      </section>

      {/* 4. СПИСОК НОМЕРІВ (Rooms Section) */}
      <section id="rooms" className="rooms-section">
        <h2>Наші номери</h2>
        <div className="rooms-grid">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-image-placeholder">Фото номера</div>
                <div className="room-info">
                  <h3>{room.title || "Назва номера"}</h3>
                  <p className="room-price">{room.price} грн / доба</p>
                  <button className="btn-secondary">Бронювати</button>
                </div>
              </div>
            ))
          ) : (
            <p>Завантаження номерів...</p>
          )}
        </div>
      </section>

      {/* 5. ПІДВАЛ (Footer) */}
      <footer id="contacts" className="footer">
        <div className="footer-content">
          <h3>Контакти</h3>
          <p>📍 с. Буковець, Карпати</p>
          <p>📞 +380 (XX) XXX-XX-XX</p>
          <p>✉️ info@zatyshny-dvir.com</p>
        </div>
      </footer>

    </div>
  );
}

export default App;