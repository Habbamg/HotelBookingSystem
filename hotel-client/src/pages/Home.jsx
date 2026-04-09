import { useState, useEffect, forwardRef, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale, CalendarContainer } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { uk } from 'date-fns/locale/uk';
import { format, differenceInDays } from 'date-fns';
import './Home.css';

// Підключаємо українську мову
registerLocale('uk', uk);

// =========================================
// КОНТЕЙНЕР ДЛЯ МОБІЛКИ
// =========================================
const MobileCalendarContainer = ({ className, children }) => {
  return (
    <div className="mobile-modal-inner">
      {/* 1. ФІКСОВАНА ШАПКА */}
      <div className="mobile-modal-header">
        <span className="mobile-modal-title">Оберіть дати</span>
        <button 
          type="button" 
          className="mobile-modal-close" 
          onClick={() => {
            // Хитрий трюк для закриття календаря ззовні компонента Home
            const btn = document.getElementById('hidden-close-btn');
            if (btn) btn.click();
          }}
        >
          ✕
        </button>
      </div>

      {/* 2. ФІКСОВАНІ ДНІ ТИЖНЯ */}
      <div className="mobile-fixed-weekdays">
        <div>Пн</div>
        <div>Вт</div>
        <div>Ср</div>
        <div>Чт</div>
        <div>Пт</div>
        <div className="weekend">Сб</div>
        <div className="weekend">Нд</div>
      </div>

      {/* 3. ТІЛО З ПРОКРУТКОЮ (МІСЯЦІ ТА ПІДВАЛ) */}
      <div className="mobile-modal-body">
        <CalendarContainer className={className}>
          {children}
        </CalendarContainer>
      </div>
    </div>
  );
};

// =========================================
// Кастомна кнопка, що імітує два вікна
// =========================================
const CustomDateButton = forwardRef(({ onClick, startDate, endDate }, ref) => {
  const formatDisplayDate = (date, placeholder) => {
    if (!date) return placeholder;
    return format(date, 'dd.MM.yy'); 
  };

  return (
    <button type="button" className="custom-date-range-trigger" onClick={onClick} ref={ref}>
      <div className="date-input-pill selects-start">
        <span className="pill-label">Дата заїзду</span>
        <span className="pill-date">{formatDisplayDate(startDate, 'Оберіть')}</span>
        <span className="pill-icon">📅</span> 
      </div>
      
      <div className="date-input-pill selects-end">
        <span className="pill-label">Дата виїзду</span>
        <span className="pill-date">{formatDisplayDate(endDate, 'Оберіть')}</span>
        <span className="pill-icon">📅</span>
      </div>
    </button>
  );
});

function Home() {
  const navigate = useNavigate();
  
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState('1 гість');

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const datePickerRef = useRef(null);

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

  const handleCloseCalendar = () => {
    if (datePickerRef.current) {
      datePickerRef.current.setOpen(false);
    }
  };

  const renderDayWithPrice = (day, date) => {
    const price = "1500"; 
    return (
      <div className="custom-calendar-day">
        <span className="day-number">{day}</span>
        <span className="day-price">{price}₴</span>
      </div>
    );
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
            <DatePicker
              ref={datePickerRef}
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              minDate={new Date()}
              locale="uk"
              shouldCloseOnSelect={!isMobile} 
              /*closeOnScroll={!isMobile}*/ /* Ховаємо календар при скролі сторінки */
              monthsShown={isMobile ? 6 : 2} 
              withPortal={isMobile} 
              portalId="root-portal" 
              popperPlacement="bottom"
              
              {...(isMobile ? { calendarContainer: MobileCalendarContainer } : {})}
              customInput={<CustomDateButton startDate={startDate} endDate={endDate} />}
              
              renderCustomHeader={({ monthDate, customHeaderCount, decreaseMonth, increaseMonth }) => (
                <div className="calendar-custom-header">
                  {!isMobile && (
                    <button 
                      type="button" 
                      onClick={decreaseMonth} 
                      className="calendar-nav-btn"
                      style={{ visibility: customHeaderCount === 1 ? 'hidden' : 'visible' }}
                    >
                      {"<"}
                    </button>
                  )}
                  
                  <span className="calendar-month-name">
                    {format(monthDate, 'LLLL yyyy', { locale: uk })}
                  </span>

                  {!isMobile && (
                    <button 
                    type="button" 
                      onClick={increaseMonth} 
                      className="calendar-nav-btn"
                      style={{ visibility: customHeaderCount === 0 ? 'hidden' : 'visible' }}
                    >
                      {">"}
                    </button>
                  )}
                </div>
              )}
              renderDayContents={renderDayWithPrice}
            >
              {/* ==================================================
                  ЛИПКИЙ ПІДВАЛ З КНОПКОЮ (СПІЛЬНИЙ)
                  ================================================== */}
              <div className="calendar-footer-content">
                {startDate && endDate ? (
                  <div className="calendar-date-summary-info">
                    <div className="summary-dates">
                      <span>
                        Заїзд {format(startDate, 'd MMMM', { locale: uk })} — Виїзд {format(endDate, 'd MMMM', { locale: uk })}
                      </span>
                      <span className="nights-count">
                        ( {differenceInDays(endDate, startDate)} ночі )
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="calendar-date-summary-panel-placeholder">
                    Будь ласка, оберіть повний період проживання
                  </div>
                )}
                
                {isMobile && (
                  <button 
                    type="button" 
                    className="btn-primary calendar-done-btn" 
                    onClick={handleCloseCalendar}
                  >
                    Підтвердити
                  </button>
                )}

              </div>
            </DatePicker>
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
          Тільки ви, чисте гірське повітря та абсолютний комфорт у кожній деталі. 
          Відчуйте справжню естетику відпочинку в Затишному Дворі.
        </p>
      </section>

      {/* Прихована кнопка для зв'язку між шапкою та функцією закриття */}
      <button 
        id="hidden-close-btn" 
        type="button" 
        style={{ display: 'none' }} 
        onClick={handleCloseCalendar}
      ></button>
    </>
  );
}

export default Home;