import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { useLocation } from "react-router-dom";
import {
  Trophy,
  Hand,
  Flag,
  Snowflake,
  RefreshCw,
  Crown,
  ChevronRight,
  Users,
  Skull,
  Layers,
  Swords,
  CheckCircle2,
  Shield,
} from "lucide-react";

import {
  getPlayers,
  getRound,
  drawCard,
  standPlayer,
  useFreeze,
  useFlipThree,
} from "../../services/gameService";

import PlayerBoard from "../../components/PlayerBoard/PlayerBoard";
import FreezeModal from "../../components/modals/FreezeModal/FreezeModal";
import FlipThreeModal from "../../components/modals/FlipThreeModal/FlipThreeModal";

import { getCardImage } from "../../utils/cardImages";

import type {
  Player,
  RoundResponse,
  TurnResponse,
  Card,
  PlayerHand,
} from "../../services/types";

import "./GamePage.css";

type ModalState = "none" | "freeze" | "flipThree";

type RoundSummaryPlayer = {
  name: string;
  scoreEarned: number;
  totalScore: number;
  busted: boolean;
  stood: boolean;
};

// Animación de carta volando desde el centro al leaderboard
type FlyingCard = {
  id: string;
  card: Card;
  targetPlayerId: number;
  fromX: number;
  fromY: number;
};

export default function GamePage() {
  const location = useLocation();
  const gameId = location.state?.gameId;

  const [players, setPlayers]           = useState<Player[]>([]);
  const [round, setRound]               = useState<RoundResponse | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [revealedCard, setRevealedCard] = useState<Card | null>(null);
  const [isShowingCard, setIsShowingCard] = useState(false);
  const [activeModal, setActiveModal]   = useState<ModalState>("none");
  const [gameOver, setGameOver]         = useState(false);
  const [winner, setWinner]             = useState<Player | null>(null);
  const [roundSummary, setRoundSummary] = useState<RoundSummaryPlayer[] | null>(null);
  const [isRoundTransition, setIsRoundTransition] = useState(false);
  const [lastEvent, setLastEvent]       = useState<string | null>(null);
  const [flyingCards, setFlyingCards]   = useState<FlyingCard[]>([]);

  // Refs para calcular posición de animación
  const deckRef      = useRef<HTMLDivElement>(null);
  const tableRef     = useRef<HTMLDivElement>(null);

  // ─── loadGame: solo refresca sin tocar currentPlayer ────────────────────
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

  // ─── Inicialización ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameId) return;
    const initialize = async () => {
      try {
        const [playersData, roundData] = await Promise.all([
          getPlayers(gameId),
          getRound(gameId),
        ]);
        setPlayers(playersData);
        setRound(roundData);
        // El primer jugador activo es el startingPlayer de la ronda
        setCurrentPlayer(roundData.startingPlayer);
      } catch (error) {
        console.error(error);
      }
    };
    void initialize();
  }, [gameId]);

  // ─── Polling pausado durante modales / animaciones ───────────────────────
  useEffect(() => {
    if (!gameId) return;
    const interval = setInterval(() => {
      if (activeModal === "none" && !isShowingCard && !isRoundTransition) {
        void loadGame();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [gameId, loadGame, activeModal, isShowingCard, isRoundTransition]);

  // ─── Limpiar badge de evento ─────────────────────────────────────────────
  useEffect(() => {
    if (!lastEvent) return;
    const t = setTimeout(() => setLastEvent(null), 2200);
    return () => clearTimeout(t);
  }, [lastEvent]);

  // ─── Carta pendiente en mano del jugador actual ──────────────────────────
  const currentHand: PlayerHand | undefined = round?.hands.find(
    h => h.player.id === currentPlayer?.id
  );

  const pendingCard = currentHand?.cards.find(
    c => c.cardType === "FREEZE" || c.cardType === "FLIP_THREE"
  ) ?? null;

  const hasPendingFreeze    = pendingCard?.cardType === "FREEZE";
  const hasPendingFlipThree = pendingCard?.cardType === "FLIP_THREE";

  // ─── Abre modal si hay carta pendiente al empezar turno ─────────────────
  useEffect(() => {
    if (!currentPlayer || isShowingCard || isRoundTransition) return;
    if (hasPendingFreeze && activeModal === "none")    setActiveModal("freeze");
    else if (hasPendingFlipThree && activeModal === "none") setActiveModal("flipThree");
  }, [currentPlayer, hasPendingFreeze, hasPendingFlipThree, isShowingCard, isRoundTransition, activeModal]);

  // ─── Jugadores disponibles para Freeze / FlipThree ───────────────────────
  // Excluye a los que ya están busted o stood
  const availablePlayers: Player[] = players.filter(p => {
    const hand = round?.hands.find(h => h.player.id === p.id);
    return !hand?.busted && !hand?.stood;
  });

  // ─── Animación: carta vuela del centro al jugador en leaderboard ─────────
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

  // ─── Procesamiento central de resultados ────────────────────────────────
  const handleTurnResult = async (result: TurnResponse) => {
    setLastEvent(result.event);

    // ── Fin de juego ──────────────────────────────────────────────────────
    if (result.status === "GAME_FINISHED") {
      await loadGame();
      setWinner(result.winner ?? null);
      setGameOver(true);
      setCurrentPlayer(null);
      return;
    }

    // ── Fin de ronda → muestra resumen y prepara nueva ronda ──────────────
    if (result.status === "ROUND_FINISHED") {
      // Cargamos la ronda ANTERIOR (ya terminada) para el resumen
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
            name: p.name,
            scoreEarned: hand?.scoreEarned ?? 0,
            totalScore: p.totalScore,
            busted: hand?.busted ?? false,
            stood: hand?.stood ?? false,
          };
        });
        setRoundSummary(summary);
      }
      setCurrentPlayer(null);
      return;
    }

    // ── Freeze pendiente → abrir modal ────────────────────────────────────
    if (result.event === "FREEZE_PENDING") {
      if (result.currentPlayer) setCurrentPlayer(result.currentPlayer);
      await loadGame();
      setActiveModal("freeze");
      return;
    }

    // ── FlipThree pendiente → abrir modal ─────────────────────────────────
    if (result.event === "FLIP_THREE_PENDING") {
      if (result.currentPlayer) setCurrentPlayer(result.currentPlayer);
      await loadGame();
      setActiveModal("flipThree");
      return;
    }

    // ── Turno normal: avanzar jugador ─────────────────────────────────────
    if (result.currentPlayer) setCurrentPlayer(result.currentPlayer);
    await loadGame();
  };

  // ─── DRAW ────────────────────────────────────────────────────────────────
  const handleDraw = async () => {
    if (!currentPlayer || isShowingCard) return;
    try {
      const result = await drawCard(gameId, currentPlayer.id);

      if (result.drawnCard) {
        setRevealedCard(result.drawnCard);
        setIsShowingCard(true);

        // Tras mostrar la carta, animar al mazo del jugador en leaderboard
        setTimeout(() => {
          if (result.drawnCard && result.currentPlayer) {
            triggerFlyingCard(result.drawnCard, result.currentPlayer.id);
          } else if (result.drawnCard && currentPlayer) {
            // En caso BUST/FLIP7 el drawnCard va al jugador actual
            triggerFlyingCard(result.drawnCard, currentPlayer.id);
          }
        }, 1800);

        setTimeout(async () => {
          setIsShowingCard(false);
          setRevealedCard(null);
          await handleTurnResult(result);
        }, 2500);
      } else {
        await handleTurnResult(result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ─── STAND ───────────────────────────────────────────────────────────────
  const handleStand = async () => {
    if (!currentPlayer || isShowingCard) return;
    try {
      const result = await standPlayer(gameId, currentPlayer.id);
      await handleTurnResult(result);
    } catch (error) {
      console.error(error);
    }
  };

  // ─── FREEZE confirm ──────────────────────────────────────────────────────
  const handleFreezeSelect = async (targetId: number) => {
    if (!currentPlayer) return;
    setActiveModal("none");
    try {
      const result = await useFreeze(gameId, currentPlayer.id, targetId);
      await handleTurnResult(result);
    } catch (error) {
      console.error(error);
    }
  };

  // ─── FLIP THREE confirm ──────────────────────────────────────────────────
  const handleFlipThreeSelect = async (targetId: number) => {
    if (!currentPlayer) return;
    setActiveModal("none");
    try {
      const result = await useFlipThree(gameId, currentPlayer.id, targetId);
      await handleTurnResult(result);
    } catch (error) {
      console.error(error);
    }
  };

  // ─── Continuar después del resumen (carga la nueva ronda ya creada) ──────
  const handleContinueRound = async () => {
    setIsRoundTransition(true);
    setRoundSummary(null);

    try {
      // El back ya creó la nueva ronda en buildResult → startNewRound
      // Solo necesitamos refrescar y usar el startingPlayer de la nueva ronda
      const [updatedPlayers, newRound] = await Promise.all([
        getPlayers(gameId),
        getRound(gameId),
      ]);

      setPlayers(updatedPlayers);
      setRound(newRound);

      // ✅ FIX PRINCIPAL: usar startingPlayer de la nueva ronda,
      //    NO buscar el primer hand sin bust/stood (todos están fresh)
      setCurrentPlayer(newRound.startingPlayer);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRoundTransition(false);
    }
  };

  // ─── Deshabilitar acciones ────────────────────────────────────────────────
  const actionsDisabled =
    !currentPlayer ||
    isShowingCard ||
    activeModal !== "none" ||
    hasPendingFreeze ||
    hasPendingFlipThree;

  // ─── Badge de evento ──────────────────────────────────────────────────────
  const eventLabel: Record<string, { text: string; cls: string }> = {
    BUST:               { text: "💀 BUST!",          cls: "event-bust"   },
    FLIP7:              { text: "🎉 FLIP 7!",         cls: "event-flip7"  },
    SECOND_CHANCE_USED: { text: "🛡 Second Chance!",  cls: "event-second" },
    STAND:              { text: "✋ Stand",            cls: "event-stand"  },
    FREEZE_SENT:        { text: "❄ Frozen!",          cls: "event-freeze" },
    FREEZE_SELF:        { text: "❄ Self-Frozen!",     cls: "event-freeze" },
    FLIP_THREE_SENT:    { text: "🔄 Flip Three!",     cls: "event-flip3"  },
    FLIP_THREE_SELF:    { text: "🔄 Flip Three (Self)!", cls: "event-flip3" },
  };

  return (
    <main className="game-page">

      {/* ── Tarjetas volando (animación al leaderboard) ── */}
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

      {/* ── Layout ── */}
      <section className="game-layout">

        {/* ── Tablero ── */}
        <section className="game-table" ref={tableRef}>
          <div className="felt-texture" />

          {/* Banner jugador activo */}
          <div className="current-turn-banner">
            <Users size={16} />
            <span>
              {currentPlayer
                ? <><strong>{currentPlayer.name}</strong>'s turn</>
                : "Waiting..."}
            </span>
          </div>

          {/* Centro de mesa */}
          <div className="table-center">
            <div className="table-oval">

              {/* Mazo */}
              <div
                className={`deck-stack ${isShowingCard ? "deck-dealing" : ""}`}
                ref={deckRef}
              >
                <div className="deck-card deck-card--3" />
                <div className="deck-card deck-card--2" />
                <div className="deck-card deck-card--1">
                  <Layers size={24} />
                  <span>DECK</span>
                </div>
              </div>

              {/* Carta revelada */}
              {isShowingCard && revealedCard && (
                <div className="card-reveal-slot">
                  <img
                    className="revealed-card"
                    src={getCardImage(revealedCard.cardType, revealedCard.numericValue)}
                    alt="Drawn Card"
                  />
                </div>
              )}

              {/* Badge de evento */}
              {lastEvent && eventLabel[lastEvent] && (
                <div className={`event-badge ${eventLabel[lastEvent].cls}`}>
                  {eventLabel[lastEvent].text}
                </div>
              )}
            </div>
          </div>

          {/* Mano del jugador actual */}
          {currentHand && (
            <div className="hand-area">
              <PlayerBoard hand={currentHand} />
            </div>
          )}

          {/* Botones de acción */}
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
        </section>

        {/* ── Leaderboard ── */}
        <aside className="leaderboard">
          <div className="leaderboard-header">
            <Trophy size={18} />
            <span>Scoreboard</span>
          </div>

          <div className="leaderboard-list">
            {players
              .slice()
              .sort((a, b) => b.totalScore - a.totalScore)
              .map((player, index) => {
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
                    {/* Fila superior: rank / nombre / estado / score */}
                    <div className="lb-top">
                      <span className="lb-rank">
                        {index === 0
                          ? <Crown size={13} />
                          : `#${index + 1}`}
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

                    {/* Mini-mazo: cartas del jugador esta ronda */}
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
      </section>
    </main>
  );
}

// ─── Helper: icono para cartas especiales en el mini-mazo ─────────────────
function cardTypeIcon(cardType: string) {
  switch (cardType) {
    case "FREEZE":        return "❄";
    case "FLIP_THREE":    return "🔄";
    case "SECOND_CHANCE": return "🛡";
    case "MULTIPLIER":    return "×2";
    default:              return "?";
  }
}

// ─── Componente de carta volando ──────────────────────────────────────────
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