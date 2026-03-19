import { useState } from "react";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Login attempted:", { email, password });
  };

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
          /* Mobile: card sits lower, partial bg visible at top like screenshot 2 */
          mt-16 sm:mt-0
          px-8 pt-10 pb-10
          sm:px-10 sm:pt-12 sm:pb-12
        "
        style={{
          boxShadow:
            "0 8px 40px rgba(30, 60, 100, 0.18), 0 2px 8px rgba(30,60,100,0.08)",
        }}
      >
        <h1
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 tracking-tight space-y-5"
        >
          Log in
        </h1>

        <div className="space-y-12"> {/* Increased spacing between fields */}
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5 text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-xl"
            >
              {showPassword ? (
                // Eye closed icon
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
                // Eye open icon
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

          {/* Forgot password — closer to password */}
          <div className="flex justify-end -mt-8 mb-4"> {/* negative margin to pull it closer, mb for spacing after */}
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-800 transition"
              style={{ color: "#2e5fa3" }}
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Login button — more space above and below */}
        <button
          onClick={handleLogin}
          className="mt-8 mb-6 w-full rounded-xl py-3.5 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          style={{
            background: "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)",
            boxShadow: "0 4px 16px rgba(44, 90, 160, 0.35)",
          }}
        >
          Log In
        </button>

        {/* Sign up */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="font-medium hover:underline transition"
            style={{ color: "#2889FF" }}
          >
            Sign up here!
          </a>
        </p>
      </div>
    </div>
  );
}