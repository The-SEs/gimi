import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "../../hooks/useAuth";
import type { ApiError } from "../../types/auth";
import { useGoogleLogin } from "@react-oauth/google";
import { authService } from "../../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, status } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isSubmitting = status === "loading" || isGoogleLoading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiError;
        setError(data.detail ?? data.non_field_errors?.[0] ?? "Login failed.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  }

  // Google OAuth Hook
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setError(null);
      try {
        // 1. Send the token from Google to Django backend
        const data = await authService.loginWithGoogle(
          tokenResponse.access_token,
        );

        // 2. dj-rest-auth returns standard JWTs and save
        localStorage.setItem("access_token", data.access);
        if (data.refresh) localStorage.setItem("refresh_token", data.refresh);

        // 3. Navigate to dashboard
        navigate("/dashboard");
      } catch (err) {
        console.error("Django rejected the Google token:", err);
        setError("Google authentication failed. Please try again.");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError("Google login popup closed or failed.");
    },
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background image simulation — steel/architectural blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          background:
            "linear-gradient(135deg, #b8cfe8 0%, #d0e4f5 30%, #a8c4e0 55%, #c5d8ee 75%, #dce9f5 100%)",
        }}
      >
        {/* Sky blue tint at top */}
        <div
          className="absolute inset-x-0 top-0 h-1/3"
          style={{
            background:
              "linear-gradient(180deg, rgba(135,195,235,0.5) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Card */}
      <div
        className="
          relative z-10
          bg-white/85 backdrop-blur-md
          rounded-3xl
          shadow-2xl
          w-full
          mx-4
          sm:mx-0 sm:w-[420px]
          mt-16 sm:mt-0
          px-8 pt-10 pb-10
          sm:px-10 sm:pt-12 sm:pb-12
        "
        style={{
          boxShadow:
            "0 8px 40px rgba(30, 60, 100, 0.18), 0 2px 8px rgba(30,60,100,0.08)",
        }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
          Log in
        </h1>

        {/* Top-level Error Banner */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-100/80 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
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

        {/* Email / password form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email */}
          <div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          {/* Password */}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-xl focus:outline-none"
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

            {/* Forgot password */}
            <div className="flex justify-end mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 transition"
                style={{ color: "#2e5fa3" }}
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Login button */}
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

        {/* Sign up */}
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
      </div>
    </div>
  );
}

// Inline SVG so there's no extra dependency
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
  );
}
