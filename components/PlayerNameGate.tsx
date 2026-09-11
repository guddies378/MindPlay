"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  syncLocalProgressToSupabase,
} from "@/lib/progress";
import LandingPage from "@/components/LandingPage";

const NEW_ACCOUNT_KEY =
  "mindplay-new-account";

const REMEMBER_ME_KEY =
  "mindplay-remember-me";

type AuthMode = "login" | "signup";

function getInitialRememberMe() {
  if (
    typeof window ===
    "undefined"
  ) {
    return true;
  }

  const saved =
    localStorage.getItem(
      REMEMBER_ME_KEY
    );

  if (saved === null) {
    return true;
  }

  return saved === "true";
}

function getInitialNewAccount() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  return (
    localStorage.getItem(
      NEW_ACCOUNT_KEY
    ) === "true"
  );
}

export default function PlayerNameGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  /*
   * =========================================================
   * SESSION / PROFILE STATE
   * =========================================================
   */

  const [sessionReady, setSessionReady] =
    useState(false);

  const [hasSession, setHasSession] =
    useState(false);

  const [profileChecked, setProfileChecked] =
    useState(false);

  const [profileExists, setProfileExists] =
    useState(false);

  const [isNewAccount, setIsNewAccount] =
    useState(getInitialNewAccount);

  /*
   * =========================================================
   * LANDING / AUTH STATE
   * =========================================================
   */

  const [showAuthOnLanding, setShowAuthOnLanding] =
    useState(false);

  const [authMode, setAuthMode] =
    useState<AuthMode>("login");

  /*
   * =========================================================
   * AUTH FORM STATE
   * =========================================================
   */

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(getInitialRememberMe);

  const [authError, setAuthError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /*
   * =========================================================
   * EMAIL / SIGNUP NOTICES
   * =========================================================
   */

  const [showEmailToast, setShowEmailToast] =
    useState(false);

  const [showSignupNotice, setShowSignupNotice] =
    useState(false);

  /*
   * =========================================================
   * MINDPLAY NAME STATE
   * =========================================================
   */

  const [mindPlayName, setMindPlayName] =
    useState("");

  const [nameError, setNameError] =
    useState("");

  const [isSavingName, setIsSavingName] =
    useState(false);

  /*
   * =========================================================
   * CHECK CURRENT SESSION
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    const checkSession =
      async () => {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        setHasSession(
          !!session
        );

        /*
         * No session.
         */
        if (!session) {
          setProfileChecked(
            false
          );

          setProfileExists(
            false
          );

          setSessionReady(
            true
          );

          return;
        }

        /*
         * Check whether this account
         * already has a MindPlay profile.
         */
        const {
          data: profile,
          error,
        } =
          await supabase
            .from("profiles")
            .select(
              "mindplay_name"
            )
            .eq(
              "id",
              session.user.id
            )
            .maybeSingle();

        if (!mounted) {
          return;
        }

        if (error) {
          console.error(
            "Profile check failed:",
            error
          );

          setProfileChecked(
            true
          );

          setProfileExists(
            false
          );
        } else {
          setProfileExists(
            !!profile?.mindplay_name
          );

          setProfileChecked(
            true
          );
        }

        setSessionReady(
          true
        );
      };

    checkSession();

    /*
     * =======================================================
     * AUTH STATE LISTENER
     * =======================================================
     */

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          session
        ) => {
          if (!mounted) {
            return;
          }

          setHasSession(
            !!session
          );

          /*
           * No session.
           */
          if (!session) {
            setProfileChecked(
              false
            );

            setProfileExists(
              false
            );

            setIsNewAccount(
              false
            );

            /*
             * If the user logged out,
             * return to the landing page
             * instead of reopening auth.
             */
            setShowAuthOnLanding(
              false
            );

            setSessionReady(
              true
            );

            return;
          }

          /*
           * Check profile after login.
           */
          const {
            data: profile,
            error,
          } =
            await supabase
              .from("profiles")
              .select(
                "mindplay_name"
              )
              .eq(
                "id",
                session.user.id
              )
              .maybeSingle();

          if (!mounted) {
            return;
          }

          if (error) {
            console.error(
              "Profile check failed:",
              error
            );

            setProfileExists(
              false
            );
          } else {
            setProfileExists(
              !!profile?.mindplay_name
            );
          }

          setProfileChecked(
            true
          );

          /*
           * Check whether this is a
           * new account.
           *
           * This is intentionally done here
           * instead of another effect.
           */
          if (
            typeof window !==
            "undefined"
          ) {
            setIsNewAccount(
              localStorage.getItem(
                NEW_ACCOUNT_KEY
              ) === "true"
            );
          }

          setSessionReady(
            true
          );
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * =========================================================
   * OPEN LOGIN
   * =========================================================
   */

  function openLogin() {
    setAuthMode("login");
    setAuthError("");
    setShowEmailToast(false);
    setShowSignupNotice(false);
    setPassword("");
    setConfirmPassword("");
    setShowAuthOnLanding(true);
  }

  /*
   * =========================================================
   * OPEN SIGNUP
   * =========================================================
   */

  function openSignup() {
    setAuthMode("signup");
    setAuthError("");
    setShowEmailToast(false);
    setShowSignupNotice(false);
    setPassword("");
    setConfirmPassword("");
    setShowAuthOnLanding(true);
  }

  /*
   * =========================================================
   * BACK TO LANDING
   * =========================================================
   */

  function backToLanding() {
    setShowAuthOnLanding(false);
    setAuthError("");
    setShowEmailToast(false);
    setShowSignupNotice(false);
    setPassword("");
    setConfirmPassword("");
  }

  /*
   * =========================================================
   * HANDLE AUTH SUBMIT
   * =========================================================
   */

  async function handleAuthSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setAuthError("");
    setShowSignupNotice(false);
    setIsSubmitting(true);

    try {
      /*
       * =====================================================
       * LOGIN
       * =====================================================
       */

      if (
        authMode ===
        "login"
      ) {
        const {
          error,
        } =
          await supabase.auth.signInWithPassword(
            {
              email:
                email.trim(),
              password,
            }
          );

        if (error) {
          throw error;
        }

        /*
         * Save Remember Me preference.
         */
        if (
          typeof window !==
          "undefined"
        ) {
          localStorage.setItem(
            REMEMBER_ME_KEY,
            String(
              rememberMe
            )
          );
        }

        /*
         * Login succeeded.
         */
        setShowAuthOnLanding(
          false
        );

        setPassword("");
        setConfirmPassword("");

        return;
      }

      /*
       * =====================================================
       * SIGNUP
       * =====================================================
       */

      if (
        password.length <
        6
      ) {
        setAuthError(
          "Password must be at least 6 characters."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setAuthError(
          "Passwords do not match."
        );

        return;
      }

      const {
        data,
        error,
      } =
        await supabase.auth.signUp(
          {
            email:
              email.trim(),
            password,
          }
        );

      if (error) {
        throw error;
      }

      /*
       * Mark this as a new account.
       */
      if (
        typeof window !==
        "undefined"
      ) {
        localStorage.setItem(
          NEW_ACCOUNT_KEY,
          "true"
        );

        localStorage.setItem(
          REMEMBER_ME_KEY,
          String(
            rememberMe
          )
        );
      }

      /*
       * Supabase may automatically
       * return a session depending on
       * email confirmation settings.
       *
       * Sign out so the user must
       * verify their email first.
       */
      if (data.session) {
        await supabase.auth.signOut();
      }

      /*
       * Return to landing page.
       */
      setShowAuthOnLanding(
        false
      );

      setShowEmailToast(
        true
      );

      setShowSignupNotice(
        false
      );

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "Authentication failed:",
        error
      );

      if (
        error instanceof Error
      ) {
        setAuthError(
          error.message
        );
      } else {
        setAuthError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  /*
   * =========================================================
   * SAVE MINDPLAY NAME
   * =========================================================
   */

  async function handleSaveName(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName =
      mindPlayName.trim();

    setNameError("");

    if (!trimmedName) {
      setNameError(
        "Please enter a MindPlay name."
      );

      return;
    }

    if (
      trimmedName.length <
      3
    ) {
      setNameError(
        "MindPlay name must be at least 3 characters."
      );

      return;
    }

    if (
      trimmedName.length >
      20
    ) {
      setNameError(
        "MindPlay name must be 20 characters or less."
      );

      return;
    }

    setIsSavingName(
      true
    );

    try {
      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      /*
       * Save the name to Supabase.
       */
      const {
        error,
      } =
        await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              mindplay_name:
                trimmedName,
            },
            {
              onConflict:
                "id",
            }
          );

      if (error) {
        throw error;
      }

      /*
       * Save the name locally.
       *
       * savePlayerName() is intentionally
       * not used because your progress.ts
       * does not export that function.
       */
      if (
        typeof window !==
        "undefined"
      ) {
        localStorage.setItem(
          "mindplay-active-user-id",
          user.id
        );

        localStorage.setItem(
          "mindplay-player-name",
          trimmedName
        );
      }

      /*
       * Sync local progress
       * to this Supabase account.
       */
      await syncLocalProgressToSupabase();

      /*
       * Account setup is complete.
       */
      if (
        typeof window !==
        "undefined"
      ) {
        localStorage.removeItem(
          NEW_ACCOUNT_KEY
        );
      }

      setProfileExists(
        true
      );

      setIsNewAccount(
        false
      );
    } catch (error) {
      console.error(
        "Failed to save MindPlay name:",
        error
      );

      if (
        error instanceof Error
      ) {
        setNameError(
          error.message
        );
      } else {
        setNameError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setIsSavingName(
        false
      );
    }
  }

  /*
   * =========================================================
   * CLOSE EMAIL TOAST
   * =========================================================
   */

  function closeEmailToast() {
    setShowEmailToast(
      false
    );
  }

  /*
   * =========================================================
   * SCREEN LOGIC
   * =========================================================
   */

  if (!sessionReady) {
    return <>{children}</>;
  }

  const isLandingPage =
    pathname === "/";

  const shouldShowLanding =
    !hasSession &&
    isLandingPage &&
    !showAuthOnLanding;

  const shouldShowAuth =
    !hasSession &&
    (!isLandingPage ||
      showAuthOnLanding);

  const shouldShowNameSetup =
    hasSession &&
    profileChecked &&
    !profileExists &&
    isNewAccount;

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <>
      {shouldShowLanding ? (
        <LandingPage
          onLogin={openLogin}
          onSignup={openSignup}
        />
      ) : (
        children
      )}

      {/* =====================================================
          EMAIL VERIFICATION TOAST
          ===================================================== */}

      {showEmailToast && (
        <div className="fixed inset-x-0 top-5 z-100 flex justify-center px-5">
          <div className="w-full max-w-md rounded-2xl border border-cyan-300/15 bg-[#0d1222]/95 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                📩
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-black uppercase tracking-wider text-white">
                  Check your email
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/50">
                  We sent a verification
                  link to your email.
                  Verify your account,
                  then log in to continue.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeEmailToast
                }
                className="text-white/30 transition hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          AUTH MODAL
          ===================================================== */}

      {shouldShowAuth && (
        <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
          <div
            aria-labelledby="auth-title"
            aria-modal="true"
            className="w-full max-w-md rounded-4xl border border-cyan-300/15 bg-[#0d1222]/95 p-6 shadow-2xl shadow-cyan-950/30 sm:p-8"
            role="dialog"
          >
            {/* Back to landing */}

            {isLandingPage &&
              showAuthOnLanding && (
                <button
                  className="mb-5 text-sm font-bold text-white/40 transition hover:text-cyan-300"
                  onClick={
                    backToLanding
                  }
                  type="button"
                >
                  ← BACK
                </button>
              )}

            {/* Header */}

            <div className="mb-6 text-center">
              <div className="text-3xl">
                🧠
              </div>

              <h1
                id="auth-title"
                className="mt-3 text-2xl font-black tracking-tight text-white"
              >
                {authMode ===
                "login"
                  ? "Welcome back"
                  : "Create your account"}
              </h1>

              <p className="mt-2 text-sm text-white/40">
                {authMode ===
                "login"
                  ? "Log in to continue playing."
                  : "Start training your mind with MindPlay."}
              </p>
            </div>

            {/* Auth form */}

            <form
              onSubmit={
                handleAuthSubmit
              }
              className="space-y-4"
            >
              {/* Email */}

              <div>
                <label
                  htmlFor="auth-email"
                  className="text-xs font-bold text-white/60"
                >
                  Email
                </label>

                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  disabled={
                    isSubmitting
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-300/30 focus:bg-white/7 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Password */}

              <div>
                <label
                  htmlFor="auth-password"
                  className="text-xs font-bold text-white/60"
                >
                  Password
                </label>

                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target
                        .value
                    )
                  }
                  autoComplete={
                    authMode ===
                    "login"
                      ? "current-password"
                      : "new-password"
                  }
                  placeholder="Your password"
                  required
                  disabled={
                    isSubmitting
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-300/30 focus:bg-white/7 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Confirm password */}

              {authMode ===
                "signup" && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="text-xs font-bold text-white/60"
                  >
                    Confirm password
                  </label>

                  <input
                    id="auth-confirm-password"
                    type="password"
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setConfirmPassword(
                        event.target
                          .value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    required
                    disabled={
                      isSubmitting
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-300/30 focus:bg-white/7 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}

              {/* Remember Me */}

              <label className="flex cursor-pointer items-center gap-3 py-1">
                <input
                  type="checkbox"
                  checked={
                    rememberMe
                  }
                  onChange={(
                    event
                  ) =>
                    setRememberMe(
                      event.target
                        .checked
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  className="h-4 w-4 accent-cyan-300"
                />

                <span className="text-sm text-white/45">
                  Remember me
                </span>
              </label>

              {/* Error */}

              {authError && (
                <div className="rounded-xl border border-red-300/10 bg-red-300/5 px-4 py-3 text-sm leading-5 text-red-200/80">
                  {
                    authError
                  }
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="mp-button w-full bg-white px-5 py-3.5 text-sm text-black hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "PLEASE WAIT..."
                  : authMode ===
                      "login"
                    ? "LOG IN"
                    : "CREATE ACCOUNT"}
              </button>
            </form>

            {/* Switch auth mode */}

            <div className="mt-6 text-center">
              {authMode ===
              "login" ? (
                <p className="text-sm text-white/30">
                  Don&apos;t have an
                  account?{" "}
                  <button
                    type="button"
                    onClick={
                      openSignup
                    }
                    className="font-bold text-cyan-300/80 transition hover:text-cyan-300"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-sm text-white/30">
                  Already have an
                  account?{" "}
                  <button
                    type="button"
                    onClick={
                      openLogin
                    }
                    className="font-bold text-cyan-300/80 transition hover:text-cyan-300"
                  >
                    Log in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MINDPLAY NAME SETUP
          ===================================================== */}

      {shouldShowNameSetup && (
        <div className="fixed inset-0 z-95 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
          <div
            aria-labelledby="mindplay-name-title"
            aria-modal="true"
            className="w-full max-w-md rounded-4xl border border-cyan-300/15 bg-[#0d1222]/95 p-6 shadow-2xl shadow-cyan-950/30 sm:p-8"
            role="dialog"
          >
            <div className="text-center">
              <div className="text-4xl">
                🧠
              </div>

              <h1
                id="mindplay-name-title"
                className="mt-4 text-2xl font-black tracking-tight text-white"
              >
                Create your
                MindPlay name
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/40">
                Choose the name you
                want to use inside
                MindPlay.
              </p>
            </div>

            <form
              onSubmit={
                handleSaveName
              }
              className="mt-7"
            >
              <label
                htmlFor="mindplay-name"
                className="text-xs font-bold text-white/60"
              >
                MindPlay name
              </label>

              <input
                id="mindplay-name"
                type="text"
                value={
                  mindPlayName
                }
                onChange={(
                  event
                ) =>
                  setMindPlayName(
                    event.target
                      .value
                  )
                }
                autoComplete="off"
                autoFocus
                maxLength={20}
                placeholder="Your player name"
                disabled={
                  isSavingName
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-300/30 focus:bg-white/7 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <p className="mt-2 text-xs text-white/25">
                3–20 characters
              </p>

              {nameError && (
                <div className="mt-4 rounded-xl border border-red-300/10 bg-red-300/5 px-4 py-3 text-sm text-red-200/80">
                  {
                    nameError
                  }
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isSavingName
                }
                className="mp-button mt-6 w-full bg-white px-5 py-3.5 text-sm text-black hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingName
                  ? "SYNCING..."
                  : "SYNC"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-5 text-white/25">
              Your MindPlay name
              is permanent after
              syncing.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          SIGNUP NOTICE
          ===================================================== */}

      {showSignupNotice && (
        <div className="fixed inset-x-0 bottom-5 z-100 flex justify-center px-5">
          <div className="w-full max-w-md rounded-2xl border border-cyan-300/15 bg-[#0d1222]/95 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
            <p className="text-sm leading-6 text-white/60">
              Please check your
              email and verify
              your account before
              logging in.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowSignupNotice(
                  false
                )
              }
              className="mt-3 text-xs font-black uppercase tracking-wider text-cyan-300/80 hover:text-cyan-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}