import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        // Твій бекенд повертає просто текст (стрічку токена), тому читаємо як .text()
        const token = await response.text();
        
        // Ховаємо токен у локальне сховище браузера
        localStorage.setItem('token', token); 
        
        // Переходимо в адмінку
        navigate('/admin-dashboard');
      } else {
        const errorText = await response.text();
        setError(errorText || 'Неправильний логін або пароль');
      }
    } catch (err) {
      console.error(err);
      setError('Помилка з\'єднання з сервером. Перевірте, чи запущений бекенд.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>Вхід в систему</h2>
          <p>Панель керування готелем</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Логін</label>
            <input 
              type="text" 
              name="username" 
              value={credentials.username} 
              onChange={handleChange} 
              required 
              placeholder="Введіть ваш логін"
            />
          </div>

          <div className="input-group">
            <label>Пароль</label>
            <input 
              type="password" 
              name="password" 
              value={credentials.password} 
              onChange={handleChange} 
              required 
              placeholder="Введіть пароль"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login">Увійти</button>
        </form>
        
        <button className="btn-back-home" onClick={() => navigate('/')}>
          &larr; На головну
        </button>
      </div>
    </div>
  );
}

export default Login;