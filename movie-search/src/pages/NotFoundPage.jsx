import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <p>Упс! Такой страницы не существует.</p>
      <Link to="/" style={{ color: '#3b82f6' }}>Вернуться на главную</Link>
    </div>
  );
}