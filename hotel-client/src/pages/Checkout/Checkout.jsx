import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { uk } from 'date-fns/locale/uk';
import { FiUsers, FiCheck, FiCalendar, FiShield, FiCopy, FiCheckCircle } from 'react-icons/fi';

import RoomDetailsModal from '../../components/RoomDetailsModal/RoomDetailsModal';
import './Checkout.css';

function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomId = searchParams.get('roomId');
  const startStr = searchParams.get('start');
  const endStr = searchParams.get('end');
  const adults = searchParams.get('adults') || 1;
  const children = searchParams.get('children') || 0;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    comments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 🔥 СТЕЙТИ ДЛЯ МОДАЛКИ З КОДОМ 🔥
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const nights = (startStr && endStr) ? differenceInDays(parseISO(endStr), parseISO(startStr)) : 1;
  const formattedStart = startStr ? format(parseISO(startStr), 'dd MMMM', { locale: uk }) : '';
  const formattedEnd = endStr ? format(parseISO(endStr), 'dd MMMM', { locale: uk }) : '';
  const totalGuests = parseInt(adults) + parseInt(children);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`https://andriyputiyk-001-site1.htempurl.com//api/Room/${roomId}`);
        if (response.ok) {
          const data = await response.json();
          setRoom(data);
        }
      } catch (error) {
        console.error("Помилка завантаження:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomDetails();
  }, [roomId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    const bookingPayload = {
      roomId: parseInt(roomId),
      guestName: formData.guestName,
      guestPhone: formData.guestPhone,
      guestEmail: formData.guestEmail,
      comments: formData.comments,
      checkInDate: parseISO(startStr).toISOString(),
      checkOutDate: parseISO(endStr).toISOString(),
      adults: parseInt(adults),
      children: parseInt(children)
    };

    try {
      const response = await fetch('https://andriyputiyk-001-site1.htempurl.com//api/Booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      if (response.ok) {
        const data = await response.json();
        // Замість редиректу зберігаємо код і відкриваємо модалку
        setGeneratedCode(data.bookingCode);
        setIsSuccessModalOpen(true);
      } else {
        const errorText = await response.text();
        setSubmitStatus('error');
        setErrorMessage(errorText || 'Сталася помилка при бронюванні.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage("Немає зв'язку з сервером. Спробуйте пізніше.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функція для копіювання коду
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('Код скопійовано в буфер обміну!');
  };

  if (loading) return <div className="checkout-loading">Завантаження деталей...</div>;
  if (!room) return <div className="checkout-loading">Помилка: Номер не знайдено.</div>;

  const images = room.images && room.images.length > 0 
    ? room.images.map(img => img.url)
    : [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
      ];
  const displayImages = images.slice(0, 5);

  return (
    <div className="checkout-pro-page">
      <div className="checkout-pro-container">
        
        <div className="checkout-header">
          <button className="btn-pro-back" onClick={() => navigate(-1)}>
            &larr; Повернутися назад
          </button>
          <h1 className="checkout-main-title">Підтвердження бронювання</h1>
        </div>

        <div className="checkout-grid">
          
          {/* ЛІВА КОЛОНКА */}
          <div className="checkout-left">
            <div className="pro-card">
              <h3 className="pro-card-title">Ваші контактні дані</h3>
              <p className="pro-card-subtitle">Заповніть форму, щоб ми могли зв'язатися з вами.</p>
              
              <form id="booking-form" onSubmit={handleSubmit} className="pro-form">
                <div className="pro-input-group">
                  <label>Ім'я та Прізвище *</label>
                  <input type="text" name="guestName" value={formData.guestName} onChange={handleChange} required placeholder="Введіть ваше ім'я" />
                </div>

                <div className="pro-form-row">
                  <div className="pro-input-group">
                    <label>Номер телефону *</label>
                    <input type="tel" name="guestPhone" value={formData.guestPhone} onChange={handleChange} required placeholder="+38 (000) 000-00-00" />
                  </div>
                  <div className="pro-input-group">
                    <label>Email *</label>
                    <input type="email" name="guestEmail" value={formData.guestEmail} onChange={handleChange} required placeholder="Ваш email для квитанції" />
                  </div>
                </div>

                <div className="pro-input-group">
                  <label>Особливі побажання (необов'язково)</label>
                  <textarea name="comments" value={formData.comments} onChange={handleChange} placeholder="Наприклад: ранній заїзд, дитяче ліжечко..." rows="3"></textarea>
                </div>
              </form>

              {submitStatus === 'error' && (
                <div className="pro-error" style={{ color: '#e63946', backgroundColor: '#ffebee', padding: '10px', borderRadius: '6px', marginTop: '15px' }}>
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="pro-trust-badges">
              <div className="trust-badge">
                <FiShield className="trust-icon" />
                <div>
                  <h4>Оплата при заселенні</h4>
                  <p>Вам не потрібно платити зараз. Розрахунок відбувається на рецепції.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ПРАВА КОЛОНКА: Деталі замовлення */}
          <div className="checkout-right">
            <div 
              className="pro-summary-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setIsModalOpen(true)}
              title="Натисніть для перегляду деталей"
            >
              
              <div 
                className="pro-summary-image" 
                style={{ backgroundImage: `url(${displayImages[currentImageIndex]})` }}
              >
                <div className="hover-zones">
                  {displayImages.map((_, idx) => (
                    <div 
                      key={idx} 
                      className="hover-zone"
                      onMouseEnter={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>

                {displayImages.length > 1 && (
                  <div className="slider-dots">
                    {displayImages.map((_, idx) => (
                      <div key={idx} className={`dot ${idx === currentImageIndex ? 'active' : ''}`} />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pro-summary-content">
                <div className="pro-room-name" style={{ transition: 'color 0.2s' }}>
                  {room.name} <span style={{fontSize: '0.8rem', color: '#888', fontWeight: 'normal'}}>(Деталі ℹ️)</span>
                </div>
                
                <div className="pro-summary-details">
                  <div className="detail-row">
                    <FiCalendar className="detail-icon" />
                    <div className="detail-text">
                      <strong>Дати:</strong> {formattedStart} — {formattedEnd} <span className="light-text">({nights} ночі)</span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <FiUsers className="detail-icon" />
                    <div className="detail-text">
                      <strong>Гості:</strong> {totalGuests} осіб
                    </div>
                  </div>
                </div>

                <hr className="pro-divider" />

                <div className="pro-price-breakdown">
                  <div className="price-row">
                    <span>Ціна за 1 ніч</span>
                    <span>{room.basePrice} ₴</span>
                  </div>
                </div>

                <hr className="pro-divider-thick" />

                <div className="pro-total">
                  <span>До сплати</span>
                  <span className="total-amount">{room.basePrice * nights} ₴</span>
                </div>

                <button 
                  form="booking-form" 
                  type="submit" 
                  className="pro-submit-btn" 
                  disabled={isSubmitting}
                  onClick={(e) => e.stopPropagation()} 
                >
                  {isSubmitting ? 'Обробка...' : 'ПІДТВЕРДИТИ БРОНЮВАННЯ'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <RoomDetailsModal 
        room={room} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onBook={() => setIsModalOpen(false)} 
      />

      {/* 🔥 МОДАЛЬНЕ ВІКНО З КОДОМ (З'ЯВЛЯЄТЬСЯ ТІЛЬКИ ПІСЛЯ УСПІШНОГО БРОНЮВАННЯ) 🔥 */}
      {isSuccessModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', padding: '40px', maxWidth: '500px', width: '100%',
            textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            
            <FiCheckCircle style={{ fontSize: '5rem', color: '#1b4332', marginBottom: '20px' }} />
            
            <h2 style={{ color: '#2c3e50', margin: '0 0 15px 0' }}>Бронювання підтверджено!</h2>
            
            <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '25px', lineHeight: '1.5' }}>
              Дякуємо, {formData.guestName}! Ваш номер успішно заброньовано. Ми зв'яжемося з вами найближчим часом.
            </p>

            <div style={{ backgroundColor: '#f0f4f8', border: '2px dashed #1b4332', borderRadius: '12px', padding: '20px', marginBottom: '25px', position: 'relative' }}>
              <span style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>
                Ваш секретний код бронювання:
              </span>
              <strong style={{ fontSize: '2.5rem', color: '#1b4332', letterSpacing: '2px' }}>
                {generatedCode}
              </strong>
              
              <button 
                onClick={copyToClipboard}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#0071c2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Скопіювати код"
              >
                <FiCopy size={20} />
              </button>
            </div>

            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '30px' }}>
              ⚠️ Збережіть цей код. З його допомогою ви зможете перевірити статус або скасувати бронь на сторінці <strong>"Моє бронювання"</strong>.
            </p>

            <button 
              onClick={() => navigate('/')} 
              style={{ backgroundColor: '#ffc107', color: '#1b4332', padding: '14px 30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            >
              Зрозуміло, на головну
            </button>
            
          </div>
        </div>
      )}

    </div>
  );
}

export default Checkout;