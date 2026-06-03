import {
  useEffect,
  useState,
  useCallback,
} from "react";

import { useLocation } from "react-router-dom";
import { Trophy, Hand, Flag } from "lucide-react";

import {
  getPlayers,
  getRound,
  drawCard,
  standPlayer,
} from "../../services/gameService";

import PlayerBoard from "../../components/PlayerBoard/PlayerBoard";

import type {
  Player,
  RoundResponse,
  TurnResponse,
} from "../../services/types";

import "./GamePage.css";

export default function GamePage() {
  const location = useLocation();
  const gameId = location.state?.gameId;

  const [players, setPlayers] = useState<Player[]>([]);
  const [round, setRound] = useState<RoundResponse | null>(null);
  const [turnResult, setTurnResult] = useState<TurnResponse | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Carga datos del juego sin modificar currentPlayer
  const loadGame = useCallback(async (): Promise<void> => {
    if (!gameId) return;
    try {
      const playersData = await getPlayers(gameId);
      const roundData = await getRound(gameId);
      setPlayers(playersData);
      setRound(roundData);
    } catch (error) {
      console.error(error);
    }
  }, [gameId]); // ✅ currentPlayer NO está aquí

  // Inicialización: carga datos y setea el primer jugador activo
  useEffect(() => {
    if (!gameId) return;

    const initialize = async () => {
      try {
        const playersData = await getPlayers(gameId);
        const roundData = await getRound(gameId);
        setPlayers(playersData);
        setRound(roundData);

        // Primer jugador activo ordenado por turnOrder
        const firstActive = [...roundData.hands]
          .sort((a, b) => a.player.turnOrder - b.player.turnOrder)
          .find(hand => !hand.busted && !hand.stood);

        setCurrentPlayer(firstActive?.player ?? null);
      } catch (error) {
        console.error(error);
      }
    };

    void initialize();
  }, [gameId]); // solo al montar

  // Polling cada 2s solo para actualizar el estado visual
  useEffect(() => {
    if (!gameId) return;
    const interval = setInterval(() => { void loadGame(); }, 2000);
    return () => clearInterval(interval);
  }, [gameId, loadGame]);

  // Reaccionar al resultado de un turno
  useEffect(() => {
    if (!turnResult) return;

    console.log("TURN RESULT", turnResult);

    if (turnResult.status === "ROUND_FINISHED") {
      alert(`Round ${turnResult.roundNumber} finished`);
      setCurrentPlayer(null);
      return;
    }

    if (turnResult.status === "GAME_FINISHED") {
      alert(`Game Finished! Winner: ${turnResult.winner?.name}`);
      setCurrentPlayer(null);
      return;
    }

    // ✅ El backend dice quién es el siguiente jugador
    if (turnResult.currentPlayer) {
      setCurrentPlayer(turnResult.currentPlayer);
    } else {
      setCurrentPlayer(null);
    }

  }, [turnResult]);

  const handleDraw = async (): Promise<void> => {
    if (!currentPlayer) return;
    try {
      const result = await drawCard(gameId, currentPlayer.id);
      console.log("DRAW RESULT", result);
      setTurnResult(result);
      await loadGame();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStand = async (): Promise<void> => {
    if (!currentPlayer) return;
    try {
      const result = await standPlayer(gameId, currentPlayer.id);
      console.log("STAND RESULT", result);
      setTurnResult(result);
      await loadGame();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="game-page">
      <header className="game-header">
        <div>
          <h1 className="game-title">Flip7</h1>
          <p className="game-id">Game #{gameId}</p>
        </div>
        <div className="round-badge">Round {round?.roundNumber}</div>
      </header>

      <div style={{ background: "#1f2937", padding: "12px", borderRadius: "12px", marginBottom: "20px" }}>
        <strong>Current Player:</strong>{" "}
        {currentPlayer?.name ?? "Waiting..."}
        {turnResult?.event && (
          <>
            <br />
            <strong>Last Event:</strong> {turnResult.event}
          </>
        )}
      </div>

      <section className="game-layout">
        <aside className="leaderboard">
          <div className="leaderboard-title">
            <Trophy size={20} />
            <span>Players</span>
          </div>
          {players.map(player => (
            <div key={player.id} className="player-row">
              <span>{player.name}</span>
              <span>{player.totalScore}</span>
            </div>
          ))}
        </aside>

        <section className="game-table">
          <div className="table-center">
            <div className="deck-placeholder">DECK</div>
          </div>

          <div className="players-area">
            {round?.hands.map(hand => (
              <PlayerBoard key={hand.player.id} hand={hand} />
            ))}
          </div>

          <div className="actions">
            <button className="draw-btn" onClick={handleDraw} disabled={!currentPlayer}>
              <Hand size={20} />
              Draw
            </button>
            <button className="stand-btn" onClick={handleStand} disabled={!currentPlayer}>
              <Flag size={20} />
              Stand
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}