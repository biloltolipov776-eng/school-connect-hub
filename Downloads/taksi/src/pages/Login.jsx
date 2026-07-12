import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Car, Phone, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Auth.css';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedPhone = phone.trim();

    // Find user by phone
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', trimmedPhone)
      .maybeSingle();

    if (fetchError || !user) {
      setError('Bu telefon raqam ro\'yxatdan o\'tmagan');
      setLoading(false);
      return;
    }

    // Check password
    if (user.password !== password) {
      setError('Parol noto\'g\'ri');
      setLoading(false);
      return;
    }

    // Save session (without password)
    const sessionUser = { id: user.id, name: user.name, phone: user.phone, city: user.city };
    localStorage.setItem('taxiuz_user', JSON.stringify(sessionUser));
    window.dispatchEvent(new Event('auth-change'));
    navigate('/booking');
  }

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-container">
        <form className="auth-form glass" onSubmit={handleLogin}>
          <div className="auth-logo">
            <Car size={32} color="#FFD600" />
            <h2>Tizimga kirish</h2>
          </div>

          <div className="auth-input-group">
            <label>Telefon raqam</label>
            <div className="auth-input-wrapper">
              <Phone size={18} color="#888" />
              <input
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Parol</label>
            <div className="auth-input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Parolingizni kiriting"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="show-pass-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} color="#888" /> : <Eye size={18} color="#888" />}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">⚠️ {error}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>

          <p className="auth-footer">
            Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'tish</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
