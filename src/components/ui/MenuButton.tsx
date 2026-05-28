import type { LucideIcon } from "lucide-react";

interface MenuButtonProps {
  text: string;
  icon: LucideIcon;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

const MenuButton = ({
  text,
  icon: Icon,
  variant = "primary",
  onClick
}: MenuButtonProps) => {
  return (
    <button
      className={`parchment-button ${variant}-button`}
      onClick={onClick}
      type="button"
    >
      <Icon className="menu-icon" />

      <span className={`${variant}-text`}>
        {text}
      </span>
    </button>
  );
};

export default MenuButton;