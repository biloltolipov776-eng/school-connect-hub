import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#06060a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, textAlign: 'center', padding: 24 }}>
      <Car size={64} color="#FFD600" />
      <h1 style={{ fontFamily: 'Montserrat', fontSize: '4rem', fontWeight: 900, color: '#FFD600' }}>404</h1>
      <p style={{ color: '#666', fontSize: '1.1rem' }}>Bu sahifa topilmadi</p>
      <Link to="/" className="btn-primary">🏠 Bosh sahifaga qaytish</Link>
    </div>
  );
}
