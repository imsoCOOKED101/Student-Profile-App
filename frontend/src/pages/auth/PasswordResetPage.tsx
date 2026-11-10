import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthIllustration } from "@/pages/auth/LoginPage";
import { apiRequest, errorMessage } from "@/lib/api";

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const emailFromLink = searchParams.get("email") ?? "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      if (token) {
        await apiRequest<{ message: string }>("/auth/password/reset", {
          method: "POST",
          body: JSON.stringify({
            token,
            email: formData.get("email"),
            password: formData.get("password"),
            password_confirmation: formData.get("password_confirmation"),
          }),
        });
        navigate("/login", { replace: true, state: { passwordReset: true } });
      } else {
        const result = await apiRequest<{ message: string }>("/auth/password/forgot", {
          method: "POST",
          body: JSON.stringify({ email: formData.get("email") }),
        });
        setMessage(result.message);
      }
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
            <h1>{token ? "Reset password" : "Forgot password?"}</h1>
            <p className="auth-subtitle">
              {token
                ? "Choose a new password for your account."
                : "Enter your email and we will send a password reset link."}
            </p>
            <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
              <label>
                <span>Email Address</span>
                <input autoComplete="email" defaultValue={emailFromLink} name="email" required type="email" />
              </label>
              {token && (
                <>
                  <label>
                    <span>New Password</span>
                    <input autoComplete="new-password" minLength={8} name="password" required type="password" />
                  </label>
                  <label>
                    <span>Confirm New Password</span>
                    <input autoComplete="new-password" minLength={8} name="password_confirmation" required type="password" />
                  </label>
                </>
              )}
              {error && <p className="form-error" role="alert">{error}</p>}
              {message && <p className="saved-message" role="status">{message}</p>}
              <button className="button button-primary auth-submit" disabled={submitting} type="submit">
                {submitting ? "Please wait..." : token ? "Reset Password" : "Send Reset Link"}
              </button>
            </form>
            <p className="auth-switch"><Link to="/login">Back to login</Link></p>
          </div>
        </div>
        <AuthIllustration />
      </section>
    </main>
  );
}
