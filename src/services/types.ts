export interface Card {
  id: number;

  cardType:
    | "NUMERIC"
    | "FREEZE"
    | "SECOND_CHANCE"
    | "MULTIPLIER"
    | "FLIP_THREE";

  numericValue: number | null;
}

export interface Player {
  id: number;
  name: string;
  totalScore: number;
  turnOrder: number;
}

export interface PlayerHand {
  player: Player;
  cards: Card[];
  busted: boolean;
  stood: boolean;
  scoreEarned: number;
}

export interface RoundResponse {
  id: number;
  roundNumber: number;
  status: string;
  startingPlayer: Player;
  hands: PlayerHand[];
}

export interface TurnResponse {
  status:
    | "TURN_COMPLETED"
    | "ROUND_FINISHED"
    | "GAME_FINISHED"
    | "DECK_EMPTY";

  gameId: number;

  roundId: number;

  roundNumber: number;

  roundStatus: string;

  currentPlayer?: Player;

  drawnCard?: Card;

  winner?: Player;

  event:
    | "NORMAL"
    | "BUST"
    | "FLIP7"
    | "SPECIAL_CARD"
    | "SECOND_CHANCE_USED"
    | "STAND"
    | "FREEZE_PENDING"
    | "FREEZE_SELF"
    | "FREEZE_SENT"
    | "FLIP_THREE_PENDING"
    | "FLIP_THREE_SENT"
    | "FLIP_THREE_SELF";   // ← AGREGADO: faltaba este evento
}

export interface RoundHistoryResult {
  player: Player;
  cards: Card[];
  busted: boolean;
  stood: boolean;
  scoreEarned: number;
}
 
export interface RoundHistoryResponse {
  roundId: number;
  roundNumber: number;
  status: string;
  startingPlayer: Player;
  results: RoundHistoryResult[];
}