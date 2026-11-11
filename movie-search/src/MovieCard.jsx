import { useState, useEffect } from "react";

export default function MovieCard({ movie, apiKey }) {
  const [plot, setPlot] = useState("");
  const [isLoadingPlot, setIsLoadingPlot] = useState(true);

  const posterUrl =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "https://placehold.co/300x450?text=No+Poster";

  useEffect(() => {
    const controller = new AbortController();

    const fetchPlot = async () => {
      setIsLoadingPlot(true);
      try {
        const res = await fetch(
          `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}&plot=short`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Ошибка сети");
        const data = await res.json();
        
        if (data.Response === "True" && data.Plot) {
          setPlot(data.Plot);
        } else {
          setPlot("Описание недоступно.");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setPlot("Не удалось загрузить описание.");
        }
      } finally {
        setIsLoadingPlot(false);
      }
    };

    if (movie.imdbID && apiKey) fetchPlot();

    return () => controller.abort();
  }, [movie.imdbID, apiKey]);

  return (
    <article className="movie-card">
      <img src={posterUrl} alt={movie.Title} className="movie-poster" />
      <div className="movie-info">
        <h3>{movie.Title}</h3>
        <p><strong>Год:</strong> {movie.Year}</p>
        
        <div className="movie-plot-container">
          {isLoadingPlot ? (
            <div className="spinner-wrapper">
              <div className="spinner"></div>
              <span className="spinner-text">Загрузка...</span>
            </div>
          ) : (
            <p className="movie-plot">{plot}</p>
          )}
        </div>
      </div>
    </article>
  );
}