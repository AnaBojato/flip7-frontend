import "./MainMenu.css";

const MainMenu = () => {
  const handleNewGame = (): void => {
    console.log("Start new game");
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
          <h1 className="game-title">FLIP7</h1>

          <div className="subtitle-container">
            <div className="line"></div>

            <h2 className="game-subtitle">
              GRAND LINE ADVENTURE
            </h2>

            <div className="line"></div>
          </div>
        </div>

        {/* MAIN ACTIONS */}
        <div className="actions-container">
          <button
            className="primary-button parchment-button"
            onClick={handleNewGame}
            type="button"
          >
            <span className="button-icon">◎</span>

            <span className="button-text">
              NEW JOURNEY
            </span>
          </button>

          <div className="secondary-buttons">
            <button
              className="secondary-button parchment-button"
              onClick={handleArchives}
              type="button"
            >
              <span className="secondary-icon">☰</span>

              <span className="secondary-text">
                MARINE
                <br />
                ARCHIVES
              </span>
            </button>

            <button
              className="secondary-button parchment-button"
              onClick={handleManual}
              type="button"
            >
              <span className="secondary-icon">☷</span>

              <span className="secondary-text">
                MANUAL
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* DECORATION */}
      <div className="compass-decoration">
        <div className="compass-circle">
          <div className="compass-inner-circle"></div>

          <span className="compass-icon">
            ▲
          </span>

          <span className="north-letter">N</span>
        </div>
      </div>

      <div className="coins-decoration">
        <div className="coin large-coin">B</div>
        <div className="coin small-coin">B</div>
      </div>
    </main>
  );
};

export default MainMenu;