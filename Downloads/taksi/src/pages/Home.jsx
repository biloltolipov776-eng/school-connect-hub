import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Car, Zap, Shield, Star, MapPin, Clock, CreditCard, Users, ChevronRight } from 'lucide-react';
import './Home.css';

const tariffs = [
  { icon: '🚗', name: 'Ekonom', price: '5,000', desc: 'Arzon va qulay yurish', time: '3–7 min', color: '#4CAF50' },
  { icon: '🚙', name: 'Comfort', price: '9,000', desc: 'Katta salon, yuqori daraja', time: '4–8 min', color: '#2196F3' },
  { icon: '🚘', name: 'Business', price: '18,000', desc: 'Premium avtomobil', time: '6–12 min', color: '#9C27B0' },
  { icon: '🚐', name: 'Minivan', price: '14,000', desc: '6 kishigacha sig\'adi', time: '8–15 min', color: '#FF9800' },
];

const features = [
  { icon: <Zap size={28} />, title: 'Tez javob', desc: 'O\'rtacha 3 daqiqada haydovchi topiladi' },
  { icon: <Shield size={28} />, title: 'Xavfsiz yurish', desc: 'Barcha haydovchilar tekshirilgan' },
  { icon: <CreditCard size={28} />, title: 'Qulay to\'lov', desc: 'Naqd, karta yoki UzCard bilan to\'lang' },
  { icon: <Star size={28} />, title: 'Reyting tizimi', desc: 'Har bir sayohat baholanadi' },
  { icon: <Clock size={28} />, title: '24/7 xizmat', desc: 'Kecha-kunduz ishlaydi' },
  { icon: <Users size={28} />, title: '50 000+ haydovchi', desc: 'Butun O\'zbekiston bo\'ylab' },
];

const cities = [
  { name: 'Toshkent', drivers: '18,000+', img: '🌆' },
  { name: 'Samarqand', drivers: '5,000+', img: '🕌' },
  { name: 'Buxoro', drivers: '3,200+', img: '🏛️' },
  { name: 'Namangan', drivers: '4,100+', img: '🏙️' },
  { name: 'Andijon', drivers: '3,800+', img: '🌇' },
  { name: 'Farg\'ona', drivers: '2,900+', img: '🌃' },
];

const reviews = [
  { name: 'Aziz T.', city: 'Toshkent', stars: 5, text: 'Juda tez keldi! 4 daqiqada oldimga yetib keldi. Haydovchi ham juda muloyim edi.' },
  { name: 'Malika R.', city: 'Samarqand', stars: 5, text: 'TaxiUz eng qulay va arzon. Har kuni ishlataman, hech qachon xafasiz.' },
  { name: 'Jasur K.', city: 'Namangan', stars: 5, text: 'Ilovasi juda qulay. Narxi aniq ko\'rinadi, yashirin to\'lov yo\'q.' },
];

export default function Home() {
  return (
    <div className="home">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__circle hero__circle--1" />
          <div className="hero__circle hero__circle--2" />
          <div className="hero__circle hero__circle--3" />
        </div>
        <div className="container hero__content">
          <div className="hero__text">
            <div className="hero__badge">🇺🇿 O'zbekiston #1 Taksi</div>
            <h1>Qulay, Tez va <span className="hero__highlight">Xavfsiz</span> Taksi</h1>
            <p>Toshkent, Samarqand, Buxoro va boshqa shaharlarda bir zumda taksi chaqiring. 50 000+ ishonchli haydovchi sizni kutmoqda!</p>
            <div className="hero__btns">
              <Link to="/booking" className="btn-primary" id="hero-book-btn">
                <Car size={20} /> Taksi chaqirish
              </Link>
              <Link to="/driver" className="btn-secondary" id="hero-driver-btn">
                Haydovchi bo'lish <ChevronRight size={18} />
              </Link>
            </div>
            <div className="hero__stats">
              <div className="hero__stat"><strong>50K+</strong><span>Haydovchi</span></div>
              <div className="hero__stat-sep" />
              <div className="hero__stat"><strong>2M+</strong><span>Sayohat</span></div>
              <div className="hero__stat-sep" />
              <div className="hero__stat"><strong>4.9★</strong><span>Reyting</span></div>
            </div>
          </div>
          <div className="hero__app">
            <div className="hero__phone">
              <div className="hero__phone-screen">
                <div className="hero__map-preview">
                  <MapPin size={24} color="#FFD600" className="hero__pin" />
                  <div className="hero__car-dot" />
                  <div className="hero__route-line" />
                </div>
                <div className="hero__order-card">
                  <p className="hero__order-label">Haydovchi yaqinlashmoqda</p>
                  <p className="hero__order-time">⏱ 3 daqiqa</p>
                  <div className="hero__order-driver">
                    <div className="hero__driver-avatar">👨‍💼</div>
                    <div>
                      <p>Bobur Toshmatov</p>
                      <p className="star-row">⭐ 4.9 · Nexia 3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tariffs */}
      <section className="section tariffs">
        <div className="container">
          <div className="section__header">
            <h2>Bizning tariflar</h2>
            <p>Ehtiyojingizga mos tarifni tanlang</p>
          </div>
          <div className="tariffs__grid">
            {tariffs.map((t) => (
              <div className="tariff-card" key={t.name} id={`tariff-${t.name.toLowerCase()}`}>
                <div className="tariff-card__icon" style={{ background: t.color + '22' }}>
                  <span>{t.icon}</span>
                </div>
                <h3>{t.name}</h3>
                <p className="tariff-card__desc">{t.desc}</p>
                <div className="tariff-card__price">
                  <strong>{t.price}</strong>
                  <span>so'm/km dan</span>
                </div>
                <div className="tariff-card__time">🕐 {t.time}</div>
                <Link to="/booking" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Tanlash
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features">
        <div className="container">
          <div className="section__header">
            <h2>Nima uchun TaxiUz?</h2>
            <p>Minglab mijozlar bizni tanlaydi</p>
          </div>
          <div className="features__grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="section cities">
        <div className="container">
          <div className="section__header">
            <h2>Xizmat ko'rsatiladigan shaharlar</h2>
            <p>Butun O'zbekiston bo'ylab ishlaydi</p>
          </div>
          <div className="cities__grid">
            {cities.map((c) => (
              <div className="city-card" key={c.name}>
                <div className="city-card__emoji">{c.img}</div>
                <h3>{c.name}</h3>
                <p>{c.drivers} haydovchi</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section reviews">
        <div className="container">
          <div className="section__header">
            <h2>Mijozlar fikri</h2>
            <p>Ular haqiqatan ham shunday deydi</p>
          </div>
          <div className="reviews__grid">
            {reviews.map((r) => (
              <div className="review-card glass" key={r.name}>
                <div className="review-stars">{'⭐'.repeat(r.stars)}</div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-author">
                  <div className="review-avatar">{r.name[0]}</div>
                  <div>
                    <p>{r.name}</p>
                    <p className="review-city"><MapPin size={12}/> {r.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <div>
            <h2>Haydovchi bo'ling!</h2>
            <p>O'z jadvalingizda ishlang va yaxshi daromad oling</p>
          </div>
          <Link to="/driver" className="btn-primary" id="cta-driver-btn" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
            Hoziroq boshlash
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
