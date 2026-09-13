"use client";

import type {
  FormEvent,
  ReactNode,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import {
  getRememberMePreference,
  hasSessionOnlyMarker,
  setRememberMePreference,
  setSessionOnlyMarker,
  supabase,
} from "@/lib/supabase";

import {
  loadProgressFromSupabase,
} from "@/lib/progress";

import {
  loadDailyChallengeFromSupabase,
} from "@/lib/dailyChallenge";

import LandingPage from "@/components/LandingPage";

type AuthMode =
  | "login"
  | "signup";

type OnboardingStep =
  | "none"
  | "account-warning"
  | "account-created"
  | "name-warning"
  | "ready-to-play";

/*
 * =========================================================
 * ONBOARDING POPUP
 * =========================================================
 */

function OnboardingPopup({
  step,
  onContinue,
}: {
  step: OnboardingStep;
  onContinue: () => void;
}) {
  if (step === "none") {
    return null;
  }

  const content = {
    "account-warning": {
      icon: "🧠",
      title: "Before you begin",
      message:
        "Your email and password are used to access your MindPlay account. Keep them somewhere safe — these credentials cannot be edited through MindPlay.",
      button: "I UNDERSTAND",
    },

    "account-created": {
      icon: "✨",
      title: "Account created successfully",
      message:
        "Welcome to MindPlay! Your account is ready. Let's get you set up and ready to play.",
      button: "LET'S GO",
    },

    "name-warning": {
      icon: "🧠",
      title: "Choose your MindPlay name",
      message:
        "This is the name you'll use throughout your MindPlay journey. Choose carefully — once you sync it, your MindPlay name cannot be edited.",
      button: "LET'S DO IT",
    },

    "ready-to-play": {
      icon: "🚀",
      title: "You're all set",
      message:
        "Your account and MindPlay name are ready. Time to put your mind to the test — your first challenge is waiting.",
      button: "LET'S PLAY",
    },
  }[step];

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/75 px-5 backdrop-blur-md">
      <div
        key={step}
        className="w-full max-w-md animate-[mindplayPop_0.3s_ease-out] rounded-4xl border border-cyan-300/15 bg-[#0d1222]/95 p-7 text-center shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl shadow-lg">
          {content.icon}
        </div>

        <h2 className="mt-6 text-2xl font-black tracking-tight text-white sm:text-3xl">
          {content.title}
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/45">
          {content.message}
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="mp-button mt-7 w-full bg-white px-5 py-3.5 text-sm text-black hover:bg-cyan-50"
        >
          {content.button}
        </button>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * PASSWORD REQUIREMENTS
 * =========================================================
 */

function PasswordRequirements({
  password,
}: {
  password: string;
}) {
  const requirements = [
    {
      label: "One lowercase character",
      valid: /[a-z]/.test(password),
    },

    {
      label: "One uppercase character",
      valid: /[A-Z]/.test(password),
    },

    {
      label: "One number",
      valid: /\d/.test(password),
    },

    {
      label: "One special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },

    {
      label: "8 characters minimum",
      valid: password.length >= 8,
    },
  ];

  return (
    <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      {requirements.map(
        (requirement) => (
          <div
            key={
              requirement.label
            }
            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
              requirement.valid
                ? "text-cyan-300"
                : "text-white/30"
            }`}
          >
            <span
              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-black transition-all duration-200 ${
                requirement.valid
                  ? "bg-cyan-300 text-black"
                  : "bg-white/20 text-transparent"
              }`}
            >
              ✓
            </span>

            <span>
              {requirement.label}
            </span>
          </div>
        ),
      )}
    </div>
  );
}

/*
 * =========================================================
 * MAIN PLAYER NAME GATE
 * =========================================================
 */

export default function PlayerNameGate({
  children,
}: {
  children: ReactNode;
}) {
  const pathname =
    usePathname();

  /*
   * =========================================================
   * SESSION / PROFILE
   * =========================================================
   */

  const [
    sessionReady,
    setSessionReady,
  ] = useState(false);

  const [
    hasSession,
    setHasSession,
  ] = useState(false);

  const [
    profileChecked,
    setProfileChecked,
  ] = useState(false);

  const [
    profileExists,
    setProfileExists,
  ] = useState(false);

  /*
   * =========================================================
   * AUTH UI
   * =========================================================
   */

  const [
    showAuthOnLanding,
    setShowAuthOnLanding,
  ] = useState(false);

  const [
    authMode,
    setAuthMode,
  ] = useState<AuthMode>(
    "login",
  );

  /*
   * =========================================================
   * AUTH FORM
   * =========================================================
   */

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  /*
   * Remember Me
   *
   * Default is ON.
   */

  const [
    rememberMe,
    setRememberMe,
  ] = useState(true);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    authError,
    setAuthError,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /*
   * =========================================================
   * MINDPLAY NAME
   * =========================================================
   */

  const [
    mindPlayName,
    setMindPlayName,
  ] = useState("");

  const [
    nameError,
    setNameError,
  ] = useState("");

  const [
    isSavingName,
    setIsSavingName,
  ] = useState(false);

  /*
   * =========================================================
   * ONBOARDING
   * =========================================================
   */

  const [
    onboardingStep,
    setOnboardingStep,
  ] = useState<OnboardingStep>(
    "none",
  );

  const [
    showNameSetup,
    setShowNameSetup,
  ] = useState(false);

  /*
   * =========================================================
   * CHECK SESSION
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      /*
       * Load the current Remember Me preference.
       */

      const rememberPreference =
        getRememberMePreference();

      /*
       * Load the current Supabase session.
       */

      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      /*
       * =====================================================
       * SESSION-ONLY LOGIN CHECK
       * =====================================================
       *
       * When Remember Me was OFF, a marker is stored in
       * sessionStorage.
       *
       * sessionStorage disappears when the browser tab
       * session ends.
       *
       * If the Supabase session still exists but the marker
       * does not, clear that old local session.
       */

      if (
        session &&
        !rememberPreference &&
        !hasSessionOnlyMarker()
      ) {
        await supabase.auth.signOut({
          scope: "local",
        });

        if (!mounted) {
          return;
        }

        setHasSession(false);
        setProfileChecked(false);
        setProfileExists(false);
        setSessionReady(true);

        return;
      }

      /*
       * =====================================================
       * NO ACTIVE SESSION
       * =====================================================
       */

      setHasSession(!!session);

      if (!session) {
        setProfileChecked(false);
        setProfileExists(false);
        setSessionReady(true);

        return;
      }

      /*
       * =====================================================
       * LOAD CLOUD PROGRESS
       * =====================================================
       */

      await loadProgressFromSupabase();

      /*
       * =====================================================
       * LOAD DAILY CHALLENGE
       * =====================================================
       */

      await loadDailyChallengeFromSupabase();

      if (!mounted) {
        return;
      }

      /*
       * =====================================================
       * CHECK PROFILE
       * =====================================================
       */

      const {
        data: profile,
        error,
      } =
        await supabase
          .from("profiles")
          .select(
            "mindplay_name",
          )
          .eq(
            "id",
            session.user.id,
          )
          .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Profile check failed:",
          error,
        );

        setProfileChecked(true);
        setProfileExists(false);
      } else {
        const exists =
          !!profile?.mindplay_name;

        setProfileExists(
          exists,
        );

        setProfileChecked(
          true,
        );

        if (!exists) {
          setShowNameSetup(
            true,
          );
        }
      }

      setSessionReady(true);
    }

    void checkSession();

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
          session,
        ) => {
          if (!mounted) {
            return;
          }

          setHasSession(
            !!session,
          );

          /*
           * No session.
           */

          if (!session) {
            setProfileChecked(
              false,
            );

            setProfileExists(
              false,
            );

            setShowAuthOnLanding(
              false,
            );

            setShowNameSetup(
              false,
            );

            setOnboardingStep(
              "none",
            );

            setSessionReady(
              true,
            );

            return;
          }

          /*
           * Load cloud progress.
           */

          await loadProgressFromSupabase();

          /*
           * Load today's Daily Challenge.
           */

          await loadDailyChallengeFromSupabase();

          if (!mounted) {
            return;
          }

          /*
           * Check profile.
           */

          const {
            data: profile,
            error,
          } =
            await supabase
              .from("profiles")
              .select(
                "mindplay_name",
              )
              .eq(
                "id",
                session.user.id,
              )
              .maybeSingle();

          if (!mounted) {
            return;
          }

          if (error) {
            console.error(
              "Profile check failed:",
              error,
            );

            setProfileExists(
              false,
            );
          } else {
            const exists =
              !!profile?.mindplay_name;

            setProfileExists(
              exists,
            );

            if (exists) {
              setShowNameSetup(
                false,
              );
            } else {
              setShowNameSetup(
                true,
              );
            }
          }

          setProfileChecked(
            true,
          );

          setSessionReady(
            true,
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
   * OPEN LOGIN
   * =========================================================
   */

  function openLogin() {
    setAuthMode("login");

    setAuthError("");

    setPassword("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowConfirmPassword(
      false,
    );

    /*
     * Load the saved Remember Me preference.
     */

    setRememberMe(
      getRememberMePreference(),
    );

    setShowAuthOnLanding(
      true,
    );
  }

  /*
   * =========================================================
   * OPEN SIGNUP
   * =========================================================
   */

  function openSignup() {
    setAuthMode("signup");

    setAuthError("");

    setPassword("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowConfirmPassword(
      false,
    );

    setOnboardingStep(
      "account-warning",
    );
  }

  /*
   * =========================================================
   * BACK TO LANDING
   * =========================================================
   */

  function backToLanding() {
    setShowAuthOnLanding(false);

    setAuthError("");

    setPassword("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowConfirmPassword(
      false,
    );

    setOnboardingStep(
      "none",
    );
  }

  /*
   * =========================================================
   * ONBOARDING CONTINUE
   * =========================================================
   */

  function handleOnboardingContinue() {
    if (
      onboardingStep ===
      "account-warning"
    ) {
      setOnboardingStep(
        "none",
      );

      setShowAuthOnLanding(
        true,
      );

      return;
    }

    if (
      onboardingStep ===
      "account-created"
    ) {
      setOnboardingStep(
        "name-warning",
      );

      return;
    }

    if (
      onboardingStep ===
      "name-warning"
    ) {
      setOnboardingStep(
        "none",
      );

      setShowNameSetup(true);

      return;
    }

    if (
      onboardingStep ===
      "ready-to-play"
    ) {
      setOnboardingStep(
        "none",
      );

      setShowNameSetup(
        false,
      );

      return;
    }
  }

  /*
   * =========================================================
   * HANDLE AUTH SUBMIT
   * =========================================================
   */

  async function handleAuthSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setAuthError("");
    setIsSubmitting(true);

    /*
     * Save Remember Me preference BEFORE Supabase
     * creates or refreshes authentication cookies.
     */

    setRememberMePreference(
      rememberMe,
    );

    /*
     * Remember Me OFF:
     *
     * Store a marker in sessionStorage.
     *
     * This marker survives refreshes but disappears
     * when the browser tab session ends.
     */

    setSessionOnlyMarker(
      !rememberMe,
    );

    try {
      /*
       * =====================================================
       * LOGIN
       * =====================================================
       */

      if (
        authMode === "login"
      ) {
        const cleanEmail =
          email
            .trim()
            .toLowerCase();

        if (!cleanEmail) {
          setAuthError(
            "Please enter your email.",
          );

          return;
        }

        if (!password) {
          setAuthError(
            "Please enter your password.",
          );

          return;
        }

        /*
         * If Remember Me is OFF, clear any existing
         * local Supabase session first.
         *
         * This prevents an older persistent session
         * from being reused.
         */

        if (!rememberMe) {
          const {
            error:
              signOutError,
          } =
            await supabase.auth.signOut(
              {
                scope: "local",
              },
            );

          if (
            signOutError
          ) {
            console.error(
              "Failed to clear previous local session:",
              signOutError,
            );
          }
        }

        /*
         * Create the new session.
         */

        const {
          error,
        } =
          await supabase.auth.signInWithPassword(
            {
              email:
                cleanEmail,
              password,
            },
          );

        if (error) {
          const message =
            error.message.toLowerCase();

          if (
            message.includes(
              "invalid login credentials",
            )
          ) {
            setAuthError(
              "Incorrect email or password. Please check your details and try again.",
            );

            /*
             * Remove the session-only marker if
             * authentication failed.
             */

            setSessionOnlyMarker(
              false,
            );

            return;
          }

          throw error;
        }

        /*
         * Login successful.
         */

        setShowAuthOnLanding(
          false,
        );

        setPassword("");
        setConfirmPassword("");

        setShowPassword(false);
        setShowConfirmPassword(
          false,
        );

        return;
      }

      /*
       * =====================================================
       * SIGNUP
       * =====================================================
       */

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      if (!cleanEmail) {
        setAuthError(
          "Please enter your email.",
        );

        return;
      }

      /*
       * Password requirements.
       */

      const hasLowercase =
        /[a-z]/.test(
          password,
        );

      const hasUppercase =
        /[A-Z]/.test(
          password,
        );

      const hasNumber =
        /\d/.test(
          password,
        );

      const hasSpecial =
        /[^A-Za-z0-9]/.test(
          password,
        );

      const hasMinimumLength =
        password.length >= 8;

      if (
        !hasMinimumLength
      ) {
        setAuthError(
          "Password must contain at least 8 characters.",
        );

        return;
      }

      if (!hasLowercase) {
        setAuthError(
          "Password must contain at least one lowercase character.",
        );

        return;
      }

      if (!hasUppercase) {
        setAuthError(
          "Password must contain at least one uppercase character.",
        );

        return;
      }

      if (!hasNumber) {
        setAuthError(
          "Password must contain at least one number.",
        );

        return;
      }

      if (!hasSpecial) {
        setAuthError(
          "Password must contain at least one special character.",
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setAuthError(
          "Passwords do not match.",
        );

        return;
      }

      /*
       * Create account.
       */

      const {
        data,
        error,
      } =
        await supabase.auth.signUp(
          {
            email:
              cleanEmail,
            password,
          },
        );

      if (error) {
        const message =
          error.message.toLowerCase();

        if (
          message.includes(
            "already registered",
          ) ||
          message.includes(
            "already been registered",
          ) ||
          message.includes(
            "user already exists",
          )
        ) {
          setAuthError(
            "This email is already registered. Please log in instead.",
          );

          return;
        }

        throw error;
      }

      /*
       * Confirm email should be OFF.
       */

      if (!data.session) {
        throw new Error(
          "Your account was created, but no active session was returned. Please check that Confirm email is disabled in Supabase.",
        );
      }

      /*
       * Account created successfully.
       */

      setShowAuthOnLanding(
        false,
      );

      setPassword("");
      setConfirmPassword("");

      setShowPassword(false);
      setShowConfirmPassword(
        false,
      );

      setOnboardingStep(
        "account-created",
      );
    } catch (error) {
      console.error(
        "Authentication failed:",
        error,
      );

      if (
        error instanceof Error
      ) {
        setAuthError(
          error.message,
        );
      } else {
        setAuthError(
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  /*
   * =========================================================
   * SAVE MINDPLAY NAME
   * =========================================================
   */

  async function handleSaveName(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName =
      mindPlayName.trim();

    setNameError("");

    if (!trimmedName) {
      setNameError(
        "Please enter a MindPlay name.",
      );

      return;
    }

    if (
      trimmedName.length < 3
    ) {
      setNameError(
        "MindPlay name must be at least 3 characters.",
      );

      return;
    }

    if (
      trimmedName.length > 20
    ) {
      setNameError(
        "MindPlay name must be 20 characters or less.",
      );

      return;
    }

    setIsSavingName(true);

    try {
      /*
       * Get current authenticated user.
       */

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
          "Your session has expired. Please log in again.",
        );
      }

      /*
       * Save profile.
       */

      const {
        error,
      } =
        await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              email:
                user.email,
              mindplay_name:
                trimmedName,
            },
            {
              onConflict:
                "id",
            },
          );

      if (error) {
        throw error;
      }

      /*
       * Load cloud progress.
       */

      await loadProgressFromSupabase();

      /*
       * Load today's Daily Challenge.
       */

      await loadDailyChallengeFromSupabase();

      /*
       * Profile now exists.
       */

      setProfileExists(
        true,
      );

      setProfileChecked(
        true,
      );

      setShowNameSetup(
        false,
      );

      /*
       * Final onboarding.
       */

      setOnboardingStep(
        "ready-to-play",
      );
    } catch (error) {
      console.error(
        "Failed to save MindPlay name:",
        error,
      );

      if (
        error instanceof Error
      ) {
        setNameError(
          error.message,
        );
      } else {
        setNameError(
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsSavingName(
        false,
      );
    }
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
    showNameSetup;

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <>
      {/* =====================================================
          LANDING
          ===================================================== */}

      {shouldShowLanding ? (
        <LandingPage
          onLogin={openLogin}
          onSignup={openSignup}
        />
      ) : (
        children
      )}

      {/* =====================================================
          ONBOARDING POPUPS
          ===================================================== */}

      <OnboardingPopup
        step={onboardingStep}
        onContinue={
          handleOnboardingContinue
        }
      />

      {/* =====================================================
          AUTH MODAL
          ===================================================== */}

      {shouldShowAuth && (
        <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/70 px-5 py-6 backdrop-blur-sm">
          <div
            aria-labelledby="auth-title"
            aria-modal="true"
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-4xl border border-cyan-300/15 bg-[#0d1222]/95 p-6 shadow-2xl shadow-cyan-950/30 sm:p-8"
            role="dialog"
          >
            {/* Back */}

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

            {/* Form */}

            <form
              onSubmit={
                handleAuthSubmit
              }
              className="space-y-5"
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
                    event,
                  ) =>
                    setEmail(
                      event.target
                        .value,
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

                <div className="relative mt-2">
                  <input
                    id="auth-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event.target
                          .value,
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
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-20 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-300/30 focus:bg-white/7 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          previous,
                        ) =>
                          !previous,
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30 transition hover:text-cyan-300 disabled:opacity-50"
                  >
                    {showPassword
                      ? "HIDE"
                      : "SHOW"}
                  </button>
                </div>

                {authMode ===
                  "signup" && (
                  <PasswordRequirements
                    password={
                      password
                    }
                  />
                )}
              </div>

              {/* Confirm Password */}

              {authMode ===
                "signup" && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="text-xs font-bold text-white/60"
                  >
                    Confirm password
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="auth-confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(
                        event,
                      ) =>
                        setConfirmPassword(
                          event.target
                            .value,
                        )
                      }
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      required
                      disabled={
                        isSubmitting
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-20 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-300/30 focus:bg-white/7 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (
                            previous,
                          ) =>
                            !previous,
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30 transition hover:text-cyan-300 disabled:opacity-50"
                    >
                      {showConfirmPassword
                        ? "HIDE"
                        : "SHOW"}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me */}

              {authMode ===
                "login" && (
                <label className="flex cursor-pointer items-center gap-3 py-1">
                  <input
                    type="checkbox"
                    checked={
                      rememberMe
                    }
                    onChange={(
                      event,
                    ) =>
                      setRememberMe(
                        event.target
                          .checked,
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
              )}

              {/* Error */}

              {authError && (
                <div className="rounded-xl border border-red-300/10 bg-red-300/5 px-4 py-3 text-sm leading-5 text-red-200/80">
                  {authError}
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

            {/* Switch */}

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
          NAME SETUP
          ===================================================== */}

      {shouldShowNameSetup && (
        <div className="fixed inset-0 z-95 flex items-center justify-center bg-black/70 px-5 backdrop-blur-md">
          <div
            aria-labelledby="mindplay-name-title"
            aria-modal="true"
            className="w-full max-w-md animate-[mindplayPop_0.3s_ease-out] rounded-4xl border border-cyan-300/15 bg-[#0d1222]/95 p-6 shadow-2xl shadow-cyan-950/30 sm:p-8"
            role="dialog"
          >
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl">
                🧠
              </div>

              <h1
                id="mindplay-name-title"
                className="mt-5 text-2xl font-black tracking-tight text-white"
              >
                Create your
                <br />
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
                  event,
                ) =>
                  setMindPlayName(
                    event.target
                      .value,
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
                  {nameError}
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
          GLOBAL POPUP ANIMATION
          ===================================================== */}

      <style jsx global>{`
        @keyframes mindplayPop {
          0% {
            opacity: 0;
            transform: scale(0.96)
              translateY(8px);
          }

          100% {
            opacity: 1;
            transform: scale(1)
              translateY(0);
          }
        }
      `}</style>
    </>
  );
}