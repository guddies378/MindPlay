"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getLevelProgress } from "@/lib/levels";
import {
  getProgress,
  subscribeToProgress,
  type MindPlayProgress,
} from "@/lib/progress";

type QuitStep = "closed" | "confirm" | "delete";

export default function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const [quitStep, setQuitStep] =
    useState<QuitStep>("closed");

  const [progress, setProgress] =
    useState<MindPlayProgress | null>(null);

  const [mindPlayName, setMindPlayName] =
    useState("");

  const [confirmName, setConfirmName] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  const menuRef =
    useRef<HTMLDivElement>(null);

  /*
   * Reset the delete form.
   */
  const resetDeleteForm = () => {
    setConfirmName("");
    setPassword("");
    setDeleteError("");
  };

  /*
   * Load MindPlay progress.
   */
  useEffect(() => {
    const update = () => {
      setProgress(getProgress());
    };

    update();

    return subscribeToProgress(update);
  }, []);

  /*
   * Close the account menu/modal when clicking outside
   * or pressing Escape.
   */
  useEffect(() => {
    const handlePointerDown = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setQuitStep("closed");
        resetDeleteForm();
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  const xp = progress?.xp ?? 0;

  const level =
    getLevelProgress(xp).level;

  /*
   * Log out.
   */
  const handleLogout = async () => {
    setIsOpen(false);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  };

  /*
   * Open the quit confirmation.
   *
   * We retrieve the MindPlay name from:
   *
   * profiles.mindplay_name
   */
  const handleQuit = async () => {
    setIsOpen(false);
    resetDeleteForm();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setDeleteError(
          "Your session has expired. Please log in again."
        );

        setQuitStep("confirm");

        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("mindplay_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "Failed to load MindPlay name:",
          profileError
        );

        setDeleteError(
          "We couldn't load your MindPlay name. Please try again."
        );

        setQuitStep("confirm");

        return;
      }

      if (!profile?.mindplay_name) {
        setDeleteError(
          "No MindPlay name was found for this account."
        );

        setQuitStep("confirm");

        return;
      }

      setMindPlayName(
        profile.mindplay_name
      );

      setQuitStep("confirm");
    } catch (error) {
      console.error(
        "Failed to open account deletion:",
        error
      );

      setDeleteError(
        "Something went wrong. Please try again."
      );

      setQuitStep("confirm");
    }
  };

  /*
   * Permanently delete the account.
   *
   * The user must:
   *
   * 1. Type their MindPlay name correctly.
   * 2. Enter their current password.
   */
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      /*
       * Get the currently logged-in user.
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Your session has expired."
        );
      }

      /*
       * Make sure the email exists because
       * we use it for password verification.
       */
      if (!user.email) {
        throw new Error(
          "No email address is associated with this account."
        );
      }

      /*
       * Check the MindPlay name one more time
       * before deleting the account.
       */
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("mindplay_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error(
          "Unable to verify your MindPlay name."
        );
      }

      if (
        !profile?.mindplay_name ||
        confirmName.trim() !==
          profile.mindplay_name
      ) {
        setDeleteError(
          "The MindPlay name does not match."
        );

        return;
      }

      /*
       * Re-authenticate using the current password.
       */
      const {
        error: passwordError,
      } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password,
        });

      if (passwordError) {
        setDeleteError(
          "Your password is incorrect."
        );

        return;
      }

      /*
       * Call the existing Supabase function
       * that permanently deletes the account.
       */
      const {
        error: accountDeleteError,
      } = await supabase.rpc(
        "delete_my_account"
      );

      if (accountDeleteError) {
        throw accountDeleteError;
      }

      /*
       * Remove local MindPlay data.
       */
      localStorage.removeItem(
        "mindplay-progress"
      );

      localStorage.removeItem(
        "mindplay-daily-challenge"
      );

      localStorage.removeItem(
        "mindplay-new-account"
      );

      localStorage.removeItem(
        "mindplay-remember-me"
      );

      sessionStorage.clear();

      /*
       * Close the modal.
       */
      setQuitStep("closed");

      /*
       * Sign out the deleted account.
       */
      await supabase.auth.signOut();
    } catch (error) {
      console.error(
        "Account deletion failed:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "Your session has expired."
      ) {
        setDeleteError(
          "Your session has expired. Please log in again."
        );
      } else {
        setDeleteError(
          "We couldn't delete your account. Please try again."
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  /*
   * The delete button becomes available only when:
   *
   * - MindPlay name matches.
   * - Password has been entered.
   */
  const nameMatches =
    confirmName.trim() === mindPlayName &&
    mindPlayName.length > 0;

  return (
    <>
      <div
        ref={menuRef}
        className="relative shrink-0"
      >
        {/* Account button */}
        <button
          type="button"
          onClick={() =>
            setIsOpen((value) => !value)
          }
          aria-expanded={isOpen}
          aria-label="Account"
          aria-haspopup="menu"
          className="mp-button border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/9 hover:text-white sm:px-4"
        >
          <span className="sm:hidden">
            👤
          </span>

          <span className="hidden sm:inline">
            👤 Account
          </span>
        </button>

        {/* Account dropdown */}
        {isOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-55 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1220]/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl sm:mt-3 sm:w-64"
          >
            {/* Status */}
            <div className="rounded-xl bg-white/4 px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
                Status
              </p>

              <p className="mt-1 text-sm font-bold text-white/80">
                🟢 Online
                <span className="mx-1.5 text-white/20">
                  |
                </span>
                Level {level}
              </p>
            </div>

            {/* Divider */}
            <div className="my-2 h-px bg-white/6" />

            {/* Log out */}
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full rounded-xl px-3 py-3 text-left text-sm font-bold text-white/60 transition hover:bg-white/6 hover:text-white"
            >
              Log Out
            </button>

            {/* Quit */}
            <button
              type="button"
              role="menuitem"
              onClick={handleQuit}
              className="w-full rounded-xl px-3 py-3 text-left text-sm font-bold text-red-300/70 transition hover:bg-red-400/8 hover:text-red-200"
            >
              I Want to Quit
            </button>
          </div>
        )}
      </div>

      {/* Quit / Delete modal */}
      {quitStep !== "closed" && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-quit-title"
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1220] p-6 shadow-2xl shadow-black/40"
          >
            {/* First confirmation */}
            {quitStep === "confirm" ? (
              <>
                <div className="text-3xl">
                  ⚠️
                </div>

                <h2
                  id="account-quit-title"
                  className="mt-4 text-xl font-black"
                >
                  Do you really want to quit?
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/45">
                  This will permanently delete
                  your MindPlay account and your
                  cloud progress. This action
                  cannot be undone.
                </p>

                {deleteError && (
                  <div className="mt-4 rounded-xl border border-red-300/10 bg-red-300/5 px-4 py-3 text-sm text-red-200/80">
                    {deleteError}
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setQuitStep("closed");
                      resetDeleteForm();
                    }}
                    className="mp-button border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/60 hover:bg-white/9 hover:text-white"
                  >
                    No
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError("");
                      setQuitStep("delete");
                    }}
                    className="mp-button bg-red-400/10 px-5 py-3 text-sm font-bold text-red-200 hover:bg-red-400/15"
                  >
                    Yes
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl">
                  🗑️
                </div>

                <h2
                  id="account-quit-title"
                  className="mt-4 text-xl font-black"
                >
                  Delete my account
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/45">
                  Your account, MindPlay name,
                  XP, level, streak, and cloud
                  progress will be permanently
                  deleted.
                </p>

                {/* MindPlay name confirmation */}
                <div className="mt-6">
                  <label
                    htmlFor="confirm-mindplay-name"
                    className="text-xs font-bold text-white/60"
                  >
                    Type your MindPlay name
                  </label>

                  <p className="mt-1 text-xs text-white/30">
                    Enter it exactly as shown.
                  </p>

                  <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs text-white/30">
                      Your MindPlay name
                    </p>

                    <p className="mt-1 font-bold text-white/80">
                      {mindPlayName}
                    </p>
                  </div>

                  <input
                    id="confirm-mindplay-name"
                    type="text"
                    value={confirmName}
                    onChange={(event) =>
                      setConfirmName(
                        event.target.value
                      )
                    }
                    autoComplete="off"
                    placeholder="Type your MindPlay name"
                    disabled={isDeleting}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-red-300/30 focus:bg-white/7 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Password confirmation */}
                <div className="mt-5">
                  <label
                    htmlFor="delete-password"
                    className="text-xs font-bold text-white/60"
                  >
                    Enter your password
                  </label>

                  <p className="mt-1 text-xs text-white/30">
                    This confirms that you are
                    the account owner.
                  </p>

                  <input
                    id="delete-password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                    placeholder="Your current password"
                    disabled={isDeleting}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-red-300/30 focus:bg-white/7 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {deleteError && (
                  <div className="mt-4 rounded-xl border border-red-300/10 bg-red-300/5 px-4 py-3 text-sm text-red-200/80">
                    {deleteError}
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => {
                      setQuitStep("closed");
                      resetDeleteForm();
                    }}
                    className="mp-button border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/60 hover:bg-white/9 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      isDeleting ||
                      !nameMatches ||
                      password.length === 0
                    }
                    onClick={handleDeleteAccount}
                    className="mp-button bg-red-400/10 px-5 py-3 text-sm font-bold text-red-200 hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isDeleting
                      ? "Deleting..."
                      : "Delete my account"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}