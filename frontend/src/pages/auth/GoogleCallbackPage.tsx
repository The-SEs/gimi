import type { User } from "../../types/auth";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { status } = useAuth();

  useEffec(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    const error = params.get("error");

    // Clean the token out of the URL immediately
    window.history.replaceState({}, document.title, window.location.pathname);

    if (error || !access) {
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

    // Store access token and fetch user profile
    setAccessToken(access);

    api.get<User>("/api/auth/me").then(() => {
      // AuthContext will pick up the token and navigate to the app
      navigate("/", { replace: true });
    });
  }, []);

  return (
    <div className="login-page">
      <div className="auth-card">
        <p>Completing sign-in...</p>
      </div>
    </div>
  );
}
