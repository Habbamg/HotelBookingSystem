import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import { useState } from 'react';

// Імпорти сторінок
import Home from "./pages/Home/Home";
import Booking from "./pages/Booking/Booking";
import Checkout from "./pages/Checkout/Checkout";
import Login from './pages/Login/Login';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'; 
import './App.css'; 

// Імпортуємо наш логотип для клієнтської шапки
import logo from './assets/logo.png'; 

// =======================================================
// 1. МАКЕТ ДЛЯ КЛІЄНТІВ (з шапкою та підвалом)
// =======================================================
function ClientLayout({ isMenuOpen, setIsMenuOpen, closeMenu }) {
  return (
    <div className="hotel-app">
      {/* --- ШАПКА --- */}
      <header className="header">
        
        {/* ЗАМІНИЛИ ТЕКСТ НА ЛОГОТИП */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src={logo} alt="Гостинний двір Буковець" className="public-navbar-logo" />
        </Link>
        
        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" onClick={closeMenu}>Головна</Link>
          <Link to="/booking" onClick={closeMenu}>Номери</Link>
          <a href="#contacts" onClick={closeMenu}>Контакти</a>
          
          {/* Кнопка для персоналу */}
          <Link to="/login" className="nav-staff-link" onClick={closeMenu}>
            <span style={{ fontSize: '12px' }}>🔒</span> Персонал
          </Link>
        </nav>
      </header>

      {/* --- ДИНАМІЧНИЙ КОНТЕНТ --- */}
      <main>
        <Outlet /> 
      </main>

      {/* --- ПІДВАЛ --- */}
      <footer id="contacts" className="footer">
        <div className="footer-content">
          <h3>Контакти</h3>
          <p>📍 с. Буковець, Карпати</p>
          <p>📞 +380 (XX) XXX-XX-XX</p>
          <p>✉️ info@zatyshny-dvir.com</p>
        </div>
      </footer>
    </div>
  );
}

// =======================================================
// 2. ГОЛОВНИЙ КОМПОНЕНТ APP
// =======================================================
function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Router>
      <Routes>
        
        {/* === ЗОНА КЛІЄНТА === */}
        <Route element={<ClientLayout isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} closeMenu={closeMenu} />}>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>

        {/* === ЗОНА АДМІНІСТРАТОРА === */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
      </Routes>
    </Router>
  );
}

export default App;