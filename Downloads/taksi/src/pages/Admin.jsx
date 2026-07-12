import { useState, useEffect, useCallback } from 'react';
import {
  Users, Car, TrendingUp, DollarSign, MapPin, Shield,
  LogOut, Settings, Bell, Search, Eye, EyeOff,
  CheckCircle, XCircle, BarChart2, RefreshCw, Trash2, Loader
} from 'lucide-react';
import './Admin.css';
import { supabase } from '../lib/supabase';

const ALLOWED_IP = '188.113.237.77';

const tariffPrices = [
  { icon: '🚗', name: 'Ekonom',  price: 5000  },
  { icon: '🚙', name: 'Comfort', price: 9000  },
  { icon: '🚘', name: 'Business',price: 18000 },
  { icon: '🚐', name: 'Minivan', price: 14000 },
];

function StatusBadge({ status }) {
  const colors = {
    'Tugallandi': '#4CAF50', 'Jarayonda': '#2196F3',
    'Bekor qilindi': '#e94560', 'Kutilmoqda': '#FF9800',
    'Online': '#4CAF50', 'Offline': '#666',
    'Aktiv': '#4CAF50', 'Bloklangan': '#e94560',
  };
  const c = colors[status] || '#888';
  return (
    <span className="status-badge" style={{
      background: c + '20', color: c,
      border: `1px solid ${c}40`,
      padding: '3px 10px', borderRadius: 20,
      fontSize: '0.78rem', fontWeight: 600,
    }}>{status}</span>
  );
}

export default function Admin() {
  const [ip, setIp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [dataLoading, setDataLoading] = useState(false);

  // Real data from Supabase
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);

  // Detect IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => { setIp(d.ip); setLoading(false); })
      .catch(() => { setIp('unknown'); setLoading(false); });
  }, []);

  // Load data when authed
  const loadData = useCallback(async () => {
    if (!authed) return;
    setDataLoading(true);
    const [tripsRes, driversRes, usersRes, appsRes] = await Promise.all([
      supabase.from('trips').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('drivers').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('driver_applications').select('*').order('created_at', { ascending: false }),
    ]);
    if (tripsRes.data) setTrips(tripsRes.data);
    if (driversRes.data) setDrivers(driversRes.data);
    if (usersRes.data) setUsers(usersRes.data);
    if (appsRes.data) setApplications(appsRes.data);
    setDataLoading(false);
  }, [authed]);

  useEffect(() => { loadData(); }, [loadData]);

  // Real-time updates for trips
  useEffect(() => {
    if (!authed) return;
    const channel = supabase
      .channel('trips-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => loadData())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [authed, loadData]);

  async function updateTripStatus(id, status) {
    await supabase.from('trips').update({ status }).eq('id', id);
    loadData();
  }
  async function deleteTrip(id) {
    await supabase.from('trips').delete().eq('id', id);
    loadData();
  }
  async function updateDriverStatus(id, status) {
    await supabase.from('drivers').update({ status }).eq('id', id);
    loadData();
  }
  async function deleteDriver(id) {
    await supabase.from('drivers').delete().eq('id', id);
    loadData();
  }
  async function updateUserStatus(id, status) {
    await supabase.from('users').update({ status }).eq('id', id);
    loadData();
  }
  async function updateAppStatus(id, status) {
    await supabase.from('driver_applications').update({ status }).eq('id', id);
    loadData();
  }

  function handleLogin(e) {
    e.preventDefault();
    if (adminPass === 'admin2024') { setAuthed(true); setPassError(''); }
    else setPassError('Noto\'g\'ri parol!');
  }

  // Stats derived from real data
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTrips = trips.filter(t => t.created_at?.startsWith(todayStr));
  const todayRevenue = todayTrips.reduce((s, t) => s + (t.price || 0), 0);
  const onlineDrivers = drivers.filter(d => d.status === 'Online');
  const activeUsers = users.filter(u => u.status === 'Aktiv');

  const stats = [
    { icon: <Car size={24}/>,      label: 'Bugungi sayohatlar',     value: todayTrips.length, change: trips.length, color: '#FFD600' },
    { icon: <Users size={24}/>,    label: 'Aktiv foydalanuvchilar', value: activeUsers.length, change: users.length, color: '#4CAF50' },
    { icon: <DollarSign size={24}/>,label: 'Bugungi daromad',       value: (todayRevenue / 1000).toFixed(0) + 'K so\'m', change: null, color: '#2196F3' },
    { icon: <TrendingUp size={24}/>,label: 'Online haydovchilar',   value: onlineDrivers.length, change: drivers.length, color: '#9C27B0' },
  ];

  // Filter functions
  const filteredTrips = trips.filter(t =>
    (t.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
    String(t.id).includes(search)
  );
  const filteredDrivers = drivers.filter(d =>
    (d.name || '').toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || '').includes(search)
  );

  // Loading / gate screens
  if (loading) {
    return (
      <div className="admin-gate">
        <div className="admin-gate__spinner" />
        <p>IP tekshirilmoqda...</p>
      </div>
    );
  }
  if (ip !== ALLOWED_IP) {
    return (
      <div className="admin-gate">
        <div className="admin-gate__card">
          <div className="admin-gate__icon denied"><Shield size={48}/></div>
          <h2>Kirish taqiqlangan</h2>
          <p>Siz ushbu sahifaga kirish huquqiga ega emassiz.</p>
          <p className="admin-gate__ip">Sizning IP: <code>{ip}</code></p>
          <p className="admin-gate__note">Faqat vakolatli shaxslar kirishi mumkin.</p>
        </div>
      </div>
    );
  }
  if (!authed) {
    return (
      <div className="admin-gate">
        <form className="admin-gate__card admin-login" onSubmit={handleLogin}>
          <div className="admin-gate__icon allowed"><Shield size={48}/></div>
          <h2>Admin Panel</h2>
          <p className="admin-gate__ip">IP tasdiqlandi: <code className="ip-ok">{ip} ✓</code></p>
          <div className="admin-login__field">
            <label>Parol</label>
            <div className="pass-input-wrap">
              <input type={showPass ? 'text' : 'password'} id="admin-password"
                placeholder="Parolni kiriting..." value={adminPass}
                onChange={e => setAdminPass(e.target.value)} autoFocus />
              <button type="button" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
            {passError && <p className="admin-login__error">{passError}</p>}
          </div>
          <button type="submit" className="btn-primary" id="admin-login-btn" style={{ width: '100%', justifyContent: 'center' }}>
            Kirish
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <Car size={24} color="#FFD600" />
          <span>TaxiUz Admin</span>
        </div>
        <nav className="admin-nav">
          {[
            { id: 'dashboard', label: 'Dashboard',          icon: <BarChart2 size={18}/> },
            { id: 'trips',     label: `Sayohatlar (${trips.length})`, icon: <MapPin size={18}/> },
            { id: 'drivers',   label: `Haydovchilar (${drivers.length})`, icon: <Car size={18}/> },
            { id: 'users',     label: `Foydalanuvchilar (${users.length})`, icon: <Users size={18}/> },
            { id: 'applications', label: `Arizalar (${applications.length})`, icon: <CheckCircle size={18}/> },
            { id: 'settings', label: 'Sozlamalar',          icon: <Settings size={18}/> },
          ].map(item => (
            <button key={item.id} id={`admin-nav-${item.id}`}
              className={`admin-nav__item ${tab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <div className="admin-ip"><Shield size={14} color="#4CAF50" /><span>{ip}</span></div>
          <button className="admin-logout" onClick={() => setAuthed(false)}>
            <LogOut size={16}/> Chiqish
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h1 className="admin-topbar__title">
            {tab === 'dashboard' && 'Dashboard'}
            {tab === 'trips' && 'Sayohatlar'}
            {tab === 'drivers' && 'Haydovchilar'}
            {tab === 'users' && 'Foydalanuvchilar'}
            {tab === 'applications' && 'Haydovchi Arizalari'}
            {tab === 'settings' && 'Sozlamalar'}
          </h1>
          <div className="admin-topbar__actions">
            <div className="admin-search">
              <Search size={16}/>
              <input type="text" placeholder="Qidirish..." value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="admin-icon-btn" onClick={loadData} title="Yangilash">
              {dataLoading ? <Loader size={18} className="spin-icon"/> : <RefreshCw size={18}/>}
            </button>
            <button className="admin-icon-btn" title="Bildirishnomalar">
              <Bell size={18}/>
              {applications.filter(a => a.status === 'Kutilmoqda').length > 0 && <span className="notif-dot"/>}
            </button>
            <div className="admin-avatar">A</div>
          </div>
        </div>

        <div className="admin-content">
          {/* Dashboard */}
          {tab === 'dashboard' && (
            <>
              <div className="admin-stats">
                {stats.map(s => (
                  <div className="admin-stat-card" key={s.label}>
                    <div className="admin-stat-card__icon" style={{ background: s.color + '20', color: s.color }}>
                      {s.icon}
                    </div>
                    <div>
                      <p className="stat-label">{s.label}</p>
                      <p className="stat-value">{s.value}</p>
                      {s.change !== null && (
                        <p className="stat-change positive">Jami: {s.change}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="admin-charts-row">
                <div className="admin-card">
                  <h3>So'nggi sayohatlar</h3>
                  {dataLoading ? <div className="table-loading"><Loader size={24}/> Yuklanmoqda...</div> : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead><tr><th>ID</th><th>Foydalanuvchi</th><th>Haydovchi</th><th>Narx</th><th>Holat</th></tr></thead>
                        <tbody>
                          {trips.slice(0, 6).map(t => (
                            <tr key={t.id}>
                              <td className="td-mono">#{t.id}</td>
                              <td>{t.user_name}</td>
                              <td>{t.driver_name || '—'}</td>
                              <td className="td-yellow">{t.price?.toLocaleString() || '—'} so'm</td>
                              <td><StatusBadge status={t.status}/></td>
                            </tr>
                          ))}
                          {trips.length === 0 && <tr><td colSpan={5} className="td-empty">Sayohatlar yo'q</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="admin-card admin-online">
                  <h3>Online haydovchilar</h3>
                  <div className="online-list">
                    {onlineDrivers.slice(0, 6).map(d => (
                      <div className="online-driver" key={d.id}>
                        <div className="online-avatar">{d.name?.[0]}</div>
                        <div className="online-info">
                          <p>{d.name}</p>
                          <p className="online-city">{d.city} · ⭐ {d.rating}</p>
                        </div>
                        <div className="online-dot"/>
                      </div>
                    ))}
                    {onlineDrivers.length === 0 && <p style={{ color: '#555', fontSize: '0.85rem' }}>Online haydovchilar yo'q</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Trips */}
          {tab === 'trips' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h3>Barcha sayohatlar ({filteredTrips.length})</h3>
              </div>
              {dataLoading ? <div className="table-loading"><Loader size={24}/> Yuklanmoqda...</div> : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr>
                      <th>ID</th><th>Vaqt</th><th>Mijoz</th><th>Haydovchi</th>
                      <th>Qayerdan</th><th>Qayerga</th><th>Tarif</th><th>Narx</th><th>Holat</th><th>Amal</th>
                    </tr></thead>
                    <tbody>
                      {filteredTrips.map(t => (
                        <tr key={t.id}>
                          <td className="td-mono">#{t.id}</td>
                          <td className="td-muted">{new Date(t.created_at).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="td-name">{t.user_name}</td>
                          <td>{t.driver_name || '—'}</td>
                          <td>{t.from_location}</td>
                          <td>{t.to_location}</td>
                          <td>{t.tariff}</td>
                          <td className="td-yellow">{t.price?.toLocaleString() || '—'} so'm</td>
                          <td><StatusBadge status={t.status}/></td>
                          <td className="td-actions">
                            {t.status === 'Jarayonda' && (
                              <button className="tbl-action-btn success" onClick={() => updateTripStatus(t.id, 'Tugallandi')} title="Tugallash">
                                <CheckCircle size={14}/>
                              </button>
                            )}
                            <button className="tbl-action-btn danger" onClick={() => deleteTrip(t.id)} title="O'chirish">
                              <Trash2 size={14}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredTrips.length === 0 && <tr><td colSpan={10} className="td-empty">Ma'lumot topilmadi</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Drivers */}
          {tab === 'drivers' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h3>Haydovchilar ({filteredDrivers.length})</h3>
              </div>
              {dataLoading ? <div className="table-loading"><Loader size={24}/> Yuklanmoqda...</div> : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr>
                      <th>ID</th><th>Ism</th><th>Telefon</th><th>Shahar</th><th>Mashina</th>
                      <th>Reyting</th><th>Sayohatlar</th><th>Holat</th><th>Amal</th>
                    </tr></thead>
                    <tbody>
                      {filteredDrivers.map(d => (
                        <tr key={d.id}>
                          <td className="td-mono">#{d.id}</td>
                          <td className="td-name">{d.name}</td>
                          <td className="td-muted">{d.phone}</td>
                          <td>{d.city}</td>
                          <td className="td-muted">{d.car || '—'}</td>
                          <td>⭐ {d.rating}</td>
                          <td>{(d.trips_count || 0).toLocaleString()}</td>
                          <td><StatusBadge status={d.status}/></td>
                          <td className="td-actions">
                            <button className="tbl-action-btn success" title="Online qilish"
                              onClick={() => updateDriverStatus(d.id, d.status === 'Online' ? 'Offline' : 'Online')}>
                              <CheckCircle size={14}/>
                            </button>
                            <button className="tbl-action-btn danger" title="O'chirish"
                              onClick={() => deleteDriver(d.id)}>
                              <XCircle size={14}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredDrivers.length === 0 && <tr><td colSpan={9} className="td-empty">Ma'lumot topilmadi</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h3>Foydalanuvchilar ({filteredUsers.length})</h3>
              </div>
              {dataLoading ? <div className="table-loading"><Loader size={24}/> Yuklanmoqda...</div> : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr>
                      <th>ID</th><th>Ism</th><th>Telefon</th><th>Shahar</th>
                      <th>Sayohatlar</th><th>Ro'yxat</th><th>Holat</th><th>Amal</th>
                    </tr></thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td className="td-mono">#{u.id}</td>
                          <td className="td-name">{u.name}</td>
                          <td className="td-muted">{u.phone}</td>
                          <td>{u.city}</td>
                          <td>{u.trips_count}</td>
                          <td className="td-muted">{u.created_at ? new Date(u.created_at).toLocaleDateString('uz') : '—'}</td>
                          <td><StatusBadge status={u.status}/></td>
                          <td className="td-actions">
                            <button className="tbl-action-btn danger" title="Bloklash"
                              onClick={() => updateUserStatus(u.id, u.status === 'Aktiv' ? 'Bloklangan' : 'Aktiv')}>
                              <XCircle size={14}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && <tr><td colSpan={8} className="td-empty">Ma'lumot topilmadi</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Applications */}
          {tab === 'applications' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h3>Haydovchi arizalari ({applications.length})</h3>
              </div>
              {dataLoading ? <div className="table-loading"><Loader size={24}/> Yuklanmoqda...</div> : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr>
                      <th>ID</th><th>Ism</th><th>Telefon</th><th>Shahar</th><th>Mashina</th>
                      <th>Yuborilgan</th><th>Holat</th><th>Amal</th>
                    </tr></thead>
                    <tbody>
                      {applications.map(a => (
                        <tr key={a.id}>
                          <td className="td-mono">#{a.id}</td>
                          <td className="td-name">{a.name}</td>
                          <td className="td-muted">{a.phone}</td>
                          <td>{a.city}</td>
                          <td>{a.has_car ? '✅ Bor' : '❌ Yo\'q'}</td>
                          <td className="td-muted">{a.created_at ? new Date(a.created_at).toLocaleDateString('uz') : '—'}</td>
                          <td><StatusBadge status={a.status}/></td>
                          <td className="td-actions">
                            <button className="tbl-action-btn success" title="Qabul qilish"
                              onClick={() => updateAppStatus(a.id, 'Qabul qilindi')}>
                              <CheckCircle size={14}/>
                            </button>
                            <button className="tbl-action-btn danger" title="Rad etish"
                              onClick={() => updateAppStatus(a.id, 'Rad etildi')}>
                              <XCircle size={14}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && <tr><td colSpan={8} className="td-empty">Arizalar yo'q</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {tab === 'settings' && (
            <div className="admin-settings">
              <div className="admin-card">
                <h3>Tizim sozlamalari</h3>
                <div className="settings-group">
                  {[
                    { id: 'maintenance', label: 'Texnik ishlar rejimi', desc: 'Sayt vaqtincha to\'xtatiladi', def: false },
                    { id: 'new-driver', label: 'Yangi haydovchi qabuli', desc: 'Yangi arizalar qabul qilinmoqda', def: true },
                    { id: 'notif', label: 'Bildirishnomalar', desc: 'Admin email bildirishnomalar', def: true },
                  ].map(s => (
                    <div className="settings-row" key={s.id}>
                      <div>
                        <p className="settings-label">{s.label}</p>
                        <p className="settings-desc">{s.desc}</p>
                      </div>
                      <label className="toggle">
                        <input type="checkbox" id={`${s.id}-toggle`} defaultChecked={s.def}/>
                        <span className="toggle__slider"/>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-card">
                <h3>Narx sozlamalari (so'm/km)</h3>
                <div className="settings-prices">
                  {tariffPrices.map(t => (
                    <div className="price-row" key={t.name}>
                      <span>{t.icon} {t.name}</span>
                      <input type="number" defaultValue={t.price} className="price-input"/>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" style={{ marginTop: 16 }}>Saqlash</button>
              </div>
              <div className="admin-card admin-card--security">
                <h3><Shield size={18}/> Xavfsizlik</h3>
                <p>Ruxsat etilgan IP manzillar:</p>
                <div className="ip-list">
                  <div className="ip-item">
                    <code>188.113.237.77</code>
                    <span className="ip-status">Aktiv</span>
                  </div>
                </div>
                <p style={{ marginTop: 16, color: '#555', fontSize: '0.82rem' }}>
                  Supabase: aodavqqraktiviwptjso.supabase.co
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
