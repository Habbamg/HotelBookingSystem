import React, { useState } from 'react';
// Перевір правильність шляху до твого компонента календаря!
import BookingDatePicker from './BookingDatePicker'; 

function ClientStorefront() {
  // 1. Стейт для збереження дат із твого календаря [checkIn, checkOut]
  const [dateRange, setDateRange] = useState([null, null]);
  
  // 2. Стейт для масиву вільних номерів, які прийдуть від бекенда
  const [availableRooms, setAvailableRooms] = useState([]);
  
  // 3. Стейти для UI (завантаження та перевірка, чи вже був натиснутий пошук)
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // --- ФУНКЦІЯ ПОШУКУ ---
  const handleSearch = async () => {
    const [checkIn, checkOut] = dateRange;
    
    if (!checkIn || !checkOut) {
      alert("Будь ласка, оберіть повний період проживання (дати заїзду та виїзду)!");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Надійно форматуємо дати у вигляд YYYY-MM-DD для C# бекенда
      const formatToLocalString = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().split('T')[0];
      };

      const checkInStr = formatToLocalString(checkIn);
      const checkOutStr = formatToLocalString(checkOut);
      
      // Поки що фіксуємо пошук для 2 дорослих (додамо селектор гостей пізніше, якщо потрібно)
      const adults = 2; 

      // Робимо запит на твій оновлений C# метод
      const response = await fetch(
        `/api/room/search?checkIn=${checkInStr}&checkOut=${checkOutStr}&adults=${adults}`
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableRooms(data); // Записуємо знайдені номери в стейт
      } else {
        alert("Помилка при пошуку номерів на сервері.");
      }
    } catch (error) {
      console.error("Помилка з'єднання з бекендом:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="client-storefront" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      
      {/* --- БЛОК ПОШУКУ (Шапка) --- */}
      <header style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Гостинний двір Буковець</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Оберіть дати вашого відпочинку, щоб перевірити доступність номерів</p>
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', zIndex: 100 }}>
            <BookingDatePicker 
              dateRange={dateRange} 
              setDateRange={setDateRange} 
              isMobile={window.innerWidth <= 768} 
            />
          </div>
          <button 
            onClick={handleSearch} 
            disabled={isSearching}
            style={{ 
              padding: '14px 28px', 
              backgroundColor: '#1b4332', 
              color: 'white', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: isSearching ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'background 0.2s'
            }}
          >
            {isSearching ? 'Шукаємо...' : 'Знайти номери'}
          </button>
        </div>
      </header>

      {/* --- БЛОК РЕЗУЛЬТАТІВ --- */}
      <main style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
        
        {isSearching && <h3 style={{ textAlign: 'center', color: '#555' }}>Шукаємо найкращі варіанти...</h3>}
        
        {/* Якщо пошук відбувся, але вільних номерів немає */}
        {!isSearching && hasSearched && availableRooms.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #ffdcdc' }}>
            <h3 style={{ color: '#e63946' }}>На жаль, на ці дати немає вільних номерів.</h3>
            <p style={{ color: '#666' }}>Вони можуть бути закриті або вже заброньовані іншими гостями. Спробуйте змінити дати.</p>
          </div>
        )}

        {/* Якщо номери знайдено */}
        {!isSearching && availableRooms.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>
              Знайдено вільних номерів: {availableRooms.length}
            </h3>
            
            {availableRooms.map(room => (
              <div key={room.id} style={{ 
                border: '1px solid #eaeaea', 
                padding: '20px', 
                borderRadius: '12px', 
                display: 'flex', 
                gap: '25px', 
                backgroundColor: '#fff',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
              }}>
                
                {/* Фотографія номера */}
                <div style={{ width: '280px', height: '200px', backgroundColor: '#f0f0f0', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  {room.images && room.images.length > 0 ? (
                    <img src={room.images[0].url} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>Фото відсутнє</div>
                  )}
                </div>
                
                {/* Опис та ціна */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                  <div>
                    <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.6rem' }}>{room.name}</h2>
                    <p style={{ color: '#666', margin: '0 0 8px 0', fontSize: '0.95rem' }}>Місткість: до {room.baseCapacity} гостей</p>
                    <p style={{ color: '#555', margin: '0 0 15px 0', lineHeight: '1.5' }}>
                      {room.description ? room.description : "Затишний номер для вашого ідеального відпочинку."}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <span style={{ fontSize: '0.9rem', color: '#888', display: 'block', marginBottom: '4px' }}>Вартість за ніч</span>
                      <h3 style={{ margin: 0, color: '#1b4332', fontSize: '1.8rem' }}>
                        {room.basePrice} ₴
                      </h3>
                    </div>
                    
                    <button style={{ 
                      padding: '12px 24px', 
                      backgroundColor: '#e63946', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#d62828'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#e63946'}
                    >
                      Вибрати номер
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ClientStorefront;