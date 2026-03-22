import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "../../hooks/useAuth";
import type { ApiError } from "../../types/auth";

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export default function RegisterPage({ onBackToLogin }: RegisterPageProps) {
  const navigate = useNavigate();
  const { register, status } = useAuth();

  // UI States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ApiError>({});

  const isSubmitting = status === "loading";

  // Helper to extract field-specific errors
  function getFieldError(field: keyof ApiError): string | undefined {
    const val = errors[field];
    return Array.isArray(val) ? val[0] : val;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Split name into first and last for the API
    const nameParts = name.trim().split(" ");
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    try {
      await register({
        email,
        first_name,
        last_name,
        password,
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

      {/* Card */}
      <div
        className="relative z-10 bg-white/85 backdrop-blur-md rounded-3xl w-full mx-4 sm:mx-0 sm:w-[420px] mt-16 sm:mt-0 px-7 pt-7 pb-10 sm:px-9 sm:pt-8 sm:pb-12"
        style={{
          boxShadow:
            "0 8px 40px rgba(30, 60, 100, 0.18), 0 2px 8px rgba(30,60,100,0.08)",
        }}
      >
        {/* Back to Login */}
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition mb-6 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 5l-7 7 7 7" />
          </svg>
          Back to Login
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-7 tracking-tight">
          Sign Up
        </h1>

        {/* Global Error Message */}
        {(errors.detail || errors.non_field_errors) && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {errors.detail ?? errors.non_field_errors?.[0]}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            {getFieldError("first_name") && (
              <p className="mt-1 text-xs text-red-500 ml-1">
                {getFieldError("first_name")}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
            {getFieldError("email") && (
              <p className="mt-1 text-xs text-red-500 ml-1">
                {getFieldError("email")}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 pr-12 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
            {getFieldError("password") && (
              <p className="mt-1 text-xs text-red-500 ml-1">
                {getFieldError("password")}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 pr-12 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
            {getFieldError("password_confirm") && (
              <p className="mt-1 text-xs text-red-500 ml-1">
                {getFieldError("password_confirm")}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-xl py-3.5 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)",
              boxShadow: "0 4px 16px rgba(44, 90, 160, 0.35)",
            }}
          >
            {isSubmitting ? (
              "Creating account..."
            ) : (
              <>
                <span className="sm:hidden">Sign Up</span>
                <span className="hidden sm:inline">Register</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Icon Components for cleaner JSX
function EyeIcon() {
  return (
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
  );
}

function EyeOffIcon() {
  return (
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
  );
}
