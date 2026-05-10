import React, { useState } from 'react';
import './styles.css'; 
import LandingPage from './pages/LandingPage'; 

// ─── Helper: decodifica el payload del JWT sin librería externa ───────────────
const decodeToken = (token) => {
  try {
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const App = () => {
  // ─── Estados ─────────────────────────────────────────────────────────────────
  const [view, setView]             = useState('presentacion'); 
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]       = useState(false);
  const [rol, setRol]               = useState(''); // "admin" o "docente"
  const [regRole, setRegRole]       = useState('docente'); 

 // ─── Puente de seguridad ─────────────────────────────────────────────────────
  const getSecureLink = (baseUrl) => {
    const token = localStorage.getItem('token');
    // Ahora enviamos el token, el rol y el RFC
    return `${baseUrl}?token=${token}&rol=${rol}&rfc=${email}`;
  };
  
  // ─── Login ───────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccessMsg('');

    if (!email.trim()) { 
      setError('Por favor, ingresa tu usuario o RFC.'); 
      return; 
    }

    const esAdmin  = email.trim() === (import.meta.env.VITE_ADMIN_USER || 'admin') || email.toLowerCase().includes('admin');
    const endpoint = esAdmin ? '/api/login' : '/api/login-docente';

    if (esAdmin && !password) {
      setError('Los administradores deben ingresar su contraseña.'); 
      return;
    }

    setLoading(true);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://100.49.33.221:8000';
    const url     = `${baseUrl}${endpoint}`;

    const body = esAdmin 
      ? { usuario: email.trim(), password } 
      : !password 
        ? { rfc: email.trim() } 
        : { usuario: email.trim(), password };

    try {
      const response = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);

        const payload = decodeToken(data.token);
        
        let rolFinal = 'docente';
        if (payload && payload.rol) {
          rolFinal = payload.rol; 
        } else {
          rolFinal = esAdmin ? 'admin' : 'docente'; 
        }

        setRol(rolFinal);
        setView('dashboard');
      } else {
        setError(data.detail || 'Error al iniciar sesión. Verifica tus datos.');
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError('Error conectando con el servidor. Verifica el bloqueo de contenido mixto en tu navegador.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Registro ────────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccessMsg('');
    
    if (!email || !password) { 
      setError('Por favor, llena todos los campos para registrarte.'); 
      return; 
    }
    
    setLoading(true);
    const baseUrl = import.meta.env.VITE_API_URL || 'http://100.49.33.221:8000';
    const url = `${baseUrl}/api/registro`; 

    const payload = { usuario: email.trim(), password: password, rol: regRole };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMsg('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
        setView('login');
        setPassword('');
      } else {
        setError(data.detail || 'Error al crear la cuenta. Tal vez ya existe.');
      }
    } catch (err) {
      console.error("Error de registro:", err);
      setError('Error conectando con el servidor en AWS.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Utilidades ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    setView('login'); setEmail(''); setPassword(''); setRol(''); setSuccessMsg('');
  };

  const cambiarVista = (nuevaVista) => {
    setView(nuevaVista); setError(''); setSuccessMsg(''); setEmail(''); setPassword('');
  };

  // ─── Vistas ──────────────────────────────────────────────────────────────────
  if (view === 'presentacion') return <LandingPage onIrAlLogin={() => setView('login')} />;

  if (view === 'login' || view === 'registro') {
    const isLogin = view === 'login';

    return (
      <div className="ls-wrap">
        <div className="ls-left">
          <div className="geo-bg">
            {[20, 35, 50, 65, 80].map(left => (
              <div key={left} className="geo-line" style={{ left: `${left}%` }} />
            ))}
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="ls-badge">Sistema Académico</span>
            <h1 className="ls-title">Universidad<br/>Autónoma de<br/>Chiapas</h1>
            <p className="ls-sub">UNACH</p>
            <div className="ls-rule" />
            <p className="ls-motto">"Formando líderes con visión humanista..."</p>
          </div>
        </div>

        <div className="ls-right">
          <div className="auth-box">
            <h2 className="auth-ht">{isLogin ? 'Iniciar sesión' : 'Crear nueva cuenta'}</h2>

            {error && <div className="err-box" style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>⚠ {error}</div>}
            {successMsg && <div style={{color: 'green', marginBottom: '10px', fontSize: '14px', background: '#e6ffe6', padding: '10px', borderRadius: '5px'}}>✓ {successMsg}</div>}

            <form onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && (
                <div className="f-group" style={{ marginBottom: '15px' }}>
                  <label className="f-label">Tipo de Cuenta</label>
                  <select className="f-input" value={regRole} onChange={e => setRegRole(e.target.value)} style={{width: '100%', padding: '10px'}}>
                    <option value="docente">Docente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              )}

              <div className="f-group" style={{ marginBottom: '15px' }}>
                <label className="f-label">{!isLogin && regRole === 'docente' ? 'RFC del Docente' : 'Usuario o Correo'}</label>
                <input className="f-input" type="text" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px' }} />
              </div>
              <div className="f-group" style={{ marginBottom: '20px' }}>
                <label className="f-label">Contraseña</label>
                <input className="f-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required={!isLogin} style={{ width: '100%', padding: '10px' }} />
              </div>
              <button className="btn-main" type="submit" disabled={loading} style={{ width: '100%', padding: '15px', backgroundColor: '#d4a017', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '5px' }}>
                {loading ? 'Conectando...' : (isLogin ? 'Ingresar al sistema →' : 'Registrar cuenta')}
              </button>
            </form>

            <div style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666'}}>
              {isLogin ? (
                <p>¿No tienes una cuenta? <span onClick={() => cambiarVista('registro')} style={{color: '#002b5c', cursor: 'pointer', fontWeight: 'bold'}}>Regístrate aquí</span></p>
              ) : (
                <p>¿Ya tienes cuenta? <span onClick={() => cambiarVista('login')} style={{color: '#002b5c', cursor: 'pointer', fontWeight: 'bold'}}>Inicia sesión</span></p>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // DashboardUNACH.jsx
// Props esperados: rol, email, handleLogout, getSecureLink
// Uso: <DashboardUNACH rol={rol} email={email} handleLogout={handleLogout} getSecureLink={getSecureLink} />

import { useState, useEffect } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulseGold {
    0%, 100% { box-shadow: 0 0 0 0 rgba(212,160,23,0.55); }
    50%       { box-shadow: 0 0 0 6px rgba(212,160,23,0); }
  }
  @keyframes shimmerBar {
    from { background-position: -200% 0; }
    to   { background-position: 200% 0; }
  }
  @keyframes rotateIn {
    from { opacity: 0; transform: rotate(-6deg) scale(0.9); }
    to   { opacity: 1; transform: rotate(0deg) scale(1); }
  }

  .unach-sidebar {
    animation: slideLeft 0.45s cubic-bezier(.22,.68,0,1.2) forwards;
  }

  .unach-module-card {
    background: white;
    border-radius: 20px;
    padding: 28px 24px 22px;
    border: 1.5px solid rgba(0,43,92,0.07);
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.28s cubic-bezier(.22,.68,0,1.2),
                box-shadow 0.28s ease,
                border-color 0.28s ease;
    text-decoration: none;
    color: inherit;
    display: block;
  }
  .unach-module-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(212,160,23,0.06) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .unach-module-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 20px 48px rgba(0,43,92,0.13);
    border-color: rgba(212,160,23,0.35);
  }
  .unach-module-card:hover::after { opacity: 1; }

  .unach-card-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3.5px;
    background: linear-gradient(90deg, #002b5c 0%, #d4a017 60%, #f0c040 100%);
    background-size: 200% 100%;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.38s cubic-bezier(.22,.68,0,1.2);
    border-radius: 20px 20px 0 0;
  }
  .unach-module-card:hover .unach-card-bar { transform: scaleX(1); }

  .unach-nav-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 14px;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;
    color: rgba(255,255,255,0.62);
    font-size: 14px;
    font-weight: 400;
    user-select: none;
    position: relative;
  }
  .unach-nav-item:hover { background: rgba(212,160,23,0.13); color: white; }
  .unach-nav-item.active { background: rgba(212,160,23,0.18); color: white; font-weight: 500; }
  .unach-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 60%;
    background: #d4a017;
    border-radius: 0 3px 3px 0;
  }

  .unach-stat {
    background: #002b5c;
    border-radius: 18px;
    padding: 20px 22px;
    color: white;
    position: relative;
    overflow: hidden;
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .unach-stat:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,43,92,0.25);
  }
  .unach-stat-orb {
    position: absolute;
    width: 72px; height: 72px;
    border-radius: 50%;
    background: rgba(212,160,23,0.14);
    bottom: -18px; right: -14px;
  }
  .unach-stat-orb2 {
    position: absolute;
    width: 40px; height: 40px;
    border-radius: 50%;
    background: rgba(212,160,23,0.08);
    top: -12px; right: 28px;
  }

  .unach-logout-btn {
    width: 100%;
    padding: 9px 14px;
    background: transparent;
    border: 1.5px solid rgba(255,255,255,0.14);
    border-radius: 10px;
    color: rgba(255,255,255,0.65);
    font-size: 13px;
    cursor: pointer;
    transition: background 0.18s, color 0.18s, border-color 0.18s;
    font-family: inherit;
    margin-top: 10px;
  }
  .unach-logout-btn:hover {
    background: rgba(212,160,23,0.14);
    color: white;
    border-color: rgba(212,160,23,0.4);
  }

  .unach-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 4px 11px;
    border-radius: 20px;
    letter-spacing: 0.03em;
  }
  .badge-active  { background: rgba(212,160,23,0.13); color: #a07810; }
  .badge-online  { background: rgba(0,160,80,0.1);    color: #0a7a3a; }
  .badge-soon    { background: rgba(0,0,0,0.06);       color: #888;    }

  .unach-icon-box {
    width: 44px; height: 44px;
    border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    background: rgba(0,43,92,0.06);
    transition: background 0.2s ease, transform 0.2s ease;
  }
  .unach-module-card:hover .unach-icon-box {
    background: rgba(212,160,23,0.12);
    transform: rotate(-4deg) scale(1.08);
  }

  .unach-section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    padding: 0 14px;
    margin: 8px 0 4px;
  }

  .unach-arrow-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 500;
    color: #d4a017;
    margin-top: 18px;
    transition: gap 0.2s ease;
  }
  .unach-module-card:hover .unach-arrow-btn { gap: 9px; }

  .unach-disabled-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.55);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(1px);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .unach-disabled-card:hover .unach-disabled-overlay { opacity: 1; }
`;

// ── Íconos SVG ligeros ──────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const paths = {
    home:   "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    users:  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    cal:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    chart:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    doc:    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    inbox:  "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
    logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    arrow:  "M13 7l5 5m0 0l-5 5m5-5H6",
    lock:   "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
};

// ── Tarjeta de módulo ────────────────────────────────────────────────────────
function ModuleCard({ title, desc, href, tag, icon, delay, getSecureLink }) {
  const badgeCls = tag === "Próximamente" ? "badge-soon" : tag === "En línea" ? "badge-online" : "badge-active";
  const isDisabled = !href;

  const inner = (
    <div
      className={`unach-module-card ${isDisabled ? "unach-disabled-card" : ""}`}
      style={{ animation: `fadeUp 0.5s cubic-bezier(.22,.68,0,1.2) ${delay}ms both` }}
    >
      <div className="unach-card-bar" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div className="unach-icon-box">{icon}</div>
        <span className={`unach-badge ${badgeCls}`}>{tag}</span>
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#002b5c", lineHeight: 1.3 }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{desc}</p>
      {!isDisabled && (
        <div className="unach-arrow-btn">
          Acceder <Icon name="arrow" size={14} color="#d4a017" />
        </div>
      )}
      {isDisabled && (
        <div className="unach-disabled-overlay">
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#888", fontWeight: 500 }}>
            <Icon name="lock" size={15} color="#aaa" /> Disponible pronto
          </div>
        </div>
      )}
    </div>
  );

  if (isDisabled) return <div style={{ cursor: "default" }}>{inner}</div>;

  const url = getSecureLink ? getSecureLink(href) : href;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
      {inner}
    </a>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function DashboardUNACH({ rol = "docente", email = "docente@unach.mx", handleLogout, getSecureLink }) {
  const [activeNav, setActiveNav] = useState("inicio");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const greeting = (() => {
    const h = time.getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  })();

  const navItemsAdmin = [
    { id: "inicio",     label: "Inicio",          icon: <Icon name="home"  size={17} /> },
    { id: "usuarios",   label: "Usuarios",         icon: <Icon name="users" size={17} /> },
    { id: "horarios",   label: "Horarios",         icon: <Icon name="cal"   size={17} /> },
    { id: "reportes",   label: "Reportes",         icon: <Icon name="chart" size={17} /> },
  ];
  const navItemsDocente = [
    { id: "inicio",        label: "Inicio",          icon: <Icon name="home"  size={17} /> },
    { id: "grupos",        label: "Mis Grupos",       icon: <Icon name="users" size={17} /> },
    { id: "horarios",      label: "Horarios",         icon: <Icon name="cal"   size={17} /> },
    { id: "calificaciones",label: "Calificaciones",   icon: <Icon name="doc"   size={17} /> },
  ];
  const navItems = rol === "admin" ? navItemsAdmin : navItemsDocente;

  const statsAdmin   = [{ label: "Módulos activos", val: "2" }, { label: "Docentes", val: "248" }, { label: "Semestre", val: "2025‑A" }];
  const statsDocente = [{ label: "Grupos asignados", val: "4" }, { label: "Materias", val: "6" }, { label: "Semestre", val: "2025‑A" }];
  const stats = rol === "admin" ? statsAdmin : statsDocente;

  const adminCards = [
    { title: "Gestión de Usuarios",    desc: "Administra el buzón de maestros y sus perfiles académicos.", href: "https://sistema-unach-frontend.vercel.app/admin",  tag: "Activo",        icon: "🏛️" },
    { title: "Generación de Horarios", desc: "Sistema integral de aulas, materias y horarios.",            href: "https://modulo-horario.vercel.app/login",           tag: "En línea",      icon: "📅" },
  ];
  const docenteCards = [
    { title: "Mis Grupos / Buzón",     desc: "Consulta y gestiona tus grupos y comunicados.",              href: "https://sistema-unach-frontend.vercel.app/buzon",   tag: "Activo",        icon: "📬" },
    { title: "Generación de Horarios", desc: "Accede al sistema de aulas, materias y horarios.",           href: "https://modulo-horario.vercel.app/login",           tag: "En línea",      icon: "📅" },
    { title: "Calificaciones",         desc: "Módulo interno de gestión de calificaciones.",               href: null,                                                tag: "Próximamente",  icon: "📊" },
  ];
  const cards = rol === "admin" ? adminCards : docenteCards;

  const initials = email ? email[0].toUpperCase() : "D";

  return (
    <>
      <style>{STYLES}</style>

      <div style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f2ede6 0%, #ede8e0 100%)",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}>

        {/* ─── Sidebar ───────────────────────────────────────────────── */}
        <aside className="unach-sidebar" style={{
          width: 248,
          background: "#001f44",
          display: "flex",
          flexDirection: "column",
          padding: "28px 14px 20px",
          position: "fixed",
          top: 0, left: 0, bottom: 0,
          zIndex: 20,
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}>
          {/* Logo */}
          <div style={{ padding: "0 10px 24px", borderBottom: "1px solid rgba(255,255,255,0.09)", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#d4a017", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 17, color: "#001f44", animation: "rotateIn 0.55s cubic-bezier(.22,.68,0,1.2) 0.1s both", flexShrink: 0 }}>U</div>
              <div>
                <div style={{ color: "white", fontWeight: 600, fontSize: 14, letterSpacing: "0.02em" }}>UNACH</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Portal Académico</div>
              </div>
            </div>
          </div>

          {/* Nav section label */}
          <div className="unach-section-label">Menú principal</div>

          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            {navItems.map((item) => (
              <div
                key={item.id}
                className={`unach-nav-item ${activeNav === item.id ? "active" : ""}`}
                onClick={() => setActiveNav(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          {/* User card */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.09)", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#d4a017", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#001f44", flexShrink: 0, animation: "pulseGold 3s ease-in-out infinite" }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "white", fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 1 }}>{rol === "admin" ? "Administrador" : "Docente"}</div>
              </div>
            </div>
            <button className="unach-logout-btn" onClick={handleLogout}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Icon name="logout" size={14} color="currentColor" /> Cerrar sesión
              </span>
            </button>
          </div>
        </aside>

        {/* ─── Contenido principal ───────────────────────────────────── */}
        <main style={{ marginLeft: 248, flex: 1, padding: "44px 52px 60px", maxWidth: "calc(100vw - 248px)" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, animation: "fadeUp 0.4s ease both" }}>
            <div>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d4a017" }}>{greeting}</p>
              <h1 style={{ margin: "5px 0 0", fontSize: 34, fontWeight: 600, color: "#001f44", fontFamily: "'Lora', Georgia, serif", lineHeight: 1.15 }}>
                Panel {rol === "admin" ? "Administrativo" : "Académico"}
              </h1>
            </div>
            <div style={{ textAlign: "right", animation: "fadeUp 0.4s ease 0.08s both" }}>
              <div style={{ fontSize: 32, fontWeight: 300, color: "#001f44", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {time.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div style={{ fontSize: 12.5, color: "#9ca3af", marginTop: 4 }}>
                {time.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 44 }}>
            {stats.map((s, i) => (
              <div key={i} className="unach-stat" style={{ animation: `fadeUp 0.45s ease ${80 + i * 70}ms both` }}>
                <div className="unach-stat-orb" />
                <div className="unach-stat-orb2" />
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10, fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 36, fontWeight: 600, color: "white", lineHeight: 1, position: "relative", zIndex: 1 }}>{s.val}</div>
                <div style={{ position: "absolute", top: 18, right: 18, width: 8, height: 8, borderRadius: "50%", background: "#d4a017", animation: "pulseGold 2.5s ease-in-out infinite" }} />
              </div>
            ))}
          </div>

          {/* Módulos */}
          <div style={{ marginBottom: 18, animation: "fadeUp 0.4s ease 0.28s both" }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#001f44" }}>
              {rol === "admin" ? "Microservicios" : "Módulos académicos"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>Accede a los módulos disponibles de tu perfil.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: rol === "admin" ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 20 }}>
            {cards.map((card, i) => (
              <ModuleCard key={i} {...card} delay={320 + i * 90} getSecureLink={getSecureLink} />
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 56, paddingTop: 22, borderTop: "1px solid rgba(0,43,92,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "fadeUp 0.4s ease 0.6s both" }}>
            <span style={{ fontSize: 12, color: "#b4a99d" }}>SIAE — Sistema Integral de Administración Escolar</span>
            <span style={{ fontSize: 12, color: "#b4a99d" }}>UNACH © 2025</span>
          </div>
        </main>
      </div>
    </>
  );
}

  return null;
};

export default App;