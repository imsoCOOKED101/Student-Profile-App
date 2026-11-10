import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/Icon";
import { apiRequest, errorMessage, setToken, type User } from "@/lib/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const result = await apiRequest<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: formData.get("identifier"),
          password: formData.get("password"),
          device_name: "student-portal-web",
        }),
      });
      setToken(result.token);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-form-panel">
          <div className="auth-form-content">
            <h1>Log in</h1>
            <p className="auth-subtitle">Enter your account details</p>
            {location.state?.passwordReset && <p className="saved-message" role="status">Your password has been reset. Please log in.</p>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                <span>Username/Email</span>
                <input autoComplete="username" name="identifier" required />
              </label>
              <label>
                <span>Password</span>
                <div className="password-field">
                  <input
                    autoComplete="current-password"
                    name="password"
                    required
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <Icon name="help" size={15} />
                  </button>
                </div>
              </label>
              <Link className="forgot-link" to="/forgot-password">
                Forgot your password?
              </Link>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary auth-submit" disabled={submitting} type="submit">
                {submitting ? "Signing in..." : "Login"}
              </button>
            </form>
            <p className="auth-switch">
              Don&apos;t have an account? <Link to="/register">SignUp</Link>
            </p>
          </div>
        </div>
        <AuthIllustration />
      </section>
    </main>
  );
}

export function AuthIllustration() {
  return (
    <section className="auth-art-panel" aria-label="Student Portal welcome">
      <div className="auth-art-content">
        <div className="art-scene">
          <div className="art-sun" />
          <div className="art-person person-one">
            <i className="person-head" />
            <i className="person-body" />
            <i className="person-arm arm-left" />
            <i className="person-arm arm-right" />
            <i className="person-leg leg-left" />
            <i className="person-leg leg-right" />
          </div>
          <div className="art-person person-two">
            <i className="person-head" />
            <i className="person-body" />
            <i className="person-arm arm-left" />
            <i className="person-arm arm-right" />
            <i className="person-leg leg-left" />
            <i className="person-leg leg-right" />
          </div>
          <div className="art-person person-three">
            <i className="person-head" />
            <i className="person-body" />
            <i className="person-arm arm-left" />
            <i className="person-arm arm-right" />
            <i className="person-leg leg-left" />
            <i className="person-leg leg-right" />
          </div>
          <div className="art-ground" />
        </div>
        <div className="art-copy">
          <h2>Welcome <span>to the Student Portal</span></h2>
          <p>Login to access your account</p>
        </div>
      </div>
    </section>
  );
}
