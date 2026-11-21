import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState('loading');
  const [page, setPage] = useState(1); // Состояние для страницы
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    setStatus('loading');
   
    fetch(`https://www.omdbapi.com/?s=Marvel&page=${page}&apikey=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.Search) {
          setMovies(data.Search);
          setTotalResults(Number(data.totalResults) || 0);
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [page]);

  const totalPages = Math.ceil(totalResults / 10); // OMDb выдает по 10 фильмов

  return (
    <div>
      <h1>Популярные фильмы Marvel</h1>
      
      {status === 'loading' && <p className="message loading">Загрузка...</p>}
      {status === 'error' && <p className="message error">Ошибка загрузки.</p>}

      {status === 'success' && (
        <>
          <div className="movie-list">
            {movies.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
          
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}
    </div>
  );
}