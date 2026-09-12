import {
  createBrowserClient,
  type CookieMethodsBrowser,
} from "@supabase/ssr";

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
 * REMEMBER ME COOKIE
 * =========================================================
 *
 * This is NOT localStorage.
 *
 * true  = persistent login
 * false = session-only login
 */

export const REMEMBER_ME_COOKIE =
  "mindplay-remember-me";

const REMEMBER_ME_MAX_AGE =
  60 * 60 * 24 * 30; // 30 days

/*
 * =========================================================
 * COOKIE HELPERS
 * =========================================================
 */

function readBrowserCookies() {
  if (
    typeof document ===
    "undefined"
  ) {
    return [];
  }

  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator =
        part.indexOf("=");

      if (separator === -1) {
        return {
          name: decodeURIComponent(part),
          value: "",
        };
      }

      return {
        name: decodeURIComponent(
          part.slice(0, separator),
        ),
        value: decodeURIComponent(
          part.slice(separator + 1),
        ),
      };
    });
}

function getRememberMePreference() {
  if (
    typeof document ===
    "undefined"
  ) {
    return true;
  }

  const cookie =
    readBrowserCookies().find(
      (item) =>
        item.name ===
        REMEMBER_ME_COOKIE,
    );

  /*
   * Default to ON when no preference
   * exists yet.
   */
  if (!cookie) {
    return true;
  }

  return cookie.value === "true";
}

function serializeBrowserCookie(
  name: string,
  value: string,
  options: {
    path?: string;
    domain?: string;
    sameSite?:
      | "lax"
      | "strict"
      | "none"
      | boolean;
    secure?: boolean;
    maxAge?: number;
  },
) {
  let cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  cookie += `; Path=${options.path ?? "/"}`;

  if (options.domain) {
    cookie += `; Domain=${options.domain}`;
  }

  if (
    options.maxAge !==
    undefined
  ) {
    cookie += `; Max-Age=${Math.floor(
      options.maxAge,
    )}`;
  }

  if (options.sameSite) {
    const sameSite =
      options.sameSite === true
        ? "Strict"
        : options.sameSite ===
            "lax"
          ? "Lax"
          : options.sameSite ===
              "strict"
            ? "Strict"
            : options.sameSite ===
                "none"
              ? "None"
              : "";

    if (sameSite) {
      cookie += `; SameSite=${sameSite}`;
    }
  }

  if (options.secure) {
    cookie += "; Secure";
  }

  return cookie;
}

/*
 * =========================================================
 * SUPABASE BROWSER COOKIE ADAPTER
 * =========================================================
 *
 * This lets Remember Me control whether the
 * Supabase auth cookies are persistent or
 * session-only.
 */

const browserCookies: CookieMethodsBrowser =
  {
    getAll() {
      return readBrowserCookies();
    },

    setAll(cookiesToSet) {
      const rememberMe =
        getRememberMePreference();

      for (const {
        name,
        value,
        options,
      } of cookiesToSet) {
        /*
         * Supabase uses maxAge = 0 when
         * deleting a cookie.
         *
         * Never override that.
         */
        const isRemoving =
          options?.maxAge === 0;

        const cookieOptions = {
          ...options,

          /*
           * Remember Me ON:
           *     persistent cookie
           *
           * Remember Me OFF:
           *     session cookie
           *
           * Remove:
           *     Max-Age=0
           */
          maxAge: isRemoving
            ? 0
            : rememberMe
              ? REMEMBER_ME_MAX_AGE
              : undefined,
        };

        document.cookie =
          serializeBrowserCookie(
            name,
            value,
            cookieOptions,
          );
      }
    },
  };

/*
 * =========================================================
 * MAIN SUPABASE CLIENT
 * =========================================================
 */

export const supabase =
  createBrowserClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies:
        browserCookies,
    },
  );

/*
 * =========================================================
 * REMEMBER ME PREFERENCE
 * =========================================================
 */

export function setRememberMePreference(
  rememberMe: boolean,
) {
  if (
    typeof document ===
    "undefined"
  ) {
    return;
  }

  document.cookie =
    serializeBrowserCookie(
      REMEMBER_ME_COOKIE,
      String(rememberMe),
      {
        path: "/",
        sameSite: "lax",
        secure:
          window.location.protocol ===
          "https:",
        maxAge: rememberMe
          ? REMEMBER_ME_MAX_AGE
          : undefined,
      },
    );
}