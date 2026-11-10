import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { apiRequest, errorMessage, type Student, type StudentDocument } from "@/lib/api";

type ProfileResponse = {
  student: Student;
  email: string;
  documents: StudentDocument[];
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentName, setDocumentName] = useState("");

  useEffect(() => {
    apiRequest<ProfileResponse>("/profile")
      .then(setProfile)
      .catch((requestError: unknown) => setError(errorMessage(requestError)));
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    const formData = new FormData(event.currentTarget);
    setSaving(true);
    setError("");

    try {
      const result = await apiRequest<{ student: Student }>("/profile", {
        method: "PUT",
        body: JSON.stringify({
          first_name: formData.get("first_name"),
          middle_name: formData.get("middle_name"),
          last_name: formData.get("last_name"),
          course: profile.student.course,
          year_level: profile.student.year_level,
          birthdate: formData.get("birthdate") || null,
          gender: formData.get("gender"),
          nationality: formData.get("nationality"),
          phone: formData.get("phone"),
          address: formData.get("address"),
        }),
      });
      setProfile({ ...profile, student: result.student });
      setEditing(false);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function uploadDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setUploading(true);
    setError("");

    try {
      const result = await apiRequest<{ document: StudentDocument }>("/documents", {
        method: "POST",
        body: formData,
      });
      setProfile((current) => current ? { ...current, documents: [result.document, ...current.documents] } : current);
      setDocumentName("");
      form.reset();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setUploading(false);
    }
  }

  if (error && !profile) return <p className="portal-message error" role="alert">{error}</p>;
  if (!profile) return <p className="portal-message">Loading your profile...</p>;

  const { student, documents } = profile;
  const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ");

  return (
    <>
      <PageTitle
        title="My Profile"
        subtitle="View and manage your student information."
        actions={
          editing ? (
            <>
              <button className="button button-subtle" onClick={() => setEditing(false)} type="button">Cancel</button>
              <button className="button button-primary" disabled={saving} form="profile-form" type="submit">
                <Icon name="check" size={14} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button className="button button-primary" onClick={() => setEditing(true)} type="button">
              <Icon name="edit" size={14} /> Edit Profile
            </button>
          )
        }
      />
      {error && <p className="portal-message error" role="alert">{error}</p>}
      <section className="panel profile-summary">
        <Avatar size="large" />
        <div className="profile-main-info">
          <h2>{fullName}</h2>
          <p>Student</p>
          <div className="profile-tags"><span>{student.course}</span><span>{student.student_number}</span></div>
        </div>
        <div className="profile-quick-facts">
          <div><span>Course</span><strong>{courseCode(student.course)}</strong></div>
          <div><span>Year Level</span><strong>{student.year_level}</strong></div>
          <div><span>Status</span><strong className="success-text">Active</strong></div>
        </div>
        <div className="profile-quick-facts">
          <div><span>Age</span><strong>{student.birthdate ? calculateAge(student.birthdate) : "—"}</strong></div>
          <div><span>Gender</span><strong>{student.gender ?? "—"}</strong></div>
          <div><span>Nationality</span><strong>{student.nationality ?? "—"}</strong></div>
        </div>
      </section>
      <div className="profile-columns">
        <section className="panel personal-panel">
          <div className="panel-heading"><h2>Personal Information</h2></div>
          <form className="profile-form-grid" id="profile-form" key={JSON.stringify(student)} onSubmit={(event) => void saveProfile(event)}>
            <ProfileField label="First Name" name="first_name" value={student.first_name} editing={editing} />
            <ProfileField label="Middle Name" name="middle_name" value={student.middle_name ?? ""} editing={editing} />
            <ProfileField label="Last Name" name="last_name" value={student.last_name} editing={editing} />
            <ProfileField label="Birthdate" name="birthdate" value={student.birthdate?.slice(0, 10) ?? ""} editing={editing} type="date" />
            <ProfileField label="Gender" name="gender" value={student.gender ?? ""} editing={editing} />
            <ProfileField label="Nationality" name="nationality" value={student.nationality ?? ""} editing={editing} />
            <ProfileField label="Email" name="email" value={profile.email} editing={false} type="email" />
            <ProfileField label="Phone" name="phone" value={student.phone ?? ""} editing={editing} />
            <ProfileField label="Address" name="address" value={student.address ?? ""} editing={editing} />
          </form>
        </section>
        <section className="panel documents-panel">
          <div className="panel-heading"><h2>Documents</h2></div>
          <form className="document-upload-form" onSubmit={(event) => void uploadDocument(event)}>
            <input aria-label="Document name" name="name" onChange={(event) => setDocumentName(event.target.value)} placeholder="Document name" required value={documentName} />
            <input aria-label="Choose a PDF or image" accept=".pdf,.jpg,.jpeg,.png" name="file" required type="file" />
            <button className="button button-primary" disabled={uploading} type="submit">{uploading ? "Uploading..." : "Upload"}</button>
          </form>
          <div className="document-list">
            {documents.map((document) => (
              <div className="document-row" key={document.id}>
                <span className="document-icon"><Icon name="document" size={16} /></span>
                <div><strong>{document.name}</strong><span>{document.mime_type} · Uploaded {new Date(document.uploaded_at).toLocaleDateString()}</span></div>
                <span className={document.status === "approved" ? "status-pill" : "tiny-tag orange"}>{document.status}</span>
              </div>
            ))}
            {documents.length === 0 && <p className="empty-inline">You have not uploaded any documents.</p>}
          </div>
        </section>
      </div>
    </>
  );
}

function ProfileField({ label, name, value, editing, type = "text" }: { label: string; name: string; value: string; editing: boolean; type?: string }) {
  return (
    <label className="profile-field">
      <span>{label}</span>
      <input defaultValue={value} name={name} readOnly={!editing} type={type} />
    </label>
  );
}

function calculateAge(birthdate: string): number {
  const date = new Date(birthdate);
  const today = new Date();
  return today.getFullYear() - date.getFullYear() - Number(
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate()),
  );
}

function courseCode(course: string): string {
  const codes: Record<string, string> = {
    "BS Information Technology": "BSIT",
    "BS Computer Science": "BSCS",
    "BS Information Systems": "BSIS",
  };
  return codes[course] ?? course;
}
