import { useState, useEffect } from 'react';
import './Booking.css';

function Booking() {
  const [rooms, setRooms] = useState([]);

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
    <section className="rooms-section">
      <h2>Бронювання номерів</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
        Оберіть ідеальний номер для вашого відпочинку
      </p>
      
      <div className="rooms-grid">
        {rooms.length > 0 ? (
          rooms.map((room) => {
            // Підтягуємо фото з бази або ставимо заглушку
            const imageToShow = room.imageUrl || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80";

            return (
              <div key={room.id} className="room-card">
                <div 
                  className="room-image-placeholder"
                  style={{ backgroundImage: `url(${imageToShow})` }}
                ></div>
                
                <div className="room-info">
                  <h3>{room.title || "Назва номера"}</h3>
                  <p className="room-price">{room.price} грн / доба</p>
                  <button className="btn-secondary">Обрати</button>
                </div>
              </div>
            );
          })
        ) : (
          <p>Завантаження номерів...</p>
        )}
      </div>
    </section>
  );
}

export default Booking;