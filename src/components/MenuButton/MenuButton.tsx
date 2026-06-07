import "./menuButton.css";
import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

interface MenuButtonProps {
  text: string;
  icon: LucideIcon;
  variant?: "primary" | "secondary";
  character?: string;
  onClick?: () => void;
}

function MenuButton({
  text,
  icon: Icon,
  variant = "primary",
  character = "sunny",
  onClick,
}: MenuButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [clicked, setClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = btnRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800);

    setClicked(true);
    setTimeout(() => setClicked(false), 600);

    onClick?.();
  };

  return (
    <button
      ref={btnRef}
      className={`mbtn mbtn--${variant} mbtn--${character} ${clicked ? "mbtn--clicked" : ""}`}
      onClick={handleClick}
      type="button"
    >
      {/* Animated border line */}
      <span className="mbtn-border mbtn-border--top"    aria-hidden="true" />
      <span className="mbtn-border mbtn-border--right"  aria-hidden="true" />
      <span className="mbtn-border mbtn-border--bottom" aria-hidden="true" />
      <span className="mbtn-border mbtn-border--left"   aria-hidden="true" />

      {/* Glow layer */}
      <span className="mbtn-glow" aria-hidden="true" />

      {/* Ripples on click */}
      {ripples.map(r => (
        <span
          key={r.id}
          className="mbtn-ripple"
          style={{ left: r.x, top: r.y }}
          aria-hidden="true"
        />
      ))}

      {/* Shimmer sweep */}
      <span className="mbtn-shimmer" aria-hidden="true" />

      {/* Content */}
      <span className="mbtn-inner">
        <span className="mbtn-icon-wrap">
          <Icon className="mbtn-icon" size={20} />
        </span>
        <span className="mbtn-text">{text}</span>
        {variant === "primary" && (
          <span className="mbtn-arrow" aria-hidden="true">›</span>
        )}
      </span>
    </button>
  );
}

export default MenuButton;