import { RefreshCw, UserCheck } from "lucide-react";
import "./FlipThreeModal.css";
import type { Player } from "../../../services/types";

type Props = {
  players: Player[];
  currentPlayerId: number;
  onSelect: (targetId: number) => void;
};

export default function FlipThreeModal({
  players,
  currentPlayerId,
  onSelect,
}: Props) {
  return (
    <div className="modal-overlay">
      <div className="game-modal">

        <div className="modal-header">
          <RefreshCw size={22} className="modal-icon flipthree-icon" />
          <h2>Flip Three</h2>
        </div>

        <p>Choose who receives three forced draws.</p>

        <div className="modal-players">
          {players.map(player => (
            <button
              key={player.id}
              className={`player-option ${
                player.id === currentPlayerId ? "self" : ""
              }`}
              onClick={() => onSelect(player.id)}
            >
              {player.id === currentPlayerId
                ? <UserCheck size={16} />
                : <RefreshCw size={16} />}
              {player.name}
              {player.id === currentPlayerId && " (You)"}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}