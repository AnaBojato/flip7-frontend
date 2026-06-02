import { getCardImage } from "../../utils/cardImages";
import "./flip7Card.css";

interface Flip7CardProps {
  cardType: string;
  numericValue?: number;
}

function Flip7Card({
  cardType,
  numericValue,
}: Flip7CardProps) {
  return (
    <div className="flip7-card">
      <img
        src={getCardImage(cardType, numericValue)}
        alt={`${cardType}-${numericValue ?? ""}`}
        className="flip7-card-image"
      />
    </div>
  );
}

export default Flip7Card;