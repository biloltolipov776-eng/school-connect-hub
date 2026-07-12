import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, User, Home, Users, Settings } from 'lucide-react';
import './Navbar.css';

const ADMIN_IP = '188.113.237.77';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const u = localStorage.getItem('taxiuz_user');
      setUser(u ? JSON.parse(u) : null);
    };
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIsAdmin(data.ip === ADMIN_IP))
      .catch(() => setIsAdmin(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem('taxiuz_user');
    window.dispatchEvent(new Event('auth-change'));
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">
          <Link to="/" className="navbar__logo">
            <Car size={28} color="#FFD600" />
            <span>TaxiUz</span>
          </Link>

          <div className="navbar__links desktop-only">
            <Link to="/" className={pathname === '/' ? 'active' : ''}>Bosh sahifa</Link>
            <Link to="/booking" className={pathname === '/booking' ? 'active' : ''}>Taksi chaqirish</Link>
            <Link to="/driver" className={pathname === '/driver' ? 'active' : ''}>Haydovchilar</Link>
            {isAdmin && <Link to="/admin" className={pathname === '/admin' ? 'active' : ''}>Admin</Link>}
          </div>

          <div className="navbar__actions desktop-only">
            {user ? (
              <button className="btn-secondary" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Chiqish
              </button>
            ) : (
              <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <User size={16} /> Kirish
              </Link>
            )}
            <Link to="/booking" className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
              Taksi chaqirish
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <Link to="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
          <Home size={22} />
          <span>Asosiy</span>
        </Link>
        <Link to="/booking" className={`bottom-nav-item ${pathname === '/booking' ? 'active' : ''}`}>
          <Car size={22} />
          <span>Taksi</span>
        </Link>
        <Link to="/driver" className={`bottom-nav-item ${pathname === '/driver' ? 'active' : ''}`}>
          <Users size={22} />
          <span>Haydovchi</span>
        </Link>
        {isAdmin && (
          <Link to="/admin" className={`bottom-nav-item ${pathname === '/admin' ? 'active' : ''}`}>
            <Settings size={22} />
            <span>Admin</span>
          </Link>
        )}
        {!user ? (
          <Link to="/login" className={`bottom-nav-item ${pathname === '/login' || pathname === '/register' ? 'active' : ''}`}>
            <User size={22} />
            <span>Kirish</span>
          </Link>
        ) : (
          <button className="bottom-nav-item" onClick={handleLogout}>
            <User size={22} color="#FFD600" />
            <span>Chiqish</span>
          </button>
        )}
      </div>
    </>
  );
}
