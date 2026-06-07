import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./mainMenu.css";

// Importación correcta de recursos desde src/assets
import thousandVideo from "../../assets/videos/thousand.mp4";
import logoInitImg from "../../assets/images/backgrounds/logoinit.png";

interface Star { id: number; x: number; y: number; size: number; delay: number; dur: number }
interface Wave { id: number; x: number; delay: number; dur: number; size: number }

export default function MainMenu() {
  const navigate  = useNavigate();
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  const [ready,   setReady]   = useState(false);
  const [stars,   setStars]   = useState<Star[]>([]);
  const [waves,   setWaves]   = useState<Wave[]>([]);
  const [clicked, setClicked] = useState<string | null>(null);

  /* ── Generate ambient decorations ── */
  useEffect(() => {
    setStars(
      Array.from({ length: 60 }, (_, i) => ({
        id:    i,
        x:     Math.random() * 100,
        y:     Math.random() * 55,
        size:  Math.random() * 2.5 + 0.5,
        delay: Math.random() * 5,
        dur:   Math.random() * 3 + 2,
      }))
    );
    setWaves(
      Array.from({ length: 8 }, (_, i) => ({
        id:   i,
        x:    Math.random() * 100,
        delay: i * 0.4,
        dur:  Math.random() * 2 + 3,
        size: Math.random() * 30 + 15,
      }))
    );
  }, []);

  /* ── Moonlight shimmer canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      /* Moonlight column on water */
      const mx = canvas.width * 0.72;
      const grad = ctx.createLinearGradient(mx, canvas.height * 0.5, mx, canvas.height);
      grad.addColorStop(0, "rgba(180,210,255,0.0)");
      grad.addColorStop(0.3, "rgba(180,210,255,0.06)");
      grad.addColorStop(0.6, "rgba(180,210,255,0.03)");
      grad.addColorStop(1, "rgba(180,210,255,0.0)");
      ctx.fillStyle = grad;

      const waveOffset = Math.sin(t) * 18;
      ctx.beginPath();
      ctx.moveTo(mx - 40 + waveOffset, canvas.height * 0.5);
      ctx.bezierCurveTo(
        mx - 80 + waveOffset, canvas.height * 0.65,
        mx + 80 - waveOffset, canvas.height * 0.75,
        mx + 40 - waveOffset, canvas.height
      );
      ctx.lineTo(mx - 40 + waveOffset, canvas.height);
      ctx.closePath();
      ctx.fill();

      /* Floating sparkles on water surface */
      for (let i = 0; i < 6; i++) {
        const sx = mx + Math.sin(t * 1.3 + i * 1.1) * (30 + i * 12);
        const sy = canvas.height * (0.55 + i * 0.04) + Math.sin(t + i) * 4;
        const a  = (Math.sin(t * 2 + i) + 1) / 2 * 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,230,255,${a})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  /* ── Button click ── */
  const handleClick = (key: string, action: () => void) => {
    setClicked(key);
    setTimeout(() => { setClicked(null); action(); }, 320);
  };

  /* ── Ripple ── */
  const [ripples, setRipples] = useState<{id:number;x:number;y:number;btn:string}[]>([]);
  const fireRipple = (e: React.MouseEvent<HTMLButtonElement>, btn: string) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(p => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top, btn }]);
    setTimeout(() => setRipples(p => p.filter(x => x.id !== id)), 900);
  };

  return (
    <div className="mm-root">

      {/* ── LOOPING VIDEO ── */}
      <video
        ref={videoRef}
        className="mm-video"
        src={thousandVideo}
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => setReady(true)}
      />

      {/* ── OVERLAYS ── */}
      <div className="mm-ov-base"   />  {/* dark ocean tint */}
      <div className="mm-ov-top"    />  {/* sky gradient top */}
      <div className="mm-ov-bottom" />  {/* water depth bottom */}
      <div className="mm-ov-left"   />  {/* left panel space */}
      <div className="mm-ov-vignette" />

      {/* ── CANVAS (moonlight shimmer) ── */}
      <canvas ref={canvasRef} className="mm-canvas" />

      {/* ── STARS overlay (CSS animated) ── */}
      <div className="mm-stars" aria-hidden="true">
        {stars.map(s => (
          <span
            key={s.id}
            className="mm-star"
            style={{
              left:               `${s.x}%`,
              top:                `${s.y}%`,
              width:              `${s.size}px`,
              height:             `${s.size}px`,
              animationDelay:     `${s.delay}s`,
              animationDuration:  `${s.dur}s`,
            }}
          />
        ))}
      </div>

      {/* ── WAVE SPARKLES ── */}
      <div className="mm-wave-sparkles" aria-hidden="true">
        {waves.map(w => (
          <span
            key={w.id}
            className="mm-wave-dot"
            style={{
              left:               `${w.x}%`,
              width:              `${w.size}px`,
              animationDelay:     `${w.delay}s`,
              animationDuration:  `${w.dur}s`,
            }}
          />
        ))}
      </div>

      {/* ── SCANLINES ── */}
      <div className="mm-scanlines" aria-hidden="true" />

      {/* ── CONTENT: logo top-left, buttons bottom-left ── */}
      <div className={`mm-ui ${ready ? "mm-ui--ready" : ""}`}>

        {/* LOGO — top left, above the sea horizon */}
        <div className="mm-logo-wrap">
          <img
            src={logoInitImg}
            alt="FLIP7 Grand Line Adventure"
            className="mm-logo"
            draggable={false}
          />
          <p className="mm-logo-sub">GRAND LINE ADVENTURE</p>
        </div>

        {/* BUTTONS — bottom left panel */}
        <nav className="mm-nav" aria-label="Main menu">

          {/* ── NEW JOURNEY ── primary */}
          <button
            className={`mm-btn mm-btn--primary ${clicked === "j" ? "mm-btn--fire" : ""}`}
            onClick={e => { fireRipple(e, "j"); handleClick("j", () => navigate("/players")); }}
          >
            <span className="mm-btn-rope mm-btn-rope--l" aria-hidden="true" />
            <span className="mm-btn-fill" />
            <span className="mm-btn-shine" />
            
            {/* El icono y el texto quedan como hijos directos para respetar el display: flex del CSS */}
            <svg className="mm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v13M5 10h14M5 10C5 15 8 18 12 20M19 10C19 15 16 18 12 20"/>
            </svg>
            <span className="mm-btn-text">NEW JOURNEY</span>
            
            <span className="mm-btn-rope mm-btn-rope--r" aria-hidden="true" />
            {ripples.filter(r => r.btn === "j").map(r => (
              <span key={r.id} className="mm-ripple" style={{ left: r.x, top: r.y }} />
            ))}
          </button>

          {/* ── MARINE ARCHIVES ── */}
          <button
            className={`mm-btn mm-btn--secondary ${clicked === "a" ? "mm-btn--fire" : ""}`}
            onClick={e => { fireRipple(e, "a"); handleClick("a", () => navigate("/archives")); }}
          >
            <span className="mm-btn-fill" />
            <span className="mm-btn-shine" />
            
            <svg className="mm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <span className="mm-btn-text">MARINE ARCHIVES</span>
            
            {ripples.filter(r => r.btn === "a").map(r => (
              <span key={r.id} className="mm-ripple" style={{ left: r.x, top: r.y }} />
            ))}
          </button>

          {/* ── MANUAL ── */}
          <button
            className={`mm-btn mm-btn--secondary ${clicked === "m" ? "mm-btn--fire" : ""}`}
            onClick={e => { fireRipple(e, "m"); handleClick("m", () => navigate("/manual")); }}
          >
            <span className="mm-btn-fill" />
            <span className="mm-btn-shine" />
            
            <svg className="mm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              <line x1="10" y1="7" x2="16" y2="7"/>
              <line x1="10" y1="11" x2="14" y2="11"/>
            </svg>
            <span className="mm-btn-text">MANUAL</span>
            
            {ripples.filter(r => r.btn === "m").map(r => (
              <span key={r.id} className="mm-ripple" style={{ left: r.x, top: r.y }} />
            ))}
          </button>

        </nav>
      </div>

      {/* ── AMBIENT ZZZ (sleeping ship easter egg) ── */}
      <div className="mm-zzz" aria-hidden="true">
        <span style={{ animationDelay: "0s" }}>z</span>
        <span style={{ animationDelay: "0.7s" }}>z</span>
        <span style={{ animationDelay: "1.4s" }}>Z</span>
      </div>

      {/* ── FRAME CORNERS ── */}
      <div className="mm-frame">
        <span className="mm-corner mm-corner--tl" />
        <span className="mm-corner mm-corner--tr" />
        <span className="mm-corner mm-corner--bl" />
        <span className="mm-corner mm-corner--br" />
      </div>

      {/* ── EDITION STAMP ── */}
      <span className="mm-stamp">GRAND LINE EDITION · v1.0</span>
    </div>
  );
}