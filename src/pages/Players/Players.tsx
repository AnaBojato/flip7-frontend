import { useNavigate } from "react-router-dom";
import "./players.css";
import { useState } from "react";

import {
  ArrowLeft,
  Sailboat
} from "lucide-react";

import img1 from "../../assets/characters/img1.jpg";
import img2 from "../../assets/characters/img2.jpg";
import img3 from "../../assets/characters/img3.jpg";
import img4 from "../../assets/characters/img4.jpg";
import img5 from "../../assets/characters/img5.jpg";
import img6 from "../../assets/characters/img6.jpg";
import img7 from "../../assets/characters/img7.jpg";
import img8 from "../../assets/characters/img8.jpg";
import img9 from "../../assets/characters/img9.jpg";
import img10 from "../../assets/characters/img10.jpg";

const characterImages = [
  img1,
  img2,
  img3,
  img4,
  img5,
  img6,
  img7,
  img8,
  img9,
  img10
];

const Players = () => {

  const navigate = useNavigate();

  const [playerCount, setPlayerCount] =
    useState<number>(6);

  const players = Array.from(
    { length: playerCount },
    (_, index) => ({
      id: index + 1,
      name: "",
      role: "Crew Member",
      avatar: characterImages[index]
    })
  );

  return (
    <main className="players-page">

      <div className="background-overlay"></div>

      <section className="players-container">

        <div className="players-title-section">

          <h1 className="players-title">
            ASSEMBLE YOUR CREW
          </h1>

          <div className="title-line"></div>

        </div>

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

        <div className="players-grid">

          {players.map((player) => (

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

              <div className="avatar-wrapper">

                <div className="avatar-container">

                  <img
                    src={player.avatar}
                    alt={`Player ${player.id}`}
                    className="avatar-image"
                  />

                </div>

                <div className="player-number">
                  #{player.id}
                </div>

              </div>

              <div className="input-container">

                <input
                  type="text"
                  placeholder={`Player ${player.id}`}
                  className="player-input"
                />

              </div>

              <span className="player-role">
                {player.role}
              </span>

            </div>

          ))}

        </div>

        <div className="players-actions">

          <button
            className="back-button"
            onClick={() => navigate("/")}
          >

            <ArrowLeft size={16} />

            <span>
              ABANDON SHIP
            </span>

          </button>

          <button
            className="sail-button"
            onClick={() => navigate("/game")}
          >

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