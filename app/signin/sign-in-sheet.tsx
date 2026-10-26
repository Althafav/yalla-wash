"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { sendOtp, verifyOtp } from "@/app/actions/auth";
import { HappyCar } from "@/components/happy-car";
import { Bubbles } from "@/components/ui";

const RESEND_SECONDS = 30;

function formatPhone(digits: string) {
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

export function SignInSheet({ next, forBooking }: { next: string; forBooking: boolean }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [pending, startTransition] = useTransition();
  const digits = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const phoneDigits = phone.replace(/\D/g, "");

  function send() {
    setError(null);
    startTransition(async () => {
      const res = await sendOtp(phoneDigits);
      if (res.error) return setError(res.error);
      setCode(["", "", "", ""]);
      setStep("code");
      setResendIn(RESEND_SECONDS);
      requestAnimationFrame(() => digits.current[0]?.focus());
    });
  }

  function verify(value: string) {
    setError(null);
    startTransition(async () => {
      const res = await verifyOtp(phoneDigits, value, next);
      if (res?.error) {
        setError(res.error);
        setCode(["", "", "", ""]);
        digits.current[0]?.focus();
      }
    });
  }

  function setDigit(i: number, raw: string) {
    const typed = raw.replace(/\D/g, "");
    const nextCode = [...code];
    if (typed.length > 1) {
      // A pasted or autofilled code fills every box.
      typed.slice(0, 4).split("").forEach((d, j) => (nextCode[j] = d));
    } else {
      nextCode[i] = typed;
    }
    setCode(nextCode);
    const joined = nextCode.join("");
    if (joined.length === 4) verify(joined);
    else if (typed && i < 3) digits.current[Math.min(i + typed.length, 3)]?.focus();
  }

  return (
    <>
      <Link href="/home" aria-label="Close" className="absolute inset-0" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-[430px] flex-col gap-4 rounded-t-[30px] bg-white px-6 pt-3 pb-[max(34px,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgb(11_31_58/0.12)]"
      >
        <span className="h-[5px] w-11 self-center rounded-full bg-border" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <HappyCar size={64} />
          <div>
            <h1 id="sheet-title" className="m-0 text-2xl leading-7 font-extrabold">
              {forBooking ? "Almost there!" : "Welcome back"}
            </h1>
            <span className="text-[15px] text-ink-muted">
              {forBooking ? "Sign in to confirm your booking." : "Sign in to see your bookings and stamps."}
            </span>
          </div>
        </div>

        {step === "phone" ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-base font-bold">
                Mobile number
              </label>
              <div className="flex gap-2.5">
                <span className="flex h-[52px] items-center rounded-[14px] border-2 border-border-strong px-3 text-base font-bold shadow-[0_3px_0_var(--color-border)]">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  autoFocus
                  placeholder="98470 12345"
                  className="field min-w-0 grow text-[17px] font-bold tracking-[0.5px]"
                  value={formatPhone(phoneDigits)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  aria-invalid={!!error}
                  aria-describedby="phone-help"
                />
              </div>
              <span id="phone-help" className="text-[13px] text-ink-muted">
                We&apos;ll text you a 4-digit code. Your vehicles and stamps are saved to this number.
              </span>
            </div>
            {error && (
              <p role="alert" className="m-0 text-sm font-bold text-danger">
                {error}
              </p>
            )}
            <button type="submit" className="bp bp-teal w-full" disabled={pending || phoneDigits.length !== 10}>
              <Bubbles />
              <span>{pending ? "Sending…" : "Send code"}</span>
            </button>
          </form>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              verify(code.join(""));
            }}
          >
            <div className="flex flex-col gap-2.5">
              <span id="code-lbl" className="text-base font-bold">
                Enter the code sent to +91 {formatPhone(phoneDigits)}
              </span>
              <div className="grid grid-cols-4 gap-3" role="group" aria-labelledby="code-lbl">
                {code.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      digits.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={i === 0 ? 4 : 1}
                    aria-label={`Digit ${i + 1}`}
                    aria-invalid={!!error}
                    className="field !h-16 text-center !text-[28px] !font-extrabold"
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !d && i > 0) digits.current[i - 1]?.focus();
                    }}
                  />
                ))}
              </div>
              {error ? (
                <p role="alert" className="m-0 text-sm font-bold text-danger">
                  {error}
                </p>
              ) : (
                <span className="text-[13px] text-ink-muted">Testing: the code is always 1234 for now.</span>
              )}
              <div className="flex items-center justify-between">
                {resendIn > 0 ? (
                  <span className="text-sm text-ink-muted">Resend in 0:{String(resendIn).padStart(2, "0")}</span>
                ) : (
                  <button type="button" className="cursor-pointer border-0 bg-transparent p-1.5 text-[15px] font-bold text-teal-700 underline" onClick={send}>
                    Resend code
                  </button>
                )}
                <button
                  type="button"
                  className="cursor-pointer border-0 bg-transparent p-1.5 text-[15px] font-bold text-teal-700 underline"
                  onClick={() => {
                    setError(null);
                    setStep("phone");
                  }}
                >
                  Change number
                </button>
              </div>
            </div>
            <button type="submit" className="bp bp-teal w-full" disabled={pending || code.join("").length !== 4}>
              <Bubbles />
              <span>{pending ? "Checking…" : "Verify and continue"}</span>
            </button>
          </form>
        )}

        <span className="text-center text-xs leading-[17px] text-ink-muted">
          By continuing you agree to the Terms and Privacy Policy.
        </span>
      </div>
    </>
  );
}
