import {
  Skull,
  Hand,
  Trophy
} from "lucide-react";

import "./PlayerBoard.css";

type Props = {
  hand: any;
};

export default function PlayerBoard({
  hand
}: Props) {

  return (

    <div className="player-board">

      <div className="player-header">

        <h3>
          {hand.player.name}
        </h3>

        <span className="player-score">
          {hand.scoreEarned}
        </span>

      </div>

      <div className="player-status">

        {hand.busted && (

          <div className="status busted">

            <Skull size={16} />

            <span>Busted</span>

          </div>

        )}

        {hand.stood && (

          <div className="status stood">

            <Hand size={16} />

            <span>Stood</span>

          </div>

        )}

        {!hand.busted && !hand.stood && (

          <div className="status active">

            <Trophy size={16} />

            <span>Playing</span>

          </div>

        )}

      </div>

      <div className="cards-container">

        {hand.cards.map(
          (card: any, index: number) => (

            <div
              key={index}
              className="game-card"
            >

              {card.cardType === "NUMERIC"
                ? card.numericValue
                : card.cardType}

            </div>

          )
        )}

      </div>

    </div>

  );
}