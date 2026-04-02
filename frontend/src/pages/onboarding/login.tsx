import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { isAxiosError } from "axios"
import { useAuth } from "../../hooks/useAuth"
import type { ApiError } from "../../types/auth"
import { useGoogleLogin } from "@react-oauth/google"
import GimiIcon from "../../assets/GIMI_Icon.svg"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithGoogle, status } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const isSubmitting = status === "loading" || isGoogleLoading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const response = (await login({ username: email, password })) as any

      if (response?.access) {
        localStorage.setItem("access_token", response.access)
      }

      navigate("/dashboard")
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiError
        setError(data.detail ?? data.non_field_errors?.[0] ?? "Login failed.")
      } else {
        setError("An unexpected error occurred.")
      }
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true)
      setError(null)
      try {
        const response = (await loginWithGoogle(
          tokenResponse.access_token,
        )) as any

        // FORCE SAVE the token for the WebSocket
        if (response?.access) {
          localStorage.setItem("access_token", response.access)
        }
        navigate("/dashboard")
      } catch (err) {
        console.error("Django rejected the Google token:", err)
        setError("Google authentication failed. Please try again.")
      } finally {
        setIsGoogleLoading(false)
      }
    },
    onError: () => {
      setError("Google login popup closed or failed.")
    },
  })

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
          <div
            style={{ width: "420px", flexShrink: 0 }}
            className="flex items-end justify-center"
          >
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
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                error={error}
                isSubmitting={isSubmitting}
                isGoogleLoading={isGoogleLoading}
                handleSubmit={handleSubmit}
                handleGoogleLogin={handleGoogleLogin}
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

      {/* Mobile layout: card full width, quote below */}
      <div className="sm:hidden relative z-20 w-full px-5 pb-8">
        <div className="relative">
          <TapeStrip />
          <CardShell>
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={error}
              isSubmitting={isSubmitting}
              isGoogleLoading={isGoogleLoading}
              handleSubmit={handleSubmit}
              handleGoogleLogin={handleGoogleLogin}
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
  )
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
  )
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white/85 backdrop-blur-md rounded-3xl px-8 pt-10 pb-10 sm:px-10 sm:pt-12 sm:pb-12"
      style={{
        boxShadow:
          "0 8px 40px rgba(30, 60, 100, 0.18), 0 2px 8px rgba(30,60,100,0.08)",
      }}
    >
      {children}
    </div>
  )
}

interface LoginFormProps {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  showPassword: boolean
  setShowPassword: (v: boolean) => void
  error: string | null
  isSubmitting: boolean
  isGoogleLoading: boolean
  handleSubmit: (e: React.FormEvent) => void
  handleGoogleLogin: () => void
}

function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  isSubmitting,
  isGoogleLoading,
  handleSubmit,
  handleGoogleLogin,
}: LoginFormProps) {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
        Log in
      </h1>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-100/80 border border-red-200 text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
        className="w-full mb-6 flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-700 font-medium text-sm sm:text-base hover:bg-white transition focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      <div className="flex items-center mb-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-sm text-gray-500">or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <input
            id="email"
            type="text"
            autoComplete="email"
            placeholder="Email or Nickname"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          />
        </div>

        <div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition focus:outline-none"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width={22}
                  height={22}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18M10.73 10.73a2 2 0 002.54 2.54M9.5 9.5a4 4 0 015.66 5.66M21 12c-2.5-4.5-7-7-9-7S5.5 7.5 3 12c.74 1.33 1.76 2.55 3 3.54M17.94 17.94A9.97 9.97 0 0021 12M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width={22}
                  height={22}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7 0c-2.5-4.5-7-7-9-7S5.5 7.5 3 12c2.5 4.5 7 7 9 7s6.5-2.5 9-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <Link
              to="/forgot-password"
              className="text-sm hover:underline transition"
              style={{ color: "#2e5fa3" }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl py-3.5 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)",
            boxShadow: "0 4px 16px rgba(44, 90, 160, 0.35)",
          }}
        >
          {isSubmitting ? "Logging in…" : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-medium hover:underline transition"
          style={{ color: "#2889FF" }}
        >
          Sign up here!
        </Link>
      </p>
    </>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}
