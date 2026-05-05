import { useState, useEffect, useRef } from "react";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy:   #002b5c;
      --deep:   #00153a;
      --gold:   #d4a017;
      --gold2:  #f0c040;
      --cream:  #faf8f4;
      --muted:  #9aa3b0;
      --glass:  rgba(255,255,255,0.06);
      --border: rgba(212,160,23,0.25);
    }

    html { scroll-behavior: smooth; }

    body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--deep); }

    /* ── Navbar ── */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 56px;
      background: transparent;
      transition: background 0.4s, backdrop-filter 0.4s, box-shadow 0.4s;
    }
    .navbar.scrolled {
      background: rgba(0,21,58,0.92);
      backdrop-filter: blur(18px);
      box-shadow: 0 2px 24px rgba(0,0,0,0.4);
    }
    .navbar-logo { font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 1.7rem; color: var(--gold); letter-spacing: 2px; }
    .navbar-links { display: flex; gap: 36px; }
    .navbar-links a {
      color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.92rem;
      font-weight: 500; letter-spacing: 0.5px;
      position: relative; padding-bottom: 4px;
      transition: color 0.2s;
    }
    .navbar-links a::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1.5px;
      background: var(--gold); transform: scaleX(0); transition: transform 0.3s;
    }
    .navbar-links a:hover { color: var(--gold); }
    .navbar-links a:hover::after { transform: scaleX(1); }

    /* ── Hero ── */
    .hero {
      position: relative; min-height: 100vh;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; overflow: hidden;
      background: linear-gradient(145deg, #00153a 0%, #002b5c 50%, #001030 100%);
      padding: 120px 24px 80px;
    }
    .hero-mesh {
      position: absolute; inset: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 80% 60% at 20% 40%, rgba(212,160,23,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 80% 70%, rgba(0,43,92,0.6) 0%, transparent 70%),
        radial-gradient(ellipse 40% 40% at 60% 10%, rgba(212,160,23,0.08) 0%, transparent 60%);
    }
    .hero-grid {
      position: absolute; inset: 0; pointer-events: none;
      background-image: linear-gradient(rgba(212,160,23,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(212,160,23,0.04) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      border: 1px solid var(--border); border-radius: 100px;
      padding: 6px 16px; margin-bottom: 32px;
      font-size: 0.78rem; letter-spacing: 2px; text-transform: uppercase;
      color: var(--gold); background: rgba(212,160,23,0.08);
      animation: fadeUp 0.7s ease both;
    }
    .hero-badge span { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); display: inline-block; animation: pulse 2s infinite; }
    .hero h1 {
      font-family: 'Cormorant Garamond', serif; font-size: clamp(2.8rem, 6vw, 5.2rem);
      font-weight: 700; color: white; line-height: 1.1; max-width: 820px;
      animation: fadeUp 0.7s 0.15s ease both;
    }
    .hero h1 em { font-style: normal; color: var(--gold); }
    .hero-sub {
      font-size: 1.05rem; color: rgba(226,230,237,0.8); max-width: 580px;
      line-height: 1.75; margin: 28px 0 48px;
      animation: fadeUp 0.7s 0.3s ease both;
    }
    .hero-cta {
      display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
      animation: fadeUp 0.7s 0.45s ease both;
    }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 10px;
      background: var(--gold); color: var(--deep);
      padding: 16px 36px; border-radius: 8px; border: none;
      font-weight: 700; font-size: 1rem; cursor: pointer; letter-spacing: 0.3px;
      box-shadow: 0 0 40px rgba(212,160,23,0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 48px rgba(212,160,23,0.45); }
    .btn-ghost {
      display: inline-flex; align-items: center; gap: 10px;
      background: transparent; color: white;
      padding: 16px 36px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);
      font-weight: 500; font-size: 1rem; cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.4); }
    .hero-bottom {
      position: absolute; bottom: 0; left: 0; right: 0; height: 80px;
      background: linear-gradient(to top, var(--cream), transparent);
    }
    .hero-scroll {
      position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      color: rgba(255,255,255,0.4); font-size: 0.72rem; letter-spacing: 2px; text-transform: uppercase;
      animation: fadeUp 0.7s 0.8s ease both;
    }
    .scroll-line { width: 1px; height: 48px; background: linear-gradient(to bottom, var(--gold), transparent); animation: scrollAnim 1.8s ease-in-out infinite; }

    /* ── Stats banner ── */
    .stats-bar {
      background: var(--deep);
      padding: 0;
      position: relative; z-index: 1;
    }
    .stats-inner {
      max-width: 1100px; margin: 0 auto;
      display: grid; grid-template-columns: repeat(3, 1fr);
    }
    .stat-item {
      padding: 48px 20px; text-align: center; position: relative;
    }
    .stat-item:not(:last-child)::after {
      content: ''; position: absolute; right: 0; top: 25%; bottom: 25%;
      width: 1px; background: var(--border);
    }
    .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 3.2rem; font-weight: 700; color: var(--gold); line-height: 1; }
    .stat-label { color: var(--muted); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-top: 8px; }

    /* ── Section commons ── */
    .section-label {
      display: inline-block; font-size: 0.72rem; letter-spacing: 3px; text-transform: uppercase;
      color: var(--gold); font-weight: 600; margin-bottom: 14px;
    }
    .section-title {
      font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700; color: var(--navy); line-height: 1.2;
    }
    .section-sub { color: #555; font-size: 1rem; line-height: 1.7; max-width: 560px; margin-top: 12px; }

    /* ── Tech Section ── */
    .tech-section { padding: 110px 24px; background: var(--cream); }
    .tech-inner { max-width: 1100px; margin: 0 auto; }
    .tech-header { text-align: center; margin-bottom: 72px; }
    .tech-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px; }

    .tech-card {
      position: relative; overflow: hidden; border-radius: 16px;
      background: white;
      border: 1px solid rgba(0,43,92,0.07);
      box-shadow: 0 2px 20px rgba(0,0,0,0.05);
      transition: transform 0.35s, box-shadow 0.35s;
      cursor: default;
    }
    .tech-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--gold), var(--gold2));
    }
    .tech-card:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(0,43,92,0.12); }
    .tech-card-img { width: 100%; height: 200px; object-fit: cover; display: block; }
    .tech-card-body { padding: 28px 28px 32px; }
    .tech-card-icon { font-size: 1.8rem; margin-bottom: 14px; }
    .tech-card h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 700; color: var(--navy); margin-bottom: 12px; }
    .tech-card p { color: #666; line-height: 1.65; font-size: 0.95rem; }
    .tech-card-tag {
      display: inline-flex; gap: 6px; flex-wrap: wrap; margin-top: 20px;
    }
    .tag {
      background: rgba(0,43,92,0.06); color: var(--navy); border-radius: 4px;
      padding: 3px 10px; font-size: 0.73rem; font-weight: 600; letter-spacing: 0.5px;
    }

    /* ── Architecture diagram ── */
    .arch-section { padding: 80px 24px; background: #f0ede8; }
    .arch-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .arch-visual {
      background: var(--deep); border-radius: 20px; padding: 36px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.2);
      position: relative; overflow: hidden;
    }
    .arch-visual::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse at 30% 30%, rgba(212,160,23,0.1), transparent 60%);
    }
    .arch-row { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .arch-node {
      background: rgba(255,255,255,0.07); border: 1px solid rgba(212,160,23,0.3);
      border-radius: 10px; padding: 10px 16px;
      color: white; font-size: 0.8rem; font-weight: 500; white-space: nowrap;
      display: flex; align-items: center; gap: 8px;
    }
    .arch-node.gold { background: rgba(212,160,23,0.15); border-color: var(--gold); color: var(--gold); font-weight: 700; }
    .arch-connector { color: var(--gold); font-size: 0.9rem; }
    .arch-divider { width: 100%; height: 1px; background: var(--border); margin: 8px 0 20px; }

    /* ── Support Form ── */
    .support-section { padding: 110px 24px; background: var(--cream); }
    .support-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
    .support-info h2 { font-family: 'Cormorant Garamond', serif; font-size: 2.8rem; color: var(--navy); line-height: 1.2; margin-bottom: 18px; }
    .support-info p { color: #666; line-height: 1.7; margin-bottom: 36px; }
    .contact-card {
      display: flex; align-items: center; gap: 16px;
      background: white; border-radius: 12px; padding: 20px 24px;
      border: 1px solid rgba(0,43,92,0.07);
      box-shadow: 0 2px 16px rgba(0,0,0,0.04); margin-bottom: 14px;
    }
    .contact-icon { width: 44px; height: 44px; border-radius: 10px; background: rgba(212,160,23,0.1); display: grid; place-items: center; font-size: 1.2rem; flex-shrink: 0; }
    .contact-label { font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 1px; }
    .contact-value { font-size: 0.95rem; color: var(--navy); font-weight: 600; margin-top: 2px; }

    .form-card {
      background: white; border-radius: 20px; padding: 44px;
      border: 1px solid rgba(0,43,92,0.07);
      box-shadow: 0 8px 48px rgba(0,43,92,0.08);
    }
    .form-card h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; color: var(--navy); margin-bottom: 28px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--navy); letter-spacing: 0.5px; margin-bottom: 8px; text-transform: uppercase; }
    .form-input {
      width: 100%; padding: 14px 16px;
      border: 1.5px solid #e2e6ed; border-radius: 10px;
      font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
      background: #faf8f4; color: var(--deep);
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .form-input:focus { border-color: var(--navy); box-shadow: 0 0 0 3px rgba(0,43,92,0.08); }
    .form-select {
      width: 100%; padding: 14px 16px;
      border: 1.5px solid #e2e6ed; border-radius: 10px;
      font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
      background: #faf8f4; color: var(--deep);
      transition: border-color 0.2s; outline: none; cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23002b5c' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 16px center;
    }
    .form-select:focus { border-color: var(--navy); box-shadow: 0 0 0 3px rgba(0,43,92,0.08); }
    .form-textarea { resize: vertical; min-height: 120px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .btn-submit {
      width: 100%; padding: 16px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, var(--navy), #003a7a);
      color: white; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700;
      cursor: pointer; letter-spacing: 0.3px;
      box-shadow: 0 4px 24px rgba(0,43,92,0.3);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,43,92,0.4); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .success-box {
      text-align: center; padding: 32px;
    }
    .success-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #d4a017, #f0c040);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px; font-size: 2rem;
    }
    .success-box h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; color: var(--navy); margin-bottom: 10px; }
    .success-box p { color: #666; line-height: 1.6; }

    /* ── Footer ── */
    .footer { background: var(--deep); color: var(--muted); padding: 72px 24px 28px; }
    .footer-inner { max-width: 1100px; margin: 0 auto; }
    .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 56px; padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .footer-brand .logo { font-family: 'Cormorant Garamond', serif; font-size: 2rem; color: var(--gold); font-weight: 700; letter-spacing: 2px; }
    .footer-brand p { margin-top: 14px; font-size: 0.9rem; line-height: 1.7; color: rgba(154,163,176,0.8); }
    .footer-col h4 { color: white; font-size: 0.82rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 18px; }
    .footer-col a { display: block; color: var(--muted); text-decoration: none; font-size: 0.9rem; margin-bottom: 10px; transition: color 0.2s; }
    .footer-col a:hover { color: var(--gold); }
    .footer-bottom { padding-top: 24px; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; flex-wrap: wrap; gap: 12px; }
    .footer-credits { color: rgba(154,163,176,0.6); }
    .footer-author { color: var(--gold); }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.5; transform: scale(0.7); }
    }
    @keyframes scrollAnim {
      0%   { transform: scaleY(0); transform-origin: top; }
      50%  { transform: scaleY(1); transform-origin: top; }
      51%  { transform: scaleY(1); transform-origin: bottom; }
      100% { transform: scaleY(0); transform-origin: bottom; }
    }
    .reveal {
      opacity: 0; transform: translateY(32px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    @media (max-width: 768px) {
      .navbar { padding: 14px 20px; }
      .navbar-links { gap: 18px; }
      .navbar-links a { font-size: 0.8rem; }
      .stats-inner { grid-template-columns: 1fr; }
      .stat-item::after { display: none; }
      .arch-inner, .support-inner, .footer-top { grid-template-columns: 1fr; gap: 40px; }
      .form-row { grid-template-columns: 1fr; }
      .footer-bottom { flex-direction: column; text-align: center; }
    }
  `}</style>
);

// ── Reveal Hook ───────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Counter Animation ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = "" }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const isNum = !isNaN(parseInt(target));
        if (!isNum) { setValue(target); return; }
        const end = parseInt(target);
        let start = 0; const step = Math.ceil(end / 40);
        const t = setInterval(() => {
          start = Math.min(start + step, end);
          setValue(start);
          if (start >= end) clearInterval(t);
        }, 35);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{value}{suffix}</span>;
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage({ onIrAlLogin }) {
  const [navScrolled, setNavScrolled] = useState(false);
  const [form, setForm] = useState({ nombre: "", correo: "", tipo: "", descripcion: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success

  useReveal();

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");

    // Compose a detailed email via mailto
    const subject = encodeURIComponent(`[Mesa de Ayuda UNACH] ${form.tipo || "Reporte Técnico"} – ${form.nombre}`);
    const body = encodeURIComponent(
`REPORTE TÉCNICO - SISTEMA UNACH
═══════════════════════════════════════

Usuario:       ${form.nombre}
Correo:        ${form.correo}
Tipo de Issue: ${form.tipo || "No especificado"}
Fecha:         ${new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}

DESCRIPCIÓN DEL PROBLEMA:
───────────────────────────
${form.descripcion}

─────────────────────────────────────
Generado automáticamente por Mesa de Ayuda UNACH`
    );

    // Open mail client (works universally without backend)
    window.open(`mailto:rodolfo.estrada@unach.mx?subject=${subject}&body=${body}`, "_blank");

    // Show success after a short delay
    setTimeout(() => setStatus("success"), 600);
  };

  return (
    <>
      <FontLink />

      {/* ── Navbar ── */}
      <nav className={`navbar${navScrolled ? " scrolled" : ""}`}>
        <div className="navbar-logo">UNACH</div>
        <div className="navbar-links">
          <a href="#inicio">Inicio</a>
          <a href="#tecnologia">Arquitectura</a>
          <a href="#soporte">Soporte</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header id="inicio" className="hero">
        <div className="hero-mesh" />
        <div className="hero-grid" />

        <div className="hero-badge">
          <span />&nbsp;Sistema Activo — 2026
        </div>

        <h1>
          Gestión Académica<br />
          <em>Inteligente y Escalable</em>
        </h1>

        <p className="hero-sub">
          Una plataforma universitaria de nueva generación, impulsada por
          microservicios en la nube, seguridad JWT y despliegue continuo en AWS.
        </p>

        <div className="hero-cta">
          <button className="btn-primary" onClick={onIrAlLogin}>
            Acceder al Portal ➔
          </button>
          <a href="#tecnologia" className="btn-ghost" style={{ textDecoration: "none" }}>
            Ver Arquitectura ↓
          </a>
        </div>

        <div className="hero-scroll">
          <div className="scroll-line" />
        </div>
      </header>

      {/* ── Stats ── */}
      <div className="stats-bar">
        <div className="stats-inner">
          {[
            { num: "5", suf: "+", label: "Microservicios Activos" },
            { num: "AWS", suf: "", label: "Infraestructura en la Nube" },
            { num: "99", suf: ".9%", label: "Disponibilidad Garantizada" },
          ].map((s, i) => (
            <div className="stat-item" key={i}>
              <div className="stat-num">
                {isNaN(parseInt(s.num))
                  ? s.num
                  : <AnimatedNumber target={parseInt(s.num)} suffix={s.suf} />}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Technology Cards ── */}
      <section id="tecnologia" className="tech-section">
        <div className="tech-inner">
          <div className="tech-header reveal">
            <span className="section-label">Stack Tecnológico</span>
            <h2 className="section-title">Potenciado por Tecnología<br />de Vanguardia</h2>
            <p className="section-sub" style={{ margin: "16px auto 0" }}>
              Cada componente fue diseñado para escalar de forma independiente,
              garantizando resiliencia y alto rendimiento en producción.
            </p>
          </div>

          <div className="tech-cards">
            {[
              {
                img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
                icon: "⚡",
                title: "Lógica Backend",
                desc: "Módulos de alto rendimiento desarrollados en Go y Python para el procesamiento de Cursos y Asistencias, con comunicación asíncrona entre servicios.",
                tags: ["Go", "Python", "REST API"],
              },
              {
                img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
                icon: "☁️",
                title: "Entorno Cloud",
                desc: "Despliegue escalable en Amazon Web Services con auto-scaling, balanceo de carga y persistencia de datos garantizada en múltiples zonas.",
                tags: ["AWS EC2", "RDS", "S3"],
              },
              {
                img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=600&auto=format&fit=crop",
                icon: "🔒",
                title: "Seguridad JWT",
                desc: "Accesos y roles validados mediante JSON Web Tokens desde la pasarela principal del API Gateway, con refresh tokens y expiración controlada.",
                tags: ["JWT", "API Gateway", "OAuth"],
              },
            ].map((c, i) => (
              <div className="tech-card reveal" key={i} style={{ transitionDelay: `${i * 0.12}s` }}>
                <img src={c.img} alt={c.title} className="tech-card-img" />
                <div className="tech-card-body">
                  <div className="tech-card-icon">{c.icon}</div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <div className="tech-card-tag">
                    {c.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture Visual ── */}
      <section className="arch-section">
        <div className="arch-inner">
          <div className="reveal">
            <span className="section-label">Diagrama de Flujo</span>
            <h2 className="section-title">Arquitectura de<br />Microservicios</h2>
            <p className="section-sub">
              Cada servicio opera de forma autónoma con su propia base de datos,
              comunicándose mediante APIs RESTful a través de un API Gateway centralizado.
            </p>
            <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Despliegue continuo con CI/CD", "Rollback automático ante fallos", "Monitoreo y alertas en tiempo real", "Escalado horizontal por servicio"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "12px", color: "#555", fontSize: "0.95rem" }}>
                  <span style={{ color: "var(--gold)", fontWeight: "700", fontSize: "1.1rem" }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>

          <div className="arch-visual reveal" style={{ transitionDelay: "0.15s" }}>
            <div className="arch-row">
              <div className="arch-node gold">🌐 Cliente Web / Móvil</div>
            </div>
            <div style={{ textAlign: "center", color: "var(--gold)", margin: "4px 0" }}>↓</div>
            <div className="arch-row">
              <div className="arch-node gold">🔐 API Gateway + JWT</div>
            </div>
            <div className="arch-divider" />
            <div className="arch-row">
              <div className="arch-node">📚 Cursos</div>
              <div className="arch-connector">·</div>
              <div className="arch-node">✅ Asistencias</div>
              <div className="arch-connector">·</div>
              <div className="arch-node">👤 Usuarios</div>
            </div>
            <div style={{ textAlign: "center", color: "rgba(212,160,23,0.4)", margin: "10px 0 4px", fontSize: "0.8rem", letterSpacing: "1px" }}>BASE DE DATOS INDEPENDIENTE</div>
            <div className="arch-row">
              <div className="arch-node">🗄️ PostgreSQL</div>
              <div className="arch-connector">·</div>
              <div className="arch-node">🍃 MongoDB</div>
            </div>
            <div className="arch-divider" />
            <div className="arch-row">
              <div className="arch-node gold">☁️ AWS — Alta Disponibilidad</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Support / Contact ── */}
      <section id="soporte" className="support-section">
        <div className="support-inner">
          {/* Left info */}
          <div>
            <span className="section-label reveal">Mesa de Ayuda</span>
            <h2 className="support-info reveal" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.8rem", color: "var(--navy)", lineHeight: "1.2", margin: "0 0 18px" }}>
              ¿Problemas con<br />tu acceso?
            </h2>
            <p className="reveal" style={{ color: "#666", lineHeight: "1.7", marginBottom: "36px" }}>
              Completa el formulario y el equipo de ingeniería recibirá tu reporte
              directamente. Atendemos solicitudes en horario académico.
            </p>

            {[
              { icon: "📧", label: "Correo de soporte", value: "rodolfo.estrada@unach.mx" },
              { icon: "🏛️", label: "Institución", value: "Universidad Autónoma de Chiapas" },
              { icon: "⏰", label: "Tiempo de respuesta", value: "Menos de 24 horas hábiles" },
            ].map((c, i) => (
              <div className="contact-card reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="contact-icon">{c.icon}</div>
                <div>
                  <div className="contact-label">{c.label}</div>
                  <div className="contact-value">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="form-card reveal" style={{ transitionDelay: "0.2s" }}>
            {status === "success" ? (
              <div className="success-box">
                <div className="success-icon">✅</div>
                <h3>¡Reporte enviado!</h3>
                <p style={{ color: "#666", marginTop: "10px", lineHeight: "1.6" }}>
                  Tu cliente de correo se abrió con el reporte prellenado dirigido a
                  <strong> rodolfo.estrada@unach.mx</strong>. Si no se abrió automáticamente,
                  envíalo manualmente.
                </p>
                <button
                  onClick={() => { setStatus("idle"); setForm({ nombre: "", correo: "", tipo: "", descripcion: "" }); }}
                  style={{ marginTop: "24px", background: "none", border: "none", color: "var(--navy)", fontWeight: "700", cursor: "pointer", textDecoration: "underline", fontSize: "0.95rem" }}
                >
                  Enviar otro reporte
                </button>
              </div>
            ) : (
              <>
                <h3>Enviar Reporte Técnico</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre completo</label>
                      <input name="nombre" value={form.nombre} onChange={handleChange} className="form-input" placeholder="Tu nombre" required />
                    </div>
                    <div className="form-group">
                      <label>Correo institucional</label>
                      <input name="correo" value={form.correo} onChange={handleChange} className="form-input" type="email" placeholder="@unach.mx" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Tipo de problema</label>
                    <select name="tipo" value={form.tipo} onChange={handleChange} className="form-select" required>
                      <option value="">Selecciona una categoría…</option>
                      <option>Credenciales / Acceso</option>
                      <option>Error en el sistema</option>
                      <option>Problema con cursos</option>
                      <option>Problema con asistencias</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Descripción del problema</label>
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className={`form-input form-textarea`} placeholder="Describe con detalle lo que está ocurriendo, incluyendo pasos para reproducir el error…" required />
                  </div>
                  <button type="submit" className="btn-submit" disabled={status === "sending"}>
                    {status === "sending" ? "⏳ Preparando reporte…" : "📨 Enviar al equipo de soporte"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="logo">UNACH</div>
              <p>Sistema Integral de Gestión Académica — una plataforma moderna,
                escalable y segura diseñada para la comunidad universitaria de Chiapas.</p>
            </div>
            <div className="footer-col">
              <h4>Navegación</h4>
              <a href="#inicio">Inicio</a>
              <a href="#tecnologia">Arquitectura</a>
              <a href="#soporte">Mesa de Ayuda</a>
            </div>
            <div className="footer-col">
              <h4>Proyecto</h4>
              <a href="#tecnologia">Stack Tecnológico</a>
              <a href="#tecnologia">Seguridad JWT</a>
              <a href="#soporte">Contacto</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-credits">© 2026 Universidad Autónoma de Chiapas. Todos los derechos reservados.</span>
            <span className="footer-credits">
              Dirección del proyecto: <span className="footer-author">Rodolfo Yasir Estrada Gálvez</span> — Diseño de Software Escalable y Arquitectura Cloud
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}