import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { apiRequest, errorMessage, type User } from "@/lib/api";

const settingsSections = ["Account Information", "Edit Preferences", "Profile Information", "Notifications", "Security", "Connected Accounts"];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState(settingsSections[0]);
  const [user, setUser] = useState<User | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<{ user: User }>("/settings")
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((requestError: unknown) => setError(errorMessage(requestError)));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.student) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const updates = activeSection === "Security"
        ? {
            current_password: formData.get("current_password"),
            password: formData.get("password"),
            password_confirmation: formData.get("password_confirmation"),
          }
        : {
            first_name: formData.get("first_name"),
            middle_name: formData.get("middle_name"),
            last_name: formData.get("last_name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            birthdate: formData.get("birthdate") || null,
            course: formData.get("course"),
            year_level: formData.get("year_level"),
            address: formData.get("address"),
          };
      const response = await apiRequest<{ user: User }>("/settings", {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setUser(response.user);
      if (activeSection === "Security") form.reset();
      setSaved(true);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  if (error && !user) return <p className="portal-message error" role="alert">{error}</p>;
  if (!user?.student) return <p className="portal-message">Loading account settings...</p>;

  const student = user.student;

  return (
    <>
      <PageTitle title="Settings" subtitle="Manage your account and preferences." />
      {error && <p className="portal-message error" role="alert">{error}</p>}
      <section className="panel settings-panel">
        <aside className="settings-nav" aria-label="Settings sections">
          {settingsSections.map((section) => <button className={activeSection === section ? "settings-nav-item active" : "settings-nav-item"} key={section} onClick={() => setActiveSection(section)} type="button">{section}</button>)}
        </aside>
        <form className="settings-form" key={JSON.stringify(user)} onSubmit={(event) => void handleSubmit(event)}>
          <div className="settings-heading"><h2>{activeSection}</h2><p>Update your account information and manage your student profile.</p></div>
          <div className="settings-avatar-row"><span className="mini-avatar large-avatar">{user.name.slice(0, 2).toUpperCase()}</span><div><strong>{user.name}</strong><span>Student ID: {student.student_number}</span></div><button className="button button-subtle" type="button">Change picture</button></div>
          {activeSection === "Security" ? (
            <div className="settings-fields">
              <label className="wide-field"><span>Current Password</span><input autoComplete="current-password" name="current_password" required type="password" /></label>
              <label><span>New Password</span><input autoComplete="new-password" minLength={8} name="password" required type="password" /></label>
              <label><span>Confirm New Password</span><input autoComplete="new-password" minLength={8} name="password_confirmation" required type="password" /></label>
            </div>
          ) : (
            <div className="settings-fields">
              <label><span>First Name</span><input defaultValue={student.first_name} name="first_name" required /></label>
              <label><span>Middle Name</span><input defaultValue={student.middle_name ?? ""} name="middle_name" /></label>
              <label><span>Last Name</span><input defaultValue={student.last_name} name="last_name" required /></label>
              <label className="wide-field"><span>Email Address</span><input defaultValue={user.email} name="email" required type="email" /></label>
              <label><span>Phone Number</span><input defaultValue={student.phone ?? ""} name="phone" /></label>
              <label><span>Date of Birth</span><input defaultValue={student.birthdate?.slice(0, 10) ?? ""} name="birthdate" type="date" /></label>
              <label><span>Course</span><input defaultValue={student.course} name="course" required /></label>
              <label><span>Year Level</span><input defaultValue={student.year_level} name="year_level" required /></label>
              <label className="wide-field"><span>Address</span><textarea defaultValue={student.address ?? ""} name="address" rows={3} /></label>
            </div>
          )}
          <div className="settings-actions"><button className="button button-primary" disabled={saving} type="submit"><Icon name="check" size={14} /> {saving ? "Saving..." : "Save Changes"}</button><button className="button button-subtle" onClick={() => setSaved(false)} type="reset">Cancel</button>{saved && <span className="saved-message">Changes saved.</span>}</div>
        </form>
      </section>
    </>
  );
}
