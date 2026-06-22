import React, { useState, useEffect } from 'react';
import { FiCheck, FiTrash2 } from 'react-icons/fi';

function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://andriyputiyk-001-site1.htempurl.com/api/Review/all', {
        headers: { 'Authorization': `Bearer ${token}` } // Додаємо токен адміна!
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Помилка завантаження відгуків:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://andriyputiyk-001-site1.htempurl.com/api/Review/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchReviews(); // Оновлюємо список після схвалення
      }
    } catch (error) {
      alert('Помилка з\'єднання');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей відгук назавжди?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://andriyputiyk-001-site1.htempurl.com/api/Review/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchReviews(); // Оновлюємо список
      }
    } catch (error) {
      alert('Помилка з\'єднання');
    }
  };

  if (isLoading) return <div style={{ padding: '20px' }}>Завантаження відгуків...</div>;

  return (
    <div className="admin-tab-container">
      <div className="admin-tab-header">
        <h2 className="admin-tab-title">Модерація відгуків</h2>
        <div className="admin-tab-subtitle">Керуйте відгуками, які залишають гості на сайті</div>
      </div>

      {reviews.length === 0 ? (
        <div style={{ marginTop: '20px', color: '#666' }}>Немає відгуків для відображення.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {reviews.map(review => (
            <div key={review.id} style={{ 
              backgroundColor: '#fff', 
              borderRadius: '12px', 
              padding: '20px', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              borderLeft: review.isApproved ? '5px solid #2ecc71' : '5px solid #f39c12'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <strong style={{ fontSize: '1.1rem', color: '#2c3e50' }}>{review.authorName}</strong>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold',
                  backgroundColor: review.isApproved ? '#e8f8f5' : '#fef5e7',
                  color: review.isApproved ? '#27ae60' : '#d35400'
                }}>
                  {review.isApproved ? 'Схвалено' : 'Очікує перевірки'}
                </span>
              </div>
              
              <div style={{ color: '#ffc107', marginBottom: '10px', fontSize: '1.2rem' }}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
              
              <p style={{ color: '#555', fontStyle: 'italic', marginBottom: '15px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                "{review.comment}"
              </p>
              
              <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '20px' }}>
                {new Date(review.createdAt).toLocaleDateString('uk-UA')} о {new Date(review.createdAt).toLocaleTimeString('uk-UA', {hour: '2-digit', minute:'2-digit'})}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {!review.isApproved && (
                  <button 
                    onClick={() => handleApprove(review.id)}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold' }}>
                    <FiCheck /> Схвалити
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(review.id)}
                  style={{ flex: review.isApproved ? 1 : 0, width: review.isApproved ? '100%' : 'auto', padding: '10px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold' }}>
                  <FiTrash2 /> {review.isApproved ? 'Видалити' : ''}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsTab;