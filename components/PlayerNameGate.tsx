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

export default function PlayerNameGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [profileChecked, setProfileChecked] =
    useState(false);
  const [profileExists, setProfileExists] =
    useState(false);

  const [authMode, setAuthMode] =
    useState<AuthMode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(true);

  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showSignupNotice, setShowSignupNotice] =
    useState(false);

  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSavingName, setIsSavingName] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile(userId: string) {
      const { data: profile, error } =
        await supabase
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
      } else if (profile) {
        setProfileExists(true);
        savePlayerName(profile.mindplay_name);

        await syncLocalProgressToSupabase();
      } else {
        setProfileExists(false);
      }

      setProfileChecked(true);
    }

    async function loadSession() {
      const { data } =
        await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      const session = data.session;

      setHasSession(Boolean(session));

      if (!session) {
        setProfileExists(false);
        setProfileChecked(true);
        setSessionReady(true);
        return;
      }

      await loadProfile(session.user.id);

      if (!mounted) {
        return;
      }

      setSessionReady(true);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return;
        }

        setHasSession(Boolean(session));
        setProfileChecked(false);

        if (!session) {
          setProfileExists(false);
          setProfileChecked(true);
          return;
        }

        window.setTimeout(() => {
          if (!mounted) {
            return;
          }

          void loadProfile(session.user.id);
        }, 0);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  const handleAuthSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setAuthError("");
    setAuthMessage("");

    if (authMode === "signup") {
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

  async function login() {
    setIsSubmitting(true);
    setAuthError("");
    setAuthMessage("");

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "mindplay-remember-me",
        rememberMe ? "true" : "false",
      );
    }

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setIsSubmitting(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
  }

  async function signup() {
    setIsSubmitting(true);
    setAuthError("");
    setAuthMessage("");

    const { data, error } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

    setIsSubmitting(false);

    if (error) {
      if (
        error.message
          .toLowerCase()
          .includes("already registered")
      ) {
        setAuthError(
          "This email is already registered. Please log in instead.",
        );
      } else {
        setAuthError(error.message);
      }

      setShowSignupNotice(false);
      return;
    }

    setShowSignupNotice(false);
    setPassword("");
    setConfirmPassword("");

    if (!data.session) {
      setAuthMessage(
        "Account created! Please check your email and confirm your account before logging in.",
      );
    }
  }

  async function handleNameSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = nameInput.trim();

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setNameError(
        "Your session has expired. Please log in again.",
      );

      setIsSavingName(false);
      setHasSession(false);
      setProfileChecked(true);

      return;
    }

    const { error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        mindplay_name: name,
      });

    if (error) {
      if (error.code === "23505") {
        setNameError(
          "Your MindPlay profile already exists.",
        );
      } else {
        setNameError(error.message);
      }

      setIsSavingName(false);
      return;
    }

    savePlayerName(name);

    await syncLocalProgressToSupabase();

    setProfileExists(true);
    setProfileChecked(true);
    setIsSavingName(false);
  }

  if (!sessionReady) {
    return <>{children}</>;
  }

  const shouldShowAuth =
    !hasSession;

  const shouldShowNameSetup =
    hasSession &&
    profileChecked &&
    !profileExists;

  return (
    <>
      {children}

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
                {authMode === "login"
                  ? "WELCOME BACK"
                  : "CREATE ACCOUNT"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/45">
                {authMode === "login"
                  ? "Log in to continue your MindPlay journey."
                  : "Create your one-time MindPlay account."}
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={handleAuthSubmit}
            >
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
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setAuthError("");
                    setAuthMessage("");
                  }}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-white/45"
                  htmlFor="auth-password"
                >
                  Password
                </label>

                <input
                  autoComplete={
                    authMode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5 text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                  id="auth-password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setAuthError("");
                    setAuthMessage("");
                  }}
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={password}
                />
              </div>

              {authMode === "login" && (
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    checked={rememberMe}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-300"
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked,
                      )
                    }
                    type="checkbox"
                  />

                  <span className="text-sm text-white/50">
                    Remember me
                  </span>
                </label>
              )}

              {authMode === "signup" && (
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
                      onChange={(event) => {
                        setConfirmPassword(
                          event.target.value,
                        );
                        setAuthError("");
                      }}
                      placeholder="Enter your password again"
                      required
                      type="password"
                      value={confirmPassword}
                    />
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-wider text-white/45">
                      Password requirements
                    </p>

                    <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                      <PasswordRule
                        valid={hasValidPassword}
                        text="At least 8 characters"
                      />

                      <PasswordRule
                        valid={hasLowercase}
                        text="Lowercase letter"
                      />

                      <PasswordRule
                        valid={hasUppercase}
                        text="Uppercase letter"
                      />

                      <PasswordRule
                        valid={hasNumber}
                        text="Number"
                      />

                      <PasswordRule
                        valid={hasSymbol}
                        text="Symbol"
                      />

                      <PasswordRule
                        valid={passwordsMatch}
                        text="Passwords match"
                      />
                    </div>
                  </div>
                </>
              )}

              {authError && (
                <p
                  className="text-sm leading-5 text-rose-300"
                  role="alert"
                >
                  {authError}
                </p>
              )}

              {authMessage && (
                <p
                  className="text-sm leading-5 text-emerald-300"
                  role="status"
                >
                  {authMessage}
                </p>
              )}

              <button
                className="mp-button w-full bg-white px-5 py-3.5 text-sm text-black shadow-lg shadow-white/5 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={
                  isSubmitting ||
                  (authMode === "signup" &&
                    !isPasswordValid)
                }
                type="submit"
              >
                {isSubmitting
                  ? "PLEASE WAIT..."
                  : authMode === "login"
                    ? "LOG IN"
                    : "SIGN UP"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                className="text-sm text-white/45 transition hover:text-cyan-300"
                onClick={() => {
                  setAuthMode(
                    authMode === "login"
                      ? "signup"
                      : "login",
                  );
                  setAuthError("");
                  setAuthMessage("");
                }}
                type="button"
              >
                {authMode === "login"
                  ? "New to MindPlay? SIGN UP"
                  : "Already have an account? LOG IN"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                This name cannot be edited. Please be
                sure before you click SYNC.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={handleNameSubmit}
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
                  onChange={(event) => {
                    setNameInput(event.target.value);
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
                disabled={isSavingName}
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
                This is a one-time sign up. Please
                don&apos;t forget your email and
                password.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                disabled={isSubmitting}
                onClick={() =>
                  setShowSignupNotice(false)
                }
                type="button"
              >
                GO BACK
              </button>

              <button
                className="mp-button bg-white px-4 py-3 text-sm text-black hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
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