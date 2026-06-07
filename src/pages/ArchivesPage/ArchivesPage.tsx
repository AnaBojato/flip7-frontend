// pages/ArchivesPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Trophy, BookOpen, Skull,
  CheckCircle2, ChevronDown, ChevronUp, Crown,
  Layers,
} from "lucide-react";

import "./archivesPage.css";

// ─── Background ───────────────────────────────────────────────────────────────
import backgroundImg from "../../assets/images/backgrounds/thousand-sunny.jpg";

// ─── Card image imports — numeric ─────────────────────────────────────────────
import card0  from "../../assets/cards/normalCards/card0.svg";
import card1  from "../../assets/cards/normalCards/card1.svg";
import card2  from "../../assets/cards/normalCards/card2.svg";
import card3  from "../../assets/cards/normalCards/card3.svg";
import card4  from "../../assets/cards/normalCards/card4.svg";
import card5  from "../../assets/cards/normalCards/card5.svg";
import card6  from "../../assets/cards/normalCards/card6.svg";
import card7  from "../../assets/cards/normalCards/card7.svg";
import card8  from "../../assets/cards/normalCards/card8.svg";
import card9  from "../../assets/cards/normalCards/card9.svg";
import card10 from "../../assets/cards/normalCards/card10.svg";
import card11 from "../../assets/cards/normalCards/card11.svg";
import card12 from "../../assets/cards/normalCards/card12.svg";

// ─── Card image imports — special ─────────────────────────────────────────────
import cardFreeze       from "../../assets/cards/specialCards/freeze.svg";
import cardFlipThree    from "../../assets/cards/specialCards/flipThree.svg";
import cardSecondChance from "../../assets/cards/specialCards/secondChance.svg";
import cardMultiplier   from "../../assets/cards/specialCards/multiplier.svg";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlayerResponse {
  id: number;
  name: string;
  totalScore: number;
  turnOrder: number;
}

interface CardResponse {
  id: number;
  cardType: "NUMERIC" | "FREEZE" | "SECOND_CHANCE" | "MULTIPLIER" | "FLIP_THREE";
  numericValue: number | null;
}

interface PlayerHandResponse {
  player: PlayerResponse;
  cards: CardResponse[];
  busted: boolean;
  stood: boolean;
  scoreEarned: number;
}

interface RoundHistoryResponse {
  roundId: number;
  roundNumber: number;
  status: string;
  startingPlayer: PlayerResponse;
  results: PlayerHandResponse[];
}

interface GameSummary {
  gameId: number;
  winner: PlayerResponse | null;
  rounds: RoundHistoryResponse[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

const API_URL = "http://localhost:8080";

async function fetchGameHistory(gameId: number): Promise<RoundHistoryResponse[]> {
  const res = await fetch(`${API_URL}/games/${gameId}/history`);
  if (!res.ok) throw new Error("Game not found");
  return res.json();
}

async function fetchGameInfo(
  gameId: number
): Promise<{ id: number; status: string; winner: PlayerResponse | null }> {
  const res = await fetch(`${API_URL}/games/${gameId}`);
  if (!res.ok) throw new Error("Game not found");
  return res.json();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps a CardResponse to its imported SVG asset */
function resolveCardImage(card: CardResponse): string {
  if (card.cardType === "NUMERIC") {
    const numericCardMap: Record<number, string> = {
      0: card0,  1: card1,  2: card2,  3: card3,
      4: card4,  5: card5,  6: card6,  7: card7,
      8: card8,  9: card9,  10: card10, 11: card11,
      12: card12,
    };
    return numericCardMap[card.numericValue ?? 0] ?? card7;
  }
  const specialCardMap: Record<string, string> = {
    FREEZE:        cardFreeze,
    FLIP_THREE:    cardFlipThree,
    SECOND_CHANCE: cardSecondChance,
    MULTIPLIER:    cardMultiplier,
  };
  return specialCardMap[card.cardType] ?? cardFreeze;
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string): string {
  const palette = [
    "#D62828", "#1A73B8", "#2a7c3f", "#7c3a2a",
    "#6b2a7c", "#7c6b2a", "#2a6b7c",
  ];
  let hash = 0;
  for (const char of name) hash += char.charCodeAt(0);
  return palette[hash % palette.length];
}

function getCardLabel(card: CardResponse): string {
  return card.cardType === "NUMERIC"
    ? String(card.numericValue)
    : card.cardType.replace(/_/g, " ");
}

// ─── MiniCard ─────────────────────────────────────────────────────────────────

function MiniCard({ card }: { card: CardResponse }) {
  return (
    <div
      className={`arc-minicard arc-minicard--${card.cardType.toLowerCase()}`}
      title={getCardLabel(card)}
    >
      <img
        src={resolveCardImage(card)}
        alt={getCardLabel(card)}
        className="arc-minicard-img"
        draggable={false}
      />
    </div>
  );
}

// ─── PlayerResultRow ──────────────────────────────────────────────────────────

function PlayerResultRow({
  result,
  rank,
}: {
  result: PlayerHandResponse;
  rank: number;
}) {
  return (
    <div
      className={`arc-player-row ${
        result.busted ? "arc-player-row--bust" :
        result.stood  ? "arc-player-row--stood" : ""
      }`}
    >
      <div className="arc-player-rank">
        {rank === 1
          ? <Crown size={14} className="arc-crown" />
          : `#${rank}`}
      </div>

      <div
        className="arc-player-avatar"
        style={{ background: getAvatarColor(result.player.name) }}
      >
        {getInitials(result.player.name)}
      </div>

      <div className="arc-player-info">
        <span className="arc-player-name">{result.player.name}</span>
        <span className="arc-player-status">
          {result.busted
            ? <><Skull size={11} /> Bust</>
            : result.stood
              ? <><CheckCircle2 size={11} /> Stand</>
              : "—"}
        </span>
      </div>

      <div className="arc-player-cards">
        {result.cards.map((card, index) => (
          <MiniCard key={`${card.id}-${index}`} card={card} />
        ))}
      </div>

      <div className="arc-player-score">
        <span className="arc-score-earned">
          {result.busted ? "0" : `+${result.scoreEarned}`}
        </span>
        <span className="arc-score-total">{result.player.totalScore} pts</span>
      </div>
    </div>
  );
}

// ─── RoundAccordion ───────────────────────────────────────────────────────────

function RoundAccordion({ round }: { round: RoundHistoryResponse }) {
  const [isOpen, setIsOpen] = useState(false);

  const sortedResults = [...round.results].sort((a, b) => {
    if (a.busted && !b.busted) return 1;
    if (!a.busted && b.busted) return -1;
    return b.scoreEarned - a.scoreEarned;
  });

  const leaderCards = sortedResults[0]?.cards ?? [];

  return (
    <div className={`arc-round-block ${isOpen ? "arc-round-block--open" : ""}`}>
      <button
        className="arc-round-header"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <div className="arc-round-badge">R{round.roundNumber}</div>

        <div className="arc-round-meta">
          <span className="arc-round-starter">
            Starts: <strong>{round.startingPlayer.name}</strong>
          </span>
          <span className="arc-round-status">{round.status}</span>
        </div>

        {/* Preview: first 4 cards of the round leader */}
        <div className="arc-round-cards-preview">
          {leaderCards.slice(0, 4).map((card, index) => (
            <div key={index} className="arc-preview-card">
              <img
                src={resolveCardImage(card)}
                alt={getCardLabel(card)}
                draggable={false}
              />
            </div>
          ))}
          {leaderCards.length > 4 && (
            <span className="arc-preview-more">
              +{leaderCards.length - 4}
            </span>
          )}
        </div>

        <div className="arc-round-scores-preview">
          {round.results.slice(0, 4).map(result => (
            <div
              key={result.player.id}
              className="arc-score-chip"
              style={{ background: getAvatarColor(result.player.name) }}
              title={`${result.player.name}: ${result.scoreEarned} pts`}
            >
              {getInitials(result.player.name)}
            </div>
          ))}
        </div>

        <span className="arc-round-toggle">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {isOpen && (
        <div className="arc-round-body">
          <div className="arc-round-table-header">
            <span>#</span>
            <span></span>
            <span>Player</span>
            <span>Cards</span>
            <span>Score</span>
          </div>
          {sortedResults.map((result, index) => (
            <PlayerResultRow
              key={result.player.id}
              result={result}
              rank={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ArchivesPage ─────────────────────────────────────────────────────────────

export default function ArchivesPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [loadedGame,  setLoadedGame]  = useState<GameSummary | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: -400, y: -400 });

  // Cursor glow tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSearch = useCallback(async () => {
    const gameId = parseInt(searchInput.trim(), 10);
    if (isNaN(gameId)) {
      setSearchError("Please enter a valid game ID.");
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setLoadedGame(null);

    try {
      const [info, rounds] = await Promise.all([
        fetchGameInfo(gameId),
        fetchGameHistory(gameId),
      ]);
      setLoadedGame({ gameId, winner: info.winner, rounds });
    } catch {
      setSearchError("No game found with that ID.");
    } finally {
      setIsLoading(false);
    }
  }, [searchInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleSearch();
  };

  // Final leaderboard from last round
  const finalLeaderboard = loadedGame
    ? [...(loadedGame.rounds.at(-1)?.results ?? [])]
        .sort((a, b) => b.player.totalScore - a.player.totalScore)
        .slice(0, 3)
    : [];

  return (
    <div className="arc-page">

      {/* Background image — same as ManualPage */}
      <div
        className="arc-background-overlay"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      />

      {/* Cursor glow */}
      <div
        className="arc-cursor-glow"
        style={{
          left: mousePosition.x - 200,
          top:  mousePosition.y - 200,
        }}
      />

      {/* Scanline */}
      <div className="arc-scanline" />

      {/* Back button */}
      <button className="arc-back-btn" onClick={() => navigate("/")}>
        <ArrowLeft size={18} />
        <span>BACK</span>
      </button>

      <main className="arc-main">

        {/* ── Header ── */}
        <div className="arc-header arc-fade-up">
          <div className="arc-header-left">
            <div className="arc-emblem">
              <BookOpen size={34} className="arc-emblem-icon" />
              <div className="arc-emblem-pulse" />
            </div>
            <div>
              <h1 className="arc-title">GRAND LINE RECORDS</h1>
              <p className="arc-subtitle">"The sea never forgets a battle."</p>
            </div>
          </div>
          <div className="arc-type-chip">
            <span className="arc-type-label">ARCHIVE TYPE:</span>
            <span className="arc-type-value">OFFICIAL NAVAL DECREE</span>
          </div>
        </div>

        {/* ── Search ── */}
        <div
          className="arc-search-panel arc-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="arc-search-inner">
            <Search size={18} className="arc-search-icon" />
            <input
              className="arc-search-input"
              placeholder="Search game by ID..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              type="number"
              min="1"
            />
            <button
              className="arc-search-btn"
              onClick={() => void handleSearch()}
              disabled={isLoading}
            >
              {isLoading ? "SEARCHING..." : "SEARCH"}
            </button>
          </div>
          {searchError && <p className="arc-error">{searchError}</p>}
        </div>

        {/* ── Results ── */}
        {loadedGame && (
          <>
            {/* Winner banner */}
            {loadedGame.winner && (
              <div className="arc-winner-banner arc-fade-up">
                <div className="arc-winner-glow" />
                <Crown size={30} className="arc-winner-crown" />
                <div>
                  <p className="arc-winner-label">
                    Winner · Game #{loadedGame.gameId}
                  </p>
                  <p className="arc-winner-name">{loadedGame.winner.name}</p>
                </div>
                <div className="arc-winner-score">
                  {loadedGame.winner.totalScore} PTS
                </div>
              </div>
            )}

            {/* Top 3 podium */}
            {finalLeaderboard.length > 0 && (
              <div
                className="arc-top3 arc-fade-up"
                style={{ animationDelay: "0.05s" }}
              >
                {finalLeaderboard.map((result, index) => (
                  <div
                    key={result.player.id}
                    className={`arc-top3-card arc-top3-card--${index + 1}`}
                  >
                    <div
                      className="arc-top3-avatar"
                      style={{ background: getAvatarColor(result.player.name) }}
                    >
                      {getInitials(result.player.name)}
                    </div>
                    <div className="arc-top3-rank">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                    </div>
                    <p className="arc-top3-name">{result.player.name}</p>
                    <p className="arc-top3-score">
                      {result.player.totalScore} <span>PTS</span>
                    </p>
                    {/* Last hand cards */}
                    <div className="arc-top3-cards">
                      {result.cards.slice(0, 5).map((card, cardIndex) => (
                        <div key={cardIndex} className="arc-top3-minicard">
                          <img
                            src={resolveCardImage(card)}
                            alt={getCardLabel(card)}
                            draggable={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Round history */}
            <div
              className="arc-rounds-panel arc-fade-up"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="arc-rounds-header">
                <Trophy size={18} className="arc-rounds-icon" />
                <h2 className="arc-rounds-title">Round History</h2>
                <span className="arc-rounds-count">
                  {loadedGame.rounds.length} rounds
                </span>
              </div>
              <div className="arc-rounds-list">
                {loadedGame.rounds.map(round => (
                  <RoundAccordion key={round.roundId} round={round} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loadedGame && !isLoading && !searchError && (
          <div
            className="arc-empty arc-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Layers size={48} className="arc-empty-icon" />
            <p>Enter a game ID to look up its match history.</p>
          </div>
        )}

        {/* Footer */}
        <div
          className="arc-map-footer arc-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="arc-map-overlay" />
          <div className="arc-map-text">
            <span className="arc-map-label">NAVAL ARCHIVE — GRAND LINE</span>
          </div>
        </div>

      </main>
    </div>
  );
}