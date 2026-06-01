import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingDatePicker from '../../components/BookingDatePicker/BookingDatePicker';
import GuestSelector from '../../components/GuestSelector/GuestSelector'; // <--- Імпортуємо новий компонент
import './Home.css';
import { format } from 'date-fns';

function Home() {
  const navigate = useNavigate();
  
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  
  // Змінюємо простий рядок на об'єкт (це набагато професійніше для Бази Даних)
  const [guestConfig, setGuestConfig] = useState({
    adults: 2,
    children: 0,
    rooms: 1
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

const handleSearch = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Будь ласка, оберіть повний період проживання (заїзд та виїзд).");
      return;
    }
    
    // ФІКС: Передаємо чисту дату без часових поясів (наприклад, 2026-05-15)
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');
    
    navigate(`/booking?start=${startStr}&end=${endStr}&adults=${guestConfig.adults}&children=${guestConfig.children}`);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Відпочинок, де зупиняється час</h1>
          <p>Ваш затишок у серці Карпат</p>
        </div>
      </section>

      <div className="search-widget-wrapper">
        <form className="search-widget" onSubmit={handleSearch}>
          
          <div className="widget-group date-widget-group" style={{ flex: 3 }}>
            <BookingDatePicker 
              dateRange={dateRange} 
              setDateRange={setDateRange} 
              isMobile={isMobile} 
            />
          </div>

          <div className="widget-group guests-widget-group" style={{ flex: 2 }}>
             {/* ВСТАВЛЯЄМО НАШ НОВИЙ КОМПОНЕНТ (прибрали старий label та select) */}
             <GuestSelector 
               guestConfig={guestConfig} 
               setGuestConfig={setGuestConfig} 
             />
          </div>

          <button type="submit" className="btn-primary search-btn">
            Знайти номер
          </button>
        </form>
      </div>

      <section className="about">
        <h2>Філософія відпочинку</h2>
        <p>
          Ми створили простір, де немає місця міському шуму. 
          Тільки ви, чисте гірське повітря та абсолютний комфорт.
        </p>
      </section>
    </>
  );
}

export default Home;