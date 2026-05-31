import "./manualPage.css";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Trophy,
  AlertTriangle,
  Layers3,
  Star,
} from "lucide-react";

import ManualSection from "../../components/ManualSection/ManualSection";
import RuleCard from "../../components/RuleCard/RuleCard";
import GameCard from "../../components/GameCard/GameCard";

import card3 from "../../assets/cards/normalCards/card3.svg";
import card7 from "../../assets/cards/normalCards/card7.svg";
import card12 from "../../assets/cards/normalCards/card12.svg";

import freeze from "../../assets/cards/specialCards/freeze.svg";
import flipThree from "../../assets/cards/specialCards/flipThree.svg";
import secondChance from "../../assets/cards/specialCards/secondChance.svg";

function ManualPage() {
  const navigate = useNavigate();

  return (
    <main className="manual-page">

      <div className="manual-background-overlay"></div>

      <button
        className="manual-back-button"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        BACK
      </button>

      <div className="manual-container">

        {/* HERO */}

        <section className="manual-hero floating">

          <div className="hero-glow"></div>

          <span className="manual-tag">
            GRAND LINE RULEBOOK
          </span>

          <h1 className="manual-title">
            FLIP7
          </h1>

          <h2 className="manual-subtitle">
            MASTER THE SEA OF LUCK,
            RISK AND STRATEGY
          </h2>

          <p className="manual-description">
            Draw cards, survive dangerous rounds,
            avoid duplicated numbers
            and become the pirate
            with the highest score.
          </p>

          <div className="manual-stats">

            <div className="manual-stat-card">
              <Layers3 size={18} />
              <span>UNIQUE DECK SYSTEM</span>
            </div>

            <div className="manual-stat-card">
              <AlertTriangle size={18} />
              <span>HIGH RISK GAMEPLAY</span>
            </div>

            <div className="manual-stat-card">
              <Trophy size={18} />
              <span>FIRST TO 200 POINTS</span>
            </div>

          </div>
        </section>

        {/* HOW TO PLAY */}

        <ManualSection title="HOW TO PLAY">

          <div className="manual-grid">

            <RuleCard
              title="DRAW OR STAND"
              description="
                During your turn
                you must decide
                if you continue drawing cards
                or stand to secure your score.
              "
            />

            <RuleCard
              title="DUPLICATED CARDS"
              description="
                If you draw a repeated number
                during the same round,
                you instantly lose
                all round points.
              "
            />

            <RuleCard
              title="ROUND END"
              description="
                A round ends when a player
                reaches 7 unique cards
                or all players stand or bust.
              "
            />

            <RuleCard
              title="ROTATING TURNS"
              description="
                Each new round rotates
                the starting player
                to the left.
              "
            />

          </div>

        </ManualSection>

        {/* DECK */}

        <ManualSection title="THE FLIP7 DECK">

          <div className="manual-info-panel">

            <div className="manual-info-content">

              <h3>
                UNIQUE CARD DISTRIBUTION
              </h3>

              <p>
                Flip7 uses a special deck system.
              </p>

              <p>
                The amount of copies
                depends on the number itself.
              </p>

              <ul className="manual-list">
                <li>One card "0"</li>
                <li>One card "1"</li>
                <li>Two cards "2"</li>
                <li>Three cards "3"</li>
                <li>And so on...</li>
              </ul>

            </div>

            <div className="manual-number-showcase">

              <GameCard
                image={card3}
                title="LOW RISK"
                description="
                  Safer cards
                  with smaller rewards.
                "
              />

              <GameCard
                image={card7}
                title="BALANCED"
                description="
                  Medium value cards
                  offer solid scoring opportunities.
                "
              />

              <GameCard
                image={card12}
                title="HIGH RISK"
                description="
                  Massive points,
                  but highly dangerous duplicates.
                "
              />

            </div>

          </div>

        </ManualSection>

        {/* SCORING */}

        <ManualSection title="SCORING SYSTEM">

          <div className="manual-scoring-grid">

            <div className="score-panel gold-glow">

              <Star size={28} />

              <h3>ROUND POINTS</h3>

              <p>
                The value of your unique cards
                becomes your round score.
              </p>

            </div>

            <div className="score-panel gold-glow">

              <Trophy size={28} />

              <h3>FLIP7 BONUS</h3>

              <p>
                Completing 7 unique cards
                grants an additional
                15 point bonus.
              </p>

            </div>

            <div className="score-panel gold-glow">

              <AlertTriangle size={28} />

              <h3>BUST</h3>

              <p>
                Duplicated cards instantly
                reduce your round score to zero.
              </p>

            </div>

          </div>

        </ManualSection>

        {/* SPECIAL CARDS */}

        <ManualSection title="SPECIAL CARDS">

          <p className="manual-section-text">
            Special cards immediately affect
            the flow of the round
            and can completely change
            the outcome of the game.
          </p>

          <div className="manual-special-grid">

            <GameCard
              image={freeze}
              title="FREEZE"
              description="
                Forces a player
                to stand immediately.
              "
            />

            <GameCard
              image={flipThree}
              title="FLIP THREE"
              description="
                Forces a player
                to draw 3 consecutive cards.
              "
            />

            <GameCard
              image={secondChance}
              title="SECOND CHANCE"
              description="
                Allows one duplicated card
                to be discarded safely.
              "
            />

          </div>

        </ManualSection>

        {/* WIN CONDITION */}

        <ManualSection title="HOW TO WIN">

          <div className="victory-panel">

            <Trophy
              size={90}
              className="victory-icon"
            />

            <div>

              <h3>
                REACH 200 POINTS
              </h3>

              <p>
                The match ends once a player
                reaches at least 200 points.
              </p>

              <p>
                The player with the highest score
                becomes the winner
                of the Grand Line.
              </p>

            </div>

          </div>

        </ManualSection>

      </div>

    </main>
  );
}

export default ManualPage;