import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  getPlayers,
  getRound
} from "../../services/gameService";

import "./gamePage.css";

export default function GamePage() {

  const location = useLocation();

  const gameId = location.state?.gameId;

  const [players, setPlayers] = useState<any[]>([]);
  const [round, setRound] = useState<any>(null);

  useEffect(() => {

    if (!gameId) return;

    loadGame();

  }, [gameId]);

  const loadGame = async () => {

    try {

      const playersData =
        await getPlayers(gameId);

      const roundData =
        await getRound(gameId);

      setPlayers(playersData);
      setRound(roundData);

    } catch (error) {

      console.error(error);

    }
  };

  return (

    <main style={{ padding: "20px" }}>

      <h1>Flip 7</h1>

      <h2>Game #{gameId}</h2>

      <h3>Players</h3>

      {players.map(player => (

        <div key={player.id}>

          {player.name}
          {" - "}
          Score:
          {" "}
          {player.totalScore}

        </div>

      ))}

      <hr />

      <h3>Round Info</h3>

      {round && (

        <>
          <p>
            Round:
            {" "}
            {round.roundNumber}
          </p>

          <p>
            Status:
            {" "}
            {round.status}
          </p>
        </>

      )}

    </main>

  );
}