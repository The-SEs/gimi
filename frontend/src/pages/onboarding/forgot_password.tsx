import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GimiIcon from "../../assets/GIMI_Icon.svg";

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const codeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // ── Step handlers (wire these up to your backend) ──────────────────────────

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      // TODO: await api.sendResetCode(email);
      setStep("code");
    } catch {
      setError("Could not send reset code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fullCode = code.join("");
    if (fullCode.length < 4) {
      setError("Please enter the full 4-digit code.");
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: await api.verifyResetCode(email, fullCode);
      setStep("password");
    } catch {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: await api.resetPassword(email, code.join(""), newPassword);
      navigate("/");
    } catch {
      setError("Could not reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Code input helpers ─────────────────────────────────────────────────────

  function handleCodeChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 3) {
      codeRefs[index + 1].current?.focus();
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs[index - 1].current?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setCode(pasted.split(""));
      codeRefs[3].current?.focus();
    }
    e.preventDefault();
  }

  // ── Derived UI ─────────────────────────────────────────────────────────────

  const stepContent = {
    email: {
      title: "Forgot Password",
      subtitle: "Enter your email and we'll send you a reset code.",
      back: () => navigate("/"),
      backLabel: "Back to Login",
    },
    code: {
      title: "Check Your Email",
      subtitle: `We sent a 4-digit code to ${email}`,
      back: () => { setStep("email"); setError(null); setCode(["", "", "", ""]); },
      backLabel: "Change email",
    },
    password: {
      title: "New Password",
      subtitle: "Almost there! Choose a new password.",
      back: () => { setStep("code"); setError(null); },
      backLabel: "Back",
    },
  };

  const current = stepContent[step];

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #b8cfe8 0%, #d0e4f5 30%, #a8c4e0 55%, #c5d8ee 75%, #dce9f5 100%)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1/3"
          style={{
            background:
              "linear-gradient(180deg, rgba(135,195,235,0.5) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Mobile: GIMI pinned to bottom-right */}
      <img
        src={GimiIcon}
        alt=""
        aria-hidden="true"
        className="sm:hidden fixed bottom-0 right-0 z-10 pointer-events-none"
        style={{
          width: "130px",
          height: "auto",
          filter: "drop-shadow(2px 4px 10px rgba(30,60,100,0.2))",
        }}
      />

      {/* Desktop layout */}
      <div
        className="relative z-10 hidden sm:flex flex-col items-center"
        style={{ paddingRight: "4rem" }}
      >
        <div className="flex items-end" style={{ gap: "2.5rem" }}>
          {/* GIMI */}
          <div style={{ width: "420px", flexShrink: 0 }} className="flex items-end justify-center">
            <img
              src={GimiIcon}
              alt="GIMI"
              style={{
                width: "1000px",
                height: "auto",
                filter: "drop-shadow(2px 4px 10px rgba(30,60,100,0.2))",
              }}
            />
          </div>

          {/* Card */}
          <div className="relative w-[420px]">
            <TapeStrip />
            <CardShell>
              <StepContent
                step={step}
                current={current}
                email={email} setEmail={setEmail}
                code={code} codeRefs={codeRefs}
                newPassword={newPassword} setNewPassword={setNewPassword}
                confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                showPassword={showPassword} setShowPassword={setShowPassword}
                error={error} isSubmitting={isSubmitting}
                handleEmailSubmit={handleEmailSubmit}
                handleCodeSubmit={handleCodeSubmit}
                handlePasswordSubmit={handlePasswordSubmit}
                handleCodeChange={handleCodeChange}
                handleCodeKeyDown={handleCodeKeyDown}
                handleCodePaste={handleCodePaste}
              />
            </CardShell>
          </div>
        </div>

        <p
          className="text-sm font-medium italic mt-4 tracking-wide"
          style={{ color: "rgba(30,60,100,0.55)" }}
        >
          Get it mindfully inside.
        </p>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden relative z-20 w-full px-5 pb-8">
        <div className="relative">
          <TapeStrip />
          <CardShell>
            <StepContent
              step={step}
              current={current}
              email={email} setEmail={setEmail}
              code={code} codeRefs={codeRefs}
              newPassword={newPassword} setNewPassword={setNewPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              showPassword={showPassword} setShowPassword={setShowPassword}
              error={error} isSubmitting={isSubmitting}
              handleEmailSubmit={handleEmailSubmit}
              handleCodeSubmit={handleCodeSubmit}
              handlePasswordSubmit={handlePasswordSubmit}
              handleCodeChange={handleCodeChange}
              handleCodeKeyDown={handleCodeKeyDown}
              handleCodePaste={handleCodePaste}
            />
          </CardShell>
        </div>
        <p
          className="text-center text-sm font-medium italic mt-4 tracking-wide"
          style={{ color: "rgba(30,60,100,0.55)" }}
        >
          Get it mindfully inside.
        </p>
      </div>
    </div>
  );
}

// ── Shared layout components ────────────────────────────────────────────────

function TapeStrip() {
  return (
    <div
      className="absolute left-1/2 -top-3 z-20"
      style={{
        transform: "translateX(-50%) rotate(-1.5deg)",
        width: "72px",
        height: "22px",
        background: "rgba(255, 255, 220, 0.55)",
        border: "1px solid rgba(200, 200, 160, 0.5)",
        borderRadius: "2px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        backdropFilter: "blur(1px)",
      }}
    />
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white/85 backdrop-blur-md rounded-3xl px-8 pt-10 pb-10 sm:px-10 sm:pt-12 sm:pb-12"
      style={{
        boxShadow:
          "0 8px 40px rgba(30, 60, 100, 0.18), 0 2px 8px rgba(30,60,100,0.08)",
        minHeight: "480px",
      }}
    >
      {children}
    </div>
  );
}

// ── Step progress dots ───────────────────────────────────────────────────────

function StepDots({ step }: { step: "email" | "code" | "password" }) {
  const steps: Array<"email" | "code" | "password"> = ["email", "code", "password"];
  const current = steps.indexOf(step);
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div
          key={s}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? "20px" : "8px",
            height: "8px",
            background:
              i < current
                ? "#3a6ec4"
                : i === current
                ? "linear-gradient(90deg, #2c5aa0, #3a6ec4)"
                : "rgba(44,90,160,0.2)",
          }}
        />
      ))}
    </div>
  );
}

// ── Main step renderer ───────────────────────────────────────────────────────

interface StepContentProps {
  step: "email" | "code" | "password";
  current: { title: string; subtitle: string; back: () => void; backLabel: string };
  email: string; setEmail: (v: string) => void;
  code: string[]; codeRefs: React.RefObject<HTMLInputElement | null>[];
  newPassword: string; setNewPassword: (v: string) => void;
  confirmPassword: string; setConfirmPassword: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  error: string | null; isSubmitting: boolean;
  handleEmailSubmit: (e: React.FormEvent) => void;
  handleCodeSubmit: (e: React.FormEvent) => void;
  handlePasswordSubmit: (e: React.FormEvent) => void;
  handleCodeChange: (i: number, v: string) => void;
  handleCodeKeyDown: (i: number, e: React.KeyboardEvent) => void;
  handleCodePaste: (e: React.ClipboardEvent) => void;
}

function StepContent({
  step, current,
  email, setEmail,
  code, codeRefs,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  showPassword, setShowPassword,
  error, isSubmitting,
  handleEmailSubmit, handleCodeSubmit, handlePasswordSubmit,
  handleCodeChange, handleCodeKeyDown, handleCodePaste,
}: StepContentProps) {
  return (
    <>
      {/* Back button */}
      <button
        onClick={current.back}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition mb-6 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 5l-7 7 7 7" />
        </svg>
        {current.backLabel}
      </button>

      <StepDots step={step} />

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 tracking-tight">
        {current.title}
      </h1>
      <p className="text-sm text-gray-500 mb-7">{current.subtitle}</p>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* ── Step 1: Email ── */}
      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl py-3.5 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)",
              boxShadow: "0 4px 16px rgba(44, 90, 160, 0.35)",
            }}
          >
            {isSubmitting ? "Sending…" : "Send Reset Code"}
          </button>
        </form>
      )}

      {/* ── Step 2: Code ── */}
      {step === "code" && (
        <form onSubmit={handleCodeSubmit} className="space-y-7">
          <div className="flex justify-center gap-3" onPaste={handleCodePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={codeRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                autoFocus={i === 0}
                className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 border-blue-400 bg-white/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition caret-transparent"
                style={{
                  boxShadow: digit ? "0 2px 12px rgba(44,90,160,0.15)" : undefined,
                  borderColor: digit ? "#3a6ec4" : undefined,
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl py-3.5 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)",
              boxShadow: "0 4px 16px rgba(44, 90, 160, 0.35)",
            }}
          >
            {isSubmitting ? "Verifying…" : "Verify Code"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Didn't get it?{" "}
            <button
              type="button"
              className="font-medium hover:underline transition"
              style={{ color: "#2889FF" }}
              onClick={() => {
                // TODO: await api.sendResetCode(email);
              }}
            >
              Resend code
            </button>
          </p>
        </form>
      )}

      {/* ── Step 3: New Password ── */}
      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoFocus
              className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 pr-12 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 pr-12 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl py-3.5 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)",
              boxShadow: "0 4px 16px rgba(44, 90, 160, 0.35)",
            }}
          >
            {isSubmitting ? "Saving…" : "Reset Password"}
          </button>
        </form>
      )}
    </>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={22} height={22}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7 0c-2.5-4.5-7-7-9-7S5.5 7.5 3 12c2.5 4.5 7 7 9 7s6.5-2.5 9-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={22} height={22}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.73 10.73a2 2 0 002.54 2.54M9.5 9.5a4 4 0 015.66 5.66M21 12c-2.5-4.5-7-7-9-7S5.5 7.5 3 12c.74 1.33 1.76 2.55 3 3.54M17.94 17.94A9.97 9.97 0 0021 12M3 3l18 18" />
    </svg>
  );
}