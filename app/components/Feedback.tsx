"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { addXP } from "@/lib/progress";

const reactions = [
  { value: "awesome", emoji: "😄", label: "Awesome" },
  { value: "good", emoji: "😎", label: "Good" },
  { value: "meh", emoji: "🤔", label: "Meh" },
];

export default function Feedback() {
  const [reaction, setReaction] = useState("");
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [xpAwarded, setXpAwarded] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if ((!reaction && !feedback.trim()) || sending) {
      return;
    }

    setSending(true);
    setError("");

    try {
      // Get the logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "USER ERROR MESSAGE:",
          userError.message,
        );

        setError(
          userError.message ||
            "Unable to verify your account.",
        );

        return;
      }

      if (!user) {
        setError(
          "Please log in before sending feedback.",
        );

        return;
      }

      console.log(
        "AUTHENTICATED USER:",
        user.id,
      );

      /*
       * Check whether the user has already
       * received feedback XP today.
       */
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { data: todaysFeedback, error: checkError } =
        await supabase
          .from("feedback")
          .select("id, xp_awarded")
          .eq("user_id", user.id)
          .gte(
            "created_at",
            startOfToday.toISOString(),
          )
          .eq("xp_awarded", 10)
          .limit(1);

      if (checkError) {
        console.error(
          "FEEDBACK CHECK ERROR:",
          checkError.message,
        );

        setError(
          "Unable to check today's feedback reward.",
        );

        return;
      }

      const alreadyReceivedXP =
        Boolean(
          todaysFeedback &&
            todaysFeedback.length > 0,
        );

      /*
       * Save the feedback.
       *
       * If the user already received today's
       * reward, this feedback gets 0 XP.
       */
      const rewardXP = alreadyReceivedXP
        ? 0
        : 10;

      const { error: insertError } =
        await supabase
          .from("feedback")
          .insert({
            user_id: user.id,
            reaction:
              reaction || null,
            message:
              feedback.trim() || null,
            xp_awarded: rewardXP,
          });

      if (insertError) {
        console.error(
          "FEEDBACK ERROR MESSAGE:",
          insertError.message,
        );

        console.error(
          "FEEDBACK ERROR CODE:",
          insertError.code,
        );

        console.error(
          "FEEDBACK ERROR DETAILS:",
          insertError.details,
        );

        console.error(
          "FEEDBACK ERROR HINT:",
          insertError.hint,
        );

        setError(
          insertError.message ||
            "Something went wrong. Please try again.",
        );

        return;
      }

      console.log(
        "FEEDBACK SUCCESSFULLY SAVED",
      );

      /*
       * Award XP only for the first feedback
       * submission of the day.
       */
      if (rewardXP > 0) {
        const updatedProgress = addXP(
          rewardXP,
        );

        console.log(
          "FEEDBACK XP AWARDED:",
          rewardXP,
        );

        console.log(
          "NEW TOTAL XP:",
          updatedProgress.xp,
        );

        setXpAwarded(true);
      } else {
        console.log(
          "DAILY FEEDBACK XP ALREADY CLAIMED",
        );

        setXpAwarded(false);
      }

      setSent(true);
    } catch (err) {
      console.error(
        "UNEXPECTED FEEDBACK ERROR:",
        err,
      );

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  // -----------------------------
  // SUCCESS SCREEN
  // -----------------------------
  if (sent) {
    return (
      <section className="mx-auto w-full px-5 py-4 sm:px-8">
        <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-white/10 bg-white/4 p-4 text-center backdrop-blur-xl">
          <div className="relative">
            <div className="text-2xl">
              {xpAwarded ? "🚀" : "💬"}
            </div>

            <h2 className="mt-1 text-base font-black text-white">
              FEEDBACK SENT!
            </h2>

            <p className="mt-1 text-xs text-white/45">
              Thanks for helping MindPlay level up.
            </p>

            {xpAwarded ? (
              <div className="mt-2 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-300">
                +10 XP ✨
              </div>
            ) : (
              <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-bold text-white/45">
                Daily XP already claimed
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSent(false);
                setReaction("");
                setFeedback("");
                setError("");
                setXpAwarded(false);
              }}
              className="mx-auto mt-3 block text-xs text-white/35 transition hover:text-white"
            >
              Send another
            </button>
          </div>
        </div>
      </section>
    );
  }

  // -----------------------------
  // FEEDBACK FORM
  // -----------------------------
  return (
    <section className="mx-auto w-full px-5 py-4 sm:px-8">
      <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-white/10 bg-white/4 p-4 backdrop-blur-xl">
        <div className="relative">

          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-base">
              💬
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-black tracking-tight text-white">
                HELP LEVEL UP MINDPLAY
              </h2>

              <p className="mt-0.5 text-xs text-white/40">
                Got feedback? We&apos;d love to hear it.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-3"
          >

            {/* Reactions */}
            <div className="grid grid-cols-3 gap-1.5">
              {reactions.map((item) => {
                const selected =
                  reaction === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setReaction(item.value)
                    }
                    disabled={sending}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 transition-all sm:gap-2 ${
                      selected
                        ? "-translate-y-0.5 border-cyan-400/40 bg-cyan-400/10"
                        : "border-white/10 bg-white/2 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <span className="text-base">
                      {item.emoji}
                    </span>

                    <span
                      className={`text-xs font-bold ${
                        selected
                          ? "text-cyan-300"
                          : "text-white/45"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback textarea */}
            <div className="mt-2.5">
              <label
                htmlFor="feedback"
                className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-white/35"
              >
                Your feedback
              </label>

              <textarea
                id="feedback"
                value={feedback}
                onChange={(event) =>
                  setFeedback(
                    event.target.value,
                  )
                }
                placeholder="Tell us what you think..."
                rows={2}
                maxLength={500}
                disabled={sending}
                className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/40 focus:bg-black/30 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <div className="mt-1 text-right text-[10px] text-white/25">
                {feedback.length}/500
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-2 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs font-medium text-red-400">
                {error}
              </div>
            )}

            {/* Send */}
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={
                  sending ||
                  (!reaction &&
                    !feedback.trim())
                }
                className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-300 transition-all hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
              >
                {sending
                  ? "⏳ SENDING..."
                  : "🚀 SEND"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}