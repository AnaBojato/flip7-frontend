const API_URL = "http://localhost:8080";

export const createGame = async (
  playerNames: string[]
) => {
  const response = await fetch(`${API_URL}/games`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerNames,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create game");
  }

  return response.json();
};