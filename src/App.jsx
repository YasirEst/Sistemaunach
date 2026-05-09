import React, { useState } from 'react';
import './styles.css'; 
import LandingPage from './pages/LandingPage'; 

const App = () => {
  // 1. Estados de la aplicación
  const [view, setView] = useState('presentacion'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');

  // --- LÓGICA DEL PUENTE DE SEGURIDAD ---
  // Esta función genera el enlace dinámico con el token pegado
  const getSecureLink = (baseUrl) => {
    const token = localStorage.getItem('token');
    // Enviamos el token como un parámetro 't' en la URL
    return `${baseUrl}?token=${token}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Por favor, ingresa tu usuario, correo o RFC.'); return; }
    
    setLoading(true);
    const isAdmin = email === 'admin' || email.includes('admin');
    const endpoint = isAdmin ? '/api/login' : '/api/login-docente';
    
    if (isAdmin && !password) {
      setError('Los administradores deben ingresar su contraseña.');
      setLoading(false);
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://100.49.33.221:8000';
    const url = `${baseUrl}${endpoint}`;

    let payload = isAdmin ? { usuario: email, password: password } : (!password ? { rfc: email } : { usuario: email, password: password });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token); 
        setRole(isAdmin ? 'admin' : 'docente');
        setView('dashboard');
      } else {
        setError(data.detail || 'Error al iniciar sesión.');
      }
    } catch (err) {
      setError('Error conectando con el servidor en AWS.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    setView('login');
    setEmail('');
    setPassword('');
    setRole('');
  };

  if (view === 'presentacion') return <LandingPage onIrAlLogin={() => setView('login')} />;

  if (view === 'login') {
    return (
      <div className="ls-wrap">
        <div className="ls-left">
          <div className="geo-bg">
            {[20, 35, 50, 65, 80].map(left => <div key={left} className="geo-line" style={{ left: `${left}%` }} />)}
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
            <h2 className="auth-ht">Iniciar sesión</h2>
            {error && <div className="err-box" style={{color: 'red', marginBottom: '10px'}}>⚠ {error}</div>}
            <form onSubmit={handleLogin}>
              <div className="f-group" style={{ marginBottom: '15px' }}>
                <label className="f-label">Usuario o RFC</label>
                <input className="f-input" type="text" value={email} onChange={e => setEmail(e.target.value)} required style={{width: '100%', padding: '10px'}}/>
              </div>
              <div className="f-group" style={{ marginBottom: '20px' }}>
                <label className="f-label">Contraseña</label>
                <input className="f-input" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{width: '100%', padding: '10px'}}/>
              </div>
              <button className="btn-main" type="submit" disabled={loading} style={{width: '100%', padding: '15px', backgroundColor: '#d4a017', border: 'none', fontWeight: 'bold', cursor: 'pointer'}}>
                {loading ? 'Conectando...' : 'Ingresar al sistema →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="app" style={{ backgroundColor: '#faf8f4', minHeight: '100vh' }}>
        <header className="hdr" style={{ backgroundColor: '#002b5c', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>UNACH - Panel de {role === 'admin' ? 'Administración' : 'Docentes'}</div>
          <div>
            <span style={{ marginRight: '20px' }}>{email}</span>
            <button onClick={handleLogout} style={{ padding: '8px 15px', background: 'transparent', border: '1px solid #d4a017', color: 'white', cursor: 'pointer' }}>Cerrar sesión</button>
          </div>
        </header>

        <main style={{ padding: '40px' }}>
          {role === 'admin' && (
            <>
              <h1>Supervisión de Microservicios</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {/* MODIFICACIÓN: El link ahora lleva el token */}
                <a href={getSecureLink("https://sistema-unach-frontend.vercel.app/admin")} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Gestión de Usuarios</h3>
                    <p>Acceso seguro al módulo de Ximena con tu token actual.</p>
                  </div>
                </a>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                   <h3>Logs de AWS</h3>
                   <p>Servicio activo en 100.49.33.221</p>
                </div>
              </div>
            </>
          )}

          {role === 'docente' && (
            <>
              <h1>Panel Académico</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {/* MODIFICACIÓN: El link ahora lleva el token */}
                <a href={getSecureLink("https://sistema-unach-frontend.vercel.app/buzon")} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #d4a017' }}>
                    <h3>Mis Grupos / Buzón</h3>
                    <p>Ir al buzón de Ximena enviando credenciales.</p>
                  </div>
                </a>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #002b5c' }}>
                  <h3>Calificaciones</h3>
                  <p>Módulo interno de gestión.</p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }
  return null;
};

export default App;