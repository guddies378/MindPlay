"use client";

import { supabase } from "@/lib/supabase";

export const PLAYER_NAME_UPDATED_EVENT =
  "mindplay-player-name-updated";

let cachedPlayerName = "";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getPlayerName(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return cachedPlayerName || null;
}

export async function loadPlayerName(): Promise<string | null> {
  if (!isBrowser()) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    cachedPlayerName = "";

    window.dispatchEvent(
      new Event(PLAYER_NAME_UPDATED_EVENT),
    );

    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("mindplay_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to load player name:",
      error.message,
    );

    return null;
  }

  cachedPlayerName = data?.mindplay_name ?? "";

  window.dispatchEvent(
    new Event(PLAYER_NAME_UPDATED_EVENT),
  );

  return cachedPlayerName || null;
}

export async function savePlayerName(
  name: string,
): Promise<void> {
  if (!isBrowser()) {
    return;
  }

  const trimmedName = name.trim();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email,
        mindplay_name: trimmedName,
      },
      {
        onConflict: "id",
      },
    );

  if (error) {
    throw error;
  }

  cachedPlayerName = trimmedName;

  window.dispatchEvent(
    new Event(PLAYER_NAME_UPDATED_EVENT),
  );
}

export function clearPlayerName(): void {
  cachedPlayerName = "";

  if (isBrowser()) {
    window.dispatchEvent(
      new Event(PLAYER_NAME_UPDATED_EVENT),
    );
  }
}