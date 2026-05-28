import { useNavigate } from "react-router-dom";

import ManualSection from "../../components/ManualSection/ManualSection";
import RuleCard from "../../components/RuleCard/RuleCard";

import "./manualPage.css";
import { ArrowLeft } from "lucide-react";

function ManualPage() {
  const navigate = useNavigate();

  return (
    <div className="manual-page">
      <div className="manual-container">

        <h1 className="manual-title">
          FLIP7 MANUAL
        </h1>

        <p className="manual-subtitle">
          Learn the Pirate Code before sailing into the Grand Line.
        </p>

        <ManualSection title="WELCOME TO THE FLIP7 GRAND LINE">
          <p>
            Fortune rewards the brave,
            but greed destroys careless pirates.
          </p>

          <p>
            Draw cards, collect treasure,
            and survive the dangers of the sea.
          </p>
        </ManualSection>

        <ManualSection title="CORE GAMEPLAY & RULES">
          <RuleCard
            title="DRAW OR STAND"
            description="
              During your turn you may continue drawing cards
              or stand to secure your current score.
            "
          />

          <RuleCard
            title="BUST"
            description="
              If you draw a duplicated numerical card
              during the same round,
              you lose all round points instantly.
            "
          />

          <RuleCard
            title="ROUND END"
            description="
              The round ends when a player reaches
              7 unique cards or every player stands or busts.
            "
          />

          <RuleCard
            title="THE DECK"
            description="
              The deck follows the original Flip7 distribution:
              one 0, one 1, two 2s, three 3s and so on.
            "
          />

          <RuleCard
            title="WIN CONDITION"
            description="
              Reach 200 points.
              The player with the highest score wins the match.
            "
          />
        </ManualSection>

        <ManualSection title="SPECIAL CARDS">
          <RuleCard
            title="AOKIJI'S ICE AGE"
            description="
              Forces the player to Stand immediately.
            "
          />

          <RuleCard
            title="GOMU GOMU NO GATLING"
            description="
              Forces the player to draw
              3 consecutive cards.
            "
          />

          <RuleCard
            title="BROOK'S REVIVE-REVIVE FRUIT"
            description="
              Allows a duplicated numerical card
              to be discarded once.
            "
          />
        </ManualSection>

        <ManualSection title="MARINE ARCHIVES">
          <p>
            The Marines record every voyage.
          </p>

          <p>
            Match winners and round scores
            are permanently stored for future analysis.
          </p>
        </ManualSection>

        <button
          className="manual-back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
        </button>
      </div>
    </div>
  );
}

export default ManualPage;