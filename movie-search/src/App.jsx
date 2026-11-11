import { useState, useEffect, useCallback } from "react";
import MovieCard from "./MovieCard";

const API_KEY = "eb960b6b"; 

function App() {
  // --- Состояния поиска и результатов ---
  const [query, setQuery] = useState(""); // То, что вводит пользователь
  const [searchQuery, setSearchQuery] = useState(""); // То, что реально ищем
  const [movies, setMovies] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  // --- Пагинация ---
  const [page, setPage] = useState(1);

  // --- Фильтрация по годам ---
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");

  // --- История поиска ---
  const [history, setHistory] = useState([]);

  // 1. Загрузка истории из localStorage при старте
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setHistory(savedHistory);
  }, []);

  // 2. Функция добавления в историю
  const addToHistory = (searchTerm) => {
    if (!searchTerm.trim()) return;
    setHistory((prev) => {
      // Убираем дубликаты (без учета регистра) и оставляем только 5 последних
      const filtered = prev.filter((item) => item.toLowerCase() !== searchTerm.toLowerCase());
      const newHistory = [searchTerm, ...filtered].slice(0, 5);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // 3. Функция запроса к API (с учетом страницы)
  const fetchMovies = useCallback(async (searchStr, pageNum) => {
    if (!searchStr.trim()) return;
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(searchStr)}&page=${pageNum}&apikey=${API_KEY}`
      );
      if (!res.ok) throw new Error("Ошибка сети");
      const data = await res.json();

      if (data.Response === "False") {
        setMovies([]);
        setTotalResults(0);
        setStatus("error");
        setError(data.Error || "Ничего не найдено");
        return;
      }

      setMovies(data.Search || []);
      setTotalResults(Number(data.totalResults) || 0);
      setStatus("success");
    } catch (err) {
      setMovies([]);
      setStatus("error");
      setError(err.message);
    }
  }, []);

  // 4. Эффект, который срабатывает при смене поискового запроса или страницы
  useEffect(() => {
    if (searchQuery) {
      fetchMovies(searchQuery, page);
    }
  }, [searchQuery, page, fetchMovies]);

  // 5. Дебаунс для ввода
  useEffect(() => {
    if (query.trim().length < 3) {
      if (query === "") {
        setStatus("idle");
        setMovies([]);
      }
      return;
    }

    const timer = setTimeout(() => {
      if (query !== searchQuery) {
        setPage(1); // При новом поиске всегда сбрасываем на 1 страницу
        setSearchQuery(query);
        addToHistory(query);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [query, searchQuery]);

  // Обработчик кнопки "Найти" / Enter
  const handleSearch = () => {
    if (!query.trim()) return;
    setPage(1);
    setSearchQuery(query);
    addToHistory(query);
  };

  // Клик по истории
  const handleHistoryClick = (term) => {
    setQuery(term);
    setPage(1);
    setSearchQuery(term);
    addToHistory(term); // Поднимаем наверх истории
  };

  // 6. Клиентская фильтрация по году
  const filteredMovies = movies.filter((movie) => {
    // В OMDb год может быть строкой "2010" или "2010-2015", берем первое число
    const yearNum = parseInt(movie.Year, 10);
    if (isNaN(yearNum)) return true;

    const min = minYear ? parseInt(minYear, 10) : 0;
    const max = maxYear ? parseInt(maxYear, 10) : Infinity;

    return yearNum >= min && yearNum <= max;
  });

  // Подсчет страниц для пагинации (OMDb выдает по 10 фильмов)
  const totalPages = Math.ceil(totalResults / 10);

  return (
    <div className="app-container">
      <h1>Поиск фильмов</h1>

      {/* --- Поиск --- */}
      <div className="search-box">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Введите название фильма..."
        />
        <button onClick={handleSearch} disabled={status === "loading" || !query.trim()}>
          Найти
        </button>
      </div>

      {/* --- История поиска --- */}
      {history.length > 0 && (
        <div className="history-container">
          <span>История:</span>
          {history.map((item, idx) => (
            <button key={idx} className="history-tag" onClick={() => handleHistoryClick(item)}>
              {item}
            </button>
          ))}
        </div>
      )}

      {/* --- Фильтры по годам (показываем только если есть результаты) --- */}
      {status === "success" && (
        <div className="year-filters">
          <span>Фильтр по году:</span>
          <input
            type="number"
            placeholder="От"
            value={minYear}
            onChange={(e) => setMinYear(e.target.value)}
          />
          <input
            type="number"
            placeholder="До"
            value={maxYear}
            onChange={(e) => setMaxYear(e.target.value)}
          />
        </div>
      )}

      {/* --- Область результатов --- */}
      <div className="results-area">
        {status === "idle" && <p className="message">Введите название фильма (от 3 букв)...</p>}
        {status === "loading" && <p className="message loading">Загрузка...</p>}
        {status === "error" && <div className="error"><p>Ошибка: {error}</p></div>}

        {status === "success" && filteredMovies.length === 0 && (
          <p className="message">Нет фильмов, подходящих под выбранные годы.</p>
        )}

        {status === "success" && filteredMovies.length > 0 && (
          <>
            <div className="movie-list">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.imdbID} movie={movie} apiKey={API_KEY} />
              ))}
            </div>

            {/* --- Пагинация --- */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Назад
                </button>
                <span>
                  Страница {page} из {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Вперед →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;