export interface Card {
  cardType: string;
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
  hands: PlayerHand[];
}