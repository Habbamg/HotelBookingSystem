import React, { useState } from 'react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale/uk';
import { FiSearch, FiX } from 'react-icons/fi';

const CheckBooking = () => {
  const [phone, setPhone] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- ПОШУК БРОНЮВАННЯ ---
  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setBooking(null);

    if (!phone || !bookingCode) {
      setError('Будь ласка, введіть номер телефону та код бронювання.');
      return;
    }

    setIsLoading(true);
    try {
      // Звертаємося до твого методу CheckBookingStatus
      const response = await fetch(`https://andriyputiyk-001-site1.htempurl.com//api/Booking/check-status?phone=${encodeURIComponent(phone.trim())}&bookingCode=${encodeURIComponent(bookingCode.trim())}`);

      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      } else if (response.status === 404) {
        setError('Бронювання не знайдено. Перевірте правильність телефону та коду.');
      } else {
        setError('Сталася помилка при пошуку. Спробуйте пізніше.');
      }
    } catch (err) {
      console.error(err);
      setError('Помилка з\'єднання з сервером.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- СКАСУВАННЯ КЛІЄНТОМ ---
  const handleCancel = async () => {
    if (!window.confirm('Ви впевнені, що хочете скасувати це бронювання? Цю дію неможливо відмінити.')) {
      return;
    }

    try {
      // Звертаємося до твого методу CancelBooking
      const response = await fetch(`https://andriyputiyk-001-site1.htempurl.com//api/Booking/cancel?bookingCode=${encodeURIComponent(booking.bookingCode)}`, {
        method: 'POST'
      });

      if (response.ok) {
        // Оновлюємо статус на екрані
        setBooking({ ...booking, status: 'Cancelled' });
        alert('Ваше бронювання успішно скасовано.');
      } else {
        alert('Не вдалося скасувати бронювання. Спробуйте пізніше.');
      }
    } catch (err) {
      console.error(err);
      alert('Помилка з\'єднання з сервером.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New': return <span style={{ background: '#ffc107', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Обробляється</span>;
      case 'Confirmed': return <span style={{ background: '#1b4332', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Підтверджено</span>;
      case 'Cancelled': return <span style={{ background: '#e63946', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Скасовано</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>Перевірка статусу бронювання</h2>

      {/* ФОРМА ПОШУКУ */}
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Номер телефону</label>
          <input
            type="text"
            placeholder="Наприклад: +380991234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Код бронювання</label>
          <input
            type="text"
            placeholder="Наприклад: A7-K2"
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
          />
          <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>4-значний код, який ви отримали при оформленні.</small>
        </div>

        {error && <div style={{ color: '#e63946', background: '#ffebee', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #e63946' }}>{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: '14px', background: '#1b4332', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
        >
          {isLoading ? 'Шукаємо...' : <><FiSearch /> Знайти бронювання</>}
        </button>
      </form>

      {/* РЕЗУЛЬТАТ (КАРТКА БРОНЮВАННЯ) */}
      {booking && (
        <div style={{ marginTop: '40px', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: '5px solid #1b4332' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>Деталі вашого відпочинку</h3>
            {getStatusBadge(booking.status)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#888', fontSize: '0.9rem' }}>Номер</h4>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>{booking.room?.name || 'Номер видалено'}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#888', fontSize: '0.9rem' }}>Заїзд (після 14:00)</h4>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{format(new Date(booking.checkInDate), 'dd MMMM yyyy', { locale: uk })}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#888', fontSize: '0.9rem' }}>Виїзд (до 12:00)</h4>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{format(new Date(booking.checkOutDate), 'dd MMMM yyyy', { locale: uk })}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#888', fontSize: '0.9rem' }}>Гості</h4>
                <p style={{ margin: 0 }}>Дорослих: {booking.adults} {booking.children > 0 && `, Дітей: ${booking.children}`}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#888', fontSize: '0.9rem' }}>До сплати при заселенні</h4>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1b4332' }}>{booking.totalPrice} ₴</p>
              </div>
            </div>
          </div>

          {/* КНОПКА СКАСУВАННЯ */}
          {booking.status !== 'Cancelled' && (
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center' }}>
              <button
                onClick={handleCancel}
                style={{ background: '#fff', color: '#e63946', border: '1px solid #e63946', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '8px', fontSize: '1rem' }}
              >
                <FiX /> Скасувати бронювання
              </button>
              <small style={{ display: 'block', marginTop: '12px', color: '#888' }}>
                Увага: скасування є безповоротним. Номер знову стане доступним для інших гостей.
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckBooking;