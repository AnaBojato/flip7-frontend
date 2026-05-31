import "./mainMenu.css";
import { useNavigate } from "react-router-dom";

import MenuButton from "../../components/MenuButton/MenuButton";

import {
  Compass,
  BookOpen,
  ScrollText,
} from "lucide-react";

const MainMenu = () => {
  const navigate = useNavigate();
  const handleNewGame = (): void => {
    navigate("/players");
  };

  const handleArchives = (): void => {
    console.log("Open archives");
  };

  const handleManual = (): void => {
    console.log("Open manual");
  };

  return (
    <main className="main-menu">
      <div className="background-overlay"></div>

      <section className="menu-container">
        {/* TITLE */}
        <div className="title-section floating">
          <h1 className="game-title">
            FLIP7
          </h1>

          <div className="subtitle-container">
            <div className="line"></div>

            <h2 className="game-subtitle">
              GRAND LINE ADVENTURE
            </h2>

            <div className="line"></div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="actions-container">
          <MenuButton
            text="NEW JOURNEY"
            icon={Compass}
            variant="primary"
            onClick={handleNewGame}
          />

          <div className="secondary-buttons">
            <MenuButton
              text="MARINE ARCHIVES"
              icon={ScrollText}
              variant="secondary"
              onClick={handleArchives}
            />

            <MenuButton
              text="MANUAL"
              icon={BookOpen}
              variant="secondary"
              onClick={() => navigate("/manual")}
            />
          </div>
        </div>
      </section>

      {/* DECORATIONS */}
      <div className="compass-decoration">
        <div className="compass-circle">
  <div className="compass-inner-circle"></div>

  <Compass
    className="compass-icon-svg"
    size={52}
  />

  <span className="north-letter">N</span>
  <span className="east-letter">E</span>
  <span className="south-letter">S</span>
  <span className="west-letter">W</span>
</div>
      </div>
    </main>
  );
};

export default MainMenu;