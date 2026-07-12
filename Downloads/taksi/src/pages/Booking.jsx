import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { Car, MessageSquare, Send, Search, MapPin, Navigation, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import './Booking.css';

const YANDEX_API_KEY = 'c49cb70b-ca85-4912-8254-221340bf47eb';

const tariffs = [
  { id: 'Ekonom',   icon: '🚗', name: 'Ekonom',   price: 500,  time: '3–7 min' },
  { id: 'Comfort',  icon: '🚙', name: 'Comfort',   price: 900,  time: '4–8 min' },
  { id: 'Business', icon: '🚘', name: 'Business',  price: 1800, time: '6–12 min' },
  { id: 'Minivan',  icon: '🚐', name: 'Minivan',   price: 1400, time: '8–15 min' },
];

const TASHKENT = [41.2995, 69.2401];

// ─── Debounce helper ──────────────────────────────────────────
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Search input with suggestions ────────────────────────────
function PlaceSearch({ placeholder, icon: Icon, color, value, onChange, onSelect, disabled }) {
  const [query, setQuery]       = useState(value || '');
  const [suggestions, setSuggs] = useState([]);
  const [focused, setFocused]   = useState(false);
  const debouncedQ = useDebounce(query, 350);
  const wrapRef = useRef(null);

  // Sync external value
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) { setSuggs([]); return; }
    
    // Using OpenStreetMap Nominatim for suggestions to bypass Yandex API key restrictions
    fetch(`https://nominatim.openstreetmap.org/search?q=Tashkent, ${encodeURIComponent(debouncedQ)}&format=json&limit=5&addressdetails=1`, {
      headers: { 'Accept-Language': 'uz' }
    })
      .then(res => res.json())
      .then(data => {
        const items = data.map(obj => ({
          displayName: obj.name ? `${obj.name} (${obj.display_name.split(',')[1]?.trim() || ''})` : obj.display_name.split(',').slice(0,2).join(', '),
          value: obj.display_name,
          coords: [parseFloat(obj.lat), parseFloat(obj.lon)]
        }));
        setSuggs(items);
      })
      .catch(() => setSuggs([]));
  }, [debouncedQ]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSelect(item) {
    const display = item.displayName || item.value;
    setQuery(display);
    setSuggs([]);
    setFocused(false);
    onChange(display);
    if (item.coords) {
      onSelect(item.coords, item.value);
    }
  }

  function handleChange(e) {
    setQuery(e.target.value);
    onChange(e.target.value);
    if (!e.target.value) onSelect(null, '');
  }

  return (
    <div ref={wrapRef} className={`place-search ${disabled ? 'disabled' : ''}`}>
      <div className={`place-search__input-wrap ${focused ? 'focused' : ''}`} style={{ '--dot-color': color }}>
        <div className="place-search__icon">
          <Icon size={16} color={color} />
        </div>
        <input
          type="text"
          className="place-search__input"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          disabled={disabled}
          autoComplete="off"
        />
        {query && (
          <button className="place-search__clear" type="button" onClick={() => { setQuery(''); onChange(''); onSelect(null, ''); setSuggs([]); }}>
            <X size={14} />
          </button>
        )}
      </div>
      {focused && suggestions.length > 0 && (
        <ul className="place-search__suggestions">
          {suggestions.map((s, i) => (
            <li key={i} onMouseDown={() => handleSelect(s)}>
              <MapPin size={13} color="#555" />
              <span>{s.displayName || s.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main Booking page ─────────────────────────────────────────
export default function Booking() {
  const [user, setUser] = useState(null);
  const [fromAddr, setFromAddr] = useState('');
  const [toAddr,   setToAddr]   = useState('');
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords,   setToCoords]   = useState(null);
  const [clickMode, setClickMode]   = useState('from');
  const [tariff, setTariff]    = useState('Ekonom');
  const [pay,    setPay]       = useState('naqd');
  const [entrance, setEntrance]= useState('');
  const [flat, setFlat]        = useState('');
  const [comment, setComment]  = useState('');
  const [step,   setStep]      = useState(1);
  const [driver, setDriver]   = useState(null);
  const [tripId, setTripId]   = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [newMsg,    setNewMsg]    = useState('');
  const [showChat,  setShowChat]  = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [error, setError]     = useState('');
  const [mapReady, setMapReady] = useState(false);

  const mapRef        = useRef(null);
  const ymapRef       = useRef(null);
  const fromMarkRef   = useRef(null);
  const toMarkRef     = useRef(null);
  const driverMarkRef = useRef(null);
  const clickModeRef  = useRef('from');
  const fromCoordsRef = useRef(null);

  const selected = tariffs.find(t => t.id === tariff);
  const [routeDist, setRouteDist]       = useState(null); // km, real road distance
  const [routeDurMin, setRouteDurMin]   = useState(null); // minutes, real travel time
  const total = routeDist ? Math.round(routeDist * selected.price) : null;

  // Auth
  useEffect(() => {
    const u = localStorage.getItem('taxiuz_user');
    if (u) setUser(JSON.parse(u));
    const handler = () => { const u2 = localStorage.getItem('taxiuz_user'); setUser(u2 ? JSON.parse(u2) : null); };
    window.addEventListener('auth-change', handler);
    return () => window.removeEventListener('auth-change', handler);
  }, []);

  useEffect(() => { clickModeRef.current = clickMode; }, [clickMode]);
  useEffect(() => { fromCoordsRef.current = fromCoords; }, [fromCoords]);

  // Load Yandex Maps
  useEffect(() => {
    const load = () => window.ymaps.ready(() => { initMap(); setMapReady(true); });
    if (window.ymaps) { load(); return; }
    const s = document.createElement('script');
    s.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=uz_UZ`;
    s.async = true;
    s.onload = load;
    document.head.appendChild(s);
  }, []);

  function initMap() {
    if (!mapRef.current || ymapRef.current) return;
    ymapRef.current = new window.ymaps.Map(mapRef.current, {
      center: TASHKENT, zoom: 13,
      controls: ['zoomControl', 'geolocationControl', 'trafficControl'],
    }, { suppressMapOpenBlock: true });

    // Enable traffic immediately
    try {
      const trafficControl = ymapRef.current.controls.get('trafficControl');
      if (trafficControl) trafficControl.showTraffic();
    } catch(e) {}

    // Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        ymapRef.current.setCenter(coords, 14);
        placeFromMarker(coords);
        window.ymaps.geocode(coords).then(res => {
          const addr = res.geoObjects.get(0)?.getAddressLine();
          if (addr) { setFromAddr(addr); }
        });
      });
    }

    // Click on map
    ymapRef.current.events.add('click', e => {
      const coords = e.get('coords');
      if (clickModeRef.current === 'from') {
        placeFromMarker(coords);
        window.ymaps.geocode(coords).then(res => {
          const a = res.geoObjects.get(0)?.getAddressLine() || coords.map(c=>c.toFixed(4)).join(', ');
          setFromAddr(a);
        });
        clickModeRef.current = 'to';
        setClickMode('to');
      } else {
        placeToMarker(coords);
        window.ymaps.geocode(coords).then(res => {
          const a = res.geoObjects.get(0)?.getAddressLine() || coords.map(c=>c.toFixed(4)).join(', ');
          setToAddr(a);
        });
        drawRoute(fromCoordsRef.current, coords);
      }
    });
  }

  function placeFromMarker(coords) {
    if (fromMarkRef.current) ymapRef.current?.geoObjects.remove(fromMarkRef.current);
    fromMarkRef.current = new window.ymaps.Placemark(coords,
      { balloonContent: 'Boshlanish' },
      { preset: 'islands#greenDotIconWithCaption', iconCaption: 'Qayerdan' }
    );
    ymapRef.current?.geoObjects.add(fromMarkRef.current);
    setFromCoords(coords); fromCoordsRef.current = coords;
  }

  function placeToMarker(coords) {
    if (toMarkRef.current) ymapRef.current?.geoObjects.remove(toMarkRef.current);
    toMarkRef.current = new window.ymaps.Placemark(coords,
      { balloonContent: 'Manzil' },
      { preset: 'islands#redDotIconWithCaption', iconCaption: 'Qayerga' }
    );
    ymapRef.current?.geoObjects.add(toMarkRef.current);
    setToCoords(coords);
  }

  function haversineFallback(from, to) {
    const R=6371, dLat=(to[0]-from[0])*Math.PI/180, dLng=(to[1]-from[1])*Math.PI/180;
    const a=Math.sin(dLat/2)**2+Math.cos(from[0]*Math.PI/180)*Math.cos(to[0]*Math.PI/180)*Math.sin(dLng/2)**2;
    const d = +(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
    setRouteDist(d);
    setRouteDurMin(Math.round(d * 3)); // ~20 km/h city average
  }

  function drawRoute(from, to) {
    if (!from || !to || !ymapRef.current) return;
    if (ymapRef.current._routeRef) ymapRef.current.geoObjects.remove(ymapRef.current._routeRef);
    setRouteDist(null); setRouteDurMin(null);

    const multiRoute = new window.ymaps.multiRouter.MultiRoute({
      referencePoints: [from, to],
      params: { routingMode: 'auto' }
    }, {
      boundsAutoApply: true,
      wayPointVisible: false,
      routeActiveStrokeWidth: 5,
      routeActiveStrokeColor: '#FFD600',
      routeStrokeStyle: 'solid'
    });

    ymapRef.current.geoObjects.add(multiRoute);
    ymapRef.current._routeRef = multiRoute;

    multiRoute.model.events.add('requestsuccess', () => {
      const activeRoute = multiRoute.getActiveRoute();
      if (activeRoute) {
        const dist = activeRoute.properties.get("distance").value; // meters
        const dur = activeRoute.properties.get("duration").value; // seconds
        setRouteDist(+(dist / 1000).toFixed(1));
        setRouteDurMin(Math.round(dur / 60));
      } else {
        haversineFallback(from, to);
      }
    });

    multiRoute.model.events.add('requestfail', () => {
      haversineFallback(from, to);
    });
  }


  // Called when user picks a suggestion from search
  function handleFromSelect(coords, addr) {
    if (!coords) {
      if (fromMarkRef.current) ymapRef.current?.geoObjects.remove(fromMarkRef.current);
      fromMarkRef.current = null; setFromCoords(null); fromCoordsRef.current = null;
      setClickMode('from'); clickModeRef.current = 'from'; return;
    }
    // Use Yandex Geocoder for pinpoint accuracy instead of OSM coords
    if (addr && window.ymaps) {
      window.ymaps.geocode(addr).then(res => {
        const yCoords = res.geoObjects.get(0)?.geometry.getCoordinates() || coords;
        placeFromMarker(yCoords);
        setFromAddr(addr);
        ymapRef.current?.setCenter(yCoords, 16);
        clickModeRef.current = 'to'; setClickMode('to');
        if (toCoords) drawRoute(yCoords, toCoords);
      });
    } else {
      placeFromMarker(coords);
      if (addr) setFromAddr(addr);
      ymapRef.current?.setCenter(coords, 16);
      clickModeRef.current = 'to'; setClickMode('to');
      if (toCoords) drawRoute(coords, toCoords);
    }
  }

  function handleToSelect(coords, addr) {
    if (!coords) {
      if (toMarkRef.current) ymapRef.current?.geoObjects.remove(toMarkRef.current);
      if (ymapRef.current?._routeRef) ymapRef.current.geoObjects.remove(ymapRef.current._routeRef);
      toMarkRef.current = null; setToCoords(null);
      setClickMode('to'); clickModeRef.current = 'to'; return;
    }
    // Use Yandex Geocoder for pinpoint accuracy
    if (addr && window.ymaps) {
      window.ymaps.geocode(addr).then(res => {
        const yCoords = res.geoObjects.get(0)?.geometry.getCoordinates() || coords;
        placeToMarker(yCoords);
        setToAddr(addr);
        if (fromCoordsRef.current) drawRoute(fromCoordsRef.current, yCoords);
      });
    } else {
      placeToMarker(coords);
      if (addr) setToAddr(addr);
      if (fromCoordsRef.current) drawRoute(fromCoordsRef.current, coords);
    }
  }

  function resetAll() {
    ['fromMarkRef','toMarkRef'].forEach(k => {
      if (eval(k).current) ymapRef.current?.geoObjects.remove(eval(k).current);
      eval(k).current = null;
    });
    if (ymapRef.current?._routeRef) ymapRef.current.geoObjects.remove(ymapRef.current._routeRef);
    setFromCoords(null); setToCoords(null); setFromAddr(''); setToAddr('');
    setClickMode('from'); clickModeRef.current = 'from';
  }

  async function handleOrder(e) {
    e.preventDefault();
    if (!fromCoords || !toCoords) { setError('Xaritadan yoki qidiruvdan boshlanish va manzil tanlang'); return; }
    if (pay === 'karta') {
      if (!showCardForm) { setShowCardForm(true); return; }
      if (cardNum.replace(/\s/g, '').length !== 16) { setError("Karta raqamini to'liq kiriting (16 xona)"); return; }
      if (cardExp.length !== 5) { setError("Karta amal qilish muddatini to'liq kiriting (MM/YY)"); return; }
      if (cardCvv.length < 3) { setError("CVV kodini to'liq kiriting"); return; }
    }
    setError(''); setStep(2);

    // ⏳ 3-second realistic search animation
    await new Promise(r => setTimeout(r, 3000));

    const { data: drivers } = await supabase.from('drivers').select('*').eq('status', 'Online').limit(5);

    // ❌ No drivers — show "not found" screen (step 4)
    if (!drivers || drivers.length === 0) {
      setStep(4);
      return;
    }

    const rd = drivers[Math.floor(Math.random() * drivers.length)];

    const fullComment = [
      entrance ? `Yo'lak: ${entrance}` : '',
      flat ? `Xonadon: ${flat}` : '',
      comment
    ].filter(Boolean).join(' | ');

    const { data: trip } = await supabase.from('trips').insert([{
      user_name: user?.name || 'Anonim', user_phone: user?.phone || null,
      from_location: fromAddr, to_location: toAddr,
      tariff, pay_method: pay, distance_km: routeDist, price: total,
      comment: fullComment || null, status: 'Jarayonda', driver_name: rd?.name,
    }]).select().single();

    setTripId(trip?.id); setDriver(rd);
    setMessages([{ sender: 'driver', text: "Assalomu alaykum! Men yo'lga chiqdim 🚗" }]);
    startDriverAnim(fromCoords);
    setStep(3);
  }

  function startDriverAnim(target) {
    if (!ymapRef.current || !window.ymaps) return;
    const c = ymapRef.current.getCenter();
    let cur = [c[0]+0.018, c[1]+0.018];
    if (driverMarkRef.current) ymapRef.current.geoObjects.remove(driverMarkRef.current);
    driverMarkRef.current = new window.ymaps.Placemark(cur, { balloonContent: 'Haydovchi' }, { preset: 'islands#yellowAutoIcon' });
    ymapRef.current.geoObjects.add(driverMarkRef.current);
    const iv = setInterval(() => {
      cur = [cur[0]-(cur[0]-target[0])*0.1, cur[1]-(cur[1]-target[1])*0.1];
      driverMarkRef.current?.geometry.setCoordinates(cur);
    }, 800);
    setTimeout(() => clearInterval(iv), 30000);
  }

  async function handleCancel() {
    if (tripId) await supabase.from('trips').update({ status: 'Bekor qilindi' }).eq('id', tripId);
    setStep(1); setTripId(null); setDriver(null); setShowChat(false); setShowCardForm(false);
    if (driverMarkRef.current) ymapRef.current?.geoObjects.remove(driverMarkRef.current);
    resetAll();
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setMessages(p => [...p, { sender: 'user', text: newMsg }]);
    setNewMsg('');
    const replies = ['Yaxshi, men ketayapman!', 'Tushunarlii 👍', 'Hozir yetib boraman.'];
    setTimeout(() => setMessages(p => [...p, { sender: 'driver', text: replies[Math.floor(Math.random()*replies.length)] }]), 1500);
  }

  return (
    <div className="booking-page">
      <Navbar />
      <div className="booking__layout">

        {/* ===== SIDEBAR ===== */}
        <aside className="booking__sidebar">
          {step === 1 && (
            <form className="booking__form" onSubmit={handleOrder}>
              <h2>Taksi chaqirish</h2>

              {/* Map click instructions */}
              <div className="map-hint">
                <div className={`map-hint__step ${clickMode === 'from' ? 'active' : 'done'}`}>
                  <div className="hint-dot green" />
                  <div>
                    <strong>1. Boshlanish nuqtasi</strong>
                    {fromAddr
                      ? <p className="hint-addr">{fromAddr}</p>
                      : <p className="hint-sub">Xaritada bosing 👆</p>}
                  </div>
                  {fromAddr && (
                    <button type="button" className="hint-clear" onClick={() => {
                      if (fromMarkRef.current) ymapRef.current?.geoObjects.remove(fromMarkRef.current);
                      fromMarkRef.current = null; setFromAddr(''); setFromCoords(null);
                      setRouteDist(null); setRouteDurMin(null);
                      setClickMode('from'); clickModeRef.current = 'from';
                    }}>×</button>
                  )}
                </div>
                <div className="map-hint__arrow">↓</div>
                <div className={`map-hint__step ${!fromAddr ? 'disabled' : clickMode === 'to' ? 'active' : toAddr ? 'done' : ''}`}>
                  <div className="hint-dot red" />
                  <div>
                    <strong>2. Manzil (Qayerga)</strong>
                    {toAddr
                      ? <p className="hint-addr">{toAddr}</p>
                      : <p className="hint-sub">{fromAddr ? 'Xaritada bosing 👆' : 'Avval boshlanish nuqtasini tanlang'}</p>}
                  </div>
                  {toAddr && (
                    <button type="button" className="hint-clear" onClick={() => {
                      if (toMarkRef.current) ymapRef.current?.geoObjects.remove(toMarkRef.current);
                      if (ymapRef.current?._routeRef) ymapRef.current.geoObjects.remove(ymapRef.current._routeRef);
                      toMarkRef.current = null; setToAddr(''); setToCoords(null);
                      setRouteDist(null); setRouteDurMin(null);
                      setClickMode('to'); clickModeRef.current = 'to';
                    }}>×</button>
                  )}
                </div>
              </div>

              {/* Tariff — price per km, no fake ETA */}
              <div className="booking__section-label">Tarif</div>
              <div className="booking__tariffs">
                {tariffs.map(t => (
                  <button type="button" key={t.id}
                    className={`booking__tariff-btn ${tariff === t.id ? 'active' : ''}`}
                    onClick={() => setTariff(t.id)}>
                    <span>{t.icon}</span>
                    <span className="t-name">{t.name}</span>
                    <span className="t-price">{t.price} so'm/km</span>
                  </button>
                ))}
              </div>

              {/* Payment */}
              <div className="booking__section-label">To'lov usuli</div>
              <div className="booking__pay-methods">
                <button type="button" className={`booking__pay-btn ${pay==='naqd'?'active':''}`}
                  onClick={() => { setPay('naqd'); setShowCardForm(false); }}>💵 Naqd pul</button>
                <button type="button" className={`booking__pay-btn ${pay==='karta'?'active':''}`}
                  onClick={() => setPay('karta')}>💳 Karta</button>
              </div>

              {pay === 'karta' && showCardForm && (
                <div className="card-form">
                  <p className="card-form__title">💳 Karta ma'lumotlari</p>
                  <input className="card-input" type="text" placeholder="0000 0000 0000 0000" maxLength={19}
                    value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim())} />
                  <div className="card-form__row">
                    <input className="card-input" type="text" placeholder="MM/YY" maxLength={5}
                      value={cardExp} onChange={e => { let v=e.target.value.replace(/\D/g,''); if(v.length>=3)v=v.slice(0,2)+'/'+v.slice(2); setCardExp(v); }} />
                    <input className="card-input" type="text" placeholder="CVV" maxLength={3}
                      value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,''))} />
                  </div>
                </div>
              )}

              <div className="booking__details-row">
                <input type="text" className="booking__small-input" placeholder="Yo'lak (Podyezd)"
                  value={entrance} onChange={e => setEntrance(e.target.value)} />
                <input type="text" className="booking__small-input" placeholder="Xonadon"
                  value={flat} onChange={e => setFlat(e.target.value)} />
              </div>

              <textarea className="booking__comment" rows={2}
                placeholder="💬 Haydovchiga izoh (ixtiyoriy)..."
                value={comment} onChange={e => setComment(e.target.value)} />

              {/* ✅ Real route estimate */}
              {routeDist && routeDurMin ? (
                <div className="booking__estimate">
                  <div className="estimate-details">
                    <span>🛣 {routeDist} km</span>
                    <span>⏱ ~{routeDurMin} daqiqa</span>
                  </div>
                  <strong className="estimate-price">{total?.toLocaleString()} so'm</strong>
                </div>
              ) : fromCoords && toCoords ? (
                <div className="booking__estimate loading">
                  <span>Marshrut hisoblanmoqda...</span>
                </div>
              ) : null}

              {error && <p className="booking__error">⚠️ {error}</p>}

              {!user && (
                <div className="booking__auth-prompt">
                  <p>Tezroq buyurtma uchun <Link to="/login">kirish</Link> yoki <Link to="/register">ro'yxatdan o'tish</Link></p>
                </div>
              )}

              <button type="submit" className="btn-primary booking__submit"
                disabled={!fromCoords || !toCoords || !routeDist}>
                <Car size={20}/>
                {pay==='karta' && !showCardForm ? "Karta bilan to'lash →" : 'Taksi chaqirish'}
              </button>
            </form>
          )}

          {/* Step 2 — Searching */}
          {step === 2 && (
            <div className="booking__searching">
              <div className="searching__spinner"/>
              <h3>Haydovchi qidirilmoqda...</h3>
              <p>Sizga yaqin haydovchilar izlanmoqda</p>
              <div className="searching__dots">
                <span/><span/><span/>
              </div>
              <button className="btn-secondary" style={{marginTop:'20px'}} onClick={handleCancel}>Bekor qilish</button>
            </div>
          )}

          {/* Step 3 — Driver found */}
          {step === 3 && driver && (
            <div className="booking__found">
              <div className="found__badge">✅ Haydovchi topildi!</div>
              {tripId && <p className="found__trip-id">Buyurtma #{tripId}</p>}
              <div className="found__driver">
                <div className="found__avatar">👨‍💼</div>
                <div>
                  <h3>{driver.name}</h3>
                  <p className="found__rating">⭐ {driver.rating} · {(driver.trips_count||1000).toLocaleString()} sayohat</p>
                  <p className="found__car">🚗 {driver.car}</p>
                </div>
              </div>
              <div className="found__eta">
                <span>⏱ Sayohat vaqti</span>
                <strong>{routeDurMin ? `~${routeDurMin} daqiqa` : '—'}</strong>
              </div>
              <div className="found__price">
                <span>Masofa · Narx</span>
                <strong className="price-yellow">{routeDist} km · {total?.toLocaleString()||'—'} so'm</strong>
              </div>
              <div className="found__route">
                <div className="route-point">📍 {fromAddr || 'Boshlanish'}</div>
                <div className="route-line">↓</div>
                <div className="route-point">🏁 {toAddr || 'Manzil'}</div>
              </div>
              <div className="found__actions">
                <a href={`tel:${driver.phone.includes('+') ? driver.phone : '+' + driver.phone.replace(/\D/g, '')}`} className="btn-primary" style={{flex:1,textAlign:'center'}}>📞 Qo'ng'iroq</a>
                <button className="btn-secondary" onClick={() => setShowChat(!showChat)} style={{flex:1}}>
                  <MessageSquare size={18}/> Chat
                </button>
              </div>
              <button className="btn-secondary cancel-btn" onClick={handleCancel} style={{width:'100%',marginTop:'8px'}}>
                Bekor qilish
              </button>
              {showChat && (
                <div className="chat-box">
                  <div className="chat-messages">
                    {messages.map((m,i) => (
                      <div key={i} className={`chat-message ${m.sender==='user'?'user-msg':'driver-msg'}`}>{m.text}</div>
                    ))}
                  </div>
                  <form className="chat-input" onSubmit={sendMessage}>
                    <input type="text" placeholder="Xabar yozing..." value={newMsg} onChange={e => setNewMsg(e.target.value)}/>
                    <button type="submit"><Send size={18}/></button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Step 4 — No drivers available */}
          {step === 4 && (
            <div className="booking__no-driver">
              <div className="no-driver__icon">🚕</div>
              <h3>Haydovchi topilmadi</h3>
              <p>Hozircha sizning hududingizda bo'sh haydovchilar mavjud emas.</p>
              <p className="no-driver__sub">Biroz kutib qayta urinib ko'ring yoki boshqa tarifni tanlang.</p>
              <button className="btn-primary" style={{width:'100%',marginTop:'20px'}} onClick={() => setStep(1)}>
                🔄 Qaytadan urinish
              </button>
            </div>
          )}

        </aside>

        {/* ===== MAP ===== */}
        <div className="booking__map">
          {step === 1 && (
            <div className="map-floating-search">
              <PlaceSearch
                placeholder={clickMode === 'from' ? "Qayerdan ketasiz? Qidiring..." : "Qayerga borasiz? Qidiring..."}
                icon={Search}
                color={clickMode === 'from' ? '#4CAF50' : '#e94560'}
                value={clickMode === 'from' ? fromAddr : toAddr}
                onChange={clickMode === 'from' ? setFromAddr : setToAddr}
                onSelect={clickMode === 'from' ? handleFromSelect : handleToSelect}
                disabled={false}
              />
            </div>
          )}
          <div className="map-click-overlay">
            <span>
              {!fromCoords ? '🟢 Xaritada boshlanish nuqtasini bosing'
                : !toCoords ? '🔴 Xaritada manzilni bosing'
                : '✅ Marshrut tayyor!'}
            </span>
          </div>
          <div ref={mapRef} className="yandex-map" id="yandex-map"/>
        </div>
      </div>
    </div>
  );
}

