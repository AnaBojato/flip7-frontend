// components/PlayerBoard/PlayerBoard.tsx
import { Skull, Hand, Trophy } from "lucide-react";
//import { getCardImage } from "../../utils/cardImages";
import type { PlayerHand, Card } from "../../services/types";
import "./PlayerBoard.css";

type Props = {
  hand: PlayerHand;
  isActive?: boolean;
  isCurrentUser?: boolean;
};

function cardTypeIcon(cardType: string) {
  switch (cardType) {
    case "FREEZE":        return "❄";
    case "FLIP_THREE":    return "🔄";
    case "SECOND_CHANCE": return "🛡";
    case "MULTIPLIER":    return "×2";
    default:              return "?";
  }
}

export default function PlayerPanel({ hand, isActive = false, isCurrentUser = false }: Props) {
  const statusCls = hand.busted ? "busted" : hand.stood ? "stood" : "active";

  return (
    <div className={[
      "player-board",
      isActive      ? "player-board--active" : "",
      isCurrentUser ? "player-board--you"    : "",
      hand.busted   ? "player-board--busted" : "",
      hand.stood    ? "player-board--stood"  : "",
    ].filter(Boolean).join(" ")}>

      {/* Header row */}
      <div className="player-header">
        <div className="player-info">
          <span className="player-name">
            {isCurrentUser ? "YOU" : hand.player.name}
          </span>
          <div className={`player-status-badge ${statusCls}`}>
            {hand.busted && <><Skull size={11} /> Bust</>}
            {hand.stood  && <><Hand  size={11} /> Stand</>}
            {!hand.busted && !hand.stood && <><Trophy size={11} /> Playing</>}
          </div>
        </div>
        <span className="player-score">{hand.scoreEarned}</span>
      </div>

      {/* Cards row */}
      {hand.cards.length > 0 && (
        <div className="cards-container">
          {hand.cards.map((card: Card, ci: number) => (
            <div
              key={`${card.id}-${ci}`}
              className={`panel-card panel-card--${card.cardType.toLowerCase()}`}
              title={card.cardType === "NUMERIC" ? String(card.numericValue) : card.cardType}
            >
              {card.cardType === "NUMERIC"
                ? card.numericValue
                : cardTypeIcon(card.cardType)}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}