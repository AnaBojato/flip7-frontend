// components/PlayerBoard/PlayerBoard.tsx
import img1  from "../../assets/characters/img1.jpg";
import img2  from "../../assets/characters/img2.jpg";
import img3  from "../../assets/characters/img3.jpg";
import img4  from "../../assets/characters/img4.jpg";
import img5  from "../../assets/characters/img5.jpg";
import img6  from "../../assets/characters/img6.jpg";
import img7  from "../../assets/characters/img7.jpg";
import img8  from "../../assets/characters/img8.jpg";
import img9  from "../../assets/characters/img9.jpg";
import img10 from "../../assets/characters/img10.jpg";

import { getCardImage } from "../../utils/cardImages";
import type { PlayerHand, Card } from "../../services/types";
import "./PlayerBoard.css";

const characterImages: string[] = [
  img1, img2, img3, img4, img5,
  img6, img7, img8, img9, img10,
];

type Props = {
  hand: PlayerHand;
  isActive?: boolean;
  isCurrentUser?: boolean;
  /** índice 0-based del jugador en el array players[] — determina el avatar */
  playerIndex?: number;
};

export default function PlayerBoard({
  hand,
  isActive = false,
  isCurrentUser = false,
  playerIndex = 0,
}: Props) {
  const { player, cards, busted, stood } = hand;

  const avatarSrc = characterImages[playerIndex % characterImages.length];

  const statusLabel = busted ? "Busted" : stood ? "Stood" : isActive ? "Playing" : "Waiting";
  const statusCls   = busted ? "busted" : stood ? "stood"  : isActive ? "active"  : "waiting";

  return (
    <div className={[
      "pb",
      isActive      ? "pb--active" : "",
      busted        ? "pb--busted" : "",
      stood         ? "pb--stood"  : "",
      isCurrentUser ? "pb--you"    : "",
    ].filter(Boolean).join(" ")}>

      <div className="pb-header">
        <div className="pb-avatar-wrap">
          <img src={avatarSrc} alt={player.name} className="pb-avatar" />
          {isActive && <span className="pb-avatar-ring" />}
        </div>

        <div className="pb-info">
          <span className="pb-name">
            {isCurrentUser ? "YOU" : player.name}
          </span>
          <span className={`pb-status pb-status--${statusCls}`}>
            {statusLabel === "Playing" && <span className="pb-dot" />}
            {statusLabel}
          </span>
        </div>

        <div className="pb-score">{player.totalScore}</div>
      </div>

      {cards.length > 0 && (
        <div className="pb-cards">
          {cards.map((card: Card, i: number) => (
            <img
              key={`${card.id}-${i}`}
              className="pb-card-img"
              src={getCardImage(card.cardType, card.numericValue)}
              alt={card.cardType === "NUMERIC" ? String(card.numericValue) : card.cardType}
              title={card.cardType === "NUMERIC" ? String(card.numericValue) : card.cardType}
            />
          ))}
        </div>
      )}

    </div>
  );
}