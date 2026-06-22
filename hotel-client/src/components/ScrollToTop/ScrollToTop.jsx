import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import './ScrollToTop.css';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Перевіряємо позицію скролу
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Плавний скрол нагору
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    // Додаємо слухача події скролу при завантаженні компонента
    window.addEventListener('scroll', toggleVisibility);
    
    // Прибираємо слухача при видаленні компонента (очищення)
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className="scroll-to-top">
      {isVisible && (
        <button onClick={scrollToTop} className="scroll-btn" aria-label="Повернутися нагору">
          <FiArrowUp />
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;