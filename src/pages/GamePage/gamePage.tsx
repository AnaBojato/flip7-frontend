import {
  useEffect,
  useState
} from "react";

import {
  useLocation
} from "react-router-dom";

import {
  getPlayers,
  getRound
} from "../../services/gameService";

import PlayerBoard
  from "../../components/PlayerBoard/PlayerBoard";

import "./GamePage.css";

export default function GamePage() {

  const location = useLocation();

  const gameId =
    location.state?.gameId;

  const [players, setPlayers] =
    useState<any[]>([]);

  const [round, setRound] =
    useState<any>(null);

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

    <main className="game-page">

      <div className="game-header">

        <h1>
          Flip 7
        </h1>

        <div className="game-info">

          <span>
            Game #{gameId}
          </span>

          <span>
            Round {round?.roundNumber}
          </span>

        </div>

      </div>

      <div className="players-grid">

        {round?.hands?.map(
          (hand: any) => (

            <PlayerBoard
              key={hand.player.id}
              hand={hand}
            />

          )
        )}

      </div>

    </main>

  );
}