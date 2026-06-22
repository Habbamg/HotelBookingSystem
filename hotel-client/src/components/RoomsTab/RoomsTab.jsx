import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiChevronRight, 
  FiChevronLeft, FiImage, FiList, FiInfo, FiUsers, FiMaximize 
} from 'react-icons/fi';
import './RoomsTab.css'; 

const RoomsTab = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [dbAmenities, setDbAmenities] = useState([]);
  const [newAmenityForm, setNewAmenityForm] = useState({ name: '', iconClass: '' });
  const [isCreatingAmenity, setIsCreatingAmenity] = useState(false);

  const [newRoom, setNewRoom] = useState({
    name: '', description: '', isActive: true, basePrice: 0, extraPersonPrice: 0, 
    minBookingDays: 1, baseCapacity: 2, maxCapacity: 2, area: 20, roomsCount: 1
  });
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [roomImages, setRoomImages] = useState(['']); 

  // --- ЗАВАНТАЖЕННЯ ДАНИХ З БЕКЕНДУ ---
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://andriyputiyk-001-site1.htempurl.comapi/Room'); 
      if (response.ok) setRooms(await response.json());
    } catch (error) { console.error("Помилка завантаження номерів:", error); }
    finally { setLoading(false); }
  };

  const fetchAmenities = async () => {
    try {
      const response = await fetch('https://andriyputiyk-001-site1.htempurl.comapi/Amenity'); 
      if (response.ok) setDbAmenities(await response.json());
    } catch (error) { console.error("Помилка завантаження зручностей:", error); }
  };

  useEffect(() => { 
    fetchRooms(); 
    fetchAmenities(); 
  }, []);

  // --- ОБРОБНИКИ ФОРМИ ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleAmenity = (id) => {
    setSelectedAmenities(prev => prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]);
  };

  const handleCreateNewAmenity = async (e) => {
    e.preventDefault();
    if (!newAmenityForm.name.trim()) return;
    try {
      setIsCreatingAmenity(true);
      const response = await fetch('https://andriyputiyk-001-site1.htempurl.comapi/Amenity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`},
        body: JSON.stringify({ name: newAmenityForm.name, iconClass: newAmenityForm.iconClass || 'bi-gear' })
      });
      if (response.ok) {
        const createdAmenity = await response.json();
        setNewAmenityForm({ name: '', iconClass: '' });
        await fetchAmenities(); 
        setSelectedAmenities(prev => [...prev, createdAmenity.id]);
      }
    } catch (error) { console.error(error); } 
    finally { setIsCreatingAmenity(false); }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...roomImages];
    newImages[index] = value;
    setRoomImages(newImages);
  };

  const addImageField = () => setRoomImages([...roomImages, '']);

  // --- ВІДКРИТТЯ МОДАЛКИ (СТВОРЕННЯ АБО РЕДАГУВАННЯ) ---
  const handleOpenCreate = () => {
    setEditingRoomId(null);
    setNewRoom({ name: '', description: '', isActive: true, basePrice: 0, extraPersonPrice: 0, minBookingDays: 1, baseCapacity: 2, maxCapacity: 2, area: 20, roomsCount: 1 });
    setSelectedAmenities([]); 
    setRoomImages(['']); 
    setStep(1); 
    setIsModalOpen(true);
  };

  const handleEditClick = (room) => {
    setEditingRoomId(room.id);
    setNewRoom({
      name: room.name, description: room.description || '', isActive: room.isActive, 
      basePrice: room.basePrice, extraPersonPrice: room.extraPersonPrice, 
      minBookingDays: room.minBookingDays, baseCapacity: room.baseCapacity, 
      maxCapacity: room.maxCapacity, area: room.area, roomsCount: room.roomsCount
    });
    // JSON серіалізатор C# зазвичай робить поля з маленької букви (amenities, images)
    setSelectedAmenities(room.amenities ? room.amenities.map(a => a.id) : []);
    setRoomImages(room.images && room.images.length > 0 ? room.images.map(img => img.url) : ['']);
    setStep(1);
    setIsModalOpen(true);
  };

  const resetForm = () => setIsModalOpen(false);

  // --- ВИДАЛЕННЯ НОМЕРА ---
  const handleDeleteRoom = async (id, name) => {
    if (window.confirm(`Ви дійсно хочете видалити номер "${name}"? Це дія незворотна.`)) {
      try {
        const response = await fetch(`https://andriyputiyk-001-site1.htempurl.comapi/Room/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
          fetchRooms(); 
        } else {
          alert('Помилка при видаленні номера.');
        }
      } catch (error) {
        console.error("Помилка видалення:", error);
      }
    }
  };

  // --- ЗБЕРЕЖЕННЯ ДАНИХ (СТВОРЕННЯ / ОНОВЛЕННЯ) ---
  const handleSaveFullRoom = async () => {
    try {
      setIsSaving(true);
      const roomToSave = {
        ...newRoom, basePrice: parseFloat(newRoom.basePrice), extraPersonPrice: parseFloat(newRoom.extraPersonPrice),
        minBookingDays: parseInt(newRoom.minBookingDays), baseCapacity: parseInt(newRoom.baseCapacity),
        maxCapacity: parseInt(newRoom.maxCapacity), area: parseInt(newRoom.area), roomsCount: parseInt(newRoom.roomsCount)
      };

      let roomId = editingRoomId;

      if (editingRoomId) {
        // Оновлюємо існуючий
        const res = await fetch(`https://andriyputiyk-001-site1.htempurl.comapi/Room/${editingRoomId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(roomToSave)
        });
        if (!res.ok) throw new Error("Помилка оновлення");
      } else {
        // Створюємо новий
        const res = await fetch('https://andriyputiyk-001-site1.htempurl.comapi/Room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(roomToSave)
        });
        if (!res.ok) throw new Error("Помилка створення");
        const createdRoom = await res.json();
        roomId = createdRoom.id;
      }

      // ОНОВЛЕННЯ ЗРУЧНОСТЕЙ
      const originalRoom = editingRoomId ? rooms.find(r => r.id === editingRoomId) : null;
      const originalAmenities = originalRoom?.amenities?.map(a => a.id) || [];

      const amenitiesToAdd = selectedAmenities.filter(id => !originalAmenities.includes(id));
      const amenitiesToRemove = originalAmenities.filter(id => !selectedAmenities.includes(id));

      for (const amenityId of amenitiesToAdd) {
        await fetch(`https://andriyputiyk-001-site1.htempurl.comapi/Room/${roomId}/amenity/${amenityId}`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      }

      if (editingRoomId) {
        for (const amenityId of amenitiesToRemove) {
          await fetch(`https://andriyputiyk-001-site1.htempurl.comapi/Room/${roomId}/amenity/${amenityId}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
        }
      }

      // ОНОВЛЕННЯ ФОТО
     // --- ОНОВЛЕННЯ ФОТОГРАФІЙ ---
      const validImages = roomImages.filter(url => url.trim() !== '');
      
      if (editingRoomId) {
        // Якщо це РЕДАГУВАННЯ - використовуємо наш новий метод синхронізації
        await fetch(`https://andriyputiyk-001-site1.htempurl.comapi/Room/${roomId}/sync-images`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(validImages)
        });
      } else {
        // Якщо це СТВОРЕННЯ нового номера - додаємо фото по одному
        for (const url of validImages) {
          await fetch(`https://andriyputiyk-001-site1.htempurl.comapi/Room/${roomId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ url: url, type: "image", isMain: true }) 
          });
        }
      }

      alert(editingRoomId ? 'Номер успішно оновлено!' : 'Номер успішно створено!'); 
      resetForm(); 
      fetchRooms();
    } catch (error) { alert('Помилка при збереженні.'); } 
    finally { setIsSaving(false); }
  };

  if (loading) return <div className="admin-loading-placeholder">Завантаження кімнат...</div>;

  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <h2>Керування номерним фондом</h2>
        <button className="btn-add-item" onClick={handleOpenCreate}>
          <FiPlus /> Додати новий номер
        </button>
      </div>

      <div className="rooms-grid">
        {rooms.length > 0 ? rooms.map(room => {
          // Захист від різних регістрів, які може віддати бекенд
          const roomAmenities = room.amenities || room.Amenities || [];
          const firstImage = (room.images && room.images.length > 0) ? room.images[0].url : null;

          return (
            <div className="room-card-ui" key={room.id}>
              <div className="room-card-image">
               {room.images && room.images.length > 0 && room.images[0].url && room.images[0].url !== 'string' ? (
                <img src={room.images[0].url} alt={room.name} onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="no-image-placeholder"><FiImage size={32} /><span>Немає фото</span></div>
              )}
              </div>
              
              <div className="room-card-info">
                <h3 className="room-card-title">{room.name}</h3>
                
                <div className="room-card-specs">
                  <div className="spec-item" title="Місткість">
                    <FiUsers /> <span>До {room.maxCapacity} осіб</span>
                  </div>
                  <div className="spec-item" title="Площа">
                    <FiMaximize /> <span>{room.area} м²</span>
                  </div>
                </div>

                {/* ПРЕВ'Ю ЗРУЧНОСТЕЙ */}
                {roomAmenities.length > 0 && (
                  <div className="room-card-amenities-preview">
                    {roomAmenities.slice(0, 4).map(amenity => (
                      <span key={amenity.id} className="amenity-preview-badge" title={amenity.name}>
                        <i className={`bi ${amenity.iconClass}`}></i>
                        <span>{amenity.name}</span>
                      </span>
                    ))}
                    {roomAmenities.length > 4 && (
                      <span className="amenity-more-count">+{roomAmenities.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="room-card-price">
                  <span className="amount">{room.basePrice} ₴</span>
                  <span className="period">/ ніч</span>
                </div>
              </div>

              <div className="room-card-actions">
                <button className="btn-card-edit" onClick={() => handleEditClick(room)}>
                  <FiEdit2 /> Редагувати
                </button>
                <button className="btn-card-delete" onClick={() => handleDeleteRoom(room.id, room.name)}>
                  <FiTrash2 /> Видалити
                </button>
              </div>
            </div>
          );
        }) : (
          <div style={{gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "#888"}}>
            Номери ще не додані.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content large-wizard-modal">
            <div className="modal-header wizard-header">
              <div className="wizard-steps">
                <div className={`wizard-step ${step >= 1 ? 'active' : ''}`} onClick={() => setStep(1)}><span className="step-icon"><FiInfo /></span> 1. Головне</div>
                <div className="step-divider"></div>
                <div className={`wizard-step ${step >= 2 ? 'active' : ''}`} onClick={() => setStep(2)}><span className="step-icon"><FiList /></span> 2. Зручності</div>
                <div className="step-divider"></div>
                <div className={`wizard-step ${step >= 3 ? 'active' : ''}`} onClick={() => setStep(3)}><span className="step-icon"><FiImage /></span> 3. Фотографії</div>
              </div>
              <button className="close-modal-btn" onClick={resetForm}><FiX /></button>
            </div>
            
            <div className="modal-body wizard-body">
              {step === 1 && (
                <div className="wizard-step-content animation-fade-in">
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}><label>Назва номера</label><input type="text" name="name" value={newRoom.name} onChange={handleInputChange} /></div>
                    <div className="form-group"><label>Базова ціна (₴)</label><input type="number" name="basePrice" value={newRoom.basePrice} onChange={handleInputChange} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Станд. місткість</label><input type="number" name="baseCapacity" value={newRoom.baseCapacity} onChange={handleInputChange} /></div>
                    <div className="form-group"><label>Макс. місткість</label><input type="number" name="maxCapacity" value={newRoom.maxCapacity} onChange={handleInputChange} /></div>
                    <div className="form-group"><label>Площа (м²)</label><input type="number" name="area" value={newRoom.area} onChange={handleInputChange} /></div>
                  </div>
                  <div className="form-group"><label>Детальний опис</label><textarea name="description" rows="4" value={newRoom.description} onChange={handleInputChange}></textarea></div>
                  <div className="form-group checkbox-group" style={{ marginTop: '15px' }}><label><input type="checkbox" name="isActive" checked={newRoom.isActive} onChange={handleInputChange} /> Показувати на сайті</label></div>
                </div>
              )}
              {step === 2 && (
                <div className="wizard-step-content animation-fade-in">
                  <div className="create-amenity-block">
                    <h5>Створити нову зручність:</h5>
                    <div className="create-amenity-inputs">
                      <input type="text" placeholder="Назва (Напр. Басейн)" value={newAmenityForm.name} onChange={e => setNewAmenityForm({...newAmenityForm, name: e.target.value})} />
                      <input type="text" placeholder="Іконка (bi-water)" value={newAmenityForm.iconClass} onChange={e => setNewAmenityForm({...newAmenityForm, iconClass: e.target.value})} />
                      <button type="button" onClick={handleCreateNewAmenity} disabled={isCreatingAmenity}>{isCreatingAmenity ? '...' : '+ Створити'}</button>
                    </div>
                  </div>
                  <h4>Виберіть зручності для номера:</h4>
                  <div className="amenities-grid">
                    {dbAmenities.map(amenity => (
                      <div key={amenity.id} className={`amenity-card ${selectedAmenities.includes(amenity.id) ? 'selected' : ''}`} onClick={() => toggleAmenity(amenity.id)}>
                        <div className="amenity-checkbox">{selectedAmenities.includes(amenity.id) && <FiCheck />}</div>
                        <i className={`bi ${amenity.iconClass} amenity-icon`}></i>
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="wizard-step-content animation-fade-in">
                  <h4>Додайте URL фотографій</h4>
                  <div className="images-list">
                    {roomImages.map((img, idx) => (
                      <div className="form-group" key={idx}><input type="text" value={img} onChange={(e) => handleImageChange(idx, e.target.value)} /></div>
                    ))}
                    <button type="button" className="btn-add-image-field" onClick={addImageField}>+ Додати фото</button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer wizard-footer">
              {step > 1 ? (<button type="button" className="btn-cancel" onClick={() => setStep(step - 1)}><FiChevronLeft /> Назад</button>) : (<button type="button" className="btn-cancel" onClick={resetForm}>Скасувати</button>)}
              {step < 3 ? (<button type="button" className="btn-submit" onClick={() => setStep(step + 1)}>Далі <FiChevronRight /></button>) : (<button type="button" className="btn-submit btn-finish" onClick={handleSaveFullRoom} disabled={isSaving}>{isSaving ? 'Збереження...' : '✔ Зберегти'}</button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsTab;