import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Car, Phone, User, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedPhone = phone.trim();
    const trimmedName = name.trim();

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      setLoading(false);
      return;
    }

    // Check if phone already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', trimmedPhone)
      .maybeSingle();

    if (existing) {
      setError('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan!');
      setLoading(false);
      return;
    }

    // Insert new user with plain password (simple demo auth)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        name: trimmedName,
        phone: trimmedPhone,
        password: password,
        city: 'Toshkent',
        status: 'Aktiv'
      }])
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      setError('Xatolik: ' + insertError.message);
      setLoading(false);
      return;
    }

    // Save session
    const sessionUser = { id: newUser.id, name: newUser.name, phone: newUser.phone, city: newUser.city };
    localStorage.setItem('taxiuz_user', JSON.stringify(sessionUser));
    window.dispatchEvent(new Event('auth-change'));
    navigate('/booking');
  }

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-container">
        <form className="auth-form glass" onSubmit={handleRegister}>
          <div className="auth-logo">
            <Car size={32} color="#FFD600" />
            <h2>Ro'yxatdan o'tish</h2>
          </div>

          <div className="auth-input-group">
            <label>Ism</label>
            <div className="auth-input-wrapper">
              <User size={18} color="#888" />
              <input
                type="text"
                placeholder="Ismingizni kiriting"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
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
                placeholder="Kamida 6 ta belgi"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" className="show-pass-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} color="#888" /> : <Eye size={18} color="#888" />}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">⚠️ {error}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Yaratilmoqda...' : "Ro'yxatdan o'tish"}
          </button>

          <p className="auth-footer">
            Hisobingiz bormi? <Link to="/login">Kirish</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
