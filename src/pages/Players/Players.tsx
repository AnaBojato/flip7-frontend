// Players.tsx

import "./players.css";
import { useState } from "react";

import {
  ArrowLeft,
  Sailboat,
  Plus
} from "lucide-react";

const Players = () => {

  const [playerCount, setPlayerCount] =
    useState<number>(6);

  const players = Array.from(
    { length: playerCount },
    (_, index) => ({
      id: index + 1,
      name:
        index === 0
          ? "Monkey D. Luffy"
          : "",
      role:
        index === 0
          ? "Captain"
          : "Crew Member"
    })
  );

  return (
    <main className="players-page">

      {/* BACKGROUND */}
      <div className="background-overlay"></div>

      {/* CONTENT */}
      <section className="players-container">

        {/* TITLE */}
        <div className="players-title-section">

          <h1 className="players-title">
            ASSEMBLE YOUR CREW
          </h1>

          <div className="title-line"></div>

        </div>

        {/* SLIDER */}
        <div className="slider-section">

          <label className="slider-label">

            NUMBER OF PIRATES

            <span className="player-count">
              {playerCount}
            </span>

          </label>

          <div className="slider-container">

            <span className="slider-number">
              4
            </span>

            <input
              type="range"
              min="4"
              max="10"
              value={playerCount}
              className="player-slider"
              onChange={(e) =>
                setPlayerCount(
                  Number(e.target.value)
                )
              }
            />

            <span className="slider-number">
              10
            </span>

          </div>

        </div>

        {/* GRID */}
        <div className="players-grid">

          {players.map((player, index) => (

            <div
              className="player-card"
              key={player.id}
            >

              <div className="card-inner-border"></div>

              <span className="corner top-left">
                ◈
              </span>

              <span className="corner top-right">
                ◈
              </span>

              <span className="corner bottom-left">
                ◈
              </span>

              <span className="corner bottom-right">
                ◈
              </span>

              {/* AVATAR */}
              <div className="avatar-wrapper">

                <div className="avatar-container">

                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Pirate${index + 1}`}
                    alt="Pirate Avatar"
                    className="avatar-image"
                  />

                </div>

                {/* CHANGE AVATAR BUTTON */}
                <button className="change-avatar-button">

                  <Plus size={14} />

                </button>

                <div className="player-number">
                  #{player.id}
                </div>

              </div>

              {/* INPUT */}
              <div className="input-container">

                <input
                  type="text"
                  defaultValue={player.name}
                  placeholder={
                    index === 0
                      ? "Captain Name"
                      : "Crewmate Name"
                  }
                  className="player-input"
                />

              </div>

              {/* ROLE */}
              <span className="player-role">
                {player.role}
              </span>

            </div>

          ))}

        </div>

        {/* ACTIONS */}
        <div className="players-actions">

          <button className="back-button">

            <ArrowLeft size={16} />

            <span>
              ABANDON SHIP
            </span>

          </button>

          <button className="sail-button">

            <span>
              SET SAIL
            </span>

            <Sailboat size={18} />

          </button>

        </div>

      </section>

    </main>
  );
};

export default Players;