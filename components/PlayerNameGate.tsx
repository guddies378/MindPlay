"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { savePlayerName } from "@/lib/player";
import {
  syncLocalProgressToSupabase,
} from "@/lib/progress";

type AuthMode = "login" | "signup";

const NEW_ACCOUNT_KEY =
  "mindplay-new-account";

const REMEMBER_ME_KEY =
  "mindplay-remember-me";

export default function PlayerNameGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

  /*
   * Only true when the user recently created
   * a new MindPlay account.
   */
  const [isNewAccount, setIsNewAccount] =
    useState(false);

  /*
   * =========================================================
   * AUTH FORM
   * =========================================================
   */

  const [authMode, setAuthMode] =
    useState<AuthMode>("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  /*
   * Lazy initialization avoids the
   * react-hooks/set-state-in-effect lint error.
   */
  const [rememberMe, setRememberMe] =
    useState(() => {
      if (
        typeof window === "undefined"
      ) {
        return true;
      }

      const savedRememberMe =
        localStorage.getItem(
          REMEMBER_ME_KEY,
        );

      if (
        savedRememberMe === null
      ) {
        return true;
      }

      return savedRememberMe === "true";
    });

  const [authError, setAuthError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /*
   * =========================================================
   * SIGNUP MODALS
   * =========================================================
   */

  const [showSignupNotice, setShowSignupNotice] =
    useState(false);

  const [showEmailToast, setShowEmailToast] =
    useState(false);

  /*
   * =========================================================
   * MINDPLAY NAME
   * =========================================================
   */

  const [nameInput, setNameInput] =
    useState("");

  const [nameError, setNameError] =
    useState("");

  const [isSavingName, setIsSavingName] =
    useState(false);

  /*
   * =========================================================
   * SESSION + PROFILE INITIALIZATION
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadProfile(
      userId: string,
    ) {
      const {
        data: profile,
        error,
      } = await supabase
        .from("profiles")
        .select("mindplay_name")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Failed to load MindPlay profile:",
          error.message,
        );

        setProfileExists(false);
        setProfileChecked(true);

        return;
      }

      /*
       * =====================================================
       * EXISTING PROFILE
       * =====================================================
       */

      if (profile) {
        setProfileExists(true);
        setProfileChecked(true);

        savePlayerName(
          profile.mindplay_name,
        );

        await syncLocalProgressToSupabase();

        if (!mounted) {
          return;
        }

        /*
         * This account already has its permanent
         * MindPlay name.
         */
        setIsNewAccount(false);

        if (
          typeof window !== "undefined"
        ) {
          localStorage.removeItem(
            NEW_ACCOUNT_KEY,
          );
        }

        return;
      }

      /*
       * =====================================================
       * NO PROFILE
       * =====================================================
       *
       * Only show the name setup for an account that
       * was actually created through the signup flow.
       */

      const newAccount =
        typeof window !== "undefined" &&
        localStorage.getItem(
          NEW_ACCOUNT_KEY,
        ) === "true";

      setIsNewAccount(
        newAccount,
      );

      setProfileExists(false);
      setProfileChecked(true);
    }

    async function loadSession() {
      const {
        data,
      } =
        await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      const session =
        data.session;

      /*
       * =====================================================
       * NO SESSION
       * =====================================================
       */

      if (!session) {
        setHasSession(false);
        setProfileExists(false);
        setProfileChecked(true);
        setIsNewAccount(false);
        setSessionReady(true);

        return;
      }

      /*
       * =====================================================
       * SESSION EXISTS
       * =====================================================
       *
       * This includes a session restored because
       * Remember Me was checked.
       *
       * Therefore:
       *
       * NO LOGIN SCREEN.
       */

      setHasSession(true);
      setProfileChecked(false);

      await loadProfile(
        session.user.id,
      );

      if (!mounted) {
        return;
      }

      setSessionReady(true);
    }

    void loadSession();

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
        (_event, session) => {
          if (!mounted) {
            return;
          }

          /*
           * User logged out.
           */
          if (!session) {
            setHasSession(false);
            setProfileExists(false);
            setProfileChecked(true);
            setIsNewAccount(false);

            return;
          }

          /*
           * User logged in or an authentication
           * session was restored.
           */
          setHasSession(true);
          setProfileChecked(false);

          /*
           * Run the profile query outside the
           * auth callback.
           */
          window.setTimeout(
            () => {
              if (!mounted) {
                return;
              }

              void loadProfile(
                session.user.id,
              );
            },
            0,
          );
        },
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * =========================================================
   * PASSWORD VALIDATION
   * =========================================================
   */

  const hasValidPassword =
    password.length >= 8;

  const hasLowercase =
    /[a-z]/.test(password);

  const hasUppercase =
    /[A-Z]/.test(password);

  const hasNumber =
    /[0-9]/.test(password);

  const hasSymbol =
    /[!@#$%^&*()[\]{}\-_=+,.?/:;"'`~\\|<>]/.test(
      password,
    );

  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;

  const isPasswordValid =
    hasValidPassword &&
    hasLowercase &&
    hasUppercase &&
    hasNumber &&
    hasSymbol &&
    passwordsMatch;

  /*
   * =========================================================
   * AUTH SUBMIT
   * =========================================================
   */

  const handleAuthSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setAuthError("");

    if (
      authMode === "signup"
    ) {
      if (!isPasswordValid) {
        setAuthError(
          "Please meet all password requirements.",
        );

        return;
      }

      setShowSignupNotice(true);

      return;
    }

    void login();
  };

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   */

  async function login() {
    setIsSubmitting(true);
    setAuthError("");

    const cleanEmail =
      email.trim();

    /*
     * Save Remember Me before authentication.
     *
     * lib/supabase.ts uses this value to determine
     * whether Supabase stores its session in:
     *
     * localStorage
     *
     * or
     *
     * sessionStorage
     */
    if (
      typeof window !== "undefined"
    ) {
      localStorage.setItem(
        REMEMBER_ME_KEY,
        rememberMe
          ? "true"
          : "false",
      );
    }

    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email: cleanEmail,
          password,
        },
      );

    /*
     * Login failed.
     */
    if (error) {
      setIsSubmitting(false);
      setAuthError(
        error.message,
      );

      return;
    }

    if (!data.user) {
      setIsSubmitting(false);
      setAuthError(
        "Login failed. Please try again.",
      );

      return;
    }

    /*
     * =======================================================
     * LOGIN SUCCESS
     * =======================================================
     */

    setHasSession(true);
    setProfileChecked(false);

    setPassword("");
    setConfirmPassword("");

    /*
     * Check the user's profile.
     */
    const {
      data: profile,
      error: profileError,
    } =
      await supabase
        .from("profiles")
        .select("mindplay_name")
        .eq("id", data.user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Failed to load MindPlay profile:",
        profileError.message,
      );

      /*
       * Do not assume this is a new account
       * if the database request failed.
       */
      setProfileExists(false);
      setProfileChecked(true);
      setIsNewAccount(false);
      setIsSubmitting(false);

      return;
    }

    /*
     * =======================================================
     * EXISTING USER
     * =======================================================
     */

    if (profile) {
      setProfileExists(true);
      setProfileChecked(true);

      savePlayerName(
        profile.mindplay_name,
      );

      await syncLocalProgressToSupabase();

      /*
       * Existing user does not need name setup.
       */
      setIsNewAccount(false);

      if (
        typeof window !== "undefined"
      ) {
        localStorage.removeItem(
          NEW_ACCOUNT_KEY,
        );
      }

      setIsSubmitting(false);

      return;
    }

    /*
     * =======================================================
     * NEW USER WITHOUT PROFILE
     * =======================================================
     */

    const newAccount =
      typeof window !== "undefined" &&
      localStorage.getItem(
        NEW_ACCOUNT_KEY,
      ) === "true";

    setProfileExists(false);
    setProfileChecked(true);
    setIsNewAccount(
      newAccount,
    );

    setIsSubmitting(false);
  }

  /*
   * =========================================================
   * SIGNUP
   * =========================================================
   */

  async function signup() {
    setIsSubmitting(true);
    setAuthError("");

    const cleanEmail =
      email.trim();

    const {
      data,
      error,
    } =
      await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

    if (error) {
      setIsSubmitting(false);

      if (
        error.message
          .toLowerCase()
          .includes(
            "already registered",
          )
      ) {
        setAuthError(
          "This email is already registered. Please log in instead.",
        );
      } else {
        setAuthError(
          error.message,
        );
      }

      setShowSignupNotice(false);

      return;
    }

    /*
     * Mark this account as newly created.
     *
     * This marker is used later after login to
     * show CREATE YOUR MINDPLAY NAME.
     */
    if (
      typeof window !== "undefined"
    ) {
      localStorage.setItem(
        NEW_ACCOUNT_KEY,
        "true",
      );
    }

    /*
     * Some Supabase configurations automatically
     * create a session after signup.
     *
     * We don't want to skip the email confirmation
     * + login flow, so sign the user out.
     */
    if (data.session) {
      await supabase.auth.signOut();
    }

    setHasSession(false);
    setProfileChecked(true);
    setProfileExists(false);
    setIsNewAccount(true);

    setIsSubmitting(false);

    setShowSignupNotice(false);

    setAuthMode("login");

    setPassword("");
    setConfirmPassword("");

    /*
     * Show:
     *
     * CHECK YOUR EMAIL
     */
    setShowEmailToast(true);
  }

  /*
   * =========================================================
   * CREATE MINDPLAY NAME
   * =========================================================
   */

  async function handleNameSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name =
      nameInput.trim();

    /*
     * Validate name length.
     */
    if (name.length < 2) {
      setNameError(
        "Please enter at least 2 characters.",
      );

      return;
    }

    if (name.length > 20) {
      setNameError(
        "Please keep your name under 20 characters.",
      );

      return;
    }

    setIsSavingName(true);
    setNameError("");

    /*
     * Confirm authenticated user.
     */
    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    if (!user) {
      setNameError(
        "Your session has expired. Please log in again.",
      );

      setIsSavingName(false);

      setHasSession(false);
      setProfileChecked(true);
      setProfileExists(false);
      setIsNewAccount(false);

      return;
    }

    /*
     * =======================================================
     * CREATE PERMANENT PROFILE
     * =======================================================
     */

    const {
      error,
    } =
      await supabase
        .from("profiles")
        .insert({
          id: user.id,
          mindplay_name: name,
        });

    if (error) {
      if (
        error.code === "23505"
      ) {
        setNameError(
          "Your MindPlay profile already exists.",
        );
      } else {
        setNameError(
          error.message,
        );
      }

      setIsSavingName(false);

      return;
    }

    /*
     * Save name locally.
     */
    savePlayerName(name);

    /*
     * Sync any existing local progress.
     */
    await syncLocalProgressToSupabase();

    /*
     * =======================================================
     * PROFILE COMPLETE
     * =======================================================
     */

    setProfileExists(true);
    setProfileChecked(true);
    setIsNewAccount(false);

    /*
     * Delete temporary signup marker.
     */
    if (
      typeof window !== "undefined"
    ) {
      localStorage.removeItem(
        NEW_ACCOUNT_KEY,
      );
    }

    setNameInput("");
    setIsSavingName(false);
  }

  /*
   * =========================================================
   * WAIT FOR INITIAL SESSION CHECK
   * =========================================================
   */

  if (!sessionReady) {
    return <>{children}</>;
  }

  /*
   * =========================================================
   * SCREEN LOGIC
   * =========================================================
   */

  /*
   * No active session:
   * show LOGIN / SIGNUP.
   */
  const shouldShowAuth =
    !hasSession;

  /*
   * New account + no profile:
   * show CREATE YOUR MINDPLAY NAME.
   *
   * Returning users will NOT see this.
   */
  const shouldShowNameSetup =
    hasSession &&
    profileChecked &&
    !profileExists &&
    isNewAccount;

  return (
    <>
      {children}

      {/* =====================================================
          CHECK YOUR EMAIL
          ===================================================== */}

      {showEmailToast && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#050711]/80 px-5 backdrop-blur-md">
          <div
            aria-labelledby="email-confirmation-title"
            aria-modal="true"
            className="w-full max-w-md rounded-4xl border border-cyan-300/15 bg-[#0d1222]/95 p-6 shadow-2xl shadow-cyan-950/40 sm:p-8"
            role="dialog"
          >
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-3xl shadow-lg shadow-cyan-950/20">
                ✉️
              </div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300/60">
                Account created
              </p>

              <h2
                id="email-confirmation-title"
                className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl"
              >
                CHECK YOUR EMAIL
              </h2>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/50">
                We sent a confirmation link
                to your email. Please confirm
                your account before logging in.
              </p>

              <button
                className="mp-button mt-6 w-full bg-white px-5 py-3.5 text-sm text-black shadow-lg shadow-white/5 hover:bg-cyan-50"
                onClick={() =>
                  setShowEmailToast(false)
                }
                type="button"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LOGIN / SIGNUP
          ===================================================== */}

      {shouldShowAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050711]/80 px-5 py-6 backdrop-blur-md">
          <div
            aria-labelledby="auth-title"
            aria-modal="true"
            className="w-full max-w-md rounded-4xl border border-cyan-300/15 bg-[#0d1222]/95 p-6 shadow-2xl shadow-cyan-950/30 sm:p-8"
            role="dialog"
          >
            <div className="mb-6 text-center">
              <div className="mb-4 text-5xl">
                🧠
              </div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300/60">
                Welcome to MindPlay
              </p>

              <h1
                className="mt-2 text-3xl font-black tracking-tight text-white"
                id="auth-title"
              >
                {authMode ===
                "login"
                  ? "WELCOME BACK"
                  : "CREATE ACCOUNT"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/45">
                {authMode ===
                "login"
                  ? "Log in to continue your MindPlay journey."
                  : "Create your one-time MindPlay account."}
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={
                handleAuthSubmit
              }
            >
              {/* EMAIL */}

              <div>
                <label
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-white/45"
                  htmlFor="auth-email"
                >
                  Email
                </label>

                <input
                  autoComplete="email"
                  autoFocus
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5 text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                  id="auth-email"
                  onChange={(
                    event,
                  ) => {
                    setEmail(
                      event.target.value,
                    );

                    setAuthError("");
                  }}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-white/45"
                  htmlFor="auth-password"
                >
                  Password
                </label>

                <input
                  autoComplete={
                    authMode ===
                    "login"
                      ? "current-password"
                      : "new-password"
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5 text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                  id="auth-password"
                  onChange={(
                    event,
                  ) => {
                    setPassword(
                      event.target.value,
                    );

                    setAuthError("");
                  }}
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={password}
                />
              </div>

              {/* REMEMBER ME */}

              {authMode ===
                "login" && (
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    checked={
                      rememberMe
                    }
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-300"
                    onChange={(
                      event,
                    ) =>
                      setRememberMe(
                        event.target
                          .checked,
                      )
                    }
                    type="checkbox"
                  />

                  <span className="text-sm text-white/50">
                    Remember me
                  </span>
                </label>
              )}

              {/* CONFIRM PASSWORD */}

              {authMode ===
                "signup" && (
                <>
                  <div>
                    <label
                      className="mb-2 block text-xs font-black uppercase tracking-wider text-white/45"
                      htmlFor="confirm-password"
                    >
                      Confirm Password
                    </label>

                    <input
                      autoComplete="new-password"
                      className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5 text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                      id="confirm-password"
                      onChange={(
                        event,
                      ) => {
                        setConfirmPassword(
                          event.target
                            .value,
                        );

                        setAuthError("");
                      }}
                      placeholder="Enter your password again"
                      required
                      type="password"
                      value={
                        confirmPassword
                      }
                    />
                  </div>

                  {/* PASSWORD REQUIREMENTS */}

                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-wider text-white/45">
                      Password requirements
                    </p>

                    <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                      <PasswordRule
                        valid={
                          hasValidPassword
                        }
                        text="At least 8 characters"
                      />

                      <PasswordRule
                        valid={
                          hasLowercase
                        }
                        text="Lowercase letter"
                      />

                      <PasswordRule
                        valid={
                          hasUppercase
                        }
                        text="Uppercase letter"
                      />

                      <PasswordRule
                        valid={
                          hasNumber
                        }
                        text="Number"
                      />

                      <PasswordRule
                        valid={
                          hasSymbol
                        }
                        text="Symbol"
                      />

                      <PasswordRule
                        valid={
                          passwordsMatch
                        }
                        text="Passwords match"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* AUTH ERROR */}

              {authError && (
                <p
                  className="text-sm leading-5 text-rose-300"
                  role="alert"
                >
                  {authError}
                </p>
              )}

              {/* SUBMIT BUTTON */}

              <button
                className="mp-button w-full bg-white px-5 py-3.5 text-sm text-black shadow-lg shadow-white/5 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={
                  isSubmitting ||
                  (authMode ===
                    "signup" &&
                    !isPasswordValid)
                }
                type="submit"
              >
                {isSubmitting
                  ? "PLEASE WAIT..."
                  : authMode ===
                      "login"
                    ? "LOG IN"
                    : "SIGN UP"}
              </button>
            </form>

            {/* SWITCH LOGIN / SIGNUP */}

            <div className="mt-6 text-center">
              <button
                className="text-sm text-white/45 transition hover:text-cyan-300"
                onClick={() => {
                  setAuthMode(
                    authMode ===
                      "login"
                      ? "signup"
                      : "login",
                  );

                  setAuthError("");
                }}
                type="button"
              >
                {authMode ===
                "login"
                  ? "New to MindPlay? SIGN UP"
                  : "Already have an account? LOG IN"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CREATE YOUR MINDPLAY NAME
          ===================================================== */}

      {shouldShowNameSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050711]/80 px-5 backdrop-blur-md">
          <div
            aria-labelledby="player-name-title"
            aria-modal="true"
            className="w-full max-w-md rounded-4xl border border-cyan-300/15 bg-[#0d1222]/95 p-6 shadow-2xl shadow-cyan-950/30 sm:p-8"
            role="dialog"
          >
            <div className="mb-6 text-center">
              <div className="mb-4 text-5xl">
                🧠
              </div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300/60">
                Account ready
              </p>

              <h1
                className="mt-2 text-3xl font-black tracking-tight text-white"
                id="player-name-title"
              >
                CREATE YOUR MINDPLAY NAME
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/45">
                Choose a name you&apos;ll
                be happy to keep.
              </p>
            </div>

            {/* PERMANENT NAME WARNING */}

            <div className="mb-5 rounded-2xl border border-amber-300/15 bg-amber-300/5 p-4 text-left">
              <p className="text-xs font-black uppercase tracking-wider text-amber-300">
                ⚠️ Important
              </p>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Choose your name carefully.
                Once you click{" "}
                <span className="font-bold text-white">
                  SYNC
                </span>
                , your MindPlay name
                will be
                <span className="font-bold text-white">
                  {" "}
                  permanently saved and
                  cannot be changed later.
                </span>
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={
                handleNameSubmit
              }
            >
              <div>
                <label
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-white/45"
                  htmlFor="player-name"
                >
                  MindPlay name
                </label>

                <input
                  autoFocus
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5 text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                  id="player-name"
                  maxLength={20}
                  onChange={(
                    event,
                  ) => {
                    setNameInput(
                      event.target.value,
                    );

                    setNameError("");
                  }}
                  placeholder="Who's thinking today?..."
                  required
                  value={nameInput}
                />
              </div>

              {nameError && (
                <p
                  className="text-sm text-rose-300"
                  role="alert"
                >
                  {nameError}
                </p>
              )}

              <button
                className="mp-button w-full bg-white px-5 py-3.5 text-sm text-black shadow-lg shadow-white/5 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  isSavingName
                }
                type="submit"
              >
                {isSavingName
                  ? "SYNCING..."
                  : "SYNC"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          SIGNUP WARNING
          ===================================================== */}

      {showSignupNotice && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#050711]/90 px-5 backdrop-blur-md">
          <div
            aria-labelledby="signup-notice-title"
            aria-modal="true"
            className="w-full max-w-md rounded-4xl border border-cyan-300/15 bg-[#0d1222] p-6 shadow-2xl shadow-cyan-950/30 sm:p-8"
            role="dialog"
          >
            <div className="mb-6 text-center">
              <div className="mb-4 text-5xl">
                ⚠️
              </div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300/60">
                One-time sign up
              </p>

              <h2
                className="mt-2 text-2xl font-black tracking-tight text-white"
                id="signup-notice-title"
              >
                PLEASE REMEMBER
              </h2>

              <p className="mt-4 text-sm leading-6 text-white/55">
                This is a one-time sign up.
                Please don&apos;t forget your
                email and password.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                disabled={
                  isSubmitting
                }
                onClick={() =>
                  setShowSignupNotice(
                    false,
                  )
                }
                type="button"
              >
                GO BACK
              </button>

              <button
                className="mp-button bg-white px-4 py-3 text-sm text-black hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  isSubmitting
                }
                onClick={() => {
                  void signup();
                }}
                type="button"
              >
                {isSubmitting
                  ? "CREATING..."
                  : "CREATE ACCOUNT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/*
 * ===========================================================
 * PASSWORD RULE
 * ===========================================================
 */

function PasswordRule({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={
        valid
          ? "flex items-center gap-2 text-emerald-300"
          : "flex items-center gap-2 text-white/35"
      }
    >
      <span aria-hidden="true">
        {valid ? "✓" : "✗"}
      </span>

      <span>{text}</span>
    </div>
  );
}