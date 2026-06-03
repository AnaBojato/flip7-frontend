import {
  Skull,
  Hand,
  Trophy
} from "lucide-react";

import { getCardImage } from "../../utils/cardImages";

import type {
  PlayerHand,
  Card
} from "../../services/types";

import "./PlayerBoard.css";

type Props = {
  hand: PlayerHand;
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

            <span>Stand</span>

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
          (card: Card) => (

            <img
              key={card.id}
              className="card-image"
              src={getCardImage(
                card.cardType,
                card.numericValue
              )}
              alt={card.cardType}
            />

          )
        )}

      </div>

    </div>

  );
}