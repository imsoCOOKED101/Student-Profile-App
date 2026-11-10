import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import loginStudents from "@/assets/login-students.svg";
import Icon from "@/components/Icon";
import studentLoginIllustration from "@/assets/student-login-illustration.svg";
import { apiRequest, errorMessage, setToken, type User } from "@/lib/api";

export default function LoginPage() {
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
    <main className="student-login-page">
      <section className="student-login-card">
        <div className="student-login-form-panel">
          <div className="student-login-form-content">
            <div className="student-login-mark"><Icon name="shield" size={20} /></div>
            <p className="student-login-eyebrow">STUDENT PROFILE · STUDENT</p>
            <h1>Student sign in</h1>
            <p className="student-login-subtitle">Use your student account to access your portal.</p>
            {location.state?.passwordReset && <p className="saved-message" role="status">Your password has been reset. Please log in.</p>}
            <form className="student-login-form" onSubmit={handleSubmit}>
              <label>
                <span>Email address or student ID</span>
                <input autoComplete="username" name="identifier" required />
              </label>
              <label>
                <span>Password</span>
                <input autoComplete="current-password" name="password" required type="password" />
              </label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary student-login-submit" disabled={submitting} type="submit">
                {submitting ? "Signing in..." : "Sign in to student portal"}
              </button>
            </form>
            <div className="student-login-links">
              <p><Link to="/forgot-password">Forgot password?</Link><span> · </span>New student? <Link to="/register">Create an account</Link></p>
            </div>
          </div>
        </div>
        <section className="student-login-art-panel" aria-label="Student Portal welcome">
          <div className="student-login-art-content">
            <img alt="" className="student-login-art" src={studentLoginIllustration} />
            <div className="student-login-art-copy">
              <h2>Welcome <span>to the Student Portal</span></h2>
              <p>Login to access your account</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export function AuthIllustration() {
  return (
    <section className="auth-art-panel" aria-label="Student Portal welcome">
      <div className="auth-art-content">
        <img alt="" className="art-scene" src={loginStudents} />
        <div className="art-copy">
          <h2>Welcome <span>to the Student Portal</span></h2>
          <p>Login to access your account</p>
        </div>
      </div>
    </section>
  );
}
