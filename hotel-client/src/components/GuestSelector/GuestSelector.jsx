import React, { useState, useRef, useEffect } from 'react';
import { FiUsers, FiPlus, FiMinus } from 'react-icons/fi';
import './GuestSelector.css';

export default function GuestSelector({ guestConfig, setGuestConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCount = (field, delta) => {
    setGuestConfig(prev => {
      const newValue = prev[field] + delta;
      
      if (field === 'adults' && (newValue < 1 || newValue > 10)) return prev;
      if (field === 'children' && (newValue < 0 || newValue > 10)) return prev;

      return { ...prev, [field]: newValue };
    });
  };

  const formatSummary = () => {
    const { adults, children } = guestConfig;
    let text = `${adults} дорос${adults === 1 ? 'лий' : 'лих'}`;
    
    if (children > 0) {
      let childText = 'дітей';
      if (children === 1) childText = 'дитина';
      else if (children > 1 && children < 5) childText = 'дитини';
      
      text += `, ${children} ${childText}`;
    }
    return text;
  };

  return (
    <div className="guest-selector-wrapper" ref={wrapperRef}>
      
      <button 
        type="button" 
        className={`guest-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="guest-trigger-info">
          <span className="guest-trigger-label">Кількість гостей</span>
          <span className="guest-trigger-value">{formatSummary()}</span>
        </div>
        <FiUsers className="guest-trigger-icon" />
      </button>

      {isOpen && (
        <div className="guest-dropdown">
          
          <div className="guest-row">
            <div className="guest-row-info">
              <span className="guest-row-title">Дорослі</span>
              <span className="guest-row-subtitle">Від 18 років</span>
            </div>
            <div className="guest-controls">
              <button type="button" className="counter-btn" disabled={guestConfig.adults <= 1} onClick={() => updateCount('adults', -1)}>
                <FiMinus />
              </button>
              <span className="counter-value">{guestConfig.adults}</span>
              <button type="button" className="counter-btn" disabled={guestConfig.adults >= 10} onClick={() => updateCount('adults', 1)}>
                <FiPlus />
              </button>
            </div>
          </div>

          <div className="guest-row" style={{ borderBottom: 'none' }}>
            <div className="guest-row-info">
              <span className="guest-row-title">Діти</span>
              <span className="guest-row-subtitle">Від 0 до 17 років</span>
            </div>
            <div className="guest-controls">
              <button type="button" className="counter-btn" disabled={guestConfig.children <= 0} onClick={() => updateCount('children', -1)}>
                <FiMinus />
              </button>
              <span className="counter-value">{guestConfig.children}</span>
              <button type="button" className="counter-btn" disabled={guestConfig.children >= 10} onClick={() => updateCount('children', 1)}>
                <FiPlus />
              </button>
            </div>
          </div>

          <button type="button" className="guest-done-btn" onClick={() => setIsOpen(false)}>
            Готово
          </button>
        </div>
      )}
    </div>
  );
}