import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  Trophy,
  Hand,
  Flag,
} from "lucide-react";

import {
  getPlayers,
  getRound,
  drawCard,
  standPlayer,
} from "../../services/gameService";

import PlayerBoard from "../../components/PlayerBoard/PlayerBoard";

import "./GamePage.css";

export default function GamePage() {

  const location = useLocation();

  const gameId = location.state?.gameId;

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

  const activeHand =
    round?.hands?.find(
      (hand: any) =>
        !hand.stood &&
        !hand.busted
    );

  const handleDraw = async () => {

    if (!activeHand) return;

    try {

      await drawCard(
        gameId,
        activeHand.player.id
      );

      await loadGame();

    } catch (error) {

      console.error(error);

    }

  };

  const handleStand = async () => {

    if (!activeHand) return;

    try {

      await standPlayer(
        gameId,
        activeHand.player.id
      );

      await loadGame();

    } catch (error) {

      console.error(error);

    }

  };

  return (

    <main className="game-page">

      <header className="game-header">

        <div>

          <h1 className="game-title">
            Flip7
          </h1>

          <p className="game-id">
            Game #{gameId}
          </p>

        </div>

        <div className="round-badge">

          Round {round?.roundNumber}

        </div>

      </header>

      <section className="game-layout">

        <aside className="leaderboard">

          <div className="leaderboard-title">

            <Trophy size={20} />

            <span>
              Players
            </span>

          </div>

          {players.map((player) => (

            <div
              key={player.id}
              className="player-row"
            >

              <span>
                {player.name}
              </span>

              <span>
                {player.totalScore}
              </span>

            </div>

          ))}

        </aside>

        <section className="game-table">

          <div className="table-center">

            <div className="deck-placeholder">
              DECK
            </div>

          </div>

          <div className="players-area">

            {round?.hands?.map(
              (hand: any) => (

                <PlayerBoard
                  key={hand.player.id}
                  hand={hand}
                />

              )
            )}

          </div>

          <div className="actions">

            <button
              className="draw-btn"
              onClick={handleDraw}
              disabled={!activeHand}
            >

              <Hand size={20} />

              Draw

            </button>

            <button
              className="stand-btn"
              onClick={handleStand}
              disabled={!activeHand}
            >

              <Flag size={20} />

              Stand

            </button>

          </div>

        </section>

      </section>

    </main>

  );

}