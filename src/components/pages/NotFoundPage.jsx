import { Link } from 'react-router-dom';
import '../../../styles/pages/not-found.css';

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <h1 className="not-found__title">404</h1>
      <p className="not-found__message">This page doesn't exist. Maybe it never did.</p>
      <Link to="/" className="not-found__link">Back to Home</Link>
    </section>
  );
}
