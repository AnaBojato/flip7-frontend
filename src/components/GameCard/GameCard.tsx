import "./gameCard.css";

type GameCardProps = {
  image: string;
  title?: string;
  description?: string;
};

function GameCard({
  image,
  title,
  description,
}: GameCardProps) {
  return (
    <div className="game-card">
      <img
        src={image}
        alt={title}
        className="game-card-image"
      />

      {title && (
        <h3 className="game-card-title">
          {title}
        </h3>
      )}

      {description && (
        <p className="game-card-description">
          {description}
        </p>
      )}
    </div>
  );
}

export default GameCard;