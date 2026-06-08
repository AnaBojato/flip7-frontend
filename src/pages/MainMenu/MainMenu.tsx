import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./mainMenu.css";

import thousandVideo from "../../assets/videos/thousand.mp4";
import logoInitImg   from "../../assets/images/backgrounds/logoinit.png";
import journeyImg    from "../../assets/images/buttons/journey.png";
import archivesImg   from "../../assets/images/buttons/archives.png";
import manualImg     from "../../assets/images/buttons/manual.png";

interface Star { id: number; x: number; y: number; size: number; delay: number; dur: number }
interface Wave  { id: number; x: number; delay: number; dur: number; size: number }

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
        id:    i,
        x:     Math.random() * 100,
        delay: i * 0.4,
        dur:   Math.random() * 2 + 3,
        size:  Math.random() * 30 + 15,
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

      const mx = canvas.width * 0.72;
      const grad = ctx.createLinearGradient(mx, canvas.height * 0.5, mx, canvas.height);
      grad.addColorStop(0,   "rgba(180,210,255,0.0)");
      grad.addColorStop(0.3, "rgba(180,210,255,0.06)");
      grad.addColorStop(0.6, "rgba(180,210,255,0.03)");
      grad.addColorStop(1,   "rgba(180,210,255,0.0)");
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
      <div className="mm-ov-base"    />
      <div className="mm-ov-top"     />
      <div className="mm-ov-bottom"  />
      <div className="mm-ov-left"    />
      <div className="mm-ov-vignette"/>

      {/* ── CANVAS (moonlight shimmer) ── */}
      <canvas ref={canvasRef} className="mm-canvas" />

      {/* ── STARS overlay ── */}
      <div className="mm-stars" aria-hidden="true">
        {stars.map(s => (
          <span
            key={s.id}
            className="mm-star"
            style={{
              left:              `${s.x}%`,
              top:               `${s.y}%`,
              width:             `${s.size}px`,
              height:            `${s.size}px`,
              animationDelay:    `${s.delay}s`,
              animationDuration: `${s.dur}s`,
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
              left:              `${w.x}%`,
              width:             `${w.size}px`,
              animationDelay:    `${w.delay}s`,
              animationDuration: `${w.dur}s`,
            }}
          />
        ))}
      </div>

      {/* ── SCANLINES ── */}
      <div className="mm-scanlines" aria-hidden="true" />

      {/* ── CONTENT ── */}
      <div className={`mm-ui ${ready ? "mm-ui--ready" : ""}`}>

        {/* LOGO */}
        <div className="mm-logo-wrap">
          <img
            src={logoInitImg}
            alt="FLIP7 Grand Line Adventure"
            className="mm-logo"
            draggable={false}
          />
          <p className="mm-logo-sub">GRAND LINE ADVENTURE</p>
        </div>

        {/* IMAGE BUTTONS */}
        <nav className="mm-nav" aria-label="Main menu">

          <button
            className={`mm-imgbtn ${clicked === "j" ? "mm-imgbtn--fire" : ""}`}
            onClick={() => handleClick("j", () => navigate("/players"))}
            aria-label="New Journey"
          >
            <img src={journeyImg} alt="New Journey" draggable={false} />
          </button>

          <button
            className={`mm-imgbtn ${clicked === "a" ? "mm-imgbtn--fire" : ""}`}
            onClick={() => handleClick("a", () => navigate("/archives"))}
            aria-label="Marine Archives"
          >
            <img src={archivesImg} alt="Marine Archives" draggable={false} />
          </button>

          <button
            className={`mm-imgbtn ${clicked === "m" ? "mm-imgbtn--fire" : ""}`}
            onClick={() => handleClick("m", () => navigate("/manual"))}
            aria-label="Manual"
          >
            <img src={manualImg} alt="Manual" draggable={false} />
          </button>

        </nav>
      </div>

      {/* ── AMBIENT ZZZ ── */}
      <div className="mm-zzz" aria-hidden="true">
        <span style={{ animationDelay: "0s"   }}>z</span>
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