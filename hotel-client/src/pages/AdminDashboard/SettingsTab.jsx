import React, { useState, useEffect } from 'react';

const SettingsTab = () => {
  const [maxDate, setMaxDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Завантажуємо поточні налаштування при відкритті вкладки
    fetch('https://andriyputiyk-001-site1.htempurl.comapi/settings')
      .then(res => res.json())
      .then(data => {
        // Конвертуємо дату з бази (2026-08-30T00:00:00) у формат для інпута (YYYY-MM-DD)
        if (data && data.maxBookingDate) {
          setMaxDate(data.maxBookingDate.split('T')[0]);
        }
      })
      .catch(err => console.error("Помилка завантаження налаштувань", err));
  }, []);

  const handleSave = async () => {
    if (!maxDate) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('https://andriyputiyk-001-site1.htempurl.comapi/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        // Відправляємо вибрану дату на бекенд
        body: JSON.stringify({ maxBookingDate: maxDate })
      });

      if (response.ok) {
        alert('Налаштування успішно збережено!');
      } else {
        alert('Помилка при збереженні.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <h2>Глобальні налаштування</h2>
      </div>

      <div style={{ background: '#fdfdfd', padding: '20px', borderRadius: '8px', border: '1px solid #eaeaea', maxWidth: '500px' }}>
        <h3 style={{ marginTop: 0, color: '#1b4332', fontSize: '1.2rem' }}>Горизонт бронювання</h3>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
          Оберіть кінцеву дату, до якої гості зможуть бронювати номери на сайті. Усі дати після цього дня будуть недоступні в календарі.
        </p>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input 
            type="date" 
            value={maxDate} 
            onChange={(e) => setMaxDate(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn-submit"
            style={{ padding: '10px 20px', backgroundColor: '#1b4332', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isSaving ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;