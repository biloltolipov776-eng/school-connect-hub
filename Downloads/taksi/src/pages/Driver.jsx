import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle, DollarSign, Clock, Smartphone, Car } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Driver.css';

const perks = [
  { icon: <DollarSign size={28}/>, title: 'Yuqori daromad', desc: '5 000 000 so\'mgacha oylik topish mumkin' },
  { icon: <Clock size={28}/>, title: 'Erkin jadval', desc: 'Xohlagan vaqtda ishlang' },
  { icon: <Smartphone size={28}/>, title: 'Oddiy ilova', desc: 'Buyurtmalar bevosita telefoningizga keladi' },
  { icon: <Car size={28}/>, title: 'Mashinasiz ham', desc: 'Ijaraga avtomobil olish imkoniyati bor' },
];

const steps = [
  { num: '01', title: 'Ariza yuboring', desc: 'Quyidagi formani to\'ldiring, hujjatlarni yuklang' },
  { num: '02', title: 'Tekshiruv', desc: 'Biz 1–2 kun ichida hujjatlaringizni tekshiramiz' },
  { num: '03', title: 'O\'qitish', desc: 'Qisqacha onlayn yo\'riqnoma o\'tamiz' },
  { num: '04', title: 'Ishlashni boshlang', desc: 'Ilovani yuklab, birinchi buyurtmani oling!' },
];

export default function Driver() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Toshkent');
  const [hasCar, setHasCar] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !phone) { setFormError('Ism va telefon raqamni kiriting!'); return; }
    setSubmitting(true); setFormError('');
    const { error } = await supabase.from('driver_applications').insert([{ name, phone, city, has_car: hasCar }]);
    setSubmitting(false);
    if (error) { setFormError('Xatolik yuz berdi, qaytadan urinib ko\'ring.'); return; }
    setSubmitted(true);
  }

  return (
    <div className="driver-page">
      <Navbar />

      {/* Hero */}
      <section className="driver-hero">
        <div className="driver-hero__bg" />
        <div className="container driver-hero__content">
          <div className="driver-hero__text">
            <div className="driver-hero__badge">🚗 Haydovchi bo'ling</div>
            <h1>O'z xo'jayiningiz bo'ling</h1>
            <p>TaxiUz bilan ishlang — erkin jadval, yuqori daromad va ishonchli platforma.</p>
            <div className="driver-hero__stats">
              <div><strong>5M+ so'm</strong><span>oylik daromad</span></div>
              <div><strong>50K+</strong><span>aktiv haydovchi</span></div>
              <div><strong>4.8★</strong><span>haydovchi reytingi</span></div>
            </div>
          </div>
          <div className="driver-hero__form-wrap">
            {submitted ? (
              <div className="driver-form driver-form--success">
                <div className="success-icon">✅</div>
                <h3>Ariza qabul qilindi!</h3>
                <p>Rahmat, {name}! 24 soat ichida {phone} raqamiga qo'ng'iroq qilamiz.</p>
              </div>
            ) : (
              <form className="driver-form" id="driver-form" onSubmit={handleSubmit}>
                <h3>Ariza qoldiring</h3>
                <div className="driver-form__group">
                  <label>Ism va Familiya</label>
                  <input type="text" id="driver-name" placeholder="Bobur Toshmatov"
                    value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="driver-form__group">
                  <label>Telefon raqam</label>
                  <input type="tel" id="driver-phone" placeholder="+998 90 123 45 67"
                    value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
                <div className="driver-form__group">
                  <label>Shahar</label>
                  <select id="driver-city" value={city} onChange={e => setCity(e.target.value)}>
                    <option>Toshkent</option>
                    <option>Samarqand</option>
                    <option>Buxoro</option>
                    <option>Namangan</option>
                    <option>Andijon</option>
                    <option>Farg'ona</option>
                    <option>Qarshi</option>
                  </select>
                </div>
                <div className="driver-form__group">
                  <label>Avtomobil bor mi?</label>
                  <div className="driver-form__radio-row">
                    <label className="radio-label">
                      <input type="radio" name="hascar" checked={hasCar} onChange={() => setHasCar(true)} /> Ha, bor
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="hascar" checked={!hasCar} onChange={() => setHasCar(false)} /> Kerak
                    </label>
                  </div>
                </div>
                {formError && <p style={{ color: '#e94560', fontSize: '0.85rem', marginBottom: 8 }}>{formError}</p>}
                <button type="submit" className="btn-primary" id="driver-submit"
                  disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? '⏳ Yuborilmoqda...' : 'Ariza yuborish →'}
                </button>
                <p className="driver-form__note">* Ariza qabul qilgach 24 soat ichida siz bilan bog'lanamiz</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2>Nima uchun TaxiUz haydovchilari tanlaydi?</h2>
          </div>
          <div className="driver-perks">
            {perks.map(p => (
              <div className="perk-card" key={p.title}>
                <div className="perk-card__icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="section" style={{ background: 'var(--bg-card)' }}>
        <div className="container">
          <div className="section__header">
            <h2>Qanday boshlash kerak?</h2>
            <p>4 ta oddiy qadam</p>
          </div>
          <div className="driver-steps">
            {steps.map((s, i) => (
              <div className="driver-step" key={s.num}>
                <div className="driver-step__num">{s.num}</div>
                {i < steps.length - 1 && <div className="driver-step__line" />}
                <div className="driver-step__content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2>Talablar</h2>
            <p>Haydovchi bo'lish uchun nima kerak?</p>
          </div>
          <div className="driver-reqs">
            {[
              "Haydovchilik guvohnomasi (B kategoriya)",
              "18 yoshdan katta bo'lish",
              "Toza jinoyat qaydnomasi",
              "Smartfon (Android 8+ yoki iOS 14+)",
              "Texnik ko'rik hujjati",
              "Avtomobil (yoki ijaraga olish imkoniyati)",
            ].map(r => (
              <div className="driver-req" key={r}>
                <CheckCircle size={20} color="#4CAF50" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
