import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { apiRequest, errorMessage, type Dashboard as DashboardData } from "@/lib/api";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState<number | null>(null);

  useEffect(() => {
    apiRequest<DashboardData>("/dashboard")
      .then(setDashboard)
      .catch((requestError: unknown) => setError(errorMessage(requestError)));
  }, []);

  if (error) return <p className="portal-message error" role="alert">{error}</p>;
  if (!dashboard) return <p className="portal-message">Loading your dashboard...</p>;

  async function completeAssignment(id: number) {
    setError("");
    setCompleting(id);
    try {
      await apiRequest(`/assignments/${id}/complete`, { method: "PATCH" });
      setDashboard((current) => current ? {
        ...current,
        assignments: current.assignments.filter((assignment) => assignment.id !== id),
        stats: { ...current.stats, pending_assignments: Math.max(0, current.stats.pending_assignments - 1) },
      } : current);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setCompleting(null);
    }
  }

  const studentName = dashboard.student.first_name;
  const stats = dashboard.stats;

  return (
    <>
      <PageTitle title={`Welcome back, ${studentName}`} subtitle="Here's what's happening with your studies today." />
      <div className="stat-grid">
        <StatCard icon="book" label="Enrolled Subjects" value={stats.enrolled_subjects} tone="blue" />
        <StatCard icon="calendar" label="Classes This Week" value={stats.classes_this_week} tone="green" />
        <StatCard icon="document" label="Pending Tasks" value={stats.pending_assignments} tone="purple" />
        <StatCard icon="bell" label="New Notifications" value={stats.unread_notifications} tone="orange" />
      </div>

      <div className="dashboard-grid">
        <section className="panel schedule-panel">
          <PanelHeading title="Today's Schedule" link="/schedule" />
          <div className="today-list">
            {dashboard.today_schedule.map((schedule) => (
              <div className="today-row" key={schedule.id}>
                <span className="schedule-time">{formatTime(schedule.start_time)}</span>
                <span className="event-dot blue" />
                <div className="schedule-event blue">
                  <strong>{schedule.subject.subject_code} - {schedule.subject.subject_title}</strong>
                  <span>{schedule.room}</span>
                </div>
                <span className="schedule-room">{schedule.room}</span>
              </div>
            ))}
            {dashboard.today_schedule.length === 0 && <p className="empty-inline">No classes scheduled for today.</p>}
          </div>
        </section>

        <section className="panel tasks-panel">
          <PanelHeading title="Pending Tasks" link="/subjects" />
          <div className="task-list">
            {dashboard.assignments.map((assignment) => (
              <div className="task-row" key={assignment.id}>
                <span className="task-check blue"><Icon name="document" size={12} /></span>
                <div>
                  <strong>{assignment.title}</strong>
                  <span>{assignment.subject.subject_code} - {assignment.subject.subject_title}</span>
                  <small>{assignment.due_at ? `Due ${new Date(assignment.due_at).toLocaleString()}` : "No due date"}</small>
                </div>
                <button className="tiny-tag blue task-complete" disabled={completing === assignment.id} onClick={() => void completeAssignment(assignment.id)} type="button">
                  {completing === assignment.id ? "Saving..." : "Complete"}
                </button>
              </div>
            ))}
            {dashboard.assignments.length === 0 && <p className="empty-inline">No pending tasks.</p>}
          </div>
        </section>

        <section className="panel subject-panel">
          <PanelHeading title="My Subjects" link="/subjects" />
          <div className="table-scroll">
            <table className="data-table compact-table">
              <thead><tr><th>Code</th><th>Subject Title</th><th>Units</th><th>Instructor</th><th>Status</th></tr></thead>
              <tbody>
                {dashboard.subjects.slice(0, 4).map((subject) => (
                  <tr key={subject.id}>
                    <td>{subject.subject_code}</td><td>{subject.subject_title}</td><td>{subject.units}</td><td>{subject.instructor}</td>
                    <td><span className="status-pill">Enrolled</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dashboard.subjects.length === 0 && <p className="empty-inline">No enrolled subjects.</p>}
          </div>
        </section>

        <section className="panel announcement-panel">
          <PanelHeading title="Latest Announcements" link="/announcements" />
          <div className="mini-announcements">
            {dashboard.announcements.slice(0, 3).map((announcement) => (
              <div className="mini-announcement" key={announcement.id}>
                <span className="announcement-icon blue"><Icon name="bell" size={14} /></span>
                <div><strong>{announcement.title}</strong><span>{announcement.message}</span></div>
                <span className="tiny-tag blue">{announcement.type}</span>
              </div>
            ))}
            {dashboard.announcements.length === 0 && <p className="empty-inline">No current announcements.</p>}
          </div>
        </section>
      </div>
      <section className="panel quick-links-panel">
        <PanelHeading title="Quick Links" />
        <div className="quick-links">
          <QuickLink icon="user" label="My Profile" to="/profile" />
          <QuickLink icon="calendar" label="Class Schedule" to="/schedule" />
          <QuickLink icon="book" label="My Subjects" to="/subjects" />
          <QuickLink icon="document" label="Documents" to="/profile" />
          <QuickLink icon="bell" label="Notifications" to="/notifications" />
          <QuickLink icon="settings" label="Settings" to="/settings" />
        </div>
      </section>
    </>
  );
}

function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function StatCard({ icon, label, value, tone }: { icon: "book" | "calendar" | "document" | "bell"; label: string; value: number; tone: string }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${tone}`}><Icon name={icon} size={17} /></span>
      <div><span>{label}</span><strong>{value}</strong></div>
      <small>This semester</small>
    </div>
  );
}

function PanelHeading({ title, link }: { title: string; link?: string }) {
  return (
    <div className="panel-heading">
      <h2>{title}</h2>
      {link && <Link to={link}>View all <Icon name="chevron-right" size={12} /></Link>}
    </div>
  );
}

function QuickLink({ icon, label, to }: { icon: "user" | "calendar" | "book" | "document" | "bell" | "settings"; label: string; to: string }) {
  return <Link className="quick-link" to={to}><Icon name={icon} size={19} /><span>{label}</span></Link>;
}
