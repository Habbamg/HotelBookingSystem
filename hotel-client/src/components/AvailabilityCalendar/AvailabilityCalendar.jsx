import React, { useState, useEffect } from 'react';
import { addDays, format, isToday, differenceInDays } from 'date-fns';
import { uk } from 'date-fns/locale'; 
import { FiEdit, FiChevronLeft, FiChevronRight, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './AvailabilityCalendar.css'; 

const AvailabilityCalendar = () => {
  const [dateRange, setDateRange] = useState([new Date(), addDays(new Date(), 13)]);
  const [startDate, endDate] = dateRange;
  
  const [rooms, setRooms] = useState([]);
  const [availabilities, setAvailabilities] = useState([]); 
  const [occupancyRules, setOccupancyRules] = useState([]); 
  
  // 🔥 НОВИЙ СТЕЙТ ДЛЯ РЕАЛЬНИХ БРОНЮВАНЬ
  const [realBookings, setRealBookings] = useState([]); 
  
  const [loading, setLoading] = useState(true);

  // Стейт для фільтрації номерів
  const [selectedRoomId, setSelectedRoomId] = useState('all');

  const [editingRoom, setEditingRoom] = useState(null);
  const [rateModal, setRateModal] = useState(null);
  const [discountInputs, setDiscountInputs] = useState({}); 

  const [editForm, setEditForm] = useState({
    fromDate: '', toDate: '', price: '', status: 'no_change', minStay: ''
  });

  const [expandedPanels, setExpandedPanels] = useState({
    price: false, status: false, restrictions: false
  });

  const [expandedRates, setExpandedRates] = useState({});

  const togglePanel = (panelName) => setExpandedPanels(prev => ({ ...prev, [panelName]: !prev[panelName] }));
  const toggleRate = (roomId) => setExpandedRates(prev => ({ ...prev, [roomId]: !prev[roomId] }));

  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const todayStr = format(today, 'yyyy-MM-dd');

  let daysToShow = 14;
  if (startDate && endDate) {
    daysToShow = differenceInDays(endDate, startDate) + 1;
    if (daysToShow > 60) daysToShow = 60; 
  }

  const dates = Array.from({ length: daysToShow }).map((_, i) => addDays(startDate || new Date(), i));

  const handlePrevWeek = () => {
    setDateRange(prev => {
      const [start, end] = prev;
      let newStart = addDays(start, -7);
      let newEnd = addDays(end, -7);

      if (newStart < today) {
        const daysToShift = differenceInDays(today, newStart);
        newStart = today;
        newEnd = addDays(newEnd, daysToShift);
      }
      return [newStart, newEnd];
    });
  };

  const handleNextWeek = () => {
    setDateRange(prev => {
      const [start, end] = prev;
      return [addDays(start, 7), addDays(end, 7)];
    });
  };

  // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const roomsRes = await fetch('https://andriyputiyk-001-site1.htempurl.com//api/Room'); 
      if (roomsRes.ok) setRooms(await roomsRes.json());

      if (startDate && endDate) {
        const startStr = format(startDate, 'yyyy-MM-dd');
        const endStr = format(endDate, 'yyyy-MM-dd');
        const availRes = await fetch(`https://andriyputiyk-001-site1.htempurl.com//api/Availability?start=${startStr}&end=${endStr}`);
        if (availRes.ok) setAvailabilities(await availRes.json());
      }

      const rulesRes = await fetch('https://andriyputiyk-001-site1.htempurl.com//api/Availability/occupancy-rules');
      if (rulesRes.ok) setOccupancyRules(await rulesRes.json());

      // 🔥 НОВЕ: Завантажуємо реальні бронювання
      const bookingsRes = await fetch('https://andriyputiyk-001-site1.htempurl.com//api/Booking/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (bookingsRes.ok) setRealBookings(await bookingsRes.json());

    } catch (error) {
      console.error("Помилка завантаження даних:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [startDate, endDate]);

  // --- ЛОГІКА ВІДОБРАЖЕННЯ ---
  const getAvailabilityForDate = (roomId, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilities.find(a => a.roomId === roomId && a.date.substring(0, 10) === dateStr);
  };

  const isRoomOpen = (roomId, date) => getAvailabilityForDate(roomId, date)?.isAvailable ?? true;
  const getRoomPrice = (room, date) => getAvailabilityForDate(room.id, date)?.customPrice ?? room.basePrice;
  const getRoomMinStay = (room, date) => getAvailabilityForDate(room.id, date)?.minStayDays ?? room.minBookingDays ?? 1;

  const getDiscountForRoom = (roomId, targetGuestCount) => {
    const rule = occupancyRules.find(r => r.roomId === roomId && r.guestCount === targetGuestCount);
    return rule ? rule.discountAmount : 0;
  };

  // 🔥 НОВА ФУНКЦІЯ: Перевіряємо, чи дата перекривається реальним бронюванням
  const getBookingForDate = (roomId, date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return realBookings.find(b => {
      // Ігноруємо скасовані та для інших номерів
      if (b.roomId !== roomId || b.status === 'Cancelled') return false;

      const checkIn = new Date(b.checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(b.checkOutDate);
      checkOut.setHours(0, 0, 0, 0);

      // Гість займає номер з дня заїзду до дня ПЕРЕД виїздом (ночі)
      return checkDate >= checkIn && checkDate < checkOut;
    });
  };

  // --- ОБРОБНИКИ КНОПОК ---
  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setEditForm({ fromDate: format(startDate, 'yyyy-MM-dd'), toDate: format(endDate, 'yyyy-MM-dd'), price: '', status: 'no_change', minStay: '' });
    setExpandedPanels({ price: false, status: false, restrictions: false });
  };

  const handleSaveBulkEdit = async () => {
    try {
      const payload = {
        roomId: editingRoom.id, fromDate: editForm.fromDate, toDate: editForm.toDate,
        price: editForm.price ? parseFloat(editForm.price) : null,
        status: editForm.status, minStay: editForm.minStay ? parseInt(editForm.minStay) : null
      };

      const response = await fetch('https://andriyputiyk-001-site1.htempurl.com//api/Availability/bulk-update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });

      if (response.ok) {
        setEditingRoom(null); 
        fetchAllData(); 
      }
    } catch (error) { alert("Помилка з'єднання з сервером."); }
  };

  const handleOpenRateModal = (e, room) => {
    e.stopPropagation();
    setRateModal(room);
    
    const maxCap = room.maxCapacity > 1 ? room.maxCapacity : 2;
    const initialDiscounts = {};
    
    for (let i = maxCap - 1; i >= 1; i--) {
        const existingDiscount = getDiscountForRoom(room.id, i);
        initialDiscounts[i] = existingDiscount > 0 ? existingDiscount.toString() : '';
    }
    
    setDiscountInputs(initialDiscounts);
  };

  const handleSaveRateRule = async () => {
    if (!rateModal) return;
    
    try {
      const promises = Object.keys(discountInputs).map(guestCountStr => {
        const guestCount = parseInt(guestCountStr);
        const discountVal = parseFloat(discountInputs[guestCount]) || 0;

        return fetch('https://andriyputiyk-001-site1.htempurl.com//api/Availability/occupancy-rule', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ roomId: rateModal.id, guestCount: guestCount, discount: discountVal })
        });
      });

      await Promise.all(promises);
      
      setRateModal(null);
      fetchAllData(); 
    } catch (error) {
      alert("Помилка з'єднання з сервером.");
    }
  };

  const handleChangeBaseCapacity = async () => {
    if (!rateModal) return;
    
    const newCapacity = window.prompt("Введіть нову стандартну місткість для цього номера:", rateModal.maxCapacity || 2);
    
    if (newCapacity !== null && newCapacity.trim() !== "") {
      try {
        const response = await fetch('https://andriyputiyk-001-site1.htempurl.com//api/Room/update-capacity', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: rateModal.id, maxCapacity: parseInt(newCapacity) })
        });
        if (response.ok) {
          setRateModal(null); 
          fetchAllData();     
        }
      } catch (error) {}
    }
  };

  if (loading && rooms.length === 0) return <div className="admin-loading-placeholder">Завантаження календаря...</div>;

  return (
    <div className="calendar-tab-container">
      <div className="calendar-controls">
        <div className="control-group">
          <select 
            className="extranet-select"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
          >
            <option value="all">Усі номери</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id.toString()}>{room.name}</option>
            ))}
          </select>
        </div>

        <div className="admin-date-range">
          <button className="date-nav-btn" onClick={handlePrevWeek}><FiChevronLeft /></button>
          <div className="date-input-group">
            <label>З:</label>
            <input type="date" min={todayStr} value={startDate ? format(startDate, 'yyyy-MM-dd') : ''} 
              onChange={(e) => { if (e.target.value) setDateRange([new Date(e.target.value), endDate]); }}
              className="extranet-date-input" />
          </div>
          <span className="date-separator">—</span>
          <div className="date-input-group">
            <label>По:</label>
            <input type="date" min={startDate ? format(startDate, 'yyyy-MM-dd') : todayStr} 
              value={endDate ? format(endDate, 'yyyy-MM-dd') : ''} 
              onChange={(e) => { if (e.target.value) setDateRange([startDate, new Date(e.target.value)]); }}
              className="extranet-date-input" />
          </div>
          <button className="date-nav-btn" onClick={handleNextWeek}><FiChevronRight /></button>
        </div>
      </div>

      <div className="extranet-grid-wrapper">
        <table className="extranet-table">
          <thead>
            <tr>
              <th className="sticky-col room-header-cell"></th>
              {dates.map((date, idx) => (
                <th key={idx} className={`date-cell ${isToday(date) ? 'today' : ''}`}>
                  <span className="day-name">{format(date, 'E', { locale: uk })}</span>
                  <span className="day-number">{format(date, 'dd')}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            
            {rooms
              .filter(room => selectedRoomId === 'all' || room.id.toString() === selectedRoomId)
              .map(room => {
              const maxCap = room.maxCapacity > 1 ? room.maxCapacity : 2;
              
              return (
              <React.Fragment key={room.id}>
                <tr className="room-title-row">
                  <td className="sticky-col room-title-cell">
                    <div className="room-title-content">
                      <div className="room-name-wrapper">
                        <strong>{room.name}</strong>
                        <span className="room-id">(ID: {room.id})</span>
                      </div>
                      <button className="btn-edit-bulk" onClick={() => handleOpenEdit(room)}>
                        <FiEdit /> Редагувати
                      </button>
                    </div>
                  </td>
                  <td className="room-title-bg" colSpan={dates.length}></td>
                </tr>

                <tr className="status-row">
                  <td className="sticky-col row-label">Статус номера</td>
                  {dates.map((date, idx) => {
                    const isOpen = isRoomOpen(room.id, date);
                    const booking = getBookingForDate(room.id, date); // Перевіряємо бронювання

                    // Визначаємо стиль і текст в залежності від статусу
                    let statusClass = 'open';
                    let statusText = 'Відкрито';
                    let bgStyle = {};

                    if (booking) {
                      statusClass = 'booked';
                      statusText = 'Зайнято';
                      bgStyle = { backgroundColor: '#e63946', color: 'white' }; // Червоний колір для зайнятого
                    } else if (!isOpen) {
                      statusClass = 'closed';
                      statusText = 'Закрито';
                    }

                    return (
                      <td key={idx} className="status-cell">
                        {/* Якщо є бронь, при наведенні покаже ім'я гостя */}
                        <div 
                          className={`status-bar ${statusClass}`} 
                          title={booking ? `Бронь: ${booking.guestName} (${booking.bookingCode})` : ''}
                          style={bgStyle}
                        >
                          {statusText}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="price-row">
                  <td className="sticky-col row-label">
                    <div className="price-label-content">
                      <div className="rate-title-wrapper" onClick={() => toggleRate(room.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#0071c2' }}>
                        {expandedRates[room.id] ? <FiChevronUp /> : <FiChevronDown />}
                        <span>Standard Rate</span>
                      </div>
                      <div className="rate-capacity-edit" onClick={(e) => handleOpenRateModal(e, room)} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', cursor: 'pointer', color: '#0071c2', fontSize: '0.85rem' }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm9 11a1 1 0 0 1-2 0v-2a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v2a1 1 0 0 1-2 0v-2a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v2Z"/></svg>
                        <span>&times; {maxCap} Змінити</span>
                      </div>
                    </div>
                  </td>
                  {dates.map((date, idx) => {
                    const isOpen = isRoomOpen(room.id, date);
                    const booking = getBookingForDate(room.id, date);
                    const currentPrice = getRoomPrice(room, date);
                    
                    // Відключаємо клітинку, якщо вона закрита АБО якщо там вже є бронь
                    const isDisabled = !isOpen || !!booking;

                    return (
                      <td key={idx} className={`data-cell price-data ${isDisabled ? 'disabled-cell' : ''}`}>
                        {!isDisabled && <span className="currency">UAH</span>}
                        <span className="amount">{!isDisabled ? currentPrice : (booking ? 'Бронь' : '')}</span>
                      </td>
                    );
                  })}
                </tr>
                
                {expandedRates[room.id] && Array.from({ length: maxCap - 1 }).map((_, loopIdx) => {
                  const guestCount = maxCap - 1 - loopIdx; 
                  
                  return (
                    <tr className="sub-price-row" key={`sub-${room.id}-${guestCount}`}>
                      <td className="sticky-col row-label sub-label">
                        <div className="guest-count-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#555', paddingLeft: '20px' }}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm9 11a1 1 0 0 1-2 0v-2a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v2a1 1 0 0 1-2 0v-2a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v2Z"/></svg>
                          <span>&times; {guestCount}</span>
                        </div>
                      </td>
                      {dates.map((date, idx) => {
                        const isOpen = isRoomOpen(room.id, date);
                        const booking = getBookingForDate(room.id, date);
                        const currentPrice = getRoomPrice(room, date);
                        const discount = getDiscountForRoom(room.id, guestCount);
                        const subPrice = currentPrice - discount; 
                        
                        const isDisabled = !isOpen || !!booking;

                        return (
                          <td key={idx} className={`data-cell sub-price-data ${isDisabled ? 'disabled-cell' : ''}`} style={{ backgroundColor: '#f7f7f7', color: '#555' }}>
                            {!isDisabled && subPrice > 0 ? subPrice : ''}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                <tr className="restriction-row">
                  <td className="sticky-col row-label restriction-label">Мін. термін перебування</td>
                  {dates.map((date, idx) => {
                    const isOpen = isRoomOpen(room.id, date);
                    const booking = getBookingForDate(room.id, date);
                    const minStay = getRoomMinStay(room, date);
                    
                    const isDisabled = !isOpen || !!booking;

                    return (
                      <td key={idx} className={`data-cell ${isDisabled ? 'disabled-cell' : ''}`}>
                        {!isDisabled ? minStay : ''}
                      </td>
                    );
                  })}
                </tr>

                <tr className="spacer-row"><td colSpan={dates.length + 1}></td></tr>
              </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- БОКОВА ПАНЕЛЬ МАСОВОГО РЕДАГУВАННЯ --- */}
      {editingRoom && (
        <>
          <div className="bulk-edit-overlay" onClick={() => setEditingRoom(null)}></div>
          <div className="bulk-edit-panel">
            <div className="bulk-panel-header">
              <h3>Редагування списком</h3>
              <button className="close-panel-btn" onClick={() => setEditingRoom(null)}><FiX /></button>
            </div>
            
            <div className="bulk-panel-body">
              <div className="bulk-dates-row">
                <div className="bulk-input-group">
                  <label>Від:</label>
                  <input type="date" value={editForm.fromDate} min={todayStr} 
                         onChange={e => setEditForm({...editForm, fromDate: e.target.value})} />
                </div>
                <div className="bulk-input-group">
                  <label>По (включно):</label>
                  <input type="date" value={editForm.toDate} min={editForm.fromDate || todayStr} 
                         onChange={e => setEditForm({...editForm, toDate: e.target.value})} />
                </div>
              </div>

              <div className="bulk-info-badge">
                Ви редагуєте: <strong>{editingRoom.name}</strong>
              </div>

              <div className="bulk-accordion-card">
                <div className="card-header" onClick={() => togglePanel('price')}>
                  <h4>Ціни</h4> 
                  {expandedPanels.price ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {expandedPanels.price && (
                  <div className="card-body">
                    <label>Змінити ціну для цього номера (UAH)</label>
                    <input type="number" placeholder="Нова ціна..." value={editForm.price} 
                           onChange={e => setEditForm({...editForm, price: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="bulk-accordion-card">
                <div className="card-header" onClick={() => togglePanel('status')}>
                  <h4>Статус номера</h4> 
                  {expandedPanels.status ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {expandedPanels.status && (
                  <div className="card-body">
                    <label>Відкрити або закрити цей номер</label>
                    <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                      <option value="no_change">Не змінювати</option>
                      <option value="open">Відкрити для бронювань</option>
                      <option value="closed">Закрити</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="bulk-accordion-card">
                <div className="card-header" onClick={() => togglePanel('restrictions')}>
                  <h4>Обмеження</h4> 
                  {expandedPanels.restrictions ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {expandedPanels.restrictions && (
                  <div className="card-body">
                    <label>Мінімальний термін перебування (ночей)</label>
                    <input type="number" min="1" placeholder="Наприклад: 2" value={editForm.minStay} 
                           onChange={e => setEditForm({...editForm, minStay: e.target.value})} />
                  </div>
                )}
              </div>
            </div>

            <div className="bulk-panel-footer">
              <button className="btn-save-bulk" onClick={handleSaveBulkEdit}>Зберегти зміни</button>
            </div>
          </div>
        </>
      )}

      {/* --- МОДАЛЬНЕ ВІКНО НАЛАШТУВАННЯ ТАРИФУ --- */}
      {rateModal && (
        <>
          <div className="bulk-edit-overlay" onClick={() => setRateModal(null)}></div>
          <div className="bulk-edit-panel" style={{ width: '600px' }}> 
            <div className="bulk-panel-header">
              <h3>Редагування тарифу за кількістю гостей: {rateModal.name}</h3>
              <button className="close-panel-btn" onClick={() => setRateModal(null)}><FiX /></button>
            </div>
            
            <div className="bulk-panel-body">
              <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '20px' }}>
                Ви можете змінювати свої ціни в залежності від кількості гостей - наприклад, вибрати фіксовану знижку на людину.
              </p>
              
              <div className="bulk-accordion-card" style={{ marginBottom: '15px' }}>
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ marginTop: '3px' }}><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm9 11a1 1 0 0 1-2 0v-2a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v2a1 1 0 0 1-2 0v-2a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v2Z"/></svg>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '1rem', color: '#333' }}>
                        {rateModal.maxCapacity > 1 ? rateModal.maxCapacity : 2} гостей
                      </span>
                      <span 
                        onClick={handleChangeBaseCapacity}
                        style={{ color: '#0071c2', fontSize: '0.85rem', cursor: 'pointer', marginTop: '2px', textDecoration: 'none' }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        Змінити стандартну місткість
                      </span>
                    </div>
                  </div>
                  
                  <span style={{ fontWeight: '500', paddingTop: '2px' }}>Стандартна ціна</span>
                </div>
              </div>

              {Array.from({ length: (rateModal.maxCapacity > 1 ? rateModal.maxCapacity : 2) - 1 }).map((_, idx) => {
                const guestCount = (rateModal.maxCapacity > 1 ? rateModal.maxCapacity : 2) - 1 - idx;
                
                return (
                  <div className="bulk-accordion-card" key={`modal-rule-${guestCount}`} style={{ marginBottom: '10px' }}>
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px' }}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm9 11a1 1 0 0 1-2 0v-2a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v2a1 1 0 0 1-2 0v-2a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v2Z"/></svg>
                          <span>{guestCount} {guestCount === 1 ? 'гість' : 'гості'}</span>
                        </div>
                        
                        <div style={{ width: '250px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Стандартна ціна зменшилася на</label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                              type="number" 
                              value={discountInputs[guestCount] || ''}
                              onChange={(e) => setDiscountInputs({...discountInputs, [guestCount]: e.target.value})}
                              placeholder="Наприклад: 300"
                              style={{ padding: '8px', width: '100px', border: '1px solid #ccc', borderRadius: '4px' }} 
                            />
                            <select style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                              <option>UAH</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bulk-panel-footer" style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-save-bulk" style={{ width: 'auto', padding: '10px 20px' }} onClick={handleSaveRateRule}>Зберегти</button>
              <button style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #0071c2', color: '#0071c2', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setRateModal(null)}>Скасувати</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AvailabilityCalendar;