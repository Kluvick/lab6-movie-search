import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Базовые данные из карточки (если перешли по клику) или null (если по прямой ссылке)
  const [movie, setMovie] = useState(location.state?.movie || null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    
    setStatus('loading');
    fetch(`https://www.omdbapi.com/?i=${id}&plot=full&apikey=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        if (data.Response === "False") {
          setStatus('error');
        } else {
          setMovie(data); // Обновляем данные на полные
          setStatus('success');
        }
      })
      .catch(() => setStatus('error'));
  }, [id]); // Срабатывает при изменении ID в URL

  if (status === 'error') return <p className="message error">Фильм не найден.</p>;
  
  // Пока грузятся полные данные, показываем базовые, чтобы не было пустого экрана
  if (!movie) return <p className="message loading">Загрузка деталей...</p>;

  return (
    <div className="movie-details">
      <button className="btn-back" onClick={() => navigate(-1)}>← Назад</button>
      
      <div className="details-content">
        <img 
          src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/300x450?text=No+Poster'} 
          alt={movie.Title} 
          className="details-poster"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/300x450?text=No+Poster';
          }}
        />
        
        <div className="details-info">
          <h1>{movie.Title} ({movie.Year})</h1>
          <p><strong>Жанр:</strong> {movie.Genre || 'Загрузка...'}</p>
          <p><strong>Режиссёр:</strong> {movie.Director || 'Загрузка...'}</p>
          <p><strong>Рейтинг:</strong> ⭐ {movie.imdbRating || 'Загрузка...'}</p>
          <h3>Описание:</h3>
          <p>{movie.Plot || 'Загрузка описания...'}</p>
        </div>
      </div>
    </div>
  );
}