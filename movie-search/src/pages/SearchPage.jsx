import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Берем данные из URL (если их нет, ставим дефолтные)
  const urlQuery = searchParams.get('q') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const [query, setQuery] = useState(urlQuery);
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState(urlQuery ? 'loading' : 'idle');
  const [totalResults, setTotalResults] = useState(0);
  
  const [history, setHistory] = useState([]);

  // --- Загрузка истории ---
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setHistory(saved);
  }, []);

  const addToHistory = (searchTerm) => {
    if (!searchTerm.trim()) return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== searchTerm.toLowerCase());
      const newHistory = [searchTerm, ...filtered].slice(0, 5);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // --- Дебаунс (Автопоиск) ---
  useEffect(() => {
    if (query.trim().length < 3) {
      if (query === "") {
        setMovies([]);
        setStatus('idle');
        setSearchParams({}); 
      }
      return;
    }

    const timer = setTimeout(() => {
      if (query !== urlQuery) {
        // При новом поиске сбрасываем страницу на первую
        setSearchParams({ q: query.trim(), page: 1 }); 
        addToHistory(query.trim());
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [query, urlQuery, setSearchParams]);

  // --- Запрос к API ---
  useEffect(() => {
    if (!urlQuery) return;

    setStatus('loading');
    fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(urlQuery)}&page=${currentPage}&apikey=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.Response === "False") {
          setMovies([]);
          setTotalResults(0);
          setStatus('error');
        } else {
          setMovies(data.Search || []);
          setTotalResults(Number(data.totalResults) || 0);
          setStatus('success');
        }
      })
      .catch(() => setStatus('error'));
  }, [urlQuery, currentPage]); // Эффект зависит от запроса и страницы

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length >= 3) {
      setSearchParams({ q: query.trim(), page: 1 }); // Поиск всегда с 1-й страницы
      addToHistory(query.trim());
    }
  };

  const totalPages = Math.ceil(totalResults / 10);

  // Обработчик смены страницы через URL
  const handlePageChange = (newPage) => {
    setSearchParams({ q: urlQuery, page: newPage });
  };

  return (
    <div>
      <h1>Поиск</h1>
      
      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите название (от 3 букв)..."
        />
        <button type="submit" disabled={status === 'loading' || !query.trim()}>
          Найти
        </button>
      </form>

      {history.length > 0 && (
        <div className="history-container">
          <span>История:</span>
          {history.map((item, idx) => (
            <button 
              key={idx} 
              className="history-tag" 
              onClick={() => { setQuery(item); setSearchParams({ q: item, page: 1 }); }}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {status === 'idle' && <p className="message">Введите запрос.</p>}
      {status === 'loading' && <p className="message loading">Поиск...</p>}
      {status === 'error' && <p className="message error">Ничего не найдено.</p>}
      
      {status === 'success' && (
        <>
          <div className="movie-list">
            {movies.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}