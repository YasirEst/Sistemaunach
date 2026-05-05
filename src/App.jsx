import React, { useState } from 'react';
import './styles.css'; 

// Importamos nuestra Landing Page
import LandingPage from './pages/LandingPage'; 

const App = () => {
  // 1. Estado inicial: Empezamos en la presentación
  const [view, setView] = useState('presentacion'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Lógica para manejar el login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validación básica
    if (!email.endsWith('@unach.mx')) { 
      setError('Usa tu correo institucional @unach.mx'); 
      return; 
    }
    if (password.length < 8) { 
      setError('La contraseña debe tener mínimo 8 caracteres'); 
      return; 
    }
    
    setLoading(true);
    // Simulamos la carga antes de entrar al Dashboard
    setTimeout(() => {
      setLoading(false);
      setView('dashboard');
    }, 900);
  };

  // ══════════════════════════════════
  //  VISTA 1: PRESENTACIÓN (Landing Page)
  // ══════════════════════════════════
  if (view === 'presentacion') {
    return <LandingPage onIrAlLogin={() => setView('login')} />;
  }

  // ══════════════════════════════════
  //  VISTA 2: LOGIN Y REGISTRO
  // ══════════════════════════════════
  if (view === 'login' || view === 'signup') {
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
            <p className="ls-motto">"Formando líderes con visión humanista, científica y tecnológica."</p>
          </div>
        </div>

        <div className="ls-right">
          <div className="auth-box">
            <h2 className="auth-ht">Iniciar sesión</h2>
            {error && <div className="err-box" style={{color: 'red', marginBottom: '10px'}}><span>⚠</span> {error}</div>}
            
            <form onSubmit={handleLogin}>
              <div className="f-group" style={{ marginBottom: '15px' }}>
                <label className="f-label">Correo institucional</label>
                <input 
                  className="f-input" 
                  type="email" 
                  placeholder="ejemplo@unach.mx" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  style={{width: '100%', padding: '10px', marginTop: '5px'}}
                />
              </div>
              <div className="f-group" style={{ marginBottom: '20px' }}>
                <label className="f-label">Contraseña</label>
                <input 
                  className="f-input" 
                  type="password" 
                  placeholder="Mínimo 8 caracteres" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  style={{width: '100%', padding: '10px', marginTop: '5px'}}
                />
              </div>
              <button 
                className="btn-main" 
                type="submit" 
                disabled={loading}
                style={{width: '100%', padding: '15px', backgroundColor: '#d4a017', border: 'none', fontWeight: 'bold', cursor: 'pointer'}}
              >
                {loading ? 'Verificando…' : 'Ingresar al sistema →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════
  //  VISTA 3: DASHBOARD (Panel Principal)
  // ══════════════════════════════════
  if (view === 'dashboard') {
    return (
      <div className="app" style={{ backgroundColor: '#faf8f4', minHeight: '100vh' }}>
        <header className="hdr" style={{ backgroundColor: '#002b5c', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>UNACH - Dashboard</div>
          <div>
            <span style={{ marginRight: '20px' }}>docente@unach.mx</span>
            <button 
              onClick={() => setView('login')} 
              style={{ padding: '8px 15px', backgroundColor: 'transparent', border: '1px solid #d4a017', color: 'white', cursor: 'pointer', borderRadius: '5px' }}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main style={{ padding: '40px' }}>
          <h1 style={{ color: '#002b5c' }}>Bienvenido a tus Microservicios</h1>
          <p style={{ color: '#666' }}>Aquí conectaremos tus módulos de FastAPI (Horarios, Cursos, etc.) y la base de datos de AWS.</p>
        </main>
      </div>
    );
  }

  // Seguro por si el estado 'view' se pierde
  return null;
};

export default App;