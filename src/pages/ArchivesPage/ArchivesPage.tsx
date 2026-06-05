// pages/ArchivesPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Trophy, BookOpen, Skull,
  CheckCircle2, ChevronDown, ChevronUp, Crown,
  Layers, Shield, Snowflake, RefreshCw,
} from "lucide-react";

import "./archivesPage.css";

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

async function fetchGameInfo(gameId: number): Promise<{ id: number; status: string; winner: PlayerResponse | null }> {
  const res = await fetch(`${API_URL}/games/${gameId}`);
  if (!res.ok) throw new Error("Game not found");
  return res.json();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cardIcon(cardType: string) {
  switch (cardType) {
    case "FREEZE":        return <Snowflake size={10} />;
    case "FLIP_THREE":    return <RefreshCw size={10} />;
    case "SECOND_CHANCE": return <Shield size={10} />;
    case "MULTIPLIER":    return "×2";
    default:              return "?";
  }
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(name: string) {
  const colors = [
    "#D62828", "#1A73B8", "#2a7c3f", "#7c3a2a",
    "#6b2a7c", "#7c6b2a", "#2a6b7c",
  ];
  let hash = 0;
  for (const c of name) hash += c.charCodeAt(0);
  return colors[hash % colors.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MiniCard({ card }: { card: CardResponse }) {
  const isNum = card.cardType === "NUMERIC";
  return (
    <div
      className={`arc-minicard arc-minicard--${card.cardType.toLowerCase()}`}
      title={isNum ? String(card.numericValue) : card.cardType}
    >
      {isNum ? card.numericValue : cardIcon(card.cardType)}
    </div>
  );
}

function PlayerResultRow({ result, rank }: { result: PlayerHandResponse; rank: number }) {
  return (
    <div className={`arc-player-row ${result.busted ? "arc-player-row--bust" : result.stood ? "arc-player-row--stood" : ""}`}>
      <div className="arc-player-rank">
        {rank === 1 ? <Crown size={14} className="arc-crown" /> : `#${rank}`}
      </div>

      <div className="arc-player-avatar" style={{ background: avatarColor(result.player.name) }}>
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
        {result.cards.map((c, i) => <MiniCard key={`${c.id}-${i}`} card={c} />)}
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

function RoundAccordion({ round }: { round: RoundHistoryResponse }) {
  const [open, setOpen] = useState(false);

  // Sort by score descending (busted last)
  const sorted = [...round.results].sort((a, b) => {
    if (a.busted && !b.busted) return 1;
    if (!a.busted && b.busted) return -1;
    return b.scoreEarned - a.scoreEarned;
  });

  return (
    <div className={`arc-round-block ${open ? "arc-round-block--open" : ""}`}>
      <button className="arc-round-header" onClick={() => setOpen(o => !o)}>
        <div className="arc-round-badge">R{round.roundNumber}</div>
        <div className="arc-round-meta">
          <span className="arc-round-starter">
            Inicia: <strong>{round.startingPlayer.name}</strong>
          </span>
          <span className="arc-round-status">{round.status}</span>
        </div>
        <div className="arc-round-scores-preview">
          {round.results.slice(0, 4).map(r => (
            <div
              key={r.player.id}
              className="arc-score-chip"
              style={{ background: avatarColor(r.player.name) }}
              title={`${r.player.name}: ${r.scoreEarned} pts`}
            >
              {getInitials(r.player.name)}
            </div>
          ))}
        </div>
        <span className="arc-round-toggle">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {open && (
        <div className="arc-round-body">
          <div className="arc-round-table-header">
            <span>#</span>
            <span></span>
            <span>Jugador</span>
            <span>Cartas</span>
            <span>Puntos</span>
          </div>
          {sorted.map((result, i) => (
            <PlayerResultRow key={result.player.id} result={result} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ArchivesPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput]   = useState("");
  const [loadedGame,  setLoadedGame]    = useState<GameSummary | null>(null);
  const [loading,     setLoading]       = useState(false);
  const [error,       setError]         = useState<string | null>(null);
  const [mousePos,    setMousePos]      = useState({ x: -400, y: -400 });

  // Cursor glow
  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const handleSearch = useCallback(async () => {
    const id = parseInt(searchInput.trim(), 10);
    if (isNaN(id)) { setError("Ingresa un ID de partida válido."); return; }

    setLoading(true);
    setError(null);
    setLoadedGame(null);

    try {
      const [info, rounds] = await Promise.all([
        fetchGameInfo(id),
        fetchGameHistory(id),
      ]);
      setLoadedGame({ gameId: id, winner: info.winner, rounds });
    } catch {
      setError("No se encontró ninguna partida con ese ID.");
    } finally {
      setLoading(false);
    }
  }, [searchInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleSearch();
  };

  // Derive leaderboard from last round data
  const leaderboard = loadedGame
    ? [...(loadedGame.rounds.at(-1)?.results ?? [])]
        .sort((a, b) => b.player.totalScore - a.player.totalScore)
        .slice(0, 3)
    : [];

  return (
    <div className="arc-page">
      {/* Cursor glow */}
      <div
        className="arc-cursor-glow"
        style={{ left: mousePos.x - 200, top: mousePos.y - 200 }}
      />

      {/* Scanline */}
      <div className="arc-scanline" />

      {/* Back button */}
      <button
        className="arc-back-btn"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        <span>Inicio</span>
      </button>

      <main className="arc-main">

        {/* ── Header ── */}
        <div className="arc-header arc-fade-up">
          <div className="arc-header-left">
            <div className="arc-emblem">
              <BookOpen size={36} className="arc-emblem-icon" />
              <div className="arc-emblem-pulse" />
            </div>
            <div>
              <h1 className="arc-title">REGISTROS DEL GRAND LINE</h1>
              <p className="arc-subtitle">"El mar nunca olvida una batalla."</p>
            </div>
          </div>
          <div className="arc-type-chip">
            <span className="arc-type-label">TIPO DE ARCHIVO:</span>
            <span className="arc-type-value">DECRETO OFICIAL NAVAL</span>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="arc-search-panel arc-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="arc-search-inner">
            <Search size={18} className="arc-search-icon" />
            <input
              className="arc-search-input"
              placeholder="Buscar partida por ID..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              type="number"
              min="1"
            />
            <button
              className="arc-search-btn"
              onClick={() => void handleSearch()}
              disabled={loading}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
          {error && <p className="arc-error">{error}</p>}
        </div>

        {/* ── Results ── */}
        {loadedGame && (
          <>
            {/* Winner banner */}
            {loadedGame.winner && (
              <div className="arc-winner-banner arc-fade-up">
                <div className="arc-winner-glow" />
                <Crown size={28} className="arc-winner-crown" />
                <div>
                  <p className="arc-winner-label">Ganador de la Partida #{loadedGame.gameId}</p>
                  <p className="arc-winner-name">{loadedGame.winner.name}</p>
                </div>
                <div className="arc-winner-score">{loadedGame.winner.totalScore} PTS</div>
              </div>
            )}

            {/* Top 3 */}
            {leaderboard.length > 0 && (
              <div className="arc-top3 arc-fade-up" style={{ animationDelay: "0.05s" }}>
                {leaderboard.map((r, i) => (
                  <div key={r.player.id} className={`arc-top3-card arc-top3-card--${i + 1}`}>
                    <div
                      className="arc-top3-avatar"
                      style={{ background: avatarColor(r.player.name) }}
                    >
                      {getInitials(r.player.name)}
                    </div>
                    <div className="arc-top3-rank">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
                    <p className="arc-top3-name">{r.player.name}</p>
                    <p className="arc-top3-score">{r.player.totalScore} <span>PTS</span></p>
                  </div>
                ))}
              </div>
            )}

            {/* Round history */}
            <div className="arc-rounds-panel arc-fade-up" style={{ animationDelay: "0.15s" }}>
              <div className="arc-rounds-header">
                <Trophy size={18} className="arc-rounds-icon" />
                <h2 className="arc-rounds-title">Historial de Rondas</h2>
                <span className="arc-rounds-count">{loadedGame.rounds.length} rondas</span>
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
        {!loadedGame && !loading && !error && (
          <div className="arc-empty arc-fade-up" style={{ animationDelay: "0.2s" }}>
            <Layers size={48} className="arc-empty-icon" />
            <p>Ingresa el ID de una partida para consultar su historial.</p>
          </div>
        )}

        {/* Decorative map footer */}
        <div className="arc-map-footer arc-fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="arc-map-overlay" />
          <div className="arc-map-text">
            <span className="arc-map-label">ARCHIVO NAVAL — GRAND LINE</span>
          </div>
        </div>

      </main>
    </div>
  );
}