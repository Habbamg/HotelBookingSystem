import React, { forwardRef, useRef, useState, useEffect } from 'react';
import DatePicker, { registerLocale, CalendarContainer } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { uk } from 'date-fns/locale/uk';
import { format, differenceInDays } from 'date-fns';

// 1. ІМПОРТУЄМО ПРОФЕСІЙНІ SVG-ІКОНКИ (Feather Icons)
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'; 

import './BookingDatePicker.css';

registerLocale('uk', uk);

const MobileCalendarContainer = ({ className, children }) => {
  return (
    <div className="mobile-modal-inner">
      <div className="mobile-modal-header">
        <span className="mobile-modal-title">Оберіть дати</span>
        <button 
          type="button" 
          className="mobile-modal-close" 
          onClick={() => {
            const btn = document.getElementById('hidden-close-btn');
            if (btn) btn.click();
          }}
        >
          ✕
        </button>
      </div>

      <div className="mobile-fixed-weekdays">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div>
        <div className="weekend">Сб</div><div className="weekend">Нд</div>
      </div>

      <div className="mobile-modal-body">
        <CalendarContainer className={className}>
          {children}
        </CalendarContainer>
      </div>
    </div>
  );
};

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
        
        {/* 2. ЗАМІНИЛИ ЕМОДЗІ НА SVG-КОМПОНЕНТ */}
        <span className="pill-icon"><FiCalendar /></span> 
      </div>
      
      <div className="date-input-pill selects-end">
        <span className="pill-label">Дата виїзду</span>
        <span className="pill-date">{formatDisplayDate(endDate, 'Оберіть')}</span>
        
        {/* 2. ЗАМІНИЛИ ЕМОДЗІ НА SVG-КОМПОНЕНТ */}
        <span className="pill-icon"><FiCalendar /></span>
      </div>
    </button>
  );
});

function BookingDatePicker({ dateRange, setDateRange, isMobile }) {
  const [startDate, endDate] = dateRange;
  const datePickerRef = useRef(null);

  // --- НОВЕ: Стейт для максимальної дати (горизонту бронювання) ---
  const [maxBookingDate, setMaxBookingDate] = useState(null);

  // --- НОВЕ: Запитуємо бекенд, до якого числа відкрито сезон ---
 // --- Запитуємо бекенд, до якого числа відкрито сезон ---
  useEffect(() => {
    const fetchBookingHorizon = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          // Встановлюємо реальну дату з бази даних
          setMaxBookingDate(new Date(data.maxBookingDate));
        }
      } catch (error) {
        console.error("Не вдалося завантажити горизонт бронювання", error);
        // Якщо сервер лежить, даємо дефолт +3 місяці
        const fallbackDate = new Date();
        fallbackDate.setMonth(fallbackDate.getMonth() + 3);
        setMaxBookingDate(fallbackDate);
      }
    };

    fetchBookingHorizon();
  }, []);

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
      <DatePicker
        ref={datePickerRef}
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={(update) => setDateRange(update)}
        minDate={new Date()} // Не можна вибрати вчора
        maxDate={maxBookingDate} // НОВЕ: Не можна вибрати пізніше, ніж дозволив адмін
        locale="uk"
        shouldCloseOnSelect={!isMobile} 
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
                {/* 3. ЗАМІНИЛИ ТЕКСТ "<" НА SVG-КОМПОНЕНТ */}
                <FiChevronLeft /> 
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
                {/* 3. ЗАМІНИЛИ ТЕКСТ ">" НА SVG-КОМПОНЕНТ */}
                <FiChevronRight />
              </button>
            )}
          </div>
        )}
        renderDayContents={renderDayWithPrice}
      >
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

      <button 
        id="hidden-close-btn" 
        type="button" 
        style={{ display: 'none' }} 
        onClick={handleCloseCalendar}
      >
      </button>
    </>
  );
  
}


export default BookingDatePicker;
