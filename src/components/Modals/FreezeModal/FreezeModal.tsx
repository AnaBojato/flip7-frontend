import { Snowflake, UserCheck } from "lucide-react";
import "./FreezeModal.css";
import type { Player } from "../../../services/types";

type Props = {
  players: Player[];
  currentPlayerId: number;
  onSelect: (targetId: number) => void;
};

export default function FreezeModal({
  players,
  currentPlayerId,
  onSelect,
}: Props) {
  return (
    <div className="modal-overlay">
      <div className="game-modal">

        <div className="modal-header">
          <Snowflake size={22} className="modal-icon freeze-icon" />
          <h2>Freeze Card</h2>
        </div>

        <p>Choose a player to freeze for their next turn.</p>

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
                : <Snowflake size={16} />}
              {player.name}
              {player.id === currentPlayerId && " (You)"}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}