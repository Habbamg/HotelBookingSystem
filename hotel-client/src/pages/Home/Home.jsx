import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiWifi, FiDroplet, FiMapPin, FiWind, FiCheckCircle, FiX } from 'react-icons/fi';

import BookingDatePicker from '../../components/BookingDatePicker/BookingDatePicker';
import GuestSelector from '../../components/GuestSelector/GuestSelector'; 
import './Home.css';

function Home() {
  const navigate = useNavigate();
  
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  
  const [guestConfig, setGuestConfig] = useState({ adults: 2, children: 0, rooms: 1 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // 🔥 СТЕЙТИ ДЛЯ ВІДГУКІВ 🔥
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ authorName: '', comment: '', rating: 5 });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    fetchFeaturedRooms();
    fetchReviews(); // Завантажуємо відгуки

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchFeaturedRooms = async () => {
    try {
      const response = await fetch('/api/Room');
      if (response.ok) {
        const data = await response.json();
        const topRooms = data.filter(r => r.isActive).slice(0, 3);
        setFeaturedRooms(topRooms);
      }
    } catch (error) {
      console.error("Помилка завантаження номерів:", error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // 🔥 ЗАВАНТАЖЕННЯ СПРАВЖНІХ ВІДГУКІВ З БАЗИ 🔥
  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/Review');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Помилка завантаження відгуків:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Будь ласка, оберіть повний період проживання (заїзд та виїзд).");
      return;
    }
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');
    navigate(`/booking?start=${startStr}&end=${endStr}&adults=${guestConfig.adults}&children=${guestConfig.children}`);
  };

  // 🔥 ВІДПРАВКА НОВОГО ВІДГУКУ 🔥
  const submitReview = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const response = await fetch('/api/Review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      
      if (response.ok) {
        alert("Дякуємо! Ваш відгук успішно відправлено на модерацію.");
        setIsReviewModalOpen(false);
        setNewReview({ authorName: '', comment: '', rating: 5 }); // Очищаємо форму
      } else {
        alert("Сталася помилка при відправці.");
      }
    } catch (error) {
      alert("Немає зв'язку з сервером.");
    } finally {
      setIsSubmittingReview(false);
    }
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
            <BookingDatePicker dateRange={dateRange} setDateRange={setDateRange} isMobile={isMobile} />
          </div>
          <div className="widget-group guests-widget-group" style={{ flex: 2 }}>
             <GuestSelector guestConfig={guestConfig} setGuestConfig={setGuestConfig} />
          </div>
          <button type="submit" className="btn-primary search-btn">Знайти номер</button>
        </form>
      </div>

      <section className="categories-bento-section">
        <h2 className="bento-title">Наші варіанти проживання</h2>
        <p className="bento-subtitle">Оберіть ідеальний простір для вашого відпочинку</p>
        <div className="bento-grid">
          <div className="bento-item bento-large" onClick={() => navigate('/booking')}>
            <img src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop" alt="Котедж" className="bento-img" />
            <div className="bento-overlay"><h3>Дерев'яний Котедж</h3><p>Для великої компанії • до 8 гостей</p></div>
          </div>
          <div className="bento-item bento-medium" onClick={() => navigate('/booking')}>
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop" alt="Нові 4-місні апартаменти" className="bento-img" />
            <div className="bento-overlay"><h3>Нові 4-місні апартаменти</h3><p>Ідеально для сім'ї • Власна кухня</p></div>
          </div>
          <div className="bento-item bento-small" onClick={() => navigate('/booking')}>
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop" alt="2-місні номери" className="bento-img" />
            <div className="bento-overlay"><h3>Затишні 2-місні номери</h3><p>Для романтичного вікенду</p></div>
          </div>
        </div>
      </section>

      <section className="about" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ color: '#1b4332', fontSize: '2.5rem', marginBottom: '20px' }}>Гармонія з природою</h2>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.6' }}>Ми створили простір, де немає місця міському шуму. Тільки ви, чисте гірське повітря та абсолютний комфорт. "Гостинний двір Буковець" — це місце, куди хочеться повертатися за спокоєм, цілющим релаксом та справжньою карпатською гостинністю.</p>
      </section>

      <section className="chany-section" style={{ padding: '60px 20px', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '50px' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ color: '#1b4332', fontSize: '2.4rem', margin: '0 0 20px 0' }}>Магія гарячих чанів</h2>
            <p style={{ fontSize: '1.15rem', color: '#555', lineHeight: '1.7', marginBottom: '20px' }}>Уявіть: прохолодний гірський вечір, мерехтіння зірок над головою, а ви занурюєтесь у гарячу джерельну воду, що парує ароматами місцевих цілющих трав та хвої.</p>
            <p style={{ fontSize: '1.05rem', color: '#666', lineHeight: '1.6', marginBottom: '30px' }}>Наші чани на відкритому вогні — це давня карпатська традиція. Вони знімають втому, перезавантажують нервову систему та дарують відчуття абсолютного спокою. Ідеальне завершення активного дня в горах.</p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#fff', border: '1px solid #cce3f0', color: '#1b4332', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>🌿 Трав'яні збори</span>
              <span style={{ backgroundColor: '#fff', border: '1px solid #cce3f0', color: '#1b4332', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>🔥 Нагрів на дровах</span>
              <span style={{ backgroundColor: '#fff', border: '1px solid #cce3f0', color: '#1b4332', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>✨ Просто неба</span>
            </div>
          </div>
          <div style={{ flex: '1 1 400px', position: 'relative' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', transform: 'rotate(2deg)', transition: 'transform 0.4s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(0deg)'} onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(2deg)'}>
              <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop" alt="Карпатський чан" style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="amenities-overview" style={{ backgroundColor: '#fff', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#1b4332', marginBottom: '50px' }}>Наші переваги</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', textAlign: 'center' }}>
            <div style={{ padding: '10px' }}><div style={{ fontSize: '3rem', color: '#ffc107', marginBottom: '15px' }}><FiWind /></div><h3 style={{ marginBottom: '10px' }}>Чисте повітря</h3><p style={{ color: '#666' }}>Екологічно чиста зона Карпат, ідеально для відновлення сил.</p></div>
            <div style={{ padding: '10px' }}><div style={{ fontSize: '3rem', color: '#ffc107', marginBottom: '15px' }}><FiWifi /></div><h3 style={{ marginBottom: '10px' }}>Швидкий Wi-Fi</h3><p style={{ color: '#666' }}>Залишайтеся на зв'язку або працюйте віддалено з видом на гори.</p></div>
            <div style={{ padding: '10px' }}><div style={{ fontSize: '3rem', color: '#ffc107', marginBottom: '15px' }}><FiDroplet /></div><h3 style={{ marginBottom: '10px' }}>Оздоровчі чани</h3><p style={{ color: '#666' }}>Розслаблення у гарячій воді з травами просто неба.</p></div>
            <div style={{ padding: '10px' }}><div style={{ fontSize: '3rem', color: '#ffc107', marginBottom: '15px' }}><FiMapPin /></div><h3 style={{ marginBottom: '10px' }}>Зручна локація</h3><p style={{ color: '#666' }}>Легкий доїзд та близькість до основних туристичних маршрутів.</p></div>
          </div>
        </div>
      </section>

      <section className="featured-rooms-section" style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
            <div><h2 style={{ color: '#1b4332', fontSize: '2.2rem', margin: '0 0 10px 0' }}>Популярні номери</h2><p style={{ color: '#666', margin: 0, fontSize: '1.1rem' }}>Оберіть простір, який підійде саме вам</p></div>
            <Link to="/booking" style={{ color: '#1b4332', fontWeight: 'bold', textDecoration: 'none', borderBottom: '2px solid #ffc107' }}>Дивитися всі →</Link>
          </div>
          {isLoadingRooms ? <div style={{ textAlign: 'center', padding: '40px' }}>Завантаження номерів...</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              {featuredRooms.map(room => (
                <div key={room.id} style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', backgroundColor: '#fff', transition: 'transform 0.3s' }} className="room-card-hover">
                  <div style={{ height: '220px', backgroundColor: '#e0e0e0', position: 'relative' }}>
                    {room.images && room.images.length > 0 ? <img src={room.images[0].url} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>Фото готується</div>}
                    <div style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#ffc107', color: '#1b4332', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>Від {room.basePrice} ₴</div>
                  </div>
                  <div style={{ padding: '25px' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.4rem' }}>{room.name}</h3>
                    <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '40px' }}>{room.description || "Затишний номер."}</p>
                    <div style={{ display: 'flex', gap: '20px', color: '#555', fontSize: '0.9rem', marginBottom: '25px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheckCircle color="#1b4332" /> До {room.maxCapacity} гостей</span><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheckCircle color="#1b4332" /> {room.area} м²</span>
                    </div>
                    <button onClick={() => navigate('/booking')} style={{ width: '100%', padding: '14px', backgroundColor: '#f8f9fa', border: '1px solid #1b4332', color: '#1b4332', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem' }}>Перевірити дати</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 🔥 НОВИЙ РОБОЧИЙ БЛОК ВІДГУКІВ 🔥 */}
      <section className="reviews-section" style={{ padding: '80px 20px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#1b4332', fontSize: '2.4rem', marginBottom: '10px' }}>Що кажуть наші гості</h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem', marginBottom: '40px' }}>Справжні емоції тих, хто вже обрав відпочинок у нас</p>
          
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', marginBottom: '30px' }}>Поки що немає відгуків. Станьте першим!</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
              {reviews.map(review => (
                <div key={review.id} style={{ backgroundColor: '#f8f9fa', padding: '35px 25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '5px', color: '#ffc107', marginBottom: '20px', fontSize: '1.3rem' }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '25px', minHeight: '80px' }}>"{review.comment}"</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eaeaea', paddingTop: '20px' }}>
                    <strong style={{ color: '#1b4332', fontSize: '1.1rem' }}>{review.authorName}</strong>
                    <span style={{ color: '#999', fontSize: '0.85rem' }}>{new Date(review.createdAt).toLocaleDateString('uk-UA')}</span>
                  </div>
                  <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '4rem', color: '#e0e0e0', opacity: '0.5', lineHeight: '1', fontFamily: 'serif' }}>"</div>
                </div>
              ))}
            </div>
          )}

          {/* Кнопка "Залишити відгук" */}
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              style={{ backgroundColor: '#fff', color: '#1b4332', border: '2px solid #1b4332', padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#1b4332'; e.target.style.color = '#fff'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#1b4332'; }}
            >
              Залишити свій відгук
            </button>
          </div>
        </div>
      </section>

      {/* Модальне вікно для створення відгуку */}
      {isReviewModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '30px', maxWidth: '500px', width: '100%', position: 'relative' }}>
            <button onClick={() => setIsReviewModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}><FiX /></button>
            <h2 style={{ color: '#1b4332', marginBottom: '20px' }}>Поділіться враженнями</h2>
            <form onSubmit={submitReview}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ваше ім'я</label>
                <input required type="text" value={newReview.authorName} onChange={(e) => setNewReview({...newReview, authorName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} placeholder="Напр. Олена та Максим" />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Оцінка</label>
                <select value={newReview.rating} onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="5">⭐⭐⭐⭐⭐ Відмінно</option>
                  <option value="4">⭐⭐⭐⭐ Добре</option>
                  <option value="3">⭐⭐⭐ Нормально</option>
                  <option value="2">⭐⭐ Погано</option>
                  <option value="1">⭐ Жахливо</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Текст відгуку</label>
                <textarea required value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} rows="4" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} placeholder="Що вам найбільше сподобалося?"></textarea>
              </div>
              <button type="submit" disabled={isSubmittingReview} style={{ width: '100%', padding: '12px', backgroundColor: '#1b4332', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                {isSubmittingReview ? 'Відправка...' : 'Відправити відгук'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. БЛОК: КЕРУВАННЯ БРОНЮВАННЯМ */}
      <section style={{ backgroundColor: '#1b4332', padding: '70px 20px', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: '#ffc107', marginBottom: '15px', fontSize: '2.2rem' }}>Вже маєте бронювання?</h2>
          <p style={{ marginBottom: '35px', fontSize: '1.15rem', lineHeight: '1.6', opacity: '0.9' }}>Ви можете легко перевірити деталі свого відпочинку, переглянути суму до сплати або скасувати бронювання онлайн.</p>
          <Link to="/my-booking" style={{ display: 'inline-block', padding: '16px 35px', backgroundColor: '#ffc107', color: '#1b4332', textDecoration: 'none', fontWeight: 'bold', borderRadius: '8px', fontSize: '1.1rem' }}>Перевірити статус</Link>
        </div>
      </section>
    </>
  );
}

export default Home;