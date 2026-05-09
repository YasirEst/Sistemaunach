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
    // Le agregamos &rol=admin o &rol=docente a la URL
    return `${baseUrl}?token=${token}&rol=${rol}`;
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

  if (view === 'dashboard') {
    return (
      <div className="app" style={{ backgroundColor: '#faf8f4', minHeight: '100vh' }}>
        <header className="hdr" style={{ backgroundColor: '#002b5c', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>
            UNACH — Panel de {rol === 'admin' ? 'Administración' : 'Docentes'}
          </div>
          <div>
            <span style={{ marginRight: '20px' }}>{email}</span>
            <button onClick={handleLogout} style={{ padding: '8px 15px', background: 'transparent', border: '1px solid #d4a017', color: 'white', cursor: 'pointer', borderRadius: '5px' }}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main style={{ padding: '40px' }}>
          {/* ── Vista Administrador ── */}
          {rol === 'admin' && (
            <>
              <h1>Supervisión de Microservicios</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
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

          {/* ── Vista Docente ── */}
          {rol === 'docente' && (
            <>
              <h1>Panel Académico</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
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