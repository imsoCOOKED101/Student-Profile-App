import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/Icon";
import { apiRequest, errorMessage } from "@/lib/api";

const fields = [
  ["First Name", "Juan"],
  ["Last Name", "Dela Cruz"],
  ["Email Address", "juan@email.com"],
  ["Student ID", "2024-00001"],
  ["Course", "Select your course"],
  ["Year Level", "Select year level"],
  ["Password", "Enter your password"],
  ["Confirm Password", "Enter your password"],
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          first_name: formData.get("first_name"),
          last_name: formData.get("last_name"),
          email: formData.get("email"),
          student_number: formData.get("student_number"),
          course: formData.get("course"),
          year_level: formData.get("year_level"),
          password: formData.get("password"),
          password_confirmation: formData.get("password_confirmation"),
        }),
      });
      navigate("/account-created", { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page register-page">
      <section className="register-card">
        <div className="register-intro">
          <h1>
            Create Your
            <br />
            <span>Student Account</span>
          </h1>
          <p>
            Join our student community and manage your academic records,
            schedules, and activities all in one place.
          </p>
          <div aria-hidden="true" className="campus-art">
            <div className="campus-sun sun-left" />
            <div className="campus-building">
              <div className="building-roof" />
              <div className="building-dome" />
              <div className="building-columns">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="student-illustration">
              <span className="student-hair" />
              <span className="student-face" />
              <span className="student-body" />
              <span className="student-laptop">
                <Icon name="book" size={23} />
              </span>
              <span className="student-leg student-leg-one" />
              <span className="student-leg student-leg-two" />
            </div>
            <div className="campus-books">
              <i />
              <i />
              <i />
            </div>
            <div className="campus-sun sun-right" />
          </div>
        </div>
        <div className="register-form-panel">
          <h2>Create an Account</h2>
          <p>Sign up below</p>
          <form onSubmit={handleSubmit}>
            <div className="register-fields">
              {fields.map(([label, placeholder], index) => (
                <label key={label}>
                  <span>{label}</span>
                  {index === 4 ? (
                    <select name="course" required defaultValue="">
                      <option disabled value="">
                        {placeholder}
                      </option>
                      <option value="BS Information Technology">BS Information Technology</option>
                      <option value="BS Computer Science">BS Computer Science</option>
                      <option value="BS Information Systems">BS Information Systems</option>
                    </select>
                  ) : index === 5 ? (
                    <select name="year_level" required defaultValue="">
                      <option disabled value="">
                        {placeholder}
                      </option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  ) : (
                    <input
                      autoComplete={
                        index === 2
                          ? "email"
                          : index >= 6
                            ? "new-password"
                            : "off"
                      }
                      name={["first_name", "last_name", "email", "student_number"][index] ?? (index === 6 ? "password" : "password_confirmation")}
                      placeholder={placeholder}
                      required
                      type={index >= 6 ? "password" : index === 2 ? "email" : "text"}
                    />
                  )}
                </label>
              ))}
            </div>
            <label className="terms-check">
              <input required type="checkbox" />
              <span>
                I agree to the <a href="#terms">Terms of Service</a> and{" "}
                <a href="#privacy">Privacy Policy</a>
              </span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary create-account" disabled={submitting} type="submit">
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="or-divider">or sign up with</p>
          <div className="social-signup">
            <button type="button">G&nbsp; Google</button>
            <button type="button">f&nbsp; Facebook</button>
          </div>
          <p className="already-account">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
