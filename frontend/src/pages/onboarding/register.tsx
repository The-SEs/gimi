import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "../../hooks/useAuth";
import type { ApiError } from "../../types/auth";
import GimiIcon from "../../assets/GIMI_Icon.svg";

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export default function RegisterPage({ onBackToLogin }: RegisterPageProps) {
  const navigate = useNavigate();
  const { register, status } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ApiError>({});

  const isSubmitting = status === "loading";

  function getFieldError(field: keyof ApiError): string | undefined {
    const val = errors[field];
    return Array.isArray(val) ? val[0] : val;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      await register({
        email,
        username,
        password: password,
        password_confirm: confirmPassword,
      });
      navigate("/onboarding-questions");
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        setErrors(err.response.data as ApiError);
      } else {
        setErrors({ detail: "Registration failed. Please try again." });
      }
    }
  };

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

      {/* Desktop layout: GIMI left + card right + quote below */}
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
              <RegisterForm
                username={username} setUsername={setUsername}
                email={email} setEmail={setEmail}
                password={password} setPassword={setPassword}
                confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                showPassword={showPassword} setShowPassword={setShowPassword}
                errors={errors} isSubmitting={isSubmitting}
                getFieldError={getFieldError}
                handleSubmit={handleSubmit}
                onBackToLogin={onBackToLogin}
              />
            </CardShell>
          </div>
        </div>

        <p className="text-sm font-medium italic mt-4 tracking-wide" style={{ color: "rgba(30,60,100,0.55)" }}>
          Get it mindfully inside.
        </p>
      </div>

      {/* Mobile layout: card full width, quote below */}
      <div className="sm:hidden relative z-20 w-full px-5 pb-8">
        <div className="relative">
          <TapeStrip />
          <CardShell>
            <RegisterForm
              username={username} setUsername={setUsername}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              showPassword={showPassword} setShowPassword={setShowPassword}
              errors={errors} isSubmitting={isSubmitting}
              getFieldError={getFieldError}
              handleSubmit={handleSubmit}
              onBackToLogin={onBackToLogin}
            />
          </CardShell>
        </div>
        <p className="text-center text-sm font-medium italic mt-4 tracking-wide" style={{ color: "rgba(30,60,100,0.55)" }}>
          Get it mindfully inside.
        </p>
      </div>
    </div>
  );
}

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
      className="bg-white/85 backdrop-blur-md rounded-3xl px-7 pt-7 pb-10 sm:px-9 sm:pt-8 sm:pb-12"
      style={{
        boxShadow: "0 8px 40px rgba(30, 60, 100, 0.18), 0 2px 8px rgba(30,60,100,0.08)",
      }}
    >
      {children}
    </div>
  );
}

interface RegisterFormProps {
  username: string; setUsername: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  confirmPassword: string; setConfirmPassword: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  errors: ApiError; isSubmitting: boolean;
  getFieldError: (field: keyof ApiError) => string | undefined;
  handleSubmit: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

function RegisterForm({
  username, setUsername, email, setEmail,
  password, setPassword, confirmPassword, setConfirmPassword,
  showPassword, setShowPassword, errors, isSubmitting,
  getFieldError, handleSubmit, onBackToLogin,
}: RegisterFormProps) {
  return (
    <>
      <button
        onClick={onBackToLogin}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition mb-6 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 5l-7 7 7 7" />
        </svg>
        Back to Login
      </button>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-7 tracking-tight">Sign Up</h1>

      {(errors.detail || errors.non_field_errors) && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {errors.detail ?? errors.non_field_errors?.[0]}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input type="text" placeholder="Nickname" value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
          {getFieldError("username") && <p className="mt-1 text-xs text-red-500 ml-1">{getFieldError("username")}</p>}
        </div>

        <div>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
          {getFieldError("email") && <p className="mt-1 text-xs text-red-500 ml-1">{getFieldError("email")}</p>}
        </div>

        <div className="relative">
          <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 pr-12 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
          {getFieldError("password") && <p className="mt-1 text-xs text-red-500 ml-1">{getFieldError("password")}</p>}
        </div>

        <div className="relative">
          <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 pr-12 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
          {getFieldError("password_confirm") && <p className="mt-1 text-xs text-red-500 ml-1">{getFieldError("password_confirm")}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}
          className="mt-4 w-full rounded-xl py-3.5 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)", boxShadow: "0 4px 16px rgba(44, 90, 160, 0.35)" }}
        >
          {isSubmitting ? "Creating account..." : <><span className="sm:hidden">Sign Up</span><span className="hidden sm:inline">Register</span></>}
        </button>
      </form>
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