import "./menuButton.css";

import type { LucideIcon } from "lucide-react";

interface MenuButtonProps {
  text: string;
  icon: LucideIcon;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

function MenuButton({
  text,
  icon: Icon,
  variant = "primary",
  onClick,
}: MenuButtonProps) {
  return (
    <button
      className={`menu-button ${variant}-button`}
      onClick={onClick}
      type="button"
    >
      <div className="menu-button-overlay"></div>

      <Icon className="menu-icon" />

      <span className={`${variant}-text`}>
        {text}
      </span>
    </button>
  );
}

export default MenuButton;