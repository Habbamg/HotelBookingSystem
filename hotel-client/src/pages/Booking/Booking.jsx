import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { uk } from 'date-fns/locale/uk';
import { FiUsers, FiMaximize2, FiGrid } from 'react-icons/fi';

import BookingDatePicker from '../../components/BookingDatePicker/BookingDatePicker';
import GuestSelector from '../../components/GuestSelector/GuestSelector';
import RoomDetailsModal from '../../components/RoomDetailsModal/RoomDetailsModal'; 
import './Booking.css';

// ==========================================
// ОКРЕМИЙ КОМПОНЕНТ ДЛЯ КАРТКИ (Слайдер фото)
// ==========================================
function RoomCard({ room, nightsCount, guestCount, onCardClick, onBookClick, getAmenityIcon }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Беремо фото з бекенду. Якщо їх мало/немає - ставимо заглушки, щоб слайдер працював
  const images = room.images && room.images.length > 0 
    ? room.images.map(img => img.url)
    : [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
      ];

  // Показуємо макс 5 фото, щоб крапочки не зливалися
  const displayImages = images.slice(0, 5);

  return (
    <div 
      className="room-card-modern"
      style={{ cursor: 'pointer' }}
      onClick={() => onCardClick(room)}
    >
      <div className="room-image-box" style={{ backgroundImage: `url(${displayImages[currentImageIndex]})` }}>
        
        {/* Невидимі зони для наведення (Airbnb style) */}
        <div className="hover-zones">
          {displayImages.map((_, idx) => (
            <div 
              key={idx} 
              className="hover-zone"
              onMouseEnter={() => setCurrentImageIndex(idx)}
            />
          ))}
        </div>

        {/* Індикатори (крапочки) знизу фото */}
        {displayImages.length > 1 && (
          <div className="slider-dots">
            {displayImages.map((_, idx) => (
              <div key={idx} className={`dot ${idx === currentImageIndex ? 'active' : ''}`} />
            ))}
          </div>
        )}

        <div className="room-quick-amenities">
          {room.amenities && room.amenities.length > 0 ? (
            room.amenities.slice(0, 4).map(amenity => (
              <span key={amenity.id} className="icon-box" title={amenity.name}>
                {getAmenityIcon(amenity.name)}
              </span>
            ))
          ) : (
            <span className="icon-box" title="Базові зручності">✨</span>
          )}
        </div>
      </div>
      
      <div className="room-info-modern">
        <h3>{room.name || "Номер"}</h3>
        
        <div className="room-specs">
          <span><FiUsers /> до {room.baseCapacity + 2} місць</span>
          <span><FiMaximize2 /> {room.area || 0} м²</span>
          <span><FiGrid /> {room.roomsCount || 1} кімн.</span>
        </div>

        <div className="room-pricing-block">
          <div className="price-details">
            <span className="old-price">{room.basePrice * nightsCount + 500} ₴</span>
            <span className="current-price">
              <small>від</small> {room.basePrice * nightsCount} ₴
            </span>
            <span className="price-context">
              {nightsCount} ночі / {guestCount} гостя
            </span>
          </div>
          
          <button 
            className="btn-book-outline" 
            onClick={(e) => {
              e.stopPropagation(); 
              onBookClick(room.id);
            }}
          >
            Обрати
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ГОЛОВНА СТОРІНКА БРОНЮВАННЯ
// ==========================================
function Booking() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null); 
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlStart = searchParams.get('start');
  const urlEnd = searchParams.get('end');
  const urlAdults = parseInt(searchParams.get('adults')) || 2;
  const urlChildren = parseInt(searchParams.get('children')) || 0;
  const guestCount = urlAdults + urlChildren;

  const [dateRange, setDateRange] = useState([
    urlStart ? parseISO(urlStart) : null, 
    urlEnd ? parseISO(urlEnd) : null
  ]);
  const [guestConfig, setGuestConfig] = useState({ adults: urlAdults, children: urlChildren });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const nightsCount = (urlStart && urlEnd) ? differenceInDays(parseISO(urlEnd), parseISO(urlStart)) : 1;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        let url = 'https://andriyputiyk-001-site1.htempurl.com//api/Room'; 

        if (urlStart && urlEnd) {
          url = `https://andriyputiyk-001-site1.htempurl.com//api/Room/search?checkIn=${urlStart}&checkOut=${urlEnd}&adults=${urlAdults}&children=${urlChildren}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        }
      } catch (error) {
        console.error("Немає зв'язку з сервером", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [urlStart, urlEnd, urlAdults, urlChildren]);

  const handleUpdateSearch = () => {
    const [start, end] = dateRange;
    if (!start || !end) {
      alert("Будь ласка, оберіть дати заїзду та виїзду.");
      return;
    }
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');
    navigate(`/booking?start=${startStr}&end=${endStr}&adults=${guestConfig.adults}&children=${guestConfig.children}`);
  };

  const handleBookRoom = (roomId) => {
    if (!urlStart || !urlEnd) {
      alert("Оберіть дати перед бронюванням.");
      return;
    }
    setSelectedRoom(null); 
    navigate(`/checkout?roomId=${roomId}&start=${urlStart}&end=${urlEnd}&adults=${urlAdults}&children=${urlChildren}`);
  };

  const getAmenityIcon = (name) => {
    if (!name) return '✨';
    const lower = name.toLowerCase();
    if (lower.includes('wi-fi') || lower.includes('інтернет')) return '📶';
    if (lower.includes('душ') || lower.includes('ванн')) return '🚿';
    if (lower.includes('тб') || lower.includes('телевізор') || lower.includes('tv')) return '📺';
    if (lower.includes('кондиціонер')) return '❄️';
    if (lower.includes('балкон')) return '🌅';
    if (lower.includes('міні-бар') || lower.includes('холодильник')) return '🥂';
    if (lower.includes('ліжко')) return '🛏️';
    return '✨'; 
  };

  return (
    <div className="booking-page-wrapper">
      <div className="top-search-container">
        <div className="top-search-box">
          <div className="top-widget-group" style={{ flex: 2 }}>
            <BookingDatePicker dateRange={dateRange} setDateRange={setDateRange} isMobile={isMobile} />
          </div>
          <div className="top-widget-group" style={{ flex: 1.5 }}>
            <GuestSelector guestConfig={guestConfig} setGuestConfig={setGuestConfig} />
          </div>
          <button className="btn-update-search" onClick={handleUpdateSearch}>
            Оновити пошук
          </button>
        </div>
      </div>

      <section className="rooms-section">
        <h2 className="section-title">Виберіть номер</h2>
        
        <div className="rooms-grid">
          {loading ? (
            <p>Завантаження номерів...</p>
          ) : rooms.length > 0 ? (
            rooms.map((room) => (
              <RoomCard 
                key={room.id}
                room={room}
                nightsCount={nightsCount}
                guestCount={guestCount}
                onCardClick={setSelectedRoom}
                onBookClick={handleBookRoom}
                getAmenityIcon={getAmenityIcon}
              />
            ))
          ) : (
            <p className="no-rooms-msg">На жаль, немає вільних номерів на ці дати.</p>
          )}
        </div>
      </section>

      <RoomDetailsModal 
        room={selectedRoom} 
        isOpen={!!selectedRoom} 
        onClose={() => setSelectedRoom(null)} 
        onBook={handleBookRoom} 
      />
    </div>
  );
}

export default Booking;