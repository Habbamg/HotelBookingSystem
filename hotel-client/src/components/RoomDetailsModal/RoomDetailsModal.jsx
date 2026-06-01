import React, { useEffect } from 'react';
import { FiUsers, FiMaximize2, FiGrid, FiCheck, FiX } from 'react-icons/fi';
import './RoomDetailsModal.css';

function RoomDetailsModal({ room, isOpen, onClose, onBook }) {
  // Блокуємо скрол основної сторінки, коли модалка відкрита
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen || !room) return null;

  // Заглушки для фото
  const images = room.images && room.images.length > 0 
    ? room.images.map(img => img.url)
    : [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a"
      ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Зупиняємо клік, щоб модалка не закривалася при кліку всередині неї */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* ШАПКА МОДАЛКИ */}
        <div className="modal-header">
          <h2 className="modal-title">{room.name}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* ТІЛО МОДАЛКИ (зі скролом) */}
        <div className="modal-body">
          
          {/* Галерея (як на твоєму скріні) */}
          <div className="modal-gallery">
            <div className="mg-main" style={{ backgroundImage: `url(${images[0]})` }}></div>
            <div className="mg-side">
              <div className="mg-img" style={{ backgroundImage: `url(${images[1] || images[0]})` }}></div>
              <div className="mg-img" style={{ backgroundImage: `url(${images[2] || images[0]})` }}></div>
            </div>
          </div>

          <div className="modal-info-grid">
            {/* Ліва частина: Характеристики */}
            <div className="modal-specs-col">
              <div className="modal-specs">
                <span><FiUsers className="m-icon"/> Місткість до {room.baseCapacity + 2} місць.</span>
                <span><FiMaximize2 className="m-icon"/> {room.area || 25} м²</span>
                <span><FiGrid className="m-icon"/> {room.roomsCount || 1} кімн.</span>
              </div>
              
              <div className="modal-amenities-tags">
                {room.amenities?.map(a => (
                  <span key={a.id} className="amenity-tag"><FiCheck/> {a.name}</span>
                ))}
              </div>
            </div>

            {/* Права частина: Текст */}
            <div className="modal-desc-col">
              <p>{room.description || "Стандартний номер — це затишне та комфортне житло, ідеальне для пари або двох гостей. Номер облаштований великим двоспальним ліжком, стильними меблями та всім необхідним для комфортного перебування."}</p>
            </div>
          </div>

        </div>

        {/* ПІДВАЛ МОДАЛКИ (Закріплений знизу) */}
        <div className="modal-footer">
          <div className="modal-price-info">
            <span className="modal-price-total">{room.basePrice} ₴</span>
            <span className="modal-price-sub">за 1 ніч</span>
          </div>
          <button className="modal-book-btn" onClick={() => onBook(room.id)}>
            ВИБРАТИ
          </button>
        </div>

      </div>
    </div>
  );
}

export default RoomDetailsModal;