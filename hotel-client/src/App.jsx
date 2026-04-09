import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Home from "./pages/Home/Home";
import Booking from './pages/Booking';
import './App.css'; 

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Router>
      <div className="hotel-app">
        
        {/* ================= ШАПКА ================= */}
        <header className="header">
          <Link to="/" className="logo" onClick={closeMenu}>Затишний Двір</Link>
          
          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>

          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            {/* Використовуємо Link замість тегів <a> */}
            <Link to="/" onClick={closeMenu}>Головна</Link>
            <Link to="/booking" onClick={closeMenu}>Номери</Link>
            <a href="#contacts" onClick={closeMenu}>Контакти</a>
          </nav>
        </header>

        {/* ================= СТОРІНКИ (ДИНАМІЧНА ЧАСТИНА) ================= */}
        <main>
          <Routes>
            {/* Коли адреса "/", показуємо компонент Home */}
            <Route path="/" element={<Home />} />
            {/* Коли адреса "/booking", показуємо компонент Booking */}
            <Route path="/booking" element={<Booking />} />
          </Routes>
        </main>

        {/* ================= ПІДВАЛ ================= */}
        <footer id="contacts" className="footer">
          <div className="footer-content">
            <h3>Контакти</h3>
            <p>📍 с. Буковець, Карпати</p>
            <p>📞 +380 (XX) XXX-XX-XX</p>
            <p>✉️ info@zatyshny-dvir.com</p>
          </div>
        </footer>

      </div>
    </Router>
  );
}

export default App;