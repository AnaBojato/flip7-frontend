import type {
  Player,
  RoundResponse,
  TurnResponse,
  PlayerHand,
} from "./types";

const API_URL = "http://localhost:8080";

export const createGame = async (
  playerNames: string[]
) => {
  const response = await fetch(
    `${API_URL}/games`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        playerNames,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to create game"
    );
  }

  return response.json();
};

export const getPlayers = async (
  gameId: number
): Promise<Player[]> => {
  const response = await fetch(
    `${API_URL}/games/${gameId}/players`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to get players"
    );
  }

  return response.json();
};

export const getRound = async (
  gameId: number
): Promise<RoundResponse> => {
  const response = await fetch(
    `${API_URL}/games/${gameId}/round`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to get round"
    );
  }

  return response.json();
};

export const getPlayerHand = async (
  gameId: number,
  playerId: number
): Promise<PlayerHand> => {
  const response = await fetch(
    `${API_URL}/games/${gameId}/players/${playerId}/hand`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to get hand"
    );
  }

  return response.json();
};

export const drawCard = async (
  gameId: number,
  playerId: number
): Promise<TurnResponse> => {
  const response = await fetch(
    `${API_URL}/games/${gameId}/players/${playerId}/draw`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to draw card"
    );
  }

  return response.json();
};

export const standPlayer = async (
  gameId: number,
  playerId: number
): Promise<TurnResponse> => {
  const response = await fetch(
    `${API_URL}/games/${gameId}/players/${playerId}/stand`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to stand"
    );
  }

  return response.json();
};