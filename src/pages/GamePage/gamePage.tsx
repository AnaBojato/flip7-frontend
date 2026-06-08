// pages/GamePage.tsx
import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { useLocation, useNavigate } from "react-router-dom";
import {
  Trophy, Hand, Flag, Snowflake, RefreshCw, Crown,
  ChevronRight, Skull, Layers, Swords,
  CheckCircle2, Shield,
} from "lucide-react";

import {
  getPlayers, getRound, drawCard, standPlayer,
  sendFreeze, sendFlipThree,
} from "../../services/gameService";

import PlayerPanel    from "../../components/PlayerBoard/PlayerBoard";
import FreezeModal    from "../../components/Modals/FreezeModal/FreezeModal";
import FlipThreeModal from "../../components/Modals/FlipThreeModal/FlipThreeModal";
import { getCardImage } from "../../utils/cardImages";

import type {
  Player, RoundResponse, TurnResponse, Card, PlayerHand,
} from "../../services/types";

import "./gamePage.css";

type ModalState = "none" | "freeze" | "flipThree";

type RoundSummaryPlayer = {
  name: string;
  scoreEarned: number;
  totalScore: number;
  busted: boolean;
  stood: boolean;
};

type FlyingCard = {
  id: string;
  card: Card;
  targetPlayerId: number;
  fromX: number;
  fromY: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPendingModal(
  playerId: number,
  round: RoundResponse | null
): ModalState {
  if (!round) return "none";
  const hand = round.hands.find(h => h.player.id === playerId);
  if (!hand) return "none";
  const pending = hand.cards.find(
    c => c.cardType === "FREEZE" || c.cardType === "FLIP_THREE"
  );
  if (!pending) return "none";
  return pending.cardType === "FREEZE" ? "freeze" : "flipThree";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const gameId = location.state?.gameId;

  const [players,           setPlayers]           = useState<Player[]>([]);
  const [round,             setRound]             = useState<RoundResponse | null>(null);
  const [currentPlayer,     setCurrentPlayer]     = useState<Player | null>(null);
  const [revealedCard,      setRevealedCard]      = useState<Card | null>(null);
  const [isShowingCard,     setIsShowingCard]     = useState(false);
  const [activeModal,       setActiveModal]       = useState<ModalState>("none");
  const [gameOver,          setGameOver]          = useState(false);
  const [winner,            setWinner]            = useState<Player | null>(null);
  const [roundSummary,      setRoundSummary]      = useState<RoundSummaryPlayer[] | null>(null);
  const [isRoundTransition, setIsRoundTransition] = useState(false);
  const [lastEvent,         setLastEvent]         = useState<string | null>(null);
  const [flyingCards,       setFlyingCards]       = useState<FlyingCard[]>([]);
  const [secondChanceActive,setSecondChanceActive]= useState(false);

  const actionInProgressRef = useRef(false);
  const deckRef  = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // ─── loadGame ─────────────────────────────────────────────────────────────
  const loadGame = useCallback(async () => {
    if (!gameId) return;
    try {
      const [playersData, roundData] = await Promise.all([
        getPlayers(gameId),
        getRound(gameId),
      ]);
      setPlayers(playersData);
      setRound(roundData);
    } catch (error) {
      console.error(error);
    }
  }, [gameId]);

  // ─── applyRoundState ──────────────────────────────────────────────────────
  const applyRoundState = useCallback((
    roundData: RoundResponse,
    playersData: Player[],
    overrideCurrentPlayer?: Player | null,
  ) => {
    setRound(roundData);
    setPlayers(playersData);

    const player = overrideCurrentPlayer !== undefined
      ? overrideCurrentPlayer
      : roundData.startingPlayer;

    setCurrentPlayer(player);

    if (player) {
      const modal = getPendingModal(player.id, roundData);
      setActiveModal(modal);
    } else {
      setActiveModal("none");
    }
  }, []);

  // ─── Inicialización ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameId) return;
    const initialize = async () => {
      try {
        const [playersData, roundData] = await Promise.all([
          getPlayers(gameId),
          getRound(gameId),
        ]);
        applyRoundState(roundData, playersData);
      } catch (error) {
        console.error(error);
      }
    };
    void initialize();
  }, [gameId, applyRoundState]);

  // ─── Polling ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameId) return;
    const interval = setInterval(() => {
      if (
        !actionInProgressRef.current &&
        activeModal === "none"        &&
        !isShowingCard                &&
        !isRoundTransition
      ) {
        void loadGame();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [gameId, loadGame, activeModal, isShowingCard, isRoundTransition]);

  // ─── Limpiar badge ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lastEvent) return;
    const t = setTimeout(() => setLastEvent(null), 2200);
    return () => clearTimeout(t);
  }, [lastEvent]);

  // ─── Mano del jugador actual ──────────────────────────────────────────────
  const currentHand: PlayerHand | undefined = round?.hands.find(
    h => h.player.id === currentPlayer?.id
  );

  // ─── Jugadores disponibles para Freeze / FlipThree ───────────────────────
  const availablePlayers: Player[] = players.filter(p => {
    const hand = round?.hands.find(h => h.player.id === p.id);
    return !hand?.busted && !hand?.stood;
  });

  // ─── Animación: carta volando ─────────────────────────────────────────────
  const triggerFlyingCard = (card: Card, targetPlayerId: number) => {
    if (!deckRef.current) return;
    const rect = deckRef.current.getBoundingClientRect();
    const fly: FlyingCard = {
      id: `${Date.now()}-${Math.random()}`,
      card,
      targetPlayerId,
      fromX: rect.left + rect.width / 2,
      fromY: rect.top + rect.height / 2,
    };
    setFlyingCards(prev => [...prev, fly]);
    setTimeout(() => {
      setFlyingCards(prev => prev.filter(f => f.id !== fly.id));
    }, 700);
  };

  // ─── handleTurnResult ─────────────────────────────────────────────────────
  const handleTurnResult = async (result: TurnResponse) => {
    setLastEvent(result.event);

    if (result.status === "GAME_FINISHED") {
      await loadGame();
      setWinner(result.winner ?? null);
      setGameOver(true);
      setCurrentPlayer(null);
      setActiveModal("none");
      return;
    }

    if (result.status === "ROUND_FINISHED") {
      const [finishedRound, updatedPlayers] = await Promise.all([
        getRound(gameId).catch(() => null),
        getPlayers(gameId).catch(() => null),
      ]);

      if (finishedRound && updatedPlayers) {
        setRound(finishedRound);
        setPlayers(updatedPlayers);

        const summary: RoundSummaryPlayer[] = updatedPlayers.map(p => {
          const hand = finishedRound.hands.find(h => h.player.id === p.id);
          return {
            name:        p.name,
            scoreEarned: hand?.scoreEarned ?? 0,
            totalScore:  p.totalScore,
            busted:      hand?.busted ?? false,
            stood:       hand?.stood  ?? false,
          };
        });
        setRoundSummary(summary);
      }
      setCurrentPlayer(null);
      setActiveModal("none");
      return;
    }

    if (result.event === "FREEZE_PENDING") {
      const [playersData, roundData] = await Promise.all([
        getPlayers(gameId),
        getRound(gameId),
      ]);
      setPlayers(playersData);
      setRound(roundData);
      if (result.currentPlayer) setCurrentPlayer(result.currentPlayer);
      setActiveModal("freeze");
      return;
    }

    if (result.event === "FLIP_THREE_PENDING") {
      const [playersData, roundData] = await Promise.all([
        getPlayers(gameId),
        getRound(gameId),
      ]);
      setPlayers(playersData);
      setRound(roundData);
      if (result.currentPlayer) setCurrentPlayer(result.currentPlayer);
      setActiveModal("flipThree");
      return;
    }

    const [playersData, roundData] = await Promise.all([
      getPlayers(gameId),
      getRound(gameId),
    ]);
    setPlayers(playersData);
    setRound(roundData);

    const nextPlayer = result.currentPlayer ?? null;
    setCurrentPlayer(nextPlayer);

    if (nextPlayer) {
      const modal = getPendingModal(nextPlayer.id, roundData);
      setActiveModal(modal);
    } else {
      setActiveModal("none");
    }
  };

  // ─── DRAW ─────────────────────────────────────────────────────────────────
  const handleDraw = async () => {
    if (!currentPlayer || isShowingCard) return;
    actionInProgressRef.current = true;
    try {
      const result = await drawCard(gameId, currentPlayer.id);

      if (result.drawnCard) {
        setRevealedCard(result.drawnCard);
        setIsShowingCard(true);
        setLastEvent(result.event);

        if (result.event === "SECOND_CHANCE_USED") {
          setSecondChanceActive(true);
        }

        setTimeout(() => {
          if (result.drawnCard && result.currentPlayer) {
            triggerFlyingCard(result.drawnCard, result.currentPlayer.id);
          } else if (result.drawnCard) {
            triggerFlyingCard(result.drawnCard, currentPlayer.id);
          }
        }, 1800);

        setTimeout(async () => {
          setIsShowingCard(false);
          setRevealedCard(null);
          setSecondChanceActive(false);
          await handleTurnResult(result);
          actionInProgressRef.current = false;
        }, 2500);
      } else {
        await handleTurnResult(result);
        actionInProgressRef.current = false;
      }
    } catch (error) {
      console.error(error);
      actionInProgressRef.current = false;
    }
  };

  // ─── STAND ────────────────────────────────────────────────────────────────
  const handleStand = async () => {
    if (!currentPlayer || isShowingCard) return;
    actionInProgressRef.current = true;
    try {
      const result = await standPlayer(gameId, currentPlayer.id);
      await handleTurnResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      actionInProgressRef.current = false;
    }
  };

  // ─── FREEZE confirm ───────────────────────────────────────────────────────
  const handleFreezeSelect = async (targetId: number) => {
    if (!currentPlayer) return;
    setActiveModal("none");
    actionInProgressRef.current = true;
    try {
      const result = await sendFreeze(gameId, currentPlayer.id, targetId);
      await handleTurnResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      actionInProgressRef.current = false;
    }
  };

  // ─── FLIP THREE confirm ───────────────────────────────────────────────────
  const handleFlipThreeSelect = async (targetId: number) => {
    if (!currentPlayer) return;
    setActiveModal("none");
    actionInProgressRef.current = true;
    try {
      const result = await sendFlipThree(gameId, currentPlayer.id, targetId);
      await handleTurnResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      actionInProgressRef.current = false;
    }
  };

  // ─── Continuar después del resumen de ronda ───────────────────────────────
  const handleContinueRound = async () => {
    setIsRoundTransition(true);
    setRoundSummary(null);
    actionInProgressRef.current = true;
    try {
      const [updatedPlayers, newRound] = await Promise.all([
        getPlayers(gameId),
        getRound(gameId),
      ]);
      applyRoundState(newRound, updatedPlayers);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRoundTransition(false);
      actionInProgressRef.current = false;
    }
  };

  // ─── Deshabilitar acciones ─────────────────────────────────────────────────
  const actionsDisabled =
    !currentPlayer ||
    isShowingCard  ||
    activeModal !== "none";

  const hasPendingFreeze    = activeModal === "freeze";
  const hasPendingFlipThree = activeModal === "flipThree";

  // ─── Badge de evento ───────────────────────────────────────────────────────
  const eventLabel: Record<string, { text: string; cls: string }> = {
    BUST:               { text: "💀 BUST!",             cls: "event-bust"   },
    FLIP7:              { text: "🎉 FLIP 7!",            cls: "event-flip7"  },
    SECOND_CHANCE_USED: { text: "🛡 Second Chance!",     cls: "event-second" },
    STAND:              { text: "✋ Stand",               cls: "event-stand"  },
    FREEZE_SENT:        { text: "❄ Frozen!",             cls: "event-freeze" },
    FREEZE_SELF:        { text: "❄ Self-Frozen!",        cls: "event-freeze" },
    FLIP_THREE_SENT:    { text: "🔄 Flip Three!",        cls: "event-flip3"  },
    FLIP_THREE_SELF:    { text: "🔄 Flip Three (Self)!", cls: "event-flip3"  },
  };

  // ─── Distribute players around the table ──────────────────────────────────
  // Positions: top-center, left-top, right-top, left-bottom, right-bottom
  // The "YOU" (local player) always appears at bottom-center
  const tablePositions = ["top", "left-top", "right-top", "left-bottom", "right-bottom"] as const;

  // Sort players by totalScore descending for scoreboard
  const sortedForScoreboard = [...players].sort((a, b) => b.totalScore - a.totalScore);

  // For the table layout we use original order, excluding the current user if needed
  // We just map players to positions (up to 5 shown around the table)
  const tablePlayers = players.slice(0, 5);

  return (
    <main className="game-page">

      {/* Flying cards */}
      {flyingCards.map(fc => (
        <FlyingCardEl key={fc.id} flyingCard={fc} />
      ))}

      {/* ── Modal Freeze ── */}
      {activeModal === "freeze" && currentPlayer && (
        <FreezeModal
          players={availablePlayers}
          currentPlayerId={currentPlayer.id}
          onSelect={handleFreezeSelect}
        />
      )}

      {/* ── Modal FlipThree ── */}
      {activeModal === "flipThree" && currentPlayer && (
        <FlipThreeModal
          players={availablePlayers}
          currentPlayerId={currentPlayer.id}
          onSelect={handleFlipThreeSelect}
        />
      )}

      {/* ── Modal resumen de ronda ── */}
      {roundSummary && (
        <div className="modal-overlay">
          <div className="game-modal round-summary-modal">
            <div className="modal-header">
              <RefreshCw size={22} className="modal-icon icon-spin-once" />
              <h2>Round {round?.roundNumber} — Results</h2>
            </div>
            <div className="summary-list">
              {roundSummary
                .slice()
                .sort((a, b) => b.scoreEarned - a.scoreEarned)
                .map((p, i) => (
                  <div
                    key={p.name}
                    className={`summary-row ${p.busted ? "summary-bust" : "summary-ok"}`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <span className="summary-pos">#{i + 1}</span>
                    <span className="summary-name">{p.name}</span>
                    <span className="summary-earned">
                      {p.busted
                        ? <><Skull size={14} /> Bust</>
                        : <><CheckCircle2 size={14} /> +{p.scoreEarned}</>}
                    </span>
                    <span className="summary-total">{p.totalScore} pts</span>
                  </div>
                ))}
            </div>
            <button className="continue-btn" onClick={handleContinueRound}>
              Next Round <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Game Over ── */}
      {gameOver && (
        <div className="modal-overlay">
          <div className="game-modal game-over-modal">
            <div className="confetti-ring">
              <Crown size={48} className="crown-icon" />
            </div>
            <h2 className="gameover-title">Game Over</h2>
            <p className="winner-label">Winner</p>
            <p className="winner-name">{winner?.name}</p>
            <p className="winner-score">{winner?.totalScore} points</p>
            <button
              className="archives-btn"
              onClick={() => navigate("/archives")}
            >
              View Archives
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="game-header">
        <div className="header-brand">
          <Swords size={28} className="brand-icon" />
          <h1 className="game-title">FLIP<span>7</span></h1>
        </div>
        <div className="header-center">
          <div className="round-badge">
            <RefreshCw size={14} />
            Round {round?.roundNumber ?? "—"}
          </div>
        </div>
        <div className="game-id-chip">#{gameId}</div>
      </header>

      {/* ── Main layout ── */}
      <div className="game-layout">

        {/* ── Board area ── */}
        <div className="game-table" ref={tableRef}>

          {/* Turn banner — top-left */}
          <div className="current-turn-banner">
            <span>
              {currentPlayer
                ? <><strong>{currentPlayer.name}</strong>'s turn</>
                : "Waiting..."}
            </span>
          </div>

          <div className="table-arena">
            {players.map((p, index) => {
              const hand = round?.hands.find(h => h.player.id === p.id);

              const angle = ((Math.PI * 2) / players.length) * index - Math.PI / 2;
              const radiusX = players.length <= 5 ? 220 : 260; // ancho del óvalo
              const radiusY = players.length <= 5 ? 140 : 170; // alto del óvalo ← bájalo para aplastar
              const x = Math.cos(angle) * radiusX;
              const y = Math.sin(angle) * radiusY -17;

              return (
                <div
                  key={p.id}
                  className="arena-slot"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  <PlayerPanel
                    hand={
                      hand ?? {
                        player: p,
                        cards: [],
                        busted: false,
                        stood: false,
                        scoreEarned: 0,
                      }
                    }
                    isActive={currentPlayer?.id === p.id}
                    isCurrentUser={false}
                    playerIndex={index}
                  />
                </div>
              );
            })}

            <div className="table-center">
              <div className="table-oval">

                {/* DEJA AQUÍ TODO EL CÓDIGO DEL DECK */}

                <div
                  className={`deck-stack ${isShowingCard ? "deck-dealing" : ""}`}
                  ref={deckRef}
                  onClick={!actionsDisabled ? handleDraw : undefined}
                >
                  <div className="deck-card deck-card--3" />
                  <div className="deck-card deck-card--2" />
                  <div className="deck-card deck-card--1">
                    <Layers size={24} />
                    <span>DECK</span>
                  </div>
                </div>

                {isShowingCard && revealedCard && (
                  <div className="card-reveal-slot">
                    <img
                      className="revealed-card"
                      src={getCardImage(revealedCard.cardType, revealedCard.numericValue)}
                      alt="Drawn Card"
                    />
                    {secondChanceActive && (
                      <div className="second-chance-overlay">
                        <Shield size={32} className="sc-shield-icon" />
                        <span>Protected!</span>
                      </div>
                    )}
                  </div>
                )}

                {lastEvent && eventLabel[lastEvent] && (
                  <div className={`event-badge ${eventLabel[lastEvent].cls}`}>
                    {eventLabel[lastEvent].text}
                  </div>
                )}
              </div>
            </div>
          </div>{/* end .table-arena */}

          {/* ── Bottom: current player hand + actions ── */}
          <div className="bottom-area">
            <div className="actions">
              {hasPendingFreeze && currentPlayer && (
                <button
                  className="action-btn btn-special btn-freeze"
                  onClick={() => setActiveModal("freeze")}
                  disabled={isShowingCard}
                >
                  <Snowflake size={20} />
                  Use Freeze
                </button>
              )}
              {hasPendingFlipThree && currentPlayer && (
                <button
                  className="action-btn btn-special btn-flipthree"
                  onClick={() => setActiveModal("flipThree")}
                  disabled={isShowingCard}
                >
                  <RefreshCw size={20} />
                  Flip Three
                </button>
              )}
              {!hasPendingFreeze && !hasPendingFlipThree && (
                <>
                  <button
                    className="action-btn btn-draw"
                    onClick={handleDraw}
                    disabled={actionsDisabled}
                  >
                    <Hand size={20} />
                    Draw
                  </button>
                  <button
                    className="action-btn btn-stand"
                    onClick={handleStand}
                    disabled={actionsDisabled}
                  >
                    <Flag size={20} />
                    Stand
                  </button>
                </>
              )}
            </div>
          </div>

        </div>{/* end .game-table */}

        {/* ── Scoreboard ── */}
        {/*
        <aside className="leaderboard">
          <div className="leaderboard-header">
            <Trophy size={18} />
            <span>Scoreboard</span>
          </div>
          <div className="leaderboard-list">
            {sortedForScoreboard.map((player, index) => {
              const isCurrent = currentPlayer?.id === player.id;
              const hand: PlayerHand | undefined = round?.hands.find(
                h => h.player.id === player.id
              );
              const isBusted = hand?.busted ?? false;
              const isStood  = hand?.stood  ?? false;

              return (
                <div
                  key={player.id}
                  className={[
                    "lb-row",
                    isCurrent ? "lb-active"  : "",
                    isBusted  ? "lb-busted"  : "",
                    isStood   ? "lb-stood"   : "",
                  ].filter(Boolean).join(" ")}
                >
                  <div className="lb-top">
                    <span className="lb-rank">
                      {index === 0 ? <Crown size={13} /> : `#${index + 1}`}
                    </span>
                    <span className="lb-name">{player.name}</span>
                    <span className="lb-status">
                      {isBusted && <Skull size={13} />}
                      {isStood  && <CheckCircle2 size={13} />}
                      {!isBusted && !isStood && hand?.cards.some(
                        c => c.cardType === "SECOND_CHANCE"
                      ) && <Shield size={13} className="sc-icon" />}
                      {isCurrent && !isBusted && !isStood && (
                        <span className="lb-active-dot" />
                      )}
                    </span>
                    <span className="lb-score">{player.totalScore}</span>
                  </div>

                  {hand && hand.cards.length > 0 && (
                    <div className="lb-cards">
                      {hand.cards.map((card, ci) => (
                        <div
                          key={`${card.id}-${ci}`}
                          className={`lb-card lb-card--${card.cardType.toLowerCase()}`}
                          title={
                            card.cardType === "NUMERIC"
                              ? String(card.numericValue)
                              : card.cardType
                          }
                        >
                          {card.cardType === "NUMERIC"
                            ? card.numericValue
                            : cardTypeIcon(card.cardType)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
        */}
      </div>{/* end .game-layout */}
    </main>
  );
}
{/*
function cardTypeIcon(cardType: string) {
  switch (cardType) {
    case "FREEZE":        return "❄";
    case "FLIP_THREE":    return "🔄";
    case "SECOND_CHANCE": return "🛡";
    case "MULTIPLIER":    return "×2";
    default:              return "?";
  }
}
*/}
function FlyingCardEl({ flyingCard }: { flyingCard: FlyingCard }) {
  const img = getCardImage(flyingCard.card.cardType, flyingCard.card.numericValue);
  return (
    <img
      className="flying-card"
      src={img}
      alt=""
      style={{
        position: "fixed",
        left: flyingCard.fromX - 30,
        top:  flyingCard.fromY - 42,
        zIndex: 2000,
        pointerEvents: "none",
      }}
    />
  );
}