import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

const REMEMBER_ME_COOKIE =
  "mindplay-remember-me";

const REMEMBER_ME_MAX_AGE =
  60 * 60 * 24 * 30; // 30 days

export async function updateSession(
  request: NextRequest,
) {
  let response =
    NextResponse.next({
      request,
    });

  /*
   * Read the Remember Me preference.
   *
   * If the cookie doesn't exist, default to
   * persistent sessions for backward compatibility.
   */
  const rememberMe =
    request.cookies.get(
      REMEMBER_ME_COOKIE,
    )?.value === "true";

  const shouldPersist =
    request.cookies.has(
      REMEMBER_ME_COOKIE,
    )
      ? rememberMe
      : true;

  const supabase =
    createServerClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(cookiesToSet) {
            /*
             * Update the request cookies first.
             * This allows Supabase to continue using
             * the refreshed session during this request.
             */
            cookiesToSet.forEach(
              ({
                name,
                value,
              }) => {
                request.cookies.set(
                  name,
                  value,
                );
              },
            );

            /*
             * Recreate the response so the updated
             * request cookies are included.
             */
            response =
              NextResponse.next({
                request,
              });

            /*
             * Write Supabase auth cookies back
             * to the browser.
             */
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                /*
                 * Supabase uses maxAge: 0 when
                 * removing an auth cookie.
                 */
                const isRemoving =
                  options?.maxAge === 0;

                response.cookies.set(
                  name,
                  value,
                  {
                    ...options,

                    /*
                     * Remember Me ON:
                     * keep the auth cookie for 30 days.
                     *
                     * Remember Me OFF:
                     * omit maxAge so the browser treats
                     * it as a session cookie.
                     *
                     * Removal:
                     * preserve maxAge: 0.
                     */
                    maxAge: isRemoving
                      ? 0
                      : shouldPersist
                        ? REMEMBER_ME_MAX_AGE
                        : undefined,
                  },
                );
              },
            );
          },
        },
      },
    );

  /*
   * Refresh/validate the Supabase session.
   */
  await supabase.auth.getClaims();

  return response;
}