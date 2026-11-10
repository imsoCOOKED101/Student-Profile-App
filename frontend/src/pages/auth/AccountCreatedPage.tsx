import { Link } from "react-router-dom";
import Icon from "@/components/Icon";

export default function AccountCreatedPage() {
  return (
    <main className="success-page">
      <section className="success-card">
        <div className="success-icon">
          <Icon name="check" size={35} />
        </div>
        <p>Account created successfully!</p>
        <Link className="button success-continue" to="/login">
          Continue
        </Link>
      </section>
    </main>
  );
}
