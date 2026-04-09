import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingDatePicker from '../../components/BookingDatePicker/BookingDatePicker';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState('1 гість');

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
    navigate(`/booking?start=${startDate.toISOString()}&end=${endDate.toISOString()}&guests=${guests}`);
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
            {/* ТУТ ПРАЦЮЄ НАШ ВИДІЛЕНИЙ КОМПОНЕНТ КАЛЕНДАРЯ */}
            <BookingDatePicker 
              dateRange={dateRange} 
              setDateRange={setDateRange} 
              isMobile={isMobile} 
            />
          </div>

          <div className="widget-group guests-widget-group">
            <label>Гості</label>
            <select className="custom-date-input" value={guests} onChange={(e) => setGuests(e.target.value)}>
              <option value="1">1 гість</option>
              <option value="2">2 гості</option>
              <option value="3">3 гості</option>
              <option value="4+">4+ гостей</option>
            </select>
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