import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  const posterUrl =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "https://placehold.co/300x450?text=No+Poster";

  return (
    <article className="movie-card">
      {/* Переход без перезагрузки + передача данных в state */}
      <Link to={`/movie/${movie.imdbID}`} state={{ movie }} className="movie-link">
        <img src={posterUrl} alt={movie.Title} className="movie-poster" 
           onError={(e) => {
            e.target.onerror = null; // Защита от бесконечного цикла
            e.target.src = "https://placehold.co/300x450?text=No+Poster";
          }}
        />
      
        <div className="movie-info">
          <h3>{movie.Title}</h3>
          <p><strong>Год:</strong> {movie.Year}</p>
        </div>
      </Link>
    </article>
  );
}