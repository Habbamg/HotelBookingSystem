import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale/uk';
import { FiEye, FiCheck, FiX, FiInfo, FiUser, FiCalendar } from 'react-icons/fi';

const BookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('https://andriyputiyk-001-site1.htempurl.comapi/Booking/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Помилка завантаження бронювань:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // ПЕРЕДАЄМО СТАТУС В URL: ?newStatus=...
      const response = await fetch(`https://andriyputiyk-001-site1.htempurl.comapi/Booking/${id}/status?newStatus=${newStatus}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchBookings(); // Оновлюємо таблицю
        
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
      } else {
        // Виводимо текст помилки від сервера
        const errorText = await response.text();
        alert(`Не вдалося змінити статус. Відповідь сервера: ${errorText}`);
      }
    } catch (error) {
      console.error("Помилка оновлення статусу:", error);
      alert("Немає з'єднання з сервером");
    }
  };

  const calculateNights = (inDate, outDate) => {
    const diffTime = Math.abs(new Date(outDate) - new Date(inDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New': return <span style={{ background: '#ffc107', color: '#000', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Нове</span>;
      case 'Confirmed': return <span style={{ background: '#1b4332', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Підтверджено</span>;
      case 'Cancelled': return <span style={{ background: '#e63946', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Скасовано</span>;
      default: return <span>{status}</span>;
    }
  };

  if (isLoading) return <div style={{ padding: '20px' }}>Завантаження списку бронювань...</div>;

  return (
    <div className="admin-tab-content" style={{ position: 'relative' }}>
      <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Управління бронюваннями</h2>
      </div>

      {/* ОСНОВНА ТАБЛИЦЯ */}
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea', color: '#555' }}>
              <th style={{ padding: '15px' }}>Код / Створено</th>
              <th style={{ padding: '15px' }}>Гість</th>
              <th style={{ padding: '15px' }}>Номер</th>
              <th style={{ padding: '15px' }}>Дати проживання</th>
              <th style={{ padding: '15px' }}>Сума</th>
              <th style={{ padding: '15px' }}>Статус</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>Бронювань поки немає.</td></tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid #eaeaea', transition: 'background 0.2s' }}>
                  <td style={{ padding: '15px' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#2c3e50' }}>{booking.bookingCode}</strong><br/>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>
                      {format(new Date(booking.createdAt), 'dd.MM.yyyy HH:mm')}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <strong>{booking.guestName}</strong><br/>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>{booking.guestPhone}</span>
                  </td>
                  <td style={{ padding: '15px' }}>{booking.room?.name || 'Видалений номер'}</td>
                  <td style={{ padding: '15px' }}>
                    {format(new Date(booking.checkInDate), 'dd.MM.yy')} — {format(new Date(booking.checkOutDate), 'dd.MM.yy')}
                  </td>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#1b4332' }}>{booking.totalPrice} ₴</td>
                  <td style={{ padding: '15px' }}>{getStatusBadge(booking.status)}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button 
                      onClick={() => setSelectedBooking(booking)}
                      style={{ background: '#f0f4f8', color: '#2c3e50', border: '1px solid #cce3f0', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}
                    >
                      <FiEye /> Деталі
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* МОДАЛЬНЕ ВІКНО "КАРТКА БРОНЮВАННЯ" */}
      {selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            
            <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                Бронювання {selectedBooking.bookingCode} 
                {getStatusBadge(selectedBooking.status)}
              </h3>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}><FiX /></button>
            </div>

            <div style={{ padding: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              <div>
                <h4 style={{ margin: '0 0 15px 0', color: '#555', display: 'flex', alignItems: 'center', gap: '5px' }}><FiUser /> Контакти гостя</h4>
                <p style={{ margin: '5px 0' }}><strong>Ім'я:</strong> {selectedBooking.guestName}</p>
                <p style={{ margin: '5px 0' }}><strong>Телефон:</strong> <a href={`tel:${selectedBooking.guestPhone}`} style={{ color: '#0066cc', textDecoration: 'none' }}>{selectedBooking.guestPhone}</a></p>
                {selectedBooking.guestEmail && <p style={{ margin: '5px 0' }}><strong>Email:</strong> {selectedBooking.guestEmail}</p>}
              </div>

              <div>
                <h4 style={{ margin: '0 0 15px 0', color: '#555', display: 'flex', alignItems: 'center', gap: '5px' }}><FiCalendar /> Деталі проживання</h4>
                <p style={{ margin: '5px 0' }}><strong>Номер:</strong> {selectedBooking.room?.name}</p>
                <p style={{ margin: '5px 0' }}><strong>Заїзд:</strong> {format(new Date(selectedBooking.checkInDate), 'dd MMMM yyyy', { locale: uk })}</p>
                <p style={{ margin: '5px 0' }}><strong>Виїзд:</strong> {format(new Date(selectedBooking.checkOutDate), 'dd MMMM yyyy', { locale: uk })}</p>
                <p style={{ margin: '5px 0' }}><strong>Ночей:</strong> {calculateNights(selectedBooking.checkInDate, selectedBooking.checkOutDate)}</p>
                <p style={{ margin: '5px 0' }}><strong>Гості:</strong> {selectedBooking.adults} дор. {selectedBooking.children > 0 && `, ${selectedBooking.children} дит.`}</p>
              </div>

              {selectedBooking.comments && (
                <div style={{ gridColumn: '1 / -1', background: '#fff9e6', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
                  <h4 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}><FiInfo /> Коментар від гостя:</h4>
                  <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>"{selectedBooking.comments}"</p>
                </div>
              )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <div>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>Загальна сума:</span>
                <h2 style={{ margin: 0, color: '#1b4332' }}>{selectedBooking.totalPrice} ₴</h2>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedBooking.status !== 'Confirmed' && (
                  <button 
                    onClick={() => handleStatusChange(selectedBooking.id, 'Confirmed')} 
                    style={{ background: '#1b4332', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <FiCheck /> Підтвердити
                  </button>
                )}
                
                {selectedBooking.status !== 'Cancelled' && (
                  <button 
                    onClick={() => {
                      if (window.confirm('Ви впевнені, що хочете скасувати це бронювання?')) {
                        handleStatusChange(selectedBooking.id, 'Cancelled');
                      }
                    }} 
                    style={{ background: '#fff', color: '#e63946', border: '1px solid #e63946', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <FiX /> Скасувати бронь
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsTab;