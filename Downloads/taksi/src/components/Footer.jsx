import { Car, Send, Phone, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <Car size={28} color="#FFD600" />
            <span>TaxiUz</span>
          </Link>
          <p>O'zbekistondagi eng ishonchli va qulay taksi xizmati. Toshkentdan Samarqandgacha!</p>
          <div className="footer__socials">
            <a href="#" aria-label="Instagram"><Globe size={20}/></a>
            <a href="#" aria-label="Telegram"><Send size={20}/></a>
            <a href="tel:+998712345678" aria-label="Call"><Phone size={20}/></a>
          </div>
        </div>
        <div className="footer__links">
          <h4>Havolalar</h4>
          <Link to="/">Bosh sahifa</Link>
          <Link to="/booking">Taksi chaqirish</Link>
          <Link to="/driver">Haydovchi bo'lish</Link>
        </div>
        <div className="footer__links">
          <h4>Shaharlar</h4>
          <span>Toshkent</span>
          <span>Samarqand</span>
          <span>Buxoro</span>
          <span>Namangan</span>
          <span>Andijon</span>
        </div>
        <div className="footer__contact">
          <h4>Aloqa</h4>
          <a href="tel:1177">📞 1177 (bepul)</a>
          <a href="mailto:info@taxiuz.uz">✉️ info@taxiuz.uz</a>
          <p>🕐 24/7 ishlaydi</p>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© 2024 TaxiUz. Barcha huquqlar himoyalangan.</p>
        <p>O'zbekiston Respublikasi</p>
      </div>
    </footer>
  );
}
