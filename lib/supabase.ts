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

/*
 * =========================================================
 * REMEMBER ME
 * =========================================================
 *
 * MindPlay stores the Remember Me preference separately.
 *
 * true  -> localStorage
 * false -> sessionStorage
 *
 * The Supabase auth session itself is then stored in the
 * appropriate storage automatically.
 */

const REMEMBER_ME_KEY =
  "mindplay-remember-me";

const storage = {
  getItem(key: string) {
    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    const rememberMe =
      localStorage.getItem(
        REMEMBER_ME_KEY,
      ) === "true";

    /*
     * Remember Me ON
     *
     * Session survives browser
     * closing.
     */
    if (rememberMe) {
      return localStorage.getItem(
        key,
      );
    }

    /*
     * Remember Me OFF
     *
     * Session only survives while
     * the browser session is active.
     */
    return sessionStorage.getItem(
      key,
    );
  },

  setItem(
    key: string,
    value: string,
  ) {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const rememberMe =
      localStorage.getItem(
        REMEMBER_ME_KEY,
      ) === "true";

    if (rememberMe) {
      /*
       * Persistent login.
       */
      localStorage.setItem(
        key,
        value,
      );

      /*
       * Make sure there isn't an
       * older session copy in
       * sessionStorage.
       */
      sessionStorage.removeItem(
        key,
      );
    } else {
      /*
       * Session-only login.
       */
      sessionStorage.setItem(
        key,
        value,
      );

      /*
       * Make sure there isn't an
       * older persistent copy in
       * localStorage.
       */
      localStorage.removeItem(
        key,
      );
    }
  },

  removeItem(key: string) {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    /*
     * Always remove the session
     * from both storage locations.
     */
    localStorage.removeItem(
      key,
    );

    sessionStorage.removeItem(
      key,
    );
  },
};

export const supabase =
  createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        storage,

        /*
         * Automatically refresh the
         * Supabase access token.
         */
        autoRefreshToken: true,

        /*
         * Keep the authenticated
         * session between page loads.
         */
        persistSession: true,

        /*
         * Allows Supabase auth links
         * to be detected if needed.
         */
        detectSessionInUrl: true,
      },
    },
  );