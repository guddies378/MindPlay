const PLAYER_NAME_KEY = "mindplay-player-name";
export const PLAYER_NAME_UPDATED_EVENT = "mindplay-player-name-updated";

export function getPlayerName(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(PLAYER_NAME_KEY);
}

export function savePlayerName(name: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PLAYER_NAME_KEY, name);
  window.dispatchEvent(new Event(PLAYER_NAME_UPDATED_EVENT));
}
