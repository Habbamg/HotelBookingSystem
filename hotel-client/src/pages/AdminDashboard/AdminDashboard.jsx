import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiInbox, FiGrid, FiSettings, FiLogOut, FiMenu, FiX, FiList, FiMessageSquare } from 'react-icons/fi'; // 🔥 Додали FiMessageSquare
import './AdminDashboard.css';
import BookingsTab from './BookingsTab'; 

// ІМПОРТУЄМО НАШІ РОЗДІЛЕНІ КОМПОНЕНТИ
import AvailabilityCalendar from '../../components/AvailabilityCalendar/AvailabilityCalendar';
import RoomsTab from '../../components/RoomsTab/RoomsTab';
import SettingsTab from './SettingsTab'; 
import ReviewsTab from './ReviewsTab'; // 🔥 Додали імпорт нової вкладки відгуків
import logo from '../../assets/logo.png'; 

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 🔥 ОХОРОНЕЦЬ 2: Якщо токена немає (зайшли по прямому посиланню) - викидаємо на логін
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === '' || token === 'undefined') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    if(window.confirm('Ви впевнені, що хочете вийти?')) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-layout">
      {isMobileMenuOpen && <div className="admin-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <header className="admin-topbar-global">
        <div className="topbar-left">
          <button className="menu-toggle-btn" onClick={() => setIsMobileMenuOpen(true)}><FiMenu /></button>
          
          {/* Клікабельний логотип для переходу на сайт без втрати сесії */}
          <img 
            src={logo} 
            alt="Гостинний двір Буковець" 
            className="topbar-logo" 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer' }}
            title="Повернутися на сайт"
          />
        </div>
        <div className="admin-topbar-info desktop-only">
          <span>Адміністратор</span>
          <div className="admin-avatar">А</div>
        </div>
      </header>

      <div className="admin-body">
        <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-close-container">
            <button className="close-mobile-menu" onClick={() => setIsMobileMenuOpen(false)}><FiX /></button>
          </div>
          
          <nav className="admin-nav">
            <button className={`admin-nav-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => handleTabChange('bookings')}>
              <FiInbox /> <span>Календар</span>
            </button>
            
            <button className={`admin-nav-btn ${activeTab === 'bookings-list' ? 'active' : ''}`} onClick={() => handleTabChange('bookings-list')}>
              <FiList /> <span>Список бронювань</span>
            </button>

            <button className={`admin-nav-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => handleTabChange('rooms')}>
              <FiGrid /> <span>Номери</span>
            </button>

            {/* 🔥 НОВА КНОПКА ДЛЯ ВІДГУКІВ 🔥 */}
            <button className={`admin-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => handleTabChange('reviews')}>
              <FiMessageSquare /> <span>Відгуки</span>
            </button>

            <button className={`admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabChange('settings')}>
              <FiSettings /> <span>Налаштування</span>
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <div className="mobile-admin-profile">
              <div className="admin-avatar">А</div>
              <span>Адміністратор</span>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout}>
              <FiLogOut /> <span>Вийти з панелі</span>
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {/* Виводимо компонент залежно від обраної вкладки */}
          {activeTab === 'bookings' && <AvailabilityCalendar />}
          {activeTab === 'bookings-list' && <BookingsTab />}
          {activeTab === 'rooms' && <RoomsTab />}
          {activeTab === 'reviews' && <ReviewsTab />} {/* 🔥 ВИВІД КОМПОНЕНТА ВІДГУКІВ 🔥 */}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;