import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL",
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

const REMEMBER_ME_KEY =
  "mindplay-remember-me";

const storage = {
  getItem(key: string) {
    if (typeof window === "undefined") {
      return null;
    }

    const rememberMe =
      localStorage.getItem(
        REMEMBER_ME_KEY,
      ) === "true";

    if (rememberMe) {
      return localStorage.getItem(key);
    }

    return sessionStorage.getItem(key);
  },

  setItem(
    key: string,
    value: string,
  ) {
    if (typeof window === "undefined") {
      return;
    }

    const rememberMe =
      localStorage.getItem(
        REMEMBER_ME_KEY,
      ) === "true";

    if (rememberMe) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },

  removeItem(key: string) {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase =
  createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    },
  );