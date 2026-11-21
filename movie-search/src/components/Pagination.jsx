export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null; // Если страниц 1 или меньше, ничего не показываем

  return (
    <div className="pagination">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Назад
      </button>
      <span>
        Страница {currentPage} из {totalPages}
      </span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Вперёд →
      </button>
    </div>
  );
}