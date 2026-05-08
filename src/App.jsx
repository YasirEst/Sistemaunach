import React, { useState } from 'react';
import './styles.css'; 
import LandingPage from './pages/LandingPage'; 

const App = () => {
  // 1. Estados de la aplicación
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');

  // 2. Lógica para manejar el login con el backend en AWS
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validación básica para evitar peticiones vacías
    if (!email || !password) { 
      setError('Por favor, ingresa tus credenciales.'); 
      return; 
    }
    
    setLoading(true);

    // Determinar si es Admin o Docente basado en el input
    // Asumimos que el admin entra con el usuario "admin" o un correo que lo contenga
    const isAdmin = email === 'admin' || email.includes('admin');
    const endpoint = isAdmin ? '/api/login' : '/api/login-docente';
    
    // Usamos la variable de entorno para la URL de AWS, o el dominio directamente por seguridad
    const baseUrl = import.meta.env.VITE_API_URL || 'http://54.147.115.227:8000';
    const url = `${baseUrl}${endpoint}`;

    // Armar el payload según lo que espera el backend de Ximena
    const payload = isAdmin 
      ? { usuario: email, password: password } 
      : { rfc: password }; // El docente usa el RFC (lo capturamos en el campo de contraseña por ahora)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // ¡Login exitoso! Guardamos el token de seguridad
        localStorage.setItem('jwt_token', data.token); // El nombre "token" depende de cómo lo devuelva el backend
        
        // Asignamos el rol y cambiamos la vista al dashboard
        setRole(isAdmin ? 'admin' : 'docente');
        setView('dashboard');
      } else {
        // Mostramos el error exacto que devuelve FastAPI (ej. "Credenciales inválidas")
        setError(data.detail || 'Error al iniciar sesión. Verifica tus datos.');
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error conectando con el servidor en AWS. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Lógica para cerrar sesión y limpiar estados
  const handleLogout = () => {
    // Borramos el token para asegurar que la sesión se cierra de verdad
    localStorage.removeItem('jwt_token');
    
    setView('login');
    setEmail('');
    setPassword('');
    setRole('');
  };

  // ══════════════════════════════════
  //  VISTA 1: PRESENTACIÓN (Landing Page)
  // ══════════════════════════════════
  if (view === 'presentacion') {
    return <LandingPage onIrAlLogin={() => setView('login')} />;
  }

  // ══════════════════════════════════
  //  VISTA 2: LOGIN
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
                <label className="f-label">Correo institucional / Usuario</label>
                <input 
                  className="f-input" 
                  type="text" 
                  placeholder="ejemplo@unach.mx o admin" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  style={{width: '100%', padding: '10px', marginTop: '5px'}}
                />
              </div>
              <div className="f-group" style={{ marginBottom: '20px' }}>
                {/* Cambiamos la etiqueta dinámicamente para que el docente sepa qué ingresar */}
                <label className="f-label">Contraseña {email && !email.includes('admin') ? '(RFC para docentes)' : ''}</label>
                <input 
                  className="f-input" 
                  type="password" 
                  placeholder="Tu contraseña o RFC" 
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
                {loading ? 'Conectando a AWS…' : 'Ingresar al sistema →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════
  //  VISTA 3: DASHBOARD
  // ══════════════════════════════════
  if (view === 'dashboard') {
    return (
      <div className="app" style={{ backgroundColor: '#faf8f4', minHeight: '100vh' }}>
        <header className="hdr" style={{ backgroundColor: '#002b5c', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            UNACH - Panel de {role === 'admin' ? 'Administración' : 'Docentes'}
          </div>
          <div>
            <span style={{ marginRight: '20px' }}>{email}</span>
            <button 
              onClick={handleLogout} 
              style={{ padding: '8px 15px', backgroundColor: 'transparent', border: '1px solid #d4a017', color: 'white', cursor: 'pointer', borderRadius: '5px' }}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main style={{ padding: '40px' }}>
          {/* CONTENIDO ESPECÍFICO PARA EL ADMINISTRADOR */}
          {role === 'admin' && (
            <>
              <h1 style={{ color: '#002b5c' }}>Supervisión de Microservicios y AWS</h1>
              <p style={{ color: '#666' }}>Bienvenido. Desde aquí puedes orquestar el API Gateway, monitorear los contenedores Docker y gestionar los accesos globales del sistema.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px' }}>
                <a href="https://sistema-unach-frontend.vercel.app/admin" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
                    <h3>Gestión de Usuarios</h3>
                    <p>Administra docentes y alumnos (Enlace al módulo Vercel).</p>
                  </div>
                </a>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3>Logs de FastAPI</h3>
                  <p>Revisa el estado de las peticiones.</p>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3>Infraestructura</h3>
                  <p>Métricas de EC2 y base de datos.</p>
                </div>
              </div>
            </>
          )}

          {/* CONTENIDO ESPECÍFICO PARA EL DOCENTE/USUARIO */}
          {role === 'docente' && (
            <>
              <h1 style={{ color: '#002b5c' }}>Panel Académico</h1>
              <p style={{ color: '#666' }}>Bienvenida. Aquí puedes gestionar tus grupos, capturar calificaciones y revisar tus horarios asignados.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '30px' }}>
                <a href="https://sistema-unach-frontend.vercel.app/buzon" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #d4a017', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Mis Grupos / Buzón</h3>
                    <p>Visualiza tus listas y envía mensajes (Enlace al módulo Vercel).</p>
                  </div>
                </a>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #002b5c', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3>Captura de Calificaciones</h3>
                  <p>Registra las evaluaciones del semestre actual.</p>
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